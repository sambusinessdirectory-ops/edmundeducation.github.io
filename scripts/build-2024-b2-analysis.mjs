import fs from 'node:fs';
import path from 'node:path';

const source = process.argv[2];
const outDir = process.argv[3];
if (!source || !outDir) throw new Error('usage: node scripts/build-2024-b2-analysis.mjs SOURCE_TXT OUT_DIR');

const raw = fs.readFileSync(source, 'utf8');
const start = raw.indexOf('=== PAGE 9 ===');
const end = raw.indexOf('=== PAGE 88 ===');
if (start < 0 || end < 0) throw new Error('expected benchmark page markers were not found');
const body = raw.slice(start, end);

const clean = (value = '') => value
  .replace(/Edmund Education[^“]*?Sir/g, ' ')
  .replace(/(?<=\p{Script=Han})\s+|\s+(?=\p{Script=Han})/gu, '')
  .replace(/\s+([，。；：！？）》」』])/g, '$1')
  .replace(/([（《「『])\s+/g, '$1')
  .replace(/\s+/g, ' ')
  .trim();

const pageForIndex = (index) => {
  const n = index + 1;
  if (n <= 2) return 2;
  if (n <= 29) return 3;
  if (n <= 46) return 4;
  if (n <= 62) return 5;
  if (n <= 73) return 6;
  if (n <= 84) return 7;
  if (n <= 106) return 8;
  if (n <= 122) return 9;
  if (n <= 145) return 10;
  return 11;
};

const sectionForPage = {
  2: 'Situation and contents', 3: 'Listening note-taking sheet', 4: 'Email from Avery Goh',
  5: 'Radio communication', 6: 'Sydney Times article', 7: 'SMS messages',
  8: 'Shane Lee email and booking calendar', 9: 'Luxury Yachts brochure',
  10: 'Staff meeting minutes', 11: 'Company handbook and David Atkinson biography'
};

const statusFor = (type, analysis, quote, index) => {
  if (type === 6) return '不寫入答案';
  if (type === 5) {
    if (/指路|資料來源|去找|參考|頁/.test(analysis)) return '只作指路';
    if (/更新|推翻|取消|過時|淘汰|最後|確認|已決定|不應|不能|狀態/.test(analysis)) return '只用來判斷證據狀態';
    if (/身份|語氣|文類|格式|角色/.test(analysis)) return '只控制語氣／格式';
    return '不寫入答案';
  }
  if (type === 4) return /可轉述|濃縮|支援|推理|合讀/.test(analysis) ? '合併寫入' : '只保留結論';
  if (/框架|語氣|結構|應包括|必寫項目/.test(analysis)) return '只控制語氣／格式';
  if (/更新|最終|直接|核心|完整|必須|獨立/.test(analysis)) return '獨立寫入';
  if (/合併|配合|一部分|同時|連到/.test(analysis)) return '合併寫入';
  return ['Captain Moby not at fault', 'Lifetime membership', '30% discount'].some((x) => quote.includes(x))
    ? '獨立寫入' : '合併寫入';
};

const useFor = (type, status, page, analysis) => {
  if (type === 1) return `這句服務 Task 8；要和第 ${page} 頁同一事故鏈的資料核對，分清事故事實、成因和調查結果。`;
  if (type === 2) return `這句服務 Task 9；要和較後的補償決定及預訂日曆核對，不能把構思當成已落實安排。`;
  if (type === 3) return `這句服務 Task 10；要用較後確認的日期、供應商、遊艇和活動版本。`;
  if (type === 4) return '這句補充理由、背景或宣傳語氣；它要依附一個已由其他來源成立的主要內容點。';
  if (type === 5) return status === '只作指路'
    ? '這句把讀者帶到另一份含有可用事實的資料；單靠它不能寫成答案內容。'
    : '這句控制資料的版本、可信程度或題目歸屬；要先完成判斷才決定採用哪個內容。';
  return '這句屬行政字樣、閒談或題外支線；三項任務都不需要它提供答案內容。';
};

const handlingFor = (unit) => {
  const { status, quote, type } = unit;
  if (status === '獨立寫入') return `保留核心事實並按文類改寫；不要複製來源歷史。可用資料：“${quote}”`;
  if (status === '合併寫入') return '只取這句新增的核心意思，和分析中點名的主要資料合成一句；不要另開重複內容點。';
  if (status === '只保留結論') return '省略來源人物的反應或推理過程，只寫由其他證據共同支持的最後結論。';
  if (status === '只用來判斷證據狀態') return '用它判斷哪個版本有效；答案寫最後確認的安排，不寫「有人同意／宣布／取消」的資料歷史。';
  if (status === '只控制語氣／格式') return '用它決定身份、讀者、文類或報告範圍；不要把指示句當成正文事實。';
  if (status === '只作指路') return '沿着這個提示查看指定來源，答案寫該來源提供的具體內容，本句不寫入。';
  return type === 6 ? '完全省略；刪去後三項任務仍可完整回答。' : '不寫入成品；它沒有提供可獨立保留的新答案內容。';
};

const quoteMatches = [...body.matchAll(/"([^"\n]{2,1200})"\s*\[/g)];
const printedUnits = quoteMatches.map((match, index) => {
  const segmentEnd = quoteMatches[index + 1]?.index ?? body.length;
  const segment = body.slice(match.index, segmentEnd);
  const translationMatch = segment.match(/\[\s*[「『]?(.{1,1800}?)[」』]?\s*\]\s*類\s*型\s*：\s*([1-6])/s);
  const typeMatch = segment.match(/類\s*型\s*：\s*([1-6])/);
  const analysisMatch = segment.match(/分\s*析\s*：\s*(.{1,2200}?)(?=(?:“|=== PAGE|$))/s);
  const page = pageForIndex(index);
  const type = Number(typeMatch?.[1] || translationMatch?.[2] || 6);
  const quote = clean(match[1]);
  const zh = clean(translationMatch?.[1] || '第三方教材沒有提供可可靠抽取的中文；本項只列入覆蓋帳。');
  const analysis = clean(analysisMatch?.[1] || '這個項目在舊教材沒有完整判斷；本讀本按任務要求及來源關係重新決定處理。');
  const status = statusFor(type, analysis, quote, index);
  const unit = {
    id: `df-${String(index + 1).padStart(3, '0')}`, source: 'DF-SCAN', sourcePage: page,
    section: sectionForPage[page], excerpt: quote, zh, type, status,
    prompts: {
      '這句在說甚麼': zh,
      '這句有甚麼用': useFor(type, status, page, analysis),
      '為甚麼採用這個作答決定': analysis,
      '答案可以怎樣處理': ''
    }
  };
  unit.prompts['答案可以怎樣處理'] = handlingFor(unit);
  return unit;
});

const makeManualPrinted = ({excerpt, zh, type, status, sourcePage, section, reason, use}) => {
  const unit = {
    id:'', source:'DF-SCAN', sourcePage, section, excerpt, zh, type, status,
    prompts:{
      '這句在說甚麼':zh,
      '這句有甚麼用':use,
      '為甚麼採用這個作答決定':reason,
      '答案可以怎樣處理':''
    }
  };
  unit.prompts['答案可以怎樣處理'] = handlingFor(unit);
  return unit;
};

