"""Keep Elsie's open pose fixed and transfer only registered closed-eye patches.

Elsie's closed-eye source frames are independent full-character redraws.  Their
hair and head silhouettes move enough to create a visible pop when swapped as a
blink.  This post-process finds the blue irises in each open view, registers the
corresponding closed drawing against the surrounding face colour, and copies
only small feathered eye regions onto the exact open frame.
"""
from pathlib import Path
import sys

import numpy as np
from PIL import Image

CELL = 256


def components(mask):
    height, width = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    result = []
    for sy, sx in zip(*np.nonzero(mask)):
        if seen[sy, sx]:
            continue
        stack, points = [(int(sy), int(sx))], []
        seen[sy, sx] = True
        while stack:
            y, x = stack.pop()
            points.append((y, x))
            for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                if 0 <= ny < height and 0 <= nx < width and mask[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    stack.append((ny, nx))
        if 18 <= len(points) <= 110:
            ys, xs = zip(*points)
            if min(ys) >= 76 and max(ys) <= 105:
                result.append((max(0, min(xs) - 12), max(0, min(ys) - 12),
                               min(CELL, max(xs) + 13), min(CELL, max(ys) + 13)))
    return result


def eye_boxes(open_cell):
    red, green, blue, alpha = np.moveaxis(open_cell, -1, 0)
    iris = ((blue > 85) & (blue > red * 1.18) & (blue > green * 1.05)
            & (alpha > 180))
    return components(iris)


def registration(open_cell, closed_cell, boxes):
    x0 = max(0, min(box[0] for box in boxes) - 16)
    y0 = max(0, min(box[1] for box in boxes) - 16)
    x1 = min(CELL, max(box[2] for box in boxes) + 16)
    y1 = min(CELL, max(box[3] for box in boxes) + 16)
    yy, xx = np.mgrid[y0:y1, x0:x1]
    ring = np.ones((y1 - y0, x1 - x0), dtype=bool)
    for bx0, by0, bx1, by1 in boxes:
        ring &= ~((xx >= bx0) & (xx < bx1) & (yy >= by0) & (yy < by1))
    target = open_cell[y0:y1, x0:x1]
    orange = ((target[:, :, 0] > 95)
              & (target[:, :, 0] > target[:, :, 1].astype(float) * 1.3))
    best = (float('inf'), 0, 0)
    for dy in range(-16, 17):
        for dx in range(-16, 17):
            sy0, sy1, sx0, sx1 = y0 + dy, y1 + dy, x0 + dx, x1 + dx
            if min(sy0, sx0) < 0 or sy1 > CELL or sx1 > CELL:
                continue
            source = closed_cell[sy0:sy1, sx0:sx1]
            valid = ring & orange & (target[:, :, 3] > 200) & (source[:, :, 3] > 200)
            if valid.sum() < 40:
                continue
            score = np.abs(target[:, :, :3].astype(int) - source[:, :, :3].astype(int))[valid].mean()
            if score < best[0]:
                best = (score, dx, dy)
    return best[1], best[2]


def transfer(open_cell, closed_cell):
    boxes = eye_boxes(open_cell)
    result = open_cell.copy()
    if not boxes:
        return result, None
    dx, dy = registration(open_cell, closed_cell, boxes)
    for x0, y0, x1, y1 in boxes:
        source = closed_cell[y0 + dy:y1 + dy, x0 + dx:x1 + dx]
        height, width = y1 - y0, x1 - x0
        yy, xx = np.mgrid[:height, :width]
        edge = np.minimum.reduce((xx + 1, width - xx, yy + 1, height - yy)).astype(float)
        weight = np.clip(edge / 6, 0, 1) * (source[:, :, 3].astype(float) / 255)
        target = result[y0:y1, x0:x1, :3].astype(float)
        result[y0:y1, x0:x1, :3] = np.rint(target * (1 - weight[:, :, None])
                                                   + source[:, :, :3] * weight[:, :, None]).astype(np.uint8)
    return result, (dx, dy, len(boxes))


def build(open_path, closed_path, output_path):
    opened = np.array(Image.open(open_path).convert('RGBA'))
    closed = np.array(Image.open(closed_path).convert('RGBA'))
    if opened.shape != (1024, 1024, 4) or closed.shape != opened.shape:
        raise ValueError('expected matching 1024-square RGBA atlases')
    output = opened.copy()
    for index in range(16):
        row, column = divmod(index, 4)
        ys, xs = slice(row * CELL, (row + 1) * CELL), slice(column * CELL, (column + 1) * CELL)
        output[ys, xs], details = transfer(opened[ys, xs], closed[ys, xs])
        if details:
            print(f'view {index}: offset {details[0]:+d},{details[1]:+d}; {details[2]} eye patch(es)')
    Image.fromarray(output, 'RGBA').save(output_path, optimize=True)


if __name__ == '__main__':
    if len(sys.argv) != 4:
        raise SystemExit('usage: register-elsie-blink.py OPEN_ATLAS SOURCE_BLINK_ATLAS OUTPUT_BLINK_ATLAS')
    build(Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]))
