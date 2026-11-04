// Fisher–Yates draws every permutation uniformly from the supplied random source.
export function shuffleChoices(values, random = Math.random) {
  const shuffled = [...values];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function correctSourceLetter(question) {
  const answer = question.options.find(option => option.text === question.answer);
  if (!answer) throw new Error(`Missing answer for ${question.id}`);
  return answer.letter;
}

export function newChoiceOrder(question, answerPosition, random = Math.random) {
  const correct = correctSourceLetter(question);
  const wrong = shuffleChoices(question.options.filter(option => option.letter !== correct).map(option => option.letter), random);
  wrong.splice(answerPosition, 0, correct);
  return wrong;
}

export function initialChoiceOrders(questions, random = Math.random) {
  // Evenly spread correct positions while shuffling both position assignments and distractors.
  const base = shuffleChoices([0, 1, 2, 3, 4, 5], random);
  const positions = shuffleChoices(questions.map((_, index) => base[index % 6]), random);
  return questions.map((question, index) => newChoiceOrder(question, positions[index], random));
}

export function retryChoiceOrder(question, previous, random = Math.random) {
  const correct = correctSourceLetter(question);
  const oldPosition = previous.indexOf(correct);
  const alternatives = shuffleChoices([0, 1, 2, 3, 4, 5].filter(position => position !== oldPosition), random);
  return newChoiceOrder(question, alternatives[0], random);
}

export function validChoiceOrder(question, order) {
  return Array.isArray(order) && order.length === 6 &&
    new Set(order).size === 6 &&
    order.every(letter => question.options.some(option => option.letter === letter));
}
