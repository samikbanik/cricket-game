import { useEffect, useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useGameLoop } from "@/hooks/useGameLoop";
import PitchView from "@/components/cricket/PitchView";
import type { Handedness } from "@/components/cricket/PitchView";
import ShotSelector from "@/components/cricket/ShotSelector";
import TimingBar from "@/components/cricket/TimingBar";
import PowerMeter from "@/components/cricket/PowerMeter";
import FieldRadar from "@/components/cricket/FieldRadar";
import MatchStatsPanel from "@/components/cricket/MatchStatsPanel";
import GameOverScreen from "@/components/cricket/GameOverScreen";
import { defaultFielderPositions } from "@/lib/gameData";
import { ChevronRight, Gamepad2, Volume2, VolumeX } from "lucide-react";
import {
  playBowlWhoosh,
  playTimingLock,
  playPowerLock,
  playOutcomeSound,
  playUIClick,
  playGameOverFanfare,
  playBowlerFootsteps,
  isMuted,
  setMuted,
} from "@/lib/soundEngine";

const PITCH_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663318787554/D8XJLADP7qtfVyMbk3Yvk2/cricket-pitch-abstract-GLRSwJfTGvDsS2GUfi5Y93.webp";

/* ─── Right-Handed Batsman SVG (for selection screen) ─────────── */
function RightHandedBatsmanSVG({ selected }: { selected: boolean }) {
  return (
    <svg width="64" height="80" viewBox="0 0 48 56" fill="none" overflow="visible">
      <ellipse cx="24" cy="54" rx="12" ry="2" fill="rgba(0,0,0,0.2)" />
      <circle cx="22" cy="7" r="5.5" fill={selected ? "rgba(52,211,153,0.7)" : "rgba(255,255,255,0.55)"} />
      <path d="M17 5 Q22 2 27 5" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
      <rect x="17" y="7" width="10" height="2.5" rx="1" fill="rgba(100,150,220,0.4)" />
      <line x1="22" y1="12" x2="22" y2="30" stroke={selected ? "rgba(52,211,153,0.7)" : "rgba(255,255,255,0.55)"} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="22" y1="30" x2="18" y2="46" stroke={selected ? "rgba(52,211,153,0.65)" : "rgba(255,255,255,0.5)"} strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="18" cy="47" rx="3.5" ry="1.5" fill="rgba(255,255,255,0.35)" />
      <line x1="22" y1="30" x2="27" y2="46" stroke={selected ? "rgba(52,211,153,0.55)" : "rgba(255,255,255,0.45)"} strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="27" cy="47" rx="3.5" ry="1.5" fill="rgba(255,255,255,0.3)" />
      <line x1="22" y1="17" x2="16" y2="24" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="24" x2="14" y2="28" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="17" x2="18" y2="22" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="22" x2="14" y2="27" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="26" x2="13" y2="30" stroke="rgba(200,170,120,0.7)" strokeWidth="2" strokeLinecap="round" />
      <line x1="13" y1="30" x2="8" y2="18" stroke={selected ? "rgba(52,211,153,0.9)" : "rgba(220,190,130,0.8)"} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="14" cy="27" r="1.8" fill="rgba(255,255,255,0.4)" />
      <circle cx="14" cy="29" r="1.8" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}

/* ─── Left-Handed Batsman SVG (for selection screen) ──────────── */
function LeftHandedBatsmanSVG({ selected }: { selected: boolean }) {
  return (
    <svg width="64" height="80" viewBox="0 0 48 56" fill="none" overflow="visible">
      <ellipse cx="24" cy="54" rx="12" ry="2" fill="rgba(0,0,0,0.2)" />
      <circle cx="24" cy="7" r="5.5" fill={selected ? "rgba(52,211,153,0.7)" : "rgba(255,255,255,0.55)"} />
      <path d="M19 5 Q24 2 29 5" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
      <rect x="19" y="7" width="10" height="2.5" rx="1" fill="rgba(100,150,220,0.4)" />
      <line x1="24" y1="12" x2="24" y2="30" stroke={selected ? "rgba(52,211,153,0.7)" : "rgba(255,255,255,0.55)"} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="30" x2="28" y2="46" stroke={selected ? "rgba(52,211,153,0.65)" : "rgba(255,255,255,0.5)"} strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="28" cy="47" rx="3.5" ry="1.5" fill="rgba(255,255,255,0.35)" />
      <line x1="24" y1="30" x2="19" y2="46" stroke={selected ? "rgba(52,211,153,0.55)" : "rgba(255,255,255,0.45)"} strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="19" cy="47" rx="3.5" ry="1.5" fill="rgba(255,255,255,0.3)" />
      <line x1="24" y1="17" x2="30" y2="24" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="24" x2="32" y2="28" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="17" x2="28" y2="22" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="22" x2="32" y2="27" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="26" x2="33" y2="30" stroke="rgba(200,170,120,0.7)" strokeWidth="2" strokeLinecap="round" />
      <line x1="33" y1="30" x2="38" y2="18" stroke={selected ? "rgba(52,211,153,0.9)" : "rgba(220,190,130,0.8)"} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="32" cy="27" r="1.8" fill="rgba(255,255,255,0.4)" />
      <circle cx="32" cy="29" r="1.8" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}

export default function PlayGame() {
  const [, navigate] = useLocation();
  const game = useGameLoop(30, 5);
  const prevPhaseRef = useRef(game.phase);
  const [muted, setMutedState] = useState(isMuted());
  const [handedness, setHandedness] = useState<Handedness>("right");
  const [showHandSelection, setShowHandSelection] = useState(false);

  // Track phase transitions to trigger sounds
  useEffect(() => {
    const prev = prevPhaseRef.current;
    const curr = game.phase;
    prevPhaseRef.current = curr;

    if (prev === curr) return;

    if (curr === "runup") {
      playBowlerFootsteps();
    } else if (curr === "bowling") {
      playBowlWhoosh();
    } else if (curr === "result" || curr === "over") {
      if (game.lastOutcome) {
        const runs = game.lastOutcome.runs;
        const isWicket = game.lastOutcome.isWicket;
        if (isWicket) {
          playOutcomeSound("wicket");
        } else if (runs === 6) {
          playOutcomeSound("6");
        } else if (runs === 4) {
          playOutcomeSound("4");
        } else if (runs === 0) {
          playOutcomeSound("dot");
        } else {
          playOutcomeSound(String(runs));
        }
      }
      if (curr === "over") {
        setTimeout(() => playGameOverFanfare(), 600);
      }
    }
  }, [game.phase, game.lastOutcome]);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted();
    setMuted(newMuted);
    setMutedState(newMuted);
    localStorage.setItem("cricket-muted", String(newMuted));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("cricket-muted");
    if (saved === "true") {
      setMuted(true);
      setMutedState(true);
    }
  }, []);

  // Keyboard handler for space bar
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (game.phase === "timing") {
          playTimingLock();
          game.lockTiming();
        } else if (game.phase === "power") {
          playPowerLock();
          game.lockPower();
        } else if (game.phase === "result") {
          playUIClick();
          game.nextBall();
        }
      }
    },
    [game.phase, game.lockTiming, game.lockPower, game.nextBall]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleGameAreaClick = () => {
    if (game.phase === "timing") {
      playTimingLock();
      game.lockTiming();
    } else if (game.phase === "power") {
      playPowerLock();
      game.lockPower();
    } else if (game.phase === "result") {
      playUIClick();
      game.nextBall();
    }
  };

  const handleSelectShot = (shot: Parameters<typeof game.selectShot>[0]) => {
    playUIClick();
    game.selectShot(shot);
  };

  // Show hand selection screen instead of starting immediately
  const handleStartInnings = () => {
    playUIClick();
    setShowHandSelection(true);
  };

  // Confirm hand selection and start the game
  const handleConfirmHand = () => {
    playUIClick();
    setShowHandSelection(false);
    game.startGame();
  };

  return (
    <div className="min-h-screen bg-[#0d1117] relative">
      {/* Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <img src={PITCH_BG} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Game Over overlay */}
      <AnimatePresence>
        {game.phase === "over" && (
          <GameOverScreen
            state={game.matchState}
            onRestart={() => {
              setShowHandSelection(true);
            }}
            onBack={() => navigate("/")}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#0d1117]/80 backdrop-blur-sm">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Home
          </button>
          <h1
            className="text-lg font-bold text-white flex items-center gap-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <Gamepad2 className="w-5 h-5 text-emerald-400" />
            Cricket Mini-Game
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] transition-all text-gray-400 hover:text-white"
              title={muted ? "Unmute sounds" : "Mute sounds"}
            >
              {muted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </header>

        {/* Idle / Start screen */}
        {game.phase === "idle" && !showHandSelection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center max-w-lg mx-auto px-6">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="text-6xl mb-6">🏏</div>
                <h2
                  className="text-4xl font-bold text-white mb-4"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Ready to Bat?
                </h2>
                <p className="text-gray-400 mb-2 text-base leading-relaxed">
                  Score as many runs as you can in <strong className="text-white">5 overs</strong> (30 balls)
                  with <strong className="text-white">5 wickets</strong> in hand.
                </p>
                <div className="text-sm text-gray-500 mb-8 space-y-1">
                  <p><strong className="text-emerald-400">Step 1:</strong> Choose your shot type</p>
                  <p><strong className="text-amber-400">Step 2:</strong> Time your swing (hit the green zone)</p>
                  <p><strong className="text-teal-400">Step 3:</strong> Set your power level (aim for the amber-to-red zone for maximum distance)</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartInnings}
                  className="px-10 py-4 rounded-xl bg-emerald-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-colors"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Start Innings
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Hand Selection Screen */}
        <AnimatePresence>
          {showHandSelection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: -20 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="text-center max-w-lg mx-auto px-6"
              >
                <h2
                  className="text-3xl font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Choose Your Batting Hand
                </h2>
                <p className="text-gray-400 mb-8 text-sm">
                  This determines your stance and shot direction at the crease.
                </p>

                <div className="flex justify-center gap-6 mb-10">
                  {/* Right-Handed Option */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { playUIClick(); setHandedness("right"); }}
                    className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all w-[160px] ${
                      handedness === "right"
                        ? "border-emerald-400/70 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    {handedness === "right" && (
                      <motion.div
                        layoutId="hand-check"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </motion.div>
                    )}
                    <div className="h-[80px] flex items-center justify-center">
                      <RightHandedBatsmanSVG selected={handedness === "right"} />
                    </div>
                    <span
                      className={`text-sm font-semibold uppercase tracking-wider ${
                        handedness === "right" ? "text-emerald-400" : "text-gray-400"
                      }`}
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      Right-Handed
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Bat on left side
                    </span>
                  </motion.button>

                  {/* Left-Handed Option */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { playUIClick(); setHandedness("left"); }}
                    className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all w-[160px] ${
                      handedness === "left"
                        ? "border-emerald-400/70 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    {handedness === "left" && (
                      <motion.div
                        layoutId="hand-check"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </motion.div>
                    )}
                    <div className="h-[80px] flex items-center justify-center">
                      <LeftHandedBatsmanSVG selected={handedness === "left"} />
                    </div>
                    <span
                      className={`text-sm font-semibold uppercase tracking-wider ${
                        handedness === "left" ? "text-emerald-400" : "text-gray-400"
                      }`}
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      Left-Handed
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Bat on right side
                    </span>
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirmHand}
                  className="px-10 py-4 rounded-xl bg-emerald-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-colors"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Let's Play!
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active game */}
        {game.phase !== "idle" && game.phase !== "over" && (
          <div className="flex-1 p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 lg:gap-6 max-w-[1400px] mx-auto h-full">
              {/* Left: Game area */}
              <div className="flex flex-col gap-4">
                {/* Pitch view */}
                <div onClick={handleGameAreaClick} className="cursor-pointer">
                  <PitchView
                    phase={game.phase}
                    delivery={game.currentDelivery}
                    outcome={game.lastOutcome}
                    selectedShot={game.selectedShot}
                    handedness={handedness}
                    ballCount={game.matchState.ballsBowled}
                  />
                </div>

                {/* Commentary */}
                <AnimatePresence mode="wait">
                  {game.lastOutcome && (game.phase === "result") && (
                    <motion.div
                      key={game.matchState.ballsBowled}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-lg px-5 py-3 border border-white/[0.06]"
                      style={{ background: "rgba(42, 45, 62, 0.85)" }}
                    >
                      <p className="text-sm text-gray-300 italic leading-relaxed">
                        "{game.lastOutcome.commentary}"
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Controls area */}
                <div
                  className="rounded-xl p-5 border border-white/[0.08]"
                  style={{ background: "rgba(34, 37, 52, 0.95)" }}
                >
                  {/* Shot selection phase */}
                  {game.phase === "selecting" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3"
                    >
                      <div className="text-center">
                        <span
                          className="text-xs font-semibold text-emerald-400 uppercase tracking-widest"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          Choose Your Shot
                        </span>
                      </div>
                      <ShotSelector
                        selectedShot={game.selectedShot}
                        onSelect={handleSelectShot}
                      />
                    </motion.div>
                  )}

                  {/* Run-up phase */}
                  {game.phase === "runup" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-4"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <motion.div
                          className="flex gap-1"
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 0.4, repeat: Infinity }}
                        >
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 rounded-full bg-blue-400"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            />
                          ))}
                        </motion.div>
                        <span className="text-sm font-semibold text-blue-300 uppercase tracking-wider">
                          Bowler running in...
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Bowling phase */}
                  {game.phase === "bowling" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-4"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                          Ball incoming...
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Timing phase */}
                  {game.phase === "timing" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                      onClick={(e) => { e.stopPropagation(); handleGameAreaClick(); }}
                    >
                      <div className="text-center">
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                          Time Your Shot!
                        </span>
                      </div>
                      <div className="flex justify-center">
                        <TimingBar position={game.timingPosition} />
                      </div>
                      <div className="text-center text-xs text-gray-500">
                        Click anywhere or press SPACE to lock timing
                      </div>
                    </motion.div>
                  )}

                  {/* Power phase */}
                  {game.phase === "power" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3"
                      onClick={(e) => { e.stopPropagation(); handleGameAreaClick(); }}
                    >
                      <div className="text-center">
                        <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
                          Set Your Power!
                        </span>
                      </div>
                      <div className="flex justify-center items-center gap-6">
                        <FieldRadar positions={defaultFielderPositions} size={120} />
                        <PowerMeter level={game.powerLevel} size={140} />
                      </div>
                      <div className="text-center text-xs text-gray-500">
                        Click anywhere or press SPACE to lock power
                      </div>
                    </motion.div>
                  )}

                  {/* Result phase */}
                  {game.phase === "result" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-center items-center gap-6">
                        <div className="flex flex-col items-center gap-1">
                          <FieldRadar
                            positions={defaultFielderPositions}
                            size={140}
                            trajectory={game.lastOutcome?.trajectory ?? null}
                            showTrajectory={true}
                          />
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                            Shot Direction
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => { playUIClick(); game.nextBall(); }}
                            className="px-8 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-sm hover:bg-emerald-500/30 transition-colors"
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            Next Ball →
                          </motion.button>
                          <div className="text-xs text-gray-500">
                            or press SPACE
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Right: Stats panel */}
              <div className="lg:sticky lg:top-4">
                <MatchStatsPanel state={game.matchState} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
