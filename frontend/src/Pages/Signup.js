import { useState } from "react";
import axios from "axios";
import { TbWorld } from "react-icons/tb";
import { MdOutlineAutoAwesome } from "react-icons/md";
import { HiOutlineSparkles } from "react-icons/hi";

export default function Signup({ onSignup, onGoLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:8000/signup", { name, email, password });
      onSignup(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            <h1 style={s.heroTitle}>See it.<br />Remember it.<br /><em>Always.</em></h1>
            <p style={s.heroSub}>
              Most people forget 70% of what they learn within 24 hours.
              MemBrain changes that — one vivid illustration at a time.
            </p>
          </div>

          <div style={s.featureList}>
            {[
              { icon: <TbWorld size={18} color="var(--gold)" />, label: "Any subject" },
              { icon: <MdOutlineAutoAwesome size={18} color="var(--gold)" />, label: "AI powered" },
              { icon: <HiOutlineSparkles size={18} color="var(--gold)" />, label: "Free to start" },
            ].map(({ icon, label }) => (
              <div key={label} style={s.featureItem}>
                <span style={s.featureIcon}>{icon}</span>
                <span style={s.featureLabel}>{label}</span>
              </div>
            ))}
          </div>

        </div>
        <div style={s.decorLine} />
      </div>

      <div style={s.right}>
        <div style={s.formBox}>
          <h2 style={s.formTitle}>Create account</h2>
          <p style={s.formSub}>Your memory will thank you.</p>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Full name</label>
              <input
                style={s.input}
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
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
            </div>

            {error && <p style={s.error}>{error}</p>}

            <button style={loading ? s.btnDisabled : s.btn} disabled={loading} type="submit">
              {loading ? "Creating account..." : "Get started"}
            </button>
          </form>

          <p style={s.switchText}>
            Already have an account?{" "}
            <span style={s.link} onClick={onGoLogin}>Sign in</span>
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
  },  brandName: {
    fontFamily: "Cormorant Garamond, serif", fontSize: "38px",
    color: "var(--cream)", letterSpacing: "0.03em", fontWeight: "600",
    lineHeight: 1,
  },
  heroTitle: {
    fontFamily: "Cormorant Garamond, serif", fontSize: "68px",
    fontWeight: "600", color: "var(--cream)", lineHeight: "1.05", marginBottom: "20px",
  },
  heroSub: {
    fontSize: "17px", color: "var(--sage)", lineHeight: "1.75",
    maxWidth: "380px", fontWeight: "400",
  },
  featureList: { display: "flex", gap: "12px", flexWrap: "wrap" },
  featureItem: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "10px 16px", borderRadius: "100px",
    border: "1px solid rgba(221,178,115,0.25)",
    backgroundColor: "rgba(221,178,115,0.08)",
  },
  featureIcon: { display: "flex", alignItems: "center" },
  featureLabel: { fontSize: "14px", color: "var(--sage)", fontWeight: "500" },
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