printedUnits.splice(2, 0,
  makeManualPrinted({excerpt:'Before the recording is played, you will have five minutes to study the Question-Answer Book and the Data File to familiarise yourself with the situation and the tasks.',zh:'錄音播放前，考生有五分鐘閱讀問答簿及資料檔，以熟悉情境和任務。',type:5,status:'只控制語氣／格式',sourcePage:2,section:'Situation and contents',use:'這句規定預備閱讀時間，提醒考生先掌握三項任務合約。',reason:'刪去它不會令三篇成品失去內容點；它只控制考試流程和預讀策略。'}),
  makeManualPrinted({excerpt:'Complete the tasks by following the instructions in the Question-Answer Book and on the recording.',zh:'請按照問答簿及錄音中的指示完成任務。',type:5,status:'只用來判斷證據狀態',sourcePage:2,section:'Situation and contents',use:'這句確立問答簿和錄音都能控制作答，不能只依賴資料檔。',reason:'它本身沒有任何事故、補償或宣傳內容；保留它只為判斷多個來源的權限。'}),
  makeManualPrinted({excerpt:'You will find all the information you need in the Question-Answer Book, the Data File and on the recording.',zh:'所需資料可在問答簿、資料檔及錄音中找到。',type:5,status:'只用來判斷證據狀態',sourcePage:2,section:'Situation and contents',use:'這句列出三個必須整合的來源。',reason:'答案內容仍要由各來源的具體句子支持；這句只證明不能用常識補作缺漏。'}),
  makeManualPrinted({excerpt:'As you listen you can make notes on Page 3 of the Data File.',zh:'聆聽時可在資料檔第 3 頁記筆記。',type:5,status:'只作指路',sourcePage:2,section:'Situation and contents',use:'這句把考生帶到聆聽筆記頁。',reason:'它只指出筆記位置；刪去後三項成品內容完全不變。'}),
  makeManualPrinted({excerpt:'You now have five minutes to familiarise yourself with the Question-Answer Book and the Data File.',zh:'你現在有五分鐘熟悉問答簿及資料檔。',type:6,status:'不寫入答案',sourcePage:2,section:'Situation and contents',use:'這是開始預讀的行政提示。',reason:'它沒有新增角色、任務、事實、理由、條件或行動，三項答案均不受影響。'})
);

const d79xfIndex = printedUnits.findIndex((u) => u.excerpt.startsWith('But shhh'));
printedUnits.splice(d79xfIndex, 0, makeManualPrinted({
  excerpt:'With a top speed of 70 knots, could this become the new “supercar of the sea”?!?',
  zh:'最高時速達 70 節，這會否成為新的「海上超跑」？', type:5, status:'只用來判斷證據狀態',
  sourcePage:9, section:'Luxury Yachts brochure',
  use:'這是 D79XF 的宣傳問題，只提出可能性，沒有確認它是現時的「海上超跑」。',
  reason:'下一句明示 D79XF 到 2026 年才開售；刪去這個未落實的宣傳問題，D79X 的現行稱號和 Task 10 的遊艇選擇仍完整。'
}));

const handbookIndex = printedUnits.findIndex((u) => u.excerpt === 'Chapter 3: Contents of an incident report');
printedUnits.splice(handbookIndex, 0, makeManualPrinted({
  excerpt:'Extract from World City Travel company handbook', zh:'World City Travel 公司手冊節錄',
  type:5,status:'只控制語氣／格式',sourcePage:11,section:'Company handbook and David Atkinson biography',
  use:'這個標題辨認下文為公司的事故報告規則，而不是事故本身。',
  reason:'它不能獨立證明任何事故事實；保留它只為確定下文的權限和文類功能。'
}));
const factualIndex = printedUnits.findIndex((u) => u.excerpt.startsWith('A report should explain the reason'));
printedUnits.splice(factualIndex, 0, makeManualPrinted({
  excerpt:'Generally, a report should cover factual information, including but not limited to details such as the date and time of the relevant incident, location of the incident, and what was involved in the incident. This is to ensure readers have all the necessary background information.',
  zh:'一般而言，報告應涵蓋事實資料，包括事故日期和時間、地點及事件內容，讓讀者掌握所需背景。',
  type:1,status:'只控制語氣／格式',sourcePage:11,section:'Company handbook and David Atkinson biography',
  use:'這句列出 Task 8 的必要資料範圍：日期、時間、地點和事故內容。',
  reason:'它不提供事故答案本身，但若不用它控制取材，報告可能漏掉基本背景；具體事實仍須由電台紀錄、報章和訊息支持。'
}));

const splitUnit = (original, parts) => {
  const index=printedUnits.findIndex((u)=>u.excerpt===original);
  if(index<0) throw new Error(`split target not found: ${original}`);
  const base=printedUnits[index];
  const made=parts.map(([excerpt,zh,type,status,reason])=>makeManualPrinted({
    excerpt,zh,type,status,sourcePage:base.sourcePage,section:base.section,
    use:useFor(type,status,base.sourcePage,''),reason
  }));
  printedUnits.splice(index,1,...made);
};

