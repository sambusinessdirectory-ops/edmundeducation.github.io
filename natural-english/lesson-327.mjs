import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-327-v2-audio','audio','只聽這句話。退款目前是哪個狀態？',
    ['還在處理中，未顯示為完成。','商家從未同意退款。','款項已經必定到帳。','原購買交易從未發生。'],
    '還在處理中，未顯示為完成。','The refund is pending 只說退款尚在處理；它不是「已完成」，也不必然表示商家沒有發起。'),
  mc('native-327-v2-detail','detail','商家說昨天已提交退款，但你今天帳戶仍未見到入帳。哪句既描述現況又不亂猜原因？',
    ["The refund is still pending.","The merchant definitely lied to me.","The refund was never requested.","The bank has already completed it."],
    "The refund is still pending.",'pending 描述你看到的處理狀態；要了解原因或時間，仍應向相關機構查詢。'),
  mc('native-327-v2-reverse','reverse','The payment is pending 和 The refund is pending 哪個差別最重要？',
    ['前者是付款處理中，後者是退回款項處理中。','兩句都表示銀行已把卡永久停用。','前者必然是欺詐，後者必然是現金。','兩句都表示交易已完全取消。'],
    '前者是付款處理中，後者是退回款項處理中。','pending 都是尚未完成處理，但 payment 與 refund 的資金方向和交易目的不同。'),
  mc('native-327-v2-transfer','transfer','在網購平台看到退款狀態 pending。哪句問客服的話最有用，又沒有假定處理時間？',
    ['Could you tell me the current status of the refund?','Can you confirm the refund reached my account yesterday?','Why did you cancel the refund without telling me?','Can I use this refund as cash right now?'],
    'Could you tell me the current status of the refund?','先詢問當前狀態；pending 本身不足以證明已到帳、已取消或可立即使用。'),
  open('native-327-v2-final','final','最後挑戰：網店已通知退款發起，但銀行帳戶仍未顯示到帳。你聯絡客服時，用兩句英文說明退款仍在處理，並詢問能否查看最新狀態。',
    ["The refund still shows as pending in my account. Could you check its current status?","I was told the refund had been initiated, but it's still pending. Is there an update?","The refund hasn't appeared as completed yet. Could you tell me where it stands?"],
    '只描述可確認的 pending 狀態，並詢問最新資訊；不要因未到帳便自行斷定商家或銀行出錯。')
];
const steps=[
  {id:'native-327-v2-audio',style:'audio',label:'聽出狀態',title:'退款仍在路上',intro:'先只聽一句處理進度。',model:'The refund is pending.',zh:'退款仍在處理中。',audioOnly:true,questions:['native-327-v2-audio']},
  {id:'native-327-v2-detail',style:'detail',label:'看得見的事',title:'商家已提交，帳戶未到',intro:'把觀察與猜測分開。',questions:['native-327-v2-detail']},
  {id:'native-327-v2-reverse',style:'reverse',label:'資金方向',title:'付款與退款都可 pending',intro:'分辨交易的方向。',questions:['native-327-v2-reverse']},
  {id:'native-327-v2-transfer',style:'transfer',label:'換到網購',title:'查詢處理狀態',intro:'選一個不過度推斷的客服問題。',questions:['native-327-v2-transfer']},
  {id:'native-327-v2-speak',style:'speak',label:'口頭對照',title:'這次是付款在處理',intro:'先自己說；錄音或跳過後才聽示範。',model:'The payment is pending.',zh:'付款仍在處理中。',speakingPrompt:'客服問你現在看到的是付款還是退款狀態；這次是付款仍顯示待處理。',recording:'phrase',questions:[]},
  {id:'native-327-v2-final',style:'final',label:'客服挑戰',title:'退款到了哪一步？',intro:'自己說明現況並查詢。',questions:['native-327-v2-final']}
];
export default {revision:2,summary:'用 pending 描述退款尚在處理，分清付款與退款，並向客服查詢狀態。',steps,questions,takeaways:['The refund is pending.','The payment is pending.'],completionTitle:'你能準確說出退款仍在處理，並問清最新進度。'};
