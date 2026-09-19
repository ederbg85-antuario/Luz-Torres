/** Editable campaign layouts. Photographs are placed from the original files;
 * no generative reconstruction, retouching, staging or architectural changes. */
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const root = path.resolve("../Campanas-2026-09");
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
  const dir = path.join(root, p.key, "creativos");
  await fs.mkdir(dir, { recursive: true });
  await save(dir, "01-portada-1080.jpg", 1080, [
    { input: await logo(310), left: 48, top: 58 },
    { input: await photo(p.key, p.photo, 602, 968), left: 430, top: 56 },
    await text(p.kind, 48, 217, 18, 345, brown, false, "semibold"),
    await text(
      p.title,
      44,
      286,
      p.key === "manzano" ? 70 : 90,
      370,
      green,
      true,
      "medium",
    ),
    await text(p.place, 48, 522, 25, 330),
    await text(p.price, 48, 687, 43, 360, brown, false, "bold"),
    await text("MXN", 48, 747, 23, 300, brown),
    {
      input: svg(
        350,
        70,
        `<rect width="350" height="70" rx="35" fill="${green}"/>`,
      ),
      left: 48,
      top: 846,
    },
    await text(
      "Solicita tu visita ↗",
      75,
      868,
      25,
      310,
      "#FFFFFF",
      false,
      "semibold",
    ),
    await text("luztorres.com", 48, 996, 22, 330),
  ]);
  await save(dir, "02-espacios-1080.jpg", 1080, [
    { input: await logo(280), left: 56, top: 58 },
    { input: await photo(p.key, p.detail, 566, 870), left: 458, top: 154 },
    await text(p.detailTitle, 52, 250, 65, 360, green, true, "medium"),
    await text(p.specs, 56, 505, 31, 340, brown, false, "medium"),
    await text(p.short, 56, 911, 24, 345),
    await text("Desliza para conocer más →", 56, 971, 19, 345),
  ]);
  await save(dir, "03-descubre-1080.jpg", 1080, [
    { input: await logo(280), left: 56, top: 54 },
    { input: await photo(p.key, p.third, 968, 645), left: 56, top: 155 },
    await text(p.thirdTitle, 56, 840, 55, 960, green, true, "semibold"),
    await text(p.thirdText, 56, 930, 28, 950, brown),
  ]);
  await save(
    dir,
    "04-solicita-visita-1080.jpg",
    1080,
    [
      { input: await logo(400, "#FFFFFF"), left: 64, top: 66 },
      await text(
        "EL SIGUIENTE PASO",
        64,
        275,
        21,
        920,
        "#E8D5C5",
        false,
        "medium",
      ),
      await text(
        "Conócelo\nen persona.",
        58,
        355,
        112,
        960,
        "#FFFFFF",
        true,
        "medium",
      ),
      await text(
        p.short + " · " + p.price + " MXN",
        64,
        657,
        29,
        930,
        "#FFFFFF",
      ),
      {
        input: svg(
          550,
          90,
          `<rect width="550" height="90" rx="45" fill="#FFFFFF"/>`,
        ),
        left: 64,
        top: 768,
      },
      await text(
        "Solicita tu visita con Luz ↗",
        98,
        797,
        30,
        480,
        brown,
        false,
        "semibold",
      ),
      await text(
        "Visita sujeta a confirmación de disponibilidad.",
        64,
        910,
        23,
        920,
        "#F1E6DC",
      ),
      await text("luztorres.com", 64, 986, 23, 920, "#FFFFFF"),
    ],
    brown,
  );
  for (const [height, name] of [
    [1350, "05-feed-1080x1350.jpg"],
    [1920, "06-stories-1080x1920.jpg"],
  ]) {
    const story = height === 1920,
      top = story ? 250 : 55,
      photoTop = top + 196,
      photoHeight = story ? 800 : 680;
    const bottom = photoTop + photoHeight + 36;
    await save(dir, name, height, [
      { input: await logo(330), left: 58, top },
      await text(p.kind, 58, top + 96, 20, 950, brown, false, "semibold"),
      await text(p.short, 54, top + 126, 52, 960, green, true, "semibold"),
      {
        input: await photo(p.key, p.photo, 964, photoHeight),
        left: 58,
        top: photoTop,
      },
      await text(p.place, 58, bottom, 26, 950),
      await text(
        p.price + " MXN",
        58,
        bottom + 52,
        49,
        950,
        brown,
        false,
        "bold",
      ),
      {
        input: svg(
          460,
          76,
          `<rect width="460" height="76" rx="38" fill="${green}"/>`,
        ),
        left: 58,
        top: bottom + 133,
      },
      await text(
        "Solicita tu visita ↗",
        93,
        bottom + 157,
        32,
        400,
        "#FFFFFF",
        false,
        "semibold",
      ),
      await text(
        "luztorres.com · Sujeta a confirmación",
        58,
        bottom + 240,
        23,
        950,
      ),
    ]);
  }
  manifest.push({
    ...p,
    url: `https://luztorres.com/propiedades/${p.slug}`,
    files: await fs.readdir(dir),
  });
  await fs.mkdir(path.join(root, "meta"), { recursive: true });
  for (const file of await fs.readdir(dir))
    await fs.copyFile(
      path.join(dir, file),
      path.join(root, "meta", `${p.key}-${file}`),
    );
  console.log(`${p.key}: 4 tarjetas, 1 feed, 1 story.`);
}
await fs.writeFile(
  path.join(root, "manifest.json"),
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
      filename = (await fs.readdir(path.join(root, p.key, "creativos"))).sort()[
        i
      ];
    thumbs.push({
      input: await sharp(path.join(root, p.key, "creativos", filename))
        .resize(360, 360)
        .toBuffer(),
      left: i * 360,
      top: pi * 360,
    });
  }
await sharp({
  create: { width: 1440, height: 720, channels: 3, background: "#fff" },
})
  .composite(thumbs)
  .jpeg({ quality: 93 })
  .toFile(path.join(root, "vista-previa.jpg"));
