// Editorial source for newly authored, source-bank-free Proverb lessons.
// The Oxford thematic index supplies the requested titles; teaching scenes are original.
const p=(zh,en)=>({zh,en});
const o=(zh,en,reasonZh,correct=false)=>({zh,en,reasonZh,correct});
const c=(prompt,options)=>({prompt,options});

export const newProverbs=[
  {
    id:'proverb-04',titleEn:'Absence Makes the Heart Grow Fonder',titleZh:'小別勝新婚',slug:'absence-makes-the-heart-grow-fonder',
    sense:'People may feel more affection for someone while they are apart and miss that person.',
    guide:{
      meaning:p('與在乎的人分開一段時間後，可能因為掛念而更珍惜對方。','Time apart can make someone miss and value a loved person more.'),
      model:p('阿澄去外地實習後，反而更期待每週與祖母通話。','While Cheng was away on placement, she looked forward to her weekly calls with her grandmother even more—absence makes the heart grow fonder.'),
      picture:p('兩人相隔一段路；距離讓其中一人更清楚感到對方的重要。','Imagine two people on opposite sides of a road: time apart makes one more aware of the other’s value.'),
      boundary:p('分開不保證感情加深；要有「更掛念或更珍惜」的線索。','Separation alone is insufficient: the scene must show increased affection or longing.'),
      where:p('適合談親友或伴侶暫時分開後更思念對方；不要用它催促別人接受不想要的分離。','Use it for growing fondness during a temporary separation, not to dismiss someone’s distress about being apart.'),
      tone:p('通常溫暖、帶安慰意味；也可能只是描述個人的感受。','Usually warm or reassuring; it can also be a simple personal observation.'),
      checks:[p('誰與誰分開？','Who is apart?'),p('哪個細節顯示掛念增加？','What shows increased affection?'),p('我有把可能性說成必然嗎？','Am I turning a possibility into a rule?')],
      readAloud:p('哥哥離家讀書後，我們更珍惜每月一起吃晚飯的時間。','Since my brother moved away for college, our monthly dinners have meant more to us—absence makes the heart grow fonder.'),
      choices:{
        2:c(p('哪個情境真正支持這句諺語？','Which scene supports the proverb?'),[
          o('她離家三週後，比以前更期待聽到父親的聲音。','After three weeks away, she longs to hear her father’s voice more than before.','分開與掛念增加都有交代。',true),
          o('她離家三週，卻沒有說自己對父親的感受。','She has been away for three weeks; nothing is said about her feelings for her father.','只有距離，沒有感情變化的證據。'),
          o('她每天都與父親同住，兩人仍然親近。','She still lives with her father and they remain close.','親近不等於因分開而更掛念。')]),
        3:c(p('朋友因暫時分開而難過，哪個回應比較體貼？','A friend is upset about a temporary separation. Which reply is considerate?'),[
          o('「你很想念她；我們可以一起安排下次見面。」','“You miss her. Shall we plan when you can meet again?”','先承認感受，再提供實際支持。',true),
          o('「小別勝新婚，所以你根本不用難過。」','“Absence makes the heart grow fonder, so you have no reason to feel sad.”','諺語不能否定對方當下的難過。'),
          o('「既然你想念她，就證明所有分離都有好處。」','“Because you miss her, every separation must be good.”','個人的感受不能證明所有分離都有益。')]),
        5:c(p('兩個朋友分開後更珍惜重聚。哪一句最自然？','Two friends value their reunions more after living apart. Which line sounds natural?'),[
          o('「我們現在更期待見面；看來小別勝新婚。」','“We look forward to seeing each other even more now—absence makes the heart grow fonder.”','說出重聚更受珍惜的變化。',true),
          o('「我們從沒分開過；看來小別勝新婚。」','“We have never been apart—absence makes the heart grow fonder.”','沒有分開，缺少諺語的必要條件。'),
          o('「我們分開後完全忘了對方；看來小別勝新婚。」','“We forgot each other completely while apart—absence makes the heart grow fonder.”','淡忘與更掛念相反。')]),
        6:c(p('哪個說法沒有超出諺語的意思？','Which claim stays within the proverb’s meaning?'),[
          o('「對某些人而言，暫別可能令感情更深。」','“For some people, time apart may deepen affection.”','保留了個人差異與可能性。',true),
          o('「只要分開，感情一定會變得更深。」','“Whenever people separate, their affection must grow.”','把常見可能性誤說成必然。'),
          o('「彼此不聯絡，就一定能修好任何關係。」','“No contact is guaranteed to repair any relationship.”','諺語沒有保證修復關係。')])
      }
    }
  },
  {
    id:'proverb-05',titleEn:'He Who Is Absent Is Always in the Wrong',titleZh:'人不在場，容易被怪責',slug:'he-who-is-absent-is-always-in-the-wrong',
    sense:'People who are not present may be blamed because they cannot explain or defend their side.',
    guide:{
      meaning:p('某人不在場、不能說明自己的立場時，其他人容易把錯推到他身上。','An absent person may be blamed unfairly because they cannot present their side.'),
      model:p('開會時阿傑不在，大家便把延誤歸咎於他，卻沒有人核對紀錄。','Jay missed the meeting, and the group blamed him for the delay without checking the record—he who is absent is always in the wrong.'),
      picture:p('想像一張空椅子：旁人都在發言，椅子的主人無法回應。','Picture an empty chair while everyone else speaks; its owner cannot answer back.'),
      boundary:p('諺語描述被指責的處境，不證明缺席者真的犯錯。','The proverb describes an unfair advantage for those present; it does not prove the absent person guilty.'),
      where:p('適合提醒團隊先聽缺席者的說法，再決定責任。','Use it to urge a group to hear the absent person before assigning blame.'),
      tone:p('常帶批評或警惕意味，並非替所有缺席者開脫。','Often critical or cautionary; it does not excuse every absent person.'),
      checks:[p('誰沒有機會回應？','Who cannot answer?'),p('責任是證實了，還是被推定？','Is fault established or assumed?'),p('我有沒有先核對另一方說法？','Have I checked the other side?')],
      readAloud:p('不要因為安妮今天請假，就把遺失的文件算在她頭上。','Let’s hear Annie’s account before blaming her for the missing file—he who is absent is always in the wrong.'),
      choices:{
        2:c(p('哪個情境顯示缺席者容易被錯怪？','Which scene shows the risk described by the proverb?'),[
          o('會議只聽到一方說法，就指責了請假的同事。','A meeting blames a colleague who is on leave after hearing only one side.','缺席者無法回應，責任卻已被分配。',true),
          o('同事在場承認自己弄丟了文件。','The colleague is present and admits losing the file.','這是當面承認，不是因缺席而被推責。'),
          o('會議延後結論，等待請假的同事說明。','The meeting postpones its conclusion until the absent colleague can speak.','團隊避免了諺語所警告的偏差。')]),
        3:c(p('有人指責不在場的同學，你應如何回應？','Someone blames an absent classmate. How should you respond?'),[
          o('「先聽他說明，別只憑一方說法定責。」','“Let’s hear his account before deciding who was responsible.”','讓缺席者有機會說明。',true),
          o('「他不在場，所以一定是他做錯。」','“He is absent, so he must be at fault.”','把不能自辯誤當作犯錯證據。'),
          o('「他不在場，所以一定完全無辜。」','“He is absent, so he must be completely innocent.”','諺語也不能證明無辜。')]),
        5:c(p('報告出錯時，唯一缺席的編輯立即被怪責。哪句最貼切？','The only absent editor is immediately blamed for an error. Which line fits?'),[
          o('「先別急著怪責她；人不在場，最容易被說成有錯。」','“Let’s not blame her before checking—he who is absent is always in the wrong.”','用諺語提醒大家不要作單方面判斷。',true),
          o('「她已承認出錯；人不在場，最容易被說成有錯。」','“She has admitted the error—he who is absent is always in the wrong.”','題目沒有說她承認出錯。'),
          o('「我們已聽過她的解釋；人不在場，最容易被說成有錯。」','“We have heard her explanation—he who is absent is always in the wrong.”','她尚未有機會回應。')]),
        6:c(p('哪個推論有根據？','Which inference is justified?'),[
          o('「缺席的人可能遭到不公平指責；仍須查證事實。」','“An absent person may be blamed unfairly; the facts still need checking.”','區分被指責與真正有錯。',true),
          o('「被指責就證明缺席的人有罪。」','“Being blamed proves that the absent person was guilty.”','指責本身不是證據。'),
          o('「缺席的人永遠不會犯錯。」','“Absent people can never be responsible.”','諺語沒有這種保證。')])
      }
    }
  },
  {
    id:'proverb-06',titleEn:'The Best of Friends Must Part',titleZh:'再好的朋友也有分別時',slug:'the-best-of-friends-must-part',
    sense:'Even very close friends sometimes have to say goodbye or live apart.',
    guide:{
      meaning:p('再親近的朋友，也會有暫時或長久分別的時候。','Even very close friends sometimes have to part.'),
      model:p('畢業禮後，兩位多年的好友要到不同城市升學。','After graduation, the two old friends were heading to different cities—the best of friends must part.'),
      picture:p('想像兩條路在同一個路口分開；情誼可以保留，行程卻不同。','Picture two paths dividing at a junction; the friendship can remain even as journeys diverge.'),
      boundary:p('「分別」不等於吵架、絕交或永不再見。','Parting does not itself mean a quarrel, a broken friendship, or never meeting again.'),
      where:p('適合畢業、搬遷、旅程結束等告別場合；對剛失去親友的人須留意語氣。','Use it for graduation, moving away, or the end of a visit; speak gently around bereavement.'),
      tone:p('通常帶傷感但可作溫柔的接受，不是責怪朋友離開。','Usually wistful yet accepting, not a rebuke to the departing friend.'),
      checks:[p('這真是朋友分別的時刻嗎？','Are friends actually parting?'),p('我有沒有誤指關係破裂？','Am I implying a broken bond?'),p('場合需要安慰，還是需要實際安排？','Does the moment call for comfort or plans?')],
      readAloud:p('列車快開了，兩個從小認識的朋友最後擁抱道別。','The train was leaving, so the childhood friends hugged goodbye—the best of friends must part.'),
      choices:{
        2:c(p('哪個情境最適合？','Which situation fits best?'),[
          o('兩位好友互相珍惜，但新學期要到不同城市。','Two close friends value each other, but they will study in different cities.','友誼仍在，分別確實發生。',true),
          o('兩位好友同班上課，放學後一起回家。','Two close friends attend the same class and walk home together.','尚未有分別情境。'),
          o('兩人因欺騙而絕交，並說從未是朋友。','Two people end a friendship after a betrayal and deny they were ever friends.','焦點是關係破裂，不是友好而不得不分別。')]),
        3:c(p('好友即將搬走，哪個回應較合適？','A close friend is moving away. Which reply fits the moment?'),[
          o('「我會想你；到埗後我們再約時間通話。」','“I’ll miss you. Let’s arrange a call once you’ve arrived.”','承認不捨，也保留友誼。',true),
          o('「你搬走就代表我們不再是朋友。」','“Moving away means we can no longer be friends.”','把距離誤當作友誼終止。'),
          o('「既然大家終會分別，就不用好好道別。」','“Because friends must part, there is no point saying goodbye properly.”','諺語沒有否定道別的重要。')]),
        5:c(p('營會最後一晚，好友明天要回不同城市。哪句自然？','At the end of camp, close friends return to different cities tomorrow. Which line sounds natural?'),[
          o('「今晚好好道別吧；再好的朋友也有分別時。」','“Let’s say a proper goodbye tonight—the best of friends must part.”','友好與分別兩個事實都保留。',true),
          o('「我們已經絕交；再好的朋友也有分別時。」','“We have ended our friendship—the best of friends must part.”','題目沒有說友誼結束。'),
          o('「明天仍會住在一起；再好的朋友也有分別時。」','“We will still live together tomorrow—the best of friends must part.”','與回不同城市的事實矛盾。')]),
        6:c(p('這句諺語不能證明甚麼？','What does the proverb not establish?'),[
          o('「分開後是否仍保持聯絡，要看兩人的選擇。」','“Whether they keep in touch depends on what they do next.”','諺語只交代分別，沒有預定友誼結果。',true),
          o('「分別必然令友誼立即結束。」','“Parting must immediately end the friendship.”','把分別誤說成絕交。'),
          o('「真正的朋友永遠不會離開同一城市。」','“True friends can never live in different cities.”','親近朋友也可能各走各路。')])
      }
    }
  },
  {
    id:'proverb-07',titleEn:'Blue Are the Hills That Are Far Away',titleZh:'遠山看來格外美',slug:'blue-are-the-hills-that-are-far-away',
    sense:'Distant or unfamiliar things can seem more attractive because their flaws are hard to see.',
    guide:{
      meaning:p('遠方的事物因細節和缺點不易看清，可能顯得特別吸引。','Things far away can seem especially attractive because their difficulties are less visible.'),
      model:p('阿琳只看見海島工作的照片；真正住下來後，才發現交通十分不便。','Lynn loved the photos of island life, but the daily travel proved difficult—blue are the hills that are far away.'),
      picture:p('從遠處看山，輪廓平滑美麗；走近才看見陡坡和碎石。','From afar the hill has a smooth blue outline; up close, the steep path and loose stones come into view.'),
      boundary:p('不是說遠方一定不好，而是提醒人留意距離造成的美化。','The proverb does not say distant places are bad; it warns that distance can hide drawbacks.'),
      where:p('適合比較想像中的城市、工作或生活與親身所見的差異。','Use it when an imagined place, job, or lifestyle looks better from a distance than it does close up.'),
      tone:p('帶反思或輕微警惕；避免對別人的理想抱嘲笑態度。','Reflective or gently cautionary; avoid mocking another person’s hopes.'),
      checks:[p('吸引力是否來自遠觀？','Is the appeal linked to distance?'),p('走近後有甚麼新細節？','What becomes visible up close?'),p('我有沒有把警惕說成否定？','Am I turning caution into dismissal?')],
      readAloud:p('從網上看，那間山中小屋很完美；到場才知道每天要走很遠取水。','The mountain cabin looked perfect online, but we discovered the long walk for water—blue are the hills that are far away.'),
      choices:{
        2:c(p('哪個情境有「遠看更美」的線索？','Which scene contains the distance effect?'),[
          o('她嚮往遠方城市；住下後才發現漫長通勤。','She admired the distant city, then discovered its long commute after moving there.','遠處的想像與近處的實際形成對比。',true),
          o('她一向知道那座城市交通擠塞，仍選擇搬去。','She knew about the crowded transport before choosing to move.','沒有因距離而忽略的缺點。'),
          o('她只看見遠處的山是藍色，沒有其他想法。','She only notices that a distant hill looks blue.','只有字面顏色，沒有被美化的判斷。')]),
        3:c(p('朋友想搬去從未到過的城市，哪個回應最有幫助？','A friend wants to move to a city they have never visited. Which response helps?'),[
          o('「先去住幾天，看看日常生活是否也合你意。」','“Try staying there for a few days and see what everyday life is like.”','提醒查證細節，沒有否定選擇。',true),
          o('「遠山看來格外美，所以那城市一定很糟。」','“Blue are the hills that are far away, so that city must be awful.”','諺語不證明城市不好。'),
          o('「照片漂亮，就證明住在那裏沒有任何困難。」','“The photos look beautiful, so living there cannot be difficult.”','照片不足以涵蓋日常條件。')]),
        5:c(p('廣告中的遠方學校很理想，探訪後卻發現課程不合適。哪句貼切？','A distant school looks ideal in its advert, but a visit reveals the course is unsuitable. Which line fits?'),[
          o('「宣傳照讓它看來完美；遠山看來格外美。」','“The advert made it look perfect—blue are the hills that are far away.”','點出遠觀帶來的美化。',true),
          o('「探訪證明所有遠方學校都不好；遠山看來格外美。」','“The visit proves every distant school is bad—blue are the hills that are far away.”','一間學校不能代表所有遠方學校。'),
          o('「課程完全合適；遠山看來格外美。」','“The course was a perfect fit—blue are the hills that are far away.”','與探訪結果矛盾。')]),
        6:c(p('這句諺語最合理的界線是甚麼？','What is the soundest boundary for this proverb?'),[
          o('「遠處看不清缺點；走近後也可能發現它確實很好。」','“Distance can hide drawbacks; closer inspection might also confirm that something is good.”','避免把警告當作必然失望。',true),
          o('「任何遠方事物都只會令人失望。」','“Everything far away will disappoint us.”','把可能性說成必然。'),
          o('「這句話只可用來談山的顏色。」','“The saying can refer only to the colour of hills.”','忽略比喻用法。')])
      }
    }
  },
  {
    id:'proverb-08',titleEn:'Distance Lends Enchantment to the View',titleZh:'距離使景物更迷人',slug:'distance-lends-enchantment-to-the-view',
    sense:'Distance can make a place, memory, or situation seem more appealing than close inspection would.',
    guide:{
      meaning:p('離得遠時，景物、回憶或生活可能顯得更美好，因為煩難細節不在眼前。','Distance can make a view or imagined experience more appealing by softening its everyday difficulties.'),
      model:p('在外地的阿文懷念舊工作，卻忘了當時天天加班。','Away from home, Man remembered his old job fondly but forgot the daily overtime—distance lends enchantment to the view.'),
      picture:p('遠鏡把雜亂小路縮成一幅漂亮風景。','A distant view turns a messy path into a graceful shape.'),
      boundary:p('這句可談空間或時間造成的美化，不是說遠處的每樣東西都只是幻象。','The distance may be physical or in time; the proverb does not make every distant attraction false.'),
      where:p('適合回望舊工作、遠望旅遊地點或想像陌生生活時提醒自己補看細節。','Use it when recalling a past job or imagining a remote place without its ordinary details.'),
      tone:p('文學味較濃，帶反思和含蓄的提醒；日常口語可改說「遠看比較美」。','Literary and reflective; in casual speech, a plainer paraphrase may sound more natural.'),
      checks:[p('距離令哪個細節模糊？','What detail does distance blur?'),p('是時間距離還是地理距離？','Is the distance in time or place?'),p('我有沒有憑想像斷言現實？','Am I asserting reality from an impression?')],
      readAloud:p('多年後回想宿舍生活，我只記得笑聲，忘記了漏水的天花板。','Years later, I remember the laughter in our old dormitory and forget the leaking ceiling—distance lends enchantment to the view.'),
      choices:{
        2:c(p('哪個情境最能顯示距離美化了印象？','Which scene shows distance making something seem better?'),[
          o('離職多年後，她只記得熱鬧的同事，淡忘了每天的通宵工作。','Years after leaving, she remembers the lively colleagues but forgets the nightly overtime.','時間拉遠後，困難細節被淡化。',true),
          o('她剛離職，清楚記得工作有好也有壞。','She has just left and remembers both the good and the bad clearly.','沒有美化的線索。'),
          o('她從遠處看見燈塔，卻沒評價它。','She sees a lighthouse from afar but makes no judgment about it.','只有物理距離，沒有印象變美。')]),
        3:c(p('朋友懷念以前的學校，卻只提開心片段。哪個回應合宜？','A friend recalls only happy parts of an old school. Which reply is helpful?'),[
          o('「那些回憶很珍貴；你還記得當時的難處嗎？」','“Those memories matter. Do you remember any difficulties as well?”','承認回憶，同時補看被淡化的細節。',true),
          o('「你現在懷念它，證明以前的生活完全沒有困難。」','“Missing it now proves life there had no difficulties.”','懷念不能證明沒有困難。'),
          o('「距離使景物更迷人，所以你的回憶必定是假的。」','“Distance lends enchantment, so your memories must be false.”','美化不等於所有回憶都虛假。')]),
        5:c(p('遠方山屋在照片中很迷人，到場後才見到崎嶇的路。哪句貼切？','A remote cabin looks lovely in photos; on arrival, the rough road appears. Which line fits?'),[
          o('「照片沒拍到那條路；距離使景物更迷人。」','“The photos hid the rough road—distance lends enchantment to the view.”','把遠觀與近處新見的困難連起來。',true),
          o('「崎嶇的路一開始就清楚拍出；距離使景物更迷人。」','“The rough road was clearly shown from the start—distance lends enchantment to the view.”','與照片沒有呈現道路的事實相反。'),
          o('「照片證明山屋不能居住；距離使景物更迷人。」','“The photos prove the cabin cannot be lived in—distance lends enchantment to the view.”','題目只交代道路崎嶇，沒有不能居住的證據。')]),
        6:c(p('哪個判斷最準確？','Which judgment is most accurate?'),[
          o('「遠觀可能令缺點不顯眼，仍須查證具體情況。」','“Distance may hide drawbacks, so we should check the details.”','保留可能性和查證空間。',true),
          o('「看得遠，就必然看得更清楚。」','“The farther away we are, the more accurately we see.”','與諺語提醒的認知偏差相反。'),
          o('「凡是遠處看來美的東西，近看必定很差。」','“Anything attractive from afar must be poor up close.”','把可能的落差說成必然。')])
      }
    }
  },
  {
    id:'proverb-09',titleEn:'After the Feast Comes the Reckoning',titleZh:'享樂之後，還得算帳',slug:'after-the-feast-comes-the-reckoning',
    sense:'A period of pleasure or indulgence may be followed by a cost or consequence.',
    guide:{
      meaning:p('享樂或放縱過後，仍可能要面對開支、責任或其他後果。','Pleasure or indulgence may be followed by a bill, duty, or other consequence.'),
      model:p('派對辦得盡興，第二天大家才整理超支的帳目。','The party was wonderful, but the next day the group faced the overspent budget—after the feast comes the reckoning.'),
      picture:p('宴席散了，桌上留下帳單與待收拾的碗碟。','The guests leave; a bill and dishes remain on the table.'),
      boundary:p('不表示所有快樂都有懲罰，也不只指餐飲帳單。','It does not mean all pleasure deserves punishment, nor is it limited to restaurant bills.'),
      where:p('適合談過度消費、拖延責任或短暫享受後要處理的代價。','Use it for overspending, postponed duties, or the cost following a short-lived pleasure.'),
      tone:p('常帶警惕或自嘲意味；不宜用來責怪遭遇無關苦難的人。','Often cautionary or wry; do not use it to blame someone for an unrelated hardship.'),
      checks:[p('之前有甚麼享樂或放縱？','What pleasure or indulgence came first?'),p('之後有甚麼相連的代價？','What related cost followed?'),p('這代價真由前事引起嗎？','Is the consequence actually connected?')],
      readAloud:p('我們先買了昂貴的演唱會票，月底才發現零用錢不夠。','We bought expensive concert tickets and ran short of money at month’s end—after the feast comes the reckoning.'),
      choices:{
        2:c(p('哪個情境最貼切？','Which scene fits?'),[
          o('全班花光活動經費辦派對，之後要自付展覽交通費。','The class spends its activity fund on a party, then has to pay for the exhibition bus.','先享樂，後來面對與花費有關的代價。',true),
          o('全班用捐款支付巴士費，活動沒有超支。','The class pays for the bus from a donation and stays within budget.','沒有隨享樂而來的代價。'),
          o('巴士在派對前因天氣停駛，與經費無關。','Bad weather stops the bus before the party; the budget is irrelevant.','先後及因果均不符。')]),
        3:c(p('朋友超支後十分懊惱，哪個回應較合宜？','A friend regrets overspending. Which reply is helpful?'),[
          o('「先算清楚款項；下次可預先設限額。」','“Let’s work out what is owed, then set a limit next time.”','面對後果並提出實際做法。',true),
          o('「既然玩得開心，帳單自然不用處理。」','“Because you had fun, the bill no longer matters.”','否認現有責任。'),
          o('「享樂之後，還得算帳，所以你不配得到幫助。」','“After the feast comes the reckoning, so you do not deserve help.”','諺語說明後果，不是剝奪幫助的理由。')]),
        5:c(p('球隊花光旅費升級酒店，回程要自己補付車費。哪句自然？','A team spends its travel fund on a hotel upgrade and must pay its own return fare. Which line fits?'),[
          o('「酒店住得舒服，但回程得補錢：享樂之後，還得算帳。」','“The hotel was lovely, but now we must cover the fare—after the feast comes the reckoning.”','享受和相關開支的先後清楚。',true),
          o('「車費已由贊助商支付：享樂之後，還得算帳。」','“The sponsor paid the return fare—after the feast comes the reckoning.”','與必須自行補付車費矛盾。'),
          o('「酒店升級前，大家已補付回程車費：享樂之後，還得算帳。」','“We covered the return fare before upgrading the hotel—after the feast comes the reckoning.”','把代價與享受的先後倒轉。')]),
        6:c(p('哪個說法保留了諺語的界線？','Which statement respects the proverb’s limits?'),[
          o('「享受後可能要承擔相連的開支或責任。」','“Enjoyment may be followed by a related expense or duty.”','保留了相關後果與可能性。',true),
          o('「每次開心，之後都一定會受罰。」','“Every happy experience must be punished later.”','把可能的代價誇成必然懲罰。'),
          o('「只有吃完飯付帳才可用這句話。」','“The phrase can refer only to paying after a meal.”','忽略比喻用法。')])
      }
    }
  },
  {
    id:'proverb-10',titleEn:'Another Day, Another Dollar',titleZh:'又過一天，又賺一份工錢',slug:'another-day-another-dollar',
    sense:'A wry or weary comment on another ordinary day of work undertaken to earn a living.',
    guide:{
      meaning:p('又完成了一天例行工作，賺取生活所需；語氣常帶疲倦或無奈。','Another routine day of work has brought another day’s pay, often said with weariness or resignation.'),
      model:p('阿朗又做完一班幾乎一模一樣的工作，收好工具後苦笑了一下。','After another nearly identical shift, Long packed up his tools and said, “Another day, another dollar.”'),
      picture:p('日曆翻過一頁，工作簿又添上一筆工錢。','A calendar page turns; a pay ledger gains one more entry.'),
      boundary:p('不只表示「明天會賺一元」，也不是興奮宣告發大財。','It is not a literal promise of one dollar tomorrow, nor a triumphant announcement of wealth.'),
      where:p('適合下班或開始又一個重複工作日的閒談；對別人遇到裁員時不宜輕率使用。','Use it casually after a shift or at the start of another familiar workday; avoid using it lightly around job loss.'),
      tone:p('口語、自嘲或疲倦；偶爾可帶平靜的接受。','Colloquial, wry, or tired; sometimes a quiet acceptance of routine.'),
      checks:[p('情境涉及例行工作嗎？','Is this about routine work?'),p('說話者的語氣是否無奈或平靜？','Is the tone weary or matter-of-fact?'),p('我有否誤解 dollar 的字面金額？','Am I taking “dollar” literally?')],
      readAloud:p('她關掉店裏的燈，望着又填滿一頁的工作紀錄。','She switched off the shop lights and looked at another full page of work records: “Another day, another dollar.”'),
      choices:{
        2:c(p('哪個情境最貼切？','Which scene best fits?'),[
          o('他完成又一班重複的工作，收工時半開玩笑地嘆氣。','He finishes another repetitive shift and sighs wryly as he leaves.','例行工作與略帶疲倦的語氣都吻合。',true),
          o('他第一次中頭獎，興奮地慶祝。','He wins the lottery for the first time and celebrates wildly.','意外橫財與例行工作不符。'),
          o('他把一元硬幣從地上拾起，沒有工作情境。','He picks up a one-dollar coin; no work is involved.','只有字面金額，沒有慣用的工作語境。')]),
        3:c(p('同事下班時說這句，最可能是甚麼語氣？','A colleague says the phrase after a shift. What tone is most likely?'),[
          o('對又一日例行工作的疲倦或自嘲。','Weariness or wry acceptance after another routine day.','符合這句話常見的口語語氣。',true),
          o('肯定今天每人都只獲發一美元。','A factual claim that everyone earned exactly one dollar.','dollar 在這裏不是準確工資數字。'),
          o('宣告她永遠不必再工作。','A declaration that she will never work again.','與又一天例行工作相反。')]),
        5:c(p('員工完成又一天相同的盤點工作。哪句自然？','A worker finishes yet another similar day of stocktaking. Which line sounds natural?'),[
          o('「又做完一日盤點；又過一天，又賺一份工錢。」','“Another inventory shift done—another day, another dollar.”','工作已完成，語氣自然。',true),
          o('「今天中了彩票；又過一天，又賺一份工錢。」','“I won the lottery today—another day, another dollar.”','彩票中獎不是例行工作收入。'),
          o('「我今天沒做任何工作；又過一天，又賺一份工錢。」','“I did no work today—another day, another dollar.”','與完成盤點的情境矛盾。')]),
        6:c(p('哪個理解最準確？','Which reading is most accurate?'),[
          o('「一句帶點無奈的工作日常感想。」','“A slightly weary comment on another ordinary workday.”','抓到慣用語氣和情境。',true),
          o('「保證每一天的工資完全一樣。」','“A guarantee that wages are identical every day.”','諺語沒有保證工資金額。'),
          o('「一定是在抱怨僱主犯法。」','“It must be an accusation that the employer broke the law.”','疲倦或無奈不等於法律指控。')])
      }
    }
  },
  {
    id:'proverb-11',titleEn:'Ask a Silly Question and You Get a Silly Answer',titleZh:'問得無聊，答得滑稽',slug:'ask-a-silly-question-and-you-get-a-silly-answer',
    sense:'An obvious, absurd, or poorly thought-out question may invite an equally flippant reply.',
    guide:{
      meaning:p('問題太顯而易見、荒謬或沒有想清楚時，對方可能用玩笑式答案回應。','An obvious or ill-considered question can invite a joking or flippant answer.'),
      model:p('阿謙滿手油漆，朋友卻問他是否剛畫過牆；他笑說自己剛和油漆桶握手。','Ken had paint on both hands. Asked whether he had painted the wall, he joked that he had shaken hands with a paint tin: ask a silly question and you get a silly answer.'),
      picture:p('一個過分明顯的問題像彈球；玩笑答案又彈回來。','An obvious question bounces back like a ball as a playful answer.'),
      boundary:p('「看似簡單」不等於愚蠢；真誠求助時，應認真解答。','A simple question is not automatically silly; answer sincere requests for help respectfully.'),
      where:p('適合熟人間輕鬆的玩笑；課堂、服務或敏感場合要小心，免得羞辱提問者。','It suits friendly banter; in teaching, service, or sensitive settings it can embarrass the asker.'),
      tone:p('幽默，亦可能帶刺；要看關係和說話方式。','Playful, but potentially sharp, depending on the relationship and delivery.'),
      checks:[p('問題為何顯而易見或荒謬？','Why is the question obvious or absurd?'),p('答案是否刻意開玩笑？','Is the answer deliberately flippant?'),p('對方會否覺得被取笑？','Could the asker feel mocked?')],
      readAloud:p('看見我全身濕透，他問我外面有沒有下雨；我答「沒有，是雲在洗澡」。','Seeing me soaked, he asked whether it was raining. I replied, “No, the clouds are taking a bath”—ask a silly question and you get a silly answer.'),
      choices:{
        2:c(p('哪個情境符合這句話？','Which scene fits?'),[
          o('他看見空杯仍問「喝完了嗎」；朋友開玩笑說杯子自己喝掉了。','Seeing an empty cup, he asks if it is finished; his friend jokes that the cup drank it itself.','顯然的問題引出刻意滑稽的答案。',true),
          o('學生不懂一道難題，老師逐步解釋。','A pupil asks about a difficult problem and the teacher explains it carefully.','真誠求助與認真回答不屬這種玩笑。'),
          o('他提出清晰的問題，朋友給出準確資料。','He asks a clear question and his friend gives accurate information.','沒有荒謬提問或玩笑回答。')]),
        3:c(p('年幼學生問基本問題，哪個回應更合適？','A young pupil asks a basic question. Which response is better?'),[
          o('「我來一步一步解釋。」','“Let me explain it step by step.”','基本問題可以是真誠求助，不應隨意取笑。',true),
          o('「問得無聊，答得滑稽；你不值得聽解釋。」','“Ask a silly question, get a silly answer; you do not deserve an explanation.”','把諺語當成羞辱學生的藉口。'),
          o('「所有簡單問題都不准問。」','“No simple questions are allowed.”','錯把容易與不合理混為一談。')]),
        5:c(p('朋友看見你拿著雨傘，仍問你是否帶了雨傘。哪句玩笑回應自然？','A friend sees your umbrella and asks whether you brought one. Which joking reply fits?'),[
          o('「沒有，這是一枝會開合的花。問得無聊，答得滑稽！」','“No, it’s a folding flower. Ask a silly question and you get a silly answer!”','回答刻意滑稽，也呼應顯而易見的提問。',true),
          o('「有，我手上拿著雨傘。」','“Yes, I have an umbrella in my hand.”','這是直接答案，不是滑稽回應。'),
          o('「你問雨傘，就證明你討厭我。」','“Asking about my umbrella proves you dislike me.”','無端推斷對方動機。')]),
        6:c(p('哪個理解保留了使用界線？','Which reading respects the boundary?'),[
          o('「熟人間可用作玩笑；真誠問題仍應認真回答。」','“It may be playful among friends; sincere questions still deserve a real answer.”','兼顧語氣與對方需要。',true),
          o('「任何簡單問題都應被嘲笑。」','“Every simple question deserves mockery.”','把語境限定的玩笑變成普遍規則。'),
          o('「所有滑稽答案都是正確答案。」','“Every funny answer is a correct answer.”','滑稽不代表內容正確。')])
      }
    }
  },
  {
    id:'proverb-12',titleEn:'As You Bake, So Shall You Brew',titleZh:'怎樣做，便承受怎樣的結果',slug:'as-you-bake-so-shall-you-brew',
    sense:'One’s choices and actions shape the consequences one must later face.',
    guide:{
      meaning:p('自己的做法會帶來相應後果，之後仍須面對或承擔。','Your actions help determine the consequences you later have to face.'),
      model:p('社團沒有核對預訂日期，結果到場才發現場地已被別人租用。','The club failed to check the booking date and arrived to find the venue taken—as you bake, so shall you brew.'),
      picture:p('想像自己和麵、放進焗爐，出爐後便要面對成品。','Imagine preparing the dough and then facing the loaf that comes out of the oven.'),
      boundary:p('這是較古舊的說法；不可用來責怪遭遇意外或不公的人。','The wording is old-fashioned; do not use it to blame people for accidents or injustice beyond their control.'),
      where:p('適合談自己可控制的選擇及其相連後果；現代日常口語常改說「種瓜得瓜」。','Use it for choices within someone’s control and the connected outcome; a plainer modern saying may be easier in conversation.'),
      tone:p('有勸戒意味，亦可能顯得責備；要分清責任和運氣。','Admonitory and potentially blaming; distinguish choice from bad luck.'),
      checks:[p('當事人有甚麼可控制的選擇？','What choice was within the person’s control?'),p('後果是否由那選擇引起？','Did that choice lead to the outcome?'),p('這樣說會否錯怪受害者？','Would this unfairly blame someone?')],
      readAloud:p('她沒有備份重要檔案，電腦壞了後便要重新做整份報告。','She made no backup, so when the computer failed she had to rewrite the report—as you bake, so shall you brew.'),
      choices:{
        2:c(p('哪個情境有清楚的選擇與後果？','Which scene shows a clear choice and consequence?'),[
          o('他明知要交表格卻不填，結果錯過報名。','He knowingly leaves the form unfinished and misses registration.','可控制的疏忽與結果相連。',true),
          o('他準時交表，卻因系統故障失去資料。','He submits on time, but a system failure loses the data.','結果不是由他的疏忽造成。'),
          o('他填表後等候結果，尚不知道是否獲批。','He submits the form and waits; no decision has been made.','尚沒有可承擔的結果。')]),
        3:c(p('朋友因自己忘記報名而失望，哪個回應較合宜？','A friend is upset after forgetting to register. Which reply is useful?'),[
          o('「先看看能否補報；下次我們一起設提醒。」','“Let’s see whether late registration is possible and set a reminder next time.”','承認後果，同時幫忙處理。',true),
          o('「怎樣做便承受怎樣的結果，所以不必幫你。」','“As you bake, so shall you brew, so I need not help you.”','諺語不要求旁人拒絕協助。'),
          o('「你忘了報名，證明往後所有事都會失敗。」','“Missing this registration proves you will fail at everything.”','把一次後果誇成永久命運。')]),
        5:c(p('隊員一再不按時練習，正式表演時跟不上節奏。哪句貼切？','A player repeatedly skips practice and cannot keep time during the performance. Which line fits?'),[
          o('「他自己略過練習，表演時便跟不上；怎樣做，便承受怎樣的結果。」','“He skipped practice and could not keep time—as you bake, so shall you brew.”','選擇與相連後果均有交代。',true),
          o('「他每天練習，仍因舞台故障聽不到節拍；怎樣做，便承受怎樣的結果。」','“He practised daily but a stage fault hid the beat—as you bake, so shall you brew.”','把外來故障錯算成他的選擇後果。'),
          o('「他略過練習，卻在表演前已獲保證一定成功；怎樣做，便承受怎樣的結果。」','“He skipped practice but was guaranteed success beforehand—as you bake, so shall you brew.”','題目沒有這項保證，也削弱因果。')]),
        6:c(p('哪個說法最能避免誤用？','Which claim avoids misuse?'),[
          o('「只在後果確實與可控制的行動相連時使用。」','“Use it only when the result is linked to an action the person could control.”','限定責任，避免責怪受害者。',true),
          o('「任何不幸都證明當事人做錯事。」','“Every misfortune proves the sufferer did something wrong.”','無端把意外或不公歸咎受影響者。'),
          o('「這句只能談焗麵包和釀酒。」','“The saying can refer only to baking and brewing.”','忽略比喻意思。')])
      }
    }
  }
];
