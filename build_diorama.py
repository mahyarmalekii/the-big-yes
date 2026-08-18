import bpy
import math
import os

# Reset Scene
bpy.ops.wm.read_factory_settings(use_empty=True)

scene = bpy.context.scene
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 144  # 6-second loop

def get_active():
    return bpy.context.view_layer.objects.active

def apply_smooth(obj):
    if hasattr(obj.data, 'polygons'):
        for p in obj.data.polygons:
            p.use_smooth = True

# 1. Plasticine / Claymation Materials (Matte, tactile, slightly soft)
def create_clay_mat(name, color, roughness=0.68, subsurface=0.08):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Roughness'].default_value = roughness
        # Subsurface gives realistic clay/plasticine softness
        if 'Subsurface Weight' in bsdf.inputs:
            bsdf.inputs['Subsurface Weight'].default_value = subsurface
            if 'Subsurface Radius' in bsdf.inputs:
                bsdf.inputs['Subsurface Radius'].default_value = (0.8, 0.4, 0.2)
        elif 'Subsurface' in bsdf.inputs:
            bsdf.inputs['Subsurface'].default_value = subsurface
    return mat

mat_clay_skin1 = create_clay_mat("ClaySkinWarm", (0.92, 0.68, 0.48, 1.0))
mat_clay_skin2 = create_clay_mat("ClaySkinFair", (0.96, 0.78, 0.62, 1.0))
mat_clay_hair_brown = create_clay_mat("ClayHairBrown", (0.32, 0.18, 0.10, 1.0), roughness=0.75)
mat_clay_hair_black = create_clay_mat("ClayHairBlack", (0.12, 0.10, 0.08, 1.0), roughness=0.8)
mat_clay_sweater_teal = create_clay_mat("ClaySweaterTeal", (0.10, 0.48, 0.52, 1.0))
mat_clay_sweater_rose = create_clay_mat("ClaySweaterRose", (0.92, 0.38, 0.45, 1.0))
mat_clay_table = create_clay_mat("ClayTableGray", (0.88, 0.86, 0.82, 1.0), roughness=0.7)
mat_clay_stool_orange = create_clay_mat("ClayStoolOrange", (0.98, 0.42, 0.05, 1.0), roughness=0.6)
mat_clay_stool_yellow = create_clay_mat("ClayStoolYellow", (0.98, 0.78, 0.12, 1.0), roughness=0.6)
mat_clay_floor = create_clay_mat("ClayFloorWarm", (0.82, 0.60, 0.38, 1.0), roughness=0.8)
mat_clay_wall = create_clay_mat("ClayWallSky", (0.28, 0.68, 0.78, 1.0), roughness=0.75)
mat_clay_pot = create_clay_mat("ClayMokaPot", (0.62, 0.64, 0.66, 1.0), roughness=0.4)
mat_clay_mug_cyan = create_clay_mat("ClayMugCyan", (0.15, 0.75, 0.78, 1.0))
mat_clay_mug_red = create_clay_mat("ClayMugRed", (0.90, 0.20, 0.22, 1.0))
mat_clay_glass_wine = create_clay_mat("ClayWineGlass", (0.92, 0.95, 0.98, 0.5), roughness=0.15)
mat_clay_wine_liquid = create_clay_mat("ClayWineRed", (0.68, 0.06, 0.14, 1.0), roughness=0.3)
mat_clay_beer = create_clay_mat("ClayBeerAmber", (0.95, 0.65, 0.12, 1.0), roughness=0.3)
mat_clay_foam = create_clay_mat("ClayFoamWhite", (0.98, 0.98, 0.95, 1.0), roughness=0.8)
mat_clay_plate = create_clay_mat("ClayPlateWhite", (0.95, 0.94, 0.92, 1.0))
mat_clay_pasta = create_clay_mat("ClayPastaYellow", (0.96, 0.76, 0.25, 1.0))
mat_clay_sauce = create_clay_mat("ClaySauceRed", (0.88, 0.20, 0.15, 1.0))
mat_clay_carton = create_clay_mat("ClayCartonYellow", (0.98, 0.75, 0.15, 1.0))
mat_clay_fruit_bowl = create_clay_mat("ClayFruitBowl", (0.92, 0.92, 0.90, 1.0))
mat_clay_banana = create_clay_mat("ClayBanana", (0.98, 0.85, 0.15, 1.0))
mat_clay_bread = create_clay_mat("ClayBread", (0.85, 0.55, 0.28, 1.0))
mat_clay_plant_green = create_clay_mat("ClayPlantGreen", (0.20, 0.65, 0.28, 1.0), roughness=0.7)
mat_clay_lamp_cone = create_clay_mat("ClayLampCone", (0.68, 0.66, 0.62, 1.0), roughness=0.8)
mat_clay_cord = create_clay_mat("ClayCordBlack", (0.15, 0.15, 0.15, 1.0), roughness=0.7)

