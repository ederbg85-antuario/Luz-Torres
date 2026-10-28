import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cache = new Map();

// Load the real editorial and label modules without env or network access.
function loadTs(relativePath) {
  const filename = resolve(root, relativePath);
  if (cache.has(filename)) return cache.get(filename);
  if (filename.endsWith(".json")) {
    const value = JSON.parse(readFileSync(filename, "utf8"));
    cache.set(filename, value);
    return value;
  }
  const module = { exports: {} };
  cache.set(filename, module.exports);
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  vm.runInNewContext(source, {
    module,
    exports: module.exports,
    require: (name) => {
      if (name === "./supabase/config") return { SITE_URL: "https://luztorres.com" };
      if (name.startsWith(".")) {
        const path = resolve(dirname(filename), name);
        const dependency = [path, `${path}.ts`, `${path}.json`].find(existsSync);
        if (dependency) return loadTs(dependency);
      }
      throw new Error(`Unexpected dependency: ${name}`);
    },
  }, { filename });
  return module.exports;
}

const { localSalesContent } = loadTs("src/lib/local-sales-content.ts");
const descriptor = (extra = {}) => ({
  operation: "venta", level: "operation", path: "/propiedades/venta", ...extra,
});
const property = (extra = {}) => ({
  property_type: "departamento", estado: "Ciudad de México", municipio: "Álvaro Obregón",
  colonia: "Los Alpes", ...extra,
});

test("a sale hub describes only its published types and locations", () => {
  const result = localSalesContent(descriptor(), [
    property(), property({ property_type: "bodega", estado: "Estado de México" }),
  ]);
  assert.match(result.intro, /2 propiedades publicadas en venta/);
  assert.match(result.intro, /bodegas y departamentos/);
  assert.match(result.intro, /Ciudad de México y Estado de México/);
  assert.doesNotMatch(result.intro, /casas|oficinas|terrenos/);
  assert.doesNotMatch(result.intro, /disponibles|garantizada|completa/);
});

test("rent pages explain rental requirements rather than purchase conditions", () => {
  const result = localSalesContent(descriptor({ operation: "renta" }), [property()]);
  assert.match(result.intro, /1 propiedad publicada en renta: departamento/);
  assert.match(result.details, /requisitos del arrendamiento/);
  assert.doesNotMatch(result.details, /compra|crédito|escrituración/);
  assert.match(result.details, /no confirma una cita/);
});

test("state and municipality pages distinguish their actual geographic scopes", () => {
  const properties = [property(), property({ municipio: "Benito Juárez", colonia: "Del Valle Sur" })];
  const state = localSalesContent(descriptor({
    type: "departamento", level: "estado", estado: "Ciudad de México",
  }), properties);
  assert.match(state.intro, /2 departamentos publicados/);
  assert.match(state.intro, /Álvaro Obregón y Benito Juárez/);
  assert.doesNotMatch(state.intro, /Los Alpes/);
  const municipality = localSalesContent(descriptor({
    type: "departamento", level: "municipio", municipio: "Álvaro Obregón",
  }), [property()]);
  assert.match(municipality.intro, /1 departamento publicado en venta en Álvaro Obregón/);
  assert.match(municipality.intro, /colonia publicada es Los Alpes/);
  assert.doesNotMatch(municipality.intro, /Benito Juárez|Del Valle/);
});

test("buyer checklists ask for evidence without asserting disputed property features", () => {
  const department = localSalesContent(descriptor({ type: "departamento", level: "type" }), [property()]);
  assert.match(department.details, /Pregunta qué superficie es interior/);
  assert.doesNotMatch(department.details, /68|9 m|balcón privado|incluido|incluye un/);
  const house = localSalesContent(descriptor({ type: "casa", level: "type" }), [property({ property_type: "casa" })]);
  assert.match(house.intro, /1 casa publicada/);
  assert.match(house.details, /Distingue terreno y construcción/);
  assert.doesNotMatch(house.details, /3 rec|2.5|112|un nivel/);
  const warehouse = localSalesContent(descriptor({ type: "bodega", level: "type" }), [property({ property_type: "bodega" })]);
  assert.match(warehouse.details, /altura útil/);
  assert.doesNotMatch(warehouse.details, /recámaras|balcón|6.55|autorización garantizada/);
});

test("editorial follows inventory changes and omits empty locations without inventing coverage", () => {
  const category = descriptor({ type: "local", level: "type" });
  const first = localSalesContent(category, [property({ property_type: "local", estado: "" })]);
  assert.match(first.intro, /1 local comercial publicado/);
  assert.doesNotMatch(first.intro, /México|undefined|null/);
  const later = localSalesContent(category, [
    property({ property_type: "local" }), property({ property_type: "local", estado: "Hidalgo" }),
  ]);
  assert.match(later.intro, /2 locales comerciales publicados/);
  assert.match(later.intro, /Hidalgo/);
  assert.equal(localSalesContent(category, []), null);
});

test("category metadata uses singular labels and rental intent without adding absent types or price claims", () => {
  const { categoryMetadata } = loadTs("src/lib/seo.ts");
  const rent = categoryMetadata(descriptor({
    operation: "renta", path: "/propiedades/renta", heading: "Propiedades en renta",
  }), 1, 50_000);
  assert.match(rent.description, /^1 propiedad en renta\./);
  assert.match(rent.description, /requisitos de renta/);
  assert.doesNotMatch(rent.description, /casas|compra|50,000|completo|sin compromiso|Agenda/);
  const house = categoryMetadata(descriptor({
    type: "casa", level: "municipio", municipio: "Huasca de Ocampo",
    path: "/propiedades/venta/casas/huasca-de-ocampo", heading: "Casas en venta en Huasca de Ocampo",
  }), 1, 2_350_000);
  assert.match(house.description, /^1 casa en venta en Huasca de Ocampo\./);
  assert.equal(house.openGraph.description, house.description);
  assert.equal(house.alternates.canonical, "/propiedades/venta/casas/huasca-de-ocampo");
});
