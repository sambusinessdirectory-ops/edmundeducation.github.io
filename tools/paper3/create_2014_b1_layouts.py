"""Source-authored 2014 B1 Data File and answer-book reconstruction.

The strings below are transcribed from the original page images. Each distinct
source document keeps its own structure; this is not an OCR-line display.
"""
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent / "layouts"


def b(en, zh):
    return f'<div class="bilingual"><p lang="en">{escape(en)}</p><p class="translation" lang="zh-Hant">{escape(zh)}</p></div>'


def write(n, body):
    (ROOT / f"2014-b1-page-{n:02}.html").write_text(body.rstrip() + "\n", encoding="utf-8")


cover = (ROOT / "2023-b1-page-01.html").read_text(encoding="utf-8")
write(1, cover.replace("2023", "2014"))

contents = [
    (3, "Listening note-taking sheet for the Pet Club podcast"),
    (4, "Email from Kerry Lam to Joey Wong"),
    (5, "Complaint letter from Mrs. Cheung to Kerry Lam"),
    (6, "Webpage from the Hong Kong Sugar Glider Association"),
    (7, "HK Exotic Pets Forum webpage"),
    (8, "Foreword from the Exotic Pet Owner’s Guide"),
    (8, "Statistics from Online Today magazine"),
    (9, "Extract from an interview with Vicky Wong and Kit Poon"),
    (10, "Page from the Cincinnati Pet Owners’ Newsletter"),
]
write(2, '<section class="recreated-page situation-page" aria-label="2014 Part B situation and contents"><div class="situation-box"><h2>Part B</h2><h3>Situation</h3>' +
      b("You are Joey Wong. You are an assistant at the Kowloon Exotic Pets Hospital, which takes care of people’s unusual pets. Your boss, Kerry Lam, has asked you to help with the development of the Hospital’s website and other tasks.", "你是 Joey Wong，在照顧特殊寵物的九龍珍奇寵物醫院擔任助理。上司 Kerry Lam 請你協助建立醫院網站及完成其他工作。") +
      b("You will listen to a recording of a podcast. In the podcast you will hear an interview with Neelay Shah and Wendy Yee.", "你將聆聽一段播客錄音，當中有 Neelay Shah 和 Wendy Yee 的訪問。") +
      b("Before the recording is played, you will have five minutes to study the Question-Answer Book and the Data File for Part B1 and the Question-Answer Book and the Data File for Part B2. Remember you must choose to do the tasks in either Part B1 or Part B2. Do NOT attempt both Parts B1 and B2.", "錄音播放前，你有五分鐘閱讀乙部一及乙部二的問答冊和資料檔。須在兩部分中選答其中一部分，不可兩部分都作答。") +
      b("Complete the tasks by following the instructions in the Question-Answer Book that you choose and on the recording. You will find all the information you need in the Question-Answer Book and Data File that you choose and on the recording. As you listen you can make notes on page 3 of the Data File.", "依照所選問答冊和錄音的指示完成任務。所需資料可在問答冊、資料檔及錄音中找到。聆聽時可在資料檔第 3 頁記筆記。") +
      b("You now have five minutes to familiarize yourself with the Part B Question-Answer Book and the Data File.", "現在有五分鐘熟悉乙部問答冊及資料檔。") +
      '</div><div class="contents-box"><h3>Contents</h3><ol>' + ''.join(f'<li><a href="#page-{page}">{escape(title)} <span>{page}</span></a></li>' for page, title in contents) + '</ol></div></section>')

notes = [
    ("Exotic pets — Definition:", "珍奇寵物：定義"),
    ("Reasons to have an exotic pet:", "飼養珍奇寵物的原因"),
    ("Examples of exotic pets in Hong Kong:", "香港的珍奇寵物例子"),
    ("Email 1", "電郵一"),
    ("Email 2", "電郵二"),
    ("Advice for exotic pet owners", "給珍奇寵物主人的建議"),
]
write(3, '<section class="recreated-page conference-notes" aria-label="Pet Club podcast listening note-taking sheet"><h2>Listening note-taking sheet for the <em>Pet Club</em> podcast</h2><div class="notes-form-body">' + ''.join(f'<h3>{escape(en)}</h3><p class="translation" lang="zh-Hant">{escape(zh)}</p><textarea data-note="3-{i}" rows="4" aria-label="Notes: {escape(en, quote=True)}"></textarea>' for i, (en, zh) in enumerate(notes, 1)) + '</div></section>')

