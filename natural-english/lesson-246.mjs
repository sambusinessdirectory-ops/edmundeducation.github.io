import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-246-v2-audio","audio","聽到這句，最可能發生甚麼？",["扣子突然脫離衣服。", "扣子仍在但稍鬆。", "扣子剛縫得更牢。", "拉鍊卡住不動。"],"扣子突然脫離衣服。","popped off 描述扣子一下子掉離衣物，和 loose 的仍掛着不同。"),
  mc("native-246-v2-rewrite","rewrite","你彎腰時襯衫扣子彈到地上。哪句最準確？",["One of my buttons popped off.", "One of my buttons is loose.", "The zipper is stuck.", "The shirt keeps riding up."],"One of my buttons popped off.","扣子已離開衣服並掉到地上，所以用 popped off 而非 is loose。"),
  mc("native-246-v2-tone","tone","扣子掉在辦公室地上，你想請同事幫忙看。哪句最得體？",["A button popped off my shirt. Could you help me look for it?", "Look under the desk; I need that button.", "I think a button fell, but I’m not sure where.", "The button is loose, but I’ll look for it later."],"A button popped off my shirt. Could you help me look for it?","先交代扣子已從襯衫掉下，再禮貌地請同事一起看看地面。"),
  mc("native-246-v2-reverse","reverse","地上躺着你的扣子，衣服原位只剩線頭。哪句對應這個結果？",["The button popped off.", "The button is a little loose.", "The button is sewn on tightly.", "The button might fall later."],"The button popped off.","扣子已整顆脫落，popped off 用過去式報告事件。"),
  mc("native-246-v2-contrast","contrast","昨晚扣子還掛着、很晃；今天穿衣時掉了。哪個順序正確？",["It was loose, then it popped off.", "It popped off, then it became loose on the shirt.", "It was tight, then it became loose.", "It was missing, then it was sewn back on."],"It was loose, then it popped off.","loose 是掉之前的鬆動，popped off 是最後整顆脫落。"),
  {id:"native-246-v2-final",type:'open',style:"final",prompt:"新的情境：在餐廳穿外套時，一顆扣子突然掉下，你看到它滾到桌下。寫一兩句英文告訴朋友發生甚麼，並請他幫你找。",answers:["A button popped off my coat. Could you help me look under the table?", "One of my coat buttons popped off and rolled under the table. Can you help me find it?", "My button came off when I put on my coat. Please help me check under the table."],explanation:"用 popped off 或 came off 說扣子已掉，並指出桌下的位置。"}
];

const steps=[
  {"id": "native-246-v2-audio", "style": "audio", "label": "先聽結果", "title": "扣子在哪裏？", "intro": "先聽句子，再判斷扣子的狀態。", "model": "The button popped off.", "zh": "扣子整顆掉下來了。", "audioOnly": true, "questions": ["native-246-v2-audio"]},
  {"id": "native-246-v2-rewrite", "style": "rewrite", "label": "具體描述", "title": "不是快掉，是已掉", "intro": "依目前狀態選句。", "questions": ["native-246-v2-rewrite"]},
  {"id": "native-246-v2-tone", "style": "tone", "label": "求助語氣", "title": "找回扣子", "intro": "比較自然請求。", "questions": ["native-246-v2-tone"]},
  {"id": "native-246-v2-reverse", "style": "reverse", "label": "由結果反推", "title": "地上的扣子", "intro": "分辨已發生和將發生。", "questions": ["native-246-v2-reverse"]},
  {"id": "native-246-v2-contrast", "style": "contrast", "label": "前後對照", "title": "鬆了再掉", "intro": "用兩種狀態說時間順序。", "questions": ["native-246-v2-contrast"]},
  {"id": "native-246-v2-final", "style": "final", "label": "新場合自寫", "title": "餐廳外套扣子", "intro": "自己寫事件和請求，再按示例自評。", "questions": ["native-246-v2-final"]}
];

export default {revision:2,summary:"用 The button popped off. 描述衣服扣子突然整顆脫落，並與 loose 的未掉狀態區分。",steps,questions,takeaways:["The button popped off.", "The button came off."],completionTitle:"你能指出扣子已整顆掉下，並在新情境請人幫忙找回。"};
