"""Build the idempotent database seed for the Repulse Bay pigeon topic."""
import base64
import json
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
target = Path(sys.argv[1])
content_path = Path('/tmp/policy-discussion-pigeon-content.json')
subprocess.run([sys.executable, str(root / 'tools/build-policy-discussion-pigeon.py'), str(content_path)], check=True)
content = json.dumps(json.loads(content_path.read_text()), ensure_ascii=False, separators=(',', ':'))
image = base64.b64encode((root / 'tools/content-sources/policy-repulse-bay-pigeon.png').read_bytes()).decode()

title = '淺水灣泳灘野鴿聚集 遊客撒糧捉鴿合照'
brief = '網上流傳影片顯示，多名男女及兒童在淺水灣泳灘違規餵飼野鴿，引來大批鴿群聚集。一名約10歲男童更徒手捕捉野鴿，讓同行女子拍照，隨後將鴿子拋高放生，期間有羽毛掉落。**不少網民估計涉事人士是參加旅遊團的內地遊客**，猛烈批評其缺乏公共衞生及動物保護意識，並擔心接觸野鴿可能增加疾病傳播風險。根據香港現行法例，非法餵飼野鴿可被處以5,000港元定額罰款，最高刑罰為罰款10萬元及監禁一年。'
source_url = 'https://www.stheadline.com/breaking-news/3639689/'

sql = f"""begin;

do $seed$
declare
  v_id uuid;
  v_content jsonb := $content${content}$content$::jsonb;
  v_image bytea := decode($image${image}$image$, 'base64');
begin
  select id into v_id
  from public.policy_discussion_articles
  where title = $title${title}$title$ and deleted_at is null
  order by created_at
  limit 1;

  if v_id is null then
    insert into public.policy_discussion_articles(
      title, brief, source_url, content, image_mime, image_bytes, hidden, sort_order
    ) values (
      $title${title}$title$,
      $brief${brief}$brief$,
      $url${source_url}$url$,
      v_content,
      'image/png',
      v_image,
      false,
      (select coalesce(min(sort_order), 0) - 1 from public.policy_discussion_articles)
    ) returning id into v_id;
  else
    update public.policy_discussion_articles
    set brief = $brief${brief}$brief$,
        source_url = $url${source_url}$url$,
        content = v_content,
        image_mime = 'image/png',
        image_bytes = v_image,
        hidden = false,
        updated_at = now()
    where id = v_id;
  end if;
end;
$seed$;

commit;
"""

if len(sql.encode()) > 950_000:
    raise ValueError('Migration is too large for the deployment API')
target.write_text(sql)
print(f'Wrote {target} ({len(sql.encode())} bytes).')
