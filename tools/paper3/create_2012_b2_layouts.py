"""Author the 2012 Cultural Commons B2 paper as native source documents."""
from html import escape
from pathlib import Path
import re

BASE = Path(__file__).resolve().parent
ROOT = BASE / 'layouts'
raw = (BASE / 'source/2012-b2-df-clean.txt').read_text(encoding='utf-8')
pieces = re.split(r'\nPage (\d+)\n', raw)
pages = {}
for j in range(1, len(pieces), 2):
    paras = [x.strip().replace('\n', ' ') for x in re.split(r'\n\s*\n', pieces[j+1]) if x.strip()]
    pages[int(pieces[j])] = [p for p in paras if not p.startswith('2012-DSE-')]

def put(n, body):
    (ROOT / f'2012-b2-page-{n:02}.html').write_text(body.rstrip() + '\n', encoding='utf-8')

def bi(en, zh):
    return f'<div class="bilingual"><p lang="en">{escape(en)}</p><p class="translation" lang="zh-Hant">{escape(zh)}</p></div>'

def answer(n, key, label, height=570):
    ident = f'2012-b2-{n}-{key}'
    return f'<label class="answer-field" for="{ident}">{escape(label)}</label><textarea id="{ident}" class="answer-box" data-note="{n}-{key}" data-count-id="{ident}" style="min-height:{height}px" aria-label="{escape(label, quote=True)}"></textarea><p class="answer-count" data-count-for="{ident}">0 words</p>'

cover = (ROOT / '2012-b1-page-01.html').read_text(encoding='utf-8')
cover = cover.replace('Part B1', 'Part B2').replace('PART B1', 'PART B2').replace('EASY SECTION', 'DIFFICULT SECTION').replace('乙部一', '乙部二')
cover = cover.replace('Part B2 (Tasks 5 – 7)', 'Part B1 (Tasks 5 – 7)').replace('乙部二（任務 5 至 7）', '乙部一（任務 5 至 7）').replace('either B2 or B2', 'either B1 or B2').replace('乙部二或乙部二', '乙部一或乙部二')
put(1, cover)

sit = pages[1]
sit_zh = [
    '你是 Nicky Leung，在協助來港人士的非政府組織 Cultural Commons 工作。組織正為本地社區籌辦同樂日，上司 Manjula Pillai 請你完成幾項任務。',
    '你將聆聽每週播客《Bookmark》，當中有作家 Lionel Chan 的訪問。',
    '錄音前有五分鐘閱讀乙部一及乙部二的問答冊和資料檔。只須選答其中一部，不要兩部都做。',
    '按照所選問答冊及錄音的指示完成任務。所需資料在問答冊、資料檔和錄音中；聆聽時可在資料檔第 3 頁記筆記。',
    '現在有五分鐘熟悉乙部問答冊和資料檔。',
]
toc = [(3, 'Listening note-taking sheet for podcast programme Bookmark'), (4, 'Email from Manjula Pillai to Nicky Leung'), (5, 'Extract from a Nepalese teenager’s blog'), (6, 'Extract from Isobel Tait’s article “A Review of Research into Body Language”'), (7, 'Article from Living in Hong Kong newsletter'), (8, 'Appendix of statistics from Lionel Chan’s research article'), (8, 'Article from the Kowloon Herald, 15th February 2012'), (9, 'Cultural Commons webpage')]
put(2, '<section class="recreated-page situation-page" aria-label="Cultural Commons situation and contents"><div class="situation-box"><h2>Part B</h2><h3>Situation</h3>' + ''.join(bi(en, zh) for en, zh in zip(sit[2:7], sit_zh)) + '</div><div class="contents-box"><h3>Contents</h3><ol>' + ''.join(f'<li><a href="#page-{n}">{escape(title)} <span>{n}</span></a></li>' for n, title in toc) + '</ol></div></section>')

