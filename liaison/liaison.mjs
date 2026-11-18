const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const SESSION_KEY = "edmund-liaison-session-v1";
const PROGRESS_PREFIX = "edmund-liaison-pilot-progress-v1:";
let authGeneration = 0;

const sound = (title, anchor, audio) => ({ title, anchor, audio });
const directChoices = phrase => [
  sound("順滑連接", "前一字的結尾直接流入下一字", phrase),
  sound("中間停頓", "兩個字之間有明顯分隔", phrase.replace(" ", ". ")),
  sound("加入額外聲音", "在兩個字之間加上原本沒有的聲音", `the words ${phrase}`)
];
const smoothChoice = (title, anchor, audio) => sound(title, anchor, audio);

const questions = [
  {
    id: 1, group: "直接連接", phrase: "An egg fell.", focus: "an + egg",
    prompt: "哪一個積木最能表達這兩個字的自然連接？",
    choices: directChoices("an egg"), answer: 0, accepted: [0],
    feedback: "保留 an 的結尾，然後直接進入 egg；不需要停頓或加入其他聲音。"
  },
  {
    id: 2, group: "直接連接", phrase: "Pick it up.", focus: "pick + it",
    prompt: "把 pick 的字尾接到 it 時，應選哪個聲音積木？",
    choices: directChoices("pick it"), answer: 0, accepted: [0],
    feedback: "pick 的字尾與 it 的開頭可以緊密相連，但兩個字在書寫上仍然分開。"
  },
  {
    id: 3, group: "直接連接", phrase: "Come in, please.", focus: "come + in",
    prompt: "哪個版本最適合普通、流暢的邀請？",
    choices: directChoices("come in"), answer: 0, accepted: [0],
    feedback: "come 的結尾可直接帶入 in，不必在字界重新起音。"
  },
  {
    id: 4, group: "直接連接", phrase: "Read it aloud.", focus: "read + it",
    prompt: "選出最自然的字界處理方式。",
    choices: directChoices("read it"), answer: 0, accepted: [0],
    feedback: "read 的字尾接向 it 的開頭；說得清楚不等於每個字都要停一下。"
  },
  {
    id: 5, group: "輕微過渡", phrase: "See it clearly.", focus: "see + it",
    prompt: "兩個母音相遇時，哪個積木可以幫助它們順滑過渡？",
    choices: [
      sound("像 YES 開頭的輕微過渡", "只是一個很輕的口形移動", "yes"),
      sound("直接平順連接", "不刻意突出額外聲音", "see it"),
      sound("像 WE 開頭的過渡", "嘴唇先明顯收圓", "we")
    ], answer: 0, accepted: [0, 1],
    feedback: "see 後面可出現像 yes 開頭的輕微過渡；直接平順連接也可以。"
  },
  {
    id: 6, group: "輕微過渡", phrase: "They are here.", focus: "they + are",
    prompt: "選出常見的自然過渡聲音。",
    choices: [
      sound("像 YES 開頭的輕微過渡", "口形向下一個母音平順移動", "yes"),
      sound("直接平順連接", "不強調任何橋接聲音", "they are"),
      sound("像 RED 開頭的橋接", "加入明顯的 R 聲音", "red")
    ], answer: 0, accepted: [0, 1],
    feedback: "they 的結尾位置接近 yes 開頭，因此可自然帶出很輕的過渡。"
  },
  {
    id: 7, group: "輕微過渡", phrase: "Go out now.", focus: "go + out",
    prompt: "哪一個積木符合嘴唇由 go 移向 out 的動作？",
    choices: [
      sound("像 WE 開頭的輕微過渡", "嘴唇保持圓形後再打開", "we"),
      sound("直接平順連接", "過渡很輕，沒有獨立聲音", "go out"),
      sound("像 YES 開頭的過渡", "嘴角向兩邊拉開", "yes")
    ], answer: 0, accepted: [0, 1],
    feedback: "go 結尾時嘴唇較圓，接 out 時可能帶出像 we 開頭的輕微過渡。"
  },
  {
    id: 8, group: "輕微過渡", phrase: "Do it now.", focus: "do + it",
    prompt: "選出 do 與 it 之間常見的過渡。",
    choices: [
      sound("像 WE 開頭的輕微過渡", "圓唇位置順滑移向 it", "we"),
      sound("直接平順連接", "不刻意突出橋接聲音", "do it"),
      sound("像 RED 開頭的橋接", "加入 R 聲音", "red")
    ], answer: 0, accepted: [0, 1],
    feedback: "do 後面可有像 we 開頭的輕微口形過渡；不要把它說成一個額外單字。"
  },
  {
    id: 9, group: "R 橋接", phrase: "There is a chair.", focus: "there + is",
    prompt: "部分英式口音會怎樣把 there 和 is 接起來？",
    choices: [
      sound("把 R 聲音帶過字界", "像 RED 開頭的聲音連到 is", "red"),
      sound("沒有突出的 R 橋接", "其他自然口音可以採用這個版本", "there is"),
      sound("加入像 WE 開頭的過渡", "嘴唇收圓後進入 is", "we")
    ], answer: 0, accepted: [0, 1],
    feedback: "部分非捲舌英式口音會把 there 的 R 聲音帶到 is；其他自然口音可以不同。"
  },
  {
    id: 10, group: "R 橋接", phrase: "Law and order matters.", focus: "law + and",
    prompt: "部分英式口音可能在 law 和 and 之間使用哪個積木？",
    choices: [
      sound("像 RED 開頭的橋接", "兩個母音之間出現輕微 R 聲音", "red"),
      sound("直接連接，沒有 R 橋接", "同樣可以是自然讀法", "law and order"),
      sound("像 YES 開頭的橋接", "加入明顯 Y 聲音", "yes")
    ], answer: 0, accepted: [0, 1],
    feedback: "這個 R 橋接受口音影響，並非所有學生都需要使用。"
  },
  {
    id: 11, group: "相同聲音", phrase: "It takes time.", focus: "it + takes",
    prompt: "兩個相同的字界聲音相遇時，選哪個時間積木？",
    choices: [
      sound("保持一次較長的口形", "連續保持後才進入下一個母音", "it takes"),
      sound("做兩次很強的爆破", "每個字都完全重新開始", "it. takes"),
      sound("把兩個聲音全部刪除", "字界完全沒有阻隔", "i takes")
    ], answer: 0, accepted: [0],
    feedback: "兩個相同聲音可以共用一次較長的口形，不需要誇張地分開兩次。"
  },
  {
    id: 12, group: "相同聲音", phrase: "He looks sad.", focus: "looks + sad",
    prompt: "兩個相同的摩擦聲音相遇時，應怎樣處理？",
    choices: [
      sound("保持一段較長的聲音", "聲音跨過字界但不中斷", "looks sad"),
      sound("完全停下再開始", "在字界加入明顯靜音", "looks. sad"),
      sound("改成像 SHOE 開頭", "把兩個聲音合成另一種聲音", "shoe")
    ], answer: 0, accepted: [0],
    feedback: "兩個相同聲音可以連成一段稍長的聲音；原本兩個字仍然存在。"
  },
  {
    id: 13, group: "相同聲音", phrase: "Ann needs help.", focus: "Ann + needs",
    prompt: "選出最省力而清楚的自然連接。",
    choices: [
      sound("保持同一舌位稍久", "不用離開後再重新放回", "Ann needs"),
      sound("加入像 RED 開頭的聲音", "在兩字之間加 R", "red"),
      sound("刪除 Ann 的結尾", "只保留 needs 的開頭", "A needs")
    ], answer: 0, accepted: [0],
    feedback: "舌頭可以保持在相近位置，把兩個相同聲音連成一段。"
  },
  {
    id: 14, group: "口形預備", phrase: "Ten pens are here.", focus: "ten + pens",
    prompt: "嘴唇為 pens 預備時，ten 的結尾可能靠近哪個參考積木？",
    choices: [
      sound("像 MAP 開頭的嘴唇位置", "雙唇提早合上", "map"),
      sound("保留 TEN 的清楚結尾", "慢速或仔細說話也可以", "ten"),
      sound("像 SING 結尾的後口位置", "舌頭移到口腔後方", "sing")
    ], answer: 0, accepted: [0, 1],
    feedback: "pens 以雙唇動作開始，所以 ten 的結尾可能提早轉成像 map 開頭的嘴唇位置。"
  },
  {
    id: 15, group: "口形預備", phrase: "Green bags are on sale.", focus: "green + bags",
    prompt: "bags 開頭要合上雙唇；哪個積木可表示前一聲音的自然變化？",
    choices: [
      sound("像 MAP 開頭的嘴唇位置", "前一個聲音提早配合 bags", "map"),
      sound("保留 GREEN 的清楚結尾", "較仔細的版本仍然正確", "green"),
      sound("像 YES 開頭的過渡", "把舌位移向前方", "yes")
    ], answer: 0, accepted: [0, 1],
    feedback: "快速說話時，嘴唇可能提早為 bags 準備；清楚保留原聲也可以。"
  },
  {
    id: 16, group: "口形預備", phrase: "Ten cats slept.", focus: "ten + cats",
    prompt: "cats 在口腔後方開始；ten 的結尾可能靠近哪個積木？",
    choices: [
      sound("像 SING 結尾的後口位置", "舌頭提早移向口腔後方", "sing"),
      sound("保留 TEN 的清楚結尾", "較慢的版本仍可接受", "ten"),
      sound("像 MAP 開頭的嘴唇位置", "雙唇完全合上", "map")
    ], answer: 0, accepted: [0, 1],
    feedback: "為 cats 的開頭預備時，舌頭可能提早向後移；這是自然但可選的變化。"
  },
  {
    id: 17, group: "口形預備", phrase: "One girl smiled.", focus: "one + girl",
    prompt: "girl 的開頭會令 one 的結尾可能靠近哪個聲音位置？",
    choices: [
      sound("像 SING 結尾的後口位置", "舌頭提早向後準備", "sing"),
      sound("保留 ONE 的清楚結尾", "仔細說話時可以保持", "one"),
      sound("像 MAP 開頭的嘴唇位置", "雙唇提早合上", "map")
    ], answer: 0, accepted: [0, 1],
    feedback: "girl 在口腔後方開始，前一個聲音可受它影響而向後移。"
  },
  {
    id: 18, group: "聲音融合", phrase: "Nice to meet you.", focus: "meet + you",
    prompt: "自然快讀時，字界可融合成像哪個熟悉單字開頭的聲音？",
    choices: [
      sound("像 CHAIR 開頭", "兩個字界聲音融合成一個動作", "chair"),
      sound("保持兩個聲音清楚", "仔細讀法同樣正確", "meet you"),
      sound("像 JAM 開頭", "改成另一個融合聲音", "jam")
    ], answer: 0, accepted: [0, 1],
    feedback: "meet you 可以融合成像 chair 開頭的聲音；保持兩個聲音較清楚也正確。"
  },
  {
    id: 19, group: "聲音融合", phrase: "Did you call?", focus: "did + you",
    prompt: "自然快讀時，哪個參考積木最接近常見的融合結果？",
    choices: [
      sound("像 JAM 開頭", "兩個字界聲音融合成一個動作", "jam"),
      sound("保持兩個聲音清楚", "慢速或強調 you 時常見", "did you"),
      sound("像 CHAIR 開頭", "選用另一個融合聲音", "chair")
    ], answer: 0, accepted: [0, 1],
    feedback: "did you 可融合成像 jam 開頭的聲音；本系統不要求每次都融合。"
  },
  {
    id: 20, group: "聲音融合", phrase: "I miss you.", focus: "miss + you",
    prompt: "哪一個熟悉聲音最接近這組字的常見融合版本？",
    choices: [
      sound("像 SHOE 開頭", "氣流由字尾順滑移向 you", "shoe"),
      sound("保持兩個聲音清楚", "較慢的版本仍然正確", "miss you"),
      sound("像 JAM 開頭", "使用另一個融合聲音", "jam")
    ], answer: 0, accepted: [0, 1],
    feedback: "miss you 在自然語流中可融合成像 shoe 開頭的聲音。"
  },
  {
    id: 21, group: "聲音融合", phrase: "Where's your bag?", focus: "where's + your",
    prompt: "選出常見融合聲音的參考積木。",
    choices: [
      sound("像 VISION 中間", "聲帶保持震動的柔和融合聲音", "vision"),
      sound("保持兩個聲音清楚", "仔細讀法同樣可以", "where's your"),
      sound("像 SHOE 開頭", "使用不震動的融合聲音", "shoe")
    ], answer: 0, accepted: [0, 1],
    feedback: "where's your 可融合成像 vision 中間的聲音；清楚分開也是可接受版本。"
  },
  {
    id: 22, group: "聲音淡化", phrase: "Last night was cold.", focus: "last + night",
    prompt: "多個子音擠在一起時，last 的最後部分可怎樣處理？",
    choices: [
      sound("變得很輕或不明顯", "自然快讀時可能難以聽見", "last night"),
      sound("清楚保留結尾", "慢速或強調時仍然正確", "last. night"),
      sound("刪去整個 LAST", "句子只剩 night was cold", "night was cold")
    ], answer: 0, accepted: [0, 1],
    feedback: "last 的最後聲音在這個子音組合中可能變得不明顯，但不是把整個字刪去。"
  },
  {
    id: 23, group: "聲音淡化", phrase: "My old friend called.", focus: "old + friend",
    prompt: "old 的字尾遇到 friend 時，哪個積木表示常見的自然變化？",
    choices: [
      sound("字尾變得很輕", "口形直接準備 friend", "old friend"),
      sound("清楚保留字尾", "較仔細讀法也可以", "old. friend"),
      sound("刪去 OLD", "改變原句意思", "my friend called")
    ], answer: 0, accepted: [0, 1],
    feedback: "old 的最後聲音可變得很輕；是否明顯會受速度和強調影響。"
  },
  {
    id: 24, group: "聲音淡化", phrase: "Tell him now.", focus: "tell + him",
    prompt: "him 不重讀時，開頭可以怎樣變化？",
    choices: [
      sound("開頭變得很輕", "tell 直接流入 him 的主要部分", "tell him"),
      sound("清楚保留 HIM 的開頭", "強調 him 時很自然", "tell him now"),
      sound("刪去整個 HIM", "句子改成 tell now", "tell now")
    ], answer: 0, accepted: [0, 1],
    feedback: "him 不重讀時，開頭可能很輕；強調 HIM 時則通常更清楚。"
  },
  {
    id: 25, group: "小字縮短", phrase: "A cup of tea.", focus: "of",
    prompt: "句中不重要的小字 of 最常使用哪個積木？",
    choices: [
      sound("短而輕的 OF", "讓 cup 和 tea 成為較突出的字", "a cup of tea"),
      sound("完整而強調的 OF", "對比材料時可以使用", "made of glass"),
      sound("完全刪去 OF", "句子失去需要的連接字", "a cup tea")
    ], answer: 0, accepted: [0, 1],
    feedback: "普通句子中的 of 通常很短；特別對比時才會讀得較完整。"
  },
  {
    id: 26, group: "小字縮短", phrase: "I can swim.", focus: "can",
    prompt: "如果重點在 swim，can 應選哪個聲音積木？",
    choices: [
      sound("短而輕的 CAN", "把重點留給 swim", "I can swim"),
      sound("強調的 CAN", "像短答 Yes, I can", "Yes, I can"),
      sound("完全沒有 CAN", "句子意思改變", "I swim")
    ], answer: 0, accepted: [0],
    feedback: "當重點在 swim，can 通常較短；短答或對比時才讀得完整。"
  },
  {
    id: 27, group: "小字縮短", phrase: "Bread and butter.", focus: "and",
    prompt: "普通列舉中，and 最常選哪個積木？",
    choices: [
      sound("短而輕的 AND", "快速連接兩個主要項目", "bread and butter"),
      sound("完整而強調的 AND", "強調兩樣都要時可以使用", "bread and butter, both"),
      sound("加入一個新單字", "改變原本的列舉", "bread with butter")
    ], answer: 0, accepted: [0, 1],
    feedback: "普通列舉中的 and 通常很短；要強調兩項都包括時可讀得完整。"
  },
  {
    id: 28, group: "固定短讀", phrase: "I have to leave.", focus: "have + to",
    prompt: "表示必須時，have to 的字界聲音可能靠近哪個參考字開頭？",
    choices: [
      sound("像 FUN 開頭的氣流", "字界配合下一個聲音而變得較輕", "fun"),
      sound("清楚讀出 HAVE TO", "仔細版本同樣正確", "I have to leave"),
      sound("像 JAM 開頭", "把字界融合成另一種聲音", "jam")
    ], answer: 0, accepted: [0, 1],
    feedback: "表示必須的 have to 常帶出像 fun 開頭的氣流；清楚讀法也正確。"
  },
  {
    id: 29, group: "先聽真實首音", phrase: "Wait an hour.", focus: "an + hour",
    prompt: "hour 的第一個真實聲音應使用哪個積木？",
    choices: [
      sound("直接由開口母音開始", "像說 hour 本身，沒有 H 聲音", "hour"),
      sound("像 HOUSE 開頭", "先明顯呼出 H 聲音", "house"),
      sound("像 YES 開頭", "先加入 Y 聲音", "yes")
    ], answer: 0, accepted: [0],
    feedback: "hour 在普通標準讀法中沒有 H 聲音，所以 an 的結尾直接接向開口母音。"
  },
  {
    id: 30, group: "混合挑戰", phrase: "There are two eggs.", focus: "two + eggs",
    prompt: "只看 two 和 eggs：哪一個過渡積木最合適？",
    choices: [
      sound("像 WE 開頭的輕微過渡", "圓唇位置順滑移向 eggs", "we"),
      sound("直接平順連接", "過渡非常輕，不突出額外聲音", "two eggs"),
      sound("像 RED 開頭的橋接", "在 two 和 eggs 之間加 R", "red")
    ], answer: 0, accepted: [0, 1],
    feedback: "two 結尾時嘴唇較圓，因此可帶出像 we 開頭的輕微過渡；直接平順連接也可以。"
  }
];

