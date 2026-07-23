import { useState, useEffect } from "react";
import {
  Users, Play, RefreshCw, Lock, Download,
  BarChart3, Trash2, Calendar, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isTestMode, setTestToken } from "@/hooks/useAnalytics";

interface DailyRow {
  date: string;
  visitors: number;
  quizStart: number;
  quizDisqualified: number;
  quizCompleted: number;
  formSubmitted: number;
  vslVisitors: number;
  videoStart: number;
  calendlyOpen: number;
  calendlyBooked: number;
}

interface StatsData {
  visitors: number;
  totalPageViews: number;
  quizStart: number;
  quizDisqualified: number;
  quizCompleted: number;
  formSubmitted: number;
  vslVisitors: number;
  videoStart: number;
  calendlyOpen: number;
  calendlyBooked: number;
  daily: DailyRow[];
  questionFunnel: {
    id: number;
    label: string;
    reached: number;
    disqualified: number;
    answerBreakdown?: { answer: string; count: number; disqualifying: boolean }[];
  }[];
}

// Today's date in German time (Europe/Berlin) as YYYY-MM-DD
function berlinToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

function shiftDay(day: string, delta: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + delta));
  return dt.toISOString().slice(0, 10);
}

function formatGermanDate(day: string): string {
  const [y, m, d] = day.split("-");
  return `${d}.${m}.${y}`;
}

function pct(num: number, denom: number) {
  if (!denom) return "–";
  return Math.round((num / denom) * 100) + "%";
}

