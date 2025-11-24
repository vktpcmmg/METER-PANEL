# CT Wiring Trainer (Konva.js)

Small web demo to train CT → 1‑phase meter wiring.

- CT secondary terminals: **S1, S2**
- Meter terminals: **M1, L1**
- User clicks terminals to draw wires.
- App checks:
  - ✅ Correct polarity: S1 → M1 and S2 → L1
  - ⚠️ Reverse polarity: S2 → M1 and S1 → L1
  - ❌ Fault / open circuit: any other case

## How to run

Just open `index.html` in a browser (Chrome, Edge, etc).

## How to use

1. Click **S1**, then **M1** to connect them.
2. Click **S2**, then **L1** to connect them.
3. Press **✅ Check Wiring** to see result.
4. Press **🔄 Reset Connections** to clear wires.
