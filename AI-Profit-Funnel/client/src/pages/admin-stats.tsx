import { useState, useEffect } from "react";
import { Calendar, Users, UserPlus, UserCheck, Play, CheckCircle, XCircle, Mail, BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsData {
  totalPageViews: number;
  uniqueVisitors: number;
  returningVisitors: number;
  newVisitors: number;
  quizStarted: number;
  quizCompleted: number;
  quizDisqualified: number;
  quizStepCounts: Record<string, number>;
  leadsGenerated: number;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const today = new Date();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return today.toISOString().split('T')[0];
  });

  const fetchStats = async (start?: string, end?: string) => {
    const startParam = start || startDate;
    const endParam = end || endDate;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/analytics/stats?startDate=${startParam}&endDate=${endParam}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError('Fehler beim Laden der Statistiken');
      }
    } catch (err) {
      setError('Verbindungsfehler');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFilter = () => {
    fetchStats();
  };

  const setPresetRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    if (days === 0) {
      start.setHours(0, 0, 0, 0);
    } else {
      start.setDate(start.getDate() - days);
    }
    const newStart = start.toISOString().split('T')[0];
    const newEnd = end.toISOString().split('T')[0];
    setStartDate(newStart);
    setEndDate(newEnd);
    fetchStats(newStart, newEnd);
  };

  const setMonth = (monthsAgo: number) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0);
    const newStart = start.toISOString().split('T')[0];
    const newEnd = end.toISOString().split('T')[0];
    setStartDate(newStart);
    setEndDate(newEnd);
    fetchStats(newStart, newEnd);
  };

  const getMonthName = (monthsAgo: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    return date.toLocaleString('de-DE', { month: 'long' });
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Statistiken</h1>
            <p className="text-muted-foreground">Übersicht über Besucher und Quiz-Performance</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchStats()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Zeitraum auswählen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={() => setPresetRange(0)}>
                Heute
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPresetRange(7)}>
                Letzte 7 Tage
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPresetRange(30)}>
                Letzte 30 Tage
              </Button>
              <Button variant="outline" size="sm" onClick={() => setMonth(0)}>
                {getMonthName(0)}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setMonth(1)}>
                {getMonthName(1)}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setMonth(2)}>
                {getMonthName(2)}
              </Button>
            </div>
            
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Von</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Bis</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
              <Button onClick={handleFilter} disabled={isLoading}>
                {isLoading ? 'Laden...' : 'Filtern'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Lade Statistiken...</p>
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.uniqueVisitors}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Besucher gesamt</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <UserPlus className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.newVisitors}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Neue Besucher</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.returningVisitors}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Wiederkehrend</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.leadsGenerated}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Leads generiert</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Quiz-Statistiken
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Play className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.quizStarted}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Quiz gestartet</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.quizCompleted}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Quiz abgeschlossen</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                      <XCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats.quizDisqualified}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Disqualifiziert</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {Object.keys(stats.quizStepCounts).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quiz-Schritte</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.quizStepCounts)
                      .sort(([a], [b]) => {
                        const numA = parseInt(a.replace('quiz_step_', ''));
                        const numB = parseInt(b.replace('quiz_step_', ''));
                        return numA - numB;
                      })
                      .map(([step, count]) => {
                        const stepNum = step.replace('quiz_step_', '');
                        const percentage = stats.quizStarted > 0 ? Math.round((count / stats.quizStarted) * 100) : 0;
                        return (
                          <div key={step} className="flex items-center gap-4">
                            <span className="text-sm font-medium w-24">Frage {stepNum}</span>
                            <div className="flex-1 bg-muted rounded-full h-3">
                              <div 
                                className="bg-primary h-3 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-20 text-right">
                              {count} ({percentage}%)
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
