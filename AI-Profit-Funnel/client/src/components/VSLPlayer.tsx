import { useState } from "react";
import ReactPlayer from "react-player";
import { Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VSLPlayerProps {
  videoUrl?: string;
  isUnlocked: boolean;
}

export default function VSLPlayer({ 
  videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // todo: remove mock functionality - replace with actual VSL
  isUnlocked 
}: VSLPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  if (!isUnlocked) {
    return null;
  }

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Jetzt ansehen: Dein Weg zum KI-Vertriebserfolg
          </h2>
          <p className="text-muted-foreground text-lg">
            Erfahre in diesem exklusiven Video, wie du mit KI-Produkten hohe Provisionen generierst.
          </p>
        </div>

        <div className="relative aspect-video bg-card rounded-xl overflow-hidden border border-card-border">
          {!isPlaying ? (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 cursor-pointer"
              onClick={() => setIsPlaying(true)}
              data-testid="button-play-video"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center transition-transform hover:scale-105">
                  <Play className="h-8 w-8 text-primary-foreground ml-1" />
                </div>
                <span className="text-lg font-medium">Klicke zum Abspielen</span>
              </div>
            </div>
          ) : (
            <>
              <ReactPlayer
                url={videoUrl}
                playing={isPlaying}
                muted={isMuted}
                width="100%"
                height="100%"
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-4 right-4"
                onClick={() => setIsMuted(!isMuted)}
                data-testid="button-mute-toggle"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
