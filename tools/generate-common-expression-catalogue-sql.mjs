#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const masterPath = path.join(root, "supabase-common-expression-system.sql");
const migrationPath = path.join(root, "supabase-common-expression-catalogue-20260811.sql");
const window = {};

for (const file of ["common-expression-system-data.js", "common-expression-system-imported-data.js"]) {
  vm.runInNewContext(fs.readFileSync(path.join(root, file), "utf8"), { window }, { filename: file });
}

const systems = Object.values(window.EDMUND_COMMON_EXPRESSION_DATA?.systems || {});
const rows = systems.flatMap((system) => (system.lessons || []).map((lesson) => ({
  systemKey: system.key,
  lessonId: lesson.id,
  questionCount: lesson.questions.length
})));

if (rows.length !== 172) throw new Error(`Expected 172 reviewed catalogue lessons, found ${rows.length}`);
if (rows.reduce((sum, row) => sum + row.questionCount, 0) !== 5140) throw new Error("Expected 5,140 reviewed questions");

const values = rows.map(({ systemKey, lessonId, questionCount }, index) => (
  `  ('${systemKey}', '${lessonId}', ${questionCount}, 1, true)${index === rows.length - 1 ? "" : ","}`
)).join("\n");

const insert = `insert into public.common_expression_catalogue_lessons (\n` +
`  system_key,\n` +
`  lesson_id,\n` +
`  question_count,\n` +
`  content_version,\n` +
`  is_enabled\n` +
`)\n` +
`values\n${values}\n` +
`on conflict (system_key, lesson_id) do update\n` +
`set question_count = excluded.question_count,\n` +
`    content_version = excluded.content_version,\n` +
`    is_enabled = true,\n` +
`    updated_at = now();`;

const master = fs.readFileSync(masterPath, "utf8");
const seedPattern = /insert into public\.common_expression_catalogue_lessons \([\s\S]*?updated_at = now\(\);/;
if (!seedPattern.test(master)) throw new Error("Authoritative Common Expression seed block was not found");
fs.writeFileSync(masterPath, master.replace(seedPattern, insert));

const migration = `-- Enable the 114 teacher-reviewed Common Expression lessons imported on 11 Aug 2026.\n` +
`-- This migration changes catalogue rows only; existing progress keys remain unchanged.\n\n` +
`begin;\n\n${insert}\n\ncommit;\n`;
fs.writeFileSync(migrationPath, migration);

console.log(JSON.stringify({ lessons: rows.length, questions: 5140, migration: path.basename(migrationPath) }, null, 2));
