"""Source-checked native document layouts for the 2013 Asia Life B2 paper."""
from html import escape
from pathlib import Path
import re

BASE = Path(__file__).resolve().parent
ROOT = BASE / 'layouts'
RAW = (BASE / 'source/2013-b2-df-clean.txt').read_text(encoding='utf-8')
PAGES = {}
for number, chunk in re.findall(r'PDF PAGE (\d+) / PRINTED PAGE \d+\n=+\n(.*?)(?=\n=+\nPDF PAGE|\Z)', RAW, re.S):
    PAGES[int(number)] = [''] + [p.strip() for p in re.split(r'\n\s*\n', chunk) if p.strip() and not p.strip().startswith(('Provided by', '2013-DSE-'))]

def put(n, body):
    (ROOT / f'2013-b2-page-{n:02}.html').write_text(body.rstrip() + '\n', encoding='utf-8')

def norm(s):
    return re.sub(r'\s+', ' ', s.strip())

def bi(en, zh):
    return f'<div class="bilingual"><p lang="en">{escape(norm(en))}</p><p class="translation" lang="zh-Hant">{escape(zh)}</p></div>'

def answer(n, key, label, height=570):
    ident=f'2013-b2-{n}-{key}'
    return f'<label class="answer-field" for="{ident}">{escape(label)}</label><textarea id="{ident}" class="answer-box" data-note="{n}-{key}" data-count-id="{ident}" style="min-height:{height}px" aria-label="{escape(label,quote=True)}"></textarea><p class="answer-count" data-count-for="{ident}">0 words</p>'

cover=(ROOT/'2012-b2-page-01.html').read_text().replace('2012','2013')
put(1,cover.replace('2013 DSE Paper 3 Part B1 Data File cover','2013 DSE Paper 3 Part B2 Data File cover'))

p=PAGES[1]
sit_zh=[
 '你是 Marty Poon，在《Asia Life》雜誌工作，擔任負責編輯 Casey Wong 的助理。',
 '你將聆聽播客《Travel Report》，其中有 Adrian Lim 和 Kelly Johnson 的訪問。',
 '錄音前有五分鐘閱讀乙部一及乙部二的問答冊和資料檔；只須選答其中一部，不要兩部都做。',
 '按照所選問答冊及錄音的指示完成任務。所需資料在問答冊、資料檔和錄音中；聆聽時可在資料檔第 3 頁記筆記。',
 '現在有五分鐘熟悉乙部問答冊和資料檔。']
toc=[(3,'Listening note-taking sheet for podcast of Travel Report show'),(4,'Email from Casey Wong to Marty Poon'),(5,'Minutes from editorial meeting at Asia Life magazine'),(6,'2013 Writers’ Guidelines for Publication'),(7,'Notes from the editorial team on Queenie Lau’s article'),(8,'Transcript excerpt of TV travel show See the World'),(9,'Travel forum thread: tourism and local people'),(10,'Interview notes from interview with Mei Cheng'),(10,'Letter printed from Kevin Hui in Asia Life magazine March issue'),(11,'New Territories Historian blog page')]
put(2,'<section class="recreated-page situation-page" aria-label="Asia Life situation and contents"><div class="situation-box"><h2>Part B</h2><h3>Situation</h3>'+''.join(bi(en,zh) for en,zh in zip(p[3:8],sit_zh))+'</div><div class="contents-box"><h3>Contents</h3><ol>'+''.join(f'<li><a href="#page-{n}">{escape(title)} <span>{n}</span></a></li>' for n,title in toc)+'</ol></div></section>')

notes=[('Why people travel','人們旅遊的原因'),('Information about travel and tourism in the past','昔日旅遊資訊'),('Unusual hotels','獨特的酒店'),('Effects of travel and tourism','旅遊的影響')]
fields=''.join(f'<h3>{escape(en)}</h3><p class="translation" lang="zh-Hant">{zh}</p><textarea data-note="3-{i}" rows="4" aria-label="Notes: {escape(en,quote=True)}"></textarea>' for i,(en,zh) in enumerate(notes,1))
stat='<h3>Adrian’s statistics</h3><p class="translation" lang="zh-Hant">Adrian 的統計資料</p><div class="table-scroll"><table><thead><tr><th>Country</th><th>Number of visitors</th></tr></thead><tbody><tr><th>India</th><td>76 million</td></tr><tr><th>China</th><td>59 million</td></tr></tbody></table></div><textarea data-note="3-statistics" rows="3" aria-label="Additional statistics notes"></textarea>'
fields=fields.replace('<h3>Unusual hotels</h3>',stat+'<h3>Unusual hotels</h3>')
put(3,'<section class="recreated-page conference-notes" aria-label="Travel Report listening note-taking sheet"><h2>Listening note-taking sheet for podcast of <em>Travel Report</em> show</h2><div class="notes-form-body">'+fields+'</div></section>')

