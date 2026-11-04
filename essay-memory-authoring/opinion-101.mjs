// Pay for essential public-service workers versus celebrities: value and retention.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['opinion:101'];
const original=groups.map(row=>row.english),v=(...rows)=>rows;
const simple=[
 'In many countries, actors, singers and top sports players often earn more than people who keep us healthy or teach children.',
 'I fully agree that doctors, nurses and teachers should earn more than famous people in sport and entertainment because their work is more needed by society and deserves more public money.',
 'The main reason is that these workers help keep society working.',
 'Doctors and nurses do more than a job: they save lives, make pain less and help families stay together when someone gets sick.',
 'Their choices may decide whether a person gets better or faces a terrible result.',
 'Teachers are just as important, though what they do may look less exciting at first.',
 'A good teacher can help a child who does not understand become sure they can learn; later, that person may be good at work, care for a family or help society.',
 'Famous people can give enjoyment to many, but enjoyment is something extra; healthcare and teaching help society move forward.',
 'So it is hard to say it is fair for a football player to earn more than a nurse who saves lives every week.',
 'Higher pay is also needed to bring good people into these hard public jobs and keep them there.',
 'Doctors, nurses and teachers study for years and face hard feelings and daily duties, but many work long hours under stress with little praise.',
 'If pay stays low, talented young people may avoid or leave these jobs early, and hospitals and schools become weaker.',
 'By comparison, stars may earn so much because of adverts, ticket money and world media attention, not because their work matters more to society.',
 'When a society rewards being famous more than helping others, it shows people the wrong idea of what matters.',
 'To sum up, I firmly think doctors, nurses and teachers should be paid more than famous entertainers and sports players.',
 'Famous people may make free time more fun, but essential workers save lives, teach children and help society stay strong.',
];
const vocabulary=[
 v(['largest salaries','earn more','最高薪酬'],['professional athletes','top sports players','職業運動員'],['rather than','more than','而非'],['protect public health','keep us healthy','保護公眾健康'],['educate the next generation','teach children','教育下一代']),
 v(['completely agree','fully agree','完全同意'],['doctors, nurses and teachers','doctors, nurses and teachers','醫護教師'],['entertainment and sports celebrities','famous people in sport and entertainment','娛樂體育名人'],['socially essential','more needed by society','社會必需'],['public investment','public money','公共投資']),
 v(['strongest reason','main reason','最強理由'],['professionals','workers','專業人士'],['backbone','help keep','支柱'],['functioning society','society working','運作中的社會']),
 v(['do not merely perform a job','do more than a job','不只工作'],['preserve life','save lives','守護生命'],['relieve suffering','make pain less','減輕痛苦'],['keep families from falling apart','help families stay together','防家庭崩潰'],['illness strikes','someone gets sick','疾病來襲']),
 v(['decisions','choices','決定'],['difference','decide whether','差別'],['recovery','gets better','康復'],['tragedy','terrible result','悲劇']),
 v(['similarly fundamental','just as important','同樣根本'],['contribution','what they do','貢獻'],['less dramatic on the surface','look less exciting at first','表面較不戲劇化']),
 v(['confused child','child who does not understand','迷惘孩子'],['confident learner','sure they can learn','自信學習者'],['skilled worker','good at work','有技能工人'],['responsible parent','care for a family','負責任父母'],['thoughtful citizen','help society','有思想公民']),
 v(['Celebrities','Famous people','名人'],['entertain millions','give enjoyment to many','娛樂數百萬'],['luxury','something extra','奢侈品'],['healthcare and education','healthcare and teaching','醫療教育'],['social progress','society move forward','社會進步']),
 v(['For this reason','So','因此'],['morally difficult to justify','hard to say it is fair','道德難合理化'],['footballer','football player','足球員'],['saves lives every week','saves lives every week','每週救人']),
 v(['Higher pay','Higher pay','較高薪酬'],['necessary','needed','必要'],['attract','bring','吸引'],['retain','keep','留住'],['capable people','good people','有能力的人'],['demanding public-service roles','hard public jobs','高要求公職']),
 v(['requires years of training','study for years','需多年訓練'],['emotional resilience','face hard feelings','情緒韌性'],['daily responsibility','daily duties','日常責任'],['long hours','long hours','長工時'],['limited recognition','little praise','少認可']),
 v(['salaries remain modest','pay stays low','薪酬偏低'],['talented young people','talented young people','有才華年輕人'],['avoid these careers','avoid','避開職業'],['leave them early','leave these jobs early','提早離職'],['weakens hospitals and schools','hospitals and schools become weaker','削弱醫院學校']),
 v(['By contrast','By comparison','相比之下'],['celebrity income','stars may earn','名人收入'],['inflated','so much','推高'],['advertising','adverts','廣告'],['global media attention','world media attention','全球媒體關注'],['deeper social importance','matters more to society','更深層社會重要性']),
 v(['rewards fame more than service','rewards being famous more than helping others','獎名氣多於服務'],['sends the wrong message','shows people the wrong idea','傳錯訊息'],['what it values','what matters','重視甚麼']),
 v(['In conclusion','To sum up','總結'],['firmly agree','firmly think','堅定同意'],['entertainment and sports celebrities','famous entertainers and sports players','娛樂體育名人']),
 v(['While','but','雖然'],['enrich people’s leisure time','make free time more fun','豐富休閒'],['essential workers','essential workers','必要工作者'],['protect lives','save lives','保護生命'],['shape minds','teach children','塑造思想'],['hold society together','help society stay strong','維繫社會']),
];
const part=(text,kind,label)=>[text,kind,label];
function makeFrame(i,s){const source=original[i],at=source.indexOf(s.target);if(at<0)throw Error('Missing target '+(i+1)+': '+s.target);const prefix=source.slice(0,at),suffix=source.slice(at+s.target.length),parts=[];if(prefix)parts.push(part(prefix,'link','句型固定部分'));parts.push(part(s.target,'slot',s.slot));if(suffix)parts.push(part(suffix,'link','句型固定部分'));const formula=parts.map(([text,kind,label])=>kind==='slot'?`[${label}]`:text).join('');return {formula,meaning:s.meaning,usage:s.usage,parts}}
const specs=[
 {target:'actors, singers and professional athletes',replacement:'online influencers, actors and athletes',slot:'高收入名人群體',formula:'[名人] earn the largest salaries rather than [公共服務者]',meaning:'名人往往比醫護教師賺更多。',usage:'當引言需呈現兩類職業的薪酬反差時。',relation:'rather than 建立薪酬對照',d:[1,9,14]},
 {target:'doctors, nurses and teachers',replacement:'emergency workers, nurses and teachers',slot:'作者主張提高薪酬的工作者',formula:'I completely agree [群體] should be paid more because [社會價值]',meaning:'醫護教師更具社會必要性且值得公共投資。',usage:'當你要明確支持薪酬排序，並用 because 說明標準時。',relation:'because 說明薪酬判斷依據',d:[0,9,14]},
 {target:'these professionals',replacement:'public-service workers',slot:'維持社會運作的專業人員',formula:'The strongest reason is that [人員] form the backbone of [社會]',meaning:'專業公共服務是社會支柱。',usage:'當第一個理由需先指出某群體不可取代的整體作用時。',relation:'backbone 概括社會功能',d:[0,9,14]},
 {target:'Doctors and nurses',replacement:'Emergency doctors and nurses',slot:'守護生命的工作者',formula:'[工作者] do not merely work; they [多重生命作用]',meaning:'醫護救命、減痛並在疾病時支撐家庭。',usage:'當你要指出一份工作對他人的作用遠超例行任務時。',relation:'not merely ...; ... 擴大工作價值',d:[9,10,14]},
 {target:'Their decisions',replacement:'Their quick choices',slot:'影響患者結果的判斷',formula:'[決定] can mean the difference between [好結果] and [壞結果]',meaning:'醫護決定可區分康復與悲劇。',usage:'當你要用兩種截然不同的結果表達決定的重要性時。',relation:'between ... and ... 對照生命後果',d:[9,10,14]},
 {target:'Teachers',replacement:'Social workers',slot:'作用同樣根本但較不顯眼的群體',formula:'[群體] play a similarly fundamental role, although [表面不顯眼]',meaning:'教師貢獻不一定戲劇化，仍同樣根本。',usage:'當另一種貢獻不像第一種顯眼，卻同樣重要時。',relation:'although 承認表面差異',d:[9,10,14]},
 {target:'a confused child',replacement:'a struggling student',slot:'受教師幫助的學習者',formula:'A good teacher can turn [初始狀態] into [成長狀態], and later [社會成果]',meaning:'好老師助迷惘孩子成自信學習者，長遠助社會。',usage:'當你要追蹤教育由個人轉到未來社會的連鎖效果時。',relation:'turn ... into ... 接長期效果',d:[9,10,14]},
 {target:'entertainment',replacement:'recreation',slot:'可享用但較非必需的活動',formula:'Celebrities may entertain millions, but [活動] is a luxury; [服務] drives social progress',meaning:'娛樂可享受，醫療教育更是社會基礎。',usage:'當你要承認一方的益處，仍比較其必要性時。',relation:'but 加分號比較休閒與必需',d:[9,10,14]},
 {target:'a footballer',replacement:'a film star',slot:'被比較的高收入名人',formula:'It is morally difficult to justify paying [名人] more than [救人者]',meaning:'難合理化足球員薪酬高於救命護士。',usage:'當你要以具體職業對比檢驗薪酬排序的道德理由時。',relation:'For this reason 從前述價值作判斷',d:[9,10,14]},
 {target:'Higher pay',replacement:'Better salaries',slot:'吸引並留住人才的措施',formula:'[薪酬改善] is necessary because it attracts and retains [人員]',meaning:'較高薪酬可吸引並留住公共服務人才。',usage:'當你要由公平理由轉向人才供應的實際理由時。',relation:'because 解釋薪酬對人才的影響',d:[3,8,14]},
 {target:'a doctor, nurse or teacher',replacement:'a paramedic or school teacher',slot:'需多年培訓且承擔壓力的職業',formula:'Becoming [職業] requires [訓練責任], yet workers face [壓力]',meaning:'醫護教師訓練長責任重，卻常壓力高少認可。',usage:'當你要對照工作要求與現有回報或待遇時。',relation:'yet 對比高要求與有限認可',d:[3,8,14]},
 {target:'their salaries',replacement:'pay in these jobs',slot:'可能阻礙人才加入的薪酬',formula:'If [薪酬] remain modest, [人才] may avoid or leave, which weakens [機構]',meaning:'薪酬低可令人才避開或離職，削弱醫院學校。',usage:'當你要用 If 追蹤待遇不足如何影響服務機構時。',relation:'If 加 which 串人才與機構後果',d:[3,8,14]},
 {target:'celebrity income',replacement:'film-star income',slot:'受市場媒體推高的收入',formula:'By contrast, [名人收入] is inflated by [市場因素], not [社會重要性]',meaning:'名人收入由廣告門票媒體推高，非因更重要。',usage:'當你要區分市場價格與道德或社會重要性時。',relation:'not by 分清收入成因',d:[3,8,14]},
 {target:'fame',replacement:'popularity',slot:'社會過度獎勵的因素',formula:'A society that rewards [名氣] more than [服務] sends the wrong message',meaning:'獎名氣高於服務傳遞錯誤價值。',usage:'當你要指出薪酬制度還會傳遞甚麼社會價值訊息時。',relation:'more than 比較獎勵標準',d:[3,8,14]},
 {target:'doctors, nurses and teachers',replacement:'paramedics, nurses and teachers',slot:'結論主張高薪的工作者',formula:'In conclusion, I firmly agree [群體] should be paid more than [名人]',meaning:'結論重申醫護教師應高於名人。',usage:'當結論要直接重申對薪酬比較題的立場時。',relation:'In conclusion 重申完全贊成',d:[3,8,13]},
 {target:'essential workers',replacement:'frontline workers',slot:'維繫社會的必要工作者',formula:'While [名人] enrich leisure, [必要人員] protect lives and hold society together',meaning:'名人豐富休閒，必要工作者護生命與社會。',usage:'當結尾要承認休閒益處，仍突出基本服務不可缺時。',relation:'While 對比休閒與社會根基',d:[3,8,14]},
];
const structures=specs.map((s,i)=>({example:original[i].replace(s.target,s.replacement),distractors:s.d,frame:makeFrame(i,s),answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}));
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'分清社會必要性與吸引留住人才兩條理由。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[quiz('作者對醫護教師與名人薪酬比較持甚麼立場？',['完全同意醫護教師應更高薪，因工作必要且需留人才。','明星娛樂人數多，所以其社會作用必然更必要。','只要醫護有使命感，就永遠不需考慮薪酬。','廣告收入一定能反映職業的道德價值。'],'文章有價值排序與人才供給兩條論證。'),{type:'multi',prompt:'兩條主論據是甚麼？',detail:'選兩項，再按「確認」。',options:['醫護教育支撐生命與社會發展。','較高薪酬有助吸引並留住人才。','名人收入全由公共醫療預算支付。','所有教師都只需短期訓練。'],correct:[0,1],why:'必要性與招聘留任分別支持較高薪酬。'}];
const route=[sequence('還原四段論證',[['引言','名人薪酬高於必要工作者；作者完全不同意。'],['社會價值','醫護護命，教師培養下一代；娛樂較非必需。'],['留住人才','多年訓練與壓力需合理回報，否則醫院學校失人才。'],['結論','承認名人娛樂作用，仍優先保障基本服務。']],'收入的市場成因與工作的社會必要性不是一回事。')];
const evidence=[quiz('醫護工作為何不只是一般職務？',['決定可影響生命康復、痛苦與家庭。','醫護只負責提供娛樂，與病人無關。','任何醫療決定都不影響病人的結果。','每位醫護都只需一天訓練便可工作。'],'原文由生命後果說明必要性。'),quiz('教師的長期影響是甚麼？',['助孩子變有信心，日後參與工作家庭與社會。','教師只影響學生同一天的考試分數。','有老師的孩子必定不再需要任何學習。','教師的貢獻一定比醫護更容易即時看見。'],'成長鏈延伸至社會。'),quiz('為何提高薪酬有實際必要？',['較易吸引留住受過訓練的公共服務人才。','提高薪酬便保證工作沒有任何壓力。','薪酬愈低，醫院學校就必然愈強。','名人收入可直接代替學校所有教師。'],'人才供給是第二條理由。'),quiz('名人收入高一定代表更重要嗎？',['未必，廣告門票和媒體關注也會推高收入。','一定，市場價格與社會必要性完全相同。','一定，醫護與教育在任何國家都沒有價值。','未必，因所有名人收入都由醫院直接支付。'],'市場成因不能直接當社會價值排序。')];
const logic=[sequence('必要工作的社會價值',[['醫護','救命、減痛並支撐患病家庭。'],['教師','幫迷惘孩子成自信學習者。'],['長遠社會','學習者可成工作者、父母與公民。'],['比較','娛樂有益，但醫療教育更根本。']],'先分清娛樂價值與維持社會的基本服務。'),sequence('薪酬如何影響服務',[['工作要求','多年訓練、情緒韌性與日常責任。'],['現有壓力','長工時、壓力與認可不足。'],['低薪後果','人才避開或提早離開。'],['機構結果','醫院與學校服務能力受損。']],'高薪理由不止道德，亦涉及人員供應。')];
const transfers=[
 transfer('某醫院難以留住有經驗護士。','哪句轉用文章的人才機制？',['較高薪酬可留住受訓人員，維持醫療服務能力。','護士薪酬應按病人數訂，較少考慮留任情況','醫院可只增招聘廣告，不調整現職待遇','護士離職後，可先用短期人手維持服務'],['薪酬影響留任。','留任受訓者正是薪酬論證的重要部分。','只招聘廣告不處理現職離開原因。','經驗與服務能力不能直接替代。'],[9,10,11],'pay attracts and retains。'),
 transfer('有人說明星收入高，證明工作對社會更重要。','哪句指出比較問題？',['廣告及門票可推高收入，卻不等於社會更必要。','明星收入高，可用票房直接衡量公共必要性','廣告收入可反映人氣，也可代替醫療人才','門票銷量高，便不必比較工作帶來的後果'],['收入成因不等於必要性。','市場收入與公共必要性不是同一尺度。','廣告收入不提供醫療與教育服務。','工作後果是作者比較的依據。'],[12,13],'market pay vs social value。'),
 transfer('一位教師幫迷惘孩子建立學習信心。','哪句呈現長期影響？',['孩子日後或成有能力的工作者與負責任公民。','學生有信心後，教師可停止其他學習支援','教師讓學生進步，但只看一次考試成績','教師的影響可見，卻不必連到日後公民角色'],['教師培養長期能力。','信心增長可開啟後續學習，並非終點。','一次成績未涵蓋長遠能力。','教師作用可延伸至成年與公民生活。'],[5,6],'teacher long-term chain。'),
 transfer('病房急救決定影響病人能否康復。','哪句支持醫護必要性？',['醫護的判斷直接關乎生命，超越一般例行工作。','醫護判斷有用，卻只按工作時數評估價值','病人康復要看家人支援，專業決定可後評估','急救判斷涉及病人，卻不必評估訓練要求'],['生命後果重大。','急救判斷不能只按時間衡量。','家人支援不能取代專業醫療決定。','專業訓練是承擔責任的條件。'],[3,4],'recovery versus tragedy。'),
 transfer('公共服務工作需要多年培訓，卻工時長壓力大。','哪句補上薪酬論據？',['合理薪酬可吸引並留住受訓人員。','工作壓力大，可只增使命宣傳而不談待遇','培訓年期較長，便可忽略留任的困難','薪酬吸引人才，卻不用看工作責任與風險'],['待遇對人才供應重要。','使命宣傳未解待遇與留任問題。','長培訓使留住人才更重要。','合理薪酬與工作責任須連起來。'],[9,10,11],'demanding roles and retention。'),
 transfer('另一題比較消防員與網絡名人薪酬。','哪句可轉用本文尺度？',['比較對生命安全的必要性，也要看人才留任。','名人追蹤者較多，便可推知消防服務重要性','消防員有使命感，可不查合理薪酬對留任影響','只比較兩類收入，不看工作後果與人手需求'],['價值與留任可轉用。','人氣不能直接量度消防必要性。','使命感不取消合理待遇。','作者比較生命安全與留任。'],[2,9],'essential service plus retention。'),
 transfer('有人說娛樂能讓人快樂，故應否定醫療重要性。','哪句較公平？',['娛樂可豐富休閒，但醫療與教育更支撐基本生活。','娛樂可讓人快樂，便可代替基本醫療服務','醫療教育較必要，因此不用承認娛樂益處','兩類工作作用不同，故只可按市場收入比較'],['承認娛樂後仍排序。','娛樂的益處不會取代基本服務。','作者明確承認娛樂能豐富休閒。','市場收入非社會需要的唯一尺度。'],[7,15],'leisure versus essential work。'),
 transfer('年輕人因公共服務低薪而轉投其他行業。','哪句說明集體後果？',['人才流失可能削弱醫院與學校的服務能力。','公共人員轉職可補回，故無需研究服務變化','低薪可能影響個人，卻不會影響機構能力','年輕人轉行後，只需看空缺數不查服務'],['個人選擇累積成機構影響。','轉職可削弱有經驗服務人手。','人員流失可影響機構能力。','空缺數仍需連到服務品質。'],[11],'low pay weakens institutions。'),
 transfer('作文只說「護士應高薪，因護士重要」。','哪句補足具體因果？',['護士可減痛救命，合理薪酬亦有助留任。','護士重要，只需重申敬意，不用舉具體作用','薪酬增加有用，卻不需討論人員留任','急救決定可救命，但與薪酬理由無關'],['生命作用與留任機制。','要用減痛救命等具體後果建立理由。','留任是高薪理由之一。','生命相關責任支持薪酬論證。'],[3,4,9],'value plus retention。'),
 transfer('結論要承認名人益處，仍支持必要工作者高薪。','哪句最完整？',['名人豐富休閒，醫護教師則護命育人。','名人有娛樂價值，便不必評估醫護教師作用','必要工作重要，娛樂價值可留到薪酬後再談','承認兩方用途，卻只按觀眾數決定薪酬'],['讓步後定必要性。','作者仍把醫護教師視為必要工作。','讓步要求保留名人正面用途。','觀眾數未衡量生命與教育作用。'],[14,15],'while leisure, essential workers。'),
];
export default {key:'opinion:101',meta:{topic:'醫護教師薪酬應否高於娛樂體育名人',summary:'以醫護護命和教師培養下一代說明基本社會必要性，再說明較高薪酬如何吸引並留住承受高壓的公共服務人才；區分市場收入與社會價值。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
