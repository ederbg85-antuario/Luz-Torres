import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const output = path.resolve("../Campanas-2026-09");
const properties = [
  ["manzano", "casa-venta-bonito-el-manzano-chicoloapan-iho8356137"],
  ["alpes", "departamento-venta-los-alpes-alvaro-obregon-iap7712491"],
];
await fs.mkdir(output, { recursive: true });
for (const [name, slug] of properties) {
  const html = await (
    await fetch(`https://luztorres.com/propiedades/${slug}`)
  ).text();
  const data = JSON.parse(
    html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1],
  )["@graph"][0];
  const dir = path.join(output, name, "originales");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(output, name, "fuente.json"),
    JSON.stringify({ ...data, consultedAt: new Date().toISOString() }, null, 2),
  );
  const thumbnails = [];
  for (let i = 0; i < data.image.length; i += 5) {
    await Promise.all(
      data.image.slice(i, i + 5).map(async (url, j) => {
        const index = i + j;
        const file = path.join(dir, `${String(index).padStart(2, "0")}.jpg`);
        try {
          await fs.access(file);
        } catch {
          const response = await fetch(url, {
            signal: AbortSignal.timeout(20000),
          });
          if (!response.ok) throw new Error(`${response.status}: ${url}`);
          await fs.writeFile(file, Buffer.from(await response.arrayBuffer()));
        }
        const image = await sharp(file)
          .resize(260, 180, { fit: "contain", background: "#fff" })
          .jpeg()
          .toBuffer();
        const label = Buffer.from(
          `<svg width="260" height="30"><rect width="260" height="30" fill="white"/><text x="12" y="21" font-family="Arial" font-size="16">${name} / ${String(index).padStart(2, "0")}</text></svg>`,
        );
        thumbnails.push({
          input: image,
          left: (index % 5) * 260,
          top: Math.floor(index / 5) * 210,
        });
        thumbnails.push({
          input: label,
          left: (index % 5) * 260,
          top: Math.floor(index / 5) * 210 + 180,
        });
      }),
    );
  }
  await sharp({
    create: {
      width: 1300,
      height: Math.ceil(data.image.length / 5) * 210,
      channels: 3,
      background: "#fff",
    },
  })
    .composite(thumbnails)
    .jpeg({ quality: 85 })
    .toFile(path.join(output, `${name}-contacto.jpg`));
  console.log(
    `${name}: ${data.image.length} originales y hoja de selección guardados.`,
  );
}
