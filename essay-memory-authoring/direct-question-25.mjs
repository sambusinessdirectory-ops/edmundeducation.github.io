// Human-authored support for Direct Question 25; canonical text remains in the source bundle.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-25-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:25'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'In many places, both parents work all day, so children spend fewer hours with them than children did in the past.',
  'Families mainly need more money, and less time together can weaken relationships and give children less help as they grow.',
  'The main reason is that one parent’s pay is often not enough for a family to live well.',
  'Homes, travel, food, care for young children and school cost a lot, so many parents feel they must keep working to pay for family needs.',
  'Work is therefore not just something parents want to do; it is how the family gets the money it needs.',
  'That is why parents often go out early, come home late and turn to grandparents, day-care centres or screens to keep children busy.',
  'One big problem is that parents and children may feel less close.',
  'Children need more than money and things: they need parents to pay attention often, such as eating together, talking before bed and helping with schoolwork.',
  'These everyday moments may seem small, but they keep families close.',
  'Without them, children may feel less important or less safe, even if their parents love them very much.',
  'As time goes by, children may become less sure of themselves and less willing to talk about worries, mistakes or problems.',
  'Another problem is that parents can watch over children less.',
  'When parents are often not there, children may ask friends, social media or online entertainment for advice and praise.',
  'For example, a teenager who uses the internet for many hours without an adult’s help may pick up bad habits or bad beliefs before anyone sees it.',
  'Even good children may find it hard to learn to follow rules and control their actions if no adult is there regularly to show them how.',
  'To sum up, children see their parents less mainly because many families need money from both parents’ jobs to live.',
  'This can make families feel less close and leave children with less help, clear rules and guidance about what is right.',
];
const vocabulary=[
  [['Across many modern societies','In many places','許多現代社會'],['both mothers and fathers now work full time','both parents work all day','父母都全職工作'],['fewer hours of direct parental attention','fewer hours with them','父母直接關注更少'],['earlier generations did','children did in the past','比過去世代少']],
  [['main reason is economic pressure','Families mainly need more money','主因是經濟壓力'],['weaken family bonds','weaken relationships','削弱家庭關係'],['reduce the guidance children receive','give children less help','減少孩子獲得的引導'],['while they are growing up','as they grow','成長期間']],
  [['The clearest reason','The main reason','最明顯原因'],['one salary','one parent’s pay','一份薪金'],['support a family comfortably','for a family to live well','讓家庭生活舒適']],
  [['Housing','Homes','住房'],['transport','travel','交通'],['childcare','care for young children','託兒服務'],['education','school','教育'],['expensive','cost a lot','昂貴'],['remain in paid employment','keep working','繼續受薪工作'],['keep the household stable','pay for family needs','維持家庭穩定']],
  [['In this sense','therefore','從此意義'],['not simply a personal ambition','not just something parents want to do','不只是個人抱負'],['a financial lifeline','how the family gets the money it needs','經濟命脈']],
  [['Because of this','That is why','因此'],['leave home early','go out early','早離家'],['return late','come home late','晚回家'],['depend on','turn to','依靠'],['nurseries','day-care centres','託兒所'],['electronic devices','screens','電子設備'],['occupy their children','keep children busy','讓孩子有事做']],
  [['One serious problem','One big problem','嚴重問題'],['emotional distance','parents and children may feel less close','情感距離']],
  [['more than material comfort','more than money and things','不只是物質舒適'],['small, regular moments of attention','parents to pay attention often','經常關注孩子'],['family meals','eating together','家庭用餐'],['bedtime conversations','talking before bed','睡前對話'],['help with homework','helping with schoolwork','功課幫助']],
  [['routines','everyday moments','日常習慣'],['look ordinary','seem small','看似普通'],['the glue that holds relationships together','keep families close','維繫關係']],
  [['If they disappear','Without them','如果日常習慣消失'],['feel less valued','feel less important','感到較不被重視'],['less secure','less safe','較無安全感'],['love them deeply','love them very much','深愛孩子']],
  [['Over time','As time goes by','長遠而言'],['reduce their confidence','less sure of themselves','削弱自信'],['less willing to discuss','less willing to talk about','較不願討論'],['fears','worries','恐懼'],['personal difficulties','problems','個人困難']],
  [['Another problem','Another problem','另一問題'],['weaker supervision','parents can watch over children less','較弱監管']],
  [['rarely available','often not there','很少能陪伴'],['turn to','ask','轉向'],['classmates','friends','同學'],['for advice and approval','for advice and praise','尋求建議與認同']],
  [['spends hours online','uses the internet for many hours','長時間上網'],['without adult guidance','without an adult’s help','缺成人引導'],['copy unhealthy habits','pick up bad habits','模仿不健康習慣'],['absorb harmful values','bad beliefs','吸收有害價值觀'],['before anyone notices','before anyone sees it','在有人察覺前']],
  [['Even responsible children','Even good children','即使負責任的孩子'],['struggle to build discipline','find it hard to learn to follow rules','難建立紀律'],['self-control','control their actions','自制力'],['consistently present','there regularly','持續在場'],['model those qualities','show them how','示範這些品質']],
  [['In conclusion','To sum up','總結'],['spend less time with their parents','see their parents less','與父母相處更少'],['two incomes','money from both parents’ jobs','兩份收入'],['survive','live','維持生活']],
  [['create emotional separation','make families feel less close','造成情感疏離'],['less support','less help','較少支持'],['structure','clear rules','規律'],['moral guidance','guidance about what is right','道德引導']],
];
const chunkOverrides=[
  ['Across many modern societies,','both mothers and fathers now work full time,','so children receive fewer hours of direct parental attention','than earlier generations did.'],
  ['The main reason is economic pressure,','and this can weaken family bonds','and reduce the guidance children receive','while they are growing up.'],
  ['The clearest reason is that one salary','is often no longer enough','to support a family comfortably.'],
  ['Housing, transport, food, childcare and education are expensive,','so many parents feel they must remain in paid employment','just to keep the household stable.'],
  ['In this sense, work is not simply a personal ambition;','it is a financial lifeline.'],
  ['Because of this, parents often leave home early,','return late, and depend on grandparents, nurseries','or electronic devices to occupy their children.'],
  ['One serious problem','is emotional distance.'],
  ['Children need more than material comfort:','they need small, regular moments of attention,','such as family meals, bedtime conversations','and help with homework.'],
  ['These routines may look ordinary,','but they are the glue that holds relationships together.'],
  ['If they disappear, children may feel less valued','or less secure, even when their parents love them deeply.'],
  ['Over time, this can reduce their confidence','and make them less willing to discuss','fears, mistakes or personal difficulties.'],
  ['Another problem','is weaker supervision.'],
  ['When parents are rarely available,','children may turn to classmates, social media','or online entertainment for advice and approval.'],
  ['For example, a teenager who spends hours online','without adult guidance may copy unhealthy habits','or absorb harmful values before anyone notices.'],
  ['Even responsible children can struggle to build discipline','and self-control if no adult is consistently present','to model those qualities.'],
  ['In conclusion, children spend less time with their parents','mainly because many families now need two incomes','to survive.'],
  ['This can create emotional separation','and leave children with less support, structure','and moral guidance.'],
];
const simpleChunkOverrides=[
  ['In many places, both parents work all day,','so children spend fewer hours with them','than children did in the past.'],
  ['Families mainly need more money,','and less time together can weaken relationships','and give children less help as they grow.'],
  ['The main reason is that one parent’s pay','is often not enough','for a family to live well.'],
  ['Homes, travel, food, care for young children','and school cost a lot,','so many parents feel they must keep working','to pay for family needs.'],
  ['Work is therefore not just','something parents want to do;','it is how the family gets the money it needs.'],
  ['That is why parents often go out early,','come home late and turn to grandparents, day-care centres','or screens to keep children busy.'],
  ['One big problem is that','parents and children may feel less close.'],
  ['Children need more than money and things:','they need parents to pay attention often,','such as eating together, talking before bed','and helping with schoolwork.'],
  ['These everyday moments may seem small,','but they keep families close.'],
  ['Without them, children may feel less important','or less safe, even if their parents love them very much.'],
  ['As time goes by, children may become','less sure of themselves and less willing','to talk about worries, mistakes or problems.'],
  ['Another problem is that','parents can watch over children less.'],
  ['When parents are often not there,','children may ask friends, social media','or online entertainment for advice and praise.'],
  ['For example, a teenager who uses the internet','for many hours without an adult’s help','may pick up bad habits or bad beliefs','before anyone sees it.'],
  ['Even good children may find it hard','to learn to follow rules and control their actions','if no adult is there regularly','to show them how.'],
  ['To sum up, children see their parents less','mainly because many families need money','from both parents’ jobs to live.'],
  ['This can make families feel less close','and leave children with less help, clear rules','and guidance about what is right.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,functionName,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${functionName}，與原句的句型和語意關係相同。`,distractorReason:`這句${functionName}；它表達的是另一種關係。`};}
const structures=[
  card('Across many modern societies, both adults work long hours, so children spend less time talking to them than their parents did.','用 so 和 than 比較雙親工作後孩子獲得的時間',[1,2,6],
    fixed(0,'Across many modern societies, [雙親全職工作], so [孩子獲得較少直接關注] than [以前世代].','以現代家庭的工作安排開場，清楚指出孩子陪伴時間的變化。','要交代一項社會變化，並用 so 推出其直接後果，再與過去比較時。',['Across many modern societies, ', ', so ', ' than '],['父母工作的現況','對孩子直接關注的影響','比較對象'])),
  card('The main reason is high rent, and this can reduce family time and weaken children’s trust.','用 The main reason is ... and this can ... 預告原因與兩類後果',[0,3,15],
    fixed(1,'The main reason is [經濟壓力], and this can [削弱家庭關係] and [減少成長期引導].','引言先回答原因，再預告情感與引導兩項問題。','雙問題目要求原因及後果，引言要把兩者連起來時。',['The main reason is ', ', and this can ', ' and '],['主要原因','第一項家庭後果','第二項孩子後果'])),
  card('The clearest reason is that one wage is often no longer enough to cover family costs.','用 The clearest reason is that 點明單一收入不足',[1,3,4],
    fixed(2,'The clearest reason is that [一份薪金] is often no longer enough to [維持家庭生活].','原因段先提出可由日常開支支持的核心解釋。','題目問為何雙親都工作，先提出收入不足的主因時。',['The clearest reason is that ', ' is often no longer enough to '],['不足以應付開支的收入','家庭需要維持的生活'])),
  card('Rent and food are expensive, so both parents keep working just to pay basic bills.','用 costs ... so ... just to 把具體開支連到雙親工作需要',[2,4,5],
    fixed(3,'[住房、交通、食物等] are expensive, so [父母繼續受薪工作] just to [維持家庭穩定].','用生活費例子解釋為何一份薪金不足，雙親只好繼續工作。','要列出持續開支，再用 so 解釋當事人為何作出某項選擇時。',[' are expensive, so ', ' just to '],['昂貴的家庭開支','因開支而持續工作的父母','工作所維持的基本目標'])),
  card('In this sense, a second job is not simply a career choice; it is a way to pay for daily needs.','用 not simply ...; it is ... 重估雙親工作的必要性',[1,2,3],
    fixed(4,'In this sense, [工作] is not simply [個人抱負]; it is [經濟命脈].','總結經濟原因：工作不只出於個人志向，還支撐家庭生活。','已列日常開支，要糾正「雙親工作純因事業心」的單一解讀時。',['In this sense, ', ' is not simply ', '; it is '],['重新理解的工作','不足以解釋工作的原因','家庭依靠的經濟作用'])),
  card('Because of this, parents often leave early, return late, and depend on relatives to look after their children.','用 Because of this 把經濟原因連到父母作息與代照安排',[0,3,6],
    fixed(5,'Because of this, [父母] often [早離家], [晚回家], and depend on [祖父母、託兒所或裝置] to [照看孩子].','說明收入壓力如何變成每天較少相處，以及誰暫時照看孩子。','前文已交代原因，要用 Because of this 引出可觀察的日常行為及依靠方式時。',['Because of this, ', ' often ', ', ', ', and depend on ', ' to '],['受壓力影響的父母','離家的時間','回家的時間','替代照看方式','孩子在父母不在場時的安排'])),
  card('One serious problem is emotional distance between parents and children.','用 One serious problem is 宣告情感後果',[4,7,11],
    fixed(6,'One serious problem is [情感距離].','問題段先以短句命名第一項後果，後文才解釋如何形成。','原因已清楚，開始回答相處減少可能帶來甚麼問題時。',['One serious problem is '],['第一項家庭問題'])),
  card('Children need more than new toys: they need regular talks, such as family meals and help with schoolwork.','用 need more than ...: they need ... such as 對比物質與日常關注',[6,8,11],
    fixed(7,'Children need more than [物質舒適]: they need [定期關注], such as [用餐、睡前談話和功課幫助].','以家庭日常例子解釋情感距離：孩子需要穩定關注，而非只需物質。','已提出情感問題，須說明孩子實際缺少哪種陪伴時。',['Children need more than ', ': they need ', ', such as '],['不足以替代陪伴的物質','孩子仍需要的關注','能體現關注的日常時刻'])),
  card('These shared meals may look ordinary, but they are the habits that keep families close.','用 may look ordinary, but 強調普通日常互動的重要性',[6,7,9],
    fixed(8,'These [日常習慣] may look ordinary, but they are [維繫關係的黏合力].','將用餐與談話由看似瑣碎的活動，提升為維持親密關係的條件。','剛列家庭小事，需要解釋它們為何值得重視時。',['These ', ' may look ordinary, but they are '],['看似普通的日常活動','實際維繫關係的作用'])),
  card('If shared dinners disappear, children may feel ignored or unsafe, even when parents care deeply.','用 If ... may ... even when 分開父母的愛與孩子的實際感受',[7,8,10],
    fixed(9,'If [日常互動消失], children may feel [較不被重視] or [較無安全感], even when [父母深愛孩子].','交代缺乏互動會造成的主觀感受，即使父母本意仍然關心。','說完家庭日常的重要性，要指出缺失後孩子可能怎樣感受時。',['If ', ', children may feel ', ' or ', ', even when '],['消失的家庭互動','孩子第一種感受','孩子第二種感受','不能單獨消除感受的父母心意'])),
  card('Over time, this can lower their confidence and make them less willing to discuss worries or mistakes.','用 Over time ... and make ... 連上長期自信與溝通後果',[6,9,12],
    fixed(10,'Over time, this can [削弱自信] and make them less willing to [談恐懼、錯誤與困難].','把短期不安全感推進到長期自我評價與求助意願。','已說孩子感到疏離，要說明問題累積後會怎樣影響溝通時。',['Over time, this can ', ' and make them less willing to '],['累積形成的自信影響','因此較少進行的溝通'])),
  card('Another problem is weaker supervision at home.','用 Another problem is 轉入第二項後果',[6,10,12],
    fixed(11,'Another problem is [監管較弱].','另起一個問題段，轉向缺少成人在場引導的後果。','情感問題已說清，現在要提出另一種不同的家庭風險時。',['Another problem is '],['第二項家庭問題'])),
  card('When parents are rarely home, children may turn to online friends for advice and approval.','用 When ... may turn to ... for 說明缺少父母時孩子尋求指引的去向',[7,11,13],
    fixed(12,'When [父母少在場], children may turn to [同學、社交媒體或網娛] for [建議和認同].','指出監管變弱時，孩子可能改向同儕或網絡取得指引。','已提出監管問題，需要說孩子在父母不在時會向誰求助時。',['When ', ', children may turn to ', ' for '],['父母缺席的條件','孩子轉向的渠道','希望得到的回應'])),
  card('For example, a teenager who spends hours online without adult help may copy risky habits or absorb harmful values before anyone notices.','用 For example, a teenager who ... may ... before 將網絡暴露連到具體風險',[12,14,10],
    fixed(13,'For example, a teenager who [長時間上網] without [成人引導] may [模仿壞習慣] or [吸收有害觀念] before [有人察覺].','以缺少成人引導的網絡使用，說明不良習慣和價值觀可能悄悄形成。','已說孩子轉向網絡，需要舉出監管不足的具體風險時。',['For example, a teenager who ', ' without ', ' may ', ' or ', ' before '],['青少年的網絡行為','缺少的引導','第一種風險','第二種風險','風險被發現的時點'])),
  card('Even careful children can struggle to build self-control and good habits if no adult is consistently present to show them how.','用 Even ... can struggle ... if 說明良好孩子亦需要穩定示範',[11,12,13],
    fixed(14,'Even [負責任的孩子] can struggle to build [紀律] and [自制力] if no adult is consistently present to [示範].','說明監管不只是防錯，也包括成人持續示範自律。','舉完網絡風險，還要指出沒有成人榜樣對一般孩子的影響時。',['Even ', ' can struggle to build ', ' and ', ' if no adult is consistently present to '],['仍可能受影響的孩子','需養成的紀律','需養成的自制','成人應提供的示範'])),
  card('In conclusion, children see their parents less mainly because many households need two wages to get by.','用 mainly because 在結論精確回答雙親工作的原因',[1,2,16],
    fixed(15,'In conclusion, [孩子較少與父母相處] mainly because [家庭需兩份收入維生].','結論先回答原因：許多家庭需要雙薪，孩子才有較少相處時間。','結尾要先簡明回應「為甚麼」而不引入新原因時。',['In conclusion, ', ' mainly because '],['需要總結的時間變化','最主要的經濟原因'])),
  card('This can create distance and leave children with less support, routine and guidance about right and wrong.','用 This can create ... and leave ... with less ... 收束情感與引導問題',[1,10,15],
    fixed(16,'This can create [情感疏離] and leave children with less [支持、規律與道德引導].','結論第二句回答後果，把情感距離和監管不足收成兩類損失。','已重申雙薪原因，最後須回答孩子可能面對甚麼問題時。',['This can create ', ' and leave children with less '],['家庭關係的問題','孩子失去的支持與引導'])),
];
const wrongReasons=[
  ['引言原因與後果只作預告，沒有 so 和 than 的現況與過去比較。','單一薪金不足是原因，不是先描述孩子直接關注時間的變化。','情感距離是後果，沒有雙親全職工作的開場背景。'],
  ['現況句交代時間變少，沒有 The main reason is 並列原因與後果。','開支例子細化經濟原因，沒有引言總括情感與引導。','結論重申經濟原因，沒有同句預告兩項問題。'],
  ['引言只概括經濟壓力，沒有點出一份薪金不足的第一個原因。','具體開支支持論點，但沒有先用 The clearest reason is that 命名主因。','工作是財政命脈屬推論，沒有先指出單薪不足。'],
  ['單薪不足是主張，沒有列開支及 just to 維持家庭的工作目的。','財政命脈是總結，不詳述家庭開支為何迫使父母工作。','離家和代照是工作時間後果，沒有列住房、托兒等開支。'],
  ['引言原因只是總述，沒有把工作由志向重新界定為經濟命脈。','單薪不足是基礎原因，沒有 not simply ...; it is 的修正關係。','開支清單是具體證據，沒有這句的概括性重新評價。'],
  ['開場描述雙親工作與孩子時間變少，沒有早出晚歸與替代照看。','開支昂貴說父母為何工作，沒有 Because of this 的日常作息後果。','情感距離是後續問題，不是父母離家與代照安排。'],
  ['工作經濟命脈回答原因，沒有命名情感方面的問題。','孩子需要定期關注是情感問題的解釋，不是短句先提出問題。','另一問題是監管較弱，與本句要開展的情感距離不同。'],
  ['情感距離只命名問題，沒有對比物質與定期關注及例子。','普通日常的作用是下一句的解釋，沒有列具體陪伴。','監管較弱是另一個問題，不是孩子所需的家庭互動。'],
  ['情感距離是問題標籤，沒有指出看似普通的活動其實有作用。','用餐談話是例子清單，沒有 may look ordinary, but 的重估。','互動消失說後果，沒有說日常時刻怎樣維繫關係。'],
  ['家庭互動的需求是正面陳述，沒有 If 消失後孩子的感受。','日常習慣像黏合劑是作用比喻，沒有感受與父母愛的讓步。','長期自信下降是再下一步後果，沒有短期不被重視感。'],
  ['情感距離只命名問題，沒有 Over time 的累積後果。','互動消失先說不安全感，沒有自信與討論困難的長期變化。','向網絡求助是監管問題，並非此句的自信與溝通退縮。'],
  ['情感距離是第一個問題，沒有轉入較弱監管。','自信和溝通是前一問題的延伸，不是新問題的標題。','向同學網絡求助是監管問題的細節，沒有先命名它。'],
  ['定期關注的需要屬情感面，沒有 When 父母缺席後轉向別處。','監管較弱只命名問題，沒有孩子向誰尋求建議和認同。','青少年網上例子是轉向網絡後的風險，不是先說去向。'],
  ['孩子轉向網絡只是渠道，沒有具體模仿或吸收有害觀念。','成人示範不足說一般紀律，沒有這個網上案例的時間序列。','長期自信下降屬情感面，沒有無成人引導的網絡風險。'],
  ['監管較弱只提出問題，沒有 Even 負責任孩子也需要示範。','向網絡求助說孩子的指引渠道，沒有紀律和自制的發展。','網上風險例子聚焦有害內容，沒有一般孩子對榜樣的需要。'],
  ['引言原因與後果是預告，不是結論主要原因的簡明重申。','單薪不足是原因段論述，沒有結論回到孩子相處時間。','情感與引導是結論後果，沒有回答 mainly because 的原因。'],
  ['引言預告問題，沒有結論把情感與引導合成最終後果。','長期自信下降只是情感方面的一環，沒有收束監管和道德引導。','結論原因句回答雙薪，沒有回答孩子可能受哪些影響。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求回答哪兩件事？',[
    '雙親工作、孩子較少相處的原因，以及可能造成的問題',
    '父母最喜歡哪份工作，以及孩子最常使用哪款裝置',
    '只列父母每天的上班時間，不分析任何後果',
    '只討論孩子的功課表現，不談父母工作原因',
  ],'一題問原因，另一題問孩子可能受到的影響。'),
  {type:'multi',prompt:'選出範文原因與問題段的核心',detail:'選兩項，再按「確認」。',options:[
    '單薪不足以應付住房、託兒等開支，父母需繼續工作',
    '缺少日常關注可拉遠感情，缺少成人在場也削弱引導',
    '父母只因事業野心工作，生活費對決定完全無關',
    '孩子有物質供應便不需要談話、陪伴或成人榜樣',
  ],correct:[0,1],why:'作者先講經濟壓力，再把情感與監管分成兩個問題。'},
];
const route=[sequence('依照範文次序排好五段任務',[
  ['引言交代雙問題','雙親全職工作令孩子較少獲直接關注；經濟壓力帶來兩種問題。'],
  ['原因：單薪不足','住房、交通、食物、託兒和教育費用迫使父母維持雙薪。'],
  ['問題一：情感距離','欠缺用餐、睡前談話等小而定期的關注，孩子可能不安並較少求助。'],
  ['問題二：監管較弱','孩子可能改向同儕或網絡求指引，也少有成人示範自律。'],
  ['結論雙重回答','雙薪需要解釋時間減少；情感疏離與引導不足概括後果。'],
],'由經濟原因出發，先處理情感問題，再處理成人引導問題。')];
const evidence=[
  quiz('為甚麼許多家庭需要雙親繼續受薪工作？',[
    '一份薪金常不足以應付住房、食物、託兒等家庭開支',
    '所有家庭都免費獲得住房與教育，不存在任何開支',
    '父母全因個人抱負工作，家庭支出與選擇毫無關係',
    '孩子只需電子裝置，家庭不再需要收入支付生活費',
  ],'作者用具體生活費說明工作是經濟命脈。'),
  quiz('工作壓力怎樣改變父母每天的時間安排？',[
    '較早離家、較晚回家，並讓其他人或裝置暫時陪伴孩子',
    '全天留在家中，從不需要祖父母或託兒服務幫忙',
    '家庭支出下降，父母因此完全停止受薪工作',
    '孩子上課時間縮短，父母每天因此增加陪伴',
  ],'Because of this 連到早出晚歸及替代照看。'),
  quiz('作者為何提家庭用餐和睡前談話？',[
    '具體說明孩子需要小而固定的關注，物質供應不能取代',
    '證明孩子只在睡前需要關注，其他時間不用互動',
    '主張所有家庭必須在同一時間用餐才有感情',
    '說明電子裝置可完全代替父母的直接關注',
  ],'這些普通時刻正是維繫關係的日常互動。'),
  quiz('即使父母深愛孩子，互動消失仍可能造成甚麼感受？',[
    '孩子可能感到較不被重視，也較沒有安全感',
    '孩子一定知道父母心意，不會受互動減少影響',
    '孩子只會擔心零用錢，與情感關係完全無關',
    '孩子必然立即找到成人榜樣，自信不會變化',
  ],'even when 表示父母的愛未必能自動補上缺少的陪伴。'),
  quiz('情感距離若持續，可能出現哪種長遠後果？',[
    '自信下降，也較不願談恐懼、錯誤或個人困難',
    '每個孩子都立刻更願談問題，且自信必定上升',
    '家庭開支完全消失，所有父母都不用再工作',
    '孩子一定只向父母求助，從不接觸任何同學',
  ],'Over time 把日常疏離推到較難開口求助。'),
  quiz('父母較少在場時，孩子可能轉向哪些渠道？',[
    '同學、社交媒體或網上娛樂，以尋求建議和認同',
    '只會轉向學校圖書館，永遠不接觸社交媒體',
    '只能向父母請教，沒有任何其他資訊來源',
    '全部停止與同學互動，也不需要他人認同',
  ],'問題在於引導來源改變，並非孩子完全沒有資訊。'),
  quiz('為何連負責任的孩子也可能需要成人持續在場？',[
    '紀律和自制力需要有人穩定示範，單靠孩子自己可能較難建立',
    '負責任的孩子不必觀察任何人的行為，必然懂得自制',
    '成人只須買更多裝置，毋須示範如何面對選擇',
    '只要學校有功課，家庭中的行為榜樣便完全無用',
  ],'成人在場除了監督，也提供可學習的日常榜樣。'),
];
const logic=[
  sequence('原因段：從開支到陪伴時間',[
    ['一份收入不足','一家人的日常費用常高於單薪可輕鬆承擔的水平。'],
    ['具體開支','住房、交通、食物、託兒和教育一起增加壓力。'],
    ['工作性質','雙親工作不只是個人抱負，也是維持生活的財源。'],
    ['時間安排','父母早出晚歸，倚靠祖父母、託兒所或裝置暫時陪伴。'],
  ],'收入需要解釋工作，工作時數再解釋相處變少。'),
  sequence('問題段：情感與引導兩條後果',[
    ['小而固定的陪伴減少','家庭用餐、睡前談話和功課幫助變少。'],
    ['情感距離','孩子可能感到不受重視或不安全，長遠較少談心。'],
    ['成人在場變少','孩子可能向同儕和網絡尋求建議及認同。'],
    ['引導風險','不良習慣可能較遲被發現，紀律與自制較難建立。'],
  ],'兩個問題相連但不同：一條是關係感受，另一條是行為引導。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('一名大學生周末打工，因為房租與學費已超出家中可負擔金額。','哪項最能轉用範文對工作的判斷？',[
    '打工不只是愛好，也是支付基本生活和學費的方法',
    '只要有工作，便代表學生不再在乎自己的學業',
    '房租與學費完全不是支出，打工只是一種消遣',
    '工作必定純屬事業野心，經濟需要可以忽略',
  ],[
    '範文用 not simply ...; it is ... 把工作說成家庭的財政命脈。',
    '有工作不等於不重視學業。',
    '題目明說兩項費用造成壓力。',
    '這忽略題目提供的收入缺口。',
  ],[2,3,4],'範文說高昂生活費令雙親繼續工作，工作不只是個人抱負。'),
  transfer('醫院員工連續上夜班，家中長者很少有固定時間與他談話。','哪項最貼近範文的情感邏輯？',[
    '除了提供物資，也要定期談話，讓長者感到被關注',
    '只要物資充足，家人之間完全不用再有任何互動',
    '長者只在節日需要談話，平日陪伴毫無作用',
    '沒有談話必定代表員工不愛長者，毋須看工作安排',
  ],[
    '範文區分物質照顧與小而固定的關注，兩者不能互相取代。',
    '物資不能等同關係中的定期關注。',
    '原文強調 regular 的日常性。',
    '缺少時間未必等於缺少愛。',
  ],[7,8,9],'範文說家庭日常互動雖普通，卻能維繫關係。'),
  transfer('一間學校只給學生昂貴設備，卻取消所有與導師定期談話的時段。','哪項最能轉用範文的「不只物質」觀點？',[
    '設備以外仍需定期談話，讓學生能提出擔憂和錯誤',
    '設備越貴，學生便越不需要任何人的持續關注',
    '只談考試分數，學生的安全感和求助意願不用管',
    '取消導師談話後，學生一定會更願意討論困難',
  ],[
    '範文說定期關注能支持安全感及面對困難時的溝通。',
    '物質支援不能自動替代人的關注。',
    '這忽略原文的情感與溝通後果。',
    '原文反而預測較不願討論困難。',
  ],[7,9,10],'範文認為孩子需要比物質更多的定期關注，否則較難談恐懼和錯誤。'),
  transfer('一位家長因長時間通勤而早出晚歸，鄰居指責他只是沉迷事業。','哪項最符合範文對原因的分析？',[
    '先看住房和家庭支出，再判斷工作是否維持生活所需',
    '只看家長回家時間，就能證明他完全不愛孩子',
    '任何家庭支出都可忽略，工作必定只是個人抱負',
    '通勤越長，家庭一定越不需要託兒或親人幫忙',
  ],[
    '範文把工作時間放在單薪不足與生活費高的經濟背景下看。',
    '早出晚歸不能直接證明情感態度。',
    '這與題目的支出線索相反。',
    '長時間不在家反而可能需要代照。',
  ],[2,3,4,5],'原文先解釋收入壓力，再說早出晚歸與替代照看。'),
  transfer('社區中心想讓新移民與鄰居建立信任，提議每周有固定的小組晚餐。','哪項最能運用範文的日常互動原則？',[
    '固定而普通的相聚可累積信任，不必只靠大型活動',
    '晚餐太普通，必然不能影響任何人際與社區關係',
    '只要送禮物，鄰居便不用再互相認識和談話',
    '只有一年一次的大型活動才可能維繫關係',
  ],[
    '範文說普通而定期的活動可以成為維繫關係的黏合力。',
    '普通正是原文用來反襯重要性的特點。',
    '物質禮物不能完全替代互動。',
    '原文重視小而規律的時刻。',
  ],[7,8],'範文以家庭用餐和睡前談話說明平凡但固定的互動能維繫關係。'),
  transfer('學生練習運動時，教練經常不在場，只留下網上影片供他們模仿。','哪項最能轉用範文對榜樣的看法？',[
    '穩定在場的成人可示範自律，影片未必能給個別引導',
    '只要有影片，所有學生便會自動建立紀律和自制',
    '教練不在場必定令所有學生完全不再接觸運動',
    '學生本來負責任，就絕不需要任何成人示範行為',
  ],[
    '範文說連負責任的孩子也可能需要成人持續示範紀律和自制。',
    '觀看內容不能保證學會行為。',
    '題目沒有說學生會退出運動。',
    '原文明言負責任者也可能受影響。',
  ],[12,13,14],'範文認為成人穩定示範，是孩子建立紀律和自制的一種條件。'),
  transfer('有些青少年遇到困難先問陌生網友，因家中很少有時間談心。','哪項最符合範文的兩步關係？',[
    '缺少定期交談使求助變少，孩子也可能改向網絡找認同',
    '向網友求助證明家庭一定沒有任何實際經濟壓力',
    '所有網上建議都必然正確，完全不用任何成人引導',
    '只要父母愛孩子，孩子就不可能轉向其他求助渠道',
  ],[
    '範文先寫較不願向家人談困難，再寫孩子改向同學和網絡。',
    '題目沒有排除經濟因素。',
    '網絡渠道並不能保證指引可靠。',
    '原文說愛與實際陪伴仍可能有落差。',
  ],[9,10,12],'原文把情感疏離與較少談心、轉向網絡求認同分別說清。'),
  transfer('一個家庭付得起孩子的活動費，卻長期沒有共同用餐或談話。','哪項最能避免只看物質供應？',[
    '檢視孩子是否有定期關注，而非只看活動費是否已付',
    '活動費已付就代表孩子必然有足夠的情感安全感',
    '沒有共同用餐表示家庭必定無法購買任何物資',
    '只計算上課時數，不用了解孩子願否談自己的事',
  ],[
    '範文強調物質舒適以外的小而固定的關注。',
    '支付費用不能保證家庭互動足夠。',
    '沒有用餐不等於沒有購買能力。',
    '孩子是否能開口談困難也是後續影響。',
  ],[7,8,9,10],'範文用家庭用餐與談話說明關注的重要，並指出缺失可能削弱安全感。'),
  transfer('親子題目同時問「雙親為何工作」與「孩子會受甚麼影響」。','哪項結論最完整？',[
    '先總結家庭需要雙薪，再概括情感疏離與引導不足',
    '只談社交媒體流行，不說家庭收入或孩子的問題',
    '只主張父母應減少上班，不分析現有經濟原因',
    '只列住房費用，不回答孩子相處減少後的影響',
  ],[
    '範文結論兩句分別回答經濟原因及情感、引導後果。',
    '這沒有回應題目的兩問。',
    '這跳過作者對單薪不足的解釋。',
    '第二問仍須交代孩子可能遇到的問題。',
  ],[15,16],'範文結論先重申雙薪需要，再總結情感距離和較少支持與引導。'),
  transfer('一所寄宿學校發現學生難以自律，管理者只想增加規則文字。','哪項最能轉用範文的引導原則？',[
    '安排成人持續示範和回應問題，幫助學生學會自制',
    '只增加告示數量，假設學生自然會模仿紙上文字',
    '完全不問學生困難，把所有責任交給電子裝置',
    '認為好學生不用成人榜樣，因此取消所有輔導',
  ],[
    '範文重視成人持續在場示範，而不只靠抽象規則。',
    '告示不能等同成人行為示範。',
    '電子裝置不是可信任成人的替代。',
    '原文說即使負責任孩子也可能需要示範。',
  ],[11,14],'範文指出成人經常不在場時，孩子較難建立紀律和自制。'),
];
const revised=[
  {options:['打工除興趣外，也是支付房租與學費的方式。','打工主要表明他不重視學業，支出只是次要。','房租學費可由日常節省支付，打工偏向消遣。','打工主要出於事業野心，經濟缺口並不重要。'],explanations:['題目給出明確的支出壓力，工作有實際財務作用。','有工作不能推斷學生不重視學業。','已知費用超出家庭能力，不能忽略收入需要。','題目中的經濟缺口比推測動機更有依據。']},
  {options:['除物資照顧，亦安排定期談話讓長者感到受關注。','先確保物資供應，談話可留待較空閒的節日。','保持夜班收入，家中交流可主要交由社交媒體。','長者少談心顯示關係轉差，宜先減少工作責任。'],explanations:['物資與固定的情感交流不可互相取代。','不規律的偶爾談話難代替持續關注。','網上訊息未必有題述面對面談話的作用。','工作時間不足不等於不願關心長者。']},
  {options:['設備以外仍安排導師談話，讓學生可提出擔憂。','增加設備投資，導師談話改成每學期一次。','以考試成績評估支持，求助意願留待事後再看。','增加導師留言表，暫緩安排面對面的固定談話。'],explanations:['物質資源不會自動提供穩定的情感與溝通支持。','低頻度接觸可能不足以建立求助關係。','學科成績不能涵蓋安全感和溝通。','文字留言可補充，但不等於固定的人際關注。']},
  {options:['先看住房與家庭支出，再判斷長工時的原因。','單看晚歸時間，便將長工時視為事業野心。','先要求減少通勤，再討論收入能否支付開支。','以鄰居印象判斷動機，家庭支出稍後再查。'],explanations:['範文把長工時放在維持家庭收入的背景中看。','回家時間不能單獨證明工作動機。','減少通勤未必解決題述財務需要。','第三者印象不足以替代家庭開支證據。']},
  {options:['固定的小型相聚可累積信任，不必倚賴大型活動。','大型節日較易吸引人，固定小聚可先暫停。','先送鄰居禮物，再以書面介紹取代實際談話。','每年辦一次盛會，日常互動留待關係成熟後。'],explanations:['日常、規律的接觸可逐漸建立關係。','大型活動不必取代持續的小型互動。','物質禮物難代替彼此認識的過程。','信任需要持續交流，不能只依賴年度活動。']},
  {options:['成人穩定在場可示範自律，影片較難給個別引導。','影片能示範動作，教練可把回饋全留待學期末。','學生有基本責任感，便可減少成人在場示範。','教練多不在場時，應先增加影片而非觀察學員。'],explanations:['行為示範與個別回饋都依賴可信任成人參與。','影片不能即時回應個別學生困難。','已有責任感的學生仍可能需要持續示範。','增加影片未處理缺乏在場引導的問題。']},
  {options:['少有定期談心可降低家庭求助，孩子轉向網絡。','孩子向網友求助，可推斷家中沒有經濟壓力。','網絡有即時回覆，便可取代成人長期引導。','父母工作忙但愛孩子，孩子便不會另找認同。'],explanations:['從家庭交流減少，連到求助渠道的可能轉移。','轉向網絡不能排除家中財務壓力。','回應速度不等於建議可靠或關係穩定。','關心與實際可用的陪伴時間可能存在落差。']},
  {options:['檢視孩子有無定期關注，不僅查看活動費是否已付。','活動費已付，可把情感需要留待下學期再評估。','沒有共同用餐，可推斷家庭無力支付活動費。','先計算活動時數，孩子求助意願放在較後檢查。'],explanations:['物質供應與規律的人際關注是不同層面。','支付費用不能證明家庭互動足夠。','缺少共同用餐不等於沒有購買力。','孩子是否願意談困難也是重要結果。']},
  {options:['概括雙薪的經濟原因，再說情感與引導的影響。','先談社交媒體流行，再簡述家庭支出壓力。','提出父母縮短工時的建議，略去現有收入原因。','詳述房租學費，孩子相處減少的影響留白。'],explanations:['兩部分分別回應原因與孩子所受影響。','社交媒體不是題目兩問的主要答案。','建議不能代替對當前經濟原因的分析。','只答費用沒有回應孩子的後果。']},
  {options:['讓成人持續示範並回應問題，幫學生學會自制。','增加規則文字，成人回饋可改成每學期一次。','用電子提醒取代輔導，學生困難留待違規後處理。','只為成績較差者安排榜樣，其他學生靠告示。'],explanations:['可觀察的成人行為與持續回應能支持自律。','告示無法提供即時的示範與個別回饋。','電子提醒可輔助，卻不等於可信任成人。','學業表現良好者也可能需要行為示範。']}
];
revised.forEach((r,i)=>{transferTasks[i].options=r.options;transferTasks[i].explanations=r.explanations});
export default {key:'direct-question:25',meta:{topic:'雙親工作與孩子相處時間減少',summary:'高昂生活費迫使許多家庭維持雙薪；缺少固定陪伴可拉遠感情，成人引導亦可能減少。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
