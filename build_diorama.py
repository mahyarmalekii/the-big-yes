import bpy
import math
import os

# Reset Scene
bpy.ops.wm.read_factory_settings(use_empty=True)

scene = bpy.context.scene
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 144  # 6-second loop at 24fps

def get_active():
    return bpy.context.view_layer.objects.active

# 1. Color Palette Materials
def create_mat(name, color, roughness=0.35, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
    return mat

mat_cream = create_mat("Mat_Cream", (0.98, 0.96, 0.88, 1.0))
mat_yellow = create_mat("Mat_Yellow", (1.0, 0.85, 0.05, 1.0))
mat_blue = create_mat("Mat_Blue", (0.1, 0.35, 0.95, 1.0))
mat_orange = create_mat("Mat_Orange", (1.0, 0.42, 0.05, 1.0))
mat_red = create_mat("Mat_Red", (0.92, 0.15, 0.2, 1.0))
mat_green = create_mat("Mat_Green", (0.1, 0.75, 0.35, 1.0))
mat_pink = create_mat("Mat_Pink", (1.0, 0.3, 0.55, 1.0))
mat_black = create_mat("Mat_Black", (0.08, 0.08, 0.1, 1.0), roughness=0.6)
mat_white = create_mat("Mat_White", (0.96, 0.96, 0.96, 1.0))
mat_gold = create_mat("Mat_Gold", (0.95, 0.75, 0.2, 1.0), metallic=0.4)

def set_mat(obj, mat):
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)

# 2. PLATFORM
bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=3.2, depth=0.4, location=(0, 0, -0.2))
platform = get_active()
platform.name = "PLATFORM"
platform.scale = (1.1, 0.95, 1.0)
set_mat(platform, mat_cream)

# Sidewalk tiles on platform
for i, pos in enumerate([(-1.8, -1.2, 0.02), (-1.2, -1.8, 0.02), (-0.4, -2.2, 0.02), (0.6, -2.1, 0.02)]):
    bpy.ops.mesh.primitive_cube_add(size=0.45, location=pos)
    stone = get_active()
    stone.scale = (1.0, 0.7, 0.05)
    stone.rotation_euler = (0, 0, i * 0.35)
    set_mat(stone, mat_yellow if i % 2 == 0 else mat_pink)
    stone.parent = platform

# 3. TABLE
bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.9, depth=0.08, location=(0, 0, 1.1))
table_top = get_active()
table_top.name = "TABLE"
set_mat(table_top, mat_white)

bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.08, depth=1.1, location=(0, 0, 0.55))
table_leg = get_active()
set_mat(table_leg, mat_black)
table_leg.parent = table_top

bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.45, depth=0.06, location=(0, 0, 0.03))
table_base = get_active()
set_mat(table_base, mat_black)
table_base.parent = table_top

# 4. CHAIR_LEFT
bpy.ops.mesh.primitive_cube_add(size=0.6, location=(-1.4, 0, 0.6))
chair_left = get_active()
chair_left.name = "CHAIR_LEFT"
chair_left.scale = (0.9, 0.9, 0.1)
chair_left.rotation_euler = (0, 0, math.radians(15))
set_mat(chair_left, mat_yellow)

bpy.ops.mesh.primitive_cube_add(size=0.5, location=(-1.7, 0, 1.05))
back_l = get_active()
back_l.scale = (0.1, 0.85, 0.9)
back_l.rotation_euler = (0, math.radians(-10), math.radians(15))
set_mat(back_l, mat_yellow)
back_l.parent = chair_left

for lx, ly in [(-0.22, -0.22), (-0.22, 0.22), (0.22, -0.22), (0.22, 0.22)]:
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.04, depth=0.6, location=(-1.4 + lx, ly, 0.3))
    leg = get_active()
    set_mat(leg, mat_black)
    leg.parent = chair_left

# 5. CHAIR_RIGHT
bpy.ops.mesh.primitive_cube_add(size=0.6, location=(1.4, 0, 0.6))
chair_right = get_active()
chair_right.name = "CHAIR_RIGHT"
chair_right.scale = (0.9, 0.9, 0.1)
chair_right.rotation_euler = (0, 0, math.radians(-15))
set_mat(chair_right, mat_blue)

bpy.ops.mesh.primitive_cube_add(size=0.5, location=(1.7, 0, 1.05))
back_r = get_active()
back_r.scale = (0.1, 0.85, 0.9)
back_r.rotation_euler = (0, math.radians(10), math.radians(-15))
set_mat(back_r, mat_blue)
back_r.parent = chair_right

for rx, ry in [(-0.22, -0.22), (-0.22, 0.22), (0.22, -0.22), (0.22, 0.22)]:
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.04, depth=0.6, location=(1.4 + rx, ry, 0.3))
    leg = get_active()
    set_mat(leg, mat_black)
    leg.parent = chair_right

