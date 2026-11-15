// Revisión del modelo de Lunito (docs/LUNITO-ARTE.md §7).
// Node sin dependencias: lee el JSON del GLB y comprueba el contrato del §2.
//
// Uso:  node art/lunito/check-glb.mjs [ruta.glb]   (por defecto public/lunito.glb)
// Sale con código 1 si algo falla.
import { readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 2 * 1024 * 1024;

const PARTS = [
  "body",
  "belly",
  ...["L", "R"].flatMap((s) => [1, 2, 3].map((i) => `gill_${s}_${i}`)),
  "eye_L",
  "eye_R",
  "mouth",
  "tail",
];

// Partes del contrato que todavía no existen: se avisa, pero no hacen fallar la
// revisión. Los brazos llegan en un PR aparte; al entregarlos, pasan a PARTS.
const PENDING_PARTS = ["arm_L", "arm_R"];

const MOUTH_KEYS = [
  "viseme_PP",
  "viseme_FF",
  "viseme_DD",
  "viseme_aa",
  "viseme_E",
  "viseme_I",
  "viseme_O",
  "viseme_U",
  "mouthSmile",
  "mouthPucker",
];
const EYE_KEYS = ["eyeBlink", "eyeHappy", "eyeWide"];
const SHAPE_KEYS = { mouth: MOUTH_KEYS, eye_L: EYE_KEYS, eye_R: EYE_KEYS };

const here = dirname(fileURLToPath(import.meta.url));
const path = resolve(
  process.argv[2] ?? resolve(here, "../../public/lunito.glb"),
);

/** Devuelve el JSON del primer bloque de un archivo GLB. */
function readGlbJson(file) {
  const data = readFileSync(file);
  if (data.readUInt32LE(0) !== 0x46546c67)
    throw new Error("No es un archivo GLB");
  const length = data.readUInt32LE(12);
  if (data.readUInt32LE(16) !== 0x4e4f534a)
    throw new Error("El primer bloque no es JSON");
  return JSON.parse(data.subarray(20, 20 + length).toString("utf8"));
}

const errors = [];
const notes = [];
const gltf = readGlbJson(path);
const nodes = gltf.nodes ?? [];
const meshes = gltf.meshes ?? [];

// 1. Partes con nombre exacto.
for (const name of PARTS) {
  const found = nodes.filter((n) => n.name === name);
  if (found.length === 0) errors.push(`Falta la parte "${name}"`);
  else if (found.length > 1) errors.push(`La parte "${name}" está repetida`);
  else if (found[0].mesh === undefined)
    errors.push(`La parte "${name}" no tiene malla`);
}

for (const name of PENDING_PARTS) {
  if (!nodes.some((n) => n.name === name))
    notes.push(`Pendiente: falta la parte "${name}"`);
}

// Los orígenes son los pivotes que usa el código: ninguna parte debe traer
// escala propia (la cuantización de meshopt la agrega y mueve el origen).
for (const node of nodes) {
  if (node.scale && node.scale.some((s) => Math.abs(s - 1) > 1e-6)) {
    errors.push(
      `La parte "${node.name}" tiene escala ${node.scale}: su origen se movió`,
    );
  }
}

// 2. Shape keys (mesh.extras.targetNames), con un target por nombre en cada primitiva.
for (const [name, expected] of Object.entries(SHAPE_KEYS)) {
  const node = nodes.find((n) => n.name === name);
  if (!node || node.mesh === undefined) continue;
  const mesh = meshes[node.mesh];
  const names = mesh.extras?.targetNames ?? [];
  for (const key of expected) {
    if (!names.includes(key))
      errors.push(`A "${name}" le falta la shape key "${key}"`);
  }
  for (const [i, primitive] of mesh.primitives.entries()) {
    const count = primitive.targets?.length ?? 0;
    if (count !== names.length) {
      errors.push(
        `"${name}" primitiva ${i}: ${count} targets para ${names.length} nombres`,
      );
    }
  }
  notes.push(`${name}: ${names.length} shape keys`);
}

// 3. Materiales: nada metálico. En glTF, sin metallicFactor el valor es 1.
for (const [i, material] of (gltf.materials ?? []).entries()) {
  const metallic = material.pbrMetallicRoughness?.metallicFactor ?? 1;
  if (metallic !== 0) {
    errors.push(
      `Material "${material.name ?? i}": metallic = ${metallic}, debe ser 0`,
    );
  }
}

// 4. Sin animaciones: el código anima todo.
const animations = gltf.animations?.length ?? 0;
if (animations > 0)
  errors.push(`El GLB trae ${animations} animación(es); no debe traer ninguna`);

// 5. Peso.
const bytes = statSync(path).size;
if (bytes > MAX_BYTES) {
  errors.push(`Pesa ${(bytes / 1024 / 1024).toFixed(2)} MB; el máximo es 2 MB`);
}

console.log(`Archivo: ${path}`);
console.log(`Peso: ${(bytes / 1024 / 1024).toFixed(2)} MB`);
console.log(
  `Partes: ${nodes
    .filter((n) => n.mesh !== undefined)
    .map((n) => n.name)
    .join(", ")}`,
);
console.log(
  `Materiales: ${(gltf.materials ?? []).length} · Animaciones: ${animations}`,
);
for (const note of notes) console.log(note);

if (errors.length > 0) {
  console.error(`\nFALLA (${errors.length}):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log("\nOK: el modelo cumple el contrato.");
