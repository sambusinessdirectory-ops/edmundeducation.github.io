(() => {
  "use strict";

  // This is a deliberately small interpreter for the Lesson 1 Verilog subset.
  // It reads the edited code; it never runs arbitrary JavaScript or full Verilog.
  const expectedPorts = [
    "inputwireclk",
    "inputwirereset_n",
    "inputwireenable",
    "outputregled"
  ];

  function tokensFor(body) {
    const tokens = [];
    const pattern = /\s+|1'b[01]|<=|[()~!;&|^]|[A-Za-z_][A-Za-z_0-9]*/y;
    let position = 0;
    while (position < body.length) {
      pattern.lastIndex = position;
      const match = pattern.exec(body);
      if (!match) throw new SyntaxError("Unsupported code near: " + body.slice(position, position + 24).trim());
      if (!/^\s+$/.test(match[0])) tokens.push(match[0]);
      position = pattern.lastIndex;
    }
    return tokens;
  }

  function parse(tokens) {
    let index = 0;
    const peek = () => tokens[index];
    function take(wanted) {
      const actual = tokens[index++];
      if (actual !== wanted) throw new SyntaxError("Expected " + wanted + " near " + (actual || "the end") + ".");
    }
    function primary() {
      const token = peek();
      if (token === "(") {
        take("(");
        const value = expression();
        take(")");
        return value;
      }
      if (token === "1'b0" || token === "1'b1") {
        index++;
        return { kind: "bit", value: token === "1'b1" ? 1 : 0 };
      }
      if (["led", "enable", "reset_n"].includes(token)) {
        index++;
        return { kind: "signal", name: token };
      }
      throw new SyntaxError("Use only led, enable, reset_n, 1'b0, or 1'b1 in a rule.");
    }
    function unary() {
      if (peek() === "!" || peek() === "~") {
        const operator = tokens[index++];
        return { kind: "not", operator, child: unary() };
      }
      return primary();
    }
    function chain(next, operators) {
      let left = next();
      while (operators.includes(peek())) {
        const operator = tokens[index++];
        left = { kind: "binary", operator, left, right: next() };
      }
      return left;
    }
    const and = () => chain(unary, ["&"]);
    const xor = () => chain(and, ["^"]);
    const expression = () => chain(xor, ["|"]);

    function statement() {
      if (peek() === "begin") {
        take("begin");
        const children = [];
        while (peek() !== "end") {
          if (!peek()) throw new SyntaxError("A begin block needs an end.");
          children.push(statement());
        }
        take("end");
        return { kind: "block", children };
      }
      if (peek() === "if") {
        take("if");
        take("(");
        const condition = expression();
        take(")");
        const yes = statement();
        let no = null;
        if (peek() === "else") {
          take("else");
          no = statement();
        }
        return { kind: "if", condition, yes, no };
      }
      take("led");
      take("<=");
      const value = expression();
      take(";");
      return { kind: "assign", value };
    }

    const tree = statement();
    if (index !== tokens.length) throw new SyntaxError("This lesson supports one always block only.");
    return tree;
  }

  function valueOf(node, signals) {
    if (node.kind === "bit") return node.value;
    if (node.kind === "signal") return signals[node.name];
    if (node.kind === "not") return valueOf(node.child, signals) ^ 1;
    const left = valueOf(node.left, signals);
    const right = valueOf(node.right, signals);
    if (node.operator === "&") return left & right;
    if (node.operator === "^") return left ^ right;
    return left | right;
  }

  function execute(node, signals, result) {
    if (node.kind === "block") {
      for (const child of node.children) execute(child, signals, result);
    } else if (node.kind === "if") {
      const branch = valueOf(node.condition, signals) ? node.yes : node.no;
      if (branch) execute(branch, signals, result);
    } else {
      result.led = valueOf(node.value, signals);
    }
  }

  function compile(source) {
    if (typeof source !== "string" || source.length > 12000) {
      throw new SyntaxError("Keep the design under 12,000 characters.");
    }
    const clean = source.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");
    const header = /^\s*module\s+led_blinker\s*\(([\s\S]*?)\)\s*;/.exec(clean);
    if (!header) throw new SyntaxError("Start with module led_blinker and its four lesson pins.");
    const ports = header[1].split(",").map(part => part.replace(/\s+/g, ""));
    if (ports.length !== 4 || ports.some((port, i) => port !== expectedPorts[i])) {
      throw new SyntaxError("Keep the four lesson pins: clk, reset_n, enable, and led.");
    }
    const afterHeader = clean.slice(header[0].length);
    const always = /^\s*always\s*@\s*\(\s*posedge\s+clk\s+or\s+negedge\s+reset_n\s*\)/.exec(afterHeader);
    if (!always) throw new SyntaxError("Use the lesson clock and reset line in the always block.");
    const afterAlways = afterHeader.slice(always[0].length);
    const footer = /\bendmodule\s*;?\s*$/.exec(afterAlways);
    if (!footer) throw new SyntaxError("Finish the design with endmodule.");
    const body = afterAlways.slice(0, footer.index);
    const tree = parse(tokensFor(body));
    return {
      step(signals) {
        const inputs = {
          led: Number(signals.led) & 1,
          reset_n: Number(signals.reset_n) & 1,
          enable: Number(signals.enable) & 1
        };
        const result = { led: inputs.led };
        execute(tree, inputs, result);
        return result.led;
      }
    };
  }

  function check(source) {
    const design = compile(source);
    const trace = [];
    const checks = [];
    let led = 0;
    function beat(label, reset_n, enable, expected) {
      led = design.step({ led, reset_n, enable });
      trace.push({ label, reset_n, enable, led });
      checks.push({ label, expected, actual: led, passed: led === expected });
    }
    beat("Reset", 0, 0, 0);
    beat("Clock 1", 1, 1, 1);
    beat("Clock 2", 1, 1, 0);
    beat("Disabled", 1, 0, 0);
    beat("Clock 3", 1, 1, 1);
    beat("Reset again", 0, 1, 0);
    return { passed: checks.every(row => row.passed), checks, trace };
  }

  const api = { compile, check };
  globalThis.ChipCourseSimulator = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
