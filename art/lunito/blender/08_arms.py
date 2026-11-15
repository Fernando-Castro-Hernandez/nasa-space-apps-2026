"""Paso 5, brazos (docs/LUNITO-ARTE.md §5): separar `arm_L` y `arm_R`.

Uso:  blender -b -P art/lunito/blender/08_arms.py

Cada brazo es un relieve pegado al torso, repartido entre dos mallas: la mitad de
afuera está en `body` y la de adentro en `belly`. Para separarlo:

1. Se reconstruye la piel del torso que habría debajo del brazo: una superficie
   suave (spline de placa delgada) apoyada en la piel que lo rodea.
2. Se cortan `body` y `belly` donde el brazo se despega de esa superficie y lo
   que queda por fuera pasa a un objeto nuevo (`arm_L` / `arm_R`), con el origen
   en el hombro.
3. El hueco del torso se tapa con un parche que sigue esa misma superficie; cada
   triángulo del parche va a `body` o a `belly` según la piel que tenga más
   cerca, para que el semáforo de la pancita lo tiña igual que al resto.
4. El brazo se cierra por debajo con una base que entra un poco en el torso.
5. Los parches se pintan en un hueco libre de la textura, continuando los
   colores de la piel de alrededor.

Convención de lados, igual que en las branquias y los ojos: L es -X, R es +X.
"""

import math
import os
from pathlib import Path

import bmesh
import bpy
import numpy as np
from mathutils import Vector
from mathutils.geometry import delaunay_2d_cdt

REPO = Path(__file__).resolve().parents[3]
BLEND = Path(os.environ.get("LUNITO_BLEND", REPO.parent / "lunito.blend"))
if "body" not in bpy.data.objects:
    bpy.ops.wm.open_mainfile(filepath=str(BLEND))

EPS = 0.012  # el brazo empieza donde la malla se despega esto de la piel del torso
# Zona del brazo, como una elipse sobre el torso: (centro, semieje) del ángulo
# desde el frente, en radianes, y de la altura. Todo el brazo cae dentro; la piel
# de referencia se toma del anillo que la rodea, sin tocar pies ni cachetes.
ZONE_PHI = (math.radians(55), math.radians(52))
ZONE_Z = (-0.24, 0.30)
RING_OUTER = 1.45
RING_Z = (-0.56, 0.14)
PATCH_STEP = 0.022  # separación de los vértices interiores del parche
BASE_DEPTH = 0.03  # cuánto entra en el torso la base del brazo
U_SCALE = 0.6  # metros por radián: pone el ángulo en la misma escala que la altura
# Huecos libres de la textura (x0, y0, lado en píxeles) donde se pintan los parches.
ATLAS_SLOTS = {"arm_R": (441, 687, 43), "arm_L": (592, 494, 38)}
ATLAS_PAD = 2
# Franja del brazo que se repinta: del todo hasta FRINGE[0] de altura sobre el
# corte, nada a partir de FRINGE[1].
FRINGE = (0.02, 0.05)
# Un texel es "de pancita" si su verde supera a su rojo por al menos esto.
TEAL_MIN = 0.30
# Altura sobre la piel hasta la que una cara con color de pancita se queda en belly.
APRON_HEIGHT = 0.035

body = bpy.data.objects["body"]
belly = bpy.data.objects["belly"]
SOURCES = (body, belly)


def tex_image(socket_name):
    nodes = body.data.materials[0].node_tree.nodes
    for node in nodes:
        if node.type == "TEX_IMAGE" and node.image and node.outputs["Color"].links:
            to = node.outputs["Color"].links[0].to_node
            if socket_name == "Base Color" and node.outputs["Color"].links[0].to_socket.name == "Base Color":
                return node.image
            if socket_name == "Normal" and to.type == "NORMAL_MAP":
                return node.image
    return None


COLOR_IMG = tex_image("Base Color")
NORMAL_IMG = tex_image("Normal")
IMG_W, IMG_H = COLOR_IMG.size


def load_pixels(img):
    px = np.empty(IMG_W * IMG_H * 4, dtype=np.float32)
    img.pixels.foreach_get(px)
    return px.reshape(IMG_H, IMG_W, 4)


