import qrcode from './vendor/qrcode-generator/qrcode.mjs';
import {submissionURL} from './writing-submission-sharing.mjs';
const id=new URLSearchParams(location.search).get('submission'),url=submissionURL(id);
if(!url){document.querySelector('#status').textContent='Invalid submission link · 文章連結無效';document.querySelector('#print').disabled=true;}
else{const qr=qrcode(0,'M');qr.addData(url);qr.make();document.querySelector('#qr').innerHTML=qr.createSvgTag({cellSize:6,margin:24,scalable:true});const a=document.querySelector('#link');a.href=url;a.textContent=url;document.querySelector('#print').onclick=()=>window.print();await document.fonts.ready;requestAnimationFrame(()=>setTimeout(()=>window.print(),350));}
