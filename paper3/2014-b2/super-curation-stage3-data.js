(() => {
  'use strict';

  const timed = window.EDMUND_DSE_LISTENING_2014_TRANSCRIPT?.partB;
  if (!Array.isArray(timed) || timed.length < 86) return;

  const speakerByTurn = Object.freeze({
    9:'Freeman',10:'Freeman',11:'Neelay',12:'Freeman',13:'Wendy',14:'Freeman',15:'Freeman',16:'Freeman',17:'Freeman',
    18:'Neelay',19:'Neelay',20:'Neelay',21:'Wendy',22:'Freeman',23:'Neelay',24:'Freeman',25:'Wendy',26:'Neelay',
    27:'Freeman',28:'Wendy',29:'Freeman',30:'Freeman',31:'Neelay',32:'Freeman',33:'Freeman',34:'Wendy',35:'Wendy',
    36:'Freeman',37:'Wendy',38:'Freeman',39:'Wendy',40:'Freeman',41:'Wendy',42:'Freeman',43:'Wendy',44:'Freeman',
    45:'Neelay',46:'Freeman',47:'Freeman',48:'Freeman',49:'Freeman',50:'Neelay',51:'Freeman',52:'Neelay',
    53:'Freeman',54:'Neelay',55:'Neelay',56:'Freeman',57:'Wendy',58:'Wendy',59:'Freeman',60:'Wendy',
    61:'Freeman',62:'Wendy',63:'Freeman',64:'Freeman',65:'Wendy',66:'Freeman',67:'Wendy',68:'Freeman',
    69:'Freeman',70:'Freeman',71:'Freeman',72:'Neelay',73:'Neelay',74:'Neelay',75:'Freeman',76:'Neelay',
    77:'Neelay',78:'Freeman',79:'Wendy',80:'Freeman',81:'Wendy',82:'Freeman',83:'Freeman',84:'Neelay / Wendy',85:'Freeman'
  });

  // The official speaker-labelled PDF is authoritative for wording and speakers. The
  // definition exchange (turns 16-20) is absent from that PDF, so its text remains the
  // audio-aligned site transcript and is explicitly recorded as an audio-backed repair.
  const correctedText = Object.freeze({
    10:'A warm welcome to Mr. Neelay Shah from the AFCD. Hello and welcome, Neelay.',
    14:"Now, on today’s show, we’re focusing on exotic pets as we’ve had a lot of letters from the Pet Club listeners about these kinds of pets,",
    17:'Maybe you can start, Neelay.',
    30:'Well, are there any more examples of exotic pets? We can’t have a lion, we can have a snake, what else can we have, Neelay?',
    41:"Well, they come from countries like Australia. They’re actually very cute, but we don’t recommend them as pets.",
    44:'Yes, I can see that space is a problem. Maybe best to think very carefully before getting a sugar glider.',
    49:'Neelay, can you answer that one?',
    53:'That’s great. I hope that answers your question, Kenny! Let’s have another email. Neelay, do you want to read this one?',
    64:'But I expect there’s more than that, right, Wendy?',
    71:'Neelay, you have some points you want to remind our listeners about concerning exotic pets.',
    76:'Well, my department does educational work and we tell people to return the pet to the pet shop they bought it from,',
    79:'We have an orphan programme if the pet is no longer wanted—it’s a free service.',
    80:'Yes, the hospital does do a great job. And the programme has been running for 10 years, is that right, Wendy?'
  });

  const traditionalChineseByTurn = Object.freeze({
    9:'歡迎收聽《Pet Club》節目。我是 Freeman Chin；本星期我們很高興請來兩位嘉賓。',
    10:'熱烈歡迎來自漁農自然護理署的 Neelay Shah 先生。Neelay，你好，歡迎你。',
    11:'大家好。',
    12:'亦熱烈歡迎第二位嘉賓 Wendy Yee。她是九龍珍禽異獸寵物醫院的獸醫，專門診治珍奇寵物。',
    13:'大家好。',
    14:'今天節目聚焦珍奇寵物，因為我們收到很多《Pet Club》聽眾來信，詢問這類寵物，',
    15:'今天會選答其中一兩封來信。',
    16:'在正式開始之前，可否請兩位再談談甚麼是珍奇寵物，以及牠們為何受歡迎？',
    17:'Neelay，不如由你先開始。',
    18:'珍奇寵物就是被人飼養作寵物的野生動物。',
    19:'例如，狗或貓不會被界定為珍奇寵物。',
    20:'但蛇之類的動物就是珍奇寵物。',
    21:'對，例如蛇。只要是野生動物，甚至獅子也可算在內。',
    22:'獅子？嘩，真的有人把獅子當寵物養嗎？',
    23:'有，但在香港絕對不能把獅子當寵物飼養，這是違法的。',
    24:'原來如此，不能養獅子。那麼，為甚麼人們想飼養珍奇寵物？',
    25:'通常是因為他們想養一隻與眾不同的寵物，而不是貓狗般普通的寵物。',
    26:'我想，想養與眾不同的寵物是主要原因。不過，有些人飼養珍奇寵物，也是為了令朋友刮目相看。',
    27:'對，我明白為甚麼有人會覺得很厲害。',
    28:'也有人告訴我，這是因為他們可以學到新知識。他們必須認識自己飼養的珍奇寵物。',
    29:'學習是好事。我侄兒養了一條寵物蛇，並深入了解過牠。',
    30:'還有其他珍奇寵物的例子嗎？獅子不能養，蛇可以養；Neelay，還可以養甚麼？',
    31:'可以養蜘蛛，例如狼蛛。',
    32:'噢，我不喜歡蜘蛛。還有其他嗎？Wendy，你是獸醫。',
    33:'你在香港會診治哪些珍奇動物？',
    34:'我們有些客戶飼養小型豬；當然，牠們必須在戶外生活。',
    35:'除了小型豬，我們也會見到青蛙、龜之類的動物。',
    36:'青蛙很可愛，龜就不可愛——至少我不覺得牠們可愛。',
    37:'我的客戶告訴我，他們覺得自己的珍奇寵物很漂亮。這可能是他們飼養珍奇寵物的另一個原因。',
    38:'那就是與眾不同和漂亮。可是，目前香港流行哪些珍奇寵物？',
    39:'最近我們也看到一些新近的物種入口趨勢，例如蜜袋鼯。',
    40:'蜜袋鼯？那是甚麼？',
    41:'牠們來自澳洲等國家。牠們其實很可愛，但我們不建議把牠們當寵物飼養。',
    42:'哦，你們不建議？為甚麼？',
    43:'牠們需要很大的活動空間；香港的住宅實在太小了。',
    44:'對，我明白空間是個問題。那麼，購買蜜袋鼯前最好先慎重考慮。',
    45:'絕對是。',
    46:'好，我們要轉到下一個環節，聽聽幾位聽眾的來信。我們有幾封電郵。',
    47:'第一封來自 Kenny。他寫道：',
    48:'《Pet Club》：我聽說飼養蛇作珍奇寵物很容易，是真的嗎？我應否養蛇作寵物？',
    49:'Neelay，你可以回答這個問題嗎？',
    50:'Kenny，我可以告訴你，在香港飼養某些蛇類是合法的，而且有相當多人飼養牠們。',
    51:'好，那是好消息。蛇容易飼養嗎？食物方面又如何？',
    52:'沒問題。餵蛇其實很容易。先了解你的蛇需要甚麼；可靠的寵物店會協助你並回答你的問題。香港有很多優質寵物店。',
    53:'很好。希望這解答了 Kenny 的問題！我們來看另一封電郵。Neelay，你想讀這一封嗎？',
    54:'好。這封信其實不是關於珍奇動物，而是關於照顧動物。信的內容如下：',
    55:'《Pet Club》：我今年 16 歲，想成為獸醫護士。我對這方面認識不多，但我真的很喜歡動物。你們可以給我一些建議嗎？Pinky 謹啟。',
    56:'Wendy，有人想成為獸醫護士。你是獸醫，有甚麼建議給 Pinky 嗎？',
    57:'當然有。首先，你真的需要喜歡動物，並對牠們感興趣。',
    58:'從你的來信可見，你很愛動物，所以這方面沒有問題。',
    59:'很好。還有其他要求嗎？',
    60:'我認為你需要具備良好的溝通技巧。你不只會與動物接觸，還要善於與人溝通，並處理回覆客戶電郵等工作。',
    61:'這個建議很好。獸醫護士要學習哪些技能？',
    62:'要學的技能很多，其中一項是學習如何處理動物。',
    63:'對，我想你需要懂得如何妥善處理貓隻。',
    64:'不過，應該還不止這些吧，Wendy？',
    65:'當然。你還要學習臨床工作。',
    66:'真的嗎？可以舉些例子嗎？',
    67:'好。臨床工作的一個例子是抽血，也就是如何正確地替動物抽血。',
    68:'聽來是一項很有趣的職業。',
    69:'沒錯。這裏確實有不少事情值得考慮。',
    70:'離開之前，我想再談談珍奇寵物。',
    71:'Neelay，你有幾點關於珍奇寵物的事項想提醒聽眾。',
    72:'對。負責任是非常重要的。',
    73:'如果你無法再飼養一隻珍奇寵物，切勿把牠放生到野外。',
    74:'這幾乎必然會破壞生態系統。',
    75:'糟糕。我們可以阻止人們這樣做嗎？',
    76:'我所屬的部門會進行教育工作，並勸喻人們把寵物交還給原來購買牠的寵物店，',
    77:'或者，他們可以聯絡九龍珍禽異獸寵物醫院。',
    78:'好。Wendy，你們的醫院會如何處理沒有人再願意飼養的珍奇寵物？',
    79:'如果寵物不再有人飼養，我們設有「孤兒計劃」接收牠們；這是一項免費服務。',
    80:'對，醫院的工作確實很出色。這項計劃已推行 10 年，對嗎，Wendy？',
    81:'對，10 年。',
    82:'這是好消息。我們不希望本地生態系統受到破壞。好了，節目時間也差不多了。',
    83:'感謝兩位抽空到訪。',
    84:'謝謝。謝謝。',
    85:'下星期我們會再和大家見面，帶來飼養金魚的最新消息。'
  });

  const transcript = Object.freeze(timed.slice(9, 86).map((turn, offset) => {
    const sourceIndex = offset + 9;
    return Object.freeze({
      id: `p3-turn-${String(offset + 1).padStart(2, '0')}`,
      sourceIndex,
      start: turn.start,
      end: turn.end,
      speaker: speakerByTurn[sourceIndex],
      text: correctedText[sourceIndex] || turn.text,
      translation: traditionalChineseByTurn[sourceIndex],
      provenance: sourceIndex >= 16 && sourceIndex <= 20 ? 'audio-backed-repair' : 'official-speaker-transcript'
    });
  }));

  const cues = [
    {
      id:'p3-cue-01-definition', playbackStart:404.74, sourceStart:459.89, sourceEnd:476.98, field:'3-1',
      title:'珍奇寵物的定義', quote:'an exotic pet is a wild animal, which is a pet',
      highlights:['an exotic pet is a wild animal, which is a pet','a dog or a cat is not classified as an exotic pet','something like a snake is an exotic pet'],
      note:'wild animal kept as a pet (e.g. snake; not dog/cat)', task:null, classification:'listening-only',
      explanation:'定義交流在原始五頁錄音稿中遺漏，但在實際錄音及現有逐句時間稿中清楚可聽見。這一欄仍要做聆聽筆記，但不屬 Task A／B／C 作文取材。',
      help:'先聽完整提問和 Neelay 的三句回答；不要由例子反推未出現的定義。'
    },
    {
      id:'p3-cue-02-unusual', playbackStart:476.98, sourceStart:502.20, sourceEnd:509.50, field:'3-2',
      title:'原因一：想養不尋常的寵物', quote:'they want an unusual pet', highlights:['they want an unusual pet','not something ordinary like a cat or dog'], note:'want an unusual / not ordinary pet', task:null, classification:'listening-only',
      explanation:'unusual 與 not ordinary 是同一個原因，不要重複計兩點。', help:'普通貓狗只作對比。'
    },
    {
      id:'p3-cue-03-impress', playbackStart:509.50, sourceStart:509.98, sourceEnd:517.78, field:'3-2',
      title:'原因二：令朋友留下印象', quote:'impress their friends', note:'impress friends', task:null, classification:'listening-only',
      explanation:'這是 Neelay 在「不尋常」之後補充的另一個獨立原因。', help:'答案寫動詞短語即可。'
    },
    {
      id:'p3-cue-04-learn', playbackStart:517.78, sourceStart:521.94, sourceEnd:529.68, field:'3-2',
      title:'原因三：學習新知識', quote:'learn something new', highlights:['learn something new','learn about their unusual pet'], note:'learn something new about the pet', task:null, classification:'listening-only',
      explanation:'Wendy 說飼主必須了解自己的不尋常寵物。', help:'保留 learn something new 這個核心。'
    },
    {
      id:'p3-cue-05-wolf-spider', playbackStart:529.68, sourceStart:546.22, sourceEnd:550.66, field:'3-3',
      title:'香港例子：wolf spider', quote:'a wolf spider', note:'wolf spider', task:null, classification:'listening-only',
      explanation:'lion 被明確排除為在香港不可合法飼養；wolf spider 才是這段新增的可記例子。', help:'不要把 Freeman 的個人厭惡寫成物種資料。'
    },
    {
      id:'p3-cue-06-small-pigs', playbackStart:550.66, sourceStart:560.57, sourceEnd:565.35, field:'3-3',
      title:'香港例子：small pigs', quote:'clients who have small pigs', highlights:['clients who have small pigs','have to live outside'], note:'small pigs (must live outside)', task:null, classification:'listening-only',
      explanation:'Wendy 以醫院客戶為來源，並補充小豬必須住在戶外。', help:'物種與限制一起記最清楚。'
    },
    {
      id:'p3-cue-07-frogs-turtles', playbackStart:565.35, sourceStart:566.17, sourceEnd:570.17, field:'3-3',
      title:'香港例子：frogs / turtles', quote:'frogs or turtles', note:'frogs / turtles', task:null, classification:'listening-only',
      explanation:'兩個物種在同一句並列，可寫在同一行。', help:'後面「cute／not cute」只是 Freeman 的個人評語。'
    },
    {
      id:'p3-cue-08-beautiful', playbackStart:570.17, sourceStart:577.25, sourceEnd:584.83, field:'3-2',
      title:'原因四：覺得寵物漂亮', quote:'their exotic pets are beautiful', note:'think exotic pets are beautiful', task:null, classification:'listening-only',
      explanation:'這一句雖然出現在物種討論之中，語義上回答的是「飼養原因」，所以寫回 Reasons 欄。', help:'按答案功能歸欄，不要只跟錄音先後位置。'
    },
    {
      id:'p3-cue-09-sugar-gliders', playbackStart:584.83, sourceStart:592.71, sourceEnd:616.73, field:'3-3',
      title:'流行例子：sugar gliders', quote:'recent import trends in species like sugar gliders', note:'sugar gliders — need lots of space; HK flats too small', task:null, classification:'listening-only',
      highlights:['recent import trends in species, like sugar gliders','need a lot of space','Hong Kong flats are just too small'],
      explanation:'sugar gliders 是近期輸入趨勢，但兩位受訪者不建議在香港飼養，原因是空間不足。', help:'把物種與關鍵限制連在同一行；不要把 cute 當成建議飼養。'
    },
    {
      id:'p3-cue-10-snakes-legal', playbackStart:616.73, sourceStart:647.61, sourceEnd:655.99, field:'3-4',
      title:'Email 1：部分蛇隻合法', quote:'it’s legal to have some snakes in Hong Kong', highlights:['it’s legal to have some snakes in Hong Kong','quite a lot of people have them'], note:'some snakes are legal in Hong Kong; many people keep them', task:null, classification:'listening-only',
      explanation:'some 是重要限定，不能改成所有蛇都合法。', help:'保留量詞 some。'
    },
    {
      id:'p3-cue-11-snake-feeding', playbackStart:655.99, sourceStart:661.65, sourceEnd:673.58, field:'3-4',
      title:'Email 1：餵飼容易並可向寵物店求助', quote:'Feeding a snake is really easy', note:'feeding is easy; ask a good pet shop what the snake needs', task:null, classification:'listening-only',
      highlights:['Feeding a snake is really easy','Find out what your snake needs','A good pet shop will help you and answer questions'],
      explanation:'Neelay 的建議包含先了解蛇的需要，再向可靠寵物店提問。', help:'lots of good pet shops 是背景，不必另拆成答案。'
    },
    {
      id:'p3-cue-12-like-animals', playbackStart:673.58, sourceStart:709.18, sourceEnd:720.36, field:'3-5',
      title:'Email 2：喜歡並對動物有興趣', quote:'like animals and be interested in them', note:'like animals and be interested in them', task:'A', classification:'task-evidence',
      explanation:'這是資訊頁可用的專業素質；Pinky 的來信已顯示她符合。', help:'把「喜歡」與「有興趣」保留為同一項要求。'
    },
    {
      id:'p3-cue-13-communication', playbackStart:720.36, sourceStart:723.10, sourceEnd:735.30, field:'3-5',
      title:'Email 2：良好溝通能力', quote:'good communication skills', note:'good communication skills — talk to people; answer client emails', task:'A', classification:'task-evidence',
      highlights:['good communication skills','talking to people','answering client emails'],
      explanation:'獸醫護士不只與動物互動，也要與人溝通並回覆客戶電郵。', help:'核心素質和兩個具體例子要連在一起。'
    },
    {
      id:'p3-cue-14-handle-animals', playbackStart:735.30, sourceStart:741.51, sourceEnd:745.93, field:'3-5',
      title:'Email 2：學習處理動物', quote:'Learning how to handle the animals', note:'learn how to handle animals', task:'A', classification:'task-evidence',
      explanation:'這是課程／工作技能，不要誤寫成只處理貓。貓只是 Freeman 的例子。', help:'用泛稱 animals 保持原意。'
    },
    {
      id:'p3-cue-15-clinical-duties', playbackStart:745.93, sourceStart:754.19, sourceEnd:767.09, field:'3-5',
      title:'Email 2：臨床職責及抽血', quote:'You learn clinical duties', note:'clinical duties — e.g. take blood correctly from an animal', task:'A', classification:'task-evidence',
      highlights:['clinical duties','taking blood','correctly take blood from an animal'],
      explanation:'clinical duties 是上位概念；taking blood 是明確例子。', help:'不要把「interesting career」當成職責。'
    },
    {
      id:'p3-cue-16-no-release', playbackStart:767.09, sourceStart:785.73, sourceEnd:797.75, field:'3-6',
      title:'負責任飼養：不可放生', quote:'you should not let it go into the wild', note:'do not release unwanted pets into the wild — damages ecosystem', task:'C', classification:'task-evidence',
      highlights:['should not let it go into the wild','damage the ecosystem'],
      explanation:'放生會破壞生態系統，是 Task C 回應批評時可用的責任飼養背景。', help:'把禁令和後果連在同一行。'
    },
    {
      id:'p3-cue-17-return-shop', playbackStart:797.75, sourceStart:801.81, sourceEnd:808.87, field:'3-6',
      title:'處理方法一：退回原寵物店', quote:'return the pet to the pet shop they bought it from', note:'return unwanted pet to the shop it came from', task:'C', classification:'task-evidence',
      explanation:'AFCD 的教育工作包含叫飼主把寵物退回原購買店舖。', help:'保留原店舖這個限制。'
    },
    {
      id:'p3-cue-18-contact-hospital', playbackStart:808.87, sourceStart:809.21, sourceEnd:812.73, field:'3-6',
      title:'處理方法二：聯絡醫院', quote:'contact the Kowloon Exotic Pets Hospital', note:'contact Kowloon Exotic Pets Hospital', task:'C', classification:'task-evidence',
      explanation:'這一句把問題直接導向醫院服務，是下一個 Orphan Programme 答案的來源路線。', help:'先記聯絡對象，下一段再記具體服務。'
    },
    {
      id:'p3-cue-19-orphan-programme', playbackStart:812.73, sourceStart:819.09, sourceEnd:824.41, field:'3-6',
      title:'醫院服務：免費 Orphan Programme', quote:'an orphan programme', note:'Orphan Programme for unwanted pets — free service', task:'C', classification:'task-evidence',
      highlights:['an orphan programme','the pet is no longer wanted','a free service'],
      explanation:'這是醫院為不再被飼養的珍奇寵物提供的免費服務，直接支援 Task C 的 voluntary work。', help:'programme 名稱、服務對象和 free 都要保留。'
    },
    {
      id:'p3-cue-20-ten-years', playbackStart:824.41, sourceStart:824.41, sourceEnd:832.83, field:'3-6',
      title:'服務年期：10 年', quote:'the programme has been running for 10 years', note:'programme has run for 10 years', task:'C', classification:'task-evidence',
      highlights:['the programme has been running for 10 years','Yes, 10 years'],
      explanation:'Freeman 提出年期，Wendy 隨即確認「Yes, 10 years」。', help:'只有確認後才寫入 10 years。'
    },
    {
      id:'p3-cue-21-end', playbackStart:832.83, sourceStart:833.07, sourceEnd:849.81, field:null,
      title:'Podcast 完結 · 核對六欄筆記', quote:'we’ll be back next week', note:null, task:null, classification:'listening-only', final:true,
      explanation:'錄音以感謝嘉賓及下週 goldfish 預告結束；這段不新增筆記答案。', help:'完成後可自由重播任何停頓點，或在逐句稿中核對來源。'
    }
  ].map((cue, index, list) => Object.freeze({...cue, index, number:index + 1, nextPlaybackStart:list[index - 1]?.sourceEnd ?? cue.playbackStart}));

  const fields = Object.freeze({
    '3-1':'Exotic pets — Definition',
    '3-2':'Reasons to have an exotic pet',
    '3-3':'Examples of exotic pets in Hong Kong',
    '3-4':'Email 1',
    '3-5':'Email 2',
    '3-6':'Advice for exotic pet owners'
  });

  window.EDMUND_2014_B2_CURATION_STAGE3 = Object.freeze({
    version:'2014-b2-super-curation-stage3-v1',
    architecture:'2014-podcast-v1-continuous-single-owner',
    audio:Object.freeze({
      url:'https://edmund-neural-audio.edmundeducation.workers.dev/DSE%20Listening%20-%20Recordings/DSE%202014%20Part%20B.mp3',
      mediaDuration:871.816417,
      segmentStart:404.74,
      segmentEnd:849.81,
      segmentDuration:445.07,
      sha256:'a9250b858e1f87df4a30d2de594e0330d560a7eb8d19352ea234acef10b2b3b5'
    }),
    fields,
    transcript,
    cues:Object.freeze(cues),
    sourceNote:'Speaker labels and wording follow the supplied 2014 Podcast Recording Transcript PDF; turn timing follows the site timed transcript aligned to the actual MP3. Turns 16–20 are an explicitly logged audio-backed repair for the definition exchange omitted from the supplied PDF.'
  });
})();
