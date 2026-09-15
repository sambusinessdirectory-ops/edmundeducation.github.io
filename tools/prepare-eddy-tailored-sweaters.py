"""Extract only fitted garment pixels from character-registered tailoring references.

Called by prepare-eddy-cosmetics.py; may also run independently. The candidate
backgrounds and generated faces/bodies never enter the runtime sprite atlas.
"""
from pathlib import Path
from PIL import Image,ImageFilter
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/speaking-system/cosmetics/eddy'
for item,source in [('cream-cable-knit','cream'),('charcoal-turtleneck','charcoal')]:
 image=Image.open(ROOT/'tools/mascot-art/wardrobe'/f'{source}-tailoring-candidate.png').convert('RGB').resize((1024,1024),Image.Resampling.LANCZOS)
 a=np.array(image).astype(float);r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
 y=np.indices(r.shape)[0]%256
 if source=='cream':mask=(r>135)&(b>80)&(r-g>5)&(g-b>6)&(y>96)&(y<204)
 else:mask=(b>43)&(r<150)&(np.max(a,axis=2)-np.min(a,axis=2)<20)&(y>96)&(y<204)
 # Close pinholes inside the knitted fabric; do not fill gaps around arms/tails.
 alpha=Image.fromarray(mask.astype('uint8')*255).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
 arr=np.dstack([a.astype('uint8'),np.array(alpha)])
 # Padding only extends garment colours into transparent pixels for filtering.
 known=np.array(alpha)>0;rgb=arr[:,:,:3].copy()
 for _ in range(3):
  nxt=known.copy();col=rgb.copy()
  for dy,dx in [(0,1),(0,-1),(1,0),(-1,0)]:
   neighbor=np.roll(known,(dy,dx),(0,1))
   take=(~nxt)&neighbor
   col[take]=np.roll(rgb,(dy,dx),(0,1))[take];nxt[take]=True
  known=nxt;rgb=col
 arr[:,:,:3]=rgb
 Image.fromarray(arr).save(OUT/f'{item}.webp',lossless=True)
print('Built two fitted transparent garment atlases from registered references.')

