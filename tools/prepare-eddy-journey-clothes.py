"""Build Eddy journey wardrobe strips from the existing detailed fitted models.

The fitting sheets contain complete pose-specific Eddy renders with the original
wardrobe designs. This builder removes their light matte without repainting
fabric or mixing two different body renderings. Fedora pixels come from the
existing transparent cosmetics model.
"""
from collections import deque
from pathlib import Path
import os

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'tools/mascot-art/wardrobe/eddy-journey'
OUT = ROOT / 'assets/sentence-structure/exercise-eddy'
MODEL = ROOT / 'assets/speaking-system/cosmetics/eddy'
QA = Path(os.environ.get('EDDY_JOURNEY_QA', '/tmp/eddy-journey-qa'))
QA.mkdir(parents=True, exist_ok=True)
POSES = {
    'walk': ('eddy-walk-v2.webp', 224),
    'jump': ('eddy-jump-v3.webp', 256),
    'encourage': ('eddy-encourage-v2.webp', 256),
}
TOPS = (
    'olive-plain-tee', 'cream-cable-knit', 'charcoal-turtleneck',
    'blue-swordsman-jacket', 'brown-leather-bomber', 'sunburst-hoodie',
    'black-blazer-hoodie',
)


def skin(rgb):
    r, g, b = (rgb[..., i].astype(np.int16) for i in range(3))
    return (r > 80) & (r-g > 25) & (g-b > 8) & (g > 32)


def head_box(rgb):
    selected = skin(rgb)
    selected[125:] = False
    yy, xx = np.where(selected)
    if len(xx) < 100:
        raise ValueError('Cannot register Eddy head')
    return np.percentile(xx, [3, 97]), np.percentile(yy, [3, 97])


def source_frame(sheet, index):
    """Crop a figure from the generated 4x2 fitting sheet."""
    row, col = divmod(index, 4)
    side = sheet.width / 4
    x0 = col * side
    column = np.asarray(sheet.crop((x0, 0, x0+side, sheet.height)).convert('RGB'))
    skin_rows = skin(column)
    if row == 0:
        skin_rows[int(sheet.height*.51):] = False
    else:
        skin_rows[:int(sheet.height*.49)] = False
    yy, _ = np.where(skin_rows)
    if len(yy) < 100:
        raise ValueError(f'Cannot locate source figure {index}')
    y0 = float(np.clip(np.percentile(yy, 3)-45, 0, sheet.height-side))
    return sheet.crop((x0, y0, x0+side, y0+side)).resize((256, 256), Image.Resampling.LANCZOS)


def align_to_target(source, target):
    """Register the model's head to the matching canonical animation frame."""
    (sx, sy), (tx, ty) = head_box(np.asarray(source)), head_box(np.asarray(target))
    x_scale = float(np.clip((tx[1]-tx[0])/(sx[1]-sx[0]), .84, 1.16))
    y_scale = float(np.clip((ty[1]-ty[0])/(sy[1]-sy[0]), .80, 1.20))
    scx, scy, tcx, tcy = sx.mean(), sy.mean(), tx.mean(), ty.mean()
    matrix = (1/x_scale, 0, scx-tcx/x_scale, 0, 1/y_scale, scy-tcy/y_scale)
    return source.transform((256, 256), Image.Transform.AFFINE, matrix,
                            resample=Image.Resampling.BICUBIC, fillcolor=(245, 245, 245))


def connected_components(binary):
    seen = np.zeros_like(binary)
    for seed_y, seed_x in np.argwhere(binary):
        if seen[seed_y, seed_x]:
            continue
        component = [(int(seed_y), int(seed_x))]
        seen[seed_y, seed_x] = True
        for yy, xx in component:
            for y2, x2 in ((yy-1, xx), (yy+1, xx), (yy, xx-1), (yy, xx+1)):
                if 0 <= y2 < 256 and 0 <= x2 < 256 and binary[y2, x2] and not seen[y2, x2]:
                    seen[y2, x2] = True
                    component.append((y2, x2))
        yield component


