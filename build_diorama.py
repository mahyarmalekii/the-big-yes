import bpy
import math
import os

# Reset Scene
bpy.ops.wm.read_factory_settings(use_empty=True)

scene = bpy.context.scene
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 144

def get_active():
    return bpy.context.view_layer.objects.active

def apply_smooth(obj):
    if hasattr(obj.data, 'polygons'):
        for p in obj.data.polygons:
            p.use_smooth = True

# 1. Tactile Clay Materials (Stefano Colferai style)
def create_clay_mat(name, color, roughness=0.65, subsurface=0.1):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Roughness'].default_value = roughness
        if 'Subsurface Weight' in bsdf.inputs:
            bsdf.inputs['Subsurface Weight'].default_value = subsurface
        elif 'Subsurface' in bsdf.inputs:
            bsdf.inputs['Subsurface'].default_value = subsurface
    return mat

mat_skin_guy = create_clay_mat("ClaySkinGuy", (0.92, 0.68, 0.48, 1.0))
mat_skin_girl = create_clay_mat("ClaySkinGirl", (0.96, 0.78, 0.62, 1.0))
mat_hair_brown = create_clay_mat("ClayHairBrown", (0.30, 0.16, 0.08, 1.0), roughness=0.75)
mat_hair_dark = create_clay_mat("ClayHairDark", (0.12, 0.10, 0.08, 1.0), roughness=0.8)
mat_sweater_teal = create_clay_mat("ClaySweaterTeal", (0.10, 0.52, 0.55, 1.0))
mat_sweater_coral = create_clay_mat("ClaySweaterCoral", (0.92, 0.36, 0.42, 1.0))
mat_table_cream = create_clay_mat("ClayTableCream", (0.92, 0.90, 0.85, 1.0), roughness=0.6)
mat_stool_orange = create_clay_mat("ClayStoolOrange", (0.98, 0.42, 0.05, 1.0), roughness=0.55)
mat_stool_yellow = create_clay_mat("ClayStoolYellow", (0.98, 0.76, 0.10, 1.0), roughness=0.55)
mat_floor_sand = create_clay_mat("ClayFloorSand", (0.86, 0.68, 0.48, 1.0), roughness=0.8)
mat_moka_metal = create_clay_mat("ClayMokaMetal", (0.65, 0.68, 0.70, 1.0), roughness=0.35)
mat_mug_cyan = create_clay_mat("ClayMugCyan", (0.15, 0.78, 0.82, 1.0))
mat_mug_red = create_clay_mat("ClayMugRed", (0.90, 0.18, 0.20, 1.0))
mat_wine_red = create_clay_mat("ClayWineRed", (0.65, 0.05, 0.12, 1.0), roughness=0.2)
mat_glass_clear = create_clay_mat("ClayGlassClear", (0.92, 0.96, 1.0, 0.6), roughness=0.1)
mat_beer_amber = create_clay_mat("ClayBeerAmber", (0.95, 0.62, 0.10, 1.0), roughness=0.25)
mat_beer_foam = create_clay_mat("ClayFoamWhite", (0.98, 0.98, 0.96, 1.0), roughness=0.85)
mat_plate_white = create_clay_mat("ClayPlateWhite", (0.96, 0.96, 0.94, 1.0))
mat_pasta_yellow = create_clay_mat("ClayPastaYellow", (0.96, 0.75, 0.25, 1.0))
mat_sauce_red = create_clay_mat("ClaySauceRed", (0.86, 0.18, 0.12, 1.0))
mat_bread_toast = create_clay_mat("ClayBreadToast", (0.84, 0.54, 0.25, 1.0))
mat_juice_carton = create_clay_mat("ClayJuiceCarton", (0.98, 0.75, 0.12, 1.0))
mat_fruit_banana = create_clay_mat("ClayBanana", (0.98, 0.85, 0.15, 1.0))
mat_plant_leaf = create_clay_mat("ClayPlantLeaf", (0.18, 0.64, 0.26, 1.0), roughness=0.65)
mat_lamp_concrete = create_clay_mat("ClayLampConcrete", (0.65, 0.64, 0.60, 1.0), roughness=0.8)

def set_mat(obj, mat):
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)

# Root Diorama Group
root_group = bpy.data.objects.new("DIORAMA_ROOT", None)
scene.collection.objects.link(root_group)

