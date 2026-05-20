import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-hueso px-6 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-3 font-serif text-5xl text-petroleo">
        Esta página no existe.
      </h1>
      <p className="mt-4 max-w-md text-humo">
        Puede que el enlace haya cambiado o la propiedad ya no esté publicada.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Volver al inicio
      </Link>
    </div>
  );
}
