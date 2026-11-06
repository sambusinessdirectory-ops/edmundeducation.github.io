import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-281-v2-audio','audio','先聽這句。牆面最可能有甚麼變化？',['牆紙邊緣開始離開牆面。','油漆顏色變淡。','整塊牆磚裂開。','牆上剛貼了新畫。'],'牆紙邊緣開始離開牆面。','peeling 在此指牆紙逐漸剝離，尤其邊緣翹起。'),
  mc('native-281-v2-scene','scene','浴室旁的牆紙從角落捲起，下面的牆面露出來。怎樣描述？',["The wallpaper is peeling.","The paint is fading.","The wall is dripping.","The tiles are cracked."],"The wallpaper is peeling.",'要指出剝離的是 wallpaper；其他句子談不同材質或問題。'),
  mc('native-281-v2-repair','repair','你看見牆紙翹起，卻說「The paint is peeling」。哪句把材質改對？',["The wallpaper is peeling around the edges.","The floorboards are creaky.","The paint has dried completely.","The grout is discolored."],"The wallpaper is peeling around the edges.",'同樣可用 peeling，但主語應是實際翹起的牆紙，不是油漆。'),
  mc('native-281-v2-continue','continue','房東問：「Is it happening anywhere else?」你又看到窗邊一角開始翹。怎樣接話？',["Yes, the wallpaper is peeling near the window too.","No, there isn't any wallpaper here.","The kitchen sink is leaking instead.","I already replaced every wall."],"Yes, the wallpaper is peeling near the window too.",'回答是否還有其他位置，並指出窗邊同樣有牆紙剝離。'),
  mc('native-281-v2-transfer','transfer','換到另一間房：兒童房的牆紙底邊也從牆面鬆開。哪句仍自然？',["The wallpaper is peeling along the bottom.","The carpet is shedding along the bottom.","The ceiling fan is rattling.","The curtains are too short."],"The wallpaper is peeling along the bottom.",'peeling 可用在牆紙不同位置；along the bottom 明確指出底邊。'),
  open('native-281-v2-final','final','新情境：你租的房間近窗位置潮濕，牆紙邊緣開始翹起。寫兩句英文向房東報告現象和位置。',["The wallpaper is peeling near the window. The edge has started to come away from the wall.","I noticed the wallpaper peeling by the window. It seems worse where the wall feels damp.","The wallpaper is starting to peel at one corner. It's the corner next to the window."],'自評時檢查是否說明牆紙正在剝離，並指出房東能找到的位置。')
];
const steps=[
  {id:'native-281-v2-audio',style:'audio',label:'聽出牆面變化',title:'牆紙還貼得牢嗎？',intro:'聽牆紙邊緣是否仍貼在牆上。',model:'The wallpaper is peeling.',zh:'牆紙開始剝落。',audioOnly:true,questions:['native-281-v2-audio']},
  {id:'native-281-v2-scene',style:'scene',label:'觀察牆角',title:'邊緣慢慢翹起',intro:'根據牆面材質選描述。',questions:['native-281-v2-scene']},
  {id:'native-281-v2-repair',style:'repair',label:'修正主語',title:'不是油漆剝落',intro:'說準究竟哪層材料離開牆面。',questions:['native-281-v2-repair']},
  {id:'native-281-v2-continue',style:'continue',label:'回答房東',title:'窗邊也有一處',intro:'接着對方的追問交代位置。',questions:['native-281-v2-continue']},
  {id:'native-281-v2-transfer',style:'transfer',label:'換個房間',title:'底邊也開始脫離',intro:'把同一表達用在另一處。',questions:['native-281-v2-transfer']},
  {id:'native-281-v2-final',style:'final',label:'租屋挑戰',title:'寫給房東的兩句話',intro:'寫完後對照示例自評。',questions:['native-281-v2-final']}
];
export default {revision:2,summary:'用 peeling 描述牆紙邊緣從牆面翹起，並在報修時說明具體位置。',steps,questions,takeaways:['The wallpaper is peeling.'],completionTitle:'你能準確描述牆紙剝離並向房東報告。'};