splitUnit('Things have not been great there recently due to the accident the World City Travel catamaran was involved in. I need you to work on a number of tasks for me as we try to fix the fallout and move on.',[
  ['Things have not been great there recently due to the accident the World City Travel catamaran was involved in.','公司最近因雙體船意外而情況不佳。',5,'只用來判斷證據狀態','這句只交代事故造成的整體背景；三項答案的具體事實由後文提供，刪去它不會失去任何必要內容點。'],
  ['I need you to work on a number of tasks for me as we try to fix the fallout and move on.','Avery 要 Nico 完成多項工作，以處理事故後續並讓公司向前走。',5,'只控制語氣／格式','這句定出內部工作目的和公司立場，但沒有說明任何一項任務的具體內容。']
]);
splitUnit('Control centre: Control centre to Captain Moby. How are you enjoying your day out? Over.',[
  ['Control centre to Captain Moby.','控制中心呼叫 Moby 船長。',6,'不寫入答案','這只是通訊開場，沒有事故內容。'],
  ['How are you enjoying your day out?','今天出航愉快嗎？',6,'不寫入答案','這是寒暄問題；答案所需的是實際航行情況。'],
  ['Over.','完畢。',6,'不寫入答案','這是無線電通訊格式字樣。']
]);
splitUnit("Captain Moby: Captain Moby to control.... It's been smooth sailing so far. And sounds like you guys have some free time. Over...",[
  ['Captain Moby to control.','Moby 船長呼叫控制中心。',6,'不寫入答案','這只是通訊呼叫。'],
  ["It's been smooth sailing so far.",'到目前為止航行情況平穩。',1,'獨立寫入','刪去這句便失去 4 時 37 分仍然正常的基準，無法清楚呈現天氣和控制情況其後突然轉差。'],
  ['And sounds like you guys have some free time.','看來你們很有空。',6,'不寫入答案','這是玩笑，沒有事故事實。'],
  ['Over.','完畢。',6,'不寫入答案','這是無線電通訊格式字樣。']
]);
splitUnit('Control centre: Just making sure our favourite captain is having fun... Seems like we have some static over the radio...',[
  ['Just making sure our favourite captain is having fun.','只是想確認我們最喜歡的船長玩得開心。',6,'不寫入答案','這是寒暄，刪去後事故經過完整不變。'],
  ['Seems like we have some static over the radio.','無線電似乎出現雜音。',1,'合併寫入','這句提供通訊不穩的早期跡象；單獨不足以說明事故，要和 5 時 50 分的失控及撞船合併。']
]);
splitUnit('Captain Moby: ... All good mate. I can still hear you ... Over and out...',[
  ['All good mate.','一切正常。',1,'合併寫入','這句確認當時尚未出現危急情況，可和 4 時 37 分的正常狀態合併成背景。'],
  ['I can still hear you.','我仍聽得到你。',1,'合併寫入','這句顯示雖有雜音，通訊當時仍可維持；它只補充事故時間線，不宜獨立成段。'],
  ['Over and out.','通訊完畢。',6,'不寫入答案','這是無線電收尾字樣。']
]);
splitUnit('Captain Moby: Captain Moby to control.... We are currently in Sydney Harbour. How are conditions looking ... Over.',[
  ['Captain Moby to control.','Moby 船長呼叫控制中心。',6,'不寫入答案','這只是通訊呼叫。'],
  ['We are currently in Sydney Harbour.','我們目前在悉尼港。',1,'獨立寫入','若刪去這句，Task 8 會失去事故地點；其他句子不能同樣直接交代當時位置。'],
  ['How are conditions looking?','目前情況如何？',5,'只作指路','這是提問；具體天氣和交通情況要用控制中心的回答。'],
  ['Over.','完畢。',6,'不寫入答案','這是無線電格式字樣。']
]);
splitUnit('Control centre: Control centre to Captain Moby. We hear you. Traffic is low. Seems like some clouds are rolling in... We suggest you... Over.',[
  ['Control centre to Captain Moby. We hear you.','控制中心回覆 Moby 船長並表示收到訊息。',6,'不寫入答案','這只確認通訊接通，沒有新增事故答案內容。'],
  ['Traffic is low.','航道交通量低。',4,'合併寫入','這項背景顯示碰撞不是由繁忙船流直接造成；它不能單獨證明事故成因。'],
  ['Seems like some clouds are rolling in.','看來有雲層正在移入。',1,'合併寫入','這句提供天氣轉差的可觀察跡象，要和稍後的突然天氣變化及撞船合併。'],
  ['We suggest you…','我們建議你……',6,'不寫入答案','句子被雜音截斷，沒有可恢復的完整建議；下一次重複才提供「等待」指示。'],
  ['Over.','完畢。',6,'不寫入答案','這是無線電格式字樣。']
]);
splitUnit('Captain Moby: No use, control. The ... are too ... We have crashed!...',[
  ['No use, control.','沒有用，控制中心。',4,'合併寫入','這句顯示船長未能恢復控制，但未交代原因或結果；要和失控及撞船合併。'],
  ['The … are too …','……太……',6,'不寫入答案','這是無法恢復命題的殘句，不能猜補缺字。'],
  ['We have crashed!','我們撞船了！',1,'獨立寫入','若刪去這句，Task 8 會失去事故本身；它是電台紀錄中最直接的撞擊確認。']
]);
splitUnit('Initial reports are that, ruling out human error, the accident was likely to have been caused by bad weather. Although the skies have generally been lovely and clear in the past few days, a sudden change in conditions was recorded in the area around the time of the crash.',[
  ['Initial reports are that, ruling out human error, the accident was likely to have been caused by bad weather.','初步報告排除人為錯誤，認為事故很可能由惡劣天氣造成。',1,'只用來判斷證據狀態','這是初步、帶保留的成因判斷；較後資料確認 Moby 沒有過失，答案應寫最後結論而非保留報章的猜測語氣。'],
  ['The skies have generally been lovely and clear in the past few days.','過去數天天空大致晴朗。',4,'合併寫入','這只建立對比背景，單靠它不能解釋事故；可省略以節省字數。'],
  ['A sudden change in conditions was recorded in the area around the time of the crash.','撞船前後，該區錄得天氣突然轉變。',1,'獨立寫入','刪去這句便失去事故成因的具體時間關係；它比泛稱 bad weather 更精確。']
]);
splitUnit('Amidst all this negative publicity, World City Travel is also launching pre-booking for its Adventure Fishing Tour, which will run from 15th November to 27th January. Will this have better luck? Only time will tell.',[
  ['Amidst all this negative publicity, World City Travel is also launching pre-booking for its Adventure Fishing Tour.','在負面報道期間，公司亦開始接受 Adventure Fishing Tour 預訂。',4,'合併寫入','這句只提供宣傳背景；Task 10 的核心是新團賣點和已確認安排。'],
  ['The Adventure Fishing Tour will run from 15th November to 27th January.','Adventure Fishing Tour 原先公布由 11 月 15 日至 1 月 27 日舉行。',5,'只用來判斷證據狀態','會議紀錄其後把開始日期改為 12 月 6 日，但保留原有結束日期；因此只可保留 1 月 27 日，不能照抄 11 月 15 日。'],
  ['Will this have better luck? Only time will tell.','新團會否更幸運？只有時間能證明。',6,'不寫入答案','這是報章修辭和猜測，不是已確認賣點。']
]);
splitUnit("Yes, include the reminder. It's fine — no passengers onboard. Not a cruise; we were mainly out there to train new crew members.",[
  ['Yes, include the reminder.','要把 Atkinson 最著名的事蹟加進宣傳。',3,'只保留結論','這句確認先前的宣傳建議；答案應寫 Atkinson 的具體名氣，不寫「include the reminder」的資料歷史。'],
  ['No passengers onboard.','船上沒有乘客。',1,'獨立寫入','若刪去這句，Task 8 會失去判斷傷亡和事故背景的重要事實；其他資料沒有更直接取代。'],
  ['It was not a cruise.','當時並非進行載客航程。',1,'合併寫入','這句澄清船隻用途，需和訓練新船員及勘察路線合併交代。'],
  ['We were mainly out there to train new crew members.','船隻出航主要為訓練新船員。',1,'獨立寫入','公司手冊要求交代涉事者為何在現場；刪去這句會失去一項獨立出航目的。']
]);
splitUnit("I'm more worried about the participants of the next Whale Watching Cruise, which was cancelled. The company is putting together an additional compensation package as I type.",[
  ['The next Whale Watching Cruise was cancelled.','下一班賞鯨航程已取消。',2,'合併寫入','這句交代 Task 9 的收件人為何受影響，要和退款及補償安排合併。'],
  ['The company is putting together an additional compensation package as I type.','公司當時正在擬定額外補償方案。',5,'只用來判斷證據狀態','這句只表示方案仍在草擬；最後補償要用其後會議確認的內容。']
]);
splitUnit("We wanted to add another 50% to the duration of the cruises starting in May, but that's been postponed until the June and July cruises now because of the accident.",[
  ['We wanted to add another 50% to the duration of the cruises starting in May.','公司原想由五月起把航程延長 50%。',5,'只用來判斷證據狀態','這是被延後的舊安排，不能當成五月航程現況。'],
  ['The extra 50% duration has been postponed until the June and July cruises because of the accident.','因意外，延長 50% 的安排改到六月及七月航程。',2,'獨立寫入','刪去這句，Task 9 會失去六月及七月航程長度的更新；它明確取代五月舊安排。']
]);
splitUnit('Ms Goh agreed to this idea. She suggested that participants be given the choice of another cruise in this migration season as part of the compensation package.',[
  ['Ms Goh agreed that the company needed to do more to compensate the participants.','Avery 同意公司需要增加補償。',5,'只用來判斷證據狀態','這句只確認「要增加補償」的方向；答案要寫其後具體獲同意的免費航程，不寫同意過程。'],
  ['She suggested that participants be given the choice of another cruise in this migration season as part of the compensation package.','她建議讓參加者在今個遷徙季節另選一次航程作補償。',2,'只用來判斷證據狀態','這裏仍是 Avery 的提議；要等後文全體同意免費航程，才可把安排寫成已落實內容。']
]);
splitUnit('He also insisted it be emphasised that the cruise would be complimentary, agreed to by all.',[
  ['He also insisted it be emphasised that the cruise would be complimentary.','Moby 船長堅持要強調替代航程完全免費。',2,'只保留結論','這句提出需要強調免費性；答案保留「complimentary cruise」這個內容，不寫誰堅持。'],
  ['This was agreed to by all.','與會者全體同意免費航程安排。',5,'只用來判斷證據狀態','這句把前面的提議提升為確認安排；答案寫免費航程本身，不複製「全體同意」的來源歷史。']
]);
splitUnit('The new Tour schedule would now start on 6th December due to the change, but would finish on the same date announced previously.',[
  ['The new Tour schedule would now start on 6th December.','新團最新安排改於 12 月 6 日開始。',3,'獨立寫入','這句直接取代報章的 11 月 15 日舊開始日期；刪去便會令 Task 10 使用錯誤版本。'],
  ['The Tour would finish on the same date announced previously.','新團結束日期維持先前公布的日期。',3,'合併寫入','這句須回到報章找出 1 月 27 日；單靠本句沒有日期，兩項來源合併後才可寫成 27 January。']
]);
splitUnit("Morning Moby! How are you these days? I've got some great news: I'll be giving live commentary on the Adventure Fishing Tour. It's being held on my favourite yacht!",[
  ['Morning Moby! How are you these days?','Moby，早晨！你近來好嗎？',6,'不寫入答案','這是訊息寒暄，沒有任務內容。'],
  ["I'll be giving live commentary on the Adventure Fishing Tour.",'Atkinson 會在 Adventure Fishing Tour 提供現場講解。',3,'獨立寫入','若刪去這句，Task 10 會失去 Atkinson 在旅程中的實際角色；傳記只交代名氣，不能取代這項安排。'],
  ["It's being held on my favourite yacht!",'旅程會使用 Atkinson 最喜歡的遊艇。',5,'只用來判斷證據狀態','這句沒有型號；要和傳記及小冊子的「海上超跑」關係合讀，才能得出 D79X。']
]);
splitUnit("Oh wow! I saw some drafts of the promotional materials. They only mention 'commentary by a famous biologist'. They should really add your name as well: use your star power!",[
  ['Oh wow!','噢，真厲害！',6,'不寫入答案','這只是反應語。'],
  ['I saw some drafts of the promotional materials.','Moby 看過宣傳材料草稿。',5,'只用來判斷證據狀態','這句只交代他得知資料的經過，沒有新增可寫入廣告的賣點。'],
  ["They only mention 'commentary by a famous biologist'.",'草稿只寫了「由一位著名生物學家講解」。',5,'只用來判斷證據狀態','這是未更新草稿的舊寫法；後文要求加入 Atkinson 的姓名和代表作。'],
  ['They should really add your name as well: use your star power!','宣傳應加入 Atkinson 的姓名，利用他的知名度。',3,'只保留結論','這裏仍是 Moby 的建議；其後 Atkinson 接受，答案保留姓名和名氣，不寫建議形成過程。']
]);
splitUnit("They should add my name! I also think there should be a little reminder about what I'm most famous for as well... I'll send this chat to Avery for the future promotions.",[
  ['They should add my name!','宣傳應加入 Atkinson 的姓名。',3,'獨立寫入','Atkinson 本人確認要加名；若刪去，廣告可能只寫 generic biologist，失去指定人物賣點。'],
  ["There should be a little reminder about what I'm most famous for as well.",'宣傳亦應簡短提醒觀眾 Atkinson 最著名的成就。',3,'合併寫入','這句要求加入名氣，但沒有說明成就；要和傳記的《The Life of Whales》合併。'],
  ["I'll send this chat to Avery for the future promotions.",'Atkinson 會把對話傳給 Avery，供日後宣傳使用。',5,'只作指路','這句只交代資料如何到達 Avery；答案寫具體宣傳內容，不寫傳送過程。']
]);
splitUnit("Yes, I heard about your little incident in Sydney Harbour. I hope the tabloid newspapers didn't make a mountain out of a molehill. Were any passengers hurt?",[
  ['I heard about your incident in Sydney Harbour.','Atkinson 聽聞悉尼港意外。',5,'只作指路','這句只把話題轉到事故，具體事實要看 Moby 回答。'],
  ["I hope the tabloid newspapers didn't make a mountain out of a molehill.",'他希望小報沒有把事情誇大。',6,'不寫入答案','這是個人希望和修辭，不能當成事故事實。'],
  ['Were any passengers hurt?','有沒有乘客受傷？',5,'只作指路','這是問題，不能自行當成答案；下一則訊息明確說船上沒有乘客。']
]);
splitUnit('Police were seen to be interviewing Captain Moby, who was in charge of the vessel at the time of the accident. They will be sure to take a look at any communications between the captain and the shore. World City Travel is reported to be undertaking its own investigation in tandem.',[
  ['Police were seen to be interviewing Captain Moby, who was in charge of the vessel at the time of the accident.','警方被目擊正在訪問事發時掌舵的 Moby 船長。',4,'合併寫入','這提供調查背景，但 Task 8 要的是結果；單靠警方訪問不能證明責任。'],
  ['They will be sure to take a look at any communications between the captain and the shore.','報章推測警方會查看船長與岸上的通訊。',5,'只用來判斷證據狀態','這是報章對將來行動的推測，不是已發生或已確認的調查結果。'],
  ['World City Travel is reported to be undertaking its own investigation in tandem.','據報 World City Travel 同時進行內部調查。',4,'只保留結論','這句只交代調查進行中；其後會議紀錄提供檢討委員會的實際結果，答案應用較後結果。']
]);
splitUnit("Captain Moby: That's good to know. We will wait... Over and out.",[
  ["That's good to know.",'知道了。',6,'不寫入答案','這只是對指示的回應，沒有新事故事實。'],
  ['We will wait.','我們會等待。',1,'合併寫入','這句顯示船長接受控制中心建議；要和等待指示及其後天氣突變合併成時間線。'],
  ['Over and out.','通訊完畢。',6,'不寫入答案','這是無線電收尾字樣。']
]);
splitUnit('Control centre: ... centre to... Moby. Try to regain control and keep the catamaran ... Over.',[
  ['Try to regain control.','嘗試重新控制船隻。',4,'合併寫入','這是控制中心在危急時的指示，可輕量補充事故經過；它不等於船長成功恢復控制。'],
  ['Keep the catamaran …','讓雙體船保持……',6,'不寫入答案','句子被截斷，沒有可可靠恢復的完整命題。'],
  ['Over.','完畢。',6,'不寫入答案','這是無線電格式字樣。']
]);
splitUnit('Captain Moby: Please repeat instruction, control. Over.',[
  ['Please repeat instruction, control.','請控制中心重複指示。',5,'只作指路','這是要求重複的問題；具體可用內容是控制中心下一句「wait it out」。'],
  ['Over.','完畢。',6,'不寫入答案','這是無線電通訊格式字樣。']
]);
splitUnit('Control centre: We suggest you wait it out. Over.',[
  ['We suggest you wait it out.','我們建議你等待情況過去。',1,'合併寫入','這句交代控制中心在天氣轉差時的指示；要和船長接受指示及其後失控合併成事故時間線。'],
  ['Over.','完畢。',6,'不寫入答案','這是無線電通訊格式字樣。']
]);
splitUnit("In the follow-up email, tell them exactly how much we value our customers, then let them know about the compensation package.",[
  ['Tell them exactly how much we value our customers.','跟進電郵要明確表示公司十分重視客戶。',2,'獨立寫入','Task 9 的目的不只列安排，也要修補關係；刪去這項態度內容會令電郵缺少正式安撫。'],
  ['Let them know about the compensation package.','跟進電郵要交代補償方案。',5,'只控制語氣／格式','這句只規定內容範圍；具體補償要用錄音和會議紀錄，不能把指示本身寫入。']
]);
splitUnit("We've hooked up with the caterers at Chez Poisson, so this buffet will be a real treat — tuna, scallops, and lobster!",[
  ["We've hooked up with the caterers at Chez Poisson.",'公司原先安排 Chez Poisson 供應自助餐。',5,'只用來判斷證據狀態','會議紀錄其後明確說 Chez Poisson 無法供應並由 iSea 接手；這個供應商版本已失效。'],
  ['The buffet will include tuna, scallops, and lobster.','自助餐會供應吞拿魚、帶子和龍蝦。',3,'獨立寫入','其後會議確認新供應商提供相同菜式；刪去這句會失去三項具體餐飲賣點。']
]);
splitUnit('Contractually, though, we still have to mention that there will be a break from the Tour on Christmas Day, so keep that in the promotions.',[
  ['There will be a break from the Tour on Christmas Day.','旅程在聖誕節當日暫停。',3,'獨立寫入','會議紀錄確認合約休息日不受改期影響；刪去這句會令 Task 10 漏掉重要日期限制。'],
  ['Keep that in the promotions.','宣傳必須保留這項休息日資料。',5,'只控制語氣／格式','這是內部寫作指示；廣告寫 Christmas Day break，不寫「keep that in the promotions」。']
]);
splitUnit('Also, I\'m sure you know I want to book the pop band Bubblegum to perform live music on the yacht.',[
  ['I want to book the pop band Bubblegum.','Shane 想預訂流行樂隊 Bubblegum。',5,'只用來判斷證據狀態','這只是未確認的個人計劃；後來現場音樂整項取消。'],
  ['The band would perform live music on the yacht.','樂隊原本會在遊艇上現場演奏。',5,'只用來判斷證據狀態','這是依附未確認訂約的舊宣傳構思；較後會議明確取消，答案不能採用。']
]);
splitUnit('Mr Lee affirmed that booking availability for this season should be clearly communicated to the participants, as well as the change in cruise duration.',[
  ['Booking availability for this season should be clearly communicated to the participants.','要向參加者清楚交代本季可預訂時段。',2,'合併寫入','這句確認日曆資料必須寫入 Task 9；具體月份和周次要從 booking calendar 讀取。'],
  ['The change in cruise duration should be clearly communicated to the participants.','亦要清楚交代航程時長改動。',2,'合併寫入','這句確認六月及七月延長 50% 的更新屬跟進電郵內容；具體改動由 SMS 提供。']
]);
splitUnit('Ms Goh stated that, due to the intervention of Dr David Atkinson, the live music on the yacht had been cancelled.',[
  ['Dr David Atkinson intervened about the live music.','Atkinson 就現場音樂安排提出意見。',5,'只用來判斷證據狀態','這只交代取消安排的來源歷史；具體理由由下一句提供，答案不需寫誰介入。'],
  ['The live music on the yacht had been cancelled.','遊艇上的現場音樂已取消。',5,'只用來判斷證據狀態','這項較後決定推翻 Bubblegum 舊計劃；答案的動作是完全不提現場音樂，而不是宣傳「已取消」。']
]);
splitUnit('iSea Caterers would take over and had committed to serve the same dishes.',[
  ['iSea Caterers would take over.','iSea Caterers 會接手供應自助餐。',3,'獨立寫入','這句以較後會議決定取代 Chez Poisson；刪去會令 Task 10 使用已失效的供應商。'],
  ['iSea Caterers had committed to serve the same dishes.','iSea 承諾供應相同菜式。',3,'合併寫入','這句把新供應商和原有吞拿魚、帶子及龍蝦連起來；單靠「相同菜式」沒有餐單，必須與早前電郵合併。']
]);
splitUnit("His dramatic 'Aqua Vita' photo prints, of aquatic mammals in the wild, are among the most popular in our online shop and would light up any home or office. One print is given free of charge to all of those with lifetime membership of World City Travel.",[
  ["His dramatic 'Aqua Vita' photo prints, of aquatic mammals in the wild, are among the most popular in our online shop and would light up any home or office.",'他的《Aqua Vita》野生水生哺乳類照片印刷品在網店很受歡迎，適合家居或辦公室。',6,'不寫入答案','三項任務都沒有要求宣傳攝影作品；刪去後事故、補償和新團廣告仍完整。'],
  ['One print is given free of charge to all of those with lifetime membership of World City Travel.','World City Travel 終身會員可免費獲贈一幅照片印刷品。',2,'合併寫入','這項會籍福利能具體化終身會籍價值，但 Task 9 的核心補償已由錄音確認；如字數有限應和會籍合併，不能取代七折優惠。']
]);
splitUnit("Dr Atkinson is a keen yachtsman. His current favourite: the 'supercar of the sea', of course!",[
  ['Dr Atkinson is a keen yachtsman.','Atkinson 熱愛遊艇。',4,'合併寫入','這只是人物背景，可輕量支援他對遊艇的可信度；刪去不會失去新團的任何具體賣點。'],
  ["His current favourite is the 'supercar of the sea'.",'他目前最喜歡的是「海上超跑」。',5,'只用來判斷證據狀態','這句沒有型號，必須和遊艇小冊子合讀；現行被稱為「海上超跑」的是 D79X，而未發售的 D79XF 只提出疑問。']
]);

