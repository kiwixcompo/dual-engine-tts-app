import { WebSocket, RawData } from 'ws';
import crypto from 'crypto';

const BASE_URL = 'speech.platform.bing.com/consumer/speech/synthesize/readaloud';
const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const WIN_EPOCH = 11644473600; // Windows file time epoch in seconds
const CHROMIUM_FULL_VERSION = '143.0.3650.75';
const CHROMIUM_MAJOR_VERSION = '143';
const SEC_MS_GEC_VERSION = `1-${CHROMIUM_FULL_VERSION}`;

function generateSecMsGec(): string {
  // Convert Unix timestamp to Windows file time format
  let ticks = Date.now() / 1000 + WIN_EPOCH;
  // Round down to the nearest 5-minute window (300 seconds)
  ticks -= ticks % 300;
  // Convert to 100-nanosecond intervals
  ticks *= 10000000;

  const strToHash = `${ticks.toFixed(0)}${TRUSTED_CLIENT_TOKEN}`;
  return crypto.createHash('sha256').update(strToHash, 'ascii').digest('hex').toUpperCase();
}

function generateMuid(): string {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
}

function uuid(): string {
  return crypto.randomUUID().replaceAll('-', '');
}

export interface EdgeTtsOptions {
  voice?: string;
  volume?: string;
  rate?: string;
  pitch?: string;
}

export function synthesizeEdgeTts(text: string, options: EdgeTtsOptions = {}): Promise<Uint8Array> {
  const { voice = 'en-US-JennyNeural', volume = '+0%', rate = '+0%', pitch = '+0Hz' } = options;

  return new Promise<Uint8Array>((resolve, reject) => {
    const secMsGec = generateSecMsGec();
    const muid = generateMuid();
    const connectionId = uuid();

    const wssUrl =
      `wss://${BASE_URL}/edge/v1?` +
      `TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&` +
      `Sec-MS-GEC=${secMsGec}&` +
      `Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}&` +
      `ConnectionId=${connectionId}`;

    const ws = new WebSocket(wssUrl, {
      headers: {
        'User-Agent':
          `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ` +
          `Chrome/${CHROMIUM_MAJOR_VERSION}.0.0.0 Safari/537.36 Edg/${CHROMIUM_MAJOR_VERSION}.0.0.0`,
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
        Origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
        Cookie: `muid=${muid};`,
      },
    });

    const audioChunks: Buffer[] = [];
    let isFinished = false;

    const timeout = setTimeout(() => {
      if (!isFinished) {
        ws.close();
        reject(new Error('Edge TTS connection timed out'));
      }
    }, 20000);

    ws.on('message', (rawData: RawData, isBinary: boolean) => {
      if (!isBinary) {
        const textData = rawData.toString();
        if (textData.includes('turn.end')) {
          isFinished = true;
          clearTimeout(timeout);
          ws.close();
          const merged = Buffer.concat(audioChunks);
          resolve(new Uint8Array(merged));
        }
        return;
      }

      const data = rawData as Buffer;
      const separator = 'Path:audio\r\n';
      const idx = data.indexOf(separator);
      if (idx !== -1) {
        const audioPiece = data.subarray(idx + separator.length);
        audioChunks.push(audioPiece);
      }
    });

    ws.on('error', (err: Error) => {
      clearTimeout(timeout);
      reject(err);
    });

    ws.on('open', () => {
      const speechConfig = JSON.stringify({
        context: {
          synthesis: {
            audio: {
              metadataoptions: { sentenceBoundaryEnabled: false, wordBoundaryEnabled: false },
              outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
            },
          },
        },
      });

      const configMessage =
        `X-Timestamp:${Date()}\r\n` +
        `Content-Type:application/json; charset=utf-8\r\n` +
        `Path:speech.config\r\n\r\n` +
        `${speechConfig}`;

      ws.send(configMessage, (cfgErr?: Error) => {
        if (cfgErr) {
          clearTimeout(timeout);
          reject(cfgErr);
          return;
        }

        const requestId = uuid();
        const escapedText = text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        const ssmlMessage =
          `X-RequestId:${requestId}\r\n` +
          `Content-Type:application/ssml+xml\r\n` +
          `X-Timestamp:${Date()}Z\r\n` +
          `Path:ssml\r\n\r\n` +
          `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>` +
          `<voice name='${voice}'>` +
          `<prosody pitch='${pitch}' rate='${rate}' volume='${volume}'>` +
          `${escapedText}` +
          `</prosody></voice></speak>`;

        ws.send(ssmlMessage, (ssmlErr?: Error) => {
          if (ssmlErr) {
            clearTimeout(timeout);
            reject(ssmlErr);
          }
        });
      });
    });
  });
}
