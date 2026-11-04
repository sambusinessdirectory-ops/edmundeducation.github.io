import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-184-v2-audio","audio","說話者最希望對方做甚麼？",["日後有進展時告訴他。", "請他自己立即致電客戶。", "讓他把你加入每一通客戶電話。", "只在整個項目完成後告訴他。"],"日後有進展時告訴他。","keep someone in the loop 是讓人持續知道相關消息。"),
  mc("native-184-v2-transfer","transfer","同事會去問供應商交貨日期，你想知道任何新消息。哪句最自然？",["Keep me in the loop.", "I’ll contact the supplier myself.", "Tell me only when the order is final.", "I already have the latest details."],"Keep me in the loop.","你希望在供應商有回覆時收到更新；這正是 keep me in the loop 的用途。"),
  mc("native-184-v2-continue","continue","同事說 I’ll ask the design team why the file changed. 你想知道結果，怎樣接最合適？",["Thanks. Keep me in the loop.", "Thanks. I’ll fill you in after your call.", "Thanks. Please leave me out of the update.", "Thanks. Let’s cancel the design review instead."],"Thanks. Keep me in the loop.","同事會先去查，你希望查到結果後再告訴你；先致謝再請他更新。"),
  {id:"native-184-v2-final",type:'open',style:"final",prompt:"新的情境：同學會聯絡活動場地，你不會參與電話，但需要知道場地是否訂到。寫一兩句英文，請他有進展便通知你。",answers:["Please keep me in the loop about the venue booking.", "Thanks for calling the venue. Keep me in the loop when you hear back.", "Could you keep me in the loop about whether the venue is available?"],explanation:"keep me in the loop 後可加 about 說明事情；你需要的是之後的更新。"}
];

const steps=[
  {"id": "native-184-v2-audio", "style": "audio", "label": "聽出請求", "title": "別漏了通知我", "intro": "先聽英文，判斷說話者想得到甚麼。", "model": "Keep me in the loop.", "zh": "有新進展記得告訴我。", "audioOnly": true, "questions": ["native-184-v2-audio"]},
  {"id": "native-184-v2-transfer", "style": "transfer", "label": "換個項目", "title": "訊息更新也適用", "intro": "把表達轉到另一個工作場景。", "questions": ["native-184-v2-transfer"]},
  {"id": "native-184-v2-continue", "style": "continue", "label": "接續對話", "title": "同事去查原因", "intro": "接上同事的安排。", "questions": ["native-184-v2-continue"]},
  {"id": "native-184-v2-speak", "style": "speak", "label": "口頭跟進", "title": "先自己請求更新", "intro": "先說出口；錄音或跳過後才聽示範。", "model": "Keep me in the loop.", "zh": "有新消息記得告訴我。", "speakingPrompt": "同事明天跟客戶談價錢；請他之後告知進展。", "recording": "phrase", "questions": []},
  {"id": "native-184-v2-final", "style": "final", "label": "新場景寫訊息", "title": "追蹤場地安排", "intro": "自己寫一則簡短訊息，再看例句自評。", "questions": ["native-184-v2-final"]}
];

export default {revision:2,summary:"用 Keep me in the loop. 請同事在事情有新進展時持續告知。",steps,questions,takeaways:["Keep me in the loop.", "Keep me posted."],completionTitle:"你能在不直接處理每個細節時，請同事持續告知進展。"};