def world_coords(obj):
    me = obj.data
    co = np.empty(len(me.vertices) * 3, dtype=np.float64)
    me.vertices.foreach_get("co", co)
    mw = obj.matrix_world
    return co.reshape(-1, 3) @ np.array(mw.to_3x3()).T + np.array(mw.translation)


class Torso:
    """Coordenadas cilíndricas alrededor del eje vertical y la piel bajo un brazo."""

    def __init__(self, sign):
        self.sign = sign  # +1 para el lado +X, -1 para el lado -X

    def params(self, p):
        """(u, v, r): ángulo desde el frente (en metros), altura y radio."""
        p = np.atleast_2d(p)
        u = np.arctan2(self.sign * p[:, 0], -p[:, 1]) * U_SCALE
        return u, p[:, 2], np.hypot(p[:, 0], p[:, 1])

    def point(self, u, v, r):
        phi = u / U_SCALE
        return np.stack([self.sign * r * np.sin(phi), -r * np.cos(phi), v], axis=-1)

    def rho(self, pts):
        """Radio normalizado respecto a la zona del brazo: < 1 dentro de la elipse."""
        u, v, _ = self.params(pts)
        front = (pts[:, 1] < 0.40) if pts.ndim == 2 else True
        rho = np.hypot((u / U_SCALE - ZONE_PHI[0]) / ZONE_PHI[1], (v - ZONE_Z[0]) / ZONE_Z[1])
        return np.where(front, rho, 99.0)

    def fit_skin(self, pts):
        """Spline de placa delgada sobre la piel que rodea la zona del brazo."""
        rho = self.rho(pts)
        ring = (rho > 1.0) & (rho < RING_OUTER) & (pts[:, 2] > RING_Z[0]) & (pts[:, 2] < RING_Z[1])
        u, v, r = self.params(pts[ring])
        self.centre = np.array([u.mean(), v.mean()])
        xy = np.stack([u, v], axis=1) - self.centre
        for _ in range(2):  # una segunda vuelta sin los puntos raros
            self._solve(xy, r)
            keep = np.abs(self._eval(xy) - r) < 0.012
            xy, r = xy[keep], r[keep]
        self._solve(xy, r)
        resid = self._eval(xy) - r
        print(f"  piel bajo el brazo: {len(r)} puntos de apoyo, error medio {np.abs(resid).mean():.4f}")

    @staticmethod
    def _kernel(d):
        with np.errstate(divide="ignore", invalid="ignore"):
            k = d * d * np.log(d)
        return np.nan_to_num(k)

    def _solve(self, xy, r, smooth=2e-4):
        n = len(xy)
        k = self._kernel(np.linalg.norm(xy[:, None] - xy[None, :], axis=2)) + smooth * n * np.eye(n)
        p = np.concatenate([np.ones((n, 1)), xy], axis=1)
        system = np.block([[k, p], [p.T, np.zeros((3, 3))]])
        sol = np.linalg.solve(system, np.concatenate([r, np.zeros(3)]))
        self.nodes, self.weights, self.affine = xy, sol[:n], sol[n:]

    def _eval(self, xy):
        k = self._kernel(np.linalg.norm(xy[:, None] - self.nodes[None, :], axis=2))
        return k @ self.weights + self.affine[0] + xy @ self.affine[1:]

    def skin_radius(self, u, v):
        xy = np.stack([np.atleast_1d(u), np.atleast_1d(v)], axis=1) - self.centre
        return self._eval(xy)

    def height(self, pts):
        """Cuánto sobresale un punto de la piel reconstruida, menos el margen EPS."""
        u, v, r = self.params(pts)
        return r - self.skin_radius(u, v) - EPS


def key(co):
    return (round(co[0], 5), round(co[1], 5), round(co[2], 5))


