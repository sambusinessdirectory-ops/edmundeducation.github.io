import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-209-v2-audio","audio","聽到這句，開門時最可能有甚麼情況？",["門發出尖細吱吱聲。", "門鉸位發出低沉撞擊聲。", "門打開時有金屬摩擦聲。", "門只是在關上時很難推動。"],"門發出尖細吱吱聲。","squeaky 是會發出 squeak 吱吱聲的。"),
  mc("native-209-v2-continue","continue","朋友問 What’s that noise when you open the door? 你怎樣回答？",["The door is squeaky.", "The door is stuck.", "The door is rattling.", "The door is loose on its hinges."],"The door is squeaky.","聲音在開門時出現，用 squeaky 描述門。"),
  mc("native-209-v2-tone","tone","室友說 The door is really squeaky，聲音明顯來自鉸位。哪句回應能直接處理聲音來源？",["Maybe we should oil the hinges.", "You always make the door squeak; fix it yourself.", "We could tighten the loose handle and see if that helps.", "I’ll avoid using that door until you fix it."],"Maybe we should oil the hinges.","門鉸位發聲時，可委婉建議上油；吱吱聲通常來自鉸位；Maybe we should... 是共同處理問題的溫和建議。"),
  mc("native-209-v2-repair","repair","門能順利打開，但鉸位每次都吱吱響。把 The door is stuck 改成哪句？",["The door is squeaky.", "The door is locked.", "The door won’t budge.", "The door is rattling."],"The door is squeaky.","squeaky 描述聲音；stuck 表示門難以移動。"),
  {id:"native-209-v2-detail",type:'open',style:"detail",prompt:"新的情境：學校儲物櫃的門每次打開都吱吱響，但仍可順利開關。寫一兩句英文向管理員描述聲音和可能需要檢查的位置。",answers:["The locker door is squeaky. Could you check the hinges?", "The locker door squeaks whenever I open it; the hinges may need attention."],explanation:"squeaky 描述開關時的尖細聲；仍能開關，所以先檢查鉸位較合理。"}
];

const steps=[
  {"id": "native-209-v2-audio", "style": "audio", "label": "先聽聲音", "title": "門怎樣了？", "intro": "先聽完整句，再回答「門怎樣了？」。", "model": "The door is squeaky.", "zh": "這扇門會吱吱響。", "audioOnly": true, "questions": ["native-209-v2-audio"]},
  {"id": "native-209-v2-continue", "style": "continue", "label": "接續對話", "title": "朋友問怪聲", "intro": "回應房間裏的聲音。", "questions": ["native-209-v2-continue"]},
  {"id": "native-209-v2-tone", "style": "tone", "label": "提出建議", "title": "不責怪住客", "intro": "比較回應方式。", "questions": ["native-209-v2-tone"]},
  {"id": "native-209-v2-speak", "style": "speak", "label": "口頭解釋", "title": "門一開就響", "intro": "先試着說出「門會吱吱響。」，再聽示範。", "model": "The door is squeaky.", "zh": "門會吱吱響。", "speakingPrompt": "室友問開門時的怪聲；口頭說「這扇門會吱吱響」。", "recording": "phrase", "questions": []},
  {"id": "native-209-v2-repair", "style": "repair", "label": "修正形容", "title": "聲音，不是卡住", "intro": "找符合觀察的詞。", "questions": ["native-209-v2-repair"]},
  {"id": "native-209-v2-detail", "style": "detail", "label": "新情境自評", "title": "儲物櫃門的聲音", "intro": "轉到「儲物櫃門的聲音」場景獨立作答，再用示例核對兩個要點。", "questions": ["native-209-v2-detail"]}
];

export default {revision:2,summary:"用 squeaky 描述門在開關時發出吱吱聲，並分清鞋子也會 squeak。",steps,questions,takeaways:["The door is squeaky.", "My shoes squeak."],completionTitle:"你能指出門的吱吱聲，並在對話中建議處理鉸位。"};
