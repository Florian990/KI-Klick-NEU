import { useState, useEffect, useRef, useCallback } from "react";
import { Pause, Volume2, VolumeX, CheckCircle, Lock, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/useAnalytics";
import MiniFunnel from "@/components/MiniFunnel";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function formatTime(seconds: number): string {
  if (seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const TESTIMONIAL_IMAGES = [
  "/assets/testimonial2.png",
  "/assets/testimonial3.png",
  "/assets/testimonial5.jpeg",
  "/assets/testimonial1.jpeg",
  "/assets/testimonial6.jpeg",
  "/assets/testimonial7.jpeg",
];

const TEXT_REVIEWS = [
  {
    name: "Marco B.",
    stars: 5,
    date: "vor 2 Wochen",
    text: "Ich war ehrlich gesagt skeptisch am Anfang. Aber nach den ersten 3 Wochen hatte ich meinen ersten Auftrag und 800 € auf dem Konto. Das System ist wirklich simpel und nachvollziehbar erklärt.",
  },
  {
    name: "Sabrina K.",
    stars: 5,
    date: "vor 1 Monat",
    text: "Als Vollzeit-Angestellte dachte ich, ich hätte keine Zeit dafür. Falsch gedacht. Morgens 1 Stunde vor der Arbeit — nach 6 Wochen: 1.400 € Zusatzeinnahmen. Mein Mann kann es nicht glauben.",
  },
  {
    name: "Tobias H.",
    stars: 5,
    date: "vor 3 Wochen",
    text: "Florian erklärt alles Schritt für Schritt. Keine technischen Vorkenntnisse nötig. Ich habe 0 Ahnung von KI gehabt und trotzdem in Woche 2 die ersten Ergebnisse gesehen.",
  },
  {
    name: "Melanie R.",
    stars: 5,
    date: "vor 5 Tagen",
    text: "Das Gespräch war super angenehm, kein Druck, kein Verkaufsgespräch. Man merkt, dass es wirklich darum geht, ob es zu einem passt. Ich bin jetzt seit 5 Wochen dabei — kein einziges Mal bereut.",
  },
  {
    name: "Dennis W.",
    stars: 5,
    date: "vor 2 Monaten",
    text: "2.300 € im ersten vollen Monat. Neben meinem 40h Job. Ich habe nicht geglaubt, dass das realistisch ist. War es aber. Die Community und der Support machen den Unterschied.",
  },
  {
    name: "Lena F.",
    stars: 5,
    date: "vor 3 Tagen",
    text: "Endlich ein System, das nicht verspricht, über Nacht reich zu werden — sondern zeigt, wie man konsequent aufbaut. Sehr authentisch und glaubwürdig. Bin total happy mit meiner Entscheidung.",
  },
];

export default function QuizLandingPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(80);
  const [playerReady, setPlayerReady] = useState(false);
  const [ctaUnlocked, setCtaUnlocked] = useState(false);
  const [timeToUnlock, setTimeToUnlock] = useState<number | null>(null);
  const [showMiniFunnel, setShowMiniFunnel] = useState(false);
  const [showConversion, setShowConversion] = useState(false);
  const miniFunnelRef = useRef<HTMLDivElement>(null);
  const conversionRef = useRef<HTMLDivElement>(null);

  const playerRef = useRef<any>(null);
  const expectedTimeRef = useRef<number>(0);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const ytApiLoadedRef = useRef(false);
  const { trackPageView, trackEvent } = useAnalytics();

  useEffect(() => {
    trackPageView("/");
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "PageView");
    }
  }, []);

  const milestonesFiredRef = useRef<Set<number>>(new Set());

  const startProgressTracking = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
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
  }, [trackEvent]);

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

  const onPlayerStateChange = useCallback((event: any) => {
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
  }, [startSeekProtection, startProgressTracking]);

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

    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [initPlayer]);

  const handleVideoClick = () => {
    if (!playerRef.current) return;
    expectedTimeRef.current = 0;
    milestonesFiredRef.current.clear();
    playerRef.current.seekTo(0, true);
    playerRef.current.playVideo();
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
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

  const ctaShownTrackedRef = useRef(false);
  useEffect(() => {
    if (ctaUnlocked && !ctaShownTrackedRef.current) {
      ctaShownTrackedRef.current = true;
      trackEvent("cta_shown");
    }
  }, [ctaUnlocked, trackEvent]);

  const handleCtaClick = () => {
    trackEvent("cta_click");
    trackEvent("funnel_start");
    setShowMiniFunnel(true);
    setTimeout(() => {
      miniFunnelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleQuizComplete = (_answers: Record<number, string>) => {
    trackEvent("funnel_qualified");
    setShowConversion(true);
    setShowMiniFunnel(false);
    setTimeout(() => {
      conversionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
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

          {/* CTA Area */}
          <div className="text-center mb-6 sm:mb-8">
            {!ctaUnlocked ? (
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/60 border border-border text-muted-foreground text-sm sm:text-base">
                  <Lock className="h-4 w-4 flex-shrink-0" />
                  {timeToUnlock !== null && timeToUnlock > 0 ? (
                    <span>
                      Quiz freischaltet in{" "}
                      <span className="font-bold text-foreground tabular-nums">
                        {formatTime(timeToUnlock)}
                      </span>
                    </span>
                  ) : (
                    <span>Schau das Video, um das Quiz zu starten</span>
                  )}
                </div>
                <Button
                  size="lg"
                  disabled
                  className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-semibold opacity-40 cursor-not-allowed"
                >
                  Jetzt schauen, ob du geeignet bist
                </Button>
              </div>
            ) : !showMiniFunnel && !showConversion ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm sm:text-base text-primary font-semibold">
                  ✅ Quiz jetzt freigeschaltet!
                </p>
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
            ) : null}
          </div>

          {/* Warning Text */}
          {!showConversion && (
            <div className="text-center space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              <p className="text-sm sm:text-base md:text-lg text-primary font-semibold">
                Achtung: Bitte schau dir zuerst das ganze Video an, bevor du das Quiz startest
              </p>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed underline decoration-primary/50 underline-offset-4">
                Wir möchten nicht mit Menschen sprechen, welche sich ein hohes 4–5 stelliges Einkommen aufbauen wollen, aber nicht bereit sind ein kurzes und wertvolles Videotraining anzusehen
              </p>
            </div>
          )}

          {/* Mini-Funnel Quiz */}
          {showMiniFunnel && (
            <div
              ref={miniFunnelRef}
              className="mt-4 sm:mt-6 bg-card/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg shadow-primary/5"
            >
              <div className="text-center mb-5 sm:mb-6">
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-3">
                  Nur 5 kurze Fragen
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Damit wir sicherstellen können, dass die KI-Klick Methode zu dir passt.
                </p>
              </div>
              <MiniFunnel onComplete={handleQuizComplete} onTrackEvent={trackEvent} />
            </div>
          )}

          {/* Conversion Section */}
          {showConversion && (
            <div
              ref={conversionRef}
              className="mt-4 sm:mt-6"
            >
              {/* Qualified Badge */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-sm font-semibold mb-4">
                  <CheckCircle className="h-4 w-4" />
                  Du bist qualifiziert!
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
                  Super — du passt zur KI-Klick Methode 🎯
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
                  Trag dich jetzt ein und wir melden uns persönlich bei dir, um den nächsten Schritt zu besprechen.
                </p>
              </div>

              {/* CRM Form Placeholder */}
              <div className="bg-card border border-primary/20 rounded-2xl p-6 sm:p-8 shadow-lg shadow-primary/5 mb-8 sm:mb-12 max-w-lg mx-auto">
                <div className="text-center mb-6">
                  <p className="text-base font-semibold text-foreground mb-1">Kostenloses Strategiegespräch sichern</p>
                  <p className="text-sm text-muted-foreground">100% kostenlos & unverbindlich</p>
                </div>

                {/* ⬇️ HIER KOMMT EUER CRM-FORMULAR-CODE ⬇️ */}
                <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center bg-primary/5">
                  <div className="text-3xl mb-3">📋</div>
                  <p className="font-semibold text-foreground mb-1">CRM-Formular Platzhalter</p>
                  <p className="text-sm text-muted-foreground">
                    Fügt hier euren CRM-Formular-Code ein
                  </p>
                </div>
                {/* ⬆️ ENDE CRM-FORMULAR-CODE ⬆️ */}

                <div className="mt-5 flex flex-col gap-2">
                  {[
                    "🔒 Deine Daten sind 100% sicher",
                    "✅ Kein Spam, nur persönlicher Kontakt",
                    "⚡ Wir melden uns innerhalb von 24h",
                  ].map((item, i) => (
                    <p key={i} className="text-xs sm:text-sm text-muted-foreground text-center">
                      {item}
                    </p>
                  ))}
                </div>
              </div>

              {/* Trust Header */}
              <div className="text-center mb-6 sm:mb-8">
                <span className="highlight text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
                  Was andere über die KI-Klick Methode sagen
                </span>
                <p className="text-sm text-muted-foreground mt-2">
                  Echte Ergebnisse von echten Menschen — ohne Ausnahme
                </p>
              </div>

              {/* Text Reviews */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-8 sm:mb-12">
                {TEXT_REVIEWS.map((review, i) => (
                  <div
                    key={i}
                    className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{review.name}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: review.stars }).map((_, si) => (
                          <Star key={si} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>

              {/* WhatsApp / Screenshot Testimonials */}
              <div className="text-center mb-5 sm:mb-7">
                <span className="highlight text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-relaxed">
                  Das sagen unsere Teilnehmer
                </span>
              </div>
              <div className="columns-2 sm:columns-3 gap-3 sm:gap-4 space-y-3 sm:space-y-4 mb-8 sm:mb-12">
                {TESTIMONIAL_IMAGES.map((src, index) => (
                  <div key={index} className="break-inside-avoid">
                    <img
                      src={src}
                      alt={`Testimonial ${index + 1}`}
                      className="w-full h-auto rounded-lg sm:rounded-xl shadow-lg"
                    />
                  </div>
                ))}
              </div>

              {/* Repeat CTA */}
              <div className="text-center bg-card border border-primary/20 rounded-2xl p-6 sm:p-8 shadow-lg shadow-primary/5 max-w-lg mx-auto mb-8">
                <p className="font-bold text-foreground text-base sm:text-lg mb-2">
                  Bereit für deinen ersten Schritt? 🚀
                </p>
                <p className="text-sm text-muted-foreground mb-5">
                  Trag dich oben ein und wir melden uns persönlich bei dir.
                </p>
                <Button
                  size="lg"
                  onClick={() => {
                    conversionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-bold"
                >
                  Jetzt Platz sichern
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Das System Section — only show before conversion */}
      {!showConversion && (
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
                  alt="Florian Mehler"
                  className="w-56 sm:w-64 rounded-xl"
                />
                <div className="text-center">
                  <p className="font-bold text-foreground">Florian Mehler</p>
                  <p className="text-sm text-muted-foreground">Gründer der KI-Klick Methode</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* WhatsApp Testimonials — only show before conversion */}
      {!showConversion && (
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
      )}

      {/* Payout Screens — only show before conversion */}
      {!showConversion && (
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
      )}

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
