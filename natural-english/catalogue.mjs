import * as scoop from './scoop.mjs';
const mc=(id,prompt,options,answer,explanation)=>({id,type:'mc',prompt,options,answers:[answer],explanation});
const blank=(id,prompt,before,after,answers,hint)=>({id,type:'blank',prompt,before,after,answers:Array.isArray(answers)?answers:[answers],hint,explanation:`答案是 ${Array.isArray(answers)?answers[0]:answers}。${hint}`});
const lesson=(data)=>({...data,questionMap:new Map(data.questions.map(q=>[q.id,q]))});
const scoopLesson=lesson({id:'scoop',number:1,slug:'scoop',titleZh:'一球、兩球，怎麼說？',titleEn:'scoop',heading:'一球、兩球，scoop!',summary:'點雪糕時，學會自然地說份量、口味和杯或甜筒。',surpriseLabel:'你可能會這樣說…',steps:scoop.steps,questions:scoop.questions,takeaways:['Two scoops, please.','Can I get two scoops of vanilla ice cream, please?','In a cup, please.'],completionTitle:'你可以自己點一份雪糕了！'});
const boxQuestions=[
 mc('box-spot','吃不完想帶走，哪一句最自然？',['Can I get a box?','Please close my food.','Please make this outside.'],'Can I get a box?','在美國餐廳，通常直接向店員要 a box。'),
 mc('box-listen','客人想做甚麼？',['想再點一份食物','想拿盒子裝吃不完的食物','想結帳','想換枱'],'想拿盒子裝吃不完的食物','Can I get a box? 是想拿盒子裝剩下的食物。'),
 mc('box-choose','你想把剩下的食物帶回家，應該說……',['Can I get some more water?','Can I get another fork?','Can I get a box?','Can I get the check?'],'Can I get a box?','box 是用來裝剩下食物的盒子。'),
 blank('box-blank1','填入關鍵字','Can I get a','?','box','吃不完時向店員要的容器。'),
 blank('box-blank2','完成實用詞組','Can I get','?','a box','需要冠詞 a。'),
 blank('box-blank3','完成整句','','','Can I get a box?','由 Can I get 開始，句尾用問號。'),
 mc('box-extra','你已經有盒子，還想要一個袋。哪一句最合適？',['Can I get a bag, too?','Can I get another meal?','Can I get a table?'],'Can I get a bag, too?','too 表示「也／另外也要」。'),
 blank('box-dialogue1','店員：Are you all done?｜你想拿盒子','Can I get a','?','box','先要一個盒子。'),
 blank('box-dialogue2','裝好食物後，你還需要一個袋','Can I get a',', too?','bag','盒子裝食物，袋用來提走。'),
 blank('box-final','最後挑戰：把剩下的 pizza 帶走','','','Can I get a box?','完整說出自然的請求。')
];
const boxSteps=[
 {id:'box-surprise',label:'發現驚喜',title:'剩菜打包，不用說 Please pack this',intro:'你吃飽了，但碟上還有食物。先選出在美國餐廳更自然的說法。',sentence:'Please pack this.',questions:['box-spot'],reveal:'Please pack this. 意思聽得明，但在這個情境，更自然的是直接提出你需要的東西：Can I get a box?',revealItems:[['剩菜盒','a box'],['自然請求','Can I get a box?']],model:'Can I get a box?',zh:'可以給我一個盒子嗎？'},
 {id:'box-listen',label:'聽懂客人',title:'客人想做甚麼？',intro:'聽完餐廳對話，再判斷客人的需要。',model:'Can I get a box? Sure.',zh:'可以給我一個盒子嗎？當然可以。',questions:['box-listen']},
 {id:'box-choose',label:'選對一句',title:'吃不完，怎樣開口？',intro:'不同句子會提出不同需要。選出要剩菜盒的一句。',questions:['box-choose']},
 {id:'box-blanks',label:'自己填空',title:'不看選項，自己組合',intro:'由關鍵字到整句，逐步寫出 Can I get a box?',questions:['box-blank1','box-blank2','box-blank3']},
 {id:'box-speak',label:'開口練習',title:'換你說一次',intro:'先聽示範，再選擇錄下自己朗讀。',model:'Can I get a box?',zh:'可以給我一個盒子嗎？',recording:'phrase',questions:[]},
 {id:'box-extra',label:'第二個實用句',title:'盒子以外，還要一個袋',intro:'too 可以表示「另外也要」。',model:'Can I get a bag, too?',zh:'也可以給我一個袋嗎？',questions:['box-extra']},
 {id:'box-dialogue',label:'完成對話',title:'把兩個需要放進對話',intro:'先要盒子，再要一個袋。',model:'Can I get a box? Can I get a bag, too?',zh:'可以給我一個盒子嗎？也可以給我一個袋嗎？',questions:['box-dialogue1','box-dialogue2']},
 {id:'box-final',label:'最後挑戰',title:'新的食物，一樣能開口',intro:'pizza 吃不完，不看選項說出完整請求。',questions:['box-final']}
];
const flatQuestions=[
 mc('flat-spot','汽水沒有氣，更自然會怎樣說？',["It's flat.","It's empty.","It's weak."],"It's flat.",'說有氣飲品失去氣泡，用 flat。'),
 mc('flat-listen','客人在說甚麼？',['汽水太甜','汽水沒有氣','汽水太凍','汽水太少'],'汽水沒有氣','This soda is flat. 表示汽水沒有氣。'),
 mc('flat-choose','汽水還有，但已完全沒有氣。你會說……',['This soda is too sweet.','This soda is flat.','This soda is too cold.','This soda is empty.'],'This soda is flat.','flat 是沒有氣；empty 是容器內沒有東西。'),
 blank('flat-blank1','完成短句',"It's",'.','flat','flat 形容有氣飲品已經沒有氣。'),
 blank('flat-blank2','完成完整說法','This soda is','.','flat','放在 is 後面。'),
 blank('flat-blank3','先填飲品名稱','This','is flat.','soda','完整句是 This soda is flat.'),
 blank('flat-blank4','再填狀態','This soda is','.','flat','表示失去氣泡。'),
 mc('flat-extra','店員說 I’ll get you a new one. 他準備做甚麼？',['幫你換一杯新的','幫你加冰','幫你拿帳單'],'幫你換一杯新的','a new one 在這裡指另一杯新汽水。'),
 blank('flat-dialogue','店員：Is everything okay?','This soda is','.','flat','直接說明汽水沒有氣。'),
 blank('flat-final','最後挑戰：告訴店員飲品沒有氣','','',["It's flat.",'This soda is flat.'],'兩種說法都自然。')
];
const flatSteps=[
 {id:'flat-surprise',label:'發現驚喜',title:'汽水沒有氣，不用說 no gas',intro:'直譯可能聽得明，但 native speakers 通常用一個簡單形容詞。',sentence:'It has no gas.',questions:['flat-spot'],reveal:'汽水或其他有氣飲品失去氣泡時，通常說 It’s flat。flat 在這裡不是「平的」。',revealItems:[['沒有氣','flat'],['不是空杯','not empty']],model:"It's flat.",zh:'它沒有氣了。'},
 {id:'flat-listen',label:'聽懂客人',title:'這杯汽水有甚麼問題？',intro:'聽句子，分辨甜度、溫度、份量和氣泡。',model:'This soda is flat.',zh:'這杯汽水沒有氣。',questions:['flat-listen']},
 {id:'flat-choose',label:'選對一句',title:'選出真正的問題',intro:'杯內還有汽水，只是完全沒有氣。',questions:['flat-choose']},
 {id:'flat-blanks',label:'自己填空',title:'由 flat 寫到完整句',intro:'分清 soda 與 flat 在句中的位置。',questions:['flat-blank1','flat-blank2','flat-blank3','flat-blank4']},
 {id:'flat-speak',label:'開口練習',title:'換你說一次',intro:'先聽示範，再選擇錄下自己朗讀。',model:'This soda is flat.',zh:'這杯汽水沒有氣。',recording:'phrase',questions:[]},
 {id:'flat-extra',label:'第二個實用句',title:'店員會怎樣處理？',intro:'a new one 代替剛才提過的汽水。',model:"I'll get you a new one.",zh:'我幫你換一杯新的。',questions:['flat-extra']},
 {id:'flat-dialogue',label:'完成對話',title:'自然說明問題',intro:'店員問是否一切正常，直接說明汽水沒有氣。',questions:['flat-dialogue']},
 {id:'flat-final',label:'最後挑戰',title:'換一種有氣飲品也會說',intro:'不看選項，完整說出飲品沒有氣。',questions:['flat-final']}
];
const readyQuestions=[
 mc('ready-spot','看完餐牌後，哪一句更自然？',["We're ready to order.","We're ready to eat.",'We want the check.'],"We're ready to order.",'ready to order 表示已準備好點餐。'),
 mc('ready-listen','店員在問甚麼？',['你準備好點餐未？','你食完未？','你要埋單嗎？','你想轉枱嗎？'],'你準備好點餐未？','Are you ready to order? 是問是否可以開始點餐。'),
 mc('ready-choose','你們已決定好吃甚麼，應該回答……',["Yes, we're ready to order.","Yes, we're ready to leave.","Yes, we're ready for the check.","Yes, we're still looking."],"Yes, we're ready to order.",'準備好點餐就是 ready to order。'),
 blank('ready-blank1','填入動作',"We're ready to",'.','order','order 在餐廳可指點餐。'),
 blank('ready-blank2','填入狀態',"We're",'to order.','ready','ready to 表示準備好做某事。'),
 blank('ready-blank3','完成核心詞組',"We're",'.','ready to order','三個字連在一起。'),
 mc('ready-extra','還未決定好吃甚麼，應該說……',['We need a few more minutes.',"We're ready to order.",'We need the check.'],'We need a few more minutes.','這句表示還需要多幾分鐘。'),
 blank('ready-dialogue','店員：Are you ready to order?',"We're",'.','ready to order','完整回應店員。'),
 blank('ready-final','最後挑戰：我們可以點餐了','','',"We're ready to order.",'完整說出自然的回應。')
];
const readySteps=[
 {id:'ready-surprise',label:'發現驚喜',title:'可以點餐了，怎樣說更自然？',intro:'We can order now. 聽得明；餐廳更常用 ready to order。',sentence:'We can order now.',questions:['ready-spot'],reveal:'在餐廳表示已經決定好吃甚麼，通常說 We’re ready to order。',revealItems:[['準備好','ready'],['點餐','to order']],model:"We're ready to order.",zh:'我們已經準備好點餐。'},
 {id:'ready-listen',label:'聽懂店員',title:'店員在確認甚麼？',intro:'聽完整問答，再選擇店員的問題。',model:"Are you ready to order? Yes, we're ready to order.",zh:'你們準備好點餐了嗎？是的，我們準備好了。',questions:['ready-listen']},
 {id:'ready-choose',label:'選對一句',title:'你已經決定好了',intro:'選出符合「可以開始點餐」的回應。',questions:['ready-choose']},
 {id:'ready-blanks',label:'自己填空',title:'組合 ready to order',intro:'把狀態和動作放回正確位置。',questions:['ready-blank1','ready-blank2','ready-blank3']},
 {id:'ready-speak',label:'開口練習',title:'換你說一次',intro:'先聽示範，再選擇錄下自己朗讀。',model:"We're ready to order.",zh:'我們已經準備好點餐。',recording:'phrase',questions:[]},
 {id:'ready-extra',label:'第二個實用句',title:'還未準備好，也能自然回答',intro:'店員來得太快時，可以禮貌地說還需要一點時間。',model:'We need a few more minutes.',zh:'我們還需要多幾分鐘。',questions:['ready-extra']},
 {id:'ready-dialogue',label:'完成對話',title:'回答店員的問題',intro:'店員問是否可以點餐，你們已經準備好了。',questions:['ready-dialogue']},
 {id:'ready-final',label:'最後挑戰',title:'不看選項，直接回答',intro:'把「我們可以點餐了」換成自然餐廳英文。',questions:['ready-final']}
];
const clubQuestions=[
 mc('club-spot','「公司三文治」哪個字要改？',['company → club','sandwich → burger','get → eat'],'company → club','香港的「公司三文治」英文名稱是 club sandwich。'),
 mc('club-listen','客人想點甚麼？',['公司三文治','芝士漢堡','火腿三文治','沙律'],'公司三文治','club sandwich 就是公司三文治。'),
 mc('club-choose','你想點一份公司三文治，應該說……',['Can I get a ham sandwich?','Can I get a club sandwich?','Can I get a chicken salad?','Can I get a cheeseburger?'],'Can I get a club sandwich?','club sandwich 是正確名稱。'),
 blank('club-blank1','完成食物名稱','a','sandwich','club','不是 company。'),
 blank('club-blank2','完成點餐句','Can I get a','sandwich?','club','放在 sandwich 前面。'),
 blank('club-blank3','填入完整食物名稱','Can I get a','?','club sandwich','兩個字一起填。'),
 mc('club-extra','店員問配菜，你想要薯條。怎樣回答？',['Fries, please.','A club sandwich, please.','The check, please.'],'Fries, please.','Fries, please. 是簡單自然的回答。'),
 blank('club-dialogue','店員：What can I get you?','Can I get a','sandwich?','club','完成公司三文治的名稱。'),
 blank('club-final','最後挑戰：完整點一份公司三文治','','','Can I get a club sandwich?','使用 club，不是 company。')
];
const clubSteps=[
 {id:'club-surprise',label:'發現驚喜',title:'公司三文治，不是 company sandwich',intro:'香港名稱不能逐字翻譯。先找出要換掉的字。',sentence:'Can I get a company sandwich?',questions:['club-spot'],reveal:'「公司三文治」的英文名稱是 club sandwich，因此可以說 Can I get a club sandwich?',revealItems:[['香港叫法','公司三文治'],['英文名稱','club sandwich']],model:'Can I get a club sandwich?',zh:'可以給我一份公司三文治嗎？'},
 {id:'club-listen',label:'聽懂客人',title:'客人點了甚麼？',intro:'聽餐廳對話，再選出正確食物。',model:'Can I get a club sandwich? Sure.',zh:'可以給我一份公司三文治嗎？當然可以。',questions:['club-listen']},
 {id:'club-choose',label:'選對一句',title:'不要點錯食物',intro:'不同選項都是自然英文，但只有一句是公司三文治。',questions:['club-choose']},
 {id:'club-blanks',label:'自己填空',title:'記住 club sandwich',intro:'由一個字到完整點餐句。',questions:['club-blank1','club-blank2','club-blank3']},
 {id:'club-speak',label:'開口練習',title:'換你說一次',intro:'先聽示範，再選擇錄下自己朗讀。',model:'Can I get a club sandwich?',zh:'可以給我一份公司三文治嗎？',recording:'phrase',questions:[]},
 {id:'club-extra',label:'第二個實用句',title:'店員問你想要甚麼配菜',intro:'on the side 在這裡指跟餐配菜。',model:'What would you like on the side? Fries, please.',zh:'你想配甚麼配菜？薯條，謝謝。',questions:['club-extra']},
 {id:'club-dialogue',label:'完成對話',title:'把餐點放進對話',intro:'店員問 What can I get you?，完成你的訂單。',questions:['club-dialogue']},
 {id:'club-final',label:'最後挑戰',title:'不看選項，自己點餐',intro:'在新的餐廳情境完整說出你的訂單。',questions:['club-final']}
];
const dressingQuestions=[
 mc('dressing-spot','「沙律醬」哪個字要改？',['sauce → dressing','sauce → ketchup','salad → soup'],'sauce → dressing','英文通常叫 salad dressing。'),
 mc('dressing-listen','客人在問甚麼？',['有甚麼沙律醬','有甚麼沙律','有甚麼湯','有甚麼飲品'],'有甚麼沙律醬','What salad dressing do you have? 是問沙律醬選擇。'),
 mc('dressing-choose','你想問有甚麼沙律醬，應該說……',['What salad dressing do you have?','What salads do you have?','What drinks do you have?','What soup do you have?'],'What salad dressing do you have?','salad dressing 是沙律醬。'),
 blank('dressing-blank1','完成名稱','salad','','dressing','不是 salad sauce。'),
 blank('dressing-blank2','完成問句','What salad','do you have?','dressing','放在 salad 與 do 之間。'),
 blank('dressing-blank3','填入完整名稱','What','do you have?','salad dressing','兩個字一起填。'),
 mc('dressing-extra','你想沙律醬另外放，應該說……',['Can I get the dressing on the side?','Can I get another salad?','Can I get the check?'],'Can I get the dressing on the side?','on the side 表示另外放。'),
 blank('dressing-dialogue','你想問店員有甚麼沙律醬','What salad','do you have?','dressing','完成整段對話的關鍵字。'),
 blank('dressing-final','最後挑戰：想再要一些沙律醬','Can I get some extra','?','dressing','沙律醬在這裡直接用 dressing。')
];
const dressingSteps=[
 {id:'dressing-surprise',label:'發現驚喜',title:'沙律醬，不是 salad sauce',intro:'意思可能聽得明，但英文通常用另一個固定名稱。',sentence:'What salad sauce do you have?',questions:['dressing-spot'],reveal:'「沙律醬」英文通常叫 salad dressing，所以可以問 What salad dressing do you have?',revealItems:[['不慣用','salad sauce'],['自然名稱','salad dressing']],model:'What salad dressing do you have?',zh:'你們有甚麼沙律醬？'},
 {id:'dressing-listen',label:'聽懂客人',title:'客人在問哪一類選擇？',intro:'聽完問答，分辨沙律、沙律醬、湯和飲品。',model:'What salad dressing do you have? Ranch, Caesar, and Italian.',zh:'你們有甚麼沙律醬？有 Ranch、Caesar 和 Italian。',questions:['dressing-listen']},
 {id:'dressing-choose',label:'選對一句',title:'精準地問沙律醬',intro:'選出真正問 dressing 的句子。',questions:['dressing-choose']},
 {id:'dressing-blanks',label:'自己填空',title:'由 dressing 到完整問句',intro:'把固定名稱 salad dressing 放回句子。',questions:['dressing-blank1','dressing-blank2','dressing-blank3']},
 {id:'dressing-speak',label:'開口練習',title:'換你說一次',intro:'先聽示範，再選擇錄下自己朗讀。',model:'What salad dressing do you have?',zh:'你們有甚麼沙律醬？',recording:'phrase',questions:[]},
 {id:'dressing-extra',label:'第二個實用句',title:'想要沙律醬另外放',intro:'on the side 表示不要直接淋上去。',model:'Can I get the dressing on the side?',zh:'沙律醬可以另外放嗎？',questions:['dressing-extra']},
 {id:'dressing-dialogue',label:'完成對話',title:'問選擇，再說自己的需要',intro:'先問有甚麼沙律醬，再要求另外放。',questions:['dressing-dialogue']},
 {id:'dressing-final',label:'最後挑戰',title:'再要一些沙律醬',intro:'情境變了，但關鍵字仍然一樣。',questions:['dressing-final']}
];
export const modules=[
 scoopLesson,
 lesson({id:'box',number:2,slug:'box',titleZh:'剩菜打包',titleEn:'Can I get a box?',heading:'剩菜打包，box!',summary:'吃不完時自然地要盒子，也學會再要一個袋。',surpriseLabel:'你可能會這樣說…',steps:boxSteps,questions:boxQuestions,takeaways:['Can I get a box?','Can I get a bag, too?'],completionTitle:'你可以自然地把剩下的食物帶走了！'}),
 lesson({id:'flat',number:3,slug:'flat',titleZh:'汽水沒有氣',titleEn:"It's flat.",heading:'汽水沒有氣，flat!',summary:'分清 flat 與 empty，自然地請店員處理沒有氣的汽水。',surpriseLabel:'你可能會這樣說…',steps:flatSteps,questions:flatQuestions,takeaways:["It's flat.",'This soda is flat.',"I'll get you a new one."],completionTitle:'你可以自然地說明汽水沒有氣了！'}),
 lesson({id:'ready',number:4,slug:'ready-to-order',titleZh:'我們可以點餐了',titleEn:"We're ready to order.",heading:'準備好點餐，ready!',summary:'準備好或還需要時間，都能自然地回答店員。',surpriseLabel:'你可能會這樣說…',steps:readySteps,questions:readyQuestions,takeaways:["We're ready to order.",'We need a few more minutes.'],completionTitle:'你可以自然地告訴店員是否準備好點餐了！'}),
 lesson({id:'club',number:5,slug:'club-sandwich',titleZh:'公司三文治',titleEn:'club sandwich',heading:'公司三文治，club!',summary:'避開 company sandwich，並練習點餐與選配菜。',surpriseLabel:'你可能會這樣說…',steps:clubSteps,questions:clubQuestions,takeaways:['Can I get a club sandwich?','What would you like on the side?','Fries, please.'],completionTitle:'你可以自然地點一份公司三文治了！'}),
 lesson({id:'dressing',number:6,slug:'salad-dressing',titleZh:'沙律醬',titleEn:'salad dressing',heading:'沙律醬，dressing!',summary:'學會 salad dressing 與 on the side，在餐廳清楚說出需要。',surpriseLabel:'你可能會這樣說…',steps:dressingSteps,questions:dressingQuestions,takeaways:['What salad dressing do you have?','Can I get the dressing on the side?','Can I get some extra dressing?'],completionTitle:'你可以自然地問沙律醬和要求另外放了！'})
];
export const moduleMap=new Map(modules.map(m=>[m.id,m]));
export const allQuestionMap=new Map(modules.flatMap(m=>m.questions.map(q=>[q.id,q])));
export const normalise=s=>String(s??'').trim().toLowerCase().replace(/[’]/g,"'").replace(/[.!?]+$/,'').trim().replace(/\s+/g,' ');
export const correct=(q,value)=>q.answers.some(a=>normalise(a)===normalise(value));
export const hkDate=at=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Hong_Kong',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(at));
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function moduleEvents(events,moduleId){return events.filter(e=>e.module===moduleId||moduleId==='scoop'&&!e.module);}
export function latestRun(events,moduleId){return moduleEvents(events,moduleId).filter(e=>e.kind==='start').sort((a,b)=>a.at.localeCompare(b.at)||a.id.localeCompare(b.id)).at(-1)?.run;}
export function completed(events,run,module){return new Set(moduleEvents(events,module.id).filter(e=>e.kind==='answer'&&e.run===run&&module.questionMap.has(e.question)&&correct(module.questionMap.get(e.question),e.choice)).map(e=>e.question));}
export function daily(events){const map=new Map(),seen=new Set();for(const e of [...events].sort((a,b)=>a.at.localeCompare(b.at))){const q=allQuestionMap.get(e.question);if(e.kind!=='answer'||!q||!correct(q,e.choice)||seen.has((e.module||'scoop')+':'+e.run+':'+e.question))continue;seen.add((e.module||'scoop')+':'+e.run+':'+e.question);const date=hkDate(e.at);map.set(date,(map.get(date)||0)+1);}return map;}
