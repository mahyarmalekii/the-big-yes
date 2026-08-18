import bpy
import math
import os

# Reset Scene
bpy.ops.wm.read_factory_settings(use_empty=True)

scene = bpy.context.scene
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 144  # 6-second seamless loop

def get_active():
    return bpy.context.view_layer.objects.active

def apply_smooth(obj):
    if hasattr(obj.data, 'polygons'):
        for p in obj.data.polygons:
            p.use_smooth = True

# 1. High-End Stylized Toy / Clay Materials
def create_mat(name, color, roughness=0.25, metallic=0.0, transmission=0.0, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
        if 'Transmission Weight' in bsdf.inputs:
            bsdf.inputs['Transmission Weight'].default_value = transmission
        elif 'Transmission' in bsdf.inputs:
            bsdf.inputs['Transmission'].default_value = transmission
        if emission and 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = emission
            if 'Emission Strength' in bsdf.inputs:
                bsdf.inputs['Emission Strength'].default_value = emission_strength
    return mat

mat_base_terracotta = create_mat("Mat_Terracotta", (0.85, 0.45, 0.32, 1.0), roughness=0.6)
mat_pavement = create_mat("Mat_Pavement", (0.92, 0.90, 0.84, 1.0), roughness=0.5)
mat_curb = create_mat("Mat_Curb", (0.75, 0.72, 0.68, 1.0), roughness=0.5)
mat_wood_table = create_mat("Mat_Wood", (0.45, 0.26, 0.15, 1.0), roughness=0.3)
mat_brass = create_mat("Mat_Brass", (0.95, 0.78, 0.25, 1.0), roughness=0.2, metallic=0.7)
mat_chair_red = create_mat("Mat_ChairRed", (0.88, 0.22, 0.20, 1.0), roughness=0.35)
mat_chair_navy = create_mat("Mat_ChairNavy", (0.15, 0.30, 0.65, 1.0), roughness=0.35)
mat_skin_warm = create_mat("Mat_SkinWarm", (0.96, 0.78, 0.65, 1.0), roughness=0.45)
mat_skin_fair = create_mat("Mat_SkinFair", (0.98, 0.84, 0.72, 1.0), roughness=0.45)
mat_hair_dark = create_mat("Mat_HairDark", (0.15, 0.12, 0.10, 1.0), roughness=0.5)
mat_hair_ginger = create_mat("Mat_HairGinger", (0.85, 0.40, 0.12, 1.0), roughness=0.4)
mat_sweater_mustard = create_mat("Mat_SweaterMustard", (0.95, 0.72, 0.10, 1.0), roughness=0.7)
mat_sweater_coral = create_mat("Mat_SweaterCoral", (0.95, 0.35, 0.42, 1.0), roughness=0.7)
mat_wine_glass = create_mat("Mat_Glass", (0.9, 0.95, 1.0, 0.4), roughness=0.08, transmission=0.85)
mat_wine_red = create_mat("Mat_WineLiquid", (0.65, 0.05, 0.15, 1.0), roughness=0.1)
mat_beer_amber = create_mat("Mat_BeerLiquid", (0.95, 0.60, 0.10, 1.0), roughness=0.15)
mat_beer_foam = create_mat("Mat_BeerFoam", (0.98, 0.98, 0.96, 1.0), roughness=0.8)
mat_food_plate = create_mat("Mat_Plate", (0.98, 0.98, 0.98, 1.0), roughness=0.15)
mat_pasta_food = create_mat("Mat_Pasta", (0.95, 0.75, 0.30, 1.0), roughness=0.4)
mat_tomato_sauce = create_mat("Mat_Tomato", (0.85, 0.18, 0.12, 1.0), roughness=0.3)
mat_plant_green = create_mat("Mat_Greenery", (0.18, 0.65, 0.25, 1.0), roughness=0.4)
mat_plant_dark = create_mat("Mat_DarkGreen", (0.10, 0.45, 0.18, 1.0), roughness=0.4)
mat_lamp_black = create_mat("Mat_LampIron", (0.12, 0.12, 0.14, 1.0), roughness=0.3)
mat_lamp_glow = create_mat("Mat_GlowLight", (1.0, 0.92, 0.65, 1.0), roughness=0.2, emission=(1.0, 0.88, 0.50, 1.0), emission_strength=4.0)
mat_string_light = create_mat("Mat_FairyLight", (1.0, 0.95, 0.75, 1.0), emission=(1.0, 0.92, 0.65, 1.0), emission_strength=3.5)
mat_awning_stripe = create_mat("Mat_AwningRed", (0.90, 0.20, 0.25, 1.0), roughness=0.5)

def set_mat(obj, mat):
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)

