#!/usr/bin/env python3
"""B&W dithering art pipeline for project covers.

Turns any image into dithered black & white art (transparent paper, ink
pixels only) so it can sit on any card background. Dark mode flips the ink
with CSS invert(1).

Usage:
  python scripts/dither.py <input> <output.png> [--algo bayer|fs] [--levels 1|2|3] [--width 720] [--aspect 4:3]

  --algo bayer   ordered Bayer 8x8 thresholding (crisp, retro print look) [default]
  --algo fs      Floyd-Steinberg error diffusion (soft engraving look)
  --levels 1     pure black ink, no gray
  --levels 2     black + mid-gray inks (richer, "dither art" standard) [default]
  --levels 3     black + dark-gray + light-gray inks

Output: transparent-background PNG (paper = alpha 0). Ink pixels come from
the zinc scale: black #000000, grays 150 and 205.
"""
import argparse
import sys

from PIL import Image, ImageOps

# Bayer 8x8 ordered-dither matrix, normalized to [0, 1)
BAYER8 = [
    [0, 48, 12, 60, 3, 51, 15, 63],
    [32, 16, 44, 28, 35, 19, 47, 31],
    [8, 56, 4, 52, 11, 59, 7, 55],
    [40, 24, 36, 20, 43, 27, 39, 23],
    [2, 50, 14, 62, 1, 49, 13, 61],
    [34, 18, 46, 30, 33, 17, 45, 29],
    [10, 58, 6, 54, 9, 57, 5, 53],
    [42, 26, 38, 22, 41, 25, 37, 21],
]
BAYER8 = [[v / 64.0 for v in row] for row in BAYER8]

# Ink ramp: level index -> gray value (0 = black ink). Paper is implicit.
INKS = {
    1: (0,),
    2: (0, 150),
    3: (0, 150, 205),
}


def parse_aspect(s):
    w, h = s.split(":")
    return int(w), int(h)


def crop_to_aspect(im, aspect):
    tw, th = aspect
    w, h = im.size
    target = tw / th
    cur = w / h
    if cur > target:  # too wide: crop sides
        nw = int(h * target)
        x = (w - nw) // 2
        im = im.crop((x, 0, x + nw, h))
    else:  # too tall: crop top/bottom, keep center
        nh = int(w / target)
        y = (h - nh) // 2
        im = im.crop((0, y, w, y + nh))
    return im


def ordered_dither(gray, inks):
    """Bayer 8x8 thresholding. Returns bytes: ink index, or 255 for paper."""
    w, h = gray.size
    ramp = len(inks) + 1  # inks + paper
    pix = gray.tobytes()
    out = bytearray()
    for y in range(h):
        my = BAYER8[y % 8]
        row = y * w
        for x in range(w):
            pos = pix[row + x] / 255.0 * ramp
            idx = min(int(pos), ramp - 1)
            if pos - idx > my[x % 8]:
                idx = min(idx + 1, ramp - 1)
            out.append(idx if idx < len(inks) else 255)
    return bytes(out)


def floyd_steinberg(gray, inks):
    """Floyd-Steinberg error diffusion (forward scan)."""
    w, h = gray.size
    ramp = len(inks) + 1
    buf = list(gray.tobytes())
    out = bytearray()
    for y in range(h):
        row = y * w
        for x in range(w):
            i = row + x
            pos = buf[i] / 255.0 * ramp
            idx = min(int(pos), ramp - 1)
            out.append(idx if idx < len(inks) else 255)
            err = buf[i] - idx * (255.0 / (ramp - 1)) if ramp > 1 else buf[i]
            if x + 1 < w:
                buf[row + x + 1] += err * 7 / 16
            if y + 1 < h:
                buf[row + w + x] += err * 5 / 16
                if x > 0:
                    buf[row + w + x - 1] += err * 3 / 16
                if x + 1 < w:
                    buf[row + w + x + 1] += err * 1 / 16
    return bytes(out)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("input")
    ap.add_argument("output")
    ap.add_argument("--algo", choices=["bayer", "fs"], default="bayer")
    ap.add_argument("--levels", type=int, choices=[1, 2, 3], default=2)
    ap.add_argument("--width", type=int, default=720)
    ap.add_argument("--aspect", default="4:3")
    ap.add_argument("--contrast-cutoff", type=int, default=2)
    args = ap.parse_args()

    inks = INKS[args.levels]
    aw, ah = parse_aspect(args.aspect)

    im = Image.open(args.input).convert("RGB")
    im = crop_to_aspect(im, (aw, ah))
    im = im.resize((args.width, int(args.width * ah / aw)), Image.LANCZOS)
    gray = ImageOps.autocontrast(im.convert("L"), cutoff=args.contrast_cutoff)

    if args.algo == "bayer":
        data = ordered_dither(gray, inks)
    else:
        data = floyd_steinberg(gray, inks)

    w, h = gray.size
    rgba = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = rgba.load()
    for y in range(h):
        row = y * w
        for x in range(w):
            v = data[row + x]
            if v != 255:
                ink = inks[v]
                px[x, y] = (ink, ink, ink, 255)
    rgba.save(args.output, optimize=True)
    print(f"saved {args.output} ({w}x{h}, algo={args.algo}, levels={args.levels}, "
          f"{'paper+ink' if len(inks) == 1 else 'multi-ink'})")


if __name__ == "__main__":
    sys.exit(main())