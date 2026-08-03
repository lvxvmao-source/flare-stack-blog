import { useCallback, useEffect, useRef, useState } from "react";
import { Music, Pause, Play, SkipBack, SkipForward, Volume2, ChevronUp, Film } from "lucide-react";

interface BgmTrack {
  title: string;
  url: string;
}

interface BgmPlayerProps {
  enabled?: boolean;
  playlist?: BgmTrack[];
  defaultVolume?: number;
}

/** Parse BV id from a Bilibili URL. Supports bilibili.com/video/BVxxx and b23.tv short links. */
function parseBvid(url: string): string | null {
  // Match standard bilibili.com/video/BVxxx links
  const bvMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
  if (bvMatch) return bvMatch[1];

  // Also match b23.tv short links (the BV id is embedded in query params after redirect,
  // but we can also try matching BV pattern anywhere in the URL)
  const bvFallback = url.match(/BV([a-zA-Z0-9]+)/);
  if (bvFallback) return `BV${bvFallback[1]}`;

  return null;
}

function isBilibiliUrl(url: string): boolean {
  return parseBvid(url) !== null;
}

function getBilibiliEmbedUrl(url: string): string {
  const bvid = parseBvid(url);
  if (!bvid) return "";
  return `//player.bilibili.com/player.html?bvid=${bvid}&page=1&autoplay=1&danmaku=0`;
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
  const currentTrack = playlist[currentIndex];
  const isBilibili = currentTrack?.url ? isBilibiliUrl(currentTrack.url) : false;

  // Init audio element on client (only for non-bilibili tracks)
  useEffect(() => {
    if (!enabled || !hasTracks) return;

    if (!isBilibili) {
      const audio = new Audio();
      audio.volume = volume;
      audioRef.current = audio;

      return () => {
        audio.pause();
        audio.src = "";
      };
    } else {
      // Cleanup audio when switching to bilibili
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    }
  }, [enabled, hasTracks]);

  // Play current track
  useEffect(() => {
    const track = currentTrack;
    if (!track?.url) return;

    setCurrentTitle(track.title);

    if (isBilibili) {
      // Bilibili: just mark as playing, iframe handles itself
      if (isPlaying) {
        // Auto-play is handled by the iframe's autoplay=1 param
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio || !hasTracks) return;

    audio.src = track.url;

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

  const togglePlay = useCallback(() => {
    if (isBilibili) {
      setIsPlaying((prev) => !prev);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!audio.src && hasTracks) {
        const track = playlist[currentIndex];
        if (track?.url) {
          audio.src = track.url;
          setCurrentTitle(track.title);
        }
      }
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying, isBilibili, hasTracks, playlist, currentIndex]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i === 0 ? playlist.length - 1 : i - 1));
    setIsPlaying(true);
  }, [playlist.length]);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % playlist.length);
    setIsPlaying(true);
  }, [playlist.length]);

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

          {/* Track title + indicator */}
          <span className="text-xs text-(--fuwari-text-75) max-w-[120px] truncate font-medium flex items-center gap-1">
            {isBilibili && <Film size={12} className="shrink-0" />}
            {currentTitle || "No track"}
          </span>

          {/* Volume (only for audio tracks) */}
          {!isBilibili && (
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
          )}

          {/* Bilibili iframe (hidden, audio-only via bilibili player) */}
          {isBilibili && isPlaying && currentTrack?.url && (
            <div style={{ width: 0, height: 0, overflow: "hidden", position: "absolute" }}>
              <iframe
                title={currentTrack.title || "Bilibili player"}
                src={getBilibiliEmbedUrl(currentTrack.url)}
                width="1"
                height="1"
                allow="autoplay"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
