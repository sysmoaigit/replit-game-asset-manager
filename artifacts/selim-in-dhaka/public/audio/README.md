# Audio Assets — Selim in Dhaka: Pinky Mission

Drop MP3 files into the correct subfolder. The game will pick them up automatically.
All files are **optional** — missing files log a single warning, show subtitles, and play a beep fallback for essential SFX. Nothing crashes.

## Currently Shipped

**Selim voice lines (32 MP3s, AI-generated via OpenAI `gpt-audio` with the `ash` voice)** — covering every major game moment: morning greetings, Pinky recharge/messages/refusals, heartbreak, emotional override, self-respect/obey, promises made and broken, best-friend moments, recovery, career, food, money, day endings, new crush, Bogura nostalgia, achievements, and good/bad endings.

**SFX, music, and ambience are mostly procedural** as of the Task #8 sound overhaul, with a starter set of real MP3s shipped in Task #15:

- `sfx/`: `card_flip`, `coin_gain`, `coin_loss`, `heartbreak`
- `music/`: `menu`, `day_dhaka`, `night_dhaka`, `heartbreak`
- `ambience/`: `street`, `rickshaw`

These ids are registered in `SHIPPED_*_FILES` in `src/game/soundEvents.ts` so the engine prefers the MP3 and falls back to the procedural synth if loading fails. Every other id (UI clicks, stings, location beds) is still synthesized live in `src/audio/sounds.ts` via the Web Audio API.

The shipped MP3s are generated procedurally in pure Node by `scripts/src/generate_audio_assets.ts` (run with `pnpm --filter @workspace/scripts run gen:audio`), then transcoded to MP3 with the system `ffmpeg`. They're copyright-clean and tiny (a few hundred KB total). To swap in better recorded assets later, drop the MP3 into the matching subfolder using the same id; no code change is required if the id is already in `SHIPPED_*_FILES`.

## Folder Structure

```
public/audio/
├── voice/
│   ├── selim/          ← Selim's voice lines (Light Bogura accent preferred)
│   ├── pinky/          ← Pinky's lines
│   ├── rafiq/          ← Rafiq (mess buddy)
│   ├── nila/           ← Nila (office friend)
│   ├── cha-mama/       ← Cha Mama (tea stall uncle)
│   └── kuddus-bhai/    ← Kuddus Bhai (landlord)
├── sfx/                ← Short sound effects
├── music/              ← Background music loops
└── ambience/           ← Location ambience loops
```

## Naming Convention

### Voice Lines — `voice/<speaker>/<lineId>.mp3`
Examples:
- `voice/selim/s_greet_morning_01.mp3`
- `voice/selim/s_pinky_recharge_refuse_01.mp3`
- `voice/pinky/p_hmm_01.mp3`

### SFX — `sfx/<id>.mp3`
| File | Description |
|------|-------------|
| `sfx/ui_click.mp3` | Button tap |
| `sfx/card_flip.mp3` | Card transition |
| `sfx/stat_up.mp3` | Stat increased |
| `sfx/stat_down.mp3` | Stat decreased |
| `sfx/achievement_unlock.mp3` | Achievement pop |
| `sfx/coin_gain.mp3` | Money gained |
| `sfx/coin_loss.mp3` | Money lost |
| `sfx/heartbreak.mp3` | Heartbreak / override |
| `sfx/love_chime.mp3` | Love card appears |
| `sfx/day_summary.mp3` | Day ends |
| `sfx/recovery_start.mp3` | Crisis begins |
| `sfx/emotional_override_alarm.mp3` | Selim ignores advice |
| `sfx/promise_made.mp3` | Promise created |
| `sfx/promise_broken.mp3` | Promise broken |
| `sfx/best_friend_chime.mp3` | Best friend moment |
| `sfx/ending_victory.mp3` | Good ending fanfare |
| `sfx/ending_defeat.mp3` | Bad ending |
| `sfx/rickshaw_bell.mp3` | Rickshaw ambience |
| `sfx/car_horn.mp3` | Traffic ambience |
| `sfx/tea_stall.mp3` | Cha stall kettle |
| `sfx/azan.mp3` | Evening azan |

### Music Loops — `music/<id>.mp3`
| File | When it plays |
|------|---------------|
| `music/menu.mp3` | Start screen & tutorial |
| `music/day_dhaka.mp3` | Normal day gameplay |
| `music/night_dhaka.mp3` | Night phase |
| `music/pinky_mission.mp3` | Pinky love cards |
| `music/heartbreak.mp3` | Emotional override / sad |
| `music/recovery.mp3` | Crisis recovery mode |
| `music/bogura_boss.mp3` | Career/self-respect peak |
| `music/best_friend.mp3` | High friend trust |
| `music/ending_good.mp3` | Good endings |
| `music/ending_bad.mp3` | Bad endings |

### Ambience Loops — `ambience/<id>.mp3`
| File | Location |
|------|----------|
| `ambience/station.mp3` | Kamalapur station |
| `ambience/bus_stand.mp3` | Bus stand |
| `ambience/mess_bari.mp3` | Mess / room |
| `ambience/cha_stall.mp3` | Tea stall |
| `ambience/food_lane.mp3` | Old Dhaka food lane |
| `ambience/lake.mp3` | Dhanmondi lake |
| `ambience/market.mp3` | Market / bazaar |
| `ambience/office.mp3` | Office environment |
| `ambience/rooftop.mp3` | Rooftop night |
| `ambience/clinic.mp3` | Hospital / clinic |
| `ambience/bogura_memory.mp3` | Nostalgic Bogura memory |

## Recording Tips for Selim's Voice

Selim is from Bogura — his Bengali has a warm north-Bengal flavor:
- Light accent: mostly standard Dhaka Bengali with occasional Bogura vowel stretches
- Say "ভাই" warmly, stretch "আ" sounds slightly
- Speak at a medium-relaxed pace
- Keep files under 5 seconds each for voice lines
- Record at 44.1 kHz, export as 128 kbps MP3

## Selim Line IDs (drop in `voice/selim/<id>.mp3`)

See `src/game/voiceLines.ts` for the full catalog with text and moods.
