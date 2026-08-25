# RecoverAI Design Direction

## Three Directions Considered

### Theme Name: Night Operations
Very Brief Intro: A dark, precision-first financial operations center with electric blue signal accents, dense information hierarchy, and cinematic depth. It frames revenue recovery as a calm, high-stakes control room.
Probability: 0.07

### Theme Name: Ledger Atelier
Very Brief Intro: A warm editorial fintech workspace inspired by premium annual reports, ink, paper, and annotated ledgers. It makes complex recovery logic feel trustworthy, human, and legible.
Probability: 0.04

### Theme Name: Signal White
Very Brief Intro: A bright, clinical intelligence console built around white space, cobalt markers, and crisp data visualization. It communicates clarity and operational confidence without feeling sterile.
Probability: 0.02

## Chosen Direction: Night Operations

### Design Movement
Neo-industrial information design with references to aviation cockpit interfaces, Swiss grid discipline, and cinematic mission-control displays. The system should feel engineered, not decorated.

### Core Principles
1. **Signal over spectacle.** Every accent color, animation, and graphic mark should help a merchant detect risk, understand causality, or act with confidence.
2. **Layered depth.** Use near-black surfaces, fine hairline dividers, restrained glass panels, and quiet ambient glows to create a sense of operational depth.
3. **Explain before execute.** AI recommendations expose the reason, confidence, policy, and expected outcome before an action can be taken.
4. **Dense but breathable.** Use high information density in dashboards, then create breathing room with asymmetric composition, deliberate negative space, and clear hierarchy.

### Color Philosophy
RecoverAI owns a deep ink canvas (#05080F) so the interface feels like a live command room after hours. Razorpay-inspired cobalt (#2D6BFF) is the primary signal for action and intelligence, while ice blue (#9FC4FF) communicates analytical focus. Emerald is reserved for verified recovery, amber for review states, and coral-red for risk or failure. Gradients are used only as atmospheric light, never as a generic decoration.

### Layout Paradigm
A persistent left command rail anchors the experience, while the main viewport uses a staggered operational stack: impact KPIs first, then the recovery queue and live intelligence, followed by diagnostic analytics and the audit story. Avoid a uniform dashboard grid; let the primary insight panel span wide, place supporting modules on asymmetric columns, and use a right-side intelligence drawer for deep inspection.

### Signature Elements
- **The Recovery Spine:** a recurring Detect → Diagnose → Decide → Recover → Verify → Audit sequence rendered as a thin cobalt-to-emerald signal path.
- **Signal Tags:** compact uppercase labels with a leading status dot, used for DEMO MODE, policy checks, exceptions, and confidence states.
- **Telemetry Lines:** fine horizontal rules, monospaced timestamps, tiny waveform/sparkline details, and faint coordinate-like metadata to create operational credibility.

### Interaction Philosophy
Interactions should feel like operating a trustworthy instrument panel. Hover and focus states illuminate the relevant signal; selecting a transaction opens its intelligence without losing dashboard context. Actions are bounded and explicit: the user sees policy, expected outcome, and approval state before confirming. Every state change emits a visible audit event and updates derived KPIs.

### Animation
Use quick, purposeful motion for UI feedback (140–220ms with a strong ease-out) and reserve slower movement for ambient atmosphere. KPI values count up on first load and after a recovery. The Recovery Spine pulses through completed stages. Drawers enter from the right with opacity and transform only. Data points and progress bars reveal with a 30–60ms stagger. The marquee footer moves continuously but slowly. Respect `prefers-reduced-motion` by disabling ambient parallax, marquee, and non-essential reveal effects while preserving state change feedback.

### Typography System
Use **Plus Jakarta Sans** for interface text and **IBM Plex Mono** for IDs, timestamps, table metadata, and audit events. Headlines are bold, compact, and slightly tracked in uppercase or sentence case depending on context. KPI values use a heavy display weight with tight tracking. Labels are 10–11px mono or semibold sans with generous letter spacing. Body copy remains 13–14px for density without sacrificing readability.

### Brand Essence
RecoverAI is the revenue recovery command center for modern merchants who need to know not only what failed, but what to do next and why. Personality: **decisive, explainable, composed**.

### Brand Voice
Headlines are direct and high-stakes without hype. CTAs sound like operational verbs. Microcopy states the boundary, confidence, or consequence plainly.

Example lines:
- “Recover revenue before the retry window closes.”
- “Policy cleared. Smart Retry can run without finance approval.”

### Wordmark & Logo
The mark is a compact **split-chevron orbit**: two cobalt blades form an open circular motion around a small negative-space core, implying a payment route that has been redirected back into the merchant’s ledger. The wordmark uses a custom-feeling wide grotesk treatment with the “AI” set in cobalt and a subtle monospaced sublabel for the recovery system.

### Signature Brand Color
**Recovery Cobalt — #2D6BFF.** It is bright enough to cut through the ink canvas, restrained enough for long operational sessions, and ownable as the visual signal that a recoverable opportunity has been found.

## Style Decisions
- Use a dark-by-default canvas with cobalt as the primary action signal.
- Use AI-generated visuals only as atmospheric, text-free support; the product's data UI remains deterministic and readable.
- Preserve the supplied CinematicFooter architecture with GSAP, ScrollTrigger, MagneticButton, marquee, and scroll-to-top behavior, adapting only the branding and copy to RecoverAI.
- Keep simulated/demo data clearly labeled and derived from one stateful client-side data layer.
- Prefer asymmetric command-center composition over generic centered SaaS card grids.
- Avoid fake testimonials, ratings, or customer reviews.

## Style Decisions — Visual Review Amendments
- Every operational view should have a visibly different silhouette: table-first transactions, action-first recovery, reasoning-first intelligence, chart-first analytics, and event-log-first audit.
- The shell must always show a stronger RecoverAI lockup with the split-chevron orbit mark and cobalt “AI” treatment.
- Repeat the Recovery Spine as a thin cobalt-to-emerald workflow ribbon across the main experience, not only inside the overview card.
- Favor one dominant operational insight per view and use the remaining modules as supporting evidence.
