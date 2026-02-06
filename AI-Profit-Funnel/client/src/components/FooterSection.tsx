export default function FooterSection() {
  return (
    <footer className="py-8 bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            KI-Vertrieb 2024. Alle Rechte vorbehalten.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
            <a 
              href="/impressum" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-impressum"
            >
              Impressum
            </a>
            <a 
              href="/datenschutz" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-datenschutz"
            >
              Datenschutz
            </a>
            <a 
              href="#agb" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-agb"
            >
              AGB
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
