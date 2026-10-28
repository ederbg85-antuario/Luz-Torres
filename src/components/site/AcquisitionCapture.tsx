"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { captureAcquisition } from "@/lib/acquisition-browser";

/** First-party CRM metadata only: no requests, dataLayer, identity or extra page_view. */
export function AcquisitionCapture() {
  const path = usePathname();
  const entered = useRef(false);
  useEffect(() => {
    captureAcquisition(!entered.current);
    entered.current = true;
  }, [path]);
  return null;
}
