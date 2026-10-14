import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, ArrowRight } from "lucide-react";
import { normalizePhone } from "@shared/phone";
import { parsePhoneNumberFromString } from "libphonenumber-js/max";

const formSchema = z.object({
  name: z.string().min(2, "Bitte gib deinen Namen ein"),
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein"),
  countryCode: z.string().default("+49"),
  phone: z.string().trim().min(1, "Bitte gib deine Telefonnummer ein"),
}).superRefine((data, ctx) => {
  try {
    normalizePhone(data.phone, data.countryCode);
  } catch (error) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: (error as Error).message });
  }
});

type FormData = z.infer<typeof formSchema>;

interface LeadFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
}

export default function LeadForm({ onSubmit, isLoading }: LeadFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      countryCode: "+49",
      phone: "",
    },
  });

  const phoneInput = form.watch("phone");
  const selectedCode = form.watch("countryCode");
  const internationalInput = /^\s*(\+|00)/.test(phoneInput);
  let preview: ReturnType<typeof parsePhoneNumberFromString>;
  try {
    preview = parsePhoneNumberFromString(normalizePhone(phoneInput, selectedCode));
  } catch {
    // Incomplete input is normal while typing. Show errors on submit, not per key.
  }
  const countryName = preview?.country
    ? new Intl.DisplayNames(["de"], { type: "region" }).of(preview.country)
    : undefined;
  const possibleOtherCountry = !internationalInput && selectedCode === "+49" &&
    /^(079|0664)/.test(phoneInput.replace(/[\s()./-]/g, ""));

  const handleSubmit = async (data: FormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      form.setError("phone", { message: (error as Error).message });
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-2 sm:px-4">
      <div className="text-center mb-4 sm:mb-6 md:mb-8">
        <div className="inline-block px-3 sm:px-4 py-1 rounded-full bg-primary/20 text-primary text-xs sm:text-sm font-medium mb-2 sm:mb-4">
          Fast geschafft!
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 sm:mb-3">
          Sichere dir jetzt deinen Zugang
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground px-2">
          Trage deine Daten ein und erhalte sofortigen Zugang zum exklusiven Video-Training.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground text-sm sm:text-base">Dein Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Max Mustermann"
                      className="h-11 sm:h-12 bg-background border-input text-base touch-manipulation"
                      data-testid="input-name"
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground text-sm sm:text-base">Deine E-Mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="max@beispiel.de"
                      className="h-11 sm:h-12 bg-background border-input text-base touch-manipulation"
                      data-testid="input-email"
                      autoComplete="email"
                      inputMode="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground text-sm sm:text-base">Deine WhatsApp-Nummer</FormLabel>
                  <div className="flex gap-2">
                    {internationalInput ? (
                      <div
                        className="shrink-0 min-w-24 px-3 h-11 sm:h-12 flex items-center justify-center rounded-md border border-input bg-background text-sm"
                        data-testid="detected-country"
                        title={countryName ?? "Internationale Telefonnummer"}
                      >
                        {preview ? `+${preview.countryCallingCode}` : "International"}
                      </div>
                    ) : <Select
                      value={selectedCode}
                      onValueChange={(value) => {
                        form.setValue("countryCode", value);
                        if (form.getValues("phone")) void form.trigger("phone");
                      }}
                    >
                      <SelectTrigger aria-label="Land deiner Telefonnummer" className="w-28 shrink-0 h-11 sm:h-12 bg-background border-input" data-testid="select-country-code">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+49">DE +49</SelectItem>
                        <SelectItem value="+43">AT +43</SelectItem>
                        <SelectItem value="+41">CH +41</SelectItem>
                        <SelectItem value="international">Andere</SelectItem>
                      </SelectContent>
                    </Select>}
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder={selectedCode === "international" ? "+39 …" : "01512 3456789"}
                        className="min-w-0 flex-1 h-11 sm:h-12 bg-background border-input text-base touch-manipulation"
                        data-testid="input-phone"
                        autoComplete="tel"
                        inputMode="tel"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5">
                    Nummer eingeben oder einfügen. Mit + oder 00 erkennen wir die Ländervorwahl automatisch.
                  </p>
                  {preview && (
                    <p className="text-xs sm:text-sm text-foreground" aria-live="polite" data-testid="phone-preview">
                      Deine Nummer: <strong>{preview.formatInternational()}</strong>
                      {countryName && <> ({countryName})</>}
                    </p>
                  )}
                  {possibleOtherCountry && (
                    <p className="text-xs text-amber-400" role="status">
                      Nummer aus der Schweiz oder Österreich? Bitte wähle oben das passende Land.
                      Aktuell ist Deutschland (+49) ausgewählt.
                    </p>
                  )}
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold touch-manipulation active:scale-[0.98] transition-transform"
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  <span>Wird gesendet...</span>
                </>
              ) : (
                <>
                  <span>Nächster Schritt</span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </>
              )}
            </Button>
          </form>
        </Form>

        <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-3 sm:mt-4">
          Deine Daten sind bei uns sicher und werden nicht an Dritte weitergegeben.
        </p>
      </div>
    </div>
  );
}
