import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-396-v2-audio","audio","跑步途中聽到這句，說話者最可能怎樣？",["肋骨旁的側腹突然刺痛。", "膝蓋扭傷得不能站。", "側腹肌肉持續酸痛了一整天。", "跑步後小腿肌肉抽筋。"],"肋骨旁的側腹突然刺痛。","side stitch 是運動時側腹的短暫刺痛；不是縫線或手指受傷。"),
  mc("native-396-v2-contrast","contrast","跑步時肋骨旁突然一陣尖痛，休息一會兒減輕；另一位跑者是腳踝扭傷後持續疼痛。哪組描述較準？",["前者是 a stitch in my side；後者是 a sprained ankle。", "前者是腳踝扭傷；後者是 side stitch。", "前者是長期腰痛；後者是膝蓋疼痛。", "前者是小腿抽筋；後者是腳底疼痛。"],"前者是 a stitch in my side；後者是 a sprained ankle。","side stitch 是運動中側腹的短暫刺痛；腳踝扭傷有不同位置和成因。"),
  mc("native-396-v2-rewrite","rewrite","跑友問 Are you stopping for good? 你只是側腹刺痛，想放慢一分鐘再試。哪句最完整回應他的安排問題？",["I’ve got a stitch in my side. Let’s walk for a minute, then try again.", "I’ve got a stitch in my side, so I’m ending today’s run now.", "My ankle hurts, so I’ll walk to the bench and stop.", "I’m a little out of breath; let’s keep the same pace."],"I’ve got a stitch in my side. Let’s walk for a minute, then try again.","先說明側腹刺痛，再表明只是暫時放慢，直接回答是否完全停止。"),
  {id:"native-396-v2-final",type:'open',style:"final",prompt:"新的情境：你在足球訓練中突然側腹刺痛，想先停下來步行一會兒，再視情況加入。寫一兩句英文告訴教練症狀與打算。",answers:["I’ve got a stitch in my side. I’ll walk for a minute and see if it eases.", "I have a side stitch, so I need to slow down before I join the drill again.", "My side is hurting with a stitch. Could I walk for a bit and then try again?"],explanation:"把 side stitch 轉到足球訓練，並說明暫時步行及稍後再參與的安排。"}
];

const steps=[
  {"id": "native-396-v2-audio", "style": "audio", "label": "先聽痛點", "title": "為何停跑？", "intro": "先聽句子，再辨認運動時的不適。", "model": "I have a stitch in my side.", "zh": "我側腹突然刺痛。", "audioOnly": true, "questions": ["native-396-v2-audio"]},
  {"id": "native-396-v2-speak", "style": "speak", "label": "口頭告知", "title": "向跑友說痛", "intro": "先說出側腹刺痛，再聽示範。", "model": "I have a stitch in my side.", "zh": "我側腹刺痛。", "speakingPrompt": "跑到一半肋骨旁突然刺痛；口頭向跑友說「我側腹刺痛」。", "recording": "phrase", "questions": []},
  {"id": "native-396-v2-contrast", "style": "contrast", "label": "分清 stitch", "title": "運動和縫紉", "intro": "從語境選詞義。", "questions": ["native-396-v2-contrast"]},
  {"id": "native-396-v2-rewrite", "style": "rewrite", "label": "具體說法", "title": "不只說 I hurt", "intro": "把位置和感覺說準。", "questions": ["native-396-v2-rewrite"]},
  {"id": "native-396-v2-final", "style": "final", "label": "新跑步自寫", "title": "先改用步行", "intro": "自己寫症狀和安排，再對照示例。", "questions": ["native-396-v2-final"]}
];

export default {revision:2,summary:"用 a stitch in my side 描述跑步時側腹突發刺痛，而非縫針。",steps,questions,takeaways:["I have a stitch in my side.", "I got a side stitch halfway through my run."],completionTitle:"你能向跑步同伴說明側腹刺痛，並提出放慢速度。"};
