"""Hand-authored native documents for the 2023 Teen NetChef TV B2 paper."""
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent / 'layouts'


def put(n, html):
    (ROOT / f'2023-b2-page-{n:02}.html').write_text(html.rstrip() + '\n', encoding='utf-8')


def bi(en, zh):
    return f'<div class="bilingual"><p lang="en">{escape(en)}</p><p class="translation" lang="zh-Hant">{escape(zh)}</p></div>'


def answer(n, key, label, height=350):
    ident = f'2023-b2-{n}-{key}'
    return (f'<label class="answer-field" for="{ident}">{escape(label)}</label>'
            f'<textarea class="answer-box" id="{ident}" data-note="{n}-{key}" data-count-id="{ident}" '
            f'style="min-height:{height}px" aria-label="{escape(label, quote=True)}"></textarea>'
            f'<p class="answer-count" data-count-for="{ident}">0 words</p>')


cover = (ROOT / '2023-b1-page-01.html').read_text(encoding='utf-8')
cover = cover.replace('Part B1', 'Part B2').replace('PART B1', 'PART B2').replace('EASY SECTION', 'DIFFICULT SECTION').replace('乙部一', '乙部二')
cover = cover.replace('Part B2 (Tasks 5 – 7)', 'Part B1 (Tasks 5 – 7)').replace('乙部二（任務 5 至 7）', '乙部一（任務 5 至 7）')
cover = cover.replace('either B2 or B2', 'either B1 or B2').replace('乙部二或乙部二', '乙部一或乙部二')
put(1, cover)

situation = [
    ('You are Nico Lin. You work at the internet TV company Teen NetChef TV that makes streaming TV shows in Hong Kong. You assist Mr Archie Li, the Marketing Manager for Teen NetChef TV. You have been asked to complete some tasks.', '你是 Nico Lin，任職於香港串流節目公司 Teen NetChef TV，協助市場經理 Archie Li 處理工作。'),
    ('You will listen to a recording of an online staff meeting between the show producer Ms Winnie Tang, the Director of Teen NetChef TV Mr Dante Cruz, and Archie Li. Take notes under the appropriate headings. Before the recording is played, you will have five minutes to study the Question-Answer Book and the Data File to familiarise yourself with the situation and the tasks.', '你將聽到製作人 Winnie Tang、總監 Dante Cruz 和 Archie Li 的網上員工會議。按標題記筆記。錄音開始前有五分鐘閱讀問答冊和資料檔。'),
    ('Complete the tasks by following the instructions in the Question-Answer Book and on the recording. You will find all the information you need in the Question-Answer Book, the Data File and on the recording. As you listen you can make notes on page 3 of the Data File.', '按照問答冊和錄音指示完成任務。所需資料均載於問答冊、資料檔和錄音；聆聽時可在資料檔第 3 頁記筆記。'),
    ('You now have five minutes to familiarise yourself with the Question-Answer Book and the Data File.', '現在有五分鐘熟悉問答冊和資料檔。'),
]
toc = [(3, 'Listening note-taking sheet for online staff meeting'), (4, 'Email from Archie Li to Nico Lin'), (5, 'Big Cheese Celebrity Food Gossip article'), (6, 'Draft storyboard for the promotional video, with Dante Cruz’s comments'), (7, 'Chat between William Puddle and Archie Li'), (8, 'All staff weekly email from Dante Cruz'), (9, 'Corporate Training Intranet page'), (10, 'Corporate Training: reviews from previous participants')]
put(2, '<section class="recreated-page situation-page" aria-label="2023 B2 situation and contents"><div class="situation-box"><h2>Part B</h2><h3>Situation</h3>' + ''.join(bi(*x) for x in situation) + '</div><div class="contents-box"><h3>Contents</h3><ol>' + ''.join(f'<li><a href="#page-{n}">{escape(label)} <span>{n}</span></a></li>' for n, label in toc) + '</ol></div></section>')

