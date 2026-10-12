-- S2 Exam Prep: Jayden-only module; student-token-scoped submissions.
-- The question sentences are static site assets; only SHA-256 answer hashes live here.
begin;

create table if not exists public.junior_exam_module_access (
  module_key text not null,
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (module_key, student_id)
);
create table if not exists public.junior_exam_answer_hashes (
  module_key text not null,
  question_number integer not null check (question_number between 1 and 470),
  answer_sha256 text not null check (answer_sha256 ~ '^[0-9a-f]{64}$'),
  primary key (module_key, question_number)
);
create table if not exists public.junior_exam_responses (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  module_key text not null,
  question_number integer not null check (question_number between 1 and 470),
  answer text not null check (char_length(answer) between 1 and 100),
  correct boolean not null,
  submitted_at timestamptz not null default now(),
  primary key (student_id, module_key, question_number),
  foreign key (module_key, question_number) references public.junior_exam_answer_hashes(module_key, question_number)
);
create table if not exists public.junior_exam_submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  module_key text not null,
  answers jsonb not null check (jsonb_typeof(answers) = 'object'),
  submitted_count integer not null check (submitted_count between 1 and 470),
  correct_count integer not null check (correct_count between 0 and 470),
  is_final boolean not null default false,
  submitted_at timestamptz not null default now()
);
create index if not exists junior_exam_submissions_student_module_date_idx
  on public.junior_exam_submissions(student_id, module_key, submitted_at desc);

alter table public.junior_exam_module_access enable row level security;
alter table public.junior_exam_answer_hashes enable row level security;
alter table public.junior_exam_responses enable row level security;
alter table public.junior_exam_submissions enable row level security;
revoke all on public.junior_exam_module_access, public.junior_exam_answer_hashes,
  public.junior_exam_responses, public.junior_exam_submissions from public, anon, authenticated;

insert into public.junior_exam_module_access(module_key, student_id)
values ('s2-exam-prep-oct-2026', 'df2a3ba9-25be-4b0c-823a-304d4c29c2ba'::uuid)
on conflict do nothing;

