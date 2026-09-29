"""Build smooth clothing variants of Eddy's eight-frame journey animations.

The fitting sheets supply garment shape and details. Final strips keep the
canonical animation's registration, alpha silhouette, face, legs and tail.
"""
from pathlib import Path
import os
from collections import deque
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'tools/mascot-art/wardrobe/eddy-journey'
OUT = ROOT / 'assets/sentence-structure/exercise-eddy'
QA = Path(os.environ.get('EDDY_JOURNEY_QA', '/tmp/eddy-journey-qa'))
QA.mkdir(parents=True, exist_ok=True)
POSES = {'walk': ('eddy-walk-v2.webp', 224), 'jump': ('eddy-jump-v3.webp', 256), 'encourage': ('eddy-encourage-v2.webp', 256)}
ITEMS = ('olive-plain-tee', 'cream-cable-knit', 'charcoal-turtleneck', 'blue-swordsman-jacket', 'brown-leather-bomber', 'sunburst-hoodie', 'black-blazer-hoodie', 'white-fedora')
PALETTE = {
    'olive-plain-tee': np.array([84, 91, 65]),
    'cream-cable-knit': np.array([216, 201, 163]),
    'charcoal-turtleneck': np.array([68, 70, 70]),
    'blue-swordsman-jacket': np.array([42, 58, 96]),
    'brown-leather-bomber': np.array([136, 79, 44]),
    'sunburst-hoodie': np.array([48, 47, 45]),
    'black-blazer-hoodie': np.array([40, 39, 39]),
}


def skin(rgb):
    r, g, b = (rgb[..., i].astype(np.int16) for i in range(3))
    return (r > 80) & (r - g > 25) & (g - b > 8) & (g > 32)


def head_box(rgb):
    m = skin(rgb)
    m[125:] = False
    yy, xx = np.where(m)
    if len(xx) < 100:
        raise ValueError('Eddy head registration failed')
    return np.percentile(xx, [3, 97]), np.percentile(yy, [3, 97])


def aligned_source(source, target):
    s, t = np.asarray(source.convert('RGB')), np.asarray(target.convert('RGB'))
    (sx, sy), (tx, ty) = head_box(s), head_box(t)
    scale = float(np.clip((tx[1] - tx[0]) / (sx[1] - sx[0]), .84, 1.16))
    scx, scy, tcx, tcy = sx.mean(), sy.mean(), tx.mean(), ty.mean()
    affine = (1 / scale, 0, scx - tcx / scale, 0, 1 / scale, scy - tcy / scale)
    return source.transform((256, 256), Image.Transform.AFFINE, affine, resample=Image.Resampling.BICUBIC)


def source_frame(sheet, index):
    """Find each generated figure; the source rows are not on a 256px grid."""
    row, col = divmod(index, 4)
    side = sheet.width / 4
    x0 = col * side
    column = np.asarray(sheet.crop((x0, 0, x0 + side, sheet.height)).convert('RGB'))
    skin_rows = skin(column)
    if row == 0:
        skin_rows[int(sheet.height*.51):] = False
    else:
        skin_rows[:int(sheet.height*.49)] = False
    yy, _ = np.where(skin_rows)
    if len(yy) < 100:
        raise ValueError(f'Cannot locate source figure {index}')
    y0 = float(np.clip(np.percentile(yy, 3) - 45, 0, sheet.height-side))
    return sheet.crop((x0, y0, x0+side, y0+side)).resize((256, 256), Image.Resampling.LANCZOS)


