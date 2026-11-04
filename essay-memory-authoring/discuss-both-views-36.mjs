// Sport teaches competition and teamwork; weigh transfer to wider life.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['discuss-both-views:36'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'Sport is important for children because it teaches things they cannot easily learn just by reading books.',
 'Some say sport mainly teaches children to try to beat others, but others say it mainly teaches them to work together.',
 'I will look at both ideas, but I think learning to work together matters more.',
 'First, sport helps children learn how to try to win in a fair and healthy way.',
 'When children join races or games, they learn that doing well usually takes hard work, self-control and practice, not just good luck.',
 'This is important because children with no experience of trying to win may find school pressure or job interviews hard later.',
 'For example, a child whose football team loses can learn to face feeling sad, see what went wrong and try again instead of stopping.',
 'In this way, trying to win can help children recover after a setback and teach them to win without showing off and lose politely.',
 'But team sport teaches an even stronger lesson: people often reach a goal by working together.',
 'In basketball or football, being good on your own is not enough; children must pass the ball, talk, trust other players and sometimes put the team first.',
 'This lesson helps in real life, not only on the field.',
 'For example, a child who listens to other players in a game may also help a class group or a team at work later.',
 'Because doing well in life often needs working with other people, teamwork is a more useful skill in many situations than trying to win alone.',
 'To sum up, sport does teach children to try to win, especially to handle pressure, losing and getting better.',
 'But I think its main benefit is teamwork, because working together, trust and sharing duties matter at school, work and in society.',
];
const vocabulary=[
 v(['plays an important role','is important','扮演重要角色'],['childhood','for children','童年'],['lessons','things','道理'],['difficult to learn only from books','cannot easily learn just by reading books','單靠書本難學']),
 v(['argue','say','主張'],['main value','mainly','主要價值'],['compete','try to beat others','競爭'],['whereas','but','然而'],['teamwork','work together','團隊合作']),
 v(['discuss both views','look at both ideas','討論兩方'],['strongly believe','think','強烈相信'],['more valuable','matters more','更有價值']),
 v(['On the one hand','First','一方面'],['clearly helps','helps','明顯有助'],['healthy competition','try to win in a fair and healthy way','健康競爭']),
 v(['take part in','join','參與'],['success','doing well','成功'],['effort','hard work','努力'],['discipline','self-control','自律'],['preparation','practice','準備'],['rather than luck','not just good luck','而非運氣']),
 v(['This matters','This is important','這很重要'],['never face competition','no experience of trying to win','從未競爭'],['may struggle','may find','可能難應付'],['academic pressure','school pressure','學業壓力'],['job interviews','job interviews','工作面試']),
 v(['loses','loses','輸掉'],['accept disappointment','face feeling sad','接受失望'],['analyse mistakes','see what went wrong','分析錯誤'],['try again','try again','再嘗試'],['instead of giving up','instead of stopping','而非放棄']),
 v(['In this sense','In this way','從此意義上'],['resilience','recover after a setback','抗逆力'],['win modestly','win without showing off','謙遜勝利'],['lose gracefully','lose politely','有風度地失敗']),
 v(['On the other hand','But','另一方面'],['even more powerful','even stronger','更有力'],['achievement','reach a goal','成就'],['depends on cooperation','by working together','取決於合作']),
 v(['individual talent','being good on your own','個人天分'],['communicate','talk','溝通'],['teammates','other players','隊友'],['group’s interest','the team','團隊利益'],['personal glory','put the team first','個人榮耀']),
 v(['practical lesson','lesson','實用一課'],['reaches far beyond','helps in real life, not only','遠超'],['sports field','field','運動場']),
 v(['For instance','For example','例如'],['listen to teammates','listens to other players','聆聽隊友'],['contribute well','help','作出貢獻'],['classroom projects','class group','課堂項目'],['future workplaces','team at work later','未來職場']),
 v(['Since','Because','由於'],['real-life success','doing well in life','生活成就'],['working with other people','working with other people','與人合作'],['transferable skill','useful skill in many situations','可轉移技能'],['competition alone','trying to win alone','單純競爭']),
 v(['In conclusion','To sum up','總結'],['compete','try to win','競爭'],['deal with pressure','handle pressure','應對壓力'],['failure','losing','失敗'],['self-improvement','getting better','自我提升']),
 v(['However','But','然而'],['greatest benefit','main benefit','最大好處'],['teamwork','teamwork','團隊合作'],['cooperation','working together','合作'],['shared responsibility','sharing duties','共同責任'],['essential','matter','不可或缺']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula:parts.map(([text,kind,label])=>kind==='slot'?`[${label}]`:text).join(''),meaning,usage,parts}}
