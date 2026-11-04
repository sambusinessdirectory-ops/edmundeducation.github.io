import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-218-v2-audio","audio","聽到這句，螢幕最可能顯示甚麼？",["載入圖示一直轉，內容不出現。", "網頁完整顯示所有內容。", "網頁已顯示標題，但圖片仍慢慢載入。", "網頁顯示錯誤頁面而不是內容。"],"載入圖示一直轉，內容不出現。","won’t load 指網頁內容無法成功載入，常見畫面是一直轉圈。"),
  mc("native-218-v2-detail","detail","哪個畫面最支持 The page won’t load？",["空白頁只顯示轉圈，等了很久仍沒有內容。", "文章已顯示，但字太小。", "網頁完整顯示，只有影片無法播放。", "內容完整打開，只是滑動太快。"],"空白頁只顯示轉圈，等了很久仍沒有內容。","重點是內容始終沒有出現，不是排版或閱讀速度問題。"),
  mc("native-218-v2-tone","tone","同事傳你一條連結，但頁面完全打不開；你想請他確認連結是否有效。哪句回覆最直接？",["The page won’t load for me. Could you check the link?", "Your link might be wrong; I can’t open it at all.", "The page is slow, but I can see everything now.", "Could you send a screenshot of the page instead?"],"The page won’t load for me. Could you check the link?","先說明自己看到的問題，再請對方檢查；沒有武斷指責。"),
  {id:"native-218-v2-final",type:'open',style:"final",prompt:"新的情境：你要用活動網站填報名表，但頁面一直轉圈。你已重新整理仍無法開啟。寫一兩句英文向活動組報告並請求幫助。",answers:["The registration page won’t load. I tried refreshing it, but it still doesn't open.", "I can’t access the sign-up form because the page won’t load. Could you help?", "The page won’t load even after I refresh it; is there another link?"],explanation:"指出是哪個頁面、一直無法載入，以及已嘗試重新整理，方便對方排查。"}
];

const steps=[
  {"id": "native-218-v2-audio", "style": "audio", "label": "先聽狀態", "title": "網頁是否打開？", "intro": "先聽英文，再判斷畫面。", "model": "The page won’t load.", "zh": "網頁載入不了。", "audioOnly": true, "questions": ["native-218-v2-audio"]},
  {"id": "native-218-v2-speak", "style": "speak", "label": "口頭報告", "title": "連結打不開", "intro": "先說出網頁無法載入的狀態，再聽示範。", "model": "The page won’t load.", "zh": "網頁載入不了。", "speakingPrompt": "同事問你看到連結沒有；口頭說「網頁載入不了」。", "recording": "phrase", "questions": []},
  {"id": "native-218-v2-detail", "style": "detail", "label": "抓畫面細節", "title": "不是讀得太慢", "intro": "找證明頁面沒打開的跡象。", "questions": ["native-218-v2-detail"]},
  {"id": "native-218-v2-tone", "style": "tone", "label": "請求協助", "title": "不責怪對方", "intro": "比較同事間的回覆語氣。", "questions": ["native-218-v2-tone"]},
  {"id": "native-218-v2-final", "style": "final", "label": "新網站自寫", "title": "向活動組求助", "intro": "自己寫問題及已試步驟。", "questions": ["native-218-v2-final"]}
];

export default {revision:2,summary:"用 The page won’t load. 描述網頁持續載入而內容無法顯示。",steps,questions,takeaways:["The page won’t load.", "Try refreshing the page."],completionTitle:"你能指出網頁載入失敗，並提出重新整理這一步。"};
