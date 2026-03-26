import { useState } from "react";
import axios from "axios";

export default function ForgotPassword({ onGoLogin }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("http://localhost:8000/forgot-password", { email });
      setSent(true);
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
    style={{
      height: "44px", 
      objectFit: "contain", 
      filter: "brightness(0) invert(1)"
    }} 
  />
  <span style={s.brandName}>MemBrain</span>
</div>
          <h1 style={s.heroTitle}>Reset your<br /><em>password.</em></h1>
          <p style={s.heroSub}>Enter your email and we'll send you a link to get back into your account.</p>
        </div>
        <div style={s.decorLine} />
      </div>

      <div style={s.right}>
        <div style={s.formBox}>
          {sent ? (
            <div style={s.successBox}>
              <div style={s.successIcon}>✓</div>
              <h2 style={s.formTitle}>Check your email</h2>
              <p style={s.formSub}>
                We sent a password reset link to <strong>{email}</strong>.
                Check your inbox and follow the link to reset your password.
              </p>
              <button style={s.btn} onClick={onGoLogin}>Back to sign in</button>
            </div>
          ) : (
            <>
              <h2 style={s.formTitle}>Forgot password?</h2>
              <p style={s.formSub}>No worries — we'll send you reset instructions</p>

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

                {error && <p style={s.error}>{error}</p>}

                <button style={loading ? s.btnDisabled : s.btn} disabled={loading} type="submit">
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>

              <p style={s.switchText}>
                <span style={s.link} onClick={onGoLogin}>← Back to sign in</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display: "flex", minHeight: "100vh" },
  left: {
    flex: 1, backgroundColor: "var(--navy)", padding: "60px",
    display: "flex", flexDirection: "column", justifyContent: "space-between",
    position: "relative", overflow: "hidden",
  },
  leftInner: { display: "flex", flexDirection: "column", gap: "40px" },
  brand: { display: "flex", alignItems: "center", gap: "12px" },
  brandMark: {
    width: "40px", height: "40px", borderRadius: "10px",
    backgroundColor: "var(--gold)", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontFamily: "Cormorant Garamond, serif", fontSize: "22px",
    color: "var(--navy)", fontWeight: "600",
  },
  brandName: {
    fontFamily: "Cormorant Garamond, serif", fontSize: "26px",
    color: "var(--cream)", letterSpacing: "0.04em", fontWeight: "500",
  },
  heroTitle: {
    fontFamily: "Cormorant Garamond, serif", fontSize: "68px",
    fontWeight: "500", color: "var(--cream)", lineHeight: "1.1",
  },
  heroSub: { fontSize: "16px", color: "var(--sage)", lineHeight: "1.7", maxWidth: "360px" },
  decorLine: {
    position: "absolute", right: "0", top: "0",
    width: "1px", height: "100%", backgroundColor: "rgba(197,212,208,0.15)",
  },
  right: {
    flex: 1, display: "flex", alignItems: "center",
    justifyContent: "center", padding: "60px", backgroundColor: "var(--cream)",
  },
  formBox: { width: "100%", maxWidth: "400px" },
  successBox: { display: "flex", flexDirection: "column", gap: "16px" },
  successIcon: {
    width: "56px", height: "56px", borderRadius: "50%",
    backgroundColor: "var(--sage)", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontSize: "24px", color: "var(--navy)",
  },
  formTitle: {
    fontFamily: "Cormorant Garamond, serif", fontSize: "40px",
    fontWeight: "500", color: "var(--navy)", marginBottom: "8px",
  },
  formSub: { fontSize: "15px", color: "var(--teal)", marginBottom: "40px", lineHeight: "1.7" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: {
    fontSize: "12px", letterSpacing: "0.08em",
    textTransform: "uppercase", color: "var(--teal)", fontWeight: "600",
  },
  input: {
    padding: "14px 16px", fontSize: "15px",
    border: "1.5px solid var(--sage)", borderRadius: "10px",
    backgroundColor: "white", color: "var(--navy)", outline: "none",
  },
  btn: {
    marginTop: "8px", padding: "15px", fontSize: "15px",
    backgroundColor: "var(--navy)", color: "var(--cream)",
    border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600",
  },
  btnDisabled: {
    marginTop: "8px", padding: "15px", fontSize: "15px",
    backgroundColor: "var(--sage)", color: "var(--teal)",
    border: "none", borderRadius: "10px", cursor: "not-allowed", fontWeight: "600",
  },
  error: {
    fontSize: "13px", color: "#c0392b",
    backgroundColor: "#fdf0ee", padding: "10px 14px", borderRadius: "8px",
  },
  switchText: { marginTop: "28px", fontSize: "14px", textAlign: "center" },
  link: { color: "var(--gold)", cursor: "pointer", fontWeight: "600" },
};