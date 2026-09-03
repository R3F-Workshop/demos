import { DEMOS } from "./demos";

export function DemoIndex() {
  return (
    <main className="mx-auto max-w-[900px] px-5 py-16 sm:px-8 md:py-24">
      <div className="font-mono text-[11px] tracking-[0.13em] text-faint uppercase">
        Demos
      </div>
      <h1 className="mt-2 text-[32px] leading-[1.05] font-semibold tracking-[-0.035em] md:text-[42px]">
        Made with R3F v10
      </h1>
      <p className="mt-4 max-w-[620px] text-base leading-[1.65] text-muted-foreground">
        Pieces from the Advanced React Three Fiber workshop, running on their
        own. Each needs WebGPU. There is no WebGL fallback, by design.
      </p>

      <ul className="mt-10 grid gap-4">
        {DEMOS.map((d) => (
          <li key={d.slug}>
            <a
              href={import.meta.env.BASE_URL + d.slug}
              className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20 sm:p-6"
            >
              <div className="text-[19px] font-semibold tracking-[-0.02em]">
                {d.title}
              </div>
              <p className="mt-2 text-[15px] leading-[1.6] text-muted-foreground">
                {d.blurb}
              </p>
              <div className="mt-3.5 flex flex-wrap gap-2">
                {d.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-border px-2 py-1 font-mono text-[10.5px] text-faint"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </a>
          </li>
        ))}
      </ul>

      <a
        href="https://threejs.paris/workshop"
        className="mt-10 inline-block text-[14px] text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        The workshop this was built for
      </a>
    </main>
  );
}