let currentPrintedPage = 2;
const pageStarts = new Map([
  ['Guided Nature Walk',3],['Email from Avery Goh to Nico Lin',4],
  ['Transcript of radio communication between Captain Moby and control centre',5],['29th March',6],
  ['31st March',7],['Sent: Tuesday 2nd April 09:32AM',8],
  ['Extract from Luxury Yachts sales brochure',9],['Minutes of World City Travel Staff Meeting',10],
  ['Extract from World City Travel company handbook',11]
]);
printedUnits.forEach((unit,index)=>{
  if(pageStarts.has(unit.excerpt)) currentPrintedPage=pageStarts.get(unit.excerpt);
  unit.id=`df-${String(index+1).padStart(3,'0')}`;
  unit.sourcePage=currentPrintedPage;
  unit.section=sectionForPage[currentPrintedPage];
});

const translationOverrides = new Map([
  ['The accident with the catamaran is an absolute disaster.','雙體船意外是一場徹底的災難。'],
  ["Who can forget 'The Life of Whales'? Screened in over 80 countries and 20 different languages, this 2013 series stands as his most famous work and is the natural history breakthrough that really put his name on the map.",'誰會忘記《The Life of Whales》？這套 2013 年系列在超過 80 個國家以 20 種語言播放，是他最著名、令他聲名大噪的自然歷史作品。']
]);
const decisionOverrides = new Map([
  ['Please repeat instruction, control.',['請控制中心重複指示。',5,'只作指路','這是要求重複的問題；具體可用內容是控制中心下一句「wait it out」。']],
  ['We suggest you wait it out. Over.',['我們建議你等待情況過去。完畢。',1,'合併寫入','這句交代控制中心在天氣轉差時的指示；要和船長接受指示及其後失控合併成事故時間線。']],
  ['The accident with the catamaran is an absolute disaster.',['雙體船意外是一場徹底的災難。',4,'不寫入答案','這是 CEO 的情緒化內部評價；刪去後所有補償安排仍完整，而且不適合直接寫給客戶。']],
  ['Mention this in any new advertisements.',['要在所有新廣告提及免費自助餐。',5,'只控制語氣／格式','這是內部寫作指示；廣告寫免費自助餐本身，不寫資料歷史。']],
  ['Get them to confirm, then add this to the promotions.',['要先取得樂隊確認，才加入宣傳。',5,'只用來判斷證據狀態','這句明示現場音樂當時仍未確認；其後會議更取消安排，所以不能寫入廣告。']],
  ["But shhh... it's a secret: see the brand new D79XF at the 2025 Luxury Yacht Expo; sales begin in 2026.",['但這仍是秘密：D79XF 會在 2025 Luxury Yacht Expo 亮相，並於 2026 年開始發售。',5,'只用來判斷證據狀態','2024 的 Adventure Fishing Tour 不可能使用到 2026 年才發售的 D79XF；這句是排除該型號的直接證據。']],
  ['The contractual break day would not be affected.',['合約規定的休息日不受新時間表影響。',3,'合併寫入','這句沒有重述日期；要和 Shane 電郵的 Christmas Day 合併，才能寫出聖誕節休息日仍然有效。']]
]);
for (const unit of printedUnits) {
  if (translationOverrides.has(unit.excerpt)) {
    unit.zh=translationOverrides.get(unit.excerpt);
    unit.prompts['這句在說甚麼']=unit.zh;
  }
  if (decisionOverrides.has(unit.excerpt)) {
    const [zh,type,status,reason]=decisionOverrides.get(unit.excerpt);
    unit.zh=zh;unit.type=type;unit.status=status;
    unit.prompts['這句在說甚麼']=zh;
    unit.prompts['這句有甚麼用']=useFor(type,status,unit.sourcePage,reason);
    unit.prompts['為甚麼採用這個作答決定']=reason;
    unit.prompts['答案可以怎樣處理']=handlingFor(unit);
  }
  if (unit.prompts['為甚麼採用這個作答決定'].length < 24) {
    if (unit.status === '不寫入答案') {
      unit.prompts['為甚麼採用這個作答決定']=`刪去「${unit.excerpt}」後，事故事實、補償安排和新團賣點全部仍可由其他資料完整交代；它沒有增加三項任務要求的內容。`;
    } else if (unit.status === '只用來判斷證據狀態' || unit.status === '只作指路' || unit.status === '只控制語氣／格式') {
      unit.prompts['為甚麼採用這個作答決定']=`單靠「${unit.excerpt}」不能成立一項完整答案；它只決定資料應到哪裏找、屬於哪一題或哪個版本有效。答案的具體內容由較直接的來源提供。`;
    } else {
      unit.prompts['為甚麼採用這個作答決定']=`這句新增「${unit.excerpt}」所表達的內容；若刪去，相關任務會失去這項人物、安排、理由或結果。它仍須按分析所述和同一證據鏈的資料合併，不能脫離上下文照抄。`;
    }
  }
}

