'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  imageUrl: string;
}

// ── Selector organitzat per grups ─────────────────────────────────────────────
const GRUPS = [
  {
    label: '🌍 General',
    opcions: [
      { value: 'espanya',       label: 'Espanya' },
      { value: 'general',       label: 'Catalunya' },
      { value: 'barcelona_city',label: 'Barcelona ciutat' },
    ],
  },
  {
    label: '📍 Províncies',
    opcions: [
      { value: 'barcelona',          label: 'Província Barcelona' },
      { value: 'girona',             label: 'Girona' },
      { value: 'lleida',             label: 'Lleida' },
      { value: 'tarragona',          label: 'Tarragona' },
      { value: 'terres-de-l-ebre',   label: 'Terres de l\'Ebre' },
    ],
  },
  {
    label: '🏘️ Comarques Barcelona',
    opcions: [
      { value: 'baix-llobregat',    label: 'Baix Llobregat' },
      { value: 'valles-occidental', label: 'Vallès Occidental' },
      { value: 'valles-oriental',   label: 'Vallès Oriental' },
      { value: 'maresme',           label: 'Maresme' },
      { value: 'osona',             label: 'Osona' },
      { value: 'bergueda',          label: 'Berguedà' },
      { value: 'bages',             label: 'Bages' },
      { value: 'anoia',             label: 'Anoia' },
      { value: 'garraf',            label: 'Garraf' },
      { value: 'alt-penedes',       label: 'Alt Penedès' },
      { value: 'baix-penedes',      label: 'Baix Penedès' },
      { value: 'selva',             label: 'La Selva' },
    ],
  },
  {
    label: '🌿 Comarques Girona',
    opcions: [
      { value: 'alt-emporda',       label: 'Alt Empordà' },
      { value: 'baix-emporda',      label: 'Baix Empordà' },
      { value: 'garrotxa',          label: 'La Garrotxa' },
      { value: 'ripolles',          label: 'Ripollès' },
      { value: 'cerdanya',          label: 'Cerdanya' },
      { value: 'pla-de-l-estany',   label: 'Pla de l\'Estany' },
      { value: 'girones',           label: 'Gironès' },
    ],
  },
  {
    label: '🌾 Comarques Lleida',
    opcions: [
      { value: 'pallars',           label: 'Pallars' },
      { value: 'alta-ribagorca',    label: 'Alta Ribagorça' },
      { value: 'val-d-aran',        label: 'Val d\'Aran' },
      { value: 'segria',            label: 'Segrià' },
      { value: 'urgell',            label: 'Urgell' },
      { value: 'noguera',           label: 'Noguera' },
    ],
  },
  {
    label: '⚓ Comarques Tarragona',
    opcions: [
      { value: 'alt-camp',          label: 'Alt Camp' },
      { value: 'baix-camp',         label: 'Baix Camp' },
      { value: 'tarragues',         label: 'Tarragonès' },
      { value: 'priorat',           label: 'Priorat' },
      { value: 'ribera-d-ebre',     label: 'Ribera d\'Ebre' },
      { value: 'terra-alta',        label: 'Terra Alta' },
    ],
  },
];

// Totes les opcions planes (per mostrar el label al header)
const TOTES_OPCIONS = GRUPS.flatMap(g => g.opcions);

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'Ara mateix';
  if (diffMins < 60) return `Fa ${diffMins} ${diffMins === 1 ? 'minut' : 'minuts'}`;
  if (diffHours < 24) return `Fa ${diffHours} ${diffHours === 1 ? 'hora' : 'hores'}`;
  if (diffDays < 7) return `Fa ${diffDays} ${diffDays === 1 ? 'dia' : 'dies'}`;
  return date.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' });
}

function SkeletonCard({ featured = false }: { featured?: boolean }) {
  return (
    <div className={`bg-white rounded-3xl shadow-sm overflow-hidden animate-pulse ${featured ? 'col-span-2' : ''}`}>
      <div className={`bg-gray-200 w-full ${featured ? 'aspect-[16/7]' : 'aspect-video'}`} />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded-full w-1/4" />
        <div className="h-4 bg-gray-200 rounded-full w-full" />
        <div className="h-4 bg-gray-200 rounded-full w-2/3" />
      </div>
    </div>
  );
}

function NewsCard({ item, featured = false }: { item: NewsItem; featured?: boolean }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = !!item.imageUrl && !imgError;
  const ago = timeAgo(item.pubDate);

  return (
    <Link
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 ${featured ? 'col-span-2' : ''}`}
    >
      <div className={`relative w-full overflow-hidden ${featured ? 'aspect-[16/7]' : 'aspect-video'}`}>
        {hasImage ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
            <svg className="w-10 h-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {ago && (
          <span className="absolute bottom-3 left-3 text-white text-xs font-medium bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
            {ago}
          </span>
        )}
        {featured && (
          <span className="absolute top-3 right-3 text-white text-xs font-semibold bg-violet-600/80 backdrop-blur-sm px-3 py-1 rounded-full">
            Destacat
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className={`font-bold text-gray-900 leading-snug line-clamp-3 group-hover:text-violet-700 transition-colors ${featured ? 'text-lg' : 'text-sm'}`}>
          {item.title}
        </h3>
      </div>
    </Link>
  );
}

export default function ActualitatPage() {
  const [territori, setTeritori] = useState('general');
  const [news, setNews]         = useState<NewsItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchNews = useCallback(async (t: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/news?territori=${t}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Format inesperat');
      setNews(data);
    } catch (err: any) {
      setError(err.message ?? 'Error desconegut');
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNews(territori); }, [territori, fetchNews]);

  const labelActual = TOTES_OPCIONS.find(o => o.value === territori)?.label ?? 'Catalunya';
  const featured = news[0] ?? null;
  const rest = news.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header sticky */}
      <div className="sticky top-0 z-20 bg-gray-50/90 backdrop-blur-md border-b border-gray-100 px-4 pt-4 pb-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Actualitat</h1>
              <p className="text-xs text-gray-400 mt-0.5">{labelActual} · Notícies recents</p>
            </div>
            {!loading && (
              <button
                onClick={() => fetchNews(territori)}
                className="text-violet-600 text-sm font-semibold active:scale-95 transition-transform"
              >
                ↻ Actualitza
              </button>
            )}
          </div>

          {/* Selector agrupat per zones */}
          <div className="relative">
            <select
              value={territori}
              onChange={(e) => setTeritori(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent pr-10"
            >
              {GRUPS.map((grup) => (
                <optgroup key={grup.label} label={grup.label}>
                  {grup.opcions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Contingut */}
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-28">

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
            <p className="text-red-600 font-semibold text-sm">⚠️ {error}</p>
            <button onClick={() => fetchNews(territori)} className="mt-2 text-red-400 text-xs underline">
              Torna-ho a intentar
            </button>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-2 gap-3">
            <SkeletonCard featured />
            <SkeletonCard /><SkeletonCard />
            <SkeletonCard /><SkeletonCard />
            <SkeletonCard /><SkeletonCard />
          </div>
        )}

        {!loading && !error && news.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {featured && <NewsCard item={featured} featured />}
            {rest.map((item, i) => (
              <NewsCard key={i} item={item} />
            ))}
          </div>
        )}

        {!loading && !error && news.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📰</p>
            <p className="text-gray-600 font-semibold">Sense notícies disponibles</p>
            <p className="text-gray-400 text-sm mt-1">Prova amb una altra zona</p>
          </div>
        )}
      </div>
    </div>
  );
}