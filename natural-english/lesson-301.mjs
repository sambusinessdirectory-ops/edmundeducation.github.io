import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-301-v2-audio','audio','只聽身體感覺。聲音最可能從哪裡來？',['耳朵內的嗡或鈴聲，外面沒有聲源。','身旁的電話正響。','隔壁房間有一個微弱鈴聲。','剛才的演唱會聲音似乎仍從走廊傳來。'],'耳朵內的嗡或鈴聲，外面沒有聲源。','ears are ringing 指耳內感到鳴響，不是外面的電話鈴聲。'),
  mc('native-301-v2-contrast','contrast','演唱會完結後你仍聽到高頻聲，朋友卻沒聽到。哪句最貼近自己的感覺？',["My ears are ringing.","The alarm is still ringing in the hall.","My phone is ringing.","The music is still loud outside."],"My ears are ringing.",'只有你聽到耳內聲響，與外部鈴聲或喇叭雜音不同。'),
  mc('native-301-v2-repair','repair','你想說耳內嗡嗡聲，卻說 My phone is ringing。哪句改得準確？',["I hear a buzzing sound in my ear.","The concert speakers are buzzing nearby.","The music from the venue still echoes.","The phone's vibration sounds like buzzing."],"I hear a buzzing sound in my ear.",'把聲音位置說在耳內，避免朋友去找電話或鬧鐘。'),
  mc('native-301-v2-rewrite','rewrite','你要向朋友解釋剛離開嘈雜場地後的感覺。哪條訊息最清楚？',["The room was very loud, and now my ears are ringing.","A bell seems to be ringing somewhere outside.","The hallway is still noisy after the show.","The speakers were crackling during the show."],"The room was very loud, and now my ears are ringing.",'交代嘈雜聲後的耳內鳴響，避免把來源誤寫成外面設備。'),
  open('native-301-v2-final','final','最後挑戰：你剛離開聲音很大的演唱會，安靜的走廊裡仍聽到耳內嗡嗡聲。寫兩句英文向朋友描述聲音和剛才的環境。',["My ears are ringing even out here. The music inside was really loud.","I hear a buzzing sound in my ear. That concert was much louder than I expected."],'指明耳內持續聲音及嘈雜背景；不要把它說成朋友也能聽見的外部鈴聲。')
];
const steps=[
  {id:'native-301-v2-audio',style:'audio',label:'先聽感覺',title:'聲音在耳內',intro:'只聽一句。',model:'My ears are ringing.',zh:'我的耳朵一直嗡嗡響。',audioOnly:true,questions:['native-301-v2-audio']},
  {id:'native-301-v2-contrast',style:'contrast',label:'聲音來源',title:'不是門鈴',intro:'分清內在聽覺與外部聲音。',questions:['native-301-v2-contrast']},
  {id:'native-301-v2-repair',style:'repair',label:'修正描述',title:'嗡嗡聲在哪裡？',intro:'把位置說清楚。',questions:['native-301-v2-repair']},
  {id:'native-301-v2-rewrite',style:'rewrite',label:'給朋友訊息',title:'走出場地後',intro:'連結環境和現在的感覺。',questions:['native-301-v2-rewrite']},
  {id:'native-301-v2-speak',style:'speak',label:'口頭描述',title:'單側耳朵嗡響',intro:'先自己說；錄音或跳過後才聽示範。',model:'I hear a buzzing sound in my ear.',zh:'我的耳朵裡聽到嗡嗡聲。',speakingPrompt:'你在安靜房間仍聽到一隻耳朵嗡嗡響。先口頭描述。',recording:'phrase',questions:[]},
  {id:'native-301-v2-final',style:'final',label:'演唱會挑戰',title:'嘈雜後仍有聲',intro:'自己說明耳內聲響及背景。',questions:['native-301-v2-final']}
];
export default {revision:2,summary:'用 My ears are ringing 說明耳內嗡鳴或鈴聲，與外部設備發聲區分。',steps,questions,takeaways:['My ears are ringing.','I hear a buzzing sound in my ear.'],completionTitle:'你能清楚說明耳內聽到的持續聲音。'};
