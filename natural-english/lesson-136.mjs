import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-136-v2-audio','audio','只聽螢幕的狀況。最可能影響看字的是甚麼？',['指紋和油印令畫面模糊。','玻璃表面出現幾道細小刮痕。','螢幕完全沒有電。','螢幕亮度被調得太低。'],'指紋和油印令畫面模糊。','smudged 指擦污的模糊痕跡，常來自手指油脂，而非裂痕或缺電。'),
  mc('native-136-v2-explain','explain','為何說 smudged 而不是 cracked？',['玻璃完整，只是表面有可擦掉的油印。','玻璃有一道深裂紋。','螢幕完全黑掉。','保護貼邊緣翹起。'],'玻璃完整，只是表面有可擦掉的油印。','smudge 是表面污痕，通常能擦走；crack 是玻璃本身裂開。'),
  mc('native-136-v2-continue','continue','朋友說 I can barely see the map on your phone。你的螢幕滿是指紋，怎樣接話？',["Sorry, the screen is smudged. Let me wipe it.","The display looks dim; try raising the brightness.","The screen protector has a scratch across the map.","The photo itself looks blurry on my phone."],"Sorry, the screen is smudged. Let me wipe it.",'說明模糊是可擦掉的表面油印，並立即提出擦乾淨的做法。'),
  open('native-136-v2-final','final','最後挑戰：朋友想看你手機上的相片，但螢幕滿是指紋和油痕。寫兩句英文解釋他為何看不清楚，以及你現在會怎樣做。',["The screen is smudged with fingerprints. I'll wipe it so you can see the photo.","Sorry, there are smudges all over the screen. Give me a second to clean it."],'因為螢幕表面有可擦掉的指紋油痕，所以先說 smudged，再提出擦乾淨給朋友看相片。')
];
const steps=[
  {id:'native-136-v2-audio',style:'audio',label:'聽出問題',title:'字怎麼看不清？',intro:'先只聽螢幕描述。',model:'The screen is smudged.',zh:'螢幕滿是模糊污痕。',audioOnly:true,questions:['native-136-v2-audio']},
  {id:'native-136-v2-explain',style:'explain',label:'找出分別',title:'油印還是裂痕？',intro:'判斷能否擦掉。',questions:['native-136-v2-explain']},
  {id:'native-136-v2-continue',style:'continue',label:'接住朋友',title:'地圖看不清',intro:'解釋並處理眼前問題。',questions:['native-136-v2-continue']},
  {id:'native-136-v2-speak',style:'speak',label:'口頭說明',title:'滿螢幕指紋',intro:'先自己說；錄音或跳過後才聽示範。',model:'There are smudges all over the screen.',zh:'螢幕到處都是污痕。',speakingPrompt:'同事想看你的手機，但螢幕滿是指紋。口頭解釋。',recording:'phrase',questions:[]},
  {id:'native-136-v2-final',style:'final',label:'相片挑戰',title:'先擦再看',intro:'自己說明原因和下一步。',questions:['native-136-v2-final']}
];
export default {revision:2,summary:'用 smudged 描述螢幕上可擦掉的指紋油印，與玻璃裂開區分。',steps,questions,takeaways:['The screen is smudged.','There are smudges all over the screen.'],completionTitle:'你能說清螢幕為何模糊，並提出簡單處理方法。'};
