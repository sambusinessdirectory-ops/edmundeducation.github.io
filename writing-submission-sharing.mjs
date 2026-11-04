import {writingSubmissionArticlePath} from './writing-submission-core.js';
export function submissionURL(id,origin=location.origin){const path=writingSubmissionArticlePath(id);return path?new URL(path,origin+'/').href:'';}
export function submissionSharingControls(id,copy,notify){
 const group=document.createElement('details');group.className='submission-link-options';const summary=document.createElement('summary');summary.textContent='文章連結 / QR · Share';group.append(summary);
 const url=submissionURL(id);if(!url)return group;
 const buttons=document.createElement('div');const link=document.createElement('button');link.type='button';link.className='small-button';link.textContent='Copy URL · 複製連結';link.onclick=async()=>{const ok=await copy(url);notify(ok?'文章連結已複製。':'請手動複製文章連結。',ok?'success':'error');};
 const qr=document.createElement('a');qr.className='small-button';qr.textContent='QR code / PDF · QR 碼／PDF';qr.href='writing-submission-qr.html?submission='+encodeURIComponent(id);qr.target='_blank';qr.rel='noopener';
 const note=document.createElement('small');note.textContent='Sign in to view your submission · 登入後查看自己的文章';buttons.append(link,qr);group.append(buttons,note);return group;
}
