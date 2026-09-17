export const moduleId='scoop';
export const steps=[
 {id:'surprise',label:'發現驚喜',title:'兩球冰淇淋，真的叫 two balls？',intro:'你走進冰淇淋店，想點兩球冰淇淋。下面這句很有禮貌，但有一個字不是點餐時慣用的說法。',sentence:'Can I get two balls of ice cream, please?',questions:['spot'],reveal:'點冰淇淋時，通常說 two scoops of ice cream。ball 著重球形；scoop 在這裡表示舀出來的一份。這屬於「意思可能聽得懂，但搭配不慣用」，不是整句文法都錯了。',model:'Can I get two scoops of ice cream, please?',zh:'我想要兩球冰淇淋，謝謝。'},
 {id:'listen',label:'聽懂店員',title:'店員在問甚麼？',intro:'先播放店員的問題，再選擇意思。已經在談冰淇淋，就不用每次重複 of ice cream。',model:'One scoop or two?',zh:'一球還是兩球？',questions:['listen']},
 {id:'choose',label:'選對訂單',title:'選對句子，才會拿到想吃的口味',intro:'你想要兩球草莓冰淇淋。哪一句符合你的需要？',questions:['choose']},
 {id:'blanks',label:'自己填空',title:'不看選項，你還記得嗎？',intro:'一球用 scoop；兩球或以上用 scoops。大小寫和前後空格不影響答案。',questions:['blank1','blank2','blank3']},
 {id:'speak',label:'開口練習',title:'換你說一次',intro:'先聽示範，再錄下自己讀這句話的聲音。這是選做練習，可以跳過。',model:'Can I get two scoops of chocolate ice cream, please?',zh:'我想要兩球巧克力冰淇淋，謝謝。',recording:'phrase',questions:[]},
 {id:'cup',label:'第二個驚喜',title:'等等，店員又問了一句！',intro:'你已經說了兩球，店員卻接著問 Cup or cone? 這次是在問甚麼？',model:'Cup or cone?',zh:'用杯子還是甜筒裝？',questions:['cup']},
 {id:'dialogue',label:'完成點餐',title:'完成你自己的小訂單',intro:'你的訂單：兩球香草冰淇淋，用杯子裝。把自己的回答補完整。',questions:['dialogue1','dialogue2','dialogue3'],recording:'dialogue',model:'Can I get two scoops of vanilla ice cream, please? In a cup, please.',zh:'我想要兩球香草冰淇淋，謝謝。用杯子裝，謝謝。'},
 {id:'finish',label:'最後挑戰',title:'把開場那句改好',intro:'還記得 two balls of ice cream 嗎？現在不用選項，換掉那個字。',questions:['final']}
];
const mc=(id,prompt,options,answer,explanation)=>({id,type:'mc',prompt,options,answers:[answer],explanation});
const blank=(id,prompt,before,after,answer,hint)=>({id,type:'blank',prompt,before,after,answers:[answer],hint,explanation:`這裡填 ${answer}。${hint}`});
export const questions=[
 mc('spot','你會換掉哪個字？',['get','two','balls','please'],'balls','點冰淇淋通常用 scoop 表示一球；兩球是 two scoops。'),
 mc('listen','店員想知道甚麼？',['你想要哪種口味？','你要一球還是兩球？','你想不想試吃？','你需要加醬嗎？','你要杯子還是甜筒？','你準備付款了嗎？'],'你要一球還是兩球？','想要兩球，可以回答 Two scoops, please.'),
 mc('choose','你想要兩球草莓冰淇淋。',['Can I try the strawberry ice cream?','Can I get one scoop of strawberry ice cream?','Can I get two scoops of chocolate ice cream?','Can I get two scoops of strawberry ice cream?','Can I get extra strawberry sauce?','Can I get one scoop of vanilla ice cream?'],'Can I get two scoops of strawberry ice cream?','two scoops 是兩球；strawberry 是草莓。其他句子也可以使用，只是表達不同需要。'),
 blank('blank1','一球香草冰淇淋','Can I get one','of vanilla ice cream, please?','scoop','one 後面用單數。'),
 blank('blank2','兩球巧克力冰淇淋','Can I get two','of chocolate ice cream, please?','scoops','two 後面要加 s：scoops。'),
 blank('blank3','兩球草莓冰淇淋','Can I get','of strawberry ice cream, please?','two scoops','兩球＝two scoops；請填兩個字。'),
 mc('cup','這次店員是在問……',['你要一球還是兩球？','你要巧克力還是香草？','你要用杯子還是甜筒裝？','你要不要加巧克力醬？','你要不要再點一份？','你要現金還是刷卡？'],'你要用杯子還是甜筒裝？','scoop 是份量；cup / cone 是容器。用杯子裝：In a cup, please. 用甜筒裝：In a cone, please.'),
 blank('dialogue1','店員：What can I get you?｜先填份量單位','Can I get two','of vanilla ice cream, please?','scoops','兩球用 two scoops。'),
 blank('dialogue2','接著填口味：香草','Can I get two scoops of','ice cream, please?','vanilla','香草口味是 vanilla。'),
 blank('dialogue3','店員：Cup or cone?｜你要杯子','In a',', please.','cup','杯子是 cup；甜筒是 cone。'),
 blank('final','把 balls 換成點餐時慣用的字','Can I get two','of ice cream, please?','scoops','一球 one scoop，兩球 two scoops。')
];
export const questionMap=new Map(questions.map(q=>[q.id,q]));
export const normalise=s=>String(s??'').trim().toLowerCase().replace(/\s+/g,' ');
export const correct=(q,value)=>q.answers.some(a=>normalise(a)===normalise(value));
export const hkDate=at=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Hong_Kong',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(at));
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function latestRun(events){return events.filter(e=>e.kind==='start').sort((a,b)=>a.at.localeCompare(b.at)||a.id.localeCompare(b.id)).at(-1)?.run;}
export function completed(events,run){return new Set(events.filter(e=>e.kind==='answer'&&e.run===run&&questionMap.has(e.question)&&correct(questionMap.get(e.question),e.choice)).map(e=>e.question));}
export function daily(events){const map=new Map(),seen=new Set();for(const e of [...events].sort((a,b)=>a.at.localeCompare(b.at))){if(e.kind!=='answer'||!questionMap.has(e.question)||!correct(questionMap.get(e.question),e.choice)||seen.has(e.run+':'+e.question))continue;seen.add(e.run+':'+e.question);const date=hkDate(e.at);map.set(date,(map.get(date)||0)+1);}return map;}
