(function initialiseEdmundSystemNavigation() {
  "use strict";

  const UNIVERSAL_SESSION_KEY = "edmund-universal-student-session-v1";
  const POMODORO_STORAGE_PREFIX = "edmund-schedule-pomodoro-v1";
  const POMODORO_DEVICE_STORAGE_KEY = `${POMODORO_STORAGE_PREFIX}:device`;
  const NIGHT_RETURN_STORAGE_PREFIX = "edmund-night-return-v1";
  const DEFAULT_POMODORO_SETTINGS = Object.freeze({
    enabled: false,
    allowSkipBreak: false,
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 25,
    sessionsBeforeLongBreak: 4,
    taskLabel: "英文學習"
  });
  const SYSTEMS = Object.freeze([
    { id: "progress", href: "student-progress.html", zh: "全面英文能力發展進度表", en: "Student Progress", homepageCard: 24 },
    { id: "flashcards", href: "flashcards.html", zh: "Flashcard 學習卡", en: "Flashcard System", homepageCard: 14 },
    { id: "writing", href: "writing-practice.html", zh: "英文寫作練習", en: "Writing Practice", homepageCard: 12 },
    { id: "writing-submission", href: "writing-submission.html", zh: "Edmund Sir Writing 交文", en: "Writing Submission", homepageCard: 16 },
    { id: "speaking", href: "speaking-system.html", zh: "Speaking 說話練習", en: "Speaking System", homepageCard: 17 },
    { id: "listening", href: "listening-system.html", zh: "英語聆聽系統", en: "Listening System", homepageCard: 18 },
    { id: "sentence", href: "sentence-structure.html", zh: "句子結構", en: "Sentence Structure", homepageCard: 19 },
    { id: "idioms", href: "idiom-system.html", zh: "英文慣用語", en: "Idiom Learning", homepageCard: 20 },
    { id: "proverbs", href: "proverb-system.html", zh: "(學生使用) 諺語", en: "學生使用系統", homepageCard: 21 },
    { id: "phrasal-verbs", href: "phrasal-verb-system.html", zh: "Phrasal Verb 動詞片語", en: "學習系統", homepageCard: 22 },
    { id: "dse-paper3-analysis", href: "dse-paper3-analysis.html", zh: "DSE 卷3 綜合能力分析", en: "Integrated Skills Analysis", homepageCard: 23 },
    { id: "ielts-reading-analysis", href: "ielts-reading-analysis.html", zh: "IELTS 閱讀理解解卷分析", en: "IELTS Reading Analysis" },
    { id: "schedule", href: "schedule-system.html", zh: "功課及溫習安排", en: "Study Schedule", homepageCard: 11 },
    { id: "downloads", href: "model-essay-downloads.html", zh: "教材下載區", en: "Downloads", homepageCard: 13 },
    { id: "video-class", href: "video-class.html", zh: "錄影班學習平台", en: "Video Class" },
    { id: "parent-communication", href: "parent-communication.html", zh: "家長溝通系統", en: "Parent Communication", homepageCard: 15 },
    { id: "common-expression-speaking", href: "common-expression-speaking.html", zh: "Common Expression 常用語", en: "會話 Speaking", homepageCard: 25 },
    { id: "common-expression-written", href: "common-expression-written.html", zh: "Common Expression 常用語", en: "專業寫作 Written", homepageCard: 26 },
    { id: "common-expression-rhetorical-speaking", href: "common-expression-rhetorical-speaking.html", zh: "Common Expression 常用語", en: "修辭會話 Rhetorical Speaking", homepageCard: 27 },
    { id: "common-expression-rhetorical-writing", href: "common-expression-rhetorical-writing.html", zh: "Common Expression 常用語", en: "修辭寫作 Rhetorical Writing", homepageCard: 28 },
    { id: "common-expression-professional-message", href: "common-expression-professional-message.html", zh: "Common Expression 常用語", en: "商業溝通 Professional Message", homepageCard: 29 },
    { id: "common-expression-business-speaking", href: "common-expression-business-speaking.html", zh: "Common Expression 常用語", en: "商務會話 Business Speaking", homepageCard: 30 },
    { id: "quotes", href: "quotes-system.html", zh: "名人英文語錄", en: "Quotes / 學習系統" },
    { id: "grammar", href: "grammar-system.html", zh: "英文語法學習", en: "Grammar" },
    { id: "collocation", href: "collocation-system.html", zh: "英文配詞", en: "Collocation / 學習系統" },
    { id: "irregular-verb", href: "irregular-verb-system.html", zh: "不規則動詞", en: "Irregular Verb / 學習系統" },
    { id: "thematic-vocabulary", href: "thematic-vocabulary-system.html", zh: "主題性生字記錄大全", en: "Thematic Vocabulary" },
    { id: "part-of-speech", href: "part-of-speech-system.html", zh: "詞性練習系統", en: "Part Of Speech (POS)" },
    { id: "synonyms", href: "synonyms-system.html", zh: "同義詞", en: "Synonyms / 學習系統" },
    { id: "error-identifier", href: "error-identifier-system.html", zh: "錯因分析系統", en: "Error Identifier" },
    { id: "learning-roadmap", href: "learning-roadmap.html", zh: "英文學習路線圖", en: "Learning Roadmap" },
    { id: "spelling", href: "spelling-system.html", zh: "拼寫 / 練習系統", en: "Spelling" },
    { id: "reading-logic", href: "reading-logic-system.html", zh: "閱讀理解 / 題型邏輯", en: "Reading Logic" },
    { id: "translation-skills", href: "translation-skills-system.html", zh: "閱讀理解 / 英譯中能力學習", en: "Translation Skills" },
    { id: "business-school", href: "business-school-system.html", zh: "商學院英文訓練系統", en: "Business School" },
    { id: "complex-questions", href: "complex-questions-system.html", zh: "英文複雜問句", en: "Complex Questions" },
    { id: "leisurely-reading", href: "leisurely-reading.html", zh: "英文導讀系統", en: "Leisurely Reading" },
    { id: "english-humour-speaking", href: "english-humour-speaking.html", zh: "英文幽默會話系統", en: "English Humour / Speaking" },
    { id: "english-humour-writing", href: "english-humour-writing.html", zh: "英文幽默寫作系統", en: "English Humour / Speaking" },
    { id: "english-joke-collection", href: "english-joke-collection.html", zh: "英文笑話收集站", en: "English Joke / Collection" },
    { id: "argument-learning", href: "argument-learning-system.html", zh: "論證 / 論據 / 論點 學習系統", en: "Argument learning" },
    { id: "fragmented-reading", href: "fragmented-reading-system.html", zh: "閱讀理解 / 碎片訓練系統", en: "Fragmented Reading" },
    { id: "song-appreciation", href: "song-appreciation.html", zh: "英文歌聆聽練習", en: "Song Appreciation" },
    { id: "precise-language", href: "precise-language-system.html", zh: "精準措詞系統", en: "Precise Language" },
    { id: "false-friends", href: "false-friends-system.html", zh: "同形異義詞學習系統", en: "False Friends" },
    { id: "english-in-shows", href: "english-in-shows-system.html", zh: "影視英文學習系統", en: "English in Shows" },
    { id: "ted-talk-english", href: "ted-talk-english-system.html", zh: "Ted Talk 英文學習系統", en: "Ted Talk English" },
    { id: "poem-english", href: "poem-english-system.html", zh: "詩句賞識系統", en: "Poem English" },
    { id: "bookmark-directory", href: "bookmark-directory.html", zh: "學生書簽總目錄", en: "Bookmark Directory" }
  ]);

  const SESSION_KEYS = Object.freeze({
    progress: "edmund-student-progress-session-v1",
    flashcards: "edmundFlashcardSession",
    "writing-submission": "edmund-writing-submission-session-v1",
    speaking: "edmundSpeakingSessionV1",
    listening: "edmund-listening-session-v1",
    sentence: "edmund-sentence-structure-session-v1",
    idioms: "edmund-idiom-system-session-v1",
    proverbs: "edmund-proverb-system-session-v1",
    "phrasal-verbs": "edmund-phrasal-verb-system-session-v1",
    "dse-paper3-analysis": "edmund-dse-paper3-analysis-session-v1",
    "common-expression-speaking": "edmund-common-expression-speaking-session-v1",
    "common-expression-written": "edmund-common-expression-written-session-v1",
    "common-expression-rhetorical-speaking": "edmund-common-expression-rhetorical-speaking-session-v1",
    "common-expression-rhetorical-writing": "edmund-common-expression-rhetorical-writing-session-v1",
    "common-expression-professional-message": "edmund-common-expression-professional-message-session-v1",
    "common-expression-business-speaking": "edmund-common-expression-business-speaking-session-v1",
    quotes: "edmund-learning-portal-quotes-session-v1",
    grammar: "edmund-learning-portal-grammar-session-v1",
    collocation: "edmund-learning-portal-collocation-session-v1",
    "irregular-verb": "edmund-learning-portal-irregular-verb-session-v1",
    "thematic-vocabulary": "edmund-learning-portal-thematic-vocabulary-session-v1",
    "part-of-speech": "edmund-learning-portal-part-of-speech-session-v1",
    synonyms: "edmund-learning-portal-synonyms-session-v1",
    "error-identifier": "edmund-learning-portal-error-identifier-session-v1",
    "learning-roadmap": "edmund-learning-portal-learning-roadmap-session-v1",
    spelling: "edmund-learning-portal-spelling-session-v1",
    "reading-logic": "edmund-learning-portal-reading-logic-session-v1",
    "translation-skills": "edmund-learning-portal-translation-skills-session-v1",
    "business-school": "edmund-learning-portal-business-school-session-v1",
    "complex-questions": "edmund-learning-portal-complex-questions-session-v1",
    "leisurely-reading": "edmund-learning-portal-leisurely-reading-session-v1",
    "english-humour-speaking": "edmund-learning-portal-english-humour-speaking-session-v1",
    "english-humour-writing": "edmund-learning-portal-english-humour-writing-session-v1",
    "english-joke-collection": "edmund-learning-portal-english-joke-collection-session-v1",
    "argument-learning": "edmund-learning-portal-argument-learning-session-v1",
    "fragmented-reading": "edmund-learning-portal-fragmented-reading-session-v1",
    "song-appreciation": "edmund-song-appreciation-session-v1",
    "precise-language": "edmund-learning-portal-precise-language-session-v1",
    "false-friends": "edmund-learning-portal-false-friends-session-v1",
    "english-in-shows": "edmund-learning-portal-english-in-shows-session-v1",
    "ted-talk-english": "edmund-learning-portal-ted-talk-english-session-v1",
    "poem-english": "edmund-learning-portal-poem-english-session-v1",
    "bookmark-directory": "edmund-bookmark-directory-session-v1",
    schedule: "edmund-schedule-session-v1",
    downloads: "edmundModelEssayDownloadSession"
  });

  const LEARNING_PORTAL_IDS = Object.freeze([
    "quotes", "grammar", "collocation", "irregular-verb", "thematic-vocabulary", "part-of-speech",
    "synonyms", "error-identifier", "learning-roadmap", "spelling", "reading-logic", "translation-skills",
    "business-school", "complex-questions", "leisurely-reading", "english-humour-speaking",
    "english-humour-writing", "english-joke-collection", "argument-learning", "fragmented-reading",
    "precise-language", "false-friends", "english-in-shows", "ted-talk-english", "poem-english"
  ]);

  let pomodoroState = null;
  let pomodoroOwnerKey = "";
  let pomodoroTimerId = null;
  let pomodoroNodes = null;
  let pomodoroPageLocked = false;

  function storageJson(storage, key) {
    try {
      return JSON.parse(storage.getItem(key) || "null");
    } catch {
      return null;
    }
  }

  function writeStorageJson(storage, key, value, overwrite = false) {
    try {
      if (!overwrite && storage.getItem(key)) return false;
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function writeStudentSession(storage, key, value, overwrite = false) {
    const existing = storageJson(storage, key);
    if (existing?.role === "admin" || existing?.impersonatedByAdmin === true) return false;
    return writeStorageJson(storage, key, value, overwrite || existing?.role === "student");
  }

  function removeStudentSession(storage, key) {
    try {
      const existing = storageJson(storage, key);
      if (existing?.role === "student" && existing?.impersonatedByAdmin !== true) storage.removeItem(key);
    } catch {
      // Session cleanup is best-effort when storage is unavailable.
    }
  }

  function studentSessionCandidate() {
    let storage;
    try { storage = window.sessionStorage; } catch { return null; }
    const activeSystem = document.querySelector("[data-edmund-system-switcher]")?.dataset.system || "";
    const candidates = {
      progress() {
        const value = storageJson(storage, SESSION_KEYS.progress);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.token && value.name
          ? { token: String(value.token), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      },
      flashcards() {
        const value = storageJson(storage, SESSION_KEYS.flashcards);
        if (value?.role !== "student" || value.impersonatedByAdmin === true || !value.sessionToken || !value.name) return null;
        return {
          token: String(value.sessionToken), id: String(value.id || ""), name: String(value.name), role: "student"
        };
      },
      "writing-submission"() {
        const value = storageJson(storage, SESSION_KEYS["writing-submission"]);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.token && value.name
          ? { token: String(value.token), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      },
      speaking() {
        const value = storageJson(storage, SESSION_KEYS.speaking);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.token && value.name
          ? { token: String(value.token), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      },
      listening() {
        const value = storageJson(storage, SESSION_KEYS.listening);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.token && value.name
          ? { token: String(value.token), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      },
      sentence() {
        const value = storageJson(storage, SESSION_KEYS.sentence);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.token && value.name
          ? { token: String(value.token), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      },
      idioms() {
        const value = storageJson(storage, SESSION_KEYS.idioms);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.token && value.name
          ? { token: String(value.token), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      },
      proverbs() {
        const value = storageJson(storage, SESSION_KEYS.proverbs);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.token && value.name
          ? { token: String(value.token), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      },
      "phrasal-verbs"() {
        const value = storageJson(storage, SESSION_KEYS["phrasal-verbs"]);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.token && value.name
          ? { token: String(value.token), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      },
      "dse-paper3-analysis"() {
        const value = storageJson(storage, SESSION_KEYS["dse-paper3-analysis"]);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.token && value.name
          ? { token: String(value.token), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      },
      "song-appreciation"() {
        const value = storageJson(storage, SESSION_KEYS["song-appreciation"]);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.token && value.name
          ? { token: String(value.token), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      },
      "common-expression-speaking"() {
        return commonExpressionSession("common-expression-speaking");
      },
      "common-expression-written"() {
        return commonExpressionSession("common-expression-written");
      },
      "common-expression-rhetorical-speaking"() {
        return commonExpressionSession("common-expression-rhetorical-speaking");
      },
      "common-expression-rhetorical-writing"() {
        return commonExpressionSession("common-expression-rhetorical-writing");
      },
      "common-expression-professional-message"() {
        return commonExpressionSession("common-expression-professional-message");
      },
      "common-expression-business-speaking"() {
        return commonExpressionSession("common-expression-business-speaking");
      },
      schedule() {
        const value = storageJson(storage, SESSION_KEYS.schedule);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.studentToken && value.name
          ? { token: String(value.studentToken), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      },
      downloads() {
        const value = storageJson(storage, SESSION_KEYS.downloads);
        return value?.role === "student" && value.impersonatedByAdmin !== true && value.sessionToken && value.name
          ? { token: String(value.sessionToken), id: String(value.id || ""), name: String(value.name), role: "student" }
          : null;
      }
    };

    LEARNING_PORTAL_IDS.forEach(systemId => {
      candidates[systemId] = () => commonExpressionSession(systemId);
    });

    function commonExpressionSession(systemId) {
      const value = storageJson(storage, SESSION_KEYS[systemId]);
      return value?.role === "student" && value.impersonatedByAdmin !== true && value.token && value.name
        ? { token: String(value.token), id: String(value.id || ""), name: String(value.name), role: "student" }
        : null;
    }

    const universal = storageJson(storage, UNIVERSAL_SESSION_KEY);
    if (universal?.role === "student" && universal.token && universal.name) return universal;
    const active = candidates[activeSystem]?.();
    if (active) return active;
    return candidates.progress()
      || candidates.flashcards()
      || candidates["writing-submission"]()
      || candidates.speaking()
      || candidates.listening()
      || candidates.sentence()
      || candidates.idioms()
      || candidates.proverbs()
      || candidates["phrasal-verbs"]()
      || candidates["dse-paper3-analysis"]()
      || candidates["song-appreciation"]()
      || candidates.schedule()
      || candidates.downloads()
      || candidates["common-expression-speaking"]()
      || candidates["common-expression-written"]()
      || candidates["common-expression-rhetorical-speaking"]()
      || candidates["common-expression-rhetorical-writing"]()
      || candidates["common-expression-professional-message"]()
      || candidates["common-expression-business-speaking"]()
      || LEARNING_PORTAL_IDS.map(systemId => candidates[systemId]()).find(Boolean)
      || null;
  }

  function rememberStudentSession(value) {
    if (!value || value.role !== "student" || value.impersonatedByAdmin === true || !value.token || !value.name) return false;
    let storage;
    try { storage = window.sessionStorage; } catch { return false; }
    const previous = storageJson(storage, UNIVERSAL_SESSION_KEY);
    const normalized = {
      token: String(value.token),
      id: String(value.id || previous?.id || ""),
      name: String(value.name),
      role: "student"
    };
    writeStorageJson(storage, UNIVERSAL_SESSION_KEY, normalized, true);
    bridgeStudentSession(normalized, true);
    ensurePasswordButton();
    syncPomodoroOwner();
    tickPomodoro();
    return true;
  }

  function forgetStudentSession() {
    try {
      Object.values(SESSION_KEYS).forEach(key => removeStudentSession(window.sessionStorage, key));
      window.sessionStorage.removeItem(UNIVERSAL_SESSION_KEY);
    } catch {
      // The active app still clears its in-memory authentication state.
    }
    try {
      removeStudentSession(window.localStorage, "edmundWritingSession");
    } catch {
      // Writing Practice will also clear its own session during logout.
    }
    ensurePasswordButton();
    syncPomodoroOwner();
    tickPomodoro();
  }

  function bridgeStudentSession(candidate = studentSessionCandidate(), overwrite = false) {
    if (!candidate?.token || !candidate?.name || candidate.role !== "student") return false;
    let storage;
    try { storage = window.sessionStorage; } catch { return false; }

    const universal = {
      token: String(candidate.token),
      id: String(candidate.id || ""),
      name: String(candidate.name),
      role: "student"
    };
    writeStorageJson(storage, UNIVERSAL_SESSION_KEY, universal, true);

    writeStudentSession(storage, SESSION_KEYS.progress, {
      token: universal.token,
      id: universal.id,
      name: universal.name,
      role: "student"
    }, overwrite);

    if (overwrite) {
      try {
        const writing = storageJson(window.localStorage, "edmundWritingSession");
        if (writing?.role === "student" && writing.impersonatedByAdmin !== true && writing.name !== universal.name) {
          window.localStorage.removeItem("edmundWritingSession");
        }
      } catch {
        // Writing Practice can still perform its token exchange on next entry.
      }
    }

    writeStudentSession(storage, SESSION_KEYS["writing-submission"], {
      token: universal.token,
      id: universal.id,
      name: universal.name,
      role: "student"
    }, overwrite);
    writeStudentSession(storage, SESSION_KEYS.speaking, {
      token: universal.token,
      id: universal.id,
      name: universal.name,
      role: "student"
    }, overwrite);
    writeStudentSession(storage, SESSION_KEYS.listening, {
      token: universal.token,
      id: universal.id,
      name: universal.name,
      role: "student"
    }, overwrite);
    writeStudentSession(storage, SESSION_KEYS.sentence, {
      token: universal.token,
      id: universal.id,
      name: universal.name,
      role: "student"
    }, overwrite);
    writeStudentSession(storage, SESSION_KEYS.idioms, {
      token: universal.token,
      id: universal.id,
      name: universal.name,
      role: "student"
    }, overwrite);
    writeStudentSession(storage, SESSION_KEYS.proverbs, {
      token: universal.token,
      id: universal.id,
      name: universal.name,
      role: "student"
    }, overwrite);
    writeStudentSession(storage, SESSION_KEYS["phrasal-verbs"], {
      token: universal.token,
      id: universal.id,
      name: universal.name,
      role: "student"
    }, overwrite);
    writeStudentSession(storage, SESSION_KEYS["dse-paper3-analysis"], {
      token: universal.token,
      id: universal.id,
      name: universal.name,
      role: "student"
    }, overwrite);
    writeStudentSession(storage, SESSION_KEYS["song-appreciation"], {
      token: universal.token,
      id: universal.id,
      name: universal.name,
      role: "student"
    }, overwrite);
    [
      "common-expression-speaking",
      "common-expression-written",
      "common-expression-rhetorical-speaking",
      "common-expression-rhetorical-writing",
      "common-expression-professional-message",
      "common-expression-business-speaking"
    ].forEach(systemId => {
      writeStudentSession(storage, SESSION_KEYS[systemId], {
        token: universal.token,
        id: universal.id,
        name: universal.name,
        role: "student"
      }, overwrite);
    });
    LEARNING_PORTAL_IDS.forEach(systemId => {
      writeStudentSession(storage, SESSION_KEYS[systemId], {
        token: universal.token,
        id: universal.id,
        name: universal.name,
        role: "student"
      }, overwrite);
    });
    writeStudentSession(storage, SESSION_KEYS.schedule, {
      role: "student",
      id: universal.id,
      name: universal.name,
      studentToken: universal.token
    }, overwrite);
    writeStudentSession(storage, SESSION_KEYS.downloads, {
      role: "student",
      id: universal.id,
      name: universal.name,
      sessionToken: universal.token,
      access: {}
    }, overwrite);

    // Flashcard permissions are never trusted from browser storage. Flashcards
    // validates this token through its canonical profile RPC before restoring.
    return true;
  }

  function normaliseSystemSearch(value) {
    return String(value || "")
      .normalize("NFKC")
      .trim()
      .toLocaleLowerCase("zh-Hant-HK");
  }

  function systemMatchesSearch(system, query) {
    const key = normaliseSystemSearch(query);
    if (!key) return true;
    return normaliseSystemSearch(`${system.zh} ${system.en} ${system.id}`).includes(key);
  }

  function normalizePomodoroSettings(value) {
    const source = value && typeof value === "object" ? value : {};
    const bounded = (raw, fallback, min, max) => {
      const parsed = Number(raw);
      return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
    };
    return {
      enabled: source.enabled === true,
      allowSkipBreak: source.allowSkipBreak === true,
      workMinutes: bounded(source.workMinutes, 25, 1, 180),
      shortBreakMinutes: bounded(source.shortBreakMinutes, 5, 1, 60),
      longBreakMinutes: bounded(source.longBreakMinutes, 25, 1, 120),
      sessionsBeforeLongBreak: bounded(source.sessionsBeforeLongBreak, 4, 1, 12),
      taskLabel: String(source.taskLabel || "英文學習").trim().slice(0, 60) || "英文學習"
    };
  }

  function pomodoroPhaseDurationMs(settings, phase) {
    const normalized = normalizePomodoroSettings(settings);
    const minutes = phase === "short-break"
      ? normalized.shortBreakMinutes
      : phase === "long-break"
        ? normalized.longBreakMinutes
        : normalized.workMinutes;
    return minutes * 60000;
  }

  function nextPomodoroPhase(current) {
    const settings = normalizePomodoroSettings(current?.settings);
    const completed = Math.max(0, Number(current?.completedSessions) || 0);
    if (current?.phase === "work") {
      const nextCompleted = completed + 1;
      return {
        phase: nextCompleted % settings.sessionsBeforeLongBreak === 0 ? "long-break" : "short-break",
        completedSessions: nextCompleted
      };
    }
    return { phase: "work", completedSessions: completed };
  }

  function formatPomodoroRemaining(milliseconds) {
    const seconds = Math.max(0, Math.ceil(Number(milliseconds || 0) / 1000));
    const minutes = Math.floor(seconds / 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  }

  function pomodoroIdentity() {
    const student = studentSessionCandidate();
    if (student?.role === "student") return `student:${student.id || student.name || "account"}`;
    try {
      const admin = [...new Set(Object.values(SESSION_KEYS))]
        .map(key => storageJson(window.sessionStorage, key))
        .find(value => value?.role === "admin" && value?.name);
      if (admin) return `admin:${admin.name}`;
    } catch {
      // The guest timer remains available when session storage is blocked.
    }
    return "guest";
  }

  function currentPomodoroStorageKey() {
    // A Pomodoro belongs to this browser tab/device, not to whichever account
    // identity a destination page happens to restore first. Keeping one stable
    // key lets an active timer survive homepage → system navigation and login.
    return POMODORO_DEVICE_STORAGE_KEY;
  }

  function readPomodoroState(storageKey = currentPomodoroStorageKey()) {
    try {
      const value = JSON.parse(window.localStorage.getItem(storageKey) || "null");
      if (!value || typeof value !== "object") return null;
      return {
        settings: normalizePomodoroSettings(value.settings),
        phase: ["work", "short-break", "long-break"].includes(value.phase) ? value.phase : "work",
        completedSessions: Math.max(0, Number(value.completedSessions) || 0),
        endsAt: Number(value.endsAt) || 0
      };
    } catch {
      return null;
    }
  }

  function readPortablePomodoroState() {
    const portable = readPomodoroState(POMODORO_DEVICE_STORAGE_KEY);
    if (portable) return portable;
    try {
      const legacy = [];
      for (let index = 0; index < window.localStorage.length; index += 1) {
        const key = window.localStorage.key(index);
        if (!key || key === POMODORO_DEVICE_STORAGE_KEY || !key.startsWith(`${POMODORO_STORAGE_PREFIX}:`)) continue;
        const value = readPomodoroState(key);
        if (value?.settings?.enabled && value.endsAt) legacy.push({ key, value });
      }
      legacy.sort((left, right) => right.value.endsAt - left.value.endsAt);
      if (!legacy.length) return null;
      window.localStorage.setItem(POMODORO_DEVICE_STORAGE_KEY, JSON.stringify(legacy[0].value));
      return legacy[0].value;
    } catch {
      return null;
    }
  }

  function writePomodoroState() {
    try {
      const storageKey = pomodoroOwnerKey || currentPomodoroStorageKey();
      if (pomodoroState) window.localStorage.setItem(storageKey, JSON.stringify(pomodoroState));
      else window.localStorage.removeItem(storageKey);
    } catch {
      // The active timer continues in memory when persistent storage is unavailable.
    }
  }

  function clearLegacyPomodoroStates() {
    try {
      const staleKeys = [];
      for (let index = 0; index < window.localStorage.length; index += 1) {
        const key = window.localStorage.key(index);
        if (key && key !== POMODORO_DEVICE_STORAGE_KEY && key.startsWith(`${POMODORO_STORAGE_PREFIX}:`)) {
          staleKeys.push(key);
        }
      }
      staleKeys.forEach(key => window.localStorage.removeItem(key));
    } catch {
      // Stopping the in-memory timer still succeeds if storage is unavailable.
    }
  }

  function syncPomodoroOwner() {
    const nextOwnerKey = currentPomodoroStorageKey();
    if (nextOwnerKey === pomodoroOwnerKey) return false;
    setPomodoroPageLocked(false);
    pomodoroOwnerKey = nextOwnerKey;
    pomodoroState = readPortablePomodoroState();
    return true;
  }

  function pomodoroMarkup() {
    return `<dialog class="edmund-pomodoro-dialog" data-edmund-pomodoro-dialog aria-labelledby="edmund-pomodoro-title">
      <form class="edmund-pomodoro-dialog__card" data-edmund-pomodoro-form method="dialog">
        <div class="edmund-pomodoro-dialog__heading">
          <div><p>FOCUS · REST · REPEAT</p><h2 id="edmund-pomodoro-title">番茄鐘工作法</h2></div>
          <img src="assets/schedule/pomodoro-method.png" alt="Pomodoro Method">
        </div>
        <p class="edmund-pomodoro-dialog__intro">把學習分成專注時段與固定休息：預設專注 25 分鐘、短休 5 分鐘；完成四輪後進入長休。設定會跟隨您前往所有 EdmundEducation 學習系統。</p>
        <div class="edmund-pomodoro-dialog__grid">
          <label class="edmund-pomodoro-toggle"><input type="checkbox" data-edmund-pomodoro-enabled><span>啟用番茄鐘</span></label>
          <label class="edmund-pomodoro-toggle"><input type="checkbox" data-edmund-pomodoro-allow-skip><span>允許我在需要時手動略過休息</span></label>
          <label><span>專注分鐘</span><input type="number" min="1" max="180" data-edmund-pomodoro-work></label>
          <label><span>短休分鐘</span><input type="number" min="1" max="60" data-edmund-pomodoro-short-break></label>
          <label><span>長休分鐘</span><input type="number" min="1" max="120" data-edmund-pomodoro-long-break></label>
          <label><span>每幾輪長休</span><input type="number" min="1" max="12" data-edmund-pomodoro-cycles></label>
          <label class="edmund-pomodoro-dialog__task"><span>本輪學習目標</span><input type="text" maxlength="60" data-edmund-pomodoro-task></label>
        </div>
        <p class="edmund-pomodoro-dialog__status" data-edmund-pomodoro-status role="status" aria-live="polite"></p>
        <div class="edmund-pomodoro-dialog__actions"><button type="button" data-edmund-pomodoro-reset>停止並重設</button><button type="button" data-edmund-pomodoro-close>取消</button><button type="submit" data-edmund-pomodoro-save>儲存並開始</button></div>
      </form>
    </dialog>
    <section class="edmund-pomodoro-break-lock" data-edmund-pomodoro-break-lock hidden aria-live="assertive" aria-modal="true" aria-labelledby="edmund-pomodoro-break-title" role="dialog" tabindex="-1">
      <div class="edmund-pomodoro-break-card"><div><p data-edmund-pomodoro-break-kicker>番茄鐘休息時間</p><h2 id="edmund-pomodoro-break-title">Time to take a break!</h2><strong data-edmund-pomodoro-break-countdown>05:00</strong><p>休息倒數完成後，頁面會自動解鎖並開始下一個專注時段。</p><button class="edmund-pomodoro-break-skip" type="button" data-edmund-pomodoro-skip-break hidden>略過休息，繼續學習</button></div><img src="assets/schedule/pomodoro-method.png" alt="Pomodoro Method"></div>
    </section>`;
  }

  function setPomodoroPageLocked(locked) {
    const nextLocked = Boolean(locked && pomodoroNodes?.breakLock);
    if (nextLocked === pomodoroPageLocked) return;
    pomodoroPageLocked = nextLocked;
    document.documentElement.classList.toggle("edmund-pomodoro-page-locked", nextLocked);
    [...document.body.children].forEach(element => {
      if (element === pomodoroNodes?.breakLock) return;
      if (nextLocked) {
        if (!element.inert) {
          element.inert = true;
          element.dataset.edmundPomodoroInert = "true";
        }
      } else if (element.dataset.edmundPomodoroInert === "true") {
        element.inert = false;
        delete element.dataset.edmundPomodoroInert;
      }
    });
    if (nextLocked) {
      if (pomodoroNodes.dialog.open) pomodoroNodes.dialog.close();
      window.setTimeout(() => (pomodoroNodes.skipBreak.hidden ? pomodoroNodes.breakLock : pomodoroNodes.skipBreak).focus(), 0);
    }
  }

  function renderPomodoroHeader() {
    if (!pomodoroNodes) return;
    const running = Boolean(pomodoroState?.settings?.enabled && pomodoroState?.endsAt);
    pomodoroNodes.launchers.forEach((launcher) => {
      launcher.dataset.running = String(running);
      launcher.setAttribute("aria-label", running ? "開啟番茄鐘設定；目前正在倒數" : "開啟番茄鐘工作法設定");
    });
    if (!running) {
      pomodoroNodes.headerTimes.forEach((node) => { node.textContent = "設定計時"; });
      return;
    }
    const labels = { work: "專注", "short-break": "短休", "long-break": "長休" };
    pomodoroNodes.headerTimes.forEach((node) => { node.textContent = `${labels[pomodoroState.phase]} ${formatPomodoroRemaining(pomodoroState.endsAt - Date.now())}`; });
  }

  function tickPomodoro() {
    if (!pomodoroNodes) return;
    syncPomodoroOwner();
    if (!pomodoroState?.settings?.enabled || !pomodoroState.endsAt) {
      pomodoroNodes.breakLock.hidden = true;
      setPomodoroPageLocked(false);
      renderPomodoroHeader();
      return;
    }
    let guard = 0;
    while (Date.now() >= pomodoroState.endsAt && guard < 12) {
      const next = nextPomodoroPhase(pomodoroState);
      pomodoroState.phase = next.phase;
      pomodoroState.completedSessions = next.completedSessions;
      pomodoroState.endsAt += pomodoroPhaseDurationMs(pomodoroState.settings, next.phase);
      guard += 1;
    }
    const onBreak = pomodoroState.phase !== "work";
    pomodoroNodes.breakLock.hidden = !onBreak;
    pomodoroNodes.skipBreak.hidden = !(onBreak && pomodoroState.settings.allowSkipBreak);
    setPomodoroPageLocked(onBreak);
    if (onBreak) {
      pomodoroNodes.breakKicker.textContent = pomodoroState.phase === "long-break"
        ? `完成 ${pomodoroState.settings.sessionsBeforeLongBreak} 輪 · 長休時間`
        : `完成 ${pomodoroState.completedSessions} 輪 · 短休時間`;
      pomodoroNodes.breakCountdown.textContent = formatPomodoroRemaining(pomodoroState.endsAt - Date.now());
    }
    if (guard > 0) writePomodoroState();
    renderPomodoroHeader();
  }

  function populatePomodoroForm() {
    const settings = normalizePomodoroSettings(pomodoroState?.settings || DEFAULT_POMODORO_SETTINGS);
    pomodoroNodes.enabled.checked = settings.enabled;
    pomodoroNodes.allowSkip.checked = settings.allowSkipBreak;
    pomodoroNodes.work.value = settings.workMinutes;
    pomodoroNodes.shortBreak.value = settings.shortBreakMinutes;
    pomodoroNodes.longBreak.value = settings.longBreakMinutes;
    pomodoroNodes.cycles.value = settings.sessionsBeforeLongBreak;
    pomodoroNodes.task.value = settings.taskLabel;
    pomodoroNodes.status.textContent = pomodoroState?.endsAt ? "儲存後會由新的專注時段重新開始。" : "";
    pomodoroNodes.status.dataset.state = "";
  }

  function stopPomodoro() {
    clearLegacyPomodoroStates();
    // Keep a disabled record at the stable device key.  Removing that key would
    // allow a stale account-scoped key from an earlier release to be migrated
    // back into an active timer after refresh.
    pomodoroState = {
      settings: normalizePomodoroSettings(DEFAULT_POMODORO_SETTINGS),
      phase: "work",
      completedSessions: 0,
      endsAt: 0
    };
    writePomodoroState();
    pomodoroNodes.breakLock.hidden = true;
    setPomodoroPageLocked(false);
    renderPomodoroHeader();
  }

  function skipPomodoroBreak() {
    if (!pomodoroState || pomodoroState.phase === "work" || !pomodoroState.settings.allowSkipBreak) return;
    pomodoroState.phase = "work";
    pomodoroState.endsAt = Date.now() + pomodoroPhaseDurationMs(pomodoroState.settings, "work");
    writePomodoroState();
    tickPomodoro();
  }

  function ensurePomodoro() {
    const headerInner = document.querySelector(".edmund-system-header__inner");
    let button = document.querySelector("[data-edmund-pomodoro-header]");
    if (headerInner && !button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "edmund-pomodoro-header-button";
      button.dataset.edmundPomodoroHeader = "";
      button.innerHTML = `<img src="assets/schedule/pomodoro-method.png" alt=""><span><small>番茄鐘工作法</small><strong data-edmund-pomodoro-header-time>設定計時</strong></span>`;
      const switcher = headerInner.querySelector(".edmund-system-switcher");
      if (switcher) {
        switcher.insertAdjacentElement("afterend", button);
      } else {
        headerInner.insertBefore(button, headerInner.firstChild);
      }
    }
    const launchers = [...document.querySelectorAll("[data-edmund-pomodoro-header], [data-edmund-pomodoro-launcher]")];
    if (!launchers.length || document.querySelector("[data-edmund-pomodoro-dialog]")) return;
    document.body.insertAdjacentHTML("beforeend", pomodoroMarkup());
    pomodoroNodes = {
      launchers,
      headerTimes: launchers.map((launcher) => launcher.querySelector("[data-edmund-pomodoro-header-time]")).filter(Boolean),
      dialog: document.querySelector("[data-edmund-pomodoro-dialog]"),
      form: document.querySelector("[data-edmund-pomodoro-form]"),
      enabled: document.querySelector("[data-edmund-pomodoro-enabled]"),
      allowSkip: document.querySelector("[data-edmund-pomodoro-allow-skip]"),
      work: document.querySelector("[data-edmund-pomodoro-work]"),
      shortBreak: document.querySelector("[data-edmund-pomodoro-short-break]"),
      longBreak: document.querySelector("[data-edmund-pomodoro-long-break]"),
      cycles: document.querySelector("[data-edmund-pomodoro-cycles]"),
      task: document.querySelector("[data-edmund-pomodoro-task]"),
      status: document.querySelector("[data-edmund-pomodoro-status]"),
      breakLock: document.querySelector("[data-edmund-pomodoro-break-lock]"),
      breakKicker: document.querySelector("[data-edmund-pomodoro-break-kicker]"),
      breakCountdown: document.querySelector("[data-edmund-pomodoro-break-countdown]"),
      skipBreak: document.querySelector("[data-edmund-pomodoro-skip-break]")
    };
    const openPomodoro = () => {
      syncPomodoroOwner();
      populatePomodoroForm();
      pomodoroNodes.dialog.showModal();
    };
    launchers.forEach((launcher) => launcher.addEventListener("click", openPomodoro));
    pomodoroNodes.open = openPomodoro;
    pomodoroNodes.form.addEventListener("submit", event => {
      event.preventDefault();
      const settings = normalizePomodoroSettings({
        enabled: pomodoroNodes.enabled.checked,
        allowSkipBreak: pomodoroNodes.allowSkip.checked,
        workMinutes: Number(pomodoroNodes.work.value),
        shortBreakMinutes: Number(pomodoroNodes.shortBreak.value),
        longBreakMinutes: Number(pomodoroNodes.longBreak.value),
        sessionsBeforeLongBreak: Number(pomodoroNodes.cycles.value),
        taskLabel: pomodoroNodes.task.value
      });
      if (!settings.enabled) stopPomodoro();
      else {
        pomodoroState = { settings, phase: "work", completedSessions: 0, endsAt: Date.now() + pomodoroPhaseDurationMs(settings, "work") };
        writePomodoroState();
        tickPomodoro();
      }
      pomodoroNodes.dialog.close();
    });
    document.querySelector("[data-edmund-pomodoro-close]").addEventListener("click", () => pomodoroNodes.dialog.close());
    document.querySelector("[data-edmund-pomodoro-reset]").addEventListener("click", () => {
      stopPomodoro();
      populatePomodoroForm();
      pomodoroNodes.status.textContent = "番茄鐘已停止及重設。";
      pomodoroNodes.status.dataset.state = "success";
    });
    pomodoroNodes.skipBreak.addEventListener("click", skipPomodoroBreak);
    syncPomodoroOwner();
    tickPomodoro();
    window.clearInterval(pomodoroTimerId);
    pomodoroTimerId = window.setInterval(tickPomodoro, 250);
    window.addEventListener("storage", event => {
      if (event.key === pomodoroOwnerKey) {
        pomodoroState = readPomodoroState(pomodoroOwnerKey);
        tickPomodoro();
      }
    });
  }

  function localDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function nightReturnWindowKey(now = new Date()) {
    const hour = now.getHours();
    if (hour >= 21) return localDateKey(now);
    if (hour < 2) {
      const previous = new Date(now);
      previous.setDate(previous.getDate() - 1);
      return localDateKey(previous);
    }
    return "";
  }

  function ensureNightReturnPrompt() {
    if (document.querySelector("[data-edmund-night-return]")) return;
    document.body.insertAdjacentHTML("beforeend", `<dialog class="edmund-night-return" data-edmund-night-return aria-labelledby="edmund-night-return-title"><section><div class="edmund-night-return__art" aria-hidden="true">🌙<span>🐴</span></div><p>EDDY IS WAITING FOR YOU</p><h2 id="edmund-night-return-title">明天您還會過來網站探望 Eddy 和他的朋友嗎？</h2><div><button type="button" data-night-return-answer>會的! 今天我會過來探望 Eddy 和他的朋友!</button><button type="button" data-night-return-answer>明天休息一下先, 之後再來~</button></div></section></dialog>`);
    const dialog = document.querySelector("[data-edmund-night-return]");
    let pendingLogout = null;
    let bypassLogout = false;
    const seenKey = (windowKey) => `${NIGHT_RETURN_STORAGE_PREFIX}:seen:${pomodoroIdentity()}:${windowKey}`;
    const pendingKey = `${NIGHT_RETURN_STORAGE_PREFIX}:pending:${pomodoroIdentity()}`;
    const show = (logoutTarget = null) => {
      const windowKey = nightReturnWindowKey();
      if (!windowKey || !studentSessionCandidate() || window.localStorage.getItem(seenKey(windowKey))) return false;
      pendingLogout = logoutTarget;
      dialog.dataset.windowKey = windowKey;
      window.localStorage.setItem(seenKey(windowKey), "1");
      window.localStorage.removeItem(pendingKey);
      dialog.showModal();
      return true;
    };
    dialog.querySelectorAll("[data-night-return-answer]").forEach((answer) => answer.addEventListener("click", () => {
      const windowKey = dialog.dataset.windowKey;
      window.localStorage.removeItem(pendingKey);
      dialog.close();
      const target = pendingLogout;
      pendingLogout = null;
      if (target) {
        bypassLogout = true;
        target.click();
        window.setTimeout(() => { bypassLogout = false; }, 0);
      }
    }));
    dialog.addEventListener("cancel", (event) => event.preventDefault());
    document.addEventListener("click", (event) => {
      const logout = event.target.closest?.("[data-logout], [data-action='logout']");
      if (!logout || bypassLogout || !show(logout)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
    let internalNavigation = false;
    document.addEventListener("click", (event) => {
      const link = event.target.closest?.("a[href]");
      if (!link) return;
      try { internalNavigation = new URL(link.href, location.href).origin === location.origin; } catch { internalNavigation = false; }
    }, true);
    window.addEventListener("pagehide", () => {
      const windowKey = nightReturnWindowKey();
      if (windowKey && !internalNavigation && !window.localStorage.getItem(seenKey(windowKey))) window.localStorage.setItem(pendingKey, windowKey);
    });
    const pending = window.localStorage.getItem(pendingKey);
    if (pending && pending === nightReturnWindowKey()) window.setTimeout(() => show(), 450);
  }

  function systemsMatching(query) {
    return SYSTEMS.filter(system => systemMatchesSearch(system, query));
  }

  function menuHtml(currentSystem) {
    const links = SYSTEMS.map(system => {
      const current = system.id === currentSystem;
      const homepageClass = Number.isInteger(system.homepageCard) ? " edmund-system-switcher__link--homepage" : "";
      const homepageAttribute = Number.isInteger(system.homepageCard) ? ` data-homepage-card="${system.homepageCard}"` : "";
      return `<a class="edmund-system-switcher__link${homepageClass}"${homepageAttribute} data-system-id="${system.id}" href="${system.href}"${current ? ' aria-current="page"' : ""}>
        <strong>${system.zh}</strong><small>${system.en}</small>
      </a>`;
    }).join("");
    return `<nav class="edmund-system-switcher__menu" aria-label="EdmundEducation 系統快速切換">
      <div class="edmund-system-switcher__menu-heading"><strong>快速切換系統</strong><span>Quick switch</span></div>
      <label class="edmund-system-switcher__search">
        <span aria-hidden="true">⌕</span>
        <input type="search" data-system-switcher-search autocomplete="off" spellcheck="false" aria-label="搜尋學習系統" placeholder="搜尋中文或英文名稱">
        <button type="button" data-system-switcher-search-clear aria-label="清除系統搜尋" hidden>×</button>
      </label>
      <p class="edmund-system-switcher__search-status" data-system-switcher-search-status role="status" aria-live="polite">共 ${SYSTEMS.length} 個系統</p>
      <div class="edmund-system-switcher__links">${links}</div>
      <p class="edmund-system-switcher__empty" data-system-switcher-empty hidden>找不到相符的學習系統。</p>
      <a class="edmund-system-switcher__home" href="index.html">返回 EdmundEducation 首頁</a>
    </nav>`;
  }

  function filterSwitcherLinks(switcher, query) {
    const key = normaliseSystemSearch(query);
    const links = [...switcher.querySelectorAll(".edmund-system-switcher__link")];
    let matchCount = 0;
    links.forEach(link => {
      const system = SYSTEMS.find(item => item.id === link.dataset.systemId);
      const matched = Boolean(system && systemMatchesSearch(system, key));
      link.hidden = !matched;
      if (matched) matchCount += 1;
    });
    const status = switcher.querySelector("[data-system-switcher-search-status]");
    if (status) status.textContent = key ? `找到 ${matchCount} 個系統` : `共 ${links.length} 個系統`;
    const empty = switcher.querySelector("[data-system-switcher-empty]");
    if (empty) empty.hidden = matchCount !== 0;
    const clear = switcher.querySelector("[data-system-switcher-search-clear]");
    if (clear) clear.hidden = !key;
    return matchCount;
  }

  function closeSwitcher(switcher, returnFocus = false) {
    window.clearTimeout(Number(switcher.dataset.closeTimer || 0));
    switcher.dataset.open = "false";
    switcher.dataset.pinned = "false";
    const trigger = switcher.querySelector("[data-system-switcher-trigger]");
    trigger?.setAttribute("aria-expanded", "false");
    if (returnFocus && trigger) {
      switcher.dataset.suppressFocusOpen = "true";
      trigger.focus();
      window.setTimeout(() => { switcher.dataset.suppressFocusOpen = "false"; }, 0);
    }
  }

  function openSwitcher(switcher, { pinned = false } = {}) {
    window.clearTimeout(Number(switcher.dataset.closeTimer || 0));
    switcher.dataset.open = "true";
    if (pinned) switcher.dataset.pinned = "true";
    switcher.querySelector("[data-system-switcher-trigger]")?.setAttribute("aria-expanded", "true");
  }

  function scheduleClose(switcher) {
    window.clearTimeout(Number(switcher.dataset.closeTimer || 0));
    const timer = window.setTimeout(() => {
      if (switcher.dataset.pinned === "true") return;
      if (!switcher.matches(":hover") && !switcher.contains(document.activeElement)) closeSwitcher(switcher);
    }, 110);
    switcher.dataset.closeTimer = String(timer);
  }

  function enhanceSwitcher(switcher, index) {
    const currentSystem = String(switcher.dataset.system || "");
    const trigger = switcher.querySelector("[data-system-switcher-trigger]");
    if (!trigger || !SYSTEMS.some(system => system.id === currentSystem)) return;
    const menuId = `edmund-system-menu-${index + 1}`;
    switcher.insertAdjacentHTML("beforeend", menuHtml(currentSystem));
    switcher.insertAdjacentHTML("beforeend", `<a class="edmund-system-switcher__homebase" href="schedule-system.html" aria-label="快速返回 - 溫習營地"${currentSystem === "schedule" ? ' aria-current="page"' : ""}>快速返回 <span aria-hidden="true">-</span> 溫習營地</a>`);
    const menu = switcher.querySelector(".edmund-system-switcher__menu");
    const homebase = switcher.querySelector(".edmund-system-switcher__homebase");
    menu.id = menuId;
    trigger.setAttribute("aria-controls", menuId);
    trigger.setAttribute("aria-haspopup", "true");
    trigger.setAttribute("aria-expanded", "false");
    switcher.dataset.open = "false";
    switcher.dataset.pinned = "false";

    const search = switcher.querySelector("[data-system-switcher-search]");
    const clearSearch = switcher.querySelector("[data-system-switcher-search-clear]");
    search?.addEventListener("input", () => filterSwitcherLinks(switcher, search.value));
    clearSearch?.addEventListener("click", () => {
      search.value = "";
      filterSwitcherLinks(switcher, "");
      search.focus();
    });

    trigger.addEventListener("click", () => {
      if (switcher.dataset.pinned === "true") closeSwitcher(switcher);
      else openSwitcher(switcher, { pinned: true });
    });
    trigger.addEventListener("pointerenter", event => {
      if (event.pointerType === "mouse") openSwitcher(switcher);
    });
    homebase?.addEventListener("pointerenter", event => {
      if (event.pointerType === "mouse" && switcher.dataset.pinned !== "true") closeSwitcher(switcher);
    });
    switcher.addEventListener("pointerleave", event => {
      if (event.pointerType === "mouse") scheduleClose(switcher);
    });
    switcher.addEventListener("focusin", event => {
      if (homebase?.contains(event.target) && switcher.dataset.pinned !== "true") closeSwitcher(switcher);
      else if (switcher.dataset.suppressFocusOpen !== "true") openSwitcher(switcher);
    });
    switcher.addEventListener("focusout", () => scheduleClose(switcher));
    switcher.querySelectorAll("a[href]").forEach(link => {
      link.addEventListener("click", () => bridgeStudentSession(studentSessionCandidate(), true));
    });
  }

  let passwordClient = null;

  function passwordDialogMarkup() {
    return `<dialog class="edmund-password-dialog" data-edmund-password-dialog aria-labelledby="edmund-password-title">
      <form class="edmund-password-dialog__card" data-edmund-password-form novalidate>
        <div class="edmund-password-dialog__heading">
          <p>ACCOUNT SECURITY</p>
          <h2 id="edmund-password-title">更改用戶系統 Password</h2>
          <span>密碼會以單向加密方式儲存；任何管理員都不能查看目前密碼。</span>
        </div>
        <label><span>目前密碼</span><input name="currentPassword" type="password" autocomplete="current-password" maxlength="200" required></label>
        <label><span>新密碼（最少 8 個字元）</span><input name="newPassword" type="password" autocomplete="new-password" minlength="8" maxlength="200" required></label>
        <label><span>再次輸入新密碼</span><input name="confirmPassword" type="password" autocomplete="new-password" minlength="8" maxlength="200" required></label>
        <p class="edmund-password-dialog__status" data-edmund-password-status role="status" aria-live="polite"></p>
        <div class="edmund-password-dialog__actions">
          <button type="button" data-edmund-password-cancel>取消</button>
          <button type="submit" data-edmund-password-submit>儲存新密碼</button>
        </div>
      </form>
    </dialog>`;
  }

  function ensurePasswordSupabase() {
    if (passwordClient) return passwordClient;
    const configuration = window.EDMUND_SUPABASE || {};
    if (!window.supabase?.createClient || !configuration.url || !configuration.anonKey) {
      throw new Error("密碼服務暫時未能載入，請重新整理頁面。");
    }
    passwordClient = window.supabase.createClient(configuration.url, configuration.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    });
    return passwordClient;
  }

  async function ensurePasswordSupabaseSession() {
    const client = ensurePasswordSupabase();
    const current = await client.auth.getSession();
    if (current.error) throw current.error;
    if (current.data?.session?.user?.id) return client;
    const signIn = await client.auth.signInAnonymously();
    if (signIn.error) throw signIn.error;
    if (!signIn.data?.session?.user?.id) throw new Error("未能建立安全連線。");
    return client;
  }

  function ensurePasswordDialog() {
    let dialog = document.querySelector("[data-edmund-password-dialog]");
    if (dialog) return dialog;
    document.body.insertAdjacentHTML("beforeend", passwordDialogMarkup());
    dialog = document.querySelector("[data-edmund-password-dialog]");
    const form = dialog.querySelector("[data-edmund-password-form]");
    const status = dialog.querySelector("[data-edmund-password-status]");
    dialog.querySelector("[data-edmund-password-cancel]").addEventListener("click", () => dialog.close());
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const candidate = studentSessionCandidate();
      const data = new FormData(form);
      const currentPassword = String(data.get("currentPassword") || "");
      const newPassword = String(data.get("newPassword") || "");
      const confirmation = String(data.get("confirmPassword") || "");
      if (!candidate?.token) {
        status.textContent = "登入已失效，請重新登入。";
        status.dataset.state = "error";
        return;
      }
      if (!currentPassword || newPassword.length < 8 || newPassword !== confirmation) {
        status.textContent = "請輸入目前密碼；新密碼最少 8 個字元，而且兩次輸入必須相同。";
        status.dataset.state = "error";
        return;
      }
      const submit = dialog.querySelector("[data-edmund-password-submit]");
      submit.disabled = true;
      status.textContent = "正在安全地更新密碼…";
      status.dataset.state = "";
      try {
        const client = await ensurePasswordSupabaseSession();
        const { data: rows, error } = await client.rpc("shared_student_change_password", {
          p_token: candidate.token,
          p_current_password: currentPassword,
          p_new_password: newPassword
        });
        if (error) throw error;
        const next = Array.isArray(rows) ? rows[0] : null;
        if (!next?.session_token || !next?.name) throw new Error("未能建立更新後的登入。");
        rememberStudentSession({
          token: next.session_token,
          id: next.id || candidate.id,
          name: next.name,
          role: "student"
        });
        status.textContent = "密碼已更新；其他裝置的舊登入已失效。頁面即將重新載入。";
        status.dataset.state = "success";
        window.setTimeout(() => window.location.reload(), 900);
      } catch (error) {
        console.warn("Shared student password change failed", error);
        status.textContent = String(error?.message || "未能更新密碼，請再試一次。");
        status.dataset.state = "error";
        submit.disabled = false;
      }
    });
    return dialog;
  }

  function ensurePasswordButton() {
    const candidate = studentSessionCandidate();
    const existing = document.querySelector("[data-change-password], [data-edmund-change-password]");
    if (existing) {
      if (existing.matches("[data-edmund-change-password]")) existing.hidden = !candidate;
      return existing;
    }
    const actions = document.querySelector(".edmund-system-header__actions");
    if (!actions) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "edmund-system-password-button";
    button.dataset.edmundChangePassword = "";
    button.textContent = "更改用戶系統 Password";
    button.hidden = !candidate;
    button.addEventListener("click", () => {
      const dialog = ensurePasswordDialog();
      const form = dialog.querySelector("[data-edmund-password-form]");
      form.reset();
      const status = dialog.querySelector("[data-edmund-password-status]");
      status.textContent = "";
      status.dataset.state = "";
      dialog.showModal();
      window.setTimeout(() => form.elements.currentPassword.focus(), 0);
    });
    const logout = actions.querySelector("[data-logout], [data-action=logout]");
    actions.insertBefore(button, logout || null);
    return button;
  }

  function initialise() {
    bridgeStudentSession(studentSessionCandidate(), true);
    ensurePasswordButton();
    const switchers = [...document.querySelectorAll("[data-edmund-system-switcher]")];
    switchers.forEach(enhanceSwitcher);
    ensurePomodoro();
    ensureNightReturnPrompt();

    document.addEventListener("pointerdown", event => {
      switchers.forEach(switcher => {
        if (!switcher.contains(event.target)) closeSwitcher(switcher);
      });
    });
    document.addEventListener("focusin", event => {
      switchers.forEach(switcher => {
        if (!switcher.contains(event.target)) closeSwitcher(switcher);
      });
    });
    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      const open = switchers.find(switcher => switcher.dataset.open === "true");
      if (open) {
        event.preventDefault();
        closeSwitcher(open, true);
      }
    });
  }

  window.EdmundSystemNav = Object.freeze({
    bridgeStudentSession,
    forgetStudentSession,
    getStudentSession: studentSessionCandidate,
    pomodoro: Object.freeze({
      formatRemaining: formatPomodoroRemaining,
      nextPhase: nextPomodoroPhase,
      normalizeSettings: normalizePomodoroSettings,
      refreshOwner: () => {
        syncPomodoroOwner();
        tickPomodoro();
      },
      open: () => pomodoroNodes?.open?.()
    }),
    searchSystems: systemsMatching,
    rememberStudentSession,
    systems: SYSTEMS
  });

  // Run the session bridge synchronously so app scripts later in the document
  // can restore a compatible same-origin student session immediately.
  bridgeStudentSession(studentSessionCandidate(), true);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialise, { once: true });
  else initialise();
})();
