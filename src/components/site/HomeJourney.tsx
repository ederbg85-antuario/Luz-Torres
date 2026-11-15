import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";

export function HomeJourney() {
  return (
    <section
      className="home-journey home-editorial-container"
      data-motion-scene
    >
      <div className="journey-portrait">
        <Image
          src="/luz-outdoor.jpg"
          alt="Luz Torres, asesora inmobiliaria"
          fill
          sizes="(max-width: 767px) calc(100vw - 48px), 42vw"
          className="object-cover object-top"
        />
        <svg
          className="journey-flower motion-loop"
          viewBox="0 0 180 180"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M90 10C130 10 98 65 90 90C115 65 170 50 170 90C170 130 115 98 90 90C115 115 130 170 90 170C50 170 82 115 90 90C65 115 10 130 10 90C10 50 65 82 90 90C65 65 50 10 90 10Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        <span className="journey-caption">
          Una persona. De principio a fin.
        </span>
      </div>
      <div className="journey-story">
        <Reveal>
          <p className="home-kicker">Hola, soy Luz.</p>
          <h2 className="home-display">
            Tu propiedad importa.
            <br />
            <em>Tu tranquilidad, también.</em>
          </h2>
          <p className="journey-intro">
            Comprar o vender una propiedad es una decisión importante. Estoy
            aquí para escucharte, resolver tus dudas y acompañarte en el
            proceso.
          </p>
          <Link href="/sobre-luz" className="home-inline-cta">
            Conoce a tu asesora <ArrowUpRight size={19} aria-hidden="true" />
          </Link>
        </Reveal>
        <div className="journey-owner">
          <span className="journey-owner-icon motion-loop" aria-hidden="true">
            ↗
          </span>
          <div>
            <h3>¿Es momento de vender?</h3>
            <p>Hablemos de tu propiedad y del siguiente paso.</p>
            <Link href="/vende-tu-propiedad">
              Quiero vender mi propiedad{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
