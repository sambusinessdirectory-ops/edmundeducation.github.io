import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-185-v2-audio","audio","說話者最可能面對甚麼情況？",["團隊有新安排，但他沒收到消息。", "他一直收到所有進度更新。", "他正在等同事把新安排告訴他。", "他已收到新時間並通知了團隊。"],"團隊有新安排，但他沒收到消息。","out of the loop 形容自己未獲告知，所以跟不上進展。"),
  mc("native-185-v2-rewrite","rewrite","你錯過了兩次團隊討論，現在不知道時程為何改了。哪句最貼切？",["I’m out of the loop.", "I’ve been included in every update.", "I’ll keep the whole team updated.", "I know the new timeline."],"I’m out of the loop.","out of the loop 表示沒有跟上相關討論和更新。"),
  mc("native-185-v2-continue","continue","同事問 Did you hear we changed the launch date? 你完全沒聽過，哪句回應最自然？",["No, I’m out of the loop. What changed?", "No, I heard the new date this morning.", "No, I know it changed but not when.", "Yes, but I don’t know the details yet."],"No, I’m out of the loop. What changed?","先說自己沒收到消息，再問改了甚麼，讓同事能補上資訊。"),
  mc("native-185-v2-branch","branch","你說 I’m out of the loop. 同事回 I can fill you in. 他接下來最可能做甚麼？",["向你解釋最近的變動。", "把變動的通知再轉寄給其他同事。", "等正式公告才談細節。", "只告訴你最終日期，不說背景。"],"向你解釋最近的變動。","fill someone in 是把缺少的背景或新消息告訴他，正好補救 out of the loop。"),
  mc("native-185-v2-tone","tone","你沒有收到新時程，想禮貌地問同事。哪句聽起來最合作？",["I’m a bit out of the loop. Could you catch me up?", "Why did nobody send me the new timeline?", "I saw the announcement, so I think I have the details.", "Send me every message your team exchanged."],"I’m a bit out of the loop. Could you catch me up?","a bit 緩和語氣，Could you catch me up? 清楚請求補充，沒有指責對方。"),
  {id:"native-185-v2-final",type:'open',style:"final",prompt:"新的情境：你請假兩天，回來發現活動流程變了。寫一兩句英文訊息給同事，說你沒掌握最新情況，並請他簡單告訴你改了甚麼。",answers:["I’m out of the loop after being away. Could you fill me in on the changes?", "I was away for two days, so I’m out of the loop. What changed in the event plan?", "I’m a bit out of the loop. Could you give me a quick update on the new plan?"],explanation:"I’m out of the loop 說明資訊落差；再明確請對方補上活動流程的新變動。"}
];

const steps=[
  {"id": "native-185-v2-audio", "style": "audio", "label": "聽出狀態", "title": "誰沒有收到消息？", "intro": "先聽一句英文，再判斷說話者的處境。", "model": "I’m out of the loop.", "zh": "我沒掌握最新情況。", "audioOnly": true, "questions": ["native-185-v2-audio"]},
  {"id": "native-185-v2-rewrite", "style": "rewrite", "label": "改寫意思", "title": "消息跟不上", "intro": "找一句準確而自然的說法。", "questions": ["native-185-v2-rewrite"]},
  {"id": "native-185-v2-continue", "style": "continue", "label": "接住同事的話", "title": "先請人補充", "intro": "對方提到你不知道的新安排。", "questions": ["native-185-v2-continue"]},
  {"id": "native-185-v2-branch", "style": "branch", "label": "選下一步", "title": "補回缺少的資訊", "intro": "從對話目的選合適分支。", "questions": ["native-185-v2-branch"]},
  {"id": "native-185-v2-tone", "style": "tone", "label": "語氣判斷", "title": "坦白而不責怪", "intro": "挑選適合團隊溝通的語氣。", "questions": ["native-185-v2-tone"]},
  {"id": "native-185-v2-final", "style": "final", "label": "自寫求助訊息", "title": "新項目中的資訊落差", "intro": "在新場景寫出狀態和請求，再自評。", "questions": ["native-185-v2-final"]}
];

export default {revision:2,summary:"用 I’m out of the loop. 表示自己未收到更新、跟不上進展，並能請人補充。",steps,questions,takeaways:["I’m out of the loop.", "Keep me in the loop."],completionTitle:"你能坦白說自己未掌握最新狀況，並自然請人補上資訊。"};
