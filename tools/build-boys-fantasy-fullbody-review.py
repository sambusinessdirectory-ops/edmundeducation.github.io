"""Create actual-renderer review boards and pending hash-locked manifests."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import hashlib
import json

ROOT=Path(__file__).resolve().parents[1]
QA=ROOT/'tools/mascot-art/wardrobe/boys-fantasy-fullbody-trio'
ITEMS={
 'crimson-gilded-court-coat':('CRIMSON GILDED COURT COAT','red'),
 'shadow-thorn-robe':('SHADOW THORN ROBE','black'),
 'ivory-wayfarer-robe':('IVORY WAYFARER ROBE','ivory'),
}
CHARACTERS=('eddy','noir')
COLUMNS=[('BARE · DARK OPEN','bare-3d-dark-open'),('OUTFIT · DARK OPEN','{item}-3d-dark-open'),('OUTFIT · MID BLINK','{item}-3d-blink'),('OUTFIT · LIGHT OPEN','{item}-3d-light-open'),('CAP + OUTFIT + BOOTS','{item}-combination-3d-open'),('COMBINATION · BLINK','{item}-combination-3d-blink')]


def font(size,bold=False):
 p='/System/Library/Fonts/Supplemental/Arial Bold.ttf' if bold else '/System/Library/Fonts/Supplemental/Arial.ttf'
 try:return ImageFont.truetype(p,size)
 except OSError:return ImageFont.load_default()


def atlas(character,item,suffix):
 return Image.open(QA/f'qa-{character}-{suffix.format(item=item)}.jpg').convert('RGB')


def hash_file(path):
 return hashlib.sha256((ROOT/path).read_bytes()).hexdigest()


def make_overview():
 tile=300; left=270; gap=18; top=128; row=tile+70
 width=left+4*(tile+gap)+gap;height=top+3*row+gap
 board=Image.new('RGB',(width,height),'#1b1a19');d=ImageDraw.Draw(board)
 d.text((24,20),'THREE FULL-BODY OUTFITS · EDDY & NOIR',fill='#fff7ea',font=font(34,True))
 d.text((24,65),'Actual 3D renderer · front and rear · canonical faces and hooves',fill='#cfc4b5',font=font(19))
 for col,label in enumerate(('EDDY FRONT','EDDY REAR','NOIR FRONT','NOIR REAR')):
  d.text((left+col*(tile+gap)+tile//2,105),label,fill='#eadbcb',font=font(16,True),anchor='mm')
 for ri,(item,(title,_)) in enumerate(ITEMS.items()):
  y=top+ri*row
  d.text((20,y+tile//2-24),title.replace(' ','\n',1),fill='#fff4e5',font=font(19,True))
  for col,(character,index) in enumerate((('eddy',0),('eddy',7),('noir',0),('noir',7))):
   img=atlas(character,item,item+'-3d-dark-open')
   crop=img.crop(((index%4)*256,(index//4)*256,(index%4+1)*256,(index//4+1)*256)).resize((tile,tile),Image.Resampling.LANCZOS)
   board.paste(crop,(left+col*(tile+gap),y))
  d.text((20,y+tile-42),f'45 coins · full body',fill='#c8b7a8',font=font(17))
 board.save(QA/'qa-overview-v1.jpg',quality=95,subsampling=0)


def make_detail(item,title):
 tile=450; margin=22; top=100; row=tile+55
 board=Image.new('RGB',(margin*5+tile*4,top+row*2+margin),'#1c1a19');d=ImageDraw.Draw(board)
 d.text((margin,16),title+' · RENDERER DETAIL',fill='#fff6e9',font=font(30,True))
 d.text((margin,55),'Front · profile · rear · three-quarter · Eddy and Noir',fill='#c9bcaa',font=font(19))
 for ri,character in enumerate(CHARACTERS):
  img=atlas(character,item,item+'-3d-dark-open')
  for ci,(view,label) in enumerate(((0,'front'),(4,'profile'),(7,'rear'),(13,'three-quarter'))):
   crop=img.crop(((view%4)*256,(view//4)*256,(view%4+1)*256,(view//4+1)*256)).resize((tile,tile),Image.Resampling.LANCZOS)
   x=margin+ci*(tile+margin);y=top+ri*row
   board.paste(crop,(x,y));d.text((x+5,y+tile+7),f'{character.upper()} · {label}',fill='#efe4d7',font=font(19))
 board.save(QA/f'qa-detail-{item}-v1.jpg',quality=95,subsampling=0)


def make_approval(item,title):
 tile=390;gap=14;left=165;top=135;row=tile+62
 width=left+len(COLUMNS)*(tile+gap)+gap;height=top+len(CHARACTERS)*row+gap
 board=Image.new('RGB',(width,height),'#191817');d=ImageDraw.Draw(board)
 d.text((32,18),title+' · REVIEW V1',fill='#fff8ed',font=font(29,True))
 d.text((32,63),'Actual 3D standing renderer · 16 views per character · open/blink · light/dark · cap and boots',fill='#cfc2b2',font=font(17))
 for ci,(label,_) in enumerate(COLUMNS):d.text((left+ci*(tile+gap)+tile//2,111),label,fill='#efe7db',font=font(13,True),anchor='mm')
 for ri,character in enumerate(CHARACTERS):
  d.text((84,top+ri*row+tile//2),character.upper(),fill='#efe7db',font=font(17,True),anchor='mm')
  for ci,(_,suffix) in enumerate(COLUMNS):
   img=atlas(character,item,suffix.format(item=item)).resize((tile,tile),Image.Resampling.LANCZOS)
   board.paste(img,(left+ci*(tile+gap),top+ri*row))
 board.save(QA/f'qa-approval-{item}-v1.jpg',quality=95,subsampling=0)


def manifest(item,title):
 assets=[f'assets/speaking-system/cosmetics/{c}/{item}.webp' for c in CHARACTERS]+[f'assets/speaking-system/cosmetics/shared/{item}-display.png']
 evidence=[]
 for character in CHARACTERS:
  for _,suffix in COLUMNS:evidence.append(f'tools/mascot-art/wardrobe/boys-fantasy-fullbody-trio/qa-{character}-{suffix.format(item=item)}.jpg')
 evidence += [f'tools/mascot-art/wardrobe/boys-fantasy-fullbody-trio/qa-approval-{item}-v1.jpg',f'tools/mascot-art/wardrobe/boys-fantasy-fullbody-trio/qa-detail-{item}-v1.jpg','tools/mascot-art/wardrobe/boys-fantasy-fullbody-trio/qa-overview-v1.jpg']
 data={
  'schemaVersion':1,'itemId':item,'catalogGroup':'boys','revision':'v1','status':'pending-review','humanVisualAcceptance':False,'characters':list(CHARACTERS),
  'reviewRequirements':[
   'same-angle bare and full-body outfit comparison for Eddy and Noir in the actual standing 3D renderer',
   'all 16 directions for both characters, including fronts, profiles, rear and diagonals',
   'open-eye and blink states with exact runtime atlases',
   'dark, midtone and light renderer backgrounds',
   'independent fitted '+title.lower()+' with front, side and back garment details matching the reference',
   'the full-body slot clears tops and lower-body clothing, including pants, and preserves compatible headwear and footwear',
   'canonical face, eyes, ears, bridle, mane, tail, hoof hands and hoof feet remain visible and correctly occluded',
   'botanical-cap plus outfit plus shearling-boots compatibility',
   'no clipping, colored fringe, background matte, white halo, missing cells or copied character overlay'
  ],
  'assets':{p:hash_file(p) for p in assets},
  'evidence':{p:hash_file(p) for p in evidence}
 }
 path=QA/f'visual-acceptance-{item}-v1.json';path.write_text(json.dumps(data,indent=2)+'\n')
 print(path)


def main():
 make_overview()
 for item,(title,_) in ITEMS.items():
  make_detail(item,title)
  make_approval(item,title)
  manifest(item,title)
 print(QA/'qa-overview-v1.jpg')

if __name__=='__main__':main()
