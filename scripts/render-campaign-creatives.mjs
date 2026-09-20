/** Editable campaign layouts. Photographs are placed from the original files;
 * no generative reconstruction, retouching, staging or architectural changes. */
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const root = path.resolve("../Campanas-2026-09");
// Keep the first delivery recoverable while creating the airier revision.
const outputRoot = path.join(root, "revision-aire");
const green = "#1F4D4D",
  brown = "#6F4E37";
const fontDir = path.join(root, "fuentes");
await fs.mkdir(fontDir, { recursive: true });
const fontConfig = path.join(fontDir, "fonts.conf");
await fs.writeFile(
  fontConfig,
  `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>${fontDir}</dir><cachedir>${fontDir}/cache</cachedir></fontconfig>`,
);
process.env.FONTCONFIG_FILE = fontConfig;
for (const [family, file, target] of [
  ["inter", "Inter[opsz,wght].ttf", "Inter.ttf"],
  ["cormorantgaramond", "CormorantGaramond[wght].ttf", "Cormorant.ttf"],
]) {
  for (const [remote, local] of [
    [file, target],
    ["OFL.txt", `${family}-OFL.txt`],
  ]) {
    const dest = path.join(fontDir, local);
    try {
      await fs.access(dest);
    } catch {
      const r = await fetch(
        `https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/${encodeURIComponent(remote)}`,
      );
      if (!r.ok) throw new Error(`Font source returned ${r.status}`);
      await fs.writeFile(dest, Buffer.from(await r.arrayBuffer()));
    }
  }
}
const { default: sharp } = await import("sharp");
const requireRenderer = createRequire(
  path.join(root, "renderer-deps", "package.json"),
);
const fontkit = requireRenderer("fontkit");
const fonts = {
  sans: fontkit.openSync(path.join(fontDir, "Inter.ttf")),
  serif: fontkit.openSync(path.join(fontDir, "Cormorant.ttf")),
};
const svg = (w, h, body) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${body}</svg>`,
  );
const logoSource = await fs.readFile("public/luz-torres.svg", "utf8");
async function logo(width, color = green) {
  return sharp(Buffer.from(logoSource.replaceAll("#000000", color)))
    .resize({ width })
    .png()
    .toBuffer();
}
async function text(
  text,
  x,
  y,
  size,
  width,
  color = green,
  serif = false,
  weight = "normal",
) {
  const wght =
    { normal: 400, medium: 500, semibold: 600, bold: 700 }[weight] ?? 400;
  const font = fonts[serif ? "serif" : "sans"].getVariation({ wght });
  const scale = size / font.unitsPerEm;
  const measure = (str) =>
    font.layout(str).positions.reduce((sum, p) => sum + p.xAdvance, 0) * scale;
  const lines = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(" ")) {
      const candidate = line ? line + " " + word : word;
      if (line && measure(candidate) > width) {
        lines.push(line);
        line = word;
      } else line = candidate;
    }
    lines.push(line);
  }
  let paths = "";
  lines.forEach((line, i) => {
    const run = font.layout(line);
    let pen = 0;
    run.glyphs.forEach((glyph, j) => {
      const pos = run.positions[j];
      paths += `<g transform="translate(${(pen + pos.xOffset) * scale},${size * 0.9 + i * size * 1.13 - pos.yOffset * scale}) scale(${scale},${-scale})"><path d="${glyph.path.toSVG()}" fill="${color}"/></g>`;
      pen += pos.xAdvance;
    });
  });
  const input = await sharp(
    svg(width, Math.ceil(lines.length * size * 1.13 + size * 0.2), paths),
  )
    .png()
    .toBuffer();
  return { input, left: x, top: y };
}
async function photo(p, index, w, h) {
  const file = path.join(
    root,
    p,
    "originales",
    `${String(index).padStart(2, "0")}.jpg`,
  );
  return sharp(file)
    .rotate()
    .resize(w, h, { fit: "cover", position: "centre" })
    .composite([
      {
        input: svg(
          w,
          h,
          `<rect width="${w}" height="${h}" rx="32" fill="white"/>`,
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();
}
async function save(dir, name, height, layers, background = "#FFFFFF") {
  await sharp({ create: { width: 1080, height, channels: 4, background } })
    .composite(layers)
    .flatten({ background: "#fff" })
    .jpeg({ quality: 96, chromaSubsampling: "4:4:4" })
    .toFile(path.join(dir, name));
}
const properties = [
  {
    key: "manzano",
    title: "Bonito\nEl Manzano",
    short: "Bonito El Manzano",
    kind: "CASA EN VENTA",
    place: "Chicoloapan",
    price: "$1,876,000",
    photo: 0,
    detail: 5,
    third: 18,
    specs: "112.5 m²\nconstrucción\n\n60 m²\nterreno",
    detailTitle: "Cada día,\na tu ritmo.",
    thirdTitle: "Conoce cada espacio.",
    thirdText: "Recorre la casa y resuelve tus dudas con Luz.",
    slug: "casa-venta-bonito-el-manzano-chicoloapan-iho8356137",
  },
  {
    key: "alpes",
    title: "Los\nAlpes",
    short: "Los Alpes",
    kind: "DEPARTAMENTO EN VENTA",
    place: "Álvaro Obregón · CDMX",
    price: "$4,950,000",
    photo: 34,
    detail: 35,
    third: 20,
    specs: "68 m²\nconstrucción\n\n2 recámaras\n2 baños · 2 autos",
    detailTitle: "Tu espacio\nen la ciudad.",
    thirdTitle: "Más allá de tu puerta.",
    thirdText: "Alberca, gimnasio y coworking. Áreas comunes.",
    slug: "departamento-venta-los-alpes-alvaro-obregon-iap7712491",
  },
];
const manifest = [];
for (const p of properties) {
  const dir = path.join(outputRoot, p.key, "creativos");
  await fs.mkdir(dir, { recursive: true });
  await save(dir, "01-portada-1080.jpg", 1080, [
    { input: await logo(240), left: 72, top: 60 },
    await text(p.kind + " · " + p.place, 72, 141, 23, 936, brown, false, "medium"),
    await text(p.short, 68, 191, 74, 944, green, true, "medium"),
    { input: await photo(p.key, p.photo, 936, 592), left: 72, top: 310 },
    await text(p.price + " MXN", 72, 954, 42, 575, brown, false, "semibold"),
    await text("Solicita tu visita →", 727, 969, 27, 290, green),
  ]);
  await save(dir, "02-espacios-1080.jpg", 1080, [
    { input: await logo(240), left: 72, top: 60 },
    { input: await photo(p.key, p.detail, 936, 625), left: 72, top: 170 },
    await text(p.key === "manzano" ? "Espacio para tu día a día." : "Tu espacio en la ciudad.", 68, 852, 64, 944, green, true, "medium"),
    await text(p.key === "manzano" ? "112.5 m² de construcción · Cocina integral" : "68 m² · 2 recámaras · 2 baños · 2 autos", 72, 955, 29, 936, brown),
  ]);
  await save(dir, "03-descubre-1080.jpg", 1080, [
    { input: await logo(240), left: 72, top: 60 },
    { input: await photo(p.key, p.third, 936, 625), left: 72, top: 170 },
    await text(p.thirdTitle, 68, 852, 64, 944, green, true, "medium"),
    await text(p.key === "manzano" ? "Descubre la casa con Luz Torres." : "Alberca, gimnasio y coworking · Áreas comunes", 72, 955, 28, 936, brown),
  ]);
  await save(
    dir,
    "04-solicita-visita-1080.jpg",
    1080,
    [
      { input: await logo(260, "#FFFFFF"), left: 80, top: 80 },
      await text(p.short, 80, 278, 32, 920, "#F1E6DC"),
      await text(p.key === "manzano" ? "¿La conoces\nen persona?" : "¿Lo conoces\nen persona?", 74, 379, 112, 930, "#FFFFFF", true, "medium"),
      await text("Solicita tu visita con Luz →", 80, 747, 36, 920, "#FFFFFF"),
      await text("Fecha sujeta a confirmación.", 80, 902, 25, 920, "#F1E6DC"),
      await text("luztorres.com", 80, 964, 25, 920, "#FFFFFF"),
    ],
    brown,
  );
  for (const [height, name] of [
    [1350, "05-feed-1080x1350.jpg"],
    [1920, "06-stories-1080x1920.jpg"],
  ]) {
    const story = height === 1920,
      top = story ? 290 : 70,
      photoTop = story ? 680 : 370,
      photoHeight = story ? 600 : 660;
    await save(dir, name, height, [
      { input: await logo(story ? 260 : 240), left: 72, top },
      await text(p.kind + " · " + p.place, 72, story ? 425 : 173, story ? 25 : 23, 936, brown, false, "medium"),
      await text(p.short, 68, story ? 493 : 228, story ? 90 : 80, 944, green, true, "medium"),
      {
        input: await photo(p.key, p.photo, 936, photoHeight),
        left: 72,
        top: photoTop,
      },
      await text(p.price + " MXN", 72, story ? 1385 : 1120, story ? 58 : 50, 936, brown, false, "semibold"),
      await text("Solicita tu visita →", 72, story ? 1525 : 1230, story ? 38 : 31, 936, green),
    ]);
  }
  manifest.push({
    ...p,
    url: `https://luztorres.com/propiedades/${p.slug}`,
    files: await fs.readdir(dir),
  });
  await fs.mkdir(path.join(outputRoot, "meta"), { recursive: true });
  for (const file of await fs.readdir(dir))
    await fs.copyFile(
      path.join(dir, file),
      path.join(outputRoot, "meta", `${p.key}-v2-${file}`),
    );
  console.log(`${p.key}: 4 tarjetas, 1 feed, 1 story.`);
}
await fs.writeFile(
  path.join(outputRoot, "manifest.json"),
  JSON.stringify(
    {
      createdAt: new Date().toISOString(),
      method:
        "Original photography + editable brand layout. No AI reconstruction in final property photos.",
      properties: manifest,
    },
    null,
    2,
  ),
);
const thumbs = [];
for (let pi = 0; pi < properties.length; pi++)
  for (let i = 0; i < 4; i++) {
    const p = properties[pi],
      filename = (await fs.readdir(path.join(outputRoot, p.key, "creativos"))).sort()[
        i
      ];
    thumbs.push({
      input: await sharp(path.join(outputRoot, p.key, "creativos", filename))
        .resize(360, 360)
        .toBuffer(),
      left: 24 + i * 384,
      top: 24 + pi * 384,
    });
  }
await sharp({
  create: { width: 1560, height: 792, channels: 3, background: "#eef0ef" },
})
  .composite(thumbs)
  .jpeg({ quality: 93 })
  .toFile(path.join(outputRoot, "vista-previa.jpg"));
