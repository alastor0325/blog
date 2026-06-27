---
date: 2026-06-27 12:00:00
layout: post
title: "Frame, Decompose, Verify: Real Engineering with AI Agents"
subtitle: 'A practical method for taking AI coding agents past "smart autocomplete" — into real investigation, refactors, sizable features, and multi-week projects.'
description: 'A practical method — frame the uncertainty, decompose into verifiable steps, and verify through checks that can fail independently of the agent — for taking AI coding agents past autocomplete into real investigation, refactors, features, and multi-week projects.'
image: /assets/img/uploads/frame-decompose-verify.jpg
image_portrait: /assets/img/uploads/frame-decompose-verify-portrait.jpg
optimized_image: /assets/img/uploads/frame-decompose-verify.jpg
category: tech
tags:
  - ai
  - engineering
paginate: false
---

Most people get an AI coding agent to write a function or fix a typo, then stall the moment a
task needs *real thinking* — a bug whose cause isn't obvious, a refactor across a dozen files,
building a sizable feature from a design, a project with many interdependent parts. The output
stops being trustworthy, or the agent just spins.

A smarter model helps. But the reliable way to make the output better — whatever model you're
running — is a *method*: **how you frame the work, break it down, and verify it.** This guide
shows what each level of task actually takes, and how to get there.

## Difficulty is uncertainty, not size

A one-line fix can be the hardest thing you do all week, if finding *which* line took three
days. A change touching hundreds of files can be trivial, if every edit is obvious. So before
you prompt anything, ask: **how much do I not-yet-know, and what kind of not-knowing is it?**

That question sorts almost every task onto a ladder — not of "how much code," but of "how much
must be *figured out* before the code can be written."

---

## TL;DR — the principles

If you read nothing else:

1. **Match your effort to the uncertainty, not the diff size.** Figure out what kind of task
   you're holding before you start typing prompts.
2. **Write the problem down before you write the fix.** A short note — cause, evidence, plan —
   is what keeps hard work from going in circles, and lets you resume days later.
3. **Make the agent ground its fix in the real code, not its guesses.** Give it real code
   search and have it find and explain the cause before changing anything — "fix this, and
   show me the code that causes it" beats "fix this."
4. **Reason in claims that can be proven wrong, then go prove them.** Demand evidence — a test,
   a measurement, a spec line — not confident-sounding prose.
5. **Trust the check, not the model.** Route every conclusion through something that can
   *fail independently of the agent*: a compile, a test, a benchmark, the spec, a reviewer.
6. **Break big work into small steps that each stand on their own.** Each step should build and
   test cleanly; review the plan *before* any code is written.
7. **Before shipping, have the work challenged from several independent angles — not blessed by
   one.** The author (you or the agent) has blind spots; one reviewer with one lens still misses
   plenty.
8. **A disproven approach, written down, is a result — not wasted effort.** Ruling something out
   narrows what's left to try, and a dead end you recorded is one neither you nor the agent
   re-walks.

The rest of this guide explains how to actually *do* each of these.

---

## The ladder at a glance

| Level | Name | What makes it hard | What it feels like |
|------|------|--------------------|--------------------|
| **L1** | Trivial / mechanical | Nothing to figure out — the change *is* the task | "I already know exactly what to type" |
| **L2** | Localized fix | One clear cause, contained to a file or two | "Once I see it, the fix is obvious" |
| **L3** | Multi-file investigation | Must reason across several files, a reference, or a spec before a small change | "The patch is tiny; finding it was the work" |
| **L4** | Deep debug / design | Hypothesis-driven tracing across subsystems, or a real design decision | "I have to form theories and test them" |
| **L5** | Multi-part program | Too big to hold as one problem — must be split into many sequenced, independently-checked pieces | "This needs a plan, not a single sitting" |

You don't need these labels in daily life. You need the reflex: **name the uncertainty first.**

---

## The loop every level runs on

From a one-liner to a multi-week program, the work is the same loop. Bigger tasks just *nest*
it — each small step is its own pass through the loop.

