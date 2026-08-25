# RecoverAI

## AI Revenue Recovery

RecoverAI is a production-quality hackathon demo for the **Razorpay AI Buildathon · AI Revenue Recovery** track. It is a dark, explainable revenue operations command center that helps a merchant detect recoverable revenue, diagnose why a payment is at risk, choose a bounded intervention, verify the outcome, and keep the decision trail visible.

> **RecoverAI does not just report failed payments. It finds recoverable revenue, understands why it is at risk, decides what to do, executes bounded recovery, verifies the result, and records why it happened.**

## Problem

Traditional payment dashboards tell teams what happened after a payment failed. They do not consistently prioritize the next best intervention, expose the confidence behind that recommendation, or connect an automated action to a clear audit trail.

## Solution

The demo turns failed, delayed, abandoned, and escalated payment cases into an operational workflow:

**DETECT → DIAGNOSE → DECIDE → RECOVER → VERIFY → AUDIT**

The first screen surfaces business impact, then leads the operator into the recovery queue, AI reasoning trace, transaction detail drawer, analytics, exception handling, and audit events.

## Track Alignment

| Track capability | RecoverAI implementation |
| --- | --- |
| Revenue-at-risk detection | Derived revenue-at-risk KPIs, ranked queue, and transaction filters |
| Transaction intelligence | Searchable transaction grid with payment, risk, and failure context |
| Failure diagnosis | Human-readable AI diagnosis for issuer, network, authentication, and customer signals |
| Recovery prioritization | Recovery score, risk tier, recovery probability, and expected value |
| AI recommendations | Smart Retry, Payment Reminder, Generate Payment Link, Alternative Method, Finance Review |
| Policy-controlled action | Explicit one-attempt bounds, confidence threshold, and human approval gate |
| Recovery execution | Client-side simulated workflow with loading, success, failure, and safe exception states |
| Outcome verification | Transaction state, recovered revenue, recovery rate, and audit state update together |
| Human-in-the-loop | High-value, low-confidence, risk-blocked, and escalated cases require approval |
| Audit trail | Timestamped actor, action, reason, result, confidence, and policy records |

## Features

- Live-like demo layer with **180 deterministic simulated transactions** generated from one source of truth.
- Overview command center with derived KPIs, rolling revenue trend, recovery spine, priority queue, failure intelligence, and exception list.
- Search, date range, risk, and payment-method filtering in the transaction intelligence view.
- Right-side transaction detail drawer with IDs, payment context, recovery journey, AI diagnosis, and action controls.
- Recovery queue split into Critical, High, Medium, and Low priority.
- AI Intelligence view with reasoning trace, confidence distribution, policy boundary, and recent decisions.
- Analytics view with recovery funnel, recovery rate by method, failure distribution, and an operational truth sheet.
- Customer intelligence cards using fictional identities and minimized personal data.
- Audit Trail view with an inspectable timeline tied to the featured recovery scenario.
- Working notifications, profile menu, settings controls, responsive mobile navigation, and visible Demo Mode indicator.
- Cinematic footer built with GSAP, ScrollTrigger, MagneticButton, marquee motion, scroll reveal, and scroll-to-top behavior.

## Architecture

The project is a static React application with a centralized client-side data service:

- `client/src/data/recoverai.ts` contains the data model, deterministic generator, derived metrics, breakdown utilities, risk classification, formatting helpers, and initial audit events.
- `client/src/pages/Home.tsx` owns the demo state and composes the command center views. It updates transactions, metrics, selected cases, and audit events without a page reload.
- `client/src/components/CinematicFooter.tsx` preserves the supplied footer architecture and adapts the content to RecoverAI.
- `client/src/index.css` owns the Night Operations tokens, typography, motion, and accessibility-safe defaults.
- Visual assets are hosted through Manus project storage and referenced with lifecycle-safe `/manus-storage/` URLs.

## AI Workflow

RecoverAI conceptually combines failure classification, root-cause diagnosis, recovery probability, customer success likelihood, urgency, confidence, risk assessment, policy checking, and explanation generation. The demo makes those signals visible rather than presenting AI as a generic chat box.

## Recovery Workflow

1. **Detect** a failed, pending, abandoned, or escalated payment and calculate revenue at risk.
2. **Diagnose** the failure reason and summarize the evidence in human-readable language.
3. **Decide** on a bounded intervention using recovery score, probability, confidence, and policy.
4. **Recover** with Smart Retry, a reminder, an alternative method, or a human-approved action.
5. **Verify** the resulting payment state and update derived revenue metrics.
6. **Audit** every meaningful action with actor, reason, result, confidence, and policy.

## Data Model

Every generated transaction includes transaction, payment, order, customer, merchant, amount, currency, payment method, status, failure reason and code, timestamps, retry history, segment, risk score, recovery score, revenue at risk, recommendation, AI confidence, recovery status, probability, next action, escalation requirement, and update metadata.

The generator uses a deterministic seed so the pitch demo is repeatable without pretending to be production data. The featured scenario is `TXN_847291` for the fictional customer Ananya Mehta, with a ₹12,499 issuer decline and an AI-recommended Smart Retry.

## Demo Mode

The interface visibly labels simulated data. Clicking **Recover** starts a bounded workflow, emits an audit event, updates the transaction state, recalculates KPIs, and shows either a verified recovery or a safe failure/exception. The featured transaction is guaranteed to demonstrate a successful recovery; other cases are intentionally mixed to preserve credibility.

## Security

No API keys, payment credentials, passwords, tokens, or production customer data are included. Customer identities are fictional. The static demo has no backend and stores no sensitive data. See `.env.example` for the non-secret placeholder variables used by the scaffold.

## Failure Handling

The demo includes safe failure states for bounded recovery failures, policy-gated human approval, low-confidence cases, and exception routing. A production integration would add an API fallback that explicitly states when AI is unavailable and switches to a rule-based recovery recommendation.

## Tech Stack

React 19, TypeScript, Tailwind CSS 4, shadcn/ui primitives, Recharts, GSAP, ScrollTrigger, Lucide React, Wouter-compatible scaffold, and Sonner.

## Setup Instructions

```bash
pnpm install
pnpm dev
```

The app runs at the local Vite URL exposed by the Manus project. To type-check and build:

```bash
pnpm check
pnpm build
```

## Environment Variables

The scaffold injects analytics and Manus runtime variables automatically. No application secret is required by this static demo. Use `.env.example` only as documentation; never commit real secrets.

## Running Locally

Use `pnpm dev` for Vite development with hot reload. Use `pnpm check` for TypeScript validation and `pnpm build` for the production bundle.

## Deployment

The project is designed for Manus built-in static hosting. Create a checkpoint and use the project management interface's Publish action when you are ready to deploy.

## Limitations

This is a simulated frontend-only demo. It does not call a real payment gateway, send customer notifications, persist transactions, authenticate merchants, or make production financial decisions. Analytics are derived from generated records and should not be interpreted as real-world performance claims.

## Future Improvements

A production version would connect to Razorpay webhooks and payment APIs through a secure backend, persist audit events in an append-only store, add merchant authentication and role-based permissions, integrate model monitoring, add real notification providers, and support replayable recovery experiments.
