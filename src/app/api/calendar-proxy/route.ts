import { NextRequest, NextResponse } from 'next/server';

// This is a simple proxy to bypass CORS issues when fetching iCal files from a browser.
// In a real-world scenario, you'd want to add more robust error handling, caching,
// and security measures (e.g., allow-listing domains).

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const icalUrl = searchParams.get('url');

  if (!icalUrl) {
    return NextResponse.json({ error: 'La URL del calendario es requerida.' }, { status: 400 });
  }

  try {
    // Some calendar providers might block requests without a common user-agent.
    const response = await fetch(icalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Error from calendar source: ${response.status}`, text);
      return NextResponse.json({ error: `Error al contactar el calendario: ${response.status}` }, { status: response.status });
    }

    const data = await response.text();
    
    // Return the calendar data with the correct content type.
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate', // Cache for 1 hour
      },
    });

  } catch (error: any) {
    console.error('Error en el proxy del calendario:', error);
    return NextResponse.json({ error: 'Error interno del servidor al obtener el calendario.' }, { status: 500 });
  }
}
