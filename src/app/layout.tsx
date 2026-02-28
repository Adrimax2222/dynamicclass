
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from './providers';

const logoSvgDataUri = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 375 375'%3e%3cpath fill='%235170ff' d='M332.33 140.15C316.1 80.38 267 44.7 200.98 44.7H37.5l3.23 7.4c13.85 31.75 45.2 52.28 79.86 52.29h44.51l.37-.01c1.7-.12 7.94-.5 17.32-.5 8.98 0 18.17.35 27.24 1.05l.9.06c34.73 2.74 82.31 11.82 111.72 39.5l.37.36c.16.14.31.28.46.43l14 13.93zM336.8 209.03l-.03.58c-8.84 74.47-61.43 120.73-137.26 120.73H95.23V189.34h5.27c30.54 0 55.38 24.84 55.38 55.37v24.97h46.19c22.75 0 41.9-7.48 55.4-21.61 13.74-14.39 21-35.18 21-50.13v-.86c0-19.32-4.25-35.98-12.63-49.52l-7.82-12.64 14.05 4.88c17.42 6.04 31.55 14.1 41.99 23.94 15.27 14.38 22.92 32.98 22.74 55.29z'/%3e%3c/svg%3e";

export const metadata: Metadata = {
  title: 'Dynamic Class',
  description: '¡Revoluciona tu vida académica con Dynamic Class! ¿Cansado de hacer malabares con horarios, fechas de exámenes y apuntes desordenados? Dynamic Class es tu asistente educativo personal todo en uno. Organiza tu horario de clases y sincroniza tu calendario personal con el del instituto. Toma apuntes al instante. Recibe anuncios importantes y mantente siempre informado. ¿Atascado con una duda? Nuestro potente chatbot de IA, "ADRIMAX", está disponible 24/7 para ayudarte a entender cualquier concepto. Además, gana trofeos, sube en el ranking de tu centro y mantén la motivación al máximo. Con una interfaz moderna, segura y personalizable, Dynamic Class es la herramienta definitiva para el estudiante de hoy. ¡Descarga y transforma tu manera de aprender!',
  icons: {
    icon: logoSvgDataUri,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased')}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
