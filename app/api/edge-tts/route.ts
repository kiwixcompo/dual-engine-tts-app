import { NextRequest, NextResponse } from 'next/server';
import { synthesizeEdgeTts } from '@/lib/edgeTtsServer';

export async function POST(req: NextRequest) {
  try {
    const { text, voice, speed } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    let rateStr = '+0%';
    if (speed && speed !== 1.0) {
      const pct = Math.round((speed - 1.0) * 100);
      rateStr = pct >= 0 ? `+${pct}%` : `${pct}%`;
    }

    const uint8Data = await synthesizeEdgeTts(text.slice(0, 4000), {
      voice: voice || 'en-US-JennyNeural',
      rate: rateStr,
    });

    return new NextResponse(uint8Data as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': uint8Data.byteLength.toString(),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err: any) {
    console.error('Edge TTS API error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to synthesize speech via Edge Neural TTS' },
      { status: 500 }
    );
  }
}