def garment_mask(rgb, target, item):
    r, g, b = (rgb[..., i].astype(np.int16) for i in range(3))
    x, y = np.arange(256)[None, :], np.arange(256)[:, None]
    if item == 'white-fedora':
        raise ValueError('Fedora is drawn as clean vector-like shapes')
    if item == 'olive-plain-tee':
        color = (abs(r-g) < 30) & (g >= r-8) & (r-b > 8) & (g-b > 8) & (r > 30) & (r < 165)
    elif item == 'cream-cable-knit':
        color = (r > 75) & (r-g > 2) & (r-g < 34) & (g-b > 6) & (r < 242) & (b < 215)
    elif item == 'blue-swordsman-jacket':
        color = (b > r+4) & (b > g+2) & (b < 165) & (r < 115)
        color |= (r > g+7) & (g > b+5) & (r > 70) & (r < 200)
    elif item == 'brown-leather-bomber':
        color = (r-g > 12) & (r-g < 105) & (g-b > 4) & (r > 45) & (r < 190)
    else:
        color = (abs(r-g) < 32) & (abs(g-b) < 35) & (r > 15) & (r < 125)
        if item == 'sunburst-hoodie':
            color |= (r > 145) & (r-g > 4) & (g-b > 4) & (b < 225)
    allowed = (y > 99) & (y < 203) & (x > 30) & (x < 194)
    # Raised sleeves can reach higher, outside the face and mane.
    allowed |= (y > 76) & (y < 163) & (((x > 16) & (x < 83)) | ((x > 173) & (x < 219)))
    (head_left, head_right), (head_top, _) = head_box(np.asarray(target.convert('RGB')))
    head_width = head_right - head_left
    allowed &= y > max(108, head_top + head_width*.7)
    head_bottom = max(130, head_top + head_width * .9)
    head_cx = (head_left + head_right) / 2
    head_cy = (head_top - 15 + head_bottom) / 2
    face = ((x-head_cx)/(head_width*.72+10))**2 + ((y-head_cy)/((head_bottom-head_top+15)/2))**2 < 1
    if item not in ('olive-plain-tee', 'cream-cable-knit'):
        allowed &= ~face
    allowed &= ~((y > 183) & (x > 173))
    m = color & allowed
    m = Image.fromarray((m * 255).astype('uint8'), 'L')
    m = m.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(7))
    binary = np.asarray(m) > 0
    outside = np.zeros((256, 256), dtype=bool)
    q = deque()
    for xx in range(256):
        for yy in (0, 255):
            if not binary[yy, xx]: outside[yy, xx] = True; q.append((yy, xx))
    for yy in range(256):
        for xx in (0, 255):
            if not binary[yy, xx] and not outside[yy, xx]: outside[yy, xx] = True; q.append((yy, xx))
    while q:
        yy, xx = q.popleft()
        for y2, x2 in ((yy-1, xx), (yy+1, xx), (yy, xx-1), (yy, xx+1)):
            if 0 <= y2 < 256 and 0 <= x2 < 256 and not binary[y2, x2] and not outside[y2, x2]:
                outside[y2, x2] = True; q.append((y2, x2))
    return Image.fromarray((np.uint8((binary | ~outside) & allowed) * 255), 'L')


def clean_fabric(mask, item):
    """Flat cartoon fabric; source pigments and their shadows are discarded."""
    base = PALETTE[item].astype(np.float32)
    yy, xx = np.where(np.asarray(mask) > 128)
    cx = float(np.median(xx)) if len(xx) else 128
    x, y = np.arange(256)[None, :], np.arange(256)[:, None]
    shade = -3 * ((x-cx)/100)**2 - 2 * (y-140)/100
    return np.uint8(np.clip(np.stack((base[0]+shade, base[1]+shade, base[2]+shade), axis=2), 0, 255))


def clean_white_fringe(base_cell):
    """Replace pale matte trapped in the antialiased outer silhouette."""
    data = np.asarray(base_cell.convert('RGBA')).copy()
    alpha = data[..., 3]
    near_clear = np.asarray(Image.fromarray(alpha, 'L').filter(ImageFilter.MinFilter(5))) < 16
    hi, lo = data[..., :3].max(axis=2), data[..., :3].min(axis=2)
    pale = (lo > 100) & (hi-lo < 80)
    edge = near_clear & pale & (alpha > 0)
    for yy, xx in np.argwhere(edge):
        found = None
        for radius in (1, 2, 3, 4):
            for dy in range(-radius, radius+1):
                for dx in range(-radius, radius+1):
                    y2, x2 = yy+dy, xx+dx
                    if 0 <= y2 < 256 and 0 <= x2 < 256 and alpha[y2, x2] > 190 and not pale[y2, x2]:
                        found = data[y2, x2, :3]
                        break
                if found is not None:
                    break
            if found is not None:
                break
        if found is not None:
            data[yy, xx, :3] = found
        else:
            data[yy, xx, 3] = 0
    return Image.fromarray(data, 'RGBA')


