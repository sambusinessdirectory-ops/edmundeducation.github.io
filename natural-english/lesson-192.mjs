import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-192-v2-audio","audio","說話者想確認甚麼？",["這張椅子是否已有人使用。", "旁邊的人是否在等同伴來坐。", "這排座位是否可以讓客人使用。", "旁邊的袋子是否有人照看。"],"這張椅子是否已有人使用。","taken 在座位情境表示已有使用者或已被預留。"),
  mc("native-192-v2-rewrite","rewrite","咖啡店只剩一張空椅，旁邊有人。哪句最自然？",["Excuse me, is this seat taken?", "Excuse me, could you move your bag?", "Does this seat belong to your friend?", "Can I move this chair to another table?"],"Excuse me, is this seat taken?","先用 Excuse me 引起注意，再問座位是否有人，禮貌而清楚。"),
  mc("native-192-v2-tone","tone","同一張空椅旁有陌生人，哪句最得體？",["Excuse me, is this seat taken?", "Could you move your bag? I’d like that seat.", "I’m sitting here, whether it’s free or not.", "Would you mind giving me your seat?"],"Excuse me, is this seat taken?","Excuse me 加問句讓對方有機會解釋座位是否有人，適合陌生人。"),
  mc("native-192-v2-reverse","reverse","你問 Is this seat taken? 對方說 No, it’s free. 你應怎樣理解？",["座位沒有人，可以坐。", "這個座位可以免費預約。", "座位已有人預留。", "旁邊的位子仍有人正在使用。"],"座位沒有人，可以坐。","在這段對話中 free 表示空着、可使用；對方同意你使用這個位子，不是在說座位售價。"),
  {id:"native-192-v2-final",type:'open',style:"final",prompt:"新的情境：車站候車區滿座，你看到一個空位，旁邊放着陌生人的袋子。寫一句禮貌英文，確認座位是否有人坐。",answers:["Excuse me, is this seat taken?", "Sorry, is anyone sitting here?", "Excuse me, is someone using this seat?"],explanation:"先問是否有人使用座位，尤其旁邊有物品時不要直接坐下。"}
];

const steps=[
  {"id": "native-192-v2-audio", "style": "audio", "label": "聽出問題", "title": "問的是哪件事？", "intro": "先聽問句，再選它的目的。", "model": "Is this seat taken?", "zh": "這個座位有人坐嗎？", "audioOnly": true, "questions": ["native-192-v2-audio"]},
  {"id": "native-192-v2-rewrite", "style": "rewrite", "label": "重寫問法", "title": "先問再坐", "intro": "把直接坐下改成詢問。", "questions": ["native-192-v2-rewrite"]},
  {"id": "native-192-v2-speak", "style": "speak", "label": "口頭詢問", "title": "開口問座位", "intro": "先自己說；錄音或跳過後再聽示範。", "model": "Is this seat taken?", "zh": "這個座位有人坐嗎？", "speakingPrompt": "在咖啡店看到陌生人旁邊的空位，禮貌開口詢問。", "recording": "phrase", "questions": []},
  {"id": "native-192-v2-tone", "style": "tone", "label": "語氣比較", "title": "問陌生人怎樣開口", "intro": "比較四種問法的禮貌程度。", "questions": ["native-192-v2-tone"]},
  {"id": "native-192-v2-reverse", "style": "reverse", "label": "回答反推", "title": "free 是空着的", "intro": "從回答推斷是否能坐。", "questions": ["native-192-v2-reverse"]},
  {"id": "native-192-v2-final", "style": "final", "label": "車站自寫", "title": "問陌生人空位", "intro": "在新情境自己寫問句，再自評。", "questions": ["native-192-v2-final"]}
];

export default {revision:2,summary:"用 Is this seat taken? 禮貌確認空位是否有人使用，並分清回答 free 的意思。",steps,questions,takeaways:["Is this seat taken?", "No, it’s free."],completionTitle:"你能禮貌詢問陌生人旁邊的座位是否有人。"};