insert into public.junior_exam_answer_hashes(module_key, question_number, answer_sha256)
values
  ('s2-exam-prep-oct-2026', 1, '38a0eff5fb3861e8fb2ba60e4ce12eaf4288dd9ea4e1d6ca91b8b54f107250a6'),
  ('s2-exam-prep-oct-2026', 2, '490ca3ed5811c020ba8372021ff5dc839a726dc73b392a2ed564b6683e2e844a'),
  ('s2-exam-prep-oct-2026', 3, '094f8633fefe0d72adc9bf286ea1cf27319d383c531ac0933aeee1e999b25544'),
  ('s2-exam-prep-oct-2026', 4, '3cf083c28255868b5f464f8ed39b1db95aee54b99b8670a2dbb556a580e9d5da'),
  ('s2-exam-prep-oct-2026', 5, '497563b3d3a93e9d0e87d7bcbb0f2a5f1317c699a99ae8e6172a5faa66fa48f2'),
  ('s2-exam-prep-oct-2026', 6, '4762a34b36ca0da2c6ee69e5e2656a81b7a3475994df84311395715c52d218aa'),
  ('s2-exam-prep-oct-2026', 7, '7bd61a1b8ebdf789038195e7873e56aad614a1fcf5b2653ce8638ed43336c159'),
  ('s2-exam-prep-oct-2026', 8, 'd4e16994df9002e53294f899714d7137592fd13ba986fcd070214dc85d659968'),
  ('s2-exam-prep-oct-2026', 9, 'ebb6ac05808817d1930cb851e0de9b4028094a42ac8952cf4472ed5848348917'),
  ('s2-exam-prep-oct-2026', 10, '8fb7ac99f7e19ac2989df95e86454e9f292c210ed24a3501258de07752aade51'),
  ('s2-exam-prep-oct-2026', 11, '6ee18b42fbf155df4d67fc4ad9ddc1f485c1295f28faf67f15868705a8405272'),
  ('s2-exam-prep-oct-2026', 12, '3c7ad783454617591512bb1c563047c82a138462bd0a4cb506e4f4a5c48951e4'),
  ('s2-exam-prep-oct-2026', 13, 'f796e2f28ae5811737ccb8233f34e09f8bb75d2511a135543d1ca37be0199a1d'),
  ('s2-exam-prep-oct-2026', 14, 'fea5dd8170f453b7c7ca4cb5b51bef41a2a4997d4a61e8473a5f0df47c635f86'),
  ('s2-exam-prep-oct-2026', 15, 'ff3dbd163436a7d74558c4a9620909ebc9c2811036e336cfead9255dc7e937c7'),
  ('s2-exam-prep-oct-2026', 16, '0a7be080b0f989b345324150f193900a5edf2292e304ad2dd6c0b31a76b2e375'),
  ('s2-exam-prep-oct-2026', 17, '18cf9b4783ee739f6c6503d38de62b796c6c90be799b6329a73c03074e0fa677'),
  ('s2-exam-prep-oct-2026', 18, '6ef946775e978754c68e6ce1f94072318d37ba0a362272139ebf04447c36145b'),
  ('s2-exam-prep-oct-2026', 19, '6afb642998f6a61bd3de37c12771432976849f7baa24a8dc4e16633e65f68501'),
  ('s2-exam-prep-oct-2026', 20, '7d22d390ec67d1aa03eca9ca45884b3c83a0595d0c152d93dea473052383444c'),
  ('s2-exam-prep-oct-2026', 21, '1bdc4666f8dd9752e0cf56ee1503229653d01bfb4fdc2d9d4cd58a6a987d0fbd'),
  ('s2-exam-prep-oct-2026', 22, 'b79a954ce810761a0fb2e4e7156aba074912e476dbc04453e8eb0255174f2bf5'),
  ('s2-exam-prep-oct-2026', 23, '8a61e4090fce75bfbd76b94eec784cb366a579ba01fe5cb1d4950510a1f7ff9d'),
  ('s2-exam-prep-oct-2026', 24, '726f6ee1e259e8007535c937d5dc92ae5ab32aefbbebbbbbfa7028da3c76cf46'),
  ('s2-exam-prep-oct-2026', 25, 'fefb1f9c1f2cfa5bc6de0e1166bb82d8a15e9c0bf98a88dcb5de4ca5d1feb837'),
  ('s2-exam-prep-oct-2026', 26, '8f962e2b8e9db4ea2b3e961fc4fb42b80843e936492a089c0cd97c6c10022712'),
  ('s2-exam-prep-oct-2026', 27, 'd22b75e3a33a790e74baaf8042f72a69bffaabe36780f9ee1ed549e165a38f5e'),
  ('s2-exam-prep-oct-2026', 28, '7f0c68cb87de6c2a8536ca9887b3a1297061f9e1a5f66f6264de35e1086d027a'),
  ('s2-exam-prep-oct-2026', 29, '46459f9bd8c39ba752f095a190cd30f8043f52ab0afe90850c50510c3ef9929d'),
  ('s2-exam-prep-oct-2026', 30, 'daad3b4477b005f6ef1dafc232057949c48e1addb90aef9d4a511a49f7cea942'),
  ('s2-exam-prep-oct-2026', 31, '0e7e50400d6aff0b0594729544c622a76dde2602a6311573aa4ee0ed9d7b4b31'),
  ('s2-exam-prep-oct-2026', 32, 'cf08fccd9d8bfd57d4e6dd765d4cfc1ec6c2e3e9d5219c6229fa0828e9b1004d'),
  ('s2-exam-prep-oct-2026', 33, '1748ba31e26277da728a0256fb6f2743f9b1bcfebb90a9d8988ee936d30b0f0f'),
  ('s2-exam-prep-oct-2026', 34, '6255e14abc09aa5c8882cacc761f506793fe5f5b329ae23d38482ae8bd046e45'),
  ('s2-exam-prep-oct-2026', 35, '2b59cbd080973d9eb0397e8f531b323b5b9d2c39e12000ded77738e47a7f2e2a'),
  ('s2-exam-prep-oct-2026', 36, 'bbc9ee12c4395a2771805fec1e11e85786501a07b2d2e34050cb9ba84d7dbc11'),
  ('s2-exam-prep-oct-2026', 37, '90598d5fc621812ec2272f9eeb720f627a254c8ddca9a33ddc474481e46e115d'),
  ('s2-exam-prep-oct-2026', 38, 'b4a9f51fee942f7a99bd95c41ef7d4b81eebb47cb66633b2ed8ac17d239595ca'),
  ('s2-exam-prep-oct-2026', 39, '2181b995ff12934c45f69f83120600d9826e0dda4b7dadce0360661bfe2cc4b7'),
  ('s2-exam-prep-oct-2026', 40, '54aa7f35d4802240f3467b9d69bcfd3b03b68b4cf80de347a0c14d2650367b59'),
  ('s2-exam-prep-oct-2026', 41, 'b54e2b152c2135f45dfca42c67ec11c8a8d6076f1796f3deaa64a752c1d4efa8'),
  ('s2-exam-prep-oct-2026', 42, 'b9573e6bb24c4c2411affe6ff4b97e16e0e3c7e6f0d28a6033b21fd74aec07f3'),
  ('s2-exam-prep-oct-2026', 43, 'a38bcf73d352e4c7ecd5e6480c34fafb1454d0d1ce77066af3ac6720ea250372'),
  ('s2-exam-prep-oct-2026', 44, '56c7c1948b8505e4ef99939989882ca2a07c77320b5529dd19c6418bb92d4c87'),
  ('s2-exam-prep-oct-2026', 45, '1c6b6b9e01275af3ac768463d2c751b5c0ee7324ba31723ba694ba4ad48eaf3f'),
  ('s2-exam-prep-oct-2026', 46, 'f9d0a9ff95c3e11b4e50c11e32177e9e947217c77103ce6b81510203f4184a95'),
  ('s2-exam-prep-oct-2026', 47, '8e55b8c71f58527e23f9b826fae59dd918c4d10f31b0e3a139a1d59bf906969b'),
  ('s2-exam-prep-oct-2026', 48, '8a61e4090fce75bfbd76b94eec784cb366a579ba01fe5cb1d4950510a1f7ff9d'),
  ('s2-exam-prep-oct-2026', 49, '1bdc4666f8dd9752e0cf56ee1503229653d01bfb4fdc2d9d4cd58a6a987d0fbd'),
  ('s2-exam-prep-oct-2026', 50, '094f8633fefe0d72adc9bf286ea1cf27319d383c531ac0933aeee1e999b25544'),
  ('s2-exam-prep-oct-2026', 51, '6ef946775e978754c68e6ce1f94072318d37ba0a362272139ebf04447c36145b'),
  ('s2-exam-prep-oct-2026', 52, '3c7ad783454617591512bb1c563047c82a138462bd0a4cb506e4f4a5c48951e4'),
  ('s2-exam-prep-oct-2026', 53, 'daad3b4477b005f6ef1dafc232057949c48e1addb90aef9d4a511a49f7cea942'),
  ('s2-exam-prep-oct-2026', 54, '38a0eff5fb3861e8fb2ba60e4ce12eaf4288dd9ea4e1d6ca91b8b54f107250a6'),
  ('s2-exam-prep-oct-2026', 55, '726f6ee1e259e8007535c937d5dc92ae5ab32aefbbebbbbbfa7028da3c76cf46'),
  ('s2-exam-prep-oct-2026', 56, 'f796e2f28ae5811737ccb8233f34e09f8bb75d2511a135543d1ca37be0199a1d'),
  ('s2-exam-prep-oct-2026', 57, '90598d5fc621812ec2272f9eeb720f627a254c8ddca9a33ddc474481e46e115d'),
  ('s2-exam-prep-oct-2026', 58, '7f0c68cb87de6c2a8536ca9887b3a1297061f9e1a5f66f6264de35e1086d027a'),
  ('s2-exam-prep-oct-2026', 59, '1748ba31e26277da728a0256fb6f2743f9b1bcfebb90a9d8988ee936d30b0f0f'),
  ('s2-exam-prep-oct-2026', 60, 'b9573e6bb24c4c2411affe6ff4b97e16e0e3c7e6f0d28a6033b21fd74aec07f3'),
  ('s2-exam-prep-oct-2026', 61, '497563b3d3a93e9d0e87d7bcbb0f2a5f1317c699a99ae8e6172a5faa66fa48f2'),
  ('s2-exam-prep-oct-2026', 62, 'f9d0a9ff95c3e11b4e50c11e32177e9e947217c77103ce6b81510203f4184a95'),
  ('s2-exam-prep-oct-2026', 63, '56c7c1948b8505e4ef99939989882ca2a07c77320b5529dd19c6418bb92d4c87'),
  ('s2-exam-prep-oct-2026', 64, 'd4e16994df9002e53294f899714d7137592fd13ba986fcd070214dc85d659968'),
  ('s2-exam-prep-oct-2026', 65, '6255e14abc09aa5c8882cacc761f506793fe5f5b329ae23d38482ae8bd046e45'),
  ('s2-exam-prep-oct-2026', 66, 'fefb1f9c1f2cfa5bc6de0e1166bb82d8a15e9c0bf98a88dcb5de4ca5d1feb837'),
  ('s2-exam-prep-oct-2026', 67, '8f962e2b8e9db4ea2b3e961fc4fb42b80843e936492a089c0cd97c6c10022712'),
  ('s2-exam-prep-oct-2026', 68, '0a7be080b0f989b345324150f193900a5edf2292e304ad2dd6c0b31a76b2e375'),
  ('s2-exam-prep-oct-2026', 69, 'ebb6ac05808817d1930cb851e0de9b4028094a42ac8952cf4472ed5848348917'),
  ('s2-exam-prep-oct-2026', 70, '7d22d390ec67d1aa03eca9ca45884b3c83a0595d0c152d93dea473052383444c'),
  ('s2-exam-prep-oct-2026', 71, 'fea5dd8170f453b7c7ca4cb5b51bef41a2a4997d4a61e8473a5f0df47c635f86'),
  ('s2-exam-prep-oct-2026', 72, 'bbc9ee12c4395a2771805fec1e11e85786501a07b2d2e34050cb9ba84d7dbc11'),
  ('s2-exam-prep-oct-2026', 73, '6afb642998f6a61bd3de37c12771432976849f7baa24a8dc4e16633e65f68501'),
  ('s2-exam-prep-oct-2026', 74, '4762a34b36ca0da2c6ee69e5e2656a81b7a3475994df84311395715c52d218aa'),
  ('s2-exam-prep-oct-2026', 75, '490ca3ed5811c020ba8372021ff5dc839a726dc73b392a2ed564b6683e2e844a'),
  ('s2-exam-prep-oct-2026', 76, '8fb7ac99f7e19ac2989df95e86454e9f292c210ed24a3501258de07752aade51'),
  ('s2-exam-prep-oct-2026', 77, '2b59cbd080973d9eb0397e8f531b323b5b9d2c39e12000ded77738e47a7f2e2a'),
  ('s2-exam-prep-oct-2026', 78, '0e7e50400d6aff0b0594729544c622a76dde2602a6311573aa4ee0ed9d7b4b31'),
  ('s2-exam-prep-oct-2026', 79, '46459f9bd8c39ba752f095a190cd30f8043f52ab0afe90850c50510c3ef9929d'),
  ('s2-exam-prep-oct-2026', 80, 'ff3dbd163436a7d74558c4a9620909ebc9c2811036e336cfead9255dc7e937c7'),
  ('s2-exam-prep-oct-2026', 81, '1c6b6b9e01275af3ac768463d2c751b5c0ee7324ba31723ba694ba4ad48eaf3f'),
  ('s2-exam-prep-oct-2026', 82, '7bd61a1b8ebdf789038195e7873e56aad614a1fcf5b2653ce8638ed43336c159'),
  ('s2-exam-prep-oct-2026', 83, 'cf08fccd9d8bfd57d4e6dd765d4cfc1ec6c2e3e9d5219c6229fa0828e9b1004d'),
  ('s2-exam-prep-oct-2026', 84, '2181b995ff12934c45f69f83120600d9826e0dda4b7dadce0360661bfe2cc4b7'),
  ('s2-exam-prep-oct-2026', 85, '6ee18b42fbf155df4d67fc4ad9ddc1f485c1295f28faf67f15868705a8405272'),
  ('s2-exam-prep-oct-2026', 86, '3cf083c28255868b5f464f8ed39b1db95aee54b99b8670a2dbb556a580e9d5da'),
  ('s2-exam-prep-oct-2026', 87, 'b54e2b152c2135f45dfca42c67ec11c8a8d6076f1796f3deaa64a752c1d4efa8'),
  ('s2-exam-prep-oct-2026', 88, 'b4a9f51fee942f7a99bd95c41ef7d4b81eebb47cb66633b2ed8ac17d239595ca'),
  ('s2-exam-prep-oct-2026', 89, 'a38bcf73d352e4c7ecd5e6480c34fafb1454d0d1ce77066af3ac6720ea250372'),
  ('s2-exam-prep-oct-2026', 90, 'd22b75e3a33a790e74baaf8042f72a69bffaabe36780f9ee1ed549e165a38f5e'),
  ('s2-exam-prep-oct-2026', 91, 'b79a954ce810761a0fb2e4e7156aba074912e476dbc04453e8eb0255174f2bf5'),
  ('s2-exam-prep-oct-2026', 92, '54aa7f35d4802240f3467b9d69bcfd3b03b68b4cf80de347a0c14d2650367b59'),
  ('s2-exam-prep-oct-2026', 93, '18cf9b4783ee739f6c6503d38de62b796c6c90be799b6329a73c03074e0fa677'),
  ('s2-exam-prep-oct-2026', 94, '8e55b8c71f58527e23f9b826fae59dd918c4d10f31b0e3a139a1d59bf906969b'),
  ('s2-exam-prep-oct-2026', 95, 'ebb6ac05808817d1930cb851e0de9b4028094a42ac8952cf4472ed5848348917'),
  ('s2-exam-prep-oct-2026', 96, 'daad3b4477b005f6ef1dafc232057949c48e1addb90aef9d4a511a49f7cea942'),
  ('s2-exam-prep-oct-2026', 97, 'fea5dd8170f453b7c7ca4cb5b51bef41a2a4997d4a61e8473a5f0df47c635f86'),
  ('s2-exam-prep-oct-2026', 98, 'b79a954ce810761a0fb2e4e7156aba074912e476dbc04453e8eb0255174f2bf5'),
  ('s2-exam-prep-oct-2026', 99, 'a38bcf73d352e4c7ecd5e6480c34fafb1454d0d1ce77066af3ac6720ea250372'),
  ('s2-exam-prep-oct-2026', 100, '1748ba31e26277da728a0256fb6f2743f9b1bcfebb90a9d8988ee936d30b0f0f'),
  ('s2-exam-prep-oct-2026', 101, '3c7ad783454617591512bb1c563047c82a138462bd0a4cb506e4f4a5c48951e4'),
  ('s2-exam-prep-oct-2026', 102, '497563b3d3a93e9d0e87d7bcbb0f2a5f1317c699a99ae8e6172a5faa66fa48f2'),
  ('s2-exam-prep-oct-2026', 103, 'b4a9f51fee942f7a99bd95c41ef7d4b81eebb47cb66633b2ed8ac17d239595ca'),
  ('s2-exam-prep-oct-2026', 104, 'ff3dbd163436a7d74558c4a9620909ebc9c2811036e336cfead9255dc7e937c7'),
  ('s2-exam-prep-oct-2026', 105, 'cf08fccd9d8bfd57d4e6dd765d4cfc1ec6c2e3e9d5219c6229fa0828e9b1004d'),
  ('s2-exam-prep-oct-2026', 106, '6ef946775e978754c68e6ce1f94072318d37ba0a362272139ebf04447c36145b'),
  ('s2-exam-prep-oct-2026', 107, '38a0eff5fb3861e8fb2ba60e4ce12eaf4288dd9ea4e1d6ca91b8b54f107250a6'),
  ('s2-exam-prep-oct-2026', 108, 'd22b75e3a33a790e74baaf8042f72a69bffaabe36780f9ee1ed549e165a38f5e'),
  ('s2-exam-prep-oct-2026', 109, '4762a34b36ca0da2c6ee69e5e2656a81b7a3475994df84311395715c52d218aa'),
  ('s2-exam-prep-oct-2026', 110, 'fefb1f9c1f2cfa5bc6de0e1166bb82d8a15e9c0bf98a88dcb5de4ca5d1feb837'),
  ('s2-exam-prep-oct-2026', 111, 'b54e2b152c2135f45dfca42c67ec11c8a8d6076f1796f3deaa64a752c1d4efa8'),
  ('s2-exam-prep-oct-2026', 112, '7d22d390ec67d1aa03eca9ca45884b3c83a0595d0c152d93dea473052383444c'),
  ('s2-exam-prep-oct-2026', 113, '7f0c68cb87de6c2a8536ca9887b3a1297061f9e1a5f66f6264de35e1086d027a'),
  ('s2-exam-prep-oct-2026', 114, '54aa7f35d4802240f3467b9d69bcfd3b03b68b4cf80de347a0c14d2650367b59'),
  ('s2-exam-prep-oct-2026', 115, 'd4e16994df9002e53294f899714d7137592fd13ba986fcd070214dc85d659968'),
  ('s2-exam-prep-oct-2026', 116, 'b9573e6bb24c4c2411affe6ff4b97e16e0e3c7e6f0d28a6033b21fd74aec07f3'),
  ('s2-exam-prep-oct-2026', 117, '2b59cbd080973d9eb0397e8f531b323b5b9d2c39e12000ded77738e47a7f2e2a'),
  ('s2-exam-prep-oct-2026', 118, '0e7e50400d6aff0b0594729544c622a76dde2602a6311573aa4ee0ed9d7b4b31'),
  ('s2-exam-prep-oct-2026', 119, '3cf083c28255868b5f464f8ed39b1db95aee54b99b8670a2dbb556a580e9d5da'),
  ('s2-exam-prep-oct-2026', 120, '490ca3ed5811c020ba8372021ff5dc839a726dc73b392a2ed564b6683e2e844a'),
  ('s2-exam-prep-oct-2026', 121, '6255e14abc09aa5c8882cacc761f506793fe5f5b329ae23d38482ae8bd046e45'),
  ('s2-exam-prep-oct-2026', 122, '8f962e2b8e9db4ea2b3e961fc4fb42b80843e936492a089c0cd97c6c10022712'),
  ('s2-exam-prep-oct-2026', 123, '0a7be080b0f989b345324150f193900a5edf2292e304ad2dd6c0b31a76b2e375'),
  ('s2-exam-prep-oct-2026', 124, '46459f9bd8c39ba752f095a190cd30f8043f52ab0afe90850c50510c3ef9929d'),
  ('s2-exam-prep-oct-2026', 125, '6ee18b42fbf155df4d67fc4ad9ddc1f485c1295f28faf67f15868705a8405272'),
  ('s2-exam-prep-oct-2026', 126, '8a61e4090fce75bfbd76b94eec784cb366a579ba01fe5cb1d4950510a1f7ff9d'),
  ('s2-exam-prep-oct-2026', 127, '56c7c1948b8505e4ef99939989882ca2a07c77320b5529dd19c6418bb92d4c87'),
  ('s2-exam-prep-oct-2026', 128, '90598d5fc621812ec2272f9eeb720f627a254c8ddca9a33ddc474481e46e115d'),
  ('s2-exam-prep-oct-2026', 129, '1bdc4666f8dd9752e0cf56ee1503229653d01bfb4fdc2d9d4cd58a6a987d0fbd'),
  ('s2-exam-prep-oct-2026', 130, '094f8633fefe0d72adc9bf286ea1cf27319d383c531ac0933aeee1e999b25544'),
  ('s2-exam-prep-oct-2026', 131, '8e55b8c71f58527e23f9b826fae59dd918c4d10f31b0e3a139a1d59bf906969b'),
  ('s2-exam-prep-oct-2026', 132, '7bd61a1b8ebdf789038195e7873e56aad614a1fcf5b2653ce8638ed43336c159'),
  ('s2-exam-prep-oct-2026', 133, '726f6ee1e259e8007535c937d5dc92ae5ab32aefbbebbbbbfa7028da3c76cf46'),
  ('s2-exam-prep-oct-2026', 134, '8fb7ac99f7e19ac2989df95e86454e9f292c210ed24a3501258de07752aade51'),
  ('s2-exam-prep-oct-2026', 135, 'bbc9ee12c4395a2771805fec1e11e85786501a07b2d2e34050cb9ba84d7dbc11'),
  ('s2-exam-prep-oct-2026', 136, '1c6b6b9e01275af3ac768463d2c751b5c0ee7324ba31723ba694ba4ad48eaf3f'),
  ('s2-exam-prep-oct-2026', 137, 'f796e2f28ae5811737ccb8233f34e09f8bb75d2511a135543d1ca37be0199a1d'),
  ('s2-exam-prep-oct-2026', 138, '2181b995ff12934c45f69f83120600d9826e0dda4b7dadce0360661bfe2cc4b7'),
  ('s2-exam-prep-oct-2026', 139, 'f9d0a9ff95c3e11b4e50c11e32177e9e947217c77103ce6b81510203f4184a95'),
  ('s2-exam-prep-oct-2026', 140, '6afb642998f6a61bd3de37c12771432976849f7baa24a8dc4e16633e65f68501'),
  ('s2-exam-prep-oct-2026', 141, '18cf9b4783ee739f6c6503d38de62b796c6c90be799b6329a73c03074e0fa677'),
  ('s2-exam-prep-oct-2026', 142, 'b9573e6bb24c4c2411affe6ff4b97e16e0e3c7e6f0d28a6033b21fd74aec07f3'),
  ('s2-exam-prep-oct-2026', 143, '6255e14abc09aa5c8882cacc761f506793fe5f5b329ae23d38482ae8bd046e45'),
  ('s2-exam-prep-oct-2026', 144, '2b59cbd080973d9eb0397e8f531b323b5b9d2c39e12000ded77738e47a7f2e2a'),
  ('s2-exam-prep-oct-2026', 145, '90598d5fc621812ec2272f9eeb720f627a254c8ddca9a33ddc474481e46e115d'),
  ('s2-exam-prep-oct-2026', 146, '3c7ad783454617591512bb1c563047c82a138462bd0a4cb506e4f4a5c48951e4'),
  ('s2-exam-prep-oct-2026', 147, '46459f9bd8c39ba752f095a190cd30f8043f52ab0afe90850c50510c3ef9929d'),
  ('s2-exam-prep-oct-2026', 148, '3cf083c28255868b5f464f8ed39b1db95aee54b99b8670a2dbb556a580e9d5da'),
  ('s2-exam-prep-oct-2026', 149, '56c7c1948b8505e4ef99939989882ca2a07c77320b5529dd19c6418bb92d4c87'),
  ('s2-exam-prep-oct-2026', 150, '7f0c68cb87de6c2a8536ca9887b3a1297061f9e1a5f66f6264de35e1086d027a'),
  ('s2-exam-prep-oct-2026', 151, '8e55b8c71f58527e23f9b826fae59dd918c4d10f31b0e3a139a1d59bf906969b'),
  ('s2-exam-prep-oct-2026', 152, 'fefb1f9c1f2cfa5bc6de0e1166bb82d8a15e9c0bf98a88dcb5de4ca5d1feb837'),
  ('s2-exam-prep-oct-2026', 153, '6ef946775e978754c68e6ce1f94072318d37ba0a362272139ebf04447c36145b'),
  ('s2-exam-prep-oct-2026', 154, '7d22d390ec67d1aa03eca9ca45884b3c83a0595d0c152d93dea473052383444c'),
  ('s2-exam-prep-oct-2026', 155, '490ca3ed5811c020ba8372021ff5dc839a726dc73b392a2ed564b6683e2e844a'),
  ('s2-exam-prep-oct-2026', 156, '0e7e50400d6aff0b0594729544c622a76dde2602a6311573aa4ee0ed9d7b4b31'),
  ('s2-exam-prep-oct-2026', 157, '4762a34b36ca0da2c6ee69e5e2656a81b7a3475994df84311395715c52d218aa'),
  ('s2-exam-prep-oct-2026', 158, '094f8633fefe0d72adc9bf286ea1cf27319d383c531ac0933aeee1e999b25544'),
  ('s2-exam-prep-oct-2026', 159, 'daad3b4477b005f6ef1dafc232057949c48e1addb90aef9d4a511a49f7cea942'),
  ('s2-exam-prep-oct-2026', 160, '54aa7f35d4802240f3467b9d69bcfd3b03b68b4cf80de347a0c14d2650367b59'),
  ('s2-exam-prep-oct-2026', 161, 'b79a954ce810761a0fb2e4e7156aba074912e476dbc04453e8eb0255174f2bf5'),
  ('s2-exam-prep-oct-2026', 162, '1bdc4666f8dd9752e0cf56ee1503229653d01bfb4fdc2d9d4cd58a6a987d0fbd'),
  ('s2-exam-prep-oct-2026', 163, '6ee18b42fbf155df4d67fc4ad9ddc1f485c1295f28faf67f15868705a8405272'),
  ('s2-exam-prep-oct-2026', 164, 'f9d0a9ff95c3e11b4e50c11e32177e9e947217c77103ce6b81510203f4184a95'),
  ('s2-exam-prep-oct-2026', 165, '8a61e4090fce75bfbd76b94eec784cb366a579ba01fe5cb1d4950510a1f7ff9d'),
  ('s2-exam-prep-oct-2026', 166, 'b54e2b152c2135f45dfca42c67ec11c8a8d6076f1796f3deaa64a752c1d4efa8'),
  ('s2-exam-prep-oct-2026', 167, 'fea5dd8170f453b7c7ca4cb5b51bef41a2a4997d4a61e8473a5f0df47c635f86'),
  ('s2-exam-prep-oct-2026', 168, '1c6b6b9e01275af3ac768463d2c751b5c0ee7324ba31723ba694ba4ad48eaf3f'),
  ('s2-exam-prep-oct-2026', 169, '1748ba31e26277da728a0256fb6f2743f9b1bcfebb90a9d8988ee936d30b0f0f'),
  ('s2-exam-prep-oct-2026', 170, '7bd61a1b8ebdf789038195e7873e56aad614a1fcf5b2653ce8638ed43336c159'),
  ('s2-exam-prep-oct-2026', 171, '38a0eff5fb3861e8fb2ba60e4ce12eaf4288dd9ea4e1d6ca91b8b54f107250a6'),
  ('s2-exam-prep-oct-2026', 172, '8f962e2b8e9db4ea2b3e961fc4fb42b80843e936492a089c0cd97c6c10022712'),
  ('s2-exam-prep-oct-2026', 173, 'ebb6ac05808817d1930cb851e0de9b4028094a42ac8952cf4472ed5848348917'),
  ('s2-exam-prep-oct-2026', 174, 'd22b75e3a33a790e74baaf8042f72a69bffaabe36780f9ee1ed549e165a38f5e'),
  ('s2-exam-prep-oct-2026', 175, 'f796e2f28ae5811737ccb8233f34e09f8bb75d2511a135543d1ca37be0199a1d'),
  ('s2-exam-prep-oct-2026', 176, '8fb7ac99f7e19ac2989df95e86454e9f292c210ed24a3501258de07752aade51'),
  ('s2-exam-prep-oct-2026', 177, '18cf9b4783ee739f6c6503d38de62b796c6c90be799b6329a73c03074e0fa677'),
  ('s2-exam-prep-oct-2026', 178, '2181b995ff12934c45f69f83120600d9826e0dda4b7dadce0360661bfe2cc4b7'),
  ('s2-exam-prep-oct-2026', 179, 'bbc9ee12c4395a2771805fec1e11e85786501a07b2d2e34050cb9ba84d7dbc11'),
  ('s2-exam-prep-oct-2026', 180, '497563b3d3a93e9d0e87d7bcbb0f2a5f1317c699a99ae8e6172a5faa66fa48f2'),
  ('s2-exam-prep-oct-2026', 181, 'ff3dbd163436a7d74558c4a9620909ebc9c2811036e336cfead9255dc7e937c7'),
  ('s2-exam-prep-oct-2026', 182, '726f6ee1e259e8007535c937d5dc92ae5ab32aefbbebbbbbfa7028da3c76cf46'),
  ('s2-exam-prep-oct-2026', 183, '0a7be080b0f989b345324150f193900a5edf2292e304ad2dd6c0b31a76b2e375'),
  ('s2-exam-prep-oct-2026', 184, 'a38bcf73d352e4c7ecd5e6480c34fafb1454d0d1ce77066af3ac6720ea250372'),
  ('s2-exam-prep-oct-2026', 185, 'b4a9f51fee942f7a99bd95c41ef7d4b81eebb47cb66633b2ed8ac17d239595ca'),
  ('s2-exam-prep-oct-2026', 186, 'cf08fccd9d8bfd57d4e6dd765d4cfc1ec6c2e3e9d5219c6229fa0828e9b1004d'),
  ('s2-exam-prep-oct-2026', 187, '6afb642998f6a61bd3de37c12771432976849f7baa24a8dc4e16633e65f68501'),
  ('s2-exam-prep-oct-2026', 188, 'd4e16994df9002e53294f899714d7137592fd13ba986fcd070214dc85d659968'),
  ('s2-exam-prep-oct-2026', 189, 'f9d0a9ff95c3e11b4e50c11e32177e9e947217c77103ce6b81510203f4184a95'),
  ('s2-exam-prep-oct-2026', 190, 'fefb1f9c1f2cfa5bc6de0e1166bb82d8a15e9c0bf98a88dcb5de4ca5d1feb837'),
  ('s2-exam-prep-oct-2026', 191, '6ee18b42fbf155df4d67fc4ad9ddc1f485c1295f28faf67f15868705a8405272'),
  ('s2-exam-prep-oct-2026', 192, '18cf9b4783ee739f6c6503d38de62b796c6c90be799b6329a73c03074e0fa677'),
  ('s2-exam-prep-oct-2026', 193, '2b59cbd080973d9eb0397e8f531b323b5b9d2c39e12000ded77738e47a7f2e2a'),
  ('s2-exam-prep-oct-2026', 194, '54aa7f35d4802240f3467b9d69bcfd3b03b68b4cf80de347a0c14d2650367b59'),
  ('s2-exam-prep-oct-2026', 195, '490ca3ed5811c020ba8372021ff5dc839a726dc73b392a2ed564b6683e2e844a'),
  ('s2-exam-prep-oct-2026', 196, 'fea5dd8170f453b7c7ca4cb5b51bef41a2a4997d4a61e8473a5f0df47c635f86'),
  ('s2-exam-prep-oct-2026', 197, 'b4a9f51fee942f7a99bd95c41ef7d4b81eebb47cb66633b2ed8ac17d239595ca'),
  ('s2-exam-prep-oct-2026', 198, '497563b3d3a93e9d0e87d7bcbb0f2a5f1317c699a99ae8e6172a5faa66fa48f2'),
  ('s2-exam-prep-oct-2026', 199, '2181b995ff12934c45f69f83120600d9826e0dda4b7dadce0360661bfe2cc4b7'),
  ('s2-exam-prep-oct-2026', 200, '7bd61a1b8ebdf789038195e7873e56aad614a1fcf5b2653ce8638ed43336c159'),
  ('s2-exam-prep-oct-2026', 201, 'd4e16994df9002e53294f899714d7137592fd13ba986fcd070214dc85d659968'),
  ('s2-exam-prep-oct-2026', 202, '3c7ad783454617591512bb1c563047c82a138462bd0a4cb506e4f4a5c48951e4'),
  ('s2-exam-prep-oct-2026', 203, '6afb642998f6a61bd3de37c12771432976849f7baa24a8dc4e16633e65f68501'),
  ('s2-exam-prep-oct-2026', 204, '1bdc4666f8dd9752e0cf56ee1503229653d01bfb4fdc2d9d4cd58a6a987d0fbd'),
  ('s2-exam-prep-oct-2026', 205, '7f0c68cb87de6c2a8536ca9887b3a1297061f9e1a5f66f6264de35e1086d027a'),
  ('s2-exam-prep-oct-2026', 206, '1748ba31e26277da728a0256fb6f2743f9b1bcfebb90a9d8988ee936d30b0f0f'),
  ('s2-exam-prep-oct-2026', 207, '56c7c1948b8505e4ef99939989882ca2a07c77320b5529dd19c6418bb92d4c87'),
  ('s2-exam-prep-oct-2026', 208, '094f8633fefe0d72adc9bf286ea1cf27319d383c531ac0933aeee1e999b25544'),
  ('s2-exam-prep-oct-2026', 209, 'd22b75e3a33a790e74baaf8042f72a69bffaabe36780f9ee1ed549e165a38f5e'),
  ('s2-exam-prep-oct-2026', 210, 'cf08fccd9d8bfd57d4e6dd765d4cfc1ec6c2e3e9d5219c6229fa0828e9b1004d'),
  ('s2-exam-prep-oct-2026', 211, '6ef946775e978754c68e6ce1f94072318d37ba0a362272139ebf04447c36145b'),
  ('s2-exam-prep-oct-2026', 212, '38a0eff5fb3861e8fb2ba60e4ce12eaf4288dd9ea4e1d6ca91b8b54f107250a6'),
  ('s2-exam-prep-oct-2026', 213, '8a61e4090fce75bfbd76b94eec784cb366a579ba01fe5cb1d4950510a1f7ff9d'),
  ('s2-exam-prep-oct-2026', 214, '3cf083c28255868b5f464f8ed39b1db95aee54b99b8670a2dbb556a580e9d5da'),
  ('s2-exam-prep-oct-2026', 215, 'a38bcf73d352e4c7ecd5e6480c34fafb1454d0d1ce77066af3ac6720ea250372'),
  ('s2-exam-prep-oct-2026', 216, '7d22d390ec67d1aa03eca9ca45884b3c83a0595d0c152d93dea473052383444c'),
  ('s2-exam-prep-oct-2026', 217, '8e55b8c71f58527e23f9b826fae59dd918c4d10f31b0e3a139a1d59bf906969b'),
  ('s2-exam-prep-oct-2026', 218, 'ff3dbd163436a7d74558c4a9620909ebc9c2811036e336cfead9255dc7e937c7'),
  ('s2-exam-prep-oct-2026', 219, '0e7e50400d6aff0b0594729544c622a76dde2602a6311573aa4ee0ed9d7b4b31'),
  ('s2-exam-prep-oct-2026', 220, 'b79a954ce810761a0fb2e4e7156aba074912e476dbc04453e8eb0255174f2bf5'),
  ('s2-exam-prep-oct-2026', 221, '8f962e2b8e9db4ea2b3e961fc4fb42b80843e936492a089c0cd97c6c10022712'),
  ('s2-exam-prep-oct-2026', 222, '46459f9bd8c39ba752f095a190cd30f8043f52ab0afe90850c50510c3ef9929d'),
  ('s2-exam-prep-oct-2026', 223, '8fb7ac99f7e19ac2989df95e86454e9f292c210ed24a3501258de07752aade51'),
  ('s2-exam-prep-oct-2026', 224, '4762a34b36ca0da2c6ee69e5e2656a81b7a3475994df84311395715c52d218aa'),
  ('s2-exam-prep-oct-2026', 225, 'f796e2f28ae5811737ccb8233f34e09f8bb75d2511a135543d1ca37be0199a1d'),
  ('s2-exam-prep-oct-2026', 226, 'b54e2b152c2135f45dfca42c67ec11c8a8d6076f1796f3deaa64a752c1d4efa8'),
  ('s2-exam-prep-oct-2026', 227, 'b9573e6bb24c4c2411affe6ff4b97e16e0e3c7e6f0d28a6033b21fd74aec07f3'),
  ('s2-exam-prep-oct-2026', 228, '726f6ee1e259e8007535c937d5dc92ae5ab32aefbbebbbbbfa7028da3c76cf46'),
  ('s2-exam-prep-oct-2026', 229, 'daad3b4477b005f6ef1dafc232057949c48e1addb90aef9d4a511a49f7cea942'),
  ('s2-exam-prep-oct-2026', 230, 'ebb6ac05808817d1930cb851e0de9b4028094a42ac8952cf4472ed5848348917'),
  ('s2-exam-prep-oct-2026', 231, 'bbc9ee12c4395a2771805fec1e11e85786501a07b2d2e34050cb9ba84d7dbc11'),
  ('s2-exam-prep-oct-2026', 232, '6255e14abc09aa5c8882cacc761f506793fe5f5b329ae23d38482ae8bd046e45'),
  ('s2-exam-prep-oct-2026', 233, '0a7be080b0f989b345324150f193900a5edf2292e304ad2dd6c0b31a76b2e375'),
  ('s2-exam-prep-oct-2026', 234, '1c6b6b9e01275af3ac768463d2c751b5c0ee7324ba31723ba694ba4ad48eaf3f'),
  ('s2-exam-prep-oct-2026', 235, '90598d5fc621812ec2272f9eeb720f627a254c8ddca9a33ddc474481e46e115d'),
  ('s2-exam-prep-oct-2026', 236, '0a7be080b0f989b345324150f193900a5edf2292e304ad2dd6c0b31a76b2e375'),
  ('s2-exam-prep-oct-2026', 237, '56c7c1948b8505e4ef99939989882ca2a07c77320b5529dd19c6418bb92d4c87'),
  ('s2-exam-prep-oct-2026', 238, 'f796e2f28ae5811737ccb8233f34e09f8bb75d2511a135543d1ca37be0199a1d'),
  ('s2-exam-prep-oct-2026', 239, 'a38bcf73d352e4c7ecd5e6480c34fafb1454d0d1ce77066af3ac6720ea250372'),
  ('s2-exam-prep-oct-2026', 240, '6255e14abc09aa5c8882cacc761f506793fe5f5b329ae23d38482ae8bd046e45'),
  ('s2-exam-prep-oct-2026', 241, 'f9d0a9ff95c3e11b4e50c11e32177e9e947217c77103ce6b81510203f4184a95'),
  ('s2-exam-prep-oct-2026', 242, '7d22d390ec67d1aa03eca9ca45884b3c83a0595d0c152d93dea473052383444c'),
  ('s2-exam-prep-oct-2026', 243, '8f962e2b8e9db4ea2b3e961fc4fb42b80843e936492a089c0cd97c6c10022712'),
  ('s2-exam-prep-oct-2026', 244, 'ff3dbd163436a7d74558c4a9620909ebc9c2811036e336cfead9255dc7e937c7'),
  ('s2-exam-prep-oct-2026', 245, '46459f9bd8c39ba752f095a190cd30f8043f52ab0afe90850c50510c3ef9929d'),
  ('s2-exam-prep-oct-2026', 246, '1748ba31e26277da728a0256fb6f2743f9b1bcfebb90a9d8988ee936d30b0f0f'),
  ('s2-exam-prep-oct-2026', 247, '38a0eff5fb3861e8fb2ba60e4ce12eaf4288dd9ea4e1d6ca91b8b54f107250a6'),
  ('s2-exam-prep-oct-2026', 248, '0e7e50400d6aff0b0594729544c622a76dde2602a6311573aa4ee0ed9d7b4b31'),
  ('s2-exam-prep-oct-2026', 249, '8fb7ac99f7e19ac2989df95e86454e9f292c210ed24a3501258de07752aade51'),
  ('s2-exam-prep-oct-2026', 250, '1c6b6b9e01275af3ac768463d2c751b5c0ee7324ba31723ba694ba4ad48eaf3f'),
  ('s2-exam-prep-oct-2026', 251, 'b9573e6bb24c4c2411affe6ff4b97e16e0e3c7e6f0d28a6033b21fd74aec07f3'),
  ('s2-exam-prep-oct-2026', 252, 'd22b75e3a33a790e74baaf8042f72a69bffaabe36780f9ee1ed549e165a38f5e'),
  ('s2-exam-prep-oct-2026', 253, '3cf083c28255868b5f464f8ed39b1db95aee54b99b8670a2dbb556a580e9d5da'),
  ('s2-exam-prep-oct-2026', 254, 'ebb6ac05808817d1930cb851e0de9b4028094a42ac8952cf4472ed5848348917'),
  ('s2-exam-prep-oct-2026', 255, 'bbc9ee12c4395a2771805fec1e11e85786501a07b2d2e34050cb9ba84d7dbc11'),
  ('s2-exam-prep-oct-2026', 256, 'fefb1f9c1f2cfa5bc6de0e1166bb82d8a15e9c0bf98a88dcb5de4ca5d1feb837'),
  ('s2-exam-prep-oct-2026', 257, '6ef946775e978754c68e6ce1f94072318d37ba0a362272139ebf04447c36145b'),
  ('s2-exam-prep-oct-2026', 258, '7bd61a1b8ebdf789038195e7873e56aad614a1fcf5b2653ce8638ed43336c159'),
  ('s2-exam-prep-oct-2026', 259, '2181b995ff12934c45f69f83120600d9826e0dda4b7dadce0360661bfe2cc4b7'),
  ('s2-exam-prep-oct-2026', 260, '7f0c68cb87de6c2a8536ca9887b3a1297061f9e1a5f66f6264de35e1086d027a'),
  ('s2-exam-prep-oct-2026', 261, 'b79a954ce810761a0fb2e4e7156aba074912e476dbc04453e8eb0255174f2bf5'),
  ('s2-exam-prep-oct-2026', 262, '4762a34b36ca0da2c6ee69e5e2656a81b7a3475994df84311395715c52d218aa'),
  ('s2-exam-prep-oct-2026', 263, '490ca3ed5811c020ba8372021ff5dc839a726dc73b392a2ed564b6683e2e844a'),
  ('s2-exam-prep-oct-2026', 264, '90598d5fc621812ec2272f9eeb720f627a254c8ddca9a33ddc474481e46e115d'),
  ('s2-exam-prep-oct-2026', 265, '6ee18b42fbf155df4d67fc4ad9ddc1f485c1295f28faf67f15868705a8405272'),
  ('s2-exam-prep-oct-2026', 266, '497563b3d3a93e9d0e87d7bcbb0f2a5f1317c699a99ae8e6172a5faa66fa48f2'),
  ('s2-exam-prep-oct-2026', 267, '094f8633fefe0d72adc9bf286ea1cf27319d383c531ac0933aeee1e999b25544'),
  ('s2-exam-prep-oct-2026', 268, 'b54e2b152c2135f45dfca42c67ec11c8a8d6076f1796f3deaa64a752c1d4efa8'),
  ('s2-exam-prep-oct-2026', 269, '18cf9b4783ee739f6c6503d38de62b796c6c90be799b6329a73c03074e0fa677'),
  ('s2-exam-prep-oct-2026', 270, 'd4e16994df9002e53294f899714d7137592fd13ba986fcd070214dc85d659968'),
  ('s2-exam-prep-oct-2026', 271, '8e55b8c71f58527e23f9b826fae59dd918c4d10f31b0e3a139a1d59bf906969b'),
  ('s2-exam-prep-oct-2026', 272, 'daad3b4477b005f6ef1dafc232057949c48e1addb90aef9d4a511a49f7cea942'),
  ('s2-exam-prep-oct-2026', 273, '8a61e4090fce75bfbd76b94eec784cb366a579ba01fe5cb1d4950510a1f7ff9d'),
  ('s2-exam-prep-oct-2026', 274, '726f6ee1e259e8007535c937d5dc92ae5ab32aefbbebbbbbfa7028da3c76cf46'),
  ('s2-exam-prep-oct-2026', 275, '6afb642998f6a61bd3de37c12771432976849f7baa24a8dc4e16633e65f68501'),
  ('s2-exam-prep-oct-2026', 276, '1bdc4666f8dd9752e0cf56ee1503229653d01bfb4fdc2d9d4cd58a6a987d0fbd'),
  ('s2-exam-prep-oct-2026', 277, 'b4a9f51fee942f7a99bd95c41ef7d4b81eebb47cb66633b2ed8ac17d239595ca'),
  ('s2-exam-prep-oct-2026', 278, '3c7ad783454617591512bb1c563047c82a138462bd0a4cb506e4f4a5c48951e4'),
  ('s2-exam-prep-oct-2026', 279, 'cf08fccd9d8bfd57d4e6dd765d4cfc1ec6c2e3e9d5219c6229fa0828e9b1004d'),
  ('s2-exam-prep-oct-2026', 280, 'fea5dd8170f453b7c7ca4cb5b51bef41a2a4997d4a61e8473a5f0df47c635f86'),
  ('s2-exam-prep-oct-2026', 281, '2b59cbd080973d9eb0397e8f531b323b5b9d2c39e12000ded77738e47a7f2e2a'),
  ('s2-exam-prep-oct-2026', 282, '54aa7f35d4802240f3467b9d69bcfd3b03b68b4cf80de347a0c14d2650367b59'),
  ('s2-exam-prep-oct-2026', 283, '0a7be080b0f989b345324150f193900a5edf2292e304ad2dd6c0b31a76b2e375'),
  ('s2-exam-prep-oct-2026', 284, '3cf083c28255868b5f464f8ed39b1db95aee54b99b8670a2dbb556a580e9d5da'),
  ('s2-exam-prep-oct-2026', 285, '18cf9b4783ee739f6c6503d38de62b796c6c90be799b6329a73c03074e0fa677'),
  ('s2-exam-prep-oct-2026', 286, 'ff3dbd163436a7d74558c4a9620909ebc9c2811036e336cfead9255dc7e937c7'),
  ('s2-exam-prep-oct-2026', 287, '497563b3d3a93e9d0e87d7bcbb0f2a5f1317c699a99ae8e6172a5faa66fa48f2'),
  ('s2-exam-prep-oct-2026', 288, '4762a34b36ca0da2c6ee69e5e2656a81b7a3475994df84311395715c52d218aa'),
  ('s2-exam-prep-oct-2026', 289, 'b9573e6bb24c4c2411affe6ff4b97e16e0e3c7e6f0d28a6033b21fd74aec07f3'),
  ('s2-exam-prep-oct-2026', 290, '6afb642998f6a61bd3de37c12771432976849f7baa24a8dc4e16633e65f68501'),
  ('s2-exam-prep-oct-2026', 291, '6ef946775e978754c68e6ce1f94072318d37ba0a362272139ebf04447c36145b'),
  ('s2-exam-prep-oct-2026', 292, '490ca3ed5811c020ba8372021ff5dc839a726dc73b392a2ed564b6683e2e844a'),
  ('s2-exam-prep-oct-2026', 293, 'fefb1f9c1f2cfa5bc6de0e1166bb82d8a15e9c0bf98a88dcb5de4ca5d1feb837'),
  ('s2-exam-prep-oct-2026', 294, '1748ba31e26277da728a0256fb6f2743f9b1bcfebb90a9d8988ee936d30b0f0f'),
  ('s2-exam-prep-oct-2026', 295, 'ebb6ac05808817d1930cb851e0de9b4028094a42ac8952cf4472ed5848348917'),
  ('s2-exam-prep-oct-2026', 296, 'bbc9ee12c4395a2771805fec1e11e85786501a07b2d2e34050cb9ba84d7dbc11'),
  ('s2-exam-prep-oct-2026', 297, '90598d5fc621812ec2272f9eeb720f627a254c8ddca9a33ddc474481e46e115d'),
  ('s2-exam-prep-oct-2026', 298, 'd4e16994df9002e53294f899714d7137592fd13ba986fcd070214dc85d659968'),
  ('s2-exam-prep-oct-2026', 299, 'f796e2f28ae5811737ccb8233f34e09f8bb75d2511a135543d1ca37be0199a1d'),
  ('s2-exam-prep-oct-2026', 300, '8fb7ac99f7e19ac2989df95e86454e9f292c210ed24a3501258de07752aade51'),
  ('s2-exam-prep-oct-2026', 301, '7d22d390ec67d1aa03eca9ca45884b3c83a0595d0c152d93dea473052383444c'),
  ('s2-exam-prep-oct-2026', 302, 'a38bcf73d352e4c7ecd5e6480c34fafb1454d0d1ce77066af3ac6720ea250372'),
  ('s2-exam-prep-oct-2026', 303, '7bd61a1b8ebdf789038195e7873e56aad614a1fcf5b2653ce8638ed43336c159'),
  ('s2-exam-prep-oct-2026', 304, 'cf08fccd9d8bfd57d4e6dd765d4cfc1ec6c2e3e9d5219c6229fa0828e9b1004d'),
  ('s2-exam-prep-oct-2026', 305, '2181b995ff12934c45f69f83120600d9826e0dda4b7dadce0360661bfe2cc4b7'),
  ('s2-exam-prep-oct-2026', 306, 'b4a9f51fee942f7a99bd95c41ef7d4b81eebb47cb66633b2ed8ac17d239595ca'),
  ('s2-exam-prep-oct-2026', 307, '38a0eff5fb3861e8fb2ba60e4ce12eaf4288dd9ea4e1d6ca91b8b54f107250a6'),
  ('s2-exam-prep-oct-2026', 308, '8a61e4090fce75bfbd76b94eec784cb366a579ba01fe5cb1d4950510a1f7ff9d'),
  ('s2-exam-prep-oct-2026', 309, '1c6b6b9e01275af3ac768463d2c751b5c0ee7324ba31723ba694ba4ad48eaf3f'),
  ('s2-exam-prep-oct-2026', 310, '54aa7f35d4802240f3467b9d69bcfd3b03b68b4cf80de347a0c14d2650367b59'),
  ('s2-exam-prep-oct-2026', 311, '094f8633fefe0d72adc9bf286ea1cf27319d383c531ac0933aeee1e999b25544'),
  ('s2-exam-prep-oct-2026', 312, '1bdc4666f8dd9752e0cf56ee1503229653d01bfb4fdc2d9d4cd58a6a987d0fbd'),
  ('s2-exam-prep-oct-2026', 313, '8e55b8c71f58527e23f9b826fae59dd918c4d10f31b0e3a139a1d59bf906969b'),
  ('s2-exam-prep-oct-2026', 314, 'daad3b4477b005f6ef1dafc232057949c48e1addb90aef9d4a511a49f7cea942'),
  ('s2-exam-prep-oct-2026', 315, 'd22b75e3a33a790e74baaf8042f72a69bffaabe36780f9ee1ed549e165a38f5e'),
  ('s2-exam-prep-oct-2026', 316, '3c7ad783454617591512bb1c563047c82a138462bd0a4cb506e4f4a5c48951e4'),
  ('s2-exam-prep-oct-2026', 317, '6255e14abc09aa5c8882cacc761f506793fe5f5b329ae23d38482ae8bd046e45'),
  ('s2-exam-prep-oct-2026', 318, 'b79a954ce810761a0fb2e4e7156aba074912e476dbc04453e8eb0255174f2bf5'),
  ('s2-exam-prep-oct-2026', 319, '56c7c1948b8505e4ef99939989882ca2a07c77320b5529dd19c6418bb92d4c87'),
  ('s2-exam-prep-oct-2026', 320, '0e7e50400d6aff0b0594729544c622a76dde2602a6311573aa4ee0ed9d7b4b31'),
  ('s2-exam-prep-oct-2026', 321, 'fea5dd8170f453b7c7ca4cb5b51bef41a2a4997d4a61e8473a5f0df47c635f86'),
  ('s2-exam-prep-oct-2026', 322, '2b59cbd080973d9eb0397e8f531b323b5b9d2c39e12000ded77738e47a7f2e2a'),
  ('s2-exam-prep-oct-2026', 323, '7f0c68cb87de6c2a8536ca9887b3a1297061f9e1a5f66f6264de35e1086d027a'),
  ('s2-exam-prep-oct-2026', 324, 'f9d0a9ff95c3e11b4e50c11e32177e9e947217c77103ce6b81510203f4184a95'),
  ('s2-exam-prep-oct-2026', 325, '726f6ee1e259e8007535c937d5dc92ae5ab32aefbbebbbbbfa7028da3c76cf46'),
  ('s2-exam-prep-oct-2026', 326, 'b54e2b152c2135f45dfca42c67ec11c8a8d6076f1796f3deaa64a752c1d4efa8'),
  ('s2-exam-prep-oct-2026', 327, '8f962e2b8e9db4ea2b3e961fc4fb42b80843e936492a089c0cd97c6c10022712'),
  ('s2-exam-prep-oct-2026', 328, '6ee18b42fbf155df4d67fc4ad9ddc1f485c1295f28faf67f15868705a8405272'),
  ('s2-exam-prep-oct-2026', 329, '46459f9bd8c39ba752f095a190cd30f8043f52ab0afe90850c50510c3ef9929d'),
  ('s2-exam-prep-oct-2026', 330, '6ef946775e978754c68e6ce1f94072318d37ba0a362272139ebf04447c36145b'),
  ('s2-exam-prep-oct-2026', 331, '6ee18b42fbf155df4d67fc4ad9ddc1f485c1295f28faf67f15868705a8405272'),
  ('s2-exam-prep-oct-2026', 332, '7d22d390ec67d1aa03eca9ca45884b3c83a0595d0c152d93dea473052383444c'),
  ('s2-exam-prep-oct-2026', 333, '4762a34b36ca0da2c6ee69e5e2656a81b7a3475994df84311395715c52d218aa'),
  ('s2-exam-prep-oct-2026', 334, '54aa7f35d4802240f3467b9d69bcfd3b03b68b4cf80de347a0c14d2650367b59'),
  ('s2-exam-prep-oct-2026', 335, '2b59cbd080973d9eb0397e8f531b323b5b9d2c39e12000ded77738e47a7f2e2a'),
  ('s2-exam-prep-oct-2026', 336, 'fea5dd8170f453b7c7ca4cb5b51bef41a2a4997d4a61e8473a5f0df47c635f86'),
  ('s2-exam-prep-oct-2026', 337, '490ca3ed5811c020ba8372021ff5dc839a726dc73b392a2ed564b6683e2e844a'),
  ('s2-exam-prep-oct-2026', 338, 'daad3b4477b005f6ef1dafc232057949c48e1addb90aef9d4a511a49f7cea942'),
  ('s2-exam-prep-oct-2026', 339, 'b79a954ce810761a0fb2e4e7156aba074912e476dbc04453e8eb0255174f2bf5'),
  ('s2-exam-prep-oct-2026', 340, 'cf08fccd9d8bfd57d4e6dd765d4cfc1ec6c2e3e9d5219c6229fa0828e9b1004d'),
  ('s2-exam-prep-oct-2026', 341, '7bd61a1b8ebdf789038195e7873e56aad614a1fcf5b2653ce8638ed43336c159'),
  ('s2-exam-prep-oct-2026', 342, '8e55b8c71f58527e23f9b826fae59dd918c4d10f31b0e3a139a1d59bf906969b'),
  ('s2-exam-prep-oct-2026', 343, '56c7c1948b8505e4ef99939989882ca2a07c77320b5529dd19c6418bb92d4c87'),
  ('s2-exam-prep-oct-2026', 344, 'b9573e6bb24c4c2411affe6ff4b97e16e0e3c7e6f0d28a6033b21fd74aec07f3'),
  ('s2-exam-prep-oct-2026', 345, '3cf083c28255868b5f464f8ed39b1db95aee54b99b8670a2dbb556a580e9d5da'),
  ('s2-exam-prep-oct-2026', 346, '0a7be080b0f989b345324150f193900a5edf2292e304ad2dd6c0b31a76b2e375'),
  ('s2-exam-prep-oct-2026', 347, '497563b3d3a93e9d0e87d7bcbb0f2a5f1317c699a99ae8e6172a5faa66fa48f2'),
  ('s2-exam-prep-oct-2026', 348, '726f6ee1e259e8007535c937d5dc92ae5ab32aefbbebbbbbfa7028da3c76cf46'),
  ('s2-exam-prep-oct-2026', 349, '2181b995ff12934c45f69f83120600d9826e0dda4b7dadce0360661bfe2cc4b7'),
  ('s2-exam-prep-oct-2026', 350, 'b54e2b152c2135f45dfca42c67ec11c8a8d6076f1796f3deaa64a752c1d4efa8'),
  ('s2-exam-prep-oct-2026', 351, 'a38bcf73d352e4c7ecd5e6480c34fafb1454d0d1ce77066af3ac6720ea250372'),
  ('s2-exam-prep-oct-2026', 352, '1748ba31e26277da728a0256fb6f2743f9b1bcfebb90a9d8988ee936d30b0f0f'),
  ('s2-exam-prep-oct-2026', 353, 'b4a9f51fee942f7a99bd95c41ef7d4b81eebb47cb66633b2ed8ac17d239595ca'),
  ('s2-exam-prep-oct-2026', 354, 'ebb6ac05808817d1930cb851e0de9b4028094a42ac8952cf4472ed5848348917'),
  ('s2-exam-prep-oct-2026', 355, 'f796e2f28ae5811737ccb8233f34e09f8bb75d2511a135543d1ca37be0199a1d'),
  ('s2-exam-prep-oct-2026', 356, '1bdc4666f8dd9752e0cf56ee1503229653d01bfb4fdc2d9d4cd58a6a987d0fbd'),
  ('s2-exam-prep-oct-2026', 357, '3c7ad783454617591512bb1c563047c82a138462bd0a4cb506e4f4a5c48951e4'),
  ('s2-exam-prep-oct-2026', 358, '46459f9bd8c39ba752f095a190cd30f8043f52ab0afe90850c50510c3ef9929d'),
  ('s2-exam-prep-oct-2026', 359, '38a0eff5fb3861e8fb2ba60e4ce12eaf4288dd9ea4e1d6ca91b8b54f107250a6'),
  ('s2-exam-prep-oct-2026', 360, '18cf9b4783ee739f6c6503d38de62b796c6c90be799b6329a73c03074e0fa677'),
  ('s2-exam-prep-oct-2026', 361, '6255e14abc09aa5c8882cacc761f506793fe5f5b329ae23d38482ae8bd046e45'),
  ('s2-exam-prep-oct-2026', 362, 'fefb1f9c1f2cfa5bc6de0e1166bb82d8a15e9c0bf98a88dcb5de4ca5d1feb837'),
  ('s2-exam-prep-oct-2026', 363, '8f962e2b8e9db4ea2b3e961fc4fb42b80843e936492a089c0cd97c6c10022712'),
  ('s2-exam-prep-oct-2026', 364, 'bbc9ee12c4395a2771805fec1e11e85786501a07b2d2e34050cb9ba84d7dbc11'),
  ('s2-exam-prep-oct-2026', 365, 'd22b75e3a33a790e74baaf8042f72a69bffaabe36780f9ee1ed549e165a38f5e'),
  ('s2-exam-prep-oct-2026', 366, '7f0c68cb87de6c2a8536ca9887b3a1297061f9e1a5f66f6264de35e1086d027a'),
  ('s2-exam-prep-oct-2026', 367, '8fb7ac99f7e19ac2989df95e86454e9f292c210ed24a3501258de07752aade51'),
  ('s2-exam-prep-oct-2026', 368, 'f9d0a9ff95c3e11b4e50c11e32177e9e947217c77103ce6b81510203f4184a95'),
  ('s2-exam-prep-oct-2026', 369, 'd4e16994df9002e53294f899714d7137592fd13ba986fcd070214dc85d659968'),
  ('s2-exam-prep-oct-2026', 370, '90598d5fc621812ec2272f9eeb720f627a254c8ddca9a33ddc474481e46e115d'),
  ('s2-exam-prep-oct-2026', 371, '1c6b6b9e01275af3ac768463d2c751b5c0ee7324ba31723ba694ba4ad48eaf3f'),
  ('s2-exam-prep-oct-2026', 372, 'ff3dbd163436a7d74558c4a9620909ebc9c2811036e336cfead9255dc7e937c7'),
  ('s2-exam-prep-oct-2026', 373, '6afb642998f6a61bd3de37c12771432976849f7baa24a8dc4e16633e65f68501'),
  ('s2-exam-prep-oct-2026', 374, '0e7e50400d6aff0b0594729544c622a76dde2602a6311573aa4ee0ed9d7b4b31'),
  ('s2-exam-prep-oct-2026', 375, '094f8633fefe0d72adc9bf286ea1cf27319d383c531ac0933aeee1e999b25544'),
  ('s2-exam-prep-oct-2026', 376, '8a61e4090fce75bfbd76b94eec784cb366a579ba01fe5cb1d4950510a1f7ff9d'),
  ('s2-exam-prep-oct-2026', 377, 'daad3b4477b005f6ef1dafc232057949c48e1addb90aef9d4a511a49f7cea942'),
  ('s2-exam-prep-oct-2026', 378, '8a61e4090fce75bfbd76b94eec784cb366a579ba01fe5cb1d4950510a1f7ff9d'),
  ('s2-exam-prep-oct-2026', 379, '0e7e50400d6aff0b0594729544c622a76dde2602a6311573aa4ee0ed9d7b4b31'),
  ('s2-exam-prep-oct-2026', 380, 'fea5dd8170f453b7c7ca4cb5b51bef41a2a4997d4a61e8473a5f0df47c635f86'),
  ('s2-exam-prep-oct-2026', 381, 'cf08fccd9d8bfd57d4e6dd765d4cfc1ec6c2e3e9d5219c6229fa0828e9b1004d'),
  ('s2-exam-prep-oct-2026', 382, 'd22b75e3a33a790e74baaf8042f72a69bffaabe36780f9ee1ed549e165a38f5e'),
  ('s2-exam-prep-oct-2026', 383, 'fefb1f9c1f2cfa5bc6de0e1166bb82d8a15e9c0bf98a88dcb5de4ca5d1feb837'),
  ('s2-exam-prep-oct-2026', 384, '1bdc4666f8dd9752e0cf56ee1503229653d01bfb4fdc2d9d4cd58a6a987d0fbd'),
  ('s2-exam-prep-oct-2026', 385, '4762a34b36ca0da2c6ee69e5e2656a81b7a3475994df84311395715c52d218aa'),
  ('s2-exam-prep-oct-2026', 386, '490ca3ed5811c020ba8372021ff5dc839a726dc73b392a2ed564b6683e2e844a'),
  ('s2-exam-prep-oct-2026', 387, 'b4a9f51fee942f7a99bd95c41ef7d4b81eebb47cb66633b2ed8ac17d239595ca'),
  ('s2-exam-prep-oct-2026', 388, '18cf9b4783ee739f6c6503d38de62b796c6c90be799b6329a73c03074e0fa677'),
  ('s2-exam-prep-oct-2026', 389, '6ef946775e978754c68e6ce1f94072318d37ba0a362272139ebf04447c36145b'),
  ('s2-exam-prep-oct-2026', 390, 'ebb6ac05808817d1930cb851e0de9b4028094a42ac8952cf4472ed5848348917'),
  ('s2-exam-prep-oct-2026', 391, '7bd61a1b8ebdf789038195e7873e56aad614a1fcf5b2653ce8638ed43336c159'),
  ('s2-exam-prep-oct-2026', 392, 'b79a954ce810761a0fb2e4e7156aba074912e476dbc04453e8eb0255174f2bf5'),
  ('s2-exam-prep-oct-2026', 393, '7f0c68cb87de6c2a8536ca9887b3a1297061f9e1a5f66f6264de35e1086d027a'),
  ('s2-exam-prep-oct-2026', 394, '8f962e2b8e9db4ea2b3e961fc4fb42b80843e936492a089c0cd97c6c10022712'),
  ('s2-exam-prep-oct-2026', 395, '726f6ee1e259e8007535c937d5dc92ae5ab32aefbbebbbbbfa7028da3c76cf46'),
  ('s2-exam-prep-oct-2026', 396, '8e55b8c71f58527e23f9b826fae59dd918c4d10f31b0e3a139a1d59bf906969b'),
  ('s2-exam-prep-oct-2026', 397, 'b9573e6bb24c4c2411affe6ff4b97e16e0e3c7e6f0d28a6033b21fd74aec07f3'),
  ('s2-exam-prep-oct-2026', 398, '7d22d390ec67d1aa03eca9ca45884b3c83a0595d0c152d93dea473052383444c'),
  ('s2-exam-prep-oct-2026', 399, 'b54e2b152c2135f45dfca42c67ec11c8a8d6076f1796f3deaa64a752c1d4efa8'),
  ('s2-exam-prep-oct-2026', 400, '497563b3d3a93e9d0e87d7bcbb0f2a5f1317c699a99ae8e6172a5faa66fa48f2'),
  ('s2-exam-prep-oct-2026', 401, '6255e14abc09aa5c8882cacc761f506793fe5f5b329ae23d38482ae8bd046e45'),
  ('s2-exam-prep-oct-2026', 402, 'f9d0a9ff95c3e11b4e50c11e32177e9e947217c77103ce6b81510203f4184a95'),
  ('s2-exam-prep-oct-2026', 403, '2181b995ff12934c45f69f83120600d9826e0dda4b7dadce0360661bfe2cc4b7'),
  ('s2-exam-prep-oct-2026', 404, '8fb7ac99f7e19ac2989df95e86454e9f292c210ed24a3501258de07752aade51'),
  ('s2-exam-prep-oct-2026', 405, 'a38bcf73d352e4c7ecd5e6480c34fafb1454d0d1ce77066af3ac6720ea250372'),
  ('s2-exam-prep-oct-2026', 406, '3c7ad783454617591512bb1c563047c82a138462bd0a4cb506e4f4a5c48951e4'),
  ('s2-exam-prep-oct-2026', 407, '094f8633fefe0d72adc9bf286ea1cf27319d383c531ac0933aeee1e999b25544'),
  ('s2-exam-prep-oct-2026', 408, 'd4e16994df9002e53294f899714d7137592fd13ba986fcd070214dc85d659968'),
  ('s2-exam-prep-oct-2026', 409, '38a0eff5fb3861e8fb2ba60e4ce12eaf4288dd9ea4e1d6ca91b8b54f107250a6'),
  ('s2-exam-prep-oct-2026', 410, 'f796e2f28ae5811737ccb8233f34e09f8bb75d2511a135543d1ca37be0199a1d'),
  ('s2-exam-prep-oct-2026', 411, '1748ba31e26277da728a0256fb6f2743f9b1bcfebb90a9d8988ee936d30b0f0f'),
  ('s2-exam-prep-oct-2026', 412, '56c7c1948b8505e4ef99939989882ca2a07c77320b5529dd19c6418bb92d4c87'),
  ('s2-exam-prep-oct-2026', 413, '0a7be080b0f989b345324150f193900a5edf2292e304ad2dd6c0b31a76b2e375'),
  ('s2-exam-prep-oct-2026', 414, '54aa7f35d4802240f3467b9d69bcfd3b03b68b4cf80de347a0c14d2650367b59'),
  ('s2-exam-prep-oct-2026', 415, 'ff3dbd163436a7d74558c4a9620909ebc9c2811036e336cfead9255dc7e937c7'),
  ('s2-exam-prep-oct-2026', 416, '90598d5fc621812ec2272f9eeb720f627a254c8ddca9a33ddc474481e46e115d'),
  ('s2-exam-prep-oct-2026', 417, '6ee18b42fbf155df4d67fc4ad9ddc1f485c1295f28faf67f15868705a8405272'),
  ('s2-exam-prep-oct-2026', 418, '2b59cbd080973d9eb0397e8f531b323b5b9d2c39e12000ded77738e47a7f2e2a'),
  ('s2-exam-prep-oct-2026', 419, 'bbc9ee12c4395a2771805fec1e11e85786501a07b2d2e34050cb9ba84d7dbc11'),
  ('s2-exam-prep-oct-2026', 420, '1c6b6b9e01275af3ac768463d2c751b5c0ee7324ba31723ba694ba4ad48eaf3f'),
  ('s2-exam-prep-oct-2026', 421, '46459f9bd8c39ba752f095a190cd30f8043f52ab0afe90850c50510c3ef9929d'),
  ('s2-exam-prep-oct-2026', 422, '6afb642998f6a61bd3de37c12771432976849f7baa24a8dc4e16633e65f68501'),
  ('s2-exam-prep-oct-2026', 423, '3cf083c28255868b5f464f8ed39b1db95aee54b99b8670a2dbb556a580e9d5da'),
  ('s2-exam-prep-oct-2026', 424, '3c7ad783454617591512bb1c563047c82a138462bd0a4cb506e4f4a5c48951e4'),
  ('s2-exam-prep-oct-2026', 425, '54aa7f35d4802240f3467b9d69bcfd3b03b68b4cf80de347a0c14d2650367b59'),
  ('s2-exam-prep-oct-2026', 426, 'b9573e6bb24c4c2411affe6ff4b97e16e0e3c7e6f0d28a6033b21fd74aec07f3'),
  ('s2-exam-prep-oct-2026', 427, '8fb7ac99f7e19ac2989df95e86454e9f292c210ed24a3501258de07752aade51'),
  ('s2-exam-prep-oct-2026', 428, 'd22b75e3a33a790e74baaf8042f72a69bffaabe36780f9ee1ed549e165a38f5e'),
  ('s2-exam-prep-oct-2026', 429, 'b4a9f51fee942f7a99bd95c41ef7d4b81eebb47cb66633b2ed8ac17d239595ca'),
  ('s2-exam-prep-oct-2026', 430, '7d22d390ec67d1aa03eca9ca45884b3c83a0595d0c152d93dea473052383444c'),
  ('s2-exam-prep-oct-2026', 431, '0e7e50400d6aff0b0594729544c622a76dde2602a6311573aa4ee0ed9d7b4b31'),
  ('s2-exam-prep-oct-2026', 432, '2b59cbd080973d9eb0397e8f531b323b5b9d2c39e12000ded77738e47a7f2e2a'),
  ('s2-exam-prep-oct-2026', 433, '46459f9bd8c39ba752f095a190cd30f8043f52ab0afe90850c50510c3ef9929d'),
  ('s2-exam-prep-oct-2026', 434, '497563b3d3a93e9d0e87d7bcbb0f2a5f1317c699a99ae8e6172a5faa66fa48f2'),
  ('s2-exam-prep-oct-2026', 435, 'cf08fccd9d8bfd57d4e6dd765d4cfc1ec6c2e3e9d5219c6229fa0828e9b1004d'),
  ('s2-exam-prep-oct-2026', 436, '6ef946775e978754c68e6ce1f94072318d37ba0a362272139ebf04447c36145b'),
  ('s2-exam-prep-oct-2026', 437, 'fea5dd8170f453b7c7ca4cb5b51bef41a2a4997d4a61e8473a5f0df47c635f86'),
  ('s2-exam-prep-oct-2026', 438, '56c7c1948b8505e4ef99939989882ca2a07c77320b5529dd19c6418bb92d4c87'),
  ('s2-exam-prep-oct-2026', 439, 'bbc9ee12c4395a2771805fec1e11e85786501a07b2d2e34050cb9ba84d7dbc11'),
  ('s2-exam-prep-oct-2026', 440, '490ca3ed5811c020ba8372021ff5dc839a726dc73b392a2ed564b6683e2e844a'),
  ('s2-exam-prep-oct-2026', 441, 'd4e16994df9002e53294f899714d7137592fd13ba986fcd070214dc85d659968'),
  ('s2-exam-prep-oct-2026', 442, '0a7be080b0f989b345324150f193900a5edf2292e304ad2dd6c0b31a76b2e375'),
  ('s2-exam-prep-oct-2026', 443, '38a0eff5fb3861e8fb2ba60e4ce12eaf4288dd9ea4e1d6ca91b8b54f107250a6'),
  ('s2-exam-prep-oct-2026', 444, 'f9d0a9ff95c3e11b4e50c11e32177e9e947217c77103ce6b81510203f4184a95'),
  ('s2-exam-prep-oct-2026', 445, 'ff3dbd163436a7d74558c4a9620909ebc9c2811036e336cfead9255dc7e937c7'),
  ('s2-exam-prep-oct-2026', 446, '7bd61a1b8ebdf789038195e7873e56aad614a1fcf5b2653ce8638ed43336c159'),
  ('s2-exam-prep-oct-2026', 447, '6ee18b42fbf155df4d67fc4ad9ddc1f485c1295f28faf67f15868705a8405272'),
  ('s2-exam-prep-oct-2026', 448, '8f962e2b8e9db4ea2b3e961fc4fb42b80843e936492a089c0cd97c6c10022712'),
  ('s2-exam-prep-oct-2026', 449, '2181b995ff12934c45f69f83120600d9826e0dda4b7dadce0360661bfe2cc4b7'),
  ('s2-exam-prep-oct-2026', 450, 'f796e2f28ae5811737ccb8233f34e09f8bb75d2511a135543d1ca37be0199a1d'),
  ('s2-exam-prep-oct-2026', 451, '094f8633fefe0d72adc9bf286ea1cf27319d383c531ac0933aeee1e999b25544'),
  ('s2-exam-prep-oct-2026', 452, 'b54e2b152c2135f45dfca42c67ec11c8a8d6076f1796f3deaa64a752c1d4efa8'),
  ('s2-exam-prep-oct-2026', 453, '8a61e4090fce75bfbd76b94eec784cb366a579ba01fe5cb1d4950510a1f7ff9d'),
  ('s2-exam-prep-oct-2026', 454, '1bdc4666f8dd9752e0cf56ee1503229653d01bfb4fdc2d9d4cd58a6a987d0fbd'),
  ('s2-exam-prep-oct-2026', 455, '8e55b8c71f58527e23f9b826fae59dd918c4d10f31b0e3a139a1d59bf906969b'),
  ('s2-exam-prep-oct-2026', 456, 'ebb6ac05808817d1930cb851e0de9b4028094a42ac8952cf4472ed5848348917'),
  ('s2-exam-prep-oct-2026', 457, 'fefb1f9c1f2cfa5bc6de0e1166bb82d8a15e9c0bf98a88dcb5de4ca5d1feb837'),
  ('s2-exam-prep-oct-2026', 458, '1748ba31e26277da728a0256fb6f2743f9b1bcfebb90a9d8988ee936d30b0f0f'),
  ('s2-exam-prep-oct-2026', 459, '6afb642998f6a61bd3de37c12771432976849f7baa24a8dc4e16633e65f68501'),
  ('s2-exam-prep-oct-2026', 460, '90598d5fc621812ec2272f9eeb720f627a254c8ddca9a33ddc474481e46e115d'),
  ('s2-exam-prep-oct-2026', 461, '6255e14abc09aa5c8882cacc761f506793fe5f5b329ae23d38482ae8bd046e45'),
  ('s2-exam-prep-oct-2026', 462, '3cf083c28255868b5f464f8ed39b1db95aee54b99b8670a2dbb556a580e9d5da'),
  ('s2-exam-prep-oct-2026', 463, 'b79a954ce810761a0fb2e4e7156aba074912e476dbc04453e8eb0255174f2bf5'),
  ('s2-exam-prep-oct-2026', 464, 'a38bcf73d352e4c7ecd5e6480c34fafb1454d0d1ce77066af3ac6720ea250372'),
  ('s2-exam-prep-oct-2026', 465, '726f6ee1e259e8007535c937d5dc92ae5ab32aefbbebbbbbfa7028da3c76cf46'),
  ('s2-exam-prep-oct-2026', 466, 'daad3b4477b005f6ef1dafc232057949c48e1addb90aef9d4a511a49f7cea942'),
  ('s2-exam-prep-oct-2026', 467, '1c6b6b9e01275af3ac768463d2c751b5c0ee7324ba31723ba694ba4ad48eaf3f'),
  ('s2-exam-prep-oct-2026', 468, '7f0c68cb87de6c2a8536ca9887b3a1297061f9e1a5f66f6264de35e1086d027a'),
  ('s2-exam-prep-oct-2026', 469, '18cf9b4783ee739f6c6503d38de62b796c6c90be799b6329a73c03074e0fa677'),
  ('s2-exam-prep-oct-2026', 470, '4762a34b36ca0da2c6ee69e5e2656a81b7a3475994df84311395715c52d218aa')
