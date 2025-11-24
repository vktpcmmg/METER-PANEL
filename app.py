import streamlit as st

st.set_page_config(page_title="CT Wiring Trainer", layout="centered")

st.title("🔌 CT → 1-Phase Meter Wiring Trainer (Click Terminals)")

st.write("""
Click two terminals to **draw a connection** (like a wire).

- CT side: **S1, S2**  
- Meter side: **M1, L1**

✅ Correct wiring: **S1 → M1** and **S2 → L1**  
⚠️ Reverse polarity: **S2 → M1** and **S1 → L1**
""")

CT_TERMINALS = {"S1", "S2"}
METER_TERMINALS = {"M1", "L1"}

# --------------------------
# Session state initialisation
# --------------------------
if "selected_terminal" not in st.session_state:
    st.session_state.selected_terminal = None  # first click

if "connections" not in st.session_state:
    # store as: {"M1": "S1", "L1": "S2"} (meter terminal → CT terminal)
    st.session_state.connections = {}


def handle_click(terminal_name: str):
    """Handle a terminal button click."""
    selected = st.session_state.selected_terminal

    # First click: just remember terminal
    if selected is None:
        st.session_state.selected_terminal = terminal_name
        return

    # Second click: try to create/update connection
    from_t = selected
    to_t = terminal_name
    st.session_state.selected_terminal = None  # reset selection

    # Normalize so that we always store as (meter ← CT)
    if from_t in CT_TERMINALS and to_t in METER_TERMINALS:
        # CT → Meter
        st.session_state.connections[to_t] = from_t
    elif from_t in METER_TERMINALS and to_t in CT_TERMINALS:
        # Meter → CT
        st.session_state.connections[from_t] = to_t
    else:
        # CT→CT or Meter→Meter: ignore (no valid wire)
        st.warning("Please connect CT terminal to a Meter terminal (S1/S2 ↔ M1/L1).")


# --------------------------
# Layout terminals as buttons
# --------------------------
st.subheader("Terminals (Click to Connect)")

col_left, col_right = st.columns(2)

with col_left:
    st.markdown("### CT Secondary")
    st.button("S1", key="btn_S1", on_click=handle_click, args=("S1",))
    st.button("S2", key="btn_S2", on_click=handle_click, args=("S2",))

with col_right:
    st.markdown("### Meter Terminals")
    st.button("M1", key="btn_M1", on_click=handle_click, args=("M1",))
    st.button("L1", key="btn_L1", on_click=handle_click, args=("L1",))

st.caption("Tip: Click **S1**, then **M1** to draw S1→M1. Same for S2→L1.")

# Reset button
if st.button("🔄 Reset Connections"):
    st.session_state.connections = {}
    st.session_state.selected_terminal = None

# --------------------------
# Show current connections
# --------------------------
st.subheader("Current Connections")

m1_ct = st.session_state.connections.get("M1", "Not Connected")
l1_ct = st.session_state.connections.get("L1", "Not Connected")

st.write(f"**M1** is connected to: `{m1_ct}`")
st.write(f"**L1** is connected to: `{l1_ct}`")

if st.session_state.selected_terminal:
    st.info(f"Selected terminal: **{st.session_state.selected_terminal}** (now click another terminal to complete the wire).")


# --------------------------
# Wiring check logic
# --------------------------
def check_ct_connection(ct_to_m1: str, ct_to_l1: str):
    # Correct
    if ct_to_m1 == "S1" and ct_to_l1 == "S2":
        return "OK", "✅ Correct polarity — S1 → M1 and S2 → L1."

    # Reverse polarity
    if ct_to_m1 == "S2" and ct_to_l1 == "S1":
        return "REVERSE", "⚠️ Reverse polarity — S2 → M1 and S1 → L1."

    # Open / incomplete
    if ct_to_m1 == "Not Connected" or ct_to_l1 == "Not Connected":
        return "FAULT", "❌ Open / Incomplete circuit — CT terminals not fully connected."

    # Anything else = miswiring
    return "FAULT", "❌ Fault wiring — CT terminals connected incorrectly."


st.subheader("Wiring Result")

if st.button("✅ Check Wiring"):
    status, msg = check_ct_connection(m1_ct, l1_ct)

    if status == "OK":
        st.success(msg)
    elif status == "REVERSE":
        st.warning(msg)
    else:
        st.error(msg)

st.info("Click terminals to draw wires, then press **Check Wiring**.")
