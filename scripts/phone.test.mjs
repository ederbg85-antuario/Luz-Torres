import test from "node:test";
import assert from "node:assert/strict";
import { formatMexicanWhatsApp, mexicanNationalNumber } from "../src/lib/phone.ts";
import {
  listingKeyFromSlug,
  propertyWhatsAppMessage,
} from "../src/lib/whatsapp-message.ts";

test("acepta un celular mexicano de 10 dígitos y el prefijo +52", () => {
  assert.equal(mexicanNationalNumber("56 5669 9894"), "5656699894");
  assert.equal(mexicanNationalNumber("+52 56 5669 9894"), "5656699894");
  assert.equal(mexicanNationalNumber("525656699894"), "5656699894");
  assert.equal(formatMexicanWhatsApp("(55) 1234-5678"), "+525512345678");
  assert.equal(formatMexicanWhatsApp("+521 56 5669 9894"), "+525656699894");
});

test("rechaza números que no son un WhatsApp mexicano de 10 dígitos", () => {
  assert.equal(formatMexicanWhatsApp("12345"), null);
  assert.equal(formatMexicanWhatsApp("+1 415 555 2671"), null);
  assert.equal(formatMexicanWhatsApp("0123456789"), null);
  assert.equal(formatMexicanWhatsApp(""), null);
});

test("el mensaje de WhatsApp identifica título, clave y URL", () => {
  assert.equal(
    listingKeyFromSlug("casa-venta-bonito-el-manzano-chicoloapan-iho8356137"),
    "IHO8356137",
  );
  assert.equal(listingKeyFromSlug("departamento-venta-del-valle-cdmx"), null);
  const message = propertyWhatsAppMessage(
    {
      title: "Casa en venta en Bonito El Manzano, Chicoloapan",
      slug: "casa-venta-bonito-el-manzano-chicoloapan-iho8356137",
    },
    "https://luztorres.com",
  );
  assert.match(message, /^Hola Luz, me interesa la propiedad: Casa en venta en Bonito El Manzano, Chicoloapan \(/);
  assert.match(message, /IHO8356137/);
  assert.match(message, /\/propiedades\/casa-venta-bonito-el-manzano-chicoloapan-iho8356137\)/);
});
