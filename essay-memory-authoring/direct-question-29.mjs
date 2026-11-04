// Human-authored support for Direct Question 29; exact essay text remains in its source bundle.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-29-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:29'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'Children being overweight is a serious problem for many schools, and some people think schools should give more time to sport to help.',
  'Exercise is useful, but I do not think more PE classes are the best answer.',
  'Changing what children eat and what they do each day at school and home will work better.',
  'More sport at school can help children who weigh too much, but it cannot solve everything.',
  'Sport helps children use energy, grow stronger and feel better about their bodies.',
  'It also means they spend less time sitting or looking at screens.',
  'But a few more hours of sport each week may not help much if children still eat sweet snacks, drink sugary drinks and eat too much food every day.',
  'In other words, exercise may make the body stronger, but unhealthy food keeps harming it.',
  'That is why schools should not see more sport as the main way to solve child obesity.',
  'The most important answer is to change children’s food.',
  'Schools should give healthier lunches, limit unhealthy snacks sold at school and teach children how daily food choices affect their weight.',
  'For example, a child who drinks water instead of sweet drinks and eats fruit instead of packaged snacks may become healthier even if their school schedule stays the same.',
  'Parents must help too, because children usually learn how to eat at home.',
  'If families often cook healthy meals, spend less time with screens and encourage walking or playing outside, healthy actions become normal, not a punishment.',
  'To sum up, more school sport is helpful, but it is not the best answer to children being overweight.',
  'A better answer combines healthier school food, useful lessons about food and steady support from families.',
];
const vocabulary=[
  [['Childhood obesity','Children being overweight','兒童肥胖'],['serious concern','a serious problem','嚴重關注'],['devote more time to sport and exercise','give more time to sport','增加體育運動時間'],['address it','to help','處理問題']],
  [['physical activity','Exercise','體能活動'],['certainly valuable','useful','有價值'],['increasing PE lessons','more PE classes','增加體育課'],['best way to solve this problem','best answer','最佳解法']],
  [['more effective approach','will work better','較有效方法'],['improve children’s diets','Changing what children eat','改善兒童飲食'],['reshape their daily habits','what they do each day','改變日常習慣'],['both inside and outside school','at school and home','校內校外']],
  [['Extra exercise at school','More sport at school','校內增加運動'],['overweight children','children who weigh too much','超重兒童'],['impact is limited','cannot solve everything','作用有限']],
  [['burn energy','use energy','消耗能量'],['build strength','grow stronger','增強體力'],['develop a healthier attitude towards their bodies','feel better about their bodies','對身體更健康的態度']],
  [['reduce the time','spend less time','減少時間'],['sitting in classrooms','sitting','坐在課室'],['staring at screens','looking at screens','盯螢幕']],
  [['additional hours of exercise','more hours of sport','額外運動時數'],['cancelled out','may not help much','被抵消'],['sugary snacks','sweet snacks','含糖零食'],['soft drinks','sugary drinks','汽水'],['oversized portions','too much food','過大份量']],
  [['In other words','In other words','換句話說'],['strengthen the engine','make the body stronger','強化引擎'],['poor diet','unhealthy food','不良飲食'],['pouring the wrong fuel into it','keeps harming it','持續造成傷害']],
  [['For this reason','That is why','因此'],['treat more sports as','see more sport as','把更多運動視為'],['main cure','main way to solve','主要解法'],['childhood obesity','child obesity','兒童肥胖']],
  [['most important solution','most important answer','最重要解法'],['change what children eat','change children’s food','改變孩子飲食']],
  [['provide healthier meals','give healthier lunches','提供健康膳食'],['restrict the sale of junk food on campus','limit unhealthy snacks sold at school','限制校園垃圾食品銷售'],['everyday choices','daily food choices','日常選擇'],['affect their weight','affect their weight','影響體重']],
  [['replace sweet drinks with water','drinks water instead of sweet drinks','用水代替甜飲'],['processed snacks with fruit','eats fruit instead of packaged snacks','用水果代替加工零食'],['likely to make progress','may become healthier','可能有進展'],['without dramatic changes to their timetable','even if their school schedule stays the same','不大改課表']],
  [['Parents must also be involved','Parents must help too','父母須參與'],['eating patterns','how to eat','飲食習慣'],['formed at home','learn how to eat at home','在家形成']],
  [['balanced meals','healthy meals','均衡膳食'],['limit screen time','spend less time with screens','限制螢幕時間'],['outdoor play','playing outside','戶外玩耍'],['healthy behaviour','healthy actions','健康行為'],['normal part of life','become normal','生活正常部分'],['rather than a punishment','not a punishment','而非懲罰']],
  [['In conclusion','To sum up','總結'],['useful measure','helpful','有用措施'],['not the best solution','not the best answer','非最佳解法'],['overweight children','children being overweight','超重兒童']],
  [['stronger answer','better answer','更有效做法'],['combination of','combines','結合'],['healthier school food','healthier school food','健康校園食物'],['practical nutrition education','useful lessons about food','實用營養教育'],['consistent support from families','steady support from families','家庭持續支持']],
];
const chunkOverrides=[
  ['Childhood obesity has become a serious concern','in many education systems,','and some people argue that schools should devote','more time to sport and exercise to address it.'],
  ['Although physical activity is certainly valuable,','I do not believe that increasing PE lessons','is the best way to solve this problem.'],
  ['A more effective approach is to improve children’s diets','and reshape their daily habits both inside and outside school.'],
  ['Extra exercise at school can help overweight children,','but its impact is limited.'],
  ['Sport allows pupils to burn energy, build strength','and develop a healthier attitude towards their bodies.'],
  ['It can also reduce the time they spend','sitting in classrooms or staring at screens.'],
  ['However, a few additional hours of exercise each week','can easily be cancelled out','if children continue to eat sugary snacks,','drink soft drinks and consume oversized portions every day.'],
  ['In other words, exercise may strengthen the engine,','but poor diet keeps pouring the wrong fuel into it.'],
  ['For this reason, schools should not treat more sports','as the main cure for childhood obesity.'],
  ['The most important solution is','to change what children eat.'],
  ['Schools should provide healthier meals,','restrict the sale of junk food on campus','and teach pupils how everyday choices affect their weight.'],
  ['For example, a child who learns to replace','sweet drinks with water and processed snacks with fruit','is likely to make progress','even without dramatic changes to their timetable.'],
  ['Parents must also be involved,','because children’s eating patterns are usually formed at home.'],
  ['If families regularly cook balanced meals,','limit screen time and encourage walking or outdoor play,','healthy behaviour becomes a normal part of life','rather than a punishment.'],
  ['In conclusion, increasing time for sport and exercise','is a useful measure,','but it is not the best solution','to the problem of overweight children.'],
  ['The stronger answer is a combination of','healthier school food, practical nutrition education','and consistent support from families.'],
];
const simpleChunkOverrides=[
  ['Children being overweight is a serious problem','for many schools,','and some people think schools should give','more time to sport to help.'],
  ['Exercise is useful,','but I do not think more PE classes','are the best answer.'],
  ['Changing what children eat','and what they do each day at school and home','will work better.'],
  ['More sport at school can help','children who weigh too much,','but it cannot solve everything.'],
  ['Sport helps children use energy, grow stronger','and feel better about their bodies.'],
  ['It also means they spend less time','sitting or looking at screens.'],
  ['But a few more hours of sport each week','may not help much if children still eat sweet snacks,','drink sugary drinks','and eat too much food every day.'],
  ['In other words, exercise may make the body stronger,','but unhealthy food keeps harming it.'],
  ['That is why schools should not see more sport','as the main way to solve child obesity.'],
  ['The most important answer is','to change children’s food.'],
  ['Schools should give healthier lunches,','limit unhealthy snacks sold at school','and teach children how daily food choices affect their weight.'],
  ['For example, a child who drinks water','instead of sweet drinks and eats fruit','instead of packaged snacks may become healthier','even if their school schedule stays the same.'],
  ['Parents must help too,','because children usually learn how to eat at home.'],
  ['If families often cook healthy meals,','spend less time with screens','and encourage walking or playing outside,','healthy actions become normal, not a punishment.'],
  ['To sum up, more school sport is helpful,','but it is not the best answer','to children being overweight.'],
  ['A better answer combines healthier school food,','useful lessons about food','and steady support from families.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,functionName,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${functionName}，與原句的句型和語意關係相同。`,distractorReason:`這句${functionName}；它表達的是另一種關係。`};}
const structures=[
  card('Student stress has become a concern in schools, and some people argue that schools should devote more time to exercise to address it.','用 has become ... and some people argue that 引出問題與被提議的方案',[1,2,9],
    fixed(0,'[兒童肥胖] has become [教育制度的嚴重關注], and some people argue that [學校] should devote [更多時間] to [體育和運動] to address [此問題].','引言先交代問題，再忠實呈現題目提出的增加運動方案。','要回應某項被提議的政策，先說明問題與提案內容時。',[' has become ', ', and some people argue that ', ' should devote ', ' to ', ' to address '],['當前問題','其在教育制度中的嚴重性','被要求行動的學校','新增的時間','時間投向的活動','想解決的問題'])),
  card('Although sport is useful, I do not believe that adding two PE lessons is the best way to solve unhealthy weight.','用 Although ... I do not believe 承認運動好處但否定最佳方案',[0,3,14],
    fixed(1,'Although [體能活動有價值], I do not believe that [增加體育課] is the best way to solve [兒童肥胖].','直接回答第一問：運動有用，但單靠加課不是最佳辦法。','題目問增加運動是否最佳方案，須讓步後清楚表態時。',['Although ', ', I do not believe that ', ' is the best way to solve '],['先承認的運動價值','被否定為最佳的方案','要處理的問題'])),
  card('A more effective approach is to improve school food and change children’s habits both at school and at home.','用 A more effective approach is to 預告飲食與校內外習慣',[1,9,15],
    fixed(2,'A more effective approach is to [改善兒童飲食] and [重塑日常習慣] both [校內與校外].','引言提出較佳替代方向，預告學校和家庭都須參與。','否定增加體育課為最佳解法後，立即提出更有效的方向時。',['A more effective approach is to ', ' and ', ' both '],['較重要的飲食調整','同時需要的習慣改變','改變應發生的場景'])),
  card('Extra exercise at school can help inactive pupils, but its impact is limited.','用 can help ... but impact is limited 作適度承認',[1,4,8],
    fixed(3,'Extra exercise at school can help [超重兒童], but its impact is [有限].','先承認體育課的實際好處，再指出仍須檢查其作用範圍。','開始評估題目提議時，避免把運動說成完全無用時。',['Extra exercise at school can help ', ', but its impact is '],['運動可能幫助的孩子','整體作用的限制'])),
  card('Sport allows pupils to use energy, grow stronger and feel better about their bodies.','用 allows pupils to 並列運動的三項具體好處',[3,5,6],
    fixed(4,'Sport allows pupils to [消耗能量], [增強體力] and [改善對身體的態度].','細化為何運動有用：身體活動、力量與自我看法。','已承認運動有幫助，需要列出具體作用而非空泛讚美時。',['Sport allows pupils to ', ', ', ' and '],['第一項身體作用','第二項身體作用','第三項態度作用'])),
  card('It can also reduce the time they spend sitting or looking at screens.','用 reduce the time ... sitting or ... 顯示運動替代久坐和螢幕時間',[3,4,6],
    fixed(5,'It can also reduce the time they spend [坐在課室] or [盯著螢幕].','再補一項好處：運動佔用原本可能久坐或看螢幕的時間。','列運動益處時，需要解釋它替代哪兩種少活動的行為時。',['It can also reduce the time they spend ', ' or '],['第一種久坐狀態','第二種螢幕行為'])),
  card('However, a few extra hours of PE can easily be cancelled out if pupils still drink sweet drinks, eat oversized snacks and skip healthy meals every day.','用 However ... cancelled out if 解釋為何體育課收益可被飲食抵消',[3,4,7],
    fixed(6,'However, [每周額外運動時數] can easily be cancelled out if [孩子吃含糖零食], [喝汽水] and [每日份量過大].','指出增加幾小時運動不能自動抵銷每天高糖和過量飲食。','已列運動益處，現在要精確說出其效果有限的條件時。',['However, ', ' can easily be cancelled out if ', ', ', ' and '],['可能被抵消的運動投入','持續的高糖零食','持續的含糖飲品','每日進食份量'])),
  card('In other words, exercise may strengthen the engine, but poor food keeps pouring the wrong fuel into it.','用 engine 與 wrong fuel 比喻運動和飲食的不同作用',[5,6,8],
    fixed(7,'In other words, [運動] may strengthen [引擎], but [不良飲食] keeps pouring [錯誤燃料] into it.','用引擎燃料比喻說明鍛鍊身體仍不能忽視每天吃進去的食物。','已寫運動可被飲食抵消，要以形象句子概括兩者關係時。',['In other words, ', ' may strengthen ', ', but ', ' keeps pouring ', ' into it.'],['可能強化身體的運動','身體的比喻','仍持續影響健康的飲食','不合適食物的比喻'])),
  card('For this reason, schools should not treat extra PE as the main cure for child obesity.','用 For this reason 得出運動不能作主要解法的判斷',[3,6,9],
    fixed(8,'For this reason, [學校] should not treat [更多運動] as the main cure for [兒童肥胖].','根據每日飲食可抵銷額外運動，明確判斷提議方案的地位。','運動限制已論證完，須回答它是否主要或最佳解法時。',['For this reason, ', ' should not treat ', ' as the main cure for '],['作政策選擇的學校','不應過度倚賴的措施','仍待解決的問題'])),
  card('The most important solution is to change what pupils eat.','用 The most important solution is to 轉入飲食解法',[2,8,10],
    fixed(9,'The most important solution is to [改變兒童飲食].','第二主體段先把重點放在每天吃甚麼，而非再加體育課。','已否定運動是主要解法，開始說更有效的措施時。',['The most important solution is to '],['最重要的具體改變'])),
  card('Schools should give healthier lunches, limit junk food sales and teach pupils how daily choices affect weight.','用 Schools should 並列膳食供應、銷售限制與知識教育',[2,9,11],
    fixed(10,'Schools should [提供健康膳食], [限制校內垃圾食品銷售] and [教日常選擇如何影響體重].','把「改變飲食」拆成學校可操作的三項措施。','已提出飲食方案，要說明學校具體能供甚麼、限制甚麼及教甚麼時。',['Schools should ', ', ', ' and '],['學校提供的膳食','校園銷售的限制','學生需要理解的知識'])),
  card('For example, a child who learns to replace sweet drinks with water and processed snacks with fruit is likely to make progress even without extra PE hours.','用 For example ... replace ... with ... and ... with ... 舉易做的飲食替換',[9,10,12],
    fixed(11,'For example, a child who learns to replace [甜飲] with [水] and [加工零食] with [水果] is likely to make progress even without [大改課表].','用飲品與零食兩項替換，證明飲食調整可在不大增體育課下發揮作用。','學校措施已列，要給學生可理解、可嘗試的飲食例子時。',['For example, a child who learns to replace ', ' with ', ' and ', ' with ', ' is likely to make progress even without '],['被替換的飲品','較佳飲品','被替換的零食','較佳零食','不必進行的大幅變動'])),
  card('Parents must also be involved, because many eating habits are usually formed at home.','用 Parents must also ... because 解釋家庭不能缺席',[10,11,13],
    fixed(12,'Parents must also be involved, because [兒童飲食模式] are usually formed at [家中].','把解法從校園延伸到家庭，指出飲食習慣的形成地點。','學校改膳食後，須說明家長為何也負有角色時。',['Parents must also be involved, because ', ' are usually formed at '],['在家逐漸形成的習慣','習慣形成的地方'])),
  card('If families regularly cook balanced meals, limit screen time and encourage outdoor play, healthy behaviour becomes a daily habit rather than a punishment.','用 If families ... healthy behaviour becomes ... rather than ... 說明家庭日常如何使健康習慣自然化',[10,12,15],
    fixed(13,'If families regularly [煮均衡餐], [限螢幕時間] and [鼓勵步行戶外玩耍], healthy behaviour becomes [正常生活] rather than [懲罰].','家庭以反覆可行的日常安排，讓健康行為成為生活一部分。','已說父母須參與，要列他們具體如何在家支援孩子時。',['If families regularly ', ', ', ' and ', ', healthy behaviour becomes ', ' rather than '],['第一項家中飲食安排','第二項螢幕安排','第三項活動安排','希望形成的常態','需要避免的負面感受'])),
  card('In conclusion, adding PE time is a useful measure, but it is not the best solution to child obesity.','用 is a useful measure, but not the best 重申對體育課的精確評價',[1,3,15],
    fixed(14,'In conclusion, [增加體育運動時間] is a useful measure, but it is not the best solution to [兒童超重].','結論直接回答第一問：運動有效但不是最強解法。','最後須清楚評估題目方案，而不是簡單說贊成或反對時。',['In conclusion, ', ' is a useful measure, but it is not the best solution to '],['受評估的運動措施','其不足以單獨解決的問題'])),
  card('The stronger answer is a combination of healthier school lunches, food education and steady family support.','用 a combination of 並列校園食物、知識與家庭支持',[2,10,14],
    fixed(15,'The stronger answer is a combination of [健康校餐], [實用營養教育] and [家庭持續支持].','最後回答其他解法，將校內供應、知識與校外家庭習慣結合。','第一問已判斷增加運動非最佳，第二問須收束更有力的措施時。',['The stronger answer is a combination of ', ', ', ' and '],['更健康的學校食物','教孩子作選擇的教育','校外維持習慣的家庭'])),
];
const wrongReasons=[
  ['立場句判斷加體育課非最佳，沒有先呈現問題與他人提案。','較有效方向是作者方案，沒有題目原先建議的運動時數。','飲食解法是後文主張，沒有開場的肥胖問題背景。'],
  ['問題與提案只是背景，沒有 Although 先承認再否定最佳。','運動有限是主體段評估，沒有引言直接回答第一問。','結論重申評價，但沒有引言的讓步立場表達。'],
  ['運動非最佳是立場，沒有指出飲食與校內外習慣作替代。','飲食解法只提出一項方向，沒有同步預告生活習慣。','結論方案列食物教育家庭，沒有引言的內外習慣總述。'],
  ['引言讓步只是立場，沒有 can help ... but limited 的主體段平衡。','運動三項好處是後續證據，沒有先說作用仍有限。','運動非主要解法是段尾判斷，沒有先承認可有幫助。'],
  ['運動有限是評價，沒有列消耗能量、體力與身體態度。','久坐與螢幕時間是另一項好處，沒有三種身體作用。','飲食抵消是限制，沒有先詳述運動的正面效益。'],
  ['運動有限是總述，沒有說它替代久坐與看螢幕。','消耗能量是身體作用，沒有時間由哪種行為轉走。','飲食抵消是後續限制，沒有此句減少靜態活動的好處。'],
  ['運動有限尚未說明受甚麼每日飲食抵消。','三項好處只列正面作用，沒有 however 的抵消條件。','引擎燃料比喻概括關係，沒有含糖零食汽水與份量的實際行為。'],
  ['減少久坐是好處，沒有引擎與燃料的形象對照。','飲食抵消列事實行為，沒有 in other words 的比喻收束。','運動非主要解法是結論，沒有兩種相互作用的比喻。'],
  ['運動有限只是評價，沒有 For this reason 從飲食證據得出政策判斷。','飲食抵消解釋原因，沒有明確否定運動作主要治療。','飲食改變是下一段解法，沒有先結束對運動的評估。'],
  ['引言較有效方向包含習慣，沒有第二段先鎖定飲食。','運動非主要解法是前段結論，沒有提出最重要的另一措施。','學校食物措施是具體做法，沒有先宣布飲食解法。'],
  ['引言只預告改善飲食，沒有學校供餐、銷售和教育三步。','飲食解法總說目標，沒有列學校可操作的行動。','換飲品零食是學生例子，沒有學校政策的三類工具。'],
  ['飲食解法只定方向，沒有水與水果兩項替換例子。','學校政策列制度措施，沒有孩子能如何在日常選擇。','家庭參與說習慣形成地點，沒有例子中的具體替換。'],
  ['學校政策只講校內，沒有 because 習慣通常在家形成。','飲食替換是孩子行動，沒有父母參與的原因。','家庭三步是後續例子，沒有先解釋為何父母須加入。'],
  ['學校政策沒有煮飯、限螢幕和戶外玩耍的家庭行動。','父母須加入只是原則，沒有 If 的具體日常條件。','結論方案總列家庭支持，沒有健康習慣成為自然常態的過程。'],
  ['引言立場尚未經過主體段論證，不是結論重申。','運動有限是段首評估，沒有最終的 useful but not best 定論。','結論第二句列更好解法，沒有先直接評價加體育課。'],
  ['引言方案總述沒有結論三類措施的完整組合。','學校三步沒有明確收進家長持續支援。','結論前句只答運動是否最佳，沒有回答其他可行解法。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求回答哪兩件事？',[
    '增加校內運動是否最佳解法，以及還有甚麼其他措施',
    '哪種運動最受歡迎，以及每周應有幾節體育課',
    '只說兒童需要運動，不評價方案是否最有效',
    '只討論飲食名稱，不提出學校和家庭可做的事',
  ],'先評估題目方案，再提出更有效的組合措施。'),
  {type:'multi',prompt:'選出範文的兩項核心判斷',detail:'選兩項，再按「確認」。',options:[
    '運動有用，但每日高糖飲食可抵消有限的額外運動',
    '學校食物、飲食教育和家庭日常習慣須一起改善',
    '運動完全無益，所以學校應取消所有體育課',
    '只加體育課便足夠，家庭與食物選擇不用改變',
  ],correct:[0,1],why:'作者不否認運動，卻把更大重點放在飲食與家庭。'},
];
const route=[sequence('依照範文次序排列四段的任務',[
  ['引言表態','承認體能活動有價值，但加體育課不是最佳方案；先預告飲食習慣。'],
  ['評估運動','運動可耗能、增強體力並減少久坐，但高糖及過量飲食可抵消。'],
  ['更有效的做法','學校改善膳食、限制垃圾食品及教飲食選擇；家庭建立日常習慣。'],
  ['結論回答兩問','增加運動有用但非最佳；結合學校食物、營養教育和家庭支持。'],
],'先公平評估體育課，再提出校園與家庭可配合的其他措施。')];
const evidence=[
  quiz('範文承認增加校內運動有哪些好處？',[
    '消耗能量、增強體力、改善身體態度並減少久坐時間',
    '保證每個孩子不用改飲食便立即解決所有問題',
    '完全沒有健康作用，只會增加看螢幕的時間',
    '只影響考試分數，與身體活動或自我看法無關',
  ],'作者明確列出運動好處，之後才評估其限制。'),
  quiz('為何少量額外運動可能被抵消？',[
    '孩子若每天仍吃含糖零食、喝汽水且份量過大，效果可能有限',
    '孩子只要多走一步，所有飲食內容便完全不重要',
    '每周多運動幾小時一定令所有孩子停止進食',
    '只要有體育課，學校就不需要再提供任何膳食',
  ],'運動增加的時數有限，飲食習慣卻每天持續。'),
  quiz('引擎與燃料的比喻說明甚麼？',[
    '運動可強化身體，但不良飲食仍持續帶來問題',
    '運動和食物完全沒有關係，可以只看其中一項',
    '引擎只代表學校交通，與兒童健康沒有關係',
    '只要食物改變，所有身體活動便應全部取消',
  ],'比喻把運動與飲食放在同一身體健康過程中。'),
  quiz('學校可如何直接改善兒童飲食？',[
    '提供較健康膳食、限制垃圾食品銷售並教日常選擇',
    '只增加零食販賣點，不提供任何飲食資訊',
    '取消體育課後，讓學生自行猜測食物影響',
    '只告訴家長負責，學校膳食完全不用改',
  ],'學校方案同時改食物環境與孩子的選擇知識。'),
  quiz('水與水果的例子要證明甚麼？',[
    '具體飲食替換可帶來進展，即使課表沒有巨大改動',
    '只有改動每一節課時間，飲食替換才可能有效',
    '孩子只需換一種飲料，從此完全不用其他支持',
    '水果和水都屬於加工零食，與飲食改善無關',
  ],'例子說明可行的小選擇，而非保證一項變動解決全部問題。'),
  quiz('家長為何必須參與？',[
    '兒童飲食模式多在家中形成，校外習慣也影響效果',
    '孩子只在學校進食，家裡的任何選擇都無關',
    '父母只能付費，不能改變餐食或螢幕時間',
    '學校已改善午餐，家庭便一定不用再做事',
  ],'作者將學校措施與家中形成的長期習慣相接。'),
  quiz('家庭怎樣使健康行為成為日常，而非懲罰？',[
    '常煮均衡餐、減少螢幕時間並鼓勵步行與戶外遊戲',
    '只在孩子犯錯時突然禁止所有食物和活動',
    '每天只要求孩子多做運動，不改善任何餐食',
    '只責備孩子的體重，完全不建立可行的日常',
  ],'反覆而可行的家庭安排，比把健康行為當懲罰更符合文意。'),
];
const logic=[
  sequence('第一主體段：運動有用，為何不是最佳',[
    ['先承認','運動可耗能、增強體力並改善身體態度。'],
    ['再補好處','也可減少久坐與看螢幕的時間。'],
    ['指出限制','每天含糖飲品、零食和過量份量可抵消少量額外運動。'],
    ['形象總結','運動強化引擎，不良飲食卻繼續投入錯誤燃料。'],
    ['政策判斷','學校不應把多運動當成肥胖問題的主要解法。'],
  ],'作者的評估不是否定運動，而是比較其作用和每日飲食。'),
  sequence('第二主體段：校園與家庭如何連成方案',[
    ['先改吃甚麼','學校提供較健康膳食，限制垃圾食品銷售。'],
    ['教怎樣選','讓學生理解日常飲食如何影響體重。'],
    ['給簡單例子','以水取代甜飲，以水果取代加工零食。'],
    ['家長接力','家庭煮均衡餐、限螢幕並鼓勵步行或戶外活動。'],
    ['形成習慣','健康行為融入生活，而非孩子受到的懲罰。'],
  ],'學校改環境與知識，家庭讓選擇每天可持續。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('學校增加兩節體育課，但汽水和含糖零食仍是學生最常買的飲食。','哪項最符合範文對體育課的評估？',[
    '承認運動有益，也指出每日飲食可能抵消部分效果',
    '只要體育課增加，飲食內容就完全不用再評估',
    '運動一點用都沒有，所以應立即取消所有課節',
    '汽水和零食是偶然選擇，必然不會影響日常',
  ],[
    '範文同時列運動好處與持續高糖飲食的抵消條件。',
    '這忽略題目中的每天飲食。',
    '原文並未說運動毫無作用。',
    '題目說這些是常買的食物。',
  ],[3,4,5,6],'範文說多運動有益，但幾小時的效果可能被每日飲食抵消。'),
  transfer('學校食堂把甜飲放在顯眼處，卻只勸孩子「多做運動」。','哪項最能轉用範文的校園飲食方案？',[
    '提供水和較健康餐食，限制不健康選項並解釋原因',
    '只再貼一張運動海報，食堂供應和資訊都不改',
    '禁止孩子喝水，要求他們只靠運動消耗攝入',
    '把所有責任交給家長，學校不用處理食堂內容',
  ],[
    '範文建議改校餐、限制垃圾食品銷售並教日常選擇。',
    '海報未改題目中的飲食環境。',
    '水正是原文的替換例子。',
    '校內食物供應屬學校可改的部分。',
  ],[9,10,11],'範文的學校措施包含供餐、銷售限制和飲食教育。'),
  transfer('學生以水取代每日甜飲，也以水果取代加工零食，學校課表沒有大改。','哪項最貼近範文的例子？',[
    '這些日常替換可能有幫助，不必徹底改動課表',
    '沒有新增大量體育課，就不可能有任何進展',
    '水果與水必然比甜飲和加工零食含更多糖分',
    '只有換地址才能改變學生日常飲食選擇',
  ],[
    '範文原例就是飲品與零食替換，並說不必劇改時間表。',
    '原文沒有把進展綁定大改課表。',
    '這與題目提供的替換方向相反。',
    '搬家不是此段的原因。',
  ],[10,11],'範文以水和水果的替換說明改飲食可在原課表下進行。'),
  transfer('一個家庭平日外賣頻繁，周末才讓孩子運動一次，家長認為學校應獨力負責。','哪項最符合範文對家庭角色的看法？',[
    '家庭餐食和活動也須調整，因飲食模式多在家形成',
    '只靠周末一次運動，便可替代平日所有飲食選擇',
    '學校只要教過營養，家庭便完全不用再參與',
    '家長只能責備孩子，不必改變可實行的日常',
  ],[
    '範文說家長也須參與，家庭習慣有長期影響。',
    '一次運動不能必然抵消每天飲食。',
    '知識需配合家庭環境。',
    '原文提出均衡餐與日常活動。',
  ],[12,13],'範文把家庭煮食、螢幕時間和戶外活動連成日常支援。'),
  transfer('社區為了鼓勵步行，只在居民違規時懲罰，沒有提供安全步道。','哪項最能借用範文的「習慣而非懲罰」原則？',[
    '提供可安全步行的路線，讓活動自然融入日常生活',
    '只靠責罰，假設健康活動一定因此成為愉快習慣',
    '取消所有可步行空間，改要求居民每天跑更久',
    '不問日常路線，認定一次活動便足以建立習慣',
  ],[
    '範文重視日常條件，使健康行為成為正常生活的一部分。',
    '懲罰感正是原文希望避免的。',
    '沒有可用空間較難形成習慣。',
    '習慣需要反覆而非一次。',
  ],[13],'範文說家庭鼓勵步行和戶外玩耍，讓健康行為變得正常。'),
  transfer('一間公司想減少員工久坐，只要求大家多運動，卻每日供應大量甜食。','哪項最能轉用範文的「引擎與燃料」比喻？',[
    '多運動有用，但日常飲食也需改善，兩者作用相連',
    '只要身體活動增加，食物內容便永遠不影響健康',
    '甜食是員工私人選擇，公司完全不能改變供應',
    '健康只看一次運動，不問每天是否長時間久坐',
  ],[
    '範文比喻運動強化引擎，不良飲食卻持續投入錯誤燃料。',
    '這刪去了比喻的飲食一半。',
    '題目中的供應可被調整。',
    '原文重視日常持續情況。',
  ],[4,5,6,7],'範文說運動與飲食要一起看，單加體育時間並不足夠。'),
  transfer('新校食物政策只列「禁止零食」，沒有教學生怎樣選飲料或餐食。','哪項最符合範文的完整校園做法？',[
    '除了限售，也教學生理解每天選擇如何影響體重',
    '只要有禁令，學生便必然懂得選飲料和餐食',
    '取消營養教育，讓學生完全不知食物差異',
    '只增加體育器材，不處理校園食物和知識',
  ],[
    '範文的學校方案同時包含健康供餐、限制銷售和教學。',
    '禁令不自動產生飲食知識。',
    '原文明言要教 daily choices。',
    '器材不能代替飲食環境。',
  ],[10,11],'範文要求學校教孩子日常選擇如何影響體重。'),
  transfer('家庭想建立健康習慣，家長每餐只責罵孩子，卻不改餐食或螢幕安排。','哪項最符合範文提出的日常做法？',[
    '改均衡餐、限螢幕並鼓勵戶外活動，避免責罵式安排',
    '只要責罵夠多，健康行為便會自然融入每天生活',
    '只改孩子周末一次運動，平日餐食不用理會',
    '完全不問家庭生活，讓學校獨自建立所有習慣',
  ],[
    '範文用具體家庭安排取代把健康行為當懲罰。',
    '責罵可能使健康行為像懲罰。',
    '原文強調 regularly 的日常性。',
    '飲食模式多在家形成。',
  ],[12,13],'範文鼓勵均衡餐、限螢幕、步行與戶外玩耍。'),
  transfer('學校推廣健康，預算只能選一項長期主軸：只多開體育課，或同時調整餐食與教育。','哪項最符合範文的優先判斷？',[
    '保留運動作用，以改善飲食和選擇知識作主要方向',
    '運動完全無效，因此所有活動都應立即停止',
    '只開體育課就足夠，學校日常食物不需再管',
    '只改海報顏色，不處理孩子每日實際吃甚麼',
  ],[
    '範文把運動視為有用但非最佳，飲食加教育更有力。',
    '作者並未否認運動好處。',
    '每日飲食可能抵消少量額外運動。',
    '海報不等於實際飲食改變。',
  ],[1,2,6,14,15],'範文結論把健康校餐、營養教育和家庭支持列為較強方案。'),
  transfer('文章同時問「加體育課是否最佳」及「還有甚麼辦法」。','哪項結論最完整？',[
    '運動有用但非最佳，再總結校餐、營養教育與家庭支援',
    '只說孩子需要運動，不比較其他更可行的做法',
    '只列學校食物，不判斷題目提出的新增體育課',
    '只討論家長責任，不回答學校應否多加運動時間',
  ],[
    '範文最後兩句分別回應提案評估及更強方案組合。',
    '第一問要求比較最佳與否。',
    '這漏掉對體育課的判斷。',
    '這同樣未完整回答第一問。',
  ],[14,15],'範文結論先評估運動，再把學校食物、教育和家庭支持合起來。'),
];
const revised=[
 {options:['承認運動有益，也指出每日飲食可能抵消部分效果','先評估體育課出席率，再決定飲食是否值得討論','增加體育課時數，讓學生維持原本的汽水消費','把汽水供應減半，便不需再評估體育課的作用'],explanations:['運動有益，但經常攝取甜飲零食可抵消部分效果。','出席率不能顯示日常飲食對健康的影響。','若甜飲仍是常買選項，增加運動未必足夠。','減少汽水有用，但不能因此忽略運動與其他食物。']},
 {options:['提供水和較健康餐食，限制不健康選項並解釋原因','維持現有食堂，另要求每班多講一次運動好處','先減少甜飲宣傳，但讓食堂繼續把它放最顯眼處','只降低健康餐價格，卻不改學生可選的含糖飲品'],explanations:['改變供應與教選擇，可處理題目中的高糖環境。','多講運動仍未改變食堂的飲食選項。','減少宣傳有益，但顯眼供應依然推動購買。','價格可影響選擇，但高糖飲品問題仍未處理。']},
 {options:['這些日常替換可能有幫助，不必徹底改動課表','飲品替換有益，但須先增加體育課才可能見效','水果可代替零食，甜飲仍須留作學生日常選項','因課表未變，這些飲食替換只能算暫時做法'],explanations:['範文用飲品與零食的每日替換說明可行方案。','飲食改變本身就可有作用，不以增課為前提。','題目中的甜飲替換也是關鍵一環。','沒有大改課表，不代表日常替換無法持續。']},
 {options:['家庭餐食和活動也須調整，因飲食模式多在家形成','由學校改午餐，家庭維持外賣與周末運動安排','請家長監察體育課表，卻不調整平日家庭餐食','只增加孩子周末活動，平日外賣頻率仍維持'],explanations:['長期飲食習慣與活動需要家庭共同參與。','學校午餐有用，但家庭高頻外賣仍可能抵消效果。','監察課表不足以改變家中日常飲食。','周末一次活動難抵消持續的平日飲食模式。']},
 {options:['提供可安全步行的路線，讓活動自然融入日常生活','把違規罰款用來宣傳步行，暫不改善現有步道','規定居民每日步行時數，再評估路線是否安全','增設一次步行比賽，代替平日可用的安全路線'],explanations:['可安全使用的路線使活動更易成為日常習慣。','宣傳有用，但題目的主要障礙是缺少安全路線。','先要求行為而不處理安全條件，難以持續。','一次比賽不能代替每天可用的活動環境。']},
 {options:['多運動有用，但日常飲食也需改善，兩者作用相連','增加員工運動時數，甜食供應暫維持原有水平','先減少甜食供應，再把久坐問題交由員工處理','把甜食改為偶爾供應，便不用改善久坐安排'],explanations:['引擎與燃料比喻要求同時看活動與日常飲食。','只增加活動而保留大量甜食，忽略燃料一面。','減少甜食有益，但久坐同樣需要處理。','調整飲食後，長時間久坐仍是另一項問題。']},
 {options:['除了限售，也教學生理解每天選擇如何影響體重','先實行零食禁令，學生的選擇知識留待校外學習','只教學生閱讀標籤，食堂照舊出售高糖零食','把禁令改成勸告，未提供飲料或餐食選擇指導'],explanations:['完整方案須結合供應規則與日常選擇教育。','禁令若缺少教育，學生未必學會如何選飲料餐食。','教育重要，但校園食物環境也需調整。','勸告與禁令的轉換仍未補上所缺的實用知識。']},
 {options:['改均衡餐、限螢幕並鼓勵戶外活動，避免責罵式安排','保留目前餐食，用更嚴格的每日體重紀錄督促','只安排戶外活動，孩子的平日餐食與螢幕時間照舊','先減少螢幕時間，再以責罵要求孩子接受原有餐食'],explanations:['均衡餐與活動安排讓健康成為正常生活的一部分。','體重紀錄不能代替改善日常餐食，還可能加強責罰感。','戶外活動有益，但另外兩個日常因素仍未處理。','減少螢幕有用，責罵與不變的餐食仍不利習慣。']},
 {options:['保留運動作用，以改善飲食和選擇知識作主要方向','以體育課為主軸，餐食與知識留待家長自行處理','以營養講座為主軸，食堂不需改變學生可買甚麼','先改食堂餐食，卻把運動與飲食教育都排除'],explanations:['範文認可運動，但認為飲食環境與知識更有力。','只加課節未處理學生每日接觸的食物。','知識若不配合校園供應，實踐仍受限制。','改餐食有益，但不必否定運動與選擇教育。']},
 {options:['運動有用但非最佳，再總結校餐、營養教育與家庭支援','先說運動很有用，再把其他方案交由下一篇討論','列出校餐與家長安排，卻不比較增加體育課的價值','承認運動和飲食都重要，但不說哪種方案更有力'],explanations:['結論同時回答加體育課是否最佳及其他辦法。','題目的第二問要求在本文提出其他方案。','只答辦法，漏掉對體育課作最佳與否的判斷。','若不作比較，仍未回答題目中的最佳方案問題。']}
];
revised.forEach((r,i)=>{transferTasks[i].options=r.options;transferTasks[i].explanations=r.explanations});
export default {key:'direct-question:29',meta:{topic:'兒童超重與校內運動的方案比較',summary:'運動有益但作用有限；改善校園飲食、營養知識和家庭習慣更有力。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
