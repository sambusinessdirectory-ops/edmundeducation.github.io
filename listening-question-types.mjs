import { mountQuestionTypeFinder } from './question-type-finder.mjs?v=20260911';
export function mountListeningTypes(root, openPractice) {
  if (!root) return;
  async function load() {
    root.textContent='正在載入題型目錄…';
    try {
      const response=await fetch(new URL('./listening-question-types.json?v=20260911',import.meta.url));
      if(!response.ok)throw Error('load');
      mountQuestionTypeFinder(root,{data:await response.json(),kind:'listening',onOpen:row=>openPractice(row.practice,row.part,row.first)});
    } catch {
      root.textContent='題型目錄未能載入。';const retry=document.createElement('button');retry.type='button';retry.textContent='重試';retry.onclick=load;root.append(retry);
    }
  }
  load();
}
