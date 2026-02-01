import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // Esta regla captura TODO lo que NO sea tu dominio oficial
        source: '/:path*',
        has: [
          {
            type: 'host',
            // Si el valor NO es dynamicclass.app (importante el NOT aquí)
            value: '(?<host>^(?!dynamicclass\\.app$).*)', 
          },
        ],
        destination: 'https://dynamicclass.app/:path*',
        permanent: true,
      },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
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