notes = [('Live, Study, Cook', '《Live, Study, Cook》'), ('Filming schedule', '拍攝時間表'), ('Kinds of food in the competition', '比賽食物種類'), ('William Puddle’s viral video', 'William Puddle 的爆紅影片'), ('Golden Sun Tower Private Kitchen complaints', 'Golden Sun Tower Private Kitchen 投訴'), ('New show: Viewer’s Choice', '新節目：《Viewer’s Choice》')]
put(3, '<section class="recreated-page conference-notes" aria-label="Online staff meeting notes"><h2>Listening note-taking sheet for online staff meeting</h2>' + bi('Listen to the recording of an online staff meeting between the show producer Ms Winnie Tang, the Director of Teen NetChef TV Mr Dante Cruz, and the Marketing Manager Mr Archie Li.', '聆聽製作人 Winnie Tang、總監 Dante Cruz 和市場經理 Archie Li 的網上員工會議。') + '<div class="notes-form-body">' + ''.join(f'<h3>{escape(en)}</h3><p class="translation" lang="zh-Hant">{escape(zh)}</p><textarea data-note="3-{i}" rows="4" aria-label="Notes: {escape(en, quote=True)}"></textarea>' for i, (en, zh) in enumerate(notes, 1)) + '</div></section>')

archie = [
    ('Dear Nico,', 'Nico：'), ('Here are your tasks for today.', '以下是你今天的工作。'),
    ('I need you to write the announcement for our website to show our support for Teen NetChef TV star William Puddle. His cooking video went viral recently, for all the wrong reasons: see the article from Big Cheese Celebrity Food Gossip that I’ve sent you. I’ve discussed this in a chat with William, which I’ll send to you as well, so we can present his side of the story. Make sure you acknowledge and explain William’s mistake, but also explain the misunderstandings that people have about the other events in the video.', '請為網站撰寫公告，表示我們支持 Teen NetChef TV 明星 William Puddle。他最近的烹飪影片因負面原因爆紅；請參閱我轉給你的《Big Cheese Celebrity Food Gossip》文章。我也和 William 聊過，會把對話轉給你，以呈現他的說法。要承認並解釋他的失誤，也要釐清影片其他事件的誤解。'),
    ('I also need you to write an email to all staff to recommend training courses for the coming year. Dante Cruz’s most recent email sets the scene for this, so take a look at that first. All the available courses have been posted on our Corporate Training Intranet page, along with reviews from previous participants. Three courses will be enough: briefly describe the three courses staff should sign up for (I think it’s pretty clear which three stand out) and explain how their work will benefit from each one.', '還請向全體員工發電郵，推薦來年的培訓課程。先看 Dante Cruz 最近的電郵，再參閱公司內聯網的課程資料及過往學員評語。推薦三門最合適的課程，簡述內容及各自如何幫助工作。'),
    ('Next, please write the script for the promotional video for our new cookery show Viewer’s Choice. I’ve sent you a draft of the storyboard for the video, along with comments from Dante, so you know what to write about. Be careful, though: we’ve made several changes since that draft. Make sure you have the most up-to-date information in your script. I remember both William and Dante giving some updates recently.', '接著，請為新烹飪節目《Viewer’s Choice》的宣傳片撰寫劇本。我已寄上分鏡草稿及 Dante 的評語。草稿完成後有幾項改動，務必使用最新資料；William 和 Dante 最近都提供過更新。'),
    ('Finally, we discussed all of the above at the most recent online staff meeting. I’ve sent you the recording (I’m still working on the minutes). Listen to our discussion.', '以上事項亦在最近的網上員工會議討論過。我已寄錄音，會議紀錄仍在整理；請聆聽討論。'), ('Thanks,', '謝謝。')]
put(4, '<section class="recreated-page chef-email" aria-label="Archie Li email"><h2>Email from Archie Li to Nico Lin</h2><div class="email-window"><div class="email-toolbar">File　 Message <span>Junk　 Delete　 Reply　 Reply All　 Forward　 Move　 Mark Unread　 Follow up</span></div><div class="email-headers"><div><strong>To:</strong> Nico Lin</div><div><strong>Sent:</strong> 22nd April 2023 9:02 AM</div><div><strong>From:</strong> Archie Li</div><div><strong>Subject:</strong> Things to do</div></div><div class="email-content">' + ''.join(bi(*x) for x in archie) + '<p>Archie</p></div></div></section>')

