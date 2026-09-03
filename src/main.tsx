import { StrictMode, Suspense, useEffect } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import { DemoIndex } from "./demo-index";
import { DEMOS } from "./demos";

/** One route per demo, read off the path. The index is the root. */
function App() {
  const slug = window.location.pathname
    .slice(import.meta.env.BASE_URL.length)
    .replace(/\/+$/, "");
  const demo = DEMOS.find((d) => d.slug === slug);

  useEffect(() => {
    document.title = demo
      ? `${demo.title} — R3F v10 demo`
      : "Demos — Advanced React Three Fiber";
  }, [demo]);

  if (!slug) return <DemoIndex />;

  if (!demo) {
    return (
      <main className="grid min-h-dvh place-items-center px-6">
        <div className="text-center">
          <div className="font-mono text-[11px] tracking-[0.13em] text-faint uppercase">
            No such demo
          </div>
          <a
            href={import.meta.env.BASE_URL}
            className="mt-3 inline-block text-[14px] text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            All demos
          </a>
        </div>
      </main>
    );
  }

  const Page = demo.page;
  return (
    <Suspense fallback={<div className="h-dvh w-full bg-background" />}>
      <Page />
    </Suspense>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
