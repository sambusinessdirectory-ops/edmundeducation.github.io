import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-377-v2-audio','audio','聽完這句對皮膚的描述，表面最可能怎樣？',['因乾燥而一小片一小片脫屑。','被熱油燙出水泡。','整片皮膚完全失去感覺。','皮膚上有一處木刺。'],'因乾燥而一小片一小片脫屑。','flaky 描述皮膚表面有細小乾屑，不等於水泡或麻木。'),
  mc('native-377-v2-contrast','contrast','朋友說「The coating is flaking off」，但你要形容的是自己面頰乾燥脫屑。哪句主語和用法都對？',["My skin is flaky.","My skin's coating is peeling from a pan.","My face has burnt-on food.","The wallpaper on my cheek is peeling."],"My skin is flaky.",'形容皮膚的乾屑可用 flaky；鍋塗層剝落是另一個物件和動作。'),
  mc('native-377-v2-rewrite','rewrite','你想向朋友說冬天面頰狀況，原稿只寫「My face is bad」。哪句較具體？',["My skin is dry and flaky around my cheeks.","My face has no skin at all.","My cheeks are wet from swimming.","My face is covered with ink."],"My skin is dry and flaky around my cheeks.",'補上乾燥、脫屑和位置，朋友才能明白具體外觀。'),
  open('native-377-v2-final','final','新情境：天氣乾，你洗臉後面頰有細小乾屑，同事問你是否換了護膚品。寫兩句英文描述皮膚現況和可能的天氣原因。',["My skin has been dry and flaky lately. I think the cold weather is making it worse.","I've noticed flaky patches on my cheeks after washing. The dry weather may be affecting my skin.","My cheeks are a little flaky right now. It might be because the air has been so dry."],'自評時看是否說清表面乾屑和位置，並把天氣原因說成可能而非已證實。')
];
const steps=[
  {id:'native-377-v2-audio',style:'audio',label:'聽出皮膚外觀',title:'表面有細小乾屑？',intro:'聽示範時留意皮膚表面，而不是疼痛程度。',model:'My skin is flaky.',zh:'我的皮膚一片片脫屑。',audioOnly:true,questions:['native-377-v2-audio']},
  {id:'native-377-v2-contrast',style:'contrast',label:'皮膚與鍋面',title:'同字根，不同物件',intro:'分清皮膚乾屑與鍋塗層脫落。',questions:['native-377-v2-contrast']},
  {id:'native-377-v2-rewrite',style:'rewrite',label:'具體說面頰',title:'別只說 bad',intro:'補上外觀和位置。',questions:['native-377-v2-rewrite']},
  {id:'native-377-v2-speak',style:'speak',label:'口頭描述',title:'冬天皮膚脫屑',intro:'先自己說；錄音或跳過後才聽示範。',model:'My skin is flaky.',zh:'我的皮膚一片片脫屑。',speakingPrompt:'面頰乾燥，表面有細小皮屑。簡短描述。',recording:'phrase',questions:[]},
  {id:'native-377-v2-final',style:'final',label:'冬天挑戰',title:'向同事描述面頰',intro:'把觀察和可能原因各寫清楚。',questions:['native-377-v2-final']}
];
export default {revision:2,summary:'用 flaky 描述皮膚乾燥脫屑，並與塗層剝落的 flaking off 區分。',steps,questions,takeaways:['My skin is flaky.'],completionTitle:'你能具體描述乾燥脫屑，並說明可能背景。'};
