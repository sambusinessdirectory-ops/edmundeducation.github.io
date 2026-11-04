// Reviewed Cause/Solution 20: why skilled workers leave and what this costs.
import fs from 'node:fs';import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-20-ielts-cause-solution.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['cause-solution:20'];
const original=source.sentences.map(row=>row.english);
const simple=[
 'People with a lot of education and skill often choose jobs in other countries after learning much about their work.',
 'They usually leave because other places offer better jobs and working conditions, but their move may also cause serious problems for both the country they leave and themselves.',
 'The main reason is that jobs abroad often give people better rewards than jobs at home.',
 'In many countries, even people with strong skills may earn little, have few chances to move up or work for places that do not fully value what they can do.',
 'In comparison, employers in other countries may pay more, offer clearer ways to move ahead and give workers more reliable conditions.',
 'For example, a doctor, engineer or researcher may leave for more than money: another country may have better equipment, helpful work contacts and a place where their skills can grow.',
 'In this way, moving away may be less about leaving a bad place and more about finding room to grow at work.',
 'But this movement can also bring several problems.',
 'For the place these workers leave, the biggest loss is the skills and experience of its people.',
 'When experienced teachers, doctors, scientists or other specialists leave, the public services that helped train them may have fewer skilled people to do the work.',
 'Hospitals may make patients wait longer, universities may lose good teachers and local businesses may find it harder to create new things.',
 'After some time, this loss of skilled people can make the difference between richer and poorer countries bigger, because the places that need such workers most may find it hardest to keep them.',
 'The workers may suffer too: they may feel alone, find a new culture hard to understand and face pressure when starting again in a different workplace.',
 'To sum up, skilled people often work in other countries because they can get better pay, greater respect, more useful resources and better chances to grow in their careers.',
 'Even so, this can weaken important services in the country they leave and cause the workers personal and social stress.',
];
const vocabulary=[
 [['Highly educated professionals','People with a lot of education and skill','受過良好教育的專業人士'],['pursue employment overseas','choose jobs in other countries','到海外工作'],['gaining expertise','learning much','累積專業知識'],['own fields','their work','自己的領域']],
 [['usually driven by','usually leave because','通常由此推動'],['stronger career incentives','better jobs','較好的職業誘因'],['professional conditions','working conditions','專業工作條件'],['home countries','country they leave','原居國'],['individuals involved','themselves','相關個人']],
 [['main reason','main reason','主要原因'],['working abroad','jobs abroad','海外工作'],['level of reward','better rewards','待遇水平'],['obtain at home','jobs at home','在本國得到']],
 [['well-qualified workers','people with strong skills','資歷優秀的工作者'],['low salaries','earn little','低薪'],['limited promotion prospects','few chances to move up','晉升前景有限'],['institutions','places','機構'],['recognise their ability','value what they can do','認可其能力']],
 [['By contrast','In comparison','相比之下'],['foreign employers','employers in other countries','外國僱主'],['higher pay','pay more','更高薪酬'],['clearer career paths','clearer ways to move ahead','更清晰的職業道路'],['stable working conditions','reliable conditions','穩定工作條件']],
 [['for example','For example','例如'],['not simply for money','more than money','不單是為了金錢'],['modern equipment','better equipment','現代化設備'],['professional networks','work contacts','專業人脈'],['genuinely grow','grow','真正提升']],
 [['In this sense','In this way','從這個意義上說'],['migration','moving away','移居海外'],['act of escape','leaving a bad place','逃離'],['room to breathe professionally','room to grow at work','專業發展空間']],
 [['However','But','然而'],['this movement','this movement','這種流動'],['cause several problems','bring several problems','帶來若干問題']],
 [['country of origin','place these workers leave','原居國'],['most serious consequence','biggest loss','最嚴重後果'],['loss of human capital','skills and experience of its people','人力資本流失']],
 [['experienced teachers','experienced teachers','有經驗的教師'],['medical specialists','doctors','醫療專家'],['technical experts','other specialists','技術專家'],['public systems','public services','公共系統'],['left thinner and weaker','have fewer skilled people to do the work','人力與服務能力變弱']],
 [['longer waiting times','make patients wait longer','輪候更長'],['capable lecturers','good teachers','有能力的講師'],['local industries','local businesses','本地產業'],['innovate','create new things','創新']],
 [['Over time','After some time','長遠而言'],['brain drain','loss of skilled people','人才外流'],['widen the gap','make the difference between richer and poorer countries bigger','擴大差距'],['most need skilled workers','need such workers most','最需要技術人才'],['least able to keep them','find it hardest to keep them','最難留住人才']],
 [['personal costs','The workers may suffer too','個人代價'],['loneliness','feel alone','孤獨'],['cultural barriers','find a new culture hard to understand','文化障礙'],['unfamiliar professional environment','different workplace','陌生工作環境']],
 [['In conclusion','To sum up','總結來說'],['educated and experienced people','skilled people','受過教育且有經驗的人'],['move abroad','work in other countries','移居海外'],['recognition','greater respect','認可'],['long-term career development','chances to grow in their careers','長遠職業發展']],
 [['Nevertheless','Even so','然而'],['this trend','this','這一趨勢'],['weaken essential services','weaken important services','削弱重要服務'],['home countries','country they leave','原居國'],['emotional and social pressure','personal and social stress','情感及社交壓力']],
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
 frame(0,[' after '],['受過良好教育的專業人士選擇海外就業','在本行累積專長之後的時間條件'],'after 表明先取得經驗，再決定到外地工作。','要交代某選擇發生在資格或經驗累積之後時。','Many nurses move abroad after gaining hospital experience.','after','標明先後條件'),
 frame(1,[' is usually driven by ', ', and it can create '],['人才外移現象','較佳職業誘因與工作條件','原居地及個人可能承受的問題'],'driven by 預告原因；can create 預告不一定發生但值得分析的後果。','引言要同時回答「為何發生」及「可能造成甚麼問題」時。','This trend is usually driven by low pay, and it can create staff shortages.','driven by...can create','總覽動因與可能後果'),
 frame(2,[' is that '],['選擇海外工作的主要理由','海外待遇較佳的判斷'],'is that 以完整陳述句提出可由後文支持的主要理由。','主體段要先說清楚一項原因，再用例子或比較展開時。','The main reason is that overseas jobs often offer more support.','is that','明確提出一項原因'),
 frame(3,['In many countries, ', ' may '],['受影響的合資格工作者','低薪、少晉升或不被認可的可能處境'],'In many countries 限定適用範圍；may 避免把所有員工說成相同。','分析常見但非普遍的職場問題，需要保留情況差異時。','In many countries, skilled nurses may face poor conditions.','In many countries...may','限定範圍與可能性'),
 frame(4,['By contrast, ', ' may '],['對照的外國僱主','較高薪酬與清晰職涯的可能優勢'],'By contrast 把外地條件與本地低薪、少晉升形成比較。','已說明本地的不利條件，接着要比較另一地的吸引力時。','By contrast, overseas clinics may offer better pay and training.','By contrast...may','對比兩地條件'),
 frame(5,['for example, ', ' not simply for money, but because '],['作為例子的專業工作者','移居海外的行動','金錢以外的工作環境理由'],'not simply...but because 更正只為錢移居的單一解釋，補上更深原因。','讀者可能只想到一項表面動機，需要補充另一項更重要的動因時。','A doctor, for example, may move not simply for money, but because training is better.','not simply...but because','補充表面動機以外的原因'),
 frame(6,['less an act of escape than '],['移居海外的重新定位','更貼近實際的職業發展追求'],'less...than 不把移居簡化成逃離，而更重視主動尋找成長空間。','要修正帶有偏見的描述，指出另一個較貼近情境的解釋時。','The move is less an act of escape than a search for better training.','less...than','重新定位一種行動'),
 frame(7,['However, '],['人才流動也可能帶來的問題'],'However 將文章從個人的職涯動因轉到後果分析。','已說明某行動的吸引力，現在要轉向其可能代價時。','However, this change can create new problems.','However','轉入另一面向'),
 frame(8,['For the ', ', '],['目前分析的受影響一方','該方承受的最嚴重後果'],'For the... 先限定受影響一方，為下一句具體服務後果鋪路。','同一現象會影響多方，先要清楚標示目前分析的是哪一方時。','For the local clinic, the largest cost is lost expertise.','For the...','限定受影響者'),
 frame(9,['When ', ', '],['專業人才離開的條件','培訓他們的公共系統可能變弱的後果'],'When 由人才離開推到本地服務能力下降。','要解釋某資源流失後，原先依靠它的制度如何受影響時。','When experienced doctors leave, local hospitals may struggle.','When','連接人才流失與制度後果'),
 frame(10,[' may ', ', ', ' may ', ', and ', ' may '],['第一個受影響的部門','第一項可能後果','第二個受影響的部門','第二項可能後果','第三個受影響的部門','第三項可能後果'],'並列句把同一人才外流分別落到醫院、大學及產業三個領域。','要展示同一成因在幾個公共或經濟部門造成不同具體後果時。','Hospitals may close wards, universities may lose teachers, and firms may slow down.','may...may...and','並列不同領域的後果'),
 frame(11,['Over time, ', ', because '],['長期擴大的國際差距','人才最難留在最需要的地方這項原因'],'Over time 指累積效果；because 補充差距可能擴大的機制。','要指出短期流失如何累積成更大差距，並解釋原因時。','Over time, the gap may grow, because poorer areas lose trained workers.','Over time...because','解釋長期差距的成因'),
 frame(12,['There may also be personal costs: '],['外移者可能面對的個人代價'],'also 由原居地的制度損失轉向工作者本人，冒號展開代價。','已談社會層面的後果，還要補充當事人的情感或生活負擔時。','There may also be personal costs: workers can feel isolated.','personal costs:','補上個人層面的代價'),
 frame(13,['In conclusion, ', ' because '],['專業人士移居海外的總結','薪酬認可資源與發展機會的動因'],'because 將結尾的原因判斷連回前文，不增加未論證的新理由。','結尾要簡明回收多項主要動因，避免另起新論點時。','In conclusion, doctors leave because they seek pay and training.','In conclusion...because','總結主要動因'),
 frame(14,['Nevertheless, ', ' and '],['原居地的重要服務受損','工作者承受的個人壓力'],'Nevertheless 從待遇優勢轉回代價；and 同時涵蓋國家與個人。','結尾要平衡前文的個人利益，並列出不同受影響者的代價時。','Nevertheless, this choice can weaken local care and burden the workers.','Nevertheless...and','收束多方代價'),
];
const structures=specs.map((target,i)=>{const distractors=[(i+1)%specs.length,(i+6)%specs.length,(i+10)%specs.length];return {...target,distractors,wrongReasons:distractors.map(j=>'這句用「'+specs[j].tag+'」'+specs[j].job+'；沒有用「'+target.tag+'」'+target.job+'。'),answerReason:'示例用「'+target.tag+'」'+target.job+'。',patternType:'reviewed'};});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的動因與後果，順序選出意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
 quiz('範文提出專業人士為何選擇到海外工作？',['薪酬、職業發展、資源與工作條件可能更好','原居國的所有專業人士都失去技能','外國僱主一律不支付薪金','只有旅遊景點能決定工作去向'],'文章用本地與海外條件比較，指出待遇以外還有專業成長機會。'),
 quiz('範文把後果分成哪兩個層面？',['原居國服務能力受損，以及移居者本人可能承受壓力','只討論飛機票價格','只討論企業辦公室面積','只有海外僱主會有任何影響'],'第三段先談公共系統和國際差距，再談移居者的個人代價。'),
];
const route=[sequence('由海外就業動因到多方後果',[
 ['引言：提出移居現象','預告職涯與工作條件的吸引力，以及原居國和個人的代價。'],
 ['原因：比較本地與海外','本地可能低薪、少晉升及不被認可；海外可能提供更好資源。'],
 ['原居國後果：人才流失','醫院、大學和本地產業失去有經驗的人。'],
 ['長遠與個人代價','國家間差距可能擴大；工作者可能面對孤獨和文化適應。'],
 ['結尾：回收兩問','概括職涯動因和原居地、個人的後果。'],
],'文章不是只談薪金，亦逐步把後果由制度擴展至個人。')];
const evidence=[
 quiz('本地工作環境可能使合資格人士失望的三項情況是甚麼？',['薪金偏低、晉升有限，機構未充分認可能力','所有人都必然得到最高薪金','每個機構都提供無限晉升','文章只談搬遷費用'],'原文在 even well-qualified workers 之後列出三種可能的不利條件。'),
 quiz('醫生、工程師或研究者的例子如何反駁「只是為錢」？',['外地亦可能提供現代設備、專業人脈及讓技能成長的環境','外地必然完全沒有薪金','專業成長與工作選擇毫無關係','只要有錢就不需要設備'],'not simply for money 把論點由薪金延伸到工作能力與長遠發展。'),
 quiz('為甚麼文章把人才離開稱為原居國的人力資本損失？',['受培訓者離開後，原先依靠其專長的公共服務可能變弱','因為人離開後所有學校會立即消失','只因海外城市較多高樓','因為技能不能用於醫療或教育'],'原文把人才流失連到曾培訓他們的公共系統。'),
 quiz('文章如何具體說明公共服務可能受影響？',['醫院等候更久、大學失去講師、本地產業較難創新','醫院必然即時停止全部服務','大學必然不再需要任何學生','所有產業只需更換廣告標語'],'範文分別列出醫療、教育與產業三個領域。'),
 quiz('為甚麼人才外流可能擴大國家之間的差距？',['最需要技術人才的地方，有時反而最難留住他們','富裕國家一定不需要任何專業人士','國家之間的差距只由天氣造成','人才流失必定令所有國家一樣富裕'],'because 後面的理由說明最有需要的地方可能承受最大流失。'),
 quiz('工作者本人可能要承受甚麼代價？',['孤獨、文化障礙及在陌生職場重新開始的壓力','移居者必然沒有任何個人壓力','只有原居國才會感受到變化','文章說所有移居者都不能再工作'],'文章用 personal costs 轉向移居者的生活和情緒。'),
];
const logic=[
 sequence('職涯誘因如何推動人才外移',[
 ['本地回報可能不足','薪酬、升遷或能力認可未必理想。'],
 ['外地提供較好條件','較高薪金、清楚職涯和穩定環境形成對比。'],
 ['專業資源也有吸引力','設備、人脈及成長空間使選擇不只關乎金錢。'],
 ['有經驗者選擇離開','人才尋求能發揮專長的工作環境。'],
 ],'範文先談本地障礙，再談海外吸引力，最後用專業人士例子深化。'),
 sequence('人才外流的制度與個人後果',[
 ['原居國失去專長','教師、醫療及技術人才減少。'],
 ['服務與創新承受壓力','醫院、大學和產業可能受影響。'],
 ['長期差距可能擴大','最需要人才的地區有時最難留人。'],
 ['移居者也可能受壓','孤獨、文化差異與新職場帶來負擔。'],
 ],'後果不止一方：文章同時分析原居國制度及工作者本人。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
 transfer('一名工程師在本地薪水偏低，也看不到升遷機會；外國公司提供清楚職涯與更穩定的工作安排。','哪項解釋最貼近範文？',['本地限制與海外誘因，共同推動他考慮外移','只看本地薪水，不分析海外的職涯條件','只看海外薪水，不考慮本地升遷機會','只因外語能力，便斷定他一定會外移'],['範文同時分析原居地低薪與升遷受限，以及海外更好的職涯條件。','只看本地薪水，漏了海外職涯誘因。','只看海外薪水，漏了本地升遷限制。','外語能力不能單獨解釋題目列出的工作條件。'],[2,3,4],'原文先說本地可能低薪少晉升，再對照海外條件。'),
 transfer('某醫生已得到加薪，但仍打算到設備完善、能與專家合作的醫院工作。','文章如何解釋？',['動機不限薪金，還包括設備、人脈與成長','加薪後便不用再比較專業設備或合作','只看醫院位置，不問設備與專家機會','只把外移說成旅行，不理專業發展'],['範文指出專業人士也重視設備、合作人脈及技能成長，動機不只薪金。','加薪不能自動補上設備和合作機會。','醫院位置不是題目給出的專業發展重點。','把職涯決定寫成旅行，漏了設備與專家合作。'],[5,6],'原文把移居重新理解為尋找專業成長空間。'),
 transfer('某地區花多年培訓護士，但大量護士完成培訓後離開；當地診所人手開始不足。','這反映甚麼問題？',['培訓投資未能轉成足夠本地服務能力','護士一離開，本地培訓投資便自動回收','只看培訓人數，不問當地診所的人手','只擴建診所，不檢查護理人員是否留任'],['本地多年培訓的人才外移，投資未能轉化為當地足夠的服務能力。','離職不會自動讓診所取得已投入的培訓回報。','只數培訓人數，仍不知道本地能否留下足夠護士。','擴建診所不能代替留住護理人員。'],[8,9],'原文把受培訓者離開與公共系統變弱連在一起。'),
 transfer('一位官員只說「人才外流影響經濟」，沒有解釋具體服務。','應如何補充？',['具體寫醫院輪候、講師短缺與創新受阻','只說經濟受損，不展示哪類服務受影響','只看海外職位，不分析本地公共服務','只算外移人數，不說醫療教育的後果'],['範文以醫療、教育和創新等具體服務，說明人才外流的後果。','空泛說經濟受損，未展示服務如何受影響。','海外職位不能單獨說明本地服務缺口。','只算人數，漏了醫療與教育的實際後果。'],[9,10],'原文逐一列出醫療、教育與產業的可能損失。'),
 transfer('一個較貧窮的地區急需醫療專家，但更富裕城市開出較好條件，令它難以留人。','文章指出甚麼長期風險？',['最需人才的地區流失人才，差距可能擴大','只看富裕城市得益，不問較窮地區缺口','假設招聘廣告一出，專家便立即回流','只談薪酬差別，不看服務差距的長期變化'],['人才由最需要服務的地區流往條件較好的地方，兩地差距可能擴大。','只看富裕城市得益，漏了原居地的人才缺口。','招聘廣告不能保證專家立刻回流。','只列薪酬差，未分析長期服務差距。'],[11],'原文說最需要技術人才的地方有時最難留住他們。'),
 transfer('一名教師在外國得到較好待遇，但與家人分隔，也不熟悉當地文化和學校制度。','還應分析哪一面？',['較好待遇之外，仍有孤獨與文化適應壓力','只列加薪好處，不看與家人分隔的代價','只談原居國損失，不看移居者個人處境','只看工作制度，不問文化與家庭適應'],['範文承認工作條件可能更好，也提醒移居者有孤獨、文化和重新開始的壓力。','只列加薪，漏了與家人分隔的個人代價。','只談國家損失，忽略題目中的移居者本人。','只看職場制度，漏了文化與家庭適應。'],[12],'原文在制度後果以外另談 personal costs。'),
 transfer('另一篇文章討論年輕研究者離開小城市，作者只說「因為錢」。','哪項修訂最能轉用範文？',['比較薪酬晉升，也分析設備與合作成長','只看兩地薪酬，不問研究設備是否足夠','只談設備，不比較本地升遷與薪金','只看城市人口，不檢查研究者的職涯'],['範文把薪酬及升遷等條件，和設備、合作及技能成長一併比較。','只看薪水，漏了研究設備的專業誘因。','只看設備，漏了本地薪酬和升遷限制。','人口數不能解釋研究者職涯選擇。'],[2,3,4,5,6],'原文先比較待遇，再用專業人士例子補充非金錢動因。'),
 transfer('某國留不住專業人才，報告只寫國家受損，忽略外移者自己的處境。','哪個補充最完整？',['承認工作改善，也分析孤獨和新環境壓力','只說國家受損，不問外移者生活變化','只看外移者薪金，不問文化適應困難','只談個人壓力，不看可能獲得的職涯機會'],['完整分析應同時承認更好工作機會，以及孤獨、文化適應和新職場壓力。','只談國家受損，仍漏了個人處境。','只談薪金，漏了文化與生活適應。','只談壓力，忽略外移者可能得到的職涯機會。'],[5,6,12],'原文既說移居有專業誘因，也說當事人可能承受生活壓力。'),
 transfer('一個教育系統失去多位有經驗的講師，數年後本地培訓新人才的能力也下降。','哪項推論符合範文？',['資深講師流失，會削弱日後本地培訓能力','只計今年講師缺口，不看後續人才培養','只看課室空間與設備，不問誰來培訓新人','只談離職薪酬，不分析教育制度的長遠代價'],['資深講師離開不只造成眼前缺員，也會削弱本地長期培訓新人的能力。','只看今年缺口，漏了日後人才培養的影響。','課室空間不能代替有經驗的講師。','只談離職薪酬，未推到教育制度的長期代價。'],[9,10,11],'原文從公共系統變弱推到國家間差距可能擴大。'),
 transfer('一篇原因與問題文章在結尾只說「出國工作有好處」，沒有回收題目要求的問題。','怎樣改寫較完整？',['概括職涯誘因，再回扣原居服務與個人代價','只列海外好處，不回答原居國服務問題','只說國家損失，不分析移居者個人壓力','只重複出國有利，不回收成因與後果'],['結尾需概括較好待遇和職涯資源，也回扣原居服務與移居者個人可能承受的代價。','只列海外好處，漏答原居國的服務問題。','只談國家損失，漏了移居者的孤獨與適應。','重複出國有利，未完整收束原因與問題。'],[13,14],'原文末段先回收原因，再並列原居國及工作者的代價。'),
];
export default {key:'cause-solution:20',meta:{topic:'高學歷人士到海外工作的動因與代價',summary:'待遇和專業發展吸引人外移；原居國可能失去重要服務能力，工作者也可能承受適應壓力。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transferTasks};
