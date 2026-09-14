const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const pageSource=fs.readFileSync(path.join(root,'flashcards.html'),'utf8');
const boot=`
// Fixture adapters replace only external services, catalogue and persistence.
const fixtureDeck='range-world-fixture';
let fixtureCount=337;
getDeckCards=()=>Array.from({length:fixtureCount},(_,i)=>({front:'Word '+(i+1),back:'意思 '+(i+1),examples:[]}));
deckDataRevision=()=>'';
privateDeckVisibleToStudent=()=>true;
readJson=(key,fallback)=>JSON.parse(languageStorage.getItem('range-test:'+key)||'null')||fallback;
writeJson=(key,value)=>{languageStorage.setItem('range-test:'+key,JSON.stringify(value));return true;};
requireFlashcardStateReady=()=>true;
logAttemptStart=()=> 'synthetic-attempt';
saveCurrentProgress=()=>{};
startStudyTimer=()=>{};
stopStudyTimer=()=>{};
renderStudyCard=()=>{};
cachePendingFamiliarityDeck=()=>{};
currentUser={name:'Range Preview A',role:'student'};
currentDeckId=fixtureDeck;currentDeckTitle='Flash Cards · '+languageEdition.label;
setupEvents();
window.rangeTest={
 render(){currentDeckId=fixtureDeck;refreshDeckStartPanel();showAppPanel('deck-start',false);},
 progress(green=[],red=[]){saveDeckFamiliarity(fixtureDeck,{green,red});this.render();},
 count(n){fixtureCount=n;this.render();},
 owner(name){currentUser=name?{name,role:'student'}:null;this.render();},
 selection(){return studySession?{mode:studySession.mode,limit:studySession.cardLimit,queue:studySession.initialQueue}:null;},
 language:languageEdition.language,
};
rangeTest.render();`;
const fixture=pageSource.replace('void initialiseFlashcardPortal();',boot);
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/flashcards.html'){res.setHeader('Content-Type','text/html');res.end(fixture);return;}
 const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(err,body)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(body);});
});

module.exports={server,root};
