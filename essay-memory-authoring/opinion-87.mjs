import fs from 'node:fs';
const E=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['opinion:87'].map(x=>x.english);
const simple=[
'At many jobs today, workers sit for hours while trying to finish hard tasks on time.',
'I strongly think companies should make time for exercise during work because this may help both workers’ health and how well they work.',
'The main reason is that moving often helps protect workers’ bodies and minds from harm caused by sitting at work for too long.',
'Many people in offices look at a screen for most of the day, which may cause back pain, tiredness, and stress.',
'If companies let staff exercise for a short time by stretching, walking, or going to a gym, they may return to work feeling fresh instead of worn out.',
'For example, an accountant who walks for twenty minutes after working hard for hours may think more clearly and avoid feeling very tired later in the day.',
'So time to move is not an extra treat; it is a useful way to stop work slowly harming people’s health.',
'Employers may also gain from this.',
'Healthy workers often have more energy, focus better, and feel more loyal, so improved work may make up for time spent exercising.',
'Some managers may fear that exercise breaks take away work time, but this view misses the longer-term picture.',
'Tired, inactive, and stressed workers rarely do their best work just because they stay at their desks longer.',
'But when a company supports exercise, it shows that it cares about staff as people, not only as workers who make things.',
'This may make workers feel better about the job and help them miss fewer days without good reason.',
'In short, I strongly support giving employees time to exercise during the working day.',
'If planned well, this can help workers stay healthy and help companies become more productive and caring.',
];
const vocabulary=[
[['modern workplaces','many jobs today','現代職場'],['employees','workers','員工'],['remain seated for long hours','sit for hours','久坐'],['demanding deadlines','hard tasks on time','緊迫期限']],
[['strongly believe','strongly think','堅定認為'],['set aside time','make time','預留時間'],['physical exercise','exercise','體育鍛煉'],['employee health','workers’ health','員工健康'],['workplace performance','how well they work','工作表現']],
[['regular movement','moving often','定期活動'],['physical and mental damage','bodies and minds from harm','身心損害'],['sedentary jobs','sitting at work for too long','久坐工作']],
[['office employees','people in offices','辦公室員工'],['spend most of the day in front of a screen','look at a screen for most of the day','長時間面對螢幕'],['back pain, tiredness and stress','back pain, tiredness, and stress','背痛疲倦壓力']],
[['allow staff','let staff','容許員工'],['short period for exercise','exercise for a short time','短暫運動'],['feeling refreshed rather than drained','feeling fresh instead of worn out','精神恢復非疲憊']],
[['twenty-minute walk','walks for twenty minutes','散步二十分鐘'],['concentrated work','working hard','專注工作'],['clear his mind','think more clearly','清理思緒'],['sense of exhaustion','feeling very tired','疲憊感']],
[['In this sense','So','從此意義'],['exercise time','time to move','運動時間'],['not a luxury','not an extra treat','非奢侈'],['practical way','useful way','實際方法'],['people’s well-being','people’s health','身心健康']],
[['likely','may','可能'],['benefit employers themselves','Employers may also gain','僱主亦受益']],
[['healthy workforce','Healthy workers','健康員工隊伍'],['energetic, focused and loyal','more energy, focus better, and feel more loyal','活力專注忠誠'],['time spent on exercise can be recovered','make up for time spent exercising','補回運動時間'],['better productivity','improved work','更高生產力']],
[['Some managers','Some managers','一些管理者'],['exercise breaks','exercise breaks','運動休息'],['reduce working hours','take away work time','減少工作時間'],['short-sighted','misses the longer-term picture','短視']],
[['tired, inactive and under pressure','Tired, inactive, and stressed','疲倦缺動壓力'],['rarely produce their best work','rarely do their best work','很少交出最佳表現'],['sit at their desks for longer','stay at their desks longer','坐得更久']],
[['By contrast','But','相比之下'],['encourages exercise','supports exercise','鼓勵運動'],['staff are valued as human beings','cares about staff as people','重視員工作為人'],['machines for producing output','workers who make things','產出機器']],
[['strengthen morale','make workers feel better about the job','增強士氣'],['reduce unnecessary absence','help them miss fewer days without good reason','減少不必要缺勤']],
[['In conclusion','In short','總結'],['firmly support','strongly support','堅定支持'],['provide exercise time during the day','giving employees time to exercise during the working day','白天提供運動時間']],
[['Done sensibly','If planned well','合理安排'],['protects employees’ health','help workers stay healthy','保障員工健康'],['productive, humane workplace','more productive and caring','高效人性化職場']],
];
const chunkOverrides={7:['It is also likely','to benefit employers themselves.'],9:['Some managers may worry that exercise breaks reduce working hours,','but this view is rather short-sighted.'],12:['This can strengthen morale','and reduce unnecessary absence.']};
const simpleChunkOverrides={7:['Employers may also','gain from this.'],9:['Some managers may fear that exercise breaks take away work time,','but this view misses the longer-term picture.'],12:['This may make workers feel better about the job','and help them miss fewer days without good reason.']};
function makeStructure(i,slots,replacements,meaning,usage,distractors){const text=E[i],parts=[];let p=0;slots.forEach((slot,j)=>{const q=text.indexOf(slot,p);if(q<0)throw Error(`slot ${i} ${slot}`);if(q>p)parts.push([text.slice(p,q),'link','固定連接']);parts.push([slot,'slot',`可換內容 ${j+1}`]);p=q+slot.length;});if(p<text.length)parts.push([text.slice(p),'link','固定連接']);let example=parts.map(x=>x[1]==='link'?x[0]:replacements.shift()).join('');return{example,answerReason:meaning,distractorReason:'分辨短期時間成本與較長期的健康和工作表現。',distractors,frame:{formula:parts.map(x=>x[1]==='link'?x[0]:`[${x[2]}]`).join(''),meaning,usage,parts}};}
const structures=[
makeStructure(0,['employees','seated for long hours','demanding deadlines'],['students','seated for long hours','tight school deadlines'],'引言描寫久坐及任務壓力。','提出運動或休息政策時，先交代目前日常工作狀況。',[1,2,3]),
makeStructure(1,['companies','physical exercise','employee health','workplace performance'],['schools','regular movement','student health','classroom performance'],'明示支持並預告員工與機構雙重效益。','支持某安排時，要同時說明參與者和機構受益時。',[0,2,7]),
makeStructure(2,['regular movement','workers','physical and mental damage','sedentary jobs'],['a short walk','students','physical and mental strain','long study sessions'],'第一理由指出久坐損害身心，活動作預防。','要說明某安排如何減少現行工作方式的健康代價。',[3,4,6]),
makeStructure(3,['office employees','most of the day in front of a screen','back pain, tiredness and stress'],['remote learners','most of the day in front of a screen','eye strain, tiredness and stress'],'把久坐風險具體化為螢幕及症狀。','抽象談健康風險後，提供常見工作場景與後果。',[2,4,5]),
makeStructure(4,['companies','staff','stretching, walking or using a gym','workers','feeling refreshed rather than drained'],['schools','pupils','stretching, walking or playing outside','learners','feeling refreshed rather than drained'],'短暫運動後回到任務，可能精神較好。','需要用條件句指出安排、行動和可能結果時。',[2,3,5]),
makeStructure(5,['an accountant','a twenty-minute walk','several hours of concentrated work','clear his mind','the sense of exhaustion'],['a student','a twenty-minute walk','several hours of concentrated study','clear her mind','the sense of exhaustion'],'個人例子展現休息如何防止下午累積疲憊。','已述一般效果，需用具體人物、時長及感受示例時。',[3,4,6]),
makeStructure(6,['exercise time','a luxury','a practical way','the workplace','people’s well-being'],['a short rest break','a luxury','a practical way','the classroom','students’ well-being'],'以非奢侈品反轉「浪費時間」觀念。','已講健康作用，要指出安排是預防措施而非額外享樂時。',[2,4,9]),
makeStructure(7,['employers themselves'],['schools themselves'],'第二理由轉到安排提供者可能受益。','第一段談參與者，第二段轉談提供者的利益時。',[1,8,9]),
makeStructure(8,['A healthy workforce','energetic, focused and loyal','the time spent on exercise','better productivity'],['A well-rested class','alert, focused and cooperative','the time spent on short breaks','better learning'],'說明投入時間可由較佳表現補回。','有人把時間只當損失時，展示可能的回報機制。',[7,9,10]),
makeStructure(9,['Some managers','exercise breaks','working hours','this view'],['Some school leaders','short movement breaks','study time','this view'],'先呈現管理者對時間成本的疑慮再回應。','有反對者擔心活動佔時間，先公平交代其憂慮時。',[8,10,11]),
makeStructure(10,['Employees','tired, inactive and under pressure','their best work','their desks'],['Students','tired, inactive and under pressure','their best work','their desks'],'反駁坐得久必然工作更好的假設。','對方只計時數，需指出疲勞會削弱有效產出時。',[8,9,11]),
makeStructure(11,['a company','exercise','staff','human beings','machines for producing output'],['a school','rest','learners','human beings','machines for producing output'],'安排傳遞重視人的訊號，不只計產出。','除效率外，論證機構政策如何表達對人的尊重時。',[7,10,12]),
makeStructure(12,['morale','unnecessary absence'],['confidence','unnecessary absence'],'由被重視的感受推到士氣和缺勤。','前面說明機構文化後，補充可能的組織效果時。',[8,11,14]),
makeStructure(13,['companies','exercise time'],['schools','short movement breaks'],'結論明確支持日間安排。','結論需要直接回答機構應否安排某項時。',[1,12,14]),
makeStructure(14,['it','employees’ health','businesses','a more productive, humane workplace'],['the policy','students’ health','schools','a more focused, humane learning environment'],'以合理實行為條件，整合個人和機構收益。','結尾避免保證效果，指出妥善設計下的兩方收益時。',[1,8,13]),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依原文順序逐一點選。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[Q('作者支持公司在工作日提供運動時間嗎？',['堅定支持；可能同時改善健康與工作表現','完全反對；所有休息都只會降低效率','沒有立場；只描寫會計工作','只支持下班後由員工自行付費運動'],'作者主張在工作日預留運動時間。'),{type:'multi',prompt:'選出兩段主體不同理由',detail:'選兩項，再按「確認」。',options:['活動可減少久坐工作的身心負擔','健康、有精神的員工可能提升表現與士氣','運動保證所有職員永不生病或缺勤','只要坐得更久就一定更有效率'],correct:[0,1],why:'主體一談健康，主體二談僱主可能受益。'}];
const route=[sequence('排好全文四段',[['引言 · 立場','職場久坐；作者支持工作日預留運動時間。'],['主體一 · 健康','短暫活動可減少疲憊、背痛與壓力。'],['主體二 · 工作表現','精神、專注和被重視感可能補回投入時間。'],['結論 · 合理安排','妥善實行可兼顧員工健康與人性化效率。']],'久坐風險 → 活動預防 → 機構收益 → 有條件結論。')];
const evidence=[Q('辦公室員工長時間對螢幕可能出現甚麼？',['背痛、疲倦與壓力','只會提高每次考試分數','只會令所有會議縮短','只會增加辦公室桌椅數量'],'原文列三項。'),Q('會計師例子中的安排是甚麼？',['專注數小時後散步二十分鐘','每天在辦公桌前睡四小時','只在下班後觀看別人運動','整天離開工作完全不返回'],'短暫散步或讓下午思緒更清楚。'),Q('管理者的反對理由是甚麼？',['運動休息會佔用部分工作時間','運動必然令辦公桌消失','所有員工完全不喜歡活動','健康員工不可能有生產力'],'原文稱此擔憂短視。'),Q('鼓勵運動傳達甚麼訊號？',['員工被當作人重視，而非純粹產出機器','公司只在意運動用品銷量','坐得更久才表示被信任','健康與工作表現完全無關'],'人性化政策訊號。')];
const logic=[sequence('主體一：短暫運動如何幫員工？',[['久坐風險','螢幕工作或導致背痛、疲倦與壓力。'],['安排','伸展、步行或健身短時間。'],['返回工作','較可能精神恢復而非筋疲力盡。'],['會計師例子','數小時專注後二十分鐘散步清理思緒。'],['定位','運動時間是預防身心損害的實際方法。']],'久坐損害 → 短暫活動 → 恢復精神。'),sequence('主體二：僱主何以可能受益？',[['員工狀態','健康者或更有活力、專注和忠誠。'],['回應時間疑慮','坐得久未必等於產出更好。'],['機構訊號','鼓勵運動表示重視員工作為人。'],['可能效果','士氣提升並減少不必要缺勤。'],['有條件結論','合理安排才能兼顧健康與效率。']],'投入時間 → 工作質素與士氣 → 可能補回投入。')];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
T('員工連續看螢幕數小時，下午感到背痛和難以集中。','文章會建議甚麼？',['安排短暫伸展或步行，讓精神有機會恢復','要求員工坐更久，不能離開辦公桌','只增加工作期限，不理會疲憊原因','把所有運動都改成下班後強制長跑'],['短活動對應風險。','坐更久不解決。','壓力更大。','原文是工作日。'],[2,3,4,5],'short exercise; return refreshed'),
T('經理認為二十分鐘步行就是少做二十分鐘工作。','主體二怎樣回應？',['較佳專注與效率可能補回投入的時間','只要增加工作時數，疲勞便自動消失','所有員工一運動便必定生產力加倍','有運動安排就毋須再評估工作成果'],['可能的回報機制。','疲勞仍在。','不保證倍增。','仍需評估。'],[8,9,10],'time recovered through better productivity'),
T('公司提供小段活動時間，員工覺得自己被當人看待。','這可帶來哪種組織效果？',['被重視感可能改善士氣，並減少無謂缺勤','人性化訊號會令所有員工不再需要薪水','只要可運動，任何工作壓力便立即消失','公司尊重員工代表不必再安排工作'],['valued human; morale。','仍需薪水。','非即時全消。','仍有工作。'],[11,12],'valued as humans; strengthen morale'),
T('學生在長時間課堂後作短暫活動，回來較能專心。','這如何遷移文章邏輯？',['短休息可能改善狀態，幫助其後任務表現','只要短休息，學生便毋須再學任何內容','坐得越久越不休息，專注就必然更好','所有活動都要取代整個課程才有幫助'],['短時投入可帶回報。','仍要學。','休息重要。','不需全取代。'],[4,8,10],'break and return refreshed'),
T('有人稱運動時間是奢侈享受，員工只需忍受久坐。','文章的反轉是甚麼？',['運動可作預防身心損害的實用安排','員工一有運動機會就不需任何休息','久坐工作必然對每個人完全無害','只有健身會籍能改善辦公室健康'],['非奢侈而是預防。','仍需休息。','有風險。','步行伸展亦可。'],[2,3,4,6],'not a luxury; practical prevention'),
T('公司試行活動時段，卻聲稱必定使所有員工產出增加。','根據原文，這說法欠缺甚麼？',['原文只說較可能受益，且需合理安排','原文說活動只會對體育教練有益','原文完全否定運動對健康的作用','原文要求每位員工每天練習四小時'],['likely; done sensibly。','非只教練。','支持健康。','無此要求。'],[7,8,14],'likely to benefit; done sensibly'),
T('某公司讓職員選擇伸展、步行或使用健身室。','這與原文哪一安排一致？',['提供短時間多種活動，然後返回工作','要求所有員工只用一種高強度運動','禁止任何人在工作日離開座位','將每次活動變成完整一天的休假'],['原文三選項。','多種方式。','相反。','短暫。'],[4],'stretching, walking or gym'),
T('員工坐在桌前十小時，但疲倦且出錯較多。','作者會質疑哪個假設？',['坐得更久不必然代表工作成果更好','只要坐足十小時，錯誤便必然消失','疲倦和壓力完全不影響工作質素','只需縮短桌子長度便可解決問題'],['時間不等於效果。','例子相反。','影響可能在。','與問題無關。'],[9,10],'longer at desks rarely best work'),
T('公司鼓勵活動，職員因此更有精神並更願意留下工作。','這屬哪一段的理由？',['第二主體段：僱主或從員工狀態受益','第一主體段：員工只需考慮運動服價格','第二主體段：運動會取代全部職務','結論：公司只可在週末提供運動'],['employer benefits。','非衣服。','非取代。','工作日。'],[7,8,11,12],'healthy workforce energetic and loyal'),
T('工作日運動政策沒有規劃，反而擠走必要服務時間。','結論的哪個詞提醒要有條件？',['合理安排；做得妥善才可能兼顧兩方','必然成功；任何安排都保證有效','完全無用；所以永遠不用再調整','越長越好；運動時間應等於上班時間'],['Done sensibly。','非保證。','可改善。','需合理。'],[14],'Done sensibly'),
T('有人說照顧員工健康與追求效率必須二選一。','文章提供甚麼連結？',['合理運動安排可能同時支持健康與表現','員工健康一改善，公司便永遠不需盈利','只要談效率，便不應提供任何休息','安排活動代表企業只能關心個人而已'],['兩方可能互補。','仍可盈利。','休息有益。','也顧企業。'],[1,8,14],'employee health and workplace performance'),
T('要概括作者對工作日運動時間的看法。','哪項最完整？',['支持；妥善安排可兼顧健康與人性化效率','完全反對；認為員工應一直坐在辦公桌前','只支持下班運動，工作日完全不能活動','沒有表態；只列舉會計師散步的例子'],['立場、條件、雙重效益。','相反。','是工作日。','明確支持。'],[1,2,3,4,5,6,7,8,9,10,11,12,13,14],'exercise time; health and humane productivity'),
];
const plausibleAlternatives=[
  [['增加下午工作量，讓員工逐漸適應久坐','安排伸展，但必須集中在下班之後','縮短午餐時間，以便減少看螢幕時數'],['增加工作量未處理背痛與疲倦。','文章主張在工作日預留短暫活動。','少午休未必改善久坐與精神狀態。']],
  [['步行能改善心情，工作效率則主要看時數','專注可能改善，但仍無法彌補步行時間','活動時間較短，員工便可少做其他任務'],['文章也討論健康對表現的作用。','專注與效率正可能補回所花時間。','文中並非主張減少必要職責。']],
  [['被重視感提升士氣，缺勤主要由假期決定','人性化安排有助健康，忠誠度則較難變化','活動時間令員工開心，工作表現可稍後再看'],['文章把健康與無謂缺勤聯繫起來。','感到被重視可能改善忠誠與士氣。','主體二也關注僱主與工作表現。']],
  [['短活動使學生放鬆，但課堂任務仍需縮減','短休息可改善狀態，學習內容則宜減少','活動後更專心，主要是因課堂變得較短'],['文章重視其後任務可能更有效。','休息不要求削減學習內容。','情境沒有說課堂長度改變。']],
  [['運動有益健康，仍屬員工私人時間的事','久坐有風險，因此應安排較長的健身訓練','員工可運動，背痛與壓力則由醫生處理'],['作者主張工作日內合理安排活動。','短暫活動已可能幫助，不必高強度。','預防措施可減少問題，而非只等治療。']],
  [['活動能改善健康，產出便可以直接保證','合理安排重要，但健康益處仍缺乏可能','活動效果須評估，故應先停止公司試行'],['原文用可能性而非必然保證。','原文承認運動可能改善身心健康。','需要審慎評估不等於不能試行。']],
  [['提供多種活動，但只在休假日開放使用','可選伸展或步行，但活動必須持續半天','提供健身室即可，無須讓員工短暫離席'],['文章談工作日內短暫活動。','本文主張合理短時間，不是半天。','可使用場地也要有實際活動機會。']],
  [['坐得更久可完成更多任務，錯誤可留待檢查','久坐令員工疲倦，產出仍只按時數計算','工作成果受疲倦影響，但休息只能放在週末'],['任務數量不能掩蓋質素與錯誤。','文章質疑把桌前時數等同成效。','工作日短休也可能改善狀態。']],
  [['第一主體段：運動可減少員工背痛','第二主體段：公司可節省健身室租金','結論：員工應自行承擔運動時間'],['情境談僱主可受益，非只員工健康。','原文著眼士氣、專注和工作表現。','文章支持公司在工作日提供安排。']],
  [['有限安排；運動時段宜固定且不可調整','健康第一；服務時間可待活動後再補','合理安排；但工作表現毋須再檢查'],['合理安排需照顧不同工作需要。','妥善政策應兼顧必要服務。','原文以可能性談效益，仍宜評估。']],
  [['運動可能改善健康，效率仍須靠延長工時','關心員工可提高忠誠，休息不影響效率','效率與健康可並存，前提是員工自付時間'],['文章指出專注與活力亦能影響效率。','休息安排可能改變其後表現。','作者支持工作日內的合理安排。']],
  [['支持；運動可保健康，工作表現留待另議','支持；公司宜提供較長時間健身訓練','反對；員工健康應由下班活動負責'],['遺漏作者對僱主效率的論證。','原文提倡合理短暫活動，而非長時訓練。','與支持工作日活動的立場相反。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
export default {key:'opinion:87',meta:{topic:'公司應否在工作日提供運動時間',summary:'作者堅定支持公司在工作日預留合理的運動時間。久坐與長時間對螢幕可能造成背痛、疲倦和壓力；短暫伸展、步行或健身有助員工精神恢復。健康員工也可能更有活力、專注與忠誠，並感到公司重視自己作為人，從而改善士氣和工作表現。結論保留「合理安排」的條件，並非保證所有公司必然增產。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};
