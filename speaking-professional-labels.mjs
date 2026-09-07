const languageZh=['並置','三項排比','情態動詞','比較句','內容對比','形容詞及副詞','否定句','擬人','擬物','明喻','暗喻','借代','雙重修辭','動詞片語','讓步句','精準用詞','句子結構','支持細節','改述','反問句','常用語','詞語搭配','有力詞彙'];
const contentEn=['Idea / topic sentence','Explanation','Example','Conclusion','Contextual reference','Task response','Responding to others'];
const contentZh=['論點／主題句','解釋','例子','結論','引用語境','回應題目','回應他人'];
export function checklistLabel(kind,item,index,L){return kind==='content'?L(contentEn[index%7],contentZh[index%7]):L(item.label.replace(/[\u3400-\u9fff].*$/,'').trim(),languageZh[index]||item.label);}
export const makeLanguage=mode=>(en,zh)=>mode==='en'?en:mode==='zh'?zh:en+' · '+zh;
