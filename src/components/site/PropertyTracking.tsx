"use client";

import { useEffect } from "react";
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
  useEffect(() => {
    const params = {
      content_ids: [id],
      content_name: title,
      content_type: "product",
      value: price,
      currency: "MXN",
      operation,
    };
    pushEvent("view_property", params);
    trackMetaEvent("ViewContent", params);
  }, [id, operation, price, title]);

  return null;
}
