// Per-girl arc step lists (good path / bad path) for the Story tab.
// Pure data — no engine. The engine that drives stats lives in
// dialogueState.ts and friendshipEngine.ts.

export interface ArcStep { title: string; body: string; }
export interface GirlfriendArc {
  id: string;
  goodSteps: ArcStep[];
  badSteps: ArcStep[];
}

export const GIRLFRIEND_ARCS: GirlfriendArc[] = [
  { id: "pinky",
    goodSteps: [
      { title: "Step 1 — Pause", body: "Selim stops sending 6 messages in a row." },
      { title: "Step 2 — Clarity", body: "Asks Pinky one direct question. Accepts the answer." },
      { title: "Step 3 — Walk", body: "Walks away from breadcrumbs. Self-respect levels up." },
    ],
    badSteps: [
      { title: "Step 1 — Recharge", body: "Selim sends recharge to feel useful." },
      { title: "Step 2 — Beg-text", body: "Long voice notes at 2am." },
      { title: "Step 3 — Crash", body: "Rent money gone, Pinky still 'maybe'." },
    ]},
  { id: "sadia", goodSteps: [
      { title: "Step 1 — Normal", body: "Drinks cha, says hi, leaves." },
      { title: "Step 2 — Friendly", body: "Treats her like the other regulars." },
      { title: "Step 3 — Calm", body: "Romantic Fever drops, Mood up." },
    ], badSteps: [
      { title: "Step 1 — Detour", body: "Goes 3 days in a row hoping for a sign." },
      { title: "Step 2 — Treat", body: "Spends extra to seem cool." },
      { title: "Step 3 — Awkward", body: "She notices. Tea stall feels weird now." },
    ]},
  { id: "tania", goodSteps: [
      { title: "Step 1 — Hear", body: "Hears the boundary the first time." },
      { title: "Step 2 — Apology", body: "Brief, dignified, no excuses." },
      { title: "Step 3 — Distance", body: "Healthy distance. Reputation safe." },
    ], badSteps: [
      { title: "Step 1 — One more", body: "'One more try' message." },
      { title: "Step 2 — Crowd talk", body: "Friends notice. Whispers start." },
      { title: "Step 3 — Cost", body: "Reputation Risk +. Self-respect crash." },
    ]},
  { id: "sumaiya", goodSteps: [
      { title: "Step 1 — Direct", body: "Asks one clear question." },
      { title: "Step 2 — Accept", body: "Accepts the answer either way." },
      { title: "Step 3 — Move on", body: "Mood stable, Delusion drops." },
    ], badSteps: [
      { title: "Step 1 — Decode", body: "Decodes every emoji for hours." },
      { title: "Step 2 — Castle", body: "Builds a wedding plan from one '🙂'." },
      { title: "Step 3 — Crash", body: "Attachment crash, weeks of recovery." },
    ]},
  { id: "nila", goodSteps: [
      { title: "Step 1 — Listen", body: "Selim actually listens, no defense." },
      { title: "Step 2 — Apply", body: "Acts on one piece of her advice." },
      { title: "Step 3 — Grow", body: "IQ + Friend Trust both up." },
    ], badSteps: [
      { title: "Step 1 — Label", body: "Calls her 'jealous' to dodge truth." },
      { title: "Step 2 — Repeat", body: "Repeats the same Pinky mistake." },
      { title: "Step 3 — Lonely", body: "Loses the one honest mirror in his life." },
    ]},
  { id: "farzana", goodSteps: [
      { title: "Step 1 — Open", body: "Opens the job link without overthinking." },
      { title: "Step 2 — Apply", body: "Applies. Career +." },
      { title: "Step 3 — Read", body: "Actually reads the book she suggested." },
    ], badSteps: [
      { title: "Step 1 — Misread", body: "Reads 'attention' instead of 'opportunity'." },
      { title: "Step 2 — Confess", body: "Awkward confession in the wrong context." },
      { title: "Step 3 — Lost", body: "Loses both the mentor and the chance." },
    ]},
  { id: "jannat", goodSteps: [
      { title: "Step 1 — Receive", body: "Accepts kindness as kindness." },
      { title: "Step 2 — Return", body: "Returns it without expecting more." },
      { title: "Step 3 — Mood", body: "Mood stays calm, no agenda." },
    ], badSteps: [
      { title: "Step 1 — Misread", body: "Reads warmth as a quiet 'yes'." },
      { title: "Step 2 — Push", body: "Pushes for closeness she didn't offer." },
      { title: "Step 3 — Awkward", body: "Friendly door politely closes." },
    ]},
  { id: "mitu", goodSteps: [
      { title: "Step 1 — Limit", body: "Selim says: 'Ei ekta time, then no.'" },
      { title: "Step 2 — Hold", body: "Holds the limit even when she pouts." },
      { title: "Step 3 — Self", body: "Self-respect + Money both up." },
    ], badSteps: [
      { title: "Step 1 — Yes", body: "Says yes to every 'small' favor." },
      { title: "Step 2 — Drain", body: "Money + energy drain." },
      { title: "Step 3 — Vanish", body: "She vanishes when there's nothing left." },
    ]},
  { id: "tabin", goodSteps: [
      { title: "Step 1 — Honest", body: "Honest with himself first." },
      { title: "Step 2 — Respect", body: "Treats Tabin's feelings with care." },
      { title: "Step 3 — Friend", body: "A real, calm friendship survives." },
    ], badSteps: [
      { title: "Step 1 — Deflect", body: "Mocks it to look 'normal'." },
      { title: "Step 2 — Use", body: "Uses Tabin emotionally between crushes." },
      { title: "Step 3 — Hurt", body: "Hurts a friend who deserved honesty." },
    ]},
  { id: "ritu", goodSteps: [
      { title: "Step 1 — Confess", body: "Selim says the brave line out loud, no rehearsal." },
      { title: "Step 2 — Steady", body: "Holds Ritu's gaze, holds the candle steady." },
      { title: "Step 3 — Real", body: "A real moment, no performance. Mood + Self-respect up." },
    ], badSteps: [
      { title: "Step 1 — Overplan", body: "Roses, fairy lights, candles — wallet drained pre-date." },
      { title: "Step 2 — Tip", body: "Candle tips at the almost-kiss. Smoke, not romance." },
      { title: "Step 3 — Escape", body: "Fire-hazard escape down the stairs. Ritu laughs, Selim doesn't." },
    ]},
  { id: "asha", goodSteps: [
      { title: "Step 1 — Pause", body: "Notices what's happening, steps back." },
      { title: "Step 2 — Refer", body: "Suggests a real friend or counselor." },
      { title: "Step 3 — Dignity", body: "Both walk away with dignity intact." },
    ], badSteps: [
      { title: "Step 1 — Cross", body: "Crosses a line he can't unsee." },
      { title: "Step 2 — Secret", body: "Becomes someone's secret." },
      { title: "Step 3 — Crash", body: "Reputation, shame, long regret arc." },
    ]},
];

export function getArcFor(id: string): GirlfriendArc | undefined {
  return GIRLFRIEND_ARCS.find((a) => a.id === id);
}
