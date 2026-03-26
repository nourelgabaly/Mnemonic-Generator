import { useState } from "react";
import axios from "axios";

export default function Dashboard({ user, onLogout }) {
  const [word, setWord] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const handleGenerate = async () => {
    if (!word.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await axios.post("http://localhost:8000/generate", { word, context });
      setResult(res.data);
      setHistory(prev => [res.data, ...prev].slice(0, 6));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) handleGenerate();
  };

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
      <div style={s.brand}>
  <img 
    src="/membrain-clear-logo.png" 
    alt="MemBrain logo" 
    style={{
      height: "38px", 
      objectFit: "contain", 
      filter: "brightness(0) invert(1)"
    }} 
  />
  <span style={s.brandName}>MemBrain</span>
</div>

        <nav style={s.nav}>
          <div style={s.navItem}>
            <span style={s.navIcon}>⊞</span>
            <span>Generate</span>
          </div>
        </nav>

        <div style={s.historySection}>
          <p style={s.historyTitle}>Recent</p>
          {history.length === 0 && (
            <p style={s.historyEmpty}>Your generations will appear here</p>
          )}
          {history.map((item, i) => (
            <div key={i} style={s.historyItem} onClick={() => setResult(item)}>
              <span style={s.historyWord}>{item.word}</span>
              <span style={s.historyTech}>{item.technique}</span>
            </div>
          ))}
        </div>

        <div style={s.userSection}>
          <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || "U"}</div>
          <div style={s.userInfo}>
            <span style={s.userName}>{user?.name || "User"}</span>
            <span style={s.userEmail}>{user?.email || ""}</span>
          </div>
          <button style={s.logoutBtn} onClick={onLogout} title="Sign out">→</button>
        </div>
      </aside>

      {/* Main content */}
      <main style={s.main}>
        <div style={s.topBar}>
          <div>
            <h1 style={s.pageTitle}>Visual Mnemonic Generator</h1>
            <p style={s.pageSubtitle}>Enter any concept to generate a memorable visual aid</p>
          </div>
        </div>

        {/* Input area */}
        <div style={s.inputCard}>
          <div style={s.inputRow}>
            <div style={s.inputGroup}>
              <label style={s.label}>Concept or word</label>
              <input
                style={s.input}
                type="text"
                placeholder="e.g. Photosynthesis, The French Revolution, Pythagorean Theorem..."
                value={word}
                onChange={e => setWord(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button
              style={loading || !word.trim() ? s.btnDisabled : s.btn}
              onClick={handleGenerate}
              disabled={loading || !word.trim()}
            >
              {loading ? (
                <span style={s.btnInner}>
                  <span style={s.spinner} />
                  Generating
                </span>
              ) : (
                "Generate"
              )}
            </button>
          </div>

          <div style={s.contextRow}>
            <label style={s.label}>Context <span style={s.optional}>(optional)</span></label>
            <textarea
              style={s.textarea}
              placeholder="Add extra context or the sentence where you encountered this word..."
              value={context}
              onChange={e => setContext(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {error && <div style={s.errorBox}>{error}</div>}

        {/* Loading state */}
        {loading && (
          <div style={s.loadingCard}>
            <div style={s.loadingDots}>
              <span style={{...s.dot, animationDelay: "0s"}} />
              <span style={{...s.dot, animationDelay: "0.2s"}} />
              <span style={{...s.dot, animationDelay: "0.4s"}} />
            </div>
            <p style={s.loadingText}>Crafting your mnemonic and illustration...</p>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div style={s.resultCard}>
            <div style={s.resultHeader}>
              <div>
                <h2 style={s.resultWord}>{result.word}</h2>
                <span style={s.techniqueBadge}>{result.technique}</span>
              </div>
            </div>

            <div style={s.resultBody}>
              <div style={s.textCol}>
                <div style={s.infoBlock}>
                  <p style={s.infoLabel}>Definition</p>
                  <p style={s.infoText}>{result.simple_meaning}</p>
                </div>
                <div style={s.divider} />
                <div style={s.infoBlock}>
                  <p style={s.infoLabel}>Mnemonic</p>
                  <p style={s.mnemonicText}>{result.mnemonic}</p>
                </div>
              </div>

              <div style={s.imageCol}>
                <div style={s.imageWrapper}>
                  <img
                    src={result.image_url}
                    alt={`Mnemonic illustration for ${result.word}`}
                    style={s.image}
                  />
                </div>
                <p style={s.imageCaption}>AI-generated illustration</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>◈</div>
            <h3 style={s.emptyTitle}>Ready to memorize</h3>
            <p style={s.emptyText}>Type any concept above and hit Generate — works for any subject.</p>
            <div style={s.exampleRow}>
              {["Mitosis", "World War II", "Pythagorean Theorem", "Photosynthesis"].map(ex => (
                <span key={ex} style={s.exampleChip} onClick={() => setWord(ex)}>{ex}</span>
              ))}
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const s = {
  page: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "var(--cream)",
  },
  sidebar: {
    width: "260px",
    backgroundColor: "var(--navy)",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    flexShrink: 0,
  },
  brand: { display: "flex", alignItems: "center", gap: "10px" },
  brandMark: {
    width: "32px", height: "32px", borderRadius: "7px",
    backgroundColor: "var(--gold)", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontFamily: "Cormorant Garamond, serif", fontSize: "18px",
    color: "var(--navy)", fontWeight: "600",
  },
  brandName: {
    fontFamily: "Cormorant Garamond, serif", fontSize: "20px",
    color: "var(--cream)", letterSpacing: "0.04em",
  },
  nav: { display: "flex", flexDirection: "column", gap: "4px" },
  navItem: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "10px 12px", borderRadius: "8px",
    backgroundColor: "rgba(197,212,208,0.1)",
    color: "var(--cream)", fontSize: "14px", cursor: "pointer",
  },
  navIcon: { fontSize: "16px", opacity: 0.8 },
  historySection: { flex: 1, display: "flex", flexDirection: "column", gap: "8px" },
  historyTitle: {
    fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase",
    color: "rgba(197,212,208,0.5)", marginBottom: "4px",
  },
  historyEmpty: { fontSize: "13px", color: "rgba(197,212,208,0.4)", lineHeight: "1.5" },
  historyItem: {
    padding: "10px 12px", borderRadius: "8px", cursor: "pointer",
    backgroundColor: "rgba(197,212,208,0.05)",
    borderLeft: "2px solid var(--gold)",
    display: "flex", flexDirection: "column", gap: "2px",
    transition: "background 0.2s",
  },
  historyWord: { fontSize: "14px", color: "var(--cream)", fontWeight: "500" },
  historyTech: { fontSize: "11px", color: "var(--teal)" },
  userSection: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "12px", borderRadius: "10px",
    backgroundColor: "rgba(197,212,208,0.08)",
    borderTop: "1px solid rgba(197,212,208,0.1)",
  },
  avatar: {
    width: "32px", height: "32px", borderRadius: "50%",
    backgroundColor: "var(--gold)", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontSize: "14px", color: "var(--navy)", fontWeight: "600",
    flexShrink: 0,
  },
  userInfo: { flex: 1, display: "flex", flexDirection: "column", gap: "1px", overflow: "hidden" },
  userName: { fontSize: "13px", color: "var(--cream)", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userEmail: { fontSize: "11px", color: "var(--teal)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  logoutBtn: {
    background: "none", border: "none", color: "var(--sage)",
    cursor: "pointer", fontSize: "16px", padding: "4px", flexShrink: 0,
  },
  main: {
    flex: 1, padding: "48px 56px", display: "flex",
    flexDirection: "column", gap: "24px", overflowY: "auto",
  },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  pageTitle: {
    fontFamily: "Cormorant Garamond, serif", fontSize: "36px",
    fontWeight: "300", color: "var(--navy)",
  },
  pageSubtitle: { fontSize: "14px", color: "var(--teal)", marginTop: "4px" },
  inputCard: {
    backgroundColor: "white", borderRadius: "16px",
    padding: "28px", display: "flex", flexDirection: "column",
    gap: "16px", boxShadow: "0 1px 4px rgba(14,50,82,0.06)",
  },
  inputRow: { display: "flex", gap: "12px", alignItems: "flex-end" },
  inputGroup: { flex: 1, display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--teal)" },
  optional: { textTransform: "none", opacity: 0.6, letterSpacing: 0 },
  input: {
    padding: "13px 16px", fontSize: "15px",
    border: "1.5px solid var(--sage)", borderRadius: "10px",
    backgroundColor: "var(--cream)", color: "var(--navy)", outline: "none",
  },
  contextRow: { display: "flex", flexDirection: "column", gap: "6px" },
  textarea: {
    padding: "12px 16px", fontSize: "14px",
    border: "1.5px solid var(--sage)", borderRadius: "10px",
    backgroundColor: "var(--cream)", color: "var(--navy)",
    outline: "none", resize: "none", lineHeight: "1.6",
  },
  btn: {
    padding: "13px 28px", fontSize: "14px", letterSpacing: "0.04em",
    backgroundColor: "var(--navy)", color: "var(--cream)",
    border: "none", borderRadius: "10px", cursor: "pointer",
    fontWeight: "500", whiteSpace: "nowrap", flexShrink: 0,
  },
  btnDisabled: {
    padding: "13px 28px", fontSize: "14px",
    backgroundColor: "var(--sage)", color: "var(--teal)",
    border: "none", borderRadius: "10px", cursor: "not-allowed",
    fontWeight: "500", whiteSpace: "nowrap", flexShrink: 0,
  },
  btnInner: { display: "flex", alignItems: "center", gap: "8px" },
  spinner: {
    width: "14px", height: "14px", borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white", display: "inline-block",
    animation: "spin 0.8s linear infinite",
  },
  errorBox: {
    backgroundColor: "#fdf0ee", color: "#c0392b",
    padding: "14px 18px", borderRadius: "10px", fontSize: "14px",
  },
  loadingCard: {
    backgroundColor: "white", borderRadius: "16px", padding: "60px",
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "16px", boxShadow: "0 1px 4px rgba(14,50,82,0.06)",
  },
  loadingDots: { display: "flex", gap: "8px" },
  dot: {
    width: "10px", height: "10px", borderRadius: "50%",
    backgroundColor: "var(--teal)", display: "inline-block",
    animation: "bounce 1.2s ease-in-out infinite",
  },
  loadingText: { fontSize: "14px", color: "var(--teal)" },
  resultCard: {
    backgroundColor: "white", borderRadius: "16px",
    padding: "32px", boxShadow: "0 1px 4px rgba(14,50,82,0.06)",
  },
  resultHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "28px",
    paddingBottom: "20px", borderBottom: "1px solid var(--sage)",
  },
  resultWord: {
    fontFamily: "Cormorant Garamond, serif", fontSize: "40px",
    fontWeight: "300", color: "var(--navy)",
  },
  techniqueBadge: {
    display: "inline-block", marginTop: "8px",
    padding: "4px 12px", borderRadius: "100px",
    backgroundColor: "var(--sage)", color: "var(--navy)",
    fontSize: "12px", letterSpacing: "0.04em",
  },
  resultBody: { display: "flex", gap: "40px" },
  textCol: { flex: 1, display: "flex", flexDirection: "column", gap: "20px" },
  infoBlock: { display: "flex", flexDirection: "column", gap: "8px" },
  infoLabel: {
    fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase",
    color: "var(--teal)", fontWeight: "500",
  },
  infoText: { fontSize: "15px", color: "var(--navy)", lineHeight: "1.7" },
  mnemonicText: {
    fontSize: "16px", color: "var(--navy)", lineHeight: "1.8",
    fontStyle: "italic", borderLeft: "3px solid var(--gold)",
    paddingLeft: "16px",
  },
  divider: { height: "1px", backgroundColor: "var(--sage)", opacity: 0.5 },
  imageCol: { width: "340px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "10px" },
  imageWrapper: { borderRadius: "12px", overflow: "hidden", border: "1px solid var(--sage)" },
  image: { width: "100%", display: "block" },
  imageCaption: { fontSize: "11px", color: "var(--teal)", textAlign: "center", letterSpacing: "0.05em" },
  emptyState: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: "16px", padding: "80px 0",
  },
  emptyIcon: {
    fontSize: "48px", color: "var(--sage)",
    fontFamily: "Cormorant Garamond, serif",
  },
  emptyTitle: {
    fontFamily: "Cormorant Garamond, serif", fontSize: "28px",
    fontWeight: "300", color: "var(--navy)",
  },
  emptyText: { fontSize: "15px", color: "var(--teal)", textAlign: "center" },
  exampleRow: { display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", marginTop: "8px" },
  exampleChip: {
    padding: "8px 16px", borderRadius: "100px",
    border: "1px solid var(--sage)", color: "var(--teal)",
    fontSize: "13px", cursor: "pointer", backgroundColor: "white",
    transition: "all 0.2s",
  },
};