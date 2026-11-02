// Home-based online work: time and access versus isolation and blurred boundaries.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:30'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'In many countries, doing a job online from home is now a normal way to work.',
 'This can make work friendships weaker and make it hard to separate work from private life. Still, I think it is good overall because it improves workers’ daily lives and lets more kinds of people find jobs.',
 'One clear good point is that it is easier to make time for work and life outside work.',
 'Without spending a long time travelling to work, people get back time for sleep, exercise, caring for children and a calmer start to the day.',
 'Feeling less rushed usually means less worry and better focus, so people may also get more work done.',
 'For example, a person who no longer travels for two hours each day can make food at home and start work feeling much better.',
 'Another good point is that more people can apply for jobs.',
 'Because where people live matters less, companies can hire skilled people from the countryside, while parents and people who find it hard to move around can apply for jobs that were once too far away.',
 'For example, a city company can hire a good person who writes computer programs and lives hundreds of kilometres away.',
 'Even so, this change also has bad points.',
 'The first is feeling alone, both as a person and in one’s work.',
 'When people mostly talk through screens, quick talks that happen by chance, casual help from experienced workers and the feeling of being a team all become weaker.',
 'This is especially bad for younger workers, who often learn by watching more experienced people solve problems as they happen.',
 'For example, a new worker may get official directions online but still miss the quick advice they would get naturally in a shared office.',
 'A second problem is that working at home can make it hard to keep work and private life apart.',
 'Because the computer is always close, some people keep reading work messages late at night.',
 'For example, a manager who answers work emails every night after dinner may slowly become tired and unable to cope, rather than enjoy real freedom in work hours.',
 'To sum up, online work from home has real bad points, but it is still good overall.',
 'It can reduce in-person talks and make people work too much, but its good points for health and finding work matter more.',
];
const vocabulary=[
 v(['online home-based work','doing a job online from home','網上在家工作'],['normal form of employment','normal way to work','常見工作形式']),
 v(['weaken workplace relationships','make work friendships weaker','削弱職場關係'],['blur personal boundaries','hard to separate work from private life','模糊個人界線'],['overall beneficial','good overall','整體有益'],['daily lives','daily lives','日常生活'],['labour market more inclusive','more kinds of people find jobs','就業市場更包容']),
 v(['One clear advantage','One clear good point','一項明顯好處'],['work-life balance','make time for work and life outside work','工作生活平衡']),
 v(['long commutes','long time travelling to work','長途通勤'],['recover time','get back time','取回時間'],['childcare','caring for children','照顧孩子'],['calmer start to the day','calmer start to the day','較從容開始一天']),
 v(['Less time pressure','Feeling less rushed','較少時間壓力'],['less stress','less worry','較少壓力'],['better concentration','better focus','較佳專注'],['productivity may also rise','may also get more work done','生產力可能提高']),
 v(['no longer spends two hours commuting','no longer travels for two hours','不再通勤兩小時'],['prepare meals at home','make food at home','在家備餐'],['better frame of mind','feeling much better','較佳精神狀態']),
 v(['Another benefit','Another good point','另一好處'],['broader access to jobs','more people can apply for jobs','更廣就業機會']),
 v(['location matters less','where people live matters less','地點較不重要'],['rural areas','countryside','鄉郊'],['limited mobility','find it hard to move around','行動受限'],['roles once beyond their reach','jobs that were once too far away','原本難以取得工作']),
 v(['city-based company','city company','城市公司'],['skilled programmer','good person who writes computer programs','熟練程式員'],['hundreds of kilometres away','hundreds of kilometres away','數百公里外']),
 v(['However','Even so','然而'],['disadvantages','bad points','缺點']),
 v(['social','as a person','社交方面'],['professional','in one’s work','工作方面'],['isolation','feeling alone','孤立']),
 v(['communication happens mainly through screens','people mostly talk through screens','主要透過螢幕溝通'],['spontaneous conversations','quick talks that happen by chance','自發交流'],['informal mentoring','casual help from experienced workers','非正式指導'],['team cohesion','feeling of being a team','團隊凝聚力']),
 v(['particularly damaging','especially bad','尤其有害'],['younger staff','younger workers','年輕員工'],['observing experienced colleagues','watching more experienced people','觀察資深同事'],['in real time','as they happen','即時']),
 v(['new employee','new worker','新員工'],['formal instructions','official directions','正式指示'],['quick advice','quick advice','即時建議'],['shared office','shared office','共用辦公室']),
 v(['A second drawback','A second problem','第二缺點'],['erase the boundary','make it hard to keep','抹去界線'],['work and private life','work and private life','工作與私人生活']),
 v(['laptop','computer','手提電腦'],['always nearby','always close','總在身邊'],['checking messages','reading work messages','查看訊息'],['late into the evening','late at night','深夜']),
 v(['replies to emails after dinner','answers work emails every night after dinner','晚飯後回電郵'],['fatigue and burnout','tired and unable to cope','疲勞與倦怠'],['genuine flexibility','real freedom in work hours','真正彈性']),
 v(['In conclusion','To sum up','總結'],['real drawbacks','real bad points','真實缺點'],['positive development overall','good overall','整體正面']),
 v(['face-to-face interaction','in-person talks','面對面交流'],['encourage overwork','make people work too much','助長過勞'],['well-being','health','福祉'],['access to employment','finding work','就業可及性'],['more significant','matter more','更重要']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'In many countries, online tutoring has become a normal form of employment.',d:[1,9,17],relation:'背景句指出某種工作形式已普遍',formula:'In many countries, [工作形式] has become a normal form of employment',meaning:'網上在家工作在不少地方已是正常就業形式。',links:['In many countries, ', ' has become a normal form of employment.'],labels:['工作形式']},
 {example:'Although this shift can weaken team relationships and blur personal boundaries, I believe it is overall beneficial because it gives workers more time and widens access to jobs.',d:[0,9,17],relation:'Although 承認社交與界線風險，再給生活和包容理由',formula:'Although [兩項風險], I believe it is overall beneficial because [兩項主要好處]',meaning:'作者承認職場關係與界線問題，仍判生活及就業機會更好。',links:['Although ', ', I believe it is overall beneficial because '],labels:['已承認風險','整體好處']},
 {example:'One clear advantage is better daily scheduling.',d:[1,9,17],relation:'第一主題句提出工作與生活安排好處',formula:'One clear advantage is better [生活安排]',meaning:'在家工作可改善工作與生活平衡。',links:['One clear advantage is better '],labels:['改善面向']},
 {example:'Without long commutes, workers recover time for sleep, exercise and a calmer start to the day.',d:[2,9,10],relation:'Without 說免通勤後時間可轉往多個用途',formula:'Without [耗時環節], workers recover time for [多項用途]',meaning:'不用長途通勤，可騰時間睡眠、運動及照顧孩子。',links:['Without ', ', workers recover time for '],labels:['不再需要的耗時事','騰出時間用途']},
 {example:'Less time pressure usually means less anxiety and steadier concentration, so productivity may also rise.',d:[3,9,10],relation:'so 把減壓專注連到可能較高產出',formula:'Less time pressure usually means [心理改善] and [專注改善], so productivity may also rise',meaning:'時間壓力低或令壓力少、專注好，生產力可能上升。',links:['Less time pressure usually means ', ' and ', ', so productivity may also rise.'],labels:['心理改善','專注改善']},
 {example:'For example, someone who no longer spends two hours commuting can make breakfast at home and begin work in a far better frame of mind.',d:[3,9,10],relation:'兩小時通勤例子具體化在家備餐與精神改善',formula:'For example, someone who no longer spends [通勤時間] can [騰出時間用途] and begin work in a far better frame of mind',meaning:'少通勤兩小時可在家備餐，較從容開始工作。',links:['For example, someone who no longer spends ', ' can ', ' and begin work in a far better frame of mind.'],labels:['省下通勤時間','新用途']},
 {example:'Another benefit is broader access to professional roles.',d:[3,9,10],relation:'第二主題句轉到職位可及性',formula:'Another benefit is broader access to [機會]',meaning:'遙距工作讓更多人取得工作機會。',links:['Another benefit is broader access to '],labels:['擴大的機會']},
 {example:'Because location matters less, firms can hire talent from distant towns, while parents and people with limited mobility can apply for roles once beyond their reach.',d:[3,9,10],relation:'Because 說地理門檻下降，while 並列企業與求職者收益',formula:'Because [地理條件], firms can [招聘範圍], while [求職者] can apply for roles once beyond their reach',meaning:'企業可招鄉郊人才，家長及行動不便者可申請遠距工作。',links:['Because ', ', firms can ', ', while ', ' can apply for roles once beyond their reach.'],labels:['地理條件','企業招聘收益','求職者']},
 {example:'For instance, a city-based company can employ a skilled analyst who lives hundreds of kilometres away.',d:[3,9,10],relation:'城市公司聘遠方程式員例子落實地點門檻下降',formula:'For instance, a city-based company can employ a skilled [職位] who lives hundreds of kilometres away',meaning:'城市公司可僱用住在數百公里外的熟練程式員。',links:['For instance, a city-based company can employ a skilled ', ' who lives hundreds of kilometres away.'],labels:['遠距專業人員']},
 {example:'However, this policy also has disadvantages.',d:[3,6,12],relation:'However 轉向在家工作弊端',formula:'However, [做法] also has disadvantages',meaning:'文章開始談孤立與界線問題。',links:['However, ', ' also has disadvantages.'],labels:['存在缺點的做法']},
 {example:'The first is social isolation from a team.',d:[3,9,12],relation:'短主題句點出社交與職業孤立',formula:'The first is [第一缺點]',meaning:'第一項缺點是社交及職業上的孤立。',links:['The first is '],labels:['第一缺點']},
 {example:'When communication happens mainly through screens, quick chats, casual guidance, and a shared sense of purpose all decline.',d:[3,9,12],relation:'When 條件下三項職場互動下降',formula:'When communication happens mainly through screens, [交流一], [指導二], and [團隊三] all decline',meaning:'螢幕溝通多時，自發交談、非正式指導及團隊凝聚或減弱。',links:['When communication happens mainly through screens, ', ', ', ', and ', ' all decline.'],labels:['自發交流','非正式指導','團隊連結']},
 {example:'This is particularly damaging for new staff, who often learn by observing experienced colleagues solve problems in real time.',d:[3,9,10],relation:'who 解釋年輕人為何更受非正式學習流失影響',formula:'This is particularly damaging for [群體], who often learn by observing [榜樣] solve problems in real time',meaning:'年輕員工常靠觀察資深同事即時解難，因此受影響較大。',links:['This is particularly damaging for ', ', who often learn by observing ', ' solve problems in real time.'],labels:['受影響群體','可觀察榜樣']},
 {example:'For example, a new employee may receive written instructions online yet still miss the casual guidance that would naturally be available in a shared office.',d:[3,9,12],relation:'yet 對照有正式網上指示與缺即時非正式建議',formula:'For example, a new employee may receive [正式指示] online yet still miss [非正式幫助] that would naturally be available in a shared office',meaning:'新員工可收到網上指示，仍錯過共享辦公室的即時建議。',links:['For example, a new employee may receive ', ' online yet still miss ', ' that would naturally be available in a shared office.'],labels:['正式指示','非正式幫助']},
 {example:'A second drawback is that home working can erase the boundary between work and family time.',d:[3,9,12],relation:'第二缺點是工作私人時間界線消失',formula:'A second drawback is that [做法] can erase the boundary between [兩種生活範圍]',meaning:'在家工作或模糊工作與私人生活界線。',links:['A second drawback is that ', ' can erase the boundary between '],labels:['做法','兩種範圍']},
 {example:'Because the laptop is always nearby, some people keep checking messages during dinner.',d:[3,9,12],relation:'Because 說電腦隨處可見導致晚間查訊息',formula:'Because [工具總在身邊], some people keep checking messages [休息時段]',meaning:'電腦常在旁，一些人到晚上仍查工作訊息。',links:['Because ', ', some people keep checking messages '],labels:['誘因','私人時段']},
 {example:'A teacher who replies to emails every weekend, for example, may gradually slip into exhaustion instead of enjoying genuine flexibility.',d:[3,9,12],relation:'instead of 對照實際疲勞與原本想要的彈性',formula:'A [職位] who replies to emails [私人時段], for example, may gradually slip into [疲勞後果] instead of enjoying genuine flexibility',meaning:'晚飯後長期回電郵的經理可能倦怠而非享受彈性。',links:['A ', ' who replies to emails ', ', for example, may gradually slip into ', ' instead of enjoying genuine flexibility.'],labels:['職位','工作侵入時段','疲勞後果']},
 {example:'In conclusion, working online from home brings real drawbacks, but it remains a positive choice overall.',d:[3,9,12],relation:'結論 but 承認缺點仍判整體正面',formula:'In conclusion, working online from home brings real drawbacks, but it remains a positive [整體評價]',meaning:'作者承認缺點，仍認為在家網上工作整體正面。',links:['In conclusion, working online from home brings real drawbacks, but it remains a positive ', ' overall.'],labels:['整體評價']},
 {example:'While it can reduce face-to-face interaction and encourage overwork, its benefits for health and access to employment are more significant.',d:[3,9,12],relation:'While 重提社交過勞代價，再比較福祉與就業收益',formula:'While it can reduce [交流] and encourage [過勞], its benefits for [福祉] and [就業機會] are more significant',meaning:'作者認為健康及就業可及性好處較孤立與過勞風險重。',links:['While it can reduce ', ' and encourage ', ', its benefits for ', ' and ', ' are more significant.'],labels:['交流損失','過勞風險','福祉','就業機會']},
];
const usageGuides=[
 '當你要在引言指出某種工作形式已變成常見安排時。',
 '當你要用 Although 承認兩項風險，再以 because 給出整體立場與理由時。',
 '當你要用短主題句提出第一項生活安排上的好處時。',
 '當你要用 Without 說明少了一項耗時步驟，時間可轉到哪些用途時。',
 '當你要用 so 將時間壓力與專注變化連到可能的產出結果時。',
 '當你要用一個具體人物的通勤時間，展示新日常安排時。',
 '當你要用 Another benefit 轉向與生活質素不同的機會可及性時。',
 '當你要用 Because 說地點限制減少，再用 while 並列企業及求職者的好處時。',
 '當你要以一名住得很遠的專業人士，落實地點門檻下降的論點時。',
 '當你要用 However 從已分析的好處轉到缺點時。',
 '當你要用短句開始解釋一項社交或工作關係上的問題時。',
 '當你要用 When 說明某種溝通方式普遍後，三種日常互動如何變弱時。',
 '當你要以 who 子句解釋某群體為何特別依賴前述互動時。',
 '當你要用 yet 對照正式指示仍在與非正式幫助流失時。',
 '當你要用 A second drawback 轉到與社交孤立不同的私人界線問題時。',
 '當你要用 Because 說明工具總在旁邊如何延長工作訊息的干擾時。',
 '當你要用 instead of 對照原本想得到的彈性與實際可能的疲勞時。',
 '當你要在結論先承認缺點，再用 but 表達整體仍正面的判斷時。',
 '當你要用 While 重提兩項代價，仍清楚說明哪兩項好處較重時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'分清通勤時間、工作機會、社交指導和私人界線。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('這篇文章評估哪種工作安排？',['在家透過網絡工作。','每天只在飛機上工作。','所有員工都搬進同一辦公室。','只使用紙本通訊而不用電腦。'],'online home-based work 是焦點。'),
 {type:'multi',prompt:'範文提出的兩項主要好處是甚麼？',detail:'選兩項，再按「確認」。',options:['省去通勤，較能安排日常生活','地點限制減少，更多人可申請工作','所有同事會自然有更多面對面交流','每名員工都保證永遠不會過勞'],correct:[0,1],why:'工作生活平衡與就業可及性是兩條好處。'},
];
const route=[sequence('還原在家網上工作的利弊',[
 ['背景與立場','在家網上工作變常見；作者承認關係與界線風險，仍支持。'],
 ['日常生活','省去通勤時間，可用於睡眠、運動、照顧孩子與備餐。'],
 ['工作機會','企業可招遠方人才；家長及行動受限者可申請較多工作。'],
 ['社交孤立','螢幕交流減少自發談話、非正式指導與團隊感。'],
 ['私人界線及結論','晚間訊息或致過勞；作者認為福祉與就業好處較重。'],
 ],'本文的第二缺點是過勞界線，不是重複第一項社交孤立。')];
