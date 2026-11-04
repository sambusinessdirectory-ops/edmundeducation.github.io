import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-346-v2-audio','audio','先聽這句觸感描述。最可能是哪種痛？',['那一處一碰就痛。','只有走路時才痛。','整隻手臂完全麻木。','皮膚持續很癢。'],'那一處一碰就痛。','tender to the touch 指碰到或輕按時會痛，強調觸碰。'),
  mc('native-346-v2-explain','explain','你撞到桌角後外觀不明顯，輕碰卻痛。為何 to the touch 有用？',['它指出疼痛由觸碰引發。','它指出皮膚一定破了。','它指出手臂完全不能移動。','它指出疼痛只在夜晚出現。'],'它指出疼痛由觸碰引發。','這個片語限定觸發方式，不必假定外面有傷口或嚴重瘀青。'),
  mc('native-346-v2-rewrite','rewrite','你要告訴家人手肘的情況，原稿只寫「It hurts」。哪句更具體？',["I hit my elbow, and it's tender to the touch.","My elbow is numb and I can't feel it.","My elbow is itchy but never painful.","I broke the table with my elbow."],"I hit my elbow, and it's tender to the touch.",'加上碰到會痛這個線索，家人便知道疼痛何時出現。'),
  open('native-346-v2-final','final','新情境：你撞到桌角後手臂某處看起來只有輕微紅印，但一碰就痛。寫兩句英文向朋友描述外觀和觸碰時的感覺。',["It only looks a little red, but it's tender to the touch. I bumped it on the table.","There's barely a mark on my arm. It's still tender whenever I touch that spot.","My arm doesn't look badly bruised. The area is tender to the touch, though."],'自評時看是否區分外觀輕微與碰到會痛，避免把 tender 當成持續劇痛。')
];
const steps=[
  {id:'native-346-v2-audio',style:'audio',label:'聽出觸發方式',title:'甚麼時候會痛？',intro:'辨認碰到撞傷位置時才痛的線索。',model:'It’s tender to the touch.',zh:'一碰就痛。',audioOnly:true,questions:['native-346-v2-audio']},
  {id:'native-346-v2-explain',style:'explain',label:'拆解片語',title:'to the touch 的作用',intro:'把疼痛與觸碰連起來。',questions:['native-346-v2-explain']},
  {id:'native-346-v2-rewrite',style:'rewrite',label:'說得更具體',title:'比 It hurts 多一點資訊',intro:'補上受傷位置及觸碰感覺。',questions:['native-346-v2-rewrite']},
  {id:'native-346-v2-speak',style:'speak',label:'口頭描述',title:'撞到桌角的手臂',intro:'先自己說；錄音或跳過後才聽示範。',model:'It’s tender to the touch.',zh:'一碰就痛。',speakingPrompt:'撞到桌角的地方，輕輕一碰便痛。用一句英文描述感覺。',recording:'phrase',questions:[]},
  {id:'native-346-v2-final',style:'final',label:'手臂挑戰',title:'外觀輕微卻觸碰痛',intro:'分開描述輕微紅印與觸碰時的痛。',questions:['native-346-v2-final']}
];
export default {revision:2,summary:'用 tender to the touch 說明撞傷位置觸碰時會痛，即使外觀看來不嚴重。',steps,questions,takeaways:['It’s tender to the touch.'],completionTitle:'你能具體描述觸碰時的疼痛感。'};