email_paras = [
    ("Dear Joey,", "Joey："),
    ("I’d like your help with a few things.", "我想請你幫忙做幾件事。"),
    ("We’re updating our website. Could you complete the introductory page on keeping an exotic pet? You can check the HK Exotic Pets Forum webpage and the Foreword from the Exotic Pet Owner’s Guide and remember to check your notes from the Pet Club podcast.", "我們正在更新網站。請完成介紹飼養珍奇寵物的網頁。可查閱香港珍奇寵物論壇、《珍奇寵物主人指南》序言，以及 Pet Club 播客筆記。"),
    ("We’ve had a complaint letter from Mrs. Cheung about the advice we gave to her son. Please can you write a reply letter to apologise, explain the disadvantages of sugar gliders and suggest that she consider a snake instead (non-poisonous, of course!). You should start by looking at Mrs. Cheung’s letter. You might also want to take a look at the webpage from the Hong Kong Sugar Glider Association, the HK Exotic Pets Forum webpage, and the Foreword from the Exotic Pet Owner’s Guide. Remember to use your notes from the Pet Club podcast too.", "我們收到張太太的投訴信，關於我們給她兒子的建議。請寫回信道歉，說明蜜袋鼯的缺點，並建議她考慮改養無毒蛇。先讀她的信，亦可參考蜜袋鼯協會網頁、珍奇寵物論壇、指南序言和播客筆記。"),
    ("We’re considering including a page on our website where kids can keep a virtual pet. Can you do some research into this and send me a report? In your report, you should give background information about virtual pets, describe what virtual pet owners do with their virtual pets and describe the advantages of keeping a virtual pet. You might want to look at the extract from the interview with Vicky Wong and Kit Poon, any available statistics and the page from the Cincinnati Pet Owners’ Newsletter.", "我們考慮在網站加入讓兒童飼養虛擬寵物的頁面。請研究並提交報告，交代虛擬寵物的背景、主人會做甚麼，以及飼養的好處。可參考 Vicky Wong 和 Kit Poon 的訪問、統計及辛辛那提寵物主人通訊。"),
    ("Thanks for your help.", "謝謝幫忙。"),
]
write(4, '<section class="recreated-page email-document" aria-label="Email from Kerry Lam to Joey Wong"><h2>Email from Kerry Lam to Joey Wong</h2><div class="email-window"><div class="email-tabs"><span>Inbox</span><span>Message</span></div><div class="email-toolbar"><span>Reply</span><span>Reply all</span><span>Forward</span><span>Delete</span><span>Print</span><span>Save</span><span>Move</span><span>Search</span></div><div class="email-headers"><div><strong>To:</strong> Joey Wong</div><div><strong>From:</strong> Kerry Lam</div><div><strong>Sent:</strong> 12 April, 2014</div><div><strong>Subject:</strong> Work to be done</div></div><div class="email-content">' + ''.join(b(en, zh) for en, zh in email_paras) + '<p>Kerry</p></div></div></section>')

