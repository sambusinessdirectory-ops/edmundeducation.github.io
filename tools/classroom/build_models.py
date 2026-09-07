"""Blender-authored matte classroom and mascot glTF assets. Identity: supplied Eddy/Elsie/Phoebe briefs, v1.0."""
import bpy,math,os
from mathutils import Vector
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'))
OUT=os.path.join(ROOT,'assets/speaking-system/classroom');os.makedirs(OUT,exist_ok=True)
def material(name,color,rough=.85):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;return m
coat=material('Warm chestnut',(0.48,.20,.075));goldcoat=material('Golden copper',(.62,.28,.09));dark=material('Warm charcoal',(.055,.038,.035));muzzle=material('Dark chocolate muzzle',(.20,.12,.085));cream=material('Ivory mane',(.94,.84,.65));goldhair=material('Flaxen golden mane',(.76,.54,.25));white=material('Cream white',(.97,.94,.85));blue=material('Cobalt satin',(.035,.20,.54),.5);iris=material('Glossy blue eyes',(.03,.35,.66),.3);brown=material('Warm brown eyes',(.19,.085,.026),.3);black=material('Pupils',(.01,.008,.009),.25);brass=material('Warm brass',(.71,.43,.12),.45);wood=material('School desk wood',(.50,.32,.16));metal=material('Powder coated metal',(.20,.28,.26));sage=material('Sage seat',(.20,.38,.33));paper=material('Paper',(.93,.92,.82));walls=material('Warm plaster',(.82,.81,.70));floor=material('Terrazzo',(.55,.57,.52));board=material('Chalkboard',(.055,.19,.14));glass=material('Pale blue window',(.52,.72,.80));lower=material('Lower wall green',(.35,.48,.43))
def clear():
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def finish(o,name,mat,parent=None):
 o.name=name;o.data.materials.append(mat)
 if parent:o.parent=parent
 return o
def ball(name,loc,scale,mat,parent=None):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=40,ring_count=24,location=loc);o=bpy.context.object;o.scale=scale;finish(o,name,mat,parent)
 for p in o.data.polygons:p.use_smooth=True
 return o
def box(name,loc,scale,mat,parent=None,bevel=.04):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);finish(o,name,mat,parent)
 if bevel:
  b=o.modifiers.new('Soft edges','BEVEL');b.width=bevel;b.segments=3;o.modifiers.new('Normals','WEIGHTED_NORMAL')
 return o
def curve(name,pts,radius,mat,parent=None):
 d=bpy.data.curves.new(name,'CURVE');d.dimensions='3D';d.resolution_u=10;d.bevel_depth=radius;d.bevel_resolution=3;s=d.splines.new('BEZIER');s.bezier_points.add(len(pts)-1)
 for i,(p,co) in enumerate(zip(s.bezier_points,pts)):
  p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO';p.radius=(1 if i<len(pts)-1 else .18) if 'mane' in name.lower() or 'forelock' in name.lower() or 'tail' in name.lower() else 1
 o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);finish(o,name,mat,parent);return o
def group(name):
 o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);return o
def fuse(objects,name,mat,parent):
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.convert(target='MESH');bpy.ops.object.join();o=bpy.context.object
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 remesh=o.modifiers.new('Continuous sculpted silhouette','REMESH');remesh.mode='VOXEL';remesh.voxel_size=.022;bpy.ops.object.modifier_apply(modifier=remesh.name)
 smooth=o.modifiers.new('Soft anatomical transitions','SMOOTH');smooth.factor=1.2;smooth.iterations=5;bpy.ops.object.modifier_apply(modifier=smooth.name)
 o.name=name;o.parent=parent;o.data.materials.clear();o.data.materials.append(mat)
 for face in o.data.polygons:face.use_smooth=True
 return o
def ear(x,parent,skin):
 o=ball('Leaf shaped ear',(x,.01,2.18),(.095,.068,.235),skin,parent)
 for v in o.data.vertices:
  if v.co.z>0:v.co.x*=1-v.co.z*.65
 o.rotation_euler[1]=-.24 if x<0 else .24
 inner=ball('Velvet inner ear',(x,-.054,2.18),(.044,.014,.145),muzzle,parent);inner.rotation_euler[1]=o.rotation_euler[1]