def split_sources(torso):
    """Corta body y belly por la superficie del brazo. Devuelve los bmesh y las caras del brazo."""
    result = []
    for obj in SOURCES:
        mw = obj.matrix_world
        inv = mw.inverted()
        bm = bmesh.new()
        bm.from_mesh(obj.data)
        uv_layer = bm.loops.layers.uv.verify()
        world = np.array([mw @ v.co for v in bm.verts])
        near = torso.rho(world) < 1.0
        h = np.where(near, torso.height(world), -1.0)
        for v, hv in zip(bm.verts, h):
            v.tag = False
        height = {v: float(hv) for v, hv in zip(bm.verts, h)}
        near_of = {v: bool(n) for v, n in zip(bm.verts, near)}
        made = {}
        cut_verts = set()

        def cut_point(va, vb):
            # Orden fijo de los extremos: el mismo punto exacto en las dos mallas.
            pa, pb = mw @ va.co, mw @ vb.co
            ha, hb = height[va], height[vb]
            if key(pa) > key(pb):
                pa, pb, ha, hb = pb, pa, hb, ha
            t = ha / (ha - hb)
            p = pa.lerp(pb, t)
            k = key(p)
            if k not in made:
                made[k] = bm.verts.new(inv @ p)
                height[made[k]] = 0.0
                near_of[made[k]] = True
                cut_verts.add(made[k])
            return made[k]

        arm_faces = []
        for face in list(bm.faces):
            verts = list(face.verts)
            if len(verts) != 3 or not all(near_of[v] for v in verts):
                continue
            pos = [height[v] > 0 for v in verts]
            if all(pos):
                arm_faces.append(face)
                continue
            if not any(pos):
                continue
            loops = list(face.loops)
            uvs = [l[uv_layer].uv.copy() for l in loops]
            lone = pos.index(True) if sum(pos) == 1 else pos.index(False)
            ia, ib, ic = lone, (lone + 1) % 3, (lone + 2) % 3
            a, b, c = verts[ia], verts[ib], verts[ic]
            tb = height[a] / (height[a] - height[b])
            tc = height[a] / (height[a] - height[c])
            p, q = cut_point(a, b), cut_point(a, c)
            uv_p, uv_q = uvs[ia].lerp(uvs[ib], tb), uvs[ia].lerp(uvs[ic], tc)
            pieces = [
                ((a, p, q), (uvs[ia], uv_p, uv_q), pos[ia]),
                ((p, b, c), (uv_p, uvs[ib], uvs[ic]), pos[ib]),
                ((p, c, q), (uv_p, uvs[ic], uv_q), pos[ib]),
            ]
            material, smooth = face.material_index, face.smooth
            bm.faces.remove(face)
            for tri, tri_uvs, is_arm in pieces:
                if len({id(v) for v in tri}) < 3:
                    continue
                try:
                    nf = bm.faces.new(tri)
                except ValueError:
                    continue
                nf.material_index, nf.smooth = material, smooth
                for loop, uv in zip(nf.loops, tri_uvs):
                    loop[uv_layer].uv = uv
                if is_arm:
                    arm_faces.append(nf)
        result.append(dict(obj=obj, bm=bm, uv=uv_layer, arm_faces=arm_faces, cut=cut_verts, height=height))
    return result


def largest_component(parts):
    """De todas las caras por fuera de la piel, las del bulto más grande: el brazo."""
    parent = {}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    faces = []
    for part in parts:
        mw = part["obj"].matrix_world
        for f in part["arm_faces"]:
            keys = [key(mw @ v.co) for v in f.verts]
            faces.append((part, f, keys))
            for k in keys:
                parent.setdefault(k, k)
            for k in keys[1:]:
                ra, rb = find(keys[0]), find(k)
                if ra != rb:
                    parent[ra] = rb
    count = {}
    for _, _, keys in faces:
        root = find(keys[0])
        count[root] = count.get(root, 0) + 1
    best = max(count, key=count.get)
    for part in parts:
        part["arm_faces"] = []
    for part, f, keys in faces:
        if find(keys[0]) == best:
            part["arm_faces"].append(f)
    return count[best], len(faces)


