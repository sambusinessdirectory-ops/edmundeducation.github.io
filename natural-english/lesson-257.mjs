import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-257-v2-audio','audio','只聽英文。說話者抱怨影片哪種問題？',['畫面仍在播放，但動作一頓一頓。','影片停止，等候載入轉圈。','聲音完全消失。','整個網站無法打開。'],'畫面仍在播放，但動作一頓一頓。','stuttering 著重播放動作不流暢；buffering 才常見停下來等資料。'),
  mc('native-257-v2-scene','scene','你看一段舞蹈影片：時間軸繼續走，但舞者的動作不斷跳格。應怎樣說？',['The video is stuttering.','The video is buffering.','The video is muted.','The screen is cracked.'],'The video is stuttering.','有畫面但動作卡頓是 stuttering；這裏沒有停止載入或靜音的線索。'),
  mc('native-257-v2-repair','repair','朋友說：「It is buffering.」但畫面沒有停下來轉圈，只是每秒跳過一些畫格。怎樣改得更準？',["It keeps stuttering.","It won't load at all.","The audio is too quiet.","The colors are washed out."],"It keeps stuttering.",'修正重點是播放不流暢而非等待載入；keeps 表示問題反覆出現。'),
  mc('native-257-v2-transfer','transfer','你從影片轉到即時遊戲畫面。人物仍會動，但動作一跳一跳。哪項描述保留了相同的現象？',['The motion is stuttering.','The controller is missing.','The screen is completely black.','The sound is muted.'],'The motion is stuttering.','stuttering 也可描述動作或畫面更新不連貫，不限於預錄影片。'),
  open('native-257-v2-final','final','新情境：你在課堂播放示範影片，影片沒有停下來載入，但人物動作一直跳格。寫兩句英文向全班說明問題，並提出下一步。',["The video keeps stuttering. I'll try playing it again.","The video is stuttering, though it isn't buffering. Let me restart the player.","The motion is really choppy because the video keeps stuttering. I'll use another file."],'自評時看是否寫出畫面跳格，而不是誤說成停下來載入；第二句要有實際下一步。')
];
const steps=[
  {id:'native-257-v2-audio',style:'audio',label:'聽出卡頓',title:'畫面還在動嗎？',intro:'先聽英文，再想像影片狀態。',model:'The video is stuttering.',zh:'影片一頓一頓。',audioOnly:true,questions:['native-257-v2-audio']},
  {id:'native-257-v2-scene',style:'scene',label:'看舞蹈影片',title:'跳格但不停播',intro:'根據時間軸和人物動作選描述。',questions:['native-257-v2-scene']},
  {id:'native-257-v2-repair',style:'repair',label:'修正說法',title:'別誤說成 buffering',intro:'分清跳格和等待載入。',questions:['native-257-v2-repair']},
  {id:'native-257-v2-transfer',style:'transfer',label:'轉到遊戲',title:'即時畫面也會卡頓',intro:'把同一概念用於另一種畫面。',questions:['native-257-v2-transfer']},
  {id:'native-257-v2-speak',style:'speak',label:'口頭報告',title:'告訴朋友影片問題',intro:'先自己說；錄音或跳過後才聽示範。',model:'The video keeps stuttering.',zh:'影片一直一頓一頓。',speakingPrompt:'朋友問影片為何不順；它仍在播，但畫面一跳一跳。用一句英文描述。',recording:'phrase',questions:[]},
  {id:'native-257-v2-final',style:'final',label:'課堂挑戰',title:'向全班解釋並處理',intro:'寫兩句，再按示例自行檢查。',questions:['native-257-v2-final']}
];
export default {revision:2,summary:'用 stuttering 描述影片畫面跳格，並與停下來等待載入的 buffering 分開。',steps,questions,takeaways:['The video is stuttering.','The video keeps stuttering.'],completionTitle:'你能分清影片跳格與載入停頓，也能提出下一步。'};
