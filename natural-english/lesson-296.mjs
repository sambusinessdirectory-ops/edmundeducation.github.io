import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-296-v2-audio','audio','只聽這句身體狀況。哪個部位在不由自主地動？',['眼皮。','臉頰。','整隻手臂。','腳踝。'],'眼皮。','eyelid 是眼皮；twitching 是輕微、不受控的抽動。'),
  mc('native-296-v2-reverse','reverse','你坐着時上眼皮反覆輕輕跳，自己無法控制。哪句對應？',["My eyelid keeps twitching.","My cheek keeps twitching.","My eye keeps watering.","My eyelid is swollen shut."],"My eyelid keeps twitching.",'eyelid 鎖定上眼皮，keeps twitching 說明不自主地反覆抽動；其餘選項改了部位或動作。'),
  mc('native-296-v2-explain','explain','句中的 keeps 有甚麼作用？',['表示眼皮跳了又跳，不只一下。','表示眼皮被人固定住。','表示眼睛一直流淚。','表示說話者故意眨眼。'],'表示眼皮跳了又跳，不只一下。','keeps 加 -ing 表示動作持續或反覆出現。'),
  mc('native-296-v2-branch','branch','朋友問：「Has it been doing that all day?」你從早上開始反覆眼皮跳。怎樣回答？',["Yes, my eyelid has been twitching since this morning.","No, my cheek has been swollen all week.","Yes, I've been blinking on purpose.","No, my eyes have changed color."],"Yes, my eyelid has been twitching since this morning.",'朋友問抽動持續多久；since this morning 具體回答時間，也保留眼皮反覆跳的事實。'),
  open('native-296-v2-final','final','新情境：同事看見你一直碰右眼，以為有東西進眼睛。其實右眼皮從早上起反覆跳。寫兩句英文解釋真實狀況和持續時間。',["There's nothing in my eye; my eyelid keeps twitching. It started this morning.","My right eyelid has been twitching since this morning. That's why I keep touching it.","I don't think anything got in my eye. The eyelid has been twitching all morning."],'自評時檢查是否說清楚眼皮反覆抽動，而不是主動眨眼或眼睛入異物。')
];
const steps=[
  {id:'native-296-v2-audio',style:'audio',label:'聽出部位',title:'哪裏在跳？',intro:'聽眼皮是一次跳動還是反覆抽動。',model:'My eyelid keeps twitching.',zh:'我的眼皮一直跳。',audioOnly:true,questions:['native-296-v2-audio']},
  {id:'native-296-v2-reverse',style:'reverse',label:'部位與動作',title:'上眼皮反覆抽動',intro:'從具體感受找英文句子。',questions:['native-296-v2-reverse']},
  {id:'native-296-v2-explain',style:'explain',label:'拆解反覆',title:'keeps 說明甚麼？',intro:'辨認動作出現的頻率。',questions:['native-296-v2-explain']},
  {id:'native-296-v2-branch',style:'branch',label:'回答追問',title:'從早上跳到現在',intro:'接着朋友的時間問題回答。',questions:['native-296-v2-branch']},
  {id:'native-296-v2-final',style:'final',label:'同事誤會',title:'解釋為何摸眼睛',intro:'說明右眼皮反覆抽動，並交代從何時開始。',questions:['native-296-v2-final']}
];
export default {revision:2,summary:'用 eyelid keeps twitching 描述眼皮反覆不自主抽動，並交代開始時間。',steps,questions,takeaways:['My eyelid keeps twitching.'],completionTitle:'你能說清眼皮反覆跳動，也能回答別人的追問。'};
