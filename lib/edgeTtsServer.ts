// Universal Cloudflare Workers & Node.js Edge Neural TTS implementation
// Uses fetch({ headers: { Upgrade: 'websocket' } }) natively supported by Cloudflare Workers

const READALOUD_BASE = 'speech.platform.bing.com/consumer/speech/synthesize/readaloud';
const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const SYNTHESIS_URL = `https://${READALOUD_BASE}/edge/v1`;
const CHROMIUM_FULL_VERSION = '143.0.3650.75';
const CHROMIUM_MAJOR_VERSION = CHROMIUM_FULL_VERSION.split('.')[0];
const SEC_MS_GEC_VERSION = `1-${CHROMIUM_FULL_VERSION}`;

const BASE_HEADERS: Record<string, string> = {
  'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROMIUM_MAJOR_VERSION}.0.0.0 Safari/537.36 Edg/${CHROMIUM_MAJOR_VERSION}.0.0.0`,
  'Accept-Language': 'en-US,en;q=0.9',
};

const UPGRADE_HEADERS: Record<string, string> = {
  ...BASE_HEADERS,
  'Accept-Encoding': 'gzip, deflate, br, zstd',
  Pragma: 'no-cache',
  'Cache-Control': 'no-cache',
  'Sec-WebSocket-Version': '13',
  Upgrade: 'websocket',
  Origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
};

export interface EdgeTtsOptions {
  voice?: string;
  volume?: string;
  rate?: string;
  pitch?: string;
}

type UpgradeResponse = Response & {
  webSocket?: any;
};

function normalizeVoiceName(voice: string): string {
  const trimmed = voice.trim();
  const providerMatch = /^([a-z]{2,}-[A-Z]{2,})-([^:]+):.+Neural$/.exec(trimmed);
  if (providerMatch) {
    const [, locale, baseName] = providerMatch;
    return normalizeVoiceName(`${locale}-${baseName}Neural`);
  }

  const shortMatch = /^([a-z]{2,})-([A-Z]{2,})-(.+Neural)$/.exec(trimmed);
  if (!shortMatch) {
    return trimmed;
  }

  const [, lang] = shortMatch;
  let [, , region, name] = shortMatch;

  if (name.includes('-')) {
    const [regionSuffix, ...nameParts] = name.split('-');
    region += `-${regionSuffix}`;
    name = nameParts.join('-');
  }

  return `Microsoft Server Speech Text to Speech Voice (${lang}-${region}, ${name})`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function removeInvalidXmlCharacters(text: string): string {
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, ' ');
}

