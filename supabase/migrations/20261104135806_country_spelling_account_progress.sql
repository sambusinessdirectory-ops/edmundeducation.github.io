insert into flashcard_integrity.state_key_rules (
  state_key,
  expected_json_type,
  max_payload_bytes,
  write_strategy,
  v2_writable,
  enabled,
  description,
  updated_at
)
values (
  'edmundCountrySpellingProgressV1',
  'object',
  524288,
  'versioned_replace',
  true,
  true,
  'Account-scoped progress for the country and Hong Kong spelling trainer',
  now()
)
on conflict (state_key) do update
set expected_json_type = excluded.expected_json_type,
    max_payload_bytes = excluded.max_payload_bytes,
    write_strategy = excluded.write_strategy,
    v2_writable = excluded.v2_writable,
    enabled = excluded.enabled,
    description = excluded.description,
    updated_at = now();
