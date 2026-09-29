import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-254-v2-audio','audio','聽完這句，醬汁最可能發生甚麼變化？',['油和水分成兩層。','醬汁完全燒乾。','醬汁變得更辣。','醬汁凝固成一塊。'],'油和水分成兩層。','separated 指原本混合的成分分開；這裏不是味道或份量的變化。'),
  mc('native-254-v2-detail','detail','沙律醬在雪櫃放了一晚。哪個畫面最支持 separated？',['瓶內上層是一層油，下層是較水的醬。','醬汁仍均勻，只是比昨天稀。','瓶蓋沾到少許醬。','醬汁顏色一致，但味道變淡。'],'瓶內上層是一層油，下層是較水的醬。','分層是關鍵；只變稀或變淡，仍不一定是 separated。'),
  mc('native-254-v2-branch','branch','朋友問：「What happened to the sauce?」你剛看到油浮在上面。哪個回應最合適？',["I think it separated. Maybe it got too hot.","It ran out. Let's make more.","It's too salty. Add some water.","It froze solid. Leave it outside."],"I think it separated. Maybe it got too hot.",'回應指出油水分離，也提出可能與加熱有關；其他回應誤指份量、鹹度或結冰。'),
  open('native-254-v2-final','final','新情境：你正在準備晚餐，奶油醬原本滑順，現在表面浮着油、下面是較稀的液體。寫兩句英文向同伴描述，並提出一個可能原因。',["The sauce has separated. It may have gotten too hot.","I think the cream sauce has separated. Maybe we heated it too quickly.","There's oil on top now; the sauce has separated. I wonder if it was overheated."],'自評時檢查有沒有說明「分層」和可能原因；原因可用 may、maybe 表示推測。')
];
const steps=[
  {id:'native-254-v2-audio',style:'audio',label:'先聽結果',title:'醬汁發生甚麼事？',intro:'只聽英文，不先看文字。',model:'The sauce has separated.',zh:'醬汁油水分離了。',audioOnly:true,questions:['native-254-v2-audio']},
  {id:'native-254-v2-detail',style:'detail',label:'看見分層',title:'油浮在上面',intro:'從視覺線索判斷是否真的分離。',questions:['native-254-v2-detail']},
  {id:'native-254-v2-branch',style:'branch',label:'廚房對話',title:'回答出了甚麼問題',intro:'根據同伴的問題接續談話。',questions:['native-254-v2-branch']},
  {id:'native-254-v2-speak',style:'speak',label:'即時說明',title:'提醒正在做菜的人',intro:'先自己說；錄音或跳過後才聽示範。',model:'The sauce has separated.',zh:'醬汁油水分離了。',speakingPrompt:'同伴正想把這份醬端上桌，你看到它已分成兩層。簡短指出問題。',recording:'phrase',questions:[]},
  {id:'native-254-v2-final',style:'final',label:'晚餐挑戰',title:'描述奶油醬的變化',intro:'寫兩句英文，完成後自行對照示例。',questions:['native-254-v2-final']}
];
export default {revision:2,summary:'看出醬汁油水分層，並用 separated 說明原本均勻的醬汁出了甚麼變化。',steps,questions,takeaways:['The sauce has separated.'],completionTitle:'你能辨認醬汁分層，也能清楚向同伴描述。'};