letter_paras = [
    ("I recently visited your hospital with my 9 year-old son. My son wants a sugar glider so he asked the doctor on duty to give him some advice. The doctor was very rude and told him not to get a sugar glider as a pet, but he did not explain why not. My son is very upset as he was looking forward to getting a pet for his birthday.", "最近我帶九歲的兒子到貴院。他想養蜜袋鼯，便向當值醫生徵詢意見。醫生態度很無禮，只叫他不要養，卻沒有解釋原因。兒子本來期待生日得到一隻寵物，現在很難過。"),
    ("Please could you explain why a sugar glider is not a good choice for a pet and suggest something else?", "請解釋蜜袋鼯為何不是合適的寵物，並建議其他選擇。"),
    ("Thank you.", "謝謝。"),
]
write(5, '<section class="recreated-page source-letter" aria-label="Complaint letter from Mrs. Cheung"><h2>Complaint letter from Mrs. Cheung to Kerry Lam</h2><div class="letter-sheet"><p class="letter-date">6 Prospect Terrace Gardens<br>Tenth Street<br>Kowloon<br><br>April 3, 2014</p><p>Dear Ms. Lam,</p>' + ''.join(b(en, zh) for en, zh in letter_paras) + '<p>Yours sincerely,</p><p class="signature"><em>E. Cheung</em><br>Eunice Cheung</p></div></section>')

gliders = [
    ("Lucky", "page-06-sugar-glider.webp", "This is Fanny Lo’s sugar glider, Lucky. We asked Fanny what she thinks you need to know if you want a sugar glider.", "這是 Fanny Lo 的蜜袋鼯 Lucky。我們請她分享飼養蜜袋鼯前需要知道的事。", "My sugar glider is three years old. I got him in a pet shop in Hong Kong. He’s soooooo cute, he’s like my best friend. But one problem is if you only have one they get lonely. So I’m saving up for another sugar glider. I hope that I can find him a good friend. ;-) (Fanny Lo)", "我的蜜袋鼯三歲了，是在香港寵物店買的。他太可愛了，就像我的好朋友。但只養一隻的話牠會孤單，所以我在存錢買第二隻，希望替牠找個好朋友。"),
    ("Sparky", "", "Sparky belongs to proud owner Kim Tse. Kim tells us he’s really glad he got Sparky. But there is a bit of a problem. Kim explains, ‘My Dad moans because they can be really smelly pets, you need to clean the cage pretty often.’ Don’t worry, though, Kim says he wouldn’t swap Sparky for anything!", "Sparky 的主人 Kim Tse 很慶幸養了牠，但牠們可能很臭，要經常清理籠子。即使如此，Kim 也不願拿 Sparky 換任何東西。", "", ""),
    ("Ella", "", "Daniel Blay bought his sugar glider, Ella last year. He tells us, ‘Ella’s great, I get home and I take her out of her cage and play with her – I can do this, but Ella has bitten my sister and my mum. So you have to be careful when you handle them.’", "Daniel Blay 去年買了蜜袋鼯 Ella。他可以把牠帶出籠子玩，但 Ella 咬過他的妹妹和媽媽，所以接觸時要小心。", "", ""),
]
glider_cards = []
for title, img, lead, lead_zh, quote, quote_zh in gliders:
    art = f'<img src="assets/{img}" alt="Sugar glider Lucky, cropped from the original document">' if img else ''
    glider_cards.append(f'<article class="glider-profile"><h3>{title}</h3>{art}{b(lead, lead_zh)}{b(quote, quote_zh) if quote else ""}</article>')
write(6, '<section class="recreated-page glider-web" aria-label="Hong Kong Sugar Glider Association webpage"><h2>Webpage from the Hong Kong Sugar Glider Association</h2><div class="web-browser"><div class="browser-strip">Home　About Us　Sugar Gliders　Care Guide　Contact</div><header><strong>Hong Kong Sugar Glider Association</strong><nav>Home　|　Your glider　|　Stories　|　About us</nav></header><main><h3>Thinking of buying a sugar glider? Read on!</h3><p class="translation" lang="zh-Hant">想買蜜袋鼯？請先閱讀以下飼主經驗。</p>' + ''.join(glider_cards) + '</main></div></section>')