article = [
    ('Viewers expressed shock on Monday at the disasters that befell celebrity chef William Puddle in the Teen NetChef TV test kitchen. The video, showing a series of calamitous mistakes, quickly went viral after appearing on Puddle’s social media accounts.', '觀眾對名廚 William Puddle 周一在 Teen NetChef TV 測試廚房接連出錯感到震驚。影片在他的社交媒體發布後迅速爆紅。'),
    ('The video opens with Puddle seemingly flooding his kitchen without realising it! After turning on the kitchen tap to wash some potatoes, Puddle turns to the camera to talk about the science of cutting onions, with the sink rapidly filling up behind him.', '影片開頭，Puddle 開水龍頭洗薯仔後轉身向鏡頭講解切洋葱的原理，身後的水槽迅速注滿，他似乎毫不察覺。'),
    ('After about thirty seconds, Puddle finally realises his big mistake. The floor is flooded and Puddle is even seen apparently slipping in the mess as he reaches for the tap.', '約三十秒後，他終於發現錯誤。地板已淹水，他伸手關水龍頭時似乎滑倒。'),
    ('Puddle’s poor performance didn’t end there: viewers noticed that after turning off the tap and cleaning up the floor, Puddle chops up some raw chicken. He then starts slicing up the other ingredients without washing his hands.', '觀眾又看到他在關水及清理地板後切生雞肉，接著似乎沒洗手就切其他食材。'),
    ('Experts agree that these shocking safety mistakes set a terrible example to other chefs, especially younger fans.', '專家認為，這些驚人的安全失誤為其他廚師，尤其年輕支持者，樹立壞榜樣。'),
    ('“This is irresponsible behaviour from a TV Chef,” said Sam Cooke, Head Chef of rival streaming show SuperChefTV. “If we allow children to follow Mr Puddle’s example, who knows what could happen?”', '競爭節目《SuperChefTV》主廚 Sam Cooke 認為，電視廚師這樣做不負責任；孩子模仿，後果難料。'),
    ('Perhaps realising his downfall, Puddle even appears to be crying towards the end of the video. He starts wiping his face with a tea towel, the same one he used to dry the raw chicken.', '影片結尾，他似乎哭了，並用一條看似用來擦乾生雞肉的茶巾擦臉。'),
    ('“His eyes were clearly watering in the video. Someone should not be around dangerous cooking appliances and sharp knives if they can’t control their emotions,” said Cooke.', 'Cooke 說他在影片中明顯淚眼汪汪，不能控制情緒的人不該靠近危險廚具和利刀。'),
    ('Neither Puddle, nor the director of Teen NetChef TV, Mr Dante Cruz, could be reached for comment.', '記者未能聯絡 Puddle 或 Teen NetChef TV 總監 Dante Cruz 置評。'),
    ('With rumours of a new show coming soon, Puddle is surely in hot water after this latest fiasco!', '新節目即將推出的傳聞四起；經此風波，Puddle 恐怕惹上麻煩。')]
put(5, '<section class="recreated-page chef-gossip" aria-label="Big Cheese gossip article"><h2>Big Cheese Celebrity Food Gossip article</h2><article class="gossip-sheet"><h3>Puddle Starts a Flood!</h3><h4>William Puddle’s disastrous cooking video goes viral</h4><time>Tuesday 18th April 2023</time><ul><li>Teen NetChef TV star’s latest video did not go swimmingly</li><li>Can his career survive the soaking?</li></ul>' + bi(*article[0]) + '<h5>Water, water everywhere!</h5>' + ''.join(bi(*x) for x in article[1:3]) + '<h5>“Irresponsible behaviour”</h5><figure><img src="assets/2023-b2-puddle-flood.webp" alt="Original screen-grab of William Puddle cleaning up water in the kitchen"><figcaption><em>Puddle steps in it!</em><br>William Puddle cleans up the mess from the flood in a screen-grab from the viral video.</figcaption></figure>' + ''.join(bi(*x) for x in article[3:6]) + '<h5>Puddles of tears</h5>' + ''.join(bi(*x) for x in article[6:]) + '</article></section>')

