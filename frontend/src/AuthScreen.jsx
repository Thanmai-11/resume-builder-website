import { useState } from "react";
import { useAuth } from "./AuthContext";

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login(form.username, form.password);
      } else {
        await register(form.username, form.email, form.password);
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <h1>Resume Builder</h1>
        <p className="tagline">
          {mode === "login" ? "Log in to your saved resumes." : "Create an account to save resumes."}
        </p>

        <label>
          Username
          <input value={form.username} onChange={update("username")} required />
        </label>

        {mode === "register" && (
          <label>
            Email
            <input type="email" value={form.email} onChange={update("email")} />
          </label>
        )}

        <label>
          Password
          <input type="password" value={form.password} onChange={update("password")} required minLength={8} />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button className="btn-solid" type="submit" disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>

        <button
          type="button"
          className="link-btn"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Need an account? Register" : "Already have an account? Log in"}
        </button>
      </form>
    </div>
  );
}
