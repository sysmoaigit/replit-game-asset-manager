export type GameTrigger =
  | "game_start"
  | "ask_advice"
  | "obey"
  | "half_obey"
  | "override"
  | "pinky_message"
  | "recharge"
  | "recharge_refuse"
  | "heartbreak"
  | "new_crush"
  | "promise_made"
  | "promise_broken"
  | "money_gain"
  | "money_loss"
  | "trust_up"
  | "trust_down"
  | "silent"
  | "anger"
  | "apology"
  | "best_friend"
  | "recovery_start"
  | "recovery_complete"
  | "day_start"
  | "day_end"
  | "achievement"
  | "card_flip"
  | "ending_good"
  | "ending_bad"
  | "bogura_memory"
  | "career_up"
  | "food_biryani";

export type LocationId =
  | "station"
  | "bus_stand"
  | "mess_bari"
  | "cha_stall"
  | "food_lane"
  | "lake"
  | "market"
  | "office"
  | "rooftop"
  | "clinic"
  | "bogura_memory"
  | "street"
  | "rickshaw";

export type SoundEvent = {
  sfx?: string;
  voice?: string;
  music?: string;
  ambience?: string;
  voiceTrigger?: string;
};

export const TRIGGER_EVENTS: Record<GameTrigger, SoundEvent> = {
  game_start:        { sfx: "card_flip",               music: "menu",        voiceTrigger: "game_start" },
  ask_advice:        {                                                          voiceTrigger: "ask_advice" },
  obey:              { sfx: "stat_up",                                         voiceTrigger: "obey" },
  half_obey:         {                                                          voiceTrigger: "half_obey" },
  override:          { sfx: "emotional_override_alarm",                        voiceTrigger: "override" },
  pinky_message:     { sfx: "ui_click",                music: "pinky_mission", voiceTrigger: "pinky_message" },
  recharge:          { sfx: "coin_loss",                                       voiceTrigger: "recharge" },
  recharge_refuse:   { sfx: "stat_up",                                         voiceTrigger: "recharge_refuse" },
  heartbreak:        { sfx: "heartbreak",              music: "heartbreak",    voiceTrigger: "heartbreak" },
  new_crush:         { sfx: "love_chime",                                      voiceTrigger: "new_crush" },
  promise_made:      { sfx: "promise_made",                                    voiceTrigger: "promise_made" },
  promise_broken:    { sfx: "promise_broken",                                  voiceTrigger: "promise_broken" },
  money_gain:        { sfx: "coin_gain" },
  money_loss:        { sfx: "coin_loss" },
  trust_up:          { sfx: "stat_up",                                         voiceTrigger: "trust_up" },
  trust_down:        { sfx: "stat_down",                                       voiceTrigger: "trust_down" },
  silent:            {                                                          voiceTrigger: "silent" },
  anger:             {                                                          voiceTrigger: "anger" },
  apology:           {                                                          voiceTrigger: "apology" },
  best_friend:       { sfx: "best_friend_chime",       music: "best_friend",   voiceTrigger: "best_friend" },
  recovery_start:    { sfx: "recovery_start",          music: "recovery",      voiceTrigger: "recovery" },
  recovery_complete: { sfx: "achievement_unlock",      music: "day_dhaka" },
  day_start:         { sfx: "card_flip" },
  day_end:           { sfx: "day_summary",                                     voiceTrigger: "day_end" },
  achievement:       { sfx: "achievement_unlock",                               voiceTrigger: "achievement" },
  card_flip:         { sfx: "card_flip" },
  ending_good:       { sfx: "ending_victory",          music: "ending_good",   voiceTrigger: "ending_good" },
  ending_bad:        { sfx: "ending_defeat",           music: "ending_bad",    voiceTrigger: "ending_bad" },
  bogura_memory:     {                                 ambience: "bogura_memory", voiceTrigger: "bogura_memory" },
  career_up:         { sfx: "stat_up",                                         voiceTrigger: "career" },
  food_biryani:      { sfx: "tea_stall",                                       voiceTrigger: "food" },
};

export const LOCATION_AMBIENCE: Record<string, LocationId | null> = {
  "কমলা-পুর স্টেশন":   "station",
  "বাস স্ট্যান্ড":       "bus_stand",
  "বাস":                  "bus_stand",
  "মেস বাড়ি":           "mess_bari",
  "চা স্টল":             "cha_stall",
  "পুরান ঢাকা গলি":     "food_lane",
  "ধানমন্ডি লেক":       "lake",
  "বাজার":               "market",
  "অফিস":               "office",
  "ছাদ":                 "rooftop",
  "ক্লিনিক":            "clinic",
  "রাস্তা":              "street",
  "রিকশা":              "rickshaw",
  "রাস্তার দোকান":      "food_lane",
  "Gloria Jean":         "cha_stall",
};

export function getLocationAmbience(location: string): LocationId | null {
  for (const [key, loc] of Object.entries(LOCATION_AMBIENCE)) {
    if (location.includes(key)) return loc;
  }
  return null;
}

export const MUSIC_FOR_CARD_CATEGORY: Record<string, string> = {
  love:     "pinky_mission",
  addiction: "heartbreak",
};

/**
 * Manifest entries that currently SHIP as MP3 files under public/audio/.
 * The entire SFX/music/ambience layer is procedural today (Task #8),
 * so these registries are empty. Task #15 will add real assets — at
 * which point listing an id here makes AudioEngine prefer the MP3 over
 * the procedural synth/bed for that id.
 */
