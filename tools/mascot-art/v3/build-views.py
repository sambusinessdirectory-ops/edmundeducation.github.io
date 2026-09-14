"""Measure normalized v3 atlases and update the shared mascot manifest."""
import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[3]
ASSETS=ROOT/'assets/speaking-system/mascots/v3'
MANIFEST=ROOT/'speaking-mascot-views.mjs'
ANGLES=[0,30,60,75,90,115,145,160,180,210,235,250,270,300,330,350]
GRID,FLOW_SIZE=4,128

def component_bounds(mask):
    height,width=mask.shape;seen=np.zeros_like(mask,dtype=bool);result=[]
    for sy,sx in zip(*np.nonzero(mask&~seen)):
        if seen[sy,sx]:continue
        stack,points=[(int(sy),int(sx))],[];seen[sy,sx]=True
        while stack:
            y,x=stack.pop();points.append((y,x))
            for ny,nx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
                if 0<=ny<height and 0<=nx<width and mask[ny,nx] and not seen[ny,nx]:seen[ny,nx]=True;stack.append((ny,nx))
        if len(points)>8:
            ys,xs=zip(*points);result.append((min(xs),min(ys),max(xs)+1,max(ys)+1,len(points)))
    return result

def measure_cell(image,cell):
    rgba=np.asarray(image);width,height=image.size;size=width//GRID
    column,row=cell%GRID,cell//GRID;x0,y0=column*size,row*size
    pixels=rgba[y0:y0+size,x0:x0+size];rgb=pixels[:,:,:3].astype(float);r,g,b=rgb.transpose(2,0,1);yy,xx=np.mgrid[:size,:size];alpha=pixels[:,:,3]>180
    ys,xs=np.nonzero(alpha)
    if not len(xs):raise ValueError(f'empty cell {cell}')
    top,bottom=int(ys.min()),int(ys.max())+1;left,right=int(xs.min()),int(xs.max())+1;h=bottom-top;w=right-left
    coat=(r>65)&(r<225)&(r>g*1.28)&(g>b*1.25)&alpha&(yy>top+h*.46)&(yy<top+h*.80)
    coat_sample=np.median(rgb[coat],axis=0) if coat.sum()>30 else np.array([170,90,45])
    muzzle=(r>38)&(r<165)&(g>r*.42)&(g<r*.92)&(b>r*.22)&(b<r*.78)&alpha&(yy>top+h*.15)&(yy<top+h*.55)
    candidates=[part for part in component_bounds(muzzle) if part[2]-part[0]>w*.07]
    if candidates:
        mx0,my0,mx1,my1,_=max(candidates,key=lambda part:part[4]);mouth=[(mx0+mx1)*.5/size,1-(my0+(my1-my0)*.80)/size,(mx1-mx0)/size*.4]
    else:mouth=[.5,.64,0]
    return {'rect':[column/GRID,1-(row+1)/GRID,1/GRID,1/GRID],'layout':[0,0,1,1],'mouth':mouth,'sourceCell':cell,'coatSample':coat_sample.tolist()}

def standing(name):
    path=ASSETS/f'{name}-standing.png';image=Image.open(path)
    if image.mode!='RGBA' or image.size!=(1024,1024):raise ValueError(f'{path} must be 1024-square RGBA')
    views=[]
    for cell,angle in enumerate(ANGLES):
        view=measure_cell(image,cell);view['angle']=angle
        if 97<angle<263:view['mouth'][2]=0
        views.append(view)
    coat=np.median([view.pop('coatSample') for view in views],axis=0);source_coat='#'+''.join(f'{int(value):02x}' for value in coat)
    flow=np.full((GRID*FLOW_SIZE,GRID*FLOW_SIZE,4),128,np.uint8);(ASSETS/f'{name}-standing.flow').write_bytes(flow.tobytes())
    return {'sourceCoat':source_coat,'folder':'v3','image':f'{name}-standing.png','blinkImage':('elsie-blink-v2.png' if name=='elsie' else f'{name}-blink.png'),'flow':f'{name}-standing.flow','flowSize':FLOW_SIZE,'flowGrid':[GRID,GRID],'flowRange':0,'views':views}

prefix='// Measured crop, mouth and view data. Source PNGs are unchanged.\nexport const MASCOT_VIEWS = '
text=MANIFEST.read_text();data=json.loads(text.removeprefix(prefix).removesuffix(';\n').removesuffix(';'))
for name in ('eddy','elsie','phoebe'):data[name]['standing']=standing(name)
MANIFEST.write_text(prefix+json.dumps(data,separators=(',',':'))+';\n')
