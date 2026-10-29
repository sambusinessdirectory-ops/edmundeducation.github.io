// Render only the manuscript's small Markdown subset; escape all source HTML.
const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function inline(text) {
  return esc(cleanPolicyText(text)).replace(/&lt;(https:\/\/[^\s<>]+?)&gt;/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>');
}
export function renderResourceMarkdown(markdown) {
  const lines=String(markdown||'').split('\n'),out=[];
  for(let i=0;i<lines.length;i++){
    const line=lines[i].trim();if(!line)continue;
    if(line.startsWith('|')){
      const rows=[];while(i<lines.length&&lines[i].trim().startsWith('|')){rows.push(lines[i].trim().slice(1,-1).split('|').map(s=>s.trim()));i++;}i--;
      out.push('<div class="policy-resource-table"><table>'+rows.filter(row=>!row.every(cell=>/^:?-+:?$/.test(cell))).map((row,j)=>'<tr>'+row.map(cell=>`<${j?'td':'th'}>${inline(cell)}</${j?'td':'th'}>`).join('')+'</tr>').join('')+'</table></div>');
    }else if(/^#{1,4} /.test(line)){out.push('<h3>'+inline(line.replace(/^#+ /,''))+'</h3>');}
    else if(line.startsWith('> ')){out.push('<blockquote>'+inline(line.slice(2))+'</blockquote>');}
    else out.push('<p>'+inline(line)+'</p>');
  }
  return out.join('');
}

// Each independently opened passage explains an abbreviation on first use.
const abbreviations = {
  CIC: ['Construction Industry Council', '建造業議會'],
  HKIC: ['Hong Kong Institute of Construction', '香港建造學院'],
  OSHC: ['Occupational Safety and Health Council', '職業安全健康局'],
  LD: ['Labour Department', '勞工處'],
  DEVB: ['Development Bureau', '發展局'],
  BD: ['Buildings Department', '屋宇署'],
  HA: ['Hong Kong Housing Authority', '香港房屋委員會'],
  HD: ['Housing Department', '房屋署'],
  HKO: ['Hong Kong Observatory', '香港天文台'],
  FSD: ['Fire Services Department', '消防處'],
  KPI: ['Key Performance Indicator', '關鍵績效指標']
};
export function cleanPolicyText(value) {
  let text = String(value ?? '').replace(/(?:\*\*)?(?:負責與操作：|理由／界線：)(?:\*\*)?/g, '').replace(/（截至 2026-10-29）|（產業推廣）/g, '');
  const seen = new Set();
  return text.split(/(https:\/\/[^\s<>]+)/g).map(part => {
    if (part.startsWith('https://')) return part;
    for (const [short, [english, chinese]] of Object.entries(abbreviations)) {
      if (seen.has(short) || part.includes(english)) continue;
      part = part.replace(new RegExp('(?:' + chinese + '（' + short + '）)|\\b' + short + '\\b'), () => {
        seen.add(short);
        return english + '（' + short + '）' + chinese;
      });
    }
    return part;
  }).join('');
}

// Preserve punctuation and escape content before inserting layout-only markup.
export function renderPolicyProse(value) {
  return String(value ?? '').split(/(?<=[，。])\s*/u).filter(Boolean)
    .map(clause => `<span class="policy-clause">${esc(clause)}</span>`).join('');
}
