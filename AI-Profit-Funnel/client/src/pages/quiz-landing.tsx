import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Pause, Volume2, VolumeX, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/useAnalytics";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function QuizLandingPage() {
  const [, navigate] = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(80);
  const [playerReady, setPlayerReady] = useState(false);

  const playerRef = useRef<any>(null);
  const expectedTimeRef = useRef<number>(0);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const ytApiLoadedRef = useRef(false);
  const { trackPageView, trackEvent } = useAnalytics();

  useEffect(() => {
    trackPageView("/");
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "PageView");
    }
  }, []);

  const startSeekProtection = useCallback(() => {
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    checkIntervalRef.current = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime();
        if (currentTime > expectedTimeRef.current + 2) {
          playerRef.current.seekTo(expectedTimeRef.current, true);
        } else {
          expectedTimeRef.current = currentTime;
        }
      }
    }, 500);
  }, []);

  const onPlayerReady = useCallback((event: any) => {
    setPlayerReady(true);
    event.target.setVolume(volume);
    event.target.mute();
    event.target.playVideo();
    setIsPlaying(true);
    trackEvent("video_start");
  }, [volume, trackEvent]);

  const milestonesFiredRef = useRef<Set<number>>(new Set());

  const onPlayerStateChange = useCallback((event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      startSeekProtection();

      // milestone tracking
      const interval = setInterval(() => {
        if (!playerRef.current?.getCurrentTime || !playerRef.current?.getDuration) return;
        const current = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        if (!duration || duration <= 0) return;
        const pct = (current / duration) * 100;
        for (const milestone of [25, 50, 75, 100]) {
          if (pct >= milestone && !milestonesFiredRef.current.has(milestone)) {
            milestonesFiredRef.current.add(milestone);
            trackEvent(`video_${milestone}`);
          }
        }
      }, 500);

      return () => clearInterval(interval);
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    } else if (event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    }
  }, [startSeekProtection, trackEvent]);

  const initPlayer = useCallback(() => {
    if (playerRef.current) return;
    playerRef.current = new window.YT.Player("yt-player-home", {
      videoId: "ZYc4uDJxE2A",
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        rel: 0,
        fs: 0,
        iv_load_policy: 3,
        playsinline: 1,
        mute: 1,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  }, [onPlayerReady, onPlayerStateChange]);

  useEffect(() => {
    if (ytApiLoadedRef.current) return;
    ytApiLoadedRef.current = true;

    if (window.YT && window.YT.Player) {
      initPlayer();
      return;
    }

    window.onYouTubeIframeAPIReady = () => initPlayer();

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [initPlayer]);

  const handleVideoClick = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume);
      setIsMuted(false);
      expectedTimeRef.current = 0;
      milestonesFiredRef.current.clear();
      playerRef.current.seekTo(0, true);
      playerRef.current.playVideo();
      return;
    }
    if (!isPlaying) {
      playerRef.current.playVideo();
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerRef.current) return;
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume);
    } else {
      playerRef.current.mute();
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  };

  const handleCtaClick = () => {
    trackEvent("cta_click");
    trackEvent("funnel_start");
    navigate("/quiz");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero + Video Section */}
      <section className="py-6 sm:py-10 md:py-14 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">

          {/* Headline */}
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <div className="mb-4 sm:mb-5 px-2">
              <span className="highlight-strong text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-relaxed">
                Wie du dir als Anfänger mit KI, ohne Vorkenntnisse ein seriöses und nachhaltiges Nebeneinkommen aufbauen kannst
              </span>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-primary font-semibold mb-2">
              Drücke jetzt auf Play — das Video startet automatisch
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
          <div
            className="relative aspect-video bg-black rounded-lg sm:rounded-xl border border-border overflow-hidden mb-4 sm:mb-6 cursor-pointer"
            onClick={handleVideoClick}
          >
            <div id="yt-player-home" className="absolute inset-0 w-full h-full pointer-events-none" />

            {playerReady && isMuted && (
              <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 cursor-pointer"
                onClick={handleVideoClick}
              >
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary flex items-center justify-center mb-3 shadow-lg shadow-primary/40 animate-pulse">
                  <Volume2 className="h-7 w-7 sm:h-9 sm:w-9 text-primary-foreground" />
                </div>
                <span className="text-white font-semibold text-sm sm:text-base px-4 py-2 rounded-full bg-black/70">
                  🔊 Tippe für Ton
                </span>
              </div>
            )}

            {playerReady && (
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-3 md:p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={togglePlay}
                    className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors touch-manipulation flex-shrink-0"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                    ) : (
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={toggleMute}
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors touch-manipulation"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                      ) : (
                        <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      onClick={(e) => e.stopPropagation()}
                      className="w-16 sm:w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-primary touch-manipulation"
                    />
                  </div>
                  {isMuted && (
                    <span className="text-xs text-white/70 ml-1 hidden sm:inline">
                      🔇 Klicke auf 🔊 zum Einschalten
                    </span>
                  )}
                </div>
              </div>
            )}

            {!playerReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <div className="text-center">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 mx-auto rounded-full bg-primary/80 flex items-center justify-center mb-3 animate-pulse">
                    <svg className="h-6 w-6 sm:h-7 sm:w-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-white/80 text-sm">Video lädt...</p>
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex flex-col items-center gap-3">
              <Button
                size="lg"
                onClick={handleCtaClick}
                className="cta-blink w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-bold touch-manipulation active:scale-[0.98] transition-transform"
              >
                Jetzt herausfinden, ob ich geeignet bin
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-xs text-muted-foreground">
                Kostenlos & unverbindlich — dauert nur 60 Sekunden
              </p>
            </div>
          </div>

          {/* Warning Text */}
          <div className="text-center space-y-2 sm:space-y-3 mb-6 sm:mb-8">
            <p className="text-sm sm:text-base md:text-lg text-primary font-semibold">
              Achtung: Bitte schau dir zuerst das ganze Video an, bevor du das Quiz startest
            </p>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed underline decoration-primary/50 underline-offset-4">
              Wir möchten nicht mit Menschen sprechen, welche sich ein hohes 4–5 stelliges Einkommen aufbauen wollen, aber nicht bereit sind ein kurzes und wertvolles Videotraining anzusehen
            </p>
          </div>
        </div>
      </section>

      {/* Das System Section */}
      <section className="py-10 sm:py-12 md:py-16 px-3 sm:px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 leading-relaxed">
                <span className="highlight">Das System für normale</span>
                <br />
                <span className="highlight">Angestellte</span>
              </h2>
              <p className="text-base text-muted-foreground mb-6">
                Baue dir neben deinem Job ein zweites Einkommen auf. Ohne verkaufen zu müssen oder ein eigenes Business von null zu starten.
              </p>
              <ul className="space-y-3">
                {[
                  "Keine Vorerfahrung nötig",
                  "Nur 1–2h Zeitaufwand pro Tag",
                  "Von überall aus möglich",
                  "Neben dem Job machbar",
                  "Ohne dein Gesicht zu zeigen",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-foreground">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm sm:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <img
                src="/assets/WhatsApp_Image_2025-12-12_at_11.54.15_(1)_1765900281327.jpeg"
                alt="Florian Benedict"
                className="w-56 sm:w-64 rounded-xl"
              />
              <div className="text-center">
                <p className="font-bold text-foreground">Florian Benedict</p>
                <p className="text-sm text-muted-foreground">Gründer der KI-Klick Methode</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Testimonials */}
      <section className="py-10 sm:py-12 md:py-16 px-3 sm:px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <span className="highlight text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
              Das sagen unsere Teilnehmer
            </span>
          </div>
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

      {/* Payout Screens */}
      <section className="py-10 sm:py-12 md:py-16 px-3 sm:px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <span className="highlight text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
              Stell dir vor, dein Handybildschirm sieht bald so aus
            </span>
          </div>
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

      {/* Benefits Row */}
      <section className="py-8 sm:py-10 px-3 sm:px-4 border-t border-border bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm sm:text-base text-muted-foreground">
            {[
              "350+ erfolgreiche Partner",
              "90% automatisiert",
              "Keine Vorkenntnisse nötig",
              "Neben dem Job machbar",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{item}</span>
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
          </div>
        </div>
      </footer>
    </div>
  );
}
