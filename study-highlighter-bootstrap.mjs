import {juniorHighlightToolbar, mountJuniorHighlighter} from './junior-text-highlighter.mjs?v=20261021-study3';

const dashboard = document.querySelector('[data-view="dashboard"]');
if (dashboard) {
  const system = document.body.dataset.learningPortal;
  if (system === 'grammar' || system === 'error-identifier') {
    dashboard.insertAdjacentHTML('afterbegin', juniorHighlightToolbar());
    const toolbar = dashboard.querySelector('.junior-highlight-toolbar');
    const grammar = system === 'grammar';
    const options = grammar ? {
      scopeSelector: '.grammar-question, .grammar-articles-topic',
      scopeKey(scope) {
        if (scope.matches('[data-tense-topic]')) return `tense:topic:${scope.dataset.tenseTopic}`;
        if (scope.matches('[data-articles-topic]')) return `articles:topic:${scope.dataset.articlesTopic}`;
        if (scope.matches('[data-advanced-articles-topic]')) return `advanced-articles:topic:${scope.dataset.advancedArticlesTopic}`;
        const practice = scope.closest('[data-grammar-practice], [data-articles-practice], [data-advanced-articles-practice], [data-new-grammar-practice]');
        const lesson = practice?.hasAttribute('data-grammar-practice') ? 'tense'
          : practice?.hasAttribute('data-articles-practice') ? 'articles'
          : practice?.hasAttribute('data-advanced-articles-practice') ? 'advanced-articles'
          : practice?.dataset.newGrammarPractice || 'unknown';
        const label = scope.querySelector('.grammar-question__number')?.textContent || '';
        const number = Number(label.match(/\d+/)?.[0]);
        return Number.isInteger(number) && number > 0 ? `${lesson}:question:${number}` : '';
      }
    } : {
      scopeSelector: '.error-id-question, .error-id-passage-line',
      scopeKey(scope) {
        if (scope.matches('.error-id-question')) return `single:question:${scope.dataset.question}`;
        const passage = scope.closest('[data-passage-id]')?.dataset.passageId;
        return passage ? `passage:${passage}:line:${scope.dataset.passageLine}` : '';
      }
    };
    const eligible = grammar
      ? '.grammar-question__prompt, .grammar-question__translation, .grammar-explanation, .grammar-articles-topic'
      : '.error-id-sentence, .error-id-feedback, .error-id-passage-line__main p, .error-id-passage-feedback';
    const highlighter = mountJuniorHighlighter(dashboard, eligible, grammar ? 'grammar' : 'error', options);
    const active = () => grammar
      ? [...dashboard.querySelectorAll('[data-grammar-practice], [data-articles-practice], [data-advanced-articles-practice], [data-new-grammar-practice], [data-tense-curation], [data-articles-curation], [data-advanced-articles-curation], [data-new-grammar-curation]')].some(section => !section.hidden)
      : [...dashboard.querySelectorAll('[data-error-id-single], [data-error-id-passage]')].some(section => !section.hidden);
    let pending = false;
    const update = () => {
      pending = false;
      toolbar.hidden = !active() || dashboard.hidden;
      if (!toolbar.hidden) { highlighter.syncToolbar(); highlighter.repaint(); }
    };
    const schedule = () => { if (!pending) { pending = true; requestAnimationFrame(update); } };
    new MutationObserver(schedule).observe(dashboard, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    schedule();
  }
}
