import { CheckCircle, Play, Pause, Volume2, VolumeX, Calendar } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    Calendly: any;
  }
}

export default function VSLPage() {
  const [showVideo, setShowVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);
  const expectedTimeRef = useRef<number>(0);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!showVideo) return;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: 'ZYc4uDJxE2A',
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
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [showVideo]);

  const onPlayerReady = (event: any) => {
    setPlayerReady(true);
    event.target.playVideo();
    setIsPlaying(true);
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      startSeekProtection();
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    } else if (event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
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
        
        if (currentTime > expectedTimeRef.current + 2) {
          playerRef.current.seekTo(expectedTimeRef.current, true);
        } else {
          expectedTimeRef.current = currentTime;
        }
      }
    }, 500);
  }, []);

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
  };

  const openCalendlyPopup = () => {
    if (window.Calendly) {
      window.Calendly.initPopupWidget({
        url: 'https://calendly.com/florianbenedict/kostenloses-potenzialgesprach'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* VSL Section */}
      <section className="py-6 sm:py-10 md:py-16 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <p className="text-primary font-medium mb-2 sm:mb-3 text-sm sm:text-base">Exklusives Video-Training</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-2">
              Die KI-Klick Methode
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-2">
              Schaue dir jetzt das Video an und erfahre, wie DU dir ein zweites Standbein aufbauen kannst.
            </p>
          </div>

          {/* Video Player */}
          <div className="relative aspect-video bg-card rounded-lg sm:rounded-xl border border-border overflow-hidden mb-4 sm:mb-6">
            {!showVideo ? (
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                onClick={startVideo}
                data-testid="button-play-video"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="text-center relative z-10">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 mx-auto rounded-full bg-primary flex items-center justify-center transition-transform group-hover:scale-110 mb-3 sm:mb-4">
                    <Play className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary-foreground ml-1" />
                  </div>
                  <p className="text-white font-medium text-sm sm:text-base">Video starten</p>
                </div>
              </div>
            ) : (
              <>
                <div id="youtube-player" className="absolute inset-0 w-full h-full" />
                
                {/* Custom Controls Overlay */}
                {playerReady && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-3 md:p-4">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                      {/* Play/Pause Button */}
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

                      {/* Volume Controls */}
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

          {/* Key Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
            {[
              "Schritt-für-Schritt erklärt",
              "Sofort umsetzbar",
              "Kein Vorwissen nötig",
            ].map((point, index) => (
              <div key={index} className="flex items-center gap-2 text-foreground text-sm sm:text-base">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={openCalendlyPopup}
              className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-semibold touch-manipulation active:scale-[0.98] transition-transform"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Kostenloses Potenzialgespräch
            </Button>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3">
              Unverbindlich und 100% kostenlos
            </p>
          </div>
        </div>
      </section>

      {/* WhatsApp Testimonials Section */}
      <section className="py-10 sm:py-12 md:py-16 px-3 sm:px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-foreground mb-6 sm:mb-8 md:mb-10">
            Das sagen unsere Teilnehmer
          </h2>
          
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

      {/* Payout Screens Section */}
      <section className="py-10 sm:py-12 md:py-16 px-3 sm:px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-foreground mb-6 sm:mb-8 md:mb-10">
            Stell dir vor, dein Handybildschirm sieht bald so aus
          </h2>
          
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

      {/* Floating CTA for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-background/95 backdrop-blur-sm border-t border-border sm:hidden z-50">
        <Button
          size="lg"
          onClick={openCalendlyPopup}
          className="w-full h-12 text-base font-semibold touch-manipulation active:scale-[0.98] transition-transform"
        >
          <Calendar className="mr-2 h-5 w-5" />
          Kostenloses Potenzialgespräch
        </Button>
      </div>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-3 sm:px-4 border-t border-border pb-20 sm:pb-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-4 sm:mb-6">
            <p className="text-[10px] sm:text-xs text-primary font-medium">© 2026 KI-Klick Methode</p>
            <p className="text-[10px] sm:text-xs text-primary">Alle Rechte vorbehalten.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Impressum</a>
            <span>|</span>
            <a href="#" className="hover:text-foreground transition-colors">Datenschutzerklärung</a>
            <span>|</span>
            <a href="#" className="hover:text-foreground transition-colors">AGB</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
