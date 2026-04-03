import { useState, useCallback, useRef, useEffect } from "react";
import type { ShotType } from "@/components/cricket/ShotSelector";
import {
  type GamePhase,
  type Delivery,
  type BallOutcome,
  type MatchState,
  getRandomDelivery,
  calculateOutcome,
  createInitialMatchState,
  applyOutcome,
  isMatchOver,
} from "@/lib/gameEngine";

interface GameLoopState {
  phase: GamePhase;
  matchState: MatchState;
  selectedShot: ShotType | null;
  currentDelivery: Delivery | null;
  timingPosition: number;
  powerLevel: number;
  timingSpeed: number;
  lastOutcome: BallOutcome | null;
  isTimingActive: boolean;
  isPowerActive: boolean;
}

export function useGameLoop(totalBalls: number = 30, totalWickets: number = 5) {
  const [state, setState] = useState<GameLoopState>({
    phase: "idle",
    matchState: createInitialMatchState(totalBalls, totalWickets),
    selectedShot: null,
    currentDelivery: null,
    timingPosition: 0,
    powerLevel: 0,
    timingSpeed: 2,
    lastOutcome: null,
    isTimingActive: false,
    isPowerActive: false,
  });

  const timingRef = useRef<number | null>(null);
  const timingDirRef = useRef(1);
  const powerRef = useRef<number | null>(null);
  const powerDirRef = useRef(1);

  // Timing bar sweep
  useEffect(() => {
    if (state.isTimingActive) {
      timingDirRef.current = 1;
      const interval = setInterval(() => {
        setState((prev) => {
          let next = prev.timingPosition + timingDirRef.current * prev.timingSpeed;
          if (next >= 100) { timingDirRef.current = -1; next = 100; }
          if (next <= 0) { timingDirRef.current = 1; next = 0; }
          return { ...prev, timingPosition: next };
        });
      }, 16);
      timingRef.current = interval as unknown as number;
      return () => clearInterval(interval);
    } else {
      if (timingRef.current) clearInterval(timingRef.current);
    }
  }, [state.isTimingActive, state.timingSpeed]);

  // Power meter sweep
  useEffect(() => {
    if (state.isPowerActive) {
      powerDirRef.current = 1;
      const interval = setInterval(() => {
        setState((prev) => {
          let next = prev.powerLevel + powerDirRef.current * 1.8;
          if (next >= 100) { powerDirRef.current = -1; next = 100; }
          if (next <= 0) { powerDirRef.current = 1; next = 0; }
          return { ...prev, powerLevel: next };
        });
      }, 20);
      powerRef.current = interval as unknown as number;
      return () => clearInterval(interval);
    } else {
      if (powerRef.current) clearInterval(powerRef.current);
    }
  }, [state.isPowerActive]);

  // Start the game — generate the first delivery immediately so landing spot is visible
  const startGame = useCallback(() => {
    const firstDelivery = getRandomDelivery();
    setState({
      phase: "selecting",
      matchState: createInitialMatchState(totalBalls, totalWickets),
      selectedShot: null,
      currentDelivery: firstDelivery,
      timingPosition: 0,
      powerLevel: 0,
      timingSpeed: 2,
      lastOutcome: null,
      isTimingActive: false,
      isPowerActive: false,
    });
  }, [totalBalls, totalWickets]);

  // Player selects a shot — delivery is already generated, start bowler run-up
  const selectShot = useCallback((shot: ShotType) => {
    if (state.phase !== "selecting") return;
    const delivery = state.currentDelivery!;
    setState((prev) => ({
      ...prev,
      selectedShot: shot,
      phase: "runup",
    }));

    // After run-up animation (~1s), transition to bowling (ball release)
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        phase: "bowling",
      }));

      // After bowling animation (~1s), activate timing bar
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          phase: "timing",
          timingPosition: 0,
          timingSpeed: delivery.speed,
          isTimingActive: true,
        }));
      }, 1000);
    }, 1100);
  }, [state.phase, state.currentDelivery]);

  // Player locks timing
  const lockTiming = useCallback(() => {
    if (state.phase !== "timing") return;
    setState((prev) => ({
      ...prev,
      phase: "power",
      isTimingActive: false,
      powerLevel: 0,
      isPowerActive: true,
    }));
  }, [state.phase]);

  // Player locks power
  const lockPower = useCallback(() => {
    if (state.phase !== "power") return;
    setState((prev) => {
      if (!prev.selectedShot || !prev.currentDelivery) return prev;

      const outcome = calculateOutcome(
        prev.selectedShot,
        prev.currentDelivery,
        prev.timingPosition,
        prev.powerLevel
      );

      const newMatchState = applyOutcome(prev.matchState, outcome);
      const gameOver = isMatchOver(newMatchState);

      return {
        ...prev,
        phase: gameOver ? "over" : "result",
        isPowerActive: false,
        lastOutcome: outcome,
        matchState: newMatchState,
      };
    });
  }, [state.phase]);

  // Continue to next ball — generate next delivery so landing spot is visible immediately
  const nextBall = useCallback(() => {
    if (state.phase !== "result") return;
    const nextDelivery = getRandomDelivery();
    setState((prev) => ({
      ...prev,
      phase: "selecting",
      selectedShot: null,
      currentDelivery: nextDelivery,
      timingPosition: 0,
      powerLevel: 0,
      lastOutcome: null,
    }));
  }, [state.phase]);

  // Restart game
  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  return {
    ...state,
    startGame,
    selectShot,
    lockTiming,
    lockPower,
    nextBall,
    restartGame,
  };
}
