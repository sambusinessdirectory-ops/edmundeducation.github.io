// Reviewed Opinion 96: flight prices versus pollution at its source.
import fs from 'node:fs';import vm from 'node:vm';const context={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-96-ielts-opinion.js',import.meta.url),'utf8'),context);const source=context.window.ESSAY_MEMORY_LESSONS['opinion:96'];const original=source.sentences.map(x=>x.english);
const simple=[
'Air travel causes serious air pollution, and some people think raising prices for flights abroad is the answer.',
'I do not agree at all.',
'Higher ticket prices are a rough and unfair policy, but making flights pollute less would work better.',
'First, expensive tickets would mostly stop ordinary people from flying instead of dealing with pollution itself.',
'Families who visit relatives, overseas students and workers returning home would suffer, while rich travellers and big firms could still fly often.',
'In short, people with less money would carry most of the cost, but the people who fly the most might not change their habits.',
'An executive might keep taking long flights, while a family might have to cancel one important journey after saving for years.',
'This limits who can travel without reliably or fairly cutting pollution.',
'A better plan is to make every flight less polluting and offer other ways to avoid unnecessary flights.',
'Governments should make airlines use cleaner fuels, newer planes, stronger pollution limits and better routes.',
'If planes use less fuel, avoid unnecessary delays and use newer technology, each trip causes less pollution, not just the trips poorer people can no longer take.',
'At the same time, useful train routes and more online work meetings can replace trips that are not needed without making travel only for rich people.',
'Such policies address the cause of pollution rather than just making travel cost more.',
'To sum up, I do not think more expensive international flights are the best way to reduce air pollution.',
'Higher prices may stop some journeys, but this is unfair and does not fully solve the environmental problem.',
'Cleaner planes and better alternatives would solve more of the problem in a fairer way.',
];
const vocabulary=[
[['aviation','Air travel','航空'],['a serious environmental concern','serious air pollution','嚴重環境問題'],['made more expensive','raising prices','提高價格']],
[['completely disagree','do not agree at all','完全不同意']],
[['Raising ticket prices','Higher ticket prices','提高票價'],['a blunt and unfair measure','a rough and unfair policy','粗糙而不公平措施'],['reducing pollution at its source','making flights pollute less','從源頭減污']],
[['higher airfares','expensive tickets','昂貴機票'],['ordinary passengers','ordinary people','普通乘客'],['solve the environmental problem itself','dealing with pollution itself','解決污染本身']],
[['Families visiting relatives abroad','Families who visit relatives','探望海外親人的家庭'],['students studying overseas','overseas students','海外學生'],['migrant workers returning home','workers returning home','回鄉勞工'],['wealthy travellers and large companies','rich travellers and big firms','富裕旅客與大公司']],
[['In other words','In short','換句話說'],['those with thinner wallets','people with less money','經濟能力較弱的人'],['biggest users of air travel','people who fly the most','最常乘飛機的人']],
[['A business executive','An executive','企業高層'],['regular long-haul flights','keep taking long flights','定期長途飛行'],['give up one important trip after years of saving','cancel one important journey after saving for years','多年儲蓄後放棄重要旅程']],
[['reduces access','limits who can travel','限制出行機會'],['not pollution','without reliably or fairly cutting pollution','未可靠地減污']],
[['A better approach','A better plan','更好方法'],['make each flight cleaner','make every flight less polluting','減少每班航班污染'],['practical alternatives','other ways','可行替代方式']],
[['require airlines to use','make airlines use','要求航空公司使用'],['newer aircraft','newer planes','更新型飛機'],['stricter emission standards','stronger pollution limits','更嚴格排放限制'],['more efficient routes','better routes','更有效率航線']],
[['burn less fuel','use less fuel','較少燃料'],['avoid wasteful delays','avoid unnecessary delays','避免不必要延誤'],['pollution falls on every journey','each trip causes less pollution','每程污染都降低']],
[['rail links where practical','useful train routes','適用的鐵路路線'],['wider acceptance of online business meetings','more online work meetings','更多線上商務會議'],['reduce avoidable flights','replace trips that are not needed','減少可避免的航班'],['a luxury for the rich','only for rich people','富人才負擔得起']],
[['attacks the engine of the problem','address the cause of pollution','針對問題根源'],['merely raising the gate price','just making travel cost more','只提高搭機門檻']],
[['In conclusion','To sum up','總結'],['increasing the cost of international flights','more expensive international flights','提高國際航班成本'],['reduce air pollution','reduce air pollution','減少空氣污染']],
[['discourage some travel','stop some journeys','阻止部分旅行'],['socially unfair','unfair','對社會不公平'],['environmentally incomplete','does not fully solve the environmental problem','未全面解決環境問題']],
[['Cleaner aviation','Cleaner planes','更清潔航空'],['better alternatives','better alternatives','更好替代方案'],['a deeper and more balanced solution','solve more of the problem in a fairer way','更徹底更平衡的方法']],
];
function frame(i,links,labels,meaning,usage,example,tag,job){const v=original[i],parts=[];let c=0,k=0;for(const link of links){const at=v.indexOf(link,c);if(at<0)throw Error('Missing link '+(i+1)+': '+link);if(at>c)parts.push({text:v.slice(c,at),kind:'slot',label:labels[k++]});parts.push({text:link,kind:'link',label:'句型固定部分'});c=at+link.length;}if(c<v.length)parts.push({text:v.slice(c),kind:'slot',label:labels[k++]});if(k!==labels.length)throw Error('Unmatched labels '+(i+1));return {frame:{formula:parts.map(p=>p.kind==='link'?p.text:'['+p.label+']').join(''),meaning,usage,parts},example,tag,job};}
const specs=[
frame(0,[', and ', ' believe that '],['問題及背景','主張某做法的人','他們提出的方案'],'and 連接環境問題與一種被提出的政策，作者尚未表態。','引言要交代問題與一種常見但仍待評估的方案時。','Traffic is rising, and some leaders believe that higher fees will help.','and...believe that','引出待評估方案'),
frame(1,['I completely '],['明確反對的立場'],'I completely 直接表明程度，下一句必須補出理由。','前句已交代對方主張，作者要用短句清楚表態時。','I completely reject that proposal.','I completely','簡短明確表態'),
frame(2,[', whereas ', ' would be '],['提高價格的缺點','源頭處理的方案','較有效的比較判斷'],'whereas 對比限制需求和處理源頭兩種政策路線。','要用一句話指出某措施的缺點，並轉到更直接的替代方案時。','A flat fee is unfair, whereas safer engines would be more effective.','whereas...would be','對比兩種措施'),
frame(3,[' is that ', ' rather than '],['第一個問題','主要受限制的人','未解決的根本問題'],'rather than 說政策主要改變誰可使用服務，而非污染來源。','第一段要指出某措施會限制較弱勢群體，卻未處理原問題時。','The first problem is that a fee blocks families rather than cuts waste.','is that...rather than','指出限制與解決的落差'),
frame(4,[' would be hit hard, while ', ' could still '],['承受較重負擔的人','仍能負擔的人','較富裕者可維持的行為'],'while 對照不同收入群體承受的負擔。','要說同一措施對兩類人造成不對等影響時。','Ordinary users would be hit hard, while firms could still pay easily.','would be hit hard...while','比較分配影響'),
frame(5,['In other words, ', ', but '],['把政策後果換句話說','未必改變的高使用者行為'],'In other words 概括上句例子；but 對比負擔與行為成效。','列出受影響群體後，要總結不公平與成效不足兩項問題時。','In other words, poorer users pay most, but heavy users may continue.','In other words...but','概括分配與成效'),
frame(6,[' might still ', ', while ', ' might have to '],['高收入使用者','可能照舊的行為','較低收入家庭','可能被迫放棄的事'],'might 在兩邊保留可能性；while 讓對比具體可見。','要以兩個可能情境展示同一政策對不同人影響差異時。','A manager might still travel weekly, while a parent might have to cancel a visit.','might still...while...might have to','用對照小例呈現不公'),
frame(7,['This reduces ', ', not '],['實際減少的可及性','未必真正下降的污染'],'not 把限制服務和有效減污清楚分開。','段末要用短句凝結政策影響與政策目標的落差時。','This reduces access, not emissions, for many families.','This reduces...not','凝結措施與目標落差'),
frame(8,[' is to ', ' and to '],['更好方案','降低單次使用污染的做法','替代不必要使用的做法'],'and to 把源頭技術改善和需求替代列為互補政策。','第二段要提出一個同時降低單位污染和減少不必要活動的方案時。','A better plan is to improve buses and to replace short car trips.','is to...and to','提出雙軌替代方案'),
frame(9,[' should require ', ' to use '],['負責制定規則的一方','受規管的提供者','須採用的技術與標準'],'should require 把責任清楚放在規管者與提供者身上。','要寫出具體政策而非只說「應改善」時。','Governments should require factories to use cleaner tools and standards.','should require...to use','指明政策責任與工具'),
frame(10,['If ', ', pollution falls on ', ', not only on '],['每班運作都較清潔的條件','全面受惠的行程','單靠價格擠走的行程'],'If 交代清潔條件；not only on 對比全面減排和排除窮人。','要說明技術改善能覆蓋所有使用者，而非只減少某群體的使用時。','If each bus runs cleanly, pollution falls on every route, not only on routes abandoned by poorer riders.','If...pollution falls...not only','比較全面與選擇性效果'),
frame(11,['At the same time, ', ' can reduce ', ' without '],['可行替代方案','被替代的不必要飛行','不應出現的分配代價'],'At the same time 增加互補措施；without 明示公平底線。','提出源頭改善後，再加可行替代方式，同時避免把服務變成富人特權時。','At the same time, online meetings can reduce short trips without excluding lower earners.','At the same time...can reduce...without','補充替代及公平條件'),
frame(12,[' attacks ', ' rather than merely '],['更直接的政策','問題根源','只提高使用門檻的做法'],'rather than merely 把源頭政策與表面加價區分。','段末要總結更好方案為何針對原因而非只提高門檻時。','This plan attacks waste rather than merely raising prices.','attacks...rather than merely','總結源頭優勢'),
frame(13,['In conclusion, ', ' is the best way to '],['作者重申不同意的政策判斷','政策聲稱達到的環境目標'],'In conclusion 回答題目中的 best way 比較，而非只說措施有沒有作用。','結尾須直接判斷某措施是否最佳，並回到原定目標時。','In conclusion, I doubt that raising fees is the best way to reduce waste.','In conclusion...best way to','回答最佳方法的比較'),
frame(14,['It may ', ', but it is ', ' and '],['政策可能帶來的有限效果','社會分配上的缺點','環境成效上的不足'],'may 承認有限作用；but 仍指出兩個關鍵不足。','結尾要承認被反對方案有部分效果，但不足以成為最佳方法時。','It may reduce a few trips, but it is unfair and incomplete.','It may...but...and','讓步後重申不足'),
frame(15,[' and ', ' would produce '],['源頭技術改善','可行的替代方式','更平衡的整體結果'],'and 合併兩條替代路線；would produce 預測較佳結果。','最後要把改良技術與替代活動合成一個建設性結論時。','Cleaner trains and better routes would produce a fairer solution.','and...would produce','以雙軌方案收束'),
];
const structures=specs.map((x,i)=>{const d=[(i+1)%specs.length,(i+5)%specs.length,(i+9)%specs.length];return {...x,distractors:d,wrongReasons:d.map(j=>'這句用「'+specs[j].tag+'」'+specs[j].job+'；沒有用「'+x.tag+'」'+x.job+'。'),answerReason:'示例保留「'+x.tag+'」的固定部分，用來'+x.job+'。',patternType:'reviewed'};});const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的論證次序排列意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[quiz('作者對提高國際航班票價作為最佳減污方法持甚麼立場？',['完全反對，認為措施不公平且未從污染源頭處理','完全同意，認為只要加價就能令每班飛機零排放','只討論航空公司的售票頁面與付款程序','認為所有旅客都擁有相同支付能力'],'作者否定 best way，提出公平與源頭效率兩面理由。'),quiz('主體兩段的論證如何分工？',['先分析加價的分配問題，再提出清潔飛行與替代交通','先討論旅遊保險，再討論機上餐飲服務','兩段都只重複機票應提高多少元','只談鐵路，完全沒有分析加價政策'],'第一段評估加價，第二段提出更好的雙軌方案。')];
const route=[sequence('從票價負擔到污染源頭',[
['引言：反對加價為最佳方法','加價粗糙且不公平，源頭減污更有效。'],['第一段：負擔不對等','家庭、學生和移民勞工受重擊，富裕旅客可照飛。'],['對照小例與段末總結','企業高層仍坐長途機，家庭卻放棄重要旅程；限制出行不等於可靠減污。'],['第二段：改善每班航班','清潔燃料、更新飛機、排放標準和航線效率。'],['互補替代方式','可行鐵路與網上會議減少不必要航班。'],['結尾：公平與成效','承認加價或減少部分出行，仍以雙軌方法作更平衡方案。']],
'先檢查加價的公平性與成效，再比較源頭及替代方案。')];
const evidence=[
quiz('哪些人可能因加價受到較重影響？',['探親家庭、海外學生及回鄉勞工','只有最富裕的企業高層','只在國內乘地鐵的旅客','已決定永遠不旅行的人'],'原文列三種普通旅客，對比富裕旅客和公司。'),
quiz('企業高層與家庭的對照想說明甚麼？',['加價可能阻止較窮家庭，卻未必改變富裕高使用者','每位高層都必然停止出國','家庭和企業高層都不需支付票價','只有一次旅行才會排放污染'],'原文用 might 在兩邊保留可能性。'),
quiz('「This reduces access, not pollution」區分甚麼？',['限制誰能飛與直接減少每班污染是兩件事','機票較貴便保證每班飛機零污染','航空污染只會來自普通家庭','只要減少出行就不必考慮公平'],'段末指出措施與目標之間的落差。'),
quiz('作者提出哪些航空公司的具體做法？',['清潔燃料、較新飛機、較嚴排放標準及高效航線','只提高餐飲價格而不更改燃料','只改售票網站外觀與標誌','要求所有乘客自行購買飛機引擎'],'第二段把責任放在航企技術與運作。'),
quiz('網上商務會議在論證中起甚麼作用？',['替代可避免的商務航班，同時保留必要出行','令所有家庭探親都變得多餘','保證任何國際交流都只須看螢幕','讓航班票價提高便可消除排放'],'它是實際可行的替代，而非全面取消旅行。'),
quiz('作者在結尾為何承認加價可能阻止部分出行？',['承認有限效果，再說它仍不公平且未全面減污','撤回全部反對立場，改稱加價必定最佳','說明窮人與富人受同樣影響','表示清潔技術與鐵路都沒有作用'],'may...but 對比有限效果和兩項不足。')];
const logic=[sequence('加價為何可能不公平且不足',[
['票價提高','飛行成本對所有乘客上升。'],['低收入旅客更難負擔','探親、留學與回鄉可能受影響。'],['富裕高使用者仍可照飛','價格未必改變最常飛行者。'],['限制可及性不等於源頭減污','每班飛機是否更清潔仍未解決。']],
'第一段同時檢查分配影響和政策目標。'),sequence('雙軌方案如何更全面減污',[
['改善每班航班','燃料、飛機、標準和航線可降低單次污染。'],['效果及於所有行程','不只是窮人買不起的那些旅程減少。'],['提供可行替代','鐵路與線上會議替代不必要航班。'],['守住公平底線','必要旅行不應只屬富人。']],
'第二段結合技術源頭改善與可行的需求替代。')];
const t=(context,question,options,explanations,ids,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices:ids,modelLink});
const transfer=[
t('城市提高公共交通票價，低收入者少搭車，富裕者照舊。','最應先檢查哪項政策問題？',['加價主要限制弱勢者，未改善車輛排放','加價可減少乘客，便足以改善車輛排放','富裕者照常使用，可先忽略收入差異','低收入者少搭車，可先不檢查引擎技術'],['可及性和源頭污染須分開。','客量下降不等於每趟車變清潔。','收入差異正是公平問題。','引擎排放仍須檢查。'],[3,4,5,7],'原文說票價可能減少可及性而非可靠減污。'),
t('一名企業高層照常坐飛機，探親家庭卻因票價取消行程。','範文的哪個論證得到支持？',['同一價格措施對不同收入者的負擔不對等','同一票價有一致標準，便可略過收入差異','探親家庭取消行程，主因可先看航班時間','高層照常飛行，便不用再看機隊排放'],['這是原文的高層與家庭對照。','同標價對不同收入者負擔不同。','情境重點是收入與必要行程。','航班照飛時排放仍存在。'],[4,5,6],'原文以高層照飛、家庭放棄重要行程呈現不公。'),
t('政府要求所有巴士改用更清潔引擎，而非只提高車票價格。','哪個因果說法最貼近範文？',['改善每趟車的排放，效益可及每位乘客','清潔引擎有助減排，但仍只按票價評估','引擎更新可改善車輛，卻不必量度排放','票價提高可減客量，便不需要清潔巴士'],['技術從源頭改善所有行程。','改引擎的效益應看每趟排放。','排放量須量度成效。','票價不能替代引擎改善。'],[8,9,10],'原文強調每次旅程的排放都能下降。'),
t('公司把部分可在網上完成的會議改為線上，但仍保留必要出差。','這如何轉用第二段？',['以可行替代減少不必要航班，保留必要旅行','可改線上會議，必要出差也應先大幅縮減','網上會議能減航班，卻不必檢查會議性質','網站外觀改善，可讓員工較願意少出差'],['原文只要求取代 avoidable flights。','文章保留必要旅行。','替代只適用可在線上完成的會議。','網站外觀與航班需求關聯薄弱。'],[8,11],'原文用網上商務會議減少可避免飛行。'),
t('一項政策可減少一些出行，但主要排除付不起費用的人。','哪個評估最完整？',['承認部分效果，同時檢查公平與源頭成效','部分出行減少，公平影響可留待日後處理','加價有缺點，便不必承認出行可能減少','只看少了幾名乘客，不查每趟排放'],['原文以 may...but 平衡有限成效與不足。','有部分效果仍應看誰被排除。','讓步後不可把作用全否定。','每趟排放是源頭成效。'],[5,7,14],'原文結尾承認部分出行或受阻，但仍不稱最佳。'),
t('作文題問「加價是否減污的最佳方法」，學生只答「有些人會少出行」。','還需要加入哪個比較？',['比較源頭減排與替代方案是否更公平有效','有些人少出行，便可先不比較其他辦法','只看機票費用，不討論較清潔的引擎','可談替代方案，卻不必評估公平負擔'],['best 要與可行替代方案比較。','題目問最佳方法，須比較方案。','票價不能代替源頭技術。','公平是本文的重要判準。'],[2,8,9,11,13],'原文以較清潔的航空及替代方式回應 best way。'),
t('學校收很高的活動費，結果較窮學生不能參加，富裕學生照舊。','哪句可轉用文章的公平邏輯？',['收費減少參與，未必改善活動內容','費用減少參與，可由取消活動本身解決','富裕學生仍能參與，故不必檢查差距','活動內容可改善，但先只靠提高收費'],['價錢門檻與源頭品質要區分。','取消活動未處理內容問題。','富裕者照常顯示分配不均。','收費未必改善活動本身。'],[3,4,5,7],'原文對比可及性與真正處理問題。'),
t('機場管理者調整航線，縮短不必要繞道和等待。','這最接近哪個政策工具？',['改善運作效率，使每次飛行少浪費燃料','調整航線有用，但仍只按旅客票價評估','富裕旅客買更多票，可分攤燃料浪費','先改候機室布局，航線繞道可留待日後'],['原文列高效航線與避免延誤。','航線調整應看燃料效率。','多買票不減每次飛行燃料。','候機室布局未解繞道。'],[9,10],'原文以航線效率與延誤管理降低每程排放。'),
t('一個城市同時改良巴士車隊，並設置可替代短途駕車的鐵路。','哪項政策設計最符合範文？',['同時改善引擎並提供可行交通替代','改車隊後，鐵路使用可留到日後再安排','新鐵路建成，車輛排放可不再檢查','兩項措施都有用，但只看車站外觀效果'],['原文第二段提出雙軌。','可行鐵路也是第二條路線。','鐵路不取消車隊排放。','外觀不量度源頭與替代成效。'],[8,9,11,15],'原文結合 cleaner aviation 與 better alternatives。'),
t('政策結尾要承認加價也許有作用，卻反對稱它為最佳方法。','哪句最忠於範文？',['或可阻止少量出行，但不公平且未全面減污','加價或減少出行，公平問題可稍後再評估','加價效果有限，但也不用改善車輛技術','加價可減污染，便不必提供替代交通'],['原文承認 may discourage some travel，仍指不足。','結論應回收公平問題。','技術改善仍是作者替代。','只加價未提供可行選項。'],[13,14,15],'原文結尾做有限讓步，再收束雙軌方案。'),
];
export default {key:'opinion:96',meta:{topic:'提高機票價格是否是減少航空污染的最佳方法',summary:'範文從加價的不公平與成效不足出發，主張改善每班航班的排放並以可行替代方式減少不必要飛行。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer};