# 6. CHARACTER_LEFT (Illustrated Character with Fork)
bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.35, depth=0.8, location=(-1.35, 0, 1.05))
char_left = get_active()
char_left.name = "CHARACTER_LEFT"
char_left.rotation_euler = (0, 0, math.radians(20))
set_mat(char_left, mat_red)

bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.3, location=(-1.35, 0, 1.65))
head_l = get_active()
head_l.name = "HEAD_LEFT"
set_mat(head_l, mat_cream)
head_l.parent = char_left

bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.32, depth=0.25, location=(-1.35, 0, 1.9))
hair_l = get_active()
set_mat(hair_l, mat_black)
hair_l.parent = head_l

bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.14, location=(-0.75, 0.15, 1.25))
hand_l = get_active()
hand_l.name = "HAND_LEFT"
set_mat(hand_l, mat_cream)
hand_l.parent = char_left

# FORK
bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.02, depth=0.38, location=(-0.65, 0.15, 1.35))
fork = get_active()
fork.name = "FORK"
fork.rotation_euler = (math.radians(25), math.radians(-30), 0)
set_mat(fork, mat_gold)
fork.parent = hand_l

# 7. CHARACTER_RIGHT (Illustrated Character with Drink)
bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.4, depth=0.85, location=(1.35, 0, 1.05))
char_right = get_active()
char_right.name = "CHARACTER_RIGHT"
char_right.rotation_euler = (0, 0, math.radians(-20))
set_mat(char_right, mat_green)

bpy.ops.mesh.primitive_cube_add(size=0.48, location=(1.35, 0, 1.65))
head_r = get_active()
head_r.name = "HEAD_RIGHT"
set_mat(head_r, mat_cream)
head_r.parent = char_right

bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.32, location=(1.35, 0, 1.85))
hair_r = get_active()
hair_r.scale = (1.1, 1.1, 0.6)
set_mat(hair_r, mat_orange)
hair_r.parent = head_r

bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.14, location=(0.75, 0.1, 1.3))
hand_r = get_active()
hand_r.name = "HAND_RIGHT"
set_mat(hand_r, mat_cream)
hand_r.parent = char_right

# 8. FOOD_PLATE
bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.36, depth=0.04, location=(-0.35, 0.05, 1.16))
plate = get_active()
plate.name = "FOOD_PLATE"
set_mat(plate, mat_cream)

bpy.ops.mesh.primitive_cone_add(vertices=3, radius1=0.22, depth=0.06, location=(-0.35, 0.05, 1.21))
food_item = get_active()
food_item.rotation_euler = (0, 0, math.radians(45))
set_mat(food_item, mat_orange)
food_item.parent = plate

for fx, fy in [(-0.38, 0.12), (-0.3, -0.02), (-0.42, -0.01)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=6, ring_count=4, radius=0.05, location=(fx, fy, 1.23))
    dot = get_active()
    set_mat(dot, mat_red)
    dot.parent = plate

# 9. WINE_GLASS
bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.12, depth=0.22, location=(0.65, 0.12, 1.42))
wine_glass = get_active()
wine_glass.name = "WINE_GLASS"
set_mat(wine_glass, mat_pink)
wine_glass.parent = hand_r

# 10. BEER_GLASS
bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.14, depth=0.32, location=(0.35, -0.15, 1.3))
beer_glass = get_active()
beer_glass.name = "BEER_GLASS"
set_mat(beer_glass, mat_yellow)

bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.15, depth=0.08, location=(0.35, -0.15, 1.48))
foam = get_active()
set_mat(foam, mat_white)
foam.parent = beer_glass

# 11. FLOWER in mini vase
bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.1, depth=0.2, location=(0, -0.22, 1.24))
vase = get_active()
set_mat(vase, mat_black)

bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.12, location=(0, -0.22, 1.42))
flower = get_active()
flower.name = "FLOWER"
set_mat(flower, mat_red)
flower.parent = vase

# 12. LAMP
bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.06, depth=2.8, location=(-2.2, 1.2, 1.4))
lamp_post = get_active()
lamp_post.name = "LAMP"
set_mat(lamp_post, mat_black)

bpy.ops.mesh.primitive_cube_add(size=0.45, location=(-2.2, 1.2, 2.85))
lamp_head = get_active()
lamp_head.rotation_euler = (0, 0, math.radians(45))
set_mat(lamp_head, mat_yellow)
lamp_head.parent = lamp_post

# 13. PLANT
bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.35, depth=0.5, location=(2.1, 1.2, 0.25))
pot = get_active()
pot.name = "PLANT"
set_mat(pot, mat_pink)

bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.45, location=(2.1, 1.2, 0.75))
bush = get_active()
set_mat(bush, mat_green)
bush.parent = pot

# 14. ABSTRACT TOYS
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.22, location=(0, 2.0, 2.2))
geo_toy1 = get_active()
geo_toy1.name = "GEO_TOY"
set_mat(geo_toy1, mat_blue)

