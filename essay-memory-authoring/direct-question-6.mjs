// Human-authored support for Direct Question 6; source text remains in the canonical bundle.
import fs from 'node:fs';
import vm from 'node:vm';
const sourceContext={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-6-ielts-direct-question.js',import.meta.url),'utf8'),sourceContext);
const source=sourceContext.window.ESSAY_MEMORY_LESSONS['direct-question:6'];
const original=source.sentences.map(row=>row.english);

const simple=[
  'Many people think a business is successful if the company or its owner makes a lot of money.',
  'But money does not truly show success, because a company can earn a lot while it has serious problems, treats people badly, or grows in a way it cannot keep up.',
  'We should instead ask whether a business helps customers, workers and society for a long time.',
  'The problem with judging a business only by money is that the numbers can give a false picture.',
  'A company can earn a lot by doing work badly, paying workers too little, or pushing poor products on customers.',
  'On paper, it may look successful, but it is like a house built on sand: its base is weak.',
  'If customers stop trusting it, workers leave, and people think the brand is dishonest, the money it earns now will mean little.',
  'Money shows that the business earns something, but it does not show that it is strong, respected, or likely to last.',
  'There are better ways to see if a business is doing well.',
  'One is whether customers come back, because repeat purchases and people speaking well of the company show that they value what it offers.',
  'Another is whether workers stay with the company.',
  'A business whose workers feel treated fairly is more likely to keep making good products, finding new ideas, and working well as a team.',
  'We can also ask whether a business can last: can it change with the market without harming nature or taking advantage of people with less power?',
  'For example, a small local company that pays fairly, keeps customers, and acts responsibly may be doing better than a bigger company that earns more money but loses people’s trust just as fast.',
  'To sum up, money does not truly show whether a business is successful.',
  'It tells us only how its finances look at first glance.',
  'Real success should be judged by whether people trust the business, whether it can last, whether it acts fairly, and whether it keeps helping people.',
];
const vocabulary=[
  [['equate business success with','think a business is successful if','把商業成功等同於'],['entrepreneur','owner','企業家'],['the amount of money','a lot of money','賺取的金錢數量']],
  [['true indicator of success','truly show success','真正的成功指標'],['hide weak foundations','has serious problems','掩蓋薄弱基礎'],['poor ethics','treats people badly','不良操守'],['unstable growth','grows in a way it cannot keep up','不穩定增長']],
  [['should instead be judged by whether','should instead ask whether','應改用是否'],['creates lasting value','helps','創造持久價值'],['workers and society','workers and society','員工和社會']],
  [['the only measure','only by money','唯一衡量標準'],['financial results','the numbers','財務結果'],['misleading','give a false picture','具有誤導性']],
  [['make large profits','earn a lot','賺取龐大利潤'],['cutting corners','doing work badly','偷工減料'],['underpaying staff','paying workers too little','低薪對待員工'],['selling low-quality products aggressively','pushing poor products on customers','強推低質素產品']],
  [['On paper','On paper','表面上'],['in reality','but','實際上卻'],['building a house on sand','like a house built on sand: its base is weak','根基像建在沙上的房子']],
  [['customers eventually lose trust','customers stop trusting it','顧客最終失去信任'],['employees leave','workers leave','員工離職'],['associated with dishonesty','people think the brand is dishonest','品牌與不誠實連結'],['short-term income means very little','money it earns now will mean little','短期收入意義不大']],
  [['In this sense','Money shows','從這角度看'],['is earning','earns something','正在賺錢'],['healthy','strong','健康穩固'],['likely to survive','likely to last','可能長久生存']],
  [['several better ways','better ways','幾種更好方法'],['measure business success','see if a business is doing well','衡量商業成功']],
  [['One key measure','One','一項關鍵標準'],['customer loyalty','whether customers come back','顧客忠誠'],['repeated purchases','repeat purchases','重複購買'],['positive word of mouth','people speaking well of the company','正面口碑'],['genuinely value','value','真正重視']],
  [['Another important measure','Another','另一項標準'],['employee retention','whether workers stay with the company','員工留任']],
  [['staff feel fairly treated','workers feel treated fairly','員工覺得受公平對待'],['maintain quality','keep making good products','維持品質'],['innovation','finding new ideas','創新'],['strong internal culture','working well as a team','強大的內部文化']],
  [['long-term sustainability','whether a business can last','長期可持續'],['adapts to changing markets','change with the market','適應變化市場'],['damaging the environment','harming nature','破壞環境'],['exploiting vulnerable people','taking advantage of people with less power','剝削弱勢群體']],
  [['modest local company','small local company','規模不大的本地公司'],['pays fair wages','pays fairly','支付公平薪酬'],['operates responsibly','acts responsibly','負責任經營'],['burns trust','loses people’s trust just as fast','迅速消耗信任']],
  [['In conclusion','To sum up','總結來說'],['true indicator of business success','truly show whether a business is successful','商業成功的真正指標']],
  [['surface-level sign','at first glance','表層跡象'],['financial performance','how its finances look','財務表現']],
  [['Real success','Real success','真正成功'],['measured by','judged by','衡量'],['trust','people trust the business','信任'],['stability','it can last','穩定性'],['ethical conduct','it acts fairly','道德操守'],['create value that lasts','keeps helping people','創造持久價值']],
];
const chunkOverrides=[
  ['Many people equate business success','with the amount of money','a company or entrepreneur earns.'],
  ['However, money is not a true indicator of success,','because it can hide weak foundations,','poor ethics and unstable growth.'],
  ['A business should instead be judged by whether','it creates lasting value for customers, workers and society.'],
  ['The main problem with using money as the only measure','is that financial results can be misleading.'],
  ['A company may make large profits','by cutting corners, underpaying staff','or selling low-quality products aggressively.'],
  ['On paper, such a business may look successful;','in reality, it is building a house on sand.'],
  ['If customers eventually lose trust, employees leave','and the brand becomes associated with dishonesty,','its short-term income means very little.'],
  ['In this sense, money shows that a business is earning,','but it does not prove that the business is healthy,','respected or likely to survive.'],
  ['There are several better ways','to measure business success.'],
  ['One key measure is customer loyalty,','because repeated purchases and positive word of mouth show','that people genuinely value what the company provides.'],
  ['Another important measure','is employee retention.'],
  ['A business whose staff feel fairly treated','is more likely to maintain quality, innovation','and strong internal culture.'],
  ['Success can also be judged by long-term sustainability,','such as whether the company adapts to changing markets','without damaging the environment or exploiting vulnerable people.'],
  ['For example, a modest local company that pays fair wages,','keeps loyal customers and operates responsibly','may be more successful than a larger firm','that earns more money but burns trust as quickly as','it generates revenue.'],
  ['In conclusion, money is not','a true indicator of business success.'],
  ['It is only a surface-level sign','of financial performance.'],
  ['Real success should be measured by trust, stability,','ethical conduct and the ability to create value that lasts.'],
];
const simpleChunkOverrides=[
  ['Many people think a business is successful','if the company or its owner makes a lot of money.'],
  ['But money does not truly show success,','because a company can earn a lot','while it has serious problems, treats people badly,','or grows in a way it cannot keep up.'],
  ['We should instead ask whether a business','helps customers, workers and society for a long time.'],
  ['The problem with judging a business only by money','is that the numbers can give a false picture.'],
  ['A company can earn a lot','by doing work badly, paying workers too little,','or pushing poor products on customers.'],
  ['On paper, it may look successful,','but it is like a house built on sand:','its base is weak.'],
  ['If customers stop trusting it, workers leave,','and people think the brand is dishonest,','the money it earns now will mean little.'],
  ['Money shows that the business earns something,','but it does not show that it is strong,','respected, or likely to last.'],
  ['There are better ways','to see if a business is doing well.'],
  ['One is whether customers come back,','because repeat purchases and people speaking well of the company','show that they value what it offers.'],
  ['Another is whether workers','stay with the company.'],
  ['A business whose workers feel treated fairly','is more likely to keep making good products,','finding new ideas, and working well as a team.'],
  ['We can also ask whether a business can last:','can it change with the market','without harming nature or taking advantage of people with less power?'],
  ['For example, a small local company that pays fairly,','keeps customers, and acts responsibly','may be doing better than a bigger company','that earns more money but loses people’s trust just as fast.'],
  ['To sum up, money does not truly show','whether a business is successful.'],
  ['It tells us only how its finances look','at first glance.'],
  ['Real success should be judged by whether people trust the business,','whether it can last, whether it acts fairly,','and whether it keeps helping people.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){
  const text=original[i],parts=[];
  let cursor=0,slot=0;
  for(const link of links){
    const at=text.indexOf(link,cursor);
    if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);
    if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));
    parts.push(part(link,'link','句型固定部分'));
    cursor=at+link.length;
  }
  if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));
  return {formula,meaning,usage,parts};
}
function card(example,functionName,distractors,frame){
  return {example,distractors,frame,patternType:'reviewed',
    answerReason:`這句${functionName}，與原句的句型和語意關係相同。`,
    distractorReason:`這句${functionName}；它表達的是另一種關係。`};
}