storyboard = [
    ('Introduce the show', 'Viewer’s Choice — Ground-breaking TV!', '介紹節目：《Viewer’s Choice》——突破性的電視節目！'),
    ('Introduce the star(s)', 'Our regular chef, plus one mystery guest each week', '介紹明星：固定廚師及每週一位神秘嘉賓。'),
    ('The choices', '', ''),
    ('Episode 1', 'Episode 1 is called “Fruit Pie”', '首集名為《Fruit Pie》。'),
    ('Audience voting', 'The voting hotline number will be on the screen in each episode.', '每集螢幕會顯示投票熱線號碼。'),
    ('The finished dish', 'The finished dish', '完成的菜式。'),
    ('The Big Prize', 'One lucky voter: Message: You’ve won!', '大獎：一名幸運投票者收到中獎訊息。'),
    ('Delivery of the Big Prize', 'The finished dish → straight to your door!', '完成的菜式直接送到你家門！')]
comments = [('1', 'Not good enough: we need to say why it’s ground-breaking!', '未說明節目為何具突破性。'), ('3', 'A little unclear — just explain who chooses what.', '要說清楚由誰選擇甚麼。'), ('4', 'We can include what the main choice will be in Episode 1.', '可加入首集的主要選擇。'), ('8', 'Check which delivery company — some exciting news on this soon!', '核實由哪間公司送餐；很快會有好消息。')]
story_art = {2: 'chef-hat', 3: 'fruit', 6: 'pie', 8: 'scooter'}
put(6, '<section class="recreated-page chef-storyboard" aria-label="Eight-frame promotional storyboard"><h2>Draft storyboard for the promotional video, with Dante Cruz’s comments</h2><div class="story-grid">' + ''.join(f'<div class="story-frame"><h3>{i}. {escape(title)}</h3>' + (f'<img class="story-art" src="assets/2023-b2-{story_art[i]}.webp" alt="Original storyboard {story_art[i]} illustration">' if i in story_art else '') + (bi(en, zh) if en else '') + '</div>' for i, (title, en, zh) in enumerate(storyboard, 1)) + '</div><aside class="story-comments"><h3>Dante Cruz’s comments</h3>' + ''.join(f'<div><strong>Frame {num}</strong>{bi(en, zh)}</div>' for num, en, zh in comments) + '</aside></section>')

