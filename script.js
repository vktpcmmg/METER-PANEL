// CT → 1-Phase Meter Wiring Trainer using Konva.js

const containerDiv = document.getElementById("container");
const width = containerDiv.clientWidth;
const height = containerDiv.clientHeight || 400;

const stage = new Konva.Stage({
  container: "container",
  width: width,
  height: height,
});

const layer = new Konva.Layer();
stage.add(layer);

const CT_TERMINALS = ["S1", "S2"];
const METER_TERMINALS = ["M1", "L1"];

const terminalNodes = {};
let connections = [];
let meterToCtMap = { M1: null, L1: null };
let selectedTerminal = null;

function createTerminal(name, x, y, group) {
  const circle = new Konva.Circle({
    x: x,
    y: y,
    radius: 15,
    fill: group === "CT" ? "#e0f7fa" : "#e8f5e9",
    stroke: "#000",
    strokeWidth: 1,
  });

  const label = new Konva.Text({
    x: x - 10,
    y: y - 8,
    text: name,
    fontSize: 14,
    fontFamily: "Arial",
    fill: "#000",
  });

  const groupNode = new Konva.Group({
    x: 0,
    y: 0,
  });

  groupNode.add(circle);
  groupNode.add(label);
  groupNode.name(name);
  groupNode.on("click", () => onTerminalClick(name));

  layer.add(groupNode);
  terminalNodes[name] = groupNode;
}

// Layout
createTerminal("S1", width * 0.25, height * 0.3, "CT");
createTerminal("S2", width * 0.25, height * 0.7, "CT");
createTerminal("M1", width * 0.75, height * 0.3, "METER");
createTerminal("L1", width * 0.75, height * 0.7, "METER");

layer.draw();

function onTerminalClick(name) {
  const statusDiv = document.getElementById("status");

  if (!selectedTerminal) {
    selectedTerminal = name;
    highlightTerminal(name, true);
    statusDiv.textContent = `Selected: ${name}. Now click another terminal to complete the wire.`;
    statusDiv.style.color = "black";
    return;
  }

  const from = selectedTerminal;
  const to = name;

  highlightTerminal(selectedTerminal, false);
  selectedTerminal = null;

  if (from === to) {
    statusDiv.textContent = "Cannot connect a terminal to itself.";
    statusDiv.style.color = "red";
    return;
  }

  const isCtFrom = CT_TERMINALS.includes(from);
  const isCtTo = CT_TERMINALS.includes(to);
  const isMeterFrom = METER_TERMINALS.includes(from);
  const isMeterTo = METER_TERMINALS.includes(to);

  if ((isCtFrom && isCtTo) || (isMeterFrom && isMeterTo)) {
    statusDiv.textContent = "Connect a CT terminal to a Meter terminal (S1/S2 ↔ M1/L1).";
    statusDiv.style.color = "red";
    return;
  }

  let ctTerminal, meterTerminal;
  if (isCtFrom && isMeterTo) {
    ctTerminal = from;
    meterTerminal = to;
  } else if (isMeterFrom && isCtTo) {
    ctTerminal = to;
    meterTerminal = from;
  }

  drawConnection(ctTerminal, meterTerminal);
  statusDiv.textContent = `Connected ${ctTerminal} ↔ ${meterTerminal}`;
  statusDiv.style.color = "black";
}

function drawConnection(ctTerminal, meterTerminal) {
  connections = connections.filter((conn) => {
    if (conn.meter === meterTerminal) {
      conn.line.destroy();
      return false;
    }
    return true;
  });

  const fromNode = terminalNodes[ctTerminal];
  const toNode = terminalNodes[meterTerminal];
  const fromPos = fromNode.position();
  const toPos = toNode.position();

  const line = new Konva.Line({
    points: [fromPos.x, fromPos.y, toPos.x, toPos.y],
    stroke: "#000",
    strokeWidth: 2,
  });

  layer.add(line);
  layer.moveToBottom(line);
  layer.draw();

  connections.push({ ct: ctTerminal, meter: meterTerminal, line });
  meterToCtMap[meterTerminal] = ctTerminal;
}

function highlightTerminal(name, on) {
  const node = terminalNodes[name];
  if (!node) return;
  const circle = node.findOne("Circle");
  if (!circle) return;

  if (on) {
    circle.stroke("#f00");
    circle.strokeWidth(2);
  } else {
    circle.stroke("#000");
    circle.strokeWidth(1);
  }
  layer.draw();
}

function resetConnections() {
  connections.forEach((conn) => conn.line.destroy());
  connections = [];
  meterToCtMap.M1 = null;
  meterToCtMap.L1 = null;
  selectedTerminal = null;
  Object.keys(terminalNodes).forEach((name) => highlightTerminal(name, false));
  layer.draw();

  const statusDiv = document.getElementById("status");
  statusDiv.textContent =
    "Connections reset. Click a terminal, then another terminal to draw a wire.";
  statusDiv.style.color = "black";
}

function checkWiring() {
  const statusDiv = document.getElementById("status");
  const m1 = meterToCtMap.M1;
  const l1 = meterToCtMap.L1;

  if (!m1 || !l1) {
    statusDiv.textContent =
      "❌ Open / incomplete circuit — both M1 and L1 must be connected to S1/S2.";
    statusDiv.style.color = "red";
    return;
  }

  if (m1 === "S1" && l1 === "S2") {
    statusDiv.textContent =
      "✅ Correct polarity — S1 → M1 and S2 → L1.";
    statusDiv.style.color = "green";
    return;
  }

  if (m1 === "S2" && l1 === "S1") {
    statusDiv.textContent =
      "⚠️ Reverse polarity — S2 → M1 and S1 → L1. Meter will measure reverse direction.";
    statusDiv.style.color = "orange";
    return;
  }

  statusDiv.textContent = "❌ Fault wiring — CT terminals connected incorrectly.";
  statusDiv.style.color = "red";
}

document.getElementById("resetBtn").addEventListener("click", resetConnections);
document.getElementById("checkBtn").addEventListener("click", checkWiring);