def clean_bomber(base_cell, target):
    original = np.asarray(base_cell.convert('RGBA')).copy()
    (left, right), (top, _) = head_box(np.asarray(target.convert('RGB')))
    width = right - left
    bottom = max(137, top + width * 1.14)
    cx = (left + right) / 2
    x, y = np.arange(256)[None, :], np.arange(256)[:, None]
    start = max(126, bottom - 18)
    bare_skin = skin(original[..., :3])
    area = bare_skin & (y > start) & (y < 185) & (x > 31) & (x < 190)
    area = np.asarray(Image.fromarray((area * 255).astype('uint8'), 'L').filter(ImageFilter.MaxFilter(7))) > 0
    face = (x > left-12) & (x < right+17) & (y < bottom-5)
    area &= ~face
    area &= original[..., 3] > 100
    alpha = np.asarray(Image.fromarray((area * 255).astype('uint8'), 'L').filter(ImageFilter.GaussianBlur(.7))).astype(np.float32) / 255
    shade = ((x - cx) / 100) ** 2 * -9 + (y - start) / 70 * -3
    brown = np.stack((136 + shade, 80 + shade, 45 + shade), axis=2)
    original[..., :3] = np.uint8(np.clip(original[..., :3] * (1-alpha[..., None]) + brown * alpha[..., None], 0, 255))
    result = Image.fromarray(original, 'RGBA')
    details = Image.new('RGBA', (256, 256))
    d = ImageDraw.Draw(details)
    zipper_top = int(max(start+3, bottom-4))
    zipper_bottom = 182
    if zipper_bottom > zipper_top+9:
        for side in (-1, 1):
            collar = [(cx+side*3, zipper_top), (cx+side*19, zipper_top+3), (cx+side*10, zipper_top+15)]
            d.polygon(collar, fill=(159, 98, 53, 230), outline=(86, 51, 29, 220))
        d.line((cx, zipper_top, cx, zipper_bottom), fill=(65, 39, 24, 230), width=3)
        d.line((cx+2, zipper_top+2, cx+2, zipper_bottom-2), fill=(180, 139, 76, 215), width=1)
        for side in (-1, 1):
            px = cx + side * 22
            py = min(170, zipper_top+20)
            d.line((px-11, py, px-11, min(py+14, 181), px+11, min(py+13, 181), px+11, py-2), fill=(98, 56, 29, 190), width=2)
            d.line((px-11, py, px+11, py-2), fill=(84, 50, 27, 210), width=2)
            d.line((px-10, py+1, px+10, py+2), fill=(179, 111, 58, 180), width=1)
            d.ellipse((px-2, py-1, px+2, py+3), fill=(193, 153, 88, 235))
    detail_alpha = np.asarray(details.getchannel('A')).astype(np.float32)
    details.putalpha(Image.fromarray(np.uint8(detail_alpha * alpha), 'L'))
    result.alpha_composite(details)
    return result


