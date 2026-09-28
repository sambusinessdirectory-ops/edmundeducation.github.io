# Polysemy mass import audio

The 447 imported modules contain 20,979 example sentences. Their source-order
voice assignments follow the original Polysemy modules: American female,
American male (Aries), British male, British female, repeating every four
sentences.

The three Kokoro voices cover 15,687 sentences and use the same model, voice
IDs, and speeds as the original modules. Their recordings are stored as
immutable packed MP3s in R2, with the question-to-URL mapping in
`audio-mass.json`. The browser plays recordings only; it must never generate
speech from the student's device.

The remaining 5,292 imported Aries sentences are deliberately pending.
Another 854 Aries sentences in earlier modules have no prerecorded file. The
user's instruction is to stay within the Cloudflare free daily allowance and process
these over successive resets. Do not replace Aries with another voice or turn
on a paid plan without a new instruction. Pending questions display
`示範音訊準備中` while students can still answer and record their own voice.

Regenerate the queue with `node tools/export-polysemy-mass-audio.mjs
/private/tmp/polysemy-mass-audio`. The `cloud-pending.json` output includes
all 6,146 pending Aries sentences, including the gaps in older modules.
The existing `tools/generate-polysemy-audio.py --kind cloud` uses the same
Aries recipe and resumes existing clips after the daily allowance resets.
Publish an additional immutable audio pack and manifest for that queue only
after its uploaded MP3s are available; keep each day's completed clips.
