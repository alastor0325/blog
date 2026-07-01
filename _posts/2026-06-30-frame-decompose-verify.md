---
date: 2026-06-30 12:00:00
layout: post
title: "Frame, Decompose, Verify: Real Engineering with AI Agents"
subtitle: 'A practical method for taking AI coding agents past "smart autocomplete," into real investigation, refactors, sizable features, and multi-week projects.'
description: 'A practical method (frame the uncertainty, decompose into verifiable steps, and verify through checks that can fail independently of the agent) for taking AI coding agents past autocomplete into real investigation, refactors, features, and multi-week projects.'
image: /assets/img/uploads/frame-decompose-verify.jpg
image_portrait: /assets/img/uploads/frame-decompose-verify-portrait.jpg
optimized_image: /assets/img/uploads/frame-decompose-verify.jpg
category: tech
tags:
  - ai
  - engineering
paginate: false
---

Have you ever handed an AI agent a tricky bug, watched it confidently rewrite half a file, and
gotten back something that looks right, reads right, and is just plain wrong? I have, plenty of
times.

I work on Firefox's media code, and I've been fixing real bugs with an agent for a while now,
from one-line typos to multi-week features. The difference between an agent that saves me a day
and one that wastes my afternoon almost never depends on which model I'm running. It's how I drive
it: how I frame the problem, break it apart, and check the result.

The habits themselves aren't new: write the test, bisect the regression, read the spec instead of
guessing. What's new is applying them to work you didn't write, produced by something fast,
fluent, and confidently wrong in ways your own code rarely is. That re-application is the actual
skill, and it's what the rest of this is about. A better model helps, but the method matters more.

## Difficulty is uncertainty, not size

Start with the one idea that changed how I work: **a task's difficulty has almost nothing to do
with how much code it touches, and everything to do with how much you don't yet know.** It's like a
leak in the house: the patch is a dab of sealant, but you can lose a whole weekend just finding
where the water's getting in. A one-line fix can eat your week if finding *which* line took three
days; a change across hundreds of files is trivial if every edit is obvious. What decides a task for
me isn't the amount of code. It's how much I have to figure out before I can write any of it.

## A quick map of the ladder

I've grouped problems into levels here, but the level itself isn't the point. The point is the
reflex underneath: name the uncertainty first, and let it decide how you work.

| Level | Name | What makes it hard | What it feels like |
|------|------|--------------------|--------------------|
| **L1** | Trivial / mechanical | Nothing to figure out: the change *is* the task | "I already know exactly what to type" |
| **L2** | Localized fix | One clear cause, contained to a file or two | "Once I see it, the fix is obvious" |
| **L3** | Multi-file investigation | Must reason across files, a reference, or a spec before a small change | "The patch is tiny; finding it was the work" |
| **L4** | Deep debug / design | Hypothesis-driven tracing across subsystems, or a real design decision | "I have to form theories and test them" |
| **L5** | Multi-part program | Too big to hold as one problem: many sequenced, independently-checked pieces | "This needs a plan, not a single sitting" |

## The loop you run at every level

Two things make every level work: a loop, and a few agent capabilities. The loop comes first, the
same one every time, just nested for bigger tasks:

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

The one rule I never break: a conclusion doesn't skip VERIFY. A cause backed only by the model's
say-so is a guess, so I back it with something I can point to, a test, a profile, a spec line. When
none of those fit (races, hardware paths), fall back to the strongest check you *can* run, never to
the prose.

## Before we start: get your agent ready

Before we climb, your agent needs a few things in place. Think of them as *roles*, not specific
products, so fill each with whatever your setup gives you, and honestly, several are probably built
in already. For each: check you have it, add it if you don't, and confirm it works.

- **Search and read your real code**, so fixes are grounded in reality, not guesses. You have it
  when it quotes real lines back, not a vague description.
- **The ability to run your build and tests**, your main gate: the agent has to prove its own work
  passes.
- **Reach the source of truth** (a spec, standard, or doc), so "correct" is settled against that,
  not the model's memory. Check it can quote the section, not paraphrase it.
- **Turn behavior into something it can read**, a log, trace, or profile dumped to text. An agent
  can only reason over what it can actually read.
- **An isolated workspace** per task, so long-running or parallel work doesn't trample your main
  tree.
- **A note** per task, so the reasoning survives across sessions (what goes in it is at Level 3).
- **A knowledge base**, a long-lived store for what you worked out once, both how the system
  behaves and how you do recurring things. It compounds as you keep returning to the same code.

You won't need all of these every time; each level below says what it adds on top of the ones
below it.

## Level 1: Trivial / mechanical

