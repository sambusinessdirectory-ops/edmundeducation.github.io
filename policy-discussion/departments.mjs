// Names checked against the bilingual HKSAR government directory, 2026-10-29.
// All 56 entries under Government Departments, plus bureaux and central offices.
export const directorySource = 'https://tel.directory.gov.hk/index_CHI.html';
export const departments = `漁農自然護理署|Agriculture, Fisheries and Conservation Department
建築署|Architectural Services Department
審計署|Audit Commission
醫療輔助隊|Auxiliary Medical Service
屋宇署|Buildings Department
政府統計處|Census and Statistics Department
民眾安全服務處|Civil Aid Service
民航處|Civil Aviation Department
土木工程拓展署|Civil Engineering and Development Department
公司註冊處|Companies Registry
懲教署|Correctional Services Department
香港海關|Customs and Excise Department
渠務署|Drainage Services Department
機電工程署|Electrical and Mechanical Services Department
環境保護署|Environmental Protection Department
消防處|Fire Services Department
食物環境衞生署|Food and Environmental Hygiene Department
政府飛行服務隊|Government Flying Service
政府化驗所|Government Laboratory
政府物流服務署|Government Logistics Department
政府產業署|Government Property Agency
衞生署|Department of Health
路政署|Highways Department
民政事務總署|Home Affairs Department
香港金融管理局|Hong Kong Monetary Authority
香港天文台|Hong Kong Observatory
香港警務處|Hong Kong Police Force
房屋署|Housing Department
入境事務處|Immigration Department
政府新聞處|Information Services Department
稅務局|Inland Revenue Department
知識產權署|Intellectual Property Department
投資推廣署|Invest Hong Kong
薪諮會聯合秘書處|Joint Secretariat for the Advisory Bodies on Civil Service and Judicial Salaries and Conditions of Service
律政司|Department of Justice
勞工處|Labour Department
土地註冊處|Land Registry
地政總署|Lands Department
法律援助署|Legal Aid Department
康樂及文化事務署|Leisure and Cultural Services Department
海事處|Marine Department
通訊事務管理局辦公室|Office of the Communications Authority
破產管理署|Official Receiver's Office
規劃署|Planning Department
郵政署|Post Office
香港電台|Radio Television Hong Kong
差餉物業估價署|Rating and Valuation Department
選舉事務處|Registration and Electoral Office
截取通訊及監察事務專員秘書處|Secretariat, Commissioner on Interception of Communications and Surveillance
社會福利署|Social Welfare Department
工業貿易署|Trade and Industry Department
運輸署|Transport Department
庫務署|Treasury
大學教育資助委員會秘書處|University Grants Committee Secretariat
水務署|Water Supplies Department
在職家庭及學生資助事務處|Working Family and Student Financial Assistance Agency
行政長官辦公室|Chief Executive's Office
政務司司長私人辦公室|Chief Secretary for Administration's Private Office
財政司司長私人辦公室|Financial Secretary's Private Office
律政司司長辦公室|Secretary for Justice's Office
特首政策組|Chief Executive's Policy Unit
政務司司長辦公室|Chief Secretary for Administration's Office
公務員事務局|Civil Service Bureau
商務及經濟發展局|Commerce and Economic Development Bureau
政制及內地事務局|Constitutional and Mainland Affairs Bureau
文化體育及旅遊局|Culture, Sports and Tourism Bureau
發展局|Development Bureau
教育局|Education Bureau
環境及生態局|Environment and Ecology Bureau
財政司司長辦公室|Financial Secretary's Office
財經事務及庫務局|Financial Services and the Treasury Bureau
醫務衞生局|Health Bureau
民政及青年事務局|Home and Youth Affairs Bureau
房屋局|Housing Bureau
創新科技及工業局|Innovation, Technology and Industry Bureau
勞工及福利局|Labour and Welfare Bureau
保安局|Security Bureau
運輸及物流局|Transport and Logistics Bureau
廉政公署|Independent Commission Against Corruption
獨立監察警方處理投訴委員會|Independent Police Complaints Council
司法機構|Judiciary
前任行政長官辦公室|Office of Former Chief Executives
申訴專員公署|Office of The Ombudsman
公務員敍用委員會|Public Service Commission
行政署|Administration Wing
一般職系處|General Grades Office
文創產業發展處|Cultural and Creative Industries Development Agency
旅遊事務署|Tourism Commission
政府經濟顧問辦公室|Office of the Government Economist
財政預算案及稅務政策組|Budget and Tax Policy Unit
引進重點企業辦公室|Office for Attracting Strategic Enterprises
創新科技署|Innovation and Technology Commission
數字政策辦公室|Digital Policy Office
禁毒處|Narcotics Division
礦務部|Mines Division
電影、報刊及物品管理辦事處|Office for Film, Newspaper and Article Administration`.split('\n').map(row => row.split('|'));

