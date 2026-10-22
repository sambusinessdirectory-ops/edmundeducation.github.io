#!/usr/bin/env python3
"""Render Celeste from one fixed plate, rigid letters, a moving hoof, and blink keys."""
from __future__ import annotations

from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "assets/mascots/celeste-sentence-lab"
PUBLIC = ROOT / "sentence-celeste"
STILLS = PUBLIC / "stills"
SIZE = 400
FPS = 25
COUNT = 175
CROP = (87, 0, 1167, 1080)


def read(name):
    return Image.open(SOURCE / f"celeste-{name}.png").convert("RGB").crop(CROP).resize(
        (SIZE, SIZE), Image.Resampling.LANCZOS)


def ease(a, b, t):
    x = max(0.0, min(1.0, (t-a)/(b-a)))
    return x*x*(3-2*x)


def tween(a, b, weight):
    return (a[0]+(b[0]-a[0])*weight, a[1]+(b[1]-a[1])*weight)


def extract_letter(image, kind):
    pixels = np.asarray(image, dtype=np.int16)
    r, g, b = pixels[:,:,0], pixels[:,:,1], pixels[:,:,2]
    yy, xx = np.mgrid[:SIZE,:SIZE]
    if kind == "o":
        region = (xx>=195)&(xx<=305)&(yy>=220)&(yy<=322)
        colored = (r>130)&(r>g*1.30)&(r>b*1.26)&(g>55)
    else:
        region = (xx>=205)&(xx<=325)&(yy>=297)&(yy<=375)
        colored = (r>180)&(g>125)&(r>g*1.13)&(b<145)
    alpha = Image.fromarray(np.uint8(region & colored)*255, "L")
    alpha = alpha.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(.7))
    box = alpha.getbbox()
    if not box:
        raise RuntimeError(f"Missing {kind.upper()} cutout")
    x0,y0,x1,y1 = box
    box = (max(0,x0-2),max(0,y0-2),min(SIZE,x1+2),min(SIZE,y1+2))
    sprite = image.convert("RGBA").crop(box)
    sprite.putalpha(alpha.crop(box))
    scale = .82 if kind=="o" else .78
    return sprite.resize((round(sprite.width*scale),round(sprite.height*scale)),
                         Image.Resampling.LANCZOS)


def extract_hoof(image):
    box = (232,209,295,259)
    sprite = image.convert("RGBA").crop(box)
    alpha = Image.new("L", sprite.size, 0)
    ImageDraw.Draw(alpha).ellipse((3,2,59,43), fill=255)
    sprite.putalpha(alpha.filter(ImageFilter.GaussianBlur(1.2)))
    return sprite


def blink_weight(t):
    result = 0.0
    for center in (.62,3.78,5.82):
        delta = abs(t-center)
        if delta < .16:
            result = max(result,1-delta/.16)
    return result


def paste_center(image, sprite, center):
    image.alpha_composite(sprite,(round(center[0]-sprite.width/2),
                                  round(center[1]-sprite.height/2)))


def arm_layer(center):
    hx,hy = center
    shoulder = (277.0,291.0)
    control1 = (301.0,277.0)
    control2 = (hx+16.0,hy+24.0)
    points = []
    for index in range(17):
        t=index/16
        u=1-t
        x=u**3*shoulder[0]+3*u*u*t*control1[0]+3*u*t*t*control2[0]+t**3*hx
        y=u**3*shoulder[1]+3*u*u*t*control1[1]+3*u*t*t*control2[1]+t**3*(hy+8)
        points.append((round(x),round(y)))
    layer=Image.new("RGBA",(SIZE,SIZE),(0,0,0,0))
    draw=ImageDraw.Draw(layer)
    draw.line(points, fill=(162,129,154,210),width=40,joint="curve")
    draw.line(points, fill=(243,229,241,255),width=36,joint="curve")
    draw.line([(x-5,y-4) for x,y in points[2:-2]],
              fill=(255,250,252,172),width=7,joint="curve")
    return layer


