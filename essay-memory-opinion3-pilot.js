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
      const syncReaderSize = () => { document.body.dataset.pilotReaderSize = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--reader-scale')) > 1 ? 'enlarged' : 'standard'; };
      new MutationObserver(syncReaderSize).observe(document.documentElement, { attributes:true, attributeFilter:['style'] });
      syncReaderSize();
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
      const switchEssay = document.createElement('button');
      switchEssay.className = 'pilot-switch-essay';
      switchEssay.type = 'button';
      switchEssay.textContent = 'FILE CABINET / 切換範文 →';
      const library = document.createElement('details');
      library.className = 'pilot-library';
      library.innerHTML = '<summary><span>FILE CABINET / 288 ESSAYS</span><strong>切換範文與題型</strong></summary>';

      shell.prepend(hud, cockpit);
      cockpit.append(programs, workspace, dossier);
      programs.append(mission);
      workspace.append(workspaceLabel, play);
      dossier.append(sourceLabel, setup, switchEssay, tools);
      play.querySelector('#feedback').after(play.querySelector('.step-picker'));
      tools.append(play.querySelector('.reading-controls'), play.querySelector('.progress-actions'), play.querySelector('.score-explanation'), play.querySelector('.utility-row'), $('.pilot-note'));
      cockpit.after(library);
      library.append(catalogue);
      switchEssay.addEventListener('click', () => { library.open = true; library.querySelector('summary').focus(); });
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
      const sentences = window.ESSAY_MEMORY_LESSONS?.['opinion:3']?.sentences || [];
      const meaningCues = [
        '博物館塑造文化理解','有人主張只展本地作品','本文反對這項限制','國際館藏有兩項益處',
        '外國作品提高教育價值','缺少比較會令理解狹窄','並列作品可看見文化共通點','國際藝術深化社會理解',
        '作品呈現不同社會經驗','排除外國藝術削弱館藏價值','國際藝術也有益本地創作者','陌生技法促進藝術家進步',
        '外來影響打破創作重複','年輕藝術家帶回新視角','多元展覽吸引更多觀眾','交替展覽也讓觀眾發現本地人才',
        '結論：不應只展本地作品','重申反對立場','國際藝術有益公眾與本地藝術'
      ];
      const cueBySentence = new Map(sentences.map((sentence, index) => [sentence.english.trim().toLowerCase(), meaningCues[index]]));
      const reference = document.createElement('details');
      reference.className = 'pilot-phrase-reference';
      reference.innerHTML = '<summary>完整字詞與小節表</summary>';
      const answerReference = document.createElement('details');
      answerReference.className = 'pilot-answer-reference';
      answerReference.innerHTML = '<summary>範文論證對照</summary>';
      let lastLead = null;
      const presentRound = () => {
        const lead = card.firstElementChild;
        if (!lead || lead === lastLead) return;
        lastLead = lead;
        card.scrollTop = 0;
        reference.remove();
        reference.open = false;
        answerReference.remove();
        answerReference.open = false;
        if (card.classList.contains('structure-card')) {
          const parts = card.querySelector('.structure-parts');
          if (parts) {
            const pieces = [...parts.children];
            const weights = pieces.map(piece => Math.max(2.6, Math.sqrt(piece.firstChild?.textContent?.trim().length || 10)));
            parts.style.gridTemplateColumns = weights.map(weight => `minmax(0,${weight.toFixed(2)}fr)`).join(' ');
            const source = card.querySelector(':scope > .support-source');
            const segments = pieces.map(piece => ({text:piece.firstChild?.textContent || '',label:piece.querySelector('small')?.textContent || '',fixed:!piece.classList.contains('slot')}));
            if (source && segments.map(segment => segment.text).join('').trim() === source.textContent.trim()) {
              source.classList.add('pilot-annotated-source');
              source.replaceChildren(...segments.map(segment => {
                const mark = document.createElement('span');
                mark.className = segment.fixed ? 'pilot-source-fixed' : 'pilot-source-slot';
                mark.textContent = segment.text;
                mark.title = segment.label;
                return mark;
              }));
            }
          }
        }
        if (card.classList.contains('simple-build') || card.classList.contains('exact-build')) {
          card.querySelector(':scope > h3 + p')?.classList.add('pilot-build-instruction');
          const table = card.querySelector('.support-table:not(.word-bank)');
          if (table) {
            const glossary = document.createElement('div');
            glossary.className = 'pilot-glossary';
            glossary.setAttribute('aria-label', '原文字詞、簡單說法與意思');
            const rows = [...table.querySelectorAll('tbody tr')];
            const activeChunk = card.querySelector('[data-build="0"]')?.textContent?.trim().toLowerCase() || '';
            const relevant = rows.filter(row => [...row.cells].slice(0,2).some(cell => activeChunk.includes(cell.textContent.trim().toLowerCase())));
            const visible = new Set((relevant.length ? relevant : rows).slice(0,4));
            for (const row of rows) {
              const cells = [...row.cells].map(cell => cell.textContent.trim());
              const entry = document.createElement('div');
              entry.className = `pilot-glossary-entry${visible.has(row) ? '' : ' pilot-glossary-optional'}`;
              for (const [index, value] of cells.entries()) {
                const part = document.createElement(index === 0 ? 'strong' : 'span');
                part.className = `pilot-glossary-part pilot-glossary-part-${index}`;
                part.textContent = value;
                entry.append(part);
              }
              glossary.append(entry);
            }
            const fullTable = table.closest('.table-scroll');
            fullTable.replaceWith(glossary);
            reference.append(fullTable);
          }
          const bank = card.querySelector('.word-bank')?.closest('.table-scroll');
          if (bank) reference.append(bank);
          if (reference.children.length > 1) tools.append(reference);
        }
        if (card.classList.contains('sentence-map')) {
          const paragraph = Number($('#step-select').value);
          const paragraphSentences = sentences.filter(sentence => sentence.paragraph === paragraph);
          for (const button of card.querySelectorAll('[data-sequence]')) {
            const cue = meaningCues[sentences.indexOf(paragraphSentences[Number(button.dataset.sequence)])];
            const strong = button.querySelector('strong');
            if (cue && strong) { strong.textContent = cue; button.setAttribute('aria-label', cue); }
            button.querySelector('small')?.remove();
          }
          for (const slot of card.querySelectorAll('.sequence-slot.filled span')) {
            slot.textContent = cueBySentence.get(slot.textContent.trim().toLowerCase()) || slot.textContent;
          }
        }
        card.querySelector('.sequence-slot:not(.filled)')?.classList.add('pilot-next-slot');
        card.classList.remove('pilot-panel-in');
        void card.offsetWidth;
        card.classList.add('pilot-panel-in');
      };
      const presentSuccess = () => {
        if (!card.classList.contains('is-correct')) return;
        const connection = card.querySelector(':scope > .model-connection');
        if (connection) {
          answerReference.append(connection);
          tools.append(answerReference);
          const review = document.createElement('button');
          review.type = 'button';
          review.className = 'pilot-review-link';
          review.dataset.pilotReview = '';
          review.textContent = '範文論證對照 ↗';
          card.querySelector('[data-continue]')?.before(review);
        }
      };
      new MutationObserver(records => {
        if (records.some(record => record.addedNodes.length || record.removedNodes.length)) { presentRound(); presentSuccess(); }
      }).observe(card, { childList: true });
      presentRound();
      card.addEventListener('click', event => {
        if (!event.target.closest('[data-pilot-review]')) return;
        tools.open = true;
        answerReference.open = true;
        if (matchMedia('(max-width:1150px)').matches) openDrawer('dossier');
      });
      const openTools = document.createElement('button');
      openTools.type = 'button';
      openTools.className = 'pilot-tools-shortcut';
      openTools.textContent = 'TOOLS / 裝備';
      openTools.addEventListener('click', () => { tools.open = true; if (matchMedia('(max-width:760px)').matches) openDrawer('dossier'); });
      workspaceLabel.append(openTools);
      const openPrograms = document.createElement('button');
      openPrograms.type = 'button';
      openPrograms.className = 'pilot-drawer-shortcut';
      openPrograms.textContent = '關卡';
      const openDossier = document.createElement('button');
      openDossier.type = 'button';
      openDossier.className = 'pilot-drawer-shortcut';
      openDossier.textContent = '題目';
      workspaceLabel.append(openPrograms, openDossier);
      const closeDrawer = () => document.body.classList.remove('pilot-drawer-programs', 'pilot-drawer-dossier');
      const openDrawer = which => { closeDrawer(); document.body.classList.add(`pilot-drawer-${which}`); };
      openPrograms.addEventListener('click', () => openDrawer('programs'));
      openDossier.addEventListener('click', () => openDrawer('dossier'));
      for (const panel of [programs, dossier]) {
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'pilot-drawer-close';
        close.textContent = '關閉 ×';
        close.addEventListener('click', closeDrawer);
        panel.prepend(close);
      }
      $('#stage-rail').addEventListener('click', closeDrawer);
      document.addEventListener('keydown', event => { if (event.key === 'Escape') closeDrawer(); });
    }
  };
})();
