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
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="text-center mb-8">
        <div className="inline-block px-4 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
          Fast geschafft!
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Sichere dir jetzt deinen Zugang
        </h2>
        <p className="text-muted-foreground">
          Trage deine Daten ein und erhalte sofortigen Zugang zum exklusiven Video-Training.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Dein Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Max Mustermann"
                      className="h-12 bg-background border-input"
                      data-testid="input-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Deine E-Mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="max@beispiel.de"
                      className="h-12 bg-background border-input"
                      data-testid="input-email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full h-14 text-lg font-semibold"
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  Jetzt Video ansehen
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </Form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Deine Daten sind bei uns sicher und werden nicht an Dritte weitergegeben.
        </p>
      </div>
    </div>
  );
}
