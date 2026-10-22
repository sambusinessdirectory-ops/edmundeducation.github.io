#!/usr/bin/env python3
"""Composite Noir's fixed plate, local blink, touching hoof and MC feedback."""
from pathlib import Path
from math import sin, pi
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / 'assets/mascots/noir-polysemy'
PUBLIC = ROOT / 'polysemy-noir'
SIZE, FPS, COUNT = 400, 25, 175


def read(name):
    return Image.open(SOURCE / name).convert('RGB').resize((SIZE, SIZE), Image.Resampling.LANCZOS)


def ease(a, b, t):
    x = min(1., max(0., (t-a)/(b-a)))
    return x*x*(3-2*x)


def hoof_sprite(reference):
    # Only the original hoof cap is retained; the arm is drawn as an attached layer.
    box = (109, 245, 195, 301)
    patch = reference.crop(box).convert('RGBA')
    alpha = Image.new('L', patch.size)
    d = ImageDraw.Draw(alpha)
    d.polygon([(5,22),(16,7),(40,0),(64,5),(81,20),(83,42),(65,54),(20,52),(1,39)], fill=255)
    patch.putalpha(alpha.filter(ImageFilter.GaussianBlur(1.5)))
    return patch.resize((54,36), Image.Resampling.LANCZOS)


def blink_alpha(t):
    amount = 0.
    for center in (1.1, 3.55, 5.85):
        distance = abs(t-center)
        if distance < .15:
            amount = max(amount, 1-distance/.15)
    return amount


def target(t):
    # One tap per row. The screen feedback is transient, as in a MC selection.
    events = ((.55, 1.25, 0), (2.25, 2.95, 1), (4.35, 5.05, 2))
    rest = (143., 283.)
    for start, end, row in events:
        if start <= t < end:
            y = (311., 329., 348.)[row]
            down = ease(start, start+.28, t) * (1-ease(end-.22, end, t))
            return (rest[0]+(12+row*5)*down, rest[1]+(y-rest[1])*down), row, (start+.25 <= t < end+.45)
    return rest, None, False


def draw_tick(image, row, intensity):
    if row is None or intensity <= 0: return
    # Screen choices remain readable without any verbal label at icon size.
    y = (309, 328, 347)[row]
    over = Image.new('RGBA', image.size)
    d = ImageDraw.Draw(over)
    d.rounded_rectangle((104-row*3, y-8, 291+row*3, y+7), 7, fill=(58, 205, 164, round(110*intensity)))
    points = [(265,y), (271,y+5), (282,y-8)]
    d.line(points, fill=(8, 79, 56, round(255*intensity)), width=8, joint='curve')
    d.line(points, fill=(249, 255, 236, round(255*intensity)), width=5, joint='curve')
    image.alpha_composite(over)


def arm(image, position, hoof):
    x,y = position
    layer = Image.new('RGBA', image.size)
    d = ImageDraw.Draw(layer)
    # A small shoulder pivot makes the hoof visibly tap without detaching.
    shoulder = (83, 232)
    elbow = (108+(x-143)*.28, 265+(y-283)*.35)
    d.line((shoulder, elbow, (x-8,y-8)), fill=(17,15,22,240), width=44, joint='curve')
    d.line((shoulder, elbow, (x-8,y-8)), fill=(62,49,53,255), width=37, joint='curve')
    d.line(((96,241),(elbow[0]-5,elbow[1]-7),(x-15,y-14)), fill=(140,105,93,100), width=7, joint='curve')
    image.alpha_composite(layer)
    image.alpha_composite(hoof,(round(x-hoof.width/2),round(y-hoof.height/2)))


def render(t, plate, blink, eye_mask, face_mask, hoof):
    image = plate.convert('RGBA')
    # One-pixel local face nod. The silhouette and room remain registered.
    nod = round(1.5*sin(2*pi*t/7)**2)
    if nod:
        moved = Image.new('RGBA', image.size)
        moved.alpha_composite(image, (0,nod))
        image = Image.composite(moved, image, face_mask)
    amount = blink_alpha(t)
    if amount:
        mask = eye_mask.point(lambda v: round(v*amount))
        image = Image.composite(blink.convert('RGBA'), image, mask)
    position, active, checked = target(t)
    if checked:
        # Clear each success before the next tap; avoid implying all MC choices are correct.
        event_end = (1.25,2.95,5.05)[active] if active is not None else 0
        draw_tick(image, active, 1 if t < event_end else 0)
    arm(image, position, hoof)
    return image


def circular(image):
    image = image.convert('RGBA')
    mask = Image.new('L', image.size)
    ImageDraw.Draw(mask).ellipse((1,1,image.width-2,image.height-2),fill=255)
    image.putalpha(mask)
    return image


def indexed(frames):
    palette = frames[0].convert('RGB').quantize(colors=255, method=Image.Quantize.MEDIANCUT)
    colors = [255,0,255] + palette.getpalette()[:765]
    colors += [0]*(768-len(colors))
    out = []
    for f in frames:
        indexes = np.asarray(f.convert('RGB').quantize(palette=palette, dither=Image.Dither.NONE),dtype=np.uint16)
        alpha = np.asarray(f.getchannel('A'))
        item = Image.fromarray(np.where(alpha>=128,indexes+1,0).astype(np.uint8),'P')
        item.putpalette(colors)
        item.info['transparency'] = 0
        out.append(item)
    return out


def main():
    PUBLIC.mkdir(exist_ok=True)
    (PUBLIC/'stills').mkdir(exist_ok=True)
    plate = read('noir-clean-plate.png')
    blink = read('noir-blink-reference.png')
    reference = read('noir-hoof-reference.png')
    hoof = hoof_sprite(reference)
    eye_mask = Image.new('L',(SIZE,SIZE))
    d = ImageDraw.Draw(eye_mask)
    d.ellipse((168,112,219,160),fill=255)
    d.ellipse((237,135,278,173),fill=255)
    eye_mask = eye_mask.filter(ImageFilter.GaussianBlur(2))
    face_mask = Image.new('L',(SIZE,SIZE))
    ImageDraw.Draw(face_mask).ellipse((151,107,286,258),fill=255)
    face_mask = face_mask.filter(ImageFilter.GaussianBlur(14))
    frames = [render(n/FPS,plate,blink,eye_mask,face_mask,hoof) for n in range(COUNT)]
    for i,n in enumerate((5,27,61,93,126),1):
        circular(frames[n].resize((256,256),Image.Resampling.LANCZOS)).save(PUBLIC/'stills'/f'noir-{i:02}.png',optimize=True)
    circular(frames[27].resize((512,512),Image.Resampling.LANCZOS)).save(PUBLIC/'noir-polysemy-poster.png',optimize=True)
    mini = [circular(f.resize((160,160),Image.Resampling.LANCZOS)) for f in frames]
    gif = indexed(mini)
    gif[0].save(PUBLIC/'noir-polysemy.gif',save_all=True,append_images=gif[1:],duration=40,loop=0,transparency=0,disposal=2,optimize=False)
    print(f'{len(frames)} source frames, {len(gif)} GIF inputs')


if __name__ == '__main__': main()
