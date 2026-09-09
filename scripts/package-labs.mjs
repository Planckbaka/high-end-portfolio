// Build a small, deterministic ZIP and a browsable source mirror without Python.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "labs");
const output = path.join(root, "public/labs");
const extensions = new Set([".go", ".mod", ".py", ".md", ".txt", ".json", ".csv", ".svg"]);
async function collect(directory, relative = "") {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "__pycache__") continue;
    const rel = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...(await collect(path.join(directory, entry.name), rel)));
    else if (entry.isFile() && extensions.has(path.extname(entry.name))) files.push(rel);
  }
  return files.sort();
}
const files = await collect(source);
await fs.mkdir(output, { recursive: true });
const table = Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = table[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
const local = [];
const central = [];
let offset = 0;
for (const file of files) {
  const data = await fs.readFile(path.join(source, file));
  const destination = path.join(output, file);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, data);
  const name = Buffer.from("labs/" + file.replaceAll(path.sep, "/"));
  const crc = crc32(data);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x21, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(data.length, 18);
  header.writeUInt32LE(data.length, 22);
  header.writeUInt16LE(name.length, 26);
  local.push(header, name, data);
  const directory = Buffer.alloc(46);
  directory.writeUInt32LE(0x02014b50, 0);
  directory.writeUInt16LE(20, 4);
  directory.writeUInt16LE(20, 6);
  directory.writeUInt16LE(0x21, 14);
  directory.writeUInt32LE(crc, 16);
  directory.writeUInt32LE(data.length, 20);
  directory.writeUInt32LE(data.length, 24);
  directory.writeUInt16LE(name.length, 28);
  directory.writeUInt32LE(offset, 42);
  central.push(directory, name);
  offset += header.length + name.length + data.length;
}
const centralData = Buffer.concat(central);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(centralData.length, 12);
end.writeUInt32LE(offset, 16);
await fs.writeFile(
  path.join(output, "engineering-labs.zip"),
  Buffer.concat([...local, centralData, end])
);
console.log(`Packaged ${files.length} lab source and result files (no virtual environment).`);
