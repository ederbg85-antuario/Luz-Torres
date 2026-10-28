import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteUrl = "https://luztorres.com";

// Ejecuta los módulos reales con clientes sustituidos; ninguna prueba carga env
// ni abre conexiones. Los imports no previstos fallan en vez de usar producción.
function loadTs(relativePath, mocks = {}, cache = new Map()) {
  const filename = resolve(root, relativePath);
  if (cache.has(filename)) return cache.get(filename);
  if (filename.endsWith(".json")) {
    const data = JSON.parse(readFileSync(filename, "utf8"));
    cache.set(filename, data);
    return data;
  }
  const module = { exports: {} };
  cache.set(filename, module.exports);
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText;
  const requireMock = (name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name === "server-only") return {};
    if (name.endsWith("supabase/config")) return { SITE_URL: siteUrl };
    if (name === "react/jsx-runtime") {
      return { jsx: () => null, jsxs: () => null, Fragment: "fragment" };
    }
    const base = name.startsWith("@/")
      ? join(root, "src", name.slice(2))
      : name.startsWith(".")
        ? resolve(dirname(filename), name)
        : null;
    if (base) {
      const dependency = [base, `${base}.ts`, `${base}.tsx`].find(existsSync);
      if (dependency) return loadTs(dependency, mocks, cache);
    }
    throw new Error(`Import sin sustituto de prueba: ${name}`);
  };
  vm.runInNewContext(source, {
    require: requireMock,
    module,
    exports: module.exports,
    URL,
  }, { filename });
  return module.exports;
}

const property = (id, extra = {}) => ({
  id,
  slug: `propiedad-${id}`,
  title: `Casa de prueba ${id}`,
  description: "Fixture aislado; nunca se envía a producción.",
  operation: "venta",
  property_type: "casa",
  status: "disponible",
  price: 2_000_000,
  currency: "MXN",
  estado: "Hidalgo",
  municipio: "Pachuca de Soto",
  colonia: "Centro",
  direccion: "",
  bedrooms: 2,
  bathrooms: 2,
  parking: 1,
  area_m2: 100,
  lot_m2: 120,
  amenities: [],
  images: [],
  cover_image: null,
  featured: false,
  lat: null,
  lng: null,
  created_at: "2026-07-13T00:00:00Z",
  updated_at: "2026-07-15T00:00:00Z",
  ...extra,
});

function queryBuilder(respond) {
  const state = { operation: "select", filters: [], columns: "*", single: false };
  const query = {
    select(columns) { state.columns = columns; return query; },
    eq(key, value) { state.filters.push([key, value]); return query; },
    neq() { return query; },
    gte() { return query; },
    lte() { return query; },
    or() { return query; },
    order() { return query; },
    limit() { return query; },
    insert(row) { state.operation = "insert"; state.row = row; return query; },
    update(row) { state.operation = "update"; state.row = row; return query; },
    delete() { state.operation = "delete"; return query; },
    maybeSingle() { state.single = true; return query; },
    single() { state.single = true; return query; },
    then(onFulfilled, onRejected) {
      return Promise.resolve().then(() => respond(state)).then(onFulfilled, onRejected);
    },
  };
  return query;
}

function dataModule(respond, configured = true) {
  return loadTs("src/lib/data.ts", {
    "./supabase/public": {
      isSupabaseConfigured: () => configured,
      createSupabasePublicClient: () => ({
        from: (table) => {
          assert.equal(table, "properties");
          return queryBuilder(respond);
        },
      }),
    },
  });
}

const publicCalls = (data) => [
  () => data.getFeaturedProperties(),
  () => data.getProperties(),
  () => data.getPropertyBySlug("no-existe"),
  () => data.getRelatedProperties(property("actual")),
  () => data.getFilterOptions(),
  () => data.getSeoIndex(),
  () => data.getPropertySlugs(),
];

