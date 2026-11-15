"""Cuadrícula de capturas: una imagen por shape key (y algunas combinaciones).

Uso:  blender -b -P art/lunito/blender/90_preview_grid.py
Escribe art/lunito/out/grid_mouth.png y art/lunito/out/grid_eyes.png (carpeta temporal,
fuera de git). Las imágenes van en el PR, no en el repo.
"""

import os
from pathlib import Path

import bpy
import numpy as np
from mathutils import Vector

REPO = Path(__file__).resolve().parents[3]
BLEND = Path(os.environ.get("LUNITO_BLEND", REPO.parent / "lunito.blend"))
OUT = REPO / "art" / "lunito" / "out"
if "body" not in bpy.data.objects:
    bpy.ops.wm.open_mainfile(filepath=str(BLEND))
OUT.mkdir(parents=True, exist_ok=True)

TILE = 360

MOUTH = [
    ("Basis", {}),
    ("viseme_PP", {"viseme_PP": 1}),
    ("viseme_FF", {"viseme_FF": 1}),
    ("viseme_DD", {"viseme_DD": 1}),
    ("viseme_aa", {"viseme_aa": 1}),
    ("viseme_E", {"viseme_E": 1}),
    ("viseme_I", {"viseme_I": 1}),
    ("viseme_O", {"viseme_O": 1}),
    ("viseme_U", {"viseme_U": 1}),
    ("mouthSmile", {"mouthSmile": 1}),
    ("mouthPucker", {"mouthPucker": 1}),
    ("aa + mouthSmile", {"viseme_aa": 1, "mouthSmile": 1}),
    ("E + mouthSmile", {"viseme_E": 1, "mouthSmile": 1}),
    ("O + mouthPucker", {"viseme_O": 1, "mouthPucker": 1}),
    ("aa 50%", {"viseme_aa": 0.5}),
    ("I + mouthSmile", {"viseme_I": 1, "mouthSmile": 1}),
]
EYES = [
    ("Basis", {}),
    ("eyeBlink", {"eyeBlink": 1}),
    ("eyeHappy", {"eyeHappy": 1}),
    ("eyeWide", {"eyeWide": 1}),
    ("eyeBlink 25%", {"eyeBlink": 0.25}),
    ("eyeBlink 50%", {"eyeBlink": 0.5}),
    ("eyeBlink 75%", {"eyeBlink": 0.75}),
    ("eyeBlink 90%", {"eyeBlink": 0.9}),
    ("eyeHappy 50%", {"eyeHappy": 0.5}),
    ("eyeHappy + mouthSmile", {"eyeHappy": 1, "mouthSmile": 1}),
    ("eyeWide + viseme_O", {"eyeWide": 1, "viseme_O": 1}),
    ("eyeWide + viseme_aa", {"eyeWide": 1, "viseme_aa": 1}),
]
KEYED = ["mouth", "eye_L", "eye_R"]


def set_keys(values):
    for name in KEYED:
        obj = bpy.data.objects.get(name)
        if obj is None or obj.data.shape_keys is None:
            continue
        for kb in obj.data.shape_keys.key_blocks[1:]:
            kb.value = values.get(kb.name, 0.0)


def render_grid(configs, path, center, ortho_scale, direction=(0.25, -1.0, 0.1), cols=4):
    scene = bpy.context.scene
    saved = (
        scene.render.engine,
        scene.camera,
        scene.render.resolution_x,
        scene.render.resolution_y,
        scene.render.resolution_percentage,
        scene.render.filepath,
        scene.render.film_transparent,
    )
    cam_data = bpy.data.cameras.new("_grid_cam")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = ortho_scale
    cam = bpy.data.objects.new("_grid_cam", cam_data)
    scene.collection.objects.link(cam)
    d = Vector(direction).normalized()
    cam.location = Vector(center) + d * 5
    cam.rotation_euler = (-d).to_track_quat("-Z", "Y").to_euler()

    txt_data = bpy.data.curves.new("_grid_txt", "FONT")
    txt_data.align_x = "CENTER"
    txt_data.size = ortho_scale * 0.075
    txt = bpy.data.objects.new("_grid_txt", txt_data)
    scene.collection.objects.link(txt)
    txt.rotation_euler = cam.rotation_euler
    up = cam.matrix_basis.to_3x3() @ Vector((0, 1, 0))
    txt.location = Vector(center) + d * 3 - up * ortho_scale * 0.46
    mat = bpy.data.materials.new("_grid_txt")
    mat.diffuse_color = (1, 1, 1, 1)
    txt_data.materials.append(mat)

    scene.camera = cam
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.display.shading.light = "STUDIO"
    scene.display.shading.color_type = "TEXTURE"
    scene.render.resolution_x = scene.render.resolution_y = TILE
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False
    view_saved = scene.view_settings.view_transform
    scene.view_settings.view_transform = "Standard"

    tiles = []
    for label, values in configs:
        set_keys(values)
        txt_data.body = label
        scene.render.filepath = str(OUT / "_tile.png")
        bpy.ops.render.render(write_still=True)
        img = bpy.data.images.load(str(OUT / "_tile.png"))
        px = np.empty(TILE * TILE * 4, dtype=np.float32)
        img.pixels.foreach_get(px)
        tiles.append(px.reshape(TILE, TILE, 4))
        bpy.data.images.remove(img)
    set_keys({})

    rows = -(-len(tiles) // cols)
    sheet = np.zeros((rows * TILE, cols * TILE, 4), dtype=np.float32)
    sheet[..., 3] = 1
    for i, tile in enumerate(tiles):
        r, c = divmod(i, cols)
        y0 = (rows - 1 - r) * TILE
        sheet[y0 : y0 + TILE, c * TILE : (c + 1) * TILE] = tile
    out = bpy.data.images.new("_grid", cols * TILE, rows * TILE)
    out.pixels.foreach_set(sheet.ravel())
    out.filepath_raw = str(path)
    out.file_format = "PNG"
    out.save()
    bpy.data.images.remove(out)
    (OUT / "_tile.png").unlink(missing_ok=True)

    scene.view_settings.view_transform = view_saved
    bpy.data.objects.remove(cam)
    bpy.data.cameras.remove(cam_data)
    bpy.data.objects.remove(txt)
    bpy.data.curves.remove(txt_data)
    bpy.data.materials.remove(mat)
    (
        scene.render.engine,
        scene.camera,
        scene.render.resolution_x,
        scene.render.resolution_y,
        scene.render.resolution_percentage,
        scene.render.filepath,
        scene.render.film_transparent,
    ) = saved
    print("Escrito", path)


WHICH = os.environ.get("LUNITO_GRID", "mouth,eyes").split(",")
if "mouth" in WHICH and "mouth" in bpy.data.objects:
    render_grid(MOUTH, OUT / "grid_mouth.png", center=(0, -0.5, 0.2), ortho_scale=0.95)
if "eyes" in WHICH and bpy.data.objects["eye_L"].data.shape_keys is not None:
    render_grid(EYES, OUT / "grid_eyes.png", center=(0, -0.5, 0.24), ortho_scale=0.95)