p=PAGES[3]
zh={3:'親愛的 Marty：',4:'我們已決定下期雜誌的題目，其中之一是「非一般的旅遊」。我想請你協助完成三項工作。',6:'我們想寫一篇短文，介紹 1920 年代香港的旅遊，題為〈Hong Kong Tourism: The Way It Was〉。請撰文，舉例說明當時的旅遊情況。',7:'可先閱讀我上月訪問 Mei Cheng 的筆記，也別忘了參考《Travel Report》播客筆記。',9:'Queenie Lau 投稿一篇關於泰國整容假期的文章。編輯組審閱後認為她需要核對及修改幾項內容。請電郵告訴她所需修改，並提醒截稿日期。可先看編輯組的評註。',11:'請為下期雜誌撰寫社論，強調旅遊的正面影響。可先參考三月刊登的 Kevin Hui 來信，並提出反駁。社論須包括：',13:'可先閱讀 Kevin Hui 的來信，也別忘了查看播客筆記。',14:'完成後請告訴我。',15:'Casey'}
email='<section class="recreated-page commons-email travel-email" aria-label="Casey Wong email"><h2>Email from Casey Wong to Marty Poon</h2><div class="email-window"><div class="email-headers"><div><strong>To:</strong> Marty Poon</div><div><strong>From:</strong> Casey Wong</div><div><strong>Sent:</strong> 13 April, 2013</div><div><strong>Subject:</strong> Things to do</div></div><div class="email-content">'
for i in range(3,16):
    if i in (5,8,10): email+=f'<h3>{escape(p[i])}</h3>'
    elif i==12:
        email+='<ul>'+''.join(f'<li>{escape(x.removeprefix("• "))}</li>' for x in p[i].splitlines())+'</ul><p class="translation" lang="zh-Hant">包括合適標題、一兩句概述 Kevin Hui 的觀點，以及旅遊對當地人的正面影響。</p>'
    else: email+=bi(p[i],zh[i])
put(4,email+'</div></div></section>')

p=PAGES[4]
mins={7:'會議決定下期雜誌的三個題目：非一般的旅遊、購買新車及夜間課程的好處；主題以非一般的旅遊為主。',9:'JL 將聯絡 Tony Kwok 和 Queenie Lau 邀稿。ML 提醒編輯組遵守 2013 年的新投稿指引。CW 提醒大家鼓勵作者每篇提交 15 至 20 張圖片，再由編輯組選出 5 張刊登。',11:'各人同意截稿日期定為 4 月 30 日。',13:'稿酬每頁港幣 1,000 元，已包括採用的文字及圖片。',15:'下次會議定於 5 月 6 日，讓編輯組有時間閱讀收到的稿件。',17:'VS 說下期文章字數上限為 900 字；將以電郵通知所有作者。'}
items=''
for i in range(4,18,2):
    items+=f'<h4>{escape(p[i])}</h4>'
    if i+1 in mins: items+=bi(p[i+1],mins[i+1])
put(5,'<section class="recreated-page meeting-minutes" aria-label="Asia Life editorial meeting minutes"><h2>Minutes from editorial meeting at <em>Asia Life</em> magazine</h2><div class="meeting-sheet"><h3>Editorial Meeting</h3><dl class="meeting-meta"><dt>Present</dt><dd>James Lee · Casey Wong · Mavis Lam · Vicki Swan</dd><dt>Date</dt><dd>14th March, 2013</dd><dt>Venue</dt><dd>meeting room, 6th Floor</dd></dl>'+items+'</div></section>')