def set_mat(obj, mat):
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)

# 2. CLAY STUDIO FLOOR & BACKDROP
bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=2.6, depth=0.25, location=(0, 0, -0.125))
floor = get_active()
floor.name = "PLATFORM"
apply_smooth(floor)
set_mat(floor, mat_clay_floor)

# Curved Clay Sky Blue Backdrop Panel behind the couple
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=2.5, depth=3.2, location=(0, 1.4, 1.4))
backdrop = get_active()
backdrop.scale = (1.0, 0.4, 1.0)
apply_smooth(backdrop)
set_mat(backdrop, mat_clay_wall)
backdrop.parent = floor

# 3. STEFANO COLFERAI CHUNKY CLAY TABLE
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.82))
table_top = get_active()
table_top.name = "TABLE"
table_top.scale = (1.7, 0.9, 0.12)
apply_smooth(table_top)
set_mat(table_top, mat_clay_table)

# 4 Chunky Clay Legs
for lx, ly in [(-0.72, -0.32), (-0.72, 0.32), (0.72, -0.32), (0.72, 0.32)]:
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.07, depth=0.82, location=(lx, ly, 0.41))
    leg = get_active()
    apply_smooth(leg)
    set_mat(leg, mat_clay_table)
    leg.parent = table_top

# 4. CHUNKY ORANGE & YELLOW CLAY STOOLS (Just like the reference photo!)
# Left Stool (Orange)
bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.28, depth=0.08, location=(-0.95, -0.45, 0.46))
stool_l = get_active()
stool_l.name = "CHAIR_LEFT"
apply_smooth(stool_l)
set_mat(stool_l, mat_clay_stool_orange)

for sx, sy in [(-0.14, -0.14), (-0.14, 0.14), (0.14, -0.14), (0.14, 0.14)]:
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.04, depth=0.46, location=(-0.95 + sx, -0.45 + sy, 0.23))
    sleg = get_active()
    apply_smooth(sleg)
    set_mat(sleg, mat_clay_stool_orange)
    sleg.parent = stool_l

# Right Stool (Yellow/Orange)
bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.28, depth=0.08, location=(0.95, -0.45, 0.46))
stool_r = get_active()
stool_r.name = "CHAIR_RIGHT"
apply_smooth(stool_r)
set_mat(stool_r, mat_clay_stool_yellow)

for sx, sy in [(-0.14, -0.14), (-0.14, 0.14), (0.14, -0.14), (0.14, 0.14)]:
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.04, depth=0.46, location=(0.95 + sx, -0.45 + sy, 0.23))
    sleg = get_active()
    apply_smooth(sleg)
    set_mat(sleg, mat_clay_stool_yellow)
    sleg.parent = stool_r

# 5. CHARACTER 1 (Chunky Clay Guy with Mustache, eating pasta & drinking coffee/wine)
# Torso in Teal Sweater
bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.36, location=(-0.85, 0.05, 1.05))
char_left = get_active()
char_left.name = "CHARACTER_LEFT"
char_left.scale = (0.95, 0.85, 1.25)
apply_smooth(char_left)
set_mat(char_left, mat_clay_sweater_teal)

# Chunky Clay Head
bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.28, location=(-0.85, 0.05, 1.58))
head_l = get_active()
head_l.name = "HEAD_LEFT"
head_l.scale = (0.9, 1.0, 1.15)
apply_smooth(head_l)
set_mat(head_l, mat_clay_skin1)
head_l.parent = char_left

# Stylized Chunky Clay Hair with sculptural rolls
bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.30, depth=0.22, location=(-0.85, 0.05, 1.82))
hair_l = get_active()
apply_smooth(hair_l)
set_mat(hair_l, mat_clay_hair_brown)
hair_l.parent = head_l

# Big Chunky Clay Nose
bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.08, location=(-0.85, -0.22, 1.56))
nose_l = get_active()
nose_l.scale = (0.7, 1.2, 0.8)
apply_smooth(nose_l)
set_mat(nose_l, mat_clay_skin1)
nose_l.parent = head_l

# Signature Clay Mustache
bpy.ops.mesh.primitive_cube_add(size=0.14, location=(-0.85, -0.24, 1.46))
mustache = get_active()
mustache.scale = (1.4, 0.4, 0.35)
apply_smooth(mustache)
set_mat(mustache, mat_clay_hair_brown)
mustache.parent = head_l

