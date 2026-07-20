import { Play, Calendar, Star } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/useAnalytics";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    Calendly: any;
  }
}

export default function VSLPage() {
  const [showVideo, setShowVideo] = useState(false);
  const playerRef = useRef<any>(null);
  const expectedTimeRef = useRef<number>(0);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { trackPageView, trackEvent } = useAnalytics();

  useEffect(() => {
    trackPageView('/vsl');
    
    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    // Preload YouTube so the player appears fast and the box doesn't stay black.
    // Idempotent: never add duplicates across re-mounts.
    if (!document.querySelector('link[data-yt-preconnect]')) {
      const ytPreconnect = document.createElement('link');
      ytPreconnect.rel = 'preconnect';
      ytPreconnect.href = 'https://www.youtube.com';
      ytPreconnect.setAttribute('data-yt-preconnect', '');
      document.head.appendChild(ytPreconnect);
    }

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const ytApi = document.createElement('script');
      ytApi.src = 'https://www.youtube.com/iframe_api';
      ytApi.async = true;
      document.head.appendChild(ytApi);
    }

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!showVideo) return;

    if (!window.YT && !document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: 'ZYc4uDJxE2A',
        playerVars: {
          // Native YouTube controls: fullscreen + speed work everywhere (incl. iPhone).
          // Forward-seeking is still blocked by the seek protection below.
          controls: 1,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          fs: 1,
          iv_load_policy: 3,
          playsinline: 1,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    };

    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [showVideo]);

  const onPlayerReady = (event: any) => {
    event.target.playVideo();
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      startSeekProtection();
    } else if (event.data === window.YT.PlayerState.ENDED) {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    }
  };

  const startSeekProtection = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    checkIntervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime();
        
        // Per 500ms tick the video legitimately advances ~0.5s * rate.
        // Allow that plus a small jitter margin — anything beyond is a seek.
        const rate = playerRef.current.getPlaybackRate
          ? playerRef.current.getPlaybackRate()
          : 1;
        const tolerance = 1.5 + 0.5 * rate;
        if (currentTime > expectedTimeRef.current + tolerance) {
          playerRef.current.seekTo(expectedTimeRef.current, true);
        } else {
          expectedTimeRef.current = currentTime;
        }
      }
    }, 500);
  }, []);

  const startVideo = () => {
    setShowVideo(true);
    trackEvent('video_start');
  };

  const openCalendlyPopup = () => {
    trackEvent('calendly_open');
    if (window.Calendly) {
      window.Calendly.initPopupWidget({
        url: 'https://calendly.com/ki-klick-methode/kennenlernen-30-minuten-clone'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* VSL Section */}
      <section className="py-6 sm:py-10 md:py-16 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <div className="mb-4 sm:mb-5 px-2">
              <span className="highlight-strong text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-relaxed">
                Wie du dir als Anfänger mit KI, ohne Vorkenntnisse ein seriöses und nachhaltiges Nebeneinkommen aufbauen kannst
              </span>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-primary font-semibold mb-2">
              Drücke jetzt auf Play
            </p>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 px-2 underline decoration-primary/50 underline-offset-4">
              Bitte schau dir das Video von Anfang bis Ende an (Dauer 15 min)
            </p>
            <div className="inline-block bg-primary/10 border border-primary/30 rounded-lg px-4 py-2">
              <p className="text-xs sm:text-sm text-primary font-medium">
                Achtung: Das Video kann bis zu 10 Sek. laden
              </p>
            </div>
          </div>

          {/* Video Player */}
          <div className="relative aspect-video bg-card rounded-lg sm:rounded-xl border border-border overflow-hidden mb-4 sm:mb-6">
            {!showVideo ? (
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                onClick={startVideo}
                data-testid="button-play-video"
              >
                <img
                  src="https://img.youtube.com/vi/ZYc4uDJxE2A/maxresdefault.jpg"
                  alt="Video Vorschau"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://img.youtube.com/vi/ZYc4uDJxE2A/hqdefault.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
                <div className="text-center relative z-10">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 mx-auto rounded-full bg-primary flex items-center justify-center transition-transform group-hover:scale-110 mb-3 sm:mb-4">
                    <Play className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary-foreground ml-1" />
                  </div>
                  <p className="text-white font-medium text-sm sm:text-base">Video starten</p>
                </div>
              </div>
            ) : (
              <div id="youtube-player" className="absolute inset-0 w-full h-full" />
            )}
          </div>

          {/* Warning Text */}
          <div className="text-center mb-6 sm:mb-8 space-y-3 sm:space-y-4">
            <p className="text-sm sm:text-base md:text-lg text-primary font-semibold">
              Achtung: Bitte schau dir zuerst das ganze Video Training an, bevor du dir einen Termin buchst
            </p>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed underline decoration-primary/50 underline-offset-4">
              Wir möchten nicht mit Menschen sprechen, welche sich ein hohes 4-5 stelliges Einkommen aufbauen wollen aber nicht bereit sind ein kurzes und wertvolles Videotraining anzusehen
            </p>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={openCalendlyPopup}
              className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-semibold touch-manipulation active:scale-[0.98] transition-transform"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Jetzt für einen der begrenzten 5 Plätze bewerben
            </Button>
          </div>
        </div>
      </section>

      {/* WhatsApp Testimonials Section */}
      <section className="py-10 sm:py-12 md:py-16 px-3 sm:px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <span className="highlight text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
              Das sagen unsere Teilnehmer
            </span>
          </div>
          
          {/* WhatsApp Screenshots */}
          <div className="columns-2 sm:columns-3 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
            {[
              "/assets/testimonial2.png",
              "/assets/testimonial3.png",
              "/assets/testimonial5.jpeg",
            ].map((src, index) => (
              <div key={index} className="break-inside-avoid">
                <img 
                  src={src} 
                  alt={`WhatsApp Testimonial ${index + 1}`}
                  className="w-full h-auto rounded-lg sm:rounded-xl shadow-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Testimonials Section */}
      <section className="py-10 sm:py-12 md:py-16 px-3 sm:px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <span className="highlight text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
              Echte Erfahrungsberichte unserer Teilnehmer
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {[
              { id: "q6q_x_SVbT8", name: "Eric" },
              { id: "n3f7cc5d0qo", name: "Andrea" },
            ].map((video) => (
              <div key={video.id} className="space-y-3">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-card">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={`Bewertung KI-Klick Methode – ${video.name}`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    loading="lazy"
                    allowFullScreen
                  />
                </div>
                <p className="text-center text-sm sm:text-base font-semibold text-foreground">
                  {video.name} über die KI-Klick Methode
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payout Screens Section */}
      <section className="py-10 sm:py-12 md:py-16 px-3 sm:px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <span className="highlight text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
              Stell dir vor, dein Handybildschirm sieht bald so aus
            </span>
          </div>
          
          {/* Payout Screenshots */}
          <div className="columns-2 sm:columns-3 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
            {[
              "/assets/testimonial1.jpeg",
              "/assets/testimonial6.jpeg",
              "/assets/testimonial7.jpeg",
            ].map((src, index) => (
              <div key={index} className="break-inside-avoid">
                <img 
                  src={src} 
                  alt={`Auszahlung ${index + 1}`}
                  className="w-full h-auto rounded-lg sm:rounded-xl shadow-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Written Reviews Section */}
      <section className="py-10 sm:py-12 md:py-16 px-3 sm:px-4 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <span className="highlight text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
              Das schreiben unsere Teilnehmer
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {[
              {
                name: "Markus W.",
                text: "Ehrlich gesagt war ich anfangs skeptisch. Aber das Training ist verständlich erklärt und der Support hat sich wirklich Zeit für mich genommen. Die ersten Ergebnisse haben mich überzeugt.",
              },
              {
                name: "Sandra L.",
                text: "Ich hatte vorher null Erfahrung. Genau deshalb hat mir der Schritt-für-Schritt-Aufbau so geholfen. Man wird nicht alleingelassen, das war mir am wichtigsten.",
              },
              {
                name: "Daniel K.",
                text: "Was mir gefällt: keine leeren Versprechen, sondern ein klarer Plan. Es ist Arbeit, aber wenn man dranbleibt, lohnt es sich. Kann ich nur weiterempfehlen.",
              },
              {
                name: "Julia P.",
                text: "Neben meinem Hauptjob konnte ich mir nach und nach etwas aufbauen. Die Termine waren persönlich und nicht aufdringlich. Fühlt sich seriös an.",
              },
            ].map((review) => (
              <div
                key={review.name}
                className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm"
              >
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3">
                  „{review.text}“
                </p>
                <p className="text-sm font-semibold text-foreground">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-3 sm:px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-4 sm:mb-6">
            <p className="text-[10px] sm:text-xs text-primary font-medium">© 2026 KI-Klick Methode</p>
            <p className="text-[10px] sm:text-xs text-primary">Alle Rechte vorbehalten.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
            <a href="/impressum" className="hover:text-foreground transition-colors">Impressum</a>
            <span>|</span>
            <a href="/datenschutz" className="hover:text-foreground transition-colors">Datenschutzerklärung</a>
            <span>|</span>
            <a href="#" className="hover:text-foreground transition-colors">AGB</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
