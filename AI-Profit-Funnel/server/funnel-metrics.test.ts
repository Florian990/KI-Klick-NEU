import { test } from "node:test";
import assert from "node:assert/strict";
import { aggregateFunnel, type FunnelEvent } from "./funnel-metrics";

const event = (visitorId: string, eventType: string, answer?: string, time = 0): FunnelEvent => ({
  visitorId, eventType, eventData: answer === undefined ? null : JSON.stringify({ answer }),
  createdAt: new Date(Date.UTC(2026, 8, 28, 12, 0, time)),
});
const view = (visitorId: string, page = "/") => ({ visitorId, page });
const question = { id: 11, label: "Alter", disqualifyAnswers: ["Unter 18"] };

test("112 mount events do not become starts or exceed 88 unique visitors", () => {
  const views = Array.from({ length: 88 }, (_, i) => view(`v${i}`));
  const events = Array.from({ length: 112 }, (_, i) => event(`v${i % 88}`, "quiz_start"));
  assert.equal(aggregateFunnel(views, events).quizStart, 0);
  events.push(...Array.from({ length: 112 }, (_, i) => event(`v${i % 88}`, "quiz_step_11", "18–29")));
  const stats = aggregateFunnel(views, events);
  assert.equal(stats.visitors, 88);
  assert.equal(stats.quizStart, 88);
});

test("first-answer event and legacy answer evidence deduplicate by visitor", () => {
  const stats = aggregateFunnel([view("a"), view("a"), view("b"), view("idle")], [
    event("a", "quiz_engaged"), event("a", "quiz_engaged"),
    event("a", "quiz_step_11", "18–29"), event("b", "quiz_step_12", "Angestellt"),
    event("idle", "quiz_start"), event("idle", "funnel_start"),
  ]);
  assert.equal(stats.visitors, 3);
  assert.equal(stats.quizStart, 2);
  assert.equal(stats.totalPageViews, 4);
});

test("later steps infer missing prior steps without silently losing conversions", () => {
  const stats = aggregateFunnel([], [
    event("a", "funnel_contact_submitted"), event("a", "funnel_contact_submitted"),
    event("b", "quiz_disqualified"), event("b", "funnel_disqualified"),
    event("c", "funnel_qualified"), event("c", "quiz_complete"),
  ]);
  assert.equal(stats.visitors, 3);
  assert.equal(stats.inferredLandingVisitors, 3);
  assert.equal(stats.quizStart, 3);
  assert.equal(stats.quizCompleted, 2);
  assert.equal(stats.quizDisqualified, 1);
  assert.equal(stats.formSubmitted, 1);
});

test("VSL stages deduplicate; bookings imply opens but not video views", () => {
  const stats = aggregateFunnel([view("a", "/vsl")], [
    event("a", "video_start"), event("a", "video_start"),
    event("b", "calendly_booked"), event("b", "calendly_booked"),
    event("c", "calendly_open"), event("c", "calendly_open"),
  ]);
  assert.equal(stats.vslVisitors, 3);
  assert.equal(stats.inferredVslVisitors, 2);
  assert.equal(stats.videoStart, 1);
  assert.equal(stats.calendlyOpen, 2);
  assert.equal(stats.calendlyBooked, 1);
  assert.equal(stats.visitors, 0); // direct VSL traffic is not invented quiz traffic
});

test("latest answer per visitor wins regardless of input order; malformed payloads ignored", () => {
  const events = [
    event("a", "quiz_step_11", "18–29", 5),
    event("a", "quiz_step_11", "Unter 18", 1),
    event("b", "quiz_step_11", "Unter 18", 3),
    { ...event("a", "quiz_step_11", undefined, 9), eventData: "broken-json" },
    { ...event("c", "quiz_step_11"), eventData: '{"answer":{}}' },
  ];
  const first = aggregateFunnel([], events, [question]);
  assert.deepEqual(first.questionFunnel, aggregateFunnel([], [...events].reverse(), [question]).questionFunnel);
  const q = first.questionFunnel[0];
  assert.equal(q.reached, 2);
  assert.equal(q.disqualified, 1);
  assert.equal(q.answerBreakdown.reduce((sum, a) => sum + a.count, 0), q.reached);
  assert(q.reached <= first.quizStart);
});

test("equal timestamps have a deterministic tie break", () => {
  const a = { ...event("a", "quiz_step_11", "Unter 18"), id: "aaa" };
  const b = { ...event("a", "quiz_step_11", "18–29"), id: "bbb" };
  assert.deepEqual(
    aggregateFunnel([], [a, b], [question]),
    aggregateFunnel([], [b, a], [question]),
  );
});

test("test visitors and blank IDs do not contribute", () => {
  const stats = aggregateFunnel([view("test-a"), view("")], [
    event("test-a", "funnel_contact_submitted"), event("", "quiz_engaged"),
    event("test-b", "calendly_booked"),
  ], [question]);
  assert.equal(stats.visitors, 0);
  assert.equal(stats.quizStart, 0);
  assert.equal(stats.vslVisitors, 0);
});

test("day counts independently deduplicate while period counts deduplicate across days", () => {
  const day1 = [event("a", "quiz_engaged"), event("a", "quiz_engaged")];
  const day2 = [event("a", "quiz_complete"), event("a", "quiz_complete")];
  const one = aggregateFunnel([view("a")], day1);
  const two = aggregateFunnel([], day2);
  const total = aggregateFunnel([view("a")], [...day1, ...day2]);
  assert.equal(one.quizStart, 1);
  assert.equal(two.quizStart, 1);
  assert.equal(total.quizStart, 1);
  assert.equal(two.inferredLandingVisitors, 1);
});

test("qualification and exclusion may overlap across repeat runs but each stays within starts", () => {
  const stats = aggregateFunnel([view("a")], [
    event("a", "quiz_disqualified"), event("a", "quiz_complete"),
  ]);
  assert.equal(stats.quizStart, 1);
  assert.equal(stats.quizCompleted, 1);
  assert.equal(stats.quizDisqualified, 1);
});

test("aggregation preserves input data and empty periods return zero counts", () => {
  const events = [event("a", "quiz_step_11", "18–29")];
  const views = [view("a")];
  const before = JSON.stringify({ events, views });
  aggregateFunnel(views, events, [question]);
  assert.equal(JSON.stringify({ events, views }), before);
  const stats = aggregateFunnel([], [], [question]);
  assert.equal(stats.visitors, 0);
  assert.equal(stats.quizStart, 0);
  assert.equal(stats.questionFunnel[0].reached, 0);
});