headings = [('Fun Day details', '同樂日詳情'), ('Body language', '身體語言'), ('Lionel Chan', 'Lionel Chan'), ('Communication barriers', '溝通障礙'), ('Practical difficulties newcomers to Hong Kong face', '來港新移民面對的實際困難'), ("Lionel Chan’s book ‘An Immigrant’s Song’", 'Lionel Chan 的《An Immigrant’s Song》')]
put(3, '<section class="recreated-page conference-notes" aria-label="Bookmark podcast note sheet"><h2>Listening note-taking sheet for podcast programme <em>Bookmark</em></h2>' + bi('Listen to the weekly podcast programme Bookmark, which features an interview with Lionel Chan.', '聆聽每週播客《Bookmark》訪問 Lionel Chan。') + '<div class="notes-form-body">' + ''.join(f'<h3>{escape(en)}</h3><p class="translation" lang="zh-Hant">{escape(zh)}</p><textarea data-note="3-{i}" rows="4" aria-label="Notes: {escape(en, quote=True)}"></textarea>' for i, (en, zh) in enumerate(headings, 1)) + '</div></section>')

email = pages[3]
email_zh = [
    '親愛的 Nicky：', '有三件事想請你做。',
    '我們將進行網上問卷，了解香港的溝通障礙。請為問卷寫引言，包括：',
    '甚麼是障礙；與香港生活方式相關的障礙；每種障礙的影響或當事人的感受。',
    '不要談身體語言障礙，因為另一份問卷已處理。先參考《Living in Hong Kong》通訊文章。',
    '我們將在網站開設每月探討不同溝通範疇的建議頁，本月主題是身體語言。用網站範本：',
    '解釋所示每種身體語言帶來的問題，並分別提出建議。',
    '先參考 Isobel Tait 的《A Review of Research into Body Language》節錄。',
    'Fairfax Secondary School 邀請我們為多元文化認識週特刊寫短文，介紹不同國籍人士來港後遇到的實際困難，以及香港社區提供的援助。',
    '請撰文約二百字。我找到 Lionel Chan 研究文章中的一些統計數據，可先作參考。',
    '《Bookmark》播客的筆記也會對所有任務有用。', '謝謝你的幫忙。Manjula',
]
put(4, '<section class="recreated-page commons-email" aria-label="Manjula Pillai email"><h2>Email from Manjula Pillai to Nicky Leung</h2><div class="email-window"><div class="email-headers"><div><strong>To:</strong> Nicky Leung</div><div><strong>From:</strong> Manjula Pillai</div><div><strong>Sent:</strong> 30 March 2012</div><div><strong>Subject:</strong> Things to do</div></div><div class="email-content">' + ''.join(bi(en, zh) for en, zh in zip(email[2:14], email_zh)) + '</div></div></section>')

blog = pages[4]
blog_zh = [
    '我來香港已有一個月，明天第一天上學，有點害怕。媽媽叫我不用擔心，說來容易！',
    '今天學校秘書問我來港後有沒有遇到問題。我剛開始回答，她就打斷我，自以為知道我要說甚麼，令我覺得自己的話不重要。',
    '本週有好消息！我在課堂上認識 Ka Man（她讓我叫她 Carmen）。她問我尼泊爾與香港有何不同。老師又請我下週向全班介紹尼泊爾，我會展示照片、播放音樂。綵排後，老師提醒我留意站姿：雙手叉腰會顯得自信過度甚至傲慢，應放鬆手臂垂在身旁。我還需多練習。',
    '報告成功！同學問了很多問題，我們還會交換廣東歌與尼泊爾電影。社工介紹我參加 Cultural Commons 在深水埗為不同國籍兒童辦的青年會。只要父母同意，我下週五便可去；Carmen 也會問她媽媽。我希望能交更多朋友！'
]
def blog_post(title_date, body, zh, art=''):
    title, _, date = title_date.partition(' Posted on ')
    return '<article class="blog-post"><h4>' + escape(title) + '</h4><small>Posted on ' + escape(date) + '</small>' + bi(body, zh) + art + '</article>'
