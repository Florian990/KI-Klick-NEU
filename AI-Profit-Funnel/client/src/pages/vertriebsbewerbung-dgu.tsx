import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, LockKeyhole, UploadCloud } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const acceptedExtensions = ".jpg,.jpeg,.png,.webp,.pdf";

const applicationSchema = z.object({
  firstName: z.string().trim().min(2, "Bitte geben Sie Ihren Vornamen an."),
  lastName: z.string().trim().min(2, "Bitte geben Sie Ihren Nachnamen an."),
  email: z.string().trim().email("Bitte geben Sie eine gültige E-Mail-Adresse an."),
  phone: z.string().trim().min(6, "Bitte geben Sie eine Telefonnummer an."),
  salesExperience: z.string().trim().min(1, "Bitte wähle deine Vertriebserfahrung aus."),
  industriesProducts: z.string().trim().min(5, "Bitte nenne deine Branchen oder Produkte."),
  coachingMarketExperience: z.enum(["ja", "nein"], { required_error: "Bitte wähle eine Antwort." }),
  makeMoneyMarketExperience: z.enum(["ja", "nein"], { required_error: "Bitte wähle eine Antwort." }),
  fullTimeAvailable: z.enum(["ja", "nein"], { required_error: "Bitte wähle eine Antwort." }),
  lastYearRevenue: z.string().trim().min(1, "Bitte nenne deinen Umsatz oder erkläre kurz, warum du ihn nicht nennen kannst."),
  softSkills: z.string().trim().min(10, "Bitte beschreibe deine wichtigsten Soft Skills."),
  careerGoals: z.string().trim().min(10, "Bitte beschreibe deine beruflichen Ziele."),
  salesTools: z.string().trim().min(3, "Bitte nenne die Tools, mit denen du arbeitest."),
  fullFocusCommitment: z.enum(["ja", "nein"], { required_error: "Bitte wähle eine Antwort." }),
  expectations: z.string().trim().min(10, "Bitte beschreibe deine Erwartungen."),
  privacyConsent: z.boolean().refine((value) => value, "Bitte stimme der Datenschutzerklärung zu."),
  evidenceFiles: z.any(),
});

type ApplicationValues = z.infer<typeof applicationSchema>;

const defaultValues: ApplicationValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  salesExperience: "",
  industriesProducts: "",
  coachingMarketExperience: undefined as never,
  makeMoneyMarketExperience: undefined as never,
  fullTimeAvailable: undefined as never,
  lastYearRevenue: "",
  softSkills: "",
  careerGoals: "",
  salesTools: "",
  fullFocusCommitment: undefined as never,
  expectations: "",
  privacyConsent: false as never,
  evidenceFiles: undefined,
};

const steps = [
  { title: "Erfahrung", eyebrow: "01", fields: ["salesExperience", "industriesProducts", "coachingMarketExperience", "makeMoneyMarketExperience"] as const },
  { title: "Track Record", eyebrow: "02", fields: ["fullTimeAvailable", "lastYearRevenue", "salesTools"] as const },
  { title: "Zusammenarbeit", eyebrow: "03", fields: ["softSkills", "careerGoals", "fullFocusCommitment", "expectations"] as const },
  { title: "Kontakt & Nachweise", eyebrow: "04", fields: ["firstName", "lastName", "email", "phone", "privacyConsent"] as const },
];

