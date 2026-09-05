-- Admit 2024 DSE source-aligned translations without changing access permissions.
ALTER TABLE public.dse_reading_translations
  DROP CONSTRAINT dse_reading_translations_article_id_check,
  ADD CONSTRAINT dse_reading_translations_article_id_check
    CHECK (article_id ~ '^dse-(201[2-9]|202[0-6])-(a|b1|b2)$');
