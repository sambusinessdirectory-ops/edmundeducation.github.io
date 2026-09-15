"""Build Eddy's independent blue swordsman jacket overlay from registered art."""
from pathlib import Path
from PIL import Image,ImageFilter
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'tools/mascot-art/wardrobe/blue-swordsman-jacket/fitting-reference.png'
OUT=ROOT/'assets/speaking-system/cosmetics/eddy'
source=np.array(Image.open(SOURCE).convert('RGB').resize((1024,1024),Image.Resampling.LANCZOS))
atlas=np.zeros((1024,1024,4),dtype=np.uint8)
counts=[]
for i in range(16):
 ox,oy=i%4*256,i//4*256
 rgb=source[oy:oy+256,ox:ox+256].copy()
 a=rgb.astype(int);r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
 yy=np.indices(r.shape)[0]
 blue=(b>r+14)&(b>g+7)&(g>15)&(yy>95)&(yy<205)
 near=np.array(Image.fromarray(blue.astype('uint8')*255).filter(ImageFilter.MaxFilter(15)))>0
 cuffs=np.array(Image.fromarray(blue.astype('uint8')*255).filter(ImageFilter.MaxFilter(31)))>0
 neutral=(a.max(axis=2)-a.min(axis=2)<35)
 silver=near&neutral&(a.min(axis=2)>65)
 bracer=cuffs&neutral&(a.min(axis=2)>27)&(a.max(axis=2)<115)&(yy>145)&(yy<184)
 mask=(blue|silver|bracer)&(yy>95)&(yy<205)
 mask=np.array(Image.fromarray(mask.astype('uint8')*255).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3)))>0
 # Closing may bridge chroma-key gaps; never restore the key background.
 mask &= ~((r>g*1.5)&(b>g*1.5))
 # Retain only the jacket-connected components; discard detached pixels.
 seen=np.zeros(mask.shape,bool);parts=[]
 for y,x in zip(*np.where(mask)):
  if seen[y,x]:continue
  todo=[(y,x)];seen[y,x]=True;part=[]
  while todo:
   cy,cx=todo.pop();part.append((cy,cx))
   for dy,dx in [(0,1),(0,-1),(1,0),(-1,0),(1,1),(1,-1),(-1,1),(-1,-1)]:
    ny,nx=cy+dy,cx+dx
    if 0<=ny<256 and 0<=nx<256 and mask[ny,nx] and not seen[ny,nx]:seen[ny,nx]=True;todo.append((ny,nx))
  if len(part)>=25:parts.append(part)
 keep=np.zeros(mask.shape,bool)
 for part in parts:
  if any(blue[y,x] for y,x in part):
   for y,x in part:keep[y,x]=True
 alpha=keep.astype('uint8')*255
 # Pad RGB without wrapping to another cell; keep alpha unchanged.
 known=keep.copy()
 for _ in range(3):
  nxt=known.copy();col=rgb.copy()
  for dy,dx in [(0,1),(0,-1),(1,0),(-1,0)]:
   near=np.roll(known,(dy,dx),(0,1))
   if dy==1:near[0]=False
   if dy==-1:near[-1]=False
   if dx==1:near[:,0]=False
   if dx==-1:near[:,-1]=False
   take=(~nxt)&near;col[take]=np.roll(rgb,(dy,dx),(0,1))[take];nxt[take]=True
  known=nxt;rgb=col
 atlas[oy:oy+256,ox:ox+256]=np.dstack([rgb,alpha])
 counts.append(int(keep.sum()))
 assert 1800<keep.sum()<16000,(i,keep.sum())
OUT.mkdir(parents=True,exist_ok=True)
Image.fromarray(atlas).save(OUT/'blue-swordsman-jacket.webp',lossless=True)
icon=Image.fromarray(atlas[:256,:256]);icon=icon.crop(icon.getbbox());icon.thumbnail((160,140))
icon.save(OUT/'blue-swordsman-jacket-icon.webp',lossless=True)
print('Registered jacket pixels per view:',counts)