const structures=[
  card('Many people equate a school’s success with its exam results.','用 equate ... with 指出人們把一種成果等同於單一指標',[3,8,14],
    fixed(0,'Many people equate [成果] with [單一指標].','交代一種常見的等同看法，為後文檢查這個指標是否充分鋪路。','要先呈現某些人如何用一個數字或結果定義整體成功時。',['Many people equate ', ' with '],['被判斷的成果','被當成等同成果的指標'])),
  card('However, attendance is not a true indicator of learning, because pupils may be present but disengaged.','用 not a true indicator ... because 反駁單一指標並立即說明不足之處',[0,4,9],
    fixed(1,'However, [表面指標] is not a true indicator of [真正成果], because [它會掩蓋的問題].','轉折後否定單一指標足以代表成功，because 交代它可能掩蓋甚麼。','要指出一個看似明確的數字為何不足以證明實際成果時。',['However, ', ' is not a true indicator of ', ', because '],['表面指標','真正成果','指標可能掩蓋的問題'])),
  card('A hospital should instead be judged by whether patients receive safe and effective care.','用 should instead be judged by whether 提出替代的評價標準',[3,6,10],
    fixed(2,'[機構] should instead be judged by whether [真正應達成的成果].','把評價由單一財務數字轉向受益者是否得到持久而實際的好處。','已否定一個不足的標準，接着要提出更切合目的的判準時。',[' should instead be judged by whether '],['被評價的機構','真正應達成的成果'])),
  card('The main problem with using exam scores as the only measure is that they can hide weak understanding.','用 The main problem with using ... as the only measure is that 說明單因衡量的核心缺陷',[0,7,12],
    fixed(3,'The main problem with using [單一指標] as the only measure is that [核心缺陷].','明確指出只採用一個標準的問題，並說明它如何讓判斷失真。','要解釋一個指標為何不應成為唯一標準時。',['The main problem with using ', ' as the only measure is that '],['被過度依賴的指標','核心缺陷'])),
  card('A school may raise average scores by excluding weaker pupils.','用 may ... by 說明表面成績可以靠有害方法取得',[2,5,13],
    fixed(4,'[機構] may [漂亮的表面成果] by [有害的取得方法].','指出某項好看的結果也可能由傷害其他人的做法製造出來。','要證明結果數字本身不足以判斷做法是否值得肯定時。',[' may ', ' by '],['採取行動的機構','表面成果','有害的取得方法'])),
  card('On paper, the team may look strong; in reality, it relies on one injured player.','用 On paper ...; in reality 對比報表外觀與實際基礎',[3,6,14],
    fixed(5,'On paper, [表面評價]; in reality, [真實而脆弱的情況].','前半句說外界從數字或報表看到的情況，後半句指出被掩蓋的現實。','要用簡短對照揭示表面成功可能建立在不穩固基礎上時。',['On paper, ', '; in reality, '],['表面評價','被掩蓋的實際情況'])),
  card('If members stop trusting a charity and volunteers leave, its recent fundraising total means very little.','用 If 列出信任流失等後果，再降低短期收入的意義',[1,4,13],
    (()=>{const t=original[6],a=t.indexOf(', its short-term income');return {formula:'If [信任與關係受損], [短期收入] means very little.','meaning':'先設想顧客、員工或聲譽受損的情況，再指出眼前收入因此不足以代表成功。','usage':'要說明短期收入為何無法抵銷信任、人才或聲譽的長期流失時。',parts:[part('If ','link','條件連接詞'),part(t.slice(3,a),'slot','信任與關係受損'),part(', ','link','主句分界'),part('its short-term income','slot','短期收入'),part(' means very little.','link','結果判斷')]};})()),
  card('In this sense, a high rating shows that a clinic is popular, but it does not prove that its care is safe.','用 shows ... but does not prove 區分數字可顯示與不能證明的事',[0,9,14],
    fixed(7,'In this sense, [指標] shows that [可直接觀察的事], but it does not prove that [更深層的品質].','先承認指標能顯示的事實，再限制它對健康、品質或持續性的證明力。','要公允評價一個指標，區分它能證明甚麼與不能證明甚麼時。',['In this sense, ', ' shows that ', ', but it does not prove that '],['被評估的指標','它能顯示的事','它不能證明的深層品質'])),
  card('There are several better ways to measure school progress.','用 There are several better ways to measure 引出一組替代評價方法',[2,10,16],
    fixed(8,'There are several better ways to measure [被評估的成果].','由批評舊指標轉入後文將提出的多項新標準。','已說明現行方法不足，下一段要開始列出替代衡量方式時。',['There are several better ways to measure '],['被評估的成果'])),
  card('One key measure is student confidence, because steady participation and questions show that pupils feel able to learn.','用 One key measure ... because 推出第一項標準及可觀察證據',[3,11,12],
    fixed(9,'One key measure is [第一項標準], because [可觀察證據] show that [它反映的價值].','先點名一項衡量標準，再用可見行為說明它為何有意義。','要提出替代標準，並立即用具體證據支持它時。',['One key measure is ', ', because ', ' show that '],['第一項標準','可觀察證據','證據所反映的價值'])),
  card('Another important measure is how many teachers remain at the school.','用 Another important measure is 加入另一項評價標準',[8,9,13],
    fixed(10,'Another important measure is [另一項標準].','在已提出一個標準後，明確加入另一個值得檢查的方面。','要由第一項替代標準，順序轉到另一項時。',['Another important measure is '],['另一項評價標準'])),
  card('A team whose players feel respected is more likely to keep improving.','用 whose ... is more likely to 連接內部待遇與持續表現',[4,9,13],
    fixed(11,'[機構] whose [成員感受] is more likely to [持續成果].','指出一個組織如何對待內部成員，會影響它能否維持品質或改善。','要說明員工、學生或隊員的感受為何也是成功的一部分時。',[' whose ', ' is more likely to '],['被評估的機構','內部成員的感受','較可能出現的持續成果'])),
  card('Success can also be judged by long-term safety, such as whether a building remains sound after storms.','用 can also be judged by ... such as whether 提出長期標準並具體化',[2,10,16],
    fixed(12,'Success can also be judged by [長期標準], such as whether [具體檢查問題].','先提出一個較大的長期標準，再用 such as whether 把它變成可檢查問題。','要把抽象的可持續或負責任經營轉成具體評估條件時。',['Success can also be judged by ', ', such as whether '],['長期評價標準','可檢查的具體問題'])),
  card('For example, a small clinic that treats patients carefully may be more successful than a large hospital that earns more but loses trust.','用 may be more successful than 比較規模與收入不同的兩種機構',[4,11,16],
    fixed(13,'For example, [規模較小但負責任的組織] may be more successful than [規模較大但失信的組織].','用對比例子證明收入或規模較大，不必然代表整體更成功。','已提出信任、待遇等標準，想用兩個機構的對照測試它們時。',['For example, ', ' may be more successful than '],['較小而負責任的組織','收入更高但失信的組織'])),
  card('In conclusion, a high follower count is not a true indicator of a charity’s impact.','用 In conclusion ... is not a true indicator 重申對單一數字的否定答案',[0,9,15],
    fixed(14,'In conclusion, [單一數字] is not a true indicator of [真正成果].','結尾直接回應題目，重申一個表面數字不足以代表整體成功。','要在結論簡短重申對「某數字是否真正指標」的回答時。',['In conclusion, ', ' is not a true indicator of '],['單一數字','真正成果'])),
  card('A high view count may look impressive. It is only a surface-level sign of attention.','用 only a surface-level sign of 界定一項數字只能顯示表層情況',[1,7,14],
    fixed(15,'It is only a surface-level sign of [可見表現].','承認指標可見，但清楚說它只能顯示一個較窄的層面。','要避免把財務或流量數字誤當成品質、信任或長期價值時。',['It is only a surface-level sign of '],['可見但有限的表現'])),
  card('Real progress should be measured by safety, learning and lasting improvement.','用 Real ... should be measured by 概括真正值得重視的多項標準',[3,6,14],
    fixed(16,'Real [成果] should be measured by [多項持久標準].','結尾把評價焦點從單一數字，轉到能反映信任、責任和長久成果的一組準則。','要以一個明確的多因素標準收束全文時。',['Real ', ' should be measured by '],['真正要評估的成果','多項持久標準'])),
];
const wrongReasons=[
  ['The main problem 說明單一指標的缺陷，沒有介紹人們如何把兩件事等同。','There are several better ways 轉入替代方法，沒有呈現原來的等同看法。','結論直接否定單一指標，沒有先描述常見的等同說法。'],
  ['equate ... with 描述常見看法，沒有用 because 說數字會掩蓋甚麼問題。','may ... by 說表面結果如何由有害做法取得，沒有直接否定指標的證明力。','One key measure 介紹替代標準，沒有反駁舊指標並交代原因。'],
  ['The main problem 解釋舊標準的缺陷，沒有提出應以是否達成成果作判準。','If ... means very little 以負面情況削弱短期收入意義，沒有直接提出替代標準。','Another important measure 加入第二個指標，沒有以 whether 訂出整體評價方向。'],
  ['equate ... with 描述人們把成果等同數字，沒有分析只用它的核心問題。','shows ... does not prove 公允界定數字的證明力，沒有指出「唯一標準」的缺陷。','such as whether 具體化一項長期標準，沒有批評舊標準獨用。'],
  ['should instead be judged by whether 提替代評價準則，沒有說好看成果如何靠有害做法產生。','On paper ... in reality 比較表面和真實，沒有 by 交代取得成果的方法。','may be more successful than 比較兩個組織，沒有單一組織用不良方式取得利潤。'],
  ['The main problem 分析衡量缺陷，沒有「報表上」與「現實中」的直接對照。','If ... means very little 設想信任流失的後果，沒有同一句的表面與現實對比。','結論否定金錢指標，沒有用分號揭開被表象掩蓋的基礎。'],
  ['not a true indicator ... because 解釋指標會掩蓋問題，沒有先設信任流失後的局面。','may ... by 交代獲利方法，沒有說關係受損時短期收入意義有限。','may be more successful than 比較兩個機構，沒有 If 的條件和短期收入結果。'],
  ['equate ... with 只說人們如何看待指標，沒有區分它能與不能證明的事。','One key measure 提出替代標準，沒有公允限定現有數字的作用。','In conclusion 直接否定指標，沒有承認它仍能顯示眼前收入。'],
  ['should instead be judged by whether 提一個較好方向，沒有明說接下來有幾種方法。','Another important measure 只加入一項，沒有作為新段落的總引。','Real ... measured by 在結尾概括準則，沒有開始列舉的開場作用。'],
  ['The main problem 說單一指標有誤導性，沒有提出第一項新標準及證據。','whose ... is more likely to 說待遇帶來的成果，沒有 One key measure 的衡量框架。','such as whether 把長期標準具體化，沒有 because 後的可觀察證據。'],
  ['There are several better ways 總引多項方法，沒有單獨標出另一項。','One key measure 點名第一項並解釋原因，沒有另一項的順序轉換。','For example 比較兩個機構，沒有提出獨立的第二衡量標準。'],
  ['may ... by 交代表面收入的有害取得方式，沒有內部待遇如何影響表現。','One key measure 提出顧客等標準與證據，沒有 whose 所連的成員感受。','For example 比較兩家機構，沒有由成員待遇推到持續品質。'],
  ['should instead be judged by whether 提總體替代方向，沒有 long-term 標準及 such as 的例子。','Another important measure 單獨加入一項，沒有把長期標準轉成檢查問題。','Real ... measured by 結尾總結多因素，沒有在段內用 such as whether 展開。'],
  ['may ... by 說一家公司如何取得表面成果，沒有把兩家機構放在同一比較。','whose ... more likely to 說內部待遇與成果，沒有較小與較大機構的對照。','Real ... measured by 概括評價準則，沒有用例子比較實際機構。'],
  ['equate ... with 呈現常見等同看法，沒有在結尾明確否定它。','One key measure 介紹新標準，沒有重申對單一數字的否定答案。','surface-level sign 進一步界定數字所顯示的範圍，沒有直接回答它是否真正指標。'],
  ['However ... because 反駁單一指標並提出原因，沒有把它界定為只顯示表面。','shows ... but does not prove 說可顯示與不能證明的兩層，不只是 surface-level 的單句界定。','In conclusion 直接重申否定答案，沒有解釋數字仍能反映哪個有限層面。'],
  ['The main problem 批評只用一個數字，沒有列出真正成果應由甚麼衡量。','If ... means very little 設想信任流失，沒有在結尾歸納一組長久標準。','In conclusion 否定舊指標，沒有提出取代它的完整準則。'],
];
structures.forEach((row,index)=>{row.wrongReasons=wrongReasons[index];});