export const SHIPPED_SFX_FILES = new Set<string>([
  "card_flip", "coin_gain", "coin_loss", "heartbreak",
]);
export const SHIPPED_MUSIC_FILES = new Set<string>([
  "menu", "day_dhaka", "night_dhaka", "heartbreak",
]);
export const SHIPPED_AMBIENCE_FILES = new Set<string>([
  "street", "rickshaw",
]);

/**
 * Voice line ids that ship as MP3 files under public/audio/voice/{speaker}/.
 * Format entries as "{speaker}/{lineId}" so the audio engine can do an O(1)
 * check before attempting a network fetch. Lines NOT listed here will skip
 * the MP3 fetch entirely (no console warning) and play their procedural
 * non-verbal blip + subtitle instead.
 *
 * Keep this in sync with the actual files on disk.
 */
export const SHIPPED_VOICE_FILES = new Set<string>([
  "selim/s_achievement_01",
  "selim/s_bestfriend_01",
  "selim/s_bestfriend_03",
  "selim/s_bogura_01",
  "selim/s_career_01",
  "selim/s_day_end_01",
  "selim/s_day_end_02",
  "selim/s_ending_bad_02",
  "selim/s_ending_good_02",
  "selim/s_food_01",
  "selim/s_greet_morning_01",
  "selim/s_greet_morning_02",
  "selim/s_greet_morning_03",
  "selim/s_heartbreak_01",
  "selim/s_heartbreak_04",
  "selim/s_heartbreak_07",
  "selim/s_money_01",
  "selim/s_new_crush_01",
  "selim/s_obey_01",
  "selim/s_obey_05",
  "selim/s_override_01",
  "selim/s_override_02",
  "selim/s_pinky_msg_01",
  "selim/s_pinky_msg_05",
  "selim/s_pinky_recharge_01",
  "selim/s_pinky_recharge_03",
  "selim/s_pinky_recharge_07",
  "selim/s_pinky_refuse_01",
  "selim/s_pinky_refuse_03",
  "selim/s_promise_broken_01",
  "selim/s_promise_made_01",
  "selim/s_recovery_02",
  // Task #24 — voice lines for new gameplay cards
  "selim/s_money_ask_rafiq_01",
  "selim/s_money_ask_rafiq_02",
  "selim/s_caught_lying_01",
  "selim/s_caught_lying_02",
  "selim/s_apology_after_lie_01",
  "selim/s_apology_after_lie_02",
  "selim/s_fake_girl_inbox_01",
  "selim/s_fake_girl_inbox_02",
  "selim/s_fake_girl_money_01",
  "selim/s_fake_girl_money_02",
  "selim/s_fake_girl_reveal_01",
  "selim/s_fake_girl_reveal_02",
  "selim/s_touba_start_01",
  "selim/s_touba_start_02",
  "selim/s_touba_day3_01",
  "selim/s_touba_day3_02",
  "selim/s_touba_notif_01",
  "selim/s_touba_excuse_01",
  "selim/s_touba_excuse_02",
  "selim/s_touba_record_01",
  "selim/s_touba_record_02",
]);

/**
 * SFX ids that have a guaranteed procedural fallback in src/audio/sounds.ts.
 * AudioEngine consults this set to route straight to the procedural synth
 * when no MP3 ships under public/audio/sfx/, and as a last-resort beep
 * trigger if the synth router somehow refuses an id.
 *
 * Keep in sync with DhakaSoundEngine.playSfxById.
 */
export const ESSENTIAL_SFX = new Set([
  // UI palette (Task #8 — refreshed)
  "ui_click", "ui_hover", "ui_toggle", "ui_toggle_off", "ui_back",
  "ui_confirm", "ui_error",
  // Card flow
  "card_flip", "sparkle_lucky", "cameo_sting",
  // Stats / economy
  "stat_up", "stat_down", "coin_gain", "coin_loss",
  // Story beats
  "heartbreak", "love_chime", "promise_made", "promise_broken",
  "best_friend_chime", "recovery_start", "achievement_unlock",
  "emotional_override_alarm", "day_summary", "ending_victory", "ending_defeat",
  // Ambience cues
  "tea_stall", "rickshaw_bell", "car_horn", "azan", "rain",
  // Selim non-verbal blips (cue alongside subtitle when no MP3 exists)
  "selim_ack", "selim_laugh", "selim_sigh", "selim_surprise",
  // Viral / meme SFX (Task: viral sound polish)
  "vine_boom", "bruh", "sad_violin", "air_horn", "discord_ping",
  "wow_meme", "bonk", "tada", "nope",
]);

export type AudioManifest = {
  sfx: string[];
  music: string[];
  ambience: string[];
  voiceSpeakers: string[];
};

export const audioManifest: AudioManifest = {
  sfx: [
    "card_flip", "ui_click", "ui_hover", "ui_toggle", "ui_toggle_off",
    "ui_back", "ui_confirm", "ui_error", "coin_gain", "coin_loss", "heartbreak",
    "love_chime", "promise_made", "promise_broken", "best_friend_chime",
    "recovery_start", "achievement_unlock", "emotional_override_alarm",
    "stat_up", "stat_down", "day_summary", "ending_victory", "ending_defeat",
    "tea_stall", "sparkle_lucky", "cameo_sting",
    "selim_ack", "selim_laugh", "selim_sigh", "selim_surprise",
  ],
  music: [
    "menu", "day_dhaka", "night_dhaka", "pinky_mission", "heartbreak",
    "recovery", "ending_good", "ending_bad", "best_friend",
  ],
  ambience: [
    "station", "bus_stand", "mess_bari", "cha_stall", "food_lane",
    "lake", "market", "office", "rooftop", "clinic",
    "bogura_memory", "street", "rickshaw",
  ],
  voiceSpeakers: ["selim", "pinky", "rafiq", "nila", "cha-mama", "kuddus-bhai"],
};
