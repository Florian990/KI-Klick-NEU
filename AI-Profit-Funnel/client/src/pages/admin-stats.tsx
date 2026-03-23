import { useState, useEffect } from "react";
import {
  Calendar, Users, UserPlus, UserCheck, Play, CheckCircle, XCircle,
  RefreshCw, Lock, Download, Eye, MousePointer, TrendingUp, PhoneCall,
  ChevronRight, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
  funnelDisqualified: number;
  funnelQualified: number;
  calendlyOpen: number;
  leadsGenerated: number;
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
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-bold tabular-nums text-foreground w-10 text-right flex-shrink-0">{value}</span>
      <span className="text-xs text-muted-foreground w-12 text-right flex-shrink-0">{pct(value, base)}</span>
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
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Abmelden
            </Button>
          </div>
        </div>

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
                  <FunnelRow step="50" label="50% gesehen (CTA-Unlock)" value={stats.video50} base={stats.videoStart} color="bg-orange-400" />
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
                    sub={pct(stats.ctaShown, stats.videoStart) + " der Video-Starts"}
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
                  <FunnelRow step="S" label="Funnel gestartet" value={stats.funnelStart} base={stats.ctaClick} color="bg-indigo-400" />
                  <FunnelRow step="1" label="Frage 1 beantwortet" value={stats.funnelQ1} base={stats.funnelStart} color="bg-indigo-400" />
                  <FunnelRow step="2" label="Frage 2 beantwortet" value={stats.funnelQ2} base={stats.funnelStart} color="bg-indigo-400" />
                  <FunnelRow step="3" label="Frage 3 beantwortet" value={stats.funnelQ3} base={stats.funnelStart} color="bg-indigo-400" />
                  <FunnelRow step="✓" label="Qualifiziert" value={stats.funnelQualified} base={stats.funnelStart} color="bg-green-500" />
                  <FunnelRow step="✗" label="Disqualifiziert" value={stats.funnelDisqualified} base={stats.funnelStart} color="bg-red-400" />
                </div>
              </CardContent>
            </Card>

            {/* SALES */}
            <Card>
              <CardContent className="p-5 sm:p-6">
                <SectionHeader
                  icon={<PhoneCall className="h-4 w-4 text-green-600" />}
                  title="Sales"
                  color="bg-green-500/10"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatCard
                    label="Calendly geöffnet"
                    value={stats.calendlyOpen}
                    sub={pct(stats.calendlyOpen, stats.funnelQualified) + " der Qualifizierten"}
                    icon={<Calendar className="h-5 w-5 text-green-600" />}
                    color="bg-green-500/10"
                  />
                  <div className="bg-muted/50 rounded-xl p-5 flex flex-col justify-center">
                    <p className="text-xs text-muted-foreground mb-1">Gesamt-Conversion</p>
                    <p className="text-4xl font-bold text-green-600 tabular-nums">{pct(stats.calendlyOpen, stats.uniqueVisitors)}</p>
                    <p className="text-sm text-muted-foreground mt-1">Besucher → Calendly</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        )}
      </div>
    </div>
  );
}
