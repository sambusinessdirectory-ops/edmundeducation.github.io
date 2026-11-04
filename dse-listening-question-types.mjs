import { mountQuestionTypeFinder } from './question-type-finder.mjs?v=20261104-dse1';

export function mountDseListeningTypes(root, openQuestion) {
  if (!root) return;
  async function load() {
    root.textContent = '正在載入歷屆試題題型目錄…';
    try {
      const response = await fetch(new URL('./dse-listening-question-types.json?v=20261104-dse1', import.meta.url));
      if (!response.ok) throw Error(`HTTP ${response.status}`);
      mountQuestionTypeFinder(root, {data:await response.json(),kind:'dse-listening',onOpen:row=>openQuestion(row.year,row.task,row.number)});
    } catch (error) {
      console.warn('DSE question type catalogue failed',error);
      root.textContent = '歷屆試題題型目錄未能載入。';
      const retry = document.createElement('button');
      retry.type = 'button'; retry.textContent = '重試'; retry.onclick = load; root.append(retry);
    }
  }
  load();
}
