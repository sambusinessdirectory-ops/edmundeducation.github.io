import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-260-v2-audio','audio','聽完攝影者的評語，照片最可能怎樣？',['主體的輪廓因對焦失準而模糊。','曝光太亮，整張白成一片。','有人被裁出畫面外。','照片顏色偏黃。'],'主體的輪廓因對焦失準而模糊。','out of focus 指焦點沒對準；與曝光、裁切及色調不同。'),
  mc('native-260-v2-scene','scene','你拍一張合照，臉和背景都呈現柔軟的模糊邊緣；亮度與取景正常。哪個判斷最有根據？',["The picture is out of focus.","The subjects moved, leaving only their faces streaked.","The lens has a fingerprint on one corner.","The camera exposed the image too brightly."],"The picture is out of focus.",'整張照片的邊緣都柔糊，比只在人物處出現拖影更像失焦；也沒有角落污漬或過曝線索。'),
  mc('native-260-v2-repair','repair','你看到模糊的照片，原先說「The camera is broken」。相機其實可正常拍攝，只是這一張沒對準焦點。怎樣修正？',["This picture is out of focus.","The camera battery is dead.","The lens is missing.","The screen is cracked."],"This picture is out of focus.",'把判斷限定在這張照片，避免無根據地說整台相機壞了。'),
  mc('native-260-v2-explain','explain','朋友問你為何說照片 out of focus，而不是 blurry。哪個解釋最準確？',['out of focus 更具體指焦點沒對準造成模糊。','out of focus 指照片顏色過暗。','out of focus 表示照片完全沒儲存。','out of focus 指主體走出取景框。'],'out of focus 更具體指焦點沒對準造成模糊。','blurry 可泛指模糊；out of focus 明確把模糊連到對焦。'),
  mc('native-260-v2-continue','continue','朋友問：「How did the picture turn out?」畫面已拍下，但焦點落在後方牆壁，朋友的臉不清楚。哪個回應自然？',["The faces are out of focus. Let's take another one.","The wall is blurry, but everyone's face is sharp.","The picture is too dark; let's add a lamp.","One person's face was cut out of the frame."],"The faces are out of focus. Let's take another one.",'焦點落在背景使人臉模糊；回應既指出問題，也提議重拍。'),
  open('native-260-v2-continue-write','continue','新情境：你替朋友拍一張證件照，眼睛模糊，但牆後的字反而清楚。朋友問照片能否使用。寫兩句英文回答，並提出下一步。',
    ["Your face is out of focus, so I wouldn't use this photo. Let's take another one.","The focus landed on the wall behind you. I'll refocus on your face and try again.","I don't think this one works because your eyes are out of focus. We should retake it."],
    '自評時看是否用背景清楚、人臉模糊的線索說明失焦，並給出重拍或重新對焦的做法。')
];
const steps=[
  {id:'native-260-v2-audio',style:'audio',label:'聽出照片問題',title:'模糊從哪裏來？',intro:'先聽英文，不看句子。',model:'It’s out of focus.',zh:'照片沒有對準焦點。',audioOnly:true,questions:['native-260-v2-audio']},
  {id:'native-260-v2-scene',style:'scene',label:'查看合照',title:'亮度正常，人臉模糊',intro:'用照片的具體情況選詞。',questions:['native-260-v2-scene']},
  {id:'native-260-v2-repair',style:'repair',label:'修正判斷',title:'別說整台相機壞了',intro:'把說法縮到目前有證據的一張照片。',questions:['native-260-v2-repair']},
  {id:'native-260-v2-explain',style:'explain',label:'辨別意思',title:'比 blurry 更具體',intro:'說明這個詞究竟指出了甚麼原因。',questions:['native-260-v2-explain']},
  {id:'native-260-v2-continue',style:'continue',label:'回應朋友',title:'要不要再拍一次？',intro:'接着朋友的問題，給出可行下一步。',questions:['native-260-v2-continue','native-260-v2-continue-write']},
  {id:'native-260-v2-speak',style:'speak',label:'即時口說',title:'告訴朋友照片失焦',intro:'先自己說；錄音或跳過後才聽示範。',model:'It’s out of focus.',zh:'它失焦了。',speakingPrompt:'朋友問合照拍得怎樣；人物臉部因焦點沒對準而模糊。簡短回答。',recording:'phrase',questions:[]}
];
export default {revision:2,summary:'把對焦失準的照片與曝光、裁切問題分開，並向朋友說明需要重拍。',steps,questions,takeaways:['It’s out of focus.'],completionTitle:'你能指出照片失焦，也能清楚提出重拍。'};
