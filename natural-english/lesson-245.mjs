import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-245-v2-audio","audio","撕走貼紙後聽到這句，桌面最可能怎樣？",["貼紙沒了，但仍有黏膠。", "貼紙和黏膠都完全沒有。", "貼紙紙面撕碎了，但膠仍貼在桌上。", "桌面只有一圈水痕，摸起來不黏。"],"貼紙沒了，但仍有黏膠。","residue 是去除物件後留下的東西；sticky 指摸起來黏。"),
  mc("native-245-v2-detail","detail","哪項細節最支持 It left a sticky residue？",["標籤已撕走，手摸瓶身仍黏。", "標籤仍完整貼在瓶身。", "瓶身只是有水滴。", "瓶身只有印刷文字，摸起來平滑。"],"標籤已撕走，手摸瓶身仍黏。","原物已去除而黏膠留在表面，才是 sticky residue。"),
  mc("native-245-v2-rewrite","rewrite","玻璃罐的價格貼紙已撕下，但膠仍黏手。哪句最準？",["The sticker left a sticky residue.", "The sticker is still on the jar.", "The jar has a water ring but isn’t sticky.", "The label tore, but the glue came away cleanly."],"The sticker left a sticky residue.","sticker 已被撕掉，現在要說的是它留下的黏膠。"),
  mc("native-245-v2-contrast","contrast","貼紙撕後留下的是摸起來黏的膠，而不是墨水擦花。哪個詞最貼切？",["sticky residue", "ink smudge", "water stain", "paint bubble"],"sticky residue","黏膠殘留屬 sticky residue；ink smudge 是墨痕。"),
  mc("native-245-v2-transfer","transfer","書封上的促銷貼紙撕掉後留下黏膠。哪句自然？",["It left a sticky residue on the cover.", "It left a scratch on the cover.", "The price label is still attached to the cover.", "The cover is torn at the corner."],"It left a sticky residue on the cover.","on the cover 指黏膠留在書封，概念與玻璃罐相同。"),
  {id:"native-245-v2-final",type:'open',style:"final",prompt:"新的情境：你撕掉禮盒上的售價貼紙，盒面仍黏黏的。寫一兩句英文告訴朋友問題，並說你會先清理才送出。",answers:["The price sticker left a sticky residue. I’ll clean the box before giving it away.", "There’s sticky residue on the gift box after I removed the label. I’ll wipe it off.", "The sticker came off, but it left sticky residue. I’ll clean the box first."],explanation:"先說貼紙留下的 sticky residue，再說清理以免送禮時盒面黏。"}
];

const steps=[
  {"id": "native-245-v2-audio", "style": "audio", "label": "先聽殘留", "title": "貼紙撕乾淨嗎？", "intro": "先聽句子，再判斷表面。", "model": "It left a sticky residue.", "zh": "它留下黏黏的殘留物。", "audioOnly": true, "questions": ["native-245-v2-audio"]},
  {"id": "native-245-v2-detail", "style": "detail", "label": "抓時間順序", "title": "甚麼被留下？", "intro": "分清撕貼紙前後。", "questions": ["native-245-v2-detail"]},
  {"id": "native-245-v2-rewrite", "style": "rewrite", "label": "說得精確", "title": "不是標籤還在", "intro": "把觀察寫成一句話。", "questions": ["native-245-v2-rewrite"]},
  {"id": "native-245-v2-contrast", "style": "contrast", "label": "殘留與污漬", "title": "摸起來有黏性", "intro": "比較表面問題。", "questions": ["native-245-v2-contrast"]},
  {"id": "native-245-v2-transfer", "style": "transfer", "label": "換到書封", "title": "另一種貼紙", "intro": "把說法用到新物件。", "questions": ["native-245-v2-transfer"]},
  {"id": "native-245-v2-final", "style": "final", "label": "新禮物自寫", "title": "清理禮盒表面", "intro": "先寫現象和處理，再看示例。", "questions": ["native-245-v2-final"]}
];

export default {revision:2,summary:"用 sticky residue 描述撕走貼紙後表面仍留着黏膠，而非貼紙仍在。",steps,questions,takeaways:["It left a sticky residue.", "There’s some sticky residue left."],completionTitle:"你能指出貼紙已撕走但黏膠殘留，並在新物件上使用說法。"};
