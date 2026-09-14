"""Build matched 4x4 open-eye and blink atlases from a supplied 4x8 RGB sheet.

The source sheets are not true grids: some silhouettes cross nominal row lines.
This script therefore removes only boundary-connected checkerboard pixels,
detects all 32 complete silhouettes, and normalizes each into a matched cell.
"""
from collections import deque
from pathlib import Path
import sys

import numpy as np
from PIL import Image

GRID, CELL = 4, 256

def boundary_background(rgb):
    low, high = rgb.min(axis=2), rgb.max(axis=2)
    candidate = (low >= 205) & ((high - low) <= 18)
    height, width = candidate.shape
    seen = np.zeros((height, width), dtype=bool)
    queue = deque()
    for x in range(width):
        if candidate[0, x]: queue.append((0, x))
        if candidate[-1, x]: queue.append((height - 1, x))
    for y in range(height):
        if candidate[y, 0]: queue.append((y, 0))
        if candidate[y, -1]: queue.append((y, width - 1))
    while queue:
        y, x = queue.popleft()
        if seen[y, x] or not candidate[y, x]: continue
        seen[y, x] = True
        if y: queue.append((y - 1, x))
        if y + 1 < height: queue.append((y + 1, x))
        if x: queue.append((y, x - 1))
        if x + 1 < width: queue.append((y, x + 1))
    return seen

def component_bounds(mask):
    height, width = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    result = []
    for sy, sx in zip(*np.nonzero(mask & ~seen)):
        if seen[sy, sx]: continue
        stack, points = [(int(sy), int(sx))], []
        seen[sy, sx] = True
        while stack:
            y, x = stack.pop(); points.append((y, x))
            for ny, nx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
                if 0 <= ny < height and 0 <= nx < width and mask[ny,nx] and not seen[ny,nx]:
                    seen[ny,nx] = True; stack.append((ny,nx))
        if len(points) > 64:
            ys, xs = zip(*points)
            result.append((min(xs), min(ys), max(xs)+1, max(ys)+1, len(points)))
    return result

def ordered_characters(rgba):
    parts = sorted(component_bounds(rgba[:,:,3] > 120), key=lambda item:item[4], reverse=True)[:32]
    if len(parts) != 32: raise ValueError(f'expected 32 complete silhouettes, found {len(parts)}')
    parts.sort(key=lambda item:(item[1]+item[3])/2)
    ordered=[]
    for row in range(8):
        ordered.extend(sorted(parts[row*4:(row+1)*4],key=lambda item:(item[0]+item[2])/2))
    return ordered

def normalized_sprite(image, bounds):
    x0,y0,x1,y1,_=bounds
    x0,y0=max(0,x0-2),max(0,y0-2)
    x1,y1=min(image.width,x1+2),min(image.height,y1+2)
    crop=image.crop((x0,y0,x1,y1))
    scale=CELL*.86/crop.height
    resized=crop.resize((max(1,round(crop.width*scale)),round(crop.height*scale)),Image.Resampling.LANCZOS)
    cell=Image.new('RGBA',(CELL,CELL))
    cell.alpha_composite(resized,(round((CELL-resized.width)/2),round(CELL*.94-resized.height)))
    return cell

def extract(source, output_dir, name):
    rgb=np.asarray(Image.open(source).convert('RGB'))
    rgba=np.dstack((rgb,np.where(boundary_background(rgb),0,255).astype(np.uint8)))
    cleaned=Image.fromarray(rgba,'RGBA')
    characters=ordered_characters(rgba)
    atlases={key:Image.new('RGBA',(CELL*GRID,CELL*GRID)) for key in ('standing','blink')}
    for index in range(16):
        x,y=(index%GRID)*CELL,(index//GRID)*CELL
        atlases['standing'].alpha_composite(normalized_sprite(cleaned,characters[index]),(x,y))
        atlases['blink'].alpha_composite(normalized_sprite(cleaned,characters[index+16]),(x,y))
    output_dir.mkdir(parents=True,exist_ok=True)
    for kind,atlas in atlases.items(): atlas.save(output_dir/f'{name}-{kind}.png',optimize=True)

if __name__=='__main__':
    if len(sys.argv)!=4: raise SystemExit('usage: extract-blink-sheets.py SOURCE OUTPUT_DIR NAME')
    extract(Path(sys.argv[1]),Path(sys.argv[2]),sys.argv[3].lower())
