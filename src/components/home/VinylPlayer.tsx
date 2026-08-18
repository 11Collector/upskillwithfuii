"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Play, Pause } from "lucide-react";

interface VinylPlayerProps {
  hide?: boolean;
}

export default function VinylPlayer({ hide = false }: VinylPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [showMusicToast, setShowMusicToast] = useState(false);

  const toggleMusic = async () => {
    if (!audioRef.current) return;
    try {
      if (isPlayingMusic) {
        audioRef.current.pause();
        setIsPlayingMusic(false);
        setShowMusicToast(false);
      } else {
        await audioRef.current.play();
        setIsPlayingMusic(true);
        setShowMusicToast(true);
        setTimeout(() => {
          setShowMusicToast(false);
        }, 3000);
      }
    } catch (err) {
      console.error("Audio playback error:", err);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <>
      {/* 💿 Theme Song Audio Element (BEGINS - FU11) */}
      <audio ref={audioRef} src="/sounds/begins.mp3" loop preload="metadata" />

      {!hide && (
        <div className="fixed bottom-24 right-4 sm:bottom-24 sm:right-6 md:bottom-6 md:right-6 z-[200] flex flex-col items-end gap-2 pointer-events-auto">
          {/* 3-Second Auto-Fade Toast */}
          <AnimatePresence>
            {showMusicToast && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 8 }}
                transition={{ duration: 0.3 }}
                className="px-3.5 py-1.5 rounded-full bg-slate-950/95 border border-red-500/30 backdrop-blur-xl shadow-[0_4px_15px_rgba(139,30,45,0.4)] text-[10.5px] font-black tracking-wide flex items-center gap-2 whitespace-nowrap"
              >
                <Music size={12} className="text-rose-400 animate-pulse shrink-0" />
                <span className="bg-gradient-to-r from-red-200 via-rose-100 to-amber-100 bg-clip-text text-transparent">
                  BEGINS - FU11
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMusic}
            title="BEGINS - FU11"
            className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-[#2a050a] via-[#4d0c17] to-[#1f0307] border border-red-500/30 shadow-[0_4px_20px_rgba(139,30,45,0.4)] cursor-pointer flex items-center justify-center overflow-hidden group hover:border-red-400/50 transition-all"
          >
            {/* Subtle Gloss Sheen Reflection */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.25),transparent_65%)] pointer-events-none z-10" />

            {/* Maroon Glossy Vinyl Grooves */}
            <div
              className={`absolute inset-0 flex items-center justify-center ${
                isPlayingMusic ? "animate-spin" : ""
              }`}
              style={{ animationDuration: "6s" }}
            >
              <div className="absolute inset-[3px] rounded-full border border-red-200/15 pointer-events-none" />
              <div className="absolute inset-[7px] rounded-full border border-red-200/10 pointer-events-none" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#8b1e2d] border border-red-300/40 flex items-center justify-center shadow-inner">
                <div className="w-1 h-1 rounded-full bg-[#1f0307]" />
              </div>
            </div>

            {/* Play / Pause Icon */}
            <div className="relative z-20 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {isPlayingMusic ? (
                <Pause size={13} fill="white" className="text-white" />
              ) : (
                <Play size={13} fill="white" className="text-white ml-0.5" />
              )}
            </div>
          </motion.button>
        </div>
      )}
    </>
  );
}
