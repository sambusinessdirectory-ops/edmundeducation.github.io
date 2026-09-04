import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const catalogue = await read('dse-reading-catalogue.json');
const audit = await read('tools/dse-reading-question-audit.json');
const entries = catalogue.years.flatMap(year => Object.values(year.sections).filter(Boolean));
const papers = {};
assert.equal(entries.length, 42);
assert.equal(audit.sectionsReviewed, 42);
assert.equal(audit.questionsReviewed, 965);
assert.deepEqual(audit.unpopulatedYears, [2024]);
assert.deepEqual(Object.keys(audit.papers).sort(), entries.map(entry => entry.id).sort());
for (const entry of entries) {
  const paper = await read(`dse-reading-data/${entry.id}.json`);
  papers[entry.id] = paper;
  const review = audit.papers[entry.id];
  assert.equal(review.questionsReviewed, paper.questions.length);
  assert.equal(review.status, 'source-reviewed');
  if (review.correctedQuestions.length) {
    assert.equal(paper.questionRevision, audit.revision);
    assert.match(entry.version, /^\d{8}-/);
    assert.ok(entry.version.slice(0, 8) >= audit.revision.slice(0, 8), 'Cache release must include the question audit');
  }
  assert.equal(new Set(paper.questions.map(q => q.number)).size, paper.questions.length);
  let groups = 0;
  for (const question of paper.questions) {
    const label = `${entry.id} Q${question.number}`;
    assert.ok(question.prompt.trim(), label);
    assert.doesNotMatch(question.prompt, /Please (?:stick|put) the barcode|Answers written in the margins/i, label);
    const controls = question.parts || [question];
    groups += controls.length;
    if (question.parts) {
      assert.ok(question.parts.length, label);
      assert.equal(new Set(question.parts.map(part => part.key)).size, question.parts.length, `${label}: unique answer IDs`);
      assert.ok(question.parts.every(part => String(part.key || '').trim() && part.label?.trim()), `${label}: labelled answer fields`);
    }
    for (const control of controls) {
      assert.ok(['text', 'textarea', 'choice', 'multiple', 'select'].includes(control.type || 'text'), `${label}: supported control`);
      if (['choice', 'multiple', 'select'].includes(control.type)) {
        const values = control.options?.map(option => typeof option === 'string' ? option : option.value);
        assert.ok(values?.length > 1 && values.every(value => String(value).trim()), `${label}: complete options`);
        assert.equal(new Set(values).size, values.length, `${label}: unique options`);
        if (control.type === 'multiple' && control.selectionLimit !== false) {
          assert.ok(Number.isInteger(control.slots) && control.slots > 0 && control.slots <= values.length, `${label}: valid choice limit`);
        }
      }
    }
    const tableKeys = (question.tables || []).flatMap(table => table.rows.flatMap(row => row.flatMap(cell => cell.parts || (cell.part ? [cell.part] : []))));
    assert.deepEqual(tableKeys.toSorted(), (question.parts || []).filter(part => part.inTable).map(part => part.key).toSorted(), `${label}: exactly one table control per answer`);
    assert.equal(new Set(tableKeys).size, tableKeys.length, label);
  }
  assert.equal(groups, review.answerGroups);
}
const question = (id, number) => papers[`dse-${id}`].questions.find(item => item.number === number);
// Counts below are source blanks, not marks: some multiword answers earn one mark.
for (const [id, number, count] of [
  ['2012-a',18,18],['2012-b1',26,4],['2012-b1',35,2],['2012-b1',40,11],['2012-b2',52,4],['2012-b2',67,12],
  ['2013-b1',34,13],['2014-b1',53,3],['2015-b2',61,3],['2016-a',12,7],['2016-b2',51,9],
  ['2017-a',14,3],['2018-a',6,7],['2019-a',16,4],['2020-a',11,6],['2021-b1',45,8],
  ['2022-a',11,5],['2023-b1',45,3],['2025-b2',50,2],['2026-a',14,5],
]) assert.equal(question(id,number).parts.length,count,`${id} Q${number}: source-reviewed answer count`);
for (const [id, number] of [['2012-b1',24],['2013-b1',33],['2017-b2',58],['2022-b2',60]]) {
  assert.equal(question(id,number).type,'multiple');
  assert.equal(question(id,number).selectionLimit,false);
}
assert.ok(question('2022-b1',26).parts.every(part => part.type === 'multiple' && part.selectionLimit === false));
assert.equal(question('2023-b1',25).slots,3);
assert.deepEqual(question('2025-b2',50).parts.map(part => part.key),['i','ii']);
assert.match(question('2016-a',2).prompt,/number of the superstition/);
assert.doesNotMatch(question('2012-b2',67).context,/Applications to such schools/);
assert.match(question('2022-a',11).prompt,/proofread|mistake|error/i);
assert.equal(audit.questionsCorrected,Object.values(audit.papers).reduce((n,paper)=>n+paper.correctedQuestions.length,0));
console.log(`DSE question audit: ${entries.length} sections, ${audit.questionsReviewed} questions, unique answer fields and source-reviewed repairs verified.`);
