import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-321-v2-audio','audio','只聽飯店職員的短句。你現在知道甚麼？',
    ['房間暫時未能交給你入住。','預訂已被取消。','飯店完全沒有你的預訂。','你必須立即退房。'],
    '房間暫時未能交給你入住。','The room isn’t ready yet 只說現在還未準備好；不代表預訂取消或完全沒有房間。'),
  mc('native-321-v2-reverse','reverse','The room hasn’t been cleaned yet。怎樣轉述才最準確？',
    ['房間尚未清潔好。','房間已清潔完但沒鑰匙。','房間完全沒有被預訂。','房間設備一定壞了。'],
    '房間尚未清潔好。','這句具體指出清潔進度；The room isn’t ready yet 較廣，可以有別的原因。'),
  mc('native-321-v2-explain','explain','The room isn’t ready yet 與 The room hasn’t been cleaned yet 有甚麼差別？',
    ['前者說未能入住；後者明確說清潔尚未完成。','兩句都表示飯店拒絕你的預訂。','前者表示已退房；後者表示已結帳。','兩句都保證十分鐘後可入住。'],
    '前者說未能入住；後者明確說清潔尚未完成。','ready 描述整體可否交房；cleaned 指一項具體準備工作。不要把未說出的原因當成事實。'),
  mc('native-321-v2-scene','scene','你提早到飯店，櫃台只說房間還未準備好，沒有解釋原因。向同行朋友怎樣轉述？',
    ["Our room isn't ready yet. I'll ask when we can check in.","They lost our reservation. We need to leave.","The room is definitely still being cleaned.","Our room is ready, but we can't find it."],
    "Our room isn't ready yet. I'll ask when we can check in.",'先轉述已知的「未準備好」，再問預計時間；不要猜預訂或清潔狀況。'),
  open('native-321-v2-final','final','最後挑戰：你上午十一點到飯店，房間仍未準備好，櫃台未說明原因。你想知道大概還要等多久。用兩句英文向職員確認現況並問等候時間。',
    ["I understand the room isn't ready yet. Do you know roughly how long it will be?","Is my room still not ready? Could you tell me when I might be able to check in?","Okay, the room isn't ready yet. Do you have an estimated check-in time?"],
    '只根據已知狀況提問；詢問預估時間，不自行斷定房間仍在清潔。')
];
const steps=[
  {id:'native-321-v2-audio',style:'audio',label:'聽出現況',title:'提早到飯店',intro:'先只聽職員一句話。',model:'The room isn’t ready yet.',zh:'房間還未準備好。',audioOnly:true,questions:['native-321-v2-audio']},
  {id:'native-321-v2-reverse',style:'reverse',label:'轉述具體原因',title:'清潔還沒完成',intro:'看看第二種說法多了甚麼資訊。',questions:['native-321-v2-reverse']},
  {id:'native-321-v2-explain',style:'explain',label:'區分範圍',title:'未準備好 ≠ 一定未清潔',intro:'分清整體狀態和一項具體工作。',questions:['native-321-v2-explain']},
  {id:'native-321-v2-scene',style:'scene',label:'告訴同行者',title:'只報告已知的事',intro:'別猜飯店沒說出的原因。',questions:['native-321-v2-scene']},
  {id:'native-321-v2-final',style:'final',label:'櫃台挑戰',title:'問等候時間',intro:'自行有禮提問，沒有選項。',questions:['native-321-v2-final']}
];
export default {revision:2,summary:'分清 room isn’t ready 與 hasn’t been cleaned，並向飯店詢問可入住的預計時間。',steps,questions,takeaways:['The room isn’t ready yet.','The room hasn’t been cleaned yet.'],completionTitle:'你能準確轉述房間狀態，也會問清還要等多久。'};
