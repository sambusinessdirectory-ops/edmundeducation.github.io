(() => {
  'use strict';
  window.EssayMemoryOpinion3Pilot = {
    init() {
      if (new URLSearchParams(location.search).get('essay') !== 'opinion:3' || document.body.classList.contains('opinion3-terminal')) return;
      const $ = selector => document.querySelector(selector);
      const shell = $('.shell');
      const mission = $('.mission');
      const play = $('.play-area');
      const setup = $('.setup-card');
      const catalogue = $('.memory-catalogue');
      if (!shell || !mission || !play || !setup || !catalogue) return;
      document.body.classList.add('opinion3-terminal');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#272925');

      const siteToggle = document.createElement('button');
      siteToggle.type = 'button';
      siteToggle.className = 'pilot-site-toggle';
      siteToggle.setAttribute('aria-expanded', 'false');
      siteToggle.textContent = 'MENU  ☰';
      $('.memory-header').append(siteToggle);
      siteToggle.addEventListener('click', () => {
        const open = document.body.classList.toggle('pilot-global-open');
        siteToggle.setAttribute('aria-expanded', String(open));
        siteToggle.textContent = open ? 'CLOSE  ×' : 'MENU  ☰';
      });

      const hud = document.createElement('header');
      hud.className = 'pilot-hud';
      hud.innerHTML = `
        <div class="pilot-hud-title"><span class="pilot-hud-kicker">EDMUND EDUCATION / MEMORY PROGRAM</span><h1>MEMORIZATION <em>TERMINAL</em></h1><p>MODEL ESSAY 03 <span>·</span> IELTS OPINION <span>·</span> 博物館與藝術</p></div>
        <div class="pilot-hud-actions"><div class="pilot-hud-meter"><small>PROGRAM / 關卡</small><strong data-pilot-stage>01 / 11</strong></div><div class="pilot-hud-meter"><small>STEPS / 進度</small><strong data-pilot-progress>0 / 0</strong></div><div class="pilot-hud-meter"><small>POINTS / 積分</small><strong data-pilot-points>0</strong></div><button type="button" data-pilot-help aria-label="查看操作說明">?</button></div>`;
      const cockpit = document.createElement('section');
      cockpit.className = 'pilot-cockpit';
      cockpit.setAttribute('aria-label', 'Model Essay 3 記憶訓練介面');
      const programs = document.createElement('aside');
      programs.className = 'pilot-programs';
      programs.innerHTML = '<div class="pilot-panel-tab"><span>01 / PROGRAMS</span><strong>TRAINING FILES</strong></div>';
      const workspace = document.createElement('div');
      workspace.className = 'pilot-workspace';
      const workspaceLabel = document.createElement('div');
      workspaceLabel.className = 'pilot-workspace-label';
      workspaceLabel.innerHTML = '<span>ACTIVE FILE / 03</span><strong>REMEMBER THE ARGUMENT</strong>';
      const dossier = document.createElement('aside');
      dossier.className = 'pilot-dossier';
      dossier.innerHTML = '<div class="pilot-panel-tab"><span>02 / DOSSIER</span><strong>ESSAY EVIDENCE</strong></div>';
      const sourceLabel = document.createElement('div');
      sourceLabel.className = 'pilot-source-label';
      sourceLabel.textContent = 'THE ORIGINAL TASK';
      const tools = document.createElement('details');
      tools.className = 'pilot-tools';
      tools.innerHTML = '<summary><span>SESSION EQUIPMENT</span><strong>字體 · 朗讀 · 錄音 · 進度</strong></summary>';
      const library = document.createElement('details');
      library.className = 'pilot-library';
      library.innerHTML = '<summary><span>FILE CABINET / 288 ESSAYS</span><strong>切換範文與題型</strong></summary>';

      shell.prepend(hud, cockpit);
      cockpit.append(programs, workspace, dossier);
      programs.append(mission);
      workspace.append(workspaceLabel, play);
      dossier.append(sourceLabel, setup, tools);
      play.querySelector('#feedback').after(play.querySelector('.step-picker'));
      tools.append(play.querySelector('.reading-controls'), play.querySelector('.progress-actions'), play.querySelector('.score-explanation'), play.querySelector('.utility-row'), $('.pilot-note'));
      cockpit.after(library);
      library.append(catalogue);
      $('.hero').hidden = true;

      const tutorial = document.createElement('dialog');
      tutorial.className = 'pilot-tutorial';
      tutorial.setAttribute('aria-labelledby', 'pilot-tutorial-title');
      tutorial.innerHTML = '<div class="pilot-tutorial-paper"><span class="pilot-tutorial-kicker">FIELD MANUAL / 03</span><h2 id="pilot-tutorial-title">這份訓練檔怎樣使用？</h2><ol><li><b>左側選關卡。</b>十一項訓練可隨時重溫。</li><li><b>中間完成當前練習。</b>答題、重組與朗讀按原本規則運作。</li><li><b>右側核對題目。</b>字體、語速、錄音和進度工具都在下方。</li></ol><button type="button" data-pilot-close>開始練習 <span aria-hidden="true">→</span></button></div>';
      document.body.append(tutorial);
      hud.querySelector('[data-pilot-help]').addEventListener('click', () => tutorial.showModal());
      tutorial.querySelector('[data-pilot-close]').addEventListener('click', () => tutorial.close());
      tutorial.addEventListener('click', event => { if (event.target === tutorial) tutorial.close(); });
      const dockQuestion = () => {
        const question = $('.learning-question-launcher');
        if (!question) return false;
        question.textContent = '提問';
        hud.querySelector('.pilot-hud-actions').append(question);
        return true;
      };
      if (!dockQuestion()) {
        const questionObserver = new MutationObserver(() => { if (dockQuestion()) questionObserver.disconnect(); });
        questionObserver.observe(document.body, { childList: true });
      }

      const syncHud = () => {
        const active = $('#stage-rail .stage-node.active');
        const number = Number(active?.dataset.stage ?? 0) + 1;
        hud.querySelector('[data-pilot-stage]').textContent = `${String(number).padStart(2, '0')} / 11`;
        hud.querySelector('[data-pilot-progress]').textContent = $('#overall-number').textContent.replace(/^全程\s*/, '');
        hud.querySelector('[data-pilot-points]').textContent = $('#star-count').textContent;
        document.body.dataset.pilotStage = String(number);
      };
      const scheduleSync = () => requestAnimationFrame(syncHud);
      new MutationObserver(scheduleSync).observe($('#stage-rail'), { childList: true });
      new MutationObserver(scheduleSync).observe($('#overall-number'), { childList: true, characterData: true, subtree: true });
      new MutationObserver(scheduleSync).observe($('#star-count'), { childList: true, characterData: true, subtree: true });
      syncHud();

      const card = $('#game-card');
      new MutationObserver(records => {
        if (!records.some(record => record.addedNodes.length || record.removedNodes.length)) return;
        card.classList.remove('pilot-panel-in');
        void card.offsetWidth;
        card.classList.add('pilot-panel-in');
      }).observe(card, { childList: true });
      const openTools = document.createElement('button');
      openTools.type = 'button';
      openTools.className = 'pilot-tools-shortcut';
      openTools.textContent = 'TOOLS / 裝備';
      openTools.addEventListener('click', () => { tools.open = true; tools.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
      workspaceLabel.append(openTools);
    }
  };
})();