def render(t, plate, blink, eye_mask, hoof, o_sprite, v_sprite):
    image=plate.convert("RGBA")
    closure=blink_weight(t)
    if closure:
        mask=eye_mask.point(lambda value:round(value*closure))
        image=Image.composite(blink.convert("RGBA"),image,mask)
    o_held,o_table=(251.0,266.0),(217.0,344.0)
    v_table,v_held=(282.0,339.0),(282.0,258.0)
    if t<2.15:
        op=tween(o_held,o_table,ease(.95,2.15,t))
    elif t<5.42:
        op=o_table
    else:
        op=tween(o_table,o_held,ease(5.42,6.48,t))
    if t<2.55:
        vp=v_table
    elif t<3.55:
        vp=tween(v_table,v_held,ease(2.55,3.55,t))
    elif t<4.18:
        vp=v_held
    else:
        vp=tween(v_held,v_table,ease(4.18,5.12,t))
    o_hoof=(op[0]+5,op[1]-o_sprite.height/2-7)
    v_hoof=(vp[0]+5,vp[1]-v_sprite.height/2-7)
    if t<2.15:
        hp=o_hoof
    elif t<2.55:
        hp=tween(o_hoof,v_hoof,ease(2.15,2.55,t))
    elif t<5.12:
        hp=v_hoof
    elif t<5.42:
        hp=tween(v_hoof,o_hoof,ease(5.12,5.42,t))
    else:
        hp=o_hoof
    shadows=Image.new("RGBA",(SIZE,SIZE),(0,0,0,0))
    d=ImageDraw.Draw(shadows)
    for position,amount in (
        (op,ease(1.65,2.15,t)*(1-ease(5.42,5.95,t))),
        (vp,(1-ease(2.55,3.05,t))+ease(4.6,5.12,t))
    ):
        if amount>0:
            x=position[0]
            d.ellipse((x-31,369,x+31,377),
                      fill=(70,37,63,round(45*min(amount,1))))
    image.alpha_composite(shadows.filter(ImageFilter.GaussianBlur(2.5)))
    # One independent O and one independent V: no shape morph or duplicates.
    image.alpha_composite(arm_layer(hp))
    paste_center(image,o_sprite,op)
    paste_center(image,v_sprite,vp)
    paste_center(image,hoof,hp)
    return image


def circle(image):
    alpha=Image.new("L",image.size,0)
    ImageDraw.Draw(alpha).ellipse((1,1,image.width-1,image.height-1),fill=255)
    image=image.convert("RGBA")
    image.putalpha(alpha)
    return image


def gif_frames(frames):
    palette=frames[0].convert("RGB").quantize(colors=255,method=Image.Quantize.MEDIANCUT)
    colors=[255,0,255]+palette.getpalette()[:765]
    colors += [0]*(768-len(colors))
    result=[]
    for frame in frames:
        indexes=np.asarray(frame.convert("RGB").quantize(
            palette=palette,dither=Image.Dither.NONE),dtype=np.uint16)
        alpha=np.asarray(frame.getchannel("A"))
        values=np.where(alpha>=128,indexes+1,0).astype(np.uint8)
        item=Image.fromarray(values,"P")
        item.putpalette(colors)
        item.info["transparency"]=0
        result.append(item)
    return result


def main():
    PUBLIC.mkdir(parents=True,exist_ok=True)
    STILLS.mkdir(parents=True,exist_ok=True)
    plate=read("clean-plate")
    blink=read("blink")
    master=read("holding-o")
    empty=read("empty-hoof")
    eye_mask=Image.new("L",(SIZE,SIZE),0)
    draw=ImageDraw.Draw(eye_mask)
    draw.ellipse((142,99,207,148),fill=255)
    draw.ellipse((199,113,247,166),fill=255)
    eye_mask=eye_mask.filter(ImageFilter.GaussianBlur(2))
    hoof=extract_hoof(empty)
    letter_o=extract_letter(master,"o")
    letter_v=extract_letter(master,"v")
    frames=[render(n/FPS,plate,blink,eye_mask,hoof,letter_o,letter_v)
            for n in range(COUNT)]
    for number,index in enumerate((10,42,57,76,97),1):
        circle(frames[index].resize((256,256),Image.Resampling.LANCZOS)).save(
            STILLS/f"celeste-{number:02d}.png",optimize=True)
    circle(frames[10].resize((512,512),Image.Resampling.LANCZOS)).save(
        PUBLIC/"celeste-sentence-lab-poster.png",optimize=True)
    small=[circle(frame.resize((160,160),Image.Resampling.LANCZOS))
           for frame in frames]
    gif=gif_frames(small)
    gif[0].save(PUBLIC/"celeste-sentence-lab.gif",save_all=True,
                append_images=gif[1:],duration=40,loop=0,
                transparency=0,disposal=2,optimize=False)
    print(f"Rendered {len(gif)} rigid-object frames with three blinks")


if __name__=="__main__":
    main()
