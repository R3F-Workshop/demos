import { Leva } from "leva";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Keeps Leva controls mounted behind the debug gate. */
export function LevaPanel({
  /** For pages whose whole point is the controls: skips the `?debug` gate. */
  alwaysOpen = false,
}: {
  alwaysOpen?: boolean;
} = {}) {
  const debug = useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).has("debug"),
    () => false,
  );

  const show = alwaysOpen || debug;

  return (
    <Leva hidden={!show} collapsed={!alwaysOpen} titleBar={{ title: "tune" }} />
  );
}