def contour_loop(parts):
    """El borde del corte, como una lista ordenada de puntos (mundo)."""
    edges = set()
    for part in parts:
        mw = part["obj"].matrix_world
        for f in part["arm_faces"]:
            for e in f.edges:
                if e.verts[0] in part["cut"] and e.verts[1] in part["cut"]:
                    a, b = key(mw @ e.verts[0].co), key(mw @ e.verts[1].co)
                    if a != b:
                        edges.add((min(a, b), max(a, b)))
    neighbours = {}
    for a, b in edges:
        neighbours.setdefault(a, []).append(b)
        neighbours.setdefault(b, []).append(a)
    # Tramos: primero los abiertos (empiezan en un extremo suelto), luego los cerrados.
    chains, seen = [], set()
    starts = [k for k, v in neighbours.items() if len(v) == 1] + list(neighbours)
    for start in starts:
        if start in seen:
            continue
        chain, prev, cur = [start], None, start
        seen.add(start)
        while True:
            options = [k for k in neighbours[cur] if k != prev and k not in seen]
            if not options:
                break
            prev, cur = cur, options[0]
            seen.add(cur)
            chain.append(cur)
        chains.append([np.array(k) for k in chain])
    # La costura entre body y belly tiene rendijas que parten el contorno: los
    # tramos se enlazan por sus extremos más cercanos hasta cerrar el lazo.
    chains.sort(key=len, reverse=True)
    loop, rest, bridged = chains[0], chains[1:], 0.0
    while rest:
        tail = loop[-1]
        best = min(
            ((np.linalg.norm(c[e] - tail), i, e) for i, c in enumerate(rest) for e in (0, -1)),
            key=lambda item: item[0],
        )
        gap_back = np.linalg.norm(loop[0] - tail)
        if best[0] > 0.12 or (best[0] > gap_back and len(loop) > 20):
            break
        chain = rest.pop(best[1])
        loop += chain if best[2] == 0 else chain[::-1]
        bridged = max(bridged, best[0])
    print(
        f"  contorno: {len(loop)} puntos en {len(chains)} tramo(s); mayor rendija {bridged:.4f}, "
        f"cierre {np.linalg.norm(loop[0] - loop[-1]):.4f}, {sum(len(c) for c in rest)} puntos sin usar"
    )
    return np.array(loop)


def inside_polygon(points, polygon):
    x, y = points[:, 0][:, None], points[:, 1][:, None]
    x0, y0 = polygon[:, 0][None, :], polygon[:, 1][None, :]
    x1, y1 = np.roll(polygon[:, 0], -1)[None, :], np.roll(polygon[:, 1], -1)[None, :]
    with np.errstate(divide="ignore", invalid="ignore"):
        crosses = ((y0 > y) != (y1 > y)) & (x < (x1 - x0) * (y - y0) / (y1 - y0) + x0)
    return crosses.sum(axis=1) % 2 == 1


def distance_to_polyline(points, polygon):
    a = polygon[None, :, :]
    b = np.roll(polygon, -1, axis=0)[None, :, :]
    p = points[:, None, :]
    ab = b - a
    t = np.clip(((p - a) * ab).sum(-1) / np.maximum((ab * ab).sum(-1), 1e-12), 0, 1)
    return np.linalg.norm(p - (a + t[..., None] * ab), axis=2).min(axis=1)


def build_patch(torso, contour):
    """Triangula el interior del contorno sobre la piel reconstruida."""
    u, v, _ = torso.params(contour)
    poly = np.stack([u, v], axis=1)
    lo, hi = poly.min(0), poly.max(0)
    gx, gy = np.meshgrid(np.arange(lo[0], hi[0], PATCH_STEP), np.arange(lo[1], hi[1], PATCH_STEP))
    grid = np.stack([gx.ravel(), gy.ravel()], axis=1)
    grid = grid[inside_polygon(grid, poly)]
    grid = grid[distance_to_polyline(grid, poly) > PATCH_STEP * 0.6]
    pts2d = np.concatenate([poly, grid])
    n = len(poly)
    edges = [(i, (i + 1) % n) for i in range(n)]
    out_verts, _, out_faces, orig_verts, _, _ = delaunay_2d_cdt([Vector(p) for p in pts2d], edges, [], 1, 1e-7)
    out2d = np.array([tuple(p) for p in out_verts])
    tris = [tuple(f) for f in out_faces if len(f) == 3]
    # Los puntos del contorno conservan su posición exacta: así no quedan grietas.
    pos = torso.point(out2d[:, 0], out2d[:, 1], torso.skin_radius(out2d[:, 0], out2d[:, 1]) + EPS)
    on_contour = np.zeros(len(out2d), dtype=bool)
    for i, origin in enumerate(orig_verts):
        src = [o for o in origin if o < n]
        if src:
            pos[i] = contour[src[0]]
            on_contour[i] = True
    edge_dist = distance_to_polyline(out2d, poly)
    return dict(uv2d=out2d, pos=pos, tris=tris, on_contour=on_contour, edge_dist=edge_dist, lo=lo, hi=hi)


