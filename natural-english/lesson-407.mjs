import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-407-v2-audio","audio","聽到這句，褲襪最可能怎樣？",["有一條沿布料延伸的破線。", "只有一個可擦掉的污點。", "布料被椅角勾出一個小點但未延伸。", "顏色在陽光下變淡。"],"有一條沿布料延伸的破線。","run 在褲襪語境是被勾後延伸的長破線，不是跑步。"),
  mc("native-407-v2-transfer","transfer","一雙薄尼龍長襪被指甲勾出向下延伸的破線。哪句可用？",["There’s a run in my stockings.", "There’s a stain on my stockings.", "The stockings have faded in the sun.", "The stockings have a small hole but no long line."],"There’s a run in my stockings.","stockings 也屬薄彈性布料，勾出的長破線可叫 a run。"),
  mc("native-407-v2-branch","branch","朋友說 You’ve got a run in your tights. 你剛從粗糙椅邊起身。哪句最合理？",["I must have snagged them on the chair.", "They became shorter in the wash.", "The color has faded in sunlight.", "The waistband is too loose."],"I must have snagged them on the chair.","snagged 指被椅角勾住；這可能是長破線形成的原因。"),
  mc("native-407-v2-tone","tone","朋友褲襪後側出現長破線，哪句較體貼？",["Just so you know, there’s a run in your tights.", "Everyone look at that tear in her tights!", "Your clothes are always a mess.", "I won’t tell you what happened."],"Just so you know, there’s a run in your tights.","Just so you know 是輕聲提醒，避免在眾人面前令朋友尷尬。"),
  {id:"native-407-v2-final",type:'open',style:"final",prompt:"新的情境：婚禮上你的褲襪被手袋金屬扣勾住，腿側出現一條向下延伸的破線。寫一兩句英文告訴朋友破損情況和可能原因。",answers:["There’s a run in my tights. I think the clasp on my bag snagged them.", "My bag clasp caught my tights, and now there’s a run down the side.", "I snagged my tights on the metal clasp and got a long run in them."],explanation:"a run 是沿褲襪延伸的破線；手袋金屬扣是這個新場景中勾破的原因。"}
];

const steps=[
  {"id": "native-407-v2-audio", "style": "audio", "label": "先聽破損", "title": "褲襪哪裏壞？", "intro": "先聽句子，再想像破損形狀。", "model": "There’s a run in my tights.", "zh": "我的褲襪有一條長破線。", "audioOnly": true, "questions": ["native-407-v2-audio"]},
  {"id": "native-407-v2-transfer", "style": "transfer", "label": "換到長襪", "title": "薄布料也會抽線", "intro": "把破線概念用在另一物件。", "questions": ["native-407-v2-transfer"]},
  {"id": "native-407-v2-branch", "style": "branch", "label": "找原因", "title": "椅角勾到了", "intro": "接續朋友的觀察。", "questions": ["native-407-v2-branch"]},
  {"id": "native-407-v2-tone", "style": "tone", "label": "提醒朋友", "title": "輕聲指出問題", "intro": "比較私下提醒語氣。", "questions": ["native-407-v2-tone"]},
  {"id": "native-407-v2-final", "style": "final", "label": "新活動自寫", "title": "椅邊勾破褲襪", "intro": "自己寫破損和原因，再看示例。", "questions": ["native-407-v2-final"]}
];

export default {revision:2,summary:"用 a run in my tights 描述褲襪被勾後延伸的長破線，而非普通污漬。",steps,questions,takeaways:["There’s a run in my tights.", "My tights got snagged on the chair."],completionTitle:"你能說明褲襪勾出長破線的結果及可能原因。"};
