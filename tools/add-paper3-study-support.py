from pathlib import Path
import sys
root=Path(sys.argv[1]);count=0
for page in root.rglob('*.html'):
 text=page.read_text(encoding='utf-8')
 if '</body>' not in text:continue
 changed=False
 if 'study-support.mjs' not in text:
  text=text.replace('</body>','<script type="module" src="/study-support.mjs?v=20260907-study4"></script></body>')
  changed=True
 if 'data-reader="2022-b2"' in text and 'EDMUND_2022_B2_CURATION' not in text:
  bundle='<link rel="stylesheet" href="/paper3/2022-b2/super-curation.css?v=20261112-b2v3"><script defer src="/paper3/2022-b2/curation-data.js?v=20261112-b2v3"></script><script defer src="/paper3/2022-b2/super-curation-v3.js?v=20261112-b2v3"></script><script defer src="/shared-system-nav.js?v=20261111-student-autoentry2"></script><script type="module" src="/paper3-writing-reader.mjs?v=20260906-classroom2"></script>'
  text=text.replace('</head>',bundle+'</head>')
  worker='https://edmund-neural-audio.edmundeducation.workers.dev'
  text=text.replace("connect-src 'self'",f"connect-src 'self' {worker}").replace("object-src 'none'",f"media-src 'self' {worker}; object-src 'none'")
  changed=True
 if changed:
  page.write_text(text,encoding='utf-8');count+=1
print(f'Added teaching highlighter to {count} Paper 3 readers')
