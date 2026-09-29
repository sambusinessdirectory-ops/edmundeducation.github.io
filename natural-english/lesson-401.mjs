import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-401-v2-audio","audio","聽到這句，最可能發生甚麼？",["操作後機器沒有把卡吐回。", "卡已正常退回卡槽。", "顧客忘了把卡帶出家門。", "機器吐回卡，但顧客離開前忘了取走。"],"操作後機器沒有把卡吐回。","kept my card 指卡仍留在 ATM 裏；不是顧客忘記帶卡。"),
  mc("native-401-v2-contrast","contrast","你知道卡已插進提款機，但提款後沒退回。哪句比 I lost my card 更準？",["The ATM kept my card.", "I left my card at home.", "I gave my card to a cashier.", "My card expired last month."],"The ATM kept my card.","卡不是位置不明，而是 ATM 未退還，直接報告機器行為較準。"),
  mc("native-401-v2-rewrite","rewrite","向銀行提交事故表格時，The ATM kept my card. 可怎樣較正式地說？",["The ATM retained my card.", "The ATM charged my card twice.", "The ATM returned my card after the transaction.", "The ATM charged my account twice."],"The ATM retained my card.","retained my card 是較正式的同義說法，仍指機器把卡留在裏面。"),
  {id:"native-401-v2-final",type:'open',style:"final",prompt:"新的情境：你在銀行分行外的 ATM 查完餘額，卡沒有退回。寫一兩句英文告訴分行職員問題，並指出是哪部機器。",answers:["The ATM outside the branch kept my card after I checked my balance.", "The ATM by the front entrance retained my card. Could you help me?", "I used the ATM outside, and it didn’t return my card. Can you check it?"],explanation:"說清 ATM kept my card，再提供分行外或入口旁的位置，方便職員查核。"}
];

const steps=[
  {"id": "native-401-v2-audio", "style": "audio", "label": "先聽結果", "title": "卡去哪裏了？", "intro": "先聽句子，再判斷交易後狀態。", "model": "The ATM kept my card.", "zh": "提款機把我的卡留住了。", "audioOnly": true, "questions": ["native-401-v2-audio"]},
  {"id": "native-401-v2-contrast", "style": "contrast", "label": "保留與遺失", "title": "卡仍在機器內", "intro": "分清兩種失卡情況。", "questions": ["native-401-v2-contrast"]},
  {"id": "native-401-v2-speak", "style": "speak", "label": "口頭報告", "title": "給銀行職員聽", "intro": "先說出提款機未退卡，再聽示範。", "model": "The ATM kept my card.", "zh": "ATM 把我的卡留住了。", "speakingPrompt": "提款後機器沒吐卡；口頭向銀行職員說「ATM 把我的卡留住了」。", "recording": "phrase", "questions": []},
  {"id": "native-401-v2-rewrite", "style": "rewrite", "label": "更正式的說法", "title": "向銀行填表", "intro": "找語意相同的書面用詞。", "questions": ["native-401-v2-rewrite"]},
  {"id": "native-401-v2-final", "style": "final", "label": "新分行自寫", "title": "報告門外 ATM", "intro": "先寫問題和地點，再看示例。", "questions": ["native-401-v2-final"]}
];

export default {revision:2,summary:"用 The ATM kept my card. 描述提款機沒有退回銀行卡，並向銀行清楚報告。",steps,questions,takeaways:["The ATM kept my card.", "The ATM retained my card."],completionTitle:"你能說明提款機保留了卡，並提供銀行所需位置資訊。"};
