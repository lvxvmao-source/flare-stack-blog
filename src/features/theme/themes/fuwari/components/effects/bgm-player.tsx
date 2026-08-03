import { useEffect, useRef, useState } from "react";
import { Music, Pause, Play, SkipBack, SkipForward, Volume2, ChevronUp } from "lucide-react";

interface BgmTrack {
  title: string;
  url: string;
}

interface BgmPlayerProps {
  enabled?: boolean;
  playlist?: BgmTrack[];
  defaultVolume?: number;
}

export function BgmPlayer({
  enabled = false,
  playlist = [],
  defaultVolume = 30,
}: BgmPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume, setVolume] = useState(defaultVolume / 100);
  const [collapsed, setCollapsed] = useState(true);
  const [currentTitle, setCurrentTitle] = useState("");

  const hasTracks = playlist.length > 0;

  // Init audio element on client
  useEffect(() => {
    if (!enabled || !hasTracks) return;

    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [enabled, hasTracks]);

  // Play current track
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !hasTracks) return;

    const track = playlist[currentIndex];
    if (!track?.url) return;

    audio.src = track.url;
    setCurrentTitle(track.title);

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }

    const onEnd = () => {
      setCurrentIndex((prev) => (prev + 1) % playlist.length);
    };
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.removeEventListener("ended", onEnd);
    };
  }, [currentIndex, hasTracks]);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!audio.src && hasTracks) {
        const track = playlist[0];
        audio.src = track.url;
        setCurrentTitle(track.title);
      }
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const prev = () => {
    setCurrentIndex((i) => (i === 0 ? playlist.length - 1 : i - 1));
  };

  const next = () => {
    setCurrentIndex((i) => (i + 1) % playlist.length);
  };

  if (!enabled || !hasTracks) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full transition-all duration-300 ease-out-quart
        ${collapsed ? "w-12 h-12 p-0 justify-center" : "shadow-lg"}
        bg-(--anime-glass-bg) backdrop-blur-md border border-(--anime-glass-border)`}
      style={{ borderRadius: "9999px" }}
    >
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="w-10 h-10 flex items-center justify-center rounded-full text-(--anime-sakura) hover:bg-(--anime-sakura-pale) transition-colors"
          aria-label="Open BGM player"
        >
          <Music size={20} />
        </button>
      ) : (
        <>
          {/* Collapse */}
          <button
            onClick={() => setCollapsed(true)}
            className="text-(--fuwari-text-50) hover:text-(--fuwari-text-75) transition-colors"
            aria-label="Collapse player"
          >
            <ChevronUp size={16} />
          </button>

          {/* Prev */}
          <button
            onClick={prev}
            className="text-(--fuwari-text-50) hover:text-(--anime-sakura) transition-colors"
            aria-label="Previous track"
          >
            <SkipBack size={16} />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-(--anime-sakura) text-white hover:bg-(--anime-sakura-deep) transition-colors shadow-md"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>

          {/* Next */}
          <button
            onClick={next}
            className="text-(--fuwari-text-50) hover:text-(--anime-sakura) transition-colors"
            aria-label="Next track"
          >
            <SkipForward size={16} />
          </button>

          {/* Track title */}
          <span className="text-xs text-(--fuwari-text-75) max-w-[120px] truncate font-medium">
            {currentTitle || "No track"}
          </span>

          {/* Volume */}
          <div className="flex items-center gap-1">
            <Volume2 size={14} className="text-(--fuwari-text-50)" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-16 h-1 accent-(--anime-sakura) cursor-pointer"
              aria-label="Volume"
            />
          </div>
        </>
      )}
    </div>
  );
}
