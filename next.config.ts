
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            // Solo redirigir si el usuario entra por el enlace feo de Google
            value: 'studio--studio-7840988595-13b35.us-central1.hosted.app',
          },
        ],
        destination: 'https://dynamicclass.app/:path*',
        permanent: true,
      },
    ]
  },
  // Mantén el resto de tu configuración igual (typescript, eslint, images...)
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      { protocol: 'https', hostname: 'dejardines.com' },
      { protocol: 'https', hostname: 'kuali.com.mx' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
      { protocol: 'https', hostname: 'www.tannins.org' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'vivergil.es' },
      { protocol: 'https', hostname: 'mamabruja.com' },
      { protocol: 'https', hostname: 'framerusercontent.com' },
      { protocol: 'https', hostname: 'media.admagazine.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'content.nationalgeographic.com.es' },
      { protocol: 'https', hostname: 'ichef.bbci.co.uk' },
      { protocol: 'https', hostname: 'i.natgeofe.com' },
      { protocol: 'https', hostname: 'www.biopedia.com' },
      { protocol: 'https', hostname: 'aquanerd.com' },
      { protocol: 'https', hostname: 'www.ecologiaverde.com' },
      { protocol: 'https', hostname: 'www.aquariumcostadealmeria.com' },
      { protocol: 'https', hostname: 'www.comunidadacuario.com' },
      { protocol: 'https', hostname: 'www.australiangeographic.com.au' },
      { protocol: 'https', hostname: 'www.infobae.com' },
      { protocol: 'https', hostname: 'www.maldives-villahotels.com' },
      { protocol: 'https', hostname: 't2.uc.ltmcdn.com' },
      { protocol: 'https', hostname: 'cdn0.expertoanimal.com' },
      { protocol: 'https', hostname: 'nubika.es' },
      { protocol: 'https', hostname: 'cdn.nubika.es' },
      { protocol: 'https', hostname: 'palmaaquarium.com' },
      { protocol: 'https', hostname: 'media.es.wired.com' },
      { protocol: 'https', hostname: 'e01-phantom-elmundo.uecdn.es' },
    ],
  },
};

export default nextConfig;

    