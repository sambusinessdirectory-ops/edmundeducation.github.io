import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-460-v2-audio','audio','只聽手機保護貼的問題。可見的瑕疵在哪裏？',['保護貼下面有氣泡。','玻璃螢幕上有裂痕。','保護貼邊緣翹起。','螢幕上有水滴。'],'保護貼下面有氣泡。','under the screen protector 指氣泡困在貼膜與螢幕之間。'),
  mc('native-460-v2-transfer','transfer','平板剛貼膜，中間有幾顆圓形空氣泡。哪句可直接換用？',["There are bubbles under the screen protector.","The screen protector is curling at the edges.","The tablet screen has cracked.","There are smudges on the protector."],"There are bubbles under the screen protector.",'平板貼膜下的空氣泡仍是 bubbles under the screen protector。'),
  mc('native-460-v2-continue','continue','店員看見貼膜下的氣泡，問 Do you want me to redo it? 你想接受並保持禮貌，怎樣回？',["Yes, please. The bubbles are right in the middle.","No, the bubbles have already disappeared.","Yes, please. The screen itself is shattered.","No, I only need the corners trimmed."],"Yes, please. The bubbles are right in the middle.",'接受重貼並指出氣泡位置；其他回答否認現有問題或改說另一種瑕疵。'),
  open('native-460-v2-speak','speak','剛貼好手機保護貼，中央看得見空氣泡。先用英文口說問題，再對照示範。',["There are bubbles under the screen protector.","I can see air bubbles under the screen protector."],'under 清楚指出氣泡困在貼膜下面，不是表面污點。'),
  open('native-460-v2-final','final','新場景：店員剛幫你貼保護貼，中間還有三顆明顯氣泡。寫兩句英文指出問題，並禮貌問能否重貼。',["There are a few bubbles under the screen protector. Could you redo it, please?","I can still see three bubbles under the protector. Would you mind trying it again?"],'明確說明氣泡在貼膜下方及它們仍可見，再禮貌提出重貼請求；不要把它誤說成螢幕裂痕。')
];
const steps=[
  {id:'native-460-v2-audio',style:'audio',label:'先聽瑕疵',title:'貼膜下面',intro:'判斷是空氣泡還是裂痕。',model:'There are bubbles under the screen protector.',zh:'保護貼下面有氣泡。',audioOnly:true,questions:['native-460-v2-audio']},
  {id:'native-460-v2-transfer',style:'transfer',label:'換成平板',title:'同樣的貼膜問題',intro:'把說法用在另一個裝置。',questions:['native-460-v2-transfer']},
  {id:'native-460-v2-continue',style:'continue',label:'回覆店員',title:'需要重貼嗎',intro:'接受幫忙並指出位置。',model:'Do you want me to redo it?',zh:'要我重新貼嗎？',questions:['native-460-v2-continue']},
  {id:'native-460-v2-speak',style:'speak',label:'口頭指出',title:'中央的空氣泡',intro:'先說再核對。',model:'There are bubbles under the screen protector.',zh:'保護貼下面有氣泡。',speakingPrompt:'向店員指出剛貼好的保護貼中央有氣泡。',recording:'phrase',questions:['native-460-v2-speak']},
  {id:'native-460-v2-final',style:'final',label:'重貼挑戰',title:'三顆氣泡',intro:'寫出問題與禮貌請求。',questions:['native-460-v2-final']}
];
export default {revision:2,summary:'用 bubbles under the screen protector 指出貼膜下面困住的空氣泡。',steps,questions,takeaways:['There are bubbles under the screen protector.','Do you want me to redo it?'],completionTitle:'你能指出貼膜氣泡並禮貌請求重貼。'};