put(5, '<section class="recreated-page commons-blog" aria-label="Nepalese teenager blog"><h2>Extract from a Nepalese teenager’s blog</h2><div class="browser-bar">Bloggette　 ·　 http://www.hkbloggette.com</div><div class="blog-shell"><header>hk bloggette.com</header><aside><strong>archives</strong><span>January 2011</span><span>December 2010</span><span>November 2010</span></aside><main><h3>recent posts</h3><article class="blog-post"><h4>School in Hong Kong at last...</h4>' + bi(blog[5].split('...', 1)[1].strip(), blog_zh[0]) + '</article>' + blog_post(blog[6], blog[7], blog_zh[1], '<img class="blog-cartoon" src="assets/2012-b2-blog-barrier.webp" alt="Original blog illustration of a person speaking behind a barrier">') + blog_post(blog[9], blog[10], blog_zh[2]) + blog_post(blog[11], blog[12], blog_zh[3]) + '<small>Copyright © · All rights reserved · Web design by Damosuzuki</small></main></div></section>')

paper = pages[5]
paper_zh = [
    '研究有充分證據顯示，在不同情境及文化中，身體語言的某些方面可使他人留下正面或負面印象。有人甚至認為身體語言是人際溝通最重要的部分。',
    'De Frietas（2006）發現，演說者的站姿會顯著影響聽眾的觀感；求職面試中，應徵者甚至可能因報告時站姿不當而落選。',
    'Amocatchi（2008）向逾一千人展示雙臂交叉的圖像，詢問他們解讀到甚麼訊息。結果顯示解讀不一。她建議聆聽者避免誤會，採用雙手輕放身前的中立姿勢。',
]
chart = '<figure class="folded-chart"><figcaption>Figure 2: Folded arms results of survey (Amocatchi, 2008)</figcaption><div class="bars"><div><span>Listening &amp; agreeing</span><meter min="0" max="100" value="43">43%</meter><strong>43%</strong></div><div><span>Rejecting &amp; disagreeing</span><meter min="0" max="100" value="40">40%</meter><strong>40%</strong></div><div><span>Not sure</span><meter min="0" max="100" value="17">17%</meter><strong>17%</strong></div></div><p class="translation" lang="zh-Hant">聽取並贊同：43%；拒絕並不贊同：40%；不確定：17%。</p></figure>'
put(6, '<section class="recreated-page commons-research" aria-label="Body-language research article"><h2>Extract from Isobel Tait’s article ‘A Review of Research into Body Language’</h2><article class="research-sheet"><figure class="folded-figure"><img src="assets/2012-b2-folded-arms.webp" alt="Original drawing of a person with folded arms"><figcaption>Figure 1: Folded arms (Amocatchi, 2008)</figcaption></figure>' + bi(paper[1], paper_zh[0]) + bi(paper[2], paper_zh[1]) + bi(paper[4], paper_zh[2]) + chart + '</article></section>')

talk = pages[6]
talk_zh = [
    '想像在一個陌生國家醒來，會是甚麼感覺？本月我們訪問三位新來香港的 Mina、Georg 和 Tariq。',
    '首先歡迎你們來港。來了多久？在這裡做甚麼？',
    '我和 Georg 在九龍大學讀書，來港三個月了。',
    '我來自阿曼，來港與祖父母同住，幫忙家族生意，已住兩個月。',
    '你們喜歡香港的生活嗎？', '我們覺得這裡很棒；對我來說，香港與家鄉瑞典很不同。',
    '談談香港的溝通。你們遇過障礙嗎？',
    '這裡生活節奏很快，人人趕時間，似乎沒空跟你交談。因此時間是一種障礙。',
    '我也有同感。上週我在店裡問價，店員沒空回答，令我非常沮喪。',
    '你感到沮喪，商戶也會受損，因為你轉往別家，原店失去生意。', '正是。',
    '噪音也是障礙。我在彌敦道等繁忙街道接電話時，常聽不清楚。有一次關乎求職面試的重要來電，我也未能聽清內容。',
    '在香港生活還有甚麼困難？',
    '起初找不到醫生，後來得知旺角附近有四間診所，每週提供一次免費診症。',
    '有時想念家鄉食物，但後來找到網站，列出瑞典食品店和餐廳，很有幫助。',
    '我喜歡本地食物，因此沒有這問題。', '感謝分享，祝你們繼續享受香港生活。',
]
def interview_turn(en, zh):
    speaker, sep, rest = en.partition(': ')
    return f'<div class="commons-turn"><strong>{escape(speaker) if sep else "Interviewer"}</strong>{bi(rest if sep else en, zh)}</div>'