def atlas_uv(patch, slot):
    """Coloca el parche dentro de su hueco de la textura, con margen."""
    x0, y0, side = slot
    span = (patch["hi"] - patch["lo"]).max()
    rel = (patch["uv2d"] - patch["lo"]) / span
    inner = side - 2 * ATLAS_PAD
    px = np.stack([x0 + ATLAS_PAD + rel[:, 0] * inner, y0 + ATLAS_PAD + rel[:, 1] * inner], axis=1)
    return px / (IMG_W, IMG_H), span


def paint_slot(torso, patch, slot, span, samples_pos, samples_color, color_px, normal_px):
    """Pinta el hueco de la textura con los colores de la piel que rodea al brazo."""
    x0, y0, side = slot
    inner = side - 2 * ATLAS_PAD
    ys, xs = np.mgrid[y0 : y0 + side, x0 : x0 + side]
    rel = np.stack([(xs.ravel() + 0.5 - x0 - ATLAS_PAD) / inner, (ys.ravel() + 0.5 - y0 - ATLAS_PAD) / inner], axis=1)
    uv2d = rel * span + patch["lo"]
    su, sv, _ = torso.params(samples_pos)
    sample2d = np.stack([su, sv], axis=1)
    d = np.linalg.norm(uv2d[:, None, :] - sample2d[None, :, :], axis=2)
    w = 1.0 / np.maximum(d, 1e-4) ** 4
    color = (w @ samples_color) / w.sum(axis=1, keepdims=True)
    color_px[ys.ravel(), xs.ravel(), :3] = color
    if normal_px is not None:
        normal_px[ys.ravel(), xs.ravel(), :3] = (0.5, 0.5, 1.0)


def add_faces(bm, uv_layer, inv, positions, uvs, tris, outward):
    """Agrega triángulos a un bmesh, orientados según la función outward(centro)."""
    made = {}
    count = 0
    for tri in tris:
        verts = []
        for i in tri:
            if i not in made:
                made[i] = bm.verts.new(inv @ Vector(positions[i]))
            verts.append(made[i])
        try:
            face = bm.faces.new(verts)
        except ValueError:
            continue
        centre = sum((Vector(positions[i]) for i in tri), Vector()) / 3
        normal = (Vector(positions[tri[1]]) - Vector(positions[tri[0]])).cross(
            Vector(positions[tri[2]]) - Vector(positions[tri[0]])
        )
        loop_uvs = [uvs[i] for i in tri]
        if normal.dot(outward(centre)) < 0:
            face.normal_flip()
            loop_uvs = [uvs[i] for i in (tri[0], tri[2], tri[1])]
            order = {v: uv for v, uv in zip((verts[0], verts[2], verts[1]), loop_uvs)}
        else:
            order = {v: uv for v, uv in zip(verts, loop_uvs)}
        face.smooth = True
        for loop in face.loops:
            loop[uv_layer].uv = order[loop.vert]
        count += 1
    return count


