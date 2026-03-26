import { useState } from "react";
import Login from "../src/Pages/Login";
import Signup from "../src/Pages/Signup";
import Dashboard from "../src/Pages/Dashboard";
import ForgotPassword from "../src/Pages/ForgotPassword";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [confirmationEmail, setConfirmationEmail] = useState("");

  const handleLogin = (userData) => {
    setUser(userData);
    setPage("dashboard");
  };

  const handleSignup = (userData) => {
    setConfirmationEmail(userData.email);
    setPage("confirm");
  };

  const handleLogout = () => {
    setUser(null);
    setPage("login");
  };

  if (page === "login") return (
    <Login
      onLogin={handleLogin}
      onGoSignup={() => setPage("signup")}
      onGoForgot={() => setPage("forgot")}
    />
  );

  if (page === "signup") return (
    <Signup
      onSignup={handleSignup}
      onGoLogin={() => setPage("login")}
    />
  );

  if (page === "forgot") return (
    <ForgotPassword onGoLogin={() => setPage("login")} />
  );

  if (page === "confirm") return (
    <div style={cs.page}>
      <div style={cs.box}>
        <div style={cs.icon}>✉</div>
        <h2 style={cs.title}>Check your inbox</h2>
        <p style={cs.text}>
          We sent a confirmation link to <strong>{confirmationEmail}</strong>.
          Please confirm your email before signing in.
        </p>
        <button style={cs.btn} onClick={() => setPage("login")}>
          Go to sign in
        </button>
      </div>
    </div>
  );

  return <Dashboard user={user} onLogout={handleLogout} />;
}

const cs = {
  page: {
    minHeight: "100vh", display: "flex",
    alignItems: "center", justifyContent: "center",
    backgroundColor: "var(--cream)",
  },
  box: {
    backgroundColor: "white", borderRadius: "20px",
    padding: "56px 48px", maxWidth: "440px", width: "90%",
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: "16px", textAlign: "center",
    boxShadow: "0 2px 16px rgba(14,50,82,0.08)",
  },
  icon: {
    width: "64px", height: "64px", borderRadius: "50%",
    backgroundColor: "var(--sage)", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontSize: "28px",
  },
  title: {
    fontFamily: "Cormorant Garamond, serif", fontSize: "36px",
    fontWeight: "500", color: "var(--navy)",
  },
  text: { fontSize: "15px", color: "var(--teal)", lineHeight: "1.7" },
  btn: {
    marginTop: "8px", padding: "14px 32px", fontSize: "15px",
    backgroundColor: "var(--navy)", color: "var(--cream)",
    border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600",
  },
};