def clean_top(base_cell, target, item):
    original = np.asarray(base_cell.convert('RGBA')).copy()
    (left, right), (top, _) = head_box(np.asarray(target.convert('RGB')))
    width = right - left
    cx = (left + right) / 2
    neck = max(120, top + width * .9)
    head_bottom = max(137, top + width * 1.14)
    hem = min(190, neck + (59 if item == 'olive-plain-tee' else 68))
    x, y = np.arange(256)[None, :], np.arange(256)[:, None]
    bare_skin = skin(original[..., :3])
    core = (x > cx-48) & (x < cx+51)
    arm = ~core & (x > cx-78) & (x < cx+77)
    sleeve_end = neck + (32 if item == 'olive-plain-tee' else 62)
    area = bare_skin & (y > neck) & (y < hem) & (core | (arm & (y < sleeve_end)))
    area = np.asarray(Image.fromarray((area * 255).astype('uint8'), 'L').filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(3))) > 0
    face = (x > left-12) & (x < right+18) & (y < head_bottom-7)
    area &= ~face
    area &= (y > neck) & (y < hem) & (original[..., 3] > 80)
    alpha = np.asarray(Image.fromarray((area * 255).astype('uint8'), 'L').filter(ImageFilter.GaussianBlur(.45))).astype(np.float32) / 255
    base_color = PALETTE[item].astype(np.float32)
    shade = -4 * ((x-cx)/95)**2 - 2 * (y-neck)/80
    fabric = np.stack((base_color[0]+shade, base_color[1]+shade, base_color[2]+shade), axis=2)
    original[..., :3] = np.uint8(np.clip(original[..., :3]*(1-alpha[..., None])+fabric*alpha[..., None], 0, 255))
    result = Image.fromarray(original, 'RGBA')
    details = Image.new('RGBA', (256, 256))
    d = ImageDraw.Draw(details)
    seam = int(max(neck+5, head_bottom-7))
    if item == 'olive-plain-tee':
        d.arc((cx-16, seam-7, cx+16, seam+9), 10, 170, fill=(51, 58, 41, 200), width=2)
        d.line((cx-34, hem-4, cx+34, hem-4), fill=(70, 77, 54, 145), width=1)
    elif item == 'cream-cable-knit':
        d.arc((cx-17, seam-7, cx+17, seam+9), 5, 175, fill=(174, 156, 123, 200), width=2)
        for dx in (-16, -6, 6, 16):
            for yy in range(seam+8, int(hem-5), 11):
                d.arc((cx+dx-4, yy, cx+dx+4, yy+10), 40, 320, fill=(182, 164, 132, 100), width=1)
    elif item == 'charcoal-turtleneck':
        d.arc((cx-17, seam-8, cx+17, seam+6), 5, 175, fill=(39, 42, 43, 220), width=3)
        d.line((cx-16, seam+4, cx+16, seam+4), fill=(95, 98, 98, 120), width=1)
    elif item == 'blue-swordsman-jacket':
        d.line((cx, seam, cx, hem-3), fill=(189, 151, 78, 230), width=2)
        for side in (-1, 1):
            d.line((cx+side*4, seam, cx+side*19, seam+14, cx+side*11, seam+19), fill=(191, 153, 78, 220), width=2)
            d.line((cx+side*12, hem-15, cx+side*32, hem-15), fill=(174, 140, 77, 180), width=2)
        d.line((cx-31, hem-7, cx+31, hem-7), fill=(179, 143, 75, 190), width=2)
    elif item == 'sunburst-hoodie':
        d.arc((cx-22, seam-13, cx+22, seam+14), 2, 178, fill=(30, 29, 28, 220), width=3)
        d.line((cx-5, seam+4, cx-5, seam+19), fill=(158, 155, 148, 190), width=1)
        d.line((cx+5, seam+4, cx+5, seam+19), fill=(158, 155, 148, 190), width=1)
    elif item == 'black-blazer-hoodie':
        d.arc((cx-18, seam-10, cx+18, seam+12), 0, 180, fill=(24, 23, 23, 220), width=3)
        for side in (-1, 1):
            d.line((cx+side*3, seam, cx+side*20, seam+15, cx+side*10, seam+28), fill=(89, 87, 84, 190), width=2)
            for yy in (seam+31, seam+43):
                d.ellipse((cx+side*13-2, yy-2, cx+side*13+2, yy+2), fill=(117, 112, 103, 210))
    detail_alpha = np.asarray(details.getchannel('A')).astype(np.float32)
    details.putalpha(Image.fromarray(np.uint8(detail_alpha * alpha), 'L'))
    result.alpha_composite(details)
    return result


