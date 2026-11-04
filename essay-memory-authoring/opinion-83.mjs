import fs from 'node:fs';
const E=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['opinion:83'].map(x=>x.english);
const simple=[
'People often say going to other countries makes travellers more willing to accept differences and better at understanding people who live another way.',
'I fully agree because travel replaces guesses about faraway people with meeting them, and being new in another country teaches people to be less sure that they know everything.',
'First, travel can reduce unfair ideas about groups of people.',
'When people form ideas about other cultures from far away, news titles, films, or stories heard from others may shape their views and make whole groups seem like a few simple types.',
'But when travellers eat local food, take buses or trains, talk with local people, and watch daily life, different customs begin to make sense.',
'For example, someone may first think that quiet behaviour in public in another country means people are unfriendly, but later understand that it may show respect for shared places.',
'So travel can make unfamiliar differences easier to understand instead of something to fear.',
'Another reason is that travel can put people in a position where they need help.',
'In another country, even ordering food, asking the way, or reading a sign may be harder than expected.',
'This can feel bad, but it also helps travellers remember what it feels like to be unsure, need help, or be misunderstood.',
'Someone who has struggled with another language may be less likely to look down on people from other countries who face that problem at home.',
'So travel is like a mirror: it shows how others live and how much our confidence may come from being in familiar places.',
'In short, I fully agree that going abroad can help people accept and understand others better.',
'By questioning unfair group ideas and placing people in new situations, travel can help them judge others more fairly and treat them more gently.',
];
const vocabulary=[
[['international travel','going to other countries','國際旅行'],['more tolerant','more willing to accept differences','更寬容'],['capable of understanding','better at understanding','更能理解'],['live differently','live another way','生活方式不同']],
[['completely agree','fully agree','完全同意'],['distant assumptions','guesses about faraway people','遠距假設'],['real human contact','meeting them','真實接觸'],['humility','be less sure that they know everything','謙卑'],['being a stranger in another society','being new in another country','在異鄉成為陌生人']],
[['The first reason','First','第一個原因'],['weakens stereotypes','reduce unfair ideas about groups of people','削弱刻板印象']],
[['judge foreign cultures from a distance','form ideas about other cultures from far away','遠距評價外國文化'],['headlines','news titles','新聞標題'],['second-hand stories','stories heard from others','二手故事'],['reduce whole communities to a few simple labels','make whole groups seem like a few simple types','把群體簡化為標籤']],
[['However','But','然而'],['use public transport','take buses or trains','搭公共交通'],['speak to residents','talk with local people','與居民交談'],['observe daily routines','watch daily life','觀察日常'],['unfamiliar customs begin to make sense','different customs begin to make sense','風俗變得可理解']],
[['initially sees','first think','起初視為'],['quiet public behaviour','quiet behaviour in public','安靜公共行為'],['cold or unfriendly','unfriendly','冷淡不友善'],['may later realise','later understand','後來可能明白'],['shared spaces','shared places','公共空間']],
[['In this way','So','如此'],['turns differences','make unfamiliar differences','轉化差異'],['something suspicious','something to fear','令人懷疑'],['something understandable','easier to understand','可以理解']],
[['Another important reason','Another reason','另一重要原因'],['forces people to experience vulnerability','put people in a position where they need help','令人感到脆弱']],
[['In a foreign country','In another country','在外國'],['ordering a meal','ordering food','點餐'],['asking for directions','asking the way','問路'],['unexpectedly difficult','harder than expected','出乎意料地困難']],
[['uncomfortable','feel bad','不舒服'],['valuable','helps','有價值'],['confused, dependent, or misunderstood','unsure, need help, or be misunderstood','困惑依賴被誤解']],
[['struggled with a foreign language','struggled with another language','外語掙扎'],['less likely to look down on','less likely to look down on','較不會看不起'],['immigrants or tourists','people from other countries','移民或遊客'],['at home','at home','在本國']],
[['acts like a mirror','is like a mirror','如鏡子'],['how others live','how others live','他人生活'],['their own confidence depends on familiar surroundings','our confidence may come from being in familiar places','自信依賴熟悉環境']],
[['In conclusion','In short','總結'],['fully agree','fully agree','完全同意'],['travelling abroad','going abroad','出國旅行'],['tolerant and understanding','accept and understand others better','寬容理解']],
[['challenging stereotypes','questioning unfair group ideas','挑戰刻板印象'],['unfamiliar situations','new situations','陌生情境'],['broadens their judgement','help them judge others more fairly','拓寬判斷'],['softens their attitude towards others','treat them more gently','緩和對他人態度']],
];
const chunkOverrides={2:['The first reason is that travelling','weakens stereotypes.'],6:['In this way, travel turns differences','from something suspicious into something understandable.'],7:['Another important reason is that travel','forces people to experience vulnerability.']};
const simpleChunkOverrides={2:['First, travel can reduce','unfair ideas about groups of people.'],6:['So travel can make unfamiliar differences','easier to understand instead of something to fear.'],7:['Another reason is that travel can put people','in a position where they need help.']};
function makeStructure(i,slots,replacements,meaning,usage,distractors){const text=E[i],parts=[];let p=0;slots.forEach((slot,j)=>{const q=text.indexOf(slot,p);if(q<0)throw Error(`slot ${i} ${slot}`);if(q>p)parts.push([text.slice(p,q),'link','固定連接']);parts.push([slot,'slot',`可換內容 ${j+1}`]);p=q+slot.length;});if(p<text.length)parts.push([text.slice(p),'link','固定連接']);let example=parts.map(x=>x[1]==='link'?x[0]:replacements.shift()).join('');return{example,answerReason:meaning,distractorReason:'看清接觸、重新理解與代入他人處境的因果。',distractors,frame:{formula:parts.map(x=>x[1]==='link'?x[0]:`[${x[2]}]`).join(''),meaning,usage,parts}};}
const structures=[
makeStructure(0,['international travel','people','those who live differently'],['intercultural exchange','students','those who live differently'],'引言轉述與理解不同生活方式有關的主張。','題目說某經驗會改善對他人的理解時，先準確提出。',[1,2,7]),
makeStructure(1,['this view','travelling','distant assumptions','real human contact','the humility that comes from being a stranger in another society'],['that view','living abroad','old guesses','direct contact','the humility that comes from depending on others in a new place'],'表態並列兩條機制：真實接觸與自身脆弱感。','同意某經驗有益，需預告兩種不同作用時。',[0,2,7]),
makeStructure(2,['travelling','stereotypes'],['meeting people directly','stereotypes'],'主體一先點出接觸可削弱刻板印象。','以具體接觸反駁由距離形成的群體標籤時。',[3,4,5]),
makeStructure(3,['foreign cultures','headlines, films, or second-hand stories','whole communities','a few simple labels'],['unfamiliar neighbourhoods','headlines, rumours, or second-hand stories','whole communities','a few simple labels'],'說明遠距資訊如何把複雜群體簡化。','分析刻板印象形成原因時，區分間接訊息與真實接觸。',[2,4,5]),
makeStructure(4,['travellers','local food, use public transport, speak to residents, and observe daily routines','unfamiliar customs'],['newcomers','local food, use public transport, speak to residents, and observe daily routines','unfamiliar customs'],'以日常接觸展示陌生習俗可變得可理解。','已指出間接想像有偏差，轉談直接接觸如何校正時。',[2,3,5]),
makeStructure(5,['a visitor','quiet public behaviour in another country','cold or unfriendly','respect for shared spaces'],['a new student','a classmate’s quiet behaviour','cold or unfriendly','respect for others who are working'],'例子示範由負面初判到較合理的文化解釋。','抽象談觀點修正後，舉一個可重新解讀的行為時。',[3,4,6]),
makeStructure(6,['travel','differences','something suspicious','something understandable'],['direct contact','unfamiliar behaviour','something threatening','something understandable'],'段末概括由疑慮變理解的轉變。','已用實際例子修正偏見，需要一句話收束變化時。',[2,4,5]),
makeStructure(7,['travel','vulnerability'],['starting a new job','vulnerability'],'第二理由由認識他人轉到親身感到無助。','已談觀察別人，轉談自己身處陌生位置時。',[8,9,10]),
makeStructure(8,['a foreign country','ordering a meal, asking for directions, or reading a sign'],['a new workplace','finding a room, asking for help, or reading a notice'],'列原本簡單的任務如何在陌生環境變難。','說明脆弱感並非抽象，用生活小事具體化時。',[7,9,10]),
makeStructure(9,['This experience','travellers','confused, dependent, or misunderstood'],['That first week','new workers','confused, dependent, or misunderstood'],'承認不舒服，解釋其同理心價值。','某經驗令人不適但能加深理解，需同時交代兩面時。',[7,8,10]),
makeStructure(10,['A person who has once struggled with a foreign language','immigrants or tourists','the same problem at home'],['A manager who has once struggled with an unfamiliar system','new staff or visitors','the same problem at work'],'以自身曾有困難推導較少輕視相似處境者。','說明親身受困能改變對別人類似困難的態度時。',[8,9,11]),
makeStructure(11,['Travel','how others live','their own confidence','familiar surroundings'],['Volunteering','how others cope','their own confidence','familiar routines'],'鏡子比喻同時反照他人與自我依賴。','經驗既讓人認識外界又反省自身條件時。',[7,9,10]),
makeStructure(12,['travelling abroad','tolerant and understanding'],['living among unfamiliar neighbours','tolerant and understanding'],'結論直接回答同意程度。','全文已論證接觸與代入後，重申清楚立場時。',[1,11,13]),
makeStructure(13,['stereotypes','individuals','unfamiliar situations','it','their judgement','their attitude towards others'],['assumptions','learners','new situations','intercultural exchange','their judgement','their attitude towards others'],'結論整合兩段方法與兩項態度效果。','結尾需濃縮「修正偏見」和「親歷陌生」兩線時。',[2,7,12]),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依原文順序逐一點選。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[Q('作者同意出國旅行能增進寬容與理解嗎？',['完全同意；真實接觸與親歷陌生都能改善態度','完全反對；旅行只會鞏固所有刻板印象','沒有表態；只列各國食物','部分同意；認為旅行只增加地理知識'],'作者明示完全同意並預告兩種機制。'),{type:'multi',prompt:'選出兩段主體不同機制',detail:'選兩項，再按「確認」。',options:['親眼接觸日常生活，修正由間接訊息形成的標籤','在陌生環境遇到小困難，較理解別人的無助','旅行必定使每個人立即精通外語','所有文化差異都能被一篇新聞完全說清'],correct:[0,1],why:'第一段修正刻板印象，第二段體驗脆弱。'}];
const route=[sequence('排好全文四段',[['引言 · 完全同意','真實接觸代替猜測，陌生人經驗帶來謙卑。'],['主體一 · 修正標籤','間接訊息易簡化群體，接觸日常可重新理解行為。'],['主體二 · 親歷脆弱','點餐問路等小事變難，促使更體諒有同樣困難者。'],['結論 · 兩線合流','挑戰刻板印象與陌生處境改善判斷和態度。']],'間接想像 → 直接接觸 → 親歷困難 → 寬容理解。')];
const evidence=[Q('間接看外國文化時，觀點可能受甚麼影響？',['標題、電影及二手故事','只受現場居民長期交往影響','只受親身問路和乘車影響','只受自己熟悉語言的字典影響'],'原文列三種間接來源。'),Q('旅客怎樣讓陌生習俗變得可理解？',['吃本地食物、搭交通、與居民交談及觀察日常','只在旅館看自己的國家節目','完全不與任何居民接觸','只記錄機場航班號碼'],'原文列四種日常接觸。'),Q('安靜公共行為的例子帶來甚麼修正？',['由以為冷淡轉為理解它可表達尊重','由以為尊重轉為肯定所有人冷淡','證明安靜行為必然有同一意思','說明旅客不需要觀察任何情境'],'由初判到可能更合理的解釋。'),Q('外語困難如何影響對移民和遊客的態度？',['較不會看不起遇到相同困難的人','更容易看不起所有外國人','必定立即精通對方語言','以後永遠不需任何人幫忙'],'less likely to look down on；中文已按英文修正。')];
const logic=[sequence('主體一：接觸如何削弱刻板印象？',[['遠距判斷','標題、電影與二手故事或把群體貼標籤。'],['真實接觸','食物、交通、居民與日常習慣提供背景。'],['修正例子','安靜公共行為或代表尊重，而非冷淡。'],['段落成果','差異從可疑變成可理解。']],'間接簡化 → 生活背景 → 重新解讀。'),sequence('主體二：陌生人經驗如何帶來謙卑？',[['小事變難','點餐、問路、讀標示可能不容易。'],['親身感受','記起困惑、依賴與被誤解的感覺。'],['態度轉移','較不會看不起遇到外語困難的人。'],['鏡子比喻','看到自信也依賴熟悉環境。']],'親歷脆弱 → 同理相似處境 → 反省自身。')];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
T('學生原先只靠新聞標題認識某社區，後來親自與居民交談。','哪項最貼近首段？',['直接接觸可修正由間接訊息形成的標籤','新聞標題一定能完整代表整個社區','只要交談一次，就必定了解每個居民','居民交談與理解社區完全沒有關係'],['接觸可修正簡化。','標題有限。','不保證完全。','有助提供背景。'],[2,3,4],'distant labels versus real contact'),
T('新員工看見同事在公共區域安靜工作，起初以為他不友善。','哪種修正合乎例子？',['了解背景後，可能發現他在尊重共同空間','安靜工作必定證明同事討厭所有人','只要有初步印象，就無須再觀察情境','同事安靜，便表示他永遠不能合作'],['安靜可能另有意思。','非必然。','需觀察。','無此推論。'],[4,5,6],'quiet public behaviour can mean respect'),
T('旅客不懂當地標示，第一次體會自己需要別人幫忙。','這如何連到第二理由？',['親歷困難可幫他理解被誤解者的處境','讀不懂標示便會立即學會全部當地語言','需要幫忙就表示旅行必然沒有任何價值','一次困難會讓他永遠依賴陌生人生活'],['vulnerability leads to empathy。','無速成語言。','經驗有價值。','非永遠依賴。'],[7,8,9],'experience vulnerability; feel misunderstood'),
T('一位經理曾在新制度中迷路，因而更願意耐心協助新同事。','這是哪種態度轉移？',['自己受困的經驗使他較少輕視相似困難','曾經迷路就保證經理永不犯判斷錯誤','新同事的困難與經理經驗完全無關','只要制度複雜，就不需要向人解釋'],['對應外語困難類比。','非保證。','處境相似。','仍需協助。'],[9,10],'less likely to look down after own struggle'),
T('有人只看電影便把整個群體歸成同一種性格。','文章會指出甚麼問題？',['有限二手形象可把複雜群體簡化成標籤','電影一有角色，就必然等於群體全貌','所有群體都只有一種完全相同的習慣','只要觀眾看電影，就不能與人交談'],['whole communities reduced to labels。','非全貌。','群體多樣。','可接觸。'],[3],'reduce whole communities to simple labels'),
T('居民陪旅客乘車、吃飯及交談，旅客開始理解原本陌生的禮儀。','其中的因果是甚麼？',['日常接觸提供背景，使陌生習俗較易理解','乘車本身保證旅客立即精通所有文化','只有食物價格才能解釋全部社會習慣','與居民交談會令所有文化差異消失'],['直接生活接觸。','非保證。','背景更多。','差異仍可在。'],[4,5,6],'daily routines make customs make sense'),
T('某人旅行時被誤解，回家後面對外語不流利的遊客。','哪項反應最符合文章？',['記得自己的困難，較願意耐心聽對方說話','因自己受過委屈，便更應看不起所有遊客','只要回到家，他就不再可能感到同理','遊客外語不好，便肯定沒有能力理解指示'],['親歷困難可帶同理。','與立場相反。','可保留經驗。','不能如此推斷。'],[9,10,11],'foreign-language struggle; less likely to look down'),
T('一項國際交流活動只展示官方照片，學生仍不了解當地生活。','依文章可增加甚麼？',['與居民交談並觀察日常，獲得較真實背景','只看更多沒有說明的相同照片就足夠','完全不接觸當地人，避免改變先入觀念','只背官方照片的拍攝日期與檔案號'],['直接接觸補背景。','仍間接。','會保留偏見。','日期非生活。'],[3,4],'speak to residents and observe routines'),
T('海外學生因一件小事求助，忽然發現自信依賴熟悉的環境。','這對應哪個比喻？',['旅行像鏡子，也照見自己仰賴的熟悉條件','旅行像牆壁，阻止人看見自己的處境','旅行像考卷，只能衡量語言分數高低','旅行像廣告，只會展示景點與門票價'],['mirror turns inward。','恰相反。','不只語言。','不只景點。'],[8,9,11],'travel acts like a mirror'),
T('孩子初看外地習俗覺得可疑，知道背景後覺得可以理解。','哪項概括最貼切？',['差異可由可疑轉為可理解，而非自動消失','了解背景便保證所有習俗都完全相同','覺得可疑必然代表孩子沒有任何好奇心','所有外地習俗都必須改成自己的習慣'],['原文段末轉化。','差異仍在。','可有好奇。','無同化要求。'],[5,6],'suspicious into understandable'),
T('題目問國際旅行是否讓人更寬容。','作者提供哪兩種不同理由？',['真實接觸修正偏見，親歷脆弱帶來同理','只靠購物與拍照，就必然沒有任何偏見','只靠外語考試分數，就能理解每種文化','只靠航班長短，即可決定人的寬容程度'],['兩段機制。','購物非論證。','分數不足。','時長無關。'],[1,2,3,4,5,6,7,8,9,10,11],'real contact and vulnerability'),
T('要概括結論而保留作者的立場和限度。','哪項最準確？',['同意旅行可增進理解，未說人人必然改變','完全反對旅行，認為只會增加所有偏見','完全同意旅行會保證每人即時精通文化','沒有表態，只列出點餐問路的例子'],['can 與具體機制。','立場相反。','不保證。','有明確立場。'],[0,1,12,13],'fully agree travelling can make people tolerant'),
];
const plausibleAlternatives=[
  [['以新聞標題為主要依據，居民談話只作補充','交談一次後，便少查其他居民是否有不同經歷','先統計交談次數，不問標籤有否受到修正'],['間接資訊不足以代表整個社區。','一次交流不能概括每位居民。','次數不能代替理解內容的改變。']],
  [['先按安靜推定他較難合作，往後再觀察','已有初步印象，便把工作情境列為次要','只問他是否說話，不查共同空間的規範'],['安靜可能是在尊重共享環境。','題目正要求用背景修正印象。','說話多少不足以解釋行為原因。']],
  [['只練習讀標示，暫不連到他人被誤解的感受','求助一次後，便把後續旅行體驗列為次要','只記困難的次數，不問自己有否改變看法'],['語言練習未涵蓋同理機制。','一次困難可有價值，仍需觀察反思。','重點是由親歷脆弱理解他人。']],
  [['受困後只改善自己的導航，不問新同事的處境','把新同事的求助當成工作能力不足的線索','先查制度條文，少用自己迷路的經歷作比較'],['題目問的是對他人困難的態度轉移。','陌生制度也可令有能力者受困。','規則資料不足以建立同理。']],
  [['再看同類電影，暫不接觸群體的不同成員','用一個角色代表群體，少查其他人的經歷','先分析電影的風格，不問觀眾如何形成標籤'],['更多二手形象仍可能停在簡化印象。','一個角色不能代表複雜群體。','重點是群體被如何簡化。']],
  [['只記乘車路線與食物價格，少問禮儀原因','把一次友善接待當成群體相處的主要規則','先比較食物種類，不查居民如何解釋習俗'],['可見資訊不足以解釋社會語境。','一個經驗不能概括整個文化。','居民互動能補足背後意思。']],
  [['先練歌詞發音，社會背景可稍後才了解','只看表演服裝，推測歌詞反映的階級','只看旋律流行度，不查歌詞中的幽默'],['會唱不等於懂社會含意。','外觀不足以解讀詞句。','旋律受歡迎不代表理解語境。']],
  [['增加官方照片數量，不安排居民的日常對話','只把照片改成影片，較少問畫面背後的人','先教學生記展品名稱，不觀察當地人的生活'],['增加同類二手資料未必補上生活背景。','動態影像仍不能取代交流。','名稱不足以理解文化實踐。']],
  [['只看自己完成求助，不反思為何需要別人','把熟悉環境的作用看作語言分數問題','先記旅行路線，不問此經驗如何改變自我理解'],['鏡子比喻指向對自身依賴的察覺。','依賴熟悉條件不只與語言成績有關。','地點記錄不能說明內在轉變。']],
  [['背景可解釋習俗，便少問孩子最初如何判斷','知道來歷後，便把實際文化差異看得較輕','先記習俗名稱，暫不比較理解前後的態度'],['作者重視從疑慮到理解的過程。','理解不要求差異消失。','名稱不能呈現態度轉變。']],
  [['只談親身接觸，不說明偏見與間接資訊的關係','只談求助困難，不連到回家後對他人的態度','把兩段都寫成景點觀察，不分不同心理機制'],['首段的接觸用於修正簡化標籤。','次段要說明脆弱如何帶來同理。','兩段分別有接觸和親歷困難兩種作用。']],
  [['同意旅行帶來印象，對寬容改變不作說明','把旅行的作用只限於點餐問路的便利','只列舉異地困難，少談如何理解其他人'],['作者明確同意旅行可增進理解。','便利不是範文的最終論點。','結論應回收兩項心理變化。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
export default {key:'opinion:83',meta:{topic:'出國旅行會否增進寬容理解',summary:'作者完全同意國際旅行可令人成為更寬容、更理解他人的人。間接的新聞、電影和二手故事或把群體簡化成標籤；親身接觸食物、交通、居民和日常習慣可修正判斷。旅客在陌生地方點餐、問路或讀標示遇困難，也較能體會被誤解和依賴他人的感受，回家後較不會輕視面對相似語言困難的人。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
