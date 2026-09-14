export const tierName = tier => ({bronze:'銅色',silver:'銀色',gold:'金色'}[tier] || '');
const timestamp = value => Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : '';
const earliest = dates => dates.filter(Boolean).sort()[0] || '';

export function trophyProgress(lesson, attempts = [], answers = null) {
  const ids = new Set((lesson.questions || []).map(q=>String(q.id)));
  const total = lesson.questions?.length || 0, eligible = total > 0 && ids.size === total;
  const thresholds = {bronze:Math.ceil(total*.5),silver:Math.ceil(total*.8),gold:total};
  let correct=0, earned=false;
  const dates={bronze:[],silver:[],gold:[]};
  if (answers) {
    const completed=[...ids].filter(id=>answers[id]?.correct === true);
    correct=completed.length;earned=eligible && correct===total;
    const times=completed.map(id=>timestamp(answers[id].earnedAt || answers[id].updatedAt)).filter(Boolean).sort();
    for(const [tier,threshold] of Object.entries(thresholds)) {
      // Unknown historical dates stay unknown rather than inventing an award date.
      if(correct>=threshold && times.length===correct) dates[tier].push(times[threshold-1]);
    }
  } else for(const attempt of attempts) {
    if(attempt.lessonId!==lesson.id || Number(attempt.totalCount)!==total) continue;
    const count=Number(attempt.correctCount);
    if(!Number.isInteger(count)||count<0||count>total) continue;
    const known=attempt.result?.correctIds;
    const actual=Array.isArray(known)?new Set(known.map(String).filter(id=>ids.has(id))).size:count;
    const best=Math.min(count,actual), full=eligible&&attempt.status==='completed'&&best===total;
    correct=Math.max(correct,best);earned ||= full;
    const rounds=(attempt.result?.rounds || []).filter(r=>timestamp(r.submittedAt)).sort((a,b)=>Date.parse(a.submittedAt)-Date.parse(b.submittedAt));
    const mastered=new Set(), crossed={};
    for(const round of rounds) {
      for(const id of round.correctIds || []) if(ids.has(String(id))) mastered.add(String(id));
      for(const [tier,threshold] of Object.entries(thresholds)) if(!crossed[tier]&&mastered.size>=threshold) crossed[tier]=timestamp(round.submittedAt);
    }
    for(const [tier,threshold] of Object.entries(thresholds)) {
      if(best<threshold || (tier==='gold'&&!full)) continue;
      dates[tier].push(crossed[tier] || (full?timestamp(attempt.completedAt):''));
    }
  }
  const tier=!eligible?null:earned?'gold':correct>=thresholds.silver?'silver':correct>=thresholds.bronze?'bronze':null;
  return {eligible,total,correct,earned,tier,earnedAt:tier?earliest(dates[tier]):''};
}

export function awardDateMarkup(item) {
  if(!item?.tier) return '';
  const date=timestamp(item.earnedAt);
  return date ? `<p class="ss-trophy-date">獲得日期 · <time datetime="${date}">${new Intl.DateTimeFormat('zh-Hant',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(date))}</time></p>` : '<p class="ss-trophy-date">獲得日期 · 尚無歷史日期記錄</p>';
}
