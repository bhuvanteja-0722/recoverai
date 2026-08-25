// Night Operations style note: end the operational experience with a quiet, cinematic recovery signal and restrained depth.
"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, CornerDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STYLES = `
.cinematic-footer-wrapper { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-font-smoothing: antialiased; --pill-bg-1: rgba(255,255,255,.08); --pill-bg-2: rgba(255,255,255,.03); --pill-shadow: rgba(0,0,0,.42); --pill-highlight: rgba(255,255,255,.12); --pill-inset-shadow: rgba(0,0,0,.35); --pill-border: rgba(255,255,255,.12); --pill-bg-1-hover: rgba(255,255,255,.14); --pill-bg-2-hover: rgba(255,255,255,.06); --pill-border-hover: rgba(120,168,255,.55); --pill-shadow-hover: rgba(0,0,0,.6); --pill-highlight-hover: rgba(255,255,255,.2); }
@keyframes footer-breathe { 0% { transform: translate(-50%, -50%) scale(1); opacity: .38; } 100% { transform: translate(-50%, -50%) scale(1.12); opacity: .72; } }
@keyframes footer-scroll-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes footer-heartbeat { 0%,100% { transform: scale(1); filter: drop-shadow(0 0 4px rgba(72,220,152,.32)); } 15%,45% { transform: scale(1.18); filter: drop-shadow(0 0 10px rgba(72,220,152,.75)); } 30% { transform: scale(1); } }
.animate-footer-breathe { animation: footer-breathe 8s ease-in-out infinite alternate; }
.animate-footer-scroll-marquee { animation: footer-scroll-marquee 40s linear infinite; }
.animate-footer-heartbeat { animation: footer-heartbeat 2s cubic-bezier(.25,1,.5,1) infinite; }
.footer-bg-grid { background-size: 60px 60px; background-image: linear-gradient(to right, rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.035) 1px, transparent 1px); mask-image: linear-gradient(to bottom, transparent, black 28%, black 72%, transparent); -webkit-mask-image: linear-gradient(to bottom, transparent, black 28%, black 72%, transparent); }
.footer-aurora { background: radial-gradient(circle at 50% 50%, rgba(45,107,255,.17) 0%, rgba(69,196,145,.1) 36%, transparent 68%); }
.footer-glass-pill { background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%); box-shadow: 0 10px 30px -10px var(--pill-shadow), inset 0 1px 1px var(--pill-highlight), inset 0 -1px 2px var(--pill-inset-shadow); border: 1px solid var(--pill-border); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); transition: all .4s cubic-bezier(.16,1,.3,1); }
.footer-glass-pill:hover { background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%); border-color: var(--pill-border-hover); box-shadow: 0 20px 40px -10px var(--pill-shadow-hover), inset 0 1px 1px var(--pill-highlight-hover); color: white; }
.footer-giant-bg-text { font-size: 26vw; line-height: .75; font-weight: 900; letter-spacing: -.06em; color: transparent; -webkit-text-stroke: 1px rgba(255,255,255,.07); background: linear-gradient(180deg, rgba(255,255,255,.11) 0%, transparent 60%); -webkit-background-clip: text; background-clip: text; }
.footer-text-glow { background: linear-gradient(180deg, #fff 0%, rgba(255,255,255,.42) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; filter: drop-shadow(0 0 20px rgba(255,255,255,.14)); }
`;

type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & React.AnchorHTMLAttributes<HTMLAnchorElement> & { as?: React.ElementType };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(function MagneticButton({ className, children, as: Component = "button", ...props }, forwardedRef) {
  const localRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !localRef.current) return;
    const element = localRef.current;
    const ctx = gsap.context(() => {
      const handleMouseMove = (event: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        gsap.to(element, { x: x * .28, y: y * .28, rotationX: -y * .08, rotationY: x * .08, scale: 1.04, ease: "power2.out", duration: .32 });
      };
      const handleMouseLeave = () => gsap.to(element, { x: 0, y: 0, rotationX: 0, rotationY: 0, scale: 1, ease: "elastic.out(1,.3)", duration: 1 });
      element.addEventListener("mousemove", handleMouseMove);
      element.addEventListener("mouseleave", handleMouseLeave);
      return () => { element.removeEventListener("mousemove", handleMouseMove); element.removeEventListener("mouseleave", handleMouseLeave); };
    }, element);
    return () => ctx.revert();
  }, []);

  return (
    <Component
      ref={(node: HTMLElement | null) => {
        localRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </Component>
  );
});
MagneticButton.displayName = "MagneticButton";

const MarqueeItem = () => (
  <div className="flex shrink-0 items-center gap-7 pr-7 text-[10px] font-semibold uppercase tracking-[.28em] text-white/45">
    <span>Accountability Redefined</span><span className="text-[#2D6BFF]">✦</span>
    <span>Bounded Recovery</span><span className="text-[#2D6BFF]">✦</span>
    <span>Explainable Decisions</span><span className="text-[#2D6BFF]">✦</span>
    <span>Every Action Audited</span><span className="text-[#2D6BFF]">✦</span>
  </div>
);

export function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const giantTextRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const linksRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !wrapperRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(giantTextRef.current, { y: "10vh", scale: .8, opacity: 0 }, { y: "0vh", scale: 1, opacity: 1, ease: "power1.out", scrollTrigger: { trigger: wrapperRef.current, start: "top 80%", end: "bottom bottom", scrub: 1 } });
      gsap.fromTo([headingRef.current, linksRef.current], { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: .15, ease: "power3.out", scrollTrigger: { trigger: wrapperRef.current, start: "top 40%", end: "bottom bottom", scrub: 1 } });
    }, wrapperRef);
    return () => ctx.revert();
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  return (
    <>
      <style>{STYLES}</style>
      <footer ref={wrapperRef} className="cinematic-footer-wrapper relative isolate min-h-[620px] overflow-hidden bg-[#05080F] px-5 pb-7 pt-24 text-white sm:px-8 lg:px-12">
        <img src="/manus-storage/recoverai-recovery-orbit_370776ac.png" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-screen" />
        <div className="footer-bg-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="footer-aurora pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[1000px] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-full blur-3xl" />
        <div ref={giantTextRef} className="footer-giant-bg-text pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2 select-none whitespace-nowrap">RECOVER</div>

        <div ref={headingRef} className="relative z-10 mx-auto flex max-w-[1240px] flex-col justify-between gap-12 lg:min-h-[360px] lg:flex-row lg:items-end">
          <div className="max-w-[680px]">
            <div className="mb-7 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.3em] text-[#9FC4FF]"><span className="h-1.5 w-1.5 rounded-full bg-[#45C491] shadow-[0_0_14px_rgba(69,196,145,.9)]" /> Recovery intelligence, on record</div>
            <h2 className="footer-text-glow max-w-[760px] text-[clamp(3rem,7vw,7rem)] font-extrabold leading-[.88] tracking-[-.07em]">The next best<br /><span className="text-[#6EA8FF]">action is visible.</span></h2>
            <p className="mt-8 max-w-[460px] text-sm leading-7 text-white/52">RecoverAI turns payment failure into a bounded, explainable workflow — so your team can move faster without losing the trail.</p>
          </div>
          <div ref={linksRef} className="flex flex-col items-start gap-3 lg:items-end">
            <MagneticButton onClick={scrollToTop} className="footer-glass-pill group flex items-center gap-7 rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[.2em] text-white/75">
              Return to overview <ArrowUpRight className="h-4 w-4 text-[#6EA8FF] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </MagneticButton>
            <div className="flex items-center gap-2 pr-2 text-[10px] font-mono uppercase tracking-[.2em] text-white/28"><CornerDownRight className="h-3.5 w-3.5" /> audit-ready by design</div>
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-24 max-w-[1240px] overflow-hidden border-y border-white/10 py-5"><div className="animate-footer-scroll-marquee flex w-max"><MarqueeItem /><MarqueeItem /><MarqueeItem /><MarqueeItem /></div></div>
        <div className="relative z-10 mx-auto mt-6 flex max-w-[1240px] flex-col justify-between gap-3 text-[10px] font-mono uppercase tracking-[.18em] text-white/25 sm:flex-row"><span>RecoverAI / Revenue Recovery Intelligence</span><span>Built for the Razorpay AI Revenue Recovery track · Simulated demo environment</span><span className="flex items-center gap-2">System status <span className="animate-footer-heartbeat inline-block h-1.5 w-1.5 rounded-full bg-[#45C491]" /></span></div>
      </footer>
    </>
  );
}

export default CinematicFooter;
