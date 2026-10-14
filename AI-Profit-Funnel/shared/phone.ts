import { parsePhoneNumberFromString } from "libphonenumber-js/max";

export const PHONE_ERROR = "Bitte gib eine gültige Telefonnummer ein, z. B. 01512 3456789 oder +49 1512 3456789.";

/** Return E.164 without inventing digits or interpreting a different country silently. */
export function normalizePhone(input: unknown, selectedCode?: string): string {
  if (typeof input !== "string" || input.length > 100) throw new Error(PHONE_ERROR);
  let value = input.trim();
  if (!value || !/^[+\d\s()./-]+$/.test(value)) throw new Error(PHONE_ERROR);
  value = value.replace(/[\s()./-]/g, "");
  if (value.startsWith("00")) value = `+${value.slice(2)}`;

  // Old clients prepend their dropdown code even to an international number.
  // Only remove a clearly separate second international marker, never bare digits.
  const duplicated = value.match(/^\+(49|43|41)(\+|00)(.+)$/);
  if (duplicated) {
    const inner = `+${duplicated[3]}`;
    if (!inner.startsWith(`+${duplicated[1]}`)) {
      throw new Error("Die Ländervorwahlen widersprechen sich. Bitte gib die Nummer mit nur einer passenden Vorwahl ein.");
    }
    value = inner;
  }
  if (!/^\+?\d+$/.test(value)) throw new Error(PHONE_ERROR);
  if (selectedCode && !["+49", "+43", "+41"].includes(selectedCode)) {
    throw new Error("Bitte wähle eine gültige Ländervorwahl.");
  }
  // A single domestic trunk zero is not part of E.164.
  if (!value.startsWith("+")) value = `${selectedCode ?? "+49"}${value.replace(/^0/, "")}`;
  const number = parsePhoneNumberFromString(value);
  if (!number?.isValid() || number.ext) throw new Error(PHONE_ERROR);
  if (selectedCode && `+${number.countryCallingCode}` !== selectedCode) {
    throw new Error(`Deine Nummer beginnt mit +${number.countryCallingCode}. Bitte wähle die passende Ländervorwahl aus.`);
  }
  return number.number;
}
