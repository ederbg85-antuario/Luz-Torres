import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Renderiza el componente real como árbol JSX aislado, sin red ni Next runtime.
const module = { exports: {} };
const jsx = (type, props) => ({ type, props });
const mocks = {
  "react/jsx-runtime": { jsx, jsxs: jsx },
  "next/image": { default: "img", __esModule: true },
  "next/link": { default: "a", __esModule: true },
  "lucide-react": { ArrowUpRight: "icon", MapPin: "icon" },
  "@/lib/format": { formatPrice: (price) => `$${price}` },
  "./SearchBar": { SearchBar: "search" },
  "@/lib/property-media": { propertyCover: () => null, propertyImageAlt: () => "" },
};
vm.runInNewContext(ts.transpileModule(
  readFileSync(new URL("../src/components/site/Hero.tsx", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } },
).outputText, {
  module, exports: module.exports,
  require: (name) => {
    assert.ok(Object.hasOwn(mocks, name), `Import inesperado: ${name}`);
    return mocks[name];
  },
});
const text = (node) => Array.isArray(node)
  ? node.map(text).join("")
  : node && typeof node === "object"
    ? text(node.props?.children)
    : typeof node === "string" || typeof node === "number" ? String(node) : "";
const paragraphs = (node) => Array.isArray(node)
  ? node.flatMap(paragraphs)
  : node && typeof node === "object"
    ? [...(node.type === "p" ? [text(node)] : []), ...paragraphs(node.props?.children)]
    : [];

for (const mainOperation of ["venta", "renta"]) {
  for (const secondaryOperation of ["venta", "renta"]) {
    test(`Hero respeta operación y mensualidad: principal ${mainOperation}, secundaria ${secondaryOperation}`, () => {
      const properties = [mainOperation, secondaryOperation].map((operation, i) => ({
        id: String(i), slug: `fixture-${i}`, title: "Fixture", colonia: "Centro", operation,
        price: i === 0 ? 100 : 200,
      }));
      const lines = paragraphs(module.exports.Hero({ properties }));
      assert.ok(lines.includes(`También en ${secondaryOperation}`));
      assert.ok(lines.includes(`$100${mainOperation === "renta" ? " /mes" : ""}`));
      assert.ok(lines.includes(`$200${secondaryOperation === "renta" ? " /mes" : ""}`));
    });
  }
}
