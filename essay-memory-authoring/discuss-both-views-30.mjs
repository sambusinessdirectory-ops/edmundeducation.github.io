// E-books and print: convenience and distribution versus physical reading value.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['discuss-both-views:30'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'As more people read on screens, some think electronic books will one day take the place of paper books, while others think printed books will stay in people’s lives.',
 'This essay considers both ideas, but I strongly think paper books will stay.',
 'People who think printed books will end usually care most about how easy electronic books are to use.',
 'With electronic books, readers can keep hundreds of books on one device, get a new book at once and read in many places without taking heavy books with them.',
 'This helps students, people travelling to work and those who travel often, who may need to look at several books quickly.',
 'Electronic books may also cost less to make and send to readers because companies do not need paper, machines that print, places to keep stock or vans to deliver books.',
 'Seen this way, electronic books look like a better way to read in a busy world, so it makes sense that some people think they will take over from paper books.',
 'But I think paper books will stay because they have good qualities that screens cannot completely copy.',
 'A paper book is more than words on pages; it is also something people can hold, with a feel, a weight and a look that can last a long time.',
 'Reading on paper can feel quieter and help people pay more attention than reading on a screen, especially when they already use phones and computers for many hours.',
 'For example, many parents still choose paper storybooks for their children because turning pages together can feel warmer and stay in their memory longer.',
 'Libraries, people who keep books, bookshops and schools also help paper books remain because they give them a meaning for culture and feelings beyond the information inside.',
 'To sum up, electronic books will keep growing because they are useful, often cheaper and easy to get.',
 'Still, paper books will not disappear.',
 'People will continue to value having the books in their hands, feeling comfortable reading them and the meaning they have in culture.',
];
const vocabulary=[
 v(['rapid growth','As more people','迅速增長'],['digital reading','read on screens','數碼閱讀'],['e-books','electronic books','電子書'],['replace printed books','take the place of paper books','取代紙本書'],['remain part of human life','stay in people’s lives','仍在人們生活中']),
 v(['discuss both views','considers both ideas','討論雙方觀點'],['strongly believe','strongly think','強烈認為'],['will not disappear','will stay','不會消失']),
 v(['predict the end','think printed books will end','預測終結'],['focus on convenience','care most about how easy electronic books are to use','著眼便利']),
 v(['store hundreds of titles','keep hundreds of books','儲存數百本'],['one device','one device','一部裝置'],['download new material instantly','get a new book at once','即時下載'],['heavy volumes','heavy books','沉重書籍']),
 v(['especially useful','helps','尤其有用'],['commuters','people travelling to work','通勤者'],['frequent travellers','those who travel often','常旅行的人'],['quick access','look at several books quickly','快速查閱']),
 v(['cheaper to produce and distribute','cost less to make and send to readers','製作分發較便宜'],['publishers','companies','出版商'],['printing machines','machines that print','印刷機'],['warehouses','places to keep stock','倉庫'],['physical delivery networks','vans to deliver books','實體配送網絡']),
 v(['In this sense','Seen this way','從此角度'],['efficient tool','better way','高效工具'],['fast-moving society','busy world','快速社會'],['understandable','makes sense','可以理解'],['natural successor','take over','自然繼承者']),
 v(['However','But','然而'],['survive','stay','存續'],['qualities','good qualities','特質'],['cannot fully replace','cannot completely copy','無法完全取代']),
 v(['not merely a container for words','more than words on pages','不僅文字載體'],['physical object','something people can hold','實體物件'],['texture','feel','質感'],['appearance','look','外觀'],['sense of permanence','can last a long time','持久感']),
 v(['calmer','quieter','更平靜'],['more focused','pay more attention','更專注'],['screen','screen','螢幕'],['long hours','many hours','長時間']),
 v(['For example','For example','例如'],['physical storybooks','paper storybooks','實體故事書'],['turning pages together','turning pages together','一起翻頁'],['warmer','warmer','更溫暖'],['memorable','stay in their memory longer','難忘']),
 v(['collectors','people who keep books','收藏者'],['keep printed books alive','help paper books remain','使印刷書存續'],['cultural and emotional value','meaning for culture and feelings','文化情感價值'],['beyond simple information','beyond the information inside','超越單純資訊']),
 v(['In conclusion','To sum up','總結'],['continue to grow','keep growing','繼續增長'],['practical','useful','實用'],['affordable','often cheaper','價格較低'],['highly accessible','easy to get','容易取得']),
 v(['Nevertheless','Still','然而'],['paper books','paper books','紙本書'],['vanish','disappear','消失']),
 v(['physical presence','having the books in their hands','實體存在'],['reading comfort','feeling comfortable reading them','閱讀舒適'],['cultural meaning','meaning they have in culture','文化意義'],['place in society','continue to value','社會地位']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'The rapid growth of online classes has led some people to argue that lessons on screens will replace classrooms, while others believe that schools will remain part of human life.',d:[1,2,7],relation:'while 公平呈現兩派對未來的相反預測',formula:'The rapid growth of [新形式] has led some people to argue that [取代預測], while others believe that [舊形式仍存]',meaning:'一方預測電子書取代紙書，另一方認為紙書仍在。',links:['The rapid growth of ', ' has led some people to argue that ', ', while others believe that ', ' will remain part of human life.'],labels:['快速增長的新形式','取代預測','仍存的舊形式']},
 {example:'This essay will discuss both views, but I strongly believe that classrooms will not disappear.',d:[0,2,7],relation:'but 在討論兩派後明確給作者立場',formula:'This essay will discuss both views, but I strongly believe that [不會消失的事物] will not disappear',meaning:'作者討論兩派，但認為紙書不會消失。',links:['This essay will discuss both views, but I strongly believe that ', ' will not disappear.'],labels:['作者認為會留下的事物']},
 {example:'Those who predict the end of city libraries usually focus on convenience.',d:[0,7,12],relation:'先替另一派提出其核心理由',formula:'Those who predict the end of [舊形式] usually focus on convenience',meaning:'電子書支持者主要看重便利。',links:['Those who predict the end of ', ' usually focus on convenience.'],labels:['被預測終結的事物']},
 {example:'Digital files allow pupils to store hundreds of titles on one device, download new material instantly, and read almost anywhere without carrying heavy volumes.',d:[2,7,12],relation:'allow 列儲存下載攜帶三種便利',formula:'[數碼形式] allow [人] to store [大量內容] on one device, download new material instantly, and read almost anywhere without carrying heavy volumes',meaning:'電子書可一機存百本、即時下載、免帶重書。',links:[' allow ', ' to store hundreds of titles on one device, download new material instantly, and read almost anywhere without carrying heavy volumes.'],labels:['數碼形式','使用者']},
 {example:'This is especially useful for teachers, commuters, and frequent travellers, who may need quick access to several texts at once.',d:[2,7,12],relation:'who 解釋不同使用者何時需要快速查閱多文本',formula:'This is especially useful for [三類使用者], who may need quick access to several texts at once',meaning:'學生通勤者旅客可快速取得多本書。',links:['This is especially useful for ', ', commuters, and frequent travellers, who may need quick access to several texts at once.'],labels:['另一受益群體']},
 {example:'Digital lessons can also be cheaper to produce and distribute because publishers do not need paper, printing machines, warehouses, or physical delivery networks.',d:[2,7,12],relation:'because 列數碼形式省去的製作配送成本',formula:'Digital [產品] can be cheaper to produce and distribute because [製作者] do not need [紙張設備倉儲配送]',meaning:'電子書製作分發免紙機器倉庫物流，或較便宜。',links:['Digital ', ' can also be cheaper to produce and distribute because publishers do not need paper, printing machines, warehouses, or physical delivery networks.'],labels:['可數碼分發的產品']},
 {example:'In this sense, online lessons seem like a more efficient tool for a fast-moving society, and it is understandable why some people see them as the natural successor to classrooms.',d:[2,7,12],relation:'In this sense 概括便利成本後對「繼承者」觀點的理解',formula:'In this sense, [新形式] seem like a more efficient tool for a fast-moving society, and it is understandable why some people see them as the natural successor to [舊形式]',meaning:'電子書效率高，因此取代論可理解。',links:['In this sense, ', ' seem like a more efficient tool for a fast-moving society, and it is understandable why some people see them as the natural successor to '],labels:['被視為高效的新形式','被取代的舊形式']},
 {example:'However, I believe classrooms will survive because they offer qualities that digital formats cannot fully replace.',d:[2,3,12],relation:'However 轉作者立場，because 指出不可完全數碼化的特質',formula:'However, I believe [舊形式] will survive because they offer qualities that digital formats cannot fully replace',meaning:'紙書有數碼形式不能完全取代的特質。',links:['However, I believe ', ' will survive because they offer qualities that digital formats cannot fully replace.'],labels:['作者認為會留存的形式']},
 {example:'A family photograph is not merely a container for information; it is also a physical object that many people value for its texture, weight, appearance, and sense of permanence.',d:[2,3,12],relation:'not merely ...; also ... 對照資訊與實體感受',formula:'A [實體物件] is not merely a container for [內容]; it is also a physical object valued for [觸感等]',meaning:'紙書不只是文字，也有質感重量外觀和持久感。',links:['A ', ' is not merely a container for ', '; it is also a physical object that many ', ' value for its texture, weight, appearance, and sense of permanence.'],labels:['實體物件','所承載內容','珍惜它的人']},
 {example:'Reading from paper can feel calmer and more focused than reading from a screen, particularly for pupils who already spend long hours using phones and computers.',d:[2,3,12],relation:'than 比較紙與螢幕，particularly 限定長用螢幕者',formula:'Reading from paper can feel calmer and more focused than reading from a screen, particularly for [長時間用螢幕者]',meaning:'紙閱讀對長用手機電腦者或更平靜專注。',links:['Reading from paper can feel calmer and more focused than reading from a screen, particularly for ', ' who already spend long hours using phones and computers.'],labels:['特別受益的人']},
 {example:'For example, many teachers still prefer physical storybooks for children because turning pages together creates a warmer and more memorable experience.',d:[2,3,12],relation:'because 用親子翻頁例子說紙本有共同體驗',formula:'For example, many [照顧者] still prefer physical storybooks for children because turning pages together creates a warmer and more memorable experience',meaning:'父母與孩子一起翻紙書較溫暖難忘。',links:['For example, many ', ' still prefer physical storybooks for children because turning pages together creates a warmer and more memorable experience.'],labels:['與孩子共讀的人']},
 {example:'Libraries, collectors, bookshops, and schools also help keep local history alive, as they give books cultural and emotional value beyond simple information.',d:[2,3,12],relation:'as 說明機構如何賦予文化情感價值',formula:'[四種機構] also help keep [實體文化] alive, as they give books cultural and emotional value beyond simple information',meaning:'圖書館書店學校等賦紙書超越資訊的價值。',links:['Libraries, collectors, bookshops, and schools also help keep ', ' alive, as they give books cultural and emotional value beyond simple information.'],labels:['被保持的文化形式']},
 {example:'In conclusion, digital lessons will continue to grow because they are practical, affordable, and highly accessible.',d:[2,3,8],relation:'because 結論先承認電子書仍會成長的三因',formula:'In conclusion, [數碼形式] will continue to grow because they are practical, affordable, and highly accessible',meaning:'電子書實用便宜易取，仍會增長。',links:['In conclusion, ', ' will continue to grow because they are practical, affordable, and highly accessible.'],labels:['仍會增長的數碼形式']},
 {example:'Nevertheless, local libraries will not vanish.',d:[2,3,8],relation:'Nevertheless 短句清楚重申紙書不消失',formula:'Nevertheless, [舊形式] will not vanish',meaning:'紙本書不會消失。',links:['Nevertheless, ', ' will not vanish.'],labels:['仍會留下的事物']},
 {example:'Their physical presence, reading comfort, and cultural meaning will continue to protect their place in education.',d:[2,3,8],relation:'三項理由總結實體媒介的持續地位',formula:'Their physical presence, reading comfort, and cultural meaning will continue to protect their place in [領域]',meaning:'實體感舒適感文化意義保護紙書地位。',links:['Their physical presence, reading comfort, and cultural meaning will continue to protect their place in '],labels:['留存的社會領域']},
];
const usage=[
 '當你要在引言以 while 公平列出對同一未來趨勢的兩種相反預測時。',
 '當你要先說會討論兩派，再用 but 清楚表達自己的判斷時。',
 '當你要先替某派指出他們最重視的一項實際優勢時。',
 '當你要列出一項新技術在儲存、取得和攜帶上的多個便利時。',
 '當你要用 who 解釋某些使用者為何特別需要快速查閱內容時。',
 '當你要用 because 說明數碼分發因省去哪些成本而可能便宜時。',
 '當你已提出多項優勢，要概括為何對方的預測可以理解時。',
 '當你要由另一派轉到自己認同的一派，並給出不可替代的理由時。',
 '當你要用 not merely ...; also ... 區分內容價值與實體體驗時。',
 '當你要以 than 比較兩種媒介的使用感受，再限定特別受益的人時。',
 '當你要用共同使用的具體例子說明實體媒介的情感體驗時。',
 '當你要用 as 說明機構如何延續某種形式的文化與情感價值時。',
 '當結論要先承認自己不支持的一方仍有持續增長理由時。',
 '當你要用 Nevertheless 簡短重申自己的核心預測時。',
 '當你要在末句列出三個相互不同的留存理由時。',
];
const structures=specs.map((s,i)=>({example:s.example,distractors:s.d,frame:frame(i,s.formula,s.meaning,usage[i],s.links,s.labels),answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}));
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先還原電子書取代論，再還原紙書留存論。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[quiz('作者對「電子書最終取代紙本書」的看法是甚麼？',['電子書會增長，但紙本書不會消失。','電子書一定在明天消失。','紙本書必然完全取代所有螢幕。','作者完全不談紙本書。'],'作者承認電子書優勢，仍認為紙書留存。'),{type:'multi',prompt:'兩派各重視甚麼？',detail:'選兩項，再按「確認」。',options:['電子書的方便與較低分發成本。','紙書的實體、閱讀及文化價值。','電子書保證每位讀者更專注。','紙書只能用來存放圖片。'],correct:[0,1],why:'兩派理由屬不同價值維度。'}];
const route=[sequence('還原四段討論',[['引言','一派預測取代，一派認為紙書留存；作者支持後者。'],['電子書論','一機多書、即時下載、攜帶方便，出版成本或較低。'],['紙書論','實體感、較平靜的閱讀、親子共讀及文化機構支持。'],['結論','承認電子書增長，仍認紙書具持續地位。']],'討論雙方時先把各派理由說完整。')];
const evidence=[quiz('電子書方便在哪裏？',['可一機存多本、即時下載且免攜重書。','每本電子書都必須用貨車配送。','只能在同一地點閱讀。','每次只能打開一頁紙。'],'原文有三項便利。'),quiz('電子書為何可能較便宜製作及分發？',['出版商可能不用紙、印刷機、倉庫和實體配送。','因電子書必然完全不用人製作。','因所有紙本書都沒有倉儲成本。','因讀者必須購買更多貨車。'],'成本差異來自省去實體流程。'),quiz('紙書不只承載文字，還有甚麼？',['質感、重量、外觀與持久感等實體價值。','只剩下螢幕亮度。','沒有任何可以拿在手中的部分。','每本書都只能被使用一次。'],'not merely ...; also ... 對照資訊與物件。'),quiz('親子共讀紙本故事書的例子說明甚麼？',['一起翻頁可提供較溫暖且難忘的體驗。','父母必然完全不會使用螢幕。','翻頁會令所有人立刻忘記故事。','電子書必然不能被孩子觀看。'],'例子支持實體媒介的情感面。'),quiz('圖書館和書店等如何支持紙書？',['賦予超越單純資訊的文化與情感價值。','保證所有電子書永遠無人使用。','只因它們沒有任何讀者。','使紙書不再具有實體外觀。'],'機構延續紙書作為文化物件。')];
const logic=[sequence('電子書取代論',[['使用便利','一機多書、即時取得、免攜重書。'],['受益者','學生、通勤者和常旅行者。'],['供應成本','省紙張印刷倉儲與配送。'],['對方推論','電子書似是更高效繼承者。']],'承認此推論可理解，不等於接受紙書會消失。'),sequence('紙書留存論',[['實體價值','質感重量外觀及持久感。'],['閱讀體驗','部分讀者較平靜專注。'],['情感與文化','親子共讀及圖書館書店學校支持。'],['作者判斷','紙書不會消失。']],'三條留存理由應各自具體。')];
const transfers=[
 transfer('通勤者每天要查幾本參考書，不想背重書。','哪句對應電子書的優勢？',['一部裝置可儲存多本書並快速取得內容，方便移動中的讀者。','通勤者必須帶上整個倉庫才能使用電子書。','電子書不能在交通工具上打開。','紙書與電子書重量必然完全相同。'],['儲存與攜帶便利。','過度。','不符。','媒介不同。'],[3,4],'store hundreds / read anywhere。'),
 transfer('出版社改為發行電子書。','哪句說清可能節省的成本？',['數碼分發或減少紙張、印刷、倉儲與實體配送需要。','電子書必然完全不需編輯或製作。','紙本出版不需要印刷機。','所有數碼書必然免費。'],['可省特定實體流程，保留 may。','仍有製作。','需要。','不必免費。'],[5],'paper/printing/warehouse/delivery。'),
 transfer('一位讀者長時間使用電腦，晚上選紙書閱讀。','哪句符合紙書論證？',['紙本閱讀對她可能較平靜且較易專注。','所有人看紙書都保證沒有分心。','紙書只能供完全不使用手機的人看。','紙本閱讀與螢幕時間完全無關。'],['particularly 限定長用螢幕者。','無保證。','不限。','有關。'],[9],'calmer and more focused。'),
 transfer('家長與孩子一起翻紙本故事書。','哪句準確連到情感價值？',['共同翻頁可使閱讀更溫暖、更容易留下記憶。','只要翻頁，孩子必然立即認識所有字。','紙書不可能讓兩人一起閱讀。','親子共讀只與出版成本有關。'],['具體共同體驗→情感價值。','過度。','可共讀。','體驗不同於成本。'],[10],'turning pages together。'),
 transfer('有人說「電子書方便，所以紙書必定消失」。','哪句指出推論缺口？',['方便不等於完全取代；紙書仍有實體、舒適與文化上的價值。','電子書方便便證明任何實體體驗都毫無價值。','紙書只能靠政府禁用電子書才留存。','只要紙書仍在，電子書必然停止增長。'],['兩種媒介可各有價值。','忽略紙書理由。','原文無禁令。','作者承認增長。'],[7,8,9,14],'qualities digital cannot fully replace。'),
 transfer('另一題討論網上展覽是否取代實體博物館。','哪句能轉用本文框架？',['可比較數碼取得便利與現場實體體驗及文化機構價值。','電子書有用便保證所有博物館立刻關閉。','只比較建築油漆顏色。','實體觀看與數碼觀看沒有任何可比較之處。'],['便利與實體體驗可跨題分析。','新題仍須證。','不相關。','可比。'],[3,8,9,11],'數碼便利 vs 實體情感文化。'),
 transfer('作文只寫「紙書有價值」，沒有說是甚麼價值。','哪句補足？',['可說明可觸摸的質感、閱讀舒適及由圖書館維繫的文化意義。','紙書有價值，因為紙書有價值。','只重複書本有頁碼。','把所有紙書價值說成網速。'],['三項不同、可解釋的價值。','循環。','不足。','錯置媒介。'],[8,9,11,14],'physical/comfort/cultural。'),
 transfer('學生同時要查五份文本。','哪句有適當限定？',['電子書可方便快速查閱多份文本，特別適合需要經常移動的學生。','所有學生都必須永久放棄紙本書。','查五份文本必然令任何學生考試滿分。','電子書一部裝置永遠只能存一份文本。'],['useful for students needing quick access。','過度。','無保證。','原文相反。'],[3,4],'quick access to several texts。'),
 transfer('一篇討論雙方的作文把反方寫成「只想摧毀紙書」。','哪句更公平？',['反方看重電子書的便利和較低供應成本，因而預測它會成為自然繼承者。','反方沒有任何可以理解的理由。','只有作者立場需要理由。','電子書完全不能儲存多本書。'],['先準確重述對方的最強理由。','不公平。','雙方都需理由。','事實相反。'],[2,3,5,6],'understandable why some see natural successor。'),
 transfer('結論要承認電子書發展，但保留紙書地位。','哪句最完整？',['電子書因實用便宜易取而增長；紙書仍靠實體、舒適和文化價值留存。','電子書會增長，所以紙書必然立刻消失。','紙書留下，所以電子書不可能有任何優勢。','只說兩者都叫書，不作判斷。'],['承認對方優勢並重申作者理由。','推論過強。','忽略優勢。','缺結論。'],[12,13,14],'結論兩派各自收束。'),
];
// Final four-choice sets keep the answer visually indistinguishable by Han count.
const balancedTransferOptions=[
 ['一部裝置能存多本書，通勤者可隨時查閱又免帶重書。','通勤者應只帶一本紙書，因電子書無法儲存多份文本。','電子書方便只因封面較輕，與下載或儲存內容沒有關係。','即使要查多份資料，通勤者仍須攜帶所有印刷書本。'],
 ['數碼分發可能省紙張、印刷、倉儲及實體配送成本。','電子書較便宜只因作者不需寫作，與出版流程無關。','紙本出版沒有倉儲或配送成本，因此與數碼版無差別。','數碼書必須使用更多紙張和貨車，因此通常較難分發。'],
 ['長用電腦的讀者，讀紙書時或感到較平靜和專注。','長用電腦的讀者必須只看螢幕，紙書會使他們失去專注。','紙書能讓所有人永不分心，不論他們原有閱讀習慣。','紙書與螢幕的感受一定相同，使用時間也不影響選擇。'],
 ['一起翻頁可讓親子閱讀更溫暖，也更容易留下共同記憶。','翻頁的作用只在加快讀完故事，與親子互動沒有關係。','孩子若與父母同看紙書，便必然立即學會書中每個字。','紙本故事書只能獨自閱讀，兩人同看反而不可能理解。'],
 ['方便不等於取代；紙書仍有實體、舒適及文化價值。','只要電子書易下載，紙書的實體感便必然失去意義。','紙書要存續，只能先讓電子書完全停止發展和銷售。','紙書仍有人買，便足以證明電子書完全沒有任何優點。'],
 ['可比較數碼取得便利與現場體驗、文化機構的價值。','網上展覽較便利，便可直接證明所有博物館應關閉。','實體展覽有文化價值，便可推定網上觀看毫無用處。','只比較兩者票價，無須討論參觀者實際如何體驗。'],
 ['可談質感、閱讀舒適，以及圖書館維繫的文化意義。','可只重複紙書有價值，毋須指出任何具體價值來源。','可把紙書價值全說成下載速度，而不分析閱讀體驗。','可只列印刷年份，便當作已完整解釋紙書所有價值。'],
 ['電子書可讓需要移動的學生快速查閱多份參考文本。','電子書只能儲存一份文本，學生仍要帶上其餘紙本書。','學生查到五份資料，便可推定他們全都不再讀紙書。','只要查閱速度較快，任何學生便一定考試成績滿分。'],
 ['對方重視便利與較低供應成本，因此預測電子書取代紙書。','對方只有想毀掉紙書的意圖，無須解釋其實際理由。','對方認為電子書成本必然較高，所以會很快完全消失。','對方只談書本的外觀，從未提到儲存或下載的便利。'],
 ['電子書因實用易取而增長，紙書仍靠實體與文化價值留存。','電子書仍會增長，因此紙書在任何地方都必定立即消失。','紙書仍有文化價值，因此電子書必然不再有讀者使用。','兩者都可閱讀文字，所以不用比較它們各自的不同價值。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options;});
export default {key:'discuss-both-views:30',meta:{topic:'電子書會否取代紙本書',summary:'文章公平呈現電子書便利及低分發成本的取代論，然後以紙書實體感、較平靜閱讀、親子共讀與文化機構支持紙書留存，結論承認電子書仍會增長。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};
