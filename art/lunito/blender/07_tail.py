"""Paso 5, cola (docs/LUNITO-ARTE.md §5): separar `tail` de `body`.

Uso:  blender -b -P art/lunito/blender/07_tail.py

La cola es un bulto pegado a la espalda. Se corta `body` con un plano que sigue
la espalda, lo que queda del lado de afuera pasa a un objeto nuevo `tail` con el
origen en la base (el centro del corte), y se tapan los dos lados del corte:
`body` con una tapa plana y `tail` con una base redondeada que entra en el
cuerpo, para que al rotarla no se vea ningún hueco.
"""

import os
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector

REPO = Path(__file__).resolve().parents[3]
BLEND = Path(os.environ.get("LUNITO_BLEND", REPO.parent / "lunito.blend"))
if "body" not in bpy.data.objects:
    bpy.ops.wm.open_mainfile(filepath=str(BLEND))

# Plano de corte (mundo): pasa por la espalda, apenas inclinado como ella.
PLANE_CO = Vector((0.0, 0.60, -0.20))
PLANE_NO = Vector((0.0, 0.45, -0.08)).normalized()  # apunta hacia la cola


def in_region(co):
    """Caja alrededor de la cola: fuera de ella el plano no toca el cuerpo."""
    return abs(co.x) < 0.33 and -0.90 < co.z < -0.12 and co.y > 0.35


body = bpy.data.objects["body"]
if "tail" in bpy.data.objects:
    print("tail ya existe: no se hace nada")
