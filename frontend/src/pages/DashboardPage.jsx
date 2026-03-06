import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, Copy, LogOut, Plus, ShieldCheck, FileUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";
import { createRecord, fetchProfile, fetchRecords, verifyRecord } from "../api/client";
import { computeFileHash } from "../lib/hash";

const DEFAULT_JSON = JSON.stringify(
  {
    invoiceId: "INV-2026-001",
    amount: 10450,
    currency: "USD",
    status: "APPROVED"
  },
  null,
  2
);

export default function DashboardPage() {
  const { user, signOut, getAccessToken } = useAuth();
  const [profile, setProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [label, setLabel] = useState("Transaction Payload");
  const [createMode, setCreateMode] = useState("text");
  const [createJson, setCreateJson] = useState(DEFAULT_JSON);
  const [createFile, setCreateFile] = useState(null);
  const [verifyMode, setVerifyMode] = useState("text");
  const [verifyJson, setVerifyJson] = useState(DEFAULT_JSON);
  const [verifyFile, setVerifyFile] = useState(null);
  const [selectedRecordId, setSelectedRecordId] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const token = getAccessToken();

  const selectedRecord = useMemo(
    () => records.find((record) => record.id === selectedRecordId) ?? null,
    [records, selectedRecordId]
  );

  async function refreshRecords() {
    if (!token) {
      return;
    }

    const [profilePayload, recordsPayload] = await Promise.all([fetchProfile(token), fetchRecords(token)]);
    setProfile(profilePayload.user);
    setRecords(recordsPayload.records ?? []);
    if (!selectedRecordId && recordsPayload.records?.length) {
      setSelectedRecordId(recordsPayload.records[0].id);
    }
  }

  useEffect(() => {
    refreshRecords().catch((error) => {
      setStatus({ type: "error", message: error.message });
    });
  }, [token]);

  async function handleCreateRecord(event) {
    event.preventDefault();
    setBusy(true);
    setStatus({ type: "idle", message: "" });

    try {
      let parsed;
      if (createMode === "text") {
        parsed = JSON.parse(createJson);
      } else {
        if (!createFile) throw new Error("Please select a file to hash.");
        const hash = await computeFileHash(createFile);
        parsed = { file: { name: createFile.name, size: createFile.size, type: createFile.type, hash } };
      }
      
      const payload = await createRecord(token, { label, data: parsed });
      setStatus({ type: "ok", message: payload.message });
      await refreshRecords();
      setCreateFile(null);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(event) {
    event.preventDefault();

    if (!selectedRecordId) {
      setStatus({ type: "error", message: "Pick a record first." });
      return;
    }

    setBusy(true);
    setStatus({ type: "idle", message: "" });

    try {
      let parsed;
      if (verifyMode === "text") {
        parsed = JSON.parse(verifyJson);
      } else {
        if (!verifyFile) throw new Error("Please select a file to hash.");
        const hash = await computeFileHash(verifyFile);
        parsed = { file: { name: verifyFile.name, size: verifyFile.size, type: verifyFile.type, hash } };
      }

      const payload = await verifyRecord(token, {
        recordId: selectedRecordId,
        data: parsed
      });

      setResult(payload.result);
      setStatus({
        type: payload.result.tampered ? "warn" : "ok",
        message: payload.message
      });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function copyHash(hash) {
    await navigator.clipboard.writeText(hash);
    setStatus({ type: "ok", message: "Hash copied to clipboard." });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-screen flex-col"
    >
      <div className="mx-auto max-w-7xl flex-1 space-y-6 px-4 py-8">
        <header className="glass-panel flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Tampering Control Center</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">{user?.email}</p>
            {profile?.email && <p className="text-xs text-slate-500 dark:text-slate-400">Verified via JWT</p>}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button type="button" onClick={signOut} className="btn-secondary gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </header>

        {status.message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-panel text-sm ${
              status.type === "error"
                ? "border-red-200 text-red-700 dark:border-red-900/60 dark:text-red-300"
                : status.type === "warn"
                  ? "border-amber-200 text-amber-700 dark:border-amber-900/50 dark:text-amber-300"
                  : "border-emerald-200 text-emerald-700 dark:border-emerald-900/60 dark:text-emerald-300"
            }`}
          >
            {status.message}
          </motion.div>
        )}

        <section className="grid gap-5 lg:grid-cols-2">
          <motion.form
            onSubmit={handleCreateRecord}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel space-y-3"
          >
            <h2 className="inline-flex items-center gap-2 font-display text-xl font-semibold">
              <Plus className="h-5 w-5" /> Register Hash Snapshot
            </h2>
            <input
              className="field"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Record label"
              required
            />
            <div className="mb-2 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button type="button" onClick={() => setCreateMode("text")} className={`w-1/2 rounded-lg py-1.5 text-xs font-semibold ${createMode === "text" ? "bg-white shadow-sm dark:bg-slate-900" : "text-slate-500"}`}>Text Payload</button>
              <button type="button" onClick={() => setCreateMode("file")} className={`w-1/2 rounded-lg py-1.5 text-xs font-semibold ${createMode === "file" ? "bg-white shadow-sm dark:bg-slate-900" : "text-slate-500"}`}>File Upload</button>
            </div>
            {createMode === "text" ? (
              <textarea
                rows={8}
                className="field font-mono text-xs"
                value={createJson}
                onChange={(event) => setCreateJson(event.target.value)}
                required
              />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/50">
                <input type="file" className="hidden" id="create-file" onChange={(e) => setCreateFile(e.target.files[0])} />
                <motion.label
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  htmlFor="create-file" 
                  className="flex cursor-pointer flex-col items-center gap-2"
                >
                  <FileUp className="h-8 w-8 text-slate-400" />
                  <span className="text-sm font-medium">{createFile ? createFile.name : "Click to select a file"}</span>
                  {createFile && <span className="text-xs text-slate-500">{(createFile.size / 1024).toFixed(1)} KB</span>}
                </motion.label>
              </div>
            )}
            <button type="submit" className="btn-primary w-full" disabled={busy || !token}>
              {busy ? "Processing..." : "Create Hash"}
            </button>
          </motion.form>

          <motion.form
            onSubmit={handleVerify}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-panel space-y-3"
          >
            <h2 className="inline-flex items-center gap-2 font-display text-xl font-semibold">
              <ShieldCheck className="h-5 w-5" /> Verify Data Integrity
            </h2>

            <select
              className="field"
              value={selectedRecordId}
              onChange={(event) => setSelectedRecordId(event.target.value)}
              required
            >
              <option value="">Select stored record</option>
              {records.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.label} ({new Date(record.created_at).toLocaleString()})
                </option>
              ))}
            </select>

            <div className="mb-2 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button type="button" onClick={() => setVerifyMode("text")} className={`w-1/2 rounded-lg py-1.5 text-xs font-semibold ${verifyMode === "text" ? "bg-white shadow-sm dark:bg-slate-900" : "text-slate-500"}`}>Text Payload</button>
              <button type="button" onClick={() => setVerifyMode("file")} className={`w-1/2 rounded-lg py-1.5 text-xs font-semibold ${verifyMode === "file" ? "bg-white shadow-sm dark:bg-slate-900" : "text-slate-500"}`}>File Upload</button>
            </div>
            {verifyMode === "text" ? (
              <textarea
                rows={8}
                className="field font-mono text-xs"
                value={verifyJson}
                onChange={(event) => setVerifyJson(event.target.value)}
                required
              />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/50">
                <input type="file" className="hidden" id="verify-file" onChange={(e) => setVerifyFile(e.target.files[0])} />
                <motion.label
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  htmlFor="verify-file"
                  className="flex cursor-pointer flex-col items-center gap-2"
                >
                  <FileUp className="h-8 w-8 text-slate-400" />
                  <span className="text-sm font-medium">{verifyFile ? verifyFile.name : "Click to select a file"}</span>
                  {verifyFile && <span className="text-xs text-slate-500">{(verifyFile.size / 1024).toFixed(1)} KB</span>}
                </motion.label>
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={busy || !token}>
              {busy ? "Comparing..." : "Compare Hash"}
            </button>
          </motion.form>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <div className="glass-panel">
            <h3 className="mb-3 font-display text-lg font-semibold">Stored Hash Records</h3>
            <div className="space-y-2">
              {records.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">No records yet. Create one to start checking tampering.</p>
              )}

              {records.map((record) => (
                <div
                  key={record.id}
                  className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <p className="font-semibold">{record.label}</p>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(record.created_at).toLocaleString()}</span>
                  </div>
                  <p className="break-all font-mono text-xs text-slate-600 dark:text-slate-300">{record.data_hash}</p>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      className="btn-secondary gap-1 px-3 py-1.5 text-xs"
                      onClick={() => copyHash(record.data_hash)}
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel">
            <h3 className="mb-3 font-display text-lg font-semibold">Verification Result</h3>
            {!result && <p className="text-sm text-slate-500 dark:text-slate-400">No comparison run yet.</p>}

            {result && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
                    result.tampered
                      ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  }`}
                >
                  {result.tampered ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  {result.tampered ? "Tampered" : "Intact"}
                </div>

                <div className="space-y-2 text-xs">
                  <p>
                    <span className="font-semibold">Record:</span> {selectedRecord?.label}
                  </p>
                  <p className="break-all font-mono">
                    <span className="font-semibold font-body">Original:</span> {result.originalHash}
                  </p>
                  <p className="break-all font-mono">
                    <span className="font-semibold font-body">Incoming:</span> {result.incomingHash}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </motion.div>
  );
}
