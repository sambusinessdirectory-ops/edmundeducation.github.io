"""Restore from native PDF scan pixels where available, without generating content.

Requires Pillow, numpy, opencv-python-headless and pypdf. Originals remain read-only.
Outputs versioned responsive copies, an auditable manifest and visual QA comparisons.
"""
import argparse,ast,hashlib,json,subprocess
from pathlib import Path
import cv2
import numpy as np
from PIL import Image,ImageOps,ImageDraw,ImageFilter
from pypdf import PdfReader
import pdfplumber

ROOT=Path(__file__).resolve().parents[2]
OUTPUT=ROOT/'assets/dse-listening/restored-v2'
ARCHIVE=Path("/Volumes/(Pro-G) Sam's Data/Downloads SSD")
PDFS={
 2012:ARCHIVE/'DSE/2012/2012 DSE English Language Paper 3A.pdf',
 2013:ARCHIVE/'DSE/2013/paper 3/2013-DSE-ENG-LANG-3-A.pdf',
 2014:ARCHIVE/'DSE/2014/paper 3/2014-DSE-ENG-LANG-3-A.pdf',
 2015:ARCHIVE/'DSE/2015/paper 3/2015 DSE Paper 3A QA.pdf',
 2018:ARCHIVE/'2018 Paper 3.pdf',
 2020:ARCHIVE/'Paper 3 DSE Past Papers/2020 Paper 3.pdf',
}
# Read the already-reviewed source crop coordinates without executing the extractor.
FIGURES=next(ast.literal_eval(node.value) for node in ast.parse((ROOT/'tools/listening/extract_archive_figures.py').read_text()).body if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='figures' for t in node.targets))
PHOTOS={'school-home-photos','school-student-photos','food-hotdog','food-skewers','food-sushi','food-wraps','food-cupcake','food-drink','wild-boar','liberty-sisters','selena-cheung','hilton-band'}
PROTECTED={'lounge-plan','logo-options','games-painting','art-video-games','campsite-diagram','trench-diagram','animal-1','animal-2','animal-3','animal-4','animal-5','animal-6','task-4-kiss-emoji','task-2-relay','task-2-high-jump','task-2-marathon'}
READERS={};PAGES={}

def get_input(source):
    original=ImageOps.exif_transpose(Image.open(ROOT/source)).convert('RGB')
    name=Path(source).stem;year=int(Path(source).parent.name)
    provenance={'kind':'original-image','width':original.width,'height':original.height}
    if name not in PHOTOS:
        return original,provenance
    filename,_,rect=next(entry for entry in FIGURES[year] if entry[1]==name)
    page=int(filename.split('-')[1].split('.')[0]);key=(year,page)
    if key not in PAGES:
        if year not in READERS:READERS[year]=PdfReader(PDFS[year])
        reader=READERS[year]
        images={Path(entry.name).stem:entry.image.convert('RGB') for entry in reader.pages[page-1].images}
        with pdfplumber.open(PDFS[year]) as document:
            layout=document.pages[page-1]
            parts=[part for part in layout.images if part['name'] in images and part['width']>1 and part['height']>1]
            # Some scans are stored as seven horizontal strips. Reassemble native
            # pixels rather than rendering their 1-bit dots at a lower resolution.
            scale=min(8.334,max(images[part['name']].width/part['width'] for part in parts))
            scan=Image.new('RGB',(round(layout.width*scale),round(layout.height*scale)),'white')
            for part in parts:
                bitmap=images[part['name']]
                size=(round(part['width']*scale),round(part['height']*scale))
                if bitmap.size!=size:bitmap=bitmap.resize(size,Image.Resampling.LANCZOS)
                scan.paste(bitmap,(round(part['x0']*scale),round(part['top']*scale)))
        assert abs(scan.width/scan.height-1191/1684)<.02,(year,page,scan.size)
        PAGES[key]=scan
    scan=PAGES[key]
    box=tuple(round(v*(scan.width/1191 if i%2==0 else scan.height/1684)) for i,v in enumerate(rect))
    cropped=scan.crop(box)
    return cropped,{'kind':'native-pdf-scan','pdf':PDFS[year].name,'page':page,'crop':list(box),'width':cropped.width,'height':cropped.height,'scanWidth':scan.width,'pixelsSha256':hashlib.sha256(cropped.tobytes()).hexdigest()}