const evidence=[
 quiz('省去長途通勤後，時間可轉用於甚麼？',['睡眠、運動、照顧孩子及較從容開始一天。','只可用來再次通勤。','必須全部用於更多會議。','只能購買新的辦公桌。'],'原文列出多種生活用途。'),
 quiz('為何在家工作可使勞動市場更包容？',['住在鄉郊、需照顧孩子或行動受限者，較易申請遠距職位。','所有公司必然只聘同一城市的人。','地點限制愈少，工作機會必然愈少。','只有長途通勤者可使用電腦。'],'地理限制下降令不同群體可及。'),
 quiz('螢幕溝通為何對新員工特別有影響？',['較難自然觀察資深同事解難，也較少得到即時非正式建議。','新員工必然完全不懂任何書面指示。','所有線上指導都必然沒有內容。','螢幕會自動取消每個人的工作技能。'],'正式網上指示可在，仍可能失去非正式學習。'),
 quiz('在家工作如何可能變成過勞？',['電腦總在身邊，部分人晚間仍查訊息和回電郵。','員工在家便必然完全不需要工作。','只要有彈性，任何人都不會疲累。','工作與私人時間界線自然永遠固定。'],'原文用晚飯後回電郵作例子。'),
 quiz('作者最後如何比較利弊？',['承認交流減少與過勞，仍認為福祉和就業機會好處較重。','否認任何在家工作風險。','認為所有辦公室工作都非法。','只根據一名程式員便保證每個人受益。'],'結論在承認代價後作整體正面判斷。'),
];
const logic=[
 sequence('省時到生活質素的連鎖',[
 ['不用通勤','員工取回原本在路上的時間。'],
 ['生活用途','睡眠、運動、照顧孩子或備餐。'],
 ['壓力與專注','較不匆忙，壓力可降，專注可升。'],
 ['工作結果','生產力亦可能提高。'],
 ],'省通勤不是直接保證產出，還有時間用途與心理狀態。'),
 sequence('地點機會與兩項代價',[
 ['地點限制降','企業可聘鄉郊人才，更多求職者可申請。'],
 ['社交減少','自發交談、師徒指導及團隊凝聚或變弱。'],
 ['界線模糊','晚上仍查工作訊息，彈性可演變為過勞。'],
 ['權衡','作者承認風險，仍判生活與就業機會好處較重。'],
 ],'工作可及性、孤立和過勞須分別分析。'),
];
const transfers=[
 transfer('一名員工每天省下兩小時通勤，開始能在家備餐和運動。','哪句對應生活質素好處？',['省去路程後，時間可轉回飲食與運動，可能減少壓力並提升專注。','省通勤必然令所有人每日工作二十四小時。','通勤縮短與日常安排完全無關。','只要在家備餐，工作效率必然翻倍。'],['時間用途→壓力專注，保留可能性。','過度斷言。','原文說有關。','無數字證據。'],[3,4,5],'原文不用長通勤→生活用途→較少壓力。'),
 transfer('一家公司招聘住在數百公里外的程式員。','哪句準確轉用地點可及性論證？',['遠距工作讓企業接觸更廣人才，也讓遠方求職者申請原本難到達的職位。','距離較遠便證明程式員工作能力必然較低。','只有住在公司樓下的人能使用線上工具。','跨地招聘會自動消除所有面試需要。'],['企業與求職者兩邊受益。','能力不能由距離判斷。','與例子相反。','仍需選聘。'],[7,8],'原文 location matters less→rural talent/roles beyond reach。'),
 transfer('新入職員工可線上收到工作流程文件，卻很少看到前輩即時解難。','哪句指出正式與非正式支援差別？',['文件可提供正式指示，但新人仍可能錯過自然發生的即時建議。','既然有文件，便保證所有非正式學習都完全多餘。','只有面對面環境才能提供任何指示。','前輩解難與新人學習完全沒有關係。'],['yet 對照正式指示與缺失的現場觀察。','過度否定。','網上亦可有指示。','原文指出有關。'],[11,12,13],'原文 formal instructions online yet miss quick advice。'),
 transfer('主管每晚飯後仍用家中電腦回覆大量工作電郵。','哪句對應私人界線風險？',['工作訊息侵入休息時間，彈性可能逐漸變成疲勞或倦怠。','只要在家工作，就保證所有晚間電郵都是緊急。','每天回電郵必然令員工更加放鬆。','家中電腦只影響桌面顏色，不影響時間界線。'],['工具靠近→晚間工作→可能倦怠。','未必緊急。','方向相反。','時間界線受影響。'],[14,15,16],'原文 dinner emails→fatigue and burnout。'),
 transfer('文章只寫「遠距工作好」，未解釋如何增加工作機會。','哪句補足機制？',['地點限制減少，企業可招鄉郊人才，家長及行動受限者也可申請遠距職位。','遠距工作好，因為它就是很好。','只要有網絡，每個人都會被同一家公司錄取。','在家工作只會改變辦公桌大小。'],['指出企業與求職者兩邊機制。','循環說法。','無錄取保證。','不相關。'],[6,7,8],'原文地點限制下降與更廣就業。'),
 transfer('一家公司計劃全員永久在家工作。','哪句提示需要處理社交代價？',['應設法保留新人觀察學習、即時求助和團隊交流的機會。','只要有視像會議，所有非正式指導便必然完全不受影響。','團隊凝聚與工作安排永遠沒有關係。','新人應完全不能向資深同事提問。'],['回應原文三項可能流失的互動。','無此保證。','原文說有關。','方向相反。'],[11,12,13],'原文 spontaneous conversations/informal mentoring/team cohesion decline。'),
 transfer('另一題評估容許大學生在家上網課。','哪句真正轉移本文的分析框架？',['可比較省去交通與擴大地點可及性，並檢查同儕互動和休息界線。','因為在家工作整體正面，所有網課必然正面。','只要省路程，課堂指導便不重要。','網課與遠距工作完全沒有相似機制。'],['轉移時間、可及性、社交與界線。','結論需另證。','仍需學習互動。','有可比較機制。'],[3,7,11,14],'原文四維度可跨題檢查。'),
 transfer('有人說「線上能傳正式指示，所以新人不會孤立」。','哪句指出不足？',['即使正式指示可傳送，新人仍可能少了現場觀察、隨口請教與團隊感。','正式指示等於每次都能即時看到前輩解難。','只要新人孤立，便證明所有線上指示都錯。','團隊交流只取決於員工年齡。'],['正式與非正式支援不同。','不能等同。','兩面可並存。','安排亦影響。'],[11,12,13],'原文 formal instructions 可在，quick advice 仍失。'),
 transfer('一名行動受限者能申請遠方企業的線上職位。','哪句避免把可及性說成錄取保證？',['遠距安排可打開原本難申請的工作機會，但仍需按職位能力選聘。','能申請便代表企業必須即時錄取。','行動受限者一定不適合任何工作。','地點較不重要便令專業能力完全不重要。'],['can apply 不是必然被聘。','誇大。','歧視性推斷。','能力仍重要。'],[7,8],'原文 apply for roles once beyond their reach。'),
 transfer('結論需同時保留在家工作的好處與風險。','哪句符合範文？',['它或減少面對面交流並助長過勞，仍可改善福祉及擴大就業機會。','既然支持，就完全不必承認孤立與界線問題。','只要有人倦怠，所有遠距好處便必然不存在。','只重述程式員例子，不比較整體影響。'],['While 承認兩項代價，再給較重好處。','忽略另一面。','過度推斷。','缺少權衡。'],[17,18],'原文結論承認 face-to-face/overwork，判 benefits more significant。'),
];
export default {key:'advantage-disadvantage:30',meta:{topic:'在家網上工作的生活與就業利弊',summary:'範文指出省通勤可改善作息與專注，地理限制下降可擴大招聘與求職；亦分析非正式指導和團隊感減少，以及晚間工作侵入私人生活，最後判整體正面。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