function KpiCard({ label, value, sub, accent }: { label: string; value: number; sub?: string; accent?: string }) {
  return (
    <div className="bg-background rounded-xl p-4 sm:p-5 border border-border">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-3xl sm:text-4xl font-bold tabular-nums ${accent || "text-foreground"}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function FunnelRow({ step, label, value, base, color }: {
  step: string; label: string; value: number; base: number; color: string;
}) {
  const percentage = base > 0 ? Math.round((value / base) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-xs font-mono text-muted-foreground w-6 text-right flex-shrink-0">{step}</span>
      <span className="text-sm font-medium text-foreground w-48 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-2.5">
        <div className={`h-2.5 rounded-full transition-all ${color}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
      <span className="text-sm font-bold tabular-nums text-foreground w-12 text-right flex-shrink-0">{value}</span>
      <span className="text-xs text-muted-foreground w-12 text-right flex-shrink-0">{pct(value, base)}</span>
    </div>
  );
}

function QuestionFunnelRow({ step, label, reached, disqualified, base, answerBreakdown }: {
  step: number;
  label: string;
  reached: number;
  disqualified: number;
  base: number;
  answerBreakdown?: { answer: string; count: number; disqualifying: boolean }[];
}) {
  const percentage = base > 0 ? Math.round((reached / base) * 100) : 0;
  return (
    <div className="py-2 border-b border-border/40 last:border-0">
      <div className="flex items-start gap-2 mb-1.5">
        <span className="text-xs font-mono text-muted-foreground mt-0.5 flex-shrink-0">F{step}</span>
        <span className="text-sm font-medium text-foreground leading-snug">{label}</span>
      </div>
      <div className="flex items-center gap-3 pl-6">
        <div className="flex-1 bg-muted rounded-full h-2.5">
          <div className="h-2.5 rounded-full transition-all bg-indigo-400" style={{ width: `${Math.min(percentage, 100)}%` }} />
        </div>
        <span className="text-sm font-bold tabular-nums text-foreground w-10 text-right flex-shrink-0">{reached}</span>
        <span className="text-xs text-muted-foreground w-12 text-right flex-shrink-0">{pct(reached, base)}</span>
        {disqualified > 0 ? (
          <span className="text-xs font-semibold text-red-500 w-28 text-right flex-shrink-0">
            ✗ {disqualified} raus
          </span>
        ) : (
          <span className="w-28 flex-shrink-0" />
        )}
      </div>
      {answerBreakdown && answerBreakdown.length > 0 && (
        <div className="pl-6 mt-2 flex flex-wrap gap-1.5">
          {answerBreakdown.map((a) => (
            <span
              key={a.answer}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                a.disqualifying
                  ? "bg-red-500/10 text-red-500 border border-red-500/30"
                  : "bg-muted text-muted-foreground border border-border/50"
              }`}
            >
              {a.disqualifying && <span aria-hidden>✗</span>}
              {a.answer}
              <span className="font-bold tabular-nums">{a.count}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
      <div className={`h-8 w-8 rounded-lg ${color} flex items-center justify-center`}>{icon}</div>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
    </div>
  );
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string>("heute");

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [testMode, setTestModeState] = useState(() => isTestMode());

  const [startDate, setStartDate] = useState(() => berlinToday());
  const [endDate, setEndDate] = useState(() => berlinToday());

  const getAuthHeader = () => {
    const credentials = sessionStorage.getItem("adminCredentials");
    return credentials ? `Basic ${credentials}` : null;
  };

  const handleToggleTestMode = async () => {
    if (testMode) {
      setTestToken(null);
      setTestModeState(false);
      return;
    }
    const authHeader = getAuthHeader();
    if (!authHeader) { setIsAuthenticated(false); return; }
    try {
      const res = await fetch("/api/test-token", { headers: { Authorization: authHeader } });
      const data = await res.json();
      if (data?.token) {
        setTestToken(data.token);
        setTestModeState(true);
      } else {
        setError("Kein Test-Token konfiguriert. Bitte ADMIN_TEST_TOKEN in den Secrets setzen (in Replit und auf Render).");
      }
    } catch {
      setError("Testmodus konnte nicht aktiviert werden.");
    }
  };

  const fetchStats = async (start?: string, end?: string) => {
    const s = start || startDate;
    const e = end || endDate;
    const authHeader = getAuthHeader();
    if (!authHeader) { setIsAuthenticated(false); return; }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics/stats?startDate=${s}&endDate=${e}`, {
        headers: { Authorization: authHeader },
      });
      if (res.status === 401) {
        sessionStorage.removeItem("adminCredentials");
        setIsAuthenticated(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError("Fehler beim Laden der Statistiken");
      }
    } catch {
      setError("Verbindungsfehler");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("adminCredentials")) setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchStats();
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    const credentials = btoa(`${username}:${password}`);
    try {
      const res = await fetch(`/api/analytics/stats?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Basic ${credentials}` },
      });
      if (res.status === 401) {
        setLoginError("Falscher Benutzername oder Passwort");
      } else {
        sessionStorage.setItem("adminCredentials", credentials);
        setIsAuthenticated(true);
        const data = await res.json();
        if (data.success) setStats(data.data);
      }
    } catch {
      setLoginError("Verbindungsfehler");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminCredentials");
    setIsAuthenticated(false);
    setStats(null);
    setUsername("");
    setPassword("");
  };

  const handleReset = async () => {
    const confirmed = window.confirm(
      "⚠️ ACHTUNG: Alle Tracking-Daten (Seitenaufrufe + Events) werden unwiderruflich gelöscht. Leads bleiben erhalten.\n\nWirklich zurücksetzen?"
    );
    if (!confirmed) return;
    const authHeader = getAuthHeader();
    if (!authHeader) return;
    setIsResetting(true);
    try {
      const res = await fetch("/api/analytics/reset", {
        method: "DELETE",
        headers: { Authorization: authHeader },
      });
      const data = await res.json();
      if (data.success) {
        setStats(null);
        alert("✅ Alle Tracking-Daten wurden erfolgreich gelöscht.");
        fetchStats();
      } else {
        alert("Fehler beim Zurücksetzen: " + data.message);
      }
    } catch {
      alert("Verbindungsfehler");
    } finally {
      setIsResetting(false);
    }
  };

  const handleExportCSV = async () => {
    const authHeader = getAuthHeader();
    if (!authHeader) return;
    try {
      const res = await fetch("/api/leads/export-csv", { headers: { Authorization: authHeader } });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "leads-export.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch {}
  };

  const applyPreset = (preset: string) => {
    setActivePreset(preset);
    const today = berlinToday();
    let s = today;
    let e = today;
    if (preset === "gestern") {
      s = shiftDay(today, -1);
      e = shiftDay(today, -1);
    } else if (preset === "7") {
      s = shiftDay(today, -6);
    } else if (preset === "30") {
      s = shiftDay(today, -29);
    }
    setStartDate(s);
    setEndDate(e);
    fetchStats(s, e);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <p className="text-muted-foreground mt-2">Bitte melde dich an, um das Dashboard zu sehen.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Benutzername</label>
                <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Benutzername" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Passwort</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Passwort" required />
              </div>
              {loginError && (
                <div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">{loginError}</div>
              )}
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? "Anmelden..." : "Anmelden"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const presets = [
    { label: "Heute", value: "heute" },
    { label: "Gestern", value: "gestern" },
    { label: "7 Tage", value: "7" },
    { label: "30 Tage", value: "30" },
  ];

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-primary" />
              Funnel Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">KI-Klick Methode · Alle Zeiten in deutscher Zeit (Kalendertage)</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              CSV Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => fetchStats()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Aktualisieren
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isResetting}
              className="text-destructive border-destructive/40 hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isResetting ? "Wird gelöscht..." : "Daten zurücksetzen"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleTestMode}
              className={testMode ? "text-amber-600 border-amber-500/60 bg-amber-500/10 hover:bg-amber-500/20" : ""}
              title="Wenn aktiv, werden deine eigenen Durchläufe auf diesem Gerät nicht mitgezählt."
            >
              {testMode ? "🧪 Testmodus AN" : "Testmodus aus"}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Abmelden
            </Button>
          </div>
        </div>

        {testMode && (
          <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
            🧪 <strong>Testmodus ist aktiv</strong> – Deine eigenen Funnel-Durchläufe auf diesem Gerät/Browser werden NICHT in den Statistiken gezählt und erzeugen keinen Lead-Eintrag (die Test-Mail wird trotzdem versendet). Zum echten Tracken wieder ausschalten.
          </div>
        )}

        {/* Time Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex gap-2 flex-wrap">
                {presets.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => applyPreset(p.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activePreset === p.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="flex items-end gap-2 ml-auto">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Von</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setActivePreset("custom"); }}
                    className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Bis</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setActivePreset("custom"); }}
                    className="px-3 py-2 text-sm border border-border rounded-lg bg-background"
                  />
                </div>
                <Button size="sm" onClick={() => fetchStats()} disabled={isLoading}>
                  {isLoading ? "..." : "Filtern"}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              „Heute" = der heutige Kalendertag ab 00:00 Uhr deutscher Zeit (nicht die letzten 24 Stunden).
            </p>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Lade Statistiken...</p>
          </div>
        )}

        {!isLoading && stats && (
          <div className="space-y-6">

            {/* QUIZ-SEITE */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-5 sm:p-6">
                <SectionHeader
                  icon={<Users className="h-4 w-4 text-primary" />}
                  title="Quiz-Seite"
                  color="bg-primary/10"
                />
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-5">
                  <KpiCard label="Seitenbesucher" value={stats.visitors} sub="eindeutige Besucher" />
                  <KpiCard label="Quiz gestartet" value={stats.quizStart} sub={pct(stats.quizStart, stats.visitors) + " der Besucher"} />
                  <KpiCard label="Rausgeflogen" value={stats.quizDisqualified} sub={pct(stats.quizDisqualified, stats.quizStart) + " der Starts"} accent="text-red-500" />
                  <KpiCard label="Quiz beendet" value={stats.quizCompleted} sub={pct(stats.quizCompleted, stats.quizStart) + " der Starts"} accent="text-green-600" />
                  <KpiCard label="Formular ausgefüllt" value={stats.formSubmitted} sub="→ zur VSL-Seite" accent="text-primary" />
                </div>
                <div className="space-y-1.5">
                  <FunnelRow step="1" label="Seitenbesucher" value={stats.visitors} base={stats.visitors} color="bg-blue-400" />
                  <FunnelRow step="2" label="Quiz gestartet" value={stats.quizStart} base={stats.visitors} color="bg-indigo-400" />
                  <FunnelRow step="3" label="Quiz beendet" value={stats.quizCompleted} base={stats.visitors} color="bg-green-500" />
                  <FunnelRow step="4" label="Formular ausgefüllt" value={stats.formSubmitted} base={stats.visitors} color="bg-primary" />
                </div>
              </CardContent>
            </Card>

            {/* ABBRÜCHE PRO FRAGE */}
            <Card>
              <CardContent className="p-5 sm:p-6">
                <SectionHeader
                  icon={<XCircle className="h-4 w-4 text-red-500" />}
                  title="Abbrüche pro Frage"
                  color="bg-red-500/10"
                />
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Der Balken zeigt, wie viele Besucher die Frage <strong>beantwortet</strong> haben (im Verhältnis zum Quiz-Start).
                  Die rote Zahl zeigt, wie viele genau <strong>bei dieser Frage rausgeflogen</strong> sind.
                </p>
                <div>
                  {(stats.questionFunnel || []).map((q, i) => (
                    <QuestionFunnelRow
                      key={q.id}
                      step={i + 1}
                      label={q.label}
                      reached={q.reached}
                      disqualified={q.disqualified}
                      base={stats.quizStart}
                      answerBreakdown={q.answerBreakdown}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* VSL-SEITE */}
            <Card>
              <CardContent className="p-5 sm:p-6">
                <SectionHeader
                  icon={<Play className="h-4 w-4 text-orange-600" />}
                  title="VSL-Seite"
                  color="bg-orange-500/10"
                />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
                  <KpiCard label="VSL-Besucher" value={stats.vslVisitors} sub="eindeutige Besucher" />
                  <KpiCard label="Video gestartet" value={stats.videoStart} sub={pct(stats.videoStart, stats.vslVisitors) + " der VSL-Besucher"} />
                  <KpiCard label="Kalender geöffnet" value={stats.calendlyOpen} sub="Klick auf Termin-Button" />
                  <KpiCard label="Termin gebucht" value={stats.calendlyBooked} sub="bestätigte Calendly-Buchung" accent="text-green-600" />
                </div>
                <div className="space-y-1.5">
                  <FunnelRow step="1" label="VSL-Besucher" value={stats.vslVisitors} base={stats.vslVisitors} color="bg-orange-300" />
                  <FunnelRow step="2" label="Video gestartet" value={stats.videoStart} base={stats.vslVisitors} color="bg-orange-400" />
                  <FunnelRow step="3" label="Kalender geöffnet" value={stats.calendlyOpen} base={stats.vslVisitors} color="bg-amber-500" />
                  <FunnelRow step="4" label="Termin gebucht" value={stats.calendlyBooked} base={stats.vslVisitors} color="bg-green-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                  „Termin gebucht" wird nur gezählt, wenn im Calendly-Fenster wirklich ein Termin abgeschlossen wurde – nicht schon beim Öffnen.
                </p>
              </CardContent>
            </Card>

            {/* TAGESÜBERSICHT */}
            <Card>
              <CardContent className="p-5 sm:p-6">
                <SectionHeader
                  icon={<Calendar className="h-4 w-4 text-blue-600" />}
                  title="Tagesübersicht"
                  color="bg-blue-500/10"
                />
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-muted-foreground">
                        <th className="py-2 pr-3 font-medium whitespace-nowrap">Datum</th>
                        <th className="py-2 px-3 font-medium text-right whitespace-nowrap">Besucher</th>
                        <th className="py-2 px-3 font-medium text-right whitespace-nowrap">Quiz gestartet</th>
                        <th className="py-2 px-3 font-medium text-right whitespace-nowrap">Rausgeflogen</th>
                        <th className="py-2 px-3 font-medium text-right whitespace-nowrap">Quiz beendet</th>
                        <th className="py-2 px-3 font-medium text-right whitespace-nowrap">Formular</th>
                        <th className="py-2 px-3 font-medium text-right whitespace-nowrap">VSL-Besucher</th>
                        <th className="py-2 px-3 font-medium text-right whitespace-nowrap">Video gestartet</th>
                        <th className="py-2 pl-3 font-medium text-right whitespace-nowrap">Termin gebucht</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats.daily || []).map((d) => (
                        <tr key={d.date} className="border-b border-border/40 last:border-0">
                          <td className="py-2 pr-3 font-medium whitespace-nowrap">{formatGermanDate(d.date)}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{d.visitors}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{d.quizStart}</td>
                          <td className={`py-2 px-3 text-right tabular-nums ${d.quizDisqualified > 0 ? "text-red-500 font-semibold" : ""}`}>{d.quizDisqualified}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{d.quizCompleted}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{d.formSubmitted}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{d.vslVisitors}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{d.videoStart}</td>
                          <td className={`py-2 pl-3 text-right tabular-nums ${d.calendlyBooked > 0 ? "text-green-600 font-bold" : ""}`}>{d.calendlyBooked}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Jede Zeile ist ein Kalendertag in deutscher Zeit (00:00–23:59 Uhr). Neueste Tage oben.
                </p>
              </CardContent>
            </Card>

          </div>
        )}
      </div>
    </div>
  );
}