def horse(name):
 g=group(name);hair=dark if name=='eddy' else cream if name=='elsie' else goldhair;skin=coat if name=='eddy' else goldcoat
 body=[ball('Ribcage',(0,.09,.86),(.35,.46,.45),skin,g),ball('Shoulders',(0,-.12,1.06),(.29,.30,.36),skin,g),ball('Tapered neck',(0,-.14,1.35),(.23,.25,.39),skin,g)]
 for x in [-.19,.19]:
  for y in [-.20,.32]:
   body.append(ball('Upper leg',(x,y,.53),(.115,.13,.32),skin,g));body.append(ball('Lower leg',(x,y-.015,.31),(.085,.105,.21),skin,g));ball('Soft square hoof',(x,y-.035,.16),(.115,.15,.10),dark,g)
 fuse(body,'Sculpted body and legs',skin,g)
 existing=set(bpy.context.scene.objects)
 headparts=[ball('Cheek and forehead',(0,-.21,1.79),(.355,.31,.345),skin,g),ball('Tapered facial bridge',(0,-.39,1.66),(.27,.275,.27),skin,g)]
 fuse(headparts,'Sculpted equine face',skin,g)
 for x in [-.245,.245]:ear(x,g,skin)
 ball('Velvet soft muzzle',(0,-.54,1.54),(.285,.195,.16),muzzle,g)
 if name!='eddy':
  ball('Ivory facial blaze',(0,-.496,1.85),(.059,.016,.23),white,g);ball('Blaze bridge',(0,-.632,1.67),(.053,.015,.10),white,g)
 for x in [-.19,.19]:
  # Small warm sclera and large irises prevent a startled, staring expression.
  eye=group('EyeBlink');eye.location=(x,-.458,1.84);eye.parent=g
  for label,loc,scale,mat in [('Soft eye rim',(0,0,0),(.105,.048,.118),muzzle),('Warm sclera',(0,-.027,0),(.090,.026,.102),white),('Large iris',(.006,-.045,-.003),(.075,.018,.089),iris if name=='elsie' else brown),('Soft pupil',(.007,-.060,0),(.048,.009,.067),black),('Eye glint',(-.019,-.070,.030),(.019,.006,.024),white)]:ball(label,loc,scale,mat,eye)
  # Children use local eye coordinates; the exported group is also the blink pivot.
  curve('Relaxed upper eyelid',[(x-.08,-.47,1.89),(x,-.50,1.943),(x+.08,-.47,1.90)],.015,skin,g)
  ball('Small nostril',(x*.65,-.717,1.57),(.022,.009,.018),dark,g)
  curve('Friendly eyebrow',[(x-.06,-.43,2.015),(x,-.452,2.032),(x+.055,-.43,2.022)],.013,hair,g)
  if name!='eddy':
   curve('Outer lash',[(x,-.49,1.94),(x+(.10 if x>0 else -.10),-.46,1.965)],.010,dark,g)
 curve('Gentle smile',[(-.12,-.695,1.48),(0,-.731,1.465),(.12,-.695,1.48)],.008,dark,g)
 for i in range(4):
  x=-.24+i*.14
  curve('Broad swept forelock',[(.18,.00,2.17),(x,-.25,2.20),(x-.08,-.43,2.05-i*.02)],.095,hair,g)
 for i in range(4):
  x=-.28-i*.035
  pts=[(x,.06,2.03),(x-.09,-.02,1.72),(x-.04,.04,1.45),(x-.12,-.015,1.12)] if name!='eddy' else [(x,.12,1.93),(x-.01,.18,1.65),(x+.07,.22,1.39)]
  curve('Layered mane lock',pts,.077,hair,g)
 for i in range(3):curve('Full curled tail',[(.10+i*.05,.42,.92),(.41+i*.04,.67,.72),(.37+i*.04,.70,.34),(.57+i*.03,.63,.23)],.080,hair,g)
 if name=='elsie':
  for x,rotation in [(-.36,-.5),(-.53,.5)]:o=ball('Blue bow loop',(x,-.23,2.16),(.11,.055,.075),blue,g);o.rotation_euler[1]=rotation
  ball('Bow knot',(-.445,-.28,2.15),(.045,.03,.055),blue,g)
  curve('Bow ribbon',[(-.44,-.24,2.13),(-.47,-.26,2.0),(-.53,-.28,1.96)],.028,blue,g)
 if name=='phoebe':
  curve('Halter noseband',[(-.26,-.61,1.62),(0,-.703,1.57),(.26,-.61,1.62)],.024,muzzle,g)
  for x in [-.29,.29]:
   curve('Halter cheek strap',[(x,-.42,1.6),(x*.97,-.25,1.93),(x*.7,.08,2.08)],.024,muzzle,g)
   bpy.ops.mesh.primitive_torus_add(major_radius=.047,minor_radius=.012,major_segments=20,minor_segments=8,location=(x,-.60,1.61),rotation=(math.pi/2,0,0));finish(bpy.context.object,'Gold halter ring',brass,g)
 head=group('HeadRig');head.location=(0,-.12,1.36);head.parent=g
 bpy.context.view_layer.update()
 for o in list(bpy.context.scene.objects):
  if o not in existing and o not in [head,g] and o.parent==g and 'tail' not in o.name.lower():
   world=o.matrix_world.copy();o.parent=head;o.matrix_world=world
 return g
