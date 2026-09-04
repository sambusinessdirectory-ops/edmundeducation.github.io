"""Deterministic, non-generative scan cleanup; originals are read-only.

Produces a 3840-pixel-long-edge version and two smaller responsive versions.
No learned model, content reconstruction, crop, colorization, thresholding or inpainting.
"""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageFilter, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / 'assets/dse-listening/enhanced-v1'
PROTECTED = {
 'lounge-plan', 'logo-options', 'games-painting', 'art-video-games',
 'campsite-diagram', 'trench-diagram',
 'animal-1', 'animal-2', 'animal-3', 'animal-4', 'animal-5', 'animal-6',
 'task-4-kiss-emoji',
}
HALFTONE = {
 'school-home-photos', 'school-student-photos',
 'food-hotdog', 'food-skewers', 'food-sushi', 'food-wraps', 'food-cupcake', 'food-drink',
 'wild-boar', 'liberty-sisters', 'selena-cheung', 'hilton-band', 'expedition-ship',
}

def cleanup(image, profile):
    if profile == 'protected-detail':
        # Retain 90% of source pixels; only attenuate isolated scan specks.
        # This avoids thresholding away small lettering, thin lines or intentional pixel art.
        return Image.blend(image, image.filter(ImageFilter.MedianFilter(3)), .10)
    radius = (.80 if max(image.size) < 800 else 1.05) if profile == 'halftone-photo' else .38
    clean = image.filter(ImageFilter.GaussianBlur(radius))
    return clean.filter(ImageFilter.UnsharpMask(radius=1.7, percent=55, threshold=4))

def sized(image, edge):
    scale = edge / max(image.size)
    size = tuple(max(1, round(value * scale)) for value in image.size)
    return image.resize(size, Image.Resampling.LANCZOS)

def run():
    parser = argparse.ArgumentParser()
    parser.add_argument('--qa-dir', type=Path)
    parser.add_argument('--sample', action='store_true', help='Preview the five requested examples without writing production assets')
    args = parser.parse_args()
    sources = json.loads(subprocess.check_output(['node',str(ROOT/'tools/listening/image-sources.mjs')],text=True))
    selected = {'selena-cheung','liberty-sisters','hilton-band','expedition-ship','task-2-marble-racing'}
    manifest = {}
    contact = []
    for source in sources:
        source_path = ROOT / source
        name = source_path.stem
        if args.sample and name not in selected:
            continue
        before = hashlib.sha256(source_path.read_bytes()).hexdigest()
        image = ImageOps.exif_transpose(Image.open(source_path)).convert('RGB')
        profile = 'protected-detail' if name in PROTECTED else 'halftone-photo' if name in HALFTONE else 'light-photo'
        clean = cleanup(image, profile)
        if not args.sample:
            directory = OUTPUT / source_path.parent.name
            directory.mkdir(parents=True, exist_ok=True)
            outputs = {}
            for label, edge in [('small',640),('preview',1280),('full',3840)]:
                result = sized(clean,edge)
                target = directory / f'{name}-{edge}.webp'
                result.save(target,'WEBP',quality=94 if label=='full' else 90,method=6)
                outputs[label] = {'src':str(target.relative_to(ROOT)), 'width':result.width, 'height':result.height, 'bytes':target.stat().st_size}
            manifest[source] = {'sourceSha256':before,'sourceWidth':image.width,'sourceHeight':image.height,'profile':profile,**outputs}
        assert hashlib.sha256(source_path.read_bytes()).hexdigest() == before, f'Original changed: {source}'
        if args.qa_dir:
            # Matched-size previews make changes visible without misleading size differences.
            card = Image.new('RGB',(820,460),'#eef2f3')
            draw = ImageDraw.Draw(card)
            draw.text((12,8),source,fill='black')
            draw.text((12,30),'Original',fill='black')
            draw.text((422,30),f'Cleaned: {profile}',fill='black')
            for x,im in [(10,image),(420,clean)]:
                thumb = ImageOps.contain(im,(390,395),Image.Resampling.LANCZOS)
                card.paste(thumb,(x+(390-thumb.width)//2,55+(395-thumb.height)//2))
            args.qa_dir.mkdir(parents=True, exist_ok=True)
            card.save(args.qa_dir / f'{source_path.parent.name}-{name}.png')
            contact.append(card)
        print(f'{source}: {image.width}x{image.height}, {profile}',flush=True)
    if args.qa_dir:
        for start in range(0,len(contact),6):
            sheet = Image.new('RGB',(1640,460*min(3,(len(contact)-start+1)//2)),'white')
            for i,card in enumerate(contact[start:start+6]):sheet.paste(card,((i%2)*820,(i//2)*460))
            sheet.save(args.qa_dir / f'contact-{start//6+1}.png')
    if not args.sample:
        payload = {'version':1,'method':'Non-generative spatial filtering and Lanczos resampling; 3840px long edge, original aspect ratio. No invented detail.','images':manifest}
        (OUTPUT/'manifest.json').write_text(json.dumps(payload,indent=2)+'\n')
        (ROOT/'dse-listening-image-manifest.mjs').write_text('// Generated by tools/listening/enhance_images.py; original images are never overwritten.\nexport const DSE_IMAGE_ENHANCEMENTS = '+json.dumps(manifest,separators=(',',':'))+';\n')
        print(f'Processed {len(manifest)} originals into {len(manifest)*3} responsive images.')

if __name__ == '__main__':
    run()