test("una caída del proveedor nunca se convierte en vacío o ficha inexistente", async () => {
  for (const respond of [
    () => ({ data: null, error: { message: "detalle privado del proveedor" } }),
    () => { throw new Error("detalle privado de transporte"); },
  ]) {
    const data = dataModule(respond);
    for (const call of publicCalls(data)) {
      await assert.rejects(call, (error) =>
        error.name === "PublicInventoryUnavailableError" &&
        !error.message.includes("privado")
      );
    }
  }
});

test("sin configuración los lectores fallan; una respuesta nula de lista no simula inventario vacío", async () => {
  const unconfigured = dataModule(() => { throw new Error("no debe consultarse"); }, false);
  for (const call of publicCalls(unconfigured)) {
    await assert.rejects(call, { name: "PublicInventoryUnavailableError" });
  }
  const malformed = dataModule(() => ({ data: null, error: null }));
  await assert.rejects(() => malformed.getSeoIndex(), { name: "PublicInventoryUnavailableError" });
});

test("una consulta exitosa sin filas conserva el vacío y el null legítimos", async () => {
  const data = dataModule(({ single }) => ({ data: single ? null : [], error: null }));
  assert.equal((await data.getProperties()).length, 0);
  assert.equal((await data.getFeaturedProperties()).length, 0);
  assert.equal((await data.getRelatedProperties(property("actual"))).length, 0);
  assert.equal((await data.getSeoIndex()).length, 0);
  assert.equal((await data.getPropertySlugs()).length, 0);
  assert.equal((await data.getFilterOptions()).estados.length, 0);
  assert.equal(await data.getPropertyBySlug("no-existe"), null);
});

function categoryEnvironment(initial) {
  let inventory = initial;
  let failIndex = false;
  let failProperties = false;
  let disappear = false;
  const data = {
    getSeoIndex: async () => {
      if (failIndex) throw new Error("proveedor no disponible");
      return inventory;
    },
    getProperties: async (filters) => {
      if (failProperties) throw new Error("proveedor no disponible");
      if (disappear) return [];
      return inventory.filter((p) => Object.entries(filters).every(([key, value]) =>
        value === undefined || p[key] === value
      ));
    },
  };
  const loader = loadTs("src/lib/category-loader.ts", { "./data": data });
  return {
    data,
    loader,
    setInventory: (rows) => { inventory = rows; },
    failIndex: () => { failIndex = true; },
    failProperties: () => { failProperties = true; },
    disappear: () => { disappear = true; },
  };
}

test("la categoría nueva se resuelve aunque no existiera al precalentar parámetros", async () => {
  const env = categoryEnvironment([property("inicial")]);
  const page = loadTs("src/app/(site)/propiedades/venta/[type]/[ubicacion]/page.tsx", {
    "@/lib/data": env.data,
    "@/lib/category-loader": env.loader,
    "@/components/site/CategoryView": { CategoryView: () => null },
    "next/navigation": { notFound: () => { throw new Error("404"); } },
  });
  const before = await page.generateStaticParams();
  assert.equal(before.some((p) => p.ubicacion === "tulancingo-de-bravo"), false);
  env.setInventory([
    property("inicial"),
    property("nueva", { municipio: "Tulancingo de Bravo", price: 1_500_000 }),
  ]);
  const category = await env.loader.loadCategory({
    operation: "venta", typeSlug: "casas", ubicacionSlug: "tulancingo-de-bravo",
  });
  assert.equal(category.properties[0].id, "nueva");
  assert.equal(category.minPrice, 1_500_000);
  const metadata = await page.generateMetadata({
    params: Promise.resolve({ type: "casas", ubicacion: "tulancingo-de-bravo" }),
  });
  assert.equal(metadata.alternates.canonical, "/propiedades/venta/casas/tulancingo-de-bravo");
  assert.equal(page.dynamicParams, true);
  assert.equal(page.revalidate, 300);
});