# 2. CLAY TABLE
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.78))
table = get_active()
table.name = "TABLE"
table.scale = (1.6, 0.82, 0.10)
apply_smooth(table)
set_mat(table, mat_table_cream)
table.parent = root_group

# Table legs
for lx, ly in [(-0.68, -0.28), (-0.68, 0.28), (0.68, -0.28), (0.68, 0.28)]:
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.06, depth=0.78, location=(lx, ly, 0.39))
    leg = get_active()
    apply_smooth(leg)
    set_mat(leg, mat_table_cream)
    leg.parent = table

# 3. CHUNKY STOOLS (Stefano Colferai style)
# Guy's stool (left)
bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.26, depth=0.07, location=(-0.75, 0.1, 0.44))
stool_l = get_active()
stool_l.name = "CHAIR_LEFT"
apply_smooth(stool_l)
set_mat(stool_l, mat_stool_orange)
stool_l.parent = root_group

# Girl's stool (right)
bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.26, depth=0.07, location=(0.75, 0.1, 0.44))
stool_r = get_active()
stool_r.name = "CHAIR_RIGHT"
apply_smooth(stool_r)
set_mat(stool_r, mat_stool_yellow)
stool_r.parent = root_group

# 4. CHARACTER 1 (Guy with mustache in Teal Sweater eating pasta & drinking)
# Torso
bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.34, location=(-0.75, 0.05, 0.95))
char_left = get_active()
char_left.name = "CHARACTER_LEFT"
char_left.scale = (0.95, 0.85, 1.25)
apply_smooth(char_left)
set_mat(char_left, mat_sweater_teal)
char_left.parent = root_group

# Head
bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.26, location=(-0.75, 0.05, 1.46))
head_l = get_active()
head_l.name = "HEAD_LEFT"
head_l.scale = (0.9, 0.95, 1.15)
apply_smooth(head_l)
set_mat(head_l, mat_skin_guy)
head_l.parent = char_left

# Hair
bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.28, depth=0.20, location=(-0.75, 0.05, 1.68))
hair_l = get_active()
apply_smooth(hair_l)
set_mat(hair_l, mat_hair_brown)
hair_l.parent = head_l

# Big Clay Nose
bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.075, location=(-0.75, -0.21, 1.45))
nose_l = get_active()
apply_smooth(nose_l)
set_mat(nose_l, mat_skin_guy)
nose_l.parent = head_l

# Mustache
bpy.ops.mesh.primitive_cube_add(size=0.12, location=(-0.75, -0.23, 1.35))
mustache = get_active()
mustache.scale = (1.3, 0.4, 0.3)
apply_smooth(mustache)
set_mat(mustache, mat_hair_brown)
mustache.parent = head_l

# Eyes
for ex in [-0.08, 0.08]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.026, location=(-0.75 + ex, -0.20, 1.51))
    eye = get_active()
    set_mat(eye, mat_hair_dark)
    eye.parent = head_l

# Hand Left with Fork
bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.10, location=(-0.45, -0.15, 0.90))
hand_l1 = get_active()
hand_l1.name = "HAND_LEFT"
apply_smooth(hand_l1)
set_mat(hand_l1, mat_skin_guy)
hand_l1.parent = char_left

bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.016, depth=0.28, location=(-0.38, -0.15, 0.96))
fork = get_active()
fork.name = "FORK"
fork.rotation_euler = (math.radians(35), math.radians(-25), 0)
apply_smooth(fork)
set_mat(fork, mat_moka_metal)
fork.parent = hand_l1

# Hand Right with Cyan Mug
bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.10, location=(-0.60, -0.28, 0.88))
hand_l2 = get_active()
apply_smooth(hand_l2)
set_mat(hand_l2, mat_skin_guy)
hand_l2.parent = char_left

bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.07, depth=0.14, location=(-0.60, -0.28, 0.96))
mug_l = get_active()
apply_smooth(mug_l)
set_mat(mug_l, mat_mug_cyan)
mug_l.parent = hand_l2

# 5. CHARACTER 2 (Girl in Coral Sweater raising Wine & holding toast)
bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.34, location=(0.75, 0.05, 0.95))
char_right = get_active()
char_right.name = "CHARACTER_RIGHT"
char_right.scale = (0.95, 0.85, 1.25)
apply_smooth(char_right)
set_mat(char_right, mat_sweater_coral)
char_right.parent = root_group

bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.26, location=(0.75, 0.05, 1.46))
head_r = get_active()
head_r.name = "HEAD_RIGHT"
head_r.scale = (0.9, 0.95, 1.15)
apply_smooth(head_r)
set_mat(head_r, mat_skin_girl)
head_r.parent = char_right

# Bob Hair
bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.30, location=(0.75, 0.06, 1.58))
hair_r = get_active()
hair_r.scale = (1.05, 1.1, 0.85)
apply_smooth(hair_r)
set_mat(hair_r, mat_hair_brown)
hair_r.parent = head_r

# Nose & Eyes
bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.065, location=(0.75, -0.21, 1.45))
nose_r = get_active()
apply_smooth(nose_r)
set_mat(nose_r, mat_skin_girl)
nose_r.parent = head_r

for ex in [-0.08, 0.08]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.026, location=(0.75 + ex, -0.20, 1.51))
    eye = get_active()
    set_mat(eye, mat_hair_dark)
    eye.parent = head_r

# Hand Left raising Wine Glass
bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.10, location=(0.45, -0.16, 1.02))
hand_r1 = get_active()
hand_r1.name = "HAND_RIGHT"
apply_smooth(hand_r1)
set_mat(hand_r1, mat_skin_girl)
hand_r1.parent = char_right

# WINE_GLASS
bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.08, depth=0.18, location=(0.38, -0.16, 1.12))
wine_glass = get_active()
wine_glass.name = "WINE_GLASS"
apply_smooth(wine_glass)
set_mat(wine_glass, mat_glass_clear)
wine_glass.parent = hand_r1

bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.065, depth=0.09, location=(0.38, -0.16, 1.09))
wine_liq = get_active()
apply_smooth(wine_liq)
set_mat(wine_liq, mat_wine_red)
wine_liq.parent = wine_glass

# Hand Right with Toast
bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.10, location=(0.60, -0.25, 0.88))
hand_r2 = get_active()
apply_smooth(hand_r2)
set_mat(hand_r2, mat_skin_girl)
hand_r2.parent = char_right

bpy.ops.mesh.primitive_cube_add(size=0.10, location=(0.60, -0.25, 0.94))
toast = get_active()
toast.scale = (1.2, 0.8, 0.3)
apply_smooth(toast)
set_mat(toast, mat_bread_toast)
toast.parent = hand_r2

# 6. TABLETOP FEAST (Drinks & Food)
# Moka Espresso Pot
bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.10, depth=0.28, location=(-0.30, 0.16, 0.96))
moka = get_active()
apply_smooth(moka)
set_mat(moka, mat_moka_metal)
moka.parent = table

# Red mug
bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.06, depth=0.12, location=(-0.15, 0.16, 0.88))
mug_red = get_active()
apply_smooth(mug_red)
set_mat(mug_red, mat_mug_red)
mug_red.parent = table

# FOOD_PLATE (Pasta Bowl)
bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.24, depth=0.07, location=(-0.28, -0.12, 0.86))
plate = get_active()
plate.name = "FOOD_PLATE"
apply_smooth(plate)
set_mat(plate, mat_plate_white)
plate.parent = table

bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.16, location=(-0.28, -0.12, 0.90))
pasta = get_active()
pasta.scale = (1.0, 1.0, 0.5)
apply_smooth(pasta)
set_mat(pasta, mat_pasta_yellow)
pasta.parent = plate

bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.06, location=(-0.28, -0.12, 0.96))
sauce = get_active()
set_mat(sauce, mat_sauce_red)
sauce.parent = plate

# BEER_GLASS (Amber Stein with Foam)
bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.08, depth=0.24, location=(0.24, 0.14, 0.94))
beer_glass = get_active()
beer_glass.name = "BEER_GLASS"
apply_smooth(beer_glass)
set_mat(beer_glass, mat_beer_amber)
beer_glass.parent = table

bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.09, location=(0.24, 0.14, 1.06))
beer_foam = get_active()
beer_foam.scale = (1.0, 1.0, 0.4)
apply_smooth(beer_foam)
set_mat(beer_foam, mat_beer_foam)
beer_foam.parent = beer_glass

