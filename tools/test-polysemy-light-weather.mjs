import assert from 'node:assert/strict';
import light from '../polysemy-lab/content/light.mjs';
import massIndex from '../polysemy-lab/mass-index.mjs';

const question=light.questions.find(item=>item.id==='light-19-1');
const snowSense=light.senses.find(item=>item.id===question?.correctOption);
const rainSense=light.senses.find(item=>item.id==='light-mcq-17');

assert.equal(question?.en,'We had light snow overnight.');
assert.equal(question?.zh,'昨晚下了小雪。');
assert.equal(question?.explanation,'本句的「light snow」指「小雪；微雪」。');
assert.equal(snowSense?.form,'light snow');
assert.equal(snowSense?.zh,'小雪；微雪');
assert.equal(rainSense?.form,'light rain');
assert.equal(rainSense?.zh,'小雨');
assert.ok(!question?.options.includes(rainSense.id),'light rain must not be accepted for light snow');

const indexedLight=massIndex.find(item=>item.id==='light');
const indexedQuestion=indexedLight?.questions.find(item=>item.id===question.id);
assert.equal(indexedQuestion?.correctOption,snowSense.id);
assert.ok(indexedLight?.senses.some(item=>item.id===snowSense.id));

console.log('PASS: light snow and light rain have separate, synchronized meanings.');
