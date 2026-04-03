import { useState, useEffect } from "react";
import axios from "axios";
import { HiOutlineDownload } from "react-icons/hi";
import { MdOutlineAutoAwesome } from "react-icons/md";
import { TbHistory, TbLogout, TbLanguage, TbBrain } from "react-icons/tb";

const LANGUAGES = [
  "Arabic", "English", "French", "Spanish", "German",
  "Italian", "Portuguese", "Chinese", "Japanese", "Korean",
  "Turkish", "Russian", "Hindi", "Dutch", "Polish"
];

export default function Dashboard({ user, onLogout }) {
  const [word, setWord] = useState("");
  const [context, setContext] = useState("");
  const [nativeLang, setNativeLang] = useState("Arabic");
  const [targetLang, setTargetLang] = useState("English");
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
    if (nativeLang === targetLang) {
      setError("Native language and target language must be different.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await axios.post("http://localhost:8000/generate", {
        word,
        native_language: nativeLang,
        target_language: targetLang,
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

        <div style={s.langSection}>
          <p style={s.langTitle}>
            <TbLanguage size={14} style={{ marginRight: 6 }} />Language Settings
          </p>
          <div style={s.langField}>
            <label style={s.langLabel}>My language</label>
            <select style={s.select} value={nativeLang} onChange={e => setNativeLang(e.target.value)}>
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div style={s.langField}>
            <label style={s.langLabel}>I'm learning</label>
            <select style={s.select} value={targetLang} onChange={e => setTargetLang(e.target.value)}>
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          {nativeLang === targetLang && (
            <p style={s.langWarning}>Select two different languages</p>
          )}
        </div>

        <div style={s.theoryBadge}>
          <TbBrain size={13} style={{ flexShrink: 0 }} />
          <span style={s.theoryText}>Keyword Method + Rosch's Prototype Theory</span>
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
                <h1 style={s.pageTitle}>Visual Mnemonic Generator</h1>
                <p style={s.pageSubtitle}>
                  Keyword Method + Prototype Theory — enter a {targetLang} word to get a
                  cognitively optimized visual mnemonic in {nativeLang}
                </p>
              </div>
            </div>

            <div style={s.inputCard}>
              <div style={s.langPill}>
                <span style={s.langPillText}>{nativeLang}</span>
                <span style={s.langArrow}>→</span>
                <span style={s.langPillText}>{targetLang}</span>
              </div>

              <div style={s.inputRow}>
                <div style={s.inputGroup}>
                  <label style={s.label}>{targetLang} word to remember</label>
                  <input
                    style={s.input}
                    type="text"
                    placeholder="e.g. Ephemeral, Benevolent, Melancholy..."
                    value={word}
                    onChange={e => setWord(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <button
                  style={loading || !word.trim() || nativeLang === targetLang ? s.btnDisabled : s.btn}
                  onClick={handleGenerate}
                  disabled={loading || !word.trim() || nativeLang === targetLang}
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
                  placeholder="Add a sentence where you encountered this word..."
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
                <p style={s.loadingText}>Applying Keyword Method and Prototype Theory...</p>
              </div>
            )}

            {result && !loading && (
              <ResultCard result={result} onDownload={handleDownload} downloading={downloading} />
            )}

            {!result && !loading && !error && (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>◈</div>
                <h3 style={s.emptyTitle}>How it works</h3>
                <p style={s.emptyText}>
                  MemBrain finds a word in your language that <em>sounds like</em> the foreign word
                  — chosen using Rosch's prototype theory so it's maximally memorable —
                  then builds a vivid visual bridge that makes the meaning impossible to forget.
                </p>
                <div style={s.exampleRow}>
                  {["Ephemeral", "Benevolent", "Grave", "Veil", "Melancholy"].map(ex => (
                    <span key={ex} style={s.exampleChip} onClick={() => setWord(ex)}>{ex}</span>
                  ))}
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
                <p style={s.emptyText}>Go to Generate and create your first mnemonic!</p>
              </div>
            ) : (
              <div style={s.historyGrid}>
                {history.map((item, i) => (
                  <div key={i} style={s.historyCard}>
                    <div style={s.historyImageWrapper}>
                      <img src={item.image_url} alt={item.word} style={s.historyImage} />
                      <button style={s.downloadOverlay}
                        onClick={() => handleDownload(item.image_url, item.word)} title="Download">
                        <HiOutlineDownload size={18} color="white" />
                      </button>
                    </div>
                    <div style={s.historyContent}>
                      <div style={s.historyTop}>
                        <h3 style={s.historyWord}>{item.word}</h3>
                        <span style={s.historyBadge}>{item.technique}</span>
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
        select option{background:white;color:#0E3252}
      `}</style>
    </div>
  );
}

function ResultCard({ result, onDownload, downloading }) {
  return (
    <div style={s.resultCard}>
      <div style={s.resultHeader}>
        <div>
          <div style={s.resultLangBadge}>
            {result.native_language} → {result.target_language}
          </div>
          <h2 style={s.resultWord}>{result.word}</h2>
          <p style={s.resultMeaning}>{result.meaning}</p>
        </div>
        <button
          style={downloading ? s.downloadBtnDisabled : s.downloadBtn}
          onClick={() => onDownload(result.image_url, result.word)}
          disabled={downloading}
        >
          <HiOutlineDownload size={16} />
          {downloading ? "Downloading..." : "Download image"}
        </button>
      </div>

      <div style={s.resultBody}>
        <div style={s.textCol}>

          {/* Keyword bridge */}
          <div style={s.keywordBox}>
            <p style={s.keywordLabel}>Keyword bridge</p>
            <div style={s.keywordRow}>
              <div style={s.keywordItem}>
                <span style={s.kwTag}>{result.target_language}</span>
                <span style={s.kwWord}>{result.word}</span>
              </div>
              <span style={s.kwArrow}>sounds like</span>
              <div style={s.keywordItem}>
                <span style={s.kwTag}>{result.native_language}</span>
                <span style={s.kwWord}>{result.keyword}</span>
              </div>
            </div>
            <p style={s.kwSimilarity}>{result.keyword_similarity}</p>
          </div>

          {/* Rosch justification */}
          {result.rosch_justification && (
            <div style={s.roschBox}>
              <div style={s.roschHeader}>
                <TbBrain size={14} color="#68858F" />
                <span style={s.roschLabel}>Why this keyword is cognitively optimal</span>
              </div>
              <p style={s.roschText}>{result.rosch_justification}</p>
            </div>
          )}

          <div style={s.divider} />

          {/* Mnemonic */}
          <div style={s.infoBlock}>
            <p style={s.infoLabel}>Mnemonic</p>
            <p style={s.mnemonicText}>{result.mnemonic}</p>
          </div>

        </div>

        <div style={s.imageCol}>
          <div style={s.imageWrapper}>
            <img src={result.image_url} alt={`Mnemonic for ${result.word}`} style={s.image} />
          </div>
          <p style={s.imageCaption}>Prototype-optimized visual mnemonic</p>
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
  brandName: {
    fontFamily: "Cormorant Garamond, serif", fontSize: "22px",
    color: "var(--cream)", letterSpacing: "0.04em", fontWeight: "600",
  },
  nav: { display: "flex", flexDirection: "column", gap: "4px" },
  navItem: {
    display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
    borderRadius: "8px", color: "var(--sage)", fontSize: "14px", cursor: "pointer",
  },
  navItemActive: {
    display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
    borderRadius: "8px", backgroundColor: "rgba(197,212,208,0.12)",
    color: "var(--cream)", fontSize: "14px", cursor: "pointer",
    borderLeft: "2px solid var(--gold)",
  },
  badge: {
    marginLeft: "auto", backgroundColor: "var(--gold)", color: "var(--navy)",
    fontSize: "11px", fontWeight: "700", padding: "2px 7px", borderRadius: "100px",
  },
  langSection: {
    display: "flex", flexDirection: "column", gap: "10px",
    padding: "14px", borderRadius: "10px",
    backgroundColor: "rgba(197,212,208,0.08)",
    border: "1px solid rgba(197,212,208,0.12)",
  },
  langTitle: {
    fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase",
    color: "var(--sage)", fontWeight: "600", display: "flex", alignItems: "center",
  },
  langField: { display: "flex", flexDirection: "column", gap: "4px" },
  langLabel: { fontSize: "11px", color: "rgba(197,212,208,0.6)", letterSpacing: "0.04em" },
  select: {
    padding: "8px 10px", fontSize: "13px", borderRadius: "8px",
    border: "1px solid rgba(197,212,208,0.2)",
    backgroundColor: "rgba(14,50,82,0.6)",
    color: "var(--cream)", outline: "none", cursor: "pointer", width: "100%",
  },
  langWarning: { fontSize: "11px", color: "#E8836A", marginTop: "2px" },
  theoryBadge: {
    display: "flex", alignItems: "flex-start", gap: "7px",
    padding: "10px 12px", borderRadius: "8px",
    backgroundColor: "rgba(221,178,115,0.1)",
    border: "1px solid rgba(221,178,115,0.2)",
    color: "var(--gold)",
  },
  theoryText: { fontSize: "11px", lineHeight: "1.5", fontStyle: "italic" },
  userSection: {
    marginTop: "auto", display: "flex", alignItems: "center", gap: "10px",
    padding: "12px", borderRadius: "10px",
    backgroundColor: "rgba(197,212,208,0.08)",
  },
  avatar: {
    width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--gold)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "14px", color: "var(--navy)", fontWeight: "600", flexShrink: 0,
  },
  userInfo: { flex: 1, display: "flex", flexDirection: "column", gap: "1px", overflow: "hidden" },
  userName: { fontSize: "13px", color: "var(--cream)", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userEmail: { fontSize: "11px", color: "var(--teal)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  logoutBtn: { background: "none", border: "none", cursor: "pointer", padding: "4px", flexShrink: 0, display: "flex", alignItems: "center" },
  main: { flex: 1, padding: "48px 56px", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  pageTitle: { fontFamily: "Cormorant Garamond, serif", fontSize: "36px", fontWeight: "500", color: "var(--navy)" },
  pageSubtitle: { fontSize: "14px", color: "var(--teal)", marginTop: "4px", lineHeight: "1.6" },
  inputCard: {
    backgroundColor: "white", borderRadius: "16px", padding: "28px",
    display: "flex", flexDirection: "column", gap: "16px",
    boxShadow: "0 1px 4px rgba(14,50,82,0.06)",
  },
  langPill: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "8px 14px", borderRadius: "100px",
    backgroundColor: "var(--navy)", alignSelf: "flex-start",
  },
  langPillText: { fontSize: "13px", color: "var(--cream)", fontWeight: "500" },
  langArrow: { fontSize: "14px", color: "var(--gold)" },
  inputRow: { display: "flex", gap: "12px", alignItems: "flex-end" },
  inputGroup: { flex: 1, display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--teal)", fontWeight: "600" },
  optional: { textTransform: "none", opacity: 0.6, letterSpacing: 0 },
  input: {
    padding: "13px 16px", fontSize: "15px", border: "1.5px solid var(--sage)",
    borderRadius: "10px", backgroundColor: "var(--cream)", color: "var(--navy)", outline: "none",
  },
  contextRow: { display: "flex", flexDirection: "column", gap: "6px" },
  textarea: {
    padding: "12px 16px", fontSize: "14px", border: "1.5px solid var(--sage)",
    borderRadius: "10px", backgroundColor: "var(--cream)", color: "var(--navy)",
    outline: "none", resize: "none", lineHeight: "1.6",
  },
  btn: {
    padding: "13px 28px", fontSize: "14px", letterSpacing: "0.04em",
    backgroundColor: "var(--navy)", color: "var(--cream)", border: "none",
    borderRadius: "10px", cursor: "pointer", fontWeight: "600", whiteSpace: "nowrap", flexShrink: 0,
  },
  btnDisabled: {
    padding: "13px 28px", fontSize: "14px", backgroundColor: "var(--sage)",
    color: "var(--teal)", border: "none", borderRadius: "10px",
    cursor: "not-allowed", fontWeight: "600", whiteSpace: "nowrap", flexShrink: 0,
  },
  btnInner: { display: "flex", alignItems: "center", gap: "8px" },
  spinner: {
    width: "14px", height: "14px", borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white",
    display: "inline-block", animation: "spin 0.8s linear infinite",
  },
  errorBox: { backgroundColor: "#fdf0ee", color: "#c0392b", padding: "14px 18px", borderRadius: "10px", fontSize: "14px" },
  loadingCard: {
    backgroundColor: "white", borderRadius: "16px", padding: "60px",
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "16px", boxShadow: "0 1px 4px rgba(14,50,82,0.06)",
  },
  loadingDots: { display: "flex", gap: "8px" },
  dot: {
    width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--teal)",
    display: "inline-block", animation: "bounce 1.2s ease-in-out infinite",
  },
  loadingText: { fontSize: "14px", color: "var(--teal)" },
  resultCard: { backgroundColor: "white", borderRadius: "16px", padding: "32px", boxShadow: "0 1px 4px rgba(14,50,82,0.06)" },
  resultHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: "28px", paddingBottom: "20px", borderBottom: "1px solid var(--sage)",
  },
  resultLangBadge: {
    display: "inline-block", marginBottom: "8px", padding: "4px 12px",
    borderRadius: "100px", backgroundColor: "var(--navy)", color: "var(--gold)",
    fontSize: "12px", fontWeight: "600", letterSpacing: "0.04em",
  },
  resultWord: { fontFamily: "Cormorant Garamond, serif", fontSize: "40px", fontWeight: "500", color: "var(--navy)" },
  resultMeaning: { fontSize: "15px", color: "var(--teal)", marginTop: "4px" },
  downloadBtn: {
    display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px",
    fontSize: "13px", fontWeight: "600", backgroundColor: "var(--navy)",
    color: "var(--cream)", border: "none", borderRadius: "8px", cursor: "pointer",
  },
  downloadBtnDisabled: {
    display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px",
    fontSize: "13px", fontWeight: "600", backgroundColor: "var(--sage)",
    color: "var(--teal)", border: "none", borderRadius: "8px", cursor: "not-allowed",
  },
  resultBody: { display: "flex", gap: "40px" },
  textCol: { flex: 1, display: "flex", flexDirection: "column", gap: "16px" },
  keywordBox: {
    backgroundColor: "var(--cream)", borderRadius: "12px", padding: "18px",
    border: "1.5px solid var(--sage)",
  },
  keywordLabel: {
    fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase",
    color: "var(--teal)", fontWeight: "600", marginBottom: "12px",
  },
  keywordRow: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" },
  keywordItem: { display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" },
  kwTag: { fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--teal)", fontWeight: "600" },
  kwWord: { fontFamily: "Cormorant Garamond, serif", fontSize: "26px", fontWeight: "600", color: "var(--navy)" },
  kwArrow: { fontSize: "12px", color: "var(--teal)", fontStyle: "italic", padding: "0 4px", alignSelf: "center" },
  kwSimilarity: { fontSize: "12px", color: "var(--teal)", marginTop: "10px", fontStyle: "italic" },
  roschBox: {
    backgroundColor: "white", borderRadius: "10px", padding: "14px 16px",
    border: "1px solid var(--sage)",
  },
  roschHeader: { display: "flex", alignItems: "center", gap: "7px", marginBottom: "6px" },
  roschLabel: {
    fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase",
    color: "var(--teal)", fontWeight: "600",
  },
  roschText: { fontSize: "13px", color: "var(--navy)", lineHeight: "1.65", opacity: 0.85 },
  infoBlock: { display: "flex", flexDirection: "column", gap: "8px" },
  infoLabel: { fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--teal)", fontWeight: "600" },
  mnemonicText: {
    fontSize: "16px", color: "var(--navy)", lineHeight: "1.8",
    fontStyle: "italic", borderLeft: "3px solid var(--gold)", paddingLeft: "16px",
  },
  divider: { height: "1px", backgroundColor: "var(--sage)", opacity: 0.5 },
  imageCol: { width: "340px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "10px" },
  imageWrapper: { borderRadius: "12px", overflow: "hidden", border: "1px solid var(--sage)" },
  image: { width: "100%", display: "block" },
  imageCaption: { fontSize: "11px", color: "var(--teal)", textAlign: "center", letterSpacing: "0.05em" },
  emptyState: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "80px 0" },
  emptyIcon: { fontSize: "48px", color: "var(--sage)", fontFamily: "Cormorant Garamond, serif" },
  emptyTitle: { fontFamily: "Cormorant Garamond, serif", fontSize: "28px", fontWeight: "300", color: "var(--navy)" },
  emptyText: { fontSize: "15px", color: "var(--teal)", textAlign: "center", maxWidth: "420px", lineHeight: "1.7" },
  exampleRow: { display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", marginTop: "8px" },
  exampleChip: {
    padding: "8px 16px", borderRadius: "100px", border: "1px solid var(--sage)",
    color: "var(--teal)", fontSize: "13px", cursor: "pointer", backgroundColor: "white",
  },
  historyGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" },
  historyCard: { backgroundColor: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(14,50,82,0.06)" },
  historyImageWrapper: { position: "relative", overflow: "hidden" },
  historyImage: { width: "100%", height: "200px", objectFit: "cover", display: "block" },
  downloadOverlay: {
    position: "absolute", top: "10px", right: "10px",
    backgroundColor: "rgba(14,50,82,0.7)", border: "none", borderRadius: "8px",
    padding: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  },
  historyContent: { padding: "16px", display: "flex", flexDirection: "column", gap: "8px" },
  historyTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  historyWord: { fontFamily: "Cormorant Garamond, serif", fontSize: "22px", fontWeight: "500", color: "var(--navy)" },
  historyBadge: { fontSize: "11px", color: "var(--teal)", backgroundColor: "var(--sage)", padding: "3px 10px", borderRadius: "100px" },
  historyMeaning: { fontSize: "13px", color: "var(--teal)", lineHeight: "1.5" },
  historyMnemonic: { fontSize: "14px", color: "var(--navy)", fontStyle: "italic", lineHeight: "1.6", borderLeft: "2px solid var(--gold)", paddingLeft: "10px" },
  historyDate: { fontSize: "11px", color: "var(--sage)", marginTop: "4px" },
};