// Continuity / day-forecast text — short narrative recap of yesterday and
// what's brewing today. Used by EventRecap on day-summary screens.

import type { GameState, Stats, Flags } from "../types";

export type DayForecast = {
  yesterdayBest: string;
  yesterdayWorst: string;
  currentPromise: string | null;
  emotionalDanger: string | null;
  forecast: string;
};

export function buildDayForecast(state: GameState, prevStats: Stats): DayForecast {
  const s = state.stats;
  const f = state.flags;

  const best = pickBest(s, prevStats, f);
  const worst = pickWorst(s, prevStats, f);
  const promise = pickPromise(f);
  const danger = pickDanger(s, f);
  const forecast = pickForecast(state.day + 1, s, f);

  return {
    yesterdayBest: best,
    yesterdayWorst: worst,
    currentPromise: promise,
    emotionalDanger: danger,
    forecast,
  };
}

function pickBest(s: Stats, p: Stats, f: Flags): string {
  if (s.selfRespect - p.selfRespect >= 8) return "তুই Pinky-র call ignore করতে বলেছিস। Self Respect ফিরছে।";
  if (s.careerProgress - p.careerProgress >= 8) return "Career-এ momentum ছিলো। সেলিম একটু সিরিয়াস।";
  if (f.bestFriendMoments > 0) return "তোর কথা শুনে সেলিম একটু light লাগলো রাতে।";
  if (s.friendTrust - p.friendTrust >= 6) return "Friend Trust বেড়েছে। সেলিম তোকে আরো বিশ্বাস করছে।";
  if (s.money - p.money >= 100) return "পকেট বাঁচিয়েছিস। Selim-ও Rafiq-ও impressed।";
  if (s.health - p.health >= 6) return "শরীরের যত্ন নিয়েছে। ধোঁয়া কম, পানি বেশি।";
  return "মোটামুটি দিন গেছে। Selim টিকে আছে।";
}

function pickWorst(s: Stats, p: Stats, f: Flags): string {
  if (f.emotionalOverrides > 0) return `সেলিম ${f.emotionalOverrides} বার "ভাই তুই বুঝবি না" বলেছে।`;
  if (s.pinkyHope - p.pinkyHope >= 10) return "Pinky-র hint-এ আবার গলে গেছে।";
  if (f.girlInvestment > 0 && s.money < p.money - 200) return `Girl investment +৳${Math.min(s.money - p.money, 0) * -1}। Wallet ICU।`;
  if (s.addiction - p.addiction >= 6) return "ধোঁয়া বেড়েছে। সাবধান।";
  if (s.selfRespect < 30) return "Self Respect পাশের ফ্ল্যাটে। Boundary কাজ করছে না।";
  if (s.mood < 30) return "Mood ভাঙা। রাত-এ silent।";
  return "বড় কোনো accident না, কিন্তু drift চলছে।";
}

function pickPromise(f: Flags): string | null {
  if (f.promiseModeTurnsLeft > 0) return `চলমান promise: "no more girls" (${f.promiseModeTurnsLeft} turn বাকি)।`;
  if (f.promisesMade > f.promisesKept) {
    const broken = f.promisesMade - f.promisesKept;
    return `${broken} টা promise ভেঙে আছে। Selim জানে, তুইও জানিস।`;
  }
  if (f.rechargePromisesBroken > 0) return `"Last recharge" বলেছে ${f.rechargePromisesBroken} বার।`;
  return null;
}

function pickDanger(s: Stats, f: Flags): string | null {
  if (s.romanticFever > 70 && s.selfRespect < 40) return "🚨 Romantic Fever high। যেকোনো hi = wedding plan।";
  if (s.pinkyHope > 75) return "💗 Pinky Hope সর্বোচ্চ। যেকোনো notification = trap।";
  if (s.health < 30 || s.addiction > 70) return "🩺 Health zone red। Recovery dorkar।";
  if (s.money < 0) return "💸 Wallet negative। Rent due, recharge হবে?";
  if (s.emotionalDelusion > 75) return "🌫️ Delusion ৭৫+। 'Maybe' কে 'yes' পড়া হচ্ছে।";
  if (f.heartbreakCount > 0 && s.mood < 35) return "💔 Heartbreak relapse risk।";
  return null;
}

function pickForecast(nextDay: number, s: Stats, f: Flags): string {
  const bits: string[] = [];
  if (s.money < 200) bits.push("Rent pending");
  if (s.pinkyHope > 60) bits.push("Pinky typing");
  if (s.romanticFever > 60) bits.push("crush radar on");
  if (s.careerProgress < 30 && nextDay > 5) bits.push("career stuck");
  if (f.heartbreakCount > 0 && s.mood < 40) bits.push("Selim unstable");
  if (s.selfRespect > 70) bits.push("Selim দাঁড়াচ্ছে");
  if (bits.length === 0) bits.push("Selim alive, plan unclear");
  return `Day ${nextDay} Forecast: ${bits.slice(0, 3).join(", ")}.`;
}
