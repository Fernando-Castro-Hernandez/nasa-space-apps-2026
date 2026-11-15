"""Paso 6 (docs/LUNITO-ARTE.md §7): exportar el GLB sin optimizar.

Uso:  blender -b -P art/lunito/blender/09_export.py
Escribe art/lunito/out/lunito_raw.glb (carpeta temporal, fuera de git). Después
se optimiza con gltf-transform, como indica el §7 de la guía.
"""

import os
from pathlib import Path

import bpy

REPO = Path(__file__).resolve().parents[3]
BLEND = Path(os.environ.get("LUNITO_BLEND", REPO.parent / "lunito.blend"))
OUT = REPO / "art" / "lunito" / "out"
if "body" not in bpy.data.objects:
    bpy.ops.wm.open_mainfile(filepath=str(BLEND))
OUT.mkdir(parents=True, exist_ok=True)

# Solo las partes del modelo, en reposo y sin transformaciones de prueba.
parts = [o for o in bpy.data.objects if o.type == "MESH"]
for obj in bpy.data.objects:
    obj.select_set(obj in parts)
for obj in parts:
    obj.rotation_euler = (0, 0, 0)
    obj.scale = (1, 1, 1)
    if obj.data.shape_keys:
        for key in obj.data.shape_keys.key_blocks[1:]:
            key.value = 0.0

options = dict(
    filepath=str(OUT / "lunito_raw.glb"),
    export_format="GLB",
    use_selection=True,
    export_yup=True,
    export_apply=False,  # aplicar modificadores destruiría las shape keys
    export_morph=True,
    export_morph_normal=False,
    export_animations=False,
    export_image_format="JPEG",
)
# Opciones que cambian de nombre entre versiones de Blender.
available = bpy.ops.export_scene.gltf.get_rna_type().properties.keys()
for name, value in (("export_image_quality", 90), ("export_jpeg_quality", 90), ("export_skins", False)):
    if name in available:
        options[name] = value
bpy.ops.export_scene.gltf(**options)

size = (OUT / "lunito_raw.glb").stat().st_size
print(f"Exportadas {len(parts)} partes: {sorted(o.name for o in parts)}")
print(f"{OUT / 'lunito_raw.glb'}: {size / 1e6:.2f} MB")