const repeatedAdministrative = new Map();
for (let index=printedUnits.length-1;index>=0;index--) {
  const unit=printedUnits[index];
  if(unit.type!==6 || !['Over.','Over and out.','Captain Moby to control.'].includes(unit.excerpt)) continue;
  const kept=repeatedAdministrative.get(unit.excerpt);
  if(kept){kept.occurrences=(kept.occurrences||1)+1;printedUnits.splice(index,1);}
  else repeatedAdministrative.set(unit.excerpt,unit);
}
for(const unit of repeatedAdministrative.values()){
  if((unit.occurrences||1)>1) unit.prompts['為甚麼採用這個作答決定']=`這個相同的無線電行政片語在逐字稿重複 ${unit.occurrences} 次；合併列示可避免重複完整分析，而每次出現都映射到本單位。刪去它不影響事故內容。`;
}
printedUnits.forEach((unit,index)=>{unit.id=`df-${String(index+1).padStart(3,'0')}`;});

const spokenRaw = [
  ['Morning everyone. Welcome to our monthly Zoom meeting. How are we all doing today?','各位早晨，歡迎參加每月 Zoom 會議。大家今天好嗎？',6,'不寫入答案'],
  ['Morning Shane. I am feeling great so far. Thank you.','Shane 早晨。我目前很好，謝謝。',6,'不寫入答案'],
  ['We have quite a bit going on at the moment, so it’s been a busy period for me.','目前有很多事情要處理，所以 Avery 最近很忙。',6,'不寫入答案'],
  ['The Guided Nature Walk at the Hong Kong Wetland Park is coming up soon.','香港濕地公園導賞自然步行團即將舉行。',6,'不寫入答案'],
  ['The Guided Nature Walk will be held on the 27th of April at 10am.','導賞自然步行團於 4 月 27 日上午 10 時舉行。',6,'不寫入答案'],
  ['The walk will be 2 hours long.','步行團長兩小時。',6,'不寫入答案'],
  ['The meeting venue this time will be the visitor centre.','今次集合地點是訪客中心。',6,'不寫入答案'],
  ['We’ll email all the details to the participants soon.','稍後會把所有詳情電郵給參加者。',6,'不寫入答案'],
  ['We are changing the time of the Bird Watching Tour from 7:30am to 9:30am.','觀鳥團時間由上午 7 時 30 分改為 9 時 30 分。',6,'不寫入答案'],
  ['Not enough people are signing up to join the Bird Watching Tour.','觀鳥團報名人數不足。',6,'不寫入答案'],
  ['We’ve had complaints from participants in previous tours that the Bird Watching Tour starts too early.','過往參加者投訴觀鳥團開始得太早。',6,'不寫入答案'],
  ['I was referring to the catamaran accident in Sydney Harbour.','Shane 指的是悉尼港雙體船意外。',5,'只作指路'],
  ['How’s the Review Board’s investigation on Captain Moby going? Have they reached a conclusion yet?','Avery 詢問檢討委員會是否已就 Moby 船長得出結論。',5,'只作指路'],
  ['The conclusion is that Captain Moby is not at fault.','檢討委員會的結論是 Moby 船長沒有過失。',1,'獨立寫入'],
  ['The Review Board has also insisted that we explicitly mention in the incident report that Captain Moby was extremely professional in handling the situation.','檢討委員會要求意外報告明確寫出 Moby 船長處理事件時極為專業。',1,'獨立寫入'],
  ['He is indeed “extremely professional”.','David 重複認同 Moby 船長非常專業。',4,'只保留結論'],
  ['The accident also caused the cancellation of the next Sydney Whale Watching Cruise.','意外亦令下一班悉尼賞鯨船取消。',2,'合併寫入'],
  ['We need to write a follow-up email to them. We should talk about compensation.','公司要向受影響參加者發跟進電郵並交代補償。',5,'只控制語氣／格式'],
  ['As part of the additional compensation package, on top of what we’ve pledged already, we’ll be giving participants of the cancelled cruise lifetime membership of World City Travel.','除已承諾的補償外，取消航程的參加者會獲 World City Travel 終身會籍。',2,'獨立寫入'],
  ['With lifetime membership, participants can get a 30% discount on all tours that we provide. For life!','終身會員一生可享公司所有旅行團七折。',2,'獨立寫入'],
  ['We need to continue promoting the new Insects and Reptiles Exhibition.','公司仍要宣傳新的昆蟲及爬蟲展覽。',6,'不寫入答案'],
  ['We have two very special dragonflies people will encounter at the exhibition.','展覽有兩種特別蜻蜓。',6,'不寫入答案'],
  ['We will have the Red Baller at the exhibition.','展覽會有 Red Baller。',6,'不寫入答案'],
  ['People will get to see the Blue Tail.','參加者會看到 Blue Tail。',6,'不寫入答案'],
  ['The participant with the best dragonfly photo wins 500 dollars.','最佳蜻蜓照片參賽者可贏得 500 元。',6,'不寫入答案'],
  ['Our new Adventure Fishing Tour starts soon in Sydney.','新的 Adventure Fishing Tour 即將在悉尼開始。',5,'只作指路'],
  ['During the Adventure Fishing Tour, the yacht will stop at two white sand beaches.','遊艇會在兩個白沙灘停靠。',3,'獨立寫入'],
  ['Participants can catch shellfish at these stops.','參加者可在這些停靠點捕捉貝類。',3,'獨立寫入'],
  ['We chose these two beaches especially for that.','選擇這兩個沙灘正是因為可以捕捉貝類。',4,'只保留結論'],
  ['Only that we are very lucky to have Avery with us!','David 說公司很幸運有 Avery。',6,'不寫入答案'],
  ['Let’s get to work and prepare the necessary documents.','Shane 叫大家開始準備所需文件。',6,'不寫入答案'],
  ['We’ll meet again on Zoom next month.','他們下月再開 Zoom 會議。',6,'不寫入答案'],
  ['Goodbye for now.','暫時再見。',6,'不寫入答案'],
  ['That is the end of the listening component of this paper.','聆聽部分到此結束。',6,'不寫入答案'],
  ['You will now have one hour and fifteen minutes to complete the written tasks in either Part B1 or Part B2.','考生有一小時十五分鐘完成 B1 或 B2 的書面任務。',6,'不寫入答案']
];

