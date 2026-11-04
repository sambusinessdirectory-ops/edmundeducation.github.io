export function paragraphClipboardText(plain,html='') {
 const normalize=s=>String(s||'').replace(/\r\n?/g,'\n');
 const text=normalize(plain);
 if(!html||text.includes('\n'))return text;
 const doc=new DOMParser().parseFromString(html,'text/html');doc.querySelectorAll('script,style').forEach(el=>el.remove());
 const walk=n=>{if(n.nodeType===3)return n.nodeValue;if(n.nodeType!==1)return '';if(n.tagName==='BR')return '\n';const value=[...n.childNodes].map(walk).join('');return value+(/^(P|DIV|LI|H[1-6]|BLOCKQUOTE|TR)$/.test(n.tagName)&&value&&!value.endsWith('\n')?'\n':'');};
 const structured=normalize([...doc.body.childNodes].map(walk).join('')).replace(/\n+$/,'');
 return structured.includes('\n')?structured:text;
}
export function preserveTextareaParagraphs(textarea){
 if(!textarea)return;
 textarea.addEventListener('paste',event=>{if(!event.clipboardData)return;const text=paragraphClipboardText(event.clipboardData.getData('text/plain'),event.clipboardData.getData('text/html'));if(!text)return;event.preventDefault();textarea.setRangeText(text,textarea.selectionStart,textarea.selectionEnd,'end');textarea.dispatchEvent(new Event('input',{bubbles:true}));});
}
export function preserveArticleCopy(element){
 element.addEventListener('copy',event=>{const selection=window.getSelection();if(!selection?.rangeCount||!element.contains(selection.anchorNode)||!element.contains(selection.focusNode)||!event.clipboardData)return;const text=selection.getRangeAt(0).toString();event.clipboardData.setData('text/plain',text);event.preventDefault();});
}