# Juice Carton
bpy.ops.mesh.primitive_cube_add(size=0.15, location=(0.02, 0.18, 0.92))
carton = get_active()
carton.scale = (0.7, 0.7, 1.3)
apply_smooth(carton)
set_mat(carton, mat_juice_carton)
carton.parent = table

# Fruit Bowl with Banana
bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.16, depth=0.08, location=(-0.55, 0.18, 0.88))
fruit_bowl = get_active()
fruit_bowl.name = "FLOWER"
apply_smooth(fruit_bowl)
set_mat(fruit_bowl, mat_plate_white)
fruit_bowl.parent = table

bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.035, depth=0.18, location=(-0.55, 0.18, 0.95))
banana = get_active()
banana.rotation_euler = (0, math.radians(65), math.radians(25))
apply_smooth(banana)
set_mat(banana, mat_fruit_banana)
banana.parent = fruit_bowl

# 7. CONCRETE PENDANT LAMPS OVERHEAD
for lx in [-0.45, 0.45]:
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.01, depth=0.9, location=(lx, -0.05, 2.25))
    cord = get_active()
    set_mat(cord, mat_hair_dark)
    cord.parent = root_group

    bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.18, depth=0.30, location=(lx, -0.05, 1.82))
    lamp = get_active()
    lamp.name = "LAMP"
    apply_smooth(lamp)
    set_mat(lamp, mat_lamp_concrete)
    lamp.parent = root_group

# 8. LUSH CLAY PLANT IN BACKGROUND
bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.24, depth=0.45, location=(-1.35, 0.8, 0.22))
pot = get_active()
pot.name = "PLANT"
apply_smooth(pot)
set_mat(pot, mat_stool_orange)
pot.parent = root_group

for px, py, r in [(0, 0, 0.35), (-0.08, 0.08, 0.50), (0.08, -0.06, 0.58)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=r, location=(-1.35 + px, 0.8 + py, 0.35 + r * 0.7))
    leaf = get_active()
    leaf.scale = (0.7, 1.1, 1.3)
    apply_smooth(leaf)
    set_mat(leaf, mat_plant_leaf)
    leaf.parent = pot

# 9. ANIMATION (Subtle stop-motion breathing & dipping fork/glass)
head_l.animation_data_create()
head_l.rotation_euler = (0, 0, 0)
head_l.keyframe_insert(data_path="rotation_euler", frame=1)
head_l.rotation_euler = (math.radians(5), 0, math.radians(3))
head_l.keyframe_insert(data_path="rotation_euler", frame=72)
head_l.rotation_euler = (0, 0, 0)
head_l.keyframe_insert(data_path="rotation_euler", frame=144)

hand_l1.animation_data_create()
hand_l1.location = (-0.45, -0.15, 0.90)
hand_l1.keyframe_insert(data_path="location", frame=1)
hand_l1.location = (-0.40, -0.13, 0.97)
hand_l1.keyframe_insert(data_path="location", frame=72)
hand_l1.location = (-0.45, -0.15, 0.90)
hand_l1.keyframe_insert(data_path="location", frame=144)

head_r.animation_data_create()
head_r.rotation_euler = (0, 0, 0)
head_r.keyframe_insert(data_path="rotation_euler", frame=1)
head_r.rotation_euler = (math.radians(-4), math.radians(2), math.radians(-3))
head_r.keyframe_insert(data_path="rotation_euler", frame=72)
head_r.rotation_euler = (0, 0, 0)
head_r.keyframe_insert(data_path="rotation_euler", frame=144)

hand_r1.animation_data_create()
hand_r1.location = (0.45, -0.16, 1.02)
hand_r1.keyframe_insert(data_path="location", frame=1)
hand_r1.location = (0.40, -0.14, 1.14)
hand_r1.keyframe_insert(data_path="location", frame=72)
hand_r1.location = (0.45, -0.16, 1.02)
hand_r1.keyframe_insert(data_path="location", frame=144)

# 10. EXPORT GLB
export_dir = "/Users/mahyar/Downloads/The Big Yes (1)/public/assets"
os.makedirs(export_dir, exist_ok=True)
export_path = os.path.join(export_dir, "diorama.glb")

bpy.ops.export_scene.gltf(
    filepath=export_path,
    export_format='GLB',
    export_animations=True,
    export_current_frame=False,
    export_cameras=False,
    export_lights=False
)

print("SUCCESS: Clean Clay Couple Diorama GLB exported.")
