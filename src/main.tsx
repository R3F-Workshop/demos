import { type ComponentType, lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

/** Every `src/demos/<slug>/page.tsx` is a route at `/<slug>`. Nothing to register. */
const pages = Object.fromEntries(
  Object.entries(
    import.meta.glob<{ default: ComponentType }>("./demos/*/page.tsx"),
  ).map(([path, load]) => [path.split("/")[2], lazy(load)]),
);

function App() {
  const slug = window.location.pathname
    .slice(import.meta.env.BASE_URL.length)
    .replace(/\/+$/, "");
  const Page = pages[slug];

  if (!Page) {
    return (
      <main className="grid min-h-dvh place-items-center px-6">
        <div className="font-mono text-[11px] tracking-[0.13em] text-faint uppercase">
          No such demo
        </div>
      </main>
    );
  }

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
