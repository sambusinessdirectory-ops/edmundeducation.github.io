// Reviewed complete-sentence support for Discuss Both Views 24.
import fs from 'node:fs';import vm from 'node:vm';const context={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-24-ielts-discuss-both-views.js',import.meta.url),'utf8'),context);const source=context.window.ESSAY_MEMORY_LESSONS['discuss-both-views:24'];const original=source.sentences.map(s=>s.english);
const simple=[
 'Too many children are now very overweight, and this is a serious health problem in many countries.',
 'Some people say governments are to blame for this rise, while others say parents are mostly responsible.',
 'I think parents shape children’s daily habits, but governments have more responsibility because they control the wider world of food and daily life in which families choose.',
 'People who blame parents have a good reason.',
 'Children do not usually buy food, cook or decide everything they do each day by themselves, so parents strongly affect what they eat and how much they move.',
 'If parents often give children fast food, allow too much time with screens and do not encourage movement, children may learn unhealthy habits while young.',
 'For example, a child who watches videos every evening while eating sweet snacks may slowly think this way of life is normal.',
 'So parents are the first people who can help stop children becoming very overweight, because they control what happens at home.',
 'But I think governments have more responsibility because they set up the conditions that make unhealthy choices common.',
 'Many children see many ads for unhealthy food, find cheap ready-made meals and live where it is hard to play safely outside.',
 'One parent cannot easily solve these problems.',
 'Governments can limit ads for unhealthy food, make school meals better, require food labels that are easier to read and build parks or sports places.',
 'If government rules let unhealthy food be cheap, easy to see and easy to buy, while healthy food costs more or is hard to find, parents must work very hard against these conditions.',
 'In the end, parents do affect what children eat and how much they move, but governments have the bigger responsibility.',
 'Families can guide children at home, but only governments can set rules for food companies, make public places better and give all children a healthier place to live.',
 'So we should mainly see children becoming very overweight as a problem with government rules, not just a result of parents doing a poor job.',
];
const vocabulary=[
 [['Childhood obesity','Too many children are now very overweight','兒童肥胖'],['serious public health concern','serious health problem','嚴重公共健康問題'],['many countries','many countries','許多國家']],
 [['governments should be blamed','governments are to blame','政府應受責怪'],['this trend','this rise','這種趨勢'],['mainly responsible','mostly responsible','主要責任']],
 [['play an important role','shape','有重要作用'],['daily habits','daily habits','日常習慣'],['bears greater responsibility','have more responsibility','責任較大'],['wider food and social environment','wider world of food and daily life','廣泛飲食社會環境']],
 [['Those who blame parents','People who blame parents','責怪父母的人'],['reasonable argument','good reason','合理論點']],
 [['rarely','do not usually','很少'],['groceries','food','食材'],['daily routines','everything they do each day','日常作息'],['strongly influence','strongly affect','強烈影響'],['how active they are','how much they move','活動量']],
 [['regularly serve fast food','often give children fast food','經常提供快餐'],['excessive screen time','too much time with screens','過多螢幕時間'],['fail to encourage exercise','do not encourage movement','沒有鼓勵運動'],['develop unhealthy habits','learn unhealthy habits','養成不健康習慣'],['early age','while young','年幼時']],
 [['For example','For example','例如'],['sugary snacks','sweet snacks','含糖零食'],['gradually','slowly','逐漸'],['lifestyle','way of life','生活方式']],
 [['In this sense','So','從這個意義上'],['first line of defence','first people who can help stop','第一道防線'],['obesity','very overweight','肥胖'],['home environment','what happens at home','家庭環境']],
 [['However','But','然而'],['more responsible','more responsibility','責任更大'],['shape the conditions','set up the conditions','塑造條件'],['unhealthy choices so common','unhealthy choices common','不健康選擇普遍']],
 [['aggressive advertising','many ads','強勢廣告'],['junk food','unhealthy food','垃圾食品'],['cheap processed meals','cheap ready-made meals','廉價加工食品'],['safe outdoor play is limited','hard to play safely outside','安全戶外玩樂有限']],
 [['individual parents','One parent','個別父母'],['easily solve','easily solve','容易解決'],['These are not problems','these problems','不是這些問題']],
 [['restrict unhealthy food marketing','limit ads for unhealthy food','限制不健康食物廣告'],['improve school meals','make school meals better','改善學校膳食'],['clearer nutrition labels','food labels that are easier to read','更清晰營養標籤'],['sports facilities','sports places','體育設施']],
 [['public policy','government rules','公共政策'],['unhealthy food cheap, visible, and convenient','unhealthy food be cheap, easy to see and easy to buy','垃圾食品廉價顯眼方便'],['healthy options','healthy food','健康選擇'],['expensive or inaccessible','costs more or is hard to find','昂貴或難取得'],['fighting an uphill battle','must work very hard against these conditions','處於艱難處境']],
 [['In conclusion','In the end','總結'],['eating and exercise habits','what children eat and how much they move','飲食運動習慣'],['stronger responsibility','bigger responsibility','較大責任']],
 [['guide children at home','guide children at home','在家引導孩子'],['regulate food companies','set rules for food companies','規管食品公司'],['improve public spaces','make public places better','改善公共空間'],['healthier environment','healthier place to live','更健康環境']],
 [['Therefore','So','因此'],['childhood obesity','children becoming very overweight','兒童肥胖'],['failure of public policy','problem with government rules','公共政策失敗'],['poor parenting','parents doing a poor job','教養不善']],
];
const chunkOverrides=[
 ['Childhood obesity has become a serious public health concern','in many countries.'],
 ['While some argue that governments should be blamed','for this trend, others believe that parents are mainly responsible.'],
 ['In my view, although parents play an important role','in shaping children’s daily habits, the government bears greater responsibility','because it controls the wider food and social environment','in which families make their choices.'],
 ['Those who blame parents','have a reasonable argument.'],
 ['Children rarely buy groceries, cook meals,','or decide their daily routines entirely on their own,','so parents strongly influence what they eat','and how active they are.'],
 ['If mothers and fathers regularly serve fast food,','allow excessive screen time, and fail to encourage exercise,','children are likely to develop unhealthy habits','from an early age.'],
 ['For example, a child who spends every evening','watching videos while eating sugary snacks','may gradually see this lifestyle as normal.'],
 ['In this sense, parents are the first line of defence','against obesity because they control the home environment.'],
 ['However, I believe governments are more responsible','because they shape the conditions','that make unhealthy choices so common.'],
 ['Many children are surrounded by aggressive advertising for junk food,','cheap processed meals, and neighbourhoods','where safe outdoor play is limited.'],
 ['These are not problems that','individual parents can easily solve.'],
 ['Governments can restrict unhealthy food marketing,','improve school meals, require clearer nutrition labels,','and build parks or sports facilities.'],
 ['If public policy makes unhealthy food cheap, visible, and convenient,','while healthy options remain expensive or inaccessible,','parents are fighting an uphill battle.'],
 ['In conclusion, parents certainly influence children’s eating and exercise habits,','but the stronger responsibility lies with the government.'],
 ['Families can guide children at home,','yet only governments can regulate food companies,','improve public spaces, and create a healthier environment','for all children.'],
 ['Therefore, childhood obesity should be seen primarily','as a failure of public policy rather than simply poor parenting.'],
];
const simpleChunkOverrides=[
 ['Too many children are now very overweight,','and this is a serious health problem in many countries.'],
 ['Some people say governments are to blame for this rise,','while others say parents are mostly responsible.'],
 ['I think parents shape children’s daily habits,','but governments have more responsibility because they control','the wider world of food and daily life','in which families choose.'],
 ['People who blame parents','have a good reason.'],
 ['Children do not usually buy food, cook','or decide everything they do each day by themselves,','so parents strongly affect what they eat','and how much they move.'],
 ['If parents often give children fast food,','allow too much time with screens','and do not encourage movement,','children may learn unhealthy habits while young.'],
 ['For example, a child who watches videos every evening','while eating sweet snacks may slowly think','this way of life is normal.'],
 ['So parents are the first people who can help stop','children becoming very overweight,','because they control what happens at home.'],
 ['But I think governments have more responsibility','because they set up the conditions','that make unhealthy choices common.'],
 ['Many children see many ads for unhealthy food,','find cheap ready-made meals','and live where it is hard to play safely outside.'],
 ['One parent cannot easily','solve these problems.'],
 ['Governments can limit ads for unhealthy food,','make school meals better,','require food labels that are easier to read','and build parks or sports places.'],
 ['If government rules let unhealthy food be cheap,','easy to see and easy to buy,','while healthy food costs more or is hard to find,','parents must work very hard against these conditions.'],
 ['In the end, parents do affect what children eat','and how much they move,','but governments have the bigger responsibility.'],
 ['Families can guide children at home,','but only governments can set rules for food companies,','make public places better','and give all children a healthier place to live.'],
 ['So we should mainly see children becoming very overweight','as a problem with government rules,','not just a result of parents doing a poor job.'],
];
const part=(text,kind,label)=>({text,kind,label});function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的句法及語意關係相同。`,distractorReason:`這句${focus}，卻不是原句的語意關係。`};}
const structures=[
 card('Youth sleep loss has become a serious public health concern in many countries.','以 has become ... concern 引入公共健康問題',[1,3,8],fixed(0,'[問題] has become a serious public health concern in [地區].','引言先指出兒童肥胖在多國已屬公共健康問題。','要開篇把某種現象定位為多地共有的公共健康問題時。',[' has become a serious public health concern in '],['正在擴大的健康問題','問題出現的地區'])),
 card('While some argue that schools should be blamed for this trend, others believe that families are mainly responsible.','以 While some ... others ... 並列責任歸屬',[0,3,13],fixed(1,'While some argue that [機構] should be blamed for this trend, others believe that [另一方] are mainly responsible.','引言並列責怪政府或父母的兩種看法。','同一問題有兩種責任歸屬，需先公平呈現兩方判斷時。',['While some argue that ',' should be blamed for this trend, others believe that ',' are mainly responsible.'],['第一方認為應負責者','第二方認為主責者'])),
 card('In my view, although parents encourage reading at home, the education department bears greater responsibility because it controls the school system in which families make their choices.','以 although ... greater responsibility because ... 選環境塑造者',[1,8,14],fixed(2,'In my view, although [家庭有作用], [公共機構] bears greater responsibility because it controls [更廣環境] in which [家庭] make their choices.','父母影響日常習慣，但政府控制家庭選擇所處的更廣環境。','兩方都有影響，要以誰控制大環境為標準選較大責任方時。',['In my view, although ',', ',' bears greater responsibility because it controls ',' in which ',' make their choices.'],['另一方確有的作用','被判負更大責任的機構','影響個人選擇的環境','在其中作選擇的人'])),
 card('Those who blame schools have a reasonable argument.','以 Those who blame ... 合理引出對方論點',[1,4,8],fixed(3,'Those who blame [某方] have a reasonable argument.','作者先公平承認責怪父母的一方有道理。','要開始討論自己不選為主責的一方，仍先承認其理由值得看時。',['Those who blame ',' have a reasonable argument.'],['被認為應負責的一方'])),
 card('Children rarely choose all the books they read entirely on their own, so parents strongly influence what stories they see and how often they practise.','以 rarely ... on their own, so ... 指出監護人影響',[3,5,7],fixed(4,'Children rarely [完全自行決定], so parents strongly influence [一種習慣] and [另一種習慣].','孩子多由父母安排食物及作息，因此家庭會影響飲食與活動量。','要先交代一方對某事的控制有限，再用 so 推出另一方的影響時。',['Children rarely ',' entirely on their own, so parents strongly influence ',' and '],['孩子通常不能獨決的事','照顧者影響的第一種行為','第二種行為'])),
 card('If adults routinely stay up late, skip breakfast, and avoid walking, children are likely to develop poor routines from an early age.','以 If ... children ... develop ... 說家庭示範後果',[4,6,7],fixed(5,'If [照顧者的幾項習慣], children are likely to develop [相似習慣] from an early age.','父母常給快餐、任由看屏幕、不鼓勵運動，孩子可能從小養成壞習慣。','要把照顧者重複的日常做法連到孩子早期習慣時。',['If ', ', ', ', and ', ', children are likely to develop ', ' from an early age.'],['照顧者的第一項行為','第二項行為','第三項行為','孩子可能養成的習慣'])),
 card('For example, a child who stays up late with a tablet while skipping breakfast may gradually see this routine as normal.','以 may gradually see ... as normal 具體化習慣正常化',[4,5,7],fixed(6,'For example, a child who [重複某行為] while [另一行為] may gradually see [生活方式] as normal.','孩子邊看影片邊吃甜食，可能逐漸覺得這樣生活很正常。','已說家庭習慣影響孩子，要舉可重複的日常情境說明正常化時。',['For example, a child who ',' while ',' may gradually see ',' as normal.'],['孩子反覆做的事','同時出現的另一習慣','漸被視為正常的做法'])),
 card('In this sense, teachers are the first line of defence against bullying because they control the classroom environment.','以 first line of defence ... control ... 說最早可介入者',[3,8,10],fixed(7,'In this sense, [最先接觸者] are the first line of defence against [問題] because they control [身邊環境].','父母控制家庭環境，因而是預防兒童肥胖的第一道防線。','要指出誰最早可在身邊環境阻止某問題形成時。',['In this sense, ',' are the first line of defence against ',' because they control '],['最早能介入的人','希望預防的問題','他們可控制的環境'])),
 card('However, I believe school leaders are more responsible because they shape the conditions that make poor attendance so common.','以 shape the conditions that make ... common 轉向制度主責',[2,7,9],fixed(8,'However, I believe [機構] are more responsible because they shape the conditions that make [壞選擇] so common.','作者轉向政府，理由是它塑造不健康選擇普遍的條件。','已承認個人影響，要指出制度如何使某種不良選擇普遍時。',['However, I believe ',' are more responsible because they shape the conditions that make ',' so common.'],['控制制度環境的一方','在該環境中變普遍的問題'])),
 card('Many children are surrounded by online ads, cheap screen devices, and neighbourhoods where safe outdoor play is limited.','以 surrounded by ... where ... 列孩子周遭誘因及限制',[8,10,12],fixed(9,'Many children are surrounded by [商業誘因], [便宜選項], and neighbourhoods where [健康活動] is limited.','廣告、廉價加工食物與缺少安全遊樂空間構成周遭條件。','要列出孩子周遭的多項誘因及健康活動限制時。',['Many children are surrounded by ', ', ', ', and neighbourhoods where ', ' is limited.'],['反覆接觸的宣傳','便宜而容易取得的東西','受限制的健康活動'])),
 card('These are not problems that one family can easily solve.','以 not problems ... can easily solve 指出個體能力界線',[7,9,11],fixed(10,'These are not problems that [個別家庭] can easily solve.','廣告、食物價格及安全遊樂空間不是個別父母容易改變的。','已列環境條件，要指出它們超出單一家庭的控制範圍時。',['These are not problems that ',' can easily solve.'],['能力有限的單一行動者'])),
 card('Governments can restrict gambling ads, improve addiction services, require clearer odds labels, and build youth activity centres.','以 can restrict ... improve ... require ... build 列政府工具',[8,10,12],fixed(11,'Governments can [限制廣告], [改善公共服務], [要求清楚資訊], and [建設空間].','政府可限制食品宣傳、改善學校膳食、要求清晰標籤及建設運動設施。','要把公共機構可採取的多種制度措施列成具體清單時。',['Governments can ', ', ', ', ', ', and '],['第一項規管','第二項公共服務','第三項資訊規則','第四項設施'])),
 card('If public policy makes private cars cheap, visible, and convenient, while buses remain expensive or inaccessible, commuters are fighting an uphill battle.','以 cheap ... while ... uphill battle 比較選擇環境',[2,9,11],fixed(12,'If [政策] makes [壞選項] cheap, visible, and convenient, while [好選項] remain [難取得], [個人] are fighting an uphill battle.','不健康食品易得便宜、健康食物卻昂貴難找時，父母很難逆勢而行。','要說明政策使某選項容易、健康選項卻難，個人為何難以改變時。',['If ',' makes ',' cheap, visible, and convenient, while ',' remain ', ', ', ' are fighting an uphill battle.'],['塑造選擇的政策','更易被選的做法','較理想的選項','它的取得障礙','被迫逆勢選擇的人'])),
 card('In conclusion, families certainly influence children’s reading habits, but the stronger responsibility lies with school leaders.','以 certainly influence ... but ... stronger responsibility 公平歸責',[2,7,14],fixed(13,'In conclusion, [家庭] certainly influence [孩子習慣], but the stronger responsibility lies with [制度方].','結論承認父母影響飲食運動，仍判政府責任更大。','要公平承認一方有影響，同時按制度控制力定另一方主責時。',['In conclusion, ',' certainly influence ', ', but the stronger responsibility lies with '],['確有影響的一方','他們能影響的習慣','負更大責任的一方'])),
 card('Families can help children read at home, yet only education departments can fund libraries, train teachers, and create stronger learning opportunities for all children.','以 Families can ... yet only ... can ... 對比家庭與公共權限',[7,11,13],fixed(14,'Families can [家庭引導] at home, yet only [政府] can [規管], [改善空間], and create [共同環境] for all children.','家庭只能引導自己的孩子；政府可規管產業與改善全體孩子的環境。','要對比家庭能做的近身引導與政府可普及的制度改變時。',['Families can ',' at home, yet only ',' can ', ', ', ', and create ',' for all children.'],['家庭能做的指引','具公共權限的機構','第一項公共行動','第二項公共行動','惠及所有孩子的環境'])),
 card('Therefore, widespread reading failure should be seen primarily as a failure of school resources rather than simply poor parenting.','以 primarily as ... rather than simply ... 定主要原因',[2,13,14],fixed(15,'Therefore, [問題] should be seen primarily as [制度失靈] rather than simply [個人失責].','最終把兒童肥胖主要看作公共政策問題，而非只怪教養。','已比較個人及制度影響，要在結尾指出主要原因而避免只怪個人時。',['Therefore, ',' should be seen primarily as ',' rather than simply '],['需要歸因的問題','較根本的制度原因','容易被過度責怪的個人因素'])),
];
const wrongReasons=[
 ['這句並列政府與父母責任，原句先交代健康問題背景。','這句只是承認父母一方有理，原句仍在引言。','這句已轉向政府主責的原因，原句未進入論證。'],
 ['這句只指出兒童肥胖嚴重，未並列兩方責任。','這句承認責怪父母有理，未於引言報告另一方。','這句結論再分責任，原句先介紹分歧。'],
 ['這句列兩派，未按誰控制選擇環境給作者判斷。','這句轉入政府段，未在引言同時讓步父母作用。','這句列家庭與政府能力，原句先給總立場。'],
 ['這句公平並列兩方，未開始深入父母方理由。','這句說孩子不能全由自己安排作息，原句先承認父母方合理。','這句作者選政府主責，與公平介紹父母方不同。'],
 ['這句只承認責怪父母有理，未解釋孩子依賴父母安排。','這句列父母不健康做法，原句先說影響來源。','這句以家庭第一道防線作概括，原句先列日常控制。'],
 ['這句說孩子由父母影響，未列快餐屏幕運動三種做法。','這句是孩子邊看影片邊吃甜食例子，未給一般條件。','這句歸納父母是防線，未分析壞習慣怎樣形成。'],
 ['這句列家庭不健康習慣，未以單一孩子描寫正常化。','這句概括父母第一道防線，未呈現孩子晚間場景。','這句已轉向政府條件，與家庭例子不同。'],
 ['這句說父母如何影響飲食與活動，未抽成第一道防線。','這句兒童看影片吃甜食的個案，未概括家庭環境。','這句政府塑造更廣條件，原句仍在父母段結尾。'],
 ['這句是引言先選政府，未在主體段說不健康選擇如何普遍。','這句把父母稱第一道防線，未轉到制度條件。','這句詳列廣告食物空間，原句先給政府責任理由。'],
 ['這句概括政府塑造條件，未列孩子面對的三項具體處境。','這句說個別父母難解決，原句先列外部環境。','這句列政府工具，原句先描繪問題來源。'],
 ['這句列外部條件，未直接指出單一父母的控制界線。','這句列政府可行措施，原句先指出個人難做。','這句逆勢比喻，原句是較短的能力判斷。'],
 ['這句說個別父母無法解決，未列政府四種政策。','這句是政策使健康選擇艱難的比較，未列可用工具。','這句結論對比家庭與政府能力，原句在政府段列措施。'],
 ['這句列政府可行措施，未比較選項價格與取得難度。','這句描繪廣告加工食物，未評估政策如何逆轉選擇。','這句已於結論歸責，原句先用 uphill battle 解釋。'],
 ['這句在引言選政府，未於結論重申父母的實際影響。','這句說政府有多種措施，未作兩方責任比較。','這句下一句展開家庭與公共權限，原句先判主次。'],
 ['這句把父母影響與政府責任並列，未詳列政府獨有能力。','這句在政府段列政策，未與家庭引導作直接對照。','這句最後定政策失敗為主要原因，原句先說能力差別。'],
 ['這句在引言選政府，未在終句作主要原因的定性。','這句承認父母影響但政府責任更大，未明示政策失敗。','這句列政府規管與空間能力，原句再把此化為歸因。'],
];structures.forEach((s,i)=>s.wrongReasons=wrongReasons[i]);
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先看父母能控制的家庭習慣，再看政府如何塑造更廣的食物及活動環境。',items:items.map(([title,body])=>({title,body})),why});
const intro=[quiz('題目要比較誰對兒童肥胖負主要責任？',['政府還是父母','食品包裝的兩種顏色','兩所學校誰有更多課室','兒童一天能看多少電影'],'核心是家庭日常選擇與公共政策的責任比較。'),{type:'multi',prompt:'選出作者的完整責任判斷',detail:'選兩項，再按「確認」。',options:['父母影響孩子吃甚麼及活動量，並非沒有責任','政府塑造食物廣告價格和空間，因此責任較大','只要父母努力，政府便不需管理任何食品廣告','兒童飲食完全由孩子自己決定，兩方均無影響'],correct:[0,1],why:'作者承認父母作用，以控制更廣條件為理由選政府主責。'}];
const route=[sequence('依文章次序排列責任比較',[['背景與立場','兒童肥胖是公共健康問題；作者選政府負較大責任。'],['父母理由','父母安排飲食、屏幕時間及活動，是家庭第一道防線。'],['父母例子','孩子看影片配甜食，可能把做法視為正常。'],['政府理由','廣告加工食物與缺安全活動空間非單一家庭可解。'],['政策結論','政府可規管宣傳、改善膳食與公園，需負主要責任。']],'作者以誰控制家庭選擇的更廣條件作最後判準。')];
const evidence=[
 quiz('孩子的飲食與活動為何受父母強烈影響？',['孩子通常不能獨自買食材、煮飯及安排作息','因孩子能獨自決定整個國家的食品價格','因孩子天生完全不會接觸家庭食物','因父母只能決定學校附近公園的建造'],'家庭控制日常餐飲和作息。'),
 quiz('哪些家庭做法可能令孩子早養成不健康習慣？',['常給快餐、過多屏幕時間、少鼓勵運動','常提供清水、安排遊戲及陪伴戶外活動','只給孩子閱讀營養標籤，沒有提供食物','只談學校建築位置，從不安排餐飲'],'文章列出三種可由父母改變的習慣。'),
 quiz('政府段指出孩子面對哪三種外部條件？',['垃圾食品廣告、廉價加工食物、缺安全遊樂地','只有家中餐桌大小及父母喜歡的電視節目','只有某一個孩子晚上觀看影片的習慣','只有超市職員身穿何種顏色的制服'],'外部條件影響許多家庭，不由單一父母決定。'),
 quiz('政府可用哪四種措施改善孩子的選擇環境？',['限食品宣傳、改善校餐、清楚標籤、建運動空間','只要求家長口頭批評快餐而不調整環境','只把零食包裝改色，其他政策全部停止','只在一間家庭廚房增加收費較高的屏幕'],'四類政策對應宣傳、供餐、資訊與活動空間。'),
 quiz('健康食物昂貴難取得時，作者怎樣形容父母？',['父母是在不利條件下艱難改變孩子習慣','父母只要想一想便可控制所有食品價格','父母完全不用管家中任何食物和作息','父母只需拒絕所有公園，孩子便會更活躍'],'「逆勢而行」說明制度條件會削弱個人努力。'),
 quiz('為何作者不只把兒童肥胖歸咎父母？',['政府控制食品公司規則與公共空間，影響所有孩子','因所有孩子每餐都完全獨立購買和煮食','因父母一旦有影響，政府便不可能也有影響','因肥胖問題只關係電視節目名稱而非健康'],'更廣的食物與社會環境受政策塑造。'),
];
const logic=[sequence('父母責任如何成立',[['日常控制','孩子通常依賴父母購食、煮食及安排作息。'],['反覆做法','快餐、屏幕時間與少運動影響早期習慣。'],['具體例子','看影片時吃甜食可被孩子視為正常生活。'],['有限結論','父母是家庭環境中的第一道防線。']],'作者認真承認家庭影響，並沒有把父母說成全無責任。'),sequence('政府為何負更大責任',[['外部條件','廣告、加工食物價格、安全遊樂空間影響許多孩子。'],['家庭界線','個別父母難改這些公共條件。'],['政府工具','限制宣傳、改善校餐、清楚標籤、建運動設施。'],['不利比較','壞選項易得而好選項難取，父母逆勢而行。'],['最後判斷','更廣環境由政策塑造，政府因此負主責。']],'制度讓某些選擇普遍，不能只責備在其中選擇的家庭。')];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
 transfer('一個孩子每天晚飯後吃甜點並看影片；父母可改變這個家庭安排。','哪項最符合範文對父母責任的判斷？',['父母控制家中作息，能先改飲食與活動習慣','只減少甜點，不改晚飯後長時間看影片','只限制孩子看影片，不問家中甜點安排','只讓學校提醒，不處理家庭每日作息'],['家庭日常安排確由父母影響。','減甜點有用，長時間看影片的活動習慣仍在。','限影片有用，晚飯後甜點也須考慮。','家庭掌握每日安排，不能只等學校提醒。'],[4,5,6,7],'父母控制家中食物作息，是第一道防線。'),
 transfer('某區只有垃圾食品便宜又易買，健康食物要轉車才能買到。','哪項最貼近「逆勢而行」？',['父母想選健康食物，仍受價格和距離阻礙','只教家長選食物，不改善價格和店舖距離','只降低價格，不問健康食品是否買得到','只問家庭意願，不分析附近食品供應'],['環境使較好選擇難，增加家庭努力成本。','教選食物有用，價格與距離仍是外在阻力。','降價有用，路程仍可能阻止購買。','意願不是附近供應條件的全部。'],[9,10,12],'壞選項便宜方便、好選項難取，父母更難改變。'),
 transfer('食品公司向孩子反覆播放零食廣告，家長可關掉一部電視，但廣告遍及各種平台。','依範文，哪項較能處理廣告規模？',['政府規管對兒童的推廣，家長也可教孩子辨識','只關家中電視，不處理其他平台的兒童廣告','只訂政府廣告規則，不教孩子辨認宣傳','只問孩子偏好，不查廣告如何反覆影響'],['政府處理普遍規模，家長仍可引導。','家中電視只是其中一個廣告渠道。','政府規則重要，家長仍能教孩子辨認。','偏好可能受反覆廣告影響。'],[8,9,10,11,14],'個別父母難改強勢宣傳；政府可限制食品市場推廣。'),
 transfer('一所學校午餐油糖過多，但父母在家已努力煮健康晚飯。','哪項最能轉用範文的責任分工？',['家庭可管晚飯，學校膳食需公共機構改善','只改善家庭晚飯，不問學校午餐品質','只要求學校改餐，不承認家庭也有作用','只統計午餐糖量，不安排公共膳食改善'],['家中與公共供餐各有控制者。','晚飯由家庭管，學校午餐仍須改善。','學校膳食重要，家中晚飯也有作用。','統計問題後還要有改善方案。'],[4,7,11,14],'父母管家中習慣，政府可改善學校膳食。'),
 transfer('附近沒有安全公園，孩子只能在繁忙道路旁玩，父母無法自行建公共場地。','哪項最符合範文的控制範圍？',['政府建安全空間，父母仍鼓勵孩子活動','只叫父母陪孩子運動，不建安全公共空間','只建公共公園，不鼓勵家庭實際使用','只禁止路邊玩，不提供可去的替代場地'],['政府控制公共空間，家庭仍可鼓勵。','陪運動有用，危險道路仍要公共空間。','公園有用，家長可鼓勵日常活動。','禁止危險地點後須有安全替代。'],[9,10,11,14],'安全戶外空間是公共條件，非單一家庭可解決。'),
 transfer('一項城市方案只勸父母不要買甜食，卻容許所有兒童食品廣告繼續投放。','依作者立場，方案缺少甚麼？',['限制不健康食品宣傳，改變更廣選擇環境','只勸個別家庭少買甜食，不限制廣告','只管廣告形式，不考慮健康食品可得性','只教孩子拒絕，不改廣泛的推廣環境'],['只勸家庭不足，仍須政策改廣告環境。','勸家長只是個人一面，廣告仍影響更廣選擇。','管廣告有用，食品是否可得也影響環境。','教拒絕有用，仍須處理推廣環境。'],[8,9,10,11],'政府可限制食品推廣，處理家庭難改的條件。'),
 transfer('家長讓孩子每天看屏幕數小時，也從不安排任何活動。','這個例子在範文中支持哪一方？',['支持父母影響早期生活習慣的一方','只看政府食品規則，不問家中屏幕習慣','只管學校餐食，不看父母安排的活動','只談公園不足，不回應家長每日作息'],['父母控制家中屏幕時間與活動鼓勵。','題目突出家中屏幕與活動，父母直接影響。','學校餐食不是這個家庭情境的重點。','公園不足可能重要，但未回答家長可改作息。'],[4,5,7],'家中反覆做法會影響孩子早期習慣。'),
 transfer('市府要求食品包裝清楚標示糖量，讓各區家庭都較容易比較。','哪項政策作用最貼近範文？',['清楚營養資訊可改善許多家庭的選擇條件','只提供糖量標示，不教家庭如何比較','只教家庭選購，不要求清楚包裝資訊','只檢查單店食品，不改善各區清楚標示'],['規定標籤是跨家庭的資訊條件。','標示有用，家長還須理解比較。','家庭教育重要，資訊本身要清楚。','單店措施不足以改善各區條件。'],[10,11,14],'政府可要求清楚營養標籤，改善選擇環境。'),
 transfer('有人說「父母有責任」就代表政府完全不需處理食品價格與公園不足。','哪項回應最符合作者的比較？',['父母有影響，但政府控制更廣條件，責任較大','只把責任歸父母，不問食品價格和公園','只強調政府主責，不承認家庭日常影響','只分配責任名額，不分析誰控制環境'],['承認家庭作用，再比較環境控制力。','父母有影響，政府控制價格和場地。','政府主責也不取消家庭作用。','責任比較應看誰能改更廣條件。'],[2,7,8,12,13],'兩方都有作用，政府塑造更廣環境而負較大責任。'),
 transfer('作文結論要說明兒童肥胖的主要成因與責任，不把父母的作用完全抹去。','哪句最符合範文？',['父母影響日常習慣，政策失靈仍是主要原因','只談政策失靈，不承認父母對作息的作用','只談父母習慣，不分析較廣食品環境','只重述成因，不明確說哪方責任較大'],['兼顧家庭影響，以公共政策作主要歸因。','政策問題重要，但家庭作用不應抹去。','家庭重要，較廣食品條件仍由政策影響。','結論要有責任輕重的立場。'],[2,13,14,15],'結論承認父母影響，仍把問題主要視為公共政策失敗。'),
];
// Reviewed connector structure decompositions.
structures[5].frame.parts=[["If ","link","句型固定部分"],["mothers and fathers regularly serve fast food, allow excessive screen time, and fail to encourage exercise","slot","照顧者反覆示範的習慣"],[", children are likely to develop ","link","句型固定部分"],["unhealthy habits","slot","孩子可能形成的習慣"],[" from an early age.","link","句型固定部分"]];
structures[5].frame.formula="If [照顧者反覆示範的習慣], children are likely to develop [孩子可能形成的習慣] from an early age.";
export default {key:'discuss-both-views:24',meta:{topic:'兒童肥胖的政府與父母責任',summary:'父母塑造飲食和活動習慣，但政府控制廣告、食物與公共空間條件，應負更大責任。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
