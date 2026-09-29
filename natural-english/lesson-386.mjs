import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-386-v2-audio','audio','聽完這句，連接最可能怎樣？',['時有時無，不太穩定。','永久完全斷開。','一直保持穩定快速。','插頭外觀變了顏色。'],'時有時無，不太穩定。','flaky 描述間歇性不可靠；不是永久斷線或穩定連接。'),
  mc('native-386-v2-contrast','contrast','USB 線稍微移動就斷，調位置又接上；與「The Wi-Fi is flaky」相比，哪個主語更準確？',['The USB connection is flaky.','The Wi-Fi is flaky.','The laptop screen is flaky.','The keyboard letters are flaky.'],'The USB connection is flaky.','問題跟着線材移動，故應指出 USB connection，而不是無線網絡。'),
  mc('native-386-v2-rewrite','rewrite','原稿「The drive is broken」下結論太早。哪句更貼合觀察？',['The connection is flaky; the drive disconnects when I move the cable.','The drive is permanently dead and cannot connect at all.','The drive is completely fine in every position.','The USB port is missing from the computer.'],'The connection is flaky; the drive disconnects when I move the cable.','句子只報告間歇斷線與移動線材的關係，沒有直接斷言硬碟壞掉。'),
  mc('native-386-v2-scene','scene','同事問「Is the drive broken?」你移一移線又能讀取。哪句回答最準確？',["I'm not sure; the connection is flaky when the cable moves.","Yes, the drive is definitely destroyed.","No, the drive has never disconnected.","Yes, the Wi-Fi password is wrong."],"I'm not sure; the connection is flaky when the cable moves.","以 I'm not sure 保留原因未明，並交代可觀察到的間歇性連接問題。"),
  open('native-386-v2-final','final','新情境：備份檔案時，外接硬碟每次碰到 USB 線就斷線，調整角度又恢復。寫兩句英文向同事描述現象與你想先檢查的地方。',["The connection is flaky, and the drive disconnects whenever I touch the USB cable. I'll check the cable and port first.","My external drive keeps dropping out when the cable moves. I want to check whether the USB plug is loose.","The USB connection works only at certain angles. I'll inspect the cable before assuming the drive is broken."],'自評時要說出碰線即斷、調角度又恢復的間歇性，並提出相符的檢查方向。')
];
const steps=[
  {id:'native-386-v2-audio',style:'audio',label:'聽穩定程度',title:'一直壞還是時斷時續？',intro:'先聽連接可靠程度，留意是否間歇性。',model:'The connection is flaky.',zh:'連接不太穩定。',audioOnly:true,questions:['native-386-v2-audio']},
  {id:'native-386-v2-contrast',style:'contrast',label:'USB 或 Wi-Fi',title:'找對連接種類',intro:'根據移動線材的線索選主語。',questions:['native-386-v2-contrast']},
  {id:'native-386-v2-rewrite',style:'rewrite',label:'改寫故障報告',title:'別太早判定硬碟壞',intro:'把觀察寫得比推斷清楚。',questions:['native-386-v2-rewrite']},
  {id:'native-386-v2-scene',style:'scene',label:'回應同事',title:'保留原因未明',intro:'用間歇斷線回答，而非直接下結論。',questions:['native-386-v2-scene']},
  {id:'native-386-v2-speak',style:'speak',label:'口頭報告',title:'連接時斷時續',intro:'先自己說；錄音或跳過後才聽示範。',model:'The connection is flaky.',zh:'連接不太穩定。',speakingPrompt:'USB 線稍微碰一下就斷線，簡短描述。',recording:'phrase',questions:[]},
  {id:'native-386-v2-final',style:'final',label:'備份新情境',title:'描述並先檢查',intro:'寫出斷線條件和你要檢查的位置。',questions:['native-386-v2-final']}
];
export default {revision:2,summary:'用 flaky 描述 USB 連接時斷時續，避免直接斷言硬碟損壞。',steps,questions,takeaways:['The connection is flaky.'],completionTitle:'你能準確描述間歇性連接問題。'};