def repaint_belly_fringe(torso, belly_part, color_px):
    """Quita el color de pancita de la franja del brazo que venía de `belly`.

    La mitad interior del brazo era parte de `belly` y su borde tiene pintado el
    color de la pancita. Ya como brazo no recibe el tinte del semáforo, así que
    esa franja se vería como una mancha. Se repinta con el color del resto de la
    cara interior del brazo, de forma gradual según cuánto sobresale del torso.
    """
    mw = belly_part["obj"].matrix_world
    uv_layer = belly_part["uv"]
    rows, cols, pos = [], [], []
    for face in belly_part["arm_faces"]:
        p = np.array([mw @ v.co for v in face.verts])
        uv = np.array([l[uv_layer].uv[:] for l in face.loops]) * (IMG_W, IMG_H) - 0.5
        (x0, y0), (x1, y1) = np.floor(uv.min(0) - 1), np.ceil(uv.max(0) + 1)
        gx, gy = np.meshgrid(np.arange(x0, x1 + 1), np.arange(y0, y1 + 1))
        a, b, c = uv
        den = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
        if abs(den) < 1e-9:
            continue
        w0 = ((b[1] - c[1]) * (gx - c[0]) + (c[0] - b[0]) * (gy - c[1])) / den
        w1 = ((c[1] - a[1]) * (gx - c[0]) + (a[0] - c[0]) * (gy - c[1])) / den
        w2 = 1 - w0 - w1
        tol = min(0.3, 0.6 / max(1.0, np.sqrt(abs(den))))
        inside = (w0 >= -tol) & (w1 >= -tol) & (w2 >= -tol)
        if not inside.any():
            continue
        rows.append(gy[inside].astype(int) % IMG_H)
        cols.append(gx[inside].astype(int) % IMG_W)
        pos.append(np.stack([w0[inside], w1[inside], w2[inside]], axis=1) @ p)
    rows, cols, pos = np.concatenate(rows), np.concatenate(cols), np.concatenate(pos)
    h = torso.height(pos)
    ref = np.where(h > FRINGE[1] + 0.01)[0]
    ref = ref[:: max(1, len(ref) // 400)]
    target = np.where(h < FRINGE[1])[0]
    d = np.linalg.norm(pos[target][:, None, :] - pos[ref][None, :, :], axis=2)
    w = 1.0 / np.maximum(d, 1e-3) ** 3
    arm_color = (w @ color_px[rows[ref], cols[ref], :3]) / w.sum(axis=1, keepdims=True)
    t = np.clip((h[target] - FRINGE[0]) / (FRINGE[1] - FRINGE[0]), 0, 1)
    keep = (t * t * (3 - 2 * t))[:, None]
    r, c = rows[target], cols[target]
    color_px[r, c, :3] = color_px[r, c, :3] * keep + arm_color * (1 - keep)
    print(f"  franja del brazo repintada: {len(target)} texeles")


def keep_apron_in_belly(belly_part, color_px):
    """Deja en `belly` las caras bajas con color de pancita que rodean la mano.

    Junto a las manos la pancita se abulta un poco más que la superficie
    reconstruida, y una franja suya quedaría como parte del brazo: se vería como
    un delantal sin teñir cuando el semáforo cambia el color de la pancita.
    """
    uv_layer, height = belly_part["uv"], belly_part["height"]
    stay = set()
    for face in belly_part["arm_faces"]:
        if max(height[v] for v in face.verts) > APRON_HEIGHT - EPS:
            continue
        uv = sum((l[uv_layer].uv for l in face.loops), Vector((0, 0))) / len(face.loops)
        c = color_px[int(uv.y * IMG_H) % IMG_H, int(uv.x * IMG_W) % IMG_W]
        if c[1] - c[0] > TEAL_MIN:
            stay.add(face)
    belly_part["arm_faces"] = [f for f in belly_part["arm_faces"] if f not in stay]
    print(f"  delantal: {len(stay)} caras bajas se quedan en belly")


def separate_arm(name, sign, color_px, normal_px):
    print(f"{name}:")
    torso = Torso(sign)
    pts = np.concatenate([world_coords(o) for o in SOURCES])
    torso.fit_skin(pts)

    parts = split_sources(torso)
    kept, total = largest_component(parts)
    print(f"  {kept} caras de brazo (de {total} por fuera de la piel)")
    contour = contour_loop(parts)
    keep_apron_in_belly(next(p for p in parts if p["obj"] is belly), color_px)
    repaint_belly_fringe(torso, next(p for p in parts if p["obj"] is belly), color_px)
    patch = build_patch(torso, contour)
    uvs, span = atlas_uv(patch, ATLAS_SLOTS[name])

    # Piel de referencia: vértices del torso junto al contorno, con su color.
    samples_pos, samples_color, owners = [], [], []
    for part in parts:
        obj, bm, uv_layer = part["obj"], part["bm"], part["uv"]
        arm_verts = {v for f in part["arm_faces"] for v in f.verts}
        mw = obj.matrix_world
        cand = [v for v in bm.verts if v not in arm_verts and v not in part["cut"] and v.link_loops]
        world = np.array([mw @ v.co for v in cand])
        if not len(world):
            continue
        near = np.linalg.norm(world[:, None, :] - contour[None, ::3, :], axis=2).min(axis=1) < 0.06
        for v, p, ok in zip(cand, world, near):
            if not ok or part["height"].get(v, -1) > -0.002:
                continue
            uv = v.link_loops[0][uv_layer].uv
            samples_pos.append(p)
            samples_color.append(color_px[int(uv.y * IMG_H) % IMG_H, int(uv.x * IMG_W) % IMG_W, :3])
            owners.append(obj.name)
    samples_pos, samples_color = np.array(samples_pos), np.array(samples_color)
    owners = np.array(owners)
    paint_slot(torso, patch, ATLAS_SLOTS[name], span, samples_pos, samples_color, color_px, normal_px)

    # Reparto del parche: va a `belly` todo lo que cae dentro de lo que abarca la
    # pancita a esa altura (del frente hacia el costado), y el resto a `body`.
    # No sirve mirar solo la piel más cercana: alrededor de la mano queda un
    # reborde que era de `body` y dejaría manchas sin teñir en plena pancita.
    s_u, s_v, _ = torso.params(samples_pos)
    from_belly = owners == "belly"

    # El borde de la pancita queda tapado por el brazo: se conoce donde cruza el
    # contorno por arriba y por abajo, y entre esos dos puntos se traza recto.
    v_lo, v_hi = s_v.min(), s_v.max()
    top = from_belly & (s_v > v_hi - 0.25 * (v_hi - v_lo))
    bottom = from_belly & (s_v < v_lo + 0.25 * (v_hi - v_lo))
    edge_top = (s_v[top][s_u[top].argmax()], s_u[top].max())
    edge_bottom = (s_v[bottom][s_u[bottom].argmax()], s_u[bottom].max())

    def in_belly(points):
        u, v, _ = torso.params(points)
        t = np.clip((v - edge_bottom[0]) / (edge_top[0] - edge_bottom[0]), 0, 1)
        return u <= edge_bottom[1] + t * (edge_top[1] - edge_bottom[1])

    centres = np.array([patch["pos"][list(t)].mean(axis=0) for t in patch["tris"]])
    tri_owner = np.where(in_belly(centres), "belly", "body")

    # Ese reborde de `body` metido en la pancita también pasa a `belly`.
    body_part = next(p for p in parts if p["obj"] is body)
    belly_part = next(p for p in parts if p["obj"] is belly)
    arm_set = set(body_part["arm_faces"])
    cand = [f for f in body_part["bm"].faces if f not in arm_set and len(f.verts) == 3]
    cand_c = np.array([body.matrix_world @ f.calc_center_median() for f in cand])
    idx = np.where(torso.rho(cand_c) < 1.0)[0]
    close = np.linalg.norm(cand_c[idx][:, None, :] - contour[None, ::2, :], axis=2).min(axis=1) < 0.05
    idx = idx[close]
    idx = idx[in_belly(cand_c[idx])]
    to_belly = belly.matrix_world.inverted() @ body.matrix_world
    moved = []
    for i in idx:
        f = cand[i]
        nf = belly_part["bm"].faces.new([belly_part["bm"].verts.new(to_belly @ v.co) for v in f.verts])
        nf.smooth = True
        for loop, src in zip(nf.loops, f.loops):
            loop[belly_part["uv"]].uv = src[body_part["uv"]].uv
        moved.append(f)
    bmesh.ops.delete(body_part["bm"], geom=moved, context="FACES")
    print(f"  reborde: {len(moved)} caras de body pasan a belly")

    # --- Objeto del brazo ------------------------------------------------------
    arm_bm = bmesh.new()
    arm_uv = arm_bm.loops.layers.uv.verify()
    made = {}
    arm_points = []
    for part in parts:
        mw = part["obj"].matrix_world
        for f in part["arm_faces"]:
            verts = []
            for v in f.verts:
                p = mw @ v.co
                k = key(p)
                if k not in made:
                    made[k] = arm_bm.verts.new(p)
                    arm_points.append(p)
                verts.append(made[k])
            try:
                nf = arm_bm.faces.new(verts)
            except ValueError:
                continue
            nf.smooth = True
            for loop, src in zip(nf.loops, f.loops):
                loop[arm_uv].uv = src[part["uv"]].uv
    arm_points = np.array(arm_points)

    # Hombro: el extremo del brazo más hacia el costado (mayor ángulo).
    u_c, v_c, _ = torso.params(contour)
    axis = np.linalg.svd(np.stack([u_c - u_c.mean(), v_c - v_c.mean()], axis=1), full_matrices=False)[2][0]
    t = (u_c - u_c.mean()) * axis[0] + (v_c - v_c.mean()) * axis[1]
    if u_c[t.argmax()] < u_c[t.argmin()]:
        t = -t
    shoulder_t = t.min() + 0.82 * (t.max() - t.min())
    sel = t > shoulder_t
    su, sv = u_c[sel].mean(), v_c[sel].mean()
    origin = Vector(torso.point(np.array([su]), np.array([sv]), torso.skin_radius(su, sv) + EPS)[0])

    # Base del brazo: el mismo parche, hundido hacia el torso lejos del borde.
    sink = np.clip(patch["edge_dist"] / 0.05, 0, 1)
    sink = sink * sink * (3 - 2 * sink) * BASE_DEPTH
    radial = patch["pos"].copy()
    radial[:, 2] = 0
    radial /= np.linalg.norm(radial, axis=1, keepdims=True)
    base_pos = patch["pos"] - radial * sink[:, None]
    base_made = {}
    for tri in patch["tris"]:
        verts = []
        for i in tri:
            if i not in base_made:
                # Vértices propios, sin soldar al borde: así el borde del brazo
                # conserva el sombreado suave que tenía pegado al torso.
                base_made[i] = arm_bm.verts.new(Vector(base_pos[i]))
            verts.append(base_made[i])
        if len({id(v) for v in verts}) < 3:
            continue
        try:
            face = arm_bm.faces.new(verts)
        except ValueError:
            continue
        face.normal_update()
        centre = face.calc_center_median()
        inward = -Vector((centre.x, centre.y, 0)).normalized()
        if face.normal.dot(inward) < 0:
            face.normal_flip()
        face.smooth = True
        index_of = {base_made[i]: i for i in tri}
        for loop in face.loops:
            loop[arm_uv].uv = uvs[index_of[loop.vert]]
    bmesh.ops.translate(arm_bm, verts=arm_bm.verts, vec=-origin)
    arm_mesh = bpy.data.meshes.new(name)
    arm_bm.to_mesh(arm_mesh)
    boundary = sum(1 for e in arm_bm.edges if e.is_boundary)
    arm_bm.free()
    arm_mesh.materials.append(body.data.materials[0])
    arm_mesh.uv_layers[0].name = body.data.uv_layers.active.name
    arm = bpy.data.objects.new(name, arm_mesh)
    arm.location = origin
    body.users_collection[0].objects.link(arm)

    # --- body y belly sin el brazo, con su parche --------------------------------
    for part in parts:
        obj, bm = part["obj"], part["bm"]
        bmesh.ops.delete(bm, geom=part["arm_faces"], context="FACES")
        mine = [t for t, owner in zip(patch["tris"], tri_owner) if owner == obj.name]
        added = add_faces(
            bm, part["uv"], obj.matrix_world.inverted(), patch["pos"], uvs, mine,
            outward=lambda c: Vector((c.x, c.y, 0)),
        )
        loose = [v for v in bm.verts if not v.link_faces]
        bmesh.ops.delete(bm, geom=loose, context="VERTS")
        bm.to_mesh(obj.data)
        bm.free()
        obj.data.update()
        print(f"  {obj.name}: parche de {added} caras, {len(obj.data.polygons)} caras en total")
    print(
        f"  {name}: {len(arm_mesh.polygons)} caras, origen {tuple(round(c, 3) for c in origin)}, "
        f"{boundary} aristas abiertas"
    )


if "arm_L" in bpy.data.objects or "arm_R" in bpy.data.objects:
    print("Los brazos ya existen: no se hace nada")
else:
    color_px = load_pixels(COLOR_IMG)
    normal_px = load_pixels(NORMAL_IMG) if NORMAL_IMG else None
    for arm_name, side_sign in (("arm_R", 1), ("arm_L", -1)):
        separate_arm(arm_name, side_sign, color_px, normal_px)
    COLOR_IMG.pixels.foreach_set(color_px.ravel())
    COLOR_IMG.update()
    COLOR_IMG.pack()
    if NORMAL_IMG:
        NORMAL_IMG.pixels.foreach_set(normal_px.ravel())
        NORMAL_IMG.update()
        NORMAL_IMG.pack()

if bpy.data.filepath:
    bpy.ops.wm.save_mainfile()
    print("Guardado", bpy.data.filepath)
