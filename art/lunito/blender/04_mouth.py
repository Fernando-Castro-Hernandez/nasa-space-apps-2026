"""Paso 2 (docs/LUNITO-ARTE.md §3): crear la malla `mouth` con sus shape keys.

Uso:  blender -b -P art/lunito/blender/04_mouth.py
Abre el .blend del paso 1 (LUNITO_BLEND o ../lunito.blend), crea `mouth` y guarda.

La boca es un parche oscuro pegado a la cara: una línea central (la comisura a
comisura) y 4 anillos concéntricos alrededor. Cada forma se describe con pocos
números en el plano de la cara (X, Z) y se proyecta sobre la superficie de
`body` + `belly`, así todas las formas siguen la curvatura del cuerpo.
"""

import math
import os
from pathlib import Path

import bpy
from mathutils import Vector

REPO = Path(__file__).resolve().parents[3]
BLEND = Path(os.environ.get("LUNITO_BLEND", REPO.parent / "lunito.blend"))
if "body" not in bpy.data.objects:
    bpy.ops.wm.open_mainfile(filepath=str(BLEND))

# --- Parámetros -----------------------------------------------------------
OFFSET = 0.004  # separación de la cara (la pancita crece ~0.002 al latir)
TONGUE_LIFT = 0.0015  # la lengua va apenas delante del interior
HALF = 16  # segmentos de comisura a comisura (arriba); abajo, otros tantos
RINGS = 4  # anillos concéntricos alrededor de la línea central
TONGUE_SEGS = 16
TONGUE_RINGS = 2
CENTER_Z = 0.188  # centro de la sonrisa pintada

# Cada forma: hw = medio ancho, cz = altura del centro, bend = cuánto suben las
# comisuras, up/down = apertura hacia arriba/abajo desde la línea de sonrisa,
# push = empuje extra hacia adelante (labios en "u"). tongue=False: la forma no
# saca la lengua (las expresiones se suman a los visemas y la duplicarían).
# Apertura 100 % = 0.18 de alto.
SHAPES = {
    "Basis": dict(hw=0.125, cz=0.188, bend=0.016, up=0.006, down=0.006),
    "viseme_PP": dict(hw=0.095, cz=0.188, bend=0.003, up=0.004, down=0.004),
    "viseme_FF": dict(hw=0.105, cz=0.191, bend=0.006, up=0.007, down=0.009),
    "viseme_DD": dict(hw=0.115, cz=0.188, bend=0.012, up=0.012, down=0.030),
    "viseme_aa": dict(hw=0.115, cz=0.188, bend=0.006, up=0.024, down=0.110),
    "viseme_E": dict(hw=0.135, cz=0.188, bend=0.012, up=0.016, down=0.056),
    "viseme_I": dict(hw=0.150, cz=0.188, bend=0.016, up=0.010, down=0.026),
    "viseme_O": dict(hw=0.058, cz=0.184, bend=0.0, up=0.030, down=0.060),
    "viseme_U": dict(hw=0.036, cz=0.184, bend=0.0, up=0.018, down=0.032, push=0.006),
    "mouthSmile": dict(hw=0.160, cz=0.184, bend=0.034, up=0.008, down=0.045, push=0.005, tongue=False),
    "mouthPucker": dict(hw=0.034, cz=0.186, bend=0.0, up=0.008, down=0.008, push=0.004, tongue=False),
}

body = bpy.data.objects["body"]
belly = bpy.data.objects["belly"]


def front_y(x, z):
    """Y de la cara en (x, z): lo más al frente entre body y belly.

    Devuelve None si el rayo se cuela por la costura entre las dos partes y
    solo toca la espalda.
    """
    best = None
    for obj in (body, belly):
        inv = obj.matrix_world.inverted()
        ok, loc, _, _ = obj.ray_cast(inv @ Vector((x, -3.0, z)), Vector((0, 1, 0)))
        if ok:
            y = (obj.matrix_world @ loc).y
            if y < 0 and (best is None or y < best):
                best = y
    return best


ENVELOPE = 0.010
_RING = [(math.cos(a * math.pi / 4), math.sin(a * math.pi / 4)) for a in range(8)]


def smooth_surface(x, z, lift):
    """Punto delante de la cara, sobre la envolvente de la superficie.

    Se toma lo más al frente en un radio pequeño: así el parche pasa por encima
    del surco de la sonrisa esculpida y de la costura, y nunca queda hundido.
    """
    ys = [front_y(x, z)] + [front_y(x + ENVELOPE * c, z + ENVELOPE * s) for c, s in _RING]
    y = min(v for v in ys if v is not None)
    return Vector((x, y - lift, z))


