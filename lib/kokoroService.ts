// In-browser neural TTS engine using Kokoro-82M and ONNX runtime
// Downloads weights on demand and generates locally on WebGPU / WASM

export type ProgressCallback = (status: {
  progress?: number;
  status: string;
  file?: string;
  loaded?: number;
  total?: number;
}) => void;

// Define TTS instance cache
let kokoroInstance: any = null;
let currentDtype = 'q8';
let currentDevice = 'wasm';
let isInitializing = false;

// AudioBuffer to WAV ArrayBuffer converter
function audioBufferToWav(channelData: Float32Array, sampleRate: number): ArrayBuffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = channelData.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length minus RIFF identifier and length
  view.setUint32(4, 36 + dataSize, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw PCM)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate
  view.setUint32(28, byteRate, true);
  // block align
  view.setUint16(32, blockAlign, true);
  // bits per sample
  view.setUint16(34, bitsPerSample, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, dataSize, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < channelData.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export async function checkWebGPUSupport(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  try {
    return 'gpu' in navigator && (await (navigator as any).gpu?.requestAdapter()) !== null;
  } catch {
    return false;
  }
}

export async function getKokoroInstance(
  dtype: 'q8' | 'fp32' | 'fp16' = 'q8',
  device: 'wasm' | 'webgpu' = 'wasm',
  onProgress?: ProgressCallback
) {
  if (typeof window === 'undefined') return null;

  if (kokoroInstance && currentDtype === dtype && currentDevice === device) {
    return kokoroInstance;
  }

  if (isInitializing) {
    // Wait until initialized
    while (isInitializing) {
      await new Promise((r) => setTimeout(r, 200));
    }
    if (kokoroInstance) return kokoroInstance;
  }

  isInitializing = true;

  try {
    if (onProgress) {
      onProgress({ status: 'Loading Kokoro TTS neural pipeline...', progress: 5 });
    }

    const { KokoroTTS } = await import('kokoro-js');

    const modelId = 'onnx-community/Kokoro-82M-v1.0-ONNX';

    // Check device capability
    let targetDevice: 'wasm' | 'webgpu' = device;
    if (device === 'webgpu') {
      const gpuAvailable = await checkWebGPUSupport();
      if (!gpuAvailable) {
        console.warn('WebGPU not supported or enabled on this system. Falling back to WASM.');
        targetDevice = 'wasm';
      }
    }

    const tts = await KokoroTTS.from_pretrained(modelId, {
      dtype: targetDevice === 'webgpu' && dtype === 'q8' ? 'fp32' : dtype,
      device: targetDevice,
      progress_callback: (item: any) => {
        if (!onProgress) return;
        if (item.status === 'progress') {
          const percent = Math.round((item.loaded / (item.total || 1)) * 100);
          onProgress({
            status: `Downloading ${item.file || 'model weights'} (${percent}%)`,
            progress: percent,
            file: item.file,
            loaded: item.loaded,
            total: item.total,
          });
        } else if (item.status === 'done') {
          onProgress({
            status: `Loaded ${item.file || 'weights'}`,
            progress: 100,
          });
        } else if (typeof item.status === 'string') {
          onProgress({
            status: item.status,
          });
        }
      },
    });

    kokoroInstance = tts;
    currentDtype = dtype;
    currentDevice = targetDevice;

    if (onProgress) {
      onProgress({ status: 'Kokoro TTS ready', progress: 100 });
    }

    return kokoroInstance;
  } finally {
    isInitializing = false;
  }
}

export async function synthesizeKokoro(
  text: string,
  voice: string,
  speed: number = 1.0,
  dtype: 'q8' | 'fp32' | 'fp16' = 'q8',
  device: 'wasm' | 'webgpu' = 'wasm',
  onProgress?: ProgressCallback
): Promise<{ audioUrl: string; duration?: number }> {
  const tts = await getKokoroInstance(dtype, device, onProgress);

  if (!tts) {
    throw new Error('Failed to initialize local Kokoro TTS engine');
  }

  if (onProgress) {
    onProgress({ status: `Synthesizing neural speech with voice '${voice}'...`, progress: 75 });
  }

  // Generate raw audio
  const rawAudio = await tts.generate(text, {
    voice: voice as any,
    speed: speed || 1.0,
  });

  if (onProgress) {
    onProgress({ status: 'Encoding high-definition audio waveform...', progress: 95 });
  }

  // RawAudio has .audio (Float32Array) and .sampling_rate (number)
  const channelData: Float32Array = rawAudio.audio;
  const sampleRate: number = rawAudio.sampling_rate || 24000;

  const wavBuffer = audioBufferToWav(channelData, sampleRate);
  const blob = new Blob([wavBuffer], { type: 'audio/wav' });
  const audioUrl = URL.createObjectURL(blob);
  const duration = channelData.length / sampleRate;

  if (onProgress) {
    onProgress({ status: 'Speech synthesis complete!', progress: 100 });
  }

  return { audioUrl, duration };
}
