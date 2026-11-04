(() => {
  "use strict";

  const simulator = window.ChipCourseSimulator;
  const i18n = window.ChipCourseI18n;
  const editor = document.getElementById("design-editor");
  const enableSwitch = document.getElementById("enable-switch");
  const light = document.getElementById("led-light");
  const lightLabel = document.getElementById("led-state");
  const status = document.getElementById("lab-status");
  const traceBody = document.getElementById("lab-trace");
  const runButton = document.getElementById("run-design");
  let exampleSource = "";
  let activeSource = "";
  let design = null;
  let led = 0;
  let beat = 0;
  let trace = [];
  let timer = null;
  let lastStatus = null;

  function stopRun() {
    if (timer !== null) clearInterval(timer);
    timer = null;
    runButton.disabled = false;
  }

  function say(key, kind = "", ...args) {
    lastStatus = key ? { key, kind, args } : null;
    if (key === "designError") status.textContent = i18n.t(key, i18n.t(args[0]));
    else if (key === "checkFailed") status.textContent = i18n.t(key, rowLabel(args[0]), i18n.t(args[1] ? "on" : "off"), i18n.t(args[2] ? "on" : "off"));
    else status.textContent = key ? i18n.t(key, ...args) : "";
    status.className = "lab-status" + (kind ? " is-" + kind : "");
  }

  function rowLabel(label) {
    if (label === "Reset") return i18n.t("resetRow");
    if (label === "Reset again") return i18n.t("resetAgainRow");
    if (label === "Disabled") return i18n.t("disabledRow");
    const match = /^Clock (\d+)$/.exec(label);
    return match ? i18n.t("clockRow", Number(match[1])) : label;
  }

  function parserErrorKey(error) {
    const detail = error?.message || "";
    if (detail.startsWith("Unsupported code")) return "errorUnsupported";
    if (detail.startsWith("Expected ")) return "errorExpected";
    if (detail.startsWith("Use only ")) return "errorSignals";
    if (detail.startsWith("A begin block")) return "errorBeginEnd";
    if (detail.startsWith("This lesson supports")) return "errorOneBlock";
    if (detail.startsWith("Keep the design under")) return "errorTooLong";
    if (detail.startsWith("Start with module")) return "errorHeader";
    if (detail.startsWith("Keep the four")) return "errorPins";
    if (detail.startsWith("Use the lesson clock")) return "errorClock";
    if (detail.startsWith("Finish the design")) return "errorFooter";
    return "errorUnsupported";
  }

  function draw() {
    light.classList.toggle("is-on", led === 1);
    lightLabel.textContent = i18n.t(led ? "ledOn" : "ledOff");
    traceBody.replaceChildren();
    for (const row of trace.slice(-30)) {
      const tr = document.createElement("tr");
      for (const value of [rowLabel(row.label), i18n.t(row.enable ? "on" : "off"), i18n.t(row.led ? "on" : "off")]) {
        const td = document.createElement("td");
        td.textContent = value;
        tr.append(td);
      }
      traceBody.append(tr);
    }
  }

  function fail(error) {
    stopRun();
    design = null;
    activeSource = "";
    led = 0;
    beat = 0;
    trace = [];
    draw();
    say("designError", "error", parserErrorKey(error));
  }

  function compileCurrent() {
    if (design && activeSource === editor.value) return design;
    const next = simulator.compile(editor.value);
    design = next;
    activeSource = editor.value;
    led = design.step({ led: 0, reset_n: 0, enable: 0 });
    beat = 0;
    trace = [{ label: "Reset", enable: 0, led }];
    draw();
    return design;
  }

  function reset() {
    stopRun();
    design = null;
    activeSource = "";
    try {
      compileCurrent();
      say("resetComplete");
    } catch (error) {
      fail(error);
    }
  }

  function advanceOne() {
    const program = compileCurrent();
    const enable = enableSwitch.checked ? 1 : 0;
    led = program.step({ led, reset_n: 1, enable });
    beat++;
    trace.push({ label: "Clock " + beat, enable, led });
    draw();
  }

  function runBeats(count) {
    stopRun();
    try {
      for (let i = 0; i < count; i++) advanceOne();
      say(count === 1 ? "oneBeatFinished" : "beatsFinished", "", count);
    } catch (error) {
      fail(error);
    }
  }

  function runEight() {
    stopRun();
    try {
      compileCurrent();
      runButton.disabled = true;
      say("blinkingNow");
      let remaining = 8;
      timer = setInterval(() => {
        try {
          advanceOne();
          remaining--;
          if (remaining === 0) {
            stopRun();
            say("eightFinished");
          }
        } catch (error) {
          fail(error);
        }
      }, 500);
    } catch (error) {
      fail(error);
    }
  }

  function runCheck() {
    stopRun();
    try {
      const result = simulator.check(editor.value);
      design = simulator.compile(editor.value);
      activeSource = editor.value;
      trace = result.trace;
      led = trace[trace.length - 1].led;
      beat = 0;
      draw();
      if (result.passed) {
        say("pass", "pass");
      } else {
        const first = result.checks.find(row => !row.passed);
        say("checkFailed", "error", first.label, first.expected, first.actual);
      }
    } catch (error) {
      fail(error);
    }
  }

  function load(source) {
    exampleSource = source || "";
    editor.value = exampleSource;
    enableSwitch.checked = true;
    reset();
  }

  function clear() {
    stopRun();
    exampleSource = "";
    editor.value = "";
    design = null;
    activeSource = "";
    led = 0;
    beat = 0;
    trace = [];
    draw();
    say("");
  }

  document.getElementById("restore-design").addEventListener("click", () => {
    editor.value = exampleSource;
    reset();
  });
  document.getElementById("save-design").addEventListener("click", () => {
    const blob = new Blob([editor.value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "led_blinker.v";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  document.getElementById("reset-design").addEventListener("click", reset);
  document.getElementById("step-design").addEventListener("click", () => runBeats(1));
  runButton.addEventListener("click", runEight);
  document.getElementById("check-design").addEventListener("click", runCheck);
  editor.addEventListener("input", () => {
    stopRun();
    say("designChanged");
  });

  document.addEventListener("chip-course-language-change", () => {
    draw();
    if (lastStatus) say(lastStatus.key, lastStatus.kind, ...lastStatus.args);
  });

  draw();
  window.ChipCourseLab = { load, clear };
})();