```
   ┌─ FRAME ───────────────────────────────────────────────┐
   │  State the goal, the uncertainty, and the check       │
   │  ("done = this passes").                              │
   └───────────────────────────────────────────────────────┘
                               │
   ┌─ ORIENT ──────────────────────────────────────────────┐
   │  Gather ground truth: read the relevant code, the     │
   │  spec, a profile, prior art. Point the agent at it.   │
   └───────────────────────────────────────────────────────┘
                               │
   ┌─ HYPOTHESIZE ─────────────────────────────────────────┐
   │  Form claims you could prove wrong about cause /      │
   │  approach. Write them down. Predict what you'd see.   │
   └───────────────────────────────────────────────────────┘
                               │
   ┌─ ACT ─────────────────────────────────────────────────┐
   │  Make the smallest change (or experiment) that tests  │
   │  or implements one claim.                             │
   └───────────────────────────────────────────────────────┘
                               │
   ┌─ VERIFY ──────────────────────────────────────────────┐
   │  Run the check. Build, test, benchmark, re-read the   │
   │  spec, review. The verdict is independent of the      │
   │  agent's reasoning.                                   │
   └───────────────────────────────────────────────────────┘
                               │
                  pass ────────┴──────── fail → update the note,
                   │                     drop the dead claim,
              COMMIT &                   loop again
              record (incl. dead ends)
```

The discipline that makes it work: **never let a conclusion skip the VERIFY box** — though
*what* verifies it varies. A cause backed only by the model's say-so is a guess; back it with
evidence you can point to — a test, a profile, a spec section, a reproduction. Not everything is
unit-testable (races, hardware-specific paths, one-off repros) — when it isn't, fall back to the
strongest check you *can* run, not to trusting the prose. The levels below are just this loop
applied at growing scales of uncertainty.

---

## Before you start: prepare your agent

The framework above assumes your agent has a handful of capabilities. These are **roles, not
products** — fill each with whatever your setup offers, and note that several are probably built
in already. For each: check whether you have it, add it if not, and confirm it works. The role
matters, not the tool.

- **Search and read your real codebase.** *So fixes are grounded in how your code actually
  works, not in generic guesses.* Most coding agents have this built in. Confirm it by asking the
  agent to find where something is defined — you have it when it quotes real file lines back, not
  a general description. If it can't, give it a search/index capability or let it run your normal
  search command.
- **Run the build and tests itself.** *This is your primary gate — the agent must be able to
  prove its own work passes.* Give it the ability to run your build/test commands and read the
  output. Confirm by having it run your test suite and report a real pass/fail.
- **Reach the authoritative reference.** *To settle "what is correct?" against a spec or standard,
  not the model's memory.* Let it fetch the document, or hand it the file/URL. Confirm it can
  quote the specific section rather than paraphrase from memory.
- **Turn behavior into readable evidence.** *Many bugs are invisible without measurement, and an
  agent can only reason over what it can read.* The trick: export the evidence to text or a file
  the agent can open — log to a file, dump a trace, save a profile in a readable form, print the
  numbers. If your data is binary or lives in a GUI, find a way to get a textual summary out.
  Confirm by capturing one run and checking the agent can cite specific values from it.
- **Work in an isolated workspace.** *So a long-running or parallel task doesn't collide with your
  main work.* A separate branch or working copy per task. Confirm you can throw the workspace away
  without touching anything else.
- **Keep a durable note.** *So reasoning survives across sessions and the work is resumable.* Just
  a file per task (Level 3 covers what to capture). Confirm it captures cause, evidence, what you
  tried, and the plan.
- **An accumulated knowledge base.** *So facts and procedures you worked out once aren't
  re-derived every time.* Distinct from the per-task note: a long-lived store of durable
  knowledge — both *how the system behaves* (a subsystem's threading and ownership rules, where it
  diverges from the spec) and *how you do things* (the steps for a recurring task, a worked
  example like a saved profile or command, the gotcha you hit last time) — each with a source or
  example. It compounds: little help on a brand-new area, growing payoff as you revisit the same
  subsystems and workflows, and during review. Confirm something you recorded once gets surfaced
  the next time it's relevant.