posts = [
    ("Kidpaul", "March 18 2014, 03:43 AM", "Hey everyone! If you want to impress your friends, get an exotic pet. I just bought a corn snake.", "想讓朋友留下深刻印象，就養珍奇寵物。我剛買了一條玉米蛇。"),
    ("Spidergirl", "March 22 2014, 09:20 AM", "Yuk, why have a snake? That’s gross! Get a spider instead. I’ve got a tarantula called Peter!", "為甚麼養蛇？太噁心了！不如養蜘蛛；我有一隻叫 Peter 的捕鳥蛛。"),
    ("Snakeman", "March 22 2014, 09:22 AM", "No way, Spidergirl, I’ve got a python. They are great snakes. Just ask anyone who has a python and they’ll say the same thing.", "我養了一條蟒蛇。問問其他蟒蛇主人，他們都會說蟒蛇很好。"),
    ("Blackstar", "March 24 2014, 09:35 AM", "Hey spiders are way cooler than snakes! My brother just got a wolf spider.", "蜘蛛比蛇酷得多！我哥哥剛養了一隻狼蛛。"),
    ("Python121", "March 25 2014, 09:18 PM", "Exotic pets are great! If you have a cat or dog, you have to give them a lot of attention – my sister’s cat just follows her all over the house. You usually don’t have to worry about that with any exotic pets.", "珍奇寵物很棒。貓狗需要很多關注；我妹妹的貓整天跟着她。養珍奇寵物通常不用擔心這點。"),
    ("Cobra10", "March 25 2014, 09:47 PM", "I think you’re all right. Snakes and spiders are great but my sister has got a sugar glider. Now that was a big mistake, man. It’s so noisy. I mean really noisy!", "蛇和蜘蛛都不錯，但我妹妹養蜜袋鼯是個大錯誤，牠真的非常吵。"),
    ("Kidpaul", "March 27 2014, 07:01 AM", "I like my snake because he’s quiet. No noise at all. That’s a good thing for me and my family. We used to have a dog and it was really noisy. And it made a load of noise at night. It kept everyone awake.", "我喜歡我的蛇，因為牠完全不吵。家人以前養的狗夜裏常吵得大家睡不着。"),
    ("Cobra10", "March 27 2014, 07:02 AM", "Tell me about it – sugar gliders are nocturnal so we have the same problem as you did with your sister’s dog!", "蜜袋鼯是夜行動物，我們也有你家以前養狗時的同樣問題！"),
]
forum_posts = ''.join(f'<article class="forum-post"><header><strong>{who}</strong><span>Posted: {when}</span></header>{b(en, zh)}</article>' for who, when, en, zh in posts)
write(7, '<section class="recreated-page forum-document" aria-label="HK Exotic Pets Forum webpage"><h2>HK Exotic Pets Forum webpage</h2><div class="forum-window"><div class="forum-browser">HK Exotic Pets Forum　›　Exotic pets in Hong Kong</div><div class="browser-strip">Home　Forum　Member list　Search</div><h3>Corn snakes: the coolest exotic pet in HK?</h3><p class="forum-actions">REPLY　POST NEW TOPIC</p>' + forum_posts + '<div class="forum-footer">ADD REPLY <span>1 / 1</span></div></div></section>')

foreword = [
    ("Hello there! Thanks for buying my book. So what is an exotic pet then? Well, it’s any animal which is wild but is looked after by a person.", "你好！謝謝購買本書。甚麼是珍奇寵物？那是由人照顧的野生動物。"),
    ("I am often asked which exotic pet is the best to get. From my personal experience, I would say non-poisonous snakes. You can get them for your kids – a small snake is usually perfectly safe. My son got his first snake when he was six years old. He loved it.", "我經常被問哪種珍奇寵物最好。按我的經驗，無毒蛇是好選擇；小蛇通常適合小孩。我兒子六歲就養了第一條蛇，很喜歡牠。"),
    ("Another popular exotic pet is the tree frog. These can come in all the colours of the rainbow. Tree frogs are my particular passion as you will see!", "樹蛙也是受歡迎的珍奇寵物，顏色多彩。讀下去你會發現我尤其喜歡樹蛙。"),
    ("Read on!", "請繼續閱讀！"),
]
bars = [(2009, 6), (2010, 8), (2011, 17), (2012, 19), (2013, 27)]
svg = '<svg role="img" aria-label="Virtual pet owners worldwide, 2009 to 2013, in millions" viewBox="0 0 640 300"><title>Virtual Pet Owners Worldwide</title><line x1="75" y1="250" x2="610" y2="250" stroke="#283d42"/><line x1="75" y1="25" x2="75" y2="250" stroke="#283d42"/>'
for tick in range(0, 31, 5):
    y = 250 - tick * 7
    svg += f'<line x1="70" y1="{y}" x2="75" y2="{y}" stroke="#283d42"/><text x="62" y="{y + 4}" text-anchor="end">{tick}</text>'
