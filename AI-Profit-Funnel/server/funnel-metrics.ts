// Read-only aggregation. Keep legacy events intact; do not interpret the old
// quiz_start (component mount) as an actual answer or inflate counts with repeats.
export interface FunnelEvent {
  id?: string;
  visitorId: string;
  eventType: string;
  eventData: string | null;
  createdAt: Date;
}

export interface FunnelPageView {
  visitorId: string;
  page: string;
}

export interface FunnelQuestion {
  id: number;
  label: string;
  disqualifyAnswers: string[];
}

export function aggregateFunnel(
  pageViews: FunnelPageView[],
  events: FunnelEvent[],
  questions: FunnelQuestion[] = [],
) {
  const validVisitor = (id: string) => !!id && !id.startsWith("test-");
  const rows = events.filter(e => validVisitor(e.visitorId));
  const views = pageViews.filter(p => validVisitor(p.visitorId));
  const ids = (types: string[]) => new Set(
    rows.filter(e => types.includes(e.eventType)).map(e => e.visitorId),
  );
  const union = (...sets: Set<string>[]) => new Set(sets.flatMap(s => Array.from(s)));
  const pageIds = (page: string) => new Set(
    views.filter(p => p.page === page).map(p => p.visitorId),
  );
  const differenceSize = (a: Set<string>, b: Set<string>) =>
    Array.from(a).filter(id => !b.has(id)).length;

  const submitted = ids(["funnel_contact_submitted"]);
  // Later recorded actions prove that the earlier step was reached, even when
  // the page-view/start request was lost or happened before the selected period.
  const completed = union(ids(["quiz_complete", "funnel_qualified"]), submitted);
  const disqualified = ids(["quiz_disqualified", "funnel_disqualified"]);
  const answered = new Set(
    rows.filter(e => /^quiz_step_\d+$/.test(e.eventType)).map(e => e.visitorId),
  );
  const started = union(ids(["quiz_engaged"]), answered, completed, disqualified);
  const recordedLanding = pageIds("/");
  const landing = union(recordedLanding, started);

  const booked = ids(["calendly_booked"]);
  const opened = union(ids(["calendly_open"]), booked);
  const video = ids(["video_start"]);
  const recordedVsl = pageIds("/vsl");
  const vsl = union(recordedVsl, video, opened);

  // One answer per visitor/question. "Latest" is based on timestamp, not DB
  // return order. A stable ID breaks ties from equal millisecond timestamps.
  const latestAnswers = new Map<number, Map<string, { answer: string; time: number; id: string }>>();
  for (const event of rows) {
    const match = /^quiz_step_(\d+)$/.exec(event.eventType);
    if (!match) continue;
    let answer: unknown;
    try { answer = event.eventData ? JSON.parse(event.eventData)?.answer : undefined; }
    catch { continue; }
    if (typeof answer !== "string" || !answer.trim()) continue;
    const questionId = Number(match[1]);
    const answers = latestAnswers.get(questionId) ?? new Map();
    latestAnswers.set(questionId, answers);
    const value = { answer, time: new Date(event.createdAt).getTime(), id: event.id ?? "" };
    const previous = answers.get(event.visitorId);
    if (!previous || value.time > previous.time ||
        (value.time === previous.time && value.id > previous.id)) {
      answers.set(event.visitorId, value);
    }
  }

  return {
    visitors: landing.size,
    totalPageViews: views.length,
    inferredLandingVisitors: differenceSize(landing, recordedLanding),
    quizStart: started.size,
    quizDisqualified: disqualified.size,
    quizCompleted: completed.size,
    formSubmitted: submitted.size,
    vslVisitors: vsl.size,
    inferredVslVisitors: differenceSize(vsl, recordedVsl),
    videoStart: video.size,
    calendlyOpen: opened.size,
    calendlyBooked: booked.size,
    questionFunnel: questions.map(q => {
      const answers = Array.from(latestAnswers.get(q.id)?.values() ?? []);
      const counts = new Map<string, number>();
      for (const { answer } of answers) counts.set(answer, (counts.get(answer) ?? 0) + 1);
      return {
        id: q.id,
        label: q.label,
        reached: answers.length,
        disqualified: answers.filter(a => q.disqualifyAnswers.includes(a.answer)).length,
        answerBreakdown: Array.from(counts).map(([answer, count]) => ({
          answer, count, disqualifying: q.disqualifyAnswers.includes(answer),
        })).sort((a, b) => b.count - a.count || a.answer.localeCompare(b.answer)),
      };
    }),
  };
}