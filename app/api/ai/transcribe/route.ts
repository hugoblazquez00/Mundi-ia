import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not configured' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const businessId = formData.get('businessId');

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convertir File a formato que OpenAI espera
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Crear un File-like object para OpenAI
    const file = new File([buffer], audioFile.name, {
      type: audioFile.type || 'audio/webm',
    });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'es',
    });

    return NextResponse.json({
      text: transcription.text,
      businessId: businessId ? parseInt(businessId as string) : null,
    });
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    return NextResponse.json(
      {
        error: 'Failed to transcribe audio',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
