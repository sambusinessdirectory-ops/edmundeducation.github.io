import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-280-v2-audio','audio','先聽這句浴室描述。哪個部位變了？',['磁磚之間的填縫料顏色改變。','磁磚本身碎成兩塊。','浴室燈由白色變黃色。','水管突然破裂。'],'磁磚之間的填縫料顏色改變。','grout 是磚與磚之間的填縫料；discolored 說顏色已變。'),
  mc('native-280-v2-detail','detail','浴室磁磚仍是白色且完好。哪個觀察最支持 grout is discolored？',['磚縫原本白色，如今多處變灰黃。','幾塊磁磚中央出現裂紋。','鏡子表面有水點。','地板上有一滴清水。'],'磚縫原本白色，如今多處變灰黃。','要看的是磚縫的顏色；磁磚碎裂和鏡面水點是不同部位。'),
  mc('native-280-v2-contrast','contrast','家人說：「The tiles are dirty.」你看到磚面乾淨，只是磚縫變色。哪句更精確？',["The grout is discolored.","The tiles are cracked.","The sink is leaking.","The wallpaper is peeling."],"The grout is discolored.",'grout 把部位定位在磚縫；discolored 不必斷定變色一定由黴造成。'),
  mc('native-280-v2-explain','explain','為何不宜單憑磚縫變灰便斷言「The grout is moldy」？',['變色可有不同原因；目前只確定顏色變了。','因為 grout 是磁磚表面的名稱。','因為 moldy 只可用來形容麵包。','因為灰色填縫料必定是新的。'],'變色可有不同原因；目前只確定顏色變了。','discolored 限定在可見的顏色變化，避免把尚未確認的黴當成事實。'),
  mc('native-280-v2-rewrite','rewrite','你要傳維修訊息，原稿只寫「Bathroom looks bad」。哪句能讓對方知道應檢查哪裏？',["The tiles look fine, but the grout between them is discolored.","The whole bathroom has disappeared.","Every tile is shattered across the floor.","The shower stopped producing hot water."],"The tiles look fine, but the grout between them is discolored.",'訊息同時指出磚面正常、磚縫變色，讓清潔範圍更清楚。'),
  open('native-280-v2-final','final','新情境：你剛清潔廚房，磁磚表面已乾淨，但磚縫仍由白變黃。寫兩句英文向家人描述，並提出下一步。',["The grout is discolored even though the tiles are clean. We may need to scrub the grout separately.","The tiles look clean, but the grout has turned yellow. Let's try a deeper clean there.","The grout between the tiles is discolored. I think we should clean the joints more thoroughly."],'自評時確認你指出的是磚縫變色，並給出與清潔磚縫相關的下一步。')
];
const steps=[
  {id:'native-280-v2-audio',style:'audio',label:'聽出部位',title:'磁磚還是磚縫？',intro:'先聽，不看英文描述。',model:'The grout is discolored.',zh:'磁磚縫變色了。',audioOnly:true,questions:['native-280-v2-audio']},
  {id:'native-280-v2-detail',style:'detail',label:'觀察變化',title:'白色磚縫變灰黃',intro:'辨認真正變色的位置。',questions:['native-280-v2-detail']},
  {id:'native-280-v2-contrast',style:'contrast',label:'修準部位',title:'磚面其實乾淨',intro:'比較泛說磁磚髒與精確描述磚縫。',questions:['native-280-v2-contrast']},
  {id:'native-280-v2-explain',style:'explain',label:'避免推斷',title:'變色不一定是黴',intro:'只根據看到的事下結論。',questions:['native-280-v2-explain']},
  {id:'native-280-v2-rewrite',style:'rewrite',label:'寫維修訊息',title:'指出需要檢查哪裏',intro:'把含糊句子改成具體描述。',questions:['native-280-v2-rewrite']},
  {id:'native-280-v2-final',style:'final',label:'廚房挑戰',title:'清潔後仍變色',intro:'寫兩句，再按示例檢查。',questions:['native-280-v2-final']}
];
export default {revision:2,summary:'用 grout 指磁磚縫的填縫料，準確描述變色而不武斷推測原因。',steps,questions,takeaways:['The grout is discolored.'],completionTitle:'你能指出磚縫變色，讓清潔或維修要求更清楚。'};
