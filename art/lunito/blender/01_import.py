"""Paso 1 (docs/LUNITO-ARTE.md §6.1): importar public/lunito.glb y guardar el .blend.

Uso:  blender -b -P art/lunito/blender/01_import.py
El .blend se guarda fuera del repo: en la ruta de la variable LUNITO_BLEND o,
si no existe, en ../lunito.blend respecto a la raíz del repo.
"""

import os
import sys
from pathlib import Path

import bpy

REPO = Path(__file__).resolve().parents[3]
GLB = REPO / "public" / "lunito.glb"
BLEND = Path(os.environ.get("LUNITO_BLEND", REPO.parent / "lunito.blend"))

EXPECTED = (
    ["body", "belly", "eye_L", "eye_R"]
    + [f"gill_L_{i}" for i in (1, 2, 3)]
    + [f"gill_R_{i}" for i in (1, 2, 3)]
)

# Quitar el cubo de la escena de inicio (la luz y la cámara se quedan).
cube = bpy.data.objects.get("Cube")
if cube is not None and cube.type == "MESH":
    bpy.data.objects.remove(cube, do_unlink=True)

before = set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=str(GLB))
imported = [o for o in bpy.data.objects if o not in before]

print(f"Importados {len(imported)} objetos desde {GLB.name}:")
for o in sorted(imported, key=lambda o: o.name):
    tris = sum(len(p.vertices) - 2 for p in o.data.polygons) if o.type == "MESH" else 0
    keys = len(o.data.shape_keys.key_blocks) if o.type == "MESH" and o.data.shape_keys else 0
    print(f"  {o.name:10s} {o.type:6s} tris={tris:6d} shape_keys={keys} parent={o.parent.name if o.parent else None}")

missing = [n for n in EXPECTED if n not in bpy.data.objects]
if missing:
    print(f"FALTAN partes: {missing}")
    sys.exit(1)

bpy.ops.wm.save_as_mainfile(filepath=str(BLEND))
print(f"OK: las {len(EXPECTED)} partes existen. Guardado en {BLEND}")
