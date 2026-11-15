"""Paso 3 (docs/LUNITO-ARTE.md §4): shape keys de `eye_L` y `eye_R`.

Uso:  blender -b -P art/lunito/blender/05_eyes.py

Cada ojo es un cascarón que tapa un hueco de `body`, así que no se puede
aplastar para cerrarlo (se vería el hueco). En su lugar, a la malla del ojo se
le agregan dos piezas que en reposo quedan escondidas dentro del globo:

- un párpado: copia de la superficie del ojo, con color de piel;
- una línea oscura: la pestaña del ojo cerrado.

Formas:
- eyeBlink: sale el párpado y la línea, apenas curvada hacia abajo.
- eyeHappy: sale el párpado y la línea en arco hacia arriba (^ ^).
- eyeWide:  el ojo crece.

eyeBlink y eyeHappy no se suman entre sí: se usa una u otra. `body` no se toca.
"""

import math
import os
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector
from mathutils.interpolate import poly_3d_calc

REPO = Path(__file__).resolve().parents[3]
BLEND = Path(os.environ.get("LUNITO_BLEND", REPO.parent / "lunito.blend"))
if "body" not in bpy.data.objects:
    bpy.ops.wm.open_mainfile(filepath=str(BLEND))

LID_OUT = 0.004  # el párpado cerrado queda esta distancia delante del globo
LID_IN = 0.004  # y en reposo, esta distancia por dentro
LINE_OUT = 0.0025  # la línea va delante del párpado
LINE_SEGS = 14
EXTRA_GROUP = "eye_extra"  # vértices agregados por este script (para poder repetirlo)

body = bpy.data.objects["body"]
color_image = next(
    n.image
    for n in body.data.materials[0].node_tree.nodes
    if n.type == "TEX_IMAGE"
    and n.outputs["Color"].links
    and n.outputs["Color"].links[0].to_socket.name == "Base Color"
)
IMG_W, IMG_H = color_image.size
PIXELS = list(color_image.pixels)


def luminance(uv):
    i = (int(uv[1] * IMG_H) % IMG_H * IMG_W + int(uv[0] * IMG_W) % IMG_W) * 4
    return PIXELS[i] + PIXELS[i + 1] + PIXELS[i + 2]


