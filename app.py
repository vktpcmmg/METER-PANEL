import streamlit as st

# ==============================
# CT → Meter Wiring Trainer
# ==============================

st.set_page_config(page_title="CT Wiring Trainer", layout="centered")

st.title("🔌 Basic CT → 1-Phase Meter Wiring Trainer")

st.write("""
This trainer simulates connecting a **CT Secondary (S1, S2)** to a **Single Phase Meter (M1, L1)**.
  
👉 Correct wiring: **S1 → M1** and **S2 → L1**  
👉 Reverse polarity: **S2 → M1** and **S1 → L1**
""")

# Available terminals
terminals = ["Not Connected", "S1", "S2"]

st.subheader("Select Wiring")

col1, col2 = st.columns(2)

with col1:
    m1 = st.selectbox("Meter Terminal **M1** connected to:", terminals)

with col2:
    l1 = st.selectbox("Meter Terminal **L1** connected to:", terminals)


# ==============================
# Wiring Logic
# ==============================

def check_ct_connection(m1, l1):
    # Correct
    if m1 == "S1" and l1 == "S2":
        return "OK", "✅ Correct polarity — S1 → M1 and S2 → L1."

    # Reverse polarity
    if m1 == "S2" and l1 == "S1":
        return "REVERSE", "⚠️ Reverse polarity — S2 → M1 and S1 → L1."

    # Open circuit / invalid
    if m1 == "Not Connected" or l1 == "Not Connected":
        return "FAULT", "❌ Open / Incomplete circuit — CT terminals not fully connected."

    # Miswired
    return "FAULT", "❌ Fault wiring — CT terminals connected incorrectly."


if st.button("Check Wiring"):
    status, msg = check_ct_connection(m1, l1)

    if status == "OK":
        st.success(msg)
    elif status == "REVERSE":
        st.warning(msg)
    else:
        st.error(msg)

st.info("Change connections and click **Check Wiring** to learn different cases.")