# Clay Eyelids & Bead Eyes
for ex in [-0.09, 0.09]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.03, location=(-0.85 + ex, -0.21, 1.63))
    eye = get_active()
    set_mat(eye, mat_clay_hair_black)
    eye.parent = head_l

# Left Arm holding Fork/Spoon over food
bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.12, location=(-0.52, -0.15, 0.98))
hand_l1 = get_active()
hand_l1.name = "HAND_LEFT"
apply_smooth(hand_l1)
set_mat(hand_l1, mat_clay_skin1)
hand_l1.parent = char_left

# Fork / Spoon dipping in bowl
bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.02, depth=0.30, location=(-0.44, -0.12, 1.05))
fork = get_active()
fork.name = "FORK"
fork.rotation_euler = (math.radians(40), math.radians(-30), 0)
apply_smooth(fork)
set_mat(fork, mat_clay_pot)
fork.parent = hand_l1

# Right Arm holding Turquoise Mug
bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.12, location=(-0.68, -0.32, 0.95))
hand_l2 = get_active()
apply_smooth(hand_l2)
set_mat(hand_l2, mat_clay_skin1)
hand_l2.parent = char_left

bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.08, depth=0.16, location=(-0.68, -0.32, 1.04))
mug_l = get_active()
apply_smooth(mug_l)
set_mat(mug_l, mat_clay_mug_cyan)
mug_l.parent = hand_l2

# 6. CHARACTER 2 (Chunky Clay Girl in Rose Sweater, holding Wine Glass & munching bread)
bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.36, location=(0.85, 0.05, 1.05))
char_right = get_active()
char_right.name = "CHARACTER_RIGHT"
char_right.scale = (0.95, 0.85, 1.25)
apply_smooth(char_right)
set_mat(char_right, mat_clay_sweater_rose)

bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.28, location=(0.85, 0.05, 1.58))
head_r = get_active()
head_r.name = "HEAD_RIGHT"
head_r.scale = (0.9, 1.0, 1.15)
apply_smooth(head_r)
set_mat(head_r, mat_clay_skin2)
head_r.parent = char_right

# Clay Hair Bob with bangs
bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.32, location=(0.85, 0.08, 1.72))
hair_r = get_active()
hair_r.scale = (1.05, 1.1, 0.85)
apply_smooth(hair_r)
set_mat(hair_r, mat_clay_hair_brown)
hair_r.parent = head_r

# Clay Nose
bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.07, location=(0.85, -0.22, 1.56))
nose_r = get_active()
apply_smooth(nose_r)
set_mat(nose_r, mat_clay_skin2)
nose_r.parent = head_r

for ex in [-0.09, 0.09]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.03, location=(0.85 + ex, -0.21, 1.63))
    eye = get_active()
    set_mat(eye, mat_clay_hair_black)
    eye.parent = head_r

# Left Arm raising Wine Glass
bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.12, location=(0.52, -0.20, 1.08))
hand_r1 = get_active()
hand_r1.name = "HAND_RIGHT"
apply_smooth(hand_r1)
set_mat(hand_r1, mat_clay_skin2)
hand_r1.parent = char_right

# WINE_GLASS with ruby wine
bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.09, depth=0.20, location=(0.44, -0.20, 1.20))
wine_glass = get_active()
wine_glass.name = "WINE_GLASS"
apply_smooth(wine_glass)
set_mat(wine_glass, mat_clay_glass_wine)
wine_glass.parent = hand_r1

bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.075, depth=0.10, location=(0.44, -0.20, 1.17))
wine_liq = get_active()
apply_smooth(wine_liq)
set_mat(wine_liq, mat_clay_wine_liquid)
wine_liq.parent = wine_glass

# Right Arm holding Bread/Snack
bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.12, location=(0.68, -0.15, 0.95))
hand_r2 = get_active()
apply_smooth(hand_r2)
set_mat(hand_r2, mat_clay_skin2)
hand_r2.parent = char_right

bpy.ops.mesh.primitive_cube_add(size=0.12, location=(0.68, -0.15, 1.02))
croissant = get_active()
croissant.scale = (1.2, 0.7, 0.6)
apply_smooth(croissant)
set_mat(croissant, mat_clay_bread)
croissant.parent = hand_r2

