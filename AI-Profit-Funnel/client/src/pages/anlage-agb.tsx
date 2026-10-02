import { useEffect } from "react";
import conditions from "@assets/anlage-agb.txt?raw";

// Keep the supplied legal wording verbatim; only structure the document visually.
const lines = conditions.split(/\r?\n/).filter(line => line.trim());

export default function AnlageAgbPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Anlage AGB – Garantiebedingungen – Umsatzgarantie";
    const tags = [
      ["name", "robots", "noindex, nofollow"],
      ["name", "description", "Anlage AGB: Garantiebedingungen zur Marketing-Lizenz- und Vertriebsvereinbarung."],
      ["property", "og:title", "Anlage AGB – Garantiebedingungen – Umsatzgarantie"],
      ["property", "og:description", "Garantiebedingungen zur Marketing-Lizenz- und Vertriebsvereinbarung."],
    ].map(([attribute, name, content]) => {
      const existing = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
      const element = existing ?? document.createElement("meta");
      const previousContent = existing?.getAttribute("content");
      element.setAttribute(attribute, name);
      element.setAttribute("content", content);
      if (!existing) document.head.appendChild(element);
      return { element, existing, previousContent };
    });
    return () => {
      document.title = previousTitle;
      tags.forEach(({ element, existing, previousContent }) => {
        if (!existing) element.remove();
        else if (previousContent === null) element.removeAttribute("content");
        else element.setAttribute("content", previousContent ?? "");
      });
    };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 break-words">
        <header className="mb-8">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase mb-2">Anlage AGB</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{lines[0]}</h1>
          <p className="text-lg text-muted-foreground mb-6">{lines[1]}</p>
          <p className="text-sm text-muted-foreground">{lines[2]}</p>
          <p className="text-sm text-muted-foreground mt-2">{lines[3]}</p>
        </header>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          {lines.slice(4).map((line, index) =>
            /^\d+\.\s/.test(line) ? (
              <h2 key={index} className="text-xl font-semibold text-foreground !mt-8 mb-3">{line}</h2>
            ) : (
              <p key={index}>{line}</p>
            ),
          )}
        </div>
      </article>
    </main>
  );
}