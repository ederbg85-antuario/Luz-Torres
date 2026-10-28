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
    const eventId = crypto.randomUUID();
    pushEvent("view_property", {
      event_id: eventId,
      property_id: id,
      property_title: title,
      operation,
      property_price: price,
      currency: "MXN",
    });
    // Meta ViewContent describe el inventario; value aquí no es valor de lead.
    trackMetaEvent("ViewContent", {
      content_ids: [id],
      content_name: title,
      content_type: "product",
      value: price,
      currency: "MXN",
      operation,
    }, eventId);
  }, [id, operation, price, title]);

  return null;
}