# 7. VIBRANT CLAY FEAST ON TABLE (Both Drinking & Eating!)
# Moka Coffee Pot
bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.12, depth=0.32, location=(-0.35, 0.22, 1.04))
moka = get_active()
apply_smooth(moka)
set_mat(moka, mat_clay_pot)
moka.parent = table_top

# Red Mug next to Moka pot
bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.07, depth=0.14, location=(-0.18, 0.22, 0.95))
mug_r = get_active()
apply_smooth(mug_r)
set_mat(mug_r, mat_clay_mug_red)
mug_r.parent = table_top

# FOOD_PLATE (Bowl of Delicious Pasta & Sauce)
bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.26, depth=0.08, location=(-0.32, -0.12, 0.92))
plate = get_active()
plate.name = "FOOD_PLATE"
apply_smooth(plate)
set_mat(plate, mat_clay_plate)
plate.parent = table_top

bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.18, location=(-0.32, -0.12, 0.96))
pasta_mass = get_active()
pasta_mass.scale = (1.0, 1.0, 0.5)
apply_smooth(pasta_mass)
set_mat(pasta_mass, mat_clay_pasta)
pasta_mass.parent = plate

bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.07, location=(-0.32, -0.12, 1.04))
sauce_dollop = get_active()
set_mat(sauce_dollop, mat_clay_sauce)
sauce_dollop.parent = plate

# BEER_GLASS (Stein of Amber Beer with Foam)
bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.09, depth=0.26, location=(0.28, 0.18, 1.01))
beer_glass = get_active()
beer_glass.name = "BEER_GLASS"
apply_smooth(beer_glass)
set_mat(beer_glass, mat_clay_beer)
beer_glass.parent = table_top

bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.10, location=(0.28, 0.18, 1.15))
beer_foam = get_active()
beer_foam.scale = (1.0, 1.0, 0.4)
apply_smooth(beer_foam)
set_mat(beer_foam, mat_clay_foam)
beer_foam.parent = beer_glass

# Clay Juice Carton (Yellow with berry detail)
bpy.ops.mesh.primitive_cube_add(size=0.18, location=(0.02, 0.24, 0.97))
carton = get_active()
carton.scale = (0.7, 0.7, 1.4)
apply_smooth(carton)
set_mat(carton, mat_clay_carton)
carton.parent = table_top

# Plate of Bread / Toast
bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.18, depth=0.03, location=(0.30, -0.14, 0.90))
bread_plate = get_active()
apply_smooth(bread_plate)
set_mat(bread_plate, mat_clay_plate)
bread_plate.parent = table_top

bpy.ops.mesh.primitive_cube_add(size=0.12, location=(0.30, -0.14, 0.94))
toast = get_active()
toast.scale = (1.1, 0.8, 0.3)
apply_smooth(toast)
set_mat(toast, mat_clay_bread)
toast.parent = bread_plate

# Fruit Bowl with Clay Bananas
bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.20, depth=0.10, location=(-0.65, 0.22, 0.93))
fruit_bowl = get_active()
fruit_bowl.name = "FLOWER"
apply_smooth(fruit_bowl)
set_mat(fruit_bowl, mat_clay_fruit_bowl)
fruit_bowl.parent = table_top

bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.04, depth=0.22, location=(-0.65, 0.22, 1.02))
banana = get_active()
banana.rotation_euler = (0, math.radians(65), math.radians(25))
apply_smooth(banana)
set_mat(banana, mat_clay_banana)
banana.parent = fruit_bowl

# 8. CONCRETE PENDANT LAMPS (Aplomb style overhead)
for lx in [-0.55, 0.55]:
    # Cord
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.012, depth=1.2, location=(lx, -0.1, 2.7))
    cord = get_active()
    set_mat(cord, mat_clay_cord)

    # Cone Lamp
    bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.22, depth=0.38, location=(lx, -0.1, 2.15))
    lamp = get_active()
    lamp.name = "LAMP"
    apply_smooth(lamp)
    set_mat(lamp, mat_clay_lamp_cone)

# 9. LUSH CLAY PLANTS IN BACKGROUND (Banana & Monstera Clay Leaves)
bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.32, depth=0.55, location=(-1.7, 1.1, 0.28))
pot = get_active()
pot.name = "PLANT"
apply_smooth(pot)
set_mat(pot, mat_clay_stool_orange)

for px, py, r in [(0, 0, 0.45), (-0.1, 0.1, 0.65), (0.1, -0.08, 0.75)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=r, location=(-1.7 + px, 1.1 + py, 0.45 + r * 0.8))
    leaf = get_active()
    leaf.scale = (0.7, 1.2, 1.4)
    apply_smooth(leaf)
    set_mat(leaf, mat_clay_plant_green)
    leaf.parent = pot