# 2. PLATFORM (Rounded European Café Terrace)
bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=2.4, depth=0.35, location=(0, 0, -0.175))
platform = get_active()
platform.name = "PLATFORM"
platform.scale = (1.05, 0.95, 1.0)
apply_smooth(platform)
set_mat(platform, mat_base_terracotta)

# Cobblestone Top Surface
bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=2.25, depth=0.08, location=(0, 0, 0.02))
pave = get_active()
pave.scale = (1.05, 0.95, 1.0)
apply_smooth(pave)
set_mat(pave, mat_pavement)
pave.parent = platform

# 3. CAFÉ TABLE (Round Walnut Table with Brass Edge)
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.72, depth=0.06, location=(0, 0, 0.95))
table_top = get_active()
table_top.name = "TABLE"
apply_smooth(table_top)
set_mat(table_top, mat_wood_table)

# Brass Ring around table
bpy.ops.mesh.primitive_torus_add(major_radius=0.73, minor_radius=0.025, major_segments=24, minor_segments=8, location=(0, 0, 0.95))
table_ring = get_active()
apply_smooth(table_ring)
set_mat(table_ring, mat_brass)
table_ring.parent = table_top

# Table Pedestal
bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.06, depth=0.9, location=(0, 0, 0.48))
table_pedestal = get_active()
apply_smooth(table_pedestal)
set_mat(table_pedestal, mat_brass)
table_pedestal.parent = table_top

bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.36, depth=0.05, location=(0, 0, 0.04))
table_base = get_active()
apply_smooth(table_base)
set_mat(table_base, mat_lamp_black)
table_base.parent = table_top

# 4. CHAIR_LEFT (Warm Red Bistro Chair)
bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.32, depth=0.05, location=(-1.15, 0, 0.52))
chair_left = get_active()
chair_left.name = "CHAIR_LEFT"
apply_smooth(chair_left)
set_mat(chair_left, mat_chair_red)

# Rounded curved backrest
bpy.ops.mesh.primitive_torus_add(major_radius=0.28, minor_radius=0.03, major_segments=16, minor_segments=8, location=(-1.35, 0, 0.9))
backrest_l = get_active()
backrest_l.rotation_euler = (math.radians(90), 0, math.radians(-15))
apply_smooth(backrest_l)
set_mat(backrest_l, mat_chair_red)
backrest_l.parent = chair_left

for cx, cy in [(-0.18, -0.18), (-0.18, 0.18), (0.18, -0.18), (0.18, 0.18)]:
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.025, depth=0.52, location=(-1.15 + cx, cy, 0.26))
    leg = get_active()
    apply_smooth(leg)
    set_mat(leg, mat_brass)
    leg.parent = chair_left

# 5. CHAIR_RIGHT (Navy Bistro Chair)
bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.32, depth=0.05, location=(1.15, 0, 0.52))
chair_right = get_active()
chair_right.name = "CHAIR_RIGHT"
apply_smooth(chair_right)
set_mat(chair_right, mat_chair_navy)

bpy.ops.mesh.primitive_torus_add(major_radius=0.28, minor_radius=0.03, major_segments=16, minor_segments=8, location=(1.35, 0, 0.9))
backrest_r = get_active()
backrest_r.rotation_euler = (math.radians(90), 0, math.radians(15))
apply_smooth(backrest_r)
set_mat(backrest_r, mat_chair_navy)
backrest_r.parent = chair_right

for cx, cy in [(-0.18, -0.18), (-0.18, 0.18), (0.18, -0.18), (0.18, 0.18)]:
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.025, depth=0.52, location=(1.15 + cx, cy, 0.26))
    leg = get_active()
    apply_smooth(leg)
    set_mat(leg, mat_brass)
    leg.parent = chair_right