spokenRaw.push(
  ['April 27th at 10am. A very sensible time to meet.','4 月 27 日上午 10 時；這是很合理的集合時間。',6,'不寫入答案'],
  ['Is the meeting venue still the main entrance of the park?','集合地點仍是公園正門嗎？',5,'只作指路'],
  ['We decided that the main entrance is much too busy.','他們認為正門太繁忙。',6,'不寫入答案'],
  ['I agree: the visitor centre is a much better choice.','Shane 同意訪客中心是較好的選擇。',6,'不寫入答案'],
  ['Shall we move on to the Bird Watching Tour at the Hong Kong Botanical Gardens?','他們轉到香港植物公園觀鳥團。',6,'不寫入答案'],
  ['We are planning to write an email to Peter Chan, the manager of the Botanical Gardens.','他們計劃寫電郵給植物公園經理 Peter Chan。',6,'不寫入答案'],
  ['This is a tour we tend to start bright and early in the morning. 7:30am, isn’t it?','觀鳥團向來早上 7 時 30 分開始。',6,'不寫入答案'],
  ['I believe that’s not the case anymore. Am I right, Avery?','David 認為舊時間已改，並向 Avery 確認。',6,'不寫入答案'],
  ['We need to inform Peter Chan of this change in the email.','電郵要通知 Peter Chan 時間改動。',6,'不寫入答案'],
  ['That’s quite a big change. I’m sure Peter will want to know why.','Shane 認為改動很大，Peter 會想知道原因。',6,'不寫入答案'],
  ['We definitely want to increase the number of people signing up.','公司想增加觀鳥團報名人數。',6,'不寫入答案'],
  ['So, you think this is because the Tour starts too early?','Shane 問是否因觀鳥團開始得太早。',6,'不寫入答案'],
  ['If we’ve had complaints that the Tour starts too early, then changing the time is the right decision.','Shane 因早開始的投訴而確認改時間。',6,'不寫入答案'],
  ['That’s settled, then. Anything else I need to know about the tour?','Shane 表示安排已定，並問還有沒有其他資料。',6,'不寫入答案'],
  ['No, I think that’s it.','Avery 表示沒有其他資料。',6,'不寫入答案'],
  ['Captain Moby is a good friend and I heard a little bit about it from him.','Atkinson 說 Moby 是好友，曾從他那裏聽過意外。',5,'只用來判斷證據狀態'],
  ['The catamaran is such a beautiful boat. I hope the damage wasn’t too bad.','Atkinson 覺得船很漂亮，並希望損毀不嚴重。',6,'不寫入答案'],
  ['I’ve been sent the results of the Review Board’s investigation.','Shane 已收到檢討委員會的調查結果。',5,'只作指路'],
  ['He will be so relieved to hear that.','David 認為 Moby 得知沒有過失後會鬆一口氣。',6,'不寫入答案'],
  ['He must have done an amazing job for them to say that.','David 因委員會評語而認為 Moby 表現出色。',4,'只保留結論'],
  ['We’re lucky to have him with our company.','Shane 說公司很幸運有 Moby。',6,'不寫入答案'],
  ['Reputation is everything in our business.','Shane 認為商譽對公司極重要。',4,'合併寫入'],
  ['I don’t want people to have a bad impression of us because of this incident.','Shane 不希望客人因意外對公司留下壞印象。',4,'合併寫入'],
  ['I want to go the extra mile for this.','Shane 想為補償多做一步。',4,'合併寫入'],
  ['Lifetime membership of World City Travel? What does that include?','David 問終身會籍包括甚麼。',5,'只作指路'],
  ['Thirty percent off is an amazing deal. How can I get lifetime membership?','David 稱七折很吸引，並開玩笑問如何加入。',4,'只保留結論'],
  ['Hopefully that will help us put all this behind us.','Shane 希望補償有助公司走出事件。',4,'合併寫入'],
  ['David, you had an idea about the dragonflies in the exhibition. Can you tell us a bit more?','Shane 請 David 介紹展覽蜻蜓構思。',6,'不寫入答案'],
  ['Generally people see a lot of dragonflies around Hong Kong, especially in parks.','香港公園一般可見很多蜻蜓。',6,'不寫入答案'],
  ['You can see pictures of them on the website.','網站可看到兩種蜻蜓的照片。',6,'不寫入答案'],
  ['Red Baller and Blue Tail are very interesting names for very interesting dragonflies.','Shane 覺得兩個蜻蜓名稱很有趣。',6,'不寫入答案'],
  ['To encourage people to look out for them, we will also have a photo-taking competition.','展覽會舉行攝影比賽，鼓勵參加者尋找蜻蜓。',6,'不寫入答案'],
  ['This should add a little excitement for the participants.','David 認為攝影比賽會增加趣味。',6,'不寫入答案'],
  ['Last time, we discussed adding stops along the route. What became of that, Avery?','Shane 問先前討論的停靠點安排結果。',5,'只作指路'],
  ['Two white sand beaches? Any particular reason for this choice?','Shane 問為何選兩個白沙灘。',5,'只作指路'],
  ['Why not on some sort of outlying islands?','Shane 問為何不選離島。',5,'只作指路'],
  ['Choosing places where participants can catch shellfish is very clever.','Shane 認為選擇可捕捉貝類的地點很聰明。',4,'只保留結論'],
  ['I’m sure they’ll love this idea.','Shane 相信參加者會喜歡這個構思。',4,'合併寫入'],
  ['Anything to add, David?','Shane 問 David 有沒有補充。',5,'只作指路'],
  ['We’ll meet again on Zoom next month, but let’s keep in touch in the meantime.','他們下月再開 Zoom 會議，其間保持聯絡。',6,'不寫入答案'],
  ['Goodbye!','再見！',6,'不寫入答案']
);