You don't need all of these for every task — each level below says which it calls for. Set them up
once and they serve every level.

**The levels stack.** Each level's *What you need* is cumulative: it lists only what that level
*adds* on top of the levels below it. So Level 3 assumes you already have everything Levels 1–2
need, and so on.

---

## Level 1 — Trivial / mechanical

**What it is.** Nothing to investigate. The change is fully specified by the request itself:
bump a version, update a generated value, consolidate a known duplicate.

**What you need.** Almost nothing:
- **A way to locate the spot** — code search, or just knowing where it lives.
- **Your normal check pipeline** — the build/lint/test you already run on any change.

**How you drive it.** Resist the urge to let "tiny" changes skip your process. Have the agent
run it through the same pipeline you'd use for anything else — your normal checks, a clean
commit message — and confirm it passed before you accept it. The discipline is the point, not
the difficulty.

**Examples.** Think version bumps, dead-code removal, a typo fix across a few files.

---

## Level 2 — Localized fix

**What it is.** A real bug, but once you see it the fix lives in one or two files and the
reasoning is local. This is the most common kind of fixable bug.

**What you need.** On top of Level 1:
- **Code search the agent itself uses** — to read and reason about the surrounding code, not just
  locate the line.
- **A reproduction** — ideally a failing test that passes once the fix lands.

**How you drive it.**
1. Describe the problem precisely, and ask for a reproduction or a failing test first — for
   example: *"Before changing anything, write a test that reproduces this and confirm it fails."*
2. Tell it to investigate the actual code and *report the cause* — with the lines that prove
   it — before it proposes a fix. A prompt that works: *"Find the cause and show me the exact
   code that produces it. Don't fix it yet."* "Show me the code" beats "fix this."
3. Sanity-check the cause is real (see *trust the check* below for how), then let it make the
   change and run the test + build; confirm green, then commit.

The skill here is yours: stating the problem precisely, and refusing to accept a fix until the
cause behind it is one you've checked — not just one that reads convincingly.

