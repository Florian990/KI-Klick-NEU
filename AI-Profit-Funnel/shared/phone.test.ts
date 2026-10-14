import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizePhone } from "./phone";
import { normalizeLeadPhone } from "../server/lead-phone";

for (const input of [
  "01512 3456789", "15123456789", "+49 1512 3456789", "0049 1512 3456789",
  "+49 (0)1512 / 345-6789", "+49 +49 15123456789", "+49 0049 15123456789",
  "0049 0049 15123456789",
]) {
  test(`DE: ${input} becomes exactly one country code`, () => {
    assert.equal(normalizePhone(input, "+49"), "+4915123456789");
    assert.equal(normalizePhone(normalizePhone(input)), "+4915123456789");
  });
}

for (const [input, code, output] of [
  ["0664 1234567", "+43", "+436641234567"],
  ["+43 664 1234567", "+43", "+436641234567"],
  ["0043 6641234567", "+43", "+436641234567"],
  ["079 123 45 67", "+41", "+41791234567"],
  ["+41 79 123 45 67", "+41", "+41791234567"],
  ["0041 79 123 45 67", "+41", "+41791234567"],
]) {
  test(`${code}: ${input}`, () => assert.equal(normalizePhone(input, code), output));
}

for (const input of ["", "123", "abcdef", "+49 +43 6641234567", "++4915123456789",
  "+49 +49 +49 15123456789", "15123456789 ext 4", "1234567890123456789012345", null, 4915123456789]) {
  test(`reject invalid or ambiguous input ${JSON.stringify(input)}`, () => {
    assert.throws(() => normalizePhone(input));
  });
}
test("do not silently reinterpret international numbers with wrong dropdown", () => {
  assert.throws(() => normalizePhone("+436641234567", "+49"), /passende Ländervorwahl/);
  assert.equal(normalizePhone("+436641234567"), "+436641234567");
});

function runMiddleware(phone: unknown) {
  const req = { body: { phone } };
  let status = 200;
  let response: any;
  let proceeded = false;
  const res = {
    status(code: number) { status = code; return this; },
    json(body: unknown) { response = body; return this; },
  };
  normalizeLeadPhone(req as any, res as any, () => { proceeded = true; });
  return { req, status, response, proceeded };
}
test("legacy duplicate is normalized BEFORE downstream writes and webhooks", () => {
  const result = runMiddleware("+49 +49 15123456789");
  assert.equal(result.req.body.phone, "+4915123456789");
  assert.equal(result.proceeded, true);
});
test("invalid payload stops before downstream writes and returns field-specific error", () => {
  const result = runMiddleware("not-a-number");
  assert.equal(result.proceeded, false);
  assert.equal(result.status, 400);
  assert.equal(result.response.field, "phone");
});
test("email-only partial leads remain supported", () => {
  for (const value of [undefined, null, ""]) assert.equal(runMiddleware(value).proceeded, true);
});
