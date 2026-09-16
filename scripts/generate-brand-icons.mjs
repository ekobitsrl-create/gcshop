import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";

// Reuse the image processor installed with Next.js.
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
const publicRoot = new URL("../public/", import.meta.url);
const source = await readFile(new URL("favicon.svg", publicRoot));
const render = (size) => sharp(source, { density: 576 }).resize(size, size).png().toBuffer();

await writeFile(new URL("favicon-32x32.png", publicRoot), await render(32));
await writeFile(new URL("apple-touch-icon.png", publicRoot), await render(180));

// ICO directory with PNG frames for crisp icons at each native browser size.
const sizes = [16, 32, 48];
const frames = await Promise.all(sizes.map(render));
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
frames.forEach((frame, index) => {
  const entry = 6 + index * 16;
  directory[entry] = sizes[index];
  directory[entry + 1] = sizes[index];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(frame.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
});
await writeFile(new URL("favicon.ico", publicRoot), Buffer.concat([directory, ...frames]));
console.log("Generated LCS browser and Apple icons from public/favicon.svg.");
