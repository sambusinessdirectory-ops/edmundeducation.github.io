import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-307-v2-audio','audio','只聽音訊問題。聲音最主要有甚麼改變？',['整個音色變形，聽起來不自然。','音量只是太小。','喇叭偶爾有啪啦雜音。','音量整體變得太小。'],'整個音色變形，聽起來不自然。','distorted 指聲音失真變形，與單純音量不足不同。'),
  mc('native-307-v2-contrast','contrast','歌手聲音像被壓扁、變尖；另一台喇叭偶爾啪啦作響。前者較適合哪句？',["The audio is distorted.","The speaker is crackling.","The voice is too quiet.","The speaker crackles between words."],"The audio is distorted.",'整體音色走樣是 distorted；零星啪啦雜音較像 crackling。'),
  mc('native-307-v2-explain','explain','你把音量調低後失真消失。哪個推論較有根據？',['音量過高可能讓聲音失真。','播放的原檔案可能音質較差。','喇叭可能接觸不良。','音訊可能暫時卡住。'],'音量過高可能讓聲音失真。','降低音量後改善，支持音量過高與失真有關；不能由此推出其他故障。'),
  mc('native-307-v2-reverse','reverse','視訊會議裡，同事的聲音整個變形，不像原來的音色。哪個形容詞對應？',["distorted","muted","silent","delayed"],"distorted",'變形是 distorted；muted 或 silent 是無聲，delayed 是時間落後。'),
  open('native-307-v2-rewrite','rewrite',"視訊會議裡，同事的人聲整個變形，不只是偶爾啪啦雜音。給主持人寫兩句英文描述聲音如何異常，並請他檢查音訊。",["The audio sounds distorted, especially when people speak. Could you check the meeting audio settings?", "Voices are coming through warped rather than just crackling. Can we check the sound before continuing?"],"把整體人聲失真與間歇啪啦雜音分開說，再提出檢查音訊的請求。"),
];
const steps=[
  {id:'native-307-v2-audio',style:'audio',label:'先聽音色',title:'聲音變了樣',intro:'只聽一句。',model:'The audio is distorted.',zh:'聲音失真了。',audioOnly:true,questions:['native-307-v2-audio']},
  {id:'native-307-v2-contrast',style:'contrast',label:'與雜音比較',title:'整體走樣還是啪啦聲',intro:'從聲音表現分別。',model:'The speaker is crackling.',zh:'喇叭有啪啦雜音。',questions:['native-307-v2-contrast']},
  {id:'native-307-v2-explain',style:'explain',label:'試著調低',title:'找出可能原因',intro:'根據調整後的變化推斷。',questions:['native-307-v2-explain']},
  {id:'native-307-v2-reverse',style:'reverse',label:'從聲音想詞',title:'人聲變形',intro:'選準音訊形容詞。',questions:['native-307-v2-reverse']},
  {id:'native-307-v2-rewrite',style:'rewrite',label:'會議訊息',title:'向主持人報告',intro:'寫出受影響的部分。',questions:['native-307-v2-rewrite']},
  {id:'native-307-v2-speak',style:'speak',label:'口頭報告',title:'聲音有問題',intro:'先自己說；錄音或跳過後才聽示範。',model:'The audio is distorted.',zh:'聲音失真了。',speakingPrompt:'影片的人聲整體失真，告訴朋友你聽到甚麼。',recording:'phrase',questions:[]}
];
export default {revision:2,summary:'用 distorted 說整體音色失真，與 crackling 的間歇雜音區分。',steps,questions,takeaways:['The audio is distorted.','The speaker is crackling.'],completionTitle:'你能分清聲音失真與喇叭雜音，並具體報告。'};
