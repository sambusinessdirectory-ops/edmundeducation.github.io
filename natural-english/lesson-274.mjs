import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-274-v2-audio','audio','先聽這句對入口的描述。現場最可能怎樣？',['人流積在一起，前進很慢。','入口已永久封閉。','完全沒有人排隊。','有人臨時取消預約。'],'人流積在一起，前進很慢。','backed up 表示人或車積壓而堵塞；入口仍可能開放。'),
  mc('native-274-v2-repair','repair','同伴說「The entrance is closed」，但你看到人仍可慢慢進去，只是前面擠滿。怎樣改得更準？',["The entrance is backed up.","The entrance has disappeared.","The entrance is empty.","The entrance is locked for the day."],"The entrance is backed up.",'人群仍能緩慢入場，所以問題是入口前的隊伍積壓；closed 會錯誤暗示入口不開放。'),
  mc('native-274-v2-branch','branch','朋友問：「Should we go in now?」入口前排隊的人幾乎不動。你怎樣回應？',["Maybe wait a bit. The entrance is really backed up.","Sure, there's no line at all.","No, the event was canceled last month.","Let's leave because the door is painted blue."],"Maybe wait a bit. The entrance is really backed up.",'回應先給建議，再用入口積壓作原因；沒有擅自說活動取消。'),
  mc('native-274-v2-transfer','transfer','換到道路：前方車輛積壓，車流緩慢。哪句保留相同的 backed up 用法？',["Traffic is backed up near the bridge.","The bridge has been painted red.","There are no cars on the road.","Every car has run out of fuel."],"Traffic is backed up near the bridge.",'backed up 可描述車流排長龍，與入口人潮同樣是前方擠塞。'),
  open('native-274-v2-final','final','新情境：演唱會入口外排隊人潮堵到轉角，隊伍還在緩慢移動。寫兩句英文告訴遲到的朋友現況，並建議他先在旁邊等你。',["The entrance is backed up, but the line is moving slowly. Please wait for me by the side gate.","There are lots of people and the entrance is backed up. Could you wait near the corner?","The line is backed up all the way around the corner. I'll meet you away from the crowd."],'自評時應說出人潮積壓而非入口關閉，並給朋友明確的會合安排。')
];
const steps=[
  {id:'native-274-v2-audio',style:'audio',label:'聽出積壓',title:'入口堵到甚麼程度？',intro:'先只聽英文，不看文字。',model:'It’s backed up.',zh:'入口堵住了。',audioOnly:true,questions:['native-274-v2-audio']},
  {id:'native-274-v2-repair',style:'repair',label:'修正判斷',title:'堵塞不等於關閉',intro:'根據隊伍仍移動的線索修正說法。',questions:['native-274-v2-repair']},
  {id:'native-274-v2-branch',style:'branch',label:'給朋友建議',title:'現在進去嗎？',intro:'接着朋友的問題決定下一步。',questions:['native-274-v2-branch']},
  {id:'native-274-v2-transfer',style:'transfer',label:'從人到車',title:'橋附近也會積壓',intro:'把同一用法移到交通。',questions:['native-274-v2-transfer']},
  {id:'native-274-v2-speak',style:'speak',label:'現場通報',title:'告訴同伴入口擠塞',intro:'先自己說；錄音或跳過後才聽示範。',model:'It’s backed up.',zh:'這裏堵住了。',speakingPrompt:'會場入口人多，隊伍幾乎不動。簡短告訴同伴現況。',recording:'phrase',questions:[]},
  {id:'native-274-v2-final',style:'final',label:'演唱會挑戰',title:'通知遲到的朋友',intro:'寫兩句，再自行檢查資訊是否具體。',questions:['native-274-v2-final']}
];
export default {revision:2,summary:'用 backed up 描述入口人潮積壓、行進緩慢，並與入口關閉區分。',steps,questions,takeaways:['It’s backed up.'],completionTitle:'你能準確報告入口積壓，也能安排朋友避開人潮。'};