def clean(image,name,provenance):
    if name in PHOTOS:
        gray=np.asarray(image.convert('L'))
        sigma=1.3*provenance.get('scanWidth',3310)/3310
        filtered=cv2.GaussianBlur(gray,(0,0),max(.9,sigma))
        filtered=cv2.fastNlMeansDenoising(filtered,None,14,7,21)
        filtered=cv2.bilateralFilter(filtered,7,25,4)
        lo,hi=np.percentile(filtered,[1,99])
        filtered=np.clip((filtered-lo)*255/max(1,hi-lo),0,255).astype('uint8')
        return Image.fromarray(filtered).convert('RGB'),'native-scan-descreen'
    if name in PROTECTED:
        # Preserve small lettering and intentionally pixelated artwork.
        if name in {'art-video-games','games-painting','logo-options'}:
            return image.copy(),'detail-preserved'
        array=np.asarray(image)
        filtered=cv2.bilateralFilter(array,5,18,2)
        result=Image.fromarray(filtered)
        return result.filter(ImageFilter.UnsharpMask(radius=.8,percent=65,threshold=4)),'line-detail-cleanup'
    gray=np.asarray(image.convert('L'))
    if name in {'james-dean','cabbage-patch-doll','ota-benga'}:
        gray=cv2.GaussianBlur(gray,(0,0),.65)
    filtered=cv2.fastNlMeansDenoising(gray,None,10,7,21)
    lo,hi=np.percentile(filtered,[.5,99.5])
    filtered=np.clip((filtered-lo)*255/max(1,hi-lo),0,255).astype('uint8')
    return Image.fromarray(filtered).convert('RGB').filter(ImageFilter.UnsharpMask(radius=1.2,percent=65,threshold=4)),'photo-cleanup'

def run():
    parser=argparse.ArgumentParser();parser.add_argument('--qa-dir',type=Path,required=True);parser.add_argument('--only',nargs='*')
    args=parser.parse_args();args.qa_dir.mkdir(parents=True,exist_ok=True)
    sources=json.loads(subprocess.check_output(['node',str(ROOT/'tools/listening/image-sources.mjs')],text=True))
    manifest=json.loads((OUTPUT/'manifest.json').read_text())['images'] if args.only else {};cards=[]
    for source in sources:
        original=Image.open(ROOT/source).convert('RGB');before=hashlib.sha256((ROOT/source).read_bytes()).hexdigest()
        name=Path(source).stem;year=Path(source).parent.name
        if args.only and name not in args.only:continue
        image,provenance=get_input(source)
        if name=='expedition-ship':
            # Cleaner photograph of the SAME printed illustration, from another supplied copy.
            page=PdfReader(ARCHIVE/'DSE/2020  eng/eng 20  3.pdf').pages[5]
            scan=page.images[-1].image.convert('RGB').transpose(Image.Transpose.ROTATE_90)
            # Crop inside the picture frame; retain the complete rigging and hull.
            box=(round(scan.width*938/1312),round(scan.height*192/1875),round(scan.width*1278/1312),round(scan.height*536/1875))
            image=scan.crop(box)
            provenance={'kind':'alternate-source-scan','pdf':'eng 20  3.pdf','page':6,'rotation':90,'crop':list(box),'width':image.width,'height':image.height,'pixelsSha256':hashlib.sha256(image.tobytes()).hexdigest()}
        restored,profile=clean(image,name,provenance)
        directory=OUTPUT/year;directory.mkdir(parents=True,exist_ok=True);outputs={}
        for label,edge in [('small',640),('preview',1280),('full',3840)]:
            # Keep the original display proportions and all question layouts stable.
            size=tuple(max(1,round(v*edge/max(original.size))) for v in original.size)
            result=restored.resize(size,Image.Resampling.LANCZOS)
            target=directory/f'{name}-{edge}.webp';result.save(target,'WEBP',quality=96 if label=='full' else 94,method=6)
            outputs[label]={'src':str(target.relative_to(ROOT)),'width':result.width,'height':result.height,'bytes':target.stat().st_size}
        manifest[source]={'sourceSha256':before,'sourceWidth':original.width,'sourceHeight':original.height,'profile':profile,'restorationInput':provenance,**outputs}
        assert hashlib.sha256((ROOT/source).read_bytes()).hexdigest()==before
        card=Image.new('RGB',(820,480),'#eef2f3');d=ImageDraw.Draw(card);d.text((10,8),f'{year} / {name}',fill='black')
        d.text((10,28),'Previously published',fill='black');d.text((420,28),'Revised',fill='black')
        old=Image.open(ROOT/'assets/dse-listening/enhanced-v1'/year/f'{name}-1280.webp')
        for x,picture in [(10,old),(420,restored)]:
            picture=ImageOps.contain(picture,(390,415));card.paste(picture,(x+(390-picture.width)//2,55+(415-picture.height)//2))
        card.save(args.qa_dir/f'{year}-{name}.png');cards.append(card)
        print(f'{year}/{name}: {profile}, input {image.size}',flush=True)
    payload={'version':2,'method':'Native PDF scan descreening, non-local means denoising, contrast correction and detail-aware filtering. No generated content. Original images preserved.','images':manifest}
    (OUTPUT/'manifest.json').write_text(json.dumps(payload,indent=2)+'\n')
    (ROOT/'dse-listening-image-manifest.mjs').write_text('// Generated by tools/listening/restore_images.py; originals are never overwritten.\nexport const DSE_IMAGE_ENHANCEMENTS = '+json.dumps(manifest,separators=(',',':'))+';\n')
    for start in range(0,len(cards),6):
        sheet=Image.new('RGB',(1640,1440),'white')
        for i,card in enumerate(cards[start:start+6]):sheet.paste(card,((i%2)*820,(i//2)*480))
        sheet.save(args.qa_dir/f'contact-{start//6+1}.png')
    print(f'Restored and reviewed outputs generated for {len(manifest)} images.')

if __name__=='__main__':run()
