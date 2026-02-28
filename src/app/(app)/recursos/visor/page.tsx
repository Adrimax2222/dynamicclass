"use client";

export default function VisorPage() {
  return (
    <div className="w-full h-[calc(100vh-4rem)]">
      <iframe
        src="/recursos/guia.html"
        className="w-full h-full border-0"
        title="Guía de Recursos para Estudiantes"
      />
    </div>
  );
}