bpy.ops.mesh.primitive_torus_add(major_radius=0.25, minor_radius=0.06, location=(-1.2, -1.8, 1.8))
geo_toy2 = get_active()
set_mat(geo_toy2, mat_orange)

# 15. CAMERA & LIGHTS
cam_data = bpy.data.cameras.new("OrthoCam")
cam_data.type = 'ORTHO'
cam_data.ortho_scale = 7.2
cam_obj = bpy.data.objects.new("Camera", cam_data)
scene.collection.objects.link(cam_obj)
scene.camera = cam_obj

cam_pivot = bpy.data.objects.new("Camera_Pivot", None)
scene.collection.objects.link(cam_pivot)
cam_pivot.location = (0, 0, 0.9)

cam_obj.location = (0, -8.0, 6.0)
cam_obj.rotation_euler = (math.radians(55), 0, 0)
cam_obj.parent = cam_pivot

# Sun Light
light_data = bpy.data.lights.new("Sun", 'SUN')
light_data.energy = 4.0
light_obj = bpy.data.objects.new("SunLight", light_data)
light_obj.location = (4.0, -3.0, 7.0)
light_obj.rotation_euler = (math.radians(45), math.radians(20), math.radians(-30))
scene.collection.objects.link(light_obj)

# Fill Light
fill_data = bpy.data.lights.new("Fill", 'POINT')
fill_data.energy = 80.0
fill_obj = bpy.data.objects.new("FillLight", fill_data)
fill_obj.location = (-4.0, -4.0, 4.0)
scene.collection.objects.link(fill_obj)

# 16. ANIMATION LOOP (144 frames)
head_l.animation_data_create()
head_l.rotation_euler = (0, 0, 0)
head_l.keyframe_insert(data_path="rotation_euler", frame=1)
head_l.rotation_euler = (math.radians(8), 0, math.radians(5))
head_l.keyframe_insert(data_path="rotation_euler", frame=72)
head_l.rotation_euler = (0, 0, 0)
head_l.keyframe_insert(data_path="rotation_euler", frame=144)

hand_l.animation_data_create()
hand_l.location = (-0.75, 0.15, 1.25)
hand_l.keyframe_insert(data_path="location", frame=1)
hand_l.location = (-0.68, 0.12, 1.32)
hand_l.keyframe_insert(data_path="location", frame=72)
hand_l.location = (-0.75, 0.15, 1.25)
hand_l.keyframe_insert(data_path="location", frame=144)

hand_r.animation_data_create()
hand_r.location = (0.75, 0.1, 1.3)
hand_r.keyframe_insert(data_path="location", frame=1)
hand_r.location = (0.65, 0.08, 1.48)
hand_r.keyframe_insert(data_path="location", frame=72)
hand_r.location = (0.75, 0.1, 1.3)
hand_r.keyframe_insert(data_path="location", frame=144)

flower.animation_data_create()
flower.rotation_euler = (0, 0, 0)
flower.keyframe_insert(data_path="rotation_euler", frame=1)
flower.rotation_euler = (math.radians(6), math.radians(-4), 0)
flower.keyframe_insert(data_path="rotation_euler", frame=72)
flower.rotation_euler = (0, 0, 0)
flower.keyframe_insert(data_path="rotation_euler", frame=144)

lamp_post.animation_data_create()
lamp_post.rotation_euler = (0, 0, 0)
lamp_post.keyframe_insert(data_path="rotation_euler", frame=1)
lamp_post.rotation_euler = (math.radians(1.5), math.radians(-1.5), 0)
lamp_post.keyframe_insert(data_path="rotation_euler", frame=72)
lamp_post.rotation_euler = (0, 0, 0)
lamp_post.keyframe_insert(data_path="rotation_euler", frame=144)

geo_toy1.animation_data_create()
geo_toy1.rotation_euler = (0, 0, 0)
geo_toy1.keyframe_insert(data_path="rotation_euler", frame=1)
geo_toy1.rotation_euler = (math.radians(180), math.radians(180), math.radians(180))
geo_toy1.keyframe_insert(data_path="rotation_euler", frame=72)
geo_toy1.rotation_euler = (math.radians(360), math.radians(360), math.radians(360))
geo_toy1.keyframe_insert(data_path="rotation_euler", frame=144)

cam_pivot.animation_data_create()
cam_pivot.rotation_euler = (0, 0, math.radians(-3.5))
cam_pivot.keyframe_insert(data_path="rotation_euler", frame=1)
cam_pivot.rotation_euler = (0, 0, math.radians(3.5))
cam_pivot.keyframe_insert(data_path="rotation_euler", frame=72)
cam_pivot.rotation_euler = (0, 0, math.radians(-3.5))
cam_pivot.keyframe_insert(data_path="rotation_euler", frame=144)

# 17. EXPORT GLB
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

print("SUCCESSFULLY_EXPORTED_DIORAMA_GLB")