p=PAGES[5]
guidelines=['所有文章必須準時提交，以便編輯組閱讀及提出修改建議；逾期稿件不予考慮。','版權：使用的材料（例如照片）不得侵權，作者須註明圖片來源。','圖片須提交高解像度 JPEG 電子檔。','須按編輯會議為該期訂定的字數上限撰稿；每期可能不同。','標題不得超過 80 個字元。','除非編輯另有指示，文章風格由作者決定。','《Asia Life》保留已刊登文章的權利。','稿件獲接納刊登後才支付稿酬。']
put(6,'<section class="recreated-page travel-guidelines" aria-label="2013 writers guidelines"><h2>2013 Writers’ Guidelines for Publication</h2><div class="memo-sheet"><strong class="memo-label">MEMO</strong><div class="memo-meta"><p><b>To:</b> Editorial team, Asia Life magazine</p><p><b>From:</b> Casey Wong</p><p><b>Date:</b> 1st February, 2013</p><p><b>Subject:</b> 2013 Writers’ Guidelines for Publication</p></div>'+bi(p[4],'以下新投稿指引由 2013 年 2 月 1 日起生效：')+'<ol>'+''.join(f'<li>{bi(re.sub(r"^\d+\. ","",p[i]),zh)}</li>' for i,zh in zip(range(5,13),guidelines))+'</ol></div></section>')

p=PAGES[6]
review=[('Issue','Vol 12 – June 2013'),('Submission reviewed on','5th April, 2013'),('Writer','Queenie Lau'),('Topic','Plastic surgery holidays (Thailand)'),('Reviewer','James Lee'),('No. of words','1200')]
review_html=''.join(f'<div><strong>{escape(k)}:</strong> {escape(v)}</div>' for k,v in review)
put(7,'<section class="recreated-page travel-review" aria-label="Editorial review of Queenie Lau article"><h2>Notes from the editorial team on Queenie Lau’s article</h2><div class="review-sheet"><h3>Editorial team: submitted article comments</h3><div class="review-grid">'+review_html+'</div>'+bi(p[6],'圖片：提醒她提交所需數量、格式及來源。')+bi(p[7],'標題：仍未提供；須遵守字元上限。')+bi(p[8],'字數：1,200 字。須查明該期字數上限，再告訴她。')+'<p class="review-choice">Publish?　☐ Yes　 ☑ Yes (with changes)　 ☐ No</p><h4>Reviewer’s notes:</h4>'+bi(p[11],'請聯絡 Queenie 跟進上述問題，也請她仔細核對泰國地名拼寫，並確認文章所有細節準確。')+'</div></section>')

p=PAGES[7]
trans={3:'我們都聽過學生休學一年四處旅遊，有些人甚至到南美洲與原住民同住一年。如今也有人前往非洲部落居住數星期。我在肯尼亞的 Sauri 村，想了解這種新文化旅遊對當地人的影響。',5:'我現在和 Sauri 的教師 Kemi 一起。你認為旅遊對當地居民有甚麼影響？',6:'整體來說是好事；對 Sauri 大致有正面影響。',7:'真的嗎？這很令人鼓舞。正面影響體現在哪些方面？',8:'例如 Sauri 的居民開始與旅客交流想法。',9:'你是說分享實用知識嗎？',10:'對。去年一位來自土耳其的年輕人 Yusuf 來村裡，協助建立 Sauri 村網站，讓訪客在線上了解村莊。',11:'我聽說有位作家也來過村裡……',12:'對，Jessica Glasser 女士很友善。村裡有深厚的說故事傳統；她與居民一起把故事記錄並出版，讓讀者認識我們的傳統。',13:'聽起來旅遊確實有助你們以實際方式保存文化。'}
turns=''
for i in range(2,14):
    if i in (2,4): turns+=f'<h3>{escape(p[i])}</h3>'
    else:
        speaker,sep,body=p[i].partition(': ')
        if sep: turns+=f'<div class="transcript-turn"><b>{escape(speaker)}</b>{bi(body,trans[i])}</div>'
        else: turns+=bi(p[i],trans[i])
put(8,'<section class="recreated-page travel-transcript" aria-label="See the World transcript"><h2>Transcript excerpt of TV travel show <em>See the World</em></h2><div class="tv-sheet">'+turns+'</div></section>')

