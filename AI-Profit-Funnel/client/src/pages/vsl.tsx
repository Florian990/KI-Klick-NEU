import { CheckCircle, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
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

  return (
    <div className="min-h-screen bg-background">
      {/* VSL Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-primary font-medium mb-3">Exklusives Video-Training</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Die KI-Klick Methode
            </h1>
            <p className="text-lg text-muted-foreground">
              Schaue dir jetzt das Video an und erfahre, wie DU dir ein zweites Standbein aufbauen kannst.
            </p>
          </div>

          {/* Video Player */}
          <div className="relative aspect-video bg-card rounded-xl border border-border overflow-hidden mb-8">
            {!showVideo ? (
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                onClick={startVideo}
                data-testid="button-play-video"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="text-center relative z-10">
                  <div className="h-20 w-20 mx-auto rounded-full bg-primary flex items-center justify-center transition-transform group-hover:scale-110 mb-4">
                    <Play className="h-8 w-8 text-primary-foreground ml-1" />
                  </div>
                  <p className="text-white font-medium">Video starten</p>
                </div>
              </div>
            ) : (
              <>
                <div id="youtube-player" className="absolute inset-0 w-full h-full" />
                
                {/* Custom Controls Overlay */}
                {playerReady && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-4">
                      {/* Play/Pause Button */}
                      <button
                        onClick={togglePlay}
                        className="h-10 w-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5 text-primary-foreground" />
                        ) : (
                          <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                        )}
                      </button>

                      {/* Volume Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleMute}
                          className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="h-4 w-4 text-white" />
                          ) : (
                            <Volume2 className="h-4 w-4 text-white" />
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Key Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              "Schritt-für-Schritt erklärt",
              "Sofort umsetzbar",
              "Kein Vorwissen nötig",
            ].map((point, index) => (
              <div key={index} className="flex items-center gap-2 text-foreground">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          {/* Calendly Section */}
          <div className="mt-12">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Buche jetzt dein kostenloses Erstgespräch
              </h2>
              <p className="text-muted-foreground">
                Wähle einen passenden Termin für dein persönliches Beratungsgespräch
              </p>
            </div>

            {/* Calendly Container */}
            <div className="relative rounded-xl overflow-hidden border border-border">
              <iframe
                src="https://calendly.com/florianbenedict/kostenloses-potenzialgesprach"
                className="w-full h-[700px]"
                title="Calendly Terminbuchung"
              />
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Testimonials Section */}
      <section className="py-16 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-10">
            Das sagen unsere Teilnehmer
          </h2>
          
          {/* WhatsApp Screenshots */}
          <div className="columns-2 sm:columns-3 gap-4 space-y-4">
            {[
              "/assets/testimonial2.png",
              "/assets/testimonial3.png",
              "/assets/testimonial5.jpeg",
            ].map((src, index) => (
              <div key={index} className="break-inside-avoid">
                <img 
                  src={src} 
                  alt={`WhatsApp Testimonial ${index + 1}`}
                  className="w-full h-auto rounded-xl shadow-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payout Screens Section */}
      <section className="py-16 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-10">
            Stell dir vor, dein Handybildschirm sieht bald so aus
          </h2>
          
          {/* Payout Screenshots */}
          <div className="columns-2 sm:columns-3 gap-4 space-y-4">
            {[
              "/assets/testimonial1.jpeg",
              "/assets/testimonial6.jpeg",
              "/assets/testimonial7.jpeg",
            ].map((src, index) => (
              <div key={index} className="break-inside-avoid">
                <img 
                  src={src} 
                  alt={`Auszahlung ${index + 1}`}
                  className="w-full h-auto rounded-xl shadow-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6">
            <p className="text-xs text-primary font-medium">© 2026 KI-Klick Methode</p>
            <p className="text-xs text-primary">Alle Rechte vorbehalten.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
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