test("el loader distingue combinación inexistente, baja real y error del proveedor", async () => {
  const env = categoryEnvironment([property("actual")]);
  const parts = { operation: "venta", typeSlug: "casas", ubicacionSlug: "pachuca-de-soto" };
  assert.equal(await env.loader.loadCategory({ ...parts, ubicacionSlug: "inventado" }), null);
  env.disappear();
  assert.equal(await env.loader.loadCategory(parts), null);

  const indexFailure = categoryEnvironment([property("actual")]);
  indexFailure.failIndex();
  await assert.rejects(() => indexFailure.loader.loadCategory(parts), /proveedor/);
  const propertyFailure = categoryEnvironment([property("actual")]);
  propertyFailure.failProperties();
  await assert.rejects(() => propertyFailure.loader.loadCategory(parts), /proveedor/);
});

test("las seis rutas de categoría permiten inventario nuevo y revalidan a 300 segundos", () => {
  for (const operation of ["venta", "renta"]) {
    for (const suffix of ["page.tsx", "[type]/page.tsx", "[type]/[ubicacion]/page.tsx"]) {
      const route = loadTs(`src/app/(site)/propiedades/${operation}/${suffix}`, {
        "@/lib/data": { getSeoIndex: async () => [] },
        "@/lib/category-loader": { loadCategory: async () => null },
        "@/components/site/CategoryView": { CategoryView: () => null },
        "next/navigation": { notFound: () => { throw new Error("404"); } },
      });
      assert.equal(route.dynamicParams, true, `${operation}/${suffix}`);
      assert.equal(route.revalidate, 300, `${operation}/${suffix}`);
    }
  }
});

function actionEnvironment(mode = "success", signedIn = true) {
  const invalidations = [];
  const writes = [];
  const client = {
    auth: { getUser: async () => ({ data: { user: signedIn ? { id: "equipo-fixture" } : null } }) },
    from: () => queryBuilder((request) => {
      if (request.operation === "select") {
        return mode === "slug-error"
          ? { data: null, error: { message: "falló consulta del slug" } }
          : { data: null, error: null };
      }
      writes.push(request);
      if (mode === "write-error") return { data: null, error: { message: "escritura rechazada" } };
      if (mode === "missing") return { data: null, error: null };
      return { data: { id: "inmueble-fixture", slug: request.row?.slug ?? "slug-existente" }, error: null };
    }),
  };
  const actions = loadTs("src/lib/actions/properties.ts", {
    "@/lib/supabase/server": { createSupabaseServerClient: async () => client },
    "next/cache": { revalidatePath: (...args) => invalidations.push(args) },
  });
  return { actions, invalidations, writes };
}

test("altas, cambios y bajas exitosos invalidan todas las vistas públicas y sitemap", async () => {
  for (const action of ["createProperty", "updateProperty", "deleteProperty"]) {
    const env = actionEnvironment();
    const input = property("entrada", { municipio: "Tulancingo de Bravo" });
    const result = action === "createProperty"
      ? await env.actions[action](input)
      : action === "updateProperty"
        ? await env.actions[action]("inmueble-fixture", input)
        : await env.actions[action]("inmueble-fixture");
    assert.equal(result.ok, true, action);
    assert.deepEqual(env.invalidations.filter(([p]) => !p.startsWith("/admin")), [
      ["/(site)", "layout"], ["/sitemap.xml"],
    ]);
    assert.equal(env.invalidations.some(([p]) => p === "/admin/propiedades"), true);
    if (action === "updateProperty") {
      assert.equal(env.writes[0].row.municipio, "Tulancingo de Bravo");
      assert.equal(Object.hasOwn(env.writes[0].row, "slug"), false, "editar no cambia el slug");
    }
  }
});