p=PAGES[8]
forum_zh=['我一直在研究深入體驗式假期。有人聽過嗎？','就是像當地人一樣生活，例如住在南美洲原住民社區。不過它跟其他旅遊一樣，也會改變當地文化。','我永遠不去度假。任何旅遊都不公平，當地原住民未必能到訪遊客的國家，這一定會影響他們的自尊。','但至少旅客帶來收入，居民可購買真正需要的東西，例如讓孩子接受教育。','有些旅客嘲笑當地人；我甚至聽過有人向原住民舞者扔錢和食物，好像在動物園一樣。','謝謝 Erica8。不過居民也可能過度依賴旅客及其金錢。','旅遊增加就有更多工作；在較貧窮國家，居民可因旅遊業更容易就業。','政府還可運用旅客帶來的收入幫助居民，例如為貧困地區提供清潔食水。','人人都應有清潔食水。我想問：當地人能從旅遊中學到甚麼嗎？','我不太明白你的意思。','例如當地人跟旅客交談後學會外語。你在別國遇過會說英語的居民吧？']
posts=''
for number,raw,zh in zip(range(1,12),p[5:16],forum_zh):
    m=re.match(r'\d+\. Posted by (.*?)\s+(\d+ \w+ \d+\s+\d+:\d+)\n(.*)',raw,re.S)
    if not m: raise ValueError(f'Could not parse forum post {number}: {raw[:60]}')
    user,date,body=m.groups()
    posts+=f'<article class="forum-post"><header><b>{escape(user.strip())}</b><span>#{number} · {escape(norm(date))}</span></header>{bi(body,zh)}</article>'
put(9,'<section class="recreated-page forum-document" aria-label="Wildrovers tourism forum"><h2>Travel forum thread: tourism and local people</h2><div class="forum-window"><div class="forum-browser"><strong>WR Wildrovers</strong>　 File　 Edit　 View　 Go　 Bookmarks　 Tools　 Help</div><div class="browser-strip">http://www.wildrovers.org/forum/tourism-local_people/</div><h3>Tourism and local people</h3><p class="forum-actions">Login　 Join　 Page 1 2 3 4　 Next　 Last Post</p>'+posts+'<div class="forum-footer">Login　 Join <span>Page 1 2 3 4　 Next　 Last Post</span></div></div></section>')

p=PAGES[9]
notes=p[5:11]
notes_zh=['個人背景：Mei 現年 97 歲，父親曾任 Dragon Hotel 經理，她在酒店長大。','酒店百週年：1913 年開業，有 125 名員工和 48 間客房；二戰時曾被日軍使用。2013 年 10 月將舉行百週年舞會，由 Mei 擔任嘉賓；12 月開設新水療設施。','1920 年代的交通：酒店跟其他酒店一樣設馬廄，旅客租用馬車；現在使用的士，但她不喜歡其污染。','當年的國際旅客較富有、形象更華麗；酒店有供僕人住的額外房間，她小時候常看到旅客帶僕人同行。','當年旅客帶很多行李，晚餐等場合會換不同服裝；現在行李較少。','Mei 喜歡看晚餐後的舞會，覺得女士們很美，希望像她們一樣。']
notes_html=''.join(bi(en,zh) for en,zh in zip(notes,notes_zh))
letter_zh={12:'尊敬的編輯：',13:'我寫信談旅遊的影響。我曾任旅行社職員，因工作到過世界多地，觀察到旅遊帶來的負面影響日益增加。',14:'巴西政府最近發現一個生活在雨林深處的「失落部落」。他們沒有藉此發展旅遊，反而決定讓部落不受外界接觸，並派守衛阻止遊客等人進入。',15:'我非常贊同這決定。這些部落群體便可繼續沉浸於自身傳統，不受外界社區或國家的人帶來負面影響。',16:'此致',17:'Kevin Hui，沙田'}
letter=''.join(bi(p[i],letter_zh[i]) for i in range(12,18))
put(10,'<section class="recreated-page travel-interview" aria-label="Mei Cheng interview and Kevin Hui letter"><h2>Interview notes from interview with Mei Cheng</h2><div class="interview-note"><h3>Hong Kong Tourism: Past and Present</h3><p><b>Interviewee:</b> Mei Cheng　 <b>Date of interview:</b> 3rd March, 2013</p><p><b>Location:</b> Dragon Hotel Hong Kong</p>'+notes_html+'</div><h2>Letter printed from Kevin Hui in <em>Asia Life</em> magazine March issue</h2><div class="published-letter">'+letter+'</div></section>')