def desk(name='Student desk'):
 g=group(name);box('Rounded wooden desktop',(0,0,.79),(.94,.63,.07),wood,g)
 for x in [-.38,.38]:
  for y in [-.23,.23]:box('Metal desk leg',(x,y,.40),(.035,.035,.75),metal,g,.01)
 box('Desk shelf',(0,0,.63),(.79,.50,.03),metal,g);box('Note paper',(0,-.04,.835),(.31,.23,.008),paper,g,.002)
 box('Chair seat',(0,.57,.46),(.47,.45,.045),sage,g)
 for x in [-.18,.18]:
  for y in [.41,.73]:box('Chair leg',(x,y,.23),(.028,.028,.46),metal,g,.006)
  box('Chair upright',(x,.76,.67),(.025,.025,.58),metal,g,.006)
 box('Chair back',(0,.77,.85),(.46,.04,.21),sage,g);return g
def text(label,loc,size,mat,rotation=(math.pi/2,0,0)):
 bpy.ops.object.text_add(location=loc,rotation=rotation);o=bpy.context.object;o.data.body=label;o.data.size=size;o.data.extrude=.001;o.data.align_x='CENTER';o.data.materials.append(mat);return o
def export(name):
 bpy.ops.object.select_all(action='SELECT')
 # glTF exports mesh curves after conversion, retaining named transforms.
 for o in list(bpy.context.selected_objects):
  if o.type in ('CURVE','FONT'):
   bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH')
 bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,name+'.glb'),export_format='GLB',use_selection=False,export_cameras=False,export_lights=False)
clear();horse('eddy');export('eddy')
clear();horse('elsie');export('elsie')
clear();horse('phoebe');export('phoebe')
clear();desk();export('desk')
clear();box('Terrazzo floor',(0,0,-.09),(10,8,.18),floor,None,.015);box('Back plaster wall',(0,4,1.7),(10,.12,3.4),walls)
box('Lower green wall',(0,3.91,.56),(10,.055,1.1),lower);box('Left wall',(-5,0,1.7),(.12,8,3.4),walls)
box('Chalkboard frame',(0,3.81,2.03),(4.9,.12,1.52),wood);box('Green chalkboard',(0,3.72,2.03),(4.70,.03,1.34),board)
text('ENGLISH  |  SPEAKING STUDIO',(0,3.68,2.35),.21,paper);text('LISTEN   -   RESPOND   -   BUILD',(0,3.67,1.93),.15,paper)
for y in [-2.4,0,2.4]:
 box('Window light',(-4.91,y,2.13),(.025,1.85,1.52),glass)
 for z in [1.37,2.13,2.9]:box('Window frame',(-4.86,y,z),(.05,1.95,.055),paper)
 for yy in [y-.95,y,y+.95]:box('Window upright',(-4.86,yy,2.13),(.05,.055,1.55),paper)
for x in [-3.6,3.6]:
 box('Classroom noticeboard',(x,3.78,2.0),(1.30,.09,1.37),wood)
 for z in [1.76,2.26]:box('Notice sheet',(x,3.72,z),(.85,.02,.37),paper,.0 if False else None)
for x in [-.7,.7]:g=desk('Examiner desk');g.location=(x,-2.5,0);g.rotation_euler[2]=math.pi
export('classroom')
# Render the actual assets together for asset QA.
for i,name in enumerate(['eddy','elsie','phoebe']):
 g=desk('Candidate '+name);g.location=((i-1)*1.55,1.2,0)
 h=horse(name);h.location=((i-1)*1.55,1.7,.18);h.scale=(.65,.65,.65)
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.world.color=(.65,.65,.65)
for name,loc,power,size in [('Window daylight',(-3,-4,7),1400,7),('Fill',(4,-1,5),950,6)]:
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,1,1))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(7,-10,7));cam=bpy.context.object;cam.rotation_euler=(Vector((0,1,1))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=11;scene.camera=cam
scene.render.resolution_x=1400;scene.render.resolution_y=1000;scene.render.resolution_percentage=100;scene.render.filepath=os.path.join(ROOT,'../classroom-qa.png');bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'classroom-source.blend'));bpy.ops.render.render(write_still=True)
