// Reviewed Opinion 105: respectful workplace culture versus facilities.
import fs from 'node:fs';import vm from 'node:vm';
const cx={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-105-ielts-opinion.js',import.meta.url),'utf8'),cx);
const original=cx.window.ESSAY_MEMORY_LESSONS['opinion:105'].sentences.map(x=>x.english);
const simple=[
'Employers must choose whether to focus mainly on how people are treated at work or on better equipment and rooms.',
'I think a respectful and helpful workplace matters most, because people struggle to work well if they feel unsafe or treated unfairly.',
'The main reason is that a good workplace changes how willing people are to work and stay.',
'When workers are treated fairly, they share ideas, admit errors and work together more readily.',
'Trust is not an extra comfort; good work depends on it.',
'For example, a junior worker whose manager listens may report a problem early, while one who is repeatedly ignored may stay quiet until it becomes expensive.',
'So respect can stop small problems from becoming serious ones.',
'Better tools and rooms help, but they cannot make up for an unfair or harmful workplace.',
'A good computer or office may make work easier, but it helps little if managers insult workers or teams leave them out.',
'Workers in that situation may use excellent tools without much energy and do only what is required because they no longer care about the organisation.',
'In a fair and supportive workplace, however, people often keep working well even with imperfect tools because their effort is valued.',
'To conclude, tools and facilities can make work faster, but employers should not put them first.',
'A workplace that respects and supports people matters more because it creates trust and dedication that equipment cannot provide.',
];
const vocabulary=[
[['human atmosphere','how people are treated','人際氛圍'],['physical resources','equipment and rooms','實體資源'],['main duty','focus mainly','主要責任']],
[['respectful and supportive environment','respectful and helpful workplace','尊重而支持的環境'],['clear priority','matters most','首要事項'],['unfairly treated','treated unfairly','受到不公對待']],
[['healthy workplace culture','good workplace','健康職場文化'],['motivation and loyalty','how willing people are to work and stay','動力和忠誠度']],
[['respected equally','treated fairly','受到平等尊重'],['admit mistakes','admit errors','承認錯誤'],['cooperate with colleagues','work together','與同事合作']],
[['soft luxury','extra comfort','非必要的舒適'],['foundation on which','depends on','賴以建立的基礎']],
[['junior employee','junior worker','初級員工'],['point out a problem early','report a problem early','及早指出問題'],['constantly dismissed','repeatedly ignored','不斷被忽視']],
[['In this sense','So','從這個角度'],['major failures','serious ones','重大失誤']],
[['facilities and equipment','tools and rooms','設施和設備'],['compensate for','make up for','彌補'],['toxic or unequal environment','unfair or harmful workplace','有害或不平等的環境']],
[['modern computer','good computer','現代電腦'],['humiliated by managers','managers insult workers','受管理層羞辱'],['excluded by their team','teams leave them out','受團隊排斥']],
[['little enthusiasm','without much energy','缺乏熱情'],['doing the minimum','do only what is required','只做最低限度'],['emotionally invested','care about the organisation','在情感上投入']],
[['By contrast','However','相比之下'],['remain productive','keep working well','維持生產力'],['resources are not perfect','imperfect tools','資源並不完美']],
[['In conclusion','To conclude','總結'],['improve efficiency','make work faster','提升效率'],['central focus','put them first','首要焦點']],
[['respected, valued, and supported','respects and supports people','受尊重重視及支持'],['trust and commitment','trust and dedication','信任和投入'],['replace','cannot provide','取代']],
];
function frame(i,links,labels,meaning,usage,example,tag,job){const v=original[i],parts=[];let c=0,k=0;for(const link of links){const at=v.indexOf(link,c);if(at<0)throw Error('Missing link '+(i+1)+': '+link);if(at>c)parts.push({text:v.slice(c,at),kind:'slot',label:labels[k++]});parts.push({text:link,kind:'link',label:'句型固定部分'});c=at+link.length;}if(c<v.length)parts.push({text:v.slice(c),kind:'slot',label:labels[k++]});if(k!==labels.length)throw Error('Unmatched labels '+(i+1));return {frame:{formula:parts.map(p=>p.kind==='link'?p.text:'['+p.label+']').join(''),meaning,usage,parts},example,tag,job};}
const specs=[
frame(0,['whether ', ' or '],['僱主須決定的責任','改善人際氛圍的選項','投資設施的選項'],'whether...or 並列兩種可能的優先事項。','題目要求比較僱主應先改善人際環境還是工作資源時。','Managers must decide whether to improve team trust or buy new equipment.','whether...or','提出兩種優先選項'),
frame(1,['In my view, ', ' should be ', ', because '],['被優先改善的環境','它的優先順位','員工表現受影響的原因'],'In my view 表態；because 說明人際環境與長期表現的關係。','引言需要明確選擇一項優先事項並給出直接理由時。','In my view, respectful leadership should be the first priority, because unhappy staff cannot work well.','In my view...should be...because','表態並給理由'),
frame(2,['The strongest reason is that ', ' directly affects '],['最重要的工作條件','其影響的動力與留任'],'directly affects 點出職場文化對員工行為的直接作用。','主體段要指出首選事項如何改變員工動力和留任意願時。','The strongest reason is that fair treatment directly affects staff morale.','reason...directly affects','提出主要影響'),
frame(3,['When ', ', they are more willing to '],['員工受到的公平對待','員工因此願意做的事'],'When 設定工作條件；more willing to 交代合作行為。','要說明管理方式如何改變員工分享想法或承認錯誤的意願時。','When workers feel safe, they are more willing to report mistakes.','When...more willing to','由條件推到行為'),
frame(4,[' is not ', '; it is '],['信任','被低估的附加享受','真正支撐工作的基礎'],'not...; it is 先否定錯誤定位，再指出真正作用。','要糾正把信任視為可有可無福利的想法時。','Team trust is not a bonus; it is a basis for reliable work.','is not...; it is','重訂信任定位'),
frame(5,['For example, ', ' is more likely to ', ', whereas ', ' may '],['受到聆聽的員工','及早採取的行動','遭到忽視的員工','可能延誤的行動'],'whereas 對照受尊重與被忽視的員工如何處理同一問題。','需要用一個職場場景比較兩種管理方式的後果時。','For example, a heard employee is more likely to speak up, whereas an ignored colleague may stay silent.','For example...whereas...may','以對照例子說明'),
frame(6,['In this sense, ', ' can prevent ', ' from '],['尊重的職場做法','早期的小問題','問題惡化的結果'],'prevent...from 把尊重連到避免更大損失。','例子之後要抽出尊重如何預防問題升級的原則時。','In this sense, open discussion can prevent small errors from becoming disasters.','prevent...from','從例子抽出預防作用'),
frame(7,[' are certainly useful, but they cannot compensate for '],['有用的實體設備','不能彌補的人際問題'],'certainly...but 承認設備價值，同時限定其作用。','第二段要承認設備有幫助，卻解釋它無法補救不公平待遇時。','New laptops are certainly useful, but they cannot compensate for bullying.','certainly useful...but','承認並限定設備價值'),
frame(8,[' may ', ', yet ', ' if '],['設施可能提供的便利','日常工作改善','在某條件下受限的價值','員工受辱或被排斥的情況'],'yet 把設備便利與受辱時的有限效果對比。','要說明硬件雖能改善日常工作，卻會被有害管理削弱時。','A bright office may help staff focus, yet that benefit is limited if managers humiliate them.','may...yet...if','對照設備與待遇'),
frame(9,['In fact, ', ' may ', ', simply ', ' because '],['處於有害環境的員工','使用設備時的低投入狀態','最低限度的工作行為','不再投入的心理原因'],'simply...because 解釋為何好工具仍未帶來積極工作。','已描述可觀察的低投入行為，要用 because 追溯背後的原因時。','In fact, unhappy staff may use fine tools poorly, simply meeting targets because they feel detached.','In fact...simply...because','追溯低投入原因'),
frame(10,['By contrast, ', ' often ', ' even when ', ', because '],['受到公平鼓勵的員工','可維持的表現','資源不完美的情況','努力被重視的原因'],'By contrast 與前句對照；even when 說明資源欠佳仍可投入。','要用相反情況證明公平對待比完美設備更重要時。','By contrast, supported workers often remain focused even when tools are old, because they feel valued.','By contrast...even when...because','以反面場景驗證'),
frame(11,['In conclusion, although ', ', they should not be '],['設施的確可以改善之處','僱主不應給予的核心順位'],'although 承認效率作用，仍保留優先次序判斷。','結尾要重申設施有用，但不應成為僱主最重要投資時。','In conclusion, although better desks may help, they should not be the main priority.','although...should not','結尾限定硬件順位'),
frame(12,[' is far more important, because ', ' that '],['尊重員工的環境','其建立的信任和投入','設備無法取代的關係'],'far more important 明確比較；because 說明不可取代的價值。','最後要把優先判斷連到設備無法代替的信任時。','A fair workplace is far more important, because it builds trust that expensive machines cannot buy.','far more important...because','以信任收束立場'),
];
const structures=specs.map((x,i)=>{const d=[(i+1)%specs.length,(i+5)%specs.length,(i+9)%specs.length];return {...x,distractors:d,wrongReasons:d.map(j=>'這句用「'+specs[j].tag+'」'+specs[j].job+'；沒有用「'+x.tag+'」'+x.job+'。'),answerReason:'示例保留「'+x.tag+'」的固定部分，用來'+x.job+'。',patternType:'reviewed'};});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的論證次序排列意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[quiz('作者認為僱主應先改善甚麼？',['員工受尊重和支持的工作環境','辦公室的顏色與所有裝飾品','每部電腦的品牌與型號','只改善休息室而不處理管理方式'],'作者把人際環境放在設施之前。'),quiz('為甚麼設備不是第一優先？',['設備不能彌補羞辱與不公平，信任更影響投入','作者認為所有設備都完全沒有用途','員工只需休息，不必使用任何工具','高價設備必然會令管理者停止不公平待遇'],'文章承認設備有用，卻指出其作用有界限。')];
const route=[sequence('從職場尊重到工作表現', [['引言：選擇優先項','作者選擇尊重與支持員工。'],['理由一：文化改變行為','公平待遇促進分享、承認錯誤與合作。'],['例子：及早說出問題','受到聆聽的初級員工更可能及早提醒。'],['理由二：設備不能補救有害環境','被羞辱或排斥的員工即使用好工具也可能消極。'],['對照：支持使人持續投入','被重視時，資源不完美仍可能保持表現。'],['結論：信任不可替代','設施有用，但信任與投入更重要。']], '先展示尊重如何改善行為，再比較硬件的局限。')];
const evidence=[quiz('受平等尊重的員工更可能做甚麼？',['分享想法、承認錯誤並與同事合作','必然拒絕提出任何建議或錯誤','只等待電腦更換才與人交談','完全不用管理者提供任何指引'],'原文列出三種合作行為。'),quiz('初級員工的例子說明甚麼？',['受到聆聽有助於及早提出問題','所有初級員工都不能發現問題','辦公室的外觀比發言安全更重要','問題越晚說出越容易處理'],'例子比較被聆聽和被否定後的行為。'),quiz('作者如何看待信任？',['它是認真工作的基礎，而非額外奢侈享受','它只是辦公室裝飾的一部分','它可以由任何新機器自動製造','它與及早指出問題沒有關係'],'not...; it is 重訂信任的作用。'),quiz('現代電腦與舒適辦公室有何限制？',['若員工受羞辱或排斥，其價值會受到限制','它們可保證所有管理者公平對待人','它們必然使員工不再需要合作','它們完全不能讓任何日常工作較方便'],'文章承認便利，但指出人際條件會削弱效果。'),quiz('公平職場在資源不完美時可能有何結果？',['員工仍能保持生產力，因其努力受到重視','員工必然完全停止所有工作','只要資源不完美便必須立即關閉機構','管理者可以永遠不改善任何設備'],'even when 不是說設備永不需要更新。')];
const logic=[sequence('尊重如何預防昂貴失誤',[['平等尊重','員工較願意分享和承認錯誤。'],['心理上敢發言','初級員工及早指出問題。'],['問題及早處理','小問題較不易成為重大失誤。']], '範文把尊重連到具體工作行為和風險。'),sequence('設備為何不能取代公平待遇',[['新設備改善工作便利','電腦和辦公室可幫助日常任務。'],['員工仍受羞辱或排斥','人際環境令設備效益受限。'],['投入感下降','員工可能只做最低限度。'],['公平環境形成對照','即使資源欠佳，受重視者仍可投入。']], '比較設備本身的用途與職場文化對人的影響。')];
const t=(context,question,options,explanations,ids,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices:ids,modelLink});
const transfer=[
t('一家機構購買新電腦，但主管公開羞辱提出錯誤的員工。','應先改善甚麼？',['先停止羞辱，讓員工敢發言，設備才有用','先換更快電腦，讓員工有更少時間犯錯','把錯誤貼成公告，便能代替主管私下聆聽','主管先減少提問，員工就較願意報告問題'],['尊重影響是否有人及早提醒問題。','設備速度未處理羞辱所帶來的沉默。','公開公告可能增加畏懼，不能代替安全發言。','減少提問也未建立尊重回報的文化。'],[3,5,7,8],'原文把受尊重與及早指出問題連起來。'),
t('一名新同事發現流程缺陷，卻怕被經理嘲笑而保持沉默。','如何套用文章例子？',['讓員工安心報告問題，可免小缺陷變成大損失','先替換辦公椅，令回報流程顯得更輕鬆','員工沉默可暫避爭執，主管可稍後再追問','缺陷若未造成損失，可先延後記錄與處理'],['對應被否定者可能沉默的例子。','椅子不處理被嘲笑的擔憂。','沉默可讓缺陷擴大。','小問題若不早報可能造成大損失。'],[5,6],'原文的初級員工例子說尊重能促進及早提醒。'),
t('一所學校考慮先翻新教員室，或先處理教師互相排斥的問題。','哪項較符合範文邏輯？',['先改善合作關係，再讓翻新設施發揮作用','先翻新教員室，合作關係自然較易改善','教師互相排斥，宜先增加設備與座位','先改進教員室名稱，暫緩處理合作問題'],['把尊重優先於硬件的邏輯轉到學校。','翻新環境未直接處理排斥。','座位改善不等於合作關係公平。','改名稱也未處理行為。'],[7,8,10],'原文承認設施便利，仍把公平環境列第一。'),
t('一家醫院設備略舊，但團隊能坦誠回報風險並互相支持。','應如何評估？',['工具雖不完美，團隊信任仍可支持穩定表現','設備略舊也有風險，可先忽略團隊的坦誠','團隊互信有用，設備維修便可暫時省略','回報風險可減錯，但未必影響穩定表現'],['對應資源不完美時仍能投入。','坦誠回報是情境中的重要優勢。','互信不取代設備必要的維修。','風險回報正有助穩定表現。'],[3,10],'原文用 even when 表示資源欠佳不必然阻斷表現。'),
t('經理只看工作量，從不聽員工提出的改進建議。','文章會預測甚麼風險？',['員工可能少提想法，早期問題也較難被發現','只看工作量，員工仍可用匿名表單提建議','主管不聽意見，可先升級軟件替代回饋','員工少提想法，可能只是工作表格太多'],['缺聆聽會減少分享與預警。','匿名表單有用，仍需主管願意聽與回應。','軟件不能代替人的建議交流。','表格量未由情境支持。'],[3,5,6],'原文以被否定的初級員工說明沉默的代價。'),
t('公司已買了高價設備，但員工因長期被排斥而只做最低限度。','哪條因果鏈最準確？',['排斥削弱投入感，故好設備仍未帶來積極工作','高價設備較新，員工投入感可留待後期處理','員工被排斥，宜先擴大休息室以免接觸','只做最低限度，主因可先歸於設備使用難度'],['對應設備與情感投入的區別。','設備投入已存在，但參與感仍下降。','擴休息室未解長期排斥。','設備難度不是已知主因。'],[8,9],'原文說有害環境中的員工可能低投入地使用好工具。'),
t('一間公司預算有限，需在改善不公平晉升或購買新辦公桌之間選擇。','依本文應如何排序？',['先處理晉升不公，維持信任與員工留任','先買新桌，舒服環境可間接改善公平感','晉升不公，可先暫緩現有晉升計劃','公平問題可討論，但設備需作唯一優先'],['公平待遇直接影響動力與忠誠。','舒適環境未直接解決晉升制度不公。','取消機會不能建立公平晉升。','只買設備忽略較急切的信任問題。'],[1,2,3,7],'原文將尊重與支持列作僱主的首要責任。'),
t('主管希望員工早些報告生產線的微小失誤。','哪項措施更貼近範文？',['尊重員工回報，避免小失誤累積成大問題','先用燈光提醒錯誤，暫不調整主管的反應','要求員工盡快報告，卻不處理被責罵風險','讓初級員工先私下紀錄，少向團隊提出'],['原文把尊重連到預防重大失誤。','燈光不能使員工安心回報。','責罵風險使員工不願早報。','只私下紀錄未讓團隊及早處理。'],[5,6],'原文由受聆聽的員工例子抽出 prevent...from 原則。'),
t('部門主管承認新工具有用，卻認為團隊間的信任更急需重建。','這種論證屬於哪一種？',['設備有用，但不能彌補團隊信任破裂','設備有用，故信任破裂可先靠新工具處理','團隊信任重要，舊設備可先不維修更新','新工具可以改善流程，卻不必看合作情況'],['對應 certainly useful, but cannot compensate for。','新工具不會自行修復關係。','信任重要不代表設備全無作用。','流程改善仍需合作支持。'],[4,7,11],'原文在第二段承認設施有用但有局限。'),
t('結論須比較團隊文化與辦公室設計，並解釋優先原因。','哪句較能收束全文？',['先建立尊重信任，讓員工投入且願意合作','先換電腦，管理方式可待工作效率變差再查','辦公室設計若改善，尊重可延後處理','團隊文化重要，但可後補與投入的關係'],['同時重申選擇和不可取代的機制。','延後管理檢討可讓沉默與排斥延續。','尊重是團隊投入的前提。','結論須說明優先原因。'],[1,2,10,12],'原文用 far more important, because 收束全文。'),
];
export default {key:'opinion:105',meta:{topic:'僱主應優先建立尊重職場',summary:'範文認為尊重和支持員工更能促進合作、及早發現問題及持續投入；設備有用，但不能彌補有害的職場文化。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer};
