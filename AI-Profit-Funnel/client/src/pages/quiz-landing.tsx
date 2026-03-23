import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Calendar, CheckCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/useAnalytics";
import MiniFunnel from "@/components/MiniFunnel";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    Calendly: any;
  }
}

function formatTime(seconds: number): string {
  if (seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function QuizLandingPage() {
  const [showVideo, setShowVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [playerReady, setPlayerReady] = useState(false);
  const [ctaUnlocked, setCtaUnlocked] = useState(false);
  const [timeToUnlock, setTimeToUnlock] = useState<number | null>(null);
  const [showMiniFunnel, setShowMiniFunnel] = useState(false);
  const miniFunnelRef = useRef<HTMLDivElement>(null);

  const playerRef = useRef<any>(null);
  const expectedTimeRef = useRef<number>(0);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { trackPageView, trackEvent } = useAnalytics();

  useEffect(() => {
    trackPageView("/");
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "PageView");
    }

    const link = document.createElement("link");
    link.href = "https://assets.calendly.com/assets/external/widget.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!showVideo) return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("yt-player-home", {
        videoId: "ZYc4uDJxE2A",
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          fs: 0,
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
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [showVideo]);

  const startProgressTracking = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      if (!playerRef.current?.getCurrentTime || !playerRef.current?.getDuration) return;

      const current = playerRef.current.getCurrentTime();
      const duration = playerRef.current.getDuration();
      if (!duration || duration <= 0) return;

      const halfwayPoint = duration * 0.5;
      const remaining = halfwayPoint - current;

      if (current >= halfwayPoint) {
        setCtaUnlocked(true);
        setTimeToUnlock(0);
        clearInterval(timerIntervalRef.current!);
      } else {
        setTimeToUnlock(remaining);
      }
    }, 500);
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

  const onPlayerReady = (event: any) => {
    setPlayerReady(true);
    event.target.playVideo();
    setIsPlaying(true);
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      startSeekProtection();
      startProgressTracking();
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    } else if (event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setCtaUnlocked(true);
    }
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
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

  const startVideo = () => {
    setShowVideo(true);
    trackEvent("video_start");
  };

  const handleCtaClick = () => {
    trackEvent("cta_click_book_appointment");
    setShowMiniFunnel(true);
    setTimeout(() => {
      miniFunnelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const CALENDLY_URL = "https://calendly.com/florianbenedict/kostenloses-potenzialgesprach";

  const openCalendlyPopup = () => {
    trackEvent("calendly_open");
    if (window.Calendly) {
      window.Calendly.initPopupWidget({ url: CALENDLY_URL });
    } else {
      window.open(CALENDLY_URL, "_blank");
    }
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
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
                <div className="text-center relative z-10">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 mx-auto rounded-full bg-primary flex items-center justify-center transition-transform group-hover:scale-110 mb-3 sm:mb-4">
                    <Play className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary-foreground ml-1" />
                  </div>
                  <p className="text-white font-medium text-sm sm:text-base">Video starten</p>
                </div>
              </div>
            ) : (
              <>
                <div id="yt-player-home" className="absolute inset-0 w-full h-full" />
                {playerReady && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-3 md:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={togglePlay}
                        className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors touch-manipulation"
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                        ) : (
                          <Play className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground ml-0.5" />
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
                          className="w-16 sm:w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-primary touch-manipulation"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Timer + CTA Area */}
          <div className="text-center mb-6 sm:mb-8">
            {!ctaUnlocked ? (
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                {/* Lock indicator */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/60 border border-border text-muted-foreground text-sm sm:text-base">
                  <Lock className="h-4 w-4 flex-shrink-0" />
                  {showVideo && timeToUnlock !== null && timeToUnlock > 0 ? (
                    <span>
                      Terminbuchung freischaltet in{" "}
                      <span className="font-bold text-foreground tabular-nums">
                        {formatTime(timeToUnlock)}
                      </span>
                    </span>
                  ) : showVideo ? (
                    <span>Video lädt...</span>
                  ) : (
                    <span>Schau das Video, um einen Termin zu buchen</span>
                  )}
                </div>

                {/* Disabled CTA placeholder */}
                <Button
                  size="lg"
                  disabled
                  className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-semibold opacity-40 cursor-not-allowed"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Jetzt Termin buchen
                </Button>
              </div>
            ) : !showMiniFunnel ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm sm:text-base text-primary font-semibold">
                  Terminbuchung freigeschalten!
                </p>
                <Button
                  size="lg"
                  onClick={handleCtaClick}
                  className="cta-blink w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-bold touch-manipulation active:scale-[0.98] transition-transform"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Jetzt Termin buchen
                </Button>
              </div>
            ) : null}
          </div>

          {/* Warning Text */}
          <div className="text-center space-y-2 sm:space-y-3 mb-6 sm:mb-8">
            <p className="text-sm sm:text-base md:text-lg text-primary font-semibold">
              Achtung: Bitte schau dir zuerst das ganze Video Training an, bevor du dir einen Termin buchst
            </p>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed underline decoration-primary/50 underline-offset-4">
              Wir möchten nicht mit Menschen sprechen, welche sich ein hohes 4-5 stelliges Einkommen aufbauen wollen aber nicht bereit sind ein kurzes und wertvolles Videotraining anzusehen
            </p>
          </div>

          {/* Mini-Funnel */}
          {showMiniFunnel && (
            <div
              ref={miniFunnelRef}
              className="mt-4 sm:mt-6 bg-card/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg shadow-primary/5"
            >
              <div className="text-center mb-5 sm:mb-6">
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-3">
                  Nur noch 3 kurze Fragen
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Damit wir sicherstellen, dass wir die richtige Lösung für dich haben.
                </p>
              </div>
              <MiniFunnel onComplete={openCalendlyPopup} />
            </div>
          )}
        </div>
      </section>

      {/* Das System Section */}
      <section className="py-10 sm:py-12 md:py-16 px-3 sm:px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Left: Text */}
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
                  "Nur 1-2h Zeitaufwand pro Tag",
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
            {/* Right: Portrait */}
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div
                className="w-52 h-52 sm:w-64 sm:h-64 rounded-full border-4 border-amber-300"
                style={{
                  backgroundImage: "url('/assets/florian-mehler.png')",
                  backgroundSize: "560%",
                  backgroundPosition: "95% 38%",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div className="text-center">
                <p className="font-bold text-foreground">Florian Mehler</p>
                <p className="text-sm text-muted-foreground">Gründer der KI-Klick Methode</p>
              </div>
            </div>
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

      {/* Payout Screens Section */}
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
            <span>|</span>
            <a href="#" className="hover:text-foreground transition-colors">AGB</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
