import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-373-v2-audio','audio','只聽這句商品描述。損傷主要影響甚麼？',['外觀有瑕疵，功能仍可正常使用。','商品完全不能開機。','內部零件短路。','包裹仍在運送途中。'],'外觀有瑕疵，功能仍可正常使用。','cosmetic damage 指外觀損傷；要另查功能是否受影響。'),
  mc('native-373-v2-branch','branch','買家問：「Does this scratch affect how it works?」你測試過功能正常。怎樣回答？',["No, the damage is purely cosmetic. It still works.","Yes, the screen won't turn on at all.","No, there is no scratch anywhere.","The item hasn't arrived yet."],"No, the damage is purely cosmetic. It still works.",'買家問刮痕是否影響使用；這句先否定功能影響，再把已見損傷限定在商品外觀。'),
  mc('native-373-v2-continue','continue','買家追問：「What kind of damage?」商品外殼只有一道小刮痕。哪句接得上？',["A small scratch on the case; the controls work normally.","The internal motor doesn't start.","The screen is completely shattered and unusable.","There isn't any item to inspect."],"A small scratch on the case; the controls work normally.",'給出可見刮痕的位置，並說明已測試的功能，讓描述可信。'),
  open('native-373-v2-final','final','新情境：你要出售一台二手相機，外殼有小刮痕，但拍照、按鈕和螢幕都正常。寫兩句英文描述瑕疵及功能。',["The camera has some cosmetic damage on the case. It still takes photos and all the controls work.","There's a small scratch on the outside, but the damage is purely cosmetic. The camera functions normally.","The body has a minor cosmetic mark. I've tested the buttons, screen, and photos, and they all work."],'自評時看是否誠實說出外觀瑕疵，並只就已測試功能作保證。')
];
const steps=[
  {id:'native-373-v2-audio',style:'audio',label:'聽出影響範圍',title:'外觀還是功能？',intro:'聽損傷是否只在外觀，功能是否仍正常。',model:'It has cosmetic damage.',zh:'它有外觀上的損傷。',audioOnly:true,questions:['native-373-v2-audio']},
  {id:'native-373-v2-branch',style:'branch',label:'回答買家',title:'刮痕影響使用嗎？',intro:'按功能測試結果回答。',questions:['native-373-v2-branch']},
  {id:'native-373-v2-continue',style:'continue',label:'補充細節',title:'外殼的小刮痕',intro:'接着買家的追問說位置。',questions:['native-373-v2-continue']},
  {id:'native-373-v2-speak',style:'speak',label:'口頭描述',title:'商品只有外觀瑕疵',intro:'先自己說；錄音或跳過後才聽示範。',model:'It has cosmetic damage.',zh:'它有外觀上的損傷。',speakingPrompt:'二手商品表面有小刮痕，但你測試過功能正常。先說外觀問題。',recording:'phrase',questions:[]},
  {id:'native-373-v2-final',style:'final',label:'二手相機挑戰',title:'誠實描述外觀和功能',intro:'分兩句說明外觀瑕疵與實測功能。',questions:['native-373-v2-final']}
];
export default {revision:2,summary:'用 cosmetic damage 指商品外觀小瑕疵，並分開已測試的功能狀態。',steps,questions,takeaways:['It has cosmetic damage.'],completionTitle:'你能誠實描述外觀損傷，也能清楚交代功能。'};
