const mc=(id,style,prompt,options,answer,explanation)=>({id,type:'mc',style,prompt,options,answers:[answer],explanation});
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-032-v2-audio','audio',
    '只聽一句關於浴室的描述。最可能發生甚麼事？',
    ['去水口堵住，水排得很慢或排不走。','水龍頭一直滴水。','鏡子破了。','熱水溫度太低。'],
    '去水口堵住，水排得很慢或排不走。',
    'The drain is clogged. 指去水口或排水管堵塞；它不是在說水龍頭漏水。'),
  blank('native-032-v2-repair','repair',
    '洗手盆裏的水積着不走，你原本向職員說 The sink is leaking.，但沒有漏水。請改成準確描述堵塞的英文句子。',
    ['The drain is clogged.','The sink drain is clogged.','The bathroom sink is clogged.','The sink is clogged.'],
    '問題是水排不走，不是水流到盆外。',
    'The drain is clogged. 指排水通道堵住；若要更具體，也可說 The sink drain is clogged.。'),
  mc('native-032-v2-continue','continue',
    '酒店職員問 Which drain is clogged? 你說的是浴室洗手盆。哪句補充最能幫他找對地方？',
    ['The one in the bathroom sink.','The kitchen ceiling light.','My suitcase handle.','The front-door lock.'],
    'The one in the bathroom sink.',
    '職員已知道是堵塞，現在需要確切位置；指出浴室洗手盆才方便處理。'),
  blank('native-032-v2-final','final',
    '最後挑戰：酒店浴缸的水排不走。沒有選項，寫一句自然英文向職員說明浴缸去水口堵住。',
    ['The bathtub drain is clogged.','The drain in the bathtub is clogged.','The bathtub is clogged.','The tub drain is clogged.','The drain in the tub is clogged.'],
    '說清楚是哪一個排水位置，以及它被堵住。',
    'The bathtub drain is clogged. 同時指出浴缸去水口和堵塞的問題。')
];

const steps=[
  {id:'native-032-v2-audio',style:'audio',label:'聽出故障',title:'水漏出來，還是排不走？',intro:'先只聽聲音，分辨堵塞和漏水。',model:'The drain is clogged.',zh:'去水口堵住了。',audioOnly:true,questions:['native-032-v2-audio']},
  {id:'native-032-v2-repair',style:'repair',label:'修正報修',title:'洗手盆沒有漏水',intro:'把報修句改成符合實際水流情況的說法。',questions:['native-032-v2-repair']},
  {id:'native-032-v2-continue',style:'continue',label:'補足位置',title:'職員需要知道哪個去水口',intro:'不要再重複故障名稱，說清楚位置。',questions:['native-032-v2-continue']},
  {id:'native-032-v2-speak',style:'speak',label:'口說報修',title:'向酒店職員說明',intro:'先用自己的聲音報告，錄音或跳過後才看示範。',model:'The drain is clogged.',zh:'去水口堵住了。',speakingPrompt:'酒店職員：What seems to be the problem? 浴室洗手盆的水排不走。',recording:'phrase',questions:[]},
  {id:'native-032-v2-final',style:'final',label:'換位置挑戰',title:'從洗手盆換成浴缸',intro:'沒有選項；請把新的位置和故障一起說清楚。',questions:['native-032-v2-final']}
];

export default {revision:2,summary:'分辨排水堵塞與漏水，並在報修時說清楚是哪個去水口。',steps,questions,takeaways:['It’s clogged.','The drain is clogged.'],completionTitle:'你能準確向職員報告哪裏堵住了！'};
