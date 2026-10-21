-- Jayden advanced exam modules: 5 passages and 50 items each.
-- Existing October 2026 responses and hashes remain intact.
begin;
insert into public.junior_exam_module_access(module_key, student_id) values
  ('s2-exam-prep-advanced-tense', 'df2a3ba9-25be-4b0c-823a-304d4c29c2ba'::uuid),
  ('s2-exam-prep-advanced-articles', 'df2a3ba9-25be-4b0c-823a-304d4c29c2ba'::uuid),
  ('s2-exam-prep-advanced-non-tense-non-articles', 'df2a3ba9-25be-4b0c-823a-304d4c29c2ba'::uuid)
on conflict do nothing;
insert into public.junior_exam_answer_hashes(module_key, question_number, answer_sha256) values
  ('s2-exam-prep-advanced-tense', 1, '9545a97e6f36fb47041367be3368860b9a7e7bab7e8a0336c164351aa93e2aec'),
  ('s2-exam-prep-advanced-tense', 2, 'a3f1523532987d08f9de7dd728fda0b6acaef91525fed81d539d76bb0b5df14f'),
  ('s2-exam-prep-advanced-tense', 3, '8ccb033c0e48b27ff91e1ab948367e3bbc6921487c97624ed7ad064025e3dc99'),
  ('s2-exam-prep-advanced-tense', 4, '5521dee3c2639346b13ccf455ce81c4b27a2900abad3e2372b52ba1dda8801e3'),
  ('s2-exam-prep-advanced-tense', 5, '7cf8dc24a5c923d08910a302736c05d01357560e95541ec224f5c0809c578966'),
  ('s2-exam-prep-advanced-tense', 6, '4bd03e67fab34345649bc1ab0fc11789fcb522a87b20645591a20e12d5d3c92b'),
  ('s2-exam-prep-advanced-tense', 7, '64018d3f8c11b7ac864ebe9ad8630942e85c4c959597779222616fa13eb3c20a'),
  ('s2-exam-prep-advanced-tense', 8, 'f9ddbb8111b196bd2156767347957ed63414cb355dedcc730bac6643e67776c0'),
  ('s2-exam-prep-advanced-tense', 9, '06137cf2ec992bbdfdc0a0fc75f2e7567b74185c5721c6ae5791af0e1d5803ac'),
  ('s2-exam-prep-advanced-tense', 10, '5526324dd4cdf1bb177e28876fff8507903523cb7ae81b34db14acc04d5dd315'),
  ('s2-exam-prep-advanced-tense', 11, '16f0a1b606487f1bc76c0b1d6ebbfa37184f9486262ac6b91aec98b13a0f2e36'),
  ('s2-exam-prep-advanced-tense', 12, 'cf3ffce19a8f6777d12bc12a13f0c7525af17389913b5c0965c4c1b6fc1cd540'),
  ('s2-exam-prep-advanced-tense', 13, '309074dc4898c3d17a5e7bc8294d0b0d9e69d7e4b7f6ef05674d3ce596b0a629'),
  ('s2-exam-prep-advanced-tense', 14, '5883d2c5ea0053d4a5693079ccd00fa6b5d1050d85f897cdfed079f1ab9d7ea8'),
  ('s2-exam-prep-advanced-tense', 15, '9b19ba5a4b3c59ed6bd04312d0cf472cd426e3558b90558b0e40f5ba52b281ba'),
  ('s2-exam-prep-advanced-tense', 16, '0dec6069d55174d6223c08b49a7cfc291aefc5cd366d7c8f7b0606325e92e6ea'),
  ('s2-exam-prep-advanced-tense', 17, '0a18718002d65b5c617c1dd82c481c0d7246862fcf2bf7ea75221e17e9350f4a'),
  ('s2-exam-prep-advanced-tense', 18, 'cdf1fc148e35912bd9ab24b4e38a450fb9701a3cbe90b23a7e93fde03afe8fdf'),
  ('s2-exam-prep-advanced-tense', 19, 'a70bb0f759fc8e56694ed1ba0a5820ac64552d710de38b051b63f0c572df709c'),
  ('s2-exam-prep-advanced-tense', 20, '05970e30555fc7bf6388d907406715bacc1f042b180da0b450c404a651c07d4c'),
  ('s2-exam-prep-advanced-tense', 21, '5ed0a10b951bfe152c4facd9448d686a1d4a7dc79efded33a31329eb98b85c85'),
  ('s2-exam-prep-advanced-tense', 22, '9f925cdc4feedda4d9ae06f2e1b476680f4781ac2e0fb95fcc819be70328453d'),
  ('s2-exam-prep-advanced-tense', 23, '19391ae750fe91b8772a1071288d28d97c4aa250b3b1f3d267f3429c3f46a064'),
  ('s2-exam-prep-advanced-tense', 24, '51e465a4d5a39e8b8dad8baa7201ac3945d34cc7c212ab5e138be70d59073a16'),
  ('s2-exam-prep-advanced-tense', 25, '392b2faa16684976fcfa76ce3bffbffa3710b8c0932f6a01af07cf3048cb5129'),
  ('s2-exam-prep-advanced-tense', 26, '6b963cc1c2d7d3a4efdc2aac4ae38a8ecbc4535ae84b6dc1440d4abadcd97956'),
  ('s2-exam-prep-advanced-tense', 27, '32691c2475078d17e5ed2891ecc65287a2729b6586f92c69eb4c2f06d9816509'),
  ('s2-exam-prep-advanced-tense', 28, 'b0c467ef1a19933b3f838ca56a2b6f38308b17babd3969376667d34fa753397c'),
  ('s2-exam-prep-advanced-tense', 29, 'c093955cebfac85b136d4eb53ac1968f90c9197bc992cb1befd365ec3f2a9649'),
  ('s2-exam-prep-advanced-tense', 30, '326d828880e84d91f309a212cd04c36da9f22ebe93b3ee0c1329100464bdaf07'),
  ('s2-exam-prep-advanced-tense', 31, '89b8f7ab92f71adac0ce61147c5cd4d4ad791ab79cb2a7c53c0863d13a822e17'),
  ('s2-exam-prep-advanced-tense', 32, '40f7ad19cd04bc520fd01831e97677d1d6776c6be7138d67dbb66cef3636d70d'),
  ('s2-exam-prep-advanced-tense', 33, '4c0220d5c3733ebc91fd14ac1b4784e3e0a1d334ab7675bc6e11246eab28ae71'),
  ('s2-exam-prep-advanced-tense', 34, 'b1e0679f7eeb2ebc1b5c1a37c93a5a48df95b64f33abfdac12bdcaff44cfb26a'),
  ('s2-exam-prep-advanced-tense', 35, '7ba0ac6b590b6c43b51ca3c3753d8a4a2dbc131155c6399ec4fc6d4e3f5c6280'),
  ('s2-exam-prep-advanced-tense', 36, 'ce0014b1d48c2e80436cd10cccf32f1f28bf3ac9bbac97f4d248a1087ed16ead'),
  ('s2-exam-prep-advanced-tense', 37, 'a0168243aa87ff99f4d2b45d952437579be7eeb1263e3ba3f34acc193837ef91'),
  ('s2-exam-prep-advanced-tense', 38, 'ba0843f94059de28c90a6ddecdcaa7cc4c61f67945593c4c64e5440dc7b3225a'),
  ('s2-exam-prep-advanced-tense', 39, '382ac82819112f81c7f6d49b97a4338b561dee7f2763c8aaae299aec8e678be2'),
  ('s2-exam-prep-advanced-tense', 40, 'f3e8234402a37d502b917a288f1682ea56768e9f44382441b8a4cf63f0f238f2'),
  ('s2-exam-prep-advanced-tense', 41, '59830ebc3a4184110566bf1a290d08473dfdcbd492ce498b14cd1a5e2fa2e441'),
  ('s2-exam-prep-advanced-tense', 42, '9041bc1f5f1b56608d7a2e8faef0545facf6d3514b1de2c07df1ba97254c3d70'),
  ('s2-exam-prep-advanced-tense', 43, '0a37d9252cc69e506613681eaacce8ef0c517e84f130aeab8524d977fde25ba4'),
  ('s2-exam-prep-advanced-tense', 44, '00f95983b88e71547cc599472043fd12d62cd05cf333750b0f621d583a793e2d'),
  ('s2-exam-prep-advanced-tense', 45, '1e3cc126e921a4f9f8d0664f07eec882dfa256a6422f69d6019c11b11d1d0e40'),
  ('s2-exam-prep-advanced-tense', 46, 'dfab20b7355be48753e03e0e37827d04705b9d0f70b36ba63144991851803ec3'),
  ('s2-exam-prep-advanced-tense', 47, 'cb4bf1168180cd97258c432b815cebcb8179733c655edd550a6d58c502957cae'),
  ('s2-exam-prep-advanced-tense', 48, 'a6b02e5c73d357e43b3aa821af780dfea465da74812c06bc279635abda0a3b26'),
  ('s2-exam-prep-advanced-tense', 49, '13f09ad3a070c3db8fda6b493e60cb2d44778d16db9be807d5725d5b0b408cd7'),
  ('s2-exam-prep-advanced-tense', 50, '172389b29927f88f1a7e27aecfd152a79d1dab2b0009f11d95252f655ce7dda8'),
  ('s2-exam-prep-advanced-articles', 1, '55a4bc5be68ea5c30cbe4d07e3bf951163b5a207dfd628ea53a2eb21072a9f3b'),
  ('s2-exam-prep-advanced-articles', 2, 'ea325d761f98c6b73320e442b67f2a3574d9924716d788ddc0dbbdcaca853fe7'),
  ('s2-exam-prep-advanced-articles', 3, '55a4bc5be68ea5c30cbe4d07e3bf951163b5a207dfd628ea53a2eb21072a9f3b'),
  ('s2-exam-prep-advanced-articles', 4, '2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881'),
  ('s2-exam-prep-advanced-articles', 5, 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'),
  ('s2-exam-prep-advanced-articles', 6, 'ea325d761f98c6b73320e442b67f2a3574d9924716d788ddc0dbbdcaca853fe7'),
  ('s2-exam-prep-advanced-articles', 7, '55a4bc5be68ea5c30cbe4d07e3bf951163b5a207dfd628ea53a2eb21072a9f3b'),
  ('s2-exam-prep-advanced-articles', 8, 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'),
  ('s2-exam-prep-advanced-articles', 9, '55a4bc5be68ea5c30cbe4d07e3bf951163b5a207dfd628ea53a2eb21072a9f3b'),
  ('s2-exam-prep-advanced-articles', 10, '55a4bc5be68ea5c30cbe4d07e3bf951163b5a207dfd628ea53a2eb21072a9f3b'),
  ('s2-exam-prep-advanced-articles', 11, 'b9776d7ddf459c9ad5b0e1d6ac61e27befb5e99fd62446677600d7cacef544d0'),
  ('s2-exam-prep-advanced-articles', 12, 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'),
  ('s2-exam-prep-advanced-articles', 13, '55a4bc5be68ea5c30cbe4d07e3bf951163b5a207dfd628ea53a2eb21072a9f3b'),
  ('s2-exam-prep-advanced-articles', 14, '2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881'),
  ('s2-exam-prep-advanced-articles', 15, '2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881'),
  ('s2-exam-prep-advanced-articles', 16, 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'),
  ('s2-exam-prep-advanced-articles', 17, 'b9776d7ddf459c9ad5b0e1d6ac61e27befb5e99fd62446677600d7cacef544d0'),
  ('s2-exam-prep-advanced-articles', 18, '55a4bc5be68ea5c30cbe4d07e3bf951163b5a207dfd628ea53a2eb21072a9f3b'),
  ('s2-exam-prep-advanced-articles', 19, 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'),
  ('s2-exam-prep-advanced-articles', 20, '0a8fedfe0e706f9a6bc9c13e0bb90dd92121ebfe118f0d16b79ab69361c97a3a'),
  ('s2-exam-prep-advanced-articles', 21, 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'),
  ('s2-exam-prep-advanced-articles', 22, '55a4bc5be68ea5c30cbe4d07e3bf951163b5a207dfd628ea53a2eb21072a9f3b'),
  ('s2-exam-prep-advanced-articles', 23, 'ea325d761f98c6b73320e442b67f2a3574d9924716d788ddc0dbbdcaca853fe7'),
  ('s2-exam-prep-advanced-articles', 24, '55a4bc5be68ea5c30cbe4d07e3bf951163b5a207dfd628ea53a2eb21072a9f3b'),
  ('s2-exam-prep-advanced-articles', 25, 'ea325d761f98c6b73320e442b67f2a3574d9924716d788ddc0dbbdcaca853fe7'),
  ('s2-exam-prep-advanced-articles', 26, 'b9776d7ddf459c9ad5b0e1d6ac61e27befb5e99fd62446677600d7cacef544d0'),
  ('s2-exam-prep-advanced-articles', 27, '2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881'),
  ('s2-exam-prep-advanced-articles', 28, '63c66a1fee8d7a1692157e3e08efb479743d4c1cd91f653ee84392ebe5235873'),
  ('s2-exam-prep-advanced-articles', 29, '55a4bc5be68ea5c30cbe4d07e3bf951163b5a207dfd628ea53a2eb21072a9f3b'),
  ('s2-exam-prep-advanced-articles', 30, '55a4bc5be68ea5c30cbe4d07e3bf951163b5a207dfd628ea53a2eb21072a9f3b'),
  ('s2-exam-prep-advanced-articles', 31, '55a4bc5be68ea5c30cbe4d07e3bf951163b5a207dfd628ea53a2eb21072a9f3b'),
  ('s2-exam-prep-advanced-articles', 32, 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'),
  ('s2-exam-prep-advanced-articles', 33, '2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881'),
  ('s2-exam-prep-advanced-articles', 34, '55a4bc5be68ea5c30cbe4d07e3bf951163b5a207dfd628ea53a2eb21072a9f3b'),
  ('s2-exam-prep-advanced-articles', 35, 'ea325d761f98c6b73320e442b67f2a3574d9924716d788ddc0dbbdcaca853fe7'),
  ('s2-exam-prep-advanced-articles', 36, '55a4bc5be68ea5c30cbe4d07e3bf951163b5a207dfd628ea53a2eb21072a9f3b'),
  ('s2-exam-prep-advanced-articles', 37, 'b9776d7ddf459c9ad5b0e1d6ac61e27befb5e99fd62446677600d7cacef544d0'),
  ('s2-exam-prep-advanced-articles', 38, 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'),
  ('s2-exam-prep-advanced-articles', 39, '55a4bc5be68ea5c30cbe4d07e3bf951163b5a207dfd628ea53a2eb21072a9f3b'),
  ('s2-exam-prep-advanced-articles', 40, 'b9776d7ddf459c9ad5b0e1d6ac61e27befb5e99fd62446677600d7cacef544d0'),
  ('s2-exam-prep-advanced-articles', 41, '2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881'),
  ('s2-exam-prep-advanced-articles', 42, '55a4bc5be68ea5c30cbe4d07e3bf951163b5a207dfd628ea53a2eb21072a9f3b'),
  ('s2-exam-prep-advanced-articles', 43, '55a4bc5be68ea5c30cbe4d07e3bf951163b5a207dfd628ea53a2eb21072a9f3b'),
  ('s2-exam-prep-advanced-articles', 44, 'b9776d7ddf459c9ad5b0e1d6ac61e27befb5e99fd62446677600d7cacef544d0'),
  ('s2-exam-prep-advanced-articles', 45, '55a4bc5be68ea5c30cbe4d07e3bf951163b5a207dfd628ea53a2eb21072a9f3b'),
  ('s2-exam-prep-advanced-articles', 46, '2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881'),
  ('s2-exam-prep-advanced-articles', 47, '2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881'),
  ('s2-exam-prep-advanced-articles', 48, 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'),
  ('s2-exam-prep-advanced-articles', 49, '55a4bc5be68ea5c30cbe4d07e3bf951163b5a207dfd628ea53a2eb21072a9f3b'),
  ('s2-exam-prep-advanced-articles', 50, 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 1, '726f6ee1e259e8007535c937d5dc92ae5ab32aefbbebbbbbfa7028da3c76cf46'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 2, 'b9573e6bb24c4c2411affe6ff4b97e16e0e3c7e6f0d28a6033b21fd74aec07f3'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 3, '8a61e4090fce75bfbd76b94eec784cb366a579ba01fe5cb1d4950510a1f7ff9d'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 4, '531f43f8e3ddd6a512a3e726e1490c41d8a0fd7d7e07359362c432ccd96e8518'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 5, 'ba78973ddcf98d4e5369f5e722d681d94f5106895e5d6cf6fa3ca8240fabdc14'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 6, 'bbc9ee12c4395a2771805fec1e11e85786501a07b2d2e34050cb9ba84d7dbc11'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 7, 'ba78973ddcf98d4e5369f5e722d681d94f5106895e5d6cf6fa3ca8240fabdc14'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 8, '60978f11ec8e8b3b7a6bcac37bbcc1e9f0d3424369aa771319f9154529c9a426'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 9, 'bd0e6a3b176a9de92c005b0d91e57b83bfb434e84c248ce51ab8b15dd1b66912'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 10, 'd7d5dcc369426e2e5f8dcb89af4308b0daed6e55910d53395ce38bd6dd1a9456'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 11, '490ca3ed5811c020ba8372021ff5dc839a726dc73b392a2ed564b6683e2e844a'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 12, 'ff3dbd163436a7d74558c4a9620909ebc9c2811036e336cfead9255dc7e937c7'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 13, '6ee18b42fbf155df4d67fc4ad9ddc1f485c1295f28faf67f15868705a8405272'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 14, 'e8b22d83b417e85ba4f24101a49a49cc3246a5e5e4ce6574623063e4e32801e0'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 15, '20f65c28671b40937c5bf23acc7c6f37e5a5ec0622e347b57685725df5ba9e50'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 16, 'a336147cc444a49ff8c11b7691b85fe3596216df154bacfe2a6da03433f6e610'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 17, '0fd924362117d03662f0e86e580ab01c70d3fa88dbffce4224017e86e5fbad52'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 18, 'b63b99f6383ba713b57ddfc77737c5f71639fa6f4663efe60a66a8c6d114b545'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 19, 'b63b99f6383ba713b57ddfc77737c5f71639fa6f4663efe60a66a8c6d114b545'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 20, '8a61e4090fce75bfbd76b94eec784cb366a579ba01fe5cb1d4950510a1f7ff9d'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 21, 'b9573e6bb24c4c2411affe6ff4b97e16e0e3c7e6f0d28a6033b21fd74aec07f3'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 22, '637e77a824d6eaeecd88d95df00e626b703d2ab912c9231ba06291c4f6b36523'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 23, 'cf08fccd9d8bfd57d4e6dd765d4cfc1ec6c2e3e9d5219c6229fa0828e9b1004d'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 24, '031af55b1821e721e58832cb81177a527f3e8ea244986da200562c62b91d535c'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 25, 'b63b99f6383ba713b57ddfc77737c5f71639fa6f4663efe60a66a8c6d114b545'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 26, 'b63b99f6383ba713b57ddfc77737c5f71639fa6f4663efe60a66a8c6d114b545'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 27, '6294ed26d0b48a11c0ee3bebd9f2a28d2312d3beb5f0f50dfce9fb6345f7c250'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 28, '96d61fe343ddf5e0d8d68b1d0b08b9af50973a0ebdd38021fae327bbea1b4c13'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 29, 'c3bc45ac352fe43ff8f0a1cc26d6cc29f71f536dc417906f8513ea44ed4bb161'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 30, 'd7d5dcc369426e2e5f8dcb89af4308b0daed6e55910d53395ce38bd6dd1a9456'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 31, '582967534d0f909d196b97f9e6921342777aea87b46fa52df165389db1fb8ccf'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 32, 'b8d31e852725afb1e26d53bab6095b2bff1749c9275be13ed1c05a56ed31ec09'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 33, 'c3bc45ac352fe43ff8f0a1cc26d6cc29f71f536dc417906f8513ea44ed4bb161'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 34, '680dce633db1189eb1158aad579df2ce0ad72a0571ccfeeaa5f79092ea6cb729'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 35, 'edd95740e339e6aa0a1dab45741b0521185680b051631a7c265b5630da4f2158'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 36, '3ebb153fb24e4411400e94a9a92b0ec458c3a8473e51e03cd37d4a34c99dfda6'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 37, '81c5bf35c8fdf637bffde2bf503d5dd103e983994570a8d9b495d3173d449d07'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 38, '490ca3ed5811c020ba8372021ff5dc839a726dc73b392a2ed564b6683e2e844a'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 39, '476994559e873a621c524b49c195ad4d14876ac168022ae43c0b3fe2868d82ef'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 40, 'd7d5dcc369426e2e5f8dcb89af4308b0daed6e55910d53395ce38bd6dd1a9456'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 41, 'd4e16994df9002e53294f899714d7137592fd13ba986fcd070214dc85d659968'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 42, 'fc7f81681c5aa7c7b911750b6a7c508e62dbd7b6125a7869285e645b1c19dae0'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 43, '8a61e4090fce75bfbd76b94eec784cb366a579ba01fe5cb1d4950510a1f7ff9d'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 44, 'fa51fd49abf67705d6a35d18218c115ff5633aec1f9ebfdc9d5d4956416f57f6'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 45, '4d9c9f0f50b26c0713d7e8f2c93c3956c4455e8edc33947b808e390a8c2baf04'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 46, 'ba78973ddcf98d4e5369f5e722d681d94f5106895e5d6cf6fa3ca8240fabdc14'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 47, 'ad6c09a08e77a230998d35b372c8ab7c6ddb25b746bde25d5589d2b0e8135ef3'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 48, '5edfeacf4e5da8246f772fdb6e01d040381ecb2139bf15ac93284400479de175'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 49, '726f6ee1e259e8007535c937d5dc92ae5ab32aefbbebbbbbfa7028da3c76cf46'),
  ('s2-exam-prep-advanced-non-tense-non-articles', 50, 'e8bc9b63ced95936afc5cb456434f509e9b87e9e2431e1d3839c5db5716a5769')
on conflict (module_key, question_number) do update set answer_sha256 = excluded.answer_sha256;
create or replace function public.junior_exam_submit(
  p_token uuid, p_module_key text, p_answers jsonb, p_final boolean default false
) returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_student_id uuid;
  v_total integer;
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
  select pg_catalog.count(*) into v_total from public.junior_exam_answer_hashes
    where module_key = p_module_key;
  if v_total < 1 or v_total > 470 then
    raise exception 'Invalid module question count' using errcode = '22023';
  end if;

  for v_key, v_raw in select item.key, item.value
    from pg_catalog.jsonb_each_text(p_answers) item(key, value)
  loop
    if v_key !~ '^[0-9]{3}$' then
      raise exception 'Invalid question number' using errcode = '22023';
    end if;
    v_number := v_key::integer;
    v_answer := pg_catalog.btrim(pg_catalog.regexp_replace(v_raw, '[[:space:]]+', ' ', 'g'));
    if v_number not between 1 and v_total or pg_catalog.char_length(v_answer) not between 1 and 100 then
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
  if v_count = 0 or (p_final and v_count <> v_total) then
    raise exception 'Submit at least one answer; a final submission needs all module questions' using errcode = '22023';
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


revoke all on function public.junior_exam_submit(uuid, text, jsonb, boolean) from public, anon, authenticated;
grant execute on function public.junior_exam_submit(uuid, text, jsonb, boolean) to authenticated;
commit;
