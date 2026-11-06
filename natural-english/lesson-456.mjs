import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-456-v2-audio','audio','只聽文具問題。墨水到了哪裏？',['穿過紙，弄到背面。','只在正面擴散。','在筆尖乾掉。','沾到桌面但沒有穿紙。'],'穿過紙，弄到背面。','bled through 指墨水滲透紙張到另一面，不只是正面筆畫變闊。'),
  mc('native-456-v2-detail','detail','你翻開筆記本，下一頁也有剛才圖案的墨印。哪個細節顯示 marker bled through？',['背頁有對應的墨痕。','正面的顏色很深。','筆尖畫得很粗。','頁角被折起。'],'背頁有對應的墨痕。','背面出現相同位置的墨跡，才證明墨水穿過紙；正面顏色深並不足以判斷。'),
  mc('native-456-v2-repair','repair','同學說 The marker leaked，但筆身沒有漏墨，墨只穿過薄紙。應怎樣改？',["The marker bled through the paper.","The marker ran out of ink.","The marker smeared on the front.","The marker leaked from its cap."],"The marker bled through the paper.",'bleed through 描述紙張被墨水滲透；leak 是筆本身漏墨。'),
  mc('native-456-v2-branch','branch','你要繼續用麥克筆在薄紙上畫，現在背頁已沾墨。哪個補救最合情境？',["Put another sheet underneath.","Press harder so the lines stay sharp.","Use the same marker on the next page.","Fold the paper before drawing."],"Put another sheet underneath.",'墊一張紙可保護下面頁面；加壓或直接換頁仍可能滲透。'),
  open('native-456-v2-speak','speak','看到墨水透到紙背面，先說一個英文句子描述問題，再聽示範。',["The marker bled through the paper.","The ink bled through this thin page."],'用 bled through 表示墨水穿透紙，不把它說成筆漏墨。'),
  open('native-456-v2-explain','explain','朋友問你為何要在紙下面墊一張。用兩句英文說明剛才發生甚麼，以及墊紙的用途。',["The marker bled through the paper. I'm putting a sheet underneath so it won't mark the next page.","The ink went right through this page. An extra sheet will protect the one below."],'解釋穿紙的問題，並把墊紙與保護下一頁連起來。')
];
const steps=[
  {id:'native-456-v2-audio',style:'audio',label:'先聽墨痕',title:'薄紙上的圖案',intro:'判斷墨水去了哪裏。',model:'The marker bled through the paper.',zh:'麥克筆墨水透到紙背面。',audioOnly:true,questions:['native-456-v2-audio']},
  {id:'native-456-v2-detail',style:'detail',label:'翻到背面',title:'找穿透的證據',intro:'看下一頁的墨痕。',questions:['native-456-v2-detail']},
  {id:'native-456-v2-repair',style:'repair',label:'修正說法',title:'筆沒漏墨',intro:'區分文具漏墨與紙張滲透。',questions:['native-456-v2-repair']},
  {id:'native-456-v2-branch',style:'branch',label:'決定下一步',title:'還想繼續畫',intro:'怎樣保護下面的紙？',model:'Put another sheet underneath.',zh:'在下面墊另一張紙。',questions:['native-456-v2-branch']},
  {id:'native-456-v2-speak',style:'speak',label:'親口描述',title:'背面也有墨',intro:'先說再核對。',model:'The marker bled through the paper.',zh:'麥克筆墨水透過紙。',speakingPrompt:'看見紙背面的墨痕，先口頭向同學指出問題。',recording:'phrase',questions:['native-456-v2-speak']},
  {id:'native-456-v2-explain',style:'explain',label:'說明墊紙',title:'告訴朋友原因',intro:'寫兩句連起問題與做法。',questions:['native-456-v2-explain']}
];
export default {revision:2,summary:'用 bleed through 描述麥克筆墨水穿過薄紙，並說明墊紙補救。',steps,questions,takeaways:['The marker bled through the paper.','Put another sheet underneath.'],completionTitle:'你能指出墨水穿紙，並解釋怎樣保護下一頁。'};
