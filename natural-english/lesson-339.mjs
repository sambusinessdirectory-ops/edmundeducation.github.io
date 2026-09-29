import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-339-v2-audio','audio','只聽這句描述。魔術貼的問題最可能是甚麼？',
    ['用了很久，現在黏不牢。','剛買回來，還未貼上。','拉鍊被布咬住。','鞋底整片脫落。'],
    '用了很久，現在黏不牢。','has worn out 說的是因長期使用而失效，不是暫時沒有把它壓緊。'),
  mc('native-339-v2-scene','scene','鞋帶旁的魔術貼仍可貼上，但走幾步便自己鬆開；你用了這雙鞋多年。哪句最貼切？',
    ["The Velcro has worn out.","The Velcro is brand new.","The shoelace has snapped off.","The shoe is too small for my foot."],
    "The Velcro has worn out.",'仍能貼上卻很快鬆開，加上長期使用，支持魔術貼磨損失效。'),
  mc('native-339-v2-repair','repair','朋友說 The Velcro is broken because I forgot to press it once；但它每次貼上都很快鬆開。哪個修正更準？',
    ["It looks worn out; it won’t stay fastened anymore.","It was never attached to the shoe.","It only needs one more press, and then it will last forever.","The zipper has come off, not the Velcro."],
    "It looks worn out; it won’t stay fastened anymore.",'反覆鬆開是持續失效的跡象；不應只歸因於某次沒有壓緊。'),
  mc('native-339-v2-contrast','contrast','下列哪個情況不宜直接斷定魔術貼已磨損？',
    ['貼面沾滿可清掉的毛絮，清潔前還未試過。','清潔後仍完全黏不住。','用了多年，兩面已磨得平滑。','每次扣好不久都自行鬆開。'],
    '貼面沾滿可清掉的毛絮，清潔前還未試過。','毛絮可能暫時阻礙黏合；清潔後仍失效，才更有理由說 worn out。'),
  open('native-339-v2-final','final','最後挑戰：你背包上的魔術貼用了多年，現在每次扣好很快又彈開。用兩句英文向朋友說明觀察到的情況，並說你可能要更換它。',
    ["The Velcro on my bag has worn out; it keeps coming open. I may need to replace the strap.","This Velcro doesn’t stay fastened anymore. I think I’ll have to replace it.","The fastening keeps popping open, even when I press it down. The Velcro may be worn out."],
    '先描述反覆鬆開，再判斷魔術貼可能磨損；提出更換時不必聲稱整個背包壞了。')
];
const steps=[
  {id:'native-339-v2-audio',style:'audio',label:'聽出損耗',title:'黏力逐漸變差',intro:'先聽句子，不看字稿。',model:'The Velcro has worn out.',zh:'魔術貼用久已經磨損了。',audioOnly:true,questions:['native-339-v2-audio']},
  {id:'native-339-v2-scene',style:'scene',label:'看使用情境',title:'扣好又鬆開',intro:'鞋上的魔術貼用了多年。',questions:['native-339-v2-scene']},
  {id:'native-339-v2-repair',style:'repair',label:'修正原因',title:'不是忘記壓緊一次',intro:'用反覆出現的現象修正說法。',questions:['native-339-v2-repair']},
  {id:'native-339-v2-contrast',style:'contrast',label:'先排除毛絮',title:'磨損還是暫時被堵',intro:'判斷何時還不能下結論。',questions:['native-339-v2-contrast']},
  {id:'native-339-v2-speak',style:'speak',label:'即場口說',title:'解釋魔術貼失效',intro:'先自己說；錄音或跳過後才聽示範。',model:'The Velcro has worn out.',zh:'魔術貼用久已經磨損了。',speakingPrompt:'鞋上的魔術貼每次扣好都很快鬆開。',recording:'phrase',questions:[]},
  {id:'native-339-v2-final',style:'final',label:'背包情境挑戰',title:'描述現象再提出處理',intro:'自行寫兩句，不看示範。',questions:['native-339-v2-final']}
];
export default {revision:2,summary:'用 worn out 描述長期使用後魔術貼黏不牢，並分辨暫時被毛絮堵住。',steps,questions,takeaways:['The Velcro has worn out.','It’s worn out.'],completionTitle:'你能說清魔術貼反覆鬆開的問題，並判斷是否可能磨損。'};