const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const normalise = value => value.toLowerCase().replace(/衛/g, '衞').trim();
export function searchDepartments(query) {
  const terms = normalise(query).split(/\s+/).filter(Boolean);
  return departments.filter(row => terms.every(term => normalise(row.join(' ')).includes(term)));
}

export function installDepartmentPanel() {
  let panel, opener, drag;
  function close() { panel?.remove(); panel = null; drag = null; if (opener?.isConnected) opener.focus({preventScroll:true}); }
  function update() {
    const rows = searchDepartments(panel.querySelector('input').value);
    panel.querySelector('tbody').innerHTML = rows.length ? rows.map(([zh,en]) => `<tr><td lang="zh-Hant">${esc(zh)}</td><td lang="en">${esc(en)}</td></tr>`).join('') : '<tr><td colspan="2">找不到符合的部門</td></tr>';
    panel.querySelector('[data-department-count]').textContent = `${rows.length} / ${departments.length}`;
  }
  window.addEventListener('resize', () => {
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    panel.style.left = Math.max(8, Math.min(innerWidth - panel.offsetWidth - 8, rect.left)) + 'px';
    panel.style.top = Math.max(8, Math.min(innerHeight - panel.offsetHeight - 8, rect.top)) + 'px';
    panel.style.right = 'auto';
  });
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-departments]');
    if (!trigger) {
      if (event.target.closest('[data-home], #logout')) close();
      return;
    }
    opener = trigger;
    if (panel) { panel.querySelector('input').focus(); return; }
    panel = document.createElement('aside');
    panel.className = 'department-float'; panel.setAttribute('role','dialog'); panel.setAttribute('aria-labelledby','department-title');
    panel.innerHTML = `<div class="department-handle"><h3 id="department-title">政府部門中英對照</h3><button type="button" data-close-departments aria-label="關閉政府部門表">×</button></div><div class="department-search"><input type="search" aria-label="搜尋政府部門（中文或英文）" placeholder="搜尋中文 / English" autocomplete="off"><span data-department-count role="status"></span></div><div class="department-table-wrap"><table><thead><tr><th scope="col">中文</th><th scope="col">English</th></tr></thead><tbody></tbody></table></div><footer>政府部門、決策局及辦公室 · <a href="${directorySource}" target="_blank" rel="noopener noreferrer">官方名錄 ↗</a></footer>`;
    document.body.append(panel); update(); panel.querySelector('input').focus();
    panel.querySelector('input').addEventListener('input',update);
    panel.querySelector('[data-close-departments]').addEventListener('click',close);
    panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}});
    const handle = panel.querySelector('.department-handle');
    handle.addEventListener('pointerdown',e=>{
      if(e.target.closest('button')) return;
      const box=panel.getBoundingClientRect();drag={x:e.clientX-box.left,y:e.clientY-box.top,id:e.pointerId};handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove',e=>{
      if(!drag||drag.id!==e.pointerId)return;
      panel.style.left=Math.max(8,Math.min(innerWidth-panel.offsetWidth-8,e.clientX-drag.x))+'px';
      panel.style.top=Math.max(8,Math.min(innerHeight-panel.offsetHeight-8,e.clientY-drag.y))+'px';panel.style.right='auto';
    });
    for(const eventName of ['pointerup','pointercancel'])handle.addEventListener(eventName,()=>{drag=null;});
  });
}
