import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, ArrowRight } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Bitte gib deinen Namen ein"),
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein"),
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
    },
  });

  const handleSubmit = async (data: FormData) => {
    await onSubmit(data);
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
                  <span>Jetzt Video ansehen</span>
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
