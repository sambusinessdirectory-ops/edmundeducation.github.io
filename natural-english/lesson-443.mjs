import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-443-v2-audio','audio','只聽水龍頭問題。你把手放下去後，哪件事沒有發生？',['感應器沒有識別雙手，也沒有出水。','有水但溫度太低。','水槽排水很慢。','水流太強濺到衣服。'],'感應器沒有識別雙手，也沒有出水。','sensor isn’t picking up my hands 指感應不到手的位置，故無法啟動水流。'),
  mc('native-443-v2-scene','scene','公共洗手間裡，你把雙手在感應口下移來移去，水龍頭完全沒有反應。哪句最貼切？',["The sensor isn't picking up my hands.","The faucet is dripping after I turn it off.","The water is too cold when it runs.","The sink is draining slowly."],"The sensor isn't picking up my hands.",'沒有任何水流且手已放到感應範圍，問題可能在手沒有被偵測到。'),
  mc('native-443-v2-explain','explain','朋友說 Maybe the drain is clogged。哪個觀察能指出問題發生得更早？',['水根本沒有開始流出，手在感應區下也沒反應。','水流出後在盆底積了一會。','水龍頭關掉後仍滴水。','水流出來但溫度偏冷。'],'水根本沒有開始流出，手在感應區下也沒反應。','排水口堵塞影響水進盆後的去向；現在是出水感應尚未啟動。'),
  mc('native-443-v2-transfer','transfer','換到感應洗手液機：手伸過去，機器不出洗手液。哪句可沿用同一動詞？',["The dispenser isn't picking up my hands.","The dispenser is dispensing too much.","The soap is draining slowly.","The sensor is detecting my hands but the bottle is empty."],"The dispenser isn't picking up my hands.",'pick up 在感應設備語境是偵測到；可從水龍頭轉用到洗手液機。'),
  mc('native-443-v2-tone','tone','你要向清潔員報告，又不確定是感應器或沒水。哪句只說可觀察到的事，再請對方檢查？',["The tap isn't responding when I put my hands under it. Could you check it?","I think the sensor is broken; please replace that part.","There's no water supply here; could you restore it?","The tap has been broken all morning; could you fix it?"],"The tap isn't responding when I put my hands under it. Could you check it?",'先說實際觀察，再請人檢查；其他句子把未核實的原因或持續時間說成已知。'),
  open('native-443-v2-final','final','最後挑戰：你在洗手間把手放在感應水龍頭下，多試幾個位置都沒有水。向職員寫兩句英文描述已試過的動作及你懷疑的問題。',["I've moved my hands under the faucet several times, but no water comes out. The sensor may not be picking them up.","The tap doesn't respond when I put my hands underneath. Could someone check the sensor?"],'把手的位置和出水結果說清楚，再把感應器原因作為推測。')
];
const steps=[
  {id:'native-443-v2-audio',style:'audio',label:'先聽感應',title:'手放下去卻沒水',intro:'判斷問題在出水前還是排水後。',model:'The sensor isn’t picking up my hands.',zh:'感應器偵測不到我的手。',audioOnly:true,questions:['native-443-v2-audio']},
  {id:'native-443-v2-scene',style:'scene',label:'公共洗手間',title:'移動雙手仍沒反應',intro:'把動作和機器反應連起來。',questions:['native-443-v2-scene']},
  {id:'native-443-v2-explain',style:'explain',label:'不是排水口',title:'水根本沒出來',intro:'指出問題發生環節。',questions:['native-443-v2-explain']},
  {id:'native-443-v2-transfer',style:'transfer',label:'換個設備',title:'洗手液機也有感應器',intro:'把 pick up 用於另一種感應。',questions:['native-443-v2-transfer']},
  {id:'native-443-v2-tone',style:'tone',label:'審慎報告',title:'先說觀察',intro:'向職員反映而不武斷斷定原因。',model:'The sensor still isn’t picking up my hands.',zh:'感應器仍偵測不到我的手。',questions:['native-443-v2-tone']},
  {id:'native-443-v2-final',style:'final',label:'洗手間挑戰',title:'多個位置都試過',intro:'自己寫觀察與推測。',questions:['native-443-v2-final']}
];
export default {revision:2,summary:'用 sensor isn’t picking up my hands 描述感應水龍頭對雙手無反應，並區分出水與排水問題。',steps,questions,takeaways:['The sensor isn’t picking up my hands.','The sensor still isn’t picking up my hands.'],completionTitle:'你能向職員清楚報告感應水龍頭沒有反應。'};