const state = {
  user: null,
  token: "",
  completed: new Set(),
  selections: new Map(),
  recorder: null,
  recordingCard: null,
  recordingStream: null,
  chunks: []
};

const views = Object.fromEntries($$("[data-view]").map(view => [view.dataset.view, view]));

function showView(name) {
  Object.entries(views).forEach(([id, view]) => { view.hidden = id !== name; });
  const loggedIn = Boolean(state.user && state.token);
  $("[data-student]").hidden = !loggedIn;
  $("[data-logout]").hidden = !loggedIn;
  $("[data-account-status]").textContent = loggedIn ? "已登入" : "學生帳戶";
  if (loggedIn) $("[data-student]").textContent = state.user.name;
}

async function rpc(name, args) {
  const config = window.EDMUND_SUPABASE || {};
  if (!config.url || !config.anonKey) throw Error("登入服務暫時未能載入，請重新整理頁面。");
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  let response;
  try {
    response = await fetch(`${config.url}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: { apikey: config.anonKey, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
      credentials: "omit",
      signal: controller.signal
    });
  } catch (error) {
    if (error?.name === "AbortError") throw Error("登入服務回應逾時，請再試一次。");
    throw Error("登入服務暫時未能連接，請檢查網絡後重試。");
  } finally {
    window.clearTimeout(timeout);
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw Error(data?.message || "登入服務暫時未能連接。");
  return Array.isArray(data) ? data[0] : data;
}

function progressKey() {
  return `${PROGRESS_PREFIX}${state.user?.id || "student"}`;
}

function saveProgress() {
  if (!state.user) return;
  try { localStorage.setItem(progressKey(), JSON.stringify({ completed: [...state.completed] })); } catch { /* Progress can remain in memory. */ }
}

function loadProgress() {
  state.completed.clear();
  if (!state.user) return;
  try {
    const saved = JSON.parse(localStorage.getItem(progressKey()) || "null");
    for (const id of saved?.completed || []) {
      if (questions.some(question => question.id === Number(id))) state.completed.add(Number(id));
    }
  } catch { /* Invalid drafts are ignored. */ }
}

function remember(row, token) {
  state.user = { id: String(row.id || ""), name: String(row.name || "Student"), role: "student" };
  state.token = String(token || row.session_token || "");
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...state.user, token: state.token })); } catch { /* Session continues in memory. */ }
  try { window.EdmundSystemNav?.rememberStudentSession?.({ ...state.user, token: state.token }); } catch { /* Shared navigation is optional. */ }
  loadProgress();
  renderCompletionState();
}

function forget() {
  authGeneration += 1;
  stopRecording();
  state.user = null;
  state.token = "";
  state.completed.clear();
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Ignore storage failures. */ }
  try { window.EdmundSystemNav?.forgetStudentSession?.(); } catch { /* Shared navigation is optional. */ }
  showView("login");
}

async function restore() {
  const generation = authGeneration;
  let shared = null;
  let own = null;
  try { shared = window.EdmundSystemNav?.getStudentSession?.(); } catch { /* No shared session. */ }
  try { own = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { /* No local session. */ }
  const candidate = shared?.role === "student" ? shared : own?.role === "student" ? own : null;
  if (!candidate?.token) return false;
  const row = await rpc("flashcard_student_session_profile", { p_token: String(candidate.token) });
  if (generation !== authGeneration) return false;
  if (!row?.session_token || !row?.name) throw Error("登入時段已失效，請重新登入。");
  remember(row, row.session_token);
  showView("practice");
  return true;
}

function chooseVoice() {
  const voices = speechSynthesis.getVoices();
  return voices.find(voice => /^en-(GB|HK)/i.test(voice.lang))
    || voices.find(voice => /^en-/i.test(voice.lang))
    || null;
}

function speak(text, rate = 0.82) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(String(text));
  utterance.lang = "en-GB";
  utterance.rate = rate;
  utterance.pitch = 1;
  const voice = chooseVoice();
  if (voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
}

function waveMarkup() {
  return '<span class="wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
}

function renderQuestion(question) {
  const card = document.createElement("article");
  card.className = "question-card";
  card.id = `liaison-question-${question.id}`;
  card.dataset.question = String(question.id);
  card.innerHTML = `
    <div class="question-meta"><span>QUESTION ${String(question.id).padStart(2, "0")} · ${question.group}</span><span>1 POINT</span></div>
    <div class="phrase-row"><h3 lang="en">${question.phrase}</h3><button class="play-phrase" type="button">▶ 播放句子</button></div>
    <p class="question-focus">練習位置：<strong lang="en">${question.focus}</strong></p>
    <p class="question-prompt">${question.prompt}</p>
    <div class="sound-options" role="group" aria-label="聲音積木選項"></div>
    <div class="question-actions"><button class="check-button" type="button" disabled>檢查選擇</button><span class="answer-status" role="status" aria-live="polite"></span></div>
    <div class="feedback" hidden><strong></strong><span></span></div>
    <div class="practice-tools" hidden>
      <button class="play-phrase" type="button" data-play-model>▶ 再聽示範</button>
      <button class="record-button" type="button" data-record>● 錄下自己</button>
      <audio controls data-recording-playback hidden></audio>
      <small>錄音只保留在此瀏覽器，不會上載。</small>
    </div>`;

  const optionRoot = card.querySelector(".sound-options");
  question.choices.forEach((choice, index) => {
    const option = document.createElement("article");
    option.className = "sound-option";
    option.dataset.choice = String(index);
    option.dataset.selected = "false";
    option.innerHTML = `
      <div class="sound-option__top"><span class="sound-option__number">${String.fromCharCode(65 + index)}</span>${waveMarkup()}</div>
      <button class="sound-option__select" type="button" aria-pressed="false"><strong>${choice.title}</strong><span>${choice.anchor}</span></button>
      <button class="sound-play" type="button">▶ 試聽積木</button>`;
    option.querySelector(".sound-option__select").addEventListener("click", () => selectChoice(card, question, index));
    option.querySelector(".sound-play").addEventListener("click", () => speak(choice.audio, .72));
    optionRoot.append(option);
  });

  card.querySelector(".play-phrase").addEventListener("click", () => speak(question.phrase));
  card.querySelector("[data-play-model]").addEventListener("click", () => speak(question.phrase));
  card.querySelector(".check-button").addEventListener("click", () => checkQuestion(card, question));
  card.querySelector("[data-record]").addEventListener("click", event => toggleRecording(card, question, event.currentTarget));
  return card;
}

function selectChoice(card, question, index) {
  state.selections.set(question.id, index);
  card.querySelectorAll(".sound-option").forEach((option, optionIndex) => {
    const selected = optionIndex === index;
    option.dataset.selected = String(selected);
    option.querySelector(".sound-option__select").setAttribute("aria-pressed", String(selected));
  });
  card.querySelector(".check-button").disabled = false;
  card.querySelector(".answer-status").textContent = `已選擇 ${String.fromCharCode(65 + index)}`;
}

function checkQuestion(card, question) {
  const selected = state.selections.get(question.id);
  if (selected === undefined) return;
  const accepted = question.accepted.includes(selected);
  const preferred = selected === question.answer;
  const feedback = card.querySelector(".feedback");
  feedback.hidden = false;
  feedback.dataset.state = accepted ? "correct" : "retry";
  feedback.querySelector("strong").textContent = accepted
    ? preferred ? "正確：這是本題的目標聲音積木。" : "正確：這也是自然可接受的版本。"
    : "再試一次：先重聽句子和每個積木。";
  feedback.querySelector("span").textContent = accepted
    ? preferred ? question.feedback : `${question.feedback} 你選擇的是另一個合理版本。`
    : "留意字界兩邊的口形和句子的重點，再選一次。";
  card.querySelector(".practice-tools").hidden = !accepted;
  if (accepted) {
    state.completed.add(question.id);
    card.classList.add("is-complete");
    card.querySelector(".answer-status").textContent = "已完成";
    saveProgress();
    updateProgress();
  }
  feedback.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function updateProgress() {
  const count = state.completed.size;
  const percent = Math.round(count / questions.length * 100);
  $("[data-progress-label]").textContent = `已完成 ${count} / ${questions.length}`;
  $("[data-progress-percent]").textContent = `${percent}%`;
  $("[data-progress-bar]").style.width = `${percent}%`;
  $("[data-completion]").hidden = count !== questions.length;
}

function renderCompletionState() {
  $$("[data-question]").forEach(card => {
    const completed = state.completed.has(Number(card.dataset.question));
    card.classList.toggle("is-complete", completed);
    if (completed) card.querySelector(".answer-status").textContent = "已完成";
  });
  updateProgress();
}

async function startRecording(card, question, button) {
  if (!navigator.mediaDevices?.getUserMedia || !("MediaRecorder" in window)) {
    button.textContent = "此瀏覽器不支援錄音";
    button.disabled = true;
    return;
  }
  if (state.recorder) stopRecording();
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    state.recorder = recorder;
    state.recordingCard = card;
    state.recordingStream = stream;
    state.chunks = [];
    recorder.addEventListener("dataavailable", event => { if (event.data.size) state.chunks.push(event.data); });
    recorder.addEventListener("stop", () => {
      const blob = new Blob(state.chunks, { type: recorder.mimeType || "audio/webm" });
      const playback = card.querySelector("[data-recording-playback]");
      if (playback.dataset.objectUrl) URL.revokeObjectURL(playback.dataset.objectUrl);
      const url = URL.createObjectURL(blob);
      playback.dataset.objectUrl = url;
      playback.src = url;
      playback.hidden = false;
      button.textContent = "● 重新錄音";
      stream.getTracks().forEach(track => track.stop());
      state.recorder = null;
      state.recordingCard = null;
      state.recordingStream = null;
      state.chunks = [];
    });
    recorder.start();
    button.textContent = "■ 停止錄音";
    button.dataset.recording = "true";
    button.setAttribute("aria-label", `停止錄製 ${question.phrase}`);
  } catch {
    button.textContent = "未能使用咪高峰";
  }
}

function stopRecording() {
  if (state.recorder?.state === "recording") state.recorder.stop();
  state.recordingStream?.getTracks().forEach(track => track.stop());
  const button = state.recordingCard?.querySelector("[data-record]");
  if (button) {
    button.dataset.recording = "false";
    button.removeAttribute("aria-label");
  }
}

function toggleRecording(card, question, button) {
  if (state.recorder && state.recordingCard === card) {
    stopRecording();
    return;
  }
  void startRecording(card, question, button);
}

const questionRoot = $("[data-question-list]");
questionRoot.replaceChildren(...questions.map(renderQuestion));
updateProgress();

$("[data-login-form]").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = $("[data-login-status]");
  const button = $("[data-login-button]");
  const values = new FormData(form);
  const username = String(values.get("username") || "").trim();
  const password = String(values.get("password") || "");
  if (!username || !password) {
    status.textContent = "請輸入學生名稱及密碼。";
    status.dataset.state = "error";
    return;
  }
  const generation = ++authGeneration;
  const originalLabel = button.textContent;
  status.textContent = "正在驗證學生帳戶…";
  status.dataset.state = "pending";
  button.disabled = true;
  button.textContent = "正在登入…";
  try {
    const row = await rpc("flashcard_student_login", { p_name: username, p_password: password });
    if (generation !== authGeneration) return;
    if (!row?.session_token) throw Error("學生帳戶或密碼不正確。");
    remember(row, row.session_token);
    form.reset();
    status.textContent = "登入成功。";
    status.dataset.state = "complete";
    showView("practice");
  } catch (error) {
    if (generation === authGeneration) {
      status.textContent = error?.message || "登入失敗，請再試一次。";
      status.dataset.state = "error";
    }
  } finally {
    if (generation === authGeneration) {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  }
});

$("[data-password-toggle]").addEventListener("click", event => {
  const input = $("[name='password']");
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  event.currentTarget.textContent = show ? "隱藏" : "顯示";
  event.currentTarget.setAttribute("aria-pressed", String(show));
});

$("[data-start-practice]").addEventListener("click", () => $("[data-question-section]").scrollIntoView({ behavior: "smooth" }));
$("[data-review-from-start]").addEventListener("click", () => $("#liaison-question-1").scrollIntoView({ behavior: "smooth" }));
$("[data-logout]").addEventListener("click", forget);
$("[data-reset-progress]").addEventListener("click", () => {
  if (!confirm("確定重設這個裝置上的 30 題完成記錄？")) return;
  try { localStorage.removeItem(progressKey()); } catch { /* Ignore storage failures. */ }
  state.completed.clear();
  state.selections.clear();
  $$("[data-question]").forEach(card => {
    card.classList.remove("is-complete");
    card.querySelector(".answer-status").textContent = "";
    card.querySelector(".feedback").hidden = true;
    card.querySelector(".practice-tools").hidden = true;
    card.querySelector(".check-button").disabled = true;
    card.querySelectorAll(".sound-option").forEach(option => {
      option.dataset.selected = "false";
      option.querySelector(".sound-option__select").setAttribute("aria-pressed", "false");
    });
  });
  updateProgress();
});

window.addEventListener("beforeunload", stopRecording);
const localPreview = ["127.0.0.1", "localhost"].includes(window.location.hostname)
  && new URLSearchParams(window.location.search).get("preview") === "1";

if (localPreview) {
  state.user = { id: "local-preview", name: "Preview Student", role: "student" };
  state.token = "local-preview-only";
  loadProgress();
  renderCompletionState();
  showView("practice");
} else {
  restore().catch(error => {
    forget();
    $("[data-login-status]").textContent = error?.message || "登入時段已失效，請重新登入。";
    $("[data-login-status]").dataset.state = "error";
  });
}