else:
    image = next(
        n.image
        for n in body.data.materials[0].node_tree.nodes
        if n.type == "TEX_IMAGE"
        and n.outputs["Color"].links
        and n.outputs["Color"].links[0].to_socket.name == "Base Color"
    )
    img_w, img_h = image.size
    pixels = list(image.pixels)

    def luminance(uv):
        i = (int(uv[1] * img_h) % img_h * img_w + int(uv[0] * img_w) % img_w) * 4
        return pixels[i] + pixels[i + 1] + pixels[i + 2]

    def median_uv(uvs):
        return sorted(uvs, key=luminance)[len(uvs) // 2]

    def key(co):
        return tuple(round(c, 5) for c in co)

    def side(co):
        return (co - PLANE_CO).dot(PLANE_NO)

    bm = bmesh.new()
    bm.from_mesh(body.data)  # body no tiene transformación: local = mundo
    uv_layer = bm.loops.layers.uv.verify()

    region_faces = [f for f in bm.faces if all(in_region(v.co) for v in f.verts)]
    geom = set(region_faces)
    for f in region_faces:
        geom.update(f.edges)
        geom.update(f.verts)
    bmesh.ops.bisect_plane(bm, geom=list(geom), plane_co=PLANE_CO, plane_no=PLANE_NO, dist=1e-6)

    tail_faces = [
        f for f in bm.faces
        if all(in_region(v.co) for v in f.verts) and side(f.calc_center_median()) > 1e-6
    ]
    tail_set = set(tail_faces)

    # Contorno del corte: aristas de la cola que quedaron sobre el plano.
    cut_edges = set()
    tail_cut_uvs, body_cut_uvs = [], []
    for f in tail_faces:
        for e in f.edges:
            if all(abs(side(v.co)) < 1e-5 for v in e.verts):
                a, b = key(e.verts[0].co), key(e.verts[1].co)
                if a != b:
                    cut_edges.add((min(a, b), max(a, b)))
        tail_cut_uvs += [tuple(l[uv_layer].uv) for l in f.loops if abs(side(l.vert.co)) < 1e-5]
    cut_keys = {k for e in cut_edges for k in e}
    for f in bm.faces:
        if f not in tail_set:
            body_cut_uvs += [tuple(l[uv_layer].uv) for l in f.loops if key(l.vert.co) in cut_keys]

    # Ordenar el contorno en ciclos cerrados.
    neighbours = {}
    for a, b in cut_edges:
        neighbours.setdefault(a, []).append(b)
        neighbours.setdefault(b, []).append(a)
    loops, seen = [], set()
    for start in neighbours:
        if start in seen:
            continue
        loop, prev, cur = [start], None, start
        seen.add(start)
        while True:
            options = [k for k in neighbours[cur] if k != prev and k not in seen]
            if not options:
                break
            prev, cur = cur, options[0]
            seen.add(cur)
            loop.append(cur)
        if len(loop) >= 3:
            loops.append([Vector(k) for k in loop])
    loops.sort(key=len, reverse=True)
    main = loops[0]
    centre = sum(main, Vector()) / len(main)
    print(f"corte: {len(tail_faces)} caras de cola, {len(loops)} contorno(s), el mayor de {len(main)} vértices")

    # --- Objeto tail ---------------------------------------------------------
    tail_bm = bmesh.new()
    tail_uv = tail_bm.loops.layers.uv.verify()
    made = {}

    def tail_vert(co):
        k = key(co)
        if k not in made:
            made[k] = tail_bm.verts.new(co - centre)
        return made[k]

    for f in tail_faces:
        try:
            nf = tail_bm.faces.new([tail_vert(v.co) for v in f.verts])
        except ValueError:
            continue
        nf.smooth = True
        for loop, src in zip(nf.loops, f.loops):
            loop[tail_uv].uv = src[uv_layer].uv

    def add_cap(target, uv_l, points, offset, uv, facing, depth):
        """Tapa un contorno. depth > 0 hace una base redondeada hacia -PLANE_NO."""
        c = sum(points, Vector()) / len(points)
        rim = [target.verts.new(p - offset) for p in points]
        faces = []
        n = len(rim)
        if depth > 0:
            mid = [target.verts.new(c + (p - c) * 0.62 - PLANE_NO * depth * 0.7 - offset) for p in points]
            apex = target.verts.new(c - PLANE_NO * depth - offset)
            for i in range(n):
                j = (i + 1) % n
                faces.append(target.faces.new((rim[i], rim[j], mid[j], mid[i])))
                faces.append(target.faces.new((mid[i], mid[j], apex)))
        else:
            apex = target.verts.new(c - offset)
            for i in range(n):
                faces.append(target.faces.new((rim[i], rim[(i + 1) % n], apex)))
        for face in faces:
            face.normal_update()
            if face.normal.dot(facing) < 0:
                face.normal_flip()
            face.smooth = True
            for loop in face.loops:
                loop[uv_l].uv = uv

    for points in loops:
        add_cap(tail_bm, tail_uv, points, centre, median_uv(tail_cut_uvs), -PLANE_NO, depth=0.045)
    bmesh.ops.triangulate(tail_bm, faces=[f for f in tail_bm.faces if len(f.verts) > 3])
    tail_mesh = bpy.data.meshes.new("tail")
    tail_bm.to_mesh(tail_mesh)
    tail_bm.free()
    tail_mesh.materials.append(body.data.materials[0])
    tail_mesh.uv_layers[0].name = body.data.uv_layers.active.name
    tail = bpy.data.objects.new("tail", tail_mesh)
    tail.location = centre
    body.users_collection[0].objects.link(tail)

    # --- body sin la cola, con su tapa -----------------------------------------
    bmesh.ops.delete(bm, geom=tail_faces, context="FACES")
    for points in loops:
        add_cap(bm, uv_layer, points, Vector(), median_uv(body_cut_uvs), PLANE_NO, depth=0.0)
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 3])
    bm.to_mesh(body.data)
    bm.free()
    body.data.update()
    print(f"tail: {len(tail_mesh.polygons)} caras, origen {tuple(round(c, 3) for c in centre)}; body: {len(body.data.polygons)} caras")

if bpy.data.filepath:
    bpy.ops.wm.save_mainfile()
    print("Guardado", bpy.data.filepath)
