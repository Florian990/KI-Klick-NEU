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
import DatenschutzPage from "@/pages/datenschutz";
import GarantiePage from "@/pages/garantie";
import AgbKiKlickPage from "@/pages/agb-ki-klick";
import ErfolgsgarantieKiKlickPage from "@/pages/erfolgsgarantie-ki-klick";
import DankePage from "@/pages/danke";

function Router() {
  return (
    <Switch>
      <Route path="/" component={QuizLandingPage} />
      <Route path="/vsl" component={VSLPage} />
      <Route path="/danke" component={DankePage} />
      <Route path="/impressum" component={ImpressumPage} />
      <Route path="/datenschutz" component={DatenschutzPage} />
      <Route path="/garantie" component={GarantiePage} />
      <Route path="/agbkiklick" component={AgbKiKlickPage} />
      <Route path="/erfolgsgarantiekiklick" component={ErfolgsgarantieKiKlickPage} />
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
