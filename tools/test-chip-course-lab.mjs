import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const simulator = require("../chip-course-simulator.js");
const example = `module led_blinker (
    input wire clk,
    input wire reset_n,
    input wire enable,
    output reg led
);
    always @(posedge clk or negedge reset_n) begin
        if (!reset_n)
            led <= 1'b0;
        else if (enable)
            led <= ~led;
        else
            led <= 1'b0;
    end
endmodule
`;

test("the edited design changes the browser check", () => {
  const original = simulator.check(example);
  assert.equal(original.passed, true);
  assert.deepEqual(original.trace.map(row => row.led), [0, 1, 0, 0, 1, 0]);

  const stuck = example.replace("led <= ~led;", "led <= led;");
  assert.equal(simulator.check(stuck).checks[1].passed, false);

  const disabledOn = example.replace(/else\s+led <= 1'b0;/, "else led <= 1'b1;");
  assert.equal(simulator.check(disabledOn).checks[3].passed, false);

  const commented = "// one bit of memory\n" + example.replace("led <= ~led;", "led <= ~led; // flip the light");
  assert.equal(simulator.check(commented).passed, true);

  assert.throws(() => simulator.compile(example + "alert(1)"), /endmodule/);
  assert.throws(() => simulator.compile(example.replace("led <= ~led;", "led <= mystery;")), /Use only/);
});

test("the course buttons run, check, restore, and clear the design", () => {
  const nodes = new Map();
  const downloads = [];
  function element() {
    const classes = new Set();
    return {
      value: "", textContent: "", checked: false, className: "",
      children: [], handlers: {},
      classList: {
        toggle(name, on) { if (on) classes.add(name); else classes.delete(name); },
        contains(name) { return classes.has(name); }
      },
      addEventListener(name, handler) { this.handlers[name] = handler; },
      append(child) { this.children.push(child); },
      replaceChildren(...children) { this.children = children; },
      click() { if (this.handlers.click) this.handlers.click(); else downloads.push(this); }
    };
  }
  const document = {
    getElementById(id) { if (!nodes.has(id)) nodes.set(id, element()); return nodes.get(id); },
    createElement() { return element(); }
  };
  const window = { ChipCourseSimulator: simulator };
  const urls = { createObjectURL() { return "blob:test"; }, revokeObjectURL() {} };
  const intervals = [];
  const source = readFileSync(new URL("../chip-course-lab.js", import.meta.url), "utf8");
  vm.runInNewContext(source, {
    window, document, Blob, URL: urls, setTimeout() {},
    setInterval(handler) { intervals.push(handler); return intervals.length; },
    clearInterval() {}
  });

  window.ChipCourseLab.load(example);
  assert.equal(nodes.get("led-state").textContent, "LED OFF");
  nodes.get("step-design").click();
  assert.equal(nodes.get("led-state").textContent, "LED ON");
  nodes.get("step-design").click();
  assert.equal(nodes.get("led-state").textContent, "LED OFF");

  nodes.get("design-editor").value = example.replace("led <= ~led;", "led <= led;");
  nodes.get("check-design").click();
  assert.match(nodes.get("lab-status").textContent, /CHECK FAILED at Clock 1/);
  nodes.get("restore-design").click();
  nodes.get("check-design").click();
  assert.match(nodes.get("lab-status").textContent, /^PASS:/);

  nodes.get("reset-design").click();
  nodes.get("run-design").click();
  assert.equal(nodes.get("run-design").disabled, true);
  intervals[0]();
  assert.equal(nodes.get("led-state").textContent, "LED ON");
  for (let i = 1; i < 8; i++) intervals[0]();
  assert.equal(nodes.get("led-state").textContent, "LED OFF");
  assert.equal(nodes.get("run-design").disabled, false);
  assert.equal(nodes.get("lab-trace").children.length, 9);

  nodes.get("save-design").click();
  assert.equal(downloads[0].download, "led_blinker.v");
  window.ChipCourseLab.clear();
  assert.equal(nodes.get("design-editor").value, "");
  assert.equal(nodes.get("lab-trace").children.length, 0);
});
