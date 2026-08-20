import { HOMEWORK_HOT_KEY_REFERENCE } from "./schedule-homework-links.mjs?v=20260820-hotkey-reference1";

const SESSION_KEY = "edmund-schedule-session-v1";
const settings = window.EDMUND_SUPABASE || {};
const client = window.supabase?.createClient && settings.url && settings.anonKey
  ? window.supabase.createClient(settings.url,settings.anonKey)
  : null;
const elements={
  gate:document.querySelector("[data-auth-gate]"),gateMessage:document.querySelector("[data-gate-message]"),
  reference:document.querySelector("[data-reference]"),search:document.querySelector("[data-search]"),
  grid:document.querySelector("[data-hotkey-grid]"),count:document.querySelector("[data-count]"),empty:document.querySelector("[data-empty]")
};
let authPromise=null;

function readAdminSession(){try{const saved=JSON.parse(sessionStorage.getItem(SESSION_KEY)||"null");return saved?.role==="admin"&&saved?.adminToken?saved:null}catch{return null}}
async function ensureSupabaseAuth(){if(!client)throw new Error("管理員資料服務暫時未能載入。");if(!authPromise){authPromise=(async()=>{const current=await client.auth.getSession();if(current.error)throw current.error;if(current.data?.session?.user?.id)return current.data.session;const signIn=await client.auth.signInAnonymously();if(signIn.error)throw signIn.error;if(!signIn.data?.session?.user?.id)throw new Error("未能建立安全連線。");return signIn.data.session})().catch(error=>{authPromise=null;throw error})}return authPromise}
async function rpc(name,args){await ensureSupabaseAuth();const{data,error}=await client.rpc(name,args);if(error)throw error;return data}

function render(){
  const query=String(elements.search.value||"").trim().toLocaleLowerCase();
  const rows=HOMEWORK_HOT_KEY_REFERENCE.filter(item=>[
    item.trigger,item.label,item.type,...item.aliases,...item.pages
  ].join(" ").toLocaleLowerCase().includes(query));
  elements.grid.replaceChildren();
  for(const item of rows){
    const article=document.createElement("article");article.className="hotkey-card";article.style.setProperty("--hotkey-color",item.color);
    const header=document.createElement("header");const title=document.createElement("h2");title.textContent=item.label;
    const type=document.createElement("span");type.className="hotkey-type";type.textContent=item.type;header.append(title,type);
    const command=document.createElement("p");command.className="hotkey-command";const code=document.createElement("code");code.textContent=item.trigger;command.append(code);
    const aliases=document.createElement("p");aliases.className="hotkey-aliases";aliases.textContent=item.aliases.length?`亦接受：${item.aliases.join("、")}`:"沒有其他別名";
    const pages=document.createElement("p");pages.className="hotkey-pages";pages.append("可連結：");
    item.pages.forEach((page,index)=>{if(index)pages.append("、");const pageCode=document.createElement("code");pageCode.textContent=page;pages.append(pageCode)});
    article.append(header,command,aliases,pages);elements.grid.append(article);
  }
  elements.count.textContent=`顯示 ${rows.length} / ${HOMEWORK_HOT_KEY_REFERENCE.length} 個 Hot Keys`;
  elements.empty.hidden=rows.length>0;
}

elements.search.addEventListener("input",render);
async function initialise(){const session=readAdminSession();if(!session){elements.gateMessage.textContent="請先在功課系統以管理員身分登入。";return}try{const valid=await rpc("schedule_admin_me",{p_admin_token:session.adminToken});if(!Array.isArray(valid)||!valid[0]?.name)throw new Error("管理員登入已失效。");elements.gate.hidden=true;elements.reference.hidden=false;render()}catch(error){elements.gateMessage.textContent=error.message||"未能驗證管理員登入。"}}
initialise();