const spokenUnits = spokenRaw.map(([excerpt, zh, type, status], index) => {
  const unit = {
    id: `ts-${String(index + 1).padStart(3, '0')}`, source: 'TS-WEB', sourcePage: 'Track 8',
    section: 'Zoom meeting (third-party reproduction of official tapescript)', excerpt, zh, type, status,
    prompts: {
      '這句在說甚麼': zh,
      '這句有甚麼用': useFor(type, status, '錄音', ''),
      '為甚麼採用這個作答決定': type === 6
        ? '刪去這句後，三項任務的事故事實、補償安排和新團賣點全部保持完整；它只屬行政或題外支線。'
        : status === '只保留結論'
          ? '這句沒有新增可獨立寫入的事實；較直接的來源已交代同一結論，所以只保留最後結果。'
          : type === 5
            ? '這句是提問、轉題或來源提示，不能單獨成立答案；具體內容要用緊接的回答或被指向的文件。'
            : type === 4
              ? '這句只補充態度或目的；主要事實由其他句子直接提供，刪去它不會令答案失去核心安排。'
              : '如果刪去這句，相關任務會失去一項由會議直接確認的內容；書面資料不能單獨取代這項口頭確認。',
      '答案可以怎樣處理': ''
    }
  };
  unit.prompts['答案可以怎樣處理'] = handlingFor(unit);
  return unit;
});

