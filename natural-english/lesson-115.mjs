import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-115-v2-audio','audio','只聽水果的描述。挑選時應留意哪種痕跡？',['被碰撞或擠壓後的軟褐色一塊。','表面有均勻成熟的紅色。','表皮有一處淺淺的刮痕。','果皮上有一處自然深色花紋。'],'被碰撞或擠壓後的軟褐色一塊。','bruised 描述碰撞、擠壓後的瘀傷，不等於成熟的顏色。'),
  mc('native-115-v2-scene','scene','梨掉到地上，隔天一邊變軟又變褐。你向店員指出問題，哪句最準確？',["This pear is bruised.","This pear is frozen.","This pear is peeled.","This pear is sliced."],"This pear is bruised.",'軟而褐的受壓部位是 bruise；其餘說的是冰凍、去皮或切開。'),
  mc('native-115-v2-detail','detail','朋友說蘋果只是表皮有一小處刮痕。哪個額外細節才支持「撞傷」而非刮花？',['刮痕下方的果肉變軟。','表面顏色比旁邊那顆深一點。','表皮仍有自然光澤。','這顆蘋果是今天才買的。'],'刮痕下方的果肉變軟。','bruised 涉及受壓造成的組織變色、變軟；單是淺表刮痕不足以判定。'),
  mc('native-115-v2-repair','repair','客人指著被壓出軟褐斑的蘋果，卻說 It’s scratched。怎樣修正更貼切？',["The apple is bruised.","The apple is scratched.","The apple is overripe.","The apple is wilted."],"The apple is bruised.",'受壓後的軟褐斑是 bruise；scratch 只是表面刮痕，wilted 多說葉菜失水。'),
  open('native-115-v2-explain','explain',"水果表皮有褐色斑，但你還不肯定是否撞傷。寫一兩句說明還要觀察甚麼，才會選用 bruised。",["I'd check whether that spot feels soft. A bruise is more than a surface color change.", "If the brown patch is soft from being pressed, I'd call the fruit bruised."],"褐色本身未必是撞傷；觸摸有否受壓變軟，才能把它和自然色差區分。"),
];
const steps=[
  {id:'native-115-v2-audio',style:'audio',label:'先聽描述',title:'水果碰傷了？',intro:'不看文字，聽出水果出了甚麼問題。',model:'The fruit is bruised.',zh:'水果撞傷了。',audioOnly:true,questions:['native-115-v2-audio']},
  {id:'native-115-v2-scene',style:'scene',label:'掉落的梨',title:'軟褐色的傷處',intro:'根據具體經過選用詞。',questions:['native-115-v2-scene']},
  {id:'native-115-v2-detail',style:'detail',label:'摸出分別',title:'刮痕還是撞傷？',intro:'找出能改變判斷的細節。',questions:['native-115-v2-detail']},
  {id:'native-115-v2-repair',style:'repair',label:'改準用字',title:'不只是表面刮花',intro:'修正過於表面的描述。',questions:['native-115-v2-repair']},
  {id:'native-115-v2-speak',style:'speak',label:'口頭提醒',title:'告訴同伴別拿這個',intro:'先自己說；錄音或跳過後再聽示範。',model:'The apple is bruised.',zh:'這蘋果撞傷了。',speakingPrompt:'同伴正準備拿一個有軟褐斑的蘋果。用英文提醒他。',recording:'phrase',questions:[]},
  {id:'native-115-v2-explain',style:'explain',label:'說明依據',title:'怎樣知道是碰傷？',intro:'把形容詞連到可觀察的證據。',questions:['native-115-v2-explain']}
];
export default {revision:2,summary:'用 bruised 描述水果因碰撞或擠壓而變軟、變褐，與表面刮痕區分。',steps,questions,takeaways:['The fruit is bruised.','The apple is bruised.'],completionTitle:'你能根據觸感和斑點，準確說明水果撞傷了。'};