chat = [
    ('Archie', 'What were you thinking? Was this some kind of a joke? How did you flood the kitchen?', '你當時在想甚麼？在開玩笑嗎？怎會把廚房弄得水浸？'),
    ('William', 'I’m so sorry! This was my mistake. I forgot to turn off the tap! We’ve just switched from an automatic tap to a manual one and I forgot it wouldn’t turn off by itself! I thought everyone would see the funny side! What did Dante say? Am I still the star of Viewer’s Choice?', '真的很對不起！我忘記關水龍頭。廚房剛把感應式水龍頭換成手動式，我忘了它不會自動關掉。我以為大家會覺得好笑。Dante 怎樣說？我仍是《Viewer’s Choice》的明星嗎？'),
    ('Archie', 'We’ll get to that in a moment. First, tell me what happened with the raw chicken.', '待會再說。先告訴我生雞肉是怎麼回事。'),
    ('William', 'I swear it’s not what it looks like! I was so careful — I always am. I had to edit the video because it was too long — I cut out the parts where I cleaned everything!', '我保證不是看起來那樣！我一向很小心。影片太長，所以我剪掉了清潔各處的片段。'),
    ('Archie', 'And the tea towel? Can you explain that?', '那茶巾呢？你怎樣解釋？'),
    ('William', 'Honestly, I used a clean one! It just looks like I didn’t because I have 150 of the same kind! Don’t you remember? I showed them in my kitchen tour video.', '我真的用了乾淨的一條！只是我有 150 條一模一樣的。你不記得我在廚房導覽影片展示過嗎？'),
    ('Archie', 'Yes, but only your fans know about your other videos, not everybody! All right. Now that we’ve figured out what really happened I’ll get Nico to show our support on the website.', '但只有你的粉絲看過其他影片，不是人人都知道。既然釐清真相，我會請 Nico 在網站表示支持。'),
    ('William', 'Thank you so much! Now let me pay you back: I have some news about the new show that I think might cheer up Dante.', '謝謝！我有新節目的消息，Dante 聽到或許會高興。'),
    ('Archie', 'Go on.', '說吧。'),
    ('William', 'So, we planned to have a different mystery guest each week, right? Well, Mary Steward just called. She says she supports me, she wants to help and she wants to be my co-star!', '原本每週有不同神秘嘉賓，對嗎？Mary Steward 剛來電。她支持我，願意幫忙並做我的聯合主持！'),
    ('Archie', 'Mary Steward? The Queen of TV Cooking? As a co-star?! Well, she just might be able to save you! OK, let’s go with her as the co-star and forget the mystery guest idea. If she confirms soon, we absolutely must include this in the promotion video.', '電視烹飪女王 Mary Steward？做聯合主持？她或許能挽回你的形象！好，就改由她聯合主持，取消神秘嘉賓。待她確認，宣傳片一定要提。'),
    ('William', 'Agreed. Thanks, Archie! That should get the voting hotline ringing!!!', '同意！這應該會令投票熱線響個不停！'),
    ('Archie', 'Did nobody tell you? We decided that viewers will be able to vote for free through the Teen NetChef TV app. We’ve cancelled the voting hotline.', '沒人告訴你嗎？觀眾可以透過 Teen NetChef TV 應用程式免費投票；熱線已取消。'),
    ('William', 'Oh, I see. Good decision!', '啊，明白了。好決定！')]
put(7, '<section class="recreated-page chef-chat" aria-label="William and Archie chat"><h2>Chat between William Puddle and Archie Li</h2><div class="chef-chat-shell"><p class="chat-date">Wednesday 19th April</p>' + ''.join(f'<div class="chef-bubble {speaker.lower()}"><strong>{speaker}:</strong>{bi(en, zh)}</div>' for speaker, en, zh in chat) + '</div></section>')

dante = [
    ('Dear All', '各位同事：'),
    ('Great to hear that you’re all working hard to make our dreams for the new series of Live, Study, Cook a reality. Here are the latest initiatives to make sure that we all keep on track and strive to achieve:', '很高興大家努力把《Live, Study, Cook》新一輯變成現實。以下是讓我們朝目標邁進的最新安排：'),
    ('Those of you who listened to the online staff meeting will have heard that we identified two areas of training that we need urgently. We have since decided to extend both of these to all staff, not just chefs.', '網上會議提到兩項急需培訓的範疇。現決定把這兩項培訓擴展至全體員工，不只廚師。'),
    ('Similarly, staff are encouraged to do food hygiene training. As per our company policy on food hygiene, trainers for this course must be approved by the Health Advisory Board (HAB).', '公司亦鼓勵員工參加食物衞生培訓。根據政策，導師必須獲 Health Advisory Board（HAB）認可。'),
    ('I have informed Human Resources that all training will count as credit towards your Annual Review Targets (ARTs). These will look really good on an appraisal!', '我已通知人事部，所有培訓都可計入年度考核目標（ARTs），有利工作評核。'),
    ('I’m delighted to announce that Mary Steward has confirmed her availability for Viewer’s Choice!', 'Mary Steward 已確認能參與《Viewer’s Choice》。'),
    ('More exciting news: our Big Prize — the finished dish — will be delivered by the food delivery company FlyingFood using a drone. Cutting edge technology!', '更令人興奮的是，大獎——完成的菜式——將由 FlyingFood 用無人機送遞。'),
    ('We’ve agreed that the main choice in Episode 1 will be between apple and blueberry filling. Yum! We should mention this in any promotional materials.', '首集的主要選擇是蘋果或藍莓餡，宣傳材料應提及。'),
    ('Keep up the good work and Bon Appetit!', '繼續努力，祝大家好胃口！')]
