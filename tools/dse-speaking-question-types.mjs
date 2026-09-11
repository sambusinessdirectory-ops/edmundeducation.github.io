// Question intent tags. Multiple intents are retained; no question is discarded.
export const labels = {
  advantages:['Advantages / Benefits','優點／好處','beneficial positive pros'],
  disadvantages:['Disadvantages / Problems','缺點／問題','drawbacks challenges risks cons negative difficulties'],
  solutions:['Solutions / Suggestions','解決方法／建議','recommendations advice improvement measures'],
  reasons:['Reasons / Causes','原因','why explanations factors'],
  opinions:['Opinions / Agreement','觀點／同意與否','agree disagree whether should policy'],
  preferences:['Preferences / Choices','喜好／選擇','prefer favourite favorite choose selection'],
  experiences:['Personal Experiences / Habits','個人經驗／習慣','past routine personal life'],
  comparisons:['Comparisons','比較','differences similarities compare versus'],
  predictions:['Future / Predictions','未來／預測','trends changes future outlook'],
  planning:['Planning / Organisation','策劃／安排','events activities campaign arrangements'],
  persuasion:['Persuasion / Promotion','說服／推廣','encourage promote attract motivate publicity'],
  qualities:['Qualities / Requirements','特質／條件','characteristics skills suitable qualities criteria'],
  importance:['Importance / Value','重要性／價值','important necessary essential significance'],
  hypothetical:['Hypothetical Situations','假設情境','imagine if you were would you do'],
  effects:['Effects / Consequences','影響／後果','impact consequences results'],
  description:['Description / Examples','描述／舉例','describe identify kinds examples details']
};
export function classify(text, section) {
  const s=text.toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
  const tags=new Set(); const add=(id,re)=>{if(re.test(s))tags.add(id);};
  add('advantages',/\b(advantages?|benefits?|beneficial|positive (?:aspects|effects|impacts)|good (?:things|points)|pros)\b/);
  add('disadvantages',/\b(disadvantages?|drawbacks?|challenges?|difficulties|problems?|risks?|negative (?:aspects|effects|impacts)|bad (?:things|points)|dangers?|harmful|downsides?)\b/);
  add('reasons',/^(?:why\b|(?:the |possible |some )?(?:reasons?|causes?|factors)\b)|\b(?:explain why|reasons? for|causes? of|what makes .*popular|why (?:people|students|some|many|teenagers|young|hong kong))\b/);
  add('comparisons',/\b(compare|comparison|differences?|similarities|similar|different from|better than|rather than|versus|as .* as|more .* than|less .* than)\b|\b(?:which|what) (?:is|are|would be) (?:more|better)|\b(?:boys or girls|men or women)\b/);
  add('predictions',/\b(in the future|future of|will .*change|might .*change|will .*become|will .*increase|will .*decrease|predict|predictions?|in \d+ years|next (?:ten|twenty|few|50|20|10) years)\b/);
  add('planning',/\b(organis[ez]|organiz[ei]|organising|organizing|planning|plan (?:a|an|the|for)|activities? (?:that|you|to|for)|what activities|what .*include|when and where|budget|venue|logistics|arrangements|programme|program of|run (?:a|an|the) (?:event|campaign|competition))\b/);
  add('persuasion',/\b(persuad\w*|convinc\w*|encourag\w*|promot\w*|publicis\w*|publiciz\w*|publicity|advertis\w*|attract\w*|motivat\w*|raise awareness)\b/);
  add('qualities',/\b(characteristics?|qualities|skills?|qualifications?|requirements?|attributes|criteria|suitable|successful .*need|makes? (?:a |an |someone a )?good)\b/);
  add('importance',/\b(important|importance|necessary|essential|significance|valuable|value of|role .*play)\b/);
  add('hypothetical',/\b(?:if you|imagine|suppose|supposing|what would you do|how would you (?:feel|react|respond|deal|handle))\b/);
  add('experiences',/^(?:have you (?:ever|had|been)|do you (?:have|use|eat|watch|read|play|spend|go|take|buy|wear|know|ever|often|usually)|how (?:do|did|often do|much .*do|many .*do) you|did you|what (?:do|did) you (?:do|usually)|what is your (?:experience|school|family)|tell .*about|does your (?:family|school)|are you (?:a |an |involved))\b/);
  add('preferences',/\b(prefer|preference|favourite|favorite|would you like|do you like|do you enjoy|would you prefer|would you rather|would you want|which .*would you|what .*would you like|are you interested|would you (?:choose|buy|join|be interested|be willing))\b/);
  add('solutions',/^(?:how (?:can|could|should|would|to)|what (?:can|could|should) .*do|(?:ways|methods|suggestions|solutions|measures|strategies|steps)\b)|\b(?:solve|tackle|address (?:the|this|a)|deal with|prevent|reduce|improve|recommend|advice|suggestions?|solutions?)\b/);
  add('opinions',/^(?:do you (?:think|agree|believe|feel|consider)|what do you think|how do you feel|whether|should\b|is it|is (?:hong kong|the|a |an )|are (?:there|the|young)|can (?:the|a |an )|would it|does .*mean)/);
  add('advantages', /\b(strengths?|positive (?:and negative )?(?:influences|impact)|good and bad ideas|arguments (?:for|in favour of))\b|^what .* (?:can|could|might) learn|^what can be learn/);
  add('disadvantages', /\b(cons|limitations?|concerns?|struggles?|frustrations?|complaints?|fears?|cause harm|negative influences|good and bad ideas|arguments against)\b/);
  add('effects', /\b(effects?|impacts?|consequences|influences?|affect(?:ed|s)?)\b/);
  add('planning', /\b(?:other|additional) activities\b|\b(?:content|theme|purpose) (?:and|of|for)|\b(?:questions to ask|to include|be included|be introduced|could be held|location for)\b/);
  add('solutions', /\b(?:other ways|what to do|what action|what .* (?:can|could|should) do|improvements?|rules (?:there|you)|policies that|overcome)\b/);
  add('preferences', /\b(?:which .* (?:choose|chosen|best|most|would|agree)|to be chosen|to choose|what you would like|best option)\b/);
  add('qualities', /\bwhat to consider\b/);
  add('reasons', /\b(?:and why|popularity of)\b/);
  add('comparisons', /\b(?:different (?:to|kinds|types)|offers that .*does not|more:|same kind)\b/);
  add('experiences', /\b(?:you.ve had|you played when|your experience)\b|^(?:when|where|how long|how much|how many) (?:do|did|have) you\b/);
  add('predictions', /\b(?:will .*replace|one day|will .*be like|will take over|will continue)\b/);
  add('opinions', /\b(?:arguments (?:for|against|in favour)|fairness|which side|acceptable behaviour)\b|^in your opinion/);
  add('advantages', /\b(?:best (?:part|thing)|most enjoyable thing|can .*teach|does .*help|in what ways .*help)\b|^what\b.*\b(?:can|could|might)\b.*\blearn\b/);
  add('disadvantages', /\b(?:difficult|hardest|worst|worry|dislike|stressful|dangerous|misused|don.t you like|suffer|pressures?)\b/);
  add('comparisons', /^(?:which|who|what)\b.*\b(?:more|worse|better|easiest|longer)\b.*\bor\b|\bhow different\b/);
  add('hypothetical', /\bif\b|^(?:what|which)\b.*\bwould you (?:put|take|make)\b/);
  add('experiences', /^(?:have you|were you|did your)\b|\b(?:your .*memor(?:y|ies|able)|you have (?:taken|learned)|first time you|your childhood|you play(?:ed)? with|you watched)\b/);
  add('solutions', /\b(?:best way|easiest ways|what .*tips|what would you say|how else|how (?:can|could).*help)\b/);
  add('opinions', /\b(?:would you agree|who should|when should|what age .*should)\b|^how (?:effective|successful|convenient|closely)/);
  add('qualities', /\b(?:what .*consider|what makes .* (?:interesting|special|appealing|memorable)|what types of people should)\b/);
  add('reasons', /\b(?:who is to blame|who should be blamed)\b/);
  add('preferences', /\b(?:dream job|dream accommodation|what .*do you want|which .*admire|which .*wish|what .*you hate|what .*you not like)\b/);
  add('effects', /\b(?:has .*changed|have .*changed|influenced)\b/);
  // A direct request for details/examples, or an open descriptive discussion point.
  add('description',/^(?:describe|what (?:kinds?|types?|examples?|aspects)|in what (?:other )?ways)|\b(?:give (?:an? |some )?examples?|describe)\b/);
  if (!tags.size) {
    if (/^(?:would|should|do|does|is|are|can|could|whether|will)\b/.test(s)) tags.add('opinions');
    else if (/^(?:how|ways? to)\b/.test(s)&&section==='group') tags.add('solutions');
    else tags.add('description');
  }
  return [...tags];
}
