#!/usr/bin/env node

import { readFile } from "node:fs/promises";

function inputPath(argv) {
  const index = argv.indexOf("--input");
  if (index === -1 || !argv[index + 1]) throw new Error("Usage: --input <path>");
  return argv[index + 1];
}

try {
  const health = JSON.parse(
    await readFile(inputPath(process.argv.slice(2)), "utf8"),
  );
  if (health?.healthy !== true) {
    console.error("Flashcard integrity observation remains unhealthy; run stays red.");
    process.exitCode = 1;
  } else {
    console.log("Flashcard integrity observation is healthy.");
  }
} catch {
  console.error("Flashcard integrity final gate could not validate its sanitized input.");
  process.exitCode = 1;
}
