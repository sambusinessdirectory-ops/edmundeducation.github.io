// Reviewed Opinion 91: mobile phones, attention and social confidence.
import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-91-ielts-opinion.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['opinion:91'];
const original=source.sentences.map(row=>row.english);
const simple=[
 'Technology has changed not only the way people talk, but also how willing they are to meet and talk in person.',
 'I agree that phones make people talk to others less, because they distract them from speaking face to face and replace deep talks with fast, light messages.',
 'First, phones keep drawing people’s attention away when they are with others.',
 'A person may sit at dinner, in class or at work, but think about messages and things online instead of people nearby.',
 'When this happens, talks break up: people only partly listen, reply without thinking and miss small looks that make conversation feel close.',
 'For example, it is common to see friends in a café looking at their own phones instead of talking.',
 'They sit together, but do not really spend time with one another.',
 'After a while, this can make talking to someone in person feel strange and less important.',
 'Another problem is that phones lead people to pick what is easy rather than truly talking with someone.',
 'It is easier to send a brief text or an emoji than to meet someone, talk through a hard problem or keep speaking often enough to build a friendship.',
 'This hurts young people especially, because they need to learn to read people’s faces and movements, deal with different views and speak with confidence.',
 'If most of their talks happen through screens, they may feel less at ease when they have to talk to someone in person without planning.',
 'In other words, a phone can seem like an easier way to keep in touch, but it may slowly take away the skills people need to feel close to others.',
 'To sum up, I agree that new technology, especially phones, is causing people to talk to one another less.',
 'Phones pull attention away from nearby people and make quick, easy online contact seem equal to a real talk.',
 'Although phones let us reach others quickly, they may make us pay less attention and feel less sure when talking to people.',
];
const vocabulary=[
 [['Technology','Technology','科技'],['not only','not only','不但'],['communicate','talk','溝通'],['put into real social contact','willing they are to meet and talk in person','投入真正社交的努力']],
 [['inventions such as mobile phones','phones','手機等發明'],['less socially interactive','talk to others less','社交互動減少'],['weaken face-to-face communication','distract them from speaking face to face','削弱面對面溝通'],['meaningful conversations','deep talks','有意義的對話'],['shallow exchanges','light messages','膚淺交流']],
 [['first reason','First','第一個原因'],['mobile phones','phones','手機'],['constantly compete for','keep drawing','不斷爭奪'],['attention','attention','注意力'],['social settings','with others','社交場合']],
 [['physically present','sit','身體在場'],['dinner table','dinner','飯桌'],['workplace','work','工作場所'],['mentally pulled away','think about','心神被拉走'],['online content','things online','網上內容']],
 [['conversation becomes fragmented','talks break up','對話變零碎'],['listen with half an ear','only partly listen','只聽進一半'],['respond mechanically','reply without thinking','機械式回應'],['small expressions','small looks','細微表情'],['warm and personal','feel close','溫暖親切']],
 [['For example','For example','例如'],['common to see','common to see','經常看見'],['sitting together','in a café','一起坐在咖啡店'],['silently scrolls through their phone','looking at their own phones','默默滑手機']],
 [['sharing the same space','sit together','身處同一空間'],['not really sharing the same moment','do not really spend time with one another','並未真正共度時光']],
 [['Over time','After a while','長遠而言'],['this habit','this','這種習慣'],['direct interaction','talking to someone in person','直接互動'],['less natural','feel strange','不再自然'],['less valued','less important','不再被重視']],
 [['Another important issue','Another problem','另一重要問題'],['encourage people to choose','lead people to pick','促使人們選擇'],['convenience','what is easy','方便'],['genuine engagement','truly talking with someone','真正投入地交流']],
 [['short message','brief text','短訊'],['reacting with an emoji','an emoji','以表情符號回應'],['difficult discussion','hard problem','艱難的討論'],['regular conversation','keep speaking often enough','定期交談'],['building a relationship','build a friendship','建立關係']],
 [['especially harmful for younger people','hurts young people especially','對年輕人尤其有害'],['reading body language','read people’s faces and movements','理解肢體語言'],['handling disagreement','deal with different views','處理分歧'],['speaking confidently','speak with confidence','自信地說話']],
 [['most of their communication','most of their talks','大部分溝通'],['behind a screen','through screens','透過螢幕'],['less comfortable','less at ease','較不習慣'],['spontaneous face-to-face contact','talk to someone in person without planning','即興面對面交流']],
 [['In other words','In other words','換言之'],['social shortcut','easier way to keep in touch','社交捷徑'],['slowly removes','slowly take away','慢慢削弱'],['deeper human connection','feel close to others','更深層的人際連結']],
 [['In conclusion','To sum up','總結來說'],['modern technologies','new technology','現代科技'],['particularly mobile phones','especially phones','尤其是手機'],['reducing social interaction','causing people to talk to one another less','減少社交互動']],
 [['distract people','pull attention away','使人分心'],['those around them','nearby people','身邊的人'],['low-effort digital contact','quick, easy online contact','省力的數碼聯繫'],['substitute for real conversation','equal to a real talk','真實對話的替代品']],
 [['While they connect us quickly','Although phones let us reach others quickly','雖然快速連繫'],['quietly make us','make us','悄悄地使我們'],['less attentive','pay less attention','較不專注'],['less socially confident','feel less sure when talking to people','較缺乏社交自信']],
];
export {original,simple,vocabulary};
function frame(i,links,labels,meaning,usage,example,tag,job){
 const value=original[i],parts=[];let cursor=0,slot=0;
 for(const link of links){const at=value.indexOf(link,cursor);if(at<0)throw Error('Missing fixed wording '+(i+1)+': '+link);
  if(at>cursor)parts.push({text:value.slice(cursor,at),kind:'slot',label:labels[slot++]});
  parts.push({text:link,kind:'link',label:'句型固定部分'});cursor=at+link.length;}
 if(cursor<value.length)parts.push({text:value.slice(cursor),kind:'slot',label:labels[slot++]});
 if(slot!==labels.length)throw Error('Unmatched slot labels '+(i+1));
 return {frame:{formula:parts.map(p=>p.kind==='link'?p.text:'['+p.label+']').join(''),meaning,usage,parts},example,tag,job};
}
const specs=[
 frame(0,[' has changed not only ', ', but also '],['造成改變的事物','改變的第一個面向','改變的第二個面向'],'not only...but also 把溝通形式及投入社交的意願並列。','同一變化同時影響做法和行為意願，需要並列兩個層面時。','Remote work has changed not only where we work, but also how we meet.','not only...but also','並列兩層影響'),
 frame(1,['I agree that ', ', because '],['作者贊成的判斷','削弱面對面交流與深化對話的兩項理由'],'I agree that 明確表態；because 預告兩個主體段會分析的機制。','引言要直接表明同意與否，並交代支持立場的主要理由時。','I agree that devices can distract us, because alerts interrupt our talks.','I agree that...because','表態並預告理由'),
 frame(2,[' is that '],['第一個主要理由','手機在社交情境爭奪注意力的機制'],'is that 在段首清楚提出可由生活例子檢驗的原因。','第一個主體段要提出能以具體情境支持的主要理由時。','The first reason is that phones keep interrupting attention.','is that','提出可驗證的理由'),
 frame(3,[' may be ', ', but '],['表面在場的人','人在現場的表面狀態','心思被線上訊息帶走的實際狀態'],'but 對照身體在場與注意力不在場。','需要指出一個人表面符合某條件，實際上卻沒有達到其目的時。','A parent may be at the table, but her attention is elsewhere.','may be...but','對照在場與投入'),
 frame(4,['When this happens, ', ': '],['注意力中斷後的對話狀態','可觀察的聆聽及回應問題'],'When this happens 承接前句；冒號把抽象結果展開成具體表現。','已說明一個原因，接着要用可觀察的細節呈現其後果時。','When this happens, discussion breaks down: people miss important details.','When this happens...:','把結果具體化'),
 frame(5,['For example, ', ' while '],['朋友相聚的場景','每個人卻在滑手機的對照行為'],'For example 提供真實可想像的場景；while 同時呈現相反行為。','要用同一時間兩種互相衝突的行為，具體展示前述問題時。','For example, friends may sit together while each looks at a screen.','For example...while','用同時對照的場景舉例'),
 frame(6,[', but '],['人們在物理上相聚','人們未真正共享交流的事實'],'but 在一句短句內凸顯同一空間與真正互動的差距。','前句有細節後，要用精簡對照句收束那個場景的核心落差時。','They share a room, but not a real conversation.','but','收束表面與實際的落差'),
 frame(7,['Over time, ', ' can '],['長期累積的習慣','直接互動逐漸變得陌生的可能效果'],'Over time 指累積而非即時；can 避免斷言人人必然如此。','要說明一種反覆行為的長期可能影響時。','Over time, this habit can make group talk feel awkward.','Over time...can','提出非必然的長期效果'),
 frame(8,[' is that ', ' over '],['第二項重要問題','方便','真正投入交流'],'choose...over 呈現便利與深度交流之間的取捨。','第一條成因已說完，需要引出另一種選擇機制並指出被犧牲的一方時。','Another issue is that people choose speed over understanding.','is that...over','引出第二種取捨'),
 frame(9,[' is easier than '],['較省力的數碼行為','較費心但有助建立關係的實際行為'],'easier than 比較不同互動方式所需的努力，說明為何人們可能選擇捷徑。','要解釋一種方便行為為何取代較費心的關係維繫時。','Sending an emoji is easier than discussing a problem face to face.','easier than','比較方便與投入'),
 frame(10,['This is especially harmful for ', ', who '],['特別需要練習的群體','他們需要培養的社交技能'],'especially harmful for 限定風險更大的群體；who 補上其特殊原因。','一種影響並非人人相同，要指出較脆弱群體及其所需能力時。','This is especially harmful for children, who need practice in conversation.','especially harmful for...who','限定受影響群體及原因'),
 frame(11,['If ', ', they may '],['多數溝通在螢幕後發生的條件','面對面接觸可能變得不自在的結果'],'If 設定條件；may 保留不同人的反應可能有別。','要說明某種習慣在特定條件下可能帶來的能力後果時。','If most talks happen online, they may find real meetings difficult.','If...they may','提出有條件的可能後果'),
 frame(12,['In other words, ', ', but '],['手機作為方便捷徑的重新表述','捷徑可能削弱的深層能力'],'In other words 重述第二段核心；but 對比眼前便利和長期損失。','已分析一段機制，要用簡明對比句概括其便利與代價時。','In other words, a shortcut saves time, but it can weaken skill.','In other words...but','重述便利與代價'),
 frame(13,['In conclusion, ', ' are '],['作者同意的總結判斷','社交互動正在減少的趨勢'],'In conclusion 回收同意立場，不增加新的原因。','結尾要直接回應題目立場，概括已論證的趨勢時。','In conclusion, I agree that phones are changing how we talk.','In conclusion...are','重申題目立場'),
 frame(14,[' distract ', ' and make '],['使人分心的科技','注意力離開身邊的人','省力數碼交流被誤當真正對話'],'distract...and make 並列文章兩個主體段的核心機制。','結尾要在同一句收束兩個已解釋的作用機制時。','Phones distract diners from friends and make texts feel like full conversations.','distract...and make','並列兩項已分析機制'),
 frame(15,['While ', ', they can also '],['科技能快速連繫的好處','人可能變得較不投入或自信的代價'],'While 承認好處，can also 承認可能伴隨的負面影響。','結尾想公平承認便利，仍須清楚指出已論證的社交代價時。','While devices connect us quickly, they can also reduce attention.','While...can also','承認便利並收束代價'),
];
const structures=specs.map((target,i)=>{const distractors=[(i+1)%specs.length,(i+6)%specs.length,(i+11)%specs.length];return {...target,distractors,wrongReasons:distractors.map(j=>'這句用「'+specs[j].tag+'」'+specs[j].job+'；沒有用「'+target.tag+'」'+target.job+'。'),answerReason:'示例用「'+target.tag+'」'+target.job+'。',patternType:'reviewed'};});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的兩個社交機制及結論順序選出意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
 quiz('作者對「手機令社交互動減少」持甚麼立場？',['同意，因為手機分散面對面注意力，也使省力交流取代深度對話','反對，因為手機完全不會影響交談','同意，但理由只涉及手機價格','沒有表態，只列手機型號'],'引言明確說 I agree，並預告注意力與交流深度兩項理由。'),
 quiz('文章用哪兩條不同機制說明社交減少？',['在場時分心，以及傾向用便捷訊息代替較費心的交流','手機令所有人從此完全停止見面','所有線上聯絡一律不可能傳達關心','只有年輕人才可能使用手機'],'第一段談注意力被通知拉走，第二段談便利與深度互動的取捨。'),
];
const route=[sequence('手機如何由分心走向社交能力減弱',[
 ['引言：同意社交互動減少','預告面對面交流受干擾及深度對話被替代。'],
 ['理由一：同在場但不專注','訊息與通知打斷聆聽，朋友相聚時也各自看手機。'],
 ['理由二：方便取代投入','短訊和表情符號較省力，但難取代見面及艱難對話。'],
 ['年輕人的練習機會','螢幕後交流太多，可能削弱讀懂肢體語言和即興交談的自信。'],
 ['結尾：回收雙重機制','手機快速連繫人，亦可能令人在相聚時較不投入。'],
],'文章先談當下注意力，再談反覆選擇便捷方式的長期社交技能影響。')];
const evidence=[
 quiz('人坐在飯桌旁卻仍可能沒有真正投入交流，原因是甚麼？',['訊息、通知與線上內容可能把注意力從身邊的人拉走','只要人在飯桌旁，就必然仔細聽完每句話','飯桌大小直接決定每個人的社交能力','通知只會出現在沒有人相聚的時候'],'範文用 physically present 與 mentally pulled away 明確對照。'),
 quiz('咖啡店朋友的例子說明甚麼？',['人可以坐在一起，卻各自滑手機而錯失共同交流的時刻','朋友一同到咖啡店就一定沒有手機','所有人一滑手機就會立即失去朋友','例子只討論咖啡店服務是否夠快'],'例子用同一空間與未共享交流的落差說明分心。'),
 quiz('為何短訊或表情符號可能成為社交捷徑？',['它們較容易發送，但未必取代見面、困難對話和持續建立關係','它們必然比任何面談都更深入','它們使所有艱難話題立即自然解決','它們與是否投入關係完全無關'],'範文比較互動所需努力與關係深度，而非否認短訊有用途。'),
 quiz('為甚麼年輕人可能受影響更大？',['他們仍需練習讀懂肢體語言、處理分歧和自信地即興交談','只有年輕人能理解手機上的通知','年輕人從不需要學習面對面交流','文章認為每位年輕人都一定缺乏社交技巧'],'原文用 who 補上該群體仍在學習的重要技能。'),
 quiz('文章對長期效果使用 can 和 may，有甚麼作用？',['指出風險可能出現，避免聲稱每位使用者必然受同樣影響','證明手機不會影響任何人','表示所有後果都已無條件發生','取消了前文咖啡店例子的意義'],'作者把社交能力變弱寫成可能趨勢，保留個體差異。'),
 quiz('結尾如何同時承認手機便利與維持立場？',['承認手機能快速連繫人，同時指出它也可能減少在場感與社交自信','聲稱快速連繫足以保證所有關係都更深','否認手機有任何通訊用途','把分心與低投入兩條理由全部刪除'],'While...can also 讓作者承認好處而不放棄已論證的代價。'),
];
const logic=[
 sequence('在場分心如何削弱對話',[
 ['手機爭奪注意力','相聚時仍接收訊息、通知和線上內容。'],
 ['聆聽與回應變得零碎','人可能只聽進一半，錯過表情和語氣。'],
 ['共享空間不等於共享時刻','朋友坐在一起卻各自看螢幕。'],
 ['面對面交流逐漸陌生','反覆分心可能令直接互動變得較不自然。'],
 ],'原文用一個日常場景把注意力、對話品質和長期習慣連起來。'),
 sequence('便捷訊息如何影響社交練習',[
 ['數碼回覆比較容易','短訊與表情符號所需投入少。'],
 ['深度交流較費心','見面、處理分歧及定期交談需要時間。'],
 ['年輕人減少實際練習','讀懂肢體語言及即興交談的機會可能變少。'],
 ['社交信心可能受損','方便的捷徑未必建立深層人際連結。'],
 ],'文章沒有說數碼聯絡毫無價值，而是分析它取代較深交流時的代價。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
 transfer('家人每晚一起吃飯，但每人都不斷查看工作通知，談話常常中斷。','哪項機制最貼近範文？',['身體同在飯桌，注意力卻被通知帶走，令交流變零碎','只要有共同晚餐，彼此就必然完全投入深入對話','通知越多，所有家庭談話就必然越深入而有耐心','晚餐菜式種類直接決定所有成員能否專心交流'],['原文對照人在現場與心思被線上訊息拉走。','忽略題目所述中斷。','與可觀察的對話情況相反。','未分析通知與注意力。'],[2,3,4],'原文用飯桌等場景說明人在場而心不在場。'),
 transfer('四位朋友坐在同一張咖啡店桌旁，卻各自滑手機，離開時都說沒真正聊到天。','哪句最能概括這個落差？',['他們共用一個空間，卻沒有真正共享相聚的時刻','只要同桌坐著，就已完成所有需要的深入交流','咖啡店座位安排必然阻止所有朋友認真說話','每位朋友看手機就代表友誼必定立即永久終止'],['這正是原文咖啡店例子的物理同在與社交缺席。','與情境中沒聊到天矛盾。','題目未提供座位阻礙。','把一次情境誇大成永久結局。'],[5,6],'原文短句以 same space 與 same moment 的對照收束例子。'),
 transfer('班級群組用表情符號處理兩名同學的嚴重誤解，結果雙方都沒有聽到彼此的真正想法。','下一步怎樣做較符合範文？',['安排直接交談，讓雙方說清楚分歧並練習聆聽','繼續只用表情符號，避免任何較難的直接討論','宣布所有線上訊息都沒有任何真正的社交用途','只要求同學增加每日傳送表情符號的次數'],['原文指出較省力回應不能完全取代困難對話。','延續未能處理分歧的方法。','文章沒有否定全部數碼聯絡。','數量增加不等於理解加深。'],[8,9,10],'原文比較短訊與見面、困難討論及持續交談。'),
 transfer('一名學生常在課間看影片，別人說話時只答「嗯」，也錯過對方的表情。','哪項後果最有文本依據？',['對話可能變零碎，也較難察覺彼此的細微表情','學生只答「嗯」就必然已完全理解同學說出的所有意思','影片內容一定可以完全代替每次面對面的認真聆聽','表情與肢體語言永遠不會影響同學之間的理解'],['原文把不專心聆聽連到錯過細微表情。','題目指出他錯過表情。','影片不等於當前對話。','與文本對非語言訊號的重視相反。'],[3,4],'原文說分心使人機械式回應並錯過細小表情。'),
 transfer('一間公司把所有員工回饋都改為快速按讚，主管因而較少與同事討論艱難問題。','哪項分析最能轉用第二段？',['方便的數碼反應可能取代較費心但較深入的討論','按讚必然使所有艱難問題立即得到真正解決','只要不開會，同事之間就永遠不可能建立信任','數碼回應與討論深度之間絕不可能存在任何取捨'],['原文的 convenience over engagement 正描述便利與投入的取捨。','沒有討論便不能保證解決。','過度概括所有關係。','忽略題目所述取代行為。'],[8,9,12],'原文用短訊與表情符號說明社交捷徑的限制。'),
 transfer('一所學校用網上留言代替所有小組討論；學生逐漸不敢在沒有準備稿時表達不同意見。','文章最關心哪項能力？',['即興面對面交談及處理分歧的能力可能欠缺練習','學生只要會打字就必然能自信地參與當面即興辯論','所有線上留言都必然沒有任何真正的教育價值','沒有準備稿就代表學生完全沒有任何值得表達的想法'],['原文特別指出年輕人需要練習即興交流和處理分歧。','兩種表達技能不能直接等同。','文章分析過度替代，未否定全部留言。','無法從緊張推斷沒有想法。'],[10,11],'原文以螢幕後交流過多推到面對面不自在。'),
 transfer('某社區使用手機安排聚會，參加者到場後卻把手機放下，專心交流。','哪項評價最符合範文的限定語氣？',['手機可幫助安排聚會；真正影響仍取決於到場後用法','只要用手機安排聚會，所有參加者就必然社交能力退步','到場後專心交談已證明手機在所有情況都完全沒有風險','文章聲稱所有線上工具都應永久停止在社交場合使用'],['原文承認快速連繫的好處，並以 can/may 表示風險非必然。','把可能性誇大成必然。','單一個案不能取消一般風險。','範文沒有主張禁用科技。'],[7,11,15],'原文結尾承認手機可快速連繫，但可能損害投入程度。'),
 transfer('某人每天向朋友發簡短訊息，卻一直避開真正需要當面討論的衝突。','哪項補充較能維持關係？',['保留訊息的便利，同時安排直接對話處理難談的問題','只增加表情符號數量，繼續避開需要當面處理的分歧','停止一切聯絡，等待雙方之間的問題自行完全消失','宣稱只要每天有簡短訊息，關係就必定不會變淺'],['原文的重點是便利不能替代需要投入的艱難對話。','未處理已知衝突。','放棄關係維繫。','把聯絡頻率等同深度。'],[9,12],'原文比較容易發送的訊息與較費力的面對面討論。'),
 transfer('研究員要解釋「常看通知」與「社交技巧變弱」的關聯，中間缺少論證步驟。','哪條鏈最接近範文？',['通知分散注意力，少了聆聽練習，長遠可能不習慣面談','通知一響，所有人的社交技巧就必然在當下立即完全消失','只要會滑手機，就自動學懂與所有人交談時的肢體語言','手機品牌直接決定使用者能否準確讀懂他人的細微表情'],['範文從分心推到對話品質，再推到長期習慣變化。','忽略累積機制並過度斷言。','與練習減少的分析相反。','品牌不是所述機制。'],[2,3,4,7],'原文用 Over time 把反覆分心連到直接互動變陌生。'),
 transfer('一名青少年透過文字聊天很活躍，但在沒有稿件的面談中不敢說出意見。','哪項評估最符合文章？',['文字交流可能較熟練，但即興當面交談仍需另外練習','文字聊天活躍足以證明所有面談技巧都已完全成熟','一次面談緊張就證明他往後永遠不會結交新朋友','文字交流一定完全沒有維持或建立任何關係的作用'],['原文區分螢幕後交流與當面即興接觸。','混同兩種不同技能。','從一次經驗推成永久結果。','範文沒有否定所有線上交流。'],[10,11],'原文指出年輕人需要練習當面說話和處理分歧。'),
 transfer('另一篇作文討論電子遊戲對家庭互動的影響，作者只寫「遊戲不好」，沒有分析具體過程。','哪種論證路線可轉用？',['先解釋注意力被吸走，再分析娛樂會否取代家庭交流','只反覆使用「不好」兩字，仍不交代家庭互動的機制','突然討論與家庭相處無關的遊戲裝置外觀及顏色','宣稱所有家庭都必然以完全相同方式使用電子遊戲'],['範文把注意力和便利取捨拆成可觀察的兩條機制。','缺少可檢查的因果分析。','與題目無關。','忽略家庭差異與可能性。'],[2,3,4,8,9],'原文分別分析相聚時分心與選擇便捷交流。'),
 transfer('作文結尾想承認手機能方便家人聯絡，但仍維持「過度使用削弱交流」的立場。','哪句最接近範文的結尾方法？',['承認快速連繫有用，再指出分心可能削弱當面交流','只說手機完全沒有任何方便之處或值得承認的正面用途','只重複自己同意題目，不回收文章已分析的兩項理由','突然改稱每個人的社交信心都會因使用手機而必然提升'],['原文用 While 承認好處，用 can also 收束可能的代價。','違反已承認的便利。','未呈現結尾的因果收束。','與全文方向和可能語氣相反。'],[13,14,15],'原文最後三句回收分心、低投入及快速連繫的讓步。'),
];
export default {key:'opinion:91',meta:{topic:'手機會否使人較少進行社交互動',summary:'手機爭奪相聚時的注意力，也使省力訊息取代較深入的面對面交流；尤其需留意年輕人的練習機會。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transferTasks};