for i, (year, value) in enumerate(bars):
    x = 110 + i * 102
    svg += f'<rect x="{x}" y="{250 - value*7}" width="53" height="{value*7}" fill="#6b8787"/><text x="{x+26}" y="{244 - value*7}" text-anchor="middle">{value}</text><text x="{x+26}" y="272" text-anchor="middle">{year}</text>'
svg += '<text x="335" y="295" text-anchor="middle">Year</text><text transform="translate(18 155) rotate(-90)" text-anchor="middle">Number of owners (millions)</text></svg>'
write(8, '<section class="recreated-page exotic-guide" aria-label="Exotic Pet Owner’s Guide foreword and virtual-pet chart"><h2>Foreword from the <em>Exotic Pet Owner’s Guide</em></h2><div class="guide-sheet"><h3>Foreword</h3>' + ''.join(b(en, zh) for en, zh in foreword) + '<p class="signature">Scott ‘Rats’ Fink, 2012</p></div><h2>Statistics from <em>Online Today</em> magazine</h2><figure class="virtual-pet-chart"><h3>Virtual Pet Owners Worldwide</h3>' + svg + '<figcaption>Number of owners (millions), 2009–2013</figcaption><p class="translation" lang="zh-Hant">全球虛擬寵物主人（百萬人）：2009 年 600 萬、2010 年 800 萬、2011 年 1,700 萬、2012 年 1,900 萬、2013 年 2,700 萬。</p></figure></section>')

interview = [
    ("Interviewer", "Vicky, you are the CEO of HKComputerPets.com. What is it exactly?", "Vicky，你是 HKComputerPets.com 的行政總裁。公司做甚麼？"),
    ("Vicky", "Well, basically we run a website for virtual pets.", "我們營運一個虛擬寵物網站。"),
    ("Interviewer", "So, first things first, what is a virtual pet?", "首先，甚麼是虛擬寵物？"),
    ("Vicky", "Well, essentially it’s a pet that isn’t real.", "基本上是一隻非真實的寵物。"),
    ("Interviewer", "Okay, and how can I get a virtual pet?", "那如何獲得虛擬寵物？"),
    ("Vicky", "Oh, that’s a simple thing to do – you just go online to a virtual pet website and create an account.", "很簡單，上虛擬寵物網站建立帳戶便可。"),
    ("Interviewer", "Right. So what are the advantages of a virtual pet compared to a real one?", "跟真正寵物相比，虛擬寵物有甚麼好處？"),
    ("Vicky", "Well, probably the most important is that it’s free. You don’t have to buy food or toys like you do for a real animal.", "最重要的大概是免費。不用像養真動物般買食物或玩具。"),
    ("Interviewer", "Now, Kit, you have a virtual pet, which is a tree frog. Is that right?", "Kit，你有一隻虛擬樹蛙，對嗎？"),
    ("Kit", "Yes, I’ve had it for ten months.", "是的，養了十個月。"),
    ("Interviewer", "And why do you have a virtual pet?", "你為甚麼養虛擬寵物？"),
    ("Kit", "My Dad said it was good for me to take responsibility. And I already have – like I need to remember to feed him and how to look after him. And my Dad said as well it was a good idea for me to have a virtual one before a real one.", "爸爸說這能培養責任感，我要記得餵牠和照顧牠。他認為先養虛擬寵物，再養真的比較好。"),
    ("Interviewer", "And?", "然後呢？"),
    ("Kit", "Well, he says he’ll buy me a real one if I can look after my virtual tree frog for a year.", "爸爸說如果我能照顧虛擬樹蛙一年，他就買一隻真的給我。"),
    ("Vicky", "That’s great! We think of this as practice for having a real pet.", "很好！我們認為這是養真寵物前的練習。"),
    ("Interviewer", "And Kit, what’s your favourite thing you can do on the website?", "Kit，你最喜歡網站上的甚麼活動？"),
    ("Kit", "Well, I don’t know if it’s my favourite thing but I can send my pet or other pets on the site a birthday card! It’s really funny.", "我不知道算不算最喜歡，但我可以給自己的寵物或網站上的其他寵物寄生日卡，很有趣。"),
]
turns = ''.join(f'<div class="dialogue-turn"><strong>{who}:</strong>{b(en, zh)}</div>' for who, en, zh in interview)
write(9, '<section class="recreated-page interview-page" aria-label="Interview with Vicky Wong and Kit Poon"><h2>Extract from an interview with Vicky Wong and Kit Poon</h2><div class="transcript-sheet">' + turns + '</div></section>')

