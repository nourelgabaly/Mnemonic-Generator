import { useState, useEffect } from "react";
import axios from "axios";
import { HiOutlineDownload } from "react-icons/hi";
import { MdOutlineAutoAwesome } from "react-icons/md";
import { TbHistory, TbLogout, TbStethoscope } from "react-icons/tb";

const MEDICAL_EXAMPLES = {
  visual: ["Myocardial Infarction", "Osmosis", "Anemia", "Tachycardia", "Edema", "Sepsis"],
  acronym: ["Causes of pancreatitis", "Cranial nerves in order", "Symptoms of heart failure", "ABCDE melanoma", "Signs of shock"]
};

export default function Dashboard({ user, onLogout }) {
  const [word, setWord] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("generate");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/history/${user.email}`);
      setHistory(res.data.generations || []);
    } catch { console.error("Failed to load history"); }
  };

  const handleGenerate = async () => {
    if (!word.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await axios.post("http://localhost:8000/generate", {
        word,
        context,
        user_email: user.email
      });
      setResult(res.data);
      fetchHistory();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) handleGenerate();
  };

  const handleDownload = async (imageUrl, wordName) => {
    setDownloading(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `membrain_${wordName.replace(/\s+/g, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch { alert("Download failed. Please try again."); }
    finally { setDownloading(false); }
  };

  return (
    <div style={s.page}>
      <aside style={s.sidebar}>
        <div style={s.brand}>
          <img src="/membrain_logo.png" alt="MemBrain"
            style={{ height: "38px", width: "38px", objectFit: "contain", filter: "brightness(0) invert(1)", flexShrink: 0 }} />
          <span style={{ ...s.brandName, lineHeight: 1 }}>MemBrain</span>
        </div>

        <nav style={s.nav}>
          <div style={activeTab === "generate" ? s.navItemActive : s.navItem} onClick={() => setActiveTab("generate")}>
            <MdOutlineAutoAwesome size={18} /><span>Generate</span>
          </div>
          <div style={activeTab === "history" ? s.navItemActive : s.navItem} onClick={() => setActiveTab("history")}>
            <TbHistory size={18} /><span>All Generations</span>
            {history.length > 0 && <span style={s.badge}>{history.length}</span>}
          </div>
        </nav>

        <div style={s.infoBox}>
          <div style={s.infoRow}>
            <TbStethoscope size={14} color="#DDB273" />
            <span style={s.infoTitle}>Medical Mode</span>
          </div>
          <p style={s.infoText}>Enter any English medical term, disease, drug, anatomical structure, or list of symptoms.</p>
          <div style={s.techniquePills}>
            <span style={s.pill}>Visual Association</span>
            <span style={s.pill}>Acronym</span>
          </div>
          <p style={s.infoSub}>Auto-selected based on your input</p>
        </div>

        <div style={s.userSection}>
          <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || "U"}</div>
          <div style={s.userInfo}>
            <span style={s.userName}>{user?.name || "User"}</span>
            <span style={s.userEmail}>{user?.email || ""}</span>
          </div>
          <button style={s.logoutBtn} onClick={onLogout} title="Sign out">
            <TbLogout size={18} color="var(--sage)" />
          </button>
        </div>
      </aside>

      <main style={s.main}>

        {activeTab === "generate" && (
          <>
            <div style={s.topBar}>
              <div>
                <h1 style={s.pageTitle}>Medical Mnemonic Generator</h1>
                <p style={s.pageSubtitle}>
                  Enter any medical term or list — MemBrain automatically selects the most effective technique
                </p>
              </div>
            </div>

            <div style={s.inputCard}>
              <div style={s.inputRow}>
                <div style={s.inputGroup}>
                  <label style={s.label}>Medical term or concept</label>
                  <input
                    style={s.input}
                    type="text"
                    placeholder="e.g. Myocardial Infarction, Cranial nerves in order, Sepsis..."
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
                  {loading
                    ? <span style={s.btnInner}><span style={s.spinner} />Generating</span>
                    : "Generate"
                  }
                </button>
              </div>

              <div style={s.contextRow}>
                <label style={s.label}>Context <span style={s.optional}>(optional)</span></label>
                <textarea
                  style={s.textarea}
                  placeholder="Add clinical context, e.g. 'for USMLE Step 1' or 'first year anatomy'..."
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {error && <div style={s.errorBox}>{error}</div>}

            {loading && (
              <div style={s.loadingCard}>
                <div style={s.loadingDots}>
                  <span style={{ ...s.dot, animationDelay: "0s" }} />
                  <span style={{ ...s.dot, animationDelay: "0.2s" }} />
                  <span style={{ ...s.dot, animationDelay: "0.4s" }} />
                </div>
                <p style={s.loadingText}>Analyzing input and generating medical mnemonic...</p>
              </div>
            )}

            {result && !loading && (
              result.technique === "Acronym"
                ? <AcronymCard result={result} onDownload={handleDownload} downloading={downloading} />
                : <VisualCard result={result} onDownload={handleDownload} downloading={downloading} />
            )}

            {!result && !loading && !error && (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>◈</div>
                <h3 style={s.emptyTitle}>Ready for medical terms</h3>
                <p style={s.emptyText}>
                  Single concepts → Visual Association mnemonic + illustration<br />
                  Lists or sequences → Acronym mnemonic + visual
                </p>
                <div style={s.exampleSection}>
                  <p style={s.exampleLabel}>Single concepts</p>
                  <div style={s.exampleRow}>
                    {MEDICAL_EXAMPLES.visual.map(ex => (
                      <span key={ex} style={s.exampleChip} onClick={() => setWord(ex)}>{ex}</span>
                    ))}
                  </div>
                  <p style={s.exampleLabel} style={{...s.exampleLabel, marginTop: "12px"}}>Lists & sequences</p>
                  <div style={s.exampleRow}>
                    {MEDICAL_EXAMPLES.acronym.map(ex => (
                      <span key={ex} style={{...s.exampleChip, borderColor: "#DDB273", color: "#8a6a3a"}} onClick={() => setWord(ex)}>{ex}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "history" && (
          <>
            <div style={s.topBar}>
              <div>
                <h1 style={s.pageTitle}>All Generations</h1>
                <p style={s.pageSubtitle}>{history.length} total — every mnemonic you've ever generated</p>
              </div>
            </div>
            {history.length === 0 ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>◈</div>
                <h3 style={s.emptyTitle}>No generations yet</h3>
                <p style={s.emptyText}>Go to Generate and create your first medical mnemonic!</p>
              </div>
            ) : (
              <div style={s.historyGrid}>
                {history.map((item, i) => (
                  <div key={i} style={s.historyCard}>
                    <div style={s.historyImageWrapper}>
                      <img src={item.image_url} alt={item.word} style={s.historyImage} />
                      <button style={s.downloadOverlay}
                        onClick={() => handleDownload(item.image_url, item.word)}>
                        <HiOutlineDownload size={18} color="white" />
                      </button>
                      <span style={{
                        ...s.techniqueOverlay,
                        backgroundColor: item.technique === "Acronym" ? "var(--gold)" : "var(--teal)"
                      }}>{item.technique}</span>
                    </div>
                    <div style={s.historyContent}>
                      <div style={s.historyTop}>
                        <h3 style={s.historyWord}>{item.word}</h3>
                      </div>
                      <p style={s.historyMeaning}>{item.simple_meaning}</p>
                      <p style={s.historyMnemonic}>{item.mnemonic}</p>
                      <p style={s.historyDate}>
                        {new Date(item.created_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <style>{`
        @keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-8px);opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}

function VisualCard({ result, onDownload, downloading }) {
  return (
    <div style={s.resultCard}>
      <div style={s.resultHeader}>
        <div>
          <span style={{...s.techniqueBadge, backgroundColor: "var(--teal)"}}>Visual Association</span>
          <h2 style={s.resultWord}>{result.word}</h2>
          <p style={s.resultDef}>{result.definition}</p>
        </div>
        <button style={downloading ? s.downloadBtnDisabled : s.downloadBtn}
          onClick={() => onDownload(result.image_url, result.word)} disabled={downloading}>
          <HiOutlineDownload size={16} />
          {downloading ? "Downloading..." : "Download"}
        </button>
      </div>
      <div style={s.resultBody}>
        <div style={s.textCol}>
          <div style={s.infoBlock}>
            <p style={s.infoLabel}>Visual concept</p>
            <p style={s.infoText}>{result.visual_concept}</p>
          </div>
          <div style={s.divider} />
          <div style={s.infoBlock}>
            <p style={s.infoLabel}>Mnemonic tip</p>
            <p style={s.mnemonicText}>{result.mnemonic}</p>
          </div>
        </div>
        <div style={s.imageCol}>
          <div style={s.imageWrapper}>
            <img src={result.image_url} alt={result.word} style={s.image} />
          </div>
          <p style={s.imageCaption}>AI-generated visual mnemonic</p>
        </div>
      </div>
    </div>
  );
}

function AcronymCard({ result, onDownload, downloading }) {
  return (
    <div style={s.resultCard}>
      <div style={s.resultHeader}>
        <div>
          <span style={{...s.techniqueBadge, backgroundColor: "var(--gold)", color: "var(--navy)"}}>Acronym</span>
          <h2 style={s.resultWord}>{result.word}</h2>
          <p style={s.resultDef}>{result.definition}</p>
        </div>
        <button style={downloading ? s.downloadBtnDisabled : s.downloadBtn}
          onClick={() => onDownload(result.image_url, result.word)} disabled={downloading}>
          <HiOutlineDownload size={16} />
          {downloading ? "Downloading..." : "Download"}
        </button>
      </div>
      <div style={s.resultBody}>
        <div style={s.textCol}>
          {/* Acronym breakdown */}
          <div style={s.acronymBox}>
            <p style={s.infoLabel}>Acronym breakdown</p>
            <div style={s.acronymGrid}>
              {(result.acronym_letters || []).map((item, i) => (
                <div key={i} style={s.acronymRow}>
                  <span style={s.acronymLetter}>{item.letter}</span>
                  <span style={s.acronymMeaning}>{item.stands_for}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={s.divider} />
          <div style={s.infoBlock}>
            <p style={s.infoLabel}>Memory sentence</p>
            <p style={s.memorySentence}>{result.memory_sentence}</p>
          </div>
          <div style={s.infoBlock}>
            <p style={s.infoLabel}>Mnemonic tip</p>
            <p style={s.mnemonicText}>{result.mnemonic}</p>
          </div>
        </div>
        <div style={s.imageCol}>
          <div style={s.imageWrapper}>
            <img src={result.image_url} alt={result.word} style={s.image} />
          </div>
          <p style={s.imageCaption}>AI-generated visual mnemonic</p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display: "flex", minHeight: "100vh", backgroundColor: "var(--cream)" },
  sidebar: {
    width: "272px", backgroundColor: "var(--navy)", padding: "32px 24px",
    display: "flex", flexDirection: "column", gap: "20px", flexShrink: 0,
  },
  brand: { display: "flex", alignItems: "center", gap: "12px" },
  brandName: { fontFamily: "Cormorant Garamond, serif", fontSize: "22px", color: "var(--cream)", letterSpacing: "0.04em", fontWeight: "600" },
  nav: { display: "flex", flexDirection: "column", gap: "4px" },
  navItem: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", color: "var(--sage)", fontSize: "14px", cursor: "pointer" },
  navItemActive: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(197,212,208,0.12)", color: "var(--cream)", fontSize: "14px", cursor: "pointer", borderLeft: "2px solid var(--gold)" },
  badge: { marginLeft: "auto", backgroundColor: "var(--gold)", color: "var(--navy)", fontSize: "11px", fontWeight: "700", padding: "2px 7px", borderRadius: "100px" },
  infoBox: { padding: "14px", borderRadius: "10px", backgroundColor: "rgba(197,212,208,0.08)", border: "1px solid rgba(197,212,208,0.12)", display: "flex", flexDirection: "column", gap: "8px" },
  infoRow: { display: "flex", alignItems: "center", gap: "7px" },
  infoTitle: { fontSize: "12px", fontWeight: "600", color: "var(--gold)", letterSpacing: "0.04em" },
  infoText: { fontSize: "12px", color: "var(--sage)", lineHeight: "1.6" },
  techniquePills: { display: "flex", gap: "6px", flexWrap: "wrap" },
  pill: { fontSize: "11px", padding: "3px 10px", borderRadius: "100px", border: "1px solid rgba(197,212,208,0.25)", color: "var(--sage)" },
  infoSub: { fontSize: "10px", color: "rgba(197,212,208,0.45)", fontStyle: "italic" },
  userSection: { marginTop: "auto", display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "10px", backgroundColor: "rgba(197,212,208,0.08)" },
  avatar: { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "var(--navy)", fontWeight: "600", flexShrink: 0 },
  userInfo: { flex: 1, display: "flex", flexDirection: "column", gap: "1px", overflow: "hidden" },
  userName: { fontSize: "13px", color: "var(--cream)", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userEmail: { fontSize: "11px", color: "var(--teal)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  logoutBtn: { background: "none", border: "none", cursor: "pointer", padding: "4px", flexShrink: 0, display: "flex", alignItems: "center" },
  main: { flex: 1, padding: "48px 56px", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  pageTitle: { fontFamily: "Cormorant Garamond, serif", fontSize: "36px", fontWeight: "500", color: "var(--navy)" },
  pageSubtitle: { fontSize: "14px", color: "var(--teal)", marginTop: "4px" },
  inputCard: { backgroundColor: "white", borderRadius: "16px", padding: "28px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 1px 4px rgba(14,50,82,0.06)" },
  inputRow: { display: "flex", gap: "12px", alignItems: "flex-end" },
  inputGroup: { flex: 1, display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--teal)", fontWeight: "600" },
  optional: { textTransform: "none", opacity: 0.6, letterSpacing: 0 },
  input: { padding: "13px 16px", fontSize: "15px", border: "1.5px solid var(--sage)", borderRadius: "10px", backgroundColor: "var(--cream)", color: "var(--navy)", outline: "none" },
  contextRow: { display: "flex", flexDirection: "column", gap: "6px" },
  textarea: { padding: "12px 16px", fontSize: "14px", border: "1.5px solid var(--sage)", borderRadius: "10px", backgroundColor: "var(--cream)", color: "var(--navy)", outline: "none", resize: "none", lineHeight: "1.6" },
  btn: { padding: "13px 28px", fontSize: "14px", letterSpacing: "0.04em", backgroundColor: "var(--navy)", color: "var(--cream)", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", whiteSpace: "nowrap", flexShrink: 0 },
  btnDisabled: { padding: "13px 28px", fontSize: "14px", backgroundColor: "var(--sage)", color: "var(--teal)", border: "none", borderRadius: "10px", cursor: "not-allowed", fontWeight: "600", whiteSpace: "nowrap", flexShrink: 0 },
  btnInner: { display: "flex", alignItems: "center", gap: "8px" },
  spinner: { width: "14px", height: "14px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", display: "inline-block", animation: "spin 0.8s linear infinite" },
  errorBox: { backgroundColor: "#fdf0ee", color: "#c0392b", padding: "14px 18px", borderRadius: "10px", fontSize: "14px" },
  loadingCard: { backgroundColor: "white", borderRadius: "16px", padding: "60px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", boxShadow: "0 1px 4px rgba(14,50,82,0.06)" },
  loadingDots: { display: "flex", gap: "8px" },
  dot: { width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--teal)", display: "inline-block", animation: "bounce 1.2s ease-in-out infinite" },
  loadingText: { fontSize: "14px", color: "var(--teal)" },
  resultCard: { backgroundColor: "white", borderRadius: "16px", padding: "32px", boxShadow: "0 1px 4px rgba(14,50,82,0.06)" },
  resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid var(--sage)" },
  techniqueBadge: { display: "inline-block", marginBottom: "8px", padding: "4px 12px", borderRadius: "100px", color: "white", fontSize: "12px", fontWeight: "600", letterSpacing: "0.04em" },
  resultWord: { fontFamily: "Cormorant Garamond, serif", fontSize: "40px", fontWeight: "500", color: "var(--navy)" },
  resultDef: { fontSize: "14px", color: "var(--teal)", marginTop: "4px", lineHeight: "1.6", maxWidth: "500px" },
  downloadBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", fontSize: "13px", fontWeight: "600", backgroundColor: "var(--navy)", color: "var(--cream)", border: "none", borderRadius: "8px", cursor: "pointer" },
  downloadBtnDisabled: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", fontSize: "13px", fontWeight: "600", backgroundColor: "var(--sage)", color: "var(--teal)", border: "none", borderRadius: "8px", cursor: "not-allowed" },
  resultBody: { display: "flex", gap: "40px" },
  textCol: { flex: 1, display: "flex", flexDirection: "column", gap: "20px" },
  infoBlock: { display: "flex", flexDirection: "column", gap: "8px" },
  infoLabel: { fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--teal)", fontWeight: "600" },
  infoText: { fontSize: "14px", color: "var(--navy)", lineHeight: "1.7" },
  mnemonicText: { fontSize: "16px", color: "var(--navy)", lineHeight: "1.8", fontStyle: "italic", borderLeft: "3px solid var(--gold)", paddingLeft: "16px" },
  memorySentence: { fontSize: "16px", color: "var(--navy)", lineHeight: "1.8", fontWeight: "500", borderLeft: "3px solid var(--teal)", paddingLeft: "16px" },
  acronymBox: { backgroundColor: "var(--cream)", borderRadius: "12px", padding: "18px", border: "1.5px solid var(--sage)" },
  acronymGrid: { display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" },
  acronymRow: { display: "flex", alignItems: "center", gap: "14px" },
  acronymLetter: { width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "var(--navy)", color: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontFamily: "Cormorant Garamond, serif", fontWeight: "600", flexShrink: 0 },
  acronymMeaning: { fontSize: "14px", color: "var(--navy)", fontWeight: "400" },
  divider: { height: "1px", backgroundColor: "var(--sage)", opacity: 0.5 },
  imageCol: { width: "340px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "10px" },
  imageWrapper: { borderRadius: "12px", overflow: "hidden", border: "1px solid var(--sage)" },
  image: { width: "100%", display: "block" },
  imageCaption: { fontSize: "11px", color: "var(--teal)", textAlign: "center", letterSpacing: "0.05em" },
  emptyState: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "60px 0" },
  emptyIcon: { fontSize: "48px", color: "var(--sage)", fontFamily: "Cormorant Garamond, serif" },
  emptyTitle: { fontFamily: "Cormorant Garamond, serif", fontSize: "28px", fontWeight: "300", color: "var(--navy)" },
  emptyText: { fontSize: "15px", color: "var(--teal)", textAlign: "center", lineHeight: "1.8" },
  exampleSection: { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", marginTop: "8px" },
  exampleLabel: { fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--teal)", fontWeight: "600" },
  exampleRow: { display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" },
  exampleChip: { padding: "8px 16px", borderRadius: "100px", border: "1px solid var(--sage)", color: "var(--teal)", fontSize: "13px", cursor: "pointer", backgroundColor: "white" },
  historyGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" },
  historyCard: { backgroundColor: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(14,50,82,0.06)" },
  historyImageWrapper: { position: "relative", overflow: "hidden" },
  historyImage: { width: "100%", height: "200px", objectFit: "cover", display: "block" },
  downloadOverlay: { position: "absolute", top: "10px", right: "10px", backgroundColor: "rgba(14,50,82,0.7)", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  techniqueOverlay: { position: "absolute", top: "10px", left: "10px", fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "100px", color: "var(--navy)" },
  historyContent: { padding: "16px", display: "flex", flexDirection: "column", gap: "8px" },
  historyTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  historyWord: { fontFamily: "Cormorant Garamond, serif", fontSize: "22px", fontWeight: "500", color: "var(--navy)" },
  historyMeaning: { fontSize: "13px", color: "var(--teal)", lineHeight: "1.5" },
  historyMnemonic: { fontSize: "14px", color: "var(--navy)", fontStyle: "italic", lineHeight: "1.6", borderLeft: "2px solid var(--gold)", paddingLeft: "10px" },
  historyDate: { fontSize: "11px", color: "var(--sage)", marginTop: "4px" },
};