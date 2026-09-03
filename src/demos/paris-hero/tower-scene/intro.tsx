import { useEffect, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber/webgpu";

/** Shared clock for the hero entrance. */
export const INTRO_COMPLETE = 6.2;
export const LETTER_CHAIN_START = 2.65;
/** The letter chain is past halfway and beginning to settle. */
export const UI_REVEAL_START = 3.72;

const MAX_DT = 1 / 20;
/** Run before intro clock consumers. */
const INTRO_CLOCK_PRIORITY = 50;

export function IntroClock({
  clock,
  enabled,
  onUiReveal,
}: {
  clock: RefObject<number>;
  enabled: boolean;
  onUiReveal?: () => void;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const cueSent = useRef(false);

  useEffect(() => {
    clock.current = enabled ? 0 : INTRO_COMPLETE;
    cueSent.current = !enabled;
    if (!enabled) onUiReveal?.();
    // Apply the current pose on the next frame.
    invalidate();
  }, [clock, enabled, invalidate, onUiReveal]);

  useFrame(
    (_, delta) => {
      const revealUi = () => {
        if (cueSent.current) return;
        cueSent.current = true;
        onUiReveal?.();
      };

      if (!enabled) {
        clock.current = INTRO_COMPLETE;
        revealUi();
        return;
      }

      clock.current = Math.min(
        INTRO_COMPLETE,
        clock.current + Math.min(delta, MAX_DT),
      );

      if (clock.current >= UI_REVEAL_START) revealUi();
    },
    { phase: "update", priority: INTRO_CLOCK_PRIORITY },
  );

  return null;
}
