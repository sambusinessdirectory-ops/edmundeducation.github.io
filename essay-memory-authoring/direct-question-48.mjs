// Choosing a job: income as family security, balanced with health and growth.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['direct-question:48'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'Choosing a job is not just about what someone wants to achieve; for many grown-ups, it also affects the lives of the people who rely on them.',
 'I think pay is certainly important when choosing work, because money that comes in regularly helps keep a family safe and able to live with respect.',
 'But we must also think carefully about health, whether the job is right for the person and how they can grow over time.',
 'Pay matters because keeping a family safe usually starts with having enough money each month.',
 'Someone who earns enough to pay for a home, meals, school and healthcare is less likely to make the family worry all the time.',
 'This is especially true for parents: the job they choose can affect not just their own lives but also the chances their children have.',
 'For example, a parent might like a creative job that pays little, but if it cannot cover rent or school bills, the family may have to live with pressure they could have avoided.',
 'In this way, wanting enough money is not being selfish; it helps protect the family when things go wrong.',
 'Even so, people should not choose a job only because it pays more.',
 'One big thing to consider is having time for both work and home, because a well-paid job can hurt family life if the hours are too long or the pressure is too high.',
 'A person who earns a lot but is always tired, rarely at home or unable to support others emotionally may fail to give the family the safety money was meant to give.',
 'Another important question is whether the work fits what the person can do and lets them get better at it.',
 'When people work where they can learn skills, get experience and build a career that can last, they may be more able to find work and believe in themselves later.',
 'To sum up, I think pay is very important when choosing work, especially for people who must care for family members.',
 'But the best job gives enough money without harming health, family ties or chances to grow in future.',
];
const vocabulary=[
 v(['career','job','職業'],['personal ambition','what someone wants to achieve','個人抱負'],['welfare','lives','福祉'],['depend on them','rely on them','依賴他們']),
 v(['undoubtedly','certainly','無疑'],['selecting a job','choosing work','選擇工作'],['stable income','money that comes in regularly','穩定收入'],['protection','safe','保障'],['dignity','live with respect','尊嚴']),
 v(['other considerations','also think carefully','其他考慮'],['health','health','健康'],['suitability','job is right for the person','適合程度'],['long-term development','grow over time','長期發展']),
 v(['Income','Pay','收入'],['family security','keeping a family safe','家庭安全'],['financial stability','enough money each month','財務穩定']),
 v(['earns enough','earns enough','賺得足夠'],['housing','a home','住房'],['medical care','healthcare','醫療'],['household','family','家庭'],['constant anxiety','worry all the time','持續焦慮']),
 v(['particularly true for parents','especially true for parents','對父母尤其如此'],['career choices','job they choose','職業選擇'],['own comfort','own lives','自身舒適'],['children’s opportunities','chances their children have','子女機會']),
 v(['creative but poorly paid job','creative job that pays little','有創意但低薪工作'],['cover rent','cover rent','付租金'],['school expenses','school bills','學費'],['unnecessary pressure','pressure they could have avoided','不必要壓力']),
 v(['In this sense','In this way','從此角度'],['money is not greed','wanting enough money is not being selfish','金錢非貪婪'],['safety net','helps protect the family when things go wrong','安全網']),
 v(['Nevertheless','Even so','然而'],['salary alone','only because it pays more','單憑薪金'],['chosen','choose','選擇']),
 v(['major factor','big thing to consider','主要因素'],['work-life balance','time for both work and home','工作生活平衡'],['high-paying occupation','well-paid job','高薪工作'],['excessive hours','hours are too long','過長工時'],['severe stress','pressure is too high','嚴重壓力']),
 v(['well-paid employee','person who earns a lot','高薪員工'],['exhausted','tired','疲憊'],['absent','rarely at home','缺席'],['emotionally unavailable','unable to support others emotionally','情感上無法投入'],['very security','safety','原欲提供的安全']),
 v(['Another important factor','Another important question','另一重要因素'],['suits the person’s abilities','fits what the person can do','適合能力'],['room for growth','lets them get better','成長空間']),
 v(['improve their skills','learn skills','提升技能'],['gain experience','get experience','累積經驗'],['sustainable career','career that can last','可持續職涯'],['employable','able to find work','保有就業能力'],['confident','believe in themselves','自信']),
 v(['In conclusion','To sum up','總結'],['vital factor','very important','重要因素'],['family responsibilities','care for family members','家庭責任']),
 v(['best career choice','best job','最佳職涯選擇'],['financial stability','enough money','財務穩定'],['without sacrificing','without harming','不犧牲'],['family relationships','family ties','家庭關係'],['future development','chances to grow in future','未來發展']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'Choosing a home is no longer simply a matter of personal ambition; for many adults, it is directly connected to the welfare of the people who depend on them.',d:[1,3,8],relation:'not simply ...; for many ... 把個人選擇連到家人福祉',formula:'Choosing [重大選擇] is no longer simply a matter of personal ambition; for many adults, it is directly connected to [受影響家人]',meaning:'選職業不只關乎抱負，也關乎家人福祉。',links:['Choosing a ', ' is no longer simply a matter of personal ambition; for many adults, it is directly connected to the welfare of the people who depend on them.'],labels:['影響家庭的選擇']},
 {example:'I believe that money is undoubtedly an important factor when selecting a career, because a stable income gives a family protection and dignity.',d:[0,3,8],relation:'because 說穩定收入如何保障家庭',formula:'I believe that money is undoubtedly an important factor when selecting [選擇], because a stable income gives a family protection and dignity',meaning:'金錢重要，穩定收入給家庭保障和尊嚴。',links:['I believe that money is undoubtedly an important factor when selecting a ', ', because a stable income gives a family protection and dignity.'],labels:['受金錢影響的選擇']},
 {example:'However, other considerations, especially health, suitability and long-term development, must also be taken seriously in every decision.',d:[0,3,8],relation:'However 補上健康適合與長期發展',formula:'However, other considerations, especially [三項非金錢因素], must also be taken seriously',meaning:'健康、適合程度和長遠發展也重要。',links:['However, other considerations, especially health, suitability and long-term development, must also be taken seriously'],labels:['作決定的背景']},
 {example:'Regular pay matters because family security usually begins with basic financial stability.',d:[1,8,9],relation:'because 將收入與基本安全感連起',formula:'[收入] matters because family security usually begins with basic financial stability',meaning:'收入重要因家庭安全以基本財務穩定為起點。',links:[' matters because family security usually begins with basic financial stability.'],labels:['與保障相關的資源']},
 {example:'A person who earns enough to pay for housing, food, education and medical care is less likely to expose their parents to constant anxiety.',d:[3,8,9],relation:'who 定義足額收入，less likely 表示家庭焦慮風險下降',formula:'A person who earns enough to pay for [四項開支] is less likely to expose [家人] to constant anxiety',meaning:'足夠支付住食學醫，家庭較少長期焦慮。',links:['A person who earns enough to pay for housing, food, education and medical care is less likely to expose their ', ' to constant anxiety.'],labels:['被保障家人']},
 {example:'This is particularly true for carers, whose career choices can affect not only their own comfort but also their relatives’ opportunities.',d:[3,8,9],relation:'whose 和 not only ... but also ... 說明選職影響本人與依賴者',formula:'This is particularly true for [有照顧責任者], whose career choices can affect not only [自身] but also [家人機會]',meaning:'父母選職也影響子女機會。',links:['This is particularly true for ', ', whose career choices can affect not only their own comfort but also their ', ' opportunities.'],labels:['負責照顧者','受影響家人']},
 {example:'For example, a parent may prefer a creative but poorly paid job, but if that income cannot cover rent or school expenses, the whole family may be forced to live under unnecessary pressure.',d:[3,8,9],relation:'but if 用父母例子比較喜好與家庭開支現實',formula:'For example, [家長] may prefer [低薪理想工作], but if that income cannot cover [開支], the whole family may face pressure',meaning:'創意工作若不足付租學費，家庭或承受壓力。',links:['For example, ', ' may prefer a creative but poorly paid job, but if that income cannot cover rent or school expenses, the whole family may be forced to live under unnecessary pressure.'],labels:['有照顧責任的人']},
 {example:'In this sense, saving money is not greed; it is a safety net.',d:[3,8,9],relation:'not greed; safety net 糾正對重視收入的道德誤解',formula:'In this sense, [對收入的重視] is not greed; it is a safety net',meaning:'重視金錢是家庭安全網，不必然是貪婪。',links:['In this sense, ', ' is not greed; it is a safety net.'],labels:['被誤解的金錢行為']},
 {example:'Nevertheless, a home should not be chosen by price alone.',d:[3,4,12],relation:'Nevertheless 由收入重要轉入不能單看薪金',formula:'Nevertheless, [選擇] should not be chosen by [單一指標] alone',meaning:'不應只按薪金選工作。',links:['Nevertheless, a ', ' should not be chosen by ', ' alone.'],labels:['需要比較的選擇','不夠充分的單一標準']},
 {example:'One major factor is work-life balance, because a high-paying occupation can damage family life if it demands long hours or creates severe stress.',d:[3,4,12],relation:'because ... if ... 說高薪亦可因長工時壓力傷家庭',formula:'One major factor is work-life balance, because [高薪工作] can damage family life if [過長工時或壓力]',meaning:'高薪若換來長工時高壓，家庭生活可受損。',links:['One major factor is work-life balance, because a high-paying occupation can damage family life if it demands ', ' or creates severe stress.'],labels:['過長工時']},
 {example:'A well-paid employee who is always exhausted, absent or emotionally unavailable may fail to provide the very security that money was supposed to create for children.',d:[3,4,12],relation:'who 例子指出高薪與原欲提供的安全感可能矛盾',formula:'A well-paid employee who [三項付出代價] may fail to provide the very security that money was supposed to create',meaning:'高薪但疲累缺席者未必能給家庭預期安全。',links:['A well-paid employee who is always exhausted, absent or emotionally unavailable may fail to provide the very security that money was supposed to create'],labels:['受影響家人']},
 {example:'Another important factor is whether the course suits the person’s abilities and offers room for growth.',d:[3,4,9],relation:'whether ... and ... 加能力匹配及成長空間',formula:'Another important factor is whether [選項] suits the person’s abilities and offers room for growth',meaning:'工作也要適合能力並有成長空間。',links:['Another important factor is whether the ', ' suits the person’s abilities and offers room for growth.'],labels:['待評估選項']},
 {example:'When young adults work in a field where they can improve their skills, gain experience and build a sustainable career, they are more likely to remain employable and confident in the long run.',d:[3,4,9],relation:'When 條件下技能經驗職涯支持長遠就業與信心',formula:'When [人] work in a field where they can [學習成長], they are more likely to remain employable and confident in the long run',meaning:'有技能成長與經驗者長遠較能就業且有信心。',links:['When ', ' work in a field where they can improve their skills, gain experience and build a sustainable career, they are more likely to remain employable and confident in the long run.'],labels:['得到成長機會的人']},
 {example:'In conclusion, I believe money is a vital factor when choosing a home, especially for those with family responsibilities.',d:[3,4,9],relation:'結論重申錢對家庭責任者尤重要',formula:'In conclusion, I believe money is a vital factor when choosing [選項], especially for those with family responsibilities',meaning:'有家庭責任時，金錢是重要選職因素。',links:['In conclusion, I believe money is a vital factor when choosing a ', ', especially for those with family responsibilities.'],labels:['需考慮收入的選擇']},
 {example:'However, the best career choice is one that provides financial stability without sacrificing sleep, family relationships or future development.',d:[3,4,9],relation:'without sacrificing 平衡財務安全與健康家庭發展',formula:'However, the best career choice provides financial stability without sacrificing [三種非金錢需要]',meaning:'最好選擇有穩定收入又不犧牲健康、關係與發展。',links:['However, the best career choice is one that provides financial stability without sacrificing ', ', family relationships or future development.'],labels:['被保留的健康面向']},
];
const usage=[
 '當你要用 not simply ...; for many ... 表達個人選擇也影響依賴者時。',
 '當你要用 because 解釋一項財務因素如何保障家庭時。',
 '當你已承認金錢重要，還要用 However 加入其他評估標準時。',
 '當你要用簡短主題句說明財務穩定與家庭安全的關係時。',
 '當你要列出基本開支，說明足夠收入如何減少家庭焦慮時。',
 '當你要用 not only ... but also ... 說明一人的選擇也影響家人時。',
 '當你要用具體家庭例子比較理想工作與必要開支時。',
 '當你要用短句糾正「重視收入即貪婪」的簡化判斷時。',
 '當你承認一項標準有用，仍要說明不能單靠它作決定時。',
 '當你要用 if 說明高回報選項仍可因時間或壓力造成代價時。',
 '當你要指出某高薪安排可能反而削弱原本想帶來的安全感時。',
 '當你要用 whether 評估選項是否符合能力並提供成長空間時。',
 '當你要用 When 說明學習機會對長遠就業能力的影響時。',
 '當結論要重申財務因素對有照顧責任者尤為重要時。',
 '當你要用 without sacrificing 平衡收入與健康、關係和發展時。',
];
const structures=specs.map((s,i)=>({example:s.example,distractors:s.d,frame:frame(i,s.formula,s.meaning,usage[i],s.links,s.labels),answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}));
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先說收入如何保障家人，再說其餘選職標準。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[quiz('本文對選職時的金錢持甚麼立場？',['收入非常重要，仍須兼顧健康、適合度與長遠發展。','收入完全不重要。','只需找最高薪工作。','每名家長都必須選同一種職位。'],'金錢是家庭安全網，但不是唯一標準。'),{type:'multi',prompt:'範文提出的兩組評估標準是哪些？',detail:'選兩項，再按「確認」。',options:['能否支付家庭基本開支。','工時壓力、能力匹配與未來成長。','只看職位名稱是否夠長。','只看工作地點的建築高度。'],correct:[0,1],why:'收入與非金錢因素均須評估。'}];
const route=[sequence('還原四段結構',[['引言','選職影響依賴者；收入重要，也要看健康適合與發展。'],['收入及家庭','穩定收入支付住食學醫，父母尤其須顧家計。'],['其他因素','高薪高壓或傷家庭；能力匹配和成長保障長遠職涯。'],['結論','收入必需，但最好工作不犧牲健康、關係與發展。']],'收入的必要性與只看薪水是不同判斷。')];
const evidence=[quiz('穩定收入具體可支付甚麼？',['住房、食物、教育及醫療。','只有新職銜和名片。','只可購買旅遊門票。','不能支付任何家庭開支。'],'原文列四類基本開支。'),quiz('父母選職為何特別需要考慮金錢？',['收入也影響子女機會，不只影響自己的舒適。','因父母必然不能做有創意工作。','因子女開支和職業選擇完全無關。','因任何高薪工作都沒有工時。'],'whose 子句擴展到子女。'),quiz('高薪工作可能如何反而削弱家庭安全？',['過長工時和壓力使人疲累缺席、難給情緒支持。','薪金一高，家庭關係便必然完美。','工時與家庭生活永遠無關。','只要收入高，身心健康必然更好。'],'金錢想提供的安全也含相處與健康。'),quiz('適合能力及成長空間為何重要？',['提升技能、累積經驗可支持長遠就業能力與自信。','成長只能指每年更換工作桌。','技能提高必然令任何人失業。','合適工作必然無需再學習。'],'長遠職涯而非只有即時工資。'),quiz('結論的最佳選職條件是甚麼？',['財務穩定且不犧牲健康、關係或未來發展。','只選眼前最高薪，不看其他代價。','只選最有創意，不付家庭開支。','只看職位是否方便拍照。'],'without sacrificing 結合兩邊。')];
const logic=[sequence('收入到家庭保障',[['穩定收入','每月有足夠資金。'],['基本開支','住、食、學、醫可支付。'],['家庭感受','長期焦慮風險較低。'],['父母例子','收入不足付租學費會增加全家壓力。']],'重視金錢是保障依賴者，不必然是貪婪。'),sequence('高薪與長遠適合的權衡',[['高薪代價','工時及壓力可傷健康家庭。'],['能力匹配','工作合適並有成長空間。'],['長遠結果','技能經驗支持就業能力與自信。'],['最佳選擇','收入穩定而不犧牲其他重要需要。']],'高薪本身不能保證家庭安全。')];
const transfers=[
 transfer('一位家長收入不足以支付租金和孩子學費。','哪句準確說明金錢因素？',['足夠收入可支付基本開支並減少全家的長期焦慮。','只要工作有創意，家庭所有帳單便自動付清。','家長收入與子女機會完全無關。','關心租金必然代表貪婪。'],['基本開支→家庭保障。','不會自動。','有關。','是安全需要。'],[3,4,5,6],'income→housing/education/security。'),
 transfer('某父親喜歡創意工作，但該職位不足付租金。','哪句對應範文的取捨？',['喜好值得考慮，但若收入不足，全家可能承受不必要壓力。','創意工作必然提供足夠收入。','只要父親喜歡，家庭支出便不重要。','所有創意工作都應被禁止。'],['承認喜好，同時檢查必要開支。','無保證。','依賴者受影響。','原文無禁令。'],[6,7],'creative poorly paid job but rent/school costs。'),
 transfer('一名員工薪金高，但常缺席家庭活動且情緒耗盡。','哪句指出高薪的限制？',['高薪若伴隨長工時和嚴重壓力，可能無法給家庭原期望的安全感。','高薪必然使所有家庭成員得到足夠陪伴。','疲累和缺席與工作安排完全無關。','收入高便不需要健康。'],['高薪→壓力→安全目標落空。','不保證陪伴。','可有關。','健康重要。'],[9,10],'security money was supposed to create。'),
 transfer('一份工作薪金中等，但可持續學習和累積經驗。','哪句說明長遠價值？',['技能和經驗增加，可能使人日後較有就業能力和自信。','只有即時最高薪才可能建立職涯。','持續學習一定使任何人無法工作。','能力是否匹配與長期發展無關。'],['成長→長遠可就業。','過度。','方向相反。','正是考量。'],[11,12],'suits abilities + room for growth。'),
 transfer('另一題問父母選居所是否只看價格。','哪句能轉用本文框架？',['可先看基本負擔能力，再看健康、家庭生活與長遠適合。','因選職要看薪水，買房只需看門牌顏色。','只要價格低，所有環境問題必然消失。','居所對家人從不會有影響。'],['必要成本與非金錢品質可跨題。','不相關。','過度。','家人受影響。'],[0,3,9,14],'financial stability without sacrificing other needs。'),
 transfer('有人說「把金錢當選職因素就是貪婪」。','哪句回應最貼切？',['對有家人依賴的人，穩定收入可成為支付基本開支的安全網。','關心收入的人必然不在意任何家人。','家庭食物和醫療毋須資金。','所有職位都保證收入完全相同。'],['safety net 糾正道德簡化。','與原文相反。','需資金。','無保證。'],[4,7],'money is not greed; safety net。'),
 transfer('作文只寫「高薪好」，未分析為何。','哪句補足機制？',['穩定收入支付住房、食物、教育和醫療，家庭較少陷入持續焦慮。','高薪好，因為高薪好。','收入越高，所有工時必然越短。','薪水與家庭開支完全無關。'],['收入→基本開支→安全感。','循環。','無保證。','有關。'],[3,4],'financial stability→less anxiety。'),
 transfer('一名員工為了高薪長期工作到深夜，無時間陪子女。','哪句評估得較完整？',['要比較收入收益與健康及家庭關係代價，不能只看薪金。','收入高便保證家庭關係沒有任何代價。','子女機會只能由薪金決定。','工時與家庭互動完全無關。'],['高薪不等於總體最佳。','過度。','關係也影響。','有關。'],[9,10,14],'work-life balance and family life。'),
 transfer('一個選職表格只有「月薪」一欄。','哪幾項最應增加？',['工時和健康、能力是否合適、技能與職涯成長空間。','職銜字母數量和公司大門顏色。','再寫一欄「只看月薪」。','不記錄任何家庭責任。'],['把非金錢因素具體化。','不相關。','仍單一。','家庭責任重要。'],[2,9,11,12],'health/suitability/development。'),
 transfer('結論需保留收入的重要性而避免只看錢。','哪句最符合範文？',['最佳工作能提供財務穩定，也不犧牲健康、家庭關係和未來發展。','金錢完全不重要，即使無法付食物費。','只要高薪，其餘一切必然理想。','最佳選擇只取決於職位名稱。'],['financial stability without sacrificing。','忽視基本支出。','過度。','不相關。'],[13,14],'結論平衡收入與其他需要。'),
];
// Final four-choice sets keep the answer visually indistinguishable by Han count.
const balancedTransferOptions=[
 ['收入足以支付基本開支，家人較少長期為生活費擔憂。','只要工作有創意，即使欠租，家人也不會有經濟壓力。','家長收入高低只影響本人，與子女的教育費用無關。','只要家人減少娛樂支出，租金與學費就不需考慮。'],
 ['喜好值得考慮，但收入不足付租金會令全家承受壓力。','只要工作有創意，即使無法付租金也不會影響家人。','家長只應看薪金，因任何創意工作都必然無法養家。','付不起學費只與學校有關，與家長工作收入無關。'],
 ['高薪若換來過長工時，家庭仍可能得不到需要的安全感。','只要薪金夠高，家人便不會在乎長期缺席和壓力。','員工常感疲累，是家庭活動太多，並非工時可能過長。','高薪能支付全部帳單，便代表情緒支持已經足夠。'],
 ['技能與經驗持續增長，長遠或使人較易就業和更自信。','中等薪金說明這份工作沒有前途，學習機會也不重要。','累積經驗只影響眼前薪金，與未來求職能力沒有關係。','只要持續學習，便可保證往後永遠不需要再找工作。'],
 ['可先看負擔能力，再衡量居住環境是否有利健康與家人。','若房價最低，居住環境與家庭關係便不需要再比較。','只要居住環境舒服，家庭便不必計算房租和日常開支。','選居所只須看交通路線，價格和家人需要都不用考慮。'],
 ['穩定收入可支付家人基本開支，因此是一種家庭安全網。','關心收入便表示只重視自己，與家人的生活需要無關。','家長只要喜歡工作，食物和醫療費便自然有人支付。','家庭安全只取決於工作職銜，收入是否穩定並不重要。'],
 ['穩定收入支付住食學醫，可減少家庭持續面對的焦慮。','薪金提高會自然縮短工時，因此家人必定不再感到焦慮。','家庭的焦慮只來自房屋大小，與收入和必要開支無關。','只要僱主支付薪金，家庭所有醫療支出便一定全免。'],
 ['應比較收入好處與健康、陪伴家人的代價，不宜只看薪金。','只要收入夠高，長期缺席與疲累也不會影響家庭生活。','子女的機會只取決於學費，與父母身心狀況沒有關係。','即使工時過長，選職時仍應完全排除家庭關係的影響。'],
 ['應加上工時與健康、能力匹配，以及技能成長的評估欄。','應加上職銜長短與公司門牌顏色，方便比較職位高低。','應把月薪再列三次，因重複薪金便能涵蓋其他因素。','應只加交通時間一欄，其他家庭和健康因素均可略去。'],
 ['好工作有穩定收入，也不犧牲健康、家庭關係和未來發展。','好工作只須給最高薪，健康與家庭關係可以完全不理。','好工作只須很有趣，即使無法支付家庭基本開支也無妨。','好工作只需目前穩定，未來技能與職涯發展毋須考慮。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options;});
export default {key:'direct-question:48',meta:{topic:'選擇工作時金錢與其他因素',summary:'文章先說穩定收入如何保障家人、減少焦慮，再分析過長工時和壓力的代價，以及能力匹配與長遠成長；結論要求財務穩定而不犧牲健康與關係。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
