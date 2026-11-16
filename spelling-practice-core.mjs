const PILOT_VOCABULARY = [
  ["alien", "外星人"],
  ["ghost", "鬼魂"],
  ["monster", "怪物"],
  ["supernatural being", "超自然生物"],
  ["vampire", "吸血鬼"],
  ["werewolf", "狼人"],
  ["witch", "女巫"],
  ["wizard", "男巫；魔法師"],
  ["zombie", "喪屍"],
  ["amazed", "感到驚訝"],
  ["confused", "感到困惑"],
  ["excited", "感到興奮"],
  ["impatient", "不耐煩"],
  ["interested", "感興趣"],
  ["nervous", "緊張"],
  ["obsessed", "着迷"],
  ["scared", "害怕"],
  ["terrified", "非常害怕"],
  ["adapt", "改編；適應"],
  ["animated", "動畫的"],
  ["author", "作者"],
  ["comic", "漫畫"],
  ["fantasy", "奇幻作品"],
  ["fictional", "虛構的"],
  ["graphic novel", "圖像小說"],
  ["horror", "恐怖作品"],
  ["musical", "音樂劇"],
  ["novel", "小說"],
  ["pop culture", "流行文化"],
  ["publish", "出版"],
  ["suspense", "懸念"],
  ["twist", "情節轉折"],
  ["version", "版本"],
  ["writer", "作家"],
  ["abandoned", "被遺棄的"],
  ["action figure", "動作模型"],
  ["assistance", "協助"],
  ["edition", "版本；版次"],
  ["equipment", "設備"],
  ["furniture", "家具"],
  ["happening", "發生中的；事件"],
  ["haunted", "鬧鬼的"],
  ["influence", "影響"],
  ["microphone", "麥克風"],
  ["mythical", "神話中的"],
  ["production", "製作"],
  ["registration", "登記"],
  ["responsible", "負責任的"],
  ["unnatural", "不自然的"],
  ["actor", "演員"],
  ["award", "獎項"],
  ["chapter", "章節"],
  ["character", "角色"],
  ["creative", "有創意的"],
  ["creature", "生物"],
  ["dangerous", "危險的"],
  ["deadline", "截止日期"],
  ["display", "展示"],
  ["draft", "草稿"],
  ["ending", "結局"],
  ["launch", "推出"],
  ["legend", "傳說"],
  ["magic", "魔法"],
  ["magical", "有魔力的"],
  ["opening", "開頭"],
  ["original", "原創的"],
  ["participant", "參加者"],
  ["popular", "受歡迎的"],
  ["release", "發行；推出"],
  ["review", "評論"],
  ["section", "部分"],
  ["series", "系列"],
  ["session", "環節；課節"],
  ["stage", "舞台"],
  ["theatre", "劇院"],
  ["theme", "主題"],
  ["unknown", "未知的"]
];

const JAYDEN_DECK_ID = "custom-setup/jayden-test-november-2026";
const jaydenCards = globalThis.window?.EDMUND_JAYDEN_TEST_NOVEMBER_2026_SEED?.[JAYDEN_DECK_ID];
const rawVocabularyPairs = Array.isArray(jaydenCards) && jaydenCards.length
  ? jaydenCards.map((card) => [String(card.front || "").trim(), String(card.meaning || "").trim()])
  : PILOT_VOCABULARY;
const vocabularyPairs = rawVocabularyPairs.filter(([word], index, pairs) => pairs.findIndex(([candidate]) => candidate === word) === index);

export const VOCABULARY = Object.freeze(vocabularyPairs.map(([word, meaning], index) => Object.freeze({
  id: `sp-${String(index + 1).padStart(3, "0")}`,
  word,
  meaning,
  characters: Object.freeze([...word])
})));

export function letterPositions(word) {
  return [...word].map((character, index) => /[a-z]/i.test(character) ? index : -1).filter((index) => index >= 0);
}

export function testedPositionCount(word, percentage) {
  const total = letterPositions(word).length;
  const bounded = Math.min(100, Math.max(10, Number(percentage) || 10));
  return Math.min(total, Math.max(1, Math.ceil(total * bounded / 100)));
}

export function createMask(word, percentage, random = Math.random) {
  const positions = letterPositions(word);
  const blankCount = testedPositionCount(word, percentage);
  const shuffled = [...positions];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return Object.freeze(shuffled.slice(0, blankCount).sort((a, b) => a - b));
}

export function isAnswerCorrect(word, valuesByPosition) {
  return Object.entries(valuesByPosition).every(([position, value]) => {
    return String(value || "").trim().toLocaleLowerCase("en") === [...word][Number(position)].toLocaleLowerCase("en");
  });
}

export function requiredCorrectTotal(selectedCount, frequency) {
  return Math.max(0, Number(selectedCount) || 0) * Math.max(1, Math.floor(Number(frequency) || 1));
}

export function characterLabel(word) {
  return [...word].map((character) => character === " " ? "/" : character).join(" · ");
}
