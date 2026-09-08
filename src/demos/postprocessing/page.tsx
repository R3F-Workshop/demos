import { PostprocessingDemo } from "./misc/postprocessing-demo";

export default function PostprocessingDemoPage() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-background">
      <PostprocessingDemo />

      {/* /* Title plate. pointer-events-none so it never intercepts the cursor. */}
      <div className="pointer-events-none absolute top-5 left-5 z-30 max-w-[min(430px,calc(100vw-2.5rem))]">
        <div className="font-mono text-[11px] tracking-[0.13em] text-faint uppercase">
          Demo · made with R3F v10
        </div>
        <h1 className="mt-1.5 text-[22px] leading-[1.15] font-semibold tracking-[-0.03em] sm:text-[26px]">
          Postprocessing
        </h1>
        <p className="mt-1.5 text-[13.5px] leading-[1.5] text-muted-foreground">
          Bloom and ambient occlusion (GTAO) postprocessing effects, with a Leva
          GUI to tweak parameters in real time.
        </p>
      </div>
    </main>
  );
}
