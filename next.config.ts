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
    ],
  },
};

export default nextConfig;