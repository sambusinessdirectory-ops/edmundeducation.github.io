import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-201-v2-audio","audio","聽到這句，你最可能聽見甚麼？",["每走一步有尖細吱吱聲。", "鞋帶突然斷裂的啪聲。", "木地板每一步都發出嘎吱聲。", "鞋帶上的金屬扣每步都輕響。"],"每走一步有尖細吱吱聲。","squeak 指尖細吱吱聲；鞋走路時可 squeak。"),
  mc("native-201-v2-branch","branch","朋友問 What’s that squeaking sound when you walk? 你怎樣回答？",["It’s my shoes. They keep squeaking.", "It’s my shoelaces brushing the floor.", "It’s the floorboards creaking under my feet.", "It’s the metal buckle on my bag."],"It’s my shoes. They keep squeaking.","squeaking 回應了對方聽到的聲音，並指出來源。"),
  mc("native-201-v2-scene","scene","哪個情況最適合說 My shoes squeak？",["走路時鞋底發出吱吱聲。", "鞋底已磨得很薄。", "鞋跟一直滑出。", "鞋頭夾腳趾。"],"走路時鞋底發出吱吱聲。","squeak 說的是聲音，不是磨損或尺寸；squeak 說的是每步出現的尖細聲，與鞋底磨損或尺寸無關。"),
  mc("native-201-v2-continue","continue","朋友說 I hear a squeak every time you take a step. 哪句回應最自然？",["Yeah, my shoes keep squeaking.", "Yeah, the bag buckle taps against my leg.", "Yeah, the door hinge squeaks when I pass it.", "Yeah, the floorboards creak when I walk."],"Yeah, my shoes keep squeaking.","朋友指每步都有吱吱聲，keep squeaking 表示一直重複。"),
  {id:"native-201-v2-final",type:'open',style:"final",prompt:"新的情境：你穿新鞋走過圖書館入口，地板上每一步都有尖細聲。朋友問你是不是手機響。寫一兩句英文說明真正來源。",answers:["It’s not my phone. My new shoes squeak when I walk.", "My shoes keep squeaking on this floor.", "That squeaking sound is coming from my shoes."],explanation:"用 shoes squeak/squeaking 指明聲音來源和走路時發生。"}
];

const steps=[
  {"id": "native-201-v2-audio", "style": "audio", "label": "先聽聲音", "title": "發生甚麼事？", "intro": "先聽完整句，再回答「發生甚麼事？」。", "model": "My shoes squeak.", "zh": "我的鞋子吱吱叫。", "audioOnly": true, "questions": ["native-201-v2-audio"]},
  {"id": "native-201-v2-speak", "style": "speak", "label": "口頭說明", "title": "聲音從哪來", "intro": "先試着說出「我的鞋子吱吱叫。」，再聽示範。", "model": "My shoes squeak.", "zh": "我的鞋子吱吱叫。", "speakingPrompt": "走進安靜房間時有人問聲音從哪來；口頭說是你的鞋。", "recording": "phrase", "questions": []},
  {"id": "native-201-v2-branch", "style": "branch", "label": "對話分支", "title": "別人問怪聲", "intro": "選能解釋聲音的回應。", "questions": ["native-201-v2-branch"]},
  {"id": "native-201-v2-scene", "style": "scene", "label": "選場景", "title": "哪時說 squeak？", "intro": "比較幾種鞋的問題。", "questions": ["native-201-v2-scene"]},
  {"id": "native-201-v2-continue", "style": "continue", "label": "接續談話", "title": "你也聽到了嗎？", "intro": "承接朋友的觀察。", "questions": ["native-201-v2-continue"]},
  {"id": "native-201-v2-final", "style": "final", "label": "新場合自寫", "title": "圖書館入口", "intro": "自己寫說明，再按示例自評。", "questions": ["native-201-v2-final"]}
];

export default {revision:2,summary:"用 squeak 描述鞋走路時發出的尖細吱吱聲。",steps,questions,takeaways:["My shoes squeak.", "My shoes keep squeaking."],completionTitle:"你能指出吱吱聲來自鞋子，並在新情境解釋聲音。"};
