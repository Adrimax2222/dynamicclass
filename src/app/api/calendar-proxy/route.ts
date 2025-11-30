import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const icalUrl = searchParams.get('url');

  if (!icalUrl) {
    return NextResponse.json({ error: 'La URL del calendario es requerida.' }, { status: 400 });
  }

  try {
    const response = await fetch(icalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Error from Google Calendar API: ${response.status}`, text);
      return NextResponse.json({ error: `Error al contactar con Google Calendar: ${response.status}` }, { status: response.status });
    }

    const data = await response.text();
    
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar',
      },
    });

  } catch (error: any) {
    console.error('Error en el proxy del calendario:', error);
    return NextResponse.json({ error: 'Error interno del servidor al obtener el calendario.' }, { status: 500 });
  }
}
