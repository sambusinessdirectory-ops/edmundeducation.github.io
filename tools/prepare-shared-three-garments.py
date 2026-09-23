"""Extract four independently fitted Eddy/Noir tops from registered references.

The fitting images are source artwork. Runtime composites keep each canonical base.
Run from the repository root with Pillow and NumPy.
"""
from pathlib import Path
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'tools/mascot-art/wardrobe/shared-three-garments'
ITEMS=('brown-leather-bomber','sunburst-hoodie','black-blazer-hoodie','olive-plain-tee')
CHARACTERS=('eddy','noir')
SIZE=1024
CELL=256

def largest_components(mask):
    """Keep garment-sized connected regions, rejecting pose/background flecks."""
    h,w=mask.shape
    seen=np.zeros((h,w),dtype=bool)
    kept=np.zeros((h,w),dtype=np.uint8)
    for yy in range(h):
        for xx in range(w):
            if not mask[yy,xx] or seen[yy,xx]: continue
            q=deque([(yy,xx)]);seen[yy,xx]=True;points=[]
            while q:
                y,x=q.popleft();points.append((y,x))
                for y2,x2 in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
                    if 0<=y2<h and 0<=x2<w and mask[y2,x2] and not seen[y2,x2]:
                        seen[y2,x2]=True;q.append((y2,x2))
            if len(points)>=70:
                for y,x in points:kept[y,x]=255
    return kept

