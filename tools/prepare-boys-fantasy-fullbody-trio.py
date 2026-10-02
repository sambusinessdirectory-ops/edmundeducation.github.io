"""Fit six garment-only full-body overlays to the canonical Eddy/Noir atlases.

The item-only ImageGen references provide silhouette masks; original fitted
character sheets provide costume pixels. Canonical mascots remain the runtime
body/face/hoof source. Nothing from the generated face, mane or tail is copied.
"""
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'tools/mascot-art/wardrobe/boys-fantasy-fullbody-trio'
ASSETS = ROOT / 'assets/speaking-system/cosmetics'
BASE = ROOT / 'assets/speaking-system/mascots/v4'
ITEMS = {
    'red': 'crimson-gilded-court-coat',
    'black': 'shadow-thorn-robe',
    'ivory': 'ivory-wayfarer-robe',
}
SCALE = {
    ('eddy','red'):(.90,.90), ('noir','red'):(.85,.90),
    ('eddy','black'):(.88,.86), ('noir','black'):(.85,.85),
    ('eddy','ivory'):(.90,.94), ('noir','ivory'):(.82,.93),
}
SIZE = 1024
CELL = 256
Y, X = np.ogrid[:CELL, :CELL]


def seed(rgb: np.ndarray, item: str, alpha: np.ndarray):
    r, g, b = (rgb[:, :, i].astype(np.int16) for i in range(3))
    if item == 'ivory':
        return (r > 135) & (g > 110) & (b > 75) & (r-g < 70) & (g-b < 70) & (alpha > 180)
    return (r > 55) & (r > g*1.35) & (r > b*1.35) & (g < 105) & (alpha > 180)


def center(image: np.ndarray, item: str, source: bool):
    mask = seed(image[:, :, :3], item, image[:, :, 3])
    mask &= (Y >= (90 if source else 125)) & (Y <= 225) & (X >= 40) & (X <= 215)
    yy, xx = np.nonzero(mask)
    if len(xx) < 120:
        raise ValueError(f'{item} costume color anchor too sparse: {len(xx)}')
    return float(xx.mean()), float(yy.mean())


def cleaned_alpha(source: np.ndarray, item: str):
    alpha = source[:, :, 3].copy()
    alpha[alpha < 205] = 0
    if item == 'ivory':
        rgb = source[:, :, :3].astype(np.int16)
        hi = rgb.max(axis=2)
        lo = rgb.min(axis=2)
        saturated = (hi > 80) & ((hi-lo) > hi*.74)
        alpha[saturated] = 0
    return Image.fromarray(alpha, 'L')