p=PAGES[10]
blog_zh={6:'本週本地歷史學家葉嶺峰出版《1850–1945 年香港動物誌》。書中提到二十世紀上半葉香港仍有人獵虎。照片中的美國旅客 Edgar Derby 於 1923 年在粉嶺附近的龍躍頭射殺這頭虎。',7:'事件十分轟動，1920 年代有很多北美旅客到新界獵虎，但都不像 Derby 先生那麼「成功」。如今我們反而擔心野豬！',10:'人力車以前很受旅客歡迎，可惜如今幾乎消失了。這裡附上一張 1920 年代 Dragon Hotel 的照片。祝它百週年快樂！'}
stat='<div class="table-scroll"><table><thead><tr><th></th><th>1928</th><th>2013</th></tr></thead><tbody><tr><th scope="row">Price of room per night at Dragon Hotel</th><td>Approx. $10,300<br>(in today’s money)</td><td>$4,200</td></tr><tr><th scope="row">No. of rickshaw licences in HK</th><td>3,243</td><td>2</td></tr></tbody></table></div><p class="translation" lang="zh-Hant">Dragon Hotel 每晚房價：1928 年約相當於今天的 $10,300；2013 年 $4,200。香港人力車牌照數量：1928 年 3,243 個；2013 年 2 個。</p>'
blog='<section class="recreated-page travel-blog" aria-label="New Territories Historian blog"><h2>New Territories Historian blog page</h2><div class="historian-browser"><div class="historian-bar">NT Historian　 File　 Edit　 View　 Go　 Bookmarks　 Tools　 Help</div><div class="historian-url">http://www.nthistorian.com/</div><div class="historian-content"><h3>New Territories Historian</h3><p class="historian-sub">Dr. Laurence Lieu is a Lecturer at the Department of History at Hong Kong Metropolitan University</p><h4>January 23rd 2013</h4><figure class="historian-photo tiger"><img src="assets/2013-b2-tiger.webp" alt="Original 1923 photograph of tourist Edgar Derby and a tiger near Fanling"><figcaption>Edgar Derby, Lung Yeuk Tau, 1923</figcaption></figure>'+bi(p[6],blog_zh[6])+bi(p[7],blog_zh[7])+'<h4>January 15th 2013</h4>'+bi('I love random historical statistics!','我喜歡這些偶然發現的歷史統計數字！')+stat+bi(p[10],blog_zh[10])+'<figure class="historian-photo hotel"><img src="assets/2013-b2-hotel.webp" alt="Original photograph of Dragon Hotel in the 1920s"><figcaption>Dragon Hotel, 1920s</figcaption></figure></div></div><p class="source-end">THIS IS THE LAST PAGE OF THE PART B2 DATA FILE</p></section>'
put(11,blog)

qab=[(12,8,'Feature Article','Write a short feature article about travel and tourism in Hong Kong in the past using information from the B2 Data File and your notes. You should write around 150 words.','運用乙部二資料檔及筆記，撰寫短篇特寫，介紹昔日香港旅遊。約寫 150 字。'),(14,9,'Email to Queenie Lau','Write an email to Queenie Lau about the article she has sent using information from the B2 Data File. Write around 120 words.','運用乙部二資料檔的資料，電郵 Queenie Lau 談她提交的文章。約寫 120 字。'),(16,10,'Editorial','Write the editorial for the magazine using information from the B2 Data File and your notes. Write around 200 words.','運用乙部二資料檔及筆記，撰寫雜誌社論。約寫 200 字。')]
for n,task,title,prompt,zh in qab:
    head='<div class="qab-heading"><span>HKDSE 2013 · ENGLISH LANGUAGE · PAPER 3 PART B2</span><strong>B2 · DIFFICULT SECTION</strong></div>' if n==12 else ''
    field=''
    if n==12: field='<h3 class="answer-title">Hong Kong Tourism: The Way It Was</h3>'+answer(n,'article','Feature article',740)
    elif n==14: field='<div class="email-answer-head"><p><b>To:</b> Queenie Lau</p><label><b>Subject:</b> <input data-note="14-subject" aria-label="Email subject"></label></div>'+answer(n,'email','Email to Queenie Lau',740)
    else: field=answer(n,'editorial','Editorial',790)
    put(n,f'<section class="recreated-page answer-book travel-answer" aria-label="Task {task}: {escape(title)}">{head}<h2>Task {task}: {escape(title)} <small>(18 marks)</small></h2>{bi(prompt,zh)}{field}</section>')
for n,task,end in [(13,8,'END OF TASK 8'),(15,9,'END OF TASK 9'),(17,10,'END OF TASK 10 · END OF PART B2')]:
    put(n,f'<section class="recreated-page answer-book travel-answer" aria-label="Task {task} answer continuation"><h2>Task {task} · Answer continuation</h2><p class="translation" lang="zh-Hant">任務 {task} 續答頁</p>{answer(n,"continuation",f"Task {task} answer continuation",850)}<p class="source-end">{end}</p></section>')
