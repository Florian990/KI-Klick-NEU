import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import QuizLandingPage from "@/pages/quiz-landing";
import VSLPage from "@/pages/vsl";
import AdminStatsPage from "@/pages/admin-stats";
import ImpressumPage from "@/pages/impressum";

function Router() {
  return (
    <Switch>
      <Route path="/" component={QuizLandingPage} />
      <Route path="/vsl" component={VSLPage} />
      <Route path="/impressum" component={ImpressumPage} />
      <Route path="/admin/stats" component={AdminStatsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
