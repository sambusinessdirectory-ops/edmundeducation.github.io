// Full source-specific memorisation support for Discuss Both Views 21.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-21-ielts-discuss-both-views.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['discuss-both-views:21'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'Problems with the natural world are now some of the hardest problems people face.',
  'Some people say the Earth getting hotter is the biggest danger, while others say cutting down forests harms the world more quickly.',
  'Cutting down forests clearly hurts natural places and nearby people, but I think the Earth getting hotter is the more serious problem because it needs action sooner and reaches farther.',
  'People who say the Earth getting hotter is the main problem have a good reason: it affects nearly every place on Earth.',
  'Hotter weather can make dry periods, floods and very hot days worse, making daily life harder in rich and poor countries.',
  'For example, farmers may lose the plants they grow after a long time without rain, while cities by the sea may flood again and again as the sea rises.',
  'So the Earth getting hotter is not just a problem for nature; it also puts enough food, people’s health and steady work and money at risk.',
  'Because its effects go from one country to another, no country can easily avoid them on its own.',
  'On the other side, many people think cutting down forests does even more harm because forests help keep the Earth alive and give living things places to live.',
  'When people cut down large forests for farms, houses or money, many animals lose their homes, the ground is less able to hold together and groups of people who have lived on that land for many generations may have to leave.',
  'Also, trees take in a gas called carbon dioxide, so cutting them down can make the Earth get hotter faster.',
  'So cutting down forests is not just a small problem in one place; it can break whole natural systems and make other environmental harm happen faster.',
  'But I still think the Earth getting hotter is the bigger danger because it makes many other problems worse, including the loss of forests.',
  'Losing one forest is very harmful, but a planet that gets too hot can harm forests, seas, cities and farms at the same time.',
  'So governments must keep forests safe, but stopping the Earth from getting hotter should come first among environmental work.',
];
const vocabulary=[
  [['Environmental problems','Problems with the natural world','環境問題'],['most serious challenges','hardest problems','最嚴重挑戰'],['facing humanity','people face','人類面對']],
  [['global warming','Earth getting hotter','全球暖化'],['greatest threat','biggest danger','最大威脅'],['destruction of forests','cutting down forests','森林破壞'],['more immediate damage','harms the world more quickly','更即時傷害']],
  [['Although deforestation','Cutting down forests','儘管砍伐森林'],['harms ecosystems','hurts natural places','傷害生態系統'],['local communities','nearby people','本地社群'],['more urgent','needs action sooner','更迫切'],['far-reaching','reaches farther','影響深遠']],
  [['regard global warming','say the Earth getting hotter','認為全球暖化'],['main environmental crisis','main problem','主要環境危機'],['strong argument','good reason','有力理由'],['almost every part of the planet','nearly every place on Earth','幾乎整個地球']],
  [['Rising temperatures','Hotter weather','氣溫上升'],['intensify droughts, floods and heatwaves','make dry periods, floods and very hot days worse','加劇旱災、洪水與熱浪'],['droughts','dry periods','乾旱'],['heatwaves','very hot days','熱浪'],['ordinary life','daily life','日常生活'],['rich and poor countries','rich and poor countries','富貧國家']],
  [['For example','For example','例如'],['lose crops','lose the plants they grow','失去收成'],['long dry seasons','long time without rain','長期乾旱'],['coastal cities','cities by the sea','沿海城市'],['repeated flooding','flood again and again','反覆水浸'],['sea levels rise','sea rises','海平面上升']],
  [['not only an environmental issue','not just a problem for nature','不只是環境問題'],['food security','enough food','糧食安全'],['public health','people’s health','公共健康'],['economic stability','steady work and money','經濟穩定']],
  [['Since','Because','由於'],['spread across borders','go from one country to another','跨越國界'],['single country','country','單一國家'],['escape them','avoid them','逃避影響']],
  [['On the other hand','On the other side','另一方面'],['deforestation','cutting down forests','砍伐森林'],['more destructive','does even more harm','破壞更大'],['lungs','help keep the Earth alive','地球之肺'],['living shelters','places to live','生物庇護所']],
  [['woodland are cleared','cut down large forests','林地被砍伐'],['farming','farms','農業'],['commercial profit','money','商業利潤'],['countless animals','many animals','無數動物'],['habitats','homes','棲息地'],['soil becomes weaker','ground is less able to hold together','土壤變弱'],['indigenous communities','groups of people who have lived on that land for many generations','原住民社群'],['pushed off land','have to leave','被迫離地']],
  [['In addition','Also','此外'],['absorb carbon dioxide','take in a gas called carbon dioxide','吸收二氧化碳'],['cutting them down','cutting them down','砍樹'],['climate change worse','Earth get hotter faster','加劇氣候變化']],
  [['In this sense','So','因此'],['not a small local problem','not just a small problem in one place','不只是局部問題'],['tear apart entire ecosystems','break whole natural systems','摧毀生態系統'],['accelerate','make other environmental harm happen faster','加速'],['wider environmental damage','other environmental harm','更廣環境破壞']],
  [['In my view, however','But I still think','然而在我看來'],['greater threat','bigger danger','更大威脅'],['magnifies many other environmental problems','makes many other problems worse','放大其他環境問題'],['including deforestation itself','including the loss of forests','包括森林破壞']],
  [['destroyed forest','Losing one forest','被毀森林'],['devastating','very harmful','災難性'],['overheating planet','planet that gets too hot','過熱地球'],['at the same time','at the same time','同時']],
  [['Therefore','So','因此'],['protect forests','keep forests safe','保護森林'],['tackling global warming','stopping the Earth from getting hotter','應對全球暖化'],['top environmental priority','come first among environmental work','首要環境任務']],
];
const chunkOverrides=[
  ['Environmental problems are now among the most serious challenges','facing humanity.'],
  ['Some argue that global warming should be treated','as the greatest threat, while others believe','that the destruction of forests does more immediate damage.'],
  ['Although deforestation clearly harms ecosystems','and local communities, I believe global warming','is the more urgent and far-reaching problem.'],
  ['Those who regard global warming as the main environmental crisis','have a strong argument because it affects','almost every part of the planet.'],
  ['Rising temperatures can intensify droughts, floods and heatwaves,','making ordinary life more difficult','for both rich and poor countries.'],
  ['For example, farmers may lose crops after long dry seasons,','while coastal cities may face repeated flooding','as sea levels rise.'],
  ['This means that global warming is not only an environmental issue,','but also a threat to food security,','public health and economic stability.'],
  ['Since its effects spread across borders,','it is extremely difficult for any single country','to escape them.'],
  ['On the other hand, many people see deforestation','as even more destructive because forests are','the lungs and living shelters of the earth.'],
  ['When large areas of woodland are cleared','for farming, housing or commercial profit,','countless animals lose their habitats, soil becomes weaker,','and indigenous communities may be pushed off land','that has supported them for generations.'],
  ['In addition, trees absorb carbon dioxide,','so cutting them down can make climate change worse.'],
  ['In this sense, deforestation is not a small local problem;','it can tear apart entire ecosystems','and accelerate wider environmental damage.'],
  ['In my view, however, global warming remains the greater threat','because it magnifies many other environmental problems,','including deforestation itself.'],
  ['A destroyed forest is devastating,','but an overheating planet can damage forests, oceans, cities','and agriculture at the same time.'],
  ['Therefore, while governments must protect forests,','tackling global warming should be the top environmental priority.'],
];
const simpleChunkOverrides=[
  ['Problems with the natural world are now','some of the hardest problems people face.'],
  ['Some people say the Earth getting hotter is the biggest danger,','while others say cutting down forests harms the world more quickly.'],
  ['Cutting down forests clearly hurts natural places and nearby people,','but I think the Earth getting hotter is the more serious problem','because it needs action sooner and reaches farther.'],
  ['People who say the Earth getting hotter is the main problem','have a good reason: it affects nearly every place on Earth.'],
  ['Hotter weather can make dry periods, floods','and very hot days worse, making daily life harder','in rich and poor countries.'],
  ['For example, farmers may lose the plants they grow','after a long time without rain,','while cities by the sea may flood again and again','as the sea rises.'],
  ['So the Earth getting hotter is not just a problem for nature;','it also puts enough food, people’s health','and steady work and money at risk.'],
  ['Because its effects go from one country to another,','no country can easily avoid them on its own.'],
  ['On the other side, many people think cutting down forests','does even more harm because forests help keep the Earth alive','and give living things places to live.'],
  ['When people cut down large forests for farms, houses or money,','many animals lose their homes,','the ground is less able to hold together','and groups of people who have lived on that land','for many generations may have to leave.'],
  ['Also, trees take in a gas called carbon dioxide,','so cutting them down can make the Earth get hotter faster.'],
  ['So cutting down forests is not just','a small problem in one place;','it can break whole natural systems','and make other environmental harm happen faster.'],
  ['But I still think the Earth getting hotter is the bigger danger','because it makes many other problems worse,','including the loss of forests.'],
  ['Losing one forest is very harmful,','but a planet that gets too hot can harm forests, seas, cities','and farms at the same time.'],
  ['So governments must keep forests safe,','but stopping the Earth from getting hotter','should come first among environmental work.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
  card('Housing costs are now among the hardest challenges facing young families.','以 are now among ... facing ... 指出問題及受影響者',[2,3,12],fixed(0,'[住房開支] are now among [最難處理的問題] facing [年輕家庭].','開首指出議題已成嚴重挑戰，並交代誰受影響。','要在引言簡潔交代某類問題的嚴重程度及受影響群體時。',[' are now among ',' facing '],['正在加劇的問題','它屬於哪類嚴重挑戰','面對挑戰的人'])),
  card('Some argue that poor transport should be treated as the greatest threat, while others believe that unsafe housing does more immediate damage.','以 Some argue ... while others believe ... 公平並列兩種威脅',[0,8,13],fixed(1,'Some argue that [第一個問題] should be treated as [最大威脅], while others believe that [第二個問題] does more immediate damage.','引言並列兩種對「最大威脅」的判斷，不先代替任何一方下結論。','題目要求比較兩個問題何者更嚴重，需先準確呈現雙方觀點時。',['Some argue that ',' should be treated as ',', while others believe that ',' does more immediate damage.'],['第一方提出的問題','第一方給它的嚴重程度','第二方提出的問題'])),
  card('Although school closures clearly harm pupils and their families, I believe a shortage of teachers is the more urgent and far-reaching problem.','以 Although ... I believe ... 承認另一害處後選較迫切問題',[1,8,12],fixed(2,'Although [另一問題確有害處], I believe [我選的問題] is the more urgent and far-reaching problem.','作者承認森林破壞嚴重，仍明確選全球暖化為更迫切且影響更廣的問題。','兩方問題都有害，要在引言承認另一方理據並給出自己的比較判斷時。',['Although ',', I believe ',' is the more urgent and far-reaching problem.'],['另一問題帶來的真實傷害','作者選擇的較大問題'])),
  card('Those who regard poor housing as the main public health crisis have a strong argument because it affects whole neighbourhoods.','以 Those who regard ... because ... 展開一方何以有理',[1,4,8],fixed(3,'Those who regard [某問題] as the main [某類危機] have a strong argument because it affects [影響範圍].','先公平說明全球暖化支持方的核心理由：影響幾乎遍及全地球。','要開始討論其中一方時，先交代其判斷及最有力的影響範圍時。',['Those who regard ',' as the main ',' have a strong argument because it affects '],['被視為首要的問題','危機所屬領域','受影響的範圍'])),
  card('Long school closures can intensify learning gaps, stress and isolation, making daily life more difficult for both children and parents.','以 can intensify ... making ... 連接惡化與日常後果',[3,5,6],fixed(4,'[問題] can intensify [多種困難], making [日常情況] more difficult for both [兩類群體].','氣溫上升加劇旱災、洪水與熱浪，使富國窮國的日常生活都更艱難。','要說明一個問題如何加重多種具體困難，並同時影響兩類人時。',[' can intensify ',', making ',' more difficult for both '],['使困難加劇的原因','被加重的困難','因此變難的生活或工作','兩類受影響者'])),
  card('For example, pupils may lose lessons after long teacher absences, while parents may face repeated travel costs as classes move farther away.','以 For example ... while ... as ... 舉兩組人不同後果',[4,6,9],fixed(5,'For example, [第一組人] may lose [原本有的東西] after [原因], while [第二組人] may face [另一後果] as [變化加劇].','農民失去收成與沿海城市反覆水浸，展示同一問題的兩種具體後果。','已提出廣泛影響，要以兩組受影響者的具體例子說明不同後果時。',['For example, ',' may lose ',' after ',', while ',' may face ',' as '],['第一組受影響者','第一種損失','造成損失的情況','第二組受影響者','第二種困難','使困難加劇的變化'])),
  card('This means that poor housing is not only a health issue, but also a threat to family finances and children’s education.','以 not only ... but also ... 擴大問題的跨領域影響',[4,5,7],fixed(6,'This means that [問題] is not only [一類問題], but also [其他領域的威脅].','全球暖化不只涉及環境，也危及糧食、健康和經濟。','已舉具體後果，要指出問題同時跨越其他政策或生活領域時。',['This means that ',' is not only ', ', but also '],['由例子概括的問題','表面所屬領域','另外受威脅的領域'])),
  card('Since online scams spread across borders, it is extremely difficult for any single country to stop them.','以 Since ... difficult for any single country ... 說明跨境問題',[4,6,10],fixed(7,'Since [影響] spread across borders, it is extremely difficult for any single country to [獨自避免或處理].','全球暖化的影響跨越國界，單一國家很難獨善其身。','要解釋某問題跨越邊界、不能只靠一個國家處理時。',['Since ',' spread across borders, it is extremely difficult for any single country to '],['會越過邊界的影響','一國難以獨自完成的事'])),
  card('On the other hand, many people see library closures as even more destructive because libraries are the heart of community learning.','以 On the other hand ... because ... 轉到另一方核心理由',[1,3,9],fixed(8,'On the other hand, many people see [另一問題] as even more destructive because [相關事物] are the [重要功能].','轉到森林破壞一方：森林是地球生物的重要棲身處。','討論完一方，要轉述另一方認為另一問題更嚴重的核心原因時。',['On the other hand, many people see ',' as even more destructive because ',' are the '],['另一方重視的問題','其造成傷害的關鍵事物','不可輕易取代的功能'])),
  card('When local markets are cleared for new roads, many sellers lose their stalls, nearby streets become busier, and older residents may be pushed off land that has supported them for generations.','以 When ... lose their ... and ... 逐項追蹤清拆後果',[8,10,11],fixed(9,'When [地方] are cleared for [新用途], [群體] lose their [資源], [另一變化], and [居民] may be pushed off [土地] that has supported them for generations.','清除林地後，動物失去棲息地、土壤變弱，原住民也可能被迫離開祖居地。','要說明某地被改作其他用途後，如何連續影響自然條件及依賴當地的人時。',['When ',' are cleared for ',', ',' lose their ',', ',', and ',' may be pushed off ',' that has supported them for generations.'],['被清除的地方','改作的新用途','失去資源的群體','他們失去的東西','另一項環境或社區變化','可能被迫離開的人','養活他們多年的地方'])),
  card('In addition, old buildings provide shade, so knocking them down can make summer heat worse.','以 In addition ... so ... 補上加劇另一問題的機制',[8,9,12],fixed(10,'In addition, [事物] [提供某功能], so [破壞它] can make [原有問題] worse.','樹木吸收二氧化碳，砍樹也會加劇氣候變化。','已列直接損失，還要指出破壞某資源會進一步惡化另一問題時。',['In addition, ',', so ',' can make ',' worse.'],['提供保護功能的事物','它原本發揮的功能','破壞該功能的做法','因此惡化的問題'])),
  card('In this sense, losing local clinics is not a small local problem; it can harm entire districts and increase wider health risks.','以 In this sense ... not ...; it can ... 概括外溢傷害',[8,9,10],fixed(11,'In this sense, [問題] is not a small local problem; it can [重大直接傷害] and [更廣的後果].','森林破壞可摧毀整片生態系統，還會加速較廣的環境損害。','已列多種後果，要概括某事不只影響一地，還會帶來更廣傷害時。',['In this sense, ',' is not a small local problem; it can ',' and '],['看似局部的問題','它造成的嚴重直接傷害','蔓延出去的影響'])),
  card('In my view, however, poor housing remains the greater threat because it magnifies many other social problems, including school absence itself.','以 remains ... because it magnifies ... 回到比較判斷',[2,8,11],fixed(12,'In my view, however, [作者選的問題] remains the greater threat because it magnifies [其他問題], including [另一方關心的問題] itself.','作者判全球暖化更嚴重，理由是它會放大其他問題，包括森林破壞。','兩方害處已呈現，要說明自己選的問題為何還會加重另一方關心的問題時。',['In my view, however, ',' remains the greater threat because it magnifies ',', including ',' itself.'],['作者最後認為較大的威脅','被它放大的其他問題','其中一個原先比較的問題'])),
  card('A closed local clinic is devastating, but an overstretched health system can damage hospitals, schools and workplaces at the same time.','以 A ... but an ... at the same time 比較傷害範圍',[9,11,12],fixed(13,'A [單一損失] is devastating, but an [更廣危機] can damage [多個領域] at the same time.','單一森林被毀已很嚴重，整個地球過熱卻可同時傷害森林、海洋、城市和農業。','要承認局部損失嚴重，同時比較更廣危機可一次影響多少領域時。',['A ',' is devastating, but an ',' can damage ',' at the same time.'],['單一但嚴重的損失','較廣的系統性危機','同時受損的領域'])),
  card('Therefore, while governments must protect small shops, tackling rising rents should be the top economic priority.','以 while ... must ... should be the top ... 收束兩件必要工作的優先次序',[2,12,13],fixed(14,'Therefore, while [行動者] must [保護其中一項], [處理較大威脅] should be the top [領域] priority.','結論不放棄保護森林，但按影響範圍把應對全球暖化列為首要。','兩件事都重要，要在結論指出哪一項應列為更優先工作時。',['Therefore, while ',' must ',', ',' should be the top ',' priority.'],['需要兼顧兩件事的行動者','仍必須做的保護工作','排在首位的應對工作','決定優先次序的領域'])),
];
const wrongReasons=[
 ['這句公平列兩種威脅，原句先交代環境挑戰嚴重。','這句在引言選全球暖化，原句尚未提出作者判斷。','這句已進入支持方理由，非開篇的問題定位。'],
 ['這句概括環境問題嚴重，未比較兩種候選威脅。','這句轉到森林破壞一方，未在引言公平並列。','這句比較局部與全球影響，已是後段判斷。'],
 ['這句只並列兩派，未讓步另一方後清楚選自己的立場。','這句只是介紹森林破壞支持方，未表明作者選擇。','這句在後段重申立場，原句是引言的首次表態。'],
 ['這句報告兩派看法，未開始解釋其中一派有力之處。','這句列出氣溫上升的具體後果，原句先說影響範圍。','這句已轉到另一方的森林理由，語篇位置不同。'],
 ['這句先概括支持方的廣泛影響，未列多種變嚴重的災害。','這句是農民與沿海城市個案，原句先概述普遍後果。','這句歸納跨領域威脅，原句先展示日常困難。'],
 ['這句概述熱浪等影響，未以兩組人作具體對照。','這句已抽象到糧食健康經濟，未舉農民和城市例子。','這句詳細列森林破壞後果，並非氣候例證。'],
 ['這句列災害與生活困難，未把環境影響推至其他領域。','這句給出兩個個案，原句要概括糧食健康經濟。','這句說跨境影響，並非跨政策領域的後果。'],
 ['這句說氣候問題牽連糧食健康經濟，未指出越過國界。','這句補充砍樹加劇氣候變化，非單國難以避免的理由。','這句已回到作者比較判斷，原句仍說全球影響。'],
 ['這句是全球暖化支持者的理由，未轉向另一方。','這句列清除林地的損害，原句先交代森林的功能。','這句承認兩方後選全球暖化，並非呈現森林派立場。'],
 ['這句先概括森林重要，未追蹤清地的連續後果。','這句只補一項樹木吸碳機制，未列動物土壤居民三重影響。','這句是概括外溢損害，原句先給具體連鎖例子。'],
 ['這句列清除林地的三類直接傷害，未說樹木吸碳。','這句概括森林破壞並非局部問題，未補出吸碳機制。','這句判全球暖化較大，未解釋砍樹如何加劇氣候變化。'],
 ['這句是森林重要性的引入，未歸納具體損害的範圍。','這句給出清地後動物土壤居民的損害，未概括外溢。','這句只說吸碳機制，未概括整體生態與更廣傷害。'],
 ['這句在引言表態，未吸收雙方論證後解釋放大效應。','這句承認森林毀壞嚴重，未判哪個威脅更會放大別的問題。','這句歸納森林破壞，原句要回到作者更大威脅的判斷。'],
 ['這句詳列森林清除的傷害，未以單一對全球的尺度比較。','這句歸納森林破壞可外溢，未比較兩類危機同時影響範圍。','這句已判全球暖化會放大其他問題，原句再用對照加強。'],
 ['這句在引言先表明立場，未於結論兼顧兩項政府工作。','這句論證全球暖化較大，未最後設定保林與減暖的優先次序。','這句比較一片森林與過熱地球，原句才從比較導出政策排序。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先分清兩種環境威脅的直接傷害，再比較影響範圍及放大效應。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
 quiz('題目要求比較哪兩種環境問題？',['全球暖化與森林破壞何者威脅較大','城市建築外牆顏色何者比較亮','哪種博物館畫框更值得大量購買','旅客應先在市中心遊覽哪個景點'],'兩派比較全球暖化和森林破壞，作者也要選出較大威脅。'),
 {type:'multi',prompt:'選出作者的完整立場',detail:'選兩項，再按「確認」。',options:['森林破壞確實嚴重，會傷害生態與人','全球暖化影響更廣，也會加重其他環境問題','森林破壞完全不會影響動物或原住民','全球暖化只影響某一個國家的一片森林'],correct:[0,1],why:'作者承認森林破壞有害，但按廣度及放大效應選全球暖化。'},
];
const route=[sequence('依文章次序排列比較路線',[
 ['引言與立場','列出全球暖化與森林破壞兩派，選全球暖化。'],
 ['全球暖化理由','列旱災水浸熱浪，說明跨領域與跨境影響。'],
 ['森林破壞理由','列動物、土壤與原住民受害，補出吸碳機制。'],
 ['最後比較','全球暖化會放大其他問題，同時傷害更多領域。'],
 ['政策結論','保護森林仍必要，但應優先應對全球暖化。'],
 ],'先公平說兩邊的具體傷害，再按影響範圍與放大效應作判斷。')];
const evidence=[
 quiz('氣溫上升會加劇哪幾類災害？',['乾旱、洪水與熱浪，令日常生活更難','只會令所有季節的氣溫完全保持不變','只會改變畫廊展示作品的先後次序','只會令每個城市即時失去所有街道'],'三種災害是作者比較全球暖化影響的具體基礎。'),
 quiz('農民與沿海城市的例子分別說明甚麼？',['長旱令農民失收，海面上升令城市反覆水浸','農民只會因雨太多而失去所有沿海樓宇','城市水浸可證明森林完全沒有任何作用','農田收成與海面高度從來不受氣候影響'],'兩組例子呈現同一問題在不同地區的後果。'),
 quiz('全球暖化為何不只是環境議題？',['還威脅糧食供應、公共健康及經濟穩定','因為所有糧食問題都只由美術館決定','因為氣溫變化完全不會影響任何工作','因為只要經濟穩定，便可取消所有糧食'],'作者把災害的影響連到生活和政策的其他領域。'),
 quiz('森林被大範圍清除後，誰或甚麼受損？',['動物失去棲地、土壤變弱，原住民或被迫離地','所有動物即時得到更大更安全的棲息地方','土壤自動變得更穩固且沒有居民受任何影響','只有觀光宣傳的顏色變化，其他方面均不變'],'森林破壞的理由含自然與人的連續損害。'),
 quiz('砍樹如何又加劇全球暖化？',['樹木吸收二氧化碳，砍掉它們會削弱這作用','樹木停止吸碳後，氣候便一定永久變涼','所有二氧化碳都只會由藝術作品產生','砍樹只改變森林名稱而不影響任何氣體'],'吸碳功能把森林破壞與氣候變化連在一起。'),
 quiz('作者用甚麼標準選全球暖化為更大威脅？',['它跨境而且會放大其他問題，傷害多種領域','它只影響一片森林，所以比所有問題都小','它完全不涉及城市、農田、海洋或健康','它只需一個國家獨自處理，其他地方無關'],'比較不只看單一地點的損失，還看同時影響和放大效應。'),
 quiz('結論對保護森林持甚麼態度？',['仍要求政府保林，但把減暖列為首要','因減暖較大，便可容許所有森林被清除','認為只保護森林，便可忽略全球暖化','要求停止所有環境政策以免難作取捨'],'優先次序不等於放棄另一項必要工作。'),
];
const logic=[
 sequence('全球暖化支持方的論證如何推進',[
 ['影響範圍','升溫影響幾乎全地球。'],['具體災害','旱災、洪水和熱浪加劇。'],['生活例子','農民失收，沿海城市反覆受浸。'],['跨領域','糧食、健康和經濟都受威脅。'],['跨國界','任何單一國家都難以避開。'],
 ],'由災害和生活例子推至領域及國界的廣度。'),
 sequence('森林破壞與作者最終比較如何連接',[
 ['森林功能','提供棲身處，也吸收二氧化碳。'],['清地損害','動物失去家園、土壤變弱、居民被迫遷。'],['外溢影響','整個生態系統受損，氣候危機亦加劇。'],['作者尺度','全球暖化還會放大包括森林破壞在內的問題。'],['優先次序','保林仍重要，先應對更廣的全球暖化。'],
 ],'作者先認真處理森林派的理由，才按放大效應作最終比較。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
 transfer('一座城市夏天更熱，獨居長者中暑增多，商戶也因冷氣費大增而縮短營業。','哪項最能轉用範文的跨領域論證？',['升溫同時影響健康與經濟，不只是天氣變化','只記錄中暑個案，不分析商戶能源成本','只看冷氣費，不評估長者的健康風險','只把炎熱當作天氣新聞，不談生活影響'],['指出同一環境變化在多個生活領域的後果。','健康重要，還要看商戶成本與營業。','經濟重要，長者中暑同樣需分析。','天氣變化有真實健康與經濟後果。'],[4,6],'環境危機可同時威脅健康和經濟穩定。'),
 transfer('兩個鄰國共享一條河，上游長旱使下游農田缺水，單一國家無法控制全流域。','哪項最貼近範文的跨境推理？',['影響跨越國界，兩國需協調而非各自獨行','只讓下游自行蓄水，不協調上游用水安排','只研究上游旱情，不問下游農田缺水','只分別立法，不建立跨境流域合作'],['跨境影響難由一國獨自避開或處理。','下游努力有用，但整條河受上游影響。','上游旱情須連到下游農田。','各自立法不足以管好共享流域。'],[7],'跨境影響使單一國家難以獨自避開後果。'),
 transfer('一區清除樹林建住宅，鳥類失去巢穴，雨後土壤流失，原住民也須遷走。','哪項最能概括其連鎖傷害？',['同一清地行動同時傷害動物、土地與社群','只看鳥類失巢，不問土壤與居民受影響','只看土壤流失，不評估原住民被迫遷走','只談住房增加，不記錄多方面的損害'],['三重後果對應範文的動物、土壤與居民。','鳥類只是清地影響的一面。','土壤重要，居民遷移也在題目中。','住房好處不應遮蔽動物土地社群損害。'],[9],'林地清除後，棲地、土壤和居民都可能受損。'),
 transfer('政府計劃保護樹林，但另一部門同時批准大量燃煤發電，令氣溫繼續上升。','依作者立場，政策還缺少甚麼？',['保林之外仍須減暖，因升溫也會傷害森林','只保護森林，不處理燃煤發電造成的升溫','只減少燃煤，不維護已受壓的森林棲地','只統計樹木數，不分析升溫的長期影響'],['作者把減暖列首位，因它也放大森林損害。','保林有用，升溫仍會持續傷害森林。','減暖有用，現存森林也需保護。','樹數不足以說明燃煤與升溫。'],[12,14],'全球暖化會放大其他環境問題，包括森林破壞。'),
 transfer('一家醫院要選先處理單一病房漏水，還是整套供電系統過熱；兩者都會傷害病人。','哪項比較方法最像範文？',['先修全院過熱，再補漏，因影響較多病房','先修單一漏水病房，不處理全院電力過熱','只修系統過熱，不修已知漏水病房','只按維修費選擇，不比較波及病人數'],['承認局部損失，按更廣同時傷害排優先。','全院系統影響更多病房，應優先處理。','全院系統優先後，漏水也不能忽略。','費用不是影響範圍的唯一標準。'],[13,14],'局部損失可很嚴重；更廣危機可同時傷害多處。'),
 transfer('一個城市沿岸水浸反覆出現，內陸農田又因長期乾旱失收。','哪項例子最能連起兩地？',['同一氣候變化可令海邊水浸，也令內陸失收','只研究沿岸水浸，不看內陸乾旱失收','只研究農田失收，不問沿岸住屋風險','只說天氣多變，不連結兩地不同後果'],['兩組具體後果共同展示影響廣度。','氣候可同時造成沿岸及內陸不同後果。','只看農田漏了沿岸水浸。','泛說多變未展示兩地具體影響。'],[4,5],'農民失收與沿海水浸是同一危機的不同後果。'),
 transfer('一地砍樹後，野生動物少了；另一地又因二氧化碳增加而更熱。','哪項能說明兩個問題的關聯？',['砍樹既毀棲地，也削弱吸碳並加劇升溫','只看動物少了，不分析樹木吸碳能力','只談吸碳減少，不保護受毀的棲地','只計砍樹收入，不看生態與氣候代價'],['同一破壞同時造成直接與間接傷害。','棲地損失之外，砍樹也削弱吸碳。','吸碳重要，動物棲地也受破壞。','收入不是全部環境代價。'],[9,10,11],'森林破壞可傷棲地，也因少吸碳加重氣候變化。'),
 transfer('有人說森林破壞嚴重，所以政府應完全停止研究全球暖化。','哪項回應符合作者的比較立場？',['保森林仍要做，減暖應優先處理廣泛風險','只保護森林，不研究升溫對其他地區影響','只研究全球暖化，不制定森林保護措施','只比較樹林面積，不問廣泛氣候風險'],['優先處理較大威脅，仍不放棄另一項工作。','保林必要，全球暖化仍有更廣風險。','減暖優先不等於放棄森林保護。','面積不直接比較升溫的廣泛影響。'],[2,12,14],'政府須保林，也須把應對全球暖化列首要。'),
 transfer('校長比較某班課室太熱與全校電力老化；後者還令冷氣更常失效。','哪項理由最合範文最後的放大效應？',['全校電力更急，還加重課室過熱','只修課室冷氣，不處理全校供電老化','只換供電系統，不處理已熱的課室','只看單班溫度，不估計全校影響'],['較廣問題放大另一問題，構成比較理由。','局部冷氣不能修全校供電問題。','供電問題更急，已熱課室仍需處理。','單班溫度不足以評估全校系統。'],[12,13],'較大威脅會放大另一問題，並同時傷害多處。'),
 transfer('一篇文章先說森林被毀後果，最後要解釋為何仍選全球暖化為最大威脅。','哪項結論最完整？',['森林須保護，升溫更廣且加重其他問題','只列森林破壞，不比較升溫波及的範圍','只談升溫，不承認森林本身仍要保護','只選最大威脅，不說它如何加重其他問題'],['承認森林傷害，按廣度及放大效應排序。','要解釋為何升溫波及更廣。','承認升溫優先仍可保護森林。','只選答案而不說加重效應，論證不足。'],[8,9,10,12,14],'結論兼顧保林，仍把更廣且會放大問題的暖化列首位。'),
];
// Reviewed connector structure decompositions.
structures[10].frame.parts=[["In addition, ","link","句型固定部分"],["trees","slot","帶來作用的事物"],[" ","link","句型固定部分"],["absorb carbon dioxide","slot","原有功能"],[", so ","link","句型固定部分"],["cutting them down","slot","破壞行動"],[" can make ","link","句型固定部分"],["climate change","slot","被加劇的問題"],[" worse.","link","句型固定部分"]];
structures[10].frame.formula="In addition, [帶來作用的事物] [原有功能], so [破壞行動] can make [被加劇的問題] worse.";
export default {key:'discuss-both-views:21',meta:{topic:'全球暖化與森林破壞何者威脅較大',summary:'森林破壞傷害生態與居民；全球暖化的影響更廣，並會放大其他環境問題，因此應優先處理。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
