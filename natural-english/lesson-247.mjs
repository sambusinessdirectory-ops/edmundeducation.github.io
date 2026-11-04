import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-247-v2-audio","audio","聽到這句，你首先知道甚麼？",["牛奶有酸味。", "牛奶聞起來正常，但日期快到期。", "牛奶看起來結塊，但沒有聞過。", "牛奶喝起來酸，但未確認氣味。"],"牛奶有酸味。","smells sour 只直接說明聞到的氣味；是否變壞可再判斷。"),
  mc("native-247-v2-rewrite","rewrite","你剛打開牛奶盒，聞到酸味，但未做其他檢查。哪句最準確？",["The milk smells sour.", "The milk is definitely safe.", "The milk is fresh because it’s white.", "The milk has no smell at all."],"The milk smells sour.","這句準確描述已聞到的酸味，避免沒根據地說牛奶安全。"),
  mc("native-247-v2-contrast","contrast","The milk smells sour 和 The milk has gone sour 有何差別？",["前句報告酸味；後句說牛奶已變酸。", "前句和後句都只描述牛奶的顏色。", "前句已確定牛奶變壞；後句只報告氣味。", "前句說味道酸；後句說聞起來酸。"],"前句報告酸味；後句說牛奶已變酸。","smells sour 聚焦嗅覺證據；has gone sour 表示牛奶狀態已變酸。"),
  mc("native-247-v2-explain","explain","你沒有試飲，只是把牛奶盒靠近鼻子。應選哪句？",["The milk smells sour.", "The milk tastes sour.", "The milk looks curdled.", "The milk feels warm."],"The milk smells sour.","鼻子察覺氣味，用 smells；tastes 需實際嘗過。"),
  {id:"native-247-v2-final",type:'open',style:"final",prompt:"新的情境：早餐時你打開冰箱裏的牛奶，聞到酸味，原本想倒進麥片。寫一兩句英文告訴家人你聞到甚麼，以及你決定先不使用它。",answers:["The milk smells sour. I’m not going to put it on my cereal.", "This milk smells sour, so I’d rather not use it for breakfast.", "I think the milk has gone sour; it smells off. Let’s not use it."],explanation:"先報告 smells sour 的氣味，再說暫時不使用，避免把可能變壞的牛奶倒進食物。"}
];

const steps=[
  {"id": "native-247-v2-audio", "style": "audio", "label": "先聽氣味", "title": "牛奶還能喝嗎？", "intro": "先聽句子，再想像剛打開牛奶盒。", "model": "The milk smells sour.", "zh": "牛奶聞起來酸酸的。", "audioOnly": true, "questions": ["native-247-v2-audio"]},
  {"id": "native-247-v2-rewrite", "style": "rewrite", "label": "準確報告", "title": "先說可聞到的", "intro": "區分觀察和推斷。", "questions": ["native-247-v2-rewrite"]},
  {"id": "native-247-v2-contrast", "style": "contrast", "label": "氣味與狀態", "title": "sour 的兩種用法", "intro": "比較 smell 和 gone。", "questions": ["native-247-v2-contrast"]},
  {"id": "native-247-v2-explain", "style": "explain", "label": "理解用詞", "title": "為何用 smells？", "intro": "由感官選動詞。", "questions": ["native-247-v2-explain"]},
  {"id": "native-247-v2-final", "style": "final", "label": "新早餐自寫", "title": "不倒進麥片", "intro": "先寫觀察與決定，再按示例自評。", "questions": ["native-247-v2-final"]}
];

export default {revision:2,summary:"用 The milk smells sour. 表示牛奶聞起來有酸味，並審慎推斷可能變壞。",steps,questions,takeaways:["The milk smells sour.", "The milk has gone sour."],completionTitle:"你能描述牛奶的酸味，並在新情境說明為何先不喝。"};
