import { readFileSync } from "node:fs";
import vm from "node:vm";

export function loadFlashcardCoreSeed() {
  const source = readFileSync(new URL("../flashcards-core-data.js", import.meta.url), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: "flashcards-core-data.js", timeout: 30_000 });
  return JSON.parse(JSON.stringify(sandbox.window.EDMUND_FLASHCARD_SEED || {}));
}
