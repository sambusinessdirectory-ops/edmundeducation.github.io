"""Measure artwork and produce correspondence data for runtime view interpolation.

This does not retouch or recolour the generated source PNGs. Normalised images
exist only in memory for analysis; the published data files contain vector fields.
"""
import json, math
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
ASSETS = ROOT / 'assets/speaking-system/mascots/v2'
SIZE, GRID, FLOW_SIZE, FLOW_RANGE = 256, 4, 128, .32

def components(mask):
    count, labels, stats, centers = cv2.connectedComponentsWithStats(mask.astype(np.uint8))
    return [(stats[i], centers[i]) for i in range(1, count) if stats[i, 4] > 8]

def measure(im, cell):
    width, height = im.size
    image = np.asarray(im)
    all_parts = sorted(components(image[:,:,3] > 120), key=lambda item:item[0][4], reverse=True)[:16]
    assert len(all_parts)==16, 'Expected sixteen separate character silhouettes'
    all_parts.sort(key=lambda item:item[1][1])
    ordered=[]
    for row in range(4): ordered.extend(sorted(all_parts[row*4:(row+1)*4],key=lambda item:item[1][0]))
    stat,_=ordered[cell]
    x0,y0,w,h,_=map(int,stat)
    x0,y0=max(0,x0-2),max(0,y0-2)
    w,h=min(width-x0,w+4),min(height-y0,h+4)
    x,y=0,0
    pixels=image[y0:y0+h,x0:x0+w]
    rgb = pixels[:, :, :3].astype(float)
    r, g, b = rgb.transpose(2, 0, 1)
    yy, xx = np.mgrid[:h, :w]
    coat = (r > 70) & (r < 222) & (r > g*1.32) & (g > b*1.35) & (pixels[:,:,3] > 180) & (yy > h*.48) & (yy < h*.78)
    center = float(np.median(xx[coat])) if np.count_nonzero(coat) > 30 else w/2
    scale = SIZE*.86/h
    dw, dh = w*scale, h*scale
    left, top = SIZE*.5-center*scale, SIZE*.94-dh
    matrix = np.float32([[scale,0,left],[0,scale,top]])
    normal = cv2.warpAffine(pixels, matrix, (SIZE,SIZE), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
    # Locate the dark, relatively desaturated muzzle within the head area.
    muzzle = (r > 48) & (r < 152) & (g > r*.5) & (b > r*.32) & (g < r*.86) & (pixels[:,:,3] > 180) & (yy > h*.18) & (yy < h*.53)
    candidates = [(s,c) for s,c in components(muzzle) if s[2] > w*.08 and s[3] > h*.025 and s[4] > 22]
    if candidates:
        stat, _ = max(candidates, key=lambda p:p[0][4])
        mx,my,mw,mh,_ = stat
        mouth = [(left+(mx+mw*.50)*scale)/SIZE, 1-(top+(my+mh*.80)*scale)/SIZE, mw*scale/SIZE*.40]
    else:
        mouth = [.5,.64,0]
    return {
        'rect': [(x0+x)/width, 1-(y0+y+h)/height, w/width, h/height],
        'layout': [left/SIZE, (SIZE-top-dh)/SIZE, dw/SIZE, dh/SIZE],
        'mouth': mouth,
        'sourceCell': cell,
        'coatSample': np.median(rgb[coat],axis=0).tolist() if np.count_nonzero(coat)>30 else [180,100,40],
    }, normal

def analyse(name, pose, entries):
    path = ASSETS / f'{name}-{pose}.png'
    im = Image.open(path)
    assert im.mode == 'RGBA', f'{path} needs real alpha'
    alpha = np.asarray(im.getchannel('A'))
    assert np.mean(alpha < 5) > .25, f'{path} has an opaque background'
    views, frames = [], []
    for angle, cell in sorted(entries):
        view, frame = measure(im, cell)
        view['angle'] = angle
        if 97 < angle < 263: view['mouth'][2] = 0
        views.append(view); frames.append(frame)
    count = len(frames); rows = math.ceil(count / GRID)
    flow_atlas = np.zeros((rows*FLOW_SIZE, GRID*FLOW_SIZE, 4), np.uint8)
    def grey(frame):
        # Neutral analysis background makes silhouette motion part of the flow.
        alpha = frame[:,:,3:4].astype(np.float32)/255
        rgb = frame[:,:,:3]*alpha+220*(1-alpha)
        return cv2.cvtColor(cv2.resize(rgb.astype(np.uint8),(FLOW_SIZE,FLOW_SIZE)),cv2.COLOR_RGB2GRAY)
    greys = list(map(grey, frames))
    for i in range(count):
        a,b=greys[i],greys[(i+1)%count]
        solver=cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
        forward=solver.calc(a,b,None)/FLOW_SIZE
        solver=cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
        backward=solver.calc(b,a,None)/FLOW_SIZE
        forward=cv2.GaussianBlur(forward,(0,0),2.5)
        backward=cv2.GaussianBlur(backward,(0,0),2.5)
        forward[:,:,1]*=-1;backward[:,:,1]*=-1
        packed=np.rint(np.clip(np.concatenate([forward,backward],axis=2)/FLOW_RANGE*.5+.5,0,1)*255).astype(np.uint8)
        x,y=(i%GRID)*FLOW_SIZE,(i//GRID)*FLOW_SIZE
        flow_atlas[y:y+FLOW_SIZE,x:x+FLOW_SIZE]=packed
    (ASSETS/f'{name}-{pose}.flow').write_bytes(flow_atlas.tobytes())
    coat=np.median([view.pop('coatSample') for view in views],axis=0)
    source_coat='#'+''.join(f'{int(c):02x}' for c in coat)
    return {'sourceCoat':source_coat,'image':path.name,'flow':f'{name}-{pose}.flow','flowSize':FLOW_SIZE,'flowGrid':[GRID,rows],'flowRange':FLOW_RANGE,'views':views}

spec=json.loads((Path(__file__).parent/'view-order.json').read_text())
result={}
for name,poses in spec.items():
    result[name]={}
    for pose,entries in poses.items():
        result[name][pose]=analyse(name,pose,entries)
        print(name,pose,len(entries),'views',flush=True)
(ROOT/'speaking-mascot-views.mjs').write_text('// Measured crop, mouth and view data. Source PNGs are unchanged.\nexport const MASCOT_VIEWS = '+json.dumps(result,separators=(',',':'))+';\n')
