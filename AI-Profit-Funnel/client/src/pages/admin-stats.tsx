import { useState, useEffect } from "react";
import {
  Users, UserPlus, UserCheck, Play, CheckCircle,
  RefreshCw, Lock, Download, Eye, MousePointer, TrendingUp,
  BarChart3, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isTestMode, setTestToken } from "@/hooks/useAnalytics";

interface StatsData {
  totalPageViews: number;
  uniqueVisitors: number;
  returningVisitors: number;
  newVisitors: number;
  videoStart: number;
  video25: number;
  video50: number;
  video75: number;
  video100: number;
  ctaShown: number;
  ctaClick: number;
  funnelStart: number;
  funnelQ1: number;
  funnelQ2: number;
  funnelQ3: number;
  funnelQ4: number;
  funnelQ5: number;
  funnelDisqualified: number;
  funnelQualified: number;
  questionFunnel: {
    id: number;
    label: string;
    reached: number;
    disqualified: number;
    answerBreakdown?: { answer: string; count: number; disqualifying: boolean }[];
  }[];
  contactViewName: number;
  contactViewPhone: number;
  contactViewEmail: number;
  contactSubmitted: number;
  leadsGenerated: number;
  calendlyOpen: number;
}

function pct(num: number, denom: number) {
  if (!denom) return "–";
  return Math.round((num / denom) * 100) + "%";
}

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={`h-11 w-11 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-3xl font-bold text-foreground tabular-nums">{value}</p>
            <p className="text-sm font-medium text-foreground mt-0.5">{label}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FunnelRow({
  step,
  label,
  value,
  base,
  color,
}: {
  step: string;
  label: string;
  value: number;
  base: number;
  color: string;
}) {
  const percentage = base > 0 ? Math.round((value / base) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-xs font-mono text-muted-foreground w-6 text-right flex-shrink-0">{step}</span>
      <span className="text-sm font-medium text-foreground w-44 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span className="text-sm font-bold tabular-nums text-foreground w-10 text-right flex-shrink-0">{value}</span>
      <span className="text-xs text-muted-foreground w-12 text-right flex-shrink-0">{pct(value, base)}</span>
    </div>
  );
}

function QuestionFunnelRow({
  step,
  label,
  reached,
  disqualified,
  base,
  answerBreakdown,
}: {
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
          <div
            className="h-2.5 rounded-full transition-all bg-indigo-400"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <span className="text-sm font-bold tabular-nums text-foreground w-10 text-right flex-shrink-0">{reached}</span>
        <span className="text-xs text-muted-foreground w-12 text-right flex-shrink-0">{pct(reached, base)}</span>
        {disqualified > 0 ? (
          <span className="text-xs font-semibold text-red-500 w-28 text-right flex-shrink-0">
            ✗ {disqualified} disqualifiziert
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
    <div className={`flex items-center gap-3 mb-4 pb-3 border-b border-border`}>
      <div className={`h-8 w-8 rounded-lg ${color} flex items-center justify-center`}>
        {icon}
      </div>
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
    </div>
  );
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string>("30");

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [testMode, setTestModeState] = useState(() => isTestMode());

  const today = new Date();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => today.toISOString().split("T")[0]);

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
    const end = new Date();
    const start = new Date();
    if (preset === "0") {
      start.setHours(0, 0, 0, 0);
    } else {
      start.setDate(start.getDate() - parseInt(preset));
    }
    const s = start.toISOString().split("T")[0];
    const e = end.toISOString().split("T")[0];
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
    { label: "Heute", value: "0" },
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
            <p className="text-muted-foreground text-sm mt-1">KI-Klick Methode · Live-Tracking</p>
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
              <div className="flex gap-2">
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

            {/* CONVERSION ÜBERSICHT */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-5 sm:p-6">
                <SectionHeader
                  icon={<CheckCircle className="h-4 w-4 text-primary" />}
                  title="Conversion-Übersicht"
                  color="bg-primary/10"
                />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-background rounded-xl p-4 sm:p-5 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Eintragungen</p>
                    <p className="text-3xl sm:text-4xl font-bold text-primary tabular-nums">{stats.contactSubmitted}</p>
                    <p className="text-xs text-muted-foreground mt-1">Formular abgeschlossen</p>
                  </div>
                  <div className="bg-background rounded-xl p-4 sm:p-5 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Besucher → Eintragung</p>
                    <p className="text-3xl sm:text-4xl font-bold text-green-600 tabular-nums">{pct(stats.contactSubmitted, stats.uniqueVisitors)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stats.contactSubmitted} von {stats.uniqueVisitors} Besuchern</p>
                  </div>
                  <div className="bg-background rounded-xl p-4 sm:p-5 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Qualifiziert → Eintragung</p>
                    <p className="text-3xl sm:text-4xl font-bold text-green-600 tabular-nums">{pct(stats.contactSubmitted, stats.funnelQualified)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stats.contactSubmitted} von {stats.funnelQualified} Qualifizierten</p>
                  </div>
                  <div className="bg-background rounded-xl p-4 sm:p-5 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">CTA-Klickrate</p>
                    <p className="text-3xl sm:text-4xl font-bold text-amber-600 tabular-nums">{pct(stats.ctaClick, stats.ctaShown)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stats.ctaClick} von {stats.ctaShown} Aufrufen</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* TRAFFIC */}
            <Card>
              <CardContent className="p-5 sm:p-6">
                <SectionHeader
                  icon={<Users className="h-4 w-4 text-blue-600" />}
                  title="Traffic"
                  color="bg-blue-500/10"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard
                    label="Besucher gesamt"
                    value={stats.uniqueVisitors}
                    sub={`${stats.totalPageViews} Seitenaufrufe`}
                    icon={<Users className="h-5 w-5 text-blue-600" />}
                    color="bg-blue-500/10"
                  />
                  <StatCard
                    label="Neue Besucher"
                    value={stats.newVisitors}
                    sub={pct(stats.newVisitors, stats.uniqueVisitors) + " aller Besucher"}
                    icon={<UserPlus className="h-5 w-5 text-green-600" />}
                    color="bg-green-500/10"
                  />
                  <StatCard
                    label="Wiederkehrend"
                    value={stats.returningVisitors}
                    sub={pct(stats.returningVisitors, stats.uniqueVisitors) + " aller Besucher"}
                    icon={<UserCheck className="h-5 w-5 text-purple-600" />}
                    color="bg-purple-500/10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* VIDEO */}
            <Card>
              <CardContent className="p-5 sm:p-6">
                <SectionHeader
                  icon={<Play className="h-4 w-4 text-orange-600" />}
                  title="Video"
                  color="bg-orange-500/10"
                />
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                  {[
                    { label: "Gestartet", value: stats.videoStart },
                    { label: "25% gesehen", value: stats.video25 },
                    { label: "50% gesehen", value: stats.video50 },
                    { label: "75% gesehen", value: stats.video75 },
                    { label: "100% gesehen", value: stats.video100 },
                  ].map((item) => (
                    <div key={item.label} className="bg-muted/50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold tabular-nums text-foreground">{item.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <FunnelRow step="▶" label="Video gestartet" value={stats.videoStart} base={stats.uniqueVisitors} color="bg-orange-400" />
                  <FunnelRow step="25" label="25% gesehen" value={stats.video25} base={stats.videoStart} color="bg-orange-400" />
                  <FunnelRow step="50" label="50% gesehen" value={stats.video50} base={stats.videoStart} color="bg-orange-400" />
                  <FunnelRow step="75" label="75% gesehen" value={stats.video75} base={stats.videoStart} color="bg-orange-400" />
                  <FunnelRow step="✓" label="100% gesehen" value={stats.video100} base={stats.videoStart} color="bg-green-500" />
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card>
              <CardContent className="p-5 sm:p-6">
                <SectionHeader
                  icon={<MousePointer className="h-4 w-4 text-amber-600" />}
                  title="CTA"
                  color="bg-amber-500/10"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <StatCard
                    label="CTA eingeblendet"
                    value={stats.ctaShown}
                    sub={pct(stats.ctaShown, stats.uniqueVisitors) + " der Besucher"}
                    icon={<Eye className="h-5 w-5 text-amber-600" />}
                    color="bg-amber-500/10"
                  />
                  <StatCard
                    label="CTA geklickt"
                    value={stats.ctaClick}
                    sub={pct(stats.ctaClick, stats.ctaShown) + " der Einblendungen"}
                    icon={<MousePointer className="h-5 w-5 text-amber-600" />}
                    color="bg-amber-500/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <FunnelRow step="👁" label="CTA eingeblendet" value={stats.ctaShown} base={stats.uniqueVisitors} color="bg-amber-400" />
                  <FunnelRow step="→" label="CTA geklickt" value={stats.ctaClick} base={stats.ctaShown} color="bg-amber-500" />
                </div>
              </CardContent>
            </Card>

            {/* FUNNEL */}
            <Card>
              <CardContent className="p-5 sm:p-6">
                <SectionHeader
                  icon={<TrendingUp className="h-4 w-4 text-indigo-600" />}
                  title="Mini-Funnel"
                  color="bg-indigo-500/10"
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold tabular-nums text-foreground">{stats.funnelStart}</p>
                    <p className="text-xs text-muted-foreground mt-1">Funnel gestartet</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold tabular-nums text-green-600">{stats.funnelQualified}</p>
                    <p className="text-xs text-muted-foreground mt-1">Qualifiziert</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold tabular-nums text-red-500">{stats.funnelDisqualified}</p>
                    <p className="text-xs text-muted-foreground mt-1">Disqualifiziert</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <FunnelRow step="S" label="Funnel gestartet" value={stats.funnelStart} base={stats.uniqueVisitors} color="bg-indigo-400" />
                </div>

                <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-sm font-semibold text-foreground mb-1">Abbrüche pro Frage</p>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    Der Balken zeigt, wie viele Besucher diese Frage <strong>beantwortet</strong> haben (im Verhältnis zum Funnel-Start).
                    Die rote Zahl zeigt, wie viele genau <strong>bei dieser Frage disqualifiziert</strong> wurden.
                  </p>
                  <div>
                    {(stats.questionFunnel || []).map((q, i) => (
                      <QuestionFunnelRow
                        key={q.id}
                        step={i + 1}
                        label={q.label}
                        reached={q.reached}
                        disqualified={q.disqualified}
                        base={stats.funnelStart}
                        answerBreakdown={q.answerBreakdown}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 mt-4">
                  <FunnelRow step="✓" label="Qualifiziert" value={stats.funnelQualified} base={stats.funnelStart} color="bg-green-500" />
                  <FunnelRow step="✗" label="Disqualifiziert (gesamt)" value={stats.funnelDisqualified} base={stats.funnelStart} color="bg-red-400" />
                </div>

                <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                  So erkennst du, ob du zu <strong>wenig Volumen</strong> hast (oben wenige Besucher / Funnel-Starts) oder ob die Besucher
                  <strong> unqualifiziert</strong> sind (viele rote Disqualifikationen bei einer bestimmten Frage). Die Zahlen pro Frage
                  werden aus den gespeicherten Antworten berechnet und gelten daher auch <strong>rückwirkend</strong>.
                </p>
              </CardContent>
            </Card>

            {/* OPT-IN / EINTRAGUNG */}
            <Card>
              <CardContent className="p-5 sm:p-6">
                <SectionHeader
                  icon={<UserPlus className="h-4 w-4 text-green-600" />}
                  title="Opt-in / Eintragung"
                  color="bg-green-500/10"
                />
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold tabular-nums text-green-600">{stats.funnelQualified}</p>
                    <p className="text-xs text-muted-foreground mt-1">Qualifiziert</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold tabular-nums text-primary">{stats.contactSubmitted}</p>
                    <p className="text-xs text-muted-foreground mt-1">Formular abgeschlossen</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold tabular-nums text-foreground">{stats.leadsGenerated}</p>
                    <p className="text-xs text-muted-foreground mt-1">DB-Einträge*</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <FunnelRow step="✓" label="Qualifiziert" value={stats.funnelQualified} base={stats.funnelQualified} color="bg-green-500" />
                  <FunnelRow step="1" label="Name-Schritt gesehen" value={stats.contactViewName} base={stats.funnelQualified} color="bg-teal-400" />
                  <FunnelRow step="2" label="Telefon-Schritt gesehen" value={stats.contactViewPhone} base={stats.funnelQualified} color="bg-teal-400" />
                  <FunnelRow step="3" label="E-Mail-Schritt gesehen" value={stats.contactViewEmail} base={stats.funnelQualified} color="bg-teal-400" />
                  <FunnelRow step="📨" label="Formular abgeschlossen" value={stats.contactSubmitted} base={stats.funnelQualified} color="bg-indigo-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                  Zeigt, wo qualifizierte Nutzer beim Ausfüllen des Kontaktformulars abspringen. „Formular abgeschlossen" ist die verlässliche Eintragungs-Zahl (genau 1 Event pro Abschluss).
                  <br />
                  <span className="text-muted-foreground/80">*„DB-Einträge" zählt alle Lead-Zeilen in der Datenbank im Zeitraum. Durch automatische Zwischenspeicherung (ab dem Telefon-Schritt) kann eine Person mehrere Zeilen erzeugen — diese Zahl ist daher meist höher als die abgeschlossenen Eintragungen.</span>
                </p>
              </CardContent>
            </Card>

          </div>
        )}
      </div>
    </div>
  );
}