def character_cutout(source, target):
    """Remove the fitting sheet background and edge matte, retaining model art."""
    rgb = np.asarray(source.convert('RGB')).astype(np.int16)
    pale_neutral = (rgb.min(axis=2) > 160) & ((rgb.max(axis=2)-rgb.min(axis=2)) < 23)
    exterior = np.zeros((256, 256), dtype=bool)
    queue = deque()
    for xx in range(256):
        for yy in (0, 255):
            if pale_neutral[yy, xx] and not exterior[yy, xx]:
                exterior[yy, xx] = True
                queue.append((yy, xx))
    for yy in range(256):
        for xx in (0, 255):
            if pale_neutral[yy, xx] and not exterior[yy, xx]:
                exterior[yy, xx] = True
                queue.append((yy, xx))
    while queue:
        yy, xx = queue.popleft()
        for y2, x2 in ((yy-1, xx), (yy+1, xx), (yy, xx-1), (yy, xx+1)):
            if 0 <= y2 < 256 and 0 <= x2 < 256 and pale_neutral[y2, x2] and not exterior[y2, x2]:
                exterior[y2, x2] = True
                queue.append((y2, x2))
    foreground = ~exterior
    (_, _), (_, face_bottom) = head_box(np.asarray(target.convert('RGB')))
    # The whites of Eddy's eyes are enclosed by his face. Below his face,
    # light neutral pixels are the old backdrop, including between his legs.
    lower = int(face_bottom+16)
    foreground[lower:] &= ~pale_neutral[lower:]
    deep = int(face_bottom+45)
    lower_matte = (rgb.min(axis=2) > 125) & ((rgb.max(axis=2)-rgb.min(axis=2)) < 38)
    foreground[deep:] &= ~lower_matte[deep:]
    components = list(connected_components(foreground))
    if not components:
        raise ValueError('Empty character cutout')
    largest = max(components, key=len)
    foreground[:] = False
    for yy, xx in largest:
        foreground[yy, xx] = True
    mask = Image.fromarray(np.uint8(foreground)*255, 'L')
    mask = mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(5))
    mask = mask.filter(ImageFilter.GaussianBlur(.45))
    alpha = np.asarray(mask).copy()
    alpha[deep:] = np.where(lower_matte[deep:], 0, alpha[deep:])
    pixels = np.asarray(source.convert('RGBA')).copy()
    # Copy colors from inside the silhouette to antialiased edge pixels.
    interior = alpha > 250
    nearest_y = np.full((256, 256), -1, dtype=np.int16)
    nearest_x = np.full((256, 256), -1, dtype=np.int16)
    queue = deque()
    for yy, xx in np.argwhere(interior):
        yy, xx = int(yy), int(xx)
        nearest_y[yy, xx], nearest_x[yy, xx] = yy, xx
        queue.append((yy, xx))
    while queue:
        yy, xx = queue.popleft()
        for y2, x2 in ((yy-1, xx), (yy+1, xx), (yy, xx-1), (yy, xx+1)):
            if 0 <= y2 < 256 and 0 <= x2 < 256 and nearest_y[y2, x2] < 0:
                nearest_y[y2, x2] = nearest_y[yy, xx]
                nearest_x[y2, x2] = nearest_x[yy, xx]
                queue.append((y2, x2))
    edge_y, edge_x = np.where((alpha > 0) & (alpha < 251))
    pixels[edge_y, edge_x, :3] = pixels[nearest_y[edge_y, edge_x], nearest_x[edge_y, edge_x], :3]
    pixels[..., 3] = alpha
    return Image.fromarray(pixels, 'RGBA')


def original_fedora(head_reference):
    """Fit the existing transparent wardrobe fedora to this frame."""
    model_body = Image.open(MODEL / 'body-front.webp').convert('RGB').crop((0, 0, 256, 256))
    model_hat = Image.open(MODEL / 'white-fedora.webp').convert('RGBA').crop((0, 0, 256, 256))
    pixels = np.asarray(model_hat).copy()
    r, g, b = (pixels[..., i].astype(np.int16) for i in range(3))
    neutral = (abs(r-g) < 15) & (abs(g-b) < 15) & (r > 24)
    pixels[..., 3] = np.where(neutral, pixels[..., 3], 0)
    model_hat = Image.fromarray(pixels, 'RGBA')
    (sx, sy), (tx, ty) = head_box(np.asarray(model_body)), head_box(np.asarray(head_reference.convert('RGB')))
    scale = float((tx[1]-tx[0])/(sx[1]-sx[0]))
    scx, scy, tcx, tcy = sx.mean(), sy.mean(), tx.mean(), ty.mean()
    matrix = (1/scale, 0, scx-tcx/scale, 0, 1/scale, scy-tcy/scale)
    return model_hat.transform((256, 256), Image.Transform.AFFINE, matrix,
                               resample=Image.Resampling.BICUBIC)


def write_strip(item, pose, cells, cell_size):
    strip = Image.new('RGBA', (cell_size*8, cell_size))
    qa = Image.new('RGBA', (cell_size*8, cell_size))
    for index, image in enumerate(cells):
        if cell_size != 256:
            image = image.resize((cell_size, cell_size), Image.Resampling.LANCZOS)
        strip.alpha_composite(image, (index*cell_size, 0))
        qa.alpha_composite(image, (index*cell_size, 0))
    assert strip.getchannel('A').getbbox(), (item, pose)
    strip.save(OUT / f'eddy-{item}-{pose}-v1.webp', 'WEBP', lossless=True, method=6)
    qa.save(QA / f'{item}-{pose}-qa.png')


def build():
    for pose, (base_name, cell_size) in POSES.items():
        target_sheet = Image.open(ART / f'{pose}-target-4x2.png').convert('RGB')
        bare_strip = Image.open(OUT / base_name).convert('RGBA')
        targets = [target_sheet.crop(((i % 4)*256, 256+(i//4)*256,
                                      (i % 4+1)*256, 256+(i//4+1)*256)) for i in range(8)]
        bare = [bare_strip.crop((i*cell_size, 0, (i+1)*cell_size, cell_size)).resize((256, 256))
                for i in range(8)]
        hats = [original_fedora(targets[i]) for i in range(8)]
        bare_hatted = []
        for i in range(8):
            image = bare[i].copy()
            image.alpha_composite(hats[i])
            bare_hatted.append(image)
        write_strip('white-fedora', pose, bare_hatted, cell_size)
        for item in TOPS:
            sheet = Image.open(ART / f'{item}-{pose}-fit-smooth.png').convert('RGB')
            dressed, hatted = [], []
            for i in range(8):
                aligned = align_to_target(source_frame(sheet, i), targets[i])
                image = character_cutout(aligned, targets[i])
                dressed.append(image)
                with_hat = image.copy()
                with_hat.alpha_composite(original_fedora(aligned))
                hatted.append(with_hat)
            write_strip(item, pose, dressed, cell_size)
            write_strip(f'{item}-white-fedora', pose, hatted, cell_size)


if __name__ == '__main__':
    build()