def make_cell(src,base,char,item):
    s=src.astype(np.int16);b=base[:,:,:3].astype(np.int16)
    y=np.arange(CELL)[:,None]
    # The garment is confined to torso, upper arms, and the hood immediately
    # below the head. This excludes feet and the majority of face/mane/tail.
    band=(y>=108)&(y<197)
    delta=np.abs(s-b).sum(axis=2)
    foreground=(s.mean(axis=2)<185)&(base[:,:,3]>32)
    if item=='brown-leather-bomber':
        if char=='eddy':
            color=(s[:,:,2]-b[:,:,2]>6)&(s[:,:,0]-s[:,:,1]>13)&(s[:,:,0]-s[:,:,1]<95)
        else:
            color=(s[:,:,0]-s[:,:,1]>22)&(s[:,:,1]-s[:,:,2]>8)
        seed=band&foreground&color&(delta>24)
    elif item in ('sunburst-hoodie','black-blazer-hoodie'):
        neutral=np.abs(s[:,:,0]-s[:,:,1])<20
        dark=(s.mean(axis=2)<115)&neutral
        # The ivory back print is item art, despite its bright color.
        print_color=(item=='sunburst-hoodie')&(s.mean(axis=2)>155)&(s.mean(axis=2)<250)&(s[:,:,0]-s[:,:,1]>6)&(s[:,:,1]-s[:,:,2]>6)&(delta>55)
        seed=band&foreground&(dark|print_color)&(delta>23)
    else:
        olive=(s[:,:,1]-s[:,:,2]>14)&(s[:,:,0]-s[:,:,2]>18)&(s.mean(axis=2)<175)
        seed=band&foreground&olive&(delta>22)
    # Close small pixel holes in fabric and keep colored hardware/details that
    # sit directly inside the garment silhouette. Operations stay per cell.
    m=Image.fromarray(seed.astype(np.uint8)*255,'L')
    m=m.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    filled=np.asarray(m)>0
    filled=filled&band&foreground
    # Extend the garment across small areas outside the original body alpha
    # (for example Noir's lower kangaroo pocket), but only next to the fitted
    # clothing. This cannot reach independent tail/head fragments.
    near=np.asarray(Image.fromarray(filled.astype(np.uint8)*255,'L').filter(ImageFilter.MaxFilter(15)))>0
    if item=='brown-leather-bomber':
        fabric=(s[:,:,0]-s[:,:,1]>20)&(s.mean(axis=2)<165)
    elif item in ('sunburst-hoodie','black-blazer-hoodie'):
        fabric=((np.abs(s[:,:,0]-s[:,:,1])<20)&(s.mean(axis=2)<120)) | ((item=='sunburst-hoodie')&(s.mean(axis=2)>155)&(s.mean(axis=2)<250)&(s[:,:,0]-s[:,:,1]>6)&(s[:,:,1]-s[:,:,2]>6))
    else:
        fabric=(s[:,:,1]-s[:,:,2]>14)&(s[:,:,0]-s[:,:,2]>18)&(s.mean(axis=2)<175)
    filled |= near&fabric&(y>=125)&(y<194)&(s.mean(axis=2)<250)
    main=largest_components(filled)
    # The sunburst's dark center and garment trim can be enclosed holes after
    # color/difference selection. Fill only bounded holes inside clothing.
    inverse=~(main>0)
    outside=np.zeros((CELL,CELL),dtype=bool)
    q=deque()
    for x in range(CELL):
        for yy in (0,CELL-1):
            if inverse[yy,x] and not outside[yy,x]:outside[yy,x]=True;q.append((yy,x))
    for yy in range(CELL):
        for x in (0,CELL-1):
            if inverse[yy,x] and not outside[yy,x]:outside[yy,x]=True;q.append((yy,x))
    while q:
        yy,xx=q.popleft()
        for y2,x2 in ((yy-1,xx),(yy+1,xx),(yy,xx-1),(yy,xx+1)):
            if 0<=y2<CELL and 0<=x2<CELL and inverse[y2,x2] and not outside[y2,x2]:
                outside[y2,x2]=True;q.append((y2,x2))
    holes=inverse&~outside
    main[holes]=255
    # A slight antialias at the garment contour, then RGB padding outside alpha
    # so texture filtering does not sample the gray fitting background.
    alpha=np.asarray(Image.fromarray(main,'L').filter(ImageFilter.GaussianBlur(.45))).astype(np.uint8)
    alpha=np.where(alpha>20,alpha,0).astype(np.uint8)
    rgba=np.zeros((CELL,CELL,4),dtype=np.uint8)
    rgba[:,:,:3]=src
    rgba[:,:,3]=alpha
    # Use actual opaque garment colors at the antialiased edge and outside
    # alpha. Never max-filter RGB: that would pull gray matte into dark cloth.
    rgb=np.zeros((CELL,CELL,3),dtype=np.uint8)
    known=alpha>220
    rgb[known]=src[known]
    for _ in range(5):
        total=np.zeros((CELL,CELL,3),dtype=np.float32)
        weight=np.zeros((CELL,CELL),dtype=np.float32)
        for dy,dx in ((-1,0),(1,0),(0,-1),(0,1),(-1,-1),(-1,1),(1,-1),(1,1)):
            sy0=max(0,-dy);sy1=min(CELL,CELL-dy);sx0=max(0,-dx);sx1=min(CELL,CELL-dx)
            ty0=sy0+dy;ty1=sy1+dy;tx0=sx0+dx;tx1=sx1+dx
            k=known[sy0:sy1,sx0:sx1]
            total[ty0:ty1,tx0:tx1]+=rgb[sy0:sy1,sx0:sx1]*k[:,:,None]
            weight[ty0:ty1,tx0:tx1]+=k
        new=(~known)&(weight>0)
        rgb[new]=np.clip(total[new]/weight[new,None],0,255).astype(np.uint8)
        known|=new
    rgba[:,:,:3]=rgb
    return rgba,int((alpha>0).sum())

for char in CHARACTERS:
    base=np.asarray(Image.open(ROOT/f'assets/speaking-system/mascots/v4/{char}-standing.png').convert('RGBA'))
    assert base.shape==(SIZE,SIZE,4)
    out_dir=ROOT/f'assets/speaking-system/cosmetics/{char}'
    for item in ITEMS:
        fit=Image.open(SOURCE/f'{char}-{item}-fit.png').convert('RGB').resize((SIZE,SIZE),Image.Resampling.LANCZOS)
        src=np.asarray(fit)
        out=np.zeros((SIZE,SIZE,4),dtype=np.uint8);counts=[]
        for index in range(16):
            row,col=divmod(index,4);ys=slice(row*CELL,(row+1)*CELL);xs=slice(col*CELL,(col+1)*CELL)
            cell,count=make_cell(src[ys,xs],base[ys,xs],char,item)
            out[ys,xs]=cell;counts.append(count)
        assert min(counts)>100,(char,item,counts)
        target=out_dir/f'{item}.webp'
        Image.fromarray(out,'RGBA').save(target,format='WEBP',lossless=True,method=6)
        check=Image.open(target).convert('RGBA')
        assert check.size==(SIZE,SIZE) and np.array(check.getchannel('A')).max()>0
        print(char,item,'pixels per view',counts)
