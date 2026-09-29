import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-088-v2-audio','audio','只聽這個詞。它通常指窗邊哪種東西？',
    ['可以開合或調整光線的百葉窗。','放在地上的小地毯。','牆上的掛畫。','裝在桌上的燈泡。'],
    '可以開合或調整光線的百葉窗。','blinds 指窗邊用來遮光或調節光線的百葉窗；不是窗簾以外的室內物品。'),
  mc('native-088-v2-scene','scene','午後陽光照到電腦螢幕，窗邊裝的是一片片橫向葉片。你想請同事擋光，哪句清楚？',
    ['Could you close the blinds a little?','Could you close the window a little?','Could you turn off the overhead lights?','Could you move the laptop away?'],
    'Could you close the blinds a little?','光從百葉窗透入，調整 blinds 能針對光源；關窗、關室內燈或搬電腦都沒有直接說到窗邊的遮光物。'),
  mc('native-088-v2-repair','repair','朋友把 blinds 理解成「所有窗戶」。你怎樣修正？',
    ['它指窗邊遮光的百葉窗，不是玻璃窗本身。','它是窗戶外的停車位。','它只指房間裡的牆。','它是把燈光調亮的開關。'],
    '它指窗邊遮光的百葉窗，不是玻璃窗本身。','要分清遮光裝置 blinds 和窗戶 window；關百葉窗不代表把玻璃窗關上。'),
  mc('native-088-v2-tone','tone','你在別人的辦公室，光線有點刺眼。哪個請求既清楚又有禮？',
    ['Would you mind closing the blinds a little?','Close everything now.','Your office is terrible.','Turn off the whole building.'],
    'Would you mind closing the blinds a little?','Would you mind 用來禮貌提出請求；a little 讓對方知道毋須完全遮黑。'),
  open('native-088-v2-final','scene','你在朋友家看電影，窗邊的百葉窗仍開著，光照到螢幕。請用英文說明問題，並禮貌請朋友關上一點百葉窗。',
    ["The light is hitting the screen. Could you close the blinds a little?","It's too bright to see the screen. Would you mind closing the blinds a bit?","There's a lot of glare. Can we close the blinds a little?"],
    '先交代光線造成的問題，再用 blinds 指明要調整的東西；a little 或 a bit 表示不用全關。')
];
const steps=[
  {id:'native-088-v2-audio',style:'audio',label:'聽出物件',title:'窗邊一片片葉片',intro:'先只聽詞，再找出室內物件。',model:'blinds',zh:'百葉窗。',audioOnly:true,questions:['native-088-v2-audio']},
  {id:'native-088-v2-repair',style:'repair',label:'分清窗與簾',title:'blinds 不是玻璃窗',intro:'修正容易混淆的指稱。',questions:['native-088-v2-repair']},
  {id:'native-088-v2-speak',style:'speak',label:'即時口說',title:'光太刺眼',intro:'先自己說；錄音或跳過後才聽示範。',model:'Close the blinds.',zh:'把百葉窗關上。',speakingPrompt:'你想告訴同伴把窗邊的百葉窗關上。先試著說。',recording:'phrase',questions:[]},
  {id:'native-088-v2-tone',style:'tone',label:'換成請求',title:'在別人的辦公室',intro:'把命令改成有禮的請求。',questions:['native-088-v2-tone']},
  {id:'native-088-v2-scene',style:'scene',label:'電影夜挑戰',title:'只擋一點光',intro:'自己組織一句問題和一句請求。',questions:['native-088-v2-scene','native-088-v2-final']}
];
export default {revision:2,summary:'認識 blinds，並能依場合請別人關上一點百葉窗。',steps,questions,takeaways:['blinds','Close the blinds.'],completionTitle:'你能指明百葉窗，也能有禮地請別人調整光線。'};