pets = [
    ("Rio", "Jessie, age 8", "page-10-frog.webp", "I’m called Rio, I was entered into a virtual pet beauty contest. And guess what? I came second!", "我叫 Rio，參加過虛擬寵物選美比賽，還得了第二名！"),
    ("Scooter", "Michael, age 7", "page-10-scooter.webp", "I’m called Scooter. Michael adopted me 6 months ago – his Dad said it’s okay and everything. Michael got me some toys to play with – like yesterday I got a new football.", "我叫 Scooter。Michael 六個月前在爸爸同意下領養了我。他買玩具給我，昨天還送我新足球。"),
    ("Rocky", "Hamish, age 6.5", "page-10-lizard.webp", "I’m called Rocky. I play a game with Hamish. It’s cool. I can hide in my cage and Hamish has to find me.", "我叫 Rocky。我會躲在籠裏，讓 Hamish 找我，這遊戲很有趣。"),
]
pet_cards = ''.join(f'<article class="virtual-pet"><img src="assets/{img}" alt="Original {name} illustration"><div class="pet-speech">{b(en, zh)}</div><p><strong>Owner:</strong> {owner}</p></article>' for name, owner, img, en, zh in pets)
write(10, '<section class="recreated-page pet-newsletter" aria-label="Cincinnati Pet Owners’ Newsletter"><h2>Page from the <em>Cincinnati Pet Owners’ Newsletter</em></h2><div class="newsletter-sheet"><header><strong>Cincinnati Pet Owners’ Newsletter</strong><h3>Virtual Pets: what they do with their owners</h3></header>' + b("A virtual pet! 15 years ago, it didn’t seem possible, did it? We sent our reporter out and about to find some of the virtual pets at Cincinnati Elementary School and ask what they have been up to with their owners!", "十五年前，虛擬寵物似乎不可能出現。我們的記者訪問了辛辛那提小學的虛擬寵物，看看牠們和主人做過甚麼。") + '<div class="pet-grid">' + pet_cards + '</div><p class="end-note">THIS IS THE LAST PAGE OF THE PART B1 DATA FILE</p></div></section>')

def field(key, label, size="short"):
    return f'<label class="faq-field"><input data-note="11-{key}" aria-label="{escape(label, quote=True)}" class="{size}"></label>'