put(7, '<section class="recreated-page commons-newsletter" aria-label="Living in Hong Kong interviews"><h2>Article from <em>Living in Hong Kong</em> newsletter</h2><div class="newsletter-sheet">' + ''.join(interview_turn(en, zh) for en, zh in zip(talk[1:18], talk_zh)) + '</div></section>')

stats = [('Easy to find somewhere to live',12,88,'容易找到住處'),('Local food is very good',75,25,'本地食物很好'),('Enjoying sightseeing',95,5,'喜歡觀光'),('Easy to find a school for children',17,83,'容易為子女找學校'),('Easy to find free medical care',10,90,'容易找到免費醫療'),('Using the MTR is easy and convenient',84,16,'港鐵方便易用'),('Easy to find free legal advice',18,82,'容易找到免費法律意見'),('Children have the opportunity to make friends',13,87,'孩子有機會交朋友'),('Easy to find food from your own country',86,14,'容易找到家鄉食物')]
news = pages[7]
news_zh = [
    '律師 Venny Wong 和 Theresa Lam 在 Chan and Wang Legal Company 工作，決定透過社區法律諮詢計劃為來港人士提供義務法律服務。',
    'Venny 說，有些來港人士需要額外協助，面對入境手續或其他法律問題，卻負擔不起法律意見。',
    '兩人希望建立網絡，鼓勵更多人參與。',
    'Theresa 說她們正與其他商界朋友商討能否提供幫助。',
    '觀塘地產代理 Enrique Ramirez 已加入，免費幫助新移民找住處，至今協助約二十個家庭。',
    '政府機構也有幫忙。香港旅遊發展局印製新的港鐵地圖，協助遊客和新來港人士熟悉香港。',
]
table = '<div class="table-scroll"><table><thead><tr><th>Appendix 11: Newcomer responses after 1 week in Hong Kong</th><th>% agree</th><th>% disagree</th></tr></thead><tbody>' + ''.join(f'<tr><th scope="row">{escape(en)}<span class="translation" lang="zh-Hant">{escape(zh)}</span></th><td>{yes}</td><td>{no}</td></tr>' for en,yes,no,zh in stats) + '</tbody></table></div>'
put(8, '<section class="recreated-page commons-stat-news" aria-label="Lionel Chan statistics and Kowloon Herald article"><h2>Appendix of statistics from Lionel Chan’s research article <em>Tracking Hong Kong Newcomers</em></h2><aside class="sticky-note">' + bi(news[1], 'Nicky，通訊文章篇幅有限，集中寫大多數人認為有困難的範疇。Manjula') + '</aside>' + table + '<h2>Article from the <em>Kowloon Herald</em>, 15th February 2012</h2><article class="newspaper-sheet"><h3>Lawyers step up</h3>' + ''.join(bi(en, zh) for en, zh in zip(news[14:20], news_zh)) + '</article></section>')

