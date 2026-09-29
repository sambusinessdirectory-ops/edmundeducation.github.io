import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-018-v2-reverse','reverse',
    '餐牌旁寫着 sauce on the side。食物端上來時，你應該預期甚麼？',
    ['醬另外裝，不直接淋在食物上。','醬比平常多一份。','完全沒有醬。','只把醬淋在食物的一邊。'],
    '醬另外裝，不直接淋在食物上。',
    'on the side 在餐廳通常表示醬另外放；它不表示份量加倍，也不是「只淋半邊」。'),
  mc('native-018-v2-audio','audio',
    '只聽客人一句話。她希望店員怎樣處理沙律醬？',
    ['另外裝在旁邊。','直接拌進沙律。','多加兩份。','完全不要沙律醬。'],
    '另外裝在旁邊。',
    'Can I get the dressing on the side? 是請店員把沙律醬另外裝，讓客人自己決定加多少。'),
  mc('native-018-v2-contrast','contrast',
    '你仍想要原本份量的醬，但不想它淋在食物上。哪個請求比「多給一份醬」更準確？',
    ['Can I get the sauce on the side?','Can I get extra sauce?','Can I get it without sauce?','Can you mix in the sauce?'],
    'Can I get the sauce on the side?',
    'on the side 改的是擺放方式；extra sauce 改的是份量，without sauce 則是不要醬。'),
  blank('native-018-v2-repair','repair',
    '你想要沙律醬，但要另外放。剛才你說成 No dressing, please. 請把這句改成完整、自然的請求。',
    ['Can I get the dressing on the side?','Could I get the dressing on the side?','Can you put the dressing on the side?','Could you put the dressing on the side?'],
    '保留沙律醬，只改變它的擺放方式。',
    'Can I get the dressing on the side? 表示仍要沙律醬，但不要直接淋在食物上。')
];

const steps=[
  {id:'native-018-v2-reverse',style:'reverse',label:'看懂餐牌',title:'醬在 side 是甚麼意思？',intro:'先從英文還原服務方式，別把它理解成加量。',questions:['native-018-v2-reverse']},
  {id:'native-018-v2-audio',style:'audio',label:'聽客人要求',title:'客人想怎樣處理沙律醬？',intro:'先只聽聲音，完成判斷後才看文字。',model:'Can I get the dressing on the side?',zh:'沙律醬可以另外放嗎？',audioOnly:true,questions:['native-018-v2-audio']},
  {id:'native-018-v2-contrast',style:'contrast',label:'比對需要',title:'另外放、加量、完全不要',intro:'三種要求都可能合理；這次要說準哪一種。',questions:['native-018-v2-contrast']},
  {id:'native-018-v2-repair',style:'repair',label:'修正點餐',title:'你不是不要醬',intro:'把錯說成「不要」的句子改成真正需要的服務。',questions:['native-018-v2-repair']},
  {id:'native-018-v2-speak',style:'speak',label:'開口點餐',title:'點沙律時，自己說一次',intro:'先向店員提出請求，錄音或跳過後才看示範。',model:'Can I get the dressing on the side?',zh:'沙律醬可以另外放嗎？',speakingPrompt:'店員：Would you like dressing on the salad? 你想要醬，但希望另外裝。',recording:'phrase',questions:[]}
];

export default {revision:2,summary:'分清醬另外放、加量和完全不要，並在點餐時提出清楚的請求。',steps,questions,takeaways:['sauce on the side','Can I get the dressing on the side?'],completionTitle:'你能清楚要求把醬另外放了！'};
