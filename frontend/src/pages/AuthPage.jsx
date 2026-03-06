import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, KeyRound, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";

export default function AuthPage() {
  const { user, signInWithPassword, signUp } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setMessage("");
    setError("");
  }, [mode]);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      if (mode === "login") {
        await signInWithPassword({ email, password });
      } else {
        await signUp({ email, password });
        setMessage("Sign-up successful. Check your email for the verification link.");
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-screen flex-col"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel grid w-full max-w-5xl gap-8 p-8 lg:grid-cols-[1.15fr_1fr]"
        >
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-3xl font-bold">Data Tampering Detection</h1>
              <ThemeToggle />
            </div>
            <p className="max-w-xl text-sm text-slate-600 dark:text-slate-300">
              Secure your records by creating deterministic SHA-256 hashes and comparing incoming payloads for tampering.
              Auth uses Supabase JWT.
            </p>
          </section>

          <section className="glass-panel border border-slate-200/70 p-6 dark:border-slate-700/60">
            <div className="mb-5 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`w-1/2 rounded-lg py-2 text-sm font-semibold ${
                  mode === "login" ? "bg-white shadow-sm dark:bg-slate-900" : "text-slate-500"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`w-1/2 rounded-lg py-2 text-sm font-semibold ${
                  mode === "signup" ? "bg-white shadow-sm dark:bg-slate-900" : "text-slate-500"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="space-y-1 text-sm font-medium">
                <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <Mail className="h-4 w-4" /> Email
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="field"
                  placeholder="you@example.com"
                />
              </label>

              <label className="space-y-1 text-sm font-medium">
                <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <KeyRound className="h-4 w-4" /> Password
                </span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="field"
                  placeholder="At least 8 characters"
                />
              </label>

              <button type="submit" className="btn-primary w-full" disabled={busy}>
                {busy ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
              </button>
            </form>

            {message && <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}

            {error && (
              <p className="mt-3 inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" /> {error}
              </p>
            )}
          </section>
        </motion.div>
      </div>
      <Footer />
    </motion.div>
  );
}
