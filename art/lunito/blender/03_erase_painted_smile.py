"""Paso 2b (docs/LUNITO-ARTE.md §3): borrar la sonrisa pintada de la textura.

Uso:  blender -b -P art/lunito/blender/03_erase_painted_smile.py

Con la boca en malla ya no hace falta la sonrisa pintada, y se vería una segunda
boca cuando la malla se cierra en "o", "u" o "m". Aquí se reemplaza, texel por
texel, la banda de la sonrisa por el color de la piel de alrededor (un ajuste
suave del color en función de la posición sobre la cara).
"""

import os
from pathlib import Path

import bpy
import numpy as np

REPO = Path(__file__).resolve().parents[3]
BLEND = Path(os.environ.get("LUNITO_BLEND", REPO.parent / "lunito.blend"))
if "body" not in bpy.data.objects:
    bpy.ops.wm.open_mainfile(filepath=str(BLEND))

# La sonrisa pintada, medida sobre la cara: z = Z0 + BEND * (x / HW)^2, |x| <= HW.
HW, Z0, BEND = 0.128, 0.188, 0.017
CORE, FEATHER = 0.020, 0.034  # distancia a la curva: reemplazo total / sin cambio
REGION = dict(x=0.21, z0=0.13, z1=0.26)  # zona de donde se aprende el color de la piel

# Las tres texturas del material (color, rugosidad y normales): la sonrisa está
# marcada en todas. Solo en la de color se rellena además el margen de las islas.
nodes = bpy.data.materials["Material_0"].node_tree.nodes
images = []
for node in nodes:
    if node.type == "TEX_IMAGE" and node.image and node.outputs["Color"].links:
        is_color = node.outputs["Color"].links[0].to_socket.name == "Base Color"
        images.append((node.image, is_color))
W, H = images[0][0].size


def curve_distance(x, z):
    """Distancia aproximada de (x, z) a la curva de la sonrisa."""
    xc = np.clip(x, -HW, HW)
    zc = Z0 + BEND * (xc / HW) ** 2
    return np.hypot(x - xc, z - zc)


def texels(obj):
    """Texeles de las caras del frente en la región: (fila, columna, x, z)."""
    me = obj.data
    mw = obj.matrix_world
    n = len(me.vertices)
    co = np.empty(n * 3, dtype=np.float32)
    me.vertices.foreach_get("co", co)
    co = co.reshape(n, 3) @ np.array(mw.to_3x3()).T + np.array(mw.translation)
    uv_data = me.uv_layers.active.data
    rows, cols, xs, zs = [], [], [], []
    for poly in me.polygons:
        vi = list(poly.vertices)
        if len(vi) != 3:
            continue
        p = co[vi]
        if p[:, 1].max() > -0.3:
            continue
        if np.abs(p[:, 0]).min() > REGION["x"] or p[:, 2].max() < REGION["z0"] or p[:, 2].min() > REGION["z1"]:
            continue
        uv = np.array([uv_data[li].uv[:] for li in poly.loop_indices]) * (W, H) - 0.5
        (x0, y0), (x1, y1) = np.floor(uv.min(0) - 2), np.ceil(uv.max(0) + 2)
        gx, gy = np.meshgrid(np.arange(x0, x1 + 1), np.arange(y0, y1 + 1))
        a, b, c = uv
        den = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
        if abs(den) < 1e-9:
            continue
        w0 = ((b[1] - c[1]) * (gx - c[0]) + (c[0] - b[0]) * (gy - c[1])) / den
        w1 = ((c[1] - a[1]) * (gx - c[0]) + (a[0] - c[0]) * (gy - c[1])) / den
        w2 = 1 - w0 - w1
        tol = min(0.5, 1.5 / max(1.0, np.sqrt(abs(den))))  # ~1.5 px de margen
        inside = (w0 >= -tol) & (w1 >= -tol) & (w2 >= -tol)
        if not inside.any():
            continue
        w = np.stack([w0[inside], w1[inside], w2[inside]], axis=1)
        pos = w @ p
        rows.append(gy[inside].astype(int) % H)
        cols.append(gx[inside].astype(int) % W)
        xs.append(pos[:, 0])
        zs.append(pos[:, 2])
    if not rows:
        return None
    return tuple(np.concatenate(v) for v in (rows, cols, xs, zs))


def features(x, z):
    return np.stack([np.ones_like(x), x, z, x * x, x * z, z * z], axis=1)


# Texeles de body y belly juntos: un solo ajuste de color para que no se note
# un escalón en la costura entre las dos partes, que pasa justo por la boca.
parts = [t for t in (texels(bpy.data.objects[n]) for n in ("body", "belly")) if t is not None]
R, C, X, Z = (np.concatenate(v) for v in zip(*parts))
keep = (np.abs(X) < REGION["x"]) & (Z > REGION["z0"]) & (Z < REGION["z1"])
R, C, X, Z = R[keep], C[keep], X[keep], Z[keep]
DIST = curve_distance(X, Z)


def clean(img, fill_margin):
    px = np.empty(W * H * 4, dtype=np.float32)
    img.pixels.foreach_get(px)
    px = px.reshape(H, W, 4)
    original = px.copy()
    color = original[R, C, :3]

    # Ajuste del color de la piel con lo que queda fuera de la banda (dos pasadas
    # para descartar texeles raros).
    fit = DIST > FEATHER
    coef = None
    for _ in range(2):
        coef, *_ = np.linalg.lstsq(features(X[fit], Z[fit]), color[fit], rcond=None)
        resid = np.abs(features(X, Z) @ coef - color).max(axis=1)
        fit = (DIST > FEATHER) & (resid < 0.08)
    skin = np.clip(features(X, Z) @ coef, 0, 1)
    t = np.clip((DIST - CORE) / (FEATHER - CORE), 0, 1)
    weight = 1 - t * t * (3 - 2 * t)
    sel = weight > 0
    px[R[sel], C[sel], :3] = color[sel] * (1 - weight[sel, None]) + skin[sel] * weight[sel, None]
    changed = np.zeros((H, W), dtype=bool)
    changed[R[sel], C[sel]] = weight[sel] > 0.5

    # Relleno del margen de las islas UV: texeles vecinos que siguen siendo mucho más
    # oscuros que el color nuevo (restos de la línea en el borde) toman ese color.
    for _ in range(4 if fill_margin else 0):
        acc = np.zeros((H, W, 3), dtype=np.float32)
        cnt = np.zeros((H, W), dtype=np.float32)
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            acc += np.roll(px[..., :3] * changed[..., None], (dy, dx), axis=(0, 1))
            cnt += np.roll(changed, (dy, dx), axis=(0, 1))
        avg = acc / np.maximum(cnt, 1)[..., None]
        dark = (cnt > 0) & ~changed & ((avg.mean(-1) - px[..., :3].mean(-1)) > 0.08)
        if not dark.any():
            break
        px[dark, :3] = avg[dark]
        changed |= dark

    img.pixels.foreach_set(px.ravel())
    img.update()
    img.pack()
    print(f"Textura {img.name}: {int((np.abs(px - original).max(-1) > 0.01).sum())} texeles modificados")


for image, is_color in images:
    clean(image, fill_margin=is_color)

if bpy.data.filepath:
    bpy.ops.wm.save_mainfile()
    print("Guardado", bpy.data.filepath)