web = pages[8]
services = [('Written translation of formal documents from foreign country','外國正式文件的書面翻譯'),('Interpreter service (e.g. for phone calls or for formal interviews)','傳譯服務，例如電話或正式面試'),('Form filling service (e.g. forms from Education Bureau, HK taxes etc)','協助填表，例如教育局或稅務表格'),('Child care services for working mothers','為在職母親提供託兒服務'),('Introductions to local sports teams (adults and kids)','介紹成人及兒童參加本地運動隊'),('Important contact numbers (e.g. for social services)','重要聯絡電話，例如社會服務'),('Sightseeing guides for Kowloon and the Outlying Islands','九龍及離島觀光指南')]
put(9, '<section class="recreated-page commons-website" aria-label="Cultural Commons website"><h2>Cultural Commons webpage</h2><div class="web-window"><div class="browser-bar">Cultural Commons　 ·　 http://www.culturalcommons.org.hk</div><header><h3>Cultural Commons</h3><p>Services for Newcomers to Hong Kong</p><nav>Home　 About Us　 Contact Us　 Body Language Advice　 Help　 Search</nav></header><h4>Newcomers to Hong Kong</h4><img class="family-banner" src="assets/2012-b2-families.webp" alt="Original photographs of newcomer families"><div class="web-columns"><aside><h5>Cultural Commons</h5><strong>Life Events</strong><p>Finding a Job<br>Raising a Family<br>Having a Baby<br>Retirement Planning<br>Changing your Address</p><p>A to Z Services Index<br>Frequently Asked Questions<br>Your Comments Matter!</p></aside><main><h5>Services for newcomers</h5>' + bi(web[9], '新來香港？我們能提供你所需的協助，服務包括：') + '<h5>For Newcomers to Hong Kong</h5><ul>' + ''.join(f'<li>{escape(en)}<span class="translation" lang="zh-Hant">{escape(zh)}</span></li>' for en,zh in services) + '</ul>' + bi(web[12], 'Cultural Commons 最近搬到 Larch Street 的新辦公室；可點擊地圖查看。') + '</main><aside><h5>Other Useful Sites</h5><p>Hong Kong Immigration<br>Welcome to Hong Kong<br>Hong Kong taxes: Newcomers to Hong Kong 2012<br>Foreign Credentials</p></aside></div></div><p class="source-end">THIS IS THE LAST PAGE OF THE PART B2 DATA FILE</p></section>')

tasks = {10: ('Task 8: Introduction for survey', '18 marks', 'Write an introduction for the survey on barriers to communication using information from the B2 Data File and your notes. You should write around 150 words.', '利用乙部二資料檔及筆記，撰寫有關溝通障礙問卷的引言，約 150 字。', 'Survey introduction'), 12: ('Task 9: Advice page for website', '18 marks', 'Complete the advice page for the Cultural Commons website using information from the B2 Data File and your notes. Write around 200 words.', '運用乙部二資料檔及筆記，完成 Cultural Commons 網站的建議頁，約 200 字。', 'Body language advice'), 14: ('Task 10: Newsletter article', '18 marks', 'Write an article for Fairfax Secondary School’s newsletter using information from the B2 Data File and your notes. Write around 200 words.', '運用乙部二資料檔及筆記，為 Fairfax Secondary School 通訊撰文，約 200 字。', 'Newsletter article')}
for n,(title,marks,prompt,zh,label) in tasks.items():
    bookhead = '<div class="qab-heading"><span>HKDSE 2012 · ENGLISH LANGUAGE · PAPER 3 PART B2</span><strong>B2 · DIFFICULT SECTION</strong></div>' if n == 10 else ''
    if n == 12:
        body = '<div class="advice-sheet"><h3>BODY LANGUAGE</h3><div class="advice-part"><h4><img src="assets/2012-b2-eye.webp" alt="Original eye-contact illustration">Eye contact</h4>' + answer(12,'eyes','Advice about eye contact',310) + '</div><div class="advice-part"><h4><img src="assets/2012-b2-arms.webp" alt="Original folded-arms illustration">Arms</h4>' + answer(12,'arms','Advice about arm position',310) + '</div></div>'
    else: body=answer(n,'response',label,650)
    put(n,f'<section class="recreated-page answer-book commons-answer" aria-label="{escape(title, quote=True)}">{bookhead}<h2>{escape(title)} <small>({marks})</small></h2>{bi(prompt,zh)}{body}</section>')
for n,task,kind,end in [(11,8,'survey','END OF TASK 8'),(13,9,'body-language','END OF TASK 9'),(15,10,'article','END OF TASK 10 · END OF PART B2')]:
    put(n,f'<section class="recreated-page answer-book commons-answer" aria-label="Task {task} continuation"><h2>Task {task} · Answer continuation</h2><p class="translation" lang="zh-Hant">任務 {task} 續答頁</p>' + (('<h3 class="standing-heading"><img src="assets/2012-b2-standing.webp" alt="Original standing illustration">Standing</h3>' + answer(13,'standing','Advice about standing',480)) if n == 13 else answer(n,'continuation',f'Task {task} answer continuation',680)) + f'<p class="source-end">{end}</p></section>')
