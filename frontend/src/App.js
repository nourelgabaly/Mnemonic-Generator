import { useState } from "react";
import axios from "axios";

function App() {
  const [word, setWord] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!word.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post("http://localhost:8000/generate", {
        word,
        context
      });
      setResult(response.data);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Visual Mnemonic Generator</h1>
      <p style={styles.subtitle}>Enter any word or concept to generate a memory aid</p>

      <div style={styles.card}>
        <input
          style={styles.input}
          type="text"
          placeholder="Enter a word or concept (e.g. Photosynthesis)"
          value={word}
          onChange={(e) => setWord(e.target.value)}
        />
        <textarea
          style={styles.textarea}
          placeholder="Optional: add a sentence or context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={3}
        />
        <button
          style={loading ? styles.buttonDisabled : styles.button}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Mnemonic"}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {result && (
        <div style={styles.resultCard}>
          <h2 style={styles.word}>{result.word}</h2>
          <div style={styles.row}>
            <div style={styles.textSection}>
              <p><span style={styles.label}>Meaning:</span> {result.simple_meaning}</p>
              <p><span style={styles.label}>Technique:</span> {result.technique}</p>
              <p><span style={styles.label}>Mnemonic:</span> {result.mnemonic}</p>
            </div>
            <div style={styles.imageSection}>
              <img
                src={result.image_url}
                alt={`Mnemonic for ${result.word}`}
                style={styles.image}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh"
  },
  title: {
    textAlign: "center",
    color: "#2c3e50",
    fontSize: "2rem",
    marginBottom: "8px"
  },
  subtitle: {
    textAlign: "center",
    color: "#7f8c8d",
    marginBottom: "30px"
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none"
  },
  textarea: {
    padding: "12px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none",
    resize: "vertical"
  },
  button: {
    padding: "14px",
    fontSize: "16px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  buttonDisabled: {
    padding: "14px",
    fontSize: "16px",
    backgroundColor: "#95a5a6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "not-allowed",
    fontWeight: "bold"
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: "16px"
  },
  resultCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    marginTop: "24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  },
  word: {
    color: "#2c3e50",
    fontSize: "1.5rem",
    marginBottom: "16px",
    borderBottom: "2px solid #3498db",
    paddingBottom: "8px"
  },
  row: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap"
  },
  textSection: {
    flex: 1,
    minWidth: "250px",
    lineHeight: "1.8",
    color: "#2c3e50"
  },
  label: {
    fontWeight: "bold",
    color: "#3498db"
  },
  imageSection: {
    flex: 1,
    minWidth: "250px",
    display: "flex",
    justifyContent: "center"
  },
  image: {
    width: "100%",
    maxWidth: "400px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  }
};

export default App;