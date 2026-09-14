"""Prepare approved companion sculptures; user authorized background removal."""
from pathlib import Path
from collections import deque
from PIL import Image
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/sentence-structure/rewards'
for name in ('phoebe','elsie'):
    im=Image.open(ROOT/f'output/imagegen/{name}-trophy-design-v1.png').convert('RGB')
    rgb=np.array(im); h,w=rgb.shape[:2]; flat=rgb.reshape(-1,3).astype(np.int16)
    neutral=(flat[:,0]-flat[:,2]<42)&(flat[:,0]-flat[:,1]<38)
    seen=np.zeros(h*w,dtype=bool); remove=np.zeros(h*w,dtype=bool)
    for seed in np.flatnonzero(neutral):
        if seen[seed]:continue
        q=deque([int(seed)]);seen[seed]=True; component=[];edge=False
        while q:
            p=q.popleft();component.append(p);x=p%w
            if x==0 or x==w-1 or p<w or p>=w*(h-1):edge=True
            for n in ((p-1 if x else -1),(p+1 if x<w-1 else -1),p-w,p+w):
                if 0<=n<h*w and neutral[n] and not seen[n]:seen[n]=True;q.append(n)
        if edge or (len(component)>70 and flat[component].mean()<232):remove[component]=True
    alpha=np.where(remove.reshape(h,w),0,255).astype(np.uint8)
    rgba=Image.fromarray(np.dstack((rgb,alpha)),'RGBA')
    crop=rgba.crop(rgba.getbbox())
    crop=crop.resize((round(crop.width*631/crop.height),631),Image.Resampling.LANCZOS)
    canvas=Image.new('RGBA',(768,768));canvas.alpha_composite(crop,((768-crop.width)//2,51))
    arr=np.array(canvas); luminance=np.dot(arr[:,:,:3],[.2126,.7152,.0722])
    for tier in ('golden','silver','bronze'):
        out=arr.copy()
        if tier=='silver':
            l=255*(luminance/255)**.78
            out[:,:,:3]=np.clip(np.stack((l*.96,l*.985,np.minimum(255,l*1.035)),axis=-1),0,255).astype(np.uint8)
        elif tier=='bronze':
            levels=[0,35,80,125,175,220,255]
            colors=np.array([[25,13,8],[77,36,16],[126,65,28],[174,104,47],[218,153,83],[244,200,139],[255,244,219]])
            out[:,:,:3]=np.stack([np.interp(luminance,levels,colors[:,i]) for i in range(3)],axis=-1).astype(np.uint8)
        asset=Image.fromarray(out,'RGBA')
        asset.save(OUT/f'{tier}-{name}-map-v1.webp',lossless=True)
        print(name,tier,asset.getbbox(),int((out[:,:,3]==0).sum()))
# Inspection sheet on a dark green surface: transparency cannot hide on a checkerboard.
sheet=Image.new('RGB',(900,600),'#234b3f')
for row,name in enumerate(('phoebe','elsie')):
    for col,tier in enumerate(('golden','silver','bronze')):
        im=Image.open(OUT/f'{tier}-{name}-map-v1.webp').resize((300,300),Image.Resampling.LANCZOS)
        sheet.paste(im,(col*300,row*300),im)
sheet.save('/tmp/companion-metals-preview.jpg',quality=90)
