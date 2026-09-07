from pathlib import Path
import sys
root=Path(sys.argv[1]);count=0
for page in root.rglob('*.html'):
 text=page.read_text(encoding='utf-8')
 if 'study-support.mjs' in text:continue
 if '</body>' not in text:continue
 text=text.replace('</body>','<script type="module" src="/study-support.mjs?v=20260907-study4"></script></body>')
 page.write_text(text,encoding='utf-8');count+=1
print(f'Added teaching highlighter to {count} Paper 3 readers')
