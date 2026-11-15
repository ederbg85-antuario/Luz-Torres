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
  "lucide-react": { ArrowUpRight: "icon", KeyRound: "icon" },
  "./SearchBar": { SearchBar: "search" },
  "./HomeMotion": { MotionToggle: "motion-toggle" },
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
const nodes = (node) => Array.isArray(node) ? node.flatMap(nodes)
  : node && typeof node === "object" ? [node, ...nodes(node.props?.children)] : [];

test("la portada invita a contactar a Luz sin anunciar un inmueble arbitrario", () => {
  const hero = module.exports.Hero();
  const links = nodes(hero).filter((node) => node.type === "a");
  assert.ok(links.some((link) => link.props.href === "/contacto" && /Cuéntale a Luz/.test(text(link))));
  assert.ok(!links.some((link) => link.props.href.startsWith("/propiedades/")));
  assert.doesNotMatch(text(hero), /Polanco|Propiedad en venta|Propiedad en renta|\$\d/);
});

test("el retrato principal de Luz con llaves se mantiene incluso sin inmuebles", () => {
  const images = nodes(module.exports.Hero()).filter((n) => n.type === "img");
  assert.equal(images[0].props.src, "/luz-keys.jpg");
  assert.match(images[0].props.alt, /Luz Torres.*llaves/);
  assert.equal(images[0].props.priority, true);
  assert.equal(images.length, 1);
});
