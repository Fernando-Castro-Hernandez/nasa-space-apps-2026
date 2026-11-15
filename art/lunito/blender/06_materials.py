"""Paso 4 (docs/LUNITO-ARTE.md §2): materiales de vinil, no de metal.

Uso:  blender -b -P art/lunito/blender/06_materials.py

El material de Meshy trae una textura de metal/rugosidad pero no declara el
factor `metallic`, y glTF lo toma como 1.0. Aquí se quita esa textura (su canal
de metal ya era ~0 y su rugosidad casi uniforme, ~0.45) y se dejan valores fijos:
metallic = 0 en todos los materiales y roughness = 0.6 en el del cuerpo.
"""

import os
from pathlib import Path

import bpy

REPO = Path(__file__).resolve().parents[3]
BLEND = Path(os.environ.get("LUNITO_BLEND", REPO.parent / "lunito.blend"))
if "body" not in bpy.data.objects:
    bpy.ops.wm.open_mainfile(filepath=str(BLEND))

BODY_ROUGHNESS = 0.6

used = {slot.material for o in bpy.data.objects if o.type == "MESH" for slot in o.material_slots if slot.material}
for mat in sorted(used, key=lambda m: m.name):
    tree = mat.node_tree
    bsdf = next(n for n in tree.nodes if n.type == "BSDF_PRINCIPLED")
    textured = False
    for socket_name in ("Metallic", "Roughness"):
        socket = bsdf.inputs[socket_name]
        for link in list(socket.links):
            textured = True
            tree.links.remove(link)
    bsdf.inputs["Metallic"].default_value = 0.0
    if textured:
        bsdf.inputs["Roughness"].default_value = BODY_ROUGHNESS
    # Nodos que quedaron sin usar (la textura de metal/rugosidad y su separador).
    changed = True
    while changed:
        changed = False
        for node in list(tree.nodes):
            if node.type in {"TEX_IMAGE", "SEPARATE_COLOR"} and not any(o.links for o in node.outputs):
                tree.nodes.remove(node)
                changed = True
    print(
        f"{mat.name}: metallic={bsdf.inputs['Metallic'].default_value}, "
        f"roughness={bsdf.inputs['Roughness'].default_value:.2f}"
    )

if bpy.data.filepath:
    bpy.ops.wm.save_mainfile()
    print("Guardado", bpy.data.filepath)