def make_cell(source, target, base_cell, item):
    if item == 'white-fedora':
        target_rgb = np.asarray(target.convert('RGB'))
        (left, right), (top, bottom) = head_box(target_rgb)
        cx = (left + right) / 2
        width = right - left
        crown_top = max(5, top - width * .25)
        brim_y = max(18, top + width * .13)
        hat = Image.new('RGBA', (256, 256))
        d = ImageDraw.Draw(hat)
        d.ellipse((cx-width*.78, brim_y-5, cx+width*.78, brim_y+10), fill=(213, 212, 209, 255), outline=(102, 101, 98, 255), width=2)
        d.polygon([(cx-width*.48, brim_y+2), (cx-width*.38, crown_top), (cx+width*.36, crown_top), (cx+width*.47, brim_y+2)], fill=(241, 240, 236, 255))
        d.line([(cx-width*.45, brim_y-6), (cx+width*.45, brim_y-6)], fill=(46, 44, 43, 255), width=5)
        d.line([(cx-width*.46, brim_y+2), (cx+width*.46, brim_y+2)], fill=(172, 170, 165, 255), width=2)
        composed = base_cell.copy()
        composed.alpha_composite(hat)
        return composed
    if item == 'brown-leather-bomber':
        return clean_bomber(base_cell, target)
    if item in ('cream-cable-knit', 'charcoal-turtleneck', 'blue-swordsman-jacket', 'sunburst-hoodie', 'black-blazer-hoodie'):
        return clean_top(base_cell, target, item)
    aligned = aligned_source(source, target)
    mask = garment_mask(np.asarray(aligned.convert('RGB')), target, item)
    if np.count_nonzero(np.asarray(mask) > 128) < 400:
        return clean_top(base_cell, target, item)
    fabric_rgb = clean_fabric(mask, item)
    alpha = np.asarray(mask.filter(ImageFilter.GaussianBlur(.45)))
    clothing = Image.fromarray(np.dstack((fabric_rgb, alpha)), 'RGBA')
    result = base_cell.copy()
    result.alpha_composite(clothing)
    (left, right), (top, _) = head_box(np.asarray(target.convert('RGB')))
    width = right-left
    cx = (left+right)/2
    bottom = max(140, top+width*1.05)
    head_region = Image.new('L', (256, 256))
    ImageDraw.Draw(head_region).ellipse((cx-width*.85-10, top-20, cx+width*.85+10, bottom+5), fill=255)
    head_region = head_region.filter(ImageFilter.GaussianBlur(1.5))
    return Image.composite(base_cell, result, head_region)


for item in ITEMS:
    for pose, (filename, cell) in POSES.items():
        source = Image.open(ART / f'{item}-{pose}-fit-smooth.png').convert('RGB') if item == 'olive-plain-tee' else None
        target = Image.open(ART / f'{pose}-target-4x2.png').convert('RGB')
        base = Image.open(OUT / filename).convert('RGBA')
        strip = Image.new('RGBA', (cell * 8, cell))
        qa = Image.new('RGBA', (cell * 8, cell))
        for i in range(8):
            box = ((i % 4) * 256, 256 + (i // 4) * 256, (i % 4 + 1) * 256, 256 + (i // 4 + 1) * 256)
            original_cell = base.crop((i * cell, 0, (i + 1) * cell, cell))
            original_256 = original_cell.resize((256, 256), Image.Resampling.LANCZOS) if cell != 256 else original_cell
            original_256 = clean_white_fringe(original_256)
            fitted = make_cell(source_frame(source, i) if source else None, target.crop(box), original_256, item)
            if cell != 256:
                fitted = fitted.resize((cell, cell), Image.Resampling.LANCZOS)
            strip.alpha_composite(fitted, (i * cell, 0))
            qa.alpha_composite(fitted, (i * cell, 0))
        dest = OUT / f'eddy-{item}-{pose}-v1.webp'
        strip.save(dest, 'WEBP', lossless=True, method=6)
        qa.save(QA / f'{item}-{pose}-qa.png')
        assert strip.getchannel('A').getbbox(), dest
        print(dest.relative_to(ROOT))

for pose, (filename, _) in POSES.items():
    bare = np.asarray(Image.open(OUT / filename).convert('RGBA')).astype(np.int16)
    hatted = np.asarray(Image.open(OUT / f'eddy-white-fedora-{pose}-v1.webp').convert('RGBA')).astype(np.int16)
    hat_mask = np.any(np.abs(hatted - bare) > 2, axis=2)
    hat_mask &= np.arange(hatted.shape[0])[:, None] < int(hatted.shape[0]*.48)
    for item in ITEMS:
        if item == 'white-fedora':
            continue
        dressed = np.asarray(Image.open(OUT / f'eddy-{item}-{pose}-v1.webp').convert('RGBA')).copy()
        dressed[hat_mask] = hatted[hat_mask].astype(np.uint8)
        dest = OUT / f'eddy-{item}-white-fedora-{pose}-v1.webp'
        Image.fromarray(dressed, 'RGBA').save(dest, 'WEBP', lossless=True, method=6)
        print(dest.relative_to(ROOT))
