"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { flushMetaEvents, trackMetaEvent } from "@/lib/meta";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/** Carga el píxel solamente en el sitio público, nunca en el panel. */
export function MetaPixel() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    trackMetaEvent("PageView", { page_path: pathname }, crypto.randomUUID());
  }, [pathname]);

  if (!PIXEL_ID) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive" onReady={flushMetaEvents}>
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');`}
    </Script>
  );
}