const qabRaw = [
  [8,'Write an incident report for the catamaran accident.','為雙體船意外撰寫事故報告。','這句決定 Task 8 的文類、主題和內部事實語氣。'],
  [8,'Use information from the B2 Data File and your notes.','使用 B2 資料檔及筆記中的資料。','這句要求把印刷資料與錄音筆記整合；不能只用其中一個來源。'],
  [8,'Write around 140 words.','寫約 140 字。','這句控制篇幅，要求只保留可獨立貢獻的事故事實、成因和調查結果。'],
  [9,'Write a follow-up email to the participants of the cancelled cruise.','向取消航程的參加者撰寫跟進電郵。','這句決定 Task 9 的文類、收件人和安撫目的。'],
  [9,'Use information from the B2 Data File and your notes.','使用 B2 資料檔及筆記中的資料。','這句要求把電郵、日曆、訊息、會議決定和錄音補償資料互相核對。'],
  [9,'Write around 180 words.','寫約 180 字。','這句控制篇幅，應優先寫最後確認的補償、可預訂時段和行動資訊。'],
  [10,'Write a script for a YouTube advertisement about the new Adventure Fishing Tour.','為新的 Adventure Fishing Tour 撰寫 YouTube 廣告稿。','這句決定 Task 10 的文類、宣傳主題和面向觀眾的語氣。'],
  [10,'Use information from the B2 Data File and your notes.','使用 B2 資料檔及筆記中的資料。','這句要求把較後更新套用到日期、遊艇、活動、講解者、餐飲和取消項目。'],
  [10,'Write around 180 words.','寫約 180 字。','這句控制篇幅；廣告要集中已確認賣點，排除未獲確認或已取消的計劃。']
];
const qabUnits=qabRaw.map(([task,excerpt,zh,reason],index)=>({
  id:`qab-${String(index+1).padStart(2,'0')}`,source:'QAB-WEB',sourcePage:`Task ${task}`,section:`Task ${task} contract (third-party reproduction)`,excerpt,zh,type:5,status:'只控制語氣／格式',
  prompts:{'這句在說甚麼':zh,'這句有甚麼用':`這句控制 Task ${task} 的文類、資料範圍或篇幅。`,'為甚麼採用這個作答決定':reason,'答案可以怎樣處理':'用它控制選材、語氣和篇幅；不要把題目指示抄進成品正文。'}
}));

const visualUnits = [
  {id:'visual-01',source:'DF-SCAN',sourcePage:6,section:'Sydney Times article',kind:'visual',title:'Catamaran photograph and caption',schema:{visualDescription:'報章文章旁有一張雙體船在水上的照片。',embeddedText:'Photo: The World City Travel catamaran before the crash',relationship:'照片只辨認涉事船隻及拍攝時間狀態；沒有顯示撞擊經過或損毀程度。',taskUse:'可協助理解文章所指船隻，不能用照片推斷事故成因。',answerAction:'不寫入答案'}},
  {id:'visual-02',source:'DF-SCAN',sourcePage:7,section:'SMS messages',kind:'visual',title:'SMS chronology',schema:{visualDescription:'左右訊息泡按 3 月 31 日時間順序排列。',embeddedText:'10:53am, 11:01am, 11:05am, 11:07am, 11:08am, 11:31am',relationship:'說話者、時間及相鄰回覆決定代名詞和「reminder」所指內容。',taskUse:'必須把 Atkinson 的宣傳要求與 Moby 的事故資料分開。',answerAction:'只用來判斷證據狀態'}},
  {id:'visual-03',source:'DF-SCAN',sourcePage:8,section:'Booking calendar',kind:'visual',title:'Cruise availability calendar',schema:{visualDescription:'四個月份各分四周，圖例以不同底色標示可預訂及不可預訂。',embeddedText:'April–July; Week 1–Week 4; Dates available; Dates unavailable',relationship:'四月全部不可預訂；五月只有第 1、2 周可預訂；六月及七月全部可預訂。',taskUse:'Task 9 要把免費替代航程限制在仍有空位的時段。',answerAction:'獨立寫入'}},
  {id:'visual-04',source:'DF-SCAN',sourcePage:9,section:'Luxury Yachts brochure',kind:'visual',title:'Three-yacht comparison',schema:{visualDescription:'三個型號各配一張遊艇照片及文字規格。',embeddedText:'D69X; D79X; D79XF Fishing Cruiser',relationship:'D79X 比 D69X 快 10 節並有露台和內置水療；D79XF 到 2026 才開售。',taskUse:'結合傳記的 “supercar of the sea” 才能選定 D79X；不能因 D79XF 名稱含 Fishing 就選它。',answerAction:'合併寫入'}},
  {id:'visual-05',source:'DF-SCAN',sourcePage:9,section:'Luxury Yachts brochure',kind:'visual',title:'Model availability absence',schema:{visualDescription:'D79XF 欄明示 2025 展覽亮相、2026 才開售。',embeddedText:'see the brand new D79XF at the 2025 Luxury Yacht Expo; sales begin in 2026',relationship:'2024 的新團不可能使用尚未發售的型號。',taskUse:'這項缺席／不可用關係排除 D79XF。',answerAction:'只用來判斷證據狀態'}},
  {id:'visual-06',source:'DF-SCAN',sourcePage:11,section:'Last-page notice',kind:'visual',title:'Last-page and source notice',schema:{visualDescription:'頁底標明 B2 Data File 已到最後一頁，並附材料來源聲明。',embeddedText:'THIS IS THE LAST PAGE OF THE PART B2 DATA FILE',relationship:'只證明檔案結束及版權來源稍後鳴謝。',taskUse:'不提供任何三項任務內容。',answerAction:'不寫入答案'}}
];

const exclusions = [
  {id:'missing-cover',source:'DF-SCAN',location:'printed page 1',mapping:'documented exclusion',reason:'The official cover is absent from the supplied scan; it is not recreated from a third-party copy.'},
  {id:'handwriting',source:'DF-SCAN',location:'printed page 3 handwriting',mapping:'documented exclusion',reason:'Later third-party annotation; not authentic candidate-visible printed text.'},
  {id:'contents-list',source:'DF-SCAN',location:'printed page 2 contents list',mapping:'section headings and page relationships',reason:'Represented by every section title and source-page relationship in the unit ledger.'},
  {id:'paper-furniture',source:'DF-SCAN',location:'pages 2–11 paper codes and page numbers',mapping:'documented exclusion',reason:'Repeated administrative furniture; inspected and recorded in the page proof, not duplicated as answer units.'}
  ,{id:'recording-administration',source:'TS-WEB',location:'Track 7–8 transition and recording furniture',mapping:'documented exclusion',reason:'Tone, pauses, five minutes of Greensleeves, turn-page instructions, earphone instructions and the final timing announcement are administrative audio rather than meeting propositions; representative exact announcements are retained as Type 6 units.'}
];

const data = {
  meta: {
    title:'2024 DSE Paper 3 Part B2', status:'UNCERTIFIED', generated:'2026-11-12',
    questionUnits: qabUnits.length, printedUnits: printedUnits.length, spokenUnits: spokenUnits.length, visualUnits: visualUnits.length,
    provenance:'audit/provenance.md', reviews:{nativeReader:'NOT RUN',studentWithoutScheme:'NOT RUN',projectOwner:'NOT RUN',modelCongruence:'NOT CLAIMED — only third-party benchmark models are available'}
  },
  tasks:[
    {id:8,genre:'Internal incident report',words:'around 140',sourceStatus:'third-party-reproduced official wording'},
    {id:9,genre:'Follow-up email to cancelled-cruise participants',words:'around 180',sourceStatus:'third-party-reproduced official wording'},
    {id:10,genre:'YouTube advertisement script for the Adventure Fishing Tour',words:'around 180',sourceStatus:'third-party-reproduced official wording'}
  ],
  units:[...qabUnits,...printedUnits,...spokenUnits],visualUnits,exclusions
};

fs.mkdirSync(outDir, {recursive:true});
fs.writeFileSync(path.join(outDir,'analysis-data.js'), `window.PAPER3_2024_B2 = ${JSON.stringify(data, null, 2)};\n`);
fs.writeFileSync(path.join(outDir,'audit','unit-ledger.json'), `${JSON.stringify({meta:data.meta,units:data.units.map(({prompts,...unit})=>({...unit,mappedTo:'learner-facing unit'})),visualUnits,exclusions}, null, 2)}\n`);
console.log(JSON.stringify({printed:printedUnits.length,spoken:spokenUnits.length,visual:visualUnits.length,exclusions:exclusions.length}));