**What it is.** Nothing to investigate. The change is fully specified by the request itself; you
already know exactly what to type.

**What you need.** Almost nothing:
- **A way to locate the spot:** code search, or just knowing where it lives.
- **Your normal check pipeline:** the build/lint/test you already run on any change.

**How you drive it.** Don't let "tiny" be an excuse to skip your process. Run it through the same
pipeline with a clean commit, and confirm it passed before you accept it. The discipline is what
matters at this level, however small the change.

**Examples.** Version bumps, dead-code removal, a typo fix across a few files.

## Level 2: Localized fix

**What it is.** A real bug, but the kind where, once you see it, the fix is one or two files. The
most common bug you'll fix.

**What you need.** On top of Level 1:
- **Code search the agent itself uses:** to read and reason about the surrounding code, not just
  locate the line.
- **A reproduction:** ideally a failing test that goes green once the fix lands.

**How you drive it.**
1. Ask for the failing test first: *"write a test that reproduces this and confirm it fails."*
2. Then *"find the cause and show me the exact code that produces it, don't fix it yet"* ("show me
   the code" beats "fix this").
3. Check the cause yourself (see *Verify* below), not one that just reads convincingly, then let
   it fix, run the test and build, and commit.

**Examples (landed in Firefox):**
- A negated condition kept a media element from restyling correctly.
  ([bug 2035986](https://bugzilla.mozilla.org/show_bug.cgi?id=2035986))
- Playback only started after a manual seek because a timestamp field was read with the wrong sign.
  ([bug 2026875](https://bugzilla.mozilla.org/show_bug.cgi?id=2026875))

## Level 3: Multi-file investigation

**What it is.** The change is still small, but you can't write it until you've reasoned across
several files, a definition of correct behavior, or how some other system behaves. The
investigation is the hard part; the patch itself can be a line.

**What you need.** On top of Level 2:
- **A definition of correct behavior:** a spec, doc, or whoever owns the intent, to settle "is this
  actually wrong, or just not what I assumed?"
- **Something to compare against** when it exists: another system that solves the same problem, or
  a known-good prior version.
- **A way to search version history:** to pin a regression to the change that introduced it.
- **A written note** (what goes in it, below).

**How you drive it.**
1. If it's a regression, have it bisect to the introducing commit: *"here's a command that exits 0
   when good and 1 when broken; bisect to the commit that introduced it."* If you're building
   something new, have it map the files the change must touch first.
2. Make it read the code *and* the source of truth, and write up what it finds.
3. Have it state the cause as a claim with the evidence attached, and review that before you let it
   write the fix.

**What the note should capture** (short and falsifiable beats long and tidy):
- The actual mechanism, not the symptom.
- The evidence behind each claim, so you can tell what's nailed down from what's still a guess.
- **What you tried that didn't work, and why** (the most-skipped, most-valuable part, it stops you
  re-walking dead ends).
- Where it stands right now and what the next step is, so you (or the agent) can resume after a
  break without re-deriving everything.

**Examples (landed in Firefox):**
- **Reasoning across files.** MSE playback stalled on some streams, and what looked like one bug
  was really two independent regressions in different parts of the pipeline: one component asking
  for data at the wrong timestamp, and an audio sample-rate unit mismatch. Teasing the two apart
  was the work; each fix was small and shipped with its own test.
  ([bug 2030127](https://bugzilla.mozilla.org/show_bug.cgi?id=2030127))
- **A spec-versus-stricter call.** A file with a duplicate color-metadata box wouldn't parse. The
  real work wasn't the fix, it was deciding whether rejecting it was *correct* or just stricter
  than the spec; once the spec settled that, the change was tiny.
  ([bug 2044320](https://bugzilla.mozilla.org/show_bug.cgi?id=2044320))

## Level 4: Deep debug / design

**What it is.** People expect an agent *can* reach this level; the hard part is doing it
consistently, without the quality slipping below the bar or the work eating your whole afternoon.
It's where how you drive it matters most. Two shapes: (a) the cause is *hidden*, sitting somewhere
other than the symptom, so reading the obvious file gets you nowhere; or (b) there's little code
but a real design decision with trade-offs.

**What you need.** On top of Level 3:
- **Observability the agent can capture and read:** it can run a profiler, switch on logging, or
  dump a trace, and get the result back as text. A hidden cause stays invisible until you can
  *measure* it, not just read the code.
- **A quick way to get oriented in an unfamiliar subsystem:** who owns what, what runs on which
  thread, before it starts theorizing. This is where accumulated notes about the system pay off.
- **A way to reproduce the conditions where the bug hides:** often another OS, device, or
  production-like setup, since these causes rarely live on your clean dev box.
- **An adversarial review pass:** a fresh, independent reviewer (a person, or a fresh agent
  instance with no context) before you trust the result.

**How you drive it.**
1. Evidence before theories: *"capture a log or profile of the broken and the working case and tell
   me what's different, don't theorize yet."*
2. Make it phrase findings as claims it could prove wrong, check the cheapest first, and record the
   ones that die.
3. For a design call, ask for two or three options with trade-offs, and make the call yourself.
4. Point a fresh agent instance at the change (*"find why this is wrong or incomplete"*) and run it
   across environments; expect to send it back when a broader test catches what your local run
   didn't.

**Examples (landed in Firefox):**
- **A hidden cause you can't reproduce locally (shape a).** On Windows, HDR video on a streaming
  site rendered almost black, and I couldn't reproduce it on any machine I had. With no repro to
  poke at, the cause had to come from the reporter's evidence and the spec: the container's color
  information was never parsed, several layers from where the picture went dark. Finding it was the
  whole battle. ([bug 2030296](https://bugzilla.mozilla.org/show_bug.cgi?id=2030296))
- **A design call guided by a spec (shape b).** A capabilities query short-circuited instead of
  evaluating content the way the spec defines. Fixing it was a decision, not a patch: restructure
  the path to follow the spec, and weigh how much detail to expose (a fingerprinting trade-off).
  ([bug 2030484](https://bugzilla.mozilla.org/show_bug.cgi?id=2030484))

## Level 5: Multi-part program

**What it is.** Work you can't hold as one problem: several interdependent pieces, sequenced and
kept coherent, each verified on its own. No single pass solves it, you manage a plan. A focused one
can still be done in a day; what makes it Level 5 is that it needs decomposition. Two flavors:
**convergent**, where the path is known (a spec to implement, a bottleneck to fix) and uncertainty
shrinks as you go; and **exploratory**, where the path is unknown, a black box you can only probe,
mostly failing and converging by experiment, with no guarantee a solution even exists.

**What you need.** On top of Level 4:
- **A living plan the agent reads back and updates:** the goal broken into ordered, checkable
  step-goals, marked done / next / ruled out. Keeping this outside the agent's context is what lets
  the run survive a reset or a handoff, so it doesn't hinge on what the agent still remembers.
- **A way to keep every step green, including the earlier ones:** a green step is your checkpoint,
  it confirms each piece is right and hasn't broken what came before, so a mistake surfaces in that
  step, before three more get stacked on top of it.
- **A way to verify the whole goal, not just each step:** green steps prove each piece works.
  Whether the program actually hit its goal is a separate question, and it needs a stable
  end-to-end measure: a benchmark, telemetry, or a conformance test.
- **Stop points, not just a finish line:** conditions where the agent stops and briefs you when a
  step fails, an experiment comes back negative, or it's poured enough into a dead end.
- **A long-lived workspace that survives a moving codebase:** a branch you can keep rebased as the
  mainline shifts under a multi-day effort.
- **For exploratory work, cheap throwaway experiments:** a scratch build or spike to answer one
  question, since each cycle is a probe you expect to throw away.

**How you drive it.**
1. The first output is a plan, not code: *"before any code, a dependency-ordered plan where each
   step builds and is independently testable."* Review and edit it.
2. Run one step at a time through the loop; don't let it run ahead of your checkpoints.
3. For exploratory work, give it one hypothesis to test per cycle.
4. Keep steering the plan as reality shifts; it's a living document, not a contract.

**Examples (in Firefox):**
- *Convergent:* a web audio-focus spec implemented end-to-end as a stack that mixed new behavior
  with refactors, a skeleton ([bug 2039121](https://bugzilla.mozilla.org/show_bug.cgi?id=2039121))
  → effective-type computation
  ([bug 2040508](https://bugzilla.mozilla.org/show_bug.cgi?id=2040508)) → the state machine
  ([bug 2040798](https://bugzilla.mozilla.org/show_bug.cgi?id=2040798)) → *extracting it into its
  own class* ([bug 2042938](https://bugzilla.mozilla.org/show_bug.cgi?id=2042938)) and
  *consolidating audibility tracking*
  ([bug 2039396](https://bugzilla.mozilla.org/show_bug.cgi?id=2039396)) → delivering state to pages
  ([bug 2043451](https://bugzilla.mozilla.org/show_bug.cgi?id=2043451)) → Web Audio and Web Speech
  under the same management
  ([bug 2038313](https://bugzilla.mozilla.org/show_bug.cgi?id=2038313)), still ongoing and green at
  every step.
- *Exploratory:* getting an encrypted-playback path working on a closed OS media stack with no
  documented route, by reviving old prototypes, instrumenting heavily, and converging through
  try-and-fail. ([bug 1870722](https://bugzilla.mozilla.org/show_bug.cgi?id=1870722))

## Decompose: breaking a task into verifiable steps

Decomposition is the heart of the higher levels, and it's mostly on you; the agent won't do it well
on its own. You won't write the breakdown by hand, though; you'll ask for one and steer it. So I'm
not going to teach you to decompose from scratch. What you need is an eye for a good breakdown,
enough to spot a bad one and push the agent to fix it.

A good step is:
- **Independently verifiable:** it has its own check.
- **Small enough to reason about in one sitting:** it fits both the agent's working memory and a
  reviewer's.
- **Safe to stop on:** the project still builds and passes after it.
- **Standalone:** a reviewer can see why it exists without the whole plan.

If a step misses any of these, split it. A handful of moves reliably produce good ones:
- **Separate discovery from change.** The first step is an investigation that produces a plan you
  review before any code.
- **Build thin end-to-end slices, not whole layers at once.** Rather than finishing all the data
  structures, then all the logic, then all the tests, ship one thin thing that works front to back,
  then the next: a do-nothing skeleton → core logic tested alone → wire it through one hop at a
  time → turn it on, each step green.
- **Log first, fix second.** For a problem you can't yet explain, ship the instrumentation as its
  own step, then write the fix.
- **For exploratory work, decompose into questions, not features:** instrument → one hypothesis →
  cheapest experiment that could disprove it → record the verdict. "This path is dead" still counts
  as a win.

Then refine the agent's draft against all this: cut the oversized steps, fix the ordering, and run
one at a time.

## Verify: trust the check, not the model

Here's the thing I keep coming back to: the model will tell you it's sure, and sometimes it's flat
wrong, the way a confident student can be. You don't grade the student on how sure they sound, you
check the answer against the key. So I try to route as many conclusions as I can through a check
whose verdict is independent of the agent that did the work.

The tools you reach for split in two:
- **Things that help it *think*:** code search, the note, the spec, the knowledge base. They
  improve the *input*, but they can't catch a confident mistake.
- **Things that *judge the result*:** a test, a compile, a benchmark, the spec, a reviewer. These
  are the gates that let you trust the output.

Not every gate is equally strong. Ranked by how independent the verdict is from the work:
1. **Deterministic** (strongest): it compiles, the test passes.
2. **Measured:** a benchmark, a CI run, a staging check.
3. **Authority:** the spec or the current source, overriding the model's memory.
4. **Adversarial review:** fresh instances asked to refute, ideally several.
5. **Human approval:** before anything irreversible.

And when no check exists yet? Manufacture the weakest gate you can:
- Make it **cite the exact lines**, and read them yourself.
- Make it **predict something observable**, and check that.
- Run the **smallest experiment** that only works if the cause is real.

The moment you understand it, turn it into a real test so it can't come back.

## When it's going sideways

Here are the signs I've learned to catch early, the moments where work is quietly going wrong, and
the move out of each:

- **It sounds confident but you can't check it.** You asked for a fix before the cause was known.
  Investigate first.
- **You're accepting "looks right."** Nothing has passed or failed. Route it through a check that
  *can* fail.
- **One huge diff, none of it confirmed.** An early wrong turn quietly poisoned the rest. Take
  smaller steps, each green.
- **You're re-trying an idea you already ruled out**, because the dead end was never written down.
  Record dead ends as you go.
- **The effort doesn't fit the task**, either grinding through something trivial or firing fix after
  fix at something that needs real investigation. Match it: tooling for scale, investigation for
  uncertainty.
- **Your up-front plan keeps falling apart the moment you start.** The path was unknown, so the
  plan was fiction. Spike the biggest unknown into a fact, then extend the plan one verified step
  at a time.
- **The agent goes vague or loses the thread.** You buried the signal in too much context. Give it
  navigation and the relevant slice, not everything.
- **A "quick" task has sprawled and you're lost.** You skipped the note. Write it anyway; it's
  cheap and makes the work resumable.

## Over to you

Same method at every level: **frame** the uncertainty and the check that settles it, **decompose**
anything large into steps you can verify one at a time, and **verify** every conclusion through
something that can fail without the agent's help. Pick one real task and run it this way; after a
handful it turns into muscle memory, and the work you can hand an agent stops being limited by the
model and starts being limited only by how well you frame, decompose, and verify.

Those are learnable skills, and you already have what you need to start. Good luck, and thanks for
reading.
