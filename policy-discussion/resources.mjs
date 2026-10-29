// Render only the manuscript's small Markdown subset; escape all source HTML.
const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function inline(text) {
  return esc(text).replace(/&lt;(https:\/\/[^\s<>]+?)&gt;/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>');
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