test("escrituras rechazadas o sin fila afectada no declaran éxito ni invalidan", async () => {
  for (const mode of ["write-error", "missing"]) {
    for (const action of ["updateProperty", "deleteProperty"]) {
      const env = actionEnvironment(mode);
      const result = action === "updateProperty"
        ? await env.actions[action]("ausente", property("entrada"))
        : await env.actions[action]("ausente");
      assert.equal(result.ok, false);
      assert.equal(env.invalidations.length, 0);
      assert.equal(env.writes.length, 1, "la prueba debe alcanzar la escritura sustituida");
    }
  }
  for (const mode of ["write-error", "slug-error"]) {
    const env = actionEnvironment(mode);
    assert.equal((await env.actions.createProperty(property("entrada"))).ok, false);
    assert.equal(env.invalidations.length, 0);
    if (mode === "slug-error") assert.equal(env.writes.length, 0);
    else assert.equal(env.writes.length, 1);
  }
  const loggedOut = actionEnvironment("success", false);
  assert.equal((await loggedOut.actions.createProperty(property("entrada"))).ok, false);
  assert.equal((await loggedOut.actions.updateProperty("actual", property("entrada"))).ok, false);
  assert.equal(loggedOut.writes.length, 0);
  assert.equal(loggedOut.invalidations.length, 0);
});

test("el layout agrupado coincide con las etiquetas implícitas reales de Next instalado", async () => {
  const require = createRequire(import.meta.url);
  const { getImplicitTags } = require("next/dist/server/lib/implicit-tags.js");
  const routes = [
    ["/(site)/page", "/"],
    ["/(site)/propiedades/page", "/propiedades"],
    ["/(site)/propiedades/venta/[type]/[ubicacion]/page", "/propiedades/venta/casas/pachuca-de-soto"],
    ["/(site)/propiedades/[slug]/page", "/propiedades/propiedad-actual"],
  ];
  for (const [page, pathname] of routes) {
    const { tags } = await getImplicitTags(page, { pathname }, null);
    assert.ok(tags.includes("_N_T_/(site)/layout"), page);
  }
});

test("el sitemap usa inventario real del fixture, fechas de ficha y ninguna hora de build", async () => {
  const inventory = [
    property("venta"),
    property("renta", { operation: "renta", property_type: "departamento", updated_at: "2026-09-22T03:18:23Z" }),
  ];
  const sitemap = loadTs("src/app/sitemap.ts", {
    "@/lib/data": {
      getPropertySlugs: async () => inventory,
      getSeoIndex: async () => inventory,
    },
  });
  const rows = await sitemap.default();
  assert.equal(sitemap.revalidate, 300);
  assert.equal(new Set(rows.map((r) => r.url)).size, rows.length);
  assert.equal(rows.some((r) => r.url.includes("?")), false);
  assert.equal(rows.some((r) => r.url.includes("localhost")), false);
  for (const p of inventory) {
    const row = rows.find((r) => r.url === `${siteUrl}/propiedades/${p.slug}`);
    assert.equal(row.lastModified.toISOString(), new Date(p.updated_at).toISOString());
  }
  const propertyUrls = new Set(inventory.map((p) => `${siteUrl}/propiedades/${p.slug}`));
  assert.ok(rows.filter((r) => !propertyUrls.has(r.url)).every((r) => r.lastModified === undefined));
  assert.ok(rows.some((r) => r.url === `${siteUrl}/propiedades/venta/casas/pachuca-de-soto`));
  assert.ok(rows.some((r) => r.url === `${siteUrl}/propiedades/renta/departamentos/pachuca-de-soto`));
});

test("el sitemap falla completo ante el proveedor caído en cualquiera de sus dos lecturas", async () => {
  for (const failingRead of ["getPropertySlugs", "getSeoIndex"]) {
    const data = {
      getPropertySlugs: async () => [property("actual")],
      getSeoIndex: async () => [property("actual")],
    };
    data[failingRead] = async () => { throw new Error("proveedor no disponible"); };
    const sitemap = loadTs("src/app/sitemap.ts", { "@/lib/data": data });
    await assert.rejects(() => sitemap.default(), /proveedor no disponible/);
  }
});
