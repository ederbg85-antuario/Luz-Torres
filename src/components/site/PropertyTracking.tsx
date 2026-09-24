"use client";

import { useEffect, useRef } from "react";
import { pushEvent } from "@/lib/gtm";
import { trackMetaEvent } from "@/lib/meta";

export function PropertyTracking({
  id,
  title,
  price,
  operation,
}: {
  id: string;
  title: string;
  price: number;
  operation: string;
}) {
  const lastProperty = useRef<string | null>(null);
  useEffect(() => {
    if (lastProperty.current === id) return;
    lastProperty.current = id;
    const params = {
      content_ids: [id],
      content_name: title,
      content_type: "product",
      value: price,
      currency: "MXN",
      operation,
    };
    pushEvent("view_property", params);
    trackMetaEvent("ViewContent", params, crypto.randomUUID());
  }, [id, operation, price, title]);

  return null;
}
