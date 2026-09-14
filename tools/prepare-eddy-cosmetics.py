"""Register the supplied cosmetic turnarounds to Eddy's canonical 16-view atlas.

Keep the largest connected garment in each cell, removing detached background
speckles. Full-canvas overlays and explicit masks preserve the shared rig.
"""
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/speaking-system/cosmetics/eddy'
OUT.mkdir(parents=True, exist_ok=True)
SOURCES = {
 'white-fedora': ('Sep 14, 2026, 11_43_02 PM', [0,180,375,565,760]),
 'cream-cable-knit': ('Sep 14, 2026, 11_46_32 PM', [0,210,400,595,800]),
 'charcoal-turtleneck': ('Sep 15, 2026, 12_36_31 AM', [0,185,365,550,745]),
}
base = Image.open(ROOT/'assets/speaking-system/mascots/v4/eddy-standing.png').convert('RGBA')
# Torso centers exclude the tail; directions have deliberately distinct anchors.
centers = [125,110,127,150,140,140,140,129,127,114,115,119,119,119,122,124]
head_centers = [125,108,131,150,151,145,141,129,127,113,114,111,111,111,115,123]
# The supplied cream back-left frames include front views: use the corresponding
# true rear/right profiles mirrored, instead of drawing a neckline on Eddy's back.
cream_sources = [0,1,2,3,4,5,6,7,7,6,5,4,4,13,14,15]
for item,(stamp,rows) in SOURCES.items():
 source = Image.open(Path.home()/f'Downloads/ChatGPT Image {stamp}.png').convert('RGBA')
 pieces=[]
 for i in range(16):
  crop=source.crop((i%4*237,rows[i//4],(i%4+1)*237,rows[i//4+1]))
  a=np.array(crop); m=a[:,:,3]>40; visited=np.zeros(m.shape,bool); best=[]
  for y,x in zip(*np.where(m)):
   if visited[y,x]: continue
   todo=[(x,y)];visited[y,x]=True;part=[]
   while todo:
    x1,y1=todo.pop();part.append((x1,y1))
    for xx,yy in ((x1-1,y1),(x1+1,y1),(x1,y1-1),(x1,y1+1)):
     if 0<=xx<m.shape[1] and 0<=yy<m.shape[0] and m[yy,xx] and not visited[yy,xx]:visited[yy,xx]=True;todo.append((xx,yy))
   if len(part)>len(best):best=part
  keep=np.zeros(m.shape,np.uint8)
  for x,y in best:keep[y,x]=255
  keep=np.array(Image.fromarray(keep).filter(ImageFilter.MaxFilter(3)))
  a[:,:,3]=np.minimum(a[:,:,3],keep)
  clean=Image.fromarray(a);pieces.append(clean.crop(clean.getbbox()))
 atlas=Image.new('RGBA',(1024,1024)); mask=Image.new('RGBA',(1024,1024));preview=base.copy()
 for i in range(16):
  ox,oy=i%4*256,i//4*256
  p=pieces[cream_sources[i] if item=='cream-cable-knit' else i]
  if item=='cream-cable-knit' and i in [8,9,10,11,12]:p=p.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
  if item=='white-fedora':
   w,h=130,67; x,y=head_centers[i]-w//2,9
   # Remove the original crown/hair and ears, replaced by the hat artwork.
   mask.paste((255,255,255,255),(ox,oy,ox+256,oy+56))
  else:
   w=[114,105,108,94,82,92,99,110,112,99,92,82,82,103,106,113][i]
   w=round(w*1.08)
   h=89 if item=='charcoal-turtleneck' else 88
   x,y=centers[i]-w//2,110 if item=='charcoal-turtleneck' else 111
  atlas.alpha_composite(p.resize((w,h),Image.Resampling.LANCZOS),(ox+x,oy+y))
 atlas.save(OUT/f'{item}.webp',lossless=True)
 if item=='white-fedora':mask.save(OUT/'hat-hide.webp',lossless=True)
 # A small inventory image uses the same artwork as the actual equipped item.
 pieces[0].thumbnail((160,140));pieces[0].save(OUT/f'{item}-icon.webp',lossless=True)

# Preserve Eddy's face, mane, tail, and exposed hooves above the clothing.
a=np.array(base); alpha=a[:,:,3].copy(); yy=np.indices(alpha.shape)[0]%256
dark=np.max(a[:,:,:3],axis=2)<88
a[:,:,3]=np.where((yy<126)|((yy>=126)&dark),alpha,0)
Image.fromarray(a).save(OUT/'body-front.webp',lossless=True)
print('Prepared three aligned overlays, two occlusion layers, and inventory icons.')
