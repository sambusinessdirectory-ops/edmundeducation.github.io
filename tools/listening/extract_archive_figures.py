"""Extract only figure regions from the reviewed Part A page renders (no question text)."""
from pathlib import Path
from PIL import Image
import io
import subprocess

target = Path(__file__).resolve().parents[2] / 'assets/dse-listening'
archive = Path("/Volumes/(Pro-G) Sam's Data/Downloads SSD")
pdfs = {
  2012: archive / 'DSE/2012/2012 DSE English Language Paper 3A.pdf',
  2013: archive / 'DSE/2013/paper 3/2013-DSE-ENG-LANG-3-A.pdf',
  2014: archive / 'DSE/2014/paper 3/2014-DSE-ENG-LANG-3-A.pdf',
  2015: archive / 'DSE/2015/paper 3/2015 DSE Paper 3A QA.pdf',
  2018: archive / '2018 Paper 3.pdf',
  2020: archive / 'Paper 3 DSE Past Papers/2020 Paper 3.pdf',
}
# Coordinates refer to the 1191 x 1684 review renders; scaling handles small rounding differences.
figures = {
  2012: [('page-4.jpg','school-home-photos',(174,540,1008,723)),('page-5.jpg','school-student-photos',(158,607,1006,801))],
  2013: [('page-5.jpg','lounge-plan',(164,184,1040,1070)),('page-6.jpg','food-hotdog',(265,413,410,506)),('page-6.jpg','food-skewers',(227,566,445,712)),('page-6.jpg','food-sushi',(262,774,418,877)),('page-6.jpg','food-wraps',(247,912,431,1052)),('page-6.jpg','food-cupcake',(280,1092,407,1245)),('page-6.jpg','food-drink',(294,1288,377,1432))],
  2014: [('page-6.jpg','wild-boar',(468,1028,703,1253))],
  2015: [('page-04.jpg','logo-options',(128,753,1024,992)),('page-07.jpg','liberty-sisters',(774,253,1040,533)),('page-07.jpg','selena-cheung',(908,698,1023,885)),('page-07.jpg','hilton-band',(122,1026,388,1262))],
  2018: [('page-06.jpg','games-painting',(264,905,898,1330)),('page-07.jpg','art-video-games',(156,224,984,588))],
  2020: [('page-05.jpg','campsite-diagram',(480,419,1038,864)),('page-06.jpg','trench-diagram',(141,633,987,1116)),('page-08.jpg','expedition-ship',(751,299,1032,582)),('page-07.jpg','animal-1',(141,274,357,390)),('page-07.jpg','animal-2',(500,257,653,410)),('page-07.jpg','animal-3',(797,257,954,380)),('page-07.jpg','animal-4',(148,438,348,572)),('page-07.jpg','animal-5',(490,441,662,580)),('page-07.jpg','animal-6',(810,425,958,583))]
}
for year, entries in figures.items():
    (target / str(year)).mkdir(parents=True, exist_ok=True)
    pages = {}
    for filename, name, rect in entries:
        # Re-render the source PDF region at 300 dpi instead of enlarging a JPEG preview.
        # No generative redraw, denoising, or invented edges: preserve the exact source pixels.
        page_number = str(int(filename.split('-')[1].split('.')[0]))
        if page_number not in pages:
            result = subprocess.run(['pdftoppm', '-f', page_number, '-l', page_number,
                '-scale-to-x', '2481', '-scale-to-y', '3508', '-singlefile', '-png', str(pdfs[year])],
                check=True, capture_output=True)
            pages[page_number] = Image.open(io.BytesIO(result.stdout)).convert('RGB')
        im = pages[page_number]
        box = tuple(round(v * (im.width / 1191 if i % 2 == 0 else im.height / 1684)) for i,v in enumerate(rect))
        im.crop(box).save(target / str(year) / (name + '.webp'), lossless=True)
        print(year, name)