sections = [('1. Special training', 2), ('2. Food hygiene training', 3), ('3. Annual Review Targets (ARTs)', 4)]
put(8, '<section class="recreated-page chef-email" aria-label="Dante Cruz weekly email"><h2>All staff weekly email from Dante Cruz</h2><div class="email-window"><div class="email-toolbar">File　 Message <span>Junk　 Delete　 Reply　 Reply All　 Forward　 Move　 Mark Unread　 Follow up</span></div><div class="email-headers"><div><strong>To:</strong> All staff</div><div><strong>Sent:</strong> Thursday 20th April 2023 9:02 AM</div><div><strong>From:</strong> Dante Cruz</div><div><strong>Subject:</strong> Weekly Email</div></div><div class="email-content">' + bi(*dante[0]) + bi(*dante[1]) + ''.join(f'<h3>{escape(title)}</h3>{bi(*dante[i])}' for title, i in sections) + '<h3>4. Viewer’s Choice — updates</h3>' + ''.join(f'<div class="email-update"><strong>{letter})</strong>{bi(*dante[i])}</div>' for letter, i in zip('abc', (5, 6, 7))) + bi(*dante[8]) + '<p>Dante Cruz</p></div></div></section>')

pinafore = [
    ('1. Advanced Fire Safety', 'This course will help develop and manage your staff in the realm of fire safety. We include helpful guidance on how to develop a fire plan as well as the important things to consider when training fire marshals. Finally, we’ve got you covered in maintaining those all-important emergency routes that could be vital in the survival of you and your employees. Sign up today!', '訓練員工處理火警安全：制訂消防計劃、培訓防火員及維持緊急逃生路線。'),
    ('2. Hazard Awareness', 'The kitchen is full of fire hazards and dangers. Can you recognise them all? A professional chef needs all the tricks of the trade to keep everyone safe. This course starts with how to use a fire extinguisher and moves on to how to keep fire exits clear — a must for the next culinary genius!', '認識廚房火警風險，學習使用滅火筒及保持消防出口暢通。'),
    ('3. Food Hygiene Basics', 'Our most popular course: see how to handle raw food and cook at a safe temperature. AFH approval pending!', '基本食物衞生：處理生食及安全烹調溫度；AFH 認可尚在審批。')]
grill = [
    ('A: The Chef’s Special', 'The ultimate food safety guide for adventurous chefs, including “Food Safety 101”: from the test kitchen to the plate™. “Keep it separate, stupid!” is our tongue-in-cheek guide to avoiding cross-contamination in the kitchen, while “Burn those bugs” explains the importance of safe cooking temperatures.', '食物安全課程包括從測試廚房到餐桌、避免交叉污染及安全烹調溫度。'),
    ('B: The Fire Chef’s Manual', 'We cover all the basics to make your alfresco cooking experience as safe as possible. Learn how to light a campfire safely, then we’ll get you ready to use a fire extinguisher when things go wrong. Putting out an oil fire is something that’s more difficult than it looks: we’ll guide you through the tricky process. Trust us to make sure only the food gets burnt™.', '戶外烹飪安全：生營火、使用滅火筒及處理油鍋火警。')]
pr = [
    ('Option 1: Be Your Best!', 'We teach the importance of Crystal Clear Communication™: the art of only saying what you mean and meaning what you say. After this course, you’ll be a social media angel, showing your perfect self, all the time! Our previous graduates include stars of stage and screen, CEOs and KOLs. Yoga mums and fitness dads also welcome!', '教授清晰溝通和社交媒體個人形象；過往學員包括藝人、行政總裁和意見領袖。'),
    ('Option 2: Maximise My Money', 'How to turn your social media feed into a money-spinner? It’s not just about the way you sound, but what your customers can see. Join this course to write like a millionaire™ and monetise your brand today!', '教授透過社交媒體文字與視覺內容打造品牌及賺取收益。')]
