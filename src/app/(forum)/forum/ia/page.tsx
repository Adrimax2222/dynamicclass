"use client";

const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ultra IA — Directorio de Herramientas</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#09090f;--card:#16161f;--border:#1e1e2e;--accent1:#7c3aed;--text:#e2e2f0;--muted:#6b6b8a}
html, body { overscroll-behavior: none; }
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden}
body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse 60% 40% at 20% 10%,rgba(124,58,237,.12) 0%,transparent 60%),radial-gradient(ellipse 50% 30% at 80% 80%,rgba(6,182,212,.08) 0%,transparent 60%);pointer-events:none;z-index:0}
header{position:relative;z-index:10;padding:64px 40px 48px;text-align:center;border-bottom:1px solid var(--border)}
.logo-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(124,58,237,.12);border:1px solid rgba(124,58,237,.3);border-radius:100px;padding:6px 16px;font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#a78bfa;margin-bottom:24px}
.logo-badge::before{content:'';width:6px;height:6px;border-radius:50%;background:#a78bfa;animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
h1{font-family:'Syne',sans-serif;font-size:clamp(42px,8vw,96px);font-weight:800;line-height:.95;letter-spacing:-.03em;background:linear-gradient(135deg,#fff 30%,#a78bfa 60%,#67e8f9 90%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:16px}
.subtitle{color:var(--muted);font-size:16px;font-weight:300;max-width:500px;margin:0 auto 48px;line-height:1.6}
.search-wrap{max-width:560px;margin:0 auto;position:relative}
.search-wrap svg{position:absolute;left:18px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none;width:18px;height:18px}
#search{width:100%;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px 20px 16px 50px;font-family:'DM Sans',sans-serif;font-size:15px;color:var(--text);outline:none;transition:border-color .2s,box-shadow .2s}
#search::placeholder{color:var(--muted)}
#search:focus{border-color:rgba(124,58,237,.5);box-shadow:0 0 0 3px rgba(124,58,237,.1)}
.filters{position:relative;z-index:10;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;padding:28px 40px;border-bottom:1px solid var(--border)}
.filter-btn{background:var(--card);border:1px solid var(--border);border-radius:100px;padding:8px 18px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:var(--muted);cursor:pointer;transition:all .2s}
.filter-btn:hover{border-color:var(--accent1);color:var(--text)}
.filter-btn.active{background:var(--accent1);border-color:var(--accent1);color:#fff;box-shadow:0 4px 16px rgba(124,58,237,.3)}
main{position:relative;z-index:10;max-width:1400px;margin:0 auto;padding:40px}
.section-header{display:flex;align-items:center;gap:12px;margin-bottom:24px;margin-top:48px}
.section-header:first-child{margin-top:0}
.section-label{font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);white-space:nowrap}
.section-line{flex:1;height:1px;background:var(--border)}
.section-count{font-size:11px;color:var(--muted);background:var(--card);border:1px solid var(--border);border-radius:100px;padding:2px 10px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
.card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:22px 22px 18px;cursor:pointer;transition:transform .2s,border-color .2s,box-shadow .2s;position:relative;overflow:hidden;animation:fadeIn .4s ease both;text-decoration:none;display:flex;flex-direction:column;color:inherit}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--card-accent,#7c3aed),transparent);opacity:0;transition:opacity .3s}
.card:hover{transform:translateY(-3px);border-color:rgba(124,58,237,.4);box-shadow:0 8px 32px rgba(0,0,0,.35),0 0 0 1px rgba(124,58,237,.1)}
.card:hover::before{opacity:1}
.card-head{display:flex;align-items:flex-start;gap:12px;margin-bottom:12px}
.card-icon{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.card-meta{flex:1;min-width:0}
.card-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:#fff;line-height:1.25;margin-bottom:4px}
.card-tag{display:inline-block;font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;border-radius:100px;padding:2px 8px}
.badge-new{display:inline-block;font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;background:linear-gradient(135deg,#06b6d4,#7c3aed);color:#fff;border-radius:100px;padding:2px 7px;margin-left:6px;vertical-align:middle}
.card-desc{font-size:13px;color:var(--muted);line-height:1.6;font-weight:300;flex:1;margin-bottom:14px}
.card-footer{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:12px;border-top:1px solid var(--border);margin-top:auto}
.card-url{font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.card-btn{display:inline-flex;align-items:center;gap:4px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#a78bfa;border:1px solid rgba(124,58,237,.3);border-radius:100px;padding:5px 12px;transition:all .2s;white-space:nowrap;flex-shrink:0}
.card:hover .card-btn{background:rgba(124,58,237,.15);border-color:rgba(124,58,237,.6)}
.cat-chat{--card-accent:#7c3aed}.cat-imagen{--card-accent:#ec4899}.cat-video{--card-accent:#f59e0b}.cat-codigo{--card-accent:#06b6d4}.cat-audio{--card-accent:#10b981}.cat-prod{--card-accent:#6366f1}.cat-edu{--card-accent:#f97316}.cat-mkt{--card-accent:#84cc16}.cat-diseno{--card-accent:#a855f7}.cat-seo{--card-accent:#f43f5e}.cat-3d{--card-accent:#0ea5e9}.cat-wa{--card-accent:#25d366}.cat-otros{--card-accent:#94a3b8}
.tag-chat{background:rgba(124,58,237,.15);color:#a78bfa}.tag-imagen{background:rgba(236,72,153,.15);color:#f9a8d4}.tag-video{background:rgba(245,158,11,.15);color:#fcd34d}.tag-codigo{background:rgba(6,182,212,.15);color:#67e8f9}.tag-audio{background:rgba(16,185,129,.15);color:#6ee7b7}.tag-prod{background:rgba(99,102,241,.15);color:#a5b4fc}.tag-edu{background:rgba(249,115,22,.15);color:#fdba74}.tag-mkt{background:rgba(132,204,22,.15);color:#bef264}.tag-diseno{background:rgba(168,85,247,.15);color:#d8b4fe}.tag-seo{background:rgba(244,63,94,.15);color:#fda4af}.tag-3d{background:rgba(14,165,233,.15);color:#7dd3fc}.tag-wa{background:rgba(37,211,102,.15);color:#86efac}.tag-otros{background:rgba(148,163,184,.15);color:#cbd5e1}
.icon-chat{background:rgba(124,58,237,.15)}.icon-imagen{background:rgba(236,72,153,.15)}.icon-video{background:rgba(245,158,11,.15)}.icon-codigo{background:rgba(6,182,212,.15)}.icon-audio{background:rgba(16,185,129,.15)}.icon-prod{background:rgba(99,102,241,.15)}.icon-edu{background:rgba(249,115,22,.15)}.icon-mkt{background:rgba(132,204,22,.15)}.icon-diseno{background:rgba(168,85,247,.15)}.icon-seo{background:rgba(244,63,94,.15)}.icon-3d{background:rgba(14,165,233,.15)}.icon-wa{background:rgba(37,211,102,.15)}.icon-otros{background:rgba(148,163,184,.15)}
.empty{text-align:center;padding:80px 20px;color:var(--muted)}.empty-icon{font-size:48px;margin-bottom:16px}.empty h3{font-family:'Syne',sans-serif;font-size:20px;color:var(--text);margin-bottom:8px}
.stats{position:relative;z-index:10;display:flex;gap:32px;justify-content:center;flex-wrap:wrap;padding:24px 40px;border-top:1px solid var(--border)}
.stat{text-align:center}.stat-num{font-family:'Syne',sans-serif;font-size:32px;font-weight:800;background:linear-gradient(135deg,#a78bfa,#67e8f9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}.stat-label{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em}
footer{position:relative;z-index:10;text-align:center;padding:32px;color:var(--muted);font-size:14px;border-top:1px solid var(--border);display:flex;flex-direction:column;align-items:center;gap:12px}
.footer-logos{display:flex;align-items:center;gap:20px;flex-wrap:wrap;justify-content:center}
.footer-link{display:inline-flex;align-items:center;gap:8px;text-decoration:none;font-weight:600;font-size:14px;color:var(--muted);border:1px solid var(--border);border-radius:100px;padding:9px 20px;transition:all .2s}
.footer-link:hover{color:#fff;border-color:rgba(124,58,237,.5);background:rgba(124,58,237,.1)}
.footer-link .dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.footer-sep{font-size:18px;color:var(--border);font-weight:300}
.footer-copy{font-size:12px;color:var(--muted);opacity:.6}
#no-results{display:none}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
</style>
</head>
<body>
<header>
  <div class="logo-badge">Proyecto Adrimax · v2.0</div>
  <h1>Ultra IA</h1>
  <p class="subtitle">El directorio más completo de herramientas de inteligencia artificial. Gratuitas o con plan gratuito, organizadas y listas para usar.</p>
  <div class="search-wrap">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
    <input type="text" id="search" placeholder="Buscar herramienta, descripción o categoría…" autocomplete="off">
  </div>
</header>

<div class="filters">
  <button class="filter-btn active" data-cat="all">✦ Todas</button>
  <button class="filter-btn" data-cat="chat">💬 Chat IA</button>
  <button class="filter-btn" data-cat="imagen">🎨 Imagen</button>
  <button class="filter-btn" data-cat="video">🎬 Vídeo</button>
  <button class="filter-btn" data-cat="codigo">💻 Código</button>
  <button class="filter-btn" data-cat="audio">🎵 Audio</button>
  <button class="filter-btn" data-cat="prod">⚡ Productividad</button>
  <button class="filter-btn" data-cat="edu">📚 Educación</button>
  <button class="filter-btn" data-cat="mkt">📣 Marketing</button>
  <button class="filter-btn" data-cat="diseno">✏️ Diseño</button>
  <button class="filter-btn" data-cat="seo">🔍 SEO &amp; Escritura</button>
  <button class="filter-btn" data-cat="3d">🧊 3D &amp; Avatar</button>
  <button class="filter-btn" data-cat="wa">📱 WhatsApp</button>
  <button class="filter-btn" data-cat="otros">🔧 Otros</button>
</div>

<main>
  <div id="grid-container"></div>
  <div id="no-results" class="empty">
    <div class="empty-icon">🔍</div>
    <h3>Sin resultados</h3>
    <p>Prueba con otro término de búsqueda o categoría.</p>
  </div>
</main>

<div class="stats">
  <div class="stat"><div class="stat-num" id="stat-total">0</div><div class="stat-label">Herramientas totales</div></div>
  <div class="stat"><div class="stat-num" id="stat-showing">0</div><div class="stat-label">Mostrando ahora</div></div>
  <div class="stat"><div class="stat-num" id="stat-cats">0</div><div class="stat-label">Categorías</div></div>
</div>

<footer>
  <div class="footer-logos">
    <a class="footer-link" href="https://proyectoadrimax.framer.website/" target="_blank" rel="noopener">
      <span class="dot" style="background:#a78bfa"></span>Proyecto Adrimax
    </a>
    <span class="footer-sep">×</span>
    <a class="footer-link" href="https://dynamicclass.app" target="_blank" rel="noopener">
      <span class="dot" style="background:#67e8f9"></span>Dynamic Class
    </a>
  </div>

</footer>

<script>
const CAT_LABELS={chat:"💬 Chat IA",imagen:"🎨 Imagen",video:"🎬 Vídeo",codigo:"💻 Código",audio:"🎵 Audio",prod:"⚡ Productividad",edu:"📚 Educación",mkt:"📣 Marketing",diseno:"✏️ Diseño",seo:"🔍 SEO & Escritura","3d":"🧊 3D & Avatar",wa:"📱 WhatsApp",otros:"🔧 Otros"};

const TOOLS=[
{name:"ChatGPT",cat:"chat",icon:"🤖",url:"https://chatgpt.com",desc:"El chatbot de OpenAI con GPT-4o y superiores. Responde preguntas, razona, genera código e imágenes. El más popular del mundo."},
{name:"Claude (Anthropic)",cat:"chat",icon:"🧠",url:"https://claude.ai",isNew:true,desc:"IA de Anthropic reconocida por sus respuestas largas, análisis de documentos y razonamiento avanzado. Plan gratuito disponible."},
{name:"Google Gemini",cat:"chat",icon:"🌟",url:"https://gemini.google.com",desc:"La IA oficial de Google integrada con Gmail, Docs y más. Accede a internet en tiempo real."},
{name:"Bing Copilot",cat:"chat",icon:"🔷",url:"https://copilot.microsoft.com",desc:"Copiloto de Microsoft con GPT-4. Acceso a internet y generación de imágenes con DALL·E incluido. Gratis."},
{name:"Perplexity AI",cat:"chat",icon:"🔬",url:"https://www.perplexity.ai/",desc:"Buscador-chat que extrae fuentes científicas verificadas. Muestra de dónde viene cada dato con citas."},
{name:"You.com",cat:"chat",icon:"🔀",url:"https://you.com/",desc:"Mezcla ChatGPT y Google en una sola interfaz. Busca, chatea y crea sin salir de la página."},
{name:"DeepSeek",cat:"chat",icon:"🌊",url:"https://chat.deepseek.com",isNew:true,desc:"Modelo chino open source que compite con GPT-4. Razonamiento matemático y de programación excepcionales. Gratis."},
{name:"Grok (xAI)",cat:"chat",icon:"🚀",url:"https://grok.com",isNew:true,desc:"La IA de xAI accesible desde X (Twitter). Deep Research gratuito y acceso a tendencias en tiempo real."},
{name:"Meta AI",cat:"chat",icon:"🦙",url:"https://www.meta.ai/",isNew:true,desc:"El chatbot de Meta integrado en WhatsApp, Instagram y Facebook. Plan completamente gratuito e ilimitado."},
{name:"Mistral Le Chat",cat:"chat",icon:"🐱",url:"https://chat.mistral.ai/",isNew:true,desc:"Chatbot europeo de Mistral AI. Modelos open source de altísimo rendimiento con acceso gratuito."},
{name:"Character.AI",cat:"chat",icon:"🎭",url:"https://beta.character.ai/",desc:"Crea tu propia IA con cualquier personaje. Habla con personajes famosos o inventa uno propio completamente."},
{name:"Pi (Inflection AI)",cat:"chat",icon:"π",url:"https://pi.ai/",isNew:true,desc:"IA conversacional diseñada para el bienestar y reflexión. Conversaciones profundas sin límites."},
{name:"HuggingChat",cat:"chat",icon:"🤗",url:"https://huggingface.co/chat/",isNew:true,desc:"Chatbot open source de Hugging Face. Accede a múltiples modelos de forma completamente gratuita."},
{name:"Writesonic Chat",cat:"chat",icon:"✍️",url:"https://writesonic.com/chat",desc:"Alternativa a ChatGPT con acceso a internet en tiempo real y herramientas de escritura integradas."},
{name:"Andi Search",cat:"chat",icon:"🧠",url:"https://andisearch.com/",desc:"Buscador de nueva generación con IA. Respuestas directas sin anuncios ni rastreadores."},
{name:"Ora.sh / GPT-4 Free",cat:"chat",icon:"🆓",url:"https://ora.sh/openai/gpt4",desc:"Acceso gratuito a GPT-4 sin suscripción de pago en OpenAI. Ideal para probar."},

{name:"Wepik IA",cat:"imagen",icon:"🖼️",url:"https://wepik.com/es/inteligencia-artificial",desc:"Generador de imágenes con IA integrado en Wepik. Crea ilustraciones y gráficos desde texto."},
{name:"Adobe Firefly",cat:"imagen",icon:"🔥",url:"https://firefly.adobe.com/upload/inpaint",desc:"Elimina objetos, genera y modifica partes de imágenes con IA generativa de Adobe. Plan gratuito."},
{name:"Bing Image Creator",cat:"imagen",icon:"🎨",url:"https://www.bing.com/create",desc:"Genera imágenes con DALL·E 3 integrado en Bing. Completamente gratuito y sin derechos de autor."},
{name:"Midjourney",cat:"imagen",icon:"🌌",url:"https://www.midjourney.com/home/",desc:"Uno de los mejores generadores de imagen con nivel de detalle extremo. Disponible vía Discord."},
{name:"Leonardo AI",cat:"imagen",icon:"🦁",url:"https://app.leonardo.ai/",isNew:true,desc:"Generador de imágenes con plan gratuito muy generoso. Ideal para concept art, personajes y videojuegos."},
{name:"Canva IA",cat:"imagen",icon:"🎨",url:"https://www.canva.com/",isNew:true,desc:"La plataforma de diseño más popular ahora con IA: genera imágenes, edita fotos y crea vídeos. Gratis."},
{name:"Ideogram AI",cat:"imagen",icon:"📝",url:"https://ideogram.ai/",isNew:true,desc:"Generador de imágenes que destaca por incluir texto legible dentro de las imágenes. Plan gratuito generoso."},
{name:"Playground AI",cat:"imagen",icon:"🛝",url:"https://playground.com/",isNew:true,desc:"Generador de imágenes y editor IA gratuito muy potente. Sube tus fotos y edítalas con IA fácilmente."},
{name:"DreamStudio",cat:"imagen",icon:"⚡",url:"https://dreamstudio.ai/generate",desc:"Interfaz oficial de Stable Diffusion. Crea imágenes fotorrealistas y artísticas a partir de texto."},
{name:"Scribble Diffusion",cat:"imagen",icon:"✏️",url:"https://scribblediffusion.com/",desc:"Haz un dibujo simple y la IA lo convierte en imágenes hermosas. De boceto a arte al instante."},
{name:"Remove.bg",cat:"imagen",icon:"🔲",url:"https://www.remove.bg/es",isNew:true,desc:"Elimina el fondo de cualquier imagen en segundos con IA. Sin registro, completamente gratis."},
{name:"Cleanup.pictures",cat:"imagen",icon:"🧹",url:"https://cleanup.pictures/",isNew:true,desc:"Elimina objetos, personas o manchas de tus fotos con un pincel. IA instantánea y gratuita."},
{name:"Krea AI",cat:"imagen",icon:"🌀",url:"https://www.krea.ai/",isNew:true,desc:"Generador de imágenes en tiempo real mientras escribes el prompt. Edición IA avanzada incluida."},
{name:"Photoroom",cat:"imagen",icon:"📸",url:"https://www.photoroom.com/es",isNew:true,desc:"Editor de fotos con IA: elimina fondos, añade sombras y genera fondos profesionales. Plan gratis."},
{name:"Picwish",cat:"imagen",icon:"✂️",url:"https://picwish.com/es/remove-unwanted-object",desc:"Elimina objetos de imágenes con IA a la perfección. Limpio, rápido y sin rastros del objeto."},
{name:"Stockimg AI",cat:"imagen",icon:"🖌️",url:"https://stockimg.ai/",desc:"Generador de posters, portadas, logos y contenido visual basado en IA con plan gratuito."},
{name:"Flair AI",cat:"imagen",icon:"✨",url:"https://withflair.ai/",desc:"Crea fotos de producto y contenido visual de marketing de calidad profesional con IA."},

{name:"CapCut IA",cat:"video",icon:"✂️",url:"https://www.capcut.com/es-es/",isNew:true,desc:"El editor de vídeo con IA más popular. Auto-subtítulos, eliminación de silencios y efectos. Gratis."},
{name:"RunwayML",cat:"video",icon:"🛤️",url:"https://runwayml.com/",isNew:true,desc:"La IA de vídeo más avanzada. Genera vídeos desde texto e imágenes con efectos cinematográficos. Plan gratis."},
{name:"HeyGen",cat:"video",icon:"🧑‍💼",url:"https://www.heygen.com/",isNew:true,desc:"Crea vídeos con avatares IA hiperrealistas que hablan con tu voz y script. Plan gratuito."},
{name:"InVideo AI",cat:"video",icon:"🎬",url:"https://invideo.io/",isNew:true,desc:"Genera vídeos completos desde texto: guion, voiceover, imágenes y música incluidos. Gratis con marca de agua."},
{name:"Pika Labs",cat:"video",icon:"🌊",url:"https://pika.art/",isNew:true,desc:"Convierte imágenes y textos en vídeos cortos con IA. Plan gratuito con créditos mensuales."},
{name:"OpusClip",cat:"video",icon:"🎞️",url:"https://www.opus.pro/",isNew:true,desc:"Convierte vídeos largos en clips virales cortos con IA. Perfecto para recortar YouTube a TikTok/Reels."},
{name:"Descript",cat:"video",icon:"🎙️",url:"https://www.descript.com/",isNew:true,desc:"Edita vídeo editando texto transcrito. Elimina palabras de relleno con un clic. Plan gratuito."},
{name:"Rask AI",cat:"video",icon:"🌍",url:"https://es.rask.ai/",desc:"Dobla en tiempo real cualquier vídeo al idioma que quieras en menos de un segundo. Gratis."},
{name:"NVIDIA Broadcast",cat:"video",icon:"🎙️",url:"https://www.nvidia.com/es-es/geforce/broadcasting/broadcast-app/",desc:"Elimina ruido del audio y hace que tus ojos miren a la cámara en videollamadas con IA. Gratis."},
{name:"Speak Subtitles YouTube",cat:"video",icon:"📝",url:"https://chrome.google.com/webstore/detail/speak-subtitles-for-youtu/fjoiihoancoimepbgfcmopaciegpigpa",desc:"Traduce en tiempo real con voz humana cualquier vídeo de YouTube al idioma que quieras."},
{name:"Visual Effects for Meet",cat:"video",icon:"🎭",url:"https://chrome.google.com/webstore/detail/visual-effects-for-google/hodiladlefdpcbemnbbcpclbmknkiaem?hl=ca",desc:"Efectos visuales con IA para videollamadas de Google Meet. Muy realistas, todo tipo de fondos."},
{name:"VidMix (Voxeloid)",cat:"video",icon:"🎥",url:"https://vidmix.voxeloid.com/",desc:"Editor de vídeo que mezcla edición tradicional con potentes herramientas de inteligencia artificial."},

{name:"GitHub Copilot",cat:"codigo",icon:"🐙",url:"https://github.com/features/copilot",isNew:true,desc:"El asistente de código más usado en el mundo. Completa, sugiere y genera código en tu editor. Plan gratis."},
{name:"Cursor AI",cat:"codigo",icon:"⌨️",url:"https://www.cursor.com/",isNew:true,desc:"El editor de código del futuro, construido sobre VS Code con IA integrada profundamente. Plan gratuito."},
{name:"Bolt.new",cat:"codigo",icon:"⚡",url:"https://bolt.new/",isNew:true,desc:"Crea aplicaciones web completas desde una descripción en texto. Código visible y editable al instante."},
{name:"v0 (Vercel)",cat:"codigo",icon:"▲",url:"https://v0.dev/",isNew:true,desc:"Genera componentes UI en React/Tailwind desde texto. Del equipo de Next.js. Gratis."},
{name:"Replit AI",cat:"codigo",icon:"🔄",url:"https://replit.com/",isNew:true,desc:"IDE online con IA integrada. Crea, ejecuta y despliega apps directamente en el navegador."},
{name:"Codeium",cat:"codigo",icon:"💻",url:"https://codeium.com/chrome_tutorial",desc:"Alternativa gratuita a GitHub Copilot. Autocompletado de código para VS Code, Chrome y más editores."},
{name:"Codium AI",cat:"codigo",icon:"🧪",url:"https://www.codium.ai/",desc:"Analiza tu código y genera tests automáticos para detectar bugs y errores de lógica. Gratis."},
{name:"Debuild",cat:"codigo",icon:"🏗️",url:"https://debuild.app/",desc:"Crea webs y apps completas con IA a partir de una descripción en texto. Sin necesidad de programar."},
{name:"AgentGPT",cat:"codigo",icon:"🤖",url:"https://agentgpt.reworkd.ai/es",desc:"Le das un objetivo y la IA lo divide en tareas y las ejecuta de forma autónoma paso a paso."},
{name:"Hugging Face",cat:"codigo",icon:"🤗",url:"https://huggingface.co/",desc:"La plataforma de referencia para modelos IA open source. Miles de modelos, datasets y demos."},

{name:"Suno AI",cat:"audio",icon:"🎵",url:"https://suno.com/",isNew:true,desc:"Genera canciones completas con letra, voz y música a partir de una descripción de texto. Plan gratuito muy generoso."},
{name:"Udio",cat:"audio",icon:"🎶",url:"https://www.udio.com/",isNew:true,desc:"Crea música de altísima calidad desde texto. Uno de los mejores generadores musicales con IA del momento."},
{name:"ElevenLabs",cat:"audio",icon:"🗣️",url:"https://elevenlabs.io/",isNew:true,desc:"La mejor IA de síntesis de voz. Clona voces, genera narración y doblajes hiperrealistas. Plan gratuito."},
{name:"Adobe Podcast",cat:"audio",icon:"🎚️",url:"https://podcast.adobe.com/",isNew:true,desc:"Mejora la calidad de tu voz en segundos con IA. Elimina el ruido de fondo a la perfección. Gratis."},
{name:"Murf AI",cat:"audio",icon:"🎤",url:"https://murf.ai/",isNew:true,desc:"Genera voiceovers profesionales con IA en más de 120 voces y 20 idiomas. Plan gratuito limitado."},
{name:"Lalal.ai",cat:"audio",icon:"🎸",url:"https://www.lalal.ai/",isNew:true,desc:"Separa voces, instrumentos y beat de cualquier canción con IA. Ideal para remixes y karaoke."},
{name:"Riffusion",cat:"audio",icon:"🔊",url:"https://www.riffusion.com/",desc:"Genera música sin copyright a partir de texto. Crea cualquier estilo musical al instante. Gratis."},
{name:"Audiogen",cat:"audio",icon:"🎙️",url:"https://www.audiogen.co/",desc:"Crea efectos de audio y música personalizados con IA. Sonidos sin copyright generados en segundos."},
{name:"Artlist SFX",cat:"audio",icon:"🔉",url:"https://artlist.io/sfx",desc:"Millones de efectos de sonido y música sin copyright descargables gratis para tus proyectos."},
{name:"TranscribeMe",cat:"audio",icon:"🎧",url:"https://www.transcribeme.app/",desc:"Reenvía un audio de WhatsApp a esta IA y te lo transcribe automáticamente a texto escrito."},

{name:"Compose AI",cat:"prod",icon:"✍️",url:"https://www.compose.ai/",desc:"Autocompletado de textos con IA en Gmail, Docs y más. Escribe hasta 3 veces más rápido."},
{name:"NotebookLM (Google)",cat:"prod",icon:"📓",url:"https://notebooklm.google.com/",isNew:true,desc:"Sube tus documentos y crea un asistente que solo responde con tu contenido. De Google. Gratis."},
{name:"Notion AI",cat:"prod",icon:"📋",url:"https://www.notion.so/",isNew:true,desc:"IA integrada en Notion para resumir notas, generar textos y organizar información. Plan gratuito."},
{name:"Gamma AI",cat:"prod",icon:"🎯",url:"https://gamma.app/",isNew:true,desc:"Crea presentaciones, documentos y páginas web con IA en segundos. Plan gratuito muy completo."},
{name:"SlidesAI",cat:"prod",icon:"📊",url:"https://www.slidesai.io/es",desc:"Genera presentaciones de PowerPoint súper detalladas de forma automática con IA."},
{name:"Tome App",cat:"prod",icon:"📁",url:"https://tome.app/",desc:"Generador de presentaciones narrativas con IA. Decks visuales profesionales desde texto."},
{name:"Monica AI (Chrome)",cat:"prod",icon:"🌐",url:"https://chrome.google.com/webstore/detail/monica-%E2%80%94-your-ai-copilot/ofpnmcalabcbjgholdjcjblkibolbppb?hl=ca",desc:"Barra lateral con ChatGPT, buscador, notas y calculadora integrada en Chrome. Gratis."},
{name:"Humata AI",cat:"prod",icon:"📄",url:"https://www.humata.ai/",desc:"Cuelga cualquier archivo y la IA lo analiza, responde preguntas y genera resúmenes del contenido."},
{name:"ClickUp AI",cat:"prod",icon:"✅",url:"https://clickup.com/",isNew:true,desc:"Gestión de proyectos con IA. Genera resúmenes, asigna tareas y automatiza flujos de trabajo. Plan gratis."},
{name:"Sidebarr (Chrome)",cat:"prod",icon:"📌",url:"https://chrome.google.com/webstore/detail/sidebarr-chatgpt-bookmark/afdfpkhbdpioonfeknablodaejkklbdn?hl=ca",desc:"Barra lateral con ChatGPT en Chrome. Accede a la IA sin salir de ninguna página web."},
{name:"Easy-Peasy AI",cat:"prod",icon:"⚡",url:"https://easy-peasy.ai/es",desc:"Plataforma todo-en-uno con IA para escritura, imágenes y productividad. Interfaz en español."},
{name:"Remote for Slides",cat:"prod",icon:"📱",url:"https://chrome.google.com/webstore/detail/remote-for-slides/pojijacppbhikhkmegdoechbfiiibppi/related?hl=ca",desc:"Controla tu PowerPoint a distancia desde el móvil. Simple, intuitivo y completamente online."},
{name:"Piggy (Infografías)",cat:"prod",icon:"🐷",url:"https://piggy.to/",desc:"Crea presentaciones e infografías visuales con IA de forma rápida. Sin necesidad de diseño."},

{name:"Quizlet AI",cat:"edu",icon:"📚",url:"https://quizlet.com/",isNew:true,desc:"Crea flashcards y tests de estudio automáticamente con IA. La app de estudio más popular del mundo. Gratis."},
{name:"Khanmigo",cat:"edu",icon:"🎓",url:"https://www.khanacademy.org/khan-labs",isNew:true,desc:"Tutor IA de Khan Academy. Explica conceptos y guía sin dar la respuesta directamente. Gratis."},
{name:"ChatPDF",cat:"edu",icon:"📃",url:"https://www.chatpdf.com/",isNew:true,desc:"Sube cualquier PDF y hazle preguntas en formato chat. Perfecto para estudiar documentos largos. Gratis."},
{name:"KahootGPT (Chrome)",cat:"edu",icon:"❓",url:"https://chrome.google.com/webstore/detail/kahootgpt-kahoot-%2B-chatgp/mmnbfkefbancfkmcbfeepiiniggfaobm?hl=ca",desc:"Kahoot + ChatGPT. Te ayuda dentro del quiz con respuestas inteligentes en tiempo real."},
{name:"Kahoot Winner",cat:"edu",icon:"🏆",url:"https://allpcsolottoresults.com/kahoot/kahoot-winner/",desc:"Con esta app siempre ganarás en Kahoot: accede a la programación del quiz y obtén las respuestas correctas."},
{name:"Wuolah",cat:"edu",icon:"📓",url:"https://wuolah.com/",desc:"Busca apuntes de tu país y titulación. Conecta con estudiantes que estudian lo mismo que tú."},
{name:"Speak.com",cat:"edu",icon:"🗣️",url:"https://www.speak.com/",desc:"Aprende idiomas con IA que escucha y corrige tu pronunciación en tiempo real. Conversación real."},
{name:"GPTZero",cat:"edu",icon:"🕵️",url:"https://gptzero.me/",desc:"Detecta si un texto ha sido escrito por IA o por humanos. Imprescindible para profesores. Gratis."},
{name:"Readow AI",cat:"edu",icon:"📖",url:"https://readow.ai/",desc:"Pon un libro que te haya gustado y la IA recomienda libros parecidos según tus gustos literarios."},
{name:"Explainpaper",cat:"edu",icon:"📰",url:"https://www.explainpaper.com/",desc:"Sube cualquier paper o texto y la IA lo explica en lenguaje sencillo con las palabras clave."},
{name:"Consensus AI",cat:"edu",icon:"🔬",url:"https://consensus.app/",desc:"Busca respuestas con base científica. Cada respuesta viene con papers y estudios verificados."},
{name:"Ask Botta",cat:"edu",icon:"🤖",url:"https://askbotta.com/",desc:"Profesor virtual con IA para enseñanza de todo tipo de edad, tema y metodología personalizada."},

{name:"Copy.ai",cat:"mkt",icon:"📣",url:"https://www.copy.ai/",isNew:true,desc:"Genera copys, emails, posts y anuncios con IA. La herramienta de marketing favorita de miles de marcas. Plan gratis."},
{name:"Jasper AI",cat:"mkt",icon:"🚀",url:"https://www.jasper.ai/",isNew:true,desc:"IA especializada en marketing de contenidos. Genera artículos, ads y posts con voz de marca propia."},
{name:"AdCreative.ai",cat:"mkt",icon:"📱",url:"https://www.adcreative.ai/",isNew:true,desc:"Genera creatividades de anuncios que convierten con IA. Banners, redes sociales y más. Plan gratuito."},
{name:"Buffer AI",cat:"mkt",icon:"📅",url:"https://buffer.com/",isNew:true,desc:"Programa publicaciones en redes sociales con IA que sugiere el mejor contenido y horario. Plan gratis."},
{name:"Flair AI (Marketing)",cat:"mkt",icon:"🎯",url:"https://withflair.ai/",desc:"Crea fotos de producto y contenido visual de marketing de calidad profesional con IA."},
{name:"Toolify AI",cat:"mkt",icon:"🗂️",url:"https://www.toolify.ai/es/",desc:"El directorio de herramientas IA más completo. Encuentra la herramienta perfecta para cada tarea."},
{name:"Namesnack",cat:"mkt",icon:"💡",url:"https://www.namesnack.com/",desc:"Generador de nombres con IA para webs, apps, empresas y videojuegos. Rápido y creativo."},
{name:"WhereToAI (Viajes)",cat:"mkt",icon:"🗺️",url:"https://www.wheretoai.com/",desc:"Planificador de viajes con IA: hoteles, rutas y lugares de interés según tu tiempo disponible."},

{name:"Canva Magic Studio",cat:"diseno",icon:"✨",url:"https://www.canva.com/magic/",isNew:true,desc:"Diseña todo con IA: elimina fondos, genera imágenes, redacta textos y crea vídeos. Completamente gratis."},
{name:"Figma AI",cat:"diseno",icon:"🔲",url:"https://www.figma.com/",isNew:true,desc:"El estándar en diseño UI/UX ahora con IA integrada. Genera prototipos desde texto. Plan gratuito."},
{name:"Looka",cat:"diseno",icon:"🎨",url:"https://looka.com/",isNew:true,desc:"Crea logos y branding completo para tu marca con IA en minutos. Vista previa completamente gratuita."},
{name:"Picsart AI",cat:"diseno",icon:"🖼️",url:"https://picsart.com/",isNew:true,desc:"Editor de fotos y vídeos con IA. Elimina fondos, añade efectos y diseña contenido. Plan gratis."},
{name:"Interior AI",cat:"diseno",icon:"🏠",url:"https://interiorai.com/",desc:"Cuelga una foto de tu habitación y la IA la redecora al estilo que elijas. Plan gratuito."},
{name:"Reimagine Home",cat:"diseno",icon:"🛋️",url:"https://www.reimaginehome.ai/",desc:"Decoración de interiores en tiempo real y medidas reales. Visualiza cómo quedará antes de reformar."},
{name:"Stockimg AI",cat:"diseno",icon:"🖌️",url:"https://stockimg.ai/",desc:"Generador de posters, portadas, logos y contenido visual de alta calidad basado en IA."},
{name:"Photoroom",cat:"diseno",icon:"📸",url:"https://www.photoroom.com/es",desc:"Editor de fotos con IA para ecommerce: fondos, sombras y edición de productos automática. Plan gratis."},

{name:"Grammarly",cat:"seo",icon:"✅",url:"https://www.grammarly.com/",isNew:true,desc:"Corrige gramática, ortografía y estilo en tiempo real. La IA de escritura más usada del mundo. Plan gratis."},
{name:"QuillBot",cat:"seo",icon:"🔁",url:"https://quillbot.com/",isNew:true,desc:"Parafrasea, resume y mejora tus textos con IA. Perfecto para estudiantes y escritores. Plan gratuito."},
{name:"Hemingway Editor",cat:"seo",icon:"📖",url:"https://hemingwayapp.com/",isNew:true,desc:"Analiza tu texto y sugiere mejoras para hacerlo más claro y conciso. Completamente gratuito online."},
{name:"Wordtune",cat:"seo",icon:"📝",url:"https://www.wordtune.com/",isNew:true,desc:"Reescribe y mejora tus textos con IA manteniendo tu voz y significado original. Plan gratuito."},
{name:"Rytr",cat:"seo",icon:"🖊️",url:"https://rytr.me/",isNew:true,desc:"Genera contenido de marketing, emails y posts con IA. Plan gratis con 10.000 caracteres al mes."},
{name:"Surfer SEO",cat:"seo",icon:"🏄",url:"https://surferseo.com/",isNew:true,desc:"Optimiza tu contenido para Google con sugerencias de IA basadas en análisis de la competencia."},
{name:"Hypertype",cat:"seo",icon:"⌨️",url:"https://chrome.google.com/webstore/detail/hypertype/lohojfppjeknalbohjdohecfnoikeb/related",desc:"Extrae las frases más relevantes de noticias, emails y documentos automáticamente."},
{name:"Writesonic",cat:"seo",icon:"🖋️",url:"https://writesonic.com/",isNew:true,desc:"Genera artículos SEO, ads y copys con IA en segundos. Incluye acceso a internet. Plan gratuito."},

{name:"Luma AI (3D)",cat:"3d",icon:"🧊",url:"https://captures.lumalabs.ai/imagine",desc:"Genera modelos 3D e imágenes cinematográficas desde texto o imágenes con IA avanzada."},
{name:"Ready Player Me",cat:"3d",icon:"🎮",url:"https://readyplayer.me/",isNew:true,desc:"Crea tu avatar 3D personalizable para usar en juegos, apps del metaverso y mundos virtuales. Gratis."},
{name:"D-ID",cat:"3d",icon:"🎥",url:"https://www.d-id.com/",isNew:true,desc:"Anima fotos y crea vídeos de avatares que hablan con IA y tu propio guion. Plan gratuito con créditos."},
{name:"Inworld AI",cat:"3d",icon:"🧑‍🎤",url:"https://inworld.ai/",desc:"Crea personajes virtuales con IA y personalidad propia. Ideal para videojuegos y experiencias interactivas."},
{name:"Union Avatars",cat:"3d",icon:"👤",url:"https://unionavatars.com/",desc:"Crea tu doble digital con pocos datos. Avatar 3D realista para el metaverso y presentaciones."},
{name:"Replika",cat:"3d",icon:"🤝",url:"https://my.replika.com/",desc:"Tu compañero de IA. Habla, comparte y evoluciona junto a tu avatar digital completamente personalizable."},
{name:"Creator Aitubo",cat:"3d",icon:"🎭",url:"https://creator.aitubo.ai/",desc:"Crea personajes virtuales muy detallados a partir de una descripción de texto. Plan gratuito."},

{name:"Kidix IA WhatsApp",cat:"wa",icon:"📱",url:"https://kidix.ai/",desc:"Bot de inteligencia artificial para WhatsApp. Responde preguntas directamente en el chat."},
{name:"Luz IA WhatsApp",cat:"wa",icon:"💡",url:"https://soyluzia.com/",desc:"Asistente IA en WhatsApp para ayudarte con tareas cotidianas directamente desde el móvil."},
{name:"Ariana (ChatGPT-4 WA)",cat:"wa",icon:"🤖",url:"https://www.timworks.com/ariana",desc:"ChatGPT 4 integrado en WhatsApp vía Ariana. Chatea con la IA de forma natural y gratuita."},
{name:"Meta AI en WhatsApp",cat:"wa",icon:"💬",url:"https://www.meta.ai/",isNew:true,desc:"El asistente de Meta integrado directamente en WhatsApp. Completamente gratis para todos los usuarios."},
{name:"ChatGPT Friend (Chrome)",cat:"wa",icon:"✨",url:"https://chrome.google.com/webstore/detail/chatgpt-friend/mlkjjjmhjijlmafgjlpkiobpdocdbncj",desc:"Bot ChatGPT accesible desde Chrome para usar en servicios de mensajería directamente."},

{name:"NopeCHA",cat:"otros",icon:"🔓",url:"https://nopecha.com/",desc:"Resuelve los Captcha automáticamente sin intervención manual. Extensión para Chrome."},
{name:"Spacedesk",cat:"otros",icon:"🖥️",url:"https://www.spacedesk.net/#download",desc:"Convierte tu móvil en un monitor extra para tu PC. Instala en ambos y conéctalos vía WiFi."},
{name:"Perplexity Spaces",cat:"otros",icon:"🔭",url:"https://www.perplexity.ai/spaces",isNew:true,desc:"Crea espacios de investigación colaborativos con IA. Comparte fuentes y análisis con tu equipo."},
{name:"Liner AI",cat:"otros",icon:"🖊️",url:"https://getliner.com/",isNew:true,desc:"Resalta y resume páginas web, PDFs y vídeos de YouTube con IA. Extensión gratuita para Chrome."},
{name:"Fake Detail",cat:"otros",icon:"💬",url:"https://fakedetail.com/",desc:"Genera y edita chats falsos para simular conversaciones. Para fines creativos y de entretenimiento."},
{name:"La Calculadora de Alicia",cat:"otros",icon:"🧮",url:"http://lacalculadoradealicia.es/",desc:"Calculadora que muestra los pasos de cada operación de forma detallada. Aprende mientras calculas."},
{name:"Conch AI (Chrome)",cat:"otros",icon:"🐚",url:"https://chrome.google.com/webstore/detail/conch-ai/namibaeakmnknolcnomfdhklhkabkchl?hl=ca",desc:"Asistente IA para Chrome que termina tus textos y código en cualquier página web."},
{name:"Apowersoft",cat:"otros",icon:"📱",url:"https://www.apowersoft.es/",desc:"Suite multimedia con IA para grabación, edición y conversión de archivos en tu dispositivo."},
{name:"Google IO IA",cat:"otros",icon:"🌐",url:"https://io.google/2023/",desc:"Portal oficial de Google con todas sus herramientas e innovaciones de IA presentadas en Google IO."},
];

const totalTools=TOOLS.length;
const totalCats=Object.keys(CAT_LABELS).length;
document.getElementById("stat-total").textContent=totalTools;
document.getElementById("stat-showing").textContent=totalTools;
document.getElementById("stat-cats").textContent=totalCats;

let activeFilter="all",searchTerm="";

function getDomain(u){try{return new URL(u).hostname.replace("www.","")}catch{return u}}

function renderCards(){
  const container=document.getElementById("grid-container");
  const noResults=document.getElementById("no-results");
  const filtered=TOOLS.filter(t=>{
    const mc=activeFilter==="all"||t.cat===activeFilter;
    const ms=!searchTerm||t.name.toLowerCase().includes(searchTerm)||t.desc.toLowerCase().includes(searchTerm)||CAT_LABELS[t.cat].toLowerCase().includes(searchTerm);
    return mc&&ms;
  });
  document.getElementById("stat-showing").textContent=filtered.length;
  if(!filtered.length){container.innerHTML="";noResults.style.display="block";return}
  noResults.style.display="none";
  const groups={};
  filtered.forEach(t=>{if(!groups[t.cat])groups[t.cat]=[];groups[t.cat].push(t)});
  let html="";
  Object.entries(groups).forEach(([cat,tools])=>{
    html+=`<div class="section-header"><span class="section-label">${CAT_LABELS[cat]}</span><span class="section-line"></span><span class="section-count">${tools.length}</span></div><div class="grid">`;
    tools.forEach((t,i)=>{
      const nb=t.isNew?`<span class="badge-new">Nuevo</span>`:"";
      html+=`<a class="card cat-${t.cat}" href="${t.url}" target="_blank" rel="noopener noreferrer" style="animation-delay:${i*30}ms"><div class="card-head"><div class="card-icon icon-${t.cat}">${t.icon}</div><div class="card-meta"><div class="card-title">${t.name}${nb}</div><span class="card-tag tag-${t.cat}">${CAT_LABELS[t.cat].replace(/^\S+ /,"")}</span></div></div><p class="card-desc">${t.desc}</p><div class="card-footer"><span class="card-url">${getDomain(t.url)}</span><span class="card-btn">Abrir →</span></div></a>`;
    });
    html+=`</div>`;
  });
  container.innerHTML=html;
}

document.querySelectorAll(".filter-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".filter-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter=btn.dataset.cat;
    renderCards();
  });
});

document.getElementById("search").addEventListener("input",e=>{
  searchTerm=e.target.value.toLowerCase().trim();
  renderCards();
});

renderCards();
</script>
</body>
</html>
`;

export default function IAPage() {
    return (
        <div style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
            <iframe
                srcDoc={htmlContent}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Ultra IA Directory"
            />
        </div>
    );
}
