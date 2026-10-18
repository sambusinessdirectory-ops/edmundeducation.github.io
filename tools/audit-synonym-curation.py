#!/usr/bin/env python3
"""Inventory synonym feedback that still needs editorial review after import."""

import csv
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SUMMARY = ROOT / 'tools/synonym-curation-audit-20261019.csv'
DETAILS = ROOT / 'tools/synonym-curation-gaps-20261019.csv'


def feedback_issue(value):
    value = (value or '').strip()
    if not value or value in {'---', '—', '-'}:
        return 'blank_or_dashes'
    if '原始教材未提供' in value or '本題教材沒有為此選項提供' in value:
        return 'source_has_no_individual_feedback'
    if value.startswith('語域：'):
        return 'register_only'
    if '這句的決定性線索是' in value:
        return 'generic_decisive_clue_needs_review'
    return ''


def main():
    ranked = list(csv.DictReader((ROOT / 'synonyms/priority-import-audit.csv').open()))
    totals = Counter()
    summary = []
    details = []
    for row in ranked:
        lesson = json.loads((ROOT / 'synonyms/lessons' / (row['lesson_id'] + '.json')).read_text())
        found = Counter()
        for word in lesson['words']:
            for exercise in word['exercises']:
                if not exercise.get('upgrade'):
                    found['no_source_rewrite'] += 1
                for option in exercise['options']:
                    issue = feedback_issue(option.get('explanation'))
                    if not issue:
                        continue
                    found[issue] += 1
                    details.append([row['rank'], row['headword'], row['source_file'],
                                    word['order'], exercise['number'], exercise['original'],
                                    option['letter'], option['text'], issue,
                                    option.get('explanation', '')])
        found['ungraded_source_exercises'] = int(row['source_issues']) + int(row['quarantined_questions'])
        totals.update(found)
        if any(found.values()):
            summary.append([row['rank'], row['headword'], row['source_file'], row['lesson_id'],
                            *(found[key] for key in ('blank_or_dashes',
                                                      'source_has_no_individual_feedback',
                                                      'register_only',
                                                      'generic_decisive_clue_needs_review',
                                                      'no_source_rewrite',
                                                      'ungraded_source_exercises'))])
    with SUMMARY.open('w', newline='') as out:
        writer = csv.writer(out, lineterminator='\n')
        writer.writerow(['rank', 'headword', 'source_file', 'lesson_id', 'blank_or_dashes',
                         'source_has_no_individual_feedback', 'register_only',
                         'generic_decisive_clue_needs_review', 'no_source_rewrite',
                         'ungraded_source_exercises'])
        writer.writerows(summary)
    with DETAILS.open('w', newline='') as out:
        writer = csv.writer(out, lineterminator='\n')
        writer.writerow(['rank', 'headword', 'source_file', 'word_order', 'exercise_number',
                         'sentence', 'option_letter', 'option_text', 'issue', 'current_feedback'])
        writer.writerows(details)
    print('modules', len(ranked), 'flagged_modules', len(summary),
          'flagged_options', len(details), 'counts', dict(totals))


if __name__ == '__main__':
    main()