**Examples (landed in Firefox):**
- A negated condition in the styling path meant a media element failed to restyle correctly
  unless an unrelated rule was present.
  ([bug 2035986](https://bugzilla.mozilla.org/show_bug.cgi?id=2035986))
- Playback started only after a manual seek because a timestamp field was read with the wrong
  sign — once spotted, a contained fix.
  ([bug 2026875](https://bugzilla.mozilla.org/show_bug.cgi?id=2026875))

---

## Level 3 — Multi-file investigation

**What it is.** The change may be small, but you can't write it until you've reasoned across
several files, an authoritative definition of correct behavior, or another system's behavior.
**The investigation is the hard part; the change itself can be tiny.**

**What you need.** On top of Level 2:
- **An authoritative definition of correct behavior** — a spec, standard, requirements doc, or
  whoever owns the intent — to settle "is this actually wrong, or just not what I assumed?"
- **A point of reference to compare against** *when one exists* — another system that solves the
  same problem, or a known-good prior version — for when the definition alone doesn't decide it.
- **A way to search version history** — to pin a regression to the change that introduced it
  (bisection), or to see how similar work was done before.
- **A written investigation note** — the artifact that defines this level (what it should
  capture, below).

**How you drive it.**
1. If it's a regression, have the agent bisect to the introducing commit so you're both
   reasoning about one change, not the whole codebase — *"here's a command that exits 0 when
   good and 1 when broken; bisect to the commit that introduced it."* If you're building
   something new instead, have it map the files the change must touch before writing any of them.
2. Make it read the relevant code *and the source of truth for correct behavior*, and write up
   what it finds — don't let it answer "is this even a bug?" from memory: *"Quote the rule that
   governs this — spec, doc, or ticket — and tell me whether our behavior actually violates it."*
3. Require it to state the cause as a claim with the evidence behind it, and review that *before*
   you let it write the fix.
4. Insist on the written note as it goes. That note is what makes the work correct *and*
   resumable — for you or for the agent — if it's put down for a day.

**What the note should capture.** The format doesn't matter — a scratch file, a doc, whatever
you'll actually keep. What matters is that it records the things people usually leave out:

- **The actual mechanism, not the symptom** — *why* it breaks, in a sentence or two.
- **The evidence behind each claim** — a failing test, the exact lines, a spec section, a number
  — so a reader (including future-you) can tell what's established from what's still a guess.
- **What you tried that didn't work, and why it was ruled out.** The most-skipped and
  most-valuable part — it stops you and the agent re-walking dead ends after a break.
- **Enough to resume cold** — current state and the next step.

Keep it short and falsifiable: a note where every line points at evidence is worth more than a
long one that just reads well.

**Examples (landed in Firefox):**
- Playback stalls on some streams turned out to be *two* separate regressions — one component
  requesting data at the wrong timestamp, and an audio sample-rate unit mismatch — each fixed
  with its own test. ([bug 2030127](https://bugzilla.mozilla.org/show_bug.cgi?id=2030127))
- A media file with a duplicate color-metadata box failed to parse, blocking playback. The work
  was deciding whether rejecting it was *correct* or just stricter than the format spec and other
  browsers — once the spec settled that, the fix was tiny.
  ([bug 2044320](https://bugzilla.mozilla.org/show_bug.cgi?id=2044320))

---

## Level 4 — Deep debug / design

**What it is.** Either (a) a bug whose cause is *hidden* — in a different place than where the
symptom shows up, so you can't find it by reading the obvious file — or (b) a modest amount of
code but a genuine **design decision** with trade-offs. (If the work decomposes into a sequence
of interdependent steps, that's no longer one problem — it's Level 5.) This is the level most
people don't realize an agent can reach, and where *how you drive it* matters most.

**What you need.** On top of Level 3:
- **A way to turn behavior into readable evidence** — a log, trace, profile, or any measurement
  you can hand the agent; many L4 causes are invisible without it.
- **A running log of hypotheses** — the L3 note, including the disproven ones.
- **Verification beyond your dev box** — CI, a staging environment, a second OS or runtime, or
  production-like data — wherever conditions differ from where you wrote the code and bugs hide.
- **Independent review** before you trust the result — TL;DR principle 7 (challenge it from
  several independent angles); a fresh agent instance with no context does the job.

**How you drive it.**
1. Demand evidence before theories. Have it capture evidence — a log, trace, or profile — and
   compare against a working case (or a reference implementation): *"Capture this from both the
   broken and the working case and tell me what's different — don't theorize yet."*
2. Push it to phrase findings as claims it could prove wrong, then check them: *"Give me your
   top 2-3 hypotheses, each as 'if this is the cause, we'd see X' — then go check the cheapest
   one first."* Reject conclusions that aren't tied to something observed.
3. Require it to record the hypotheses that *died* in the note, so neither of you re-tests them.
   When one survives the evidence, that's your cause.
4. For a design decision, ask for options, not an answer: *"Give me two or three approaches with
   trade-offs and a recommendation"* — then **make the call yourself**.
5. Have it reviewed adversarially from more than one angle — point *fresh* agent instances at
   the change with prompts like *"find why this is wrong or incomplete"* and *"check this against
   the spec and for missed edge cases"* — and run it across environments. Expect to send the fix
   back when a broader test surfaces something a local run couldn't.

**Examples (landed in Firefox):**
- **A hidden, cross-subsystem cause.** HDR video looked overexposed *only on an external
  display*. Nothing in the rendering code was wrong — the cause was that the decoder never
  attached the mastering-display metadata the OS compositor needs to tone-map, so finding it
  meant reasoning across the decode→OS-compositor handoff. The fix itself was contained to one
  spot. ([bug 2035445](https://bugzilla.mozilla.org/show_bug.cgi?id=2035445))
- **A design call guided by a spec.** A capabilities query gave a misleading answer for
  protected/HDR content — the code short-circuited instead of evaluating it the way the spec
  defines. Fixing it meant restructuring the path to *follow* the spec while deciding how much
  capability detail to expose (a fingerprinting/privacy trade-off) — a design call, not a
  localized patch. ([bug 2030484](https://bugzilla.mozilla.org/show_bug.cgi?id=2030484))

---

## Level 5 — Multi-part program

**What it is.** Work you *can't hold as a single problem*. Unlike L4 — one cause to find, or
one design decision to make — an L5 task is several interdependent sub-problems that have to be
broken apart, sequenced, and kept coherent, each verified on its own. **The defining trait is
that no single pass solves it; you manage a plan.** Note what this is *not* about: duration. An
L5 task often takes longer, but a focused one can be done in a day or two — what makes it L5 is
that it needs decomposition, not that it fills a calendar.

It comes in two flavors, approached very differently.

- **Convergent** — the scope is large but **the path is known**: a design or spec to implement, a
  measured bottleneck to fix, an architecture to build toward. Uncertainty is in the details
  and *shrinks* as you go.
- **Exploratory** — the scope is large *and* **the path is unknown**: you're working against a
  black box (an OS component, a closed system, undocumented failures), so you can't reason your
  way to the answer. You probe, mostly fail, and converge by experiment. A solution isn't even
  guaranteed.

**What you need.** On top of Level 4 — this is where the machinery of *iterating toward a goal*
matters:
- **A fixed definition of the final goal.** Iteration needs a stable target — the end state
  everything converges on. If the goal keeps shifting, neither you nor the agent can tell whether
  a step moved closer.
- **A decomposition of that goal into step-goals**, each with its own success check, ordered by
  dependency. The agent advances by satisfying one step-goal at a time; met in order, they
  *compose* into the final goal. (How to produce this breakdown is the next section.)
- **A way to keep every step green** — build/lint/test per step — so each finished step is solid
  ground for the next, and any step can be a stopping point.
- **A living progress record the agent reads back**: the plan, marked with what's done, what's
  next, and what's been ruled out. This is what lets the agent *iterate* — each pass informed by
  the last instead of starting cold — and what lets the work survive context limits or a break.
- **An isolated workspace** for the long-running branch.
- For exploratory work: **plenty of logging and measurement** and **quick experiments you can
  throw away** — because each round of work aims to *answer one question*, not ship a feature.

**How you drive it.**
1. Make the *first* thing it produces a plan, not code. If your agent has a planning mode, use
   it; otherwise just ask: *"Before any code, give me a dependency-ordered plan where each step
   builds and is independently testable."* Then review and edit that plan before approving work.
2. Sign off on the breakdown — cut steps that are too big, fix the ordering (see the next
   section for what makes a good step).
3. Drive it one step at a time, each through the full loop — don't let it run several steps
   ahead of your checkpoints. For exploratory work, give it one hypothesis to test per cycle
   instead of a feature to build.
4. Keep steering the plan as reality shifts under you; treat it as a living document, not a
   fixed contract.

**Examples (in Firefox):**
- *Convergent:* implementing a web audio-focus specification end-to-end — a long stack of
  dependency-ordered steps that mixed new behavior with real refactors to keep the growing
  system coherent: an inert API skeleton
  ([bug 2039121](https://bugzilla.mozilla.org/show_bug.cgi?id=2039121)) → computing the effective
  session type ([bug 2040508](https://bugzilla.mozilla.org/show_bug.cgi?id=2040508)) → the
  parent-side state machine ([bug 2040798](https://bugzilla.mozilla.org/show_bug.cgi?id=2040798))
  → *extracting that state into its own owner class*
  ([bug 2042938](https://bugzilla.mozilla.org/show_bug.cgi?id=2042938)) and *consolidating the
  scattered audibility tracking* ([bug 2039396](https://bugzilla.mozilla.org/show_bug.cgi?id=2039396))
  → delivering state to web pages
  ([bug 2043451](https://bugzilla.mozilla.org/show_bug.cgi?id=2043451)) → bringing Web Audio and
  Web Speech under the same focus management
  ([bug 2038313](https://bugzilla.mozilla.org/show_bug.cgi?id=2038313)), with more still ongoing.
  Each step shipped green; the refactors kept it from becoming a tangle as features piled on.
- *Exploratory:* making a particular encrypted-playback path work on a closed OS media stack
  with no documented route — progress came from reviving old prototypes, instrumenting heavily,
  and converging through repeated try-and-fail, including a new rendering mode that only an
  experiment revealed was necessary.
  ([bug 1870722](https://bugzilla.mozilla.org/show_bug.cgi?id=1870722))

---

## Decompose — breaking a task into verifiable steps

This is the *Decompose* part of the method, and at the higher levels it's mostly your job as the
driver. You usually won't write the breakdown by hand — you ask the agent for one (*"before any
code, give me a dependency-ordered plan where each step builds and is independently testable"*)
and then judge and steer it. So the skill below isn't "how to decompose by yourself" — it's
**what a good breakdown looks like, so you can recognize a bad one and push the agent to fix it.**
Why it matters: handed a big task whole, the agent has too much to hold at once and no checkpoint
to catch a wrong turn; small steps fix both.

**What a good step looks like** — cut or split any step that misses these:

- **Independently verifiable** — it has its own check ("this test goes green," "this builds").
- **Small enough to reason about in one sitting** — it fits both the agent's working memory and a
  reviewer's.
- **Leaves everything still working** — after the step, the project still builds/lints/tests.
  Any step can be the stopping point, and tracking down a later problem stays sane.
- **Standalone in intent** — a reviewer understands *why* it exists without the whole plan.

**Moves that produce such steps:**

- **Separate discovery from change.** The first step of a hard task isn't code — it's an
  investigation that produces a written plan. Review the plan *before* any code is written.
  You're splitting "solve it" into "figure out how" → "do it," which is where the risk lives.
- **Slice vertically, not horizontally.** Don't build "all the data structures, then all the
  logic, then all the tests." Build a thin working increment end-to-end, then the next: an
  *inert skeleton* (present but does nothing, safe to ship) → the *core logic*, tested alone →
  *wire it through* one hop at a time → *turn it on*. Each step is green and de-risks the next.
- **Diagnostic-logging-first.** For a problem you can't yet explain, make "add instrumentation"
  its own step. Ship it, gather evidence, *then* write the fix as a second step.
- **Spike to delete uncertainty.** When the path is unclear, build a tiny throwaway prototype
  that answers *one* question. Once it's answered, plan the real work like a known-path task.
  The spike's output is information, not code you keep.
- **For mechanical bulk work, slice by module and script the change.** When the difficulty is
  volume rather than thinking, split by directory so each piece builds on its own, and write a
  script to do the transform instead of hand-editing. The check is "it still builds and tests."
- **For exploratory work, decompose into questions, not features.** Each cycle is
  "instrument → one hypothesis → cheapest experiment that could disprove it → record the
  verdict." The plan is a queue of hypotheses ranked by likelihood and cheapness-to-test; a
  cycle that ends in "this path is dead" is a success.

Then refine the agent's draft against the list above — cut steps that are too big, fix the
ordering — and execute one at a time. The plan becomes the living document you both work against,
and many agents have a dedicated planning mode for exactly this.

---

## Verify — trust the check, not the model

Across every level, one habit separates trustworthy AI engineering from plausible-looking
output. **A language model can be confidently wrong. A failing test cannot be talked out of
failing.** So your job is to route as many conclusions as possible through a check that
produces a verdict *independent of the agent that did the work.*

The tools you reach for split into two kinds, and it's worth seeing the difference:

- **Things that help the agent think** — code search, an investigation note, access to the
  spec, a knowledge base. These improve the *input*. They can't catch a confident mistake.
- **Things that judge the result** — a test, a type-check or compile, a benchmark, the
  authoritative definition itself, a reviewer. These are *gates*. They're what let you trust the
  output.

Not all checks are equally strong. Rank them by how independent the verdict is from the work:

1. **Deterministic** (strongest): it runs without error, the test passes, the type-checker or
   linter is clean. Binary, reproducible, unarguable. (A compile is the strongest form, where
   your language has one.)
2. **Empirical:** a benchmark, a timing or memory number, a CI run, a check against a staging or
   production-like environment. Real-world ground truth that needs a little interpretation.
3. **Authority:** the spec, doc, or ticket that defines correct behavior, or the actual current
   source — it *overrides the model's memory* about how things should behave.
4. **Adversarial review:** independent passes (human, or fresh agent instances prompted to
   *refute*) — ideally several, each hunting a different failure mode — that catch
   confident-but-wrong before it ships.
5. **Human approval:** a deliberate stop before anything irreversible or sensitive.

**When no check exists yet — the common case in investigation.** You often can't auto-test a
*cause* before you understand it, and "the explanation sounds right" is exactly the trap. Build
the weakest gate you can instead of trusting prose:
1. **Make it cite the exact lines** that produce the behavior, and read them yourself — not a
   description of the code, the code.
2. **Make it predict something you can observe** if it's right ("then this log line should show
   N"), and check that.
3. **Run the smallest experiment** that would only work if the cause is real — a one-line
   change, a forced value, a targeted log.

A cause that survives all three is trustworthy; one that's only *explained well* is not. As soon
as you understand it, turn it into a real check (a failing test) so it can't regress.

The deeper the task, the larger the share of your conclusions that should have to clear one of
these gates before you believe them — not merely sound convincing.

---

## How deep work fails

Symptoms to catch yourself in — when deep work is going sideways, it usually feels like one of
these:

- **The agent sounds confident but you can't actually check it.** You asked it to fix something
  before the cause was known, so you got plausible, unverifiable output. → Investigate first.
- **You're accepting "looks right."** Nothing has passed or failed — no test, no measurement, no
  reread of the rule. You're trusting prose. → Route it through a check that *can* fail.
- **One huge diff, and no part of it is independently confirmed.** It was one giant step (or one
  sprawling prompt); an early wrong turn has quietly poisoned the rest. → Smaller steps, each green.
- **You're re-trying an idea you already ruled out.** Forty minutes in, re-running a theory that
  died yesterday — because the dead end was never written down. → Record dead ends as you go.
- **You're either grinding carefully through something trivial, or firing fix after fix at
  something that won't budge.** The first is a mechanical job dressed up as investigation (script
  it and verify); the second needs real investigation, not more attempts. → Match the *kind* of
  effort — tooling for scale, investigation for uncertainty.
- **Your up-front plan keeps not surviving contact.** The path was unknown, so the detailed plan
  was fiction. → Don't plan further than you actually know. Spike a small throwaway experiment to
  turn the biggest unknown into a fact, or run hypothesis cycles, *before* writing a detailed
  plan — then extend the plan one verified step at a time as each experiment reveals the next,
  instead of planning blind.
- **The agent gets vague or "loses the thread."** You handed it a whole repo (or too much) and
  buried the signal. → Give it navigation and the relevant slice, not everything.
- **A "quick" task has sprawled and you've lost track of where you were.** You skipped the note
  because it felt too small — then it grew. → Write the note anyway; it's cheap and makes the work
  resumable.

---

## Over to you

It's the same method at every level: **frame** the task by naming its uncertainty and the check
that will settle it, **decompose** anything large into steps you can verify one at a time, and
**verify** every conclusion through something that can fail independently of the agent. Pick one
real task and run it that way; do it on a handful more and it becomes muscle memory — and the
level of work you can hand an agent stops being limited by the model and starts being limited
only by how well you frame, decompose, and verify.

Those are learnable skills, and you already have what you need to start. Good luck — go take on
the problems that used to feel too big.
