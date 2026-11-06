import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-322-v2-audio','audio','只聽這句話。餐廳候位進度如何？',
    ['現在可以去入座。','剛加入候位名單。','餐廳已關門。','桌子仍要等一小時。'],
    '現在可以去入座。','Our table is ready 表示輪到你們的桌位已準備好，應留意職員指示入座。'),
  mc('native-322-v2-detail','detail','They just called us. Our table is ready。第一句多交代了甚麼？',
    ['店員剛叫到你們。','店員剛取消預訂。','你們已經吃完。','你們剛打電話給店員。'],
    '店員剛叫到你們。','在候位情境，called us 指餐廳剛叫到你們的名字或號碼；不是你們打電話。'),
  mc('native-322-v2-branch','branch','職員叫 Alex? Your table is ready，而 Alex 是你訂位時用的名字。怎樣回應？',
    ["That's us. Thank you.","I'm still deciding whether to join the waitlist.","Please cancel the table we just got.","I called you on the phone yesterday."],
    "That's us. Thank you.",'確認被叫到的是你們，再按職員指示入座；不用重新加入候位名單。'),
  mc('native-322-v2-continue','continue','你告訴同行朋友 Our table is ready。接下來哪個動作最合理？',
    ['帶齊隨身物品，跟著職員去桌位。','繼續排在新候位隊伍最後。','先到別家餐廳重新排隊。','假設餐廳叫的是另一位同名客人而不確認。'],
    '帶齊隨身物品，跟著職員去桌位。','輪到入座時帶齊物品前往桌位；如果同名有歧義，先與職員確認。'),
  mc('native-322-v2-explain','explain','在這個情境，Our table is ready 中的 table 指甚麼？',
    ['餐廳安排給你們的座位。','你們剛買的一張桌子。','電話上的候位號碼。','已經吃完的餐點。'],
    '餐廳安排給你們的座位。','餐廳常用 table 指一組客人的座位安排，不是叫你搬一張家具。'),
  open('native-322-v2-final','final','最後挑戰：你和兩位朋友在餐廳等候，職員剛叫到你們登記的名字。你要向還在看手機的朋友報信。用兩句英文說明叫到你們，以及現在可以入座。',
    ["They just called us. Our table is ready.","That's our name they called. Our table is ready now.","The host just called our name. We can go to our table."],
    '交代「剛叫到」和「可入座」兩件事；別把叫名字誤說成打電話。')
];
const steps=[
  {id:'native-322-v2-audio',style:'audio',label:'聽出進度',title:'候位終於輪到你',intro:'留意候位是否已結束。',model:'Our table is ready.',zh:'我們的桌位準備好了。',audioOnly:true,questions:['native-322-v2-audio']},
  {id:'native-322-v2-detail',style:'detail',label:'抓住前一句',title:'店員剛叫到我們',intro:'看看完整消息比短句多了甚麼。',questions:['native-322-v2-detail']},
  {id:'native-322-v2-branch',style:'branch',label:'回應職員',title:'叫的是你的名字',intro:'自然確認並道謝。',questions:['native-322-v2-branch']},
  {id:'native-322-v2-explain',style:'explain',label:'餐廳用語',title:'table 不只是家具',intro:'按候位場景理解 table。',questions:['native-322-v2-explain']},
  {id:'native-322-v2-continue',style:'continue',label:'跟著入座',title:'輪到之後怎樣做',intro:'完成真實服務流程。',questions:['native-322-v2-continue']},
  {id:'native-322-v2-final',style:'final',label:'叫號挑戰',title:'告訴同行朋友',intro:'自己傳達兩個關鍵消息。',questions:['native-322-v2-final']}
];
export default {revision:2,summary:'聽懂餐廳叫到候位名字與桌位已準備好，並能自然回應職員、通知同行者。',steps,questions,takeaways:['Our table is ready.','They just called us. Our table is ready.'],completionTitle:'你能在餐廳叫到名字時準確告訴同伴並準備入座。'};
