// Reviewed complete-sentence support for Discuss Both Views 22.
import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-22-ielts-discuss-both-views.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['discuss-both-views:22'];const original=source.sentences.map(s=>s.english);
const simple=[
 'Damage to nature is now one of the biggest problems in modern life, harming air, water, food and people’s health.',
 'Some people say these problems affect many countries and need governments to act, while others say only people acting on their own can solve them.',
 'I strongly think governments must lead, because only they have the power and money to make changes big enough.',
 'People who want governments to act say many problems are too big for ordinary people to control.',
 'Changes in the climate, pollution from factories and loss of forests are not just caused by careless habits at home; they also come from how countries make energy, run transport and what companies do.',
 'For example, if a factory puts harmful waste into a river, local people can complain or stop buying from it, but they cannot use the law to make it change how it works.',
 'Governments, however, can make strict rules, punish polluters, pay for clean energy and work with other countries.',
 'Without this power, protecting nature depends on people choosing to do good, rather than on rules they must follow.',
 'On the other side, people who support personal action say laws will not work by themselves if people keep wasting things.',
 'Daily choices like driving less, recycling well, using less plastic and buying only what is needed can together reduce harm to the Earth.',
 'For example, if millions of homes waste less food and power, people will need less energy and fewer materials.',
 'This view makes sense because harm to nature does not start only in company offices and factories; everyday habits also cause it.',
 'But personal action is like using a cup to catch water while the main pipe still leaks: helpful, but far from enough.',
 'In the end, people should behave more carefully, but we cannot leave most environmental problems to personal choice.',
 'Governments can best control companies, build better public systems and work with other countries, so they should do the most to solve today’s environmental problems.',
];
const vocabulary=[
 [['Environmental damage','Damage to nature','環境破壞'],['defining concerns','biggest problems','重大的問題'],['public health','people’s health','公共健康']],
 [['international in nature','affect many countries','跨國性質'],['government intervention','governments to act','政府介入'],['individual responsibility','people acting on their own','個人責任']],
 [['I firmly believe','I strongly think','我堅定地認為'],['take the lead','must lead','主導'],['authority and resources','power and money','權力與資源'],['scale required','big enough','所需規模']],
 [['support government action','want governments to act','支持政府行動'],['too large','too big','規模太大'],['private citizens','ordinary people','普通市民']],
 [['Climate change','Changes in the climate','氣候變化'],['industrial pollution','pollution from factories','工業污染'],['deforestation','loss of forests','森林砍伐'],['careless household habits','careless habits at home','疏忽的家庭習慣'],['national energy systems','how countries make energy','國家能源系統'],['transport networks','run transport','交通網絡'],['corporate activity','what companies do','企業活動']],
 [['releases toxic waste','puts harmful waste','排放有毒廢物'],['ordinary residents','local people','普通居民'],['boycott its products','stop buying from it','抵制產品'],['legally force','use the law to make','依法強制'],['production methods','how it works','生產方法']],
 [['by contrast','however','相比之下'],['impose strict regulations','make strict rules','制定嚴格規則'],['fine polluters','punish polluters','懲罰污染者'],['invest in renewable energy','pay for clean energy','投資可再生能源'],['cooperate with other countries','work with other countries','與其他國家合作']],
 [['this level of authority','this power','這層權力'],['environmental protection','protecting nature','環境保護'],['matter of goodwill','people choosing to do good','自願善意'],['enforceable responsibility','rules they must follow','可強制執行責任']],
 [['supporters of individual action','people who support personal action','支持個人行動者'],['laws alone','laws will not work by themselves','只靠法律'],['live wastefully','keep wasting things','浪費地生活']],
 [['Everyday choices','Daily choices','日常選擇'],['recycling properly','recycling well','正確回收'],['avoiding excessive consumption','buying only what is needed','避免過度消費'],['collectively reduce pressure on the planet','together reduce harm to the Earth','共同減輕地球壓力']],
 [['millions of households','millions of homes','數百萬家庭'],['waste less food and electricity','waste less food and power','少浪費食物電力'],['demand for energy and resources will fall','people will need less energy and fewer materials','能源資源需求下降']],
 [['This view is reasonable','This view makes sense','這觀點合理'],['environmental damage','harm to nature','環境破壞'],['boardrooms and factories','company offices and factories','董事會與工廠'],['ordinary routines','everyday habits','日常習慣']],
 [['individual effort','personal action','個人努力'],['carrying water in a cup','using a cup to catch water','用杯盛水'],['main pipe is still leaking','main pipe still leaks','主水管仍漏水'],['far from sufficient','far from enough','遠不足夠']],
 [['In conclusion','In the end','總結'],['behave more responsibly','behave more carefully','更負責任'],['left mainly to personal choice','leave most environmental problems to personal choice','主要交由個人選擇']],
 [['best placed to regulate industries','can best control companies','最適合規管產業'],['shape infrastructure','build better public systems','塑造基建'],['coordinate international action','work with other countries','協調國際行動'],['bear the central responsibility','do the most','負主要責任'],['environmental crisis','environmental problems','環境危機']],
];
const chunkOverrides=[
 ['Environmental damage has become one of the defining concerns','of modern life, affecting air, water, food systems','and public health.'],
 ['Some argue that these problems are international in nature','and therefore require government intervention, while others believe','they can only be solved through individual responsibility.'],
 ['I firmly believe that governments must take the lead,','because only they have the authority and resources','to create changes on the scale required.'],
 ['Those who support government action point out','that many environmental problems are too large','for private citizens to control.'],
 ['Climate change, industrial pollution and deforestation are not caused','merely by careless household habits, but by national energy systems,','transport networks and corporate activity.'],
 ['If a factory releases toxic waste into a river,','for instance, ordinary residents may complain or boycott its products,','but they cannot legally force it','to change its production methods.'],
 ['Governments, by contrast, can impose strict regulations,','fine polluters, invest in renewable energy','and cooperate with other countries.'],
 ['Without this level of authority, environmental protection becomes','a matter of goodwill rather than enforceable responsibility.'],
 ['On the other hand, supporters of individual action argue','that laws alone will not work','if people continue to live wastefully.'],
 ['Everyday choices such as driving less, recycling properly,','reducing plastic use and avoiding excessive consumption','can collectively reduce pressure on the planet.'],
 ['For example, if millions of households waste less food','and electricity, demand for energy and resources will fall.'],
 ['This view is reasonable because environmental damage','is not only created in boardrooms and factories;','it is also fed by ordinary routines.'],
 ['However, individual effort is like carrying water in a cup','when the main pipe is still leaking: useful,','but far from sufficient.'],
 ['In conclusion, individuals should certainly behave more responsibly,','but environmental issues cannot be left mainly to personal choice.'],
 ['Governments are best placed to regulate industries, shape infrastructure','and coordinate international action, so they should bear','the central responsibility for tackling today’s environmental crisis.'],
];
const simpleChunkOverrides=[
 ['Damage to nature is now one of the biggest problems','in modern life, harming air, water, food and people’s health.'],
 ['Some people say these problems affect many countries','and need governments to act, while others say','only people acting on their own can solve them.'],
 ['I strongly think governments must lead,','because only they have the power and money','to make changes big enough.'],
 ['People who want governments to act say','many problems are too big for ordinary people to control.'],
 ['Changes in the climate, pollution from factories and loss of forests','are not just caused by careless habits at home;','they also come from how countries make energy,','run transport and what companies do.'],
 ['For example, if a factory puts harmful waste into a river,','local people can complain or stop buying from it,','but they cannot use the law','to make it change how it works.'],
 ['Governments, however, can make strict rules, punish polluters,','pay for clean energy and work with other countries.'],
 ['Without this power, protecting nature depends on','people choosing to do good, rather than','on rules they must follow.'],
 ['On the other side, people who support personal action','say laws will not work by themselves','if people keep wasting things.'],
 ['Daily choices like driving less, recycling well, using less plastic','and buying only what is needed','can together reduce harm to the Earth.'],
 ['For example, if millions of homes waste less food','and power, people will need less energy and fewer materials.'],
 ['This view makes sense because harm to nature','does not start only in company offices and factories;','everyday habits also cause it.'],
 ['But personal action is like using a cup to catch water','while the main pipe still leaks: helpful,','but far from enough.'],
 ['In the end, people should behave more carefully,','but we cannot leave most environmental problems to personal choice.'],
 ['Governments can best control companies, build better public systems','and work with other countries,','so they should do the most','to solve today’s environmental problems.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
 card('Screen addiction has become one of the defining concerns of school life, affecting sleep, learning and family time.','以 has become one of ... affecting ... 定位問題與影響',[1,3,9],fixed(0,'[問題] has become one of [重大關切], affecting [多個領域].','開篇交代環境破壞的嚴重性及受影響的生活領域。','要在引言用一句話指出問題的分量及影響面向時。',[' has become one of ',', affecting '],['日益重要的問題','問題的性質','受影響的領域'])),
 card('Some argue that school safety issues cross district lines and therefore require government support, while others believe they can only be solved through family responsibility.','以 Some argue ... while others believe ... 並列政府與個人責任',[0,8,13],fixed(1,'Some argue that [問題有跨區性] and therefore require [公共行動], while others believe [問題] can only be solved through [私人責任].','引言準確並列政府介入與個人責任兩種解法。','題目比較公共機構與個人誰應處理同一問題時，先列清兩方依據。',['Some argue that ',' and therefore require ',', while others believe ',' can only be solved through '],['第一方眼中的問題性質','由此推論的公共措施','第二方眼中的問題','第二方主張的責任方式'])),
 card('I firmly believe that local councils must take the lead, because only they have the authority and resources to improve every public road.','以 only they have the authority and resources 說明主導者',[1,3,6],fixed(2,'I firmly believe that [公共機構] must take the lead, because only [同一機構] have the authority and resources to [大規模改變].','作者選政府主導，理由是權力與資源足以處理所需規模。','要選出主要責任方，並以其獨有的權限和資源作理由時。',['I firmly believe that ',' must take the lead, because only ',' have the authority and resources to '],['具備公共權限的主導者','只有該方能提供的能力','需要大範圍推行的改變'])),
 card('Those who support public transport point out that many travel problems are too large for single commuters to control.','以 too large for ... to control 指出個人能力界線',[2,4,5],fixed(3,'Those who support [公共行動] point out that [問題] are too large for [個人] to control.','政府支持方指出環境問題的規模超出普通市民控制能力。','要公平說明一方認為問題規模超出個別人的能力時。',['Those who support ',' point out that ',' are too large for ',' to control.'],['被支持的公共方案','超出個人能力的問題','無法獨自控制者'])),
 card('Dangerous roads are not caused merely by careless pedestrians, but by poor design and weak enforcement.','以 not ... merely by ... but by ... 分辨個人行為與制度原因',[3,5,7],fixed(4,'[問題] are not caused merely by [個人習慣], but by [制度因素].','環境危機並非只由家庭習慣造成，國家系統及企業活動也是原因。','要糾正只怪個人的解釋，指出較大制度性原因時。',[' are not caused merely by ',', but by '],['需要解釋原因的問題','被過度歸咎的個人行為','更大尺度的原因'])),
 card('If a landlord ignores unsafe wiring, for instance, tenants may complain or move away, but they cannot legally force him to repair the whole building.','以 may ... but cannot legally force ... 說明個人行動權限不足',[3,4,6],fixed(5,'If [機構造成損害], for instance, [受害者] may [個人回應], but they cannot legally force [機構] to [制度改變].','居民可投訴或抵制污染工廠，卻無權依法強制它改變生產。','要用具體案例區分個人能表達不滿與依法命令改變的權力時。',['If ',', for instance, ',' may ',', but they cannot legally force ',' to '],['有權力的機構造成的問題','受到影響的人','個人可以採取的做法','要改變的機構','所需的正式改變'])),
 card('Local councils, by contrast, can set rules, fine offenders, build safer paths and cooperate with other districts.','以 by contrast ... can ... 列公共權力工具',[5,7,14],fixed(6,'[公共機構], by contrast, can [立規則], [執法], [投資] and [跨區合作].','政府可立規管、罰污染者、投資清潔能源並跨國合作。','已說明個人缺乏強制權，要列出公共機構能用的幾種工具時。',[", by contrast, can ", ", ", ", ", " and "],['有正式權限的機構','制定規則的行動','執法或處罰','投資或建設','跨地域協作'])),
 card('Without public inspection, food safety becomes a matter of goodwill rather than enforceable responsibility.','以 Without ... goodwill rather than enforceable responsibility 對比自願與法定',[4,6,13],fixed(7,'Without [公共權限], [保護目標] becomes a matter of goodwill rather than enforceable responsibility.','沒有可執行的權力，環境保護只剩自願善意。','要解釋某領域為何需要規管，而不能只靠自願時。',['Without ',', ',' becomes a matter of goodwill rather than enforceable responsibility.'],['缺少的正式權限','需要長期保障的事'])),
 card('On the other hand, supporters of healthy eating argue that rules alone will not work if families continue to buy wastefully.','以 laws alone will not work if ... 承認個人配合的重要',[3,9,10],fixed(8,'On the other hand, supporters of [個人行動] argue that [規則] alone will not work if [人們] continue to [有害習慣].','個人行動支持方認為若生活方式不變，法律也不足夠。','已論證公共政策，還要公平說明人們的日常配合為何必要時。',['On the other hand, supporters of ',' argue that ',' alone will not work if ',' continue to '],['另一方支持的個人做法','需要人配合的規則','必須改變行為的人','持續的不良習慣'])),
 card('Everyday choices such as walking more, buying less plastic, sharing spare food and repairing old items can collectively reduce local waste.','以 Everyday choices such as ... collectively ... 累積小行為效果',[8,10,11],fixed(9,'Everyday choices such as [行動一], [行動二], [行動三] and [行動四] can collectively [共同結果].','少開車、回收、少用膠與避免過度購物可共同減輕環境壓力。','要列出多項普通人可重複做的小行動，並說明累積效果時。',['Everyday choices such as ', ', ', ', ', ' and ', ' can collectively '],['第一種日常行動','第二種日常行動','第三種日常行動','第四種日常行動','合起來產生的效果'])),
 card('For example, if thousands of families save water each day, demand for fresh supplies will fall.','以 if ... demand ... will fall 展示大量個人行為的總量效果',[8,9,12],fixed(10,'For example, if [大量家庭減少浪費], [資源需求] will fall.','大量家庭少浪費食物及電，能源與資源需求便會下降。','要把個人小改變擴大到大量家庭，解釋總需求如何下降時。',['For example, if ',', ',' will fall.'],['大量人採取的共同做法','隨之降低的需求'])),
 card('This view is reasonable because school stress is not only created in exam rooms; it is also fed by ordinary family expectations.','以 not only ...; it is also ... 承認制度與日常雙重來源',[4,9,10],fixed(11,'This view is reasonable because [問題] is not only created in [機構場景]; it is also fed by [日常做法].','環境破壞不只源自企業與工廠，也由日常習慣助長。','要公平承認問題同時來自制度及普通人的日常行為時。',['This view is reasonable because ',' is not only created in ','; it is also fed by '],['有兩種來源的問題','較顯眼的機構來源','較易忽略的日常來源'])),
 card('However, one charity day is like carrying water in a cup when the main pipe is still leaking: useful, but far from sufficient.','以比喻區分個人有用與單靠個人不足',[7,11,13],fixed(12,'However, [局部努力] is like [有限補救] when [系統問題仍在]: useful, but far from sufficient.','個人努力有幫助，但制度漏洞仍在時，不能單靠它解決問題。','承認一項小措施有益，又要說明它不足以取代系統修復時。',['However, ',' is like ',' when ',': useful, but far from sufficient.'],['有一定價值的個人行動','形象化的有限補救','仍未解決的大問題'])),
 card('In conclusion, students should certainly behave more responsibly, but school safety cannot be left mainly to personal choice.','以 should certainly ... but cannot be left mainly ... 排定責任',[2,11,14],fixed(13,'In conclusion, [個人] should certainly [負責行為], but [公共問題] cannot be left mainly to [個人選擇].','結論承認個人應負責，仍不把環境問題主要交給私人選擇。','兩方都有角色，要在結尾清楚分配誰應承擔主要責任時。',['In conclusion, ',' should certainly ',', but ',' cannot be left mainly to '],['需要配合的個人','個人仍須做的事','不能只靠個人的問題','不足以獨擔問題的方式'])),
 card('Local councils are best placed to set rules, fund public services and coordinate neighbourhood action, so they should bear the central responsibility for safer streets.','以 are best placed to ... so ... 說明公共機構主責',[2,6,13],fixed(14,'[公共機構] are best placed to [規管], [建設] and [協調], so they should bear the central responsibility for [公共問題].','政府有規管、基建與國際協調能力，因此負環境危機主責。','要把某機構的三種具體能力連到它應負主要責任的結論時。',[' are best placed to ',', ',' and ',', so they should bear the central responsibility for '],['最有能力的機構','第一項權限','第二項權限','第三項權限','要負責處理的問題'])),
];
const wrongReasons=[
 ['這句列兩派解法，原句先交代環境破壞的嚴重及範圍。','這句論證政府主導，原句只引出問題背景。','這句列日常小行動，原句未進入個人一方。'],
 ['這句只說環境問題重大，未並列兩方責任觀。','這句已轉到個人行動主體段，原句在引言列兩派。','這句結論分配責任，原句尚未選主要負責者。'],
 ['這句公平列雙方，未指出政府獨有權限與資源。','這句只介紹支持政府者，未表達作者立場。','這句列政府工具，原句先給選政府的總理由。'],
 ['這句是作者個人立場，原句先公平呈現支持政府者理由。','這句列制度原因，原句先判問題規模超個人能力。','這句工廠案例，原句先概括個人控制界線。'],
 ['這句概括規模，未區分家庭習慣與國家系統。','這句是具體工廠個案，未列多個制度來源。','這句講自願與執法，原句先分析問題成因。'],
 ['這句概括個人能力不足，未舉有害工廠的權力差別。','這句已列政府能做甚麼，原句先展示居民不能強制。','這句說需要可執行權力，未呈現居民投訴抵制例子。'],
 ['這句呈現居民權限不足，未列政府四類正式工具。','這句歸納沒有規管會只靠善意，未具體列工具。','這句結論重申政府主責，原句在主體段展示能力。'],
 ['這句分析問題來自國家系統，未比較善意與強制。','這句列政府工具，未歸納少了權力的後果。','這句在結論分配角色，原句仍是政府段結尾。'],
 ['這句從政府角度說問題規模大，未轉到個人行動。','這句列個人日常行動，原句先交代為何法律不夠。','這句舉家庭少浪費例子，原句先提出對個人參與的主張。'],
 ['這句說法律需個人配合，未列出四種日常選擇。','這句把四種選擇具體化為大量家庭的需求下降。','這句分析問題雙重來源，原句先列可採取的行動。'],
 ['這句列多項日常做法，未用大量家庭說明總需求。','這句解釋家庭習慣也助長問題，未有數量例子。','這句以比喻批評只靠個人，原句仍是個人行動的例子。'],
 ['這句說小行動的效果，未明說制度與日常兩種來源。','這句只有家庭少浪費例子，未判斷個人觀點的合理之處。','這句比喻個人不足，原句先公平承認個人責任。'],
 ['這句論證需要正式權力，未用具體比喻說明有限努力。','這句承認日常習慣也有責任，未指出單靠個人不足。','這句已於結論分配責任，原句仍在個人段比較效力。'],
 ['這句在引言選政府，未在結尾承認個人責任。','這句公平肯定個人可少浪費，未確定責任主次。','這句下一句詳列政府能力，原句先作責任判斷。'],
 ['這句在引言概括政府權限，未具體列規管、基建及協調。','這句主體段列政府工具，未導出最終責任分配。','這句先說個人有責但不應主責，原句再給政府承擔主責的能力依據。'],
];structures.forEach((s,i)=>s.wrongReasons=wrongReasons[i]);
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先分清環境問題的制度規模，再看個人習慣如何配合。',items:items.map(([title,body])=>({title,body})),why});
const intro=[quiz('題目比較哪兩種主要責任分配？',['政府主導解決，或由個人行動處理','只比較兩間工廠使用哪種標誌','只討論居民是否喜歡河流風景','只討論國際會議應安排哪天舉行'],'兩方焦點是政府權力與個人責任，作者選政府主導。'),{type:'multi',prompt:'選出作者對政府與個人的完整立場',detail:'選兩項，再按「確認」。',options:['政府應主導，能規管產業並協調跨國行動','個人仍應負責任，減少浪費並改變日常行為','只靠家庭回收就能依法強制所有工廠轉型','政府即使有權規管，也完全不應參與環保'],correct:[0,1],why:'作者肯定個人配合，但按權力和規模把主責交給政府。'}];
const route=[sequence('依文章次序排列責任論證',[['背景與立場','環境破壞影響廣，兩派分別主張政府或個人；作者選政府。'],['政府理由','問題牽涉能源、交通、企業，居民無權強制工廠改變。'],['政府工具','立法罰款、投資清潔能源、與其他國家合作。'],['個人理由','日常駕車、回收、用膠、消費會累積為資源需求。'],['最後比較','個人行動有用但不足，政府具備規管與協調的主責能力。']],'作者認真承認個人日常行為的作用，仍以可執行權力決定主責。')];
const evidence=[
 quiz('哪些環境問題超出單一居民控制？',['氣候變化、工業污染與森林砍伐','只限某居民一星期的衣服顏色','只限一間畫廊的展品擺放位置','只限一家人晚餐是否準時開始'],'問題牽涉大型系統，不等於一戶生活習慣。'),
 quiz('工廠排放有毒廢料時，居民有甚麼限制？',['可投訴抵制，卻不能依法強制工廠改生產','居民一投訴便自動成為所有工廠的法官','只要停買產品，工廠立刻必須依法關閉','居民連投訴和抵制產品的自由也沒有'],'案例區分個人表態與法定強制權力。'),
 quiz('政府可使用哪些環境工具？',['規管、罰污染者、投資清潔能源及跨國合作','只請所有居民自行猜測工廠是否有守法','只更改環保海報顏色而不制定任何規則','只讓污染工廠選擇是否願意承擔法律責任'],'政府能做個人不能做的正式行動。'),
 quiz('個人行動支持方為何認為法律不足？',['若人繼續浪費，法律本身不能改變日常行為','因法律一旦通過，所有家庭便永遠不浪費','因所有環境損害都只由政府辦公室產生','因家庭做法與能源資源需求從來毫無關係'],'普通人的重複選擇也累積環境壓力。'),
 quiz('個人可採取哪些日常選擇？',['少開車、正確回收、少用膠及避免過度消費','每天多開車、多用膠並丟棄可用物品','只把垃圾桶換顏色而不改丟棄習慣','只在國際會議日關心環保，平日照常浪費'],'文章列出四種反覆可做的日常行動。'),
 quiz('大量家庭少浪費食物與電有甚麼總體效果？',['能源與資源需求下降','所有工廠即時不再需要守法','所有家庭從此不需購買食物','污染問題只會由回收桶外觀解決'],'個別行為在大量家庭重複可改變需求總量。'),
 quiz('作者最後為何仍選政府主導？',['個人努力有用，但規模、權限與協調仍要政府','因普通人完全不會製造任何環境壓力','因政府一有權力，家庭便應故意浪費','因工廠排污只能靠居民個別勸說'],'比喻強調個人措施不能修補主要制度漏洞。'),
];
const logic=[sequence('政府主導的理由如何成立',[['問題來源','能源、交通和企業活動也是環境損害來源。'],['權力缺口','居民可投訴抵制，不能依法強制工廠改變。'],['可用工具','政府可立規管、罰污染者、投資與跨國合作。'],['論證結果','缺少權力，保護只靠善意而無法執行。']],'由制度來源連到依法強制與跨國合作的必要。'),sequence('個人行動何以有用卻不足',[['日常行為','駕車、回收、用膠和消費會累積壓力。'],['大量家庭','少浪費使能源資源需求下降。'],['合理讓步','環境損害也由普通習慣推動。'],['效力界線','主水管仍漏水時，杯子盛水只能部分補救。'],['責任結論','個人配合，政府承擔規管和協調主責。']],'作者分清有益的個人配合與能處理制度漏洞的主導權。')];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
 transfer('河邊工廠持續排污，居民已抵制產品，卻無權查看生產線或要求它合法整改。','依範文，下一步最需要誰做甚麼？',['政府依法檢查及規管，居民可繼續施壓','只靠居民抵制，不建立依法檢查的機制','只由政府規管，不接受居民持續監督','只要求企業自查，不檢查生產線排放'],['正式權限可將訴求變成可執行責任。','抵制可施壓，合法整改仍須政府檢查規管。','政府主導，居民也可持續施壓。','企業自查不足以代替有權限的檢查。'],[5,6,7],'居民可投訴抵制，政府才有權依法強制與處罰。'),
 transfer('兩座城市共同使用同一條受污染河流，單靠一市清理，污染仍從上游流入。','哪項最符合範文的規模判斷？',['兩地政府協調規則，處理跨區污染來源','只讓下游城市清理，不協調上游來源','只讓上游立規則，不看下游清理需求','只統計兩城污染，不制定共同處理辦法'],['跨境來源需公共機構協調。','污染跨城流動，下游單獨清理不足。','上游規則重要，下游清理也須協調。','統計是起點，仍需共同規則。'],[2,3,6,14],'政府具有跨區協作與規管的能力。'),
 transfer('學校禁止即棄塑膠，但學生天天仍買多份食品並丟棄未吃完的部分。','哪項能補足規則的不足？',['學生改變購買和棄食習慣，配合學校規則','只守塑膠禁令，不改天天過量購買和棄食','只減少買食品，不處理即棄塑膠使用','只檢查食堂包裝，不看剩食是否增加'],['法律或規則需日常選擇配合。','禁塑膠有用，但過量購買和棄食仍造成浪費。','少買食品有幫助，也須配合禁塑膠規則。','包裝只是浪費一面，剩食也在題目中。'],[8,9,10,11],'若人繼續浪費，規則不能單獨奏效。'),
 transfer('社區推行節電計劃，數十萬家庭每天關掉不需要的燈和電器。','這最貼近哪項個人行動機制？',['大量家庭同時少用電，能源需求便下降','只宣傳個別家庭省電，不看大量家庭總效果','只改電價，不檢查實際電力需求能否下降','只記錄關燈次數，不估計能源使用變化'],['多個小行動累積改變總需求。','個別家庭節電會累積成總需求下降。','電價不是題目中的集體減少使用機制。','關燈次數需連到整體能源需求。'],[9,10],'大量家庭少浪費電力可降低能源需求。'),
 transfer('市政府請居民少用水，卻多年不修漏水的公共水管；居民每天省下的水仍大量流失。','哪項最能轉用範文的比喻？',['個人節水有用，但政府須修主要管道漏洞','只請居民省水，不修公共管道的主要漏點','只修水管，不承認居民日常節水的作用','只統計漏水量，不安排修繕或居民參與'],['有限個人努力不能取代系統修復。','居民節水無法替代政府修主要管道。','修管道必要，個人節水仍有用。','只有數字沒有實際修繕。'],[12,13,14],'主水管漏水時，杯子盛水有用卻不足。'),
 transfer('食品安全問題來自大型供應鏈；家長可選購食物，但不能進廠檢查或制定標準。','哪項責任分工最合範文？',['家長謹慎選購，政府規管供應鏈與工廠','只教家長選購，不建立供應鏈檢查標準','只由政府訂標準，不教家長識別食品風險','只檢查單一店鋪，不追查大型供應鏈'],['個人可配合，正式檢查需公共權力。','家長選購有作用，大型供應鏈仍需政府標準。','政府標準重要，家長也可謹慎選購。','單店檢查不足以管理整條供應鏈。'],[3,5,6,13,14],'大規模系統需政府規管，個人仍應負責。'),
 transfer('有人認為污染全是家庭沒有回收造成，工廠、交通和能源安排都不用改。','哪項反駁最符合範文？',['家庭習慣有份，制度和企業活動也造成污染','只強調家庭回收，不檢查工廠及交通排放','只管工廠，不承認家庭習慣也有作用','只看能源政策，不評估消費行為變化'],['不把大型問題只歸咎於家庭。','家庭有份，制度及企業也是污染來源。','政府管工廠有用，家庭選擇也有影響。','只看能源政策，漏了消費習慣。'],[4,11],'環境損害源自日常行為，也源自國家系統與企業。'),
 transfer('政府投入再生能源及立排放標準；居民也減少駕車和過度購物。','哪項評價最符合作者立場？',['政府主導制度改變，居民行動也能配合','只設政府排放標準，不讓居民配合減污','只靠居民少駕車，不推進再生能源制度','只同時列措施，不解釋政府與居民分工'],['兩者可兼行，公共機構主責。','政府措施須由居民日常行動配合。','個人減車有用，制度改變仍需政府。','並列不等於交代主責與配合。'],[2,6,8,9,13,14],'政府主導，個人日常行動提供重要配合。'),
 transfer('公司願不願意減排完全靠善意，違規也沒有檢查或罰則。','依範文，主要缺少哪一環？',['可執行的規管責任，而非只靠企業自願','只勸企業自願減排，不設定檢查和後果','只訂排放目標，不安排違規追查機制','只發布企業承諾，不檢查實際排放'],['法律與罰則使責任可執行。','自願不足以處理違規，須有可執行規管。','目標沒有追查和罰則，難保障執行。','承諾不是實際減排的證據。'],[6,7],'沒有正式權限，保護會變成自願善意。'),
 transfer('一篇討論政府和個人環保責任的文章，要寫既公平又有明確立場的結論。','哪句最貼近範文？',['個人應少浪費，政府仍須負規管協調主責','只說個人要減浪費，不回扣政府規管責任','只講政府主責，不承認居民可改日常行為','只各列一項措施，不說哪方應負主責'],['承認兩方作用，以權限決定主責。','個人減浪費有用，結論仍須指出政府主責。','政府主責不抹去個人可做的事。','結論要有立場，而非只並列措施。'],[11,12,13,14],'個人負責任，政府有規管及協調主責。'),
];
export default {key:'discuss-both-views:22',meta:{topic:'環境保護應由政府還是個人主導',summary:'個人減少浪費確有作用，但大型環境問題需要政府的規管、投資及跨國協調。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
