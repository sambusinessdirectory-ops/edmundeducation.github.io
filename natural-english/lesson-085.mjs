import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-085-v2-audio','audio','只聽這個詞組。說話者描述的是甚麼？',
    ['眼睛周圍有點浮腫。','眼睛看不見東西。','耳朵被水塞住。','額頭流了很多汗。'],
    '眼睛周圍有點浮腫。','puffy eyes 描述眼周看來腫腫的；它本身沒有說是甚麼造成，也不是視力問題。'),
  mc('native-085-v2-scene','scene','你昨晚睡得少，早上照鏡時眼周看起來有點腫。哪句適合向朋友交代？',
    ["My eyes are puffy from lack of sleep.","My eyes are bruised from a fall.","My eyes are out of focus.","My eyes are watering from onions."],
    "My eyes are puffy from lack of sleep.",'這裡要說的是缺睡後的輕微浮腫；其他句子分別指瘀傷、看不清和流淚。'),
  mc('native-085-v2-contrast','contrast','puffy eyes 與 bloodshot eyes 的主要差別是甚麼？',
    ['puffy 著重腫脹外觀；bloodshot 著重眼白發紅、見血絲。','兩者都只指眼鏡鏡片變花。','puffy 只談視力；bloodshot 只談聽力。','兩者都表示眼皮被割傷。'],
    'puffy 著重腫脹外觀；bloodshot 著重眼白發紅、見血絲。','這兩個描述都可在疲倦時出現，但觀察點不同，不能只因為都與眼睛有關便互換。'),
  mc('native-085-v2-reverse','reverse','有人說 I woke up with puffy eyes。中文怎樣轉述才不自行加重病情？',
    ['他睡醒時眼周有點浮腫。','他睡醒後完全失明。','他睡醒後眼睛大量出血。','他睡醒後眼睛被昆蟲螫傷。'],
    '他睡醒時眼周有點浮腫。','puffy 交代外觀有點腫；單靠這句不能推斷嚴重病症或原因。'),
  mc('native-085-v2-explain','explain','朋友說 My eyes are puffy from lack of sleep。句中的 from lack of sleep 在做甚麼？',
    ['交代這次浮腫可能與睡眠不足有關。','把 puffy 改成視力模糊。','表示他已經睡足十小時。','表示眼睛本來就不存在。'],
    '交代這次浮腫可能與睡眠不足有關。','puffy 說狀態；from lack of sleep 接上他提出的原因。兩部分各有作用。'),
  open('native-085-v2-final','final','最後挑戰：你昨晚只睡了幾小時，早上照鏡發現眼周有點浮腫。朋友問 You look tired. Are you okay? 用兩句英文回答，說出所見和原因。',
    ["I'm okay, just tired. My eyes are puffy because I didn't sleep much.","I didn't sleep much last night, so my eyes are a bit puffy.","I'm fine, but my eyes look puffy from lack of sleep."],
    '用 puffy 說眼周的輕微浮腫，再把睡眠不足接上；不必誇大成嚴重眼疾。')
];
const steps=[
  {id:'native-085-v2-audio',style:'audio',label:'先聽外觀',title:'鏡中的眼睛',intro:'只聽詞組，判斷它描述哪個部位與變化。',model:'puffy eyes',zh:'浮腫的眼睛。',audioOnly:true,questions:['native-085-v2-audio']},
  {id:'native-085-v2-scene',style:'scene',label:'早晨情境',title:'睡得少的早上',intro:'把外觀與明確原因連起來。',questions:['native-085-v2-scene']},
  {id:'native-085-v2-contrast',style:'contrast',label:'別混淆',title:'浮腫與血絲',intro:'分辨兩種可見但不同的眼部狀態。',questions:['native-085-v2-contrast']},
  {id:'native-085-v2-reverse',style:'reverse',label:'反向轉述',title:'不要替對方加症狀',intro:'準確轉述而不自行放大。',questions:['native-085-v2-reverse']},
  {id:'native-085-v2-explain',style:'explain',label:'拆開句子',title:'狀態與原因',intro:'看看短句兩部分各說甚麼。',questions:['native-085-v2-explain']},
  {id:'native-085-v2-final',style:'final',label:'鏡前挑戰',title:'向朋友解釋疲態',intro:'新情境，自己回答，沒有選項。',questions:['native-085-v2-final']}
];
export default {revision:2,summary:'用 puffy 描述眼周浮腫，並分清浮腫與眼白血絲。',steps,questions,takeaways:['puffy eyes','My eyes are puffy from lack of sleep.'],completionTitle:'你能準確描述眼周浮腫，也能自然交代睡眠不足。'};
