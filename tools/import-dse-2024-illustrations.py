#!/usr/bin/env python3
"""Extract original illustrations; coordinates were visually audited on 1050px page previews.
Usage: python import-dse-2024-illustrations.py '/path/to/2024 Speaking.pdf'
No changes to source text or saved vocabulary keys.
"""
import hashlib, json, sys
from pathlib import Path
from pypdf import PdfReader
ROOT = Path(__file__).resolve().parents[1]
# set, page, crop on the proportional 1050px preview, segment, position, size, description, visual count
CROPS = [
('1.1',48,(65,399,285,520),0,'left','photo','Visitors viewing the Mona Lisa in a museum',1),
('1.1',48,(456,567,611,696),2,'right','photo','Mona Lisa augmented reality portrait',1),
('1.3',44,(427,355,589,475),0,'right','photo','Hong Kong Cultural Centre beside Victoria Harbour',1),
('2.2',40,(380,469,581,648),2,'right','photo','Driverless tram with labels: see-through top, wooden counters and benches',1),
('3.2',34,(146,592,189,624),4,'left','icon','News podcast newspaper icon',1),
('3.2',34,(346,591,371,625),6,'left','icon','Storytelling podcast icon',1),
('3.2',34,(539,590,573,625),8,'left','icon','Conversation podcast icon',1),
('3.3',32,(210,444,300,574),2,'right','photo','Blue Fridge community food donation refrigerator',1),
('3.3',32,(436,439,578,537),6,'right','photo','Food Angel volunteers preparing meals',1),
('5.1',24,(420,361,586,595),0,'right','photo','Stars Academy singing competition poster',1),
('5.2',22,(64,405,112,446),1,'left','icon','Artist palette icon',1),
('5.2',22,(69,461,102,502),2,'left','icon','Healthcare shield icon',1),
('5.2',22,(65,517,109,555),3,'left','icon','Construction crane icon',1),
('5.2',22,(64,567,110,624),4,'left','icon','Nature conservation tree and hands icon',1),
('5.2',22,(59,639,106,672),5,'left','icon','Software developer icon',1),
('6.1',18,(58,402,211,493),1,'left','photo','Handwritten hello in English',1),
('6.1',18,(481,499,587,644),2,'right','photo','Chinese calligraphy',1),
('7.1',12,(73,422,220,530),1,'right','photo','Hong Kong Science Museum exhibit',1),
('7.1',12,(266,418,419,529),2,'right','photo','Tai Kwun heritage buildings',1),
('7.1',12,(460,417,619,530),3,'right','photo','Mai Po Nature Reserve wetland',1),
('7.2',10,(412,478,645,655),1,'right','photo','Sleeping pods in a library',1),
('7.3',8,(137,387,585,489),0,'center','wide','Three suggested Cross Harbour Race mascots: orca, lion and turtle',3),
('8.1',6,(462,399,646,540),0,'right','photo','Instant noodle cups',1),
('8.2',4,(534,397,628,693),0,'right','tall','Space tourism icons: rocket, moon and astronaut',3),
('8.3',2,(427,417,639,678),1,'right','photo','Social media shopping post showing shoes and shop buttons',1),
]
def main():
    source = Path(sys.argv[1]); reader = PdfReader(source)
    manifest_path = ROOT / 'dse-speaking-illustration-manifest.js'
    manifest = json.loads(manifest_path.read_text().split('Object.freeze(',1)[1].rsplit(');',1)[0])
    manifest = {k:v for k,v in manifest.items() if not k.startswith('2024:')}
    audit = {'sourceFile':source.name,'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),
             'auditedPages':48,'questionSets':24,'illustratedSets':14,'visualIllustrations':29,'crops':[]}
    counts = {}
    out = ROOT / 'assets/speaking-system/dse-illustrations/2024'
    out.mkdir(parents=True,exist_ok=True)
    for set_id,page,box,segment,position,size,alt,count in CROPS:
        original = reader.pages[page-1].images[0].image.convert('RGB')
        factor = max(original.size)/1050
        bounds = tuple(round(n*factor) for n in box)
        counts[set_id]=counts.get(set_id,0)+1
        file = f'{set_id}-{counts[set_id]}.webp'
        cropped = original.crop(bounds)
        cropped.save(out/file,'WEBP',lossless=True)
        figure = {'src':f'assets/speaking-system/dse-illustrations/2024/{file}','alt':alt,
                  'beforeSegment':segment,'position':position,'size':size,'width':cropped.width,'height':cropped.height}
        manifest.setdefault('2024:'+set_id,{'figures':[]})['figures'].append(figure)
        audit['crops'].append({'set':set_id,'page':page,'sourcePixelBounds':bounds,'sourceImageSize':original.size,
                              'visualCount':count,**figure})
    manifest_path.write_text('window.EDMUND_DSE_SPEAKING_ILLUSTRATIONS = Object.freeze('+json.dumps(manifest,ensure_ascii=False,indent=2)+');\n')
    (ROOT/'tools/dse-2024-illustrations-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
    print(f'Extracted {len(CROPS)} source crops with {sum(c[-1] for c in CROPS)} illustrations in {len(counts)} sets.')
if __name__=='__main__': main()