def make_overlay(character: str, item: str):
    base = Image.open(BASE / f'{character}-standing.png').convert('RGBA')
    fitted = Image.open(SOURCE / f'{character}-{item}-fit.png').convert('RGBA').resize((SIZE,SIZE), Image.Resampling.LANCZOS)
    garment = Image.open(SOURCE / f'{character}-{item}-item-source.png').convert('RGBA').resize((SIZE,SIZE), Image.Resampling.LANCZOS)
    base_arr = np.array(base)
    fit_arr = np.array(fitted)
    garment_arr = np.array(garment)
    output = np.zeros((SIZE,SIZE,4), dtype=np.uint8)
    sx, sy = SCALE[(character,item)]
    counts=[]
    for view in range(16):
        x0,y0=view%4*CELL,view//4*CELL
        fit = fit_arr[y0:y0+CELL,x0:x0+CELL]
        src = garment_arr[y0:y0+CELL,x0:x0+CELL]
        cx_fit,cy_fit=center(fit,item,False)
        cx_src,cy_src=center(src,item,True)
        mask = cleaned_alpha(src,item).transform((CELL,CELL),Image.Transform.AFFINE,
            (1/sx,0,cx_src-cx_fit/sx,0,1/sy,cy_src-cy_fit/sy),
            resample=Image.Resampling.BILINEAR)
        alpha=np.asarray(mask).copy()
        alpha[:87,:] = 0
        alpha[231:,:] = 0
        alpha[fit[:,:,3]<180] = 0
        if item=='ivory':
            rgb=fit[:,:,:3].astype(np.int16)
            hi=rgb.max(axis=2);lo=rgb.min(axis=2)
            # The generated ivory fits carry scattered red/yellow chroma-key
            # artifacts around their outline. They are never part of the robe.
            alpha[(hi>85)&((hi-lo)>hi*.74)] = 0
        # Any remaining subpixel outline is flattened to an opaque garment
        # interior. This avoids translucent colored halos over dark floors.
        alpha=np.where(alpha>=145,255,0).astype(np.uint8)
        trousers=None
        if character=='eddy' and item=='red':
            # The reference coat includes dark undertrousers beneath its split
            # tails. Paint only uncovered canonical orange leg pixels so the
            # full-body outfit is complete when a separate pants slot clears.
            original=base_arr[y0:y0+CELL,x0:x0+CELL,:3].astype(np.int16)
            nearby=np.asarray(Image.fromarray(alpha,'L').filter(ImageFilter.MaxFilter(31)))>0
            orange=(original[:,:,0]>95)&(original[:,:,1]>35)&(original[:,:,0]>original[:,:,1]*1.3)
            trousers=(Y>=185)&(Y<=230)&nearby&orange&(alpha==0)
            alpha[trousers]=255
        count=int(np.count_nonzero(alpha))
        if count<4500 or count>20000:
            raise ValueError(f'{character} {item} view {view}: implausible garment mask {count}')
        color=fit[:,:,:3].copy()
        if trousers is not None:
            original=base_arr[y0:y0+CELL,x0:x0+CELL,:3].astype(np.float32)
            shade=np.clip(original.mean(axis=2)*.18+18,28,54).astype(np.uint8)
            color[trousers,0]=shade[trousers]
            color[trousers,1]=(shade[trousers]*.92).astype(np.uint8)
            color[trousers,2]=(shade[trousers]*.88).astype(np.uint8)
        output[y0:y0+CELL,x0:x0+CELL,:3]=color
        output[y0:y0+CELL,x0:x0+CELL,3]=alpha
        counts.append(count)
    overlay=Image.fromarray(output,'RGBA')
    item_id=ITEMS[item]
    target=ASSETS/character/f'{item_id}.webp'
    target.parent.mkdir(parents=True,exist_ok=True)
    overlay.save(target,'WEBP',lossless=True,method=6)
    overlay.save(SOURCE/f'{character}-{item}-overlay-source.png')
    for bg_name,color in [('dark',(35,31,31,255)),('light',(236,232,224,255))]:
        canvas=Image.new('RGBA',(SIZE,SIZE),color)
        canvas.alpha_composite(base)
        canvas.alpha_composite(overlay)
        canvas.convert('RGB').save(SOURCE/f'qa-{character}-{item}-{bg_name}.jpg',quality=94)
    print(character,item,'view pixels',min(counts),max(counts),'total',sum(counts))
    return target


def make_display(item: str):
    product=Image.open(SOURCE/f'{item}-product-cutout.png').convert('RGBA')
    product.thumbnail((488,488),Image.Resampling.LANCZOS)
    display=Image.new('RGBA',(512,512))
    display.alpha_composite(product,((512-product.width)//2,(512-product.height)//2))
    target=ASSETS/'shared'/f'{ITEMS[item]}-display.png'
    target.parent.mkdir(parents=True,exist_ok=True)
    display.save(target)


def main():
    for item in ITEMS:
        eddy=make_overlay('eddy',item)
        noir=make_overlay('noir',item)
        if eddy.read_bytes()==noir.read_bytes():
            raise ValueError(f'{item}: Eddy and Noir overlays are identical')
        make_display(item)
    print('Created six independent 16-view full-body overlays and three catalog displays.')

if __name__=='__main__':
    main()
