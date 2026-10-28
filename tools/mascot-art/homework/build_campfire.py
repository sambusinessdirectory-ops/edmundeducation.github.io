"""Registered campfire loop: image-generated keys, rigid skewer, local blink/fire.
No full-scene interpolation. All coordinates refer to the 1254px artwork.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFilter,ImageChops
import numpy as np, math,json
ROOT=Path(__file__).resolve().parents[3];OUT=ROOT/'homework-eddy';N=160;SIZE=400
load=lambda name:Image.open(OUT/'source'/f'{name}.png').convert('RGBA').resize((SIZE,SIZE),Image.Resampling.LANCZOS)
a,clean,blink=[load(n) for n in ['open','clean','blink']]
def mask(points,blur=1):
 m=Image.new('L',(SIZE,SIZE));ImageDraw.Draw(m).polygon([(x*SIZE/1254,y*SIZE/1254) for x,y in points],fill=255);return m.filter(ImageFilter.GaussianBlur(blur))
# Rigid skewer and marshmallow, meeting the unchanged hoof at a fixed pivot.
stickmask=mask([(562,778),(843,658),(849,628),(920,589),(945,588),(970,614),(991,606),(997,626),(980,639),(992,665),(974,690),(896,720),(868,710),(854,691),(570,805)],.45)
# Broad glow region, but no log/stone pixels move.
firemask=mask([(810,735),(1106,732),(1113,946),(1095,966),(1068,946),(1033,934),(995,951),(971,984),(927,1005),(903,960),(868,936),(840,952),(806,994)],3)
eyes=Image.new('L',(SIZE,SIZE));d=ImageDraw.Draw(eyes)
for box in [(416,329,540,454),(642,387,721,499)]:d.ellipse(tuple(v*SIZE/1254 for v in box),fill=255)
eyes=eyes.filter(ImageFilter.GaussianBlur(1.6))
# Only source-edit regions are taken from clean key; the rest stays original.
plate=Image.composite(clean,a,ImageChops.lighter(stickmask,firemask))
stick=a.copy();stick.putalpha(ImageChops.multiply(a.getchannel('A'),stickmask))
fire=a.copy();fire.putalpha(ImageChops.multiply(a.getchannel('A'),firemask))
alpha=a.getchannel('A');frames=[]
for i in range(N):
 t=i*.04;phase=2*math.pi*i/N;frame=plate.copy()
 close=max(max(0,1-abs(t-c)/.18) for c in [1.16,4.44])
 if close:frame=Image.composite(blink,frame,eyes.point(lambda v:int(v*min(1,close*1.7))))
 # Local flame sway; whole body and environment remain pixel-identical.
 shear=.018*math.sin(phase*5);firemove=fire.transform((SIZE,SIZE),Image.Transform.AFFINE,(1,shear,-shear*325,0,1,0),Image.Resampling.BICUBIC)
 frame.alpha_composite(firemove)
 angle=2.0*math.sin(phase)
 frame.alpha_composite(stick.rotate(angle,Image.Resampling.BICUBIC,center=(565*SIZE/1254,791*SIZE/1254)))
 frame.putalpha(alpha);frames.append(frame)
# Palette samples all temporal states; reserve index255 solely for transparency.
sheet=Image.new('RGB',(SIZE*4,SIZE*4),(21,31,31))
for k in range(16):sheet.paste(frames[k*10].convert('RGB'),((k%4)*SIZE,(k//4)*SIZE))
palette=sheet.quantize(colors=255,method=Image.Quantize.MEDIANCUT);pal=palette.getpalette()[:765]+[255,0,255];palette.putpalette(pal)
encoded=[]
for frame in frames:
 p=frame.convert('RGB').quantize(palette=palette,dither=Image.Dither.NONE);p.putpalette(pal);p.paste(255,mask=alpha.point(lambda v:255 if v<128 else 0));encoded.append(p)
encoded[0].save(OUT/'eddy-campfire.gif',save_all=True,append_images=encoded[1:],duration=40,loop=0,transparency=255,disposal=1,optimize=False)
frames[0].resize((512,512),Image.Resampling.LANCZOS).save(OUT/'poster.png')
for k,i in enumerate([0,24,29,72,111]):frames[i].resize((256,256),Image.Resampling.LANCZOS).save(OUT/'stills'/f'eddy-{k+1:02}.png')
contact=Image.new('RGB',(400*4,440*2),'#e6ece7')
for k,i in enumerate([0,24,29,40,72,111,140,159]):
 contact.paste(frames[i],((k%4)*400,(k//4)*440),frames[i]);ImageDraw.Draw(contact).text(((k%4)*400+12,(k//4)*440+405),f'{i*.04:.2f}s',fill='black')
contact.save('/tmp/eddy-campfire-contact.png')
gif=Image.open(OUT/'eddy-campfire.gif');duration=0
for j in range(gif.n_frames):gif.seek(j);duration+=gif.info['duration'];assert gif.convert('RGBA').getpixel((0,0))[3]==0
assert duration==6400
assert frames[0].getpixel((100,180))==frames[72].getpixel((100,180))
print(json.dumps({'size':gif.size,'frames':gif.n_frames,'duration_ms':duration,'bytes':(OUT/'eddy-campfire.gif').stat().st_size}))