def course_rows(rows):
    return ''.join('<article class="course-row"><h4>' + escape(title) + '</h4>' + bi(en, zh) + '</article>' for title, en, zh in rows)
put(9, '<section class="recreated-page chef-courses" aria-label="Corporate training intranet"><h2>Corporate Training Intranet page</h2><div class="course-columns"><article class="course-provider"><small>Course Provider:</small><h3>Pinafore Solutions</h3><em>Life-Proof Professional Chef Training</em>' + bi('Pinafore Solutions offers training and development programmes for culinary staff.', 'Pinafore Solutions 為餐飲員工提供培訓及發展課程。') + '<img class="course-symbols" src="assets/2023-b2-course-icons.webp" alt="Original fire extinguisher, fire exit and chicken illustrations"><h4>Available courses</h4>' + course_rows(pinafore) + '</article><article class="course-provider"><small>Course Provider:</small><h3>The Grill Gurus</h3>' + bi('Need comprehensive chef training for indoor and outdoor chefs? The Grill Gurus can help! Rest assured that your kitchen staff will know how to cook safely for happy kitchens, campfires and barbeques!', 'The Grill Gurus 為室內及戶外廚師提供全面的安全烹飪培訓。') + bi('We run training sessions for the modern adventurous chef. All instructors are HAB approved.', '所有導師均獲 HAB 認可。') + '<h4>Courses</h4>' + course_rows(grill) + '</article></div><article class="course-provider wide"><small>Course Provider:</small><h3>PR Productions</h3><em>Perfecting Dreams for Online Creators</em>' + bi('Let PR Productions pave your path to personal perfection! Online booking is now open. Each course features 5 hours of Zoom sessions with certified Social Media Influencers!', 'PR Productions 的網上預約已開放。每門課均有五小時 Zoom 課堂，由認證社交媒體意見領袖授課。') + course_rows(pr) + '</article></section>')

reviews = [
    ('Food Hygiene Basics', [
        ('I loved, loved, loved this course. They went through everything, in lots of great detail. As a newly-trained chef, this is going to be a massive benefit to me. A bit of a shame that the instructors lost their HAB approval (they’re switching to AFH — the Association of Food Health — next year), but still totally worthwhile as they knew what they were doing.', '內容詳盡，對新入行廚師很有幫助；但導師已失去 HAB 認可，明年轉用 AFH。'),
        ('The instructors gave out some really interesting tips on food safety. Although I liked the course, I thought it was a bit too short. It would have been better to have some time for questions at the end.', '食物安全貼士有用，但課程略短，末段應留時間答問。')]),
    ('The Chef’s Special', [
        ('Yes, great: no complaints. My boss made me do this course. I thought the “101” section, which focused on food hygiene, was really informative, and the “Keep it separate, stupid!” part made me laugh!', '內容很好，食物衞生基礎單元資訊充實，防止交叉污染的部分也有趣。'),
        ('What a fab day! Great tips on how to have a food-safe kitchen. It mostly deals with work settings, though, so nothing I could use at home. Still, it will definitely have its uses in my cooking career as it comes with a professional qualification.', '提供工作廚房食物安全貼士，亦可取得專業資格；家居用途較少。')]),
    ('Hazard Awareness', [('I was feeling really under the weather that day and my mum said I shouldn’t go, but I’m really glad I did in the end as this course has something for everyone, not just chefs. Perseverance really pays off in so many areas of life!', '雖然當天不舒服，但慶幸參加；課程適合所有人，不限廚師。')]),
    ('The Fire Chef’s Manual', [('This was awesome. Jake, the instructor, was super knowledgeable and answered all my questions. He’s a surfer, just like me, so it was really useful to learn about cooking on the beach over an open-air fire. Paradise! My buddy Steve says he thought it was a waste of time because he works at an indoor kitchen. I told him to change jobs! Ha!', '導師知識豐富；課程對海灘營火烹飪有用，但室內廚房員工可能用不上。')]),
    ('Advanced Fire Safety', [
        ('Lots of information, but it’s really only for management-level staff, not for everyone, even though that’s not clear in the course description. I actually fell asleep in the boring online sessions. Must do better, Pinafore Solutions!', '資訊多，但主要適合管理層，而課程介紹沒有說清楚；網課頗沉悶。'),
        ('I understand that fire marshal training is a very serious issue, and we need to train staff properly, but do we really need 25 hours of online talks for this? Inefficient and expensive.', '防火員培訓重要，但二十五小時網上講座耗時費錢。')]),
    ('Be Your Best!', [
        ('O.M.Gosh! What a wonderful course. I’m a fashion blogger and this has already improved my videos. Life’s so much easier now! Also, Jinny, who runs the course, is lovely! Her happy smile kept me motivated day after day.', '時尚博客認為課程改善了影片，導師也親切。'),
        ('This course is absolutely not just for social media stars: I work in PR as well as being a vlogger. Before, I had real trouble communicating in work meetings — not anymore! That purple backdrop was to die for as well — you’ll see what I mean when you log in for the first time. You’re welcome!', '公關與影片博客也受惠，尤其改善了工作會議中的溝通。')]),
    ('Maximise My Money', [('Such a good course — the tips really helped me to maximise my brand and start raking in the profit. I blew my competitors out of the water with deftly-crafted written text and some stunning visuals. Take this together with PR Productions’ course on communication and you’ll be the complete package.', '課程幫助個人品牌盈利，透過精心撰寫的文字與視覺內容勝過競爭對手。')])]
