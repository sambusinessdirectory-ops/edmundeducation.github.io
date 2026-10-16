import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('followup', Path(__file__).with_name('asr-orthography-followup.py'))
followup = importlib.util.module_from_spec(spec)
spec.loader.exec_module(followup)


class FollowupTests(unittest.TestCase):
    def test_exact_orthography_equivalence(self):
        for a, b in [('back-breaking', 'backbreaking'), ('tech-minded', 'techminded'),
                     ('headfirst', 'head first'), ('headfirst', 'head-first'),
                     ('fifty-fifty', '50-50')]:
            self.assertEqual(followup.words(a), followup.words(b))

    def test_lexical_and_grammatical_differences_survive(self):
        for a, b in [('described', 'describe'), ('dived', 'dive'), ('off', 'of'),
                     ('Mei', 'May'), ('root', 'route'), ('role', 'roll'),
                     ('not a fifty-fifty split', 'a 50-50 split'),
                     ('fifty-fifty', '50-15'), ('headfirst', 'ahead first'),
                     ('back-breaking', 'back broken')]:
            self.assertNotEqual(followup.words(a), followup.words(b))

    def test_backbreaking_tense_change_remains_visible(self):
        result = followup.compare('The workers described back-breaking work.',
                                  'The workers describe backbreaking work.', ['back-breaking'])
        self.assertEqual(result['wordEdits'], 1)
        self.assertTrue(result['remainingLexicalDifference'])
        self.assertEqual(result['targetPhrasesNotRecognised'], [])

    def test_extra_numeric_tail_not_removed(self):
        result = followup.compare('Digital rules.', 'Digital rules. 8 8 9')
        self.assertEqual(result['wordEdits'], 3)
        self.assertTrue(result['reviewFlag'])


if __name__ == '__main__':
    unittest.main()