def shape_points(hw, cz, bend, up, down, push=0.0, tongue=True):
    """Posiciones (mundo) de todos los vértices para una forma."""

    def base(t):
        return cz + bend * t * t

    def outline(t, top):
        r = math.sqrt(max(0.0, 1.0 - t * t))
        return Vector((hw * t, base(t) + (up if top else -down) * r))

    def spine(t):
        ts = 0.8 * t
        r = math.sqrt(1.0 - ts * ts)
        return Vector((hw * ts, base(ts) + 0.5 * (up - down) * r))

    pts2d = []
    # Línea central: HALF + 1 vértices.
    ts = [-math.cos(math.pi * s / HALF) for s in range(HALF + 1)]
    pts2d += [spine(t) for t in ts]
    # Anillos: 2 * HALF vértices cada uno (arriba de izquierda a derecha, abajo de regreso).
    ring_t = [(ts[s], True) for s in range(HALF)] + [(ts[HALF - s], False) for s in range(HALF)]
    for k in range(1, RINGS + 1):
        f = k / RINGS
        for t, top in ring_t:
            pts2d.append(spine(t).lerp(outline(t, top), f))
    pts = [smooth_surface(p.x, p.y, OFFSET + push) for p in pts2d]

    # Lengua: elipse en la parte baja; se encoge a un punto si la boca está casi cerrada.
    h = up + down
    grow = min(1.0, max(0.0, (h - 0.03) / 0.03)) if tongue else 0.0
    tc = Vector((0.0, cz - down + 0.36 * h))
    rx, rz = 0.48 * hw * grow, 0.22 * h * grow
    pts.append(smooth_surface(tc.x, tc.y, OFFSET + push + TONGUE_LIFT))
    for k in range(1, TONGUE_RINGS + 1):
        f = k / TONGUE_RINGS
        for s in range(TONGUE_SEGS):
            a = 2 * math.pi * s / TONGUE_SEGS
            pts.append(
                smooth_surface(
                    tc.x + rx * f * math.cos(a),
                    tc.y + rz * f * math.sin(a),
                    OFFSET + push + TONGUE_LIFT,
                )
            )
    return pts


def build_faces():
    faces, tongue_faces = [], []
    n = 2 * HALF
    ring0 = HALF + 1  # índice del primer vértice del anillo 1

    def ring(k, s):
        return ring0 + (k - 1) * n + (s % n)

    def spine_index(s):
        s %= n
        return s if s <= HALF else n - s

    for s in range(n):
        a, b = spine_index(s), spine_index(s + 1)
        faces.append((ring(1, s), ring(1, s + 1), b, a))
    for k in range(1, RINGS):
        for s in range(n):
            faces.append((ring(k + 1, s), ring(k + 1, s + 1), ring(k, s + 1), ring(k, s)))

    t0 = ring0 + RINGS * n  # centro de la lengua

    def tring(k, s):
        return t0 + 1 + (k - 1) * TONGUE_SEGS + (s % TONGUE_SEGS)

    for s in range(TONGUE_SEGS):
        tongue_faces.append((t0, tring(1, s), tring(1, s + 1)))
    for k in range(1, TONGUE_RINGS):
        for s in range(TONGUE_SEGS):
            tongue_faces.append((tring(k, s), tring(k + 1, s), tring(k + 1, s + 1), tring(k, s + 1)))
    return faces, tongue_faces


def srgb_to_linear(hex_color):
    def ch(v):
        v /= 255.0
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4

    h = hex_color.lstrip("#")
    return tuple(ch(int(h[i : i + 2], 16)) for i in (0, 2, 4)) + (1.0,)


def material(name, hex_color, roughness):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = srgb_to_linear(hex_color)
    bsdf.inputs["Metallic"].default_value = 0.0
    bsdf.inputs["Roughness"].default_value = roughness
    mat.diffuse_color = srgb_to_linear(hex_color)
    return mat


# --- Construcción -----------------------------------------------------------
old = bpy.data.objects.get("mouth")
if old is not None:
    old_mesh = old.data
    bpy.data.objects.remove(old, do_unlink=True)
    if old_mesh.users == 0:
        bpy.data.meshes.remove(old_mesh)

origin = Vector((0.0, front_y(0.0, CENTER_Z + 0.01), CENTER_Z))
basis = shape_points(**SHAPES["Basis"])
faces, tongue_faces = build_faces()

mesh = bpy.data.meshes.new("mouth")
mesh.from_pydata([tuple(p - origin) for p in basis], [], faces + tongue_faces)
# Las caras deben mirar hacia afuera (-Y).
if sum(p.normal.y for p in mesh.polygons) > 0:
    mesh.flip_normals()
mesh.materials.append(material("mouth_inside", "#2a0f3d", 0.8))
mesh.materials.append(material("mouth_tongue", "#ff7fb6", 0.6))
for i, poly in enumerate(mesh.polygons):
    poly.material_index = 1 if i >= len(faces) else 0
    poly.use_smooth = True
uv = mesh.uv_layers.new(name="UVMap")
for loop in mesh.loops:
    co = mesh.vertices[loop.vertex_index].co
    uv.data[loop.index].uv = (0.5 + co.x / 0.4, 0.5 + co.z / 0.4)
mesh.update()

mouth = bpy.data.objects.new("mouth", mesh)
mouth.location = origin
body.users_collection[0].objects.link(mouth)

mouth.shape_key_add(name="Basis")
for name, params in SHAPES.items():
    if name == "Basis":
        continue
    key = mouth.shape_key_add(name=name, from_mix=False)
    for i, p in enumerate(shape_points(**params)):
        key.data[i].co = p - origin
    key.value = 0.0

print(f"mouth: {len(mesh.vertices)} vértices, {len(mesh.polygons)} caras, origen {tuple(round(v, 3) for v in origin)}")
print("shape keys:", [k.name for k in mesh.shape_keys.key_blocks])

if bpy.data.filepath:
    bpy.ops.wm.save_mainfile()
    print("Guardado", bpy.data.filepath)
