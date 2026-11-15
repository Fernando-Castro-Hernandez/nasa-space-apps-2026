"""Paso 2a (docs/LUNITO-ARTE.md §3): alisar el surco esculpido de la sonrisa.

Uso:  blender -b -P art/lunito/blender/02_smooth_smile_groove.py

La sonrisa del modelo de Meshy no solo está pintada: también es un surco en la
malla de `body` y `belly`. Con la boca nueva en "o", "u" o "m" ese surco se
vería a los lados. Aquí se ajusta una superficie suave a la piel de alrededor y
los vértices del surco se llevan a ella, junto con sus normales. No cambian los
nombres, los orígenes ni la cantidad de vértices.
"""

import os
from pathlib import Path

import bpy
import numpy as np

REPO = Path(__file__).resolve().parents[3]
BLEND = Path(os.environ.get("LUNITO_BLEND", REPO.parent / "lunito.blend"))
if "body" not in bpy.data.objects:
    bpy.ops.wm.open_mainfile(filepath=str(BLEND))

# La sonrisa sobre la cara: z = Z0 + BEND * (x / HW)^2, |x| <= HW.
HW, Z0, BEND = 0.128, 0.188, 0.017
REGION = dict(x=0.26, z0=0.02, z1=0.31)  # zona de donde se aprende la superficie
MOVE = (0.035, 0.065)  # distancia a la curva: movimiento total / sin cambio
SHADE = (0.060, 0.100)  # lo mismo para las normales (un poco más ancho)


def curve_distance(x, z):
    xc = np.clip(x, -HW, HW)
    zc = Z0 + BEND * (xc / HW) ** 2
    return np.hypot(x - xc, z - zc)


def falloff(dist, full, none):
    t = np.clip((dist - full) / (none - full), 0, 1)
    return 1 - t * t * (3 - 2 * t)


def features(x, z):
    return np.stack([np.ones_like(x), x, z, x * x, x * z, z * z, x**3, x * x * z, x * z * z, z**3], axis=1)


def gradient(x, z, coef):
    """Derivadas de y = f(x, z) respecto a x y z."""
    zero, one = np.zeros_like(x), np.ones_like(x)
    dx = np.stack([zero, one, zero, 2 * x, z, zero, 3 * x * x, 2 * x * z, z * z, zero], axis=1) @ coef
    dz = np.stack([zero, zero, one, zero, x, 2 * z, zero, x * x, 2 * x * z, 3 * z * z], axis=1) @ coef
    return dx, dz


def world_coords(obj):
    me = obj.data
    co = np.empty(len(me.vertices) * 3, dtype=np.float64)
    me.vertices.foreach_get("co", co)
    mw = obj.matrix_world
    return co.reshape(-1, 3) @ np.array(mw.to_3x3()).T + np.array(mw.translation)


parts = [bpy.data.objects[n] for n in ("body", "belly")]
coords = {o.name: world_coords(o) for o in parts}


def front_region(co):
    return (np.abs(co[:, 0]) < REGION["x"]) & (co[:, 2] > REGION["z0"]) & (co[:, 2] < REGION["z1"]) & (co[:, 1] < -0.3)


# Superficie suave: se ajusta con la piel que rodea al surco (dos pasadas).
sample = np.concatenate([co[front_region(co)] for co in coords.values()])
dist = curve_distance(sample[:, 0], sample[:, 2])
use = dist > MOVE[1]
coef = None
for _ in range(3):
    coef, *_ = np.linalg.lstsq(features(sample[use, 0], sample[use, 2]), sample[use, 1], rcond=None)
    resid = np.abs(features(sample[:, 0], sample[:, 2]) @ coef - sample[:, 1])
    use = (dist > MOVE[1]) & (resid < 0.004)
print(f"ajuste con {int(use.sum())} vértices, error medio {resid[use].mean():.5f}, máximo {resid[use].max():.5f}")

for obj in parts:
    me = obj.data
    co = coords[obj.name]
    region = front_region(co)
    d = curve_distance(co[:, 0], co[:, 2])
    w_move = np.where(region, falloff(d, *MOVE), 0.0)
    w_shade = np.where(region, falloff(d, *SHADE), 0.0)

    # Posición: solo cambia la profundidad (Y del mundo).
    target_y = features(co[:, 0], co[:, 2]) @ coef
    moved = co.copy()
    moved[:, 1] = co[:, 1] * (1 - w_move) + target_y * w_move
    inv = np.array(obj.matrix_world.inverted().to_3x3()).T
    local = (moved - np.array(obj.matrix_world.translation)) @ inv

    # Normales actuales por esquina (las que trae el GLB), antes de mover nada.
    n_loops = len(me.loops)
    normals = np.empty(n_loops * 3, dtype=np.float32)
    me.corner_normals.foreach_get("vector", normals)
    normals = normals.reshape(-1, 3).astype(np.float64)
    loop_vert = np.empty(n_loops, dtype=np.int64)
    me.loops.foreach_get("vertex_index", loop_vert)

    me.vertices.foreach_set("co", local.ravel())

    # Normales: las de la superficie ajustada, y = f(x, z) mirando hacia -Y.
    dx, dz = gradient(co[:, 0], co[:, 2], coef)
    smooth = np.stack([dx, -np.ones_like(dx), dz], axis=1)
    smooth /= np.linalg.norm(smooth, axis=1, keepdims=True)
    smooth = smooth @ inv  # rotación pura: sirve también para normales
    w = w_shade[loop_vert][:, None]
    blended = normals * (1 - w) + smooth[loop_vert] * w
    blended /= np.linalg.norm(blended, axis=1, keepdims=True)
    me.normals_split_custom_set([tuple(n) for n in blended])
    me.update()
    print(f"{obj.name}: {int((w_move > 0).sum())} vértices movidos (máx {np.abs(moved[:, 1] - co[:, 1]).max():.4f}), "
          f"{int((w_shade > 0).sum())} con la normal alisada")

if bpy.data.filepath:
    bpy.ops.wm.save_mainfile()
    print("Guardado", bpy.data.filepath)
