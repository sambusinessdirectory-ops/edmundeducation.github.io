import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-255-v2-audio','audio','只聽這句對 Wi-Fi 的描述。它最接近哪個情況？',['有時正常，有時很慢或斷線。','整天完全連不上。','一直穩定，只是收費貴。','只有電腦螢幕偶爾閃爍。'],'有時正常，有時很慢或斷線。','spotty 說的是連線品質不穩定，時好時壞；不表示一直沒有訊號。'),
  mc('native-255-v2-continue','continue','視訊裏同事說：「You froze for a second.」你知道咖啡店 Wi-Fi 忽快忽慢。哪句最自然接上？',["Yeah, my Wi-Fi is a little spotty today.","Yeah, the website is down for everyone.","Yeah, I turned off my camera on purpose.","Yeah, my screen is cracked."],"Yeah, my Wi-Fi is a little spotty today.",'畫面短暫卡住與不穩的網絡相符；a little 也使解釋保持平和。'),
  mc('native-255-v2-tone','tone','你在酒店向櫃台報告網絡問題：它偶爾能用，但連線不穩。哪句既準確又不誇大？',["The Wi-Fi is a bit spotty in my room.","There has never been any Wi-Fi here.","The whole hotel network has been permanently shut down.","My phone has no screen."],"The Wi-Fi is a bit spotty in my room.",'a bit spotty 清楚描述房間裏時好時壞的連線；不推斷整間酒店永久停網。'),
  mc('native-255-v2-explain','explain','朋友說：「但你剛剛不是還能上網嗎？」哪項說明最能解釋為何仍可稱為 spotty？',['因為 spotty 容許訊號間歇正常，問題在於不穩定。','因為 spotty 專指網絡完全關閉。','因為 spotty 只描述網速一直很快。','因為 spotty 指螢幕出現斑點。'],'因為 spotty 容許訊號間歇正常，問題在於不穩定。','這個詞強調品質不一致；偶爾能用正是「時好時壞」的一部分。'),
  open('native-255-v2-explain-write','explain','你在咖啡店上傳檔案，進度有時正常，有時停住；朋友說他剛才明明看你成功上網。寫兩句英文解釋網絡的狀態和上傳為何受影響。',
    ["The Wi-Fi is spotty here. My upload keeps pausing when the signal drops.","I can get online sometimes, but the Wi-Fi is spotty. That's why the file upload keeps stopping.","The connection works for a while and then weakens. The spotty Wi-Fi is interrupting my upload."],
    '自評時看是否說清楚「間歇可用」與「上傳受影響」兩件事。')
];
const steps=[
  {id:'native-255-v2-audio',style:'audio',label:'聽出穩定度',title:'網絡是慢，還是忽好忽壞？',intro:'先聽英文描述，再判斷連線狀態。',model:'The Wi-Fi is spotty.',zh:'Wi-Fi 時好時壞。',audioOnly:true,questions:['native-255-v2-audio']},
  {id:'native-255-v2-continue',style:'continue',label:'會議接話',title:'同事看見你卡住',intro:'根據對方剛說的話給出原因。',questions:['native-255-v2-continue']},
  {id:'native-255-v2-tone',style:'tone',label:'報告問題',title:'向酒店櫃台說明',intro:'如實描述間歇性問題，別把範圍說得太大。',questions:['native-255-v2-tone']},
  {id:'native-255-v2-explain',style:'explain',label:'解釋詞義',title:'明明剛才能上網？',intro:'說明間歇正常為何不矛盾。',questions:['native-255-v2-explain','native-255-v2-explain-write']},
  {id:'native-255-v2-speak',style:'speak',label:'口頭報告',title:'連線又不穩了',intro:'先自己說；錄音或跳過後才聽示範。',model:'The Wi-Fi is spotty.',zh:'Wi-Fi 時好時壞。',speakingPrompt:'你在線上會議中斷斷續續，想用一句話向大家說明咖啡店網絡不穩。',recording:'phrase',questions:[]}
];
export default {revision:2,summary:'用 spotty 描述間歇正常、間歇變慢或斷線的 Wi-Fi，並避免說成完全停網。',steps,questions,takeaways:['The Wi-Fi is spotty.'],completionTitle:'你能向同事或店員準確說明間歇性網絡問題。'};