const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先想每一步如何接上前一步，再依原文次序選卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求範文回答哪兩個問題？',[
    '收入是否真正代表商業成功，以及還可用甚麼標準衡量成功',
    '如何令所有公司收入相同，以及誰應決定員工的工資',
    '企業家是否必須創辦大公司，以及如何製作銷售廣告',
    '哪些產品最容易賣出，以及顧客應否只看商品價格',
  ],'第一問要評估金錢作成功指標是否充分；第二問要提出其他具體衡量方式。'),
  {type:'multi',prompt:'選出兩段主體的正確分工',detail:'選兩項，再按「確認」。',options:[
    '高利潤可能掩蓋傷害員工或顧客的做法，因此不保證企業穩健',
    '顧客回購、員工留任和長期負責任經營可補足財務數字',
    '只要短期收入增加，顧客信任和品牌聲譽便不可能下降',
    '公司規模越大便必然越成功，不必看它如何賺取收入',
  ],correct:[0,1],why:'第一段質疑只用收入；第二段提出顧客、員工與長期可持續性等替代標準。'},
];
const route=[sequence('依照原文次序排好四段的任務',[
  ['引言回答','先指出把成功等同收入的常見看法，再否定金錢是真正且充分的指標。'],
  ['說明收入的局限','利潤可由低品質、低薪等做法取得；失去信任後短期收入意義有限。'],
  ['提出替代準則','依次說顧客忠誠、員工留任及長期可持續性，並用兩家企業作比較。'],
  ['結論','把金錢界定為表面財務訊號，以信任、穩定、操守和持久價值收束。'],
],'先否定單一金錢標準 → 說明它可誤導 → 提出三類較深的準則 → 結尾回題。')];
const evidence=[
  quiz('公司為何可能有高利潤，卻仍未必真正成功？',[
    '它可能靠偷工減料、低薪或強推低質素產品取得收入',
    '所有高利潤公司都必然沒有任何顧客或員工',
    '有高利潤便證明企業從未採取任何有害做法',
    '財務數字永遠無法記錄公司是否真的有收入',
  ],'原文並不說高利潤必然不道德，而是指出數字可能由有害做法取得。'),
  quiz('「沙上建屋」的比喻要說明甚麼？',[
    '生意表面賺錢，但信任、待遇或產品品質等基礎不穩',
    '所有成功企業都必須把總部建在沙灘旁邊',
    '只要報表好看，企業的實際基礎便必然穩固',
    '品牌聲譽只由辦公室的建築材料決定',
  ],'比喻對照報表外觀與真實基礎；不是談建築地點。'),
  quiz('顧客忠誠度為何比單次收入更能說明價值？',[
    '重複購買和正面口碑顯示人們持續重視公司提供的東西',
    '顧客只要購買一次，便證明公司可永久維持品質',
    '正面口碑只由廣告費決定，與顧客經驗完全無關',
    '顧客回購會直接證明公司從未犯過任何錯誤',
  ],'回購與推薦是可觀察的持續選擇，原文以此支持「真正有價值」。'),
  quiz('員工留任與企業成功之間，原文提出甚麼連結？',[
    '感到受公平對待的員工較可能維持品質、創新和內部文化',
    '只要員工留任，企業便毋須再檢查品質或創新',
    '員工待遇不會影響工作，所以留任率沒有任何意義',
    '企業應阻止員工離職，卻不用考慮他們是否受公平對待',
  ],'原文由公平待遇推到留住員工及較穩定的品質和文化。'),
  quiz('長期可持續性包含甚麼具體檢查？',[
    '公司能否適應市場變化，同時不破壞環境或剝削弱勢者',
    '只看今年收入是否最高，完全不理會未來市場變化',
    '公司只要規模夠大，便必然沒有環境或社會風險',
    '把環境和弱勢者排除在外，才算真正的長期評估',
  ],'原文把可持續性具體化為適應市場與避免環境、社會傷害。'),
  quiz('兩家公司的例子挑戰了哪種簡單判斷？',[
    '收入較高或規模較大，不一定比負責任且獲得信任的小公司成功',
    '本地公司必然不會賺錢，無法支付公平薪酬',
    '大公司只要賺得多，失去顧客信任也不會有影響',
    '公司只要保持小規模，就自然符合所有道德標準',
  ],'例子是比較兩家公司在信任、待遇及責任上的差異，並非說所有小公司都更好。'),
];
const logic=[
  sequence('第一主體段：由漂亮數字推到可能脆弱的企業基礎',[
    ['單一標準問題','收入只能量度一部分，財務結果可能誤導。'],
    ['不良獲利方式','偷工減料、低薪或強推劣質產品，也可能帶來高利潤。'],
    ['外觀與現實','報表上看似成功，實際上卻像沙上建屋。'],
    ['長期後果','顧客失信、員工離職及品牌受損，使短期收入意義變小。'],
    ['段落結論','金錢可證明正在賺錢，不能證明健康、受尊重或能生存。'],
  ],'先說數字如何誤導，再指出有害做法及其後果，最後界定金錢能與不能證明的事。'),
  sequence('第二主體段：把「真正成功」拆成可觀察的替代標準',[
    ['顧客關係','回購和口碑顯示人們持續重視公司提供的價值。'],
    ['員工關係','公平待遇支持留任、品質、創新及內部文化。'],
    ['長期責任','適應市場變化，同時不傷害環境或弱勢者。'],
    ['對照例子','小而負責任的本地公司，可能比收入更高卻消耗信任的大公司成功。'],
    ['結尾準則','信任、穩定、道德操守與持久價值，共同衡量成功。'],
  ],'三項準則分別檢查顧客、員工及企業的長期社會和環境影響。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({
  prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink,
});
const transferTasks=[
  transfer('一所學校的平均分數上升，原因之一是它不再收取基礎較弱的學生。','哪項最能轉用範文對單一數字的批評？',[
    '分數或許好看，仍須查成果怎樣取得及學生有否受益',
    '平均分一旦上升，便能證明所有學生都得到公平教學',
    '只要分數較高，學校收生是否公平便完全不必考慮',
    '學校應只公布分數，不用說明哪些學生被排除在外',
  ],[
    '數字可能由有害或排他做法取得，不能獨自代表整體成功。',
    '題目已指出部分學生被排除，平均分不能代表所有人。',
    '公平收生是重要的實際基礎，不會被高分抵銷。',
    '不交代取得方法會使數字更易誤導。',
  ],[3,4,5],'範文說企業可用傷害員工或顧客的方法賺錢，漂亮收入因此可能誤導；學校的分數也要看取得方式。'),
  transfer('一家社區診所一年內收入增加，但舊病人愈來愈少，護理員也相繼離職。','哪個評估最符合範文的「沙上建屋」比喻？',[
    '收入增長可能掩蓋信任和團隊流失，診所的基礎未必穩固',
    '只要收入增加，病人減少和護理員離職便完全沒有意義',
    '診所收入較高已證明所有病人都得到更安全的服務',
    '護理員離職只會改變報表顏色，不可能影響日後服務',
  ],[
    '表面收入向上，但病人與人員關係轉弱，正是脆弱基礎。',
    '病人和員工流失可能影響長期服務，不能忽略。',
    '收入本身不能證明服務安全或受信任。',
    '人員流失會影響能力與品質，不是報表裝飾。',
  ],[5,6,7,10,11],'範文的比喻對照報表上成功與真實基礎；顧客與員工流失後，短期收入不足以證明健康。'),
  transfer('慈善機構今年籌款額很高，卻屢次沒有兌現對捐款者的用途承諾。','哪項最能運用範文對信任的判斷？',[
    '籌款額顯示收入，仍須檢查承諾是否兌現及捐款者是否信任',
    '只要捐款總額高，承諾是否真實便不會影響機構成效',
    '把所有捐款者疑問當成干擾，不再提供用途和結果資料',
    '只用一年的籌款增幅推斷機構會永遠獲得社會信任',
  ],[
    '收入是局部事實；失信可削弱較深的長期價值。',
    '高收入不能取消對失實承諾的檢查。',
    '不回答疑問會進一步損害信任。',
    '短期增幅不能證明長期信任穩定。',
  ],[1,6,7,16],'範文承認金錢顯示正在賺錢，卻說它不能證明機構健康或受尊重；捐款也要結合信任判斷。'),
  transfer('一款手機應用程式首月下載量很高，但大多數人使用一次後便刪除。','哪個指標最能借用範文的顧客忠誠邏輯？',[
    '追蹤多少人持續使用及願意推薦，而非只看首次下載',
    '只計首日下載次數，假設用戶之後是否使用完全不重要',
    '把刪除應用程式的用戶也當作忠實用戶，維持高數字',
    '只增加廣告次數，不檢查用戶是否認為程式有實際價值',
  ],[
    '持續使用與推薦，對應原文的回購和正面口碑。',
    '一次下載不能證明產品能持續滿足需要。',
    '刪除顯示留存問題，不能算忠誠。',
    '廣告可推高初次接觸，不能代替真實價值證據。',
  ],[8,9],'範文把顧客回購與口碑視為真實價值的證據；數位產品可對應檢查留存與推薦。'),
  transfer('學校管理層只看每年收生收入，卻發現優秀教師不斷離職。','哪項最能轉用範文的員工留任標準？',[
    '檢查教師待遇是否公平，以及離職有否削弱教學品質',
    '只要收生收入高，教師是否留任便絕不可能影響學生',
    '要求離職教師沉默，繼續把收入當成唯一成功證據',
    '以教師離職數量作宣傳資料，不檢查工作條件是否合理',
  ],[
    '公平待遇、留任與持續品質有關，不能被收入數字遮蔽。',
    '教師流失可能影響教學穩定和品質。',
    '壓下資訊沒有解決人員流失原因。',
    '只記錄離職數量而不分析待遇，無法改善基礎。',
  ],[10,11],'範文把員工留任當成另一個成功指標，並把公平待遇連到品質、創新和組織文化。'),
  transfer('市政巴士公司收入穩定，卻無法適應人口轉移，並長期使用污染較高的車輛。','哪項最符合範文的長期可持續標準？',[
    '同看路線能否因應需求改變，以及營運是否減少環境傷害',
    '只看今年收入是否穩定，對居民需要和污染都不用評估',
    '把車輛污染視為成功證據，因為它代表服務次數增加',
    '維持所有舊路線不變，假設人口轉移永遠不影響乘客',
  ],[
    '可持續性包含適應變化及避免環境傷害兩方面。',
    '眼前收入不能證明未來服務仍切合需要。',
    '污染是需要處理的代價，不是成功本身。',
    '人口轉移會改變需求，不能假設路線永遠合適。',
  ],[12],'範文把長期成功具體化為能適應市場，又不破壞環境；公共交通也要同時看需求和影響。'),
  transfer('一座公共圖書館今年入場人數破紀錄，但部分社區居民因交通不便始終無法使用。','哪項最能避免把單一數字當作全部成果？',[
    '保留入場數據，另查不同居民能否實際到訪和得到服務',
    '只公布最高入場人數，假設所有社區都同樣方便使用',
    '因為有人到訪便取消交通調查，不再了解未受惠居民',
    '把未能到訪的居民排除評估，令使用率表面上更高',
  ],[
    '入場數據有用，但仍要查服務是否真正惠及不同居民。',
    '總人數不能反映題目指出的交通落差。',
    '取消調查會掩蓋未受惠者。',
    '排除使用障礙會重演表面數字誤導。',
  ],[2,3,7,16],'範文不否定金錢能顯示一部分成果，但要求衡量是否為顧客、員工和社會創造真實價值。'),
  transfer('兩間本地食品店相比：小店支付合理薪酬並留住熟客，大店收入較高但頻繁失信。','哪項結論最符合範文的比較例子？',[
    '小店可能更成功，因為公平待遇和顧客信任比收入更能持久',
    '大店收入較高便必然更成功，失信對評價完全沒有作用',
    '小店規模較小便必然更好，不必查其商品品質或經營方式',
    '兩店只要都在本地營業，就不應比較待遇或顧客關係',
  ],[
    '原文例子允許小而負責任的公司比高收入卻失信者更成功。',
    '收入不能抹去信任損失。',
    '小規模本身不是成功證據，關鍵是待遇與責任。',
    '同在本地不代表兩者的經營品質相同。',
  ],[9,11,13],'範文直接比較公平付薪、留住顧客的小公司，與收入更高卻迅速消耗信任的大公司。'),
  transfer('球隊連續贏得幾場比賽，但隊員疲勞、彼此不信任，也缺少後備訓練。','哪個評估最能借用範文的短期與長期之分？',[
    '勝場證明近期結果，仍須查隊員健康、信任及未來持續能力',
    '只要連勝幾場，隊員疲勞和團隊信任便必然不存在',
    '只公布勝場數，假設後備訓練對長期表現毫無影響',
    '以疲勞作為勝利證明，不必考慮隊員能否繼續比賽',
  ],[
    '近期數字可見，但不能證明組織基礎健康且能持續。',
    '勝場與疲勞可以同時存在。',
    '沒有後備能力可能使成果難以延續。',
    '疲勞是風險，不能自動當成成功證據。',
  ],[5,6,7,12],'範文區分「正在賺錢」與「健康且能生存」；球隊也要區分近期勝利與長期能力。'),
  transfer('一家公司準備年度報告，除了利潤，也想向公眾展示它是否真正做得好。','哪套指標最完整承接範文的結論？',[
    '同列顧客回購、員工留任、環境與公平待遇，並說明持久價值',
    '只把利潤數字放大印刷，完全不交代顧客和員工的情況',
    '只加入一次廣告活動的觀看次數，當作所有長期成果證明',
    '只比較辦公室面積，不看收入來源、信任或社會影響',
  ],[
    '這組指標涵蓋顧客、員工及長期社會責任，能補足利潤。',
    '只放大利潤仍是原文批評的單因衡量。',
    '一次觀看數難以證明信任與持久價值。',
    '面積不能取代對經營方式與影響的檢查。',
  ],[2,7,9,10,12,16],'範文的替代標準是顧客忠誠、員工留任、可持續與道德操守，最後歸納成信任和持久價值。'),
];
const editorialOptions=[
  ['分數或許好看，仍須查成果怎樣取得及學生有否受益','分數上升顯示教學進步，收生變動可留待附錄交代','弱勢學生被排除後，平均分更能代表原有學生的進步','先比較各校平均分，再以名次判斷學生是否受惠'],
  ['收入增長可能掩蓋信任和團隊流失，診所的基礎未必穩固','收入增加顯示診所穩健，病人流失可能只是短期波動','護理員離職值得留意，舊病人減少則代表需求下降','來年收入若繼續增長，便可確認服務基礎保持穩固'],
  ['籌款額顯示收入，仍須檢查承諾與捐款者信任','籌款額高反映公眾信任，承諾履行可留待下年檢查','捐款者提出疑問多因溝通不足，資金用途可稍後核實','先公布籌款增幅，再以新捐款人數取代承諾記錄'],
  ['追蹤多少人持續使用及願意推薦，而非只看首次下載','首月下載量反映市場興趣，可直接代表長期使用意願','刪除程式的人數可用更多廣告抵銷，故較少需要調查','追蹤程式評分即可，用戶留存可等下一期再看'],
  ['檢查教師待遇是否公平，以及離職有否削弱教學品質','只看收生收入與教師人數，待遇可在下一年度調整','教師離職反映個人選擇，對教學品質的影響難以評估','多招聘新教師可補上空缺，因此不必分析留任原因'],
  ['同看路線能否適應需求，並減少營運的環境傷害','收入穩定表示路線合適，污染問題可另由乘客處理','先換污染較少的車輛，人口轉移對路線需求影響較小','保持舊路線與票價不變，便能維持今年的收入水準'],
  ['保留入場數據，另查不同居民能否實際到訪和得到服務','總入場數上升，表示交通不便的居民也已獲得服務','先提高入場人數，再把交通不便視為個別家庭安排','只按館內滿意度評價服務，不計未能到訪的居民'],
  ['小店或較成功，因公平待遇與顧客信任更持久','大店收入較高，所以其失信可視作暫時的宣傳問題','小店規模較小，可直接推斷其商品與待遇都比較好','兩店收入差距較大，先以銷售額取代留客與待遇資料'],
  ['勝場證明近期結果，仍須查隊員健康、信任及未來持續能力','連勝顯示訓練有效，隊員疲勞可留待賽季結束再處理','隊員疲勞反映投入，因此能支持球隊長期維持勝績','後備訓練有助將來，但現有勝場已足以評價整體基礎'],
  ['同列顧客回購、員工留任、環境與公平待遇，並說明持久價值','利潤加廣告觀看數，可大致代表顧客信任與長期價值','利潤加辦公室規模，便足以看出企業對員工是否公平','只列今年收入與新客數，較能避免評估環境與待遇'],
];
const editorialExplanations=[
  ['平均分可被收生方式推高，須查取得過程和學生受惠情況。','收生變動正是本題造成分數上升的關鍵，不宜留到附錄。','被排除者不在平均數內，不能藉此證明整體學生進步。','名次同樣是單一數字，不能顯示哪些學生被排除。'],
  ['收入向上可與病人、護理員流失同時存在，基礎未必健康。','病人持續流失是重要信任訊號，不能只假設為波動。','沒有資料顯示需求下降，且護理員流失也要解釋。','只看下一年收入仍未檢查病人與人員的長期關係。'],
  ['籌款只是局部成果；承諾履行和信任才反映較深基礎。','承諾已多次落空，不能把核查無限延後。','疑問可能源於承諾未兌現，須查實際用途而非只改溝通。','新人數仍是數量指標，不能取代履約證據。'],
  ['持續使用及推薦對應範文的回購與口碑。','首次下載不能證明用戶願意留下。','增加廣告或可帶來新下載，卻不能解釋刪除原因。','評分有用，但缺少實際留存資料。'],
  ['教師待遇、留任與教學品質須一併評估。','收入和人數無法單獨說明待遇是否公平。','離職未必全是個人偏好，且可影響教學連續性。','補人未必處理令教師持續離職的條件。'],
  ['長期可持續性同時涉及適應需求及環境代價。','眼前收入不能證明路線仍合需要，污染也屬營運責任。','換車有益，但仍要回應人口轉移改變的需求。','維持舊安排可能保留短期收入，卻未回應新需求。'],
  ['總入場數仍有用，但應另看交通阻礙了哪些居民。','總數增加可以與部分社區仍難到訪同時存在。','交通障礙是公共服務可及性問題，不能只歸給家庭。','館內評價漏掉了無法進館的人。'],
  ['小店的公平待遇與熟客信任是持久價值證據。','失信不會因收入較高就只變成宣傳問題。','小規模本身不是證據，仍須看實際商品與經營。','銷售額不能代替信任與員工待遇。'],
  ['近期勝場與隊伍能否長期運作是兩項不同判準。','疲勞已出現，延後處理可削弱往後表現。','疲勞可能是風險，不能直接當作持續成功的證據。','現有勝場不能顯示後備能力是否足夠。'],
  ['四類指標補足利潤，指向顧客、員工與長期責任。','觀看數不能直接代表信任或持久價值。','辦公室規模不能說明員工待遇。','只列收入與新客仍漏掉環境及公平。'],
];
transferTasks.forEach((item,index)=>{item.options=editorialOptions[index];item.explanations=editorialExplanations[index];item.why=item.explanations[0]});
export default {key:'direct-question:6',meta:{topic:'商業成功的真正標準',summary:'收入可顯示財務表現，卻不能單獨證明企業健康；應檢查顧客、員工與長期責任。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};