faq = '<div class="faq-browser"><div class="browser-strip">File　Edit　View　Go　Bookmarks　Tools　Help</div><div class="faq-address">http://www.kexoticpets.com.hk/FAQs</div><div class="faq-columns"><aside><a>About us</a><a>Site map</a><a>Hospital Hours</a><a>Meet the Staff</a><a>Book an appointment</a><a>Emergency call out</a><a>Store</a><a>Useful contacts</a><a>Letters from our patients</a><img src="assets/page-11-snake.webp" alt="Original snake artwork"></aside><main><h3>Welcome to the Kowloon Exotic Pets Hospital!</h3><p>Below are some frequently asked questions about exotic pets in Hong Kong.</p><h4>FAQs</h4><section><h5>1. What is the definition of an exotic pet?</h5>' + field("definition", "Definition of an exotic pet", "long") + '</section><section><h5>2. What kinds of exotic pets are there in Hong Kong?</h5><ul><li>Spiders, e.g. ' + field("spider-1", "First spider example") + ' or ' + field("spider-2", "Second spider example") + '</li><li>Non-poisonous snakes, e.g. ' + field("snake-1", "First non-poisonous snake example") + ' or ' + field("snake-2", "Second non-poisonous snake example") + '</li><li>Frogs, e.g. ' + field("frog", "Frog example") + '</li>' + ''.join('<li>' + field(f"pet-{i}", f"Other exotic pet example {i}", "long") + '</li>' for i in range(1, 4)) + '</ul></section><section><h5>3. Why do people have exotic pets?</h5><p>Because:</p><ul>' + ''.join('<li>' + field(f"reason-{i}", f"Reason {i} to have an exotic pet", "long") + '</li>' for i in range(1, 6)) + '</ul></section></main></div></div>'
write(11, '<section class="recreated-page answer-book exotic-faq" aria-label="2014 DSE Part B1 question-answer book page 1"><div class="answer-book-header"><span>HKDSE 2014 · ENGLISH LANGUAGE · PAPER 3 PART B1 · Question-Answer Book</span><strong>B1</strong></div><h3>Task 5: Webpage <small>(18 marks)</small></h3>' + b("Complete the Kowloon Exotic Pets Hospital’s introductory webpage using information from the B1 Data File and your notes.", "利用乙部一資料檔及筆記完成九龍珍奇寵物醫院的介紹網頁。") + faq + '<p class="answer-end">END OF TASK 5</p></section>')


def answer_box(page, task, subtitle, translated, intro="", height=650):
    count_id = f"2014-b1-p{page}-{task}"
    heading = f'<h3>{escape(subtitle)}</h3>' if subtitle else ''
    return f'<section class="recreated-page answer-book" aria-label="2014 DSE Part B1 question-answer book page {page-10}">{heading}' + intro + f'<p class="translation" lang="zh-Hant">{escape(translated)}</p><label class="answer-field" for="{count_id}">{escape(subtitle or task + " continued")}</label><textarea class="answer-box" id="{count_id}" data-note="{page}-{task}" data-count-id="{count_id}" aria-label="{escape(task, quote=True)}" style="min-height:{height}px"></textarea><p class="answer-count" data-count-for="{count_id}">0 words</p>'


write(12, answer_box(12, "task6", "Task 6: Reply letter (18 marks)", "任務 6：回覆 Eunice Cheung 的信。", b("Write your reply letter to Mrs. Eunice Cheung using information from the B1 Data File and your notes. You do not need to write an address. Write around 120 words.", "利用乙部一資料檔及筆記寫回信給 Eunice Cheung 太太。毋須寫地址，約 120 字。")) + '</section>')
write(13, answer_box(13, "task6-cont", "Task 6: Reply letter, continued", "任務 6：回信續頁。", height=300) + '<p class="answer-end">END OF TASK 6</p><h3>Task 7: Report <small>(18 marks)</small></h3>' + b("Write your report for Kerry Lam using information from the B1 Data File. Write around 150 words.", "利用乙部一資料檔寫報告給 Kerry Lam，約 150 字。") + '<h4>Virtual Pets: A Report</h4><label class="answer-field" for="2014-b1-p13-task7">Task 7 report</label><textarea class="answer-box" id="2014-b1-p13-task7" data-note="13-task7" data-count-id="2014-b1-p13-task7" aria-label="Task 7 report" style="min-height:420px"></textarea><p class="answer-count" data-count-for="2014-b1-p13-task7">0 words</p></section>')
write(14, answer_box(14, "task7-cont", "Task 7: Report, continued", "任務 7：報告續頁。", height=700) + '<p class="answer-end">END OF TASK 7<br>END OF PART B1</p></section>')