# 6. CHARACTER_LEFT (Cute Pixar/Vinyl Toy Figure in Mustard Sweater)
# Torso
bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.32, location=(-1.1, 0, 0.95))
char_left = get_active()
char_left.name = "CHARACTER_LEFT"
char_left.scale = (0.9, 1.0, 1.2)
apply_smooth(char_left)
set_mat(char_left, mat_sweater_mustard)

# Head
bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=14, radius=0.26, location=(-1.1, 0, 1.48))
head_l = get_active()
head_l.name = "HEAD_LEFT"
apply_smooth(head_l)
set_mat(head_l, mat_skin_warm)
head_l.parent = char_left

# Stylish Beret / Hair
bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.28, depth=0.12, location=(-1.1, 0, 1.70))
hair_l = get_active()
hair_l.rotation_euler = (math.radians(8), math.radians(-10), 0)
apply_smooth(hair_l)
set_mat(hair_l, mat_hair_dark)
hair_l.parent = head_l

# Cute Blush Cheeks & Eyes
for ey, ez in [(-0.08, 1.49), (0.08, 1.49)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.022, location=(-0.86, ey, ez))
    eye = get_active()
    set_mat(eye, mat_hair_dark)
    eye.parent = head_l

# Arm & Hand holding Fork
bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.11, location=(-0.65, 0.12, 1.08))
hand_l = get_active()
hand_l.name = "HAND_LEFT"
apply_smooth(hand_l)
set_mat(hand_l, mat_skin_warm)
hand_l.parent = char_left

# FORK (Cute golden dessert/pasta fork)
bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.018, depth=0.32, location=(-0.56, 0.12, 1.16))
fork = get_active()
fork.name = "FORK"
fork.rotation_euler = (math.radians(35), math.radians(-25), 0)
apply_smooth(fork)
set_mat(fork, mat_brass)
fork.parent = hand_l

# 7. CHARACTER_RIGHT (Cute Pixar/Vinyl Toy Figure in Coral Sweater)
# Torso
bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.32, location=(1.1, 0, 0.95))
char_right = get_active()
char_right.name = "CHARACTER_RIGHT"
char_right.scale = (0.9, 1.0, 1.2)
apply_smooth(char_right)
set_mat(char_right, mat_sweater_coral)

# Head
bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=14, radius=0.26, location=(1.1, 0, 1.48))
head_r = get_active()
head_r.name = "HEAD_RIGHT"
apply_smooth(head_r)
set_mat(head_r, mat_skin_fair)
head_r.parent = char_right

# Cute Bob Haircut
bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.30, location=(1.1, 0, 1.62))
hair_r = get_active()
hair_r.scale = (1.05, 1.05, 0.75)
apply_smooth(hair_r)
set_mat(hair_r, mat_hair_ginger)
hair_r.parent = head_r

# Eyes
for ey, ez in [(-0.08, 1.49), (0.08, 1.49)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.022, location=(0.86, ey, ez))
    eye = get_active()
    set_mat(eye, mat_hair_dark)
    eye.parent = head_r

# Arm & Hand raising Wine Glass
bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.11, location=(0.65, 0.10, 1.15))
hand_r = get_active()
hand_r.name = "HAND_RIGHT"
apply_smooth(hand_r)
set_mat(hand_r, mat_skin_fair)
hand_r.parent = char_right

# WINE_GLASS (Stemware with ruby wine liquid)
bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.09, depth=0.18, location=(0.56, 0.12, 1.28))
wine_glass = get_active()
wine_glass.name = "WINE_GLASS"
apply_smooth(wine_glass)
set_mat(wine_glass, mat_wine_glass)
wine_glass.parent = hand_r

bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.075, depth=0.10, location=(0.56, 0.12, 1.25))
wine_liquid = get_active()
apply_smooth(wine_liquid)
set_mat(wine_liquid, mat_wine_red)
wine_liquid.parent = wine_glass

# 8. FOOD_PLATE (Ceramic Plate with Appetizing Pasta & Sauce)
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.30, depth=0.035, location=(-0.25, 0.05, 1.00))
plate = get_active()
plate.name = "FOOD_PLATE"
apply_smooth(plate)
set_mat(plate, mat_food_plate)