function ChoiceField({
  control,
  name,
  label,
  description,
}: {
  control: ReturnType<typeof useForm<ApplicationValues>>["control"];
  name: "coachingMarketExperience" | "makeMoneyMarketExperience" | "fullTimeAvailable" | "fullFocusCommitment";
  label: string;
  description?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="rounded-xl border border-[#343a43] bg-[#171b21] p-4">
          <FormLabel className="text-sm font-medium text-[#f4f0e8]">{label}</FormLabel>
          {description && <FormDescription className="mt-1 text-xs text-[#9ba3ad]">{description}</FormDescription>}
          <FormControl>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="mt-3 flex gap-3"
              data-testid={`radio-group-${name}`}
            >
              {["ja", "nein"].map((value) => (
                <label
                  key={value}
                  className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-[#343a43] px-3 py-2.5 text-sm text-[#d8dce1] transition-colors hover:border-[#c6a15b] has-[[data-state=checked]]:border-[#c6a15b] has-[[data-state=checked]]:bg-[#302817]"
                  data-testid={`label-${name}-${value}`}
                >
                  <RadioGroupItem value={value} data-testid={`radio-${name}-${value}`} />
                  <span>{value === "ja" ? "Ja" : "Nein"}</span>
                </label>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default function VertriebsbewerbungDguPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues,
    mode: "onTouched",
  });
  const { control, register, setValue, watch, trigger, handleSubmit, formState } = form;
  const selectedFiles = watch("evidenceFiles") as FileList | undefined;
  const fileNames = useMemo(() => Array.from(selectedFiles ?? []).map((file) => file.name), [selectedFiles]);
  const evidenceRegistration = register("evidenceFiles");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Vertriebsbewerbung | KI-Klick Methode";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const moveNext = async () => {
    const valid = await trigger(steps[step].fields);
    if (!valid) return;
    if (step < steps.length - 1) setStep((current) => current + 1);
  };

  const onSubmit = async (values: ApplicationValues) => {
    const files = Array.from((values.evidenceFiles as FileList | undefined) ?? []);
    if (!files.length) {
      setValue("evidenceFiles", undefined, { shouldValidate: true });
      setSubmitError("Bitte laden Sie mindestens einen Nachweis hoch.");
      return;
    }
    if (files.some((file) => !acceptedTypes.includes(file.type))) {
      setSubmitError("Bitte verwenden Sie ausschließlich JPG, PNG, WebP oder PDF.");
      return;
    }
    if (files.length > 5) {
      setSubmitError("Du kannst maximal fünf Nachweise hochladen.");
      return;
    }
    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      setSubmitError("Eine Datei darf maximal 5 MB groß sein.");
      return;
    }
    if (files.reduce((total, file) => total + file.size, 0) > 20 * 1024 * 1024) {
      setSubmitError("Die Nachweise dürfen zusammen maximal 20 MB groß sein.");
      return;
    }
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("firstName", values.firstName);
      payload.append("lastName", values.lastName);
      payload.append("email", values.email);
      payload.append("phone", values.phone);
      payload.append("salesExperience", values.salesExperience);
      payload.append("industriesProducts", values.industriesProducts);
      payload.append("coachingMarketExperience", values.coachingMarketExperience);
      payload.append("makeMoneyMarketExperience", values.makeMoneyMarketExperience);
      payload.append("fullTimeAvailable", values.fullTimeAvailable);
      payload.append("lastYearRevenue", values.lastYearRevenue);
      payload.append("softSkills", values.softSkills);
      payload.append("careerGoals", values.careerGoals);
      payload.append("salesTools", values.salesTools);
      payload.append("fullFocusCommitment", values.fullFocusCommitment);
      payload.append("expectations", values.expectations);
      payload.append("privacyConsent", "true");
      files.forEach((file) => payload.append("evidenceFiles", file));

      const response = await fetch("/api/vertriebsbewerbungen", {
        method: "POST",
        body: payload,
        credentials: "include",
      });
      const result = await response.json().catch(() => null) as { message?: string } | null;
      if (response.status !== 201) throw new Error(result?.message || "Die Bewerbung konnte nicht übermittelt werden.");
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Die Übermittlung ist fehlgeschlagen. Bitte versuchen Sie es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-[100dvh] bg-[#101317] px-5 py-10 text-[#f4f0e8] sm:px-8">
        <section className="mx-auto flex min-h-[80dvh] max-w-2xl flex-col items-center justify-center text-center">
          <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-full border border-[#c6a15b]/50 bg-[#302817] text-[#d9b871]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#d9b871]">Bewerbung eingegangen</p>
          <h1 className="max-w-xl font-serif text-4xl leading-tight text-[#f8f3e9] sm:text-5xl">Danke für deine Zeit und Offenheit.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#aeb5bf]">Wir prüfen deine Angaben persönlich. Wenn dein Profil zu unserem Team passt, melden wir uns zeitnah mit den nächsten Schritten.</p>
          <div className="mt-10 flex items-center gap-2 text-sm text-[#858e99]"><LockKeyhole className="h-4 w-4 text-[#c6a15b]" /> Deine Angaben bleiben vertraulich.</div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[#101317] text-[#f4f0e8]">
      <header className="border-b border-[#282e36]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c6a15b] text-sm font-bold text-[#17130b]">K</span><span className="text-sm font-semibold tracking-wide text-[#ece4d5]">KI-Klick Methode</span></div>
          <div className="flex items-center gap-2 text-xs text-[#8f98a3]"><LockKeyhole className="h-3.5 w-3.5 text-[#c6a15b]" /> Privater Bewerbungsbereich</div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[250px_1fr] lg:gap-20 lg:py-16">
        <aside>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c6a15b]">Vertriebspartner</p>
          <h1 className="mt-4 font-serif text-4xl leading-[1.08] text-[#f8f3e9] sm:text-5xl lg:text-[3.4rem]">Arbeite mit Fokus.</h1>
          <p className="mt-6 text-sm leading-6 text-[#9ba3ad]">Diese Bewerbung ist kein Quiz. Es gibt keine Punktzahl und keine automatische Aussortierung. Wir möchten verstehen, wie du arbeitest und wohin du willst.</p>
          <div className="mt-10 hidden border-l border-[#3b3424] pl-5 lg:block"><p className="text-sm leading-6 text-[#c2b79f]">Nimm dir etwa 10 Minuten Zeit. Deine Angaben werden erst nach dem letzten Schritt übermittelt.</p></div>
        </aside>
        <section className="max-w-3xl">
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between text-xs font-medium text-[#8f98a3]"><span>Schritt {step + 1} von {steps.length}</span><span className="text-[#c6a15b]">{steps[step].title}</span></div>
            <div className="flex gap-2" aria-label="Bewerbungsfortschritt" data-testid="progress-application">
              {steps.map((item, index) => <div key={item.eyebrow} className={`h-1 flex-1 rounded-full ${index <= step ? "bg-[#c6a15b]" : "bg-[#30363e]"}`} data-testid={`progress-step-${index + 1}`} />)}
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-[#2d333b] bg-[#15191e] p-5 shadow-2xl shadow-black/20 sm:p-8" data-testid="form-vertriebsbewerbung">
              {step === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#f5efe4]">Deine Vertriebserfahrung</h2>
                    <p className="mt-2 text-sm text-[#929ba6]">Hilf uns dabei, deinen bisherigen Weg im Vertrieb einzuordnen.</p>
                  </div>
                  <FormField
                    control={control}
                    name="salesExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wie viele Jahre arbeitest du bereits im Vertrieb?</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger data-testid="select-salesExperience" className="border-[#363d46] bg-[#1c2127] text-[#f4f0e8]">
                              <SelectValue placeholder="Bitte auswählen" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Unter 1 Jahr">Unter 1 Jahr</SelectItem>
                            <SelectItem value="1–2 Jahre">1–2 Jahre</SelectItem>
                            <SelectItem value="3–5 Jahre">3–5 Jahre</SelectItem>
                            <SelectItem value="6–10 Jahre">6–10 Jahre</SelectItem>
                            <SelectItem value="Mehr als 10 Jahre">Mehr als 10 Jahre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={control} name="industriesProducts" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Welche Branchen oder Produkte hast du bisher betreut?</FormLabel>
                      <FormControl><Textarea {...field} data-testid="textarea-industriesProducts" placeholder="Zum Beispiel: B2B-Software, Coaching oder Agenturleistungen" className="min-h-24 border-[#363d46] bg-[#1c2127] text-[#f4f0e8]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <ChoiceField control={control} name="coachingMarketExperience" label="Hast du bereits Erfahrung im Coaching-Markt?" />
                  <ChoiceField control={control} name="makeMoneyMarketExperience" label="Hast du bereits Erfahrung speziell im Make-Money-Markt?" />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold">Dein Track Record</h2>
                    <p className="mt-2 text-sm text-[#929ba6]">Konkrete Zahlen helfen uns, deine Erfahrung fair einzuordnen.</p>
                  </div>
                  <ChoiceField control={control} name="fullTimeAvailable" label="Bist du in Vollzeit verfügbar?" />
                  <FormField control={control} name="lastYearRevenue" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wie hoch war der Umsatz, den du im letzten Jahr generiert hast?</FormLabel>
                      <FormDescription className="text-xs text-[#9ba3ad]">Bitte nenne eine Größenordnung und den Zeitraum, auf den sie sich bezieht.</FormDescription>
                      <FormControl><Input {...field} data-testid="input-lastYearRevenue" placeholder="Zum Beispiel: 250.000 € in den letzten 12 Monaten" className="border-[#363d46] bg-[#1c2127] text-[#f4f0e8]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={control} name="salesTools" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Welche Vertriebs- und CRM-Tools hast du bisher genutzt?</FormLabel>
                      <FormDescription className="text-xs text-[#9ba3ad]">Wie haben diese Tools deine Produktivität oder deinen Erfolg unterstützt?</FormDescription>
                      <FormControl><Textarea {...field} data-testid="textarea-salesTools" placeholder="CRM, Telefonie, Kalender, Automationen ..." className="min-h-24 border-[#363d46] bg-[#1c2127] text-[#f4f0e8]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold">Passt die Zusammenarbeit?</h2>
                    <p className="mt-2 text-sm text-[#929ba6]">Wir suchen Menschen, die Verantwortung übernehmen und langfristig denken.</p>
                  </div>
                  <FormField control={control} name="softSkills" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Welche persönlichen Eigenschaften oder Soft Skills machen dich zu einem erfolgreichen Vertriebsmitarbeiter?</FormLabel>
                      <FormControl><Textarea {...field} data-testid="textarea-softSkills" placeholder="Was schätzen Kunden und Teamkollegen an deiner Arbeitsweise?" className="min-h-24 border-[#363d46] bg-[#1c2127] text-[#f4f0e8]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={control} name="careerGoals" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Was sind deine langfristigen beruflichen Ziele im Vertrieb?</FormLabel>
                      <FormDescription className="text-xs text-[#9ba3ad]">Wie planst du, diese Ziele zu erreichen?</FormDescription>
                      <FormControl><Textarea {...field} data-testid="textarea-careerGoals" placeholder="Beschreibe deine Ziele für die nächsten 12 bis 24 Monate." className="min-h-24 border-[#363d46] bg-[#1c2127] text-[#f4f0e8]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <ChoiceField control={control} name="fullFocusCommitment" label="Kannst du Vollzeit und mit vollem Fokus für unser Unternehmen arbeiten?" />
                  <FormField control={control} name="expectations" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Was ist deine Erwartungshaltung an uns?</FormLabel>
                      <FormControl><Textarea {...field} data-testid="textarea-expectations" placeholder="Was brauchst du, um starke Arbeit leisten zu können?" className="min-h-24 border-[#363d46] bg-[#1c2127] text-[#f4f0e8]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold">Kontaktdaten und Track-Record-Nachweise</h2>
                    <p className="mt-2 text-sm leading-6 text-[#929ba6]">Lade Bilder oder PDF-Nachweise hoch. Unternehmensnamen und vertrauliche Daten darfst du schwärzen. Kennzahlen wie Umsatz oder Abschlussquote müssen jedoch nachvollziehbar bleiben.</p>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {(["firstName", "lastName"] as const).map((name) => <FormField key={name} control={control} name={name} render={({ field }) => <FormItem><FormLabel>{name === "firstName" ? "Vorname" : "Nachname"}</FormLabel><FormControl><Input {...field} autoComplete={name === "firstName" ? "given-name" : "family-name"} data-testid={`input-${name}`} className="border-[#363d46] bg-[#1c2127] text-[#f4f0e8]" /></FormControl><FormMessage /></FormItem>} />)}
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {(["email", "phone"] as const).map((name) => <FormField key={name} control={control} name={name} render={({ field }) => <FormItem><FormLabel>{name === "email" ? "E-Mail-Adresse" : "Telefonnummer"}</FormLabel><FormControl><Input {...field} type={name === "email" ? "email" : "tel"} autoComplete={name === "email" ? "email" : "tel"} data-testid={`input-${name}`} className="border-[#363d46] bg-[#1c2127] text-[#f4f0e8]" /></FormControl><FormMessage /></FormItem>} />)}
                  </div>
                  <div className="rounded-xl border border-dashed border-[#675633] bg-[#211c12] p-6 text-center">
                    <UploadCloud className="mx-auto h-8 w-8 text-[#d9b871]" />
                    <p className="mt-3 text-sm font-medium text-[#eee5d5]">Track-Record-Nachweise auswählen</p>
                    <p className="mt-1 text-xs text-[#a99d84]">1–5 Dateien · JPG, PNG, WebP oder PDF · maximal 5 MB je Datei</p>
                    <input
                      {...evidenceRegistration}
                      type="file"
                      multiple
                      accept={acceptedExtensions}
                      onChange={(event) => {
                        evidenceRegistration.onChange(event);
                        setValue("evidenceFiles", event.target.files ?? undefined, { shouldValidate: true });
                        setSubmitError("");
                      }}
                      data-testid="input-evidenceFiles"
                      className="mx-auto mt-4 block max-w-full text-xs text-[#c9c0b1] file:mr-3 file:rounded-md file:border-0 file:bg-[#c6a15b] file:px-3 file:py-2 file:font-medium file:text-[#19150e]"
                    />
                  </div>
                  {fileNames.length > 0 && <div className="space-y-2" data-testid="list-evidenceFiles">{fileNames.map((name) => <div key={name} className="flex items-center gap-2 text-sm text-[#c8ced5]"><FileText className="h-4 w-4 text-[#c6a15b]" />{name}</div>)}</div>}
                  <FormField control={control} name="privacyConsent" render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 rounded-xl border border-[#343a43] bg-[#171b21] p-4">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-privacyConsent" /></FormControl>
                      <div className="space-y-1">
                        <FormLabel>Ich stimme der Verarbeitung meiner Bewerbungsdaten und Nachweise zu.</FormLabel>
                        <FormDescription className="text-xs text-[#929ba6]">Die Angaben werden vertraulich und ausschließlich für den Bewerbungsprozess verwendet. Weitere Informationen findest du in der <a href="/datenschutz" target="_blank" rel="noreferrer" data-testid="link-datenschutz" className="text-[#d9b871] underline underline-offset-2">Datenschutzerklärung</a>.</FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )} />
                  {submitError && <p role="alert" data-testid="status-submit-error" className="rounded-lg border border-[#704044] bg-[#2a191d] p-3 text-sm text-[#e7aeb0]">{submitError}</p>}
                </div>
              )}
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#2b3138] pt-6"><button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0 || isSubmitting} data-testid="button-back" className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#aeb5bf] transition-colors hover:bg-[#20252b] hover:text-[#f4f0e8] disabled:invisible"><ArrowLeft className="h-4 w-4" />Zurück</button>{step < steps.length - 1 ? <button type="button" onClick={moveNext} data-testid="button-next" className="inline-flex items-center gap-2 rounded-lg bg-[#c6a15b] px-5 py-2.5 text-sm font-semibold text-[#1b160d] transition-colors hover:bg-[#d9b871]">Weiter<ArrowRight className="h-4 w-4" /></button> : <button type="submit" disabled={isSubmitting || formState.isSubmitting} data-testid="button-submit" className="inline-flex items-center gap-2 rounded-lg bg-[#c6a15b] px-5 py-2.5 text-sm font-semibold text-[#1b160d] transition-colors hover:bg-[#d9b871] disabled:cursor-wait disabled:opacity-60">{isSubmitting ? "Wird übermittelt ..." : "Bewerbung absenden"}<ArrowRight className="h-4 w-4" /></button>}</div>
            </form>
          </Form>
        </section>
      </div>
    </main>
  );
}