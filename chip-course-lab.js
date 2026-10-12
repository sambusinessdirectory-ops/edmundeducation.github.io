(() => {
  "use strict";

  const simulator = window.ChipCourseSimulator;
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

  function stopRun() {
    if (timer !== null) clearInterval(timer);
    timer = null;
    runButton.disabled = false;
  }

  function say(text, kind = "") {
    status.textContent = text;
    status.className = "lab-status" + (kind ? " is-" + kind : "");
  }

  function draw() {
    light.classList.toggle("is-on", led === 1);
    lightLabel.textContent = led ? "LED ON" : "LED OFF";
    traceBody.replaceChildren();
    for (const row of trace.slice(-30)) {
      const tr = document.createElement("tr");
      for (const value of [row.label, row.enable ? "On" : "Off", row.led ? "On" : "Off"]) {
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
    say("Design error: " + error.message, "error");
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
      say("Reset complete. Click One clock beat to move forward.");
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
      say(count === 1 ? "One clock beat finished." : count + " clock beats finished.");
    } catch (error) {
      fail(error);
    }
  }

  function runEight() {
    stopRun();
    try {
      compileCurrent();
      runButton.disabled = true;
      say("Blinking now: two clock beats each second.");
      let remaining = 8;
      timer = setInterval(() => {
        try {
          advanceOne();
          remaining--;
          if (remaining === 0) {
            stopRun();
            say("Eight clock beats finished.");
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
        say("PASS: the LED turns on, off, stays off when disabled, and resets.", "pass");
      } else {
        const first = result.checks.find(row => !row.passed);
        say("CHECK FAILED at " + first.label + ": expected LED " +
          (first.expected ? "ON" : "OFF") + ", got " +
          (first.actual ? "ON" : "OFF") + ".", "error");
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
    say("Design changed. Click Reset or Check design to run the new rules.");
  });

  window.ChipCourseLab = { load, clear };
})();
