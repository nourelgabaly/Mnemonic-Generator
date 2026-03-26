import { useState } from "react";
import axios from "axios";
import { BiBrain } from "react-icons/bi";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { MdOutlineAutoAwesome } from "react-icons/md";
import { TbAtom } from "react-icons/tb";

export default function Login({ onLogin, onGoSignup, onGoForgot }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:8000/login", { email, password });
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const proofPoints = [
    { icon: <HiOutlineLightningBolt size={20} color="var(--gold)" />, text: "Instant mnemonics for any concept" },
    { icon: <MdOutlineAutoAwesome size={20} color="var(--gold)" />, text: "AI illustrations that make it click" },
    { icon: <TbAtom size={20} color="var(--gold)" />, text: "Works for science, history, medicine & more" },
  ];

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.leftInner}>

        <div style={s.brand}>
  <img
    src="/membrain-clear-logo.png"
    alt="MemBrain logo"
    style={{ height: "72px", width: "72px", objectFit: "contain", filter: "brightness(0) invert(1)", display: "block", flexShrink: 0 }}
  />
  <span style={s.brandName}>MemBrain</span>
</div>

          <div>
            <h1 style={s.heroTitle}>Your brain,<br /><em>upgraded.</em></h1>
            <p style={s.heroSub}>
              Stop re-reading. Stop forgetting. MemBrain turns anything you need to learn
              into a visual memory that actually sticks.
            </p>
          </div>

          <div style={s.proofList}>
            {proofPoints.map(({ icon, text }) => (
              <div key={text} style={s.proofItem}>
                <span style={s.proofIcon}>{icon}</span>
                <span style={s.proofText}>{text}</span>
              </div>
            ))}
          </div>

        </div>
        <div style={s.decorLine} />
      </div>

      <div style={s.right}>
        <div style={s.formBox}>
          <h2 style={s.formTitle}>Sign in</h2>
          <p style={s.formSub}>Good to have you back.</p>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Email address</label>
              <input
                style={s.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input
                style={s.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <span style={s.forgotLink} onClick={onGoForgot}>Forgot password?</span>
            </div>

            {error && <p style={s.error}>{error}</p>}

            <button style={loading ? s.btnDisabled : s.btn} disabled={loading} type="submit">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p style={s.switchText}>
            New here?{" "}
            <span style={s.link} onClick={onGoSignup}>Create a free account</span>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display: "flex", minHeight: "100vh" },
  left: {
    flex: 1, backgroundColor: "var(--navy)", padding: "64px",
    display: "flex", flexDirection: "column", justifyContent: "space-between",
    position: "relative", overflow: "hidden",
  },
  leftInner: { display: "flex", flexDirection: "column", gap: "48px" },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    lineHeight: 1,
  }, brandName: {
    fontFamily: "Cormorant Garamond, serif", fontSize: "38px",
    color: "var(--cream)", letterSpacing: "0.03em", fontWeight: "600",
    lineHeight: 1,
  },
  heroTitle: {
    fontFamily: "Cormorant Garamond, serif", fontSize: "72px",
    fontWeight: "600", color: "var(--cream)", lineHeight: "1.05", marginBottom: "20px",
  },
  heroSub: {
    fontSize: "17px", color: "var(--sage)", lineHeight: "1.75",
    maxWidth: "380px", fontWeight: "400",
  },
  proofList: { display: "flex", flexDirection: "column", gap: "16px" },
  proofItem: { display: "flex", alignItems: "center", gap: "14px" },
  proofIcon: {
    width: "36px", height: "36px", borderRadius: "8px",
    backgroundColor: "rgba(221,178,115,0.12)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  proofText: { fontSize: "15px", color: "var(--sage)", fontWeight: "400" },
  decorLine: {
    position: "absolute", right: "0", top: "0",
    width: "1px", height: "100%", backgroundColor: "rgba(197,212,208,0.15)",
  },
  right: {
    flex: 1, display: "flex", alignItems: "center",
    justifyContent: "center", padding: "64px", backgroundColor: "var(--cream)",
  },
  formBox: { width: "100%", maxWidth: "400px" },
  formTitle: {
    fontFamily: "Cormorant Garamond, serif", fontSize: "44px",
    fontWeight: "600", color: "var(--navy)", marginBottom: "8px",
  },
  formSub: { fontSize: "16px", color: "var(--teal)", marginBottom: "40px", fontWeight: "400" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: {
    fontSize: "12px", letterSpacing: "0.08em",
    textTransform: "uppercase", color: "var(--teal)", fontWeight: "600",
  },
  input: {
    padding: "14px 16px", fontSize: "15px",
    border: "1.5px solid var(--sage)", borderRadius: "10px",
    backgroundColor: "white", color: "var(--navy)", outline: "none", fontWeight: "400",
  },
  forgotLink: {
    fontSize: "13px", color: "var(--gold)", cursor: "pointer",
    alignSelf: "flex-end", fontWeight: "500",
  },
  btn: {
    marginTop: "8px", padding: "16px", fontSize: "15px",
    letterSpacing: "0.04em", backgroundColor: "var(--navy)",
    color: "var(--cream)", border: "none", borderRadius: "10px",
    cursor: "pointer", fontWeight: "600",
  },
  btnDisabled: {
    marginTop: "8px", padding: "16px", fontSize: "15px",
    backgroundColor: "var(--sage)", color: "var(--teal)",
    border: "none", borderRadius: "10px", cursor: "not-allowed", fontWeight: "600",
  },
  error: {
    fontSize: "13px", color: "#c0392b",
    backgroundColor: "#fdf0ee", padding: "10px 14px", borderRadius: "8px",
  },
  switchText: { marginTop: "28px", fontSize: "14px", color: "var(--teal)", textAlign: "center" },
  link: { color: "var(--gold)", cursor: "pointer", fontWeight: "600" },
};