put(10, '<section class="recreated-page chef-reviews" aria-label="Training course reviews"><h2>Corporate Training: reviews from previous participants</h2><div class="review-list">' + ''.join('<article class="review-block"><h3>' + escape(title) + '</h3>' + ''.join(bi(en, zh) for en, zh in entries) + '</article>' for title, entries in reviews) + '</div><p class="source-end">THIS IS THE LAST PAGE OF THE PART B2 DATA FILE</p></section>')

tasks = {11: ('Task 8: Website announcement', '19 marks', 'Write an announcement for the Teen NetChef TV website in support of William Puddle. Use the information from the B2 Data File and your notes. Write around 200 words.', '為 Teen NetChef TV 網站寫公告，支持 William Puddle。運用乙部二資料檔及筆記，約 200 字。', 'Website announcement'), 14: ('Task 9: Staff training email', '17 marks', 'Write an email to inform all staff about training courses. Use the information from the B2 Data File and your notes. Write around 150 words.', '寫電郵通知全體員工培訓課程。運用乙部二資料檔及筆記，約 150 字。', 'Staff training email'), 16: ('Task 10: Video script', '17 marks', 'Write a short script to promote the new streaming TV show Viewer’s Choice. Use the information from the B2 Data File and your notes. Write around 120 words.', '為新串流節目《Viewer’s Choice》撰寫簡短宣傳片劇本。運用乙部二資料檔及筆記，約 120 字。', 'Promotional video script')}
for n, (title, marks, prompt, zh, label) in tasks.items():
    head = '<div class="qab-heading"><span>HKDSE 2023 · ENGLISH LANGUAGE · PAPER 3 PART B2</span><strong>B2 · DIFFICULT SECTION</strong></div>' if n == 11 else ''
    put(n, f'<section class="recreated-page answer-book chef-answer" aria-label="{escape(title, quote=True)}">{head}<h2>{escape(title)} <small>({marks})</small></h2>{bi(prompt, zh)}{answer(n, "response", label, 620)}</section>')
for n, task, end in [(12, 8, ''), (13, 8, 'END OF TASK 8'), (15, 9, 'END OF TASK 9'), (17, 10, ''), (18, 10, 'END OF TASK 10 · END OF PART B2')]:
    put(n, f'<section class="recreated-page answer-book chef-answer" aria-label="Task {task} answer continuation"><h2>Task {task} · Answer continuation</h2><p class="translation" lang="zh-Hant">任務 {task} 續答頁</p>{answer(n, "continuation", f"Task {task} answer continuation", 650)}' + (f'<p class="source-end">{end}</p>' if end else '') + '</section>')
