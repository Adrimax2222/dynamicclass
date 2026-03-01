import { NextRequest, NextResponse } from 'next/server';

const TERRITORI_QUERIES: Record<string, string> = {
  // Espanya i Catalunya
  espanya:              'España noticias',
  general:              'Catalunya',
  barcelona_city:       'Barcelona ciudad',

  // Províncies
  barcelona:            'provincia Barcelona Catalunya',
  girona:               'Girona Catalunya',
  lleida:               'Lleida Catalunya',
  tarragona:            'Tarragona Catalunya',
  'terres-de-l-ebre':   'Terres de l\'Ebre Tarragona',

  // Comarques Barcelona
  'baix-llobregat':     'Baix Llobregat Barcelona',
  'valles-occidental':  'Vallès Occidental Sabadell Terrassa',
  'valles-oriental':    'Vallès Oriental Granollers',
  maresme:              'Maresme Mataró',
  osona:                'Osona Vic Catalunya',
  bergueda:             'Berguedà Berga Catalunya',
  bages:                'Bages Manresa Catalunya',
  anoia:                'Anoia Igualada Catalunya',
  garraf:               'Garraf Vilanova Catalunya',
  'alt-penedes':        'Alt Penedès Vilafranca',
  'baix-penedes':       'Baix Penedès Catalunya',
  selva:                'Selva Blanes Lloret Catalunya',

  // Comarques Girona
  'alt-emporda':        'Alt Empordà Figueres',
  'baix-emporda':       'Baix Empordà Palamós',
  garrotxa:             'Garrotxa Olot Catalunya',
  ripolles:             'Ripollès Ripoll Catalunya',
  cerdanya:             'Cerdanya Puigcerdà',
  'pla-de-l-estany':    'Pla de l\'Estany Banyoles',
  girones:              'Gironès Girona',

  // Comarques Lleida
  pallars:              'Pallars Lleida Pirineus',
  'alta-ribagorca':     'Alta Ribagorça Lleida',
  'val-d-aran':         'Val d\'Aran Vielha',
  segria:               'Segrià Lleida',
  urgell:               'Urgell Tàrrega',
  'noguera':            'Noguera Balaguer',

  // Comarques Tarragona
  'alt-camp':           'Alt Camp Valls Tarragona',
  'baix-camp':          'Baix Camp Reus',
  'tarragues':          'Tarragonès Tarragona',
  'priorat':            'Priorat Falset',
  'ribera-d-ebre':      'Ribera d\'Ebre Móra',
  'terra-alta':         'Terra Alta Gandesa',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const territori = searchParams.get('territori') ?? 'general';
  const query = TERRITORI_QUERIES[territori] ?? 'Catalunya';

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.error('[API /news] Falta NEWS_API_KEY al .env.local');
    return NextResponse.json([]);
  }

  // NewsAPI free plan: màxim 100/dia, pageSize màx 100
  const url = `https://newsapi.org/v2/everything?` +
    `q=${encodeURIComponent(query)}` +
    `&language=es` +
    `&sortBy=publishedAt` +
    `&pageSize=30` +
    `&apiKey=${apiKey}`;

  try {
    console.log(`[API /news] Cercant: "${query}"`);
    const res = await fetch(url, { next: { revalidate: 300 } });
    const data = await res.json();

    if (data.status !== 'ok' || !data.articles?.length) {
      console.error('[API /news] Error NewsAPI:', data.message ?? 'sense articles');
      return NextResponse.json([]);
    }

    const items = data.articles
      .filter((a: any) => a.title && a.title !== '[Removed]' && a.url)
      .map((a: any) => ({
        title:    a.title,
        link:     a.url,
        pubDate:  a.publishedAt,
        imageUrl: a.urlToImage ?? '',
      }));

    console.log(`[API /news] ✅ ${items.length} notícies per "${query}"`);
    return NextResponse.json(items);

  } catch (error) {
    console.error('[API /news] Error:', error);
    return NextResponse.json([]);
  }
}