# Swirled Pasta Nest
bpy.ops.mesh.primitive_torus_add(major_radius=0.14, minor_radius=0.06, major_segments=16, minor_segments=8, location=(-0.25, 0.05, 1.04))
pasta = get_active()
apply_smooth(pasta)
set_mat(pasta, mat_pasta_food)
pasta.parent = plate

# Tomato & Basil garnish
bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.045, location=(-0.25, 0.05, 1.11))
sauce_dollop = get_active()
set_mat(sauce_dollop, mat_tomato_sauce)
sauce_dollop.parent = plate

# 9. BEER_GLASS (Tall Frosty Pint on Table)
bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.10, depth=0.28, location=(0.28, -0.15, 1.12))
beer_glass = get_active()
beer_glass.name = "BEER_GLASS"
apply_smooth(beer_glass)
set_mat(beer_glass, mat_beer_amber)

# Foamy top
bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.11, location=(0.28, -0.15, 1.26))
beer_foam = get_active()
beer_foam.scale = (1.0, 1.0, 0.45)
apply_smooth(beer_foam)
set_mat(beer_foam, mat_beer_foam)
beer_foam.parent = beer_glass

# 10. FLOWER (Tiny ceramic vase with cute blossom)
bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.07, depth=0.18, location=(0.0, -0.22, 1.07))
vase = get_active()
apply_smooth(vase)
set_mat(vase, mat_chair_navy)

bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.09, location=(0.0, -0.22, 1.22))
flower = get_active()
flower.name = "FLOWER"
apply_smooth(flower)
set_mat(flower, mat_sweater_coral)
flower.parent = vase

# 11. STREET LAMP (Glowing Parisian Lantern)
bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.04, depth=2.4, location=(-1.7, 1.1, 1.2))
lamp_post = get_active()
lamp_post.name = "LAMP"
apply_smooth(lamp_post)
set_mat(lamp_post, mat_lamp_black)

# Lantern Housing
bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.22, depth=0.35, location=(-1.7, 1.1, 2.45))
lantern = get_active()
apply_smooth(lantern)
set_mat(lantern, mat_lamp_black)
lantern.parent = lamp_post

# Glowing Bulb
bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.12, location=(-1.7, 1.1, 2.45))
bulb = get_active()
set_mat(bulb, mat_lamp_glow)
bulb.parent = lantern

# 12. PLANT (Terracotta Planter with Stylized Fiddle Leaves)
bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.28, depth=0.42, location=(1.6, 1.1, 0.21))
pot = get_active()
pot.name = "PLANT"
apply_smooth(pot)
set_mat(pot, mat_base_terracotta)

# Lush Green Spherical Bushes
for px, py, pz, r in [(0, 0, 0.38, 0.32), (-0.08, 0.08, 0.55, 0.24), (0.08, -0.06, 0.60, 0.22)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=10, radius=r, location=(1.6 + px, 1.1 + py, 0.21 + pz))
    leaf_ball = get_active()
    apply_smooth(leaf_ball)
    set_mat(leaf_ball, mat_plant_green)
    leaf_ball.parent = pot

# 13. WARM FAIRY LIGHTS STRING OVERHEAD
for i, t in enumerate([-1.2, -0.6, 0.0, 0.6, 1.2]):
    h = 2.15 - (t * t) * 0.12
    bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.045, location=(t, 0.1, h))
    fairy = get_active()
    set_mat(fairy, mat_string_light)

