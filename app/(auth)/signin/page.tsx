import { Quicksand } from "next/font/google";
import { signIn } from "@/auth";

const quicksand = Quicksand({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

// Decorative diagram on the brand panel: the four request flows the app manages, all feeding
// the shared asset register. Coordinates are in the SVG viewBox (960 x 440); the HTML nodes and
// chips are placed with the same numbers converted to percentages so they line up with the lines.
// Each line starts underneath its (opaque) node, so it meets the node edge whatever the label width.
const VIEW_W = 960;
const VIEW_H = 440;

const FLOWS = [
  { code: "IT", label: "Items", y: 55, align: "left", path: "M 80 55 C 300 55, 330 90, 400 160", chip: { text: "Item tagged", x: 296, y: 81 } },
  { code: "MT", label: "Maintenance", y: 55, align: "right", path: "M 880 55 C 660 55, 630 90, 560 160", chip: { text: "PM due", x: 664, y: 81 } },
  { code: "MV", label: "Movement", y: 385, align: "left", path: "M 80 385 C 300 385, 330 350, 400 280", chip: { text: "Transfer approved", x: 296, y: 359 } },
  { code: "DS", label: "Disposal", y: 385, align: "right", path: "M 880 385 C 660 385, 630 350, 560 280", chip: { text: "Write-off", x: 664, y: 359 } },
] as const;

const pct = (value: number, total: number) => `${(value / total) * 100}%`;

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;
  const domain = process.env.ALLOWED_EMAIL_DOMAIN;

  return (
    <div className={`${quicksand.className} flex min-h-screen w-full bg-white`}>
      {/* Brand panel */}
      <aside className="relative hidden w-1/2 flex-col overflow-hidden bg-[#0b1220] px-12 py-10 text-white xl:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_62%,rgba(37,99,235,0.22),transparent_60%)]"
        />

        <div className="relative flex items-center gap-3">
          <ShieldLogo />
          <span className="text-lg font-semibold">Archipelago</span>
          <span className="text-xs font-medium tracking-[0.2em] text-blue-300/80">ASSET MANAGEMENT</span>
        </div>

        <div className="relative mt-14 max-w-md">
          <h1 className="text-4xl font-semibold leading-tight">Every asset, every hotel, one place</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300/80">
            Items, maintenance, movements and disposals for every Archipelago property.
          </p>
        </div>

        <div className="relative my-auto w-full py-10">
          <div className="relative w-full" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
            <svg
              aria-hidden
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className="absolute inset-0 h-full w-full"
              fill="none"
            >
              {FLOWS.map((flow) => (
                <g key={flow.code}>
                  <path d={flow.path} stroke="rgba(148,163,184,0.35)" strokeWidth="1.5" />
                  <path d={flow.path} stroke="rgba(96,165,250,0.7)" strokeWidth="2" strokeDasharray="2 14" strokeLinecap="round" />
                  <circle r="3.5" fill="#60a5fa" className="motion-reduce:hidden">
                    <animateMotion dur="3.2s" repeatCount="indefinite" path={flow.path} />
                  </circle>
                </g>
              ))}
            </svg>

            {FLOWS.map((flow) => (
              <div
                key={flow.code}
                className="absolute flex -translate-y-1/2 items-center gap-3 whitespace-nowrap rounded-xl border border-white/10 bg-[#111a2c] py-2 pl-2 pr-5"
                style={{
                  top: pct(flow.y, VIEW_H),
                  ...(flow.align === "left" ? { left: 0 } : { right: 0 }),
                }}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-xs font-bold text-blue-200">
                  {flow.code}
                </span>
                <span className="text-base font-medium">{flow.label}</span>
              </div>
            ))}

            {FLOWS.map((flow) => (
              <span
                key={`${flow.code}-chip`}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-[#0b1220] px-2.5 py-0.5 text-[11px] text-slate-200"
                style={{ left: pct(flow.chip.x, VIEW_W), top: pct(flow.chip.y, VIEW_H) }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                {flow.chip.text}
              </span>
            ))}

            <div className="absolute left-1/2 top-1/2 flex aspect-square w-[22%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.35),rgba(15,23,42,0.9)_70%)] text-center shadow-[0_0_0_14px_rgba(37,99,235,0.08)]">
              <span className="text-lg font-semibold leading-tight">Asset Management</span>
              <span className="mt-1 text-[9px] tracking-[0.18em] text-slate-300/80">ASSET REGISTER</span>
              <span className="mt-2 flex items-center gap-1 rounded-full border border-blue-400/40 px-2 py-0.5 text-[10px] tracking-wider text-blue-200">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400 motion-reduce:animate-none" />
                LIVE
              </span>
            </div>
          </div>
        </div>

        <div className="relative mx-auto flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-sm text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
          Every asset tracked from purchase to disposal
        </div>
      </aside>

      {/* Sign-in panel */}
      <main className="flex w-full flex-col px-6 py-10 xl:w-1/2">
        <div className="flex items-center gap-2 xl:hidden">
          <ShieldLogo />
          <span className="font-semibold text-slate-900">Archipelago</span>
        </div>

        <div className="mx-auto my-auto w-full max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            You&apos;ll continue to Asset Management
          </span>
          <h2 className="mt-5 text-3xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-2 text-slate-500 [overflow-wrap:anywhere]">
            Sign in with your {domain ? `@${domain}` : "Archipelago"} Google account.
          </p>

          {error && (
            <p className="mt-5 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 [overflow-wrap:anywhere]">
              Access denied. Please sign in with an
              {domain ? ` @${domain}` : " authorized"} account.
            </p>
          )}

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: callbackUrl || "/" });
            }}
          >
            <button
              type="submit"
              className="mt-7 flex w-full items-center gap-4 rounded-xl bg-blue-600 px-4 py-3.5 text-left text-lg font-semibold text-white shadow-sm ring-2 ring-blue-600 ring-offset-2 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-blue-800"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                <GoogleLogo />
              </span>
              Continue with Google
            </button>
          </form>
        </div>

        <footer className="text-center text-sm text-slate-400">
          Asset Management · Archipelago
        </footer>
      </main>
    </div>
  );
}

function ShieldLogo() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" fill="#2563eb" />
      <path d="M8 12.5 11 15l5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg aria-hidden viewBox="0 0 48 48" className="h-5 w-5">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5Z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44Z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5Z" />
    </svg>
  );
}