function makeConnectionId(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

function makeMuid(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

async function makeSecMsGec(): Promise<string> {
  const winEpoch = 11644473600;
  const secondsToNs = 1e9;
  let ticks = Date.now() / 1000;
  ticks += winEpoch;
  ticks -= ticks % 300;
  ticks *= secondsToNs / 100;
  const payload = `${ticks.toFixed(0)}${TRUSTED_CLIENT_TOKEN}`;
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(payload)
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function buildSynthesisUrl(secMsGec: string, connectionId: string): string {
  const url = new URL(SYNTHESIS_URL);
  url.searchParams.set('TrustedClientToken', TRUSTED_CLIENT_TOKEN);
  url.searchParams.set('Sec-MS-GEC', secMsGec);
  url.searchParams.set('Sec-MS-GEC-Version', SEC_MS_GEC_VERSION);
  url.searchParams.set('ConnectionId', connectionId);
  return url.toString();
}

function timestamp(): string {
  return new Date().toISOString().replace(/[-:.]/g, '').slice(0, -1);
}

function buildSpeechConfigMessage(): string {
  return (
    `X-Timestamp:${timestamp()}\r\n` +
    'Content-Type:application/json; charset=utf-8\r\n' +
    'Path:speech.config\r\n\r\n' +
    '{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"true"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}\r\n'
  );
}

function buildSsmlMessage(requestId: string, voice: string, text: string, rate: string, pitch: string, volume: string): string {
  const ssml =
    "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>" +
    `<voice name='${voice}'><prosody pitch='${pitch}' rate='${rate}' volume='${volume}'>${escapeXml(
      removeInvalidXmlCharacters(text)
    )}</prosody></voice></speak>`;

  return (
    `X-RequestId:${requestId}\r\n` +
    'Content-Type:application/ssml+xml\r\n' +
    `X-Timestamp:${timestamp()}Z\r\n` +
    'Path:ssml\r\n\r\n' +
    ssml
  );
}

function parseTextHeaders(message: string): Record<string, string> {
  const separator = message.indexOf('\r\n\r\n');
  const headerText = separator >= 0 ? message.slice(0, separator) : message;
  const headers: Record<string, string> = {};

  for (const line of headerText.split('\r\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex <= 0) continue;
    const key = line.slice(0, colonIndex);
    const value = line.slice(colonIndex + 1).trim();
    headers[key] = value;
  }
  return headers;
}

function parseBinaryAudioFrame(data: Uint8Array): { headers: Record<string, string>; body: Uint8Array } {
  if (data.length < 2) {
    throw new Error('binary websocket frame missing header length');
  }

  const headerLength = (data[0] << 8) | data[1];
  if (data.length < 2 + headerLength) {
    throw new Error('binary websocket frame truncated');
  }

  const headerText = new TextDecoder().decode(data.slice(2, 2 + headerLength));
  const headers: Record<string, string> = {};

  for (const line of headerText.split('\r\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex <= 0) continue;
    const key = line.slice(0, colonIndex);
    const value = line.slice(colonIndex + 1).trim();
    headers[key] = value;
  }

  return {
    headers,
    body: data.slice(2 + headerLength),
  };
}

function toUint8Array(data: unknown): Promise<Uint8Array> | Uint8Array | null {
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    return data.arrayBuffer().then((buffer) => new Uint8Array(buffer));
  }
  return null;
}

export async function synthesizeEdgeTts(
  text: string,
  options: EdgeTtsOptions = {}
): Promise<Uint8Array> {
  const {
    voice = 'en-US-JennyNeural',
    volume = '+0%',
    rate = '+0%',
    pitch = '+0Hz',
  } = options;

  const secMsGec = await makeSecMsGec();
  const connectionId = makeConnectionId();
  const websocketUrl = buildSynthesisUrl(secMsGec, connectionId);

  // Cloudflare Workers Native WebSocket upgrade via fetch
  const response = (await fetch(websocketUrl, {
    headers: {
      ...UPGRADE_HEADERS,
      Cookie: `muid=${makeMuid()};`,
    },
  })) as UpgradeResponse;

  if (response.status !== 101 || !response.webSocket) {
    throw new Error(`WebSocket upgrade failed with status ${response.status}`);
  }

  const socket = response.webSocket;
  const requestId = makeConnectionId();
  const fullVoiceName = normalizeVoiceName(voice);

  return new Promise<Uint8Array>((resolve, reject) => {
    const audioChunks: Uint8Array[] = [];
    let isSettled = false;

    const cleanup = () => {
      socket.removeEventListener('message', onMessage);
      socket.removeEventListener('close', onClose);
      socket.removeEventListener('error', onError);
    };

    const finishWithError = (err: any) => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      reject(err instanceof Error ? err : new Error(String(err)));
    };

    const finish = () => {
      if (isSettled) return;
      isSettled = true;
      cleanup();

      // Concatenate all chunks
      const totalLen = audioChunks.reduce((acc, c) => acc + c.length, 0);
      const merged = new Uint8Array(totalLen);
      let offset = 0;
      for (const chunk of audioChunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      resolve(merged);
    };

    const onMessage = (event: any) => {
      if (isSettled) return;

      const data = event.data;

      if (typeof data === 'string') {
        const headers = parseTextHeaders(data);
        const path = headers.Path;
        if (path === 'turn.end') {
          try {
            socket.close();
          } catch {
            // ignore close error
          }
          finish();
          return;
        }
        return;
      }

      const maybeBinary = toUint8Array(data);
      if (!maybeBinary) return;

      const handleChunk = (binary: Uint8Array) => {
        if (isSettled) return;
        const { headers, body } = parseBinaryAudioFrame(binary);
        if (headers.Path === 'audio' && body.length > 0) {
          audioChunks.push(body);
        }
      };

      if (maybeBinary instanceof Promise) {
        maybeBinary.then(handleChunk).catch(finishWithError);
      } else {
        try {
          handleChunk(maybeBinary);
        } catch (err) {
          finishWithError(err);
        }
      }
    };

    const onClose = () => {
      if (audioChunks.length === 0) {
        finishWithError(new Error('Connection closed before audio received'));
        return;
      }
      finish();
    };

    const onError = (e: any) => {
      finishWithError(new Error(`WebSocket error: ${e?.message || 'Connection failed'}`));
    };

    socket.addEventListener('message', onMessage);
    socket.addEventListener('close', onClose);
    socket.addEventListener('error', onError);

    if (typeof socket.accept === 'function') {
      socket.accept();
    }

    try {
      socket.send(buildSpeechConfigMessage());
      socket.send(buildSsmlMessage(requestId, fullVoiceName, text, rate, pitch, volume));
    } catch (sendErr) {
      finishWithError(sendErr);
    }
  });
}