on conflict (module_key, question_number) do update set answer_sha256 = excluded.answer_sha256;

create or replace function public.junior_exam_list_responses(p_token uuid, p_module_key text)
returns table(question_number integer, answer text, correct boolean, submitted_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
declare v_student_id uuid;
begin
  if auth.uid() is null or p_token is null or p_module_key is null then
    raise exception 'Student authentication is required' using errcode = '42501';
  end if;
  select session_row.student_id into v_student_id
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student on student.id = session_row.student_id
  join public.junior_exam_module_access access_row
    on access_row.student_id = student.id and access_row.module_key = p_module_key
  where session_row.token = p_token and session_row.expires_at > pg_catalog.now()
    and student.deleted_at is null
  limit 1;
  if v_student_id is null then
    raise exception 'This exam module is not assigned to this student' using errcode = '42501';
  end if;
  return query
    select response.question_number, response.answer, response.correct, response.submitted_at
    from public.junior_exam_responses response
    where response.student_id = v_student_id and response.module_key = p_module_key
    order by response.question_number;
end;
$$;

create or replace function public.junior_exam_submit(
  p_token uuid, p_module_key text, p_answers jsonb, p_final boolean default false
) returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_student_id uuid;
  v_key text;
  v_raw text;
  v_answer text;
  v_number integer;
  v_correct boolean;
  v_count integer := 0;
  v_correct_count integer := 0;
  v_results jsonb := '{}'::jsonb;
  v_saved jsonb := '{}'::jsonb;
  v_submission_id uuid;
begin
  if auth.uid() is null or p_token is null or p_module_key is null then
    raise exception 'Student authentication is required' using errcode = '42501';
  end if;
  if p_answers is null or pg_catalog.jsonb_typeof(p_answers) <> 'object'
    or p_final is null or pg_catalog.octet_length(p_answers::text) > 100000 then
    raise exception 'Invalid submission' using errcode = '22023';
  end if;
  select session_row.student_id into v_student_id
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student on student.id = session_row.student_id
  join public.junior_exam_module_access access_row
    on access_row.student_id = student.id and access_row.module_key = p_module_key
  where session_row.token = p_token and session_row.expires_at > pg_catalog.now()
    and student.deleted_at is null
  limit 1;
  if v_student_id is null then
    raise exception 'This exam module is not assigned to this student' using errcode = '42501';
  end if;

  for v_key, v_raw in select item.key, item.value
    from pg_catalog.jsonb_each_text(p_answers) item(key, value)
  loop
    if v_key !~ '^[0-9]{3}$' then
      raise exception 'Invalid question number' using errcode = '22023';
    end if;
    v_number := v_key::integer;
    v_answer := pg_catalog.btrim(pg_catalog.regexp_replace(v_raw, '[[:space:]]+', ' ', 'g'));
    if v_number not between 1 and 470 or pg_catalog.char_length(v_answer) not between 1 and 100 then
      raise exception 'Invalid answer' using errcode = '22023';
    end if;
    select key_row.answer_sha256 = pg_catalog.encode(extensions.digest(pg_catalog.lower(v_answer), 'sha256'), 'hex')
      into v_correct from public.junior_exam_answer_hashes key_row
      where key_row.module_key = p_module_key and key_row.question_number = v_number;
    if v_correct is null then
      raise exception 'Question is not part of this module' using errcode = '22023';
    end if;
    insert into public.junior_exam_responses as existing
      (student_id, module_key, question_number, answer, correct, submitted_at)
    values (v_student_id, p_module_key, v_number, v_answer, v_correct, pg_catalog.now())
    on conflict (student_id, module_key, question_number) do update
      set answer = excluded.answer, correct = excluded.correct, submitted_at = excluded.submitted_at;
    v_count := v_count + 1;
    v_correct_count := v_correct_count + case when v_correct then 1 else 0 end;
    v_results := pg_catalog.jsonb_set(v_results, array[v_key], pg_catalog.to_jsonb(v_correct), true);
    v_saved := pg_catalog.jsonb_set(v_saved, array[v_key], pg_catalog.to_jsonb(v_answer), true);
  end loop;
  if v_count = 0 or (p_final and v_count <> 470) then
    raise exception 'Submit at least one answer; a final submission needs all 470' using errcode = '22023';
  end if;
  insert into public.junior_exam_submissions
    (student_id, module_key, answers, submitted_count, correct_count, is_final)
  values (v_student_id, p_module_key, v_saved, v_count, v_correct_count, p_final)
  returning id into v_submission_id;
  return pg_catalog.jsonb_build_object(
    'submissionId', v_submission_id, 'submitted', v_count,
    'correct', v_correct_count, 'final', p_final, 'results', v_results
  );
end;
$$;

revoke all on function public.junior_exam_list_responses(uuid, text) from public, anon, authenticated;
revoke all on function public.junior_exam_submit(uuid, text, jsonb, boolean) from public, anon, authenticated;
grant execute on function public.junior_exam_list_responses(uuid, text) to authenticated;
grant execute on function public.junior_exam_submit(uuid, text, jsonb, boolean) to authenticated;
commit;
