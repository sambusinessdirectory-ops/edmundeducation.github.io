// Reviewed Opinion 106: professional merit and family conflict in business ownership.
import fs from 'node:fs';import vm from 'node:vm';const cx={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-106-ielts-opinion.js',import.meta.url),'utf8'),cx);const source=cx.window.ESSAY_MEMORY_LESSONS['opinion:106'];const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['opinion:106'];const original=groups.map(g=>g.english);
const simple=[
'Family businesses are common in many countries, from small shops to big companies.',
'Relatives may know each other well, but I do not think family ownership is the best way to manage a company.',
'I think it often causes more serious problems than benefits because it can weaken decisions based on skill and bring family disagreements into work.',
'First, a family business may value loyalty to relatives more than ability.',
'If important jobs mainly go to relatives, workers may no longer be promoted for their skills, experience or results.',
'For example, a founder might put their child in charge of sales even when an experienced worker could do the job better.',
'This hurts how well the company works and tells other staff that hard work may never be rewarded fairly.',
'After a while, skilled workers may leave, work standards may drop, and the company may become an exclusive group instead of growing.',
'Second, family ties can make business choices harder because emotions become involved.',
'In a company run by professionals, clear rules, contracts and work goals can help settle disagreements.',
'In a family company, however, arguments about money, who takes over or who is in charge may be affected by years of personal feelings.',
'For example, two siblings may disagree about whether to put profits back into the company or share them with relatives, and that argument can delay decisions affecting many people.',
'When family life and company management mix, feelings unrelated to good business decisions can put the company at risk.',
'In short, I really think family ownership is not the best way to run a business.',
'Relatives may trust one another, but a company needs leaders chosen for ability, clear boundaries and responsibility more than family loyalty.',
];
const vocabulary=[
[['family-run companies','Family businesses','家族企業'],['commercial life','business','商業生活'],['large enterprises','big companies','大型企業']],
[['may appear stable','may know each other well','看似穩定'],['family ownership','family ownership','家族擁有權'],['run a company','manage a company','經營公司']],
[['serious problems than advantages','serious problems than benefits','問題多於好處'],['professional decision-making','decisions based on skill','專業決策'],['private tensions','family disagreements','私人矛盾']],
[['place loyalty above competence','value loyalty to relatives more than ability','忠誠凌駕能力'],['family businesses','family business','家族企業']],
[['important positions','important jobs','重要職位'],['promotion no longer depends on ability','no longer be promoted for their skills','晉升不再看能力'],['performance','results','表現']],
[['a founder','a founder','創辦人'],['appoint a son or daughter','put their child in charge','任命子女'],['better suited to the role','do the job better','更適合職位']],
[['damage efficiency','hurts how well the company works','損害效率'],['other workers','other staff','其他員工'],['rewarded fairly','rewarded fairly','公平回報']],
[['Over time','After a while','長遠而言'],['talented staff','skilled workers','有才能的員工'],['standards may fall','work standards may drop','工作標準下降'],['a closed room','an exclusive group','封閉的小圈子']],
[['A second issue','Second','第二個問題'],['family relationships','family ties','家庭關係'],['emotionally complicated','harder because emotions become involved','情感上複雜']],
[['professionally managed company','company run by professionals','專業管理的公司'],['clear rules','clear rules','清晰規則'],['performance targets','work goals','績效目標'],['disagreements','disagreements','分歧']],
[['family firm','family company','家族企業'],['a dispute','arguments','爭議'],['succession','who takes over','繼承'],['personal history','personal feelings','私人過往']],
[['two siblings','two siblings','兄弟姊妹'],['reinvested','put profits back into the company','重新投資'],['private conflict','that argument','私人衝突'],['slow down decisions','delay decisions','拖慢決策']],
[['dining table and the boardroom','family life and company management','家庭與董事會'],['vulnerable to emotions','can put the company at risk','受情緒影響'],['commercial judgment','good business decisions','商業判斷']],
[['In conclusion','In short','總結'],['firmly believe','really think','堅定相信'],['not the best way to run a business','not the best way to run a business','不是最佳經營方式']],
[['trust between relatives','Relatives may trust one another','親屬互信'],['merit-based leadership','leaders chosen for ability','以能力為本的領導'],['professional accountability','responsibility','專業問責'],['family loyalty','family loyalty','家族忠誠']],
];
function frame(i,links,labels,meaning,usage,example,tag,job){const v=original[i],parts=[];let c=0,k=0;for(const link of links){const at=v.indexOf(link,c);if(at<0)throw Error('Missing link '+(i+1)+': '+link);if(at>c)parts.push({text:v.slice(c,at),kind:'slot',label:labels[k++]});parts.push({text:link,kind:'link',label:'句型固定部分'});c=at+link.length;}if(c<v.length)parts.push({text:v.slice(c),kind:'slot',label:labels[k++]});if(k!==labels.length)throw Error('Unmatched labels '+(i+1));return {frame:{formula:parts.map(p=>p.kind==='link'?p.text:'['+p.label+']').join(''),meaning,usage,parts},example,tag,job};}
const specs=[
frame(0,['In many parts of the world, ', ' from ', ' to '],['普遍存在的企業類型','規模較小的例子','規模較大的例子'],'from...to 顯示家族企業跨不同規模。','引言要指出所討論企業模式在不同規模都常見時。','In many parts of the world, cooperatives operate from village stores to regional chains.','from...to','交代規模範圍'),
frame(1,['Although ', ', I do not believe that '],['看似支持家族企業的理由','作者不接受的最佳經營主張'],'Although 先承認親屬互信的表面優點，再清楚表態。','引言需要承認一項優點，仍反對它足以證明模式最佳時。','Although relatives may trust each other, I do not believe that family firms are always best.','Although...I do not believe','讓步後表態'),
frame(2,['In my view, ', ' because ', ' and '],['總體判斷','專業決策受損的原因','私人矛盾成為商業風險的原因'],'because 用兩項具體機制支撐問題多於好處的立場。','引言表態後，要預告兩段將分析的不同問題時。','In my view, this plan is risky because it limits choice and creates new costs.','In my view...because...and','預告雙重原因'),
frame(3,['The first problem is that ', ' can easily '],['家族企業的做法','把忠誠置於能力之上的風險'],'The first problem is that 標明第一條論證的核心弊端。','第一主體段要提出任人唯親如何削弱企業時。','The first problem is that family firms can easily favour relatives over skill.','The first problem is that','提出首項弊端'),
frame(4,['When ', ', promotion no longer depends on '],['重要職位交給親屬的情況','應作為晉升依據的標準'],'When 設定任命條件；no longer depends on 指出公平標準失效。','要解釋任人唯親如何改變晉升依據時。','When senior jobs go only to relatives, promotion no longer depends on performance.','When...promotion no longer depends on','由任命推到失去公平'),
frame(5,['For example, ', ' may ', ' even though '],['創辦人','任命子女的行動','另一員工更適合的事實'],'even though 對照家族任命與實際能力。','需要以一項具體任命案例證明忠誠可能蓋過能力時。','For example, an owner may hire a cousin even though another candidate is better qualified.','For example...even though','以任命例子驗證'),
frame(6,['This does not only ', '; it also '],['效率上的損害','向其他員工傳出的訊息'],'not only...; also 把經營效率與員工公平感連起來。','例子後要指出任人唯親同時傷害營運與員工士氣時。','This does not only slow work; it also tells staff that effort is ignored.','not only...; it also','擴展雙重後果'),
frame(7,['Over time, ', ', and '],['人才與標準逐步流失','公司愈來愈封閉的結果'],'Over time 把短期不公平推到長期人才流失與停滯。','段末要呈現任人唯親長期累積的組織後果時。','Over time, skilled staff may leave, and the company may stop growing.','Over time...and','推到長期後果'),
frame(8,['A second issue is that ', ' can make ', ' emotionally complicated.'],['家庭關係','商業決策'],'A second issue 開啟另一種問題；emotionally complicated 指出決策受情緒干擾。','第二主體段要從任用問題轉到家庭關係對決策的影響時。','A second issue is that family rivalries can make hiring emotionally complicated.','A second issue...emotionally complicated','轉向情緒風險'),
frame(9,['In a professionally managed company, ', ' can be handled through '],['一般企業分歧','清晰而可核查的處理標準'],'through 指出以規則、合約與目標處理分歧的方法。','要建立與家族企業對照的專業決策基準時。','In a professionally managed company, disputes can be handled through clear rules.','can be handled through','建立專業對照'),
frame(10,['In a family firm, however, ', ' may carry '],['家族內的商業爭議','多年私人關係的包袱'],'however 對照前句專業程序；may carry 指出私人歷史滲入。','要說明相同商業爭議在家族企業為何更難單純處理時。','In a family firm, however, a contract dispute may carry old family grievances.','however...may carry','呈現家庭包袱'),
frame(11,['For instance, ', ' may argue over whether ', ' or ', ', and '],['爭論的親屬','利潤的第一種用途','利潤的第二種用途','衝突對其他人的影響'],'whether...or 呈現具體分歧；and 把私人爭執連到商業延誤。','要以繼承人爭論資金用途的場景說明私人衝突外溢時。','For instance, two sisters may argue over whether profits should be saved or paid out, and the delay hurts staff.','whether...or...and','以利益分配落地'),
frame(12,['When ', ', the business becomes vulnerable to '],['家庭生活與公司治理混在一起的情況','不屬於商業判斷的情緒'],'When...vulnerable to 把家庭與職場界線模糊連到企業風險。','例子後要總結私人關係何以危及專業判斷時。','When family quarrels enter meetings, the business becomes vulnerable to emotional pressure.','When...vulnerable to','抽出界線風險'),
frame(13,['In conclusion, I firmly believe that ', ' is not '],['家族擁有權','其不應取得的最佳方式地位'],'In conclusion 重申立場；is not 直接回答最佳方式問題。','結尾要毫不含糊地重答家族經營是否最佳時。','In conclusion, I firmly believe that family control is not the best approach.','In conclusion...is not','重申否定判斷'),
frame(14,['While ', ', a company needs ', ' more than '],['親屬互信的有限優點','更關鍵的專業條件','不能凌駕專業的家族忠誠'],'While 讓步；more than 給專業能力和問責更高的順位。','最後承認親屬互信可能有用，仍指出企業更需要甚麼時。','While relatives may get along, a company needs fair promotion more than family loyalty.','While...needs...more than','以專業優先作結'),
];
const structures=specs.map((x,i)=>{const d=[(i+1)%specs.length,(i+6)%specs.length,(i+10)%specs.length];return {...x,distractors:d,wrongReasons:d.map(j=>'這句用「'+specs[j].tag+'」'+specs[j].job+'；沒有用「'+x.tag+'」'+x.job+'。'),answerReason:'示例保留「'+x.tag+'」的固定部分，用來'+x.job+'。',patternType:'reviewed'};});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的論證次序排列意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[quiz('作者認為家族擁有是經營企業的最佳方式嗎？',['不是；任人唯親與私人矛盾可能成為商業風險','是；親屬互信必然排除任何管理問題','作者只比較小店和大型企業的租金','作者完全沒有對最佳經營方式表態'],'引言明確否定家族擁有必然最佳。'),quiz('兩個主體段分別分析甚麼？',['能力被忠誠蓋過；家庭矛盾干擾商業決策','第一段只談店舖大小，第二段只談廣告','兩段都只說家族信任，沒有任何風險','先談產品顏色，再談辦公室面積'],'兩段各有不同機制。')];
const route=[sequence('從任人唯親到私人矛盾',[['引言：否定最佳模式','親屬互信不足以保證專業管理。'],['理由一：忠誠蓋過能力','親屬取得職位，其他員工難獲公平晉升。'],['後果：人才流失','效率、士氣和長期成長受損。'],['理由二：情緒滲入決策','錢、繼承或控制權的爭議背負私人歷史。'],['例子：兄弟姊妹爭利潤','私人爭執拖慢影響員工、顧客和供應商的決策。'],['結論：專業優先','企業更需要能力、界線與問責。']], '先談職位與人才，再談家庭衝突如何影響決策。')];
const evidence=[quiz('為何任命子女管理銷售可能不理想？',['更有經驗的員工或許更適合該職位','子女必然完全不認識自己的家人','銷售職位從來不需要任何技能','所有家族企業都禁止非親屬加入'],'原文比較親屬關係與職位適合程度。'),quiz('任人唯親除了效率，還會影響甚麼？',['其他員工對努力是否獲公平回報的信心','產品外包裝的所有顏色','公司所在城市的天氣','供應商公司的官方名稱'],'原文的 not only...also 指雙重後果。'),quiz('專業管理企業如何處理分歧？',['透過清晰規則、合約和績效目標','只靠每名員工的私人家庭歷史','讓任何爭執永遠不作決定','只依年齡決定所有合約內容'],'原文用專業程序建立對照。'),quiz('兄弟姊妹爭論利潤用途會影響誰？',['員工、顧客及供應商等相關人士','只會影響董事會議室的裝飾','必然不會影響公司的任何決策','只能影響午餐時間的家務安排'],'私人分歧可能外溢到商業決策。'),quiz('結論把甚麼置於家族忠誠之前？',['以能力選人、清晰界線和專業問責','只看親屬年齡及家庭排名','把所有公司職位交給子女','完全不用訂立任何管理規則'],'原文承認信任仍要求專業條件。')];
const logic=[sequence('任人唯親如何削弱企業',[['親屬優先得到重要職位','晉升不再主要取決於能力與表現。'],['其他員工感到努力未獲公平回報','動力和對企業的信任受損。'],['有能力的人離開','標準下降，公司日漸封閉。']], '第一段是職位分配、士氣、人才流失的鏈條。'),sequence('私人衝突如何變成商業風險',[['家庭關係帶入商業決策','錢與繼承的爭論夾雜舊有情緒。'],['親屬對利潤用途有分歧','重要決策因私人爭執而延誤。'],['員工顧客供應商受牽連','公司需要更清晰的界線與問責。']], '第二段說明私人矛盾如何外溢到其他持份者。')];
const t=(context,question,options,explanations,ids,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices:ids,modelLink});
const transfer=[
t('店主打算讓毫無管理經驗的侄子當主管，卻有一位表現優秀的資深員工。','哪項判斷符合範文？',['應按能力和表現選人，避免親屬關係蓋過專業','親屬身份帶來互信，可先略過管理能力評核','資深員工有經驗，便不用看領導所需特質','侄子缺管理經驗，可先讓他不經試用任職'],['職位應依能力而非親屬忠誠。','互信不替代管理能力。','經驗仍須配合領導評估。','試用有助檢查能否負責。'],[3,4,5],'原文用創辦人任命子女的例子比較職位適合程度。'),
t('公司職位長期只給創辦人親屬，其他員工逐漸不再爭取晉升。','甚麼機制最貼近範文？',['親屬優先削弱晉升信心，人才可能流失','親屬晉升可加快決定，不需查其他人投入','改招牌可表達公平，但制度可暫不更動','員工少爭取晉升，可先歸因於工作壓力'],['原文連結公平感、動力與人才流失。','決定快不代表任命公平。','表面形象未改晉升機制。','已知親屬優先是信心下降線索。'],[4,6,7],'原文把任人唯親連到其他員工的訊息。'),
t('兩名親屬為公司繼承權爭執，還提起多年前的私人恩怨。','應如何分析？',['家庭舊怨混入決策，商業分歧更難處理','家族舊怨可留在私人場合，不必設決策界線','繼承權爭議可先按長幼決定公司控制','親屬間的爭執需處理，但暫不影響採購'],['對應家族爭議背負多年私人歷史。','若無界線，舊怨已進入商業決定。','輩分不能代替能力與合約。','繼承控制權直接影響公司。'],[8,10,12],'原文指出家庭歷史會使商業決策更複雜。'),
t('一間公司讓非親屬員工與家人使用同一套績效評核標準。','這項措施主要回應哪項風險？',['讓晉升依能力與表現決定，減少任人唯親','統一評核有用，但親屬仍可優先獲職位','同一標準能比較表現，卻不需公開結果','非親屬也可晉升，但先看與創辦人交情'],['對應以能力選人的原則。','同一評核若仍優先親屬，公平性受損。','公開標準與結果有助建立信任。','交情不是表現尺度。'],[3,4,14],'原文指晉升不應只取決於親屬身份。'),
t('家族企業兩名股東討論應分紅，還是把錢投回新設備，爭議拖延採購。','這說明甚麼？',['分紅爭議拖慢採購，影響員工與供應商','分紅與投資可同時考慮，採購延誤可先忽略','股東意見不同，便只按家庭輩分決定','新設備重要，卻不必評估員工和供應商影響'],['對應兄弟姊妹爭利潤的例子。','延誤採購可能影響員工與供應者。','輩分不是投資回報依據。','受影響者是原文指出的後果。'],[10,11],'原文用 whether...or 呈現兩種利潤用途。'),
t('一家家族公司留有書面合約、清晰職責與獨立仲裁機制。','哪項益處最接近文章？',['清晰程序可減少私情干擾商業判斷','書面合約可定職責，卻不需處理爭議方式','獨立仲裁有用，但親屬仍可私下改約定','職責已清晰，便不用再看能力與表現'],['規則與界線回應情緒風險。','獨立仲裁是處理爭議的重要程序。','私下改約定會削弱清晰程序。','清晰職責仍須考察能力。'],[9,10,12,14],'原文以清晰規則對照私人矛盾。'),
t('創辦人認為親屬互信能降低溝通成本，因此企業只應聘用家人。','範文會如何回應？',['互信或有幫助，仍須看能力、界線及專業問責','親屬互信可降低成本，便能略過任命標準','家庭關係有用，合約可等衝突後再訂','專業問責必要，親屬互信可先放在次位'],['文章承認互信，但不視為最佳充分條件。','互信有益，但不能讓任命失去問責。','事前訂約比衝突後補救穩妥。','作者並不否定互信的可能益處。'],[1,3,14],'原文結尾用 While...more than 排出優先次序。'),
t('非親屬員工因職位分配不公而離開，公司工作標準逐漸下降。','哪條因果鏈準確？',['任人唯親使人才流失，工作標準下降','員工離開可補人，故不用檢查公平感','標準下降可先歸因市場，而不查人事','再聘親戚可維持規模，未必需留專業人才'],['對應第一段長期後果。','人才流失會影響工作標準。','情境明示任命不公及離職。','只補人數未必補能力。'],[4,6,7],'原文用 Over time 推到人才流失與封閉。'),
t('家人把晚餐時的爭執帶進董事會，影響對供應商的付款決定。','應抽出甚麼一般原則？',['家庭與公司界線模糊，情緒可危及商業判斷','家人爭執可在董事會繼續，不必區分議題','付款決定要快，可暫不評估供應商條款','私人情緒會影響討論，卻不必訂清晰程序'],['對應飯桌與董事會重疊的比喻。','董事會應分開家庭與公司議題。','付款仍需商業標準。','程序有助防止情緒支配判斷。'],[10,11,12],'原文以 dining table and boardroom 比喻界線混淆。'),
t('結論要回答家族經營是否最佳，並指出更可靠的替代原則。','哪句最能收束？',['互信有用，仍要按能力選人並清楚問責','家族互信有用，企業便可弱化能力評核','能力選人重要，家人互信可留待日後再談','先訂問責規則，仍只讓家人參與管理'],['保留讓步，重申專業標準優先。','互信不取代能力選任。','作者承認親屬互信可能有用。','清晰問責也應容許合適非親屬人才。'],[1,13,14],'原文結尾承認信任，但優先能力、界線與問責。'),
];
export default {key:'opinion:106',meta:{topic:'家族企業的任用與決策風險',summary:'範文反對把家族擁有視為最佳經營方式：親屬忠誠可能蓋過能力，私人矛盾也可能拖慢重要商業決策。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer};