def skin_uv(center, normal, side, up):
    """Una UV de `body` con el color de la piel que rodea al ojo."""
    mesh = body.data
    uv_data = mesh.uv_layers.active.data
    uvs = []
    for i in range(24):
        a = 2 * math.pi * i / 24
        start = center + (side * math.cos(a) + up * math.sin(a)) * 0.085 + normal * 0.3
        ok, loc, _, fi = body.ray_cast(start, -normal)
        if not ok or (loc - start).length > 0.45:
            continue  # el rayo se coló por una costura
        poly = mesh.polygons[fi]
        w = poly_3d_calc([mesh.vertices[v].co for v in poly.vertices], loc)
        uvs.append(sum((Vector(uv_data[li].uv) * wi for li, wi in zip(poly.loop_indices, w)), Vector((0, 0))))
    return sorted(uvs, key=luminance)[len(uvs) // 2]


def eye_frame(eye):
    """Centro (del contorno), normal hacia afuera, ejes y medidas del ojo (mundo)."""
    me = eye.data
    to_world = eye.matrix_world
    mean = sum((to_world @ v.co for v in me.vertices), Vector()) / len(me.vertices)
    normal = sum((p.normal * p.area for p in me.polygons), Vector()).normalized()
    up = (Vector((0, 0, 1)) - normal * normal.z).normalized()
    side = up.cross(normal).normalized()
    rel = [(to_world @ v.co) - mean for v in me.vertices]
    a = [p.dot(side) for p in rel]
    b = [p.dot(up) for p in rel]
    center = mean + side * (min(a) + max(a)) / 2 + up * (min(b) + max(b)) / 2
    ra, rb = (max(a) - min(a)) / 2, (max(b) - min(b)) / 2
    d = [((to_world @ v.co) - center).dot(normal) for v in me.vertices]
    return center, normal, side, up, ra, rb, min(d), max(d)


def adopt_eye_faces(eye, by_footprint):
    """Pasa a la malla del ojo las caras del globo que quedaron en `body`.

    En la separación original, parte del ojo (sobre todo del izquierdo) se quedó
    en `body`. Sin esto, el párpado solo taparía medio ojo. Primero se toman las
    caras con el azul oscuro del ojo; después, con el contorno ya completo, las
    que quedan dentro de él (el brillo blanco).
    """
    eye_me = eye.data
    center, normal, side, up, ra, rb, d_min, _ = eye_frame(eye)
    src = bmesh.new()
    src.from_mesh(body.data)
    src_uv = src.loops.layers.uv.verify()
    near = [f for f in src.faces if (f.calc_center_median() - center).length < 0.09]

    def face_lum(f):
        uv = sum((loop[src_uv].uv for loop in f.loops), Vector((0, 0))) / len(f.loops)
        return luminance(uv)

    def key(v):
        return tuple(round(c, 5) for c in v.co)

    def inside(f):
        p = f.calc_center_median() - center
        return (p.dot(side) / ra) ** 2 + (p.dot(up) / rb) ** 2 < 0.7 and p.dot(normal) > d_min - 0.02

    if by_footprint:
        chosen = {f for f in near if inside(f)}
    else:
        chosen = {f for f in near if face_lum(f) < 1.35}
        # Caras claras rodeadas por las oscuras también son ojo.
        while True:
            positions = {key(v) for f in chosen for v in f.verts}
            more = {f for f in near if f not in chosen and all(key(v) in positions for v in f.verts)}
            if not more:
                break
            chosen |= more
    if not chosen:
        src.free()
        return

    dst = bmesh.new()
    dst.from_mesh(eye_me)
    dst_uv = dst.loops.layers.uv.verify()
    to_eye = eye.matrix_world.inverted() @ body.matrix_world
    made = {}
    for f in chosen:
        verts = []
        for v in f.verts:
            k = key(v)
            if k not in made:
                made[k] = dst.verts.new(to_eye @ v.co)
            verts.append(made[k])
        try:
            new_face = dst.faces.new(verts)
        except ValueError:
            continue  # cara duplicada
        new_face.smooth = True
        for loop, src_loop in zip(new_face.loops, f.loops):
            loop[dst_uv].uv = src_loop[src_uv].uv
    bmesh.ops.remove_doubles(dst, verts=dst.verts, dist=1e-4)
    dst.to_mesh(eye_me)
    dst.free()
    eye_me.update()

    count = len(chosen)
    bmesh.ops.delete(src, geom=list(chosen), context="FACES")
    src.to_mesh(body.data)
    src.free()
    body.data.update()
    print(f"{eye.name}: {count} caras del globo pasaron de body al ojo")


for name in ("eye_L", "eye_R"):
    eye = bpy.data.objects[name]
    me = eye.data
    if me.shape_keys:
        eye.shape_key_clear()

    # Quitar lo agregado en una corrida anterior.
    group = eye.vertex_groups.get(EXTRA_GROUP) or eye.vertex_groups.new(name=EXTRA_GROUP)
    bm = bmesh.new()
    bm.from_mesh(me)
    deform = bm.verts.layers.deform.verify()
    old = [v for v in bm.verts if group.index in v[deform]]
    if old:
        bmesh.ops.delete(bm, geom=old, context="VERTS")
    bm.to_mesh(me)
    bm.free()
    me.update()
    adopt_eye_faces(eye, by_footprint=False)
    adopt_eye_faces(eye, by_footprint=True)

    # Marco del ojo: centro, normal hacia afuera, eje horizontal y vertical.
    to_world = eye.matrix_world
    to_local = to_world.inverted()
    center, normal, side, up, ra, rb, d_min, d_max = eye_frame(eye)

    # UV de piel (párpado) y UV más oscura del propio ojo (línea).
    lid_uv = skin_uv(center, normal, side, up)
    line_uv = min((tuple(l.uv) for l in me.uv_layers.active.data), key=luminance)

    # Dónde va la línea sobre el globo, para cada forma.
    last_hit = [d_max]

    def on_eye(a, b):
        """Punto (mundo) sobre la superficie del ojo en las coordenadas (a, b) del marco."""
        start = center + side * a + up * b + normal * 0.3
        ok, loc, _, _ = eye.ray_cast(to_local @ start, to_local.to_3x3() @ -normal)
        if ok:
            last_hit[0] = ((to_world @ loc) - center).dot(normal)
        return center + side * a + up * b + normal * last_hit[0]

    def line_points(arch, drop, lift):
        """Dos filas de puntos (arriba y abajo) de la línea; arch > 0 curva hacia arriba."""
        pts = []
        for s in range(LINE_SEGS + 1):
            t = -1 + 2 * s / LINE_SEGS
            a = 0.80 * ra * t
            mid = rb * (drop + arch * (0.5 - t * t))
            half = rb * 0.085 * (0.45 + 0.55 * math.sqrt(max(0.0, 1 - t * t)))
            for sign in (1, -1):
                pts.append(on_eye(a, mid + sign * half) + normal * lift)
        return pts

    blink_line = line_points(arch=-0.16, drop=-0.10, lift=LID_OUT + LINE_OUT)
    happy_line = line_points(arch=0.55, drop=0.0, lift=LID_OUT + LINE_OUT)

    def top_edge(a):
        """Altura del borde de arriba del ojo en la columna a (un poco por dentro)."""
        return 0.86 * rb * math.sqrt(max(0.0, 1 - (a / ra) ** 2))

    # En reposo, la línea espera plegada bajo el borde de arriba del ojo.
    hidden_line = []
    for s in range(LINE_SEGS + 1):
        a = 0.80 * ra * (-1 + 2 * s / LINE_SEGS)
        p = on_eye(a, top_edge(a)) - normal * (LID_IN + 0.004)
        hidden_line += [p, p.copy()]

    # Geometría nueva: párpado (un vértice por cada vértice del ojo) y línea.
    n = len(me.vertices)
    normals = [v.normal.copy() for v in me.vertices]
    basis_co = [v.co.copy() for v in me.vertices]

    # En reposo el párpado está plegado bajo el borde de arriba: cada vértice
    # espera en lo alto de su columna. Al cerrar baja hasta su sitio, así que el
    # párpado se despliega de arriba hacia abajo en vez de aparecer de golpe.
    hidden_lid = []
    for i in range(n):
        p = (to_world @ basis_co[i]) - center
        a, b = p.dot(side), p.dot(up)
        if b >= top_edge(a):
            hidden_lid.append(basis_co[i] - normals[i] * LID_IN)
        else:
            hidden_lid.append(to_local @ (on_eye(a, top_edge(a)) - normal * LID_IN))
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.verts.ensure_lookup_table()
    deform = bm.verts.layers.deform.verify()
    uv_layer = bm.loops.layers.uv.verify()
    original_faces = list(bm.faces)
    lid = [bm.verts.new(hidden_lid[i]) for i in range(n)]
    for face in original_faces:
        new_face = bm.faces.new([lid[v.index] for v in face.verts])
        new_face.smooth = True
        for loop in new_face.loops:
            loop[uv_layer].uv = lid_uv
    line = [bm.verts.new(to_local @ p) for p in hidden_line]
    for s in range(LINE_SEGS):
        top0, bot0, top1, bot1 = line[2 * s], line[2 * s + 1], line[2 * s + 2], line[2 * s + 3]
        new_face = bm.faces.new((top0, bot0, bot1, top1))
        new_face.normal_update()
        if new_face.normal.dot(to_local.to_3x3() @ normal) < 0:
            new_face.normal_flip()
        new_face.smooth = True
        for loop in new_face.loops:
            loop[uv_layer].uv = line_uv
    for v in lid + line:
        v[deform][group.index] = 1.0
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 3])
    bm.to_mesh(me)
    bm.free()
    me.update()

    # Posiciones de cada forma, en el orden: ojo, párpado, línea.
    closed_lid = [basis_co[i] + normals[i] * LID_OUT for i in range(n)]
    hidden_line_local = [to_local @ p for p in hidden_line]
    basis_all = basis_co + hidden_lid + hidden_line_local

    def widen(co, scale=1.22):
        p = (to_world @ co) - center
        a, b, d = p.dot(side), p.dot(up), p.dot(normal)
        d = d_min + (d - d_min) * (1 + (scale - 1) * 0.6)
        return to_local @ (center + side * a * scale + up * b * scale + normal * d)

    shapes = {
        "eyeBlink": basis_co + closed_lid + [to_local @ p for p in blink_line],
        "eyeHappy": basis_co + closed_lid + [to_local @ p for p in happy_line],
        "eyeWide": [widen(co) for co in basis_all],
    }
    eye.shape_key_add(name="Basis")
    for key_name, coords in shapes.items():
        key = eye.shape_key_add(name=key_name, from_mix=False)
        for i, co in enumerate(coords):
            key.data[i].co = co
        key.value = 0.0
    print(f"{name}: {n} + {len(lid)} + {len(line)} vértices, shape keys {[k.name for k in me.shape_keys.key_blocks]}")

if bpy.data.filepath:
    bpy.ops.wm.save_mainfile()
    print("Guardado", bpy.data.filepath)
