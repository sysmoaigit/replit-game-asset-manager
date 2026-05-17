// Render a stylized end-of-run share card to a canvas and provide
// share / clipboard / download helpers. Pure browser canvas — no deps.

export type ShareCardData = {
  playerName: string;
  endingName: string;
  endingMessage: string;
  selimQuote: string;
  isGood: boolean;
  stats: {
    health: number; mood: number; money: number; iq: number; energy: number;
    selfRespect: number; careerProgress: number; friendTrust: number; pinkyHope: number;
  };
  day: number;
};

const W = 540;
const H = 960;

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const words = text.split(/\s+/);
  let line = "";
  let curY = y;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, curY);
      line = w;
      curY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, curY);
  return curY;
}

export function renderShareCard(data: ShareCardData): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  if (data.isGood) {
    bg.addColorStop(0, "#1a0f05");
    bg.addColorStop(0.6, "#2d1a08");
    bg.addColorStop(1, "#3d2410");
  } else {
    bg.addColorStop(0, "#0a0a0a");
    bg.addColorStop(0.7, "#1a0505");
    bg.addColorStop(1, "#0d0606");
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Decorative skyline silhouette
  ctx.fillStyle = data.isGood ? "rgba(255,107,0,0.18)" : "rgba(80,80,80,0.20)";
  const skyY = H - 140;
  const xs = [0, 60, 90, 130, 180, 240, 290, 340, 400, 470, 540];
  const hs = [70, 110, 80, 130, 95, 150, 100, 75, 120, 90, 70];
  for (let i = 0; i < xs.length - 1; i++) {
    ctx.fillRect(xs[i], skyY - hs[i], xs[i + 1] - xs[i], hs[i] + 140);
  }

  // Top accent bar
  ctx.fillStyle = data.isGood ? "#FFD700" : "#888";
  ctx.fillRect(0, 0, W, 6);

  // Header — "Selim in Dhaka"
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 26px 'Hind Siliguri', system-ui, sans-serif";
  ctx.fillText("Selim in Dhaka", W / 2, 56);
  ctx.fillStyle = "#FF9933";
  ctx.font = "italic 14px 'Hind Siliguri', system-ui, sans-serif";
  ctx.fillText("Pinky Mission 💔", W / 2, 80);

  // Player name
  ctx.fillStyle = "#FFB347";
  ctx.font = "bold 16px 'Hind Siliguri', system-ui, sans-serif";
  ctx.fillText(`— ${data.playerName} —`, W / 2, 110);

  // Ending name (large)
  ctx.font = "bold 38px 'Hind Siliguri', system-ui, sans-serif";
  const endingGrad = ctx.createLinearGradient(0, 130, W, 200);
  if (data.isGood) {
    endingGrad.addColorStop(0, "#FFD700");
    endingGrad.addColorStop(1, "#FF6B00");
  } else {
    endingGrad.addColorStop(0, "#aaa");
    endingGrad.addColorStop(1, "#666");
  }
  ctx.fillStyle = endingGrad;
  ctx.fillText(data.endingName, W / 2, 175);

  // Day badge
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(W / 2 - 60, 200, 120, 30);
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 14px 'Hind Siliguri', system-ui, sans-serif";
  ctx.fillText(`${data.day} দিন শেষ`, W / 2, 220);

  // Ending message (wrapped)
  ctx.textAlign = "left";
  ctx.fillStyle = "#FFD700";
  ctx.font = "16px 'Hind Siliguri', system-ui, sans-serif";
  const msgY = wrapText(ctx, data.endingMessage, 40, 270, W - 80, 24);

  // Selim quote box
  const quoteTop = msgY + 40;
  ctx.fillStyle = "rgba(255,107,0,0.12)";
  ctx.fillRect(30, quoteTop, W - 60, 90);
  ctx.fillStyle = "#FFB347";
  ctx.font = "italic 14px 'Hind Siliguri', system-ui, sans-serif";
  ctx.fillText("Selim বলে:", 45, quoteTop + 24);
  ctx.fillStyle = "#FFD700";
  ctx.font = "italic 16px 'Hind Siliguri', system-ui, sans-serif";
  wrapText(ctx, `"${data.selimQuote}"`, 45, quoteTop + 50, W - 90, 22);

  // Stats grid
  const statsTop = quoteTop + 130;
  const statRows: Array<[string, number, string]> = [
    ["Health ❤", data.stats.health, "#ef4444"],
    ["Mood 😊", data.stats.mood, "#eab308"],
    ["IQ 🧠", data.stats.iq, "#3b82f6"],
    ["Energy ⚡", data.stats.energy, "#06b6d4"],
    ["Self-Respect 🛡", data.stats.selfRespect, "#10b981"],
    ["Career 💼", data.stats.careerProgress, "#8b5cf6"],
    ["Friend Trust 🤝", data.stats.friendTrust, "#22c55e"],
    ["Pinky Hope 💔", data.stats.pinkyHope, "#ec4899"],
  ];
  ctx.font = "bold 14px 'Hind Siliguri', system-ui, sans-serif";
  for (let i = 0; i < statRows.length; i++) {
    const [label, val, color] = statRows[i];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 40 + col * (W / 2 - 30);
    const y = statsTop + row * 36;
    // Bar background
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(x, y, W / 2 - 50, 26);
    // Bar fill
    const pct = Math.max(0, Math.min(100, val)) / 100;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, (W / 2 - 50) * pct, 26);
    // Label
    ctx.fillStyle = "#fff";
    ctx.fillText(label, x + 8, y + 18);
    ctx.textAlign = "right";
    ctx.fillText(String(Math.round(val)), x + W / 2 - 58, y + 18);
    ctx.textAlign = "left";
  }

  // Money line
  const moneyY = statsTop + 4 * 36 + 20;
  ctx.fillStyle = data.stats.money >= 0 ? "#22c55e" : "#ef4444";
  ctx.textAlign = "center";
  ctx.font = "bold 22px 'Hind Siliguri', system-ui, sans-serif";
  ctx.fillText(`৳ ${data.stats.money.toLocaleString()}`, W / 2, moneyY);

  // Footer
  ctx.fillStyle = "#888";
  ctx.font = "12px 'Hind Siliguri', system-ui, sans-serif";
  ctx.fillText("selim-in-dhaka • আবার খেলবি?", W / 2, H - 28);

  return canvas;
}

export async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/png");
  });
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename = "selim-share.png"): void {
  try {
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch { /* ignore */ }
}

export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = await canvasToBlob(canvas);
    if (!blob) return false;
    const ClipboardItemCtor = (window as unknown as { ClipboardItem?: typeof ClipboardItem }).ClipboardItem;
    if (!ClipboardItemCtor || !navigator.clipboard?.write) return false;
    await navigator.clipboard.write([new ClipboardItemCtor({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}

export async function nativeShareCanvas(canvas: HTMLCanvasElement, text: string): Promise<boolean> {
  try {
    const blob = await canvasToBlob(canvas);
    if (!blob) return false;
    const file = new File([blob], "selim-share.png", { type: "image/png" });
    const nav = navigator as Navigator & {
      canShare?: (data: { files?: File[] }) => boolean;
      share?: (data: { files?: File[]; text?: string; title?: string }) => Promise<void>;
    };
    if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
      await nav.share({ files: [file], text, title: "Selim in Dhaka" });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