const specs=[
 {example:'Sport plays an important role in adolescence because it teaches lessons that are difficult to learn only from books.',d:[1,3,8],relation:'because 交代活動的重要性及原因',formula:'Sport plays an important role in [成長階段] because [書本難教的事]',meaning:'運動能教書本難以單獨教會的道理。',links:['Sport plays an important role in ',' because it teaches lessons that are difficult to learn only from books.'],labels:['受益的成長階段']},
 {example:'Some people argue that its main value is that it trains children to persevere, whereas others believe that it primarily develops teamwork.',d:[2,3,8],relation:'whereas 對列兩種教育價值',formula:'Some people argue that [價值一], whereas others believe that [價值二]',meaning:'有人看重競爭，有人看重合作。',links:['Some people argue that its main value is that it trains children to ',', whereas'],labels:[]},
 {example:'I will discuss both views, but I strongly believe that self-control is the more valuable lesson.',d:[1,3,8],relation:'but 由討論兩方轉向作者判斷',formula:'I will discuss both views, but I strongly believe that [選定能力] is the more valuable lesson',meaning:'作者承諾討論兩方，表明合作更重要。',links:['I will discuss both views, but I strongly believe that ',' is the more valuable lesson.'],labels:['作者最看重的能力']},
 {example:'On the one hand, sport clearly helps children understand fair play.',d:[1,8,13],relation:'On the one hand 開啟首方論點',formula:'On the one hand, [活動] clearly helps [對象] understand [能力]',meaning:'先承認運動可教健康競爭。',links:['On the one hand, sport clearly helps children understand '],labels:['先討論的能力']},
 {example:'When young people take part in music contests, they learn that success usually comes from effort, discipline, and preparation rather than luck.',d:[3,8,13],relation:'When 情景加 rather than 指出成功來源',formula:'When [學習者] take part in [競賽], they learn that success comes from [努力] rather than luck',meaning:'競賽使孩子明白努力與準備比運氣重要。',links:['When young people take part in ',', they learn'],labels:['具體競賽']},
 {example:'This matters because children who never face competition may struggle when they later meet exams, interviews, or professional rivalry.',d:[3,8,13],relation:'because 連接童年經驗與未來壓力',formula:'This matters because [缺乏經驗者] may struggle when they later meet [未來考驗]',meaning:'缺乏競爭經驗者日後可能難應付壓力。',links:['This matters because children who never face competition may struggle when they later meet '],labels:['日後面對的考驗']},
 {example:'For example, a child who loses a basketball match can learn to accept disappointment, analyse mistakes, and try again instead of giving up.',d:[3,8,13],relation:'For example 用輸掉比賽示範如何面對挫折',formula:'For example, a child who loses a [比賽] can learn to [反省並重試] instead of giving up',meaning:'輸球可練習接受失望、分析錯誤並重試。',links:['For example, a child who loses a ',' can learn to accept disappointment, analyse mistakes, and try again instead of giving up.'],labels:['孩子輸掉的比賽']},
 {example:'In this sense, competition can build confidence and teach children how to win modestly and lose gracefully.',d:[3,8,13],relation:'In this sense 概括競爭的品格收益',formula:'In this sense, competition can build [心理能力] and teach children how to win modestly and lose gracefully',meaning:'競爭可培養抗逆力及得失風度。',links:['In this sense, competition can build ',' and teach children how to win modestly and lose gracefully.'],labels:['培養的心理能力']},
 {example:'On the other hand, team sports are even more powerful because they show children that achievement often depends on shared effort.',d:[3,4,13],relation:'On the other hand 加 because 轉向較強合作論',formula:'On the other hand, [集體活動] are even more powerful because [成就靠合作]',meaning:'團隊運動使孩子看到成就往往靠合作。',links:['On the other hand, team sports are even more powerful because they show children that achievement often depends on '],labels:['成就所依靠的力量']},
 {example:'In games such as volleyball, no player can succeed simply by showing individual talent; children must share tasks, communicate, trust their teammates, and sometimes put the group’s interest before personal glory.',d:[3,4,13],relation:'分號由個人天分不足推向具體合作動作',formula:'In games such as [例子], no player can succeed simply by [個人能力]; children must [合作行動]',meaning:'個人天分不足；傳球、溝通與信任才有團隊成果。',links:['In games such as ',', no player'],labels:['團體活動例子']},
 {example:'This creates a practical lesson that reaches far beyond the classroom.',d:[3,4,13],relation:'that 關係子句指出能力可超越原場域',formula:'This creates a practical lesson that reaches far beyond [原學習場域]',meaning:'合作一課不只適用於球場。',links:['This creates a practical lesson that reaches far beyond '],labels:['被超越的場域']},
 {example:'For instance, a child who learns to encourage teammates during a match is also more likely to contribute well in classroom projects or future workplaces.',d:[3,4,13],relation:'For instance 把比賽習慣轉用到課堂與工作',formula:'For instance, a child who learns to [球場行動] is also more likely to [場外行動]',meaning:'球場聆聽隊友可轉化為課堂及職場合作。',links:['For instance, a child who learns to ',' during a match is also more likely to contribute well in classroom projects or future workplaces.'],labels:['比賽中學到的合作行動']},
 {example:'Since most real-life success depends on listening to other people, teamwork is a deeper and more transferable skill than competition alone.',d:[3,4,13],relation:'Since 用生活成功條件支持兩項能力的比較',formula:'Since most real-life success depends on [合作需求], teamwork is a deeper and more transferable skill than competition alone',meaning:'多數生活成果靠與人合作，故合作更可遷移。',links:['Since most real-life success depends on ',', teamwork'],labels:['生活成功所需']},
 {example:'In conclusion, sport does teach children how to prepare for challenges, especially by helping them deal with pressure, failure, and self-improvement.',d:[3,8,14],relation:'does teach 先承認首方教育作用',formula:'In conclusion, sport does teach children how to [首方能力], especially by helping them deal with [考驗]',meaning:'結論先承認競爭能教應對壓力失敗。',links:['In conclusion, sport does teach children how to ',', especially'],labels:['先承認的能力']},
 {example:'However, I believe its greatest benefit is that it teaches cooperation, because cooperation, trust, and shared responsibility are essential in school, work, and society.',d:[3,8,13],relation:'However 加 because 定最後取捨並交代跨場域理由',formula:'However, I believe its greatest benefit is that it teaches [能力], because [理由] are essential in school, work, and society',meaning:'最看重團隊合作，因信任與共責多場域重要。',links:['However, I believe its greatest benefit is that it teaches ',', because'],labels:['作者判為最重要的能力']},
];
const usage=[
 '當前半句先提出一項作用，後半句要用 because 說明它如何產生時。',
 '當要用 whereas 並列對同一問題的不同看法，突顯兩者對照時。',
 '當你需交代將討論兩方，同時表明最後的判斷時。',
 '當首個主體段需公平提出第一方的主要理由時。',
 '當你要用 When 描述具體活動，再指出成功所需條件時。',
 '當你要說明某項童年經驗如何影響日後應對壓力時。',
 '要用 instead of 對照受挫後繼續嘗試與放棄，說明能力如何形成時。',
 '當你已給例子，需要概括一方帶來的長期能力時。',
 '當你要轉向第二方，並提出它更有力的原因時。',
 '當你要說明個人能力不足，並列出合作所需行動時。',
 '當你要指出一種情境中的能力能用到更廣的生活時。',
 '當你要用具體例子把原場域的行為連到其他場域時。',
 '當你要用 Since 提出普遍條件，據此比較兩項能力時。',
 '當結論要先承認你未選的一方仍有真實價值時。',
 '當結論要用 because 解釋最終取捨在多個場域均成立時。',
];
const structures=specs.map((s,i)=>({example:s.example,distractors:s.d,frame:frame(i,s.formula,s.meaning,usage[i],s.links,s.labels),answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}));
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'分清兩方理由，再比較能力可否跨場域使用。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[quiz('作者認為運動帶來哪項最重要的教育？',['團隊合作，因其可用於課堂、工作及社會。','只有贏比賽，與其他生活情境無關。','只需要運氣，毋須練習或合作。','競爭沒有任何可取的教育價值。'],'承認競爭價值後，作者選合作。'),{type:'multi',prompt:'文章用哪兩項經驗支持兩方？',detail:'選兩項，再按「確認」。',options:['輸球後接受失望並重試。','聆聽隊友可助課堂項目。','贏球只靠天分與運氣。','合作只能在運動場使用。'],correct:[0,1],why:'一項支持抗逆力，一項支持可遷移的合作。'}];
const route=[sequence('還原四段論證',[['引言','書本難教的道理；提出競爭與合作兩方並選合作。'],['競爭','努力準備、面對壓力，輸球後重試可建立抗逆力。'],['合作','團隊任務要求溝通信任，能力可用於課堂及工作。'],['結論','承認競爭作用，但合作的跨場域價值更高。']],'兩方均有價值，最後按可轉用程度作比較。')];
const evidence=[quiz('競賽為何可教孩子應對日後壓力？',['努力準備及輸後重試，可練習面對挫折。','所有工作面試都只考察體育成績。','只要參賽就保證每次都會勝出。','競賽使學業壓力永遠完全消失。'],'文章連童年競爭經驗與未來考驗。'),quiz('輸掉足球賽的例子支持甚麼？',['接受失望、分析錯誤並再次嘗試。','輸球後必須永遠停止參與運動。','有運氣就不必準備或自我反省。','輸球證明合作必然沒有任何價值。'],'失敗也能培養抗逆力。'),quiz('為何個人天分不足以贏團隊運動？',['球員還需傳球、溝通及信任隊友。','任何球員都可完全不理會同伴。','球員只需個人天分，不必配合。','所有團隊運動都沒有共同目標。'],'團隊成果依賴合作行動。'),quiz('作者為何認為合作更有價值？',['其能力可轉用於課堂、職場與社會。','合作只能在球場內發揮作用。','所有競爭經驗都完全沒有用處。','合作保證每人都永遠不會失敗。'],'跨場域可遷移性是比較尺度。')];
const logic=[sequence('競爭可教甚麼',[['活動','孩子參加賽跑、比賽及錦標賽。'],['認識','成功重努力、自律及準備。'],['挫折','輸球後接受失望、分析錯誤再試。'],['能力','抗逆力與得失風度。']],'競爭不只是輸贏結果。'),sequence('合作為何更重要',[['球場要求','傳球、溝通、信任並顧及團隊。'],['跨域例子','聆聽隊友可延伸至課堂小組。'],['一般原則','現實成果常需與他人合作。'],['最後取捨','合作比單純競爭更易遷移。']],'比較兩方時要提出共同尺度。')];
const transfers=[
 transfer('另一題比較學校應教獨立還是合作。','哪句能借用本文比較尺度？',['兩者皆有用，應比較哪項較能用於不同生活場景。','只要重視獨立，便證明合作在任何場合均無用。','只要團隊完成任務，個人判斷便完全沒有價值。','只能比較兩種能力的名稱，毋須再看實際用途。'],['跨場域效用是可轉用尺度。','否定過度。','仍需判斷。','缺乏尺度。'],[12,14],'transferability of skill。'),
 transfer('孩子輸掉小組辯論後重新準備。','哪句貼合競爭段的論證？',['失敗可促使孩子反省、準備，再有信心嘗試。','失敗證明努力無用，故日後不應再參加活動。','輸一次便代表孩子永遠不可能建立抗逆能力。','只要辯論有勝負，就不能再學習任何合作技能。'],['輸後反省重試。','相反。','過度。','兩者可並存。'],[6,7],'loss → resilience。'),
 transfer('一位球員擅長射門卻拒絕傳球。','哪句最貼近團隊段的分析？',['個人天分不足以成功，球員還需與同伴配合。','射門準確便足以保證球隊每場賽事必定獲勝。','拒絕傳球證明溝通與互相信任均毫無作用。','只要能跑得快，球隊便完全不需要共同目標。'],['天分不代替合作。','不保證。','相反。','需要目標。'],[9],'talent alone insufficient。'),
 transfer('作文談比賽，卻只列「努力」和「紀律」。','哪句可補足後續解釋？',['參賽亦讓孩子練習輸後反省，為日後壓力作準備。','努力和紀律只能在運動場使用，日後必然無用。','一旦孩子有紀律，就永遠不會遇到任何學業壓力。','只要提到努力，便無須再說明能力如何轉用。'],['把當下經驗連未來。','過度。','不現實。','要解釋。'],[5,6,7],'competition → future pressure。'),
 transfer('小組科學實驗由多人分工完成。','哪句能轉用合作段的邏輯？',['成果取決於分工溝通，而非單靠一名學生的天分。','小組實驗只看一人分數，所以成員不用互相協助。','只要實驗有器材，分工與互信就必然沒有作用。','任何小組任務都不能讓學生學會課堂以外的能力。'],['分工溝通是關鍵。','誤讀小組。','仍需合作。','可遷移。'],[8,9,12],'achievement depends on cooperation。'),
 transfer('有人說「競爭只會使孩子自私」。','哪句最能公平回應？',['健康競爭可教準備與抗逆力，但仍需學會合作。','競爭只能教自私，絕不可能帶來任何有用能力。','只要孩子參加競賽，所有合作能力都會立即消失。','孩子學會抗逆力後，便完全無須聆聽其他人的想法。'],['承認競爭價值兼比較。','過度。','無根據。','仍需合作。'],[4,7,13],'fair concession。'),
 transfer('作者從球場聆聽隊友寫到職場。','這一步的論證功能是甚麼？',['證明球場的合作能力可以轉用到其他生活場景。','證明所有工作都必須先通過正式的體育測試。','證明運動場與職場完全相同，毫無情境差異。','證明職場只需要傳球技巧，不需要任何溝通。'],['跨場域遷移。','無此要求。','情境不同。','溝通仍需。'],[10,11,12],'field → classroom/work。'),
 transfer('另一題問課外活動應重視個人獎項還是協作。','哪句結論最合本文方式？',['獎項可教應對失敗，但協作更常用於學校與工作。','只有獎項值得學習，任何合作活動都完全沒有用。','只要選協作，便必須否認個人獎項的全部價值。','兩項能力不應比較，因任何生活場景都不會用到。'],['承認首方再按適用面選。','過度。','無需否認。','可比較。'],[13,14],'concede then choose teamwork。'),
 transfer('孩子參加比賽，只把勝出歸因於運氣。','哪句可修正其因果解釋？',['成功通常也靠努力、自律及準備，並非只靠運氣。','只有運氣能決定結果，練習和準備都完全無效。','如果有努力，每個孩子便能保證贏得全部比賽。','只有失敗者才需要自律，勝出者永遠不用準備。'],['rather than luck 指真正因素。','相反。','不保證。','不合理。'],[4],'effort discipline preparation。'),
 transfer('同學合作完成報告，之後到社區服務。','哪句指出合作能力的價值？',['懂得溝通互信者可把合作方式用於不同群體。','合作只適合校內報告，到了社區便完全不能用。','只要參加社區服務，便不再需要分工或共同責任。','懂得合作等於保證每個群體都不會出現任何衝突。'],['合作可跨場域轉用。','相反。','仍需分工。','不保證。'],[11,12,14],'teamwork transferable。'),
];
// Reviewed transfer alternatives and matched feedback.
const editorialTransferOptions=[["兩者皆有用，應比較哪項較能用於不同生活場景。","獨立較能提升個人成績，合作則主要用於體育活動。","合作有助分工，獨立判斷則可留到成年後再學。","兩者都重要，故課程只需平均分配相同時數。"],["失敗可促使孩子反省、準備，再有信心嘗試。","輸掉辯論可讓孩子換組，卻未必需要反省準備。","失敗後再參賽能練膽量，輸因則可不再分析。","孩子輸後重新準備，目的只是下一次取得獎項。"],["個人天分不足以成功，球員還需與同伴配合。","球員有射門天分，隊友應主動配合而不必傳球。","個人技巧可改善比分，溝通則只屬賽後討論。","球隊能否成功主要看射手，其他人負責觀察。"],["參賽亦讓孩子練習輸後反省，為日後壓力作準備。","參賽教孩子守規則，但未說輸後如何處理壓力。","努力紀律可提高成績，卻未說能力如何跨場景。","比賽可帶來獎項，成長則主要取決於教練表揚。"],["成果取決於分工溝通，而非單靠一名學生的天分。","實驗成果靠能力最強者，其他成員主要提供器材。","分工可提高速度，互相溝通則可等到報告完成。","團隊合作有助準時完成，卻未必關乎共同目標。"],["健康競爭可教準備與抗逆力，但仍需學會合作。","健康競爭能教準備，合作則留待正式工作才學。","競賽可培養抗逆力，因此輸贏應當成唯一目標。","合作有益，但參加競賽時最好只關注個人成績。"],["證明球場的合作能力可以轉用到其他生活場景。","球場與職場都需要速度，因此兩者訓練方式相近。","聆聽隊友可改善比賽，職場則主要依靠個人判斷。","運動經驗能建立信心，卻未必與職場合作有關。"],["獎項可教應對失敗，但協作更常用於學校與工作。","協作可完成任務，個人獎項則只反映天分差異。","獎項有助動機，協作只用於體育而非學校工作。","兩者都有作用，所以較少比較哪項更常被用到。"],["成功通常也靠努力、自律及準備，並非只靠運氣。","運氣影響結果，因此努力準備的作用較難看見。","練習有助成績，但自律與是否持續參與無關。","成功需要努力，卻只須在比賽前一天開始準備。"],["懂得溝通互信者可把合作方式用於不同群體。","報告需要溝通，社區服務則主要靠個人執行。","合作可轉用於不同群體，但不必建立互相信任。","社區服務需要分工，學校報告的經驗則只能作參考。"]];
const editorialTransferReasons=[["合作可用於學校和職場，不限體育。","獨立判斷也有眼前用途。","平均時數未比較兩種能力的實際適用場景。"],["換組不能代替輸後反省。","再試應建立在檢討與準備之上。","例子關注抗逆力，不只是下一次獲獎。"],["只讓隊友配合，忽略球員本人的合作責任。","溝通在比賽中已有作用。","團隊成功不能只依賴一名射手。"],["守規則未說明失敗如何轉化成抗逆力。","要說明努力紀律之外的轉移能力。","獎項與表揚不是原文的核心學習機制。"],["一人能力不能代替整體分工。","實驗過程中就需要溝通。","共同目標正是合作的方向。"],["合作從兒童活動中便可學，不需等待工作。","競賽並非只為勝出，也為準備和抗逆。","競爭與合作可以同時發展。"],["原文談聆聽和合作，不是速度。","職場也常需要與他人溝通。","球場能力轉用職場是這個例子的重點。"],["獎項不只是天分，也可教面對成敗。","協作在學校和工作都常用。","題目要求比較兩者哪項較可轉用。"],["運氣可能有影響，但不能取代努力自律。","自律有助持續訓練和準備。","準備不應被縮成賽前一天。"],["社區工作同樣需要協調。","互信是合作能力的一部分。","學校合作方式可以轉用到社區。"]];
editorialTransferOptions.forEach((row,i)=>{transfers[i].options=row;transfers[i].explanations=[transfers[i].explanations[0],...editorialTransferReasons[i]];});
// Source-aligned connector frames.
structures[0].frame.parts=[["Sport plays an important role in ","link","句型固定部分"],["childhood","slot","成長階段"],[" because ","link","句型固定部分"],["it teaches lessons that are difficult to learn only from books.","slot","書本難教的事"]];
structures[5].frame.parts=[["This matters because ","link","句型固定部分"],["children who never face competition","slot","缺乏經驗者"],[" may struggle when they later meet ","link","句型固定部分"],["academic pressure, job interviews, or professional rivalry.","slot","未來考驗"]];
structures[8].frame.parts=[["On the other hand, ","link","句型固定部分"],["team sports","slot","集體活動"],[" are even more powerful because ","link","句型固定部分"],["they show children that achievement often depends on cooperation.","slot","成就靠合作"]];
// Reviewed connector structure decompositions.
structures[6].frame.parts=[["For example, a child who loses a ","link","句型固定部分"],["football match","slot","比賽"],[" can learn to ","link","句型固定部分"],["accept disappointment, analyse mistakes, and try again","slot","反省並重試的行動"],[" instead of giving up.","link","句型固定部分"]];
structures[6].frame.formula="For example, a child who loses a [比賽] can learn to [反省並重試的行動] instead of giving up.";
structures[12].frame.parts=[["Since ","link","句型固定部分"],["most real-life success","slot","現實成就"],[" depends on ","link","句型固定部分"],["working with other people","slot","合作需求"],[", teamwork is a deeper and more transferable skill than competition alone.","link","句型固定部分"]];
structures[12].frame.formula="Since [現實成就] depends on [合作需求], teamwork is a deeper and more transferable skill than competition alone.";
// Keep the displayed formula synchronized with the exact fixed and replaceable source spans.
for(const card of structures)card.frame.formula=card.frame.parts.map(part=>{const [text,kind,label]=Array.isArray(part)?part:[part.text,part.kind,part.label];return kind==='slot'?`[${label}]`:text}).join('');
export default {key:'discuss-both-views:36',meta:{topic:'兒童運動教競爭還是合作',summary:'公平承認競爭教努力與抗逆力，再以球場到課堂職場的可轉移性說明合作更重要。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
