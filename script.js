// CT → 1-Phase Meter Wiring Trainer using Konva.js

// Basic stage setup
const containerDiv = document.getElementById("container");
const width = containerDiv.clientWidth || 800;
const height = containerDiv.clientHeight || 400;

const stage = new Konva.Stage({
  container: "container",
  width: width,
  height: height,
});

const layer = new Konva.Layer();
stage.add(layer);

// Terminal names
const CT_TERMINALS = ["S1", "S2"];
const METER_TERMINALS = ["M1", "L1"];

// We will store the CIRCLE shape for each terminal
const terminalNodes = {}; // name -> circle
let connections = [];     // { ct, meter, line }
let meterToCtMap = { M1: null, L1: null };
let selectedTerminal = null;

// -----------------------------
// Create a terminal (circle + label)
// -----------------------------
function createTerminal(name, x, y, groupType) {
  const circle = new Konva.Circle({
    x: x,
    y: y,
    radius: 15,
    fill: groupType === "CT" ? "#e0f7fa" : "#e8f5e9",
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

  const group = new Konva.Group();
  group.add(circle);
  group.add(label);

  group.on("click", () => onTerminalClick(name));

  layer.add(group);

  // IMPORTANT: store the circle (for correct positions)
  terminalNodes[name] = circle;
}

// Layout: CT on left, Meter on right
createTerminal("S1", width * 0.25, height * 0.3, "CT");
createTerminal("S2", width * 0.25, height * 0.7, "CT");
createTerminal("M1", width * 0.75, height * 0.3, "METER");
createTerminal("L1", width * 0.75, height * 0.7, "METER");

layer.draw();

// -----------------------------
// Handle terminal click
// -----------------------------
function onTerminalClick(name) {
  const statusDiv = document.getElementById("status");

  // First click: select terminal
  if (!selectedTerminal) {
    selectedTerminal = name;
    highlightTerminal(name, true);
    statusDiv.textContent = `Selected: ${name}. Now click another terminal to complete the wire.`;
    statusDiv.style.color = "black";
    return;
  }

  // Second click: connect
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

  // Must be CT ↔ Meter, not CT↔CT or Meter↔Meter
  if ((isCtFrom && isCtTo) || (isMeterFrom && isMeterTo)) {
    statusDiv.textContent =
      "Connect a CT terminal to a Meter terminal (S1/S2 ↔ M1/L1).";
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

// -----------------------------
// Draw the wire (connection)
// -----------------------------
function drawConnection(ctTerminal, meterTerminal) {
  // Remove any old wire from this meter terminal
  connections = connections.filter((conn) => {
    if (conn.meter === meterTerminal) {
      conn.line.destroy();
      return false;
    }
    return true;
  });

  const fromCircle = terminalNodes[ctTerminal];
  const toCircle = terminalNodes[meterTerminal];

  // ✅ Get actual circle center positions
  const fromPos = fromCircle.getAbsolutePosition();
  const toPos = toCircle.getAbsolutePosition();

  const line = new Konva.Line({
    points: [fromPos.x, fromPos.y, toPos.x, toPos.y],
    stroke: "#000",
    strokeWidth: 2,
  });

  layer.add(line);
  line.moveToBottom(); // keep wires behind terminals
  layer.draw();

  connections.push({ ct: ctTerminal, meter: meterTerminal, line });
  meterToCtMap[meterTerminal] = ctTerminal;
}

// -----------------------------
// Highlight terminal when selected
// -----------------------------
function highlightTerminal(name, on) {
  const circle = terminalNodes[name];
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

// -----------------------------
// Reset all connections
// -----------------------------
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

// -----------------------------
// Check wiring logic
// -----------------------------
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
    statusDiv.textContent = "✅ Correct polarity — S1 → M1 and S2 → L1.";
    statusDiv.style.color = "green";
    return;
  }

  if (m1 === "S2" && l1 === "S1") {
    statusDiv.textContent =
      "⚠️ Reverse polarity — S2 → M1 and S1 → L1. Meter will measure reverse direction.";
    statusDiv.style.color = "orange";
    return;
  }

  statusDiv.textContent =
    "❌ Fault wiring — CT terminals connected incorrectly.";
  statusDiv.style.color = "red";
}

// -----------------------------
// Button handlers
// -----------------------------
document.getElementById("resetBtn").addEventListener("click", resetConnections);
document.getElementById("checkBtn").addEventListener("click", checkWiring);
