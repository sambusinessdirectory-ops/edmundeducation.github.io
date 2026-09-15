"""Remove white matte RGB from sprite boundaries without eroding their alpha.

WebGL filters straight-alpha texture colors in linear light, making the source
matte much more visible than in the small 2D map sprites. Color padding is done
once at asset build time, never during walking.
"""
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
def clean_edges(image):
 a=np.array(image.convert('RGBA'));alpha=a[:,:,3].copy()
 # Remove isolated matte dots, while retaining substantial detached artwork.
 active=alpha>24; visited=np.zeros(active.shape,bool)
 for y,x in zip(*np.where(active)):
  if visited[y,x]:continue
  pending=[(y,x)];visited[y,x]=True;component=[]
  while pending:
   cy,cx=pending.pop();component.append((cy,cx))
   for dy,dx in [(0,1),(0,-1),(1,0),(-1,0),(1,1),(1,-1),(-1,1),(-1,-1)]:
    ny,nx=cy+dy,cx+dx
    if 0<=ny<active.shape[0] and 0<=nx<active.shape[1] and active[ny,nx] and not visited[ny,nx]:
     visited[ny,nx]=True;pending.append((ny,nx))
  if len(component)<20:
   for cy,cx in component:alpha[cy,cx]=0
 known=np.array(Image.fromarray(alpha).filter(ImageFilter.MinFilter(5)))>250
 rgb=a[:,:,:3].copy()
 for _ in range(8):
  next_known=known.copy();next_rgb=rgb.copy()
  for dy,dx in [(0,1),(0,-1),(1,0),(-1,0)]:
   neighbor=np.roll(known,(dy,dx),(0,1))
   if dy==1:neighbor[0]=False
   if dy==-1:neighbor[-1]=False
   if dx==1:neighbor[:,0]=False
   if dx==-1:neighbor[:,-1]=False
   take=(~next_known)&neighbor
   next_rgb[take]=np.roll(rgb,(dy,dx),(0,1))[take];next_known[take]=True
  rgb=next_rgb;known=next_known
 # Never brighten existing dark detail (especially the fedora rim/cuffs).
 a[:,:,:3]=np.where(alpha[:,:,None]>0,np.minimum(a[:,:,:3],rgb),rgb)
 # Detached faint matte flecks have no opaque interior to belong to.
 a[:,:,3]=np.where((~known)&(alpha<150),0,alpha)
 return Image.fromarray(a)

for character in ['eddy','elsie','phoebe']:
 for pose in ['standing','blink']:
  p=ROOT/f'assets/speaking-system/mascots/v4/{character}-{pose}.png'
  clean_edges(Image.open(p)).save(p.with_name(p.stem+'-clean.webp'),lossless=True)
for name in ['white-fedora','cream-cable-knit','charcoal-turtleneck']:
 p=ROOT/f'assets/speaking-system/cosmetics/eddy/{name}.webp'
 clean_edges(Image.open(p)).save(p,lossless=True)
print('Cleaned six 3D base/blink atlases and three cosmetic overlays.')