# 14. CAMERA & LIGHTS (Orthographic 3/4 Elevated View, Perfectly Centered)
cam_data = bpy.data.cameras.new("OrthoCam")
cam_data.type = 'ORTHO'
cam_data.ortho_scale = 5.2
cam_obj = bpy.data.objects.new("Camera", cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

cam_pivot = bpy.data.objects.new("Camera_Pivot", None)
scene.collection.objects.link(cam_pivot)
cam_pivot.location = (0, 0, 1.1)

cam_obj.location = (0, -6.5, 4.8)
cam_obj.rotation_euler = (math.radians(56), 0, 0)
cam_obj.parent = cam_pivot

# Sunlight (Warm Golden Hour)
sun_data = bpy.data.lights.new("Sun", 'SUN')
sun_data.energy = 5.0
sun_data.color = (1.0, 0.95, 0.85)
sun_obj = bpy.data.objects.new("SunLight", sun_data)
sun_obj.location = (3.5, -4.0, 6.0)
sun_obj.rotation_euler = (math.radians(48), math.radians(22), math.radians(-28))
scene.collection.objects.link(sun_obj)

# Soft Blue Sky Fill
fill_data = bpy.data.lights.new("Fill", 'POINT')
fill_data.energy = 120.0
fill_data.color = (0.75, 0.88, 1.0)
fill_obj = bpy.data.objects.new("FillLight", fill_data)
fill_obj.location = (-3.5, -3.5, 3.5)
scene.collection.objects.link(fill_obj)

# 15. SEAMLESS 6-SECOND ANIMATION LOOP (144 frames @ 24fps)
head_l.animation_data_create()
head_l.rotation_euler = (0, 0, 0)
head_l.keyframe_insert(data_path="rotation_euler", frame=1)
head_l.rotation_euler = (math.radians(6), 0, math.radians(4))
head_l.keyframe_insert(data_path="rotation_euler", frame=72)
head_l.rotation_euler = (0, 0, 0)
head_l.keyframe_insert(data_path="rotation_euler", frame=144)

hand_l.animation_data_create()
hand_l.location = (-0.65, 0.12, 1.08)
hand_l.keyframe_insert(data_path="location", frame=1)
hand_l.location = (-0.58, 0.10, 1.14)
hand_l.keyframe_insert(data_path="location", frame=72)
hand_l.location = (-0.65, 0.12, 1.08)
hand_l.keyframe_insert(data_path="location", frame=144)

head_r.animation_data_create()
head_r.rotation_euler = (0, 0, 0)
head_r.keyframe_insert(data_path="rotation_euler", frame=1)
head_r.rotation_euler = (math.radians(-4), math.radians(3), math.radians(-5))
head_r.keyframe_insert(data_path="rotation_euler", frame=72)
head_r.rotation_euler = (0, 0, 0)
head_r.keyframe_insert(data_path="rotation_euler", frame=144)

hand_r.animation_data_create()
hand_r.location = (0.65, 0.10, 1.15)
hand_r.keyframe_insert(data_path="location", frame=1)
hand_r.location = (0.58, 0.08, 1.28)
hand_r.keyframe_insert(data_path="location", frame=72)
hand_r.location = (0.65, 0.10, 1.15)
hand_r.keyframe_insert(data_path="location", frame=144)

flower.animation_data_create()
flower.rotation_euler = (0, 0, 0)
flower.keyframe_insert(data_path="rotation_euler", frame=1)
flower.rotation_euler = (math.radians(5), math.radians(-3), 0)
flower.keyframe_insert(data_path="rotation_euler", frame=72)
flower.rotation_euler = (0, 0, 0)
flower.keyframe_insert(data_path="rotation_euler", frame=144)

lamp_post.animation_data_create()
lamp_post.rotation_euler = (0, 0, 0)
lamp_post.keyframe_insert(data_path="rotation_euler", frame=1)
lamp_post.rotation_euler = (math.radians(1.2), math.radians(-1.0), 0)
lamp_post.keyframe_insert(data_path="rotation_euler", frame=72)
lamp_post.rotation_euler = (0, 0, 0)
lamp_post.keyframe_insert(data_path="rotation_euler", frame=144)

cam_pivot.animation_data_create()
cam_pivot.rotation_euler = (0, 0, math.radians(-3.0))
cam_pivot.keyframe_insert(data_path="rotation_euler", frame=1)
cam_pivot.rotation_euler = (0, 0, math.radians(3.0))
cam_pivot.keyframe_insert(data_path="rotation_euler", frame=72)
cam_pivot.rotation_euler = (0, 0, math.radians(-3.0))
cam_pivot.keyframe_insert(data_path="rotation_euler", frame=144)

# 16. EXPORT GLB ASSET
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

print("SUCCESS: Stylized Pixar-style Diorama GLB exported.")
