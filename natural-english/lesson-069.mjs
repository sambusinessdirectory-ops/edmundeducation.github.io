import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-069-v2-audio','audio','只聽主人一句話。客人被邀請做甚麼？',
    ['自己取用眼前提供的食物。','幫主人打掃房間。','立刻離開家裏。','替主人點外賣。'],
    '自己取用眼前提供的食物。','Help yourself. 在食物已供客人取用時，是「請自己拿／不用客氣」。'),
  mc('native-069-v2-scene','scene','朋友到你家，桌上有零食。他問 Can I have some chips? 你樂意讓他自己拿。哪句自然？',
    ['Of course. Help yourself.','No. Help me eat all of it.','Please prepare dinner for me.','I have no idea where the chips are.'],
    'Of course. Help yourself.','先允許，再表示對方可以自己從桌上取用。'),
  mc('native-069-v2-transfer','transfer','兩位客人同時來，你想對兩人說「桌上點心請自己拿」。哪種形式配合兩位聽眾？',
    ['Help yourselves to the snacks.','Help yourself to the snacks.','Help myself to the snacks.','Help him to the snacks.'],
    'Help yourselves to the snacks.','對多位客人說話時，反身代名詞要用 yourselves。'),
  mc('native-069-v2-branch','branch','客人看着雪櫃，裏面有你私人的晚餐和桌上給客人的零食。你只想讓他拿桌上的零食。哪句界線最清楚？',
    ['Help yourself to the snacks on the table.','Help yourself to everything in my fridge.','Take any food in this house without asking.','Please do not eat anything at all.'],
    'Help yourself to the snacks on the table.','Help yourself 要配合實際提供範圍；加 on the table 避免讓客人誤拿私人晚餐。'),
  open('native-069-v2-continue','continue','客人說 Thanks, I’ll take a cookie. 你剛邀請他自己拿桌上餅乾。用一句簡短自然英文回應。',
    ['Sure, help yourself.','Of course—go ahead.','Please do. There are plenty.'],
    '客人已明白可以拿；簡短確認即可，不用再重複整段說明。')
];

const steps=[
  {id:'native-069-v2-audio',style:'audio',label:'聽出邀請',title:'主人准你做甚麼？',intro:'先只聽一句招待客人的話。',model:'Help yourself.',zh:'請自己拿／不用客氣。',audioOnly:true,questions:['native-069-v2-audio']},
  {id:'native-069-v2-scene',style:'scene',label:'桌上零食',title:'朋友想拿薯片',intro:'在清楚提供食物的情況下使用這句。',questions:['native-069-v2-scene']},
  {id:'native-069-v2-transfer',style:'transfer',label:'兩位客人',title:'yourself 變 yourselves',intro:'聽眾人數改變，說法也要改。',questions:['native-069-v2-transfer']},
  {id:'native-069-v2-speak',style:'speak',label:'口頭招待',title:'請朋友自己拿',intro:'先自己說；錄音或跳過後才聽示範。',model:'Help yourself.',zh:'請自己拿。',speakingPrompt:'朋友問：Can I have one of these cookies? 桌上的餅乾本來就給客人吃。',recording:'phrase',questions:[]},
  {id:'native-069-v2-branch',style:'branch',label:'說清範圍',title:'桌上零食，不是整個雪櫃',intro:'有禮招待也要明確。',questions:['native-069-v2-branch']},
  {id:'native-069-v2-continue',style:'continue',label:'簡短接話',title:'客人拿了一塊餅乾',intro:'確認對方可以拿，讓對話自然結束。',questions:['native-069-v2-continue']}
];

export default {revision:2,summary:'用 Help yourself/yourselves 邀客人自行取用，並清楚界定提供的食物。',steps,questions,takeaways:['Help yourself.','Help yourselves.'],completionTitle:'你能自然招待一位或多位客人，也能清楚說明可取用甚麼了！'};