# 10. STUDIO LIGHTING & CAMERA (Straight-on 3/4 Elevated Editorial Shot)
cam_data = bpy.data.cameras.new("ClayCam")
cam_data.lens = 42
cam_obj = bpy.data.objects.new("Camera", cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

cam_pivot = bpy.data.objects.new("Camera_Pivot", None)
scene.collection.objects.link(cam_pivot)
cam_pivot.location = (0, -0.1, 1.35)

cam_obj.location = (0, -4.2, 2.2)
cam_obj.rotation_euler = (math.radians(72), 0, 0)
cam_obj.parent = cam_pivot

# Studio Softbox Key Light
key_data = bpy.data.lights.new("KeyLight", 'AREA')
key_data.energy = 220.0
key_data.size = 2.5
key_data.color = (1.0, 0.96, 0.90)
key_obj = bpy.data.objects.new("KeyLight", key_data)
key_obj.location = (2.5, -3.5, 4.0)
key_obj.rotation_euler = (math.radians(50), math.radians(15), math.radians(-25))
scene.collection.objects.link(key_obj)

# Studio Fill Light
fill_data = bpy.data.lights.new("FillLight", 'AREA')
fill_data.energy = 90.0
fill_data.size = 3.0
fill_data.color = (0.85, 0.92, 1.0)
fill_obj = bpy.data.objects.new("FillLight", fill_data)
fill_obj.location = (-2.5, -3.0, 3.0)
scene.collection.objects.link(fill_obj)

# Overhead Pendant Light Glows
for lx in [-0.55, 0.55]:
    lamp_bulb = bpy.data.lights.new("PendantLight", 'POINT')
    lamp_bulb.energy = 45.0
    lamp_bulb.color = (1.0, 0.88, 0.65)
    l_obj = bpy.data.objects.new("PendantLight", lamp_bulb)
    l_obj.location = (lx, -0.1, 2.0)
    scene.collection.objects.link(l_obj)

# 11. STOP-MOTION ANIMATION (6-second seamless loop)
# Character Left (Guy chewing/nodding & dipping fork)
head_l.animation_data_create()
head_l.rotation_euler = (0, 0, 0)
head_l.keyframe_insert(data_path="rotation_euler", frame=1)
head_l.rotation_euler = (math.radians(5), 0, math.radians(3))
head_l.keyframe_insert(data_path="rotation_euler", frame=72)
head_l.rotation_euler = (0, 0, 0)
head_l.keyframe_insert(data_path="rotation_euler", frame=144)

hand_l1.animation_data_create()
hand_l1.location = (-0.52, -0.15, 0.98)
hand_l1.keyframe_insert(data_path="location", frame=1)
hand_l1.location = (-0.46, -0.13, 1.05)
hand_l1.keyframe_insert(data_path="location", frame=72)
hand_l1.location = (-0.52, -0.15, 0.98)
hand_l1.keyframe_insert(data_path="location", frame=144)

# Character Right (Girl raising glass & smiling)
head_r.animation_data_create()
head_r.rotation_euler = (0, 0, 0)
head_r.keyframe_insert(data_path="rotation_euler", frame=1)
head_r.rotation_euler = (math.radians(-4), math.radians(2), math.radians(-4))
head_r.keyframe_insert(data_path="rotation_euler", frame=72)
head_r.rotation_euler = (0, 0, 0)
head_r.keyframe_insert(data_path="rotation_euler", frame=144)

hand_r1.animation_data_create()
hand_r1.location = (0.52, -0.20, 1.08)
hand_r1.keyframe_insert(data_path="location", frame=1)
hand_r1.location = (0.45, -0.18, 1.22)
hand_r1.keyframe_insert(data_path="location", frame=72)
hand_r1.location = (0.52, -0.20, 1.08)
hand_r1.keyframe_insert(data_path="location", frame=144)

# Subtle Camera Orbit
cam_pivot.animation_data_create()
cam_pivot.rotation_euler = (0, 0, math.radians(-2.5))
cam_pivot.keyframe_insert(data_path="rotation_euler", frame=1)
cam_pivot.rotation_euler = (0, 0, math.radians(2.5))
cam_pivot.keyframe_insert(data_path="rotation_euler", frame=72)
cam_pivot.rotation_euler = (0, 0, math.radians(-2.5))
cam_pivot.keyframe_insert(data_path="rotation_euler", frame=144)

# 12. EXPORT GLB ASSET
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

print("SUCCESS: Stefano Colferai Claymation Date Diorama GLB exported.")
