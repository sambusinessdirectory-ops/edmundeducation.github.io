// A question may have several intents. Location and normative questions are
// separate facets, so "Should people in your country…?" appears under both.
export const labels = {
  country: ['Your Country / Local Context', '你的國家／本地情況'],
  should: ['Should / Ought / Duty', '應否／責任'],
  advantages: ['Advantages / Benefits', '優點／好處'],
  disadvantages: ['Problems / Drawbacks', '問題／缺點'],
  reasons: ['Reasons / Causes', '原因／為甚麼'],
  effects: ['Effects / Consequences', '影響／後果'],
  solutions: ['Solutions / Improvements', '解決方法／改善'],
  comparisons: ['Comparison / Difference', '比較／差異'],
  future: ['Future / Prediction', '未來／預測'],
  change: ['Change over Time', '隨時間轉變'],
  opinion: ['Opinion / Evaluation', '看法／評價'],
  importance: ['Importance / Value', '重要性／價值'],
  groups: ['People / Age Groups', '不同人群／年齡'],
  examples: ['Types / Examples', '類別／例子'],
  hypothetical: ['Hypothetical Situation', '假設情境']
};

export function classifyIeltsPart3(text) {
  const q = String(text || '').toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
  const tags = new Set();
  const add = (name, pattern) => { if (pattern.test(q)) tags.add(name); };
  add('country', /\b(your (?:own )?country|our country|in (?:your|this|their|our|the) country|in hong kong|in (?:the )?uk|in (?:the )?us|in (?:the )?usa|in your (?:city|area|society|community)|where you live|your (?:home )?town|local\b|people in your country)\b/);
  add('should', /\b(should|ought to|need to|necessary to|must|have to|responsib(?:le|ility)|right to|obligation|duty)\b/);
  add('advantages', /\b(advantages?|benefits?|positive (?:effects?|sides?|aspects?|impacts?)|good (?:things?|points?|sides?)|useful|helpful)\b/);
  add('disadvantages', /\b(disadvantages?|drawbacks?|problems?|difficult(?:y|ies)|challenges?|risks?|negative (?:effects?|sides?|aspects?|impacts?)|harmful|bad (?:things?|points?|sides?))\b/);
  add('reasons', /^why\b|\b(reasons?|causes?|factors?|what makes|why do|why is|why are)\b/);
  add('effects', /\b(affect|effects?|impacts?|influenc\w*|consequences?|result(?:s| in)?|lead to)\b/);
  add('solutions', /\b(how (?:can|could|should)|what (?:can|could|should) .* do|ways? to|improv\w*|solv\w*|prevent|encourag\w*|reduc\w*|deal with|tackl\w*|address (?:this|the))\b/);
  add('comparisons', /\b(compar\w*|differen\w*|similar\w*|better than|worse than|more .* than|less .* than|rather than|versus|between .* and)\b/);
  add('future', /\b(in the future|future|will\b|would .* become|likely to|predict\w*|next (?:few|ten|twenty|\d+) years|one day)\b/);
  add('change', /\b(chang\w*|nowadays|these days|in the past|used to|compared with the past|over time|generations?|today versus)\b/);
  add('opinion', /^(?:do you think|what do you think|in your opinion|is it|are there|would you say|to what extent|how important|how (?:good|bad|useful|effective|fair))\b|\b(agree|disagree|believe|better|best|fair|worth)\b/);
  add('importance', /\b(important|importance|essential|necessary|valuable|value of|matter|significant)\b/);
  add('groups', /\b(children|teenagers|young people|older people|elderly|adults|parents|students|men|women|different age|different kinds of people)\b/);
  add('examples', /\b(what (?:kinds?|types?|sorts?|examples?)|which (?:kinds?|types?|sorts?)|give (?:an? |some )?examples?|for example)\b/);
  add('hypothetical', /\b(if (?:people|someone|you|there|a |the )|imagine|suppose|what would happen|what might happen)\b/);
  if (!tags.size) tags.add('opinion');
  return [...tags];
}
