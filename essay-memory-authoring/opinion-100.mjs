// Interviews: trust, live interaction, and evidence beyond the written application.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['opinion:100'];
const original=groups.map(row=>row.english),v=(...rows)=>rows;
const simple=[
 'Today many people looking for jobs have similar degrees and skills, so employers often use interviews to choose who is right for the job.',
 'I completely agree that doing well in an interview is very important for getting a good job: it helps people build trust and show things a written form cannot show fully.',
 'The main reason is that an interview lets employers see a real person, not just papers about them.',
 'A good first meeting may make employers think a person is sure of themselves, ready and dependable, which matters when that person will speak for the company.',
 'If a person answers clearly, listens well and shows real interest, the interviewer may more easily picture them working well with other people.',
 'For example, two people who finished university may have almost the same grades, but the one who explains calmly and shows interest often looks easier to hire.',
 'So the interview is not just a small official step; it is where a degree on paper begins to look like someone employers can trust at work.',
 'Another reason is that employers can check many useful work skills only by speaking with someone directly.',
 'A good job seldom needs only knowledge of technical facts.',
 'Employers also want people who can speak well when stressed, solve problems sensibly and answer questions they did not expect.',
 'An interview shows these skills because people must answer at once rather than rely only on carefully written papers.',
 'For example, when someone is asked about a difficult customer or a short time to finish work, their answer may show good sense and control of feelings.',
 'A CV cannot easily show these qualities, but they matter a lot for doing a difficult job well.',
 'To sum up, I completely agree that doing well in interviews is very important for getting a good job.',
 'A degree may get a person a chance, but the interview is often where the employer chooses who wins the job.',
];
const vocabulary=[
 v(['competitive labour market','many people looking for jobs','競爭激烈的勞動市場'],['applicants','people looking for jobs','求職者'],['possess','have','擁有'],['similar degrees','similar degrees','相似學位'],['rely on interviews','use interviews','依靠面試'],['truly suitable','right for the job','真正合適']),
 v(['performing well','doing well','表現良好'],['key to securing','very important for getting','獲取關鍵'],['candidates','people','求職者'],['create trust','build trust','建立信任'],['demonstrate qualities','show things','展現特質'],['written application','written form','書面申請']),
 v(['most important reason','main reason','主要原因'],['turn a candidate','lets employers see','讓人看見'],['set of documents','papers about them','一堆文件'],['real person','real person','真實的人']),
 v(['strong first impression','good first meeting','好第一印象'],['confident','sure of themselves','自信'],['prepared','ready','有準備'],['reliable','dependable','可靠'],['represent their company','speak for the company','代表公司']),
 v(['candidate','person','求職者'],['answers clearly','answers clearly','回答清晰'],['listens carefully','listens well','細心聆聽'],['genuine interest','real interest','真誠興趣'],['more likely to imagine','may more easily picture','更可能想像'],['colleagues and clients','other people','同事客戶']),
 v(['graduates','people who finished university','畢業生'],['almost identical academic results','almost the same grades','幾乎相同成績'],['explains ideas calmly','explains calmly','冷靜說明'],['enthusiasm','interest','熱誠'],['more employable','easier to hire','更易獲聘']),
 v(['In this sense','So','從此意義'],['minor formality','small official step','次要形式'],['paper qualifications','degree on paper','紙面資格'],['professional credibility','someone employers can trust at work','專業可信度']),
 v(['Another reason','Another reason','另一原因'],['workplace qualities','work skills','職場特質'],['tested','check','測試'],['direct interaction','speaking with someone directly','直接互動']),
 v(['rarely','seldom','很少'],['depends on','needs','取決於'],['technical knowledge alone','only knowledge of technical facts','只靠技術知識']),
 v(['communicate under pressure','speak well when stressed','壓力下溝通'],['solve problems sensibly','solve problems sensibly','理性解難'],['adapt to unexpected questions','answer questions they did not expect','應對意外提問']),
 v(['reveal','shows','揭示'],['think on their feet','answer at once','即場思考'],['rather than hide behind','rather than rely only on','而非躲在'],['polished documents','carefully written papers','修飾文件']),
 v(['For instance','For example','例如'],['applicant','someone','申請者'],['difficult customer','difficult customer','難應付客戶'],['tight deadline','short time to finish work','緊迫限期'],['maturity, judgement, and emotional control','good sense and control of feelings','成熟判斷情緒控制']),
 v(['qualities','qualities','特質'],['measure through a résumé','show','履歷衡量'],['strongly influence','matter a lot','強烈影響'],['demanding role','difficult job','高要求職位']),
 v(['In conclusion','To sum up','總結'],['completely agree','completely agree','完全同意'],['central','very important','核心'],['getting a good job','getting a good job','取得好工作']),
 v(['Qualifications','A degree','資格'],['enter the race','get a person a chance','取得入場機會'],['interview','interview','面試'],['race is won','chooses who wins the job','決定勝出']),
];
const part=(text,kind,label)=>[text,kind,label];
function makeFrame(i,s){const source=original[i],at=source.indexOf(s.target);if(at<0)throw Error('Missing target '+(i+1)+': '+s.target);const prefix=source.slice(0,at),suffix=source.slice(at+s.target.length),parts=[];if(prefix)parts.push(part(prefix,'link','句型固定部分'));parts.push(part(s.target,'slot',s.slot));if(suffix)parts.push(part(suffix,'link','句型固定部分'));const formula=parts.map(([text,kind,label])=>kind==='slot'?`[${label}]`:text).join('');return {formula,meaning:s.meaning,usage:s.usage,parts}}
const specs=[
 {target:'interviews',replacement:'practical assessments',slot:'僱主用作辨別的方式',formula:'Many applicants have similar [資格], so employers rely on [評估方式]',meaning:'資歷相近時僱主靠面試分辨合適者。',usage:'當多人表面資格相近，需解釋另一種評估方式時。',relation:'so 由資格相近推到面試用途',d:[1,7,13]},
 {target:'performing well in an interview',replacement:'answering well in a live assessment',slot:'作者支持的關鍵行為',formula:'I completely agree that [行為] is key because it allows [難在紙面呈現的特質]',meaning:'面試好可建立信任並展示書面難見的特質。',usage:'當要明確表態，並用 because 交代支持立場的主因時。',relation:'because 解釋面試關鍵性',d:[0,7,13]},
 {target:'a candidate',replacement:'an applicant',slot:'由文件轉成真實人的求職者',formula:'The most important reason is that [評估] turns [人] from documents into a real person',meaning:'面試讓僱主看見求職者本人而非只有文件。',usage:'當首個主體段要用一句話標明最核心理由時。',relation:'from ... into ... 說明評估角度轉變',d:[0,7,13]},
 {target:'A strong first impression',replacement:'A calm first conversation',slot:'令人建立信任的初次互動',formula:'[初次印象] can make employers feel [特質], which matters when [職位要求]',meaning:'良好第一印象使人看來自信可靠。',usage:'當你要說明初次互動如何影響對能力的判斷時。',relation:'which 加上職位情境的重要性',d:[7,8,13]},
 {target:'answers clearly, listens carefully, and speaks with genuine interest',replacement:'explains calmly, listens closely, and speaks with genuine interest',slot:'面試中的可觀察行為',formula:'If [面試行為], the interviewer is more likely to imagine [工作表現]',meaning:'回答聆聽與興趣令僱主想像合作表現。',usage:'當你要用 If 連可觀察行為與評估者判斷時。',relation:'If 指出判斷形成條件',d:[7,8,13]},
 {target:'almost identical academic results',replacement:'very similar test scores',slot:'兩名求職者相近的紙面條件',formula:'Two applicants may have similar [紙面條件], but [面試差異] changes employability',meaning:'同樣成績者可因冷靜說明與熱誠被區分。',usage:'當你要用兩名條件相近的人作對照例子時。',relation:'but 對照同成績與不同面試表現',d:[7,8,13]},
 {target:'a minor formality',replacement:'an optional ceremony',slot:'作者否定的面試低估說法',formula:'The interview is not [小程序]; it is when [紙面資格] becomes [可信度]',meaning:'面試使紙面資格轉成專業可信度。',usage:'當你要糾正某步驟只是形式的看法並指出真正作用時。',relation:'not ...; it is ... 重估面試功能',d:[7,8,13]},
 {target:'direct interaction',replacement:'a live conversation',slot:'測試職場特質的方式',formula:'Another reason is that [特質] can only be tested through [互動]',meaning:'直接互動才能測部分工作特質。',usage:'當你要加入不同於第一點的新理由，說明測試方式時。',relation:'Another reason 開第二條因果線',d:[2,3,13]},
 {target:'technical knowledge alone',replacement:'formal training alone',slot:'不足以決定工作表現的單一條件',formula:'A good job rarely depends on [單一能力] alone',meaning:'好工作很少只靠技術知識。',usage:'當你要否定某項條件足以單獨保證成功時。',relation:'alone 限定技術知識不足',d:[2,3,13]},
 {target:'unexpected questions',replacement:'challenging new questions',slot:'即場應變的提問',formula:'Employers need people who can [溝通解難] and adapt to [突發提問]',meaning:'僱主重視壓力下溝通、解難、應變。',usage:'當你要列出錄取後工作所需的多項能力時。',relation:'三項並列具體能力',d:[2,3,13]},
 {target:'polished documents',replacement:'carefully edited statements',slot:'無法取代即場思考的材料',formula:'Interviews reveal [能力] because candidates must think on their feet rather than hide behind [材料]',meaning:'面試逼使即場思考，不能只靠修飾文件。',usage:'當你要比較即場表現與可事先修飾材料的證據力時。',relation:'because 加 rather than 解釋測試機制',d:[2,3,13]},
 {target:'a difficult customer or a tight deadline',replacement:'an upset client or an urgent deadline',slot:'用來測試判斷力的問題',formula:'When asked how to handle [壓力情境], a response can show [成熟判斷]',meaning:'難客戶與緊限期回答可顯示成熟判斷。',usage:'當你要用假設提問展示如何測量抽象能力時。',relation:'when 以面試場景示範即場判斷',d:[2,3,13]},
 {target:'a résumé',replacement:'a written application',slot:'難以顯示人際特質的文件',formula:'[能力] are difficult to measure through [文件], yet influence [職位表現]',meaning:'履歷難衡量能力，但其對高要求職位重要。',usage:'當你要對照書面材料的測量限制與實務重要性時。',relation:'yet 對比難測與重要',d:[2,3,14]},
 {target:'doing well in interviews',replacement:'speaking confidently in interviews',slot:'結論重申的重要表現',formula:'In conclusion, I completely agree that [表現] is central to [目標]',meaning:'作者重申面試表現是取得好工作的核心。',usage:'當結論需直接重申對題目陳述的明確立場時。',relation:'In conclusion 重申完全同意',d:[2,8,14]},
 {target:'Qualifications',replacement:'Certificates',slot:'讓求職者入場的紙面條件',formula:'[資格] may help enter the race, but [面試] is where the race is won',meaning:'資格讓人入場，面試常決定最終錄用。',usage:'當結尾要用同一比喻對照入場資格與最終取勝因素時。',relation:'but 對照入場與勝出',d:[2,8,13]},
];
const structures=specs.map((s,i)=>({example:original[i].replace(s.target,s.replacement),distractors:s.d,frame:makeFrame(i,s),answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}));
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'分清紙面資格、面試行為與工作表現。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[quiz('作者對面試在求職中的作用持甚麼看法？',['完全同意面試是關鍵，因它展示紙面難見的能力。','面試只看學歷，不能觀察任何人際表現。','資格相近時，僱主絕不需要作進一步判斷。','只要履歷寫得好，工作表現便必定出色。'],'文章兩段分別談信任與即場實務能力。'),{type:'multi',prompt:'範文支持面試重要性的兩條理由是甚麼？',detail:'選兩項，再按「確認」。',options:['面試把文件背後的人呈現出來並建立信任。','直接互動可測溝通、解難與臨場應變。','學歷完全不影響任何求職機會。','面試官只按衣服顏色錄用求職者。'],correct:[0,1],why:'面試讓資格成為可信的人，亦測工作所需能力。'}];
const route=[sequence('還原四段論證',[['引言','資格相近，僱主靠面試判合適；作者完全同意。'],['第一理由','第一印象與回答聆聽建立信任，區分相近成績者。'],['第二理由','即場提問測壓力下溝通、判斷與解難，履歷難做到。'],['結論','資格可讓人入場，面試常決定最終錄取。']],'不要把「進入面試」與「得到工作」混為一談。')];
const evidence=[quiz('兩名成績幾乎相同的畢業生可如何區分？',['冷靜解釋想法並展現熱誠者較易獲聘。','只看兩人學歷名稱，不能觀察談話。','只要成績相近，面試表現必定一樣。','面試官只能比較兩人的畢業年份。'],'面試顯示紙面之外的特質。'),quiz('面試能測哪些書面難見的能力？',['壓力下溝通、解難與即場回答意外提問。','只測求職者能否把履歷逐字念出。','只測學位數量，不看任何工作反應。','只測求職者曾寄出多少申請電郵。'],'面談是直接互動。'),quiz('難客戶與緊迫限期提問有何用？',['可看成熟度、判斷力與情緒控制。','保證每個回答者都實際處理過同一客戶。','只證明履歷文字長短，不涉及工作能力。','讓僱主不必再評估任何候選人。'],'情境提問揭示應變。'),quiz('結尾的競賽比喻如何分工？',['資格讓人入場，面試常決定最後勝出者。','資格保證入場後自動得到所有好工作。','面試只看紙面，從不影響錄用結果。','資格和面試在文章中沒有任何不同作用。'],'入場機會與最後錄用是兩階段。')];
const logic=[sequence('面試如何建立信任',[['紙面相近','許多求職者有相似學位訓練。'],['直接接觸','面試讓僱主見真實的人。'],['可見行為','清楚回答、細心聆聽及真誠興趣。'],['判斷','僱主較能想像其與同事客戶合作。']],'從文件到人的因果要說清。'),sequence('面試如何測實務',[['工作需求','技術知識以外需溝通與解難。'],['即場測試','意外問題要求求職者立即思考。'],['情境例子','難客戶及緊限期展示情緒與判斷。'],['選擇','這些特質難從履歷量度，卻影響勝任。']],'即場互動是不同於紙面資料的證據。')];
const transfers=[
 transfer('兩名求職者學歷相似，只有一人面試時耐心聆聽。','哪句轉用文章的第一理由？',['資歷相近時，耐心聆聽可顯示合作能力。','學歷相近時，只按履歷格式判斷合作能力','聆聽有助溝通，卻不必在面試中觀察','面試耐心聆聽，主要反映他熟悉面試程序'],['觀察行為建立信任。','履歷格式未顯示現場聆聽表現。','面試正可觀察合作與聆聽。','耐心聆聽可指向合作能力，不只熟悉程序。'],[0,4,5],'similar papers, interview reveals person。'),
 transfer('面試官問如何應付突然提前的交付限期。','此題可測甚麼？',['回答可顯示壓力下的判斷與臨場解難能力。','限期問題可測記憶，臨場判斷可另行評估','回答可見應變，但不能說明處理壓力方式','先核對履歷年資，不需追問緊急情況'],['情境提問看即場反應。','臨場答案能反映壓力下判斷。','處理突然限期正是壓力判斷情境。','履歷年資不能代替即時回答。'],[9,10,11],'tight deadline reveals judgement。'),
 transfer('應徵者履歷華麗，談話卻無法回答新問題。','哪句符合文章的比較？',['修飾文件難代替即場思考與真實互動。','履歷已列能力，面試新問題便可省略','應徵者答不出新問題，只代表太緊張','新問題有價值，但只需比較說話速度'],['履歷與即場證據不同。','修飾文件未涵蓋未預料的問題。','緊張可能存在，但仍需評估即場思考。','說話速度不能代替答案質素。'],[10,12],'think on feet vs polished documents。'),
 transfer('公司請一位員工代表它接待客戶。','第一印象為何重要？',['僱主可觀察他是否自信、有準備且可靠。','接待客戶時，先看衣着，略過準備與回答','有技術證書便可代表公司，不需觀察可靠度','只看他是否自信，不問能否聆聽客戶'],['與職位責任相關。','衣着可參考，卻未顯示可靠應對。','證書不直接顯示客戶互動。','聆聽也是代表公司時的重要表現。'],[3,4],'first impression and representation。'),
 transfer('一份申請表列技術證書，卻未說明與人合作能力。','哪句說明面試補足甚麼？',['面試直接交談可觀察溝通、聆聽及應變。','技術證書可推知合作能力，不必直接交談','面試能聽說話，卻不需設計新情境問題','合作能力可透過履歷字數準確反映'],['即場補紙面不足。','證書未直接證明人際表現。','新問題能測應變，不能省略。','履歷長短不能量度合作能力。'],[1,7,9],'written application cannot fully show。'),
 transfer('另一題問實習面談是否有助篩選團隊成員。','哪句可轉用本文邏輯？',['面談可看履歷以外的溝通與合作表現。','履歷有足夠資訊，面談可只核對個人資料','面談可看溝通，但不用觀察團隊合作','實習面談有用，卻只問課堂考試分數'],['機制可跨求職情境。','核對資料未見真實互動。','團隊合作是面談可看的特質。','分數不取代直接溝通觀察。'],[7,9,12],'direct interaction tests qualities。'),
 transfer('作文說「面試重要，因為面試重要」。','哪句補上真正原因？',['面試使僱主能看即場回答與書面難見的特質。','面試重要，只要重申重要便不必提出機制','先談面試時間長短，不看即場回答質素','面試有互動，因此履歷資料便不用參考'],['交代觀察機制。','同義反覆不能說明面試有何作用。','時間長短不直接說明回答品質。','結論仍承認資格有用。'],[2,7,10],'trust and live testing mechanisms。'),
 transfer('招聘要比較「能獲面試」與「能獲錄用」。','哪句貼合結尾比喻？',['資格可帶來面試機會，面試常決定最後取捨。','資格可取得面試，最後仍只按證書數決定','面試可見性格，卻不影響最終錄用取捨','資格與面試都重要，但不用區分兩個階段'],['入場與勝出分開。','證書可入圍，但不足以作最後取捨。','面試特質正可影響錄用。','兩階段各有不同作用。'],[14],'enter race vs win race。'),
 transfer('有人稱面試只是毫無作用的例行程序。','哪句反駁？',['面試可把紙面資歷轉成僱主可感受的可信度。','面試可建立印象，卻不需要提問或回應','履歷可見能力，因此面談只需核對姓名','面試有價值，但不必觀察壓力下的回答'],['功能不是形式。','若無提問回應，難建立可感受的可信度。','核名未見即場判斷。','壓力下回答是可觀察特質。'],[6],'not minor formality。'),
 transfer('文章結論要承認學歷，也支持面試關鍵性。','哪句最完整？',['學歷讓人取得機會，面試往往決定最終聘用。','學歷使人入圍，最後只看履歷設計形式','面試影響錄用，學歷便不必再被考慮','兩者都有作用，但不需說明何者決定取捨'],['兩階段並列。','履歷形式不能代替面試表現。','作者同時承認學歷的入圍作用。','需說清資格與面試的分工。'],[13,14],'qualifications open door, interview decides。'),
];
export default {key:'opinion:100',meta:{topic:'面試是否取得好工作的關鍵',summary:'資歷相近時，面試讓僱主建立對真人的信任，並以即場互動測試履歷難呈現的溝通、判斷與情緒控制；結論區分入場資格與最後錄用。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
