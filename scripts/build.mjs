// Draws every picture on the profile and writes README.md.
// Pictures that change (island, pet, garden, tic-tac-toe, trophies) come from the contribution
// calendar and data/*.json; the README links each one with a content hash so GitHub shows the new one.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { svgDoc } from "./pixel.mjs";
import {
  C, W, frame, float, blink, twinkle, at, sprite, text, textWidth,
  CATC, FACES, catSprite, TAIL, HEART, STAR, SPARK, FISH, YARN, HAND, FLOWER, CLOUD, ZZZ,
} from "./art.mjs";
import { load, decay, COLS, ROWS, ITEMS, winner } from "./state.mjs";

const USER = process.env.GH_USER || "gonami-gennnmja";
const REPO = `${USER}/${USER}`;
const OFFSET = +(process.env.TZ_OFFSET ?? 9); // hours from UTC for the sky and the cat's day
const localNow = () => (process.env.FAKE_HOUR ? new Date(Date.UTC(2026, 0, 1, +process.env.FAKE_HOUR)) : new Date(Date.now() + OFFSET * 3600e3));
const fit = (s, n) => (s.length > n ? s.slice(0, n - 2) + ".." : s);
const ago = (iso) => {
  const m = (Date.now() - Date.parse(iso)) / 60e3;
  return m < 2 ? "JUST NOW" : m < 60 ? `${Math.round(m)}M AGO` : m < 1440 ? `${Math.round(m / 60)}H AGO` : `${Math.round(m / 1440)}D AGO`;
};
const centerText = (s, y, u, color, w = W) => text(s, Math.round((w - textWidth(s) * u) / 2 / u), y, u, color).svg;

const APPS = [
  { id: "isleday", name: "Isleday", desc: "Small habits grow a pixel island", url: "https://apps.apple.com/app/isleday/id6816646663", chips: ["IOS"] },
  { id: "tuttiday", name: "tuttiday", desc: "Band rehearsals, set in one vote", url: "https://tuttiday.com", chips: ["IOS", "ANDROID", "WEB"] },
  { id: "iyyko", name: "iyyko", desc: "One-minute games and tests", url: "https://www.iyyko.com", chips: ["WEB"] },
  { id: "ourhour", name: "Ourhour", desc: "Your shared hours, across time zones", url: null, chips: ["SOON"] },
];

// ---------- data ----------
async function calendar() {
  const token = process.env.GITHUB_TOKEN || execSync("gh auth token").toString().trim();
  const q = `query($l:String!){user(login:$l){contributionsCollection{contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}`;
  const r = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json", "User-Agent": "profile-builder" },
    body: JSON.stringify({ query: q, variables: { l: USER } }),
  });
  const j = await r.json();
  if (!j.data) throw new Error(JSON.stringify(j));
  return j.data.user.contributionsCollection.contributionCalendar.weeks.flatMap((w) => w.contributionDays).map((d) => ({ date: d.date, n: d.contributionCount }));
}
function stats(days) {
  const total = days.reduce((s, d) => s + d.n, 0);
  let longest = 0, run = 0;
  for (const d of days) { run = d.n ? run + 1 : 0; longest = Math.max(longest, run); }
  let i = days.length - 1, current = 0;
  if (days[i] && !days[i].n) i--;
  for (; i >= 0 && days[i].n; i--) current++;
  return { total, longest, current, week: days.slice(-7), today: days.at(-1)?.n ?? 0 };
}

// ---------- about me: a little code window that types itself ----------
function terminal() {
  const H = 230, u = 3;
  let b = frame(H, "ABOUT ME");
  b += `<rect x="40" y="52" width="720" height="150" fill="${C.white}"/><rect x="40" y="52" width="720" height="22" fill="${C.lilacL}"/>`;
  [C.pink, C.gold, C.mint].forEach((c, i) => (b += `<rect x="${52 + i * 18}" y="59" width="9" height="9" fill="${c}"/>`));
  b += text("ME.JS", 230, 20, u, C.soft).svg;
  const K = C.pink, P = C.ink, S = "#4FAE8C", N = "#8A6FD1";
  const lines = [
    [["CONST ", K], ["ME", N], [" = {", P]],
    [["  SHIPPED: [", P], ['"ISLEDAY", "TUTTIDAY", "IYYKO"', S], ["],", P]],
    [["  COOKING: [", P], ['"OURHOUR"', S], ["],", P]],
    [["  LOVES:   [", P], ['"PIXEL ART", "CUTE UIS", "APPS THAT SHIP"', S], ["],", P]],
    [["};", P]],
  ];
  lines.forEach((segs, i) => {
    let x = 20, out = "";
    for (const [s, c] of segs) { out += text(s, x, 28 + i * 7, u, c).svg; x += s.length * 4; }
    b += `<g opacity="0"><animate attributeName="opacity" from="0" to="1" begin="${0.4 + i * 0.5}s" dur="0.01s" fill="freeze"/>${out}</g>`;
  });
  b += blink(`<rect x="${(20 + 3 * 4) * u}" y="${(28 + 4 * 7) * u}" width="${3 * u}" height="${5 * u}" fill="${C.pink}"/>`, 1);
  return svgDoc(W, H, b, "About me: shipped Isleday, tuttiday and iyyko; cooking Ourhour; loves pixel art, cute UIs and apps that ship");
}

// ---------- app cards ----------
function appCard(a) {
  const w = 190, h = 250, u = 2;
  let b = `<rect width="${w}" height="${h}" fill="${C.bg}"/><rect x="4" y="4" width="${w - 8}" height="${h - 8}" fill="none" stroke="${C.frame}" stroke-width="8"/>`;
  const png = readFileSync(`assets/${a.id}.png`).toString("base64");
  b += `<rect x="43" y="22" width="104" height="104" fill="${C.frame}"/>`;
  b += float(`<image href="data:image/png;base64,${png}" x="47" y="26" width="96" height="96"/>`, 4, 2.4, APPS.indexOf(a) * 0.3);
  b += centerText(a.name.toUpperCase(), 46, 3, C.ink, w);
  // two lines of description
  const words = a.desc.toUpperCase().split(" "), ls = [""];
  for (const wd of words) (ls.at(-1) + " " + wd).trim().length > 20 ? ls.push(wd) : (ls[ls.length - 1] = (ls.at(-1) + " " + wd).trim());
  ls.slice(0, 2).forEach((l, i) => (b += centerText(l, 84 + i * 8, u, C.soft, w)));
  const chipC = { IOS: C.blue, ANDROID: C.mintD, WEB: C.pink, SOON: C.gold };
  const cw = a.chips.map((c) => textWidth(c) * u + 12), total = cw.reduce((s, x) => s + x, 0) + (a.chips.length - 1) * 6;
  let x = (w - total) / 2;
  a.chips.forEach((c, i) => {
    b += `<rect x="${x}" y="210" width="${cw[i]}" height="22" fill="${chipC[c]}"/>`;
    b += text(c, (x + 6) / u, 216 / u, u, C.white).svg;
    x += cw[i] + 6;
  });
  return svgDoc(w, h, b, `${a.name}: ${a.desc}`);
}

// ---------- my island ----------
const PLANTS = [
  { rows: [".s.", "sss"], c: { s: C.brown } },
  { rows: ["g.g", ".g.", ".g."], c: { g: C.grassD } },
  { rows: ["..p..", ".pyp.", "..p..", "g.g.g", ".ggg.", "..g.."], c: { p: C.pink, y: C.yellow, g: C.grassD } },
  { rows: [".PP.PP.", "PGGGGGP", "GGGPGGG", "GGGGGGG", ".GGGGG.", "...t..."], c: { P: C.pink, G: C.grassD, t: C.trunk } },
  { rows: ["..GGGGG..", ".GGGrGGG.", "GGrGGGGGG", "GGGGGGrGG", ".GGGGGGG.", "..GGGGG..", "....t....", "....t....", "...ttt..."], c: { G: C.grassD, r: C.pink, t: C.trunk } },
];
const plantFor = (n) => PLANTS[n === 0 ? 0 : n <= 4 ? 1 : n <= 14 ? 2 : n <= 29 ? 3 : 4];
const SUN = ["..yyy..", ".yyyyy.", "yyyyyyy", "yyyyyyy", "yyyyyyy", ".yyyyy.", "..yyy.."];
const MOON = ["..mmm..", ".mm....", "mm.....", "mm.....", "mm.....", ".mm....", "..mmm.."];
function island(s) {
  const u = 6, GW = 120, GH = 50, hour = localNow().getUTCHours();
  const night = hour < 6 || hour >= 20, dusk = hour >= 17 && hour < 20;
  const skyTop = night ? "#4B4680" : dusk ? "#F9C6D3" : C.sky, skyBot = night ? "#6E68A8" : dusk ? "#FFE0C2" : "#E6F5FF";
  let b = `<rect width="${GW * u}" height="${GH * u}" fill="${skyBot}"/><rect width="${GW * u}" height="${18 * u}" fill="${skyTop}"/>`;
  if (night) for (const [x, y, d] of [[10, 6, 0], [25, 12, 1.2], [44, 4, 0.6], [70, 9, 1.8], [86, 15, 0.3], [108, 5, 1.1]])
    b += twinkle(`<rect x="${x * u}" y="${y * u}" width="${u}" height="${u}" fill="#FFF6B0"/>`, 2.4, d);
  b += night ? sprite(MOON, { m: "#FFF6B0" }, 104, 3, u) : sprite(SUN, { y: C.yellow }, 104, 3, u);
  if (!night) for (const [y, dur, d] of [[6, 46, -10], [13, 64, -40]])
    b += `<g><animateTransform attributeName="transform" type="translate" from="${-12 * u} 0" to="${(GW + 2) * u} 0" dur="${dur}s" begin="${d}s" repeatCount="indefinite"/>${sprite(CLOUD, { w: C.white }, 0, y, u)}</g>`;
  b += `<rect y="${38 * u}" width="${GW * u}" height="${12 * u}" fill="${C.sea}"/>`;
  let waves = "";
  for (let k = 0; k < 14; k++) waves += `<rect x="${(k * 17 + (k % 3) * 5) * u}" y="${(40 + (k % 4) * 2) * u}" width="${3 * u}" height="${u}" fill="${C.seaL}"/>`;
  b += `<g><animateTransform attributeName="transform" type="translate" values="0 0;${3 * u} 0;0 0" dur="5s" repeatCount="indefinite"/>${waves}</g>`;
  const cx = 60, rows = [[29, 36], [30, 38], [31, 39], [32, 40], [33, 40], [34, 39], [35, 38], [36, 36], [37, 33], [38, 29], [39, 24], [40, 17]];
  for (const [y, hw] of rows) b += `<rect x="${(cx - hw) * u}" y="${y * u}" width="${hw * 2 * u}" height="${u}" fill="${y <= 30 ? C.grass : y === 31 ? C.grassD : y >= 38 ? C.sandD : C.sand}"/>`;
  const WD = "SMTWTFS";
  s.week.forEach((d, i) => {
    const x = cx - 30 + i * 10, p = plantFor(d.n), w = p.rows[0].length, h = p.rows.length;
    b += `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 ${-u} 0;0 0" keyTimes="0;0.5;1" calcMode="discrete" dur="1.6s" begin="${i * 0.23}s" repeatCount="indefinite"/>${sprite(p.rows, p.c, x - Math.floor(w / 2), 29 - h, u)}</g>`;
    b += text(WD[new Date(d.date + "T00:00:00Z").getUTCDay()], x - 1, 33, u, i === 6 ? C.pink : C.sandD).svg;
  });
  b += text(`THIS WEEK: ${s.week.reduce((t, d) => t + d.n, 0)} COMMITS`, 4, 4, 3, night ? "#D9D4FF" : C.soft).svg;
  const H = 356;
  return svgDoc(W, H, frame(H, "MY ISLAND") + `<svg x="40" y="40" width="${GW * u}" height="${GH * u}">${b}</svg>`, "A pixel island where each of this week's days is a plant that grows with the day's commits");
}

// ---------- iyyko, the pet ----------
function pet(saved) {
  const p = decay(structuredClone(saved)); // how hungry iyyko is by now, without saving it
  const H = 330, now = localNow(), hour = now.getUTCHours();
  let b = frame(H, "IYYKO PET");
  // the egg-shaped toy
  const ex = 150, ey = 178, rx = 104, ry = 128, g = 6;
  for (let y = -ry; y < ry; y += g) {
    const k = 1 - ((y + g / 2 + 14) / ry) ** 2; if (k <= 0) continue;
    const hw = Math.round((rx * Math.sqrt(k)) / g) * g;
    b += `<rect x="${ex - hw}" y="${ey + y}" width="${hw * 2}" height="${g}" fill="${C.pinkL}"/>`;
    b += `<rect x="${ex - hw}" y="${ey + y}" width="${g}" height="${g}" fill="${C.pink}"/><rect x="${ex + hw - g}" y="${ey + y}" width="${g}" height="${g}" fill="${C.pink}"/>`;
  }
  b += `<rect x="78" y="108" width="144" height="120" fill="${C.pink}"/><rect x="84" y="114" width="132" height="108" fill="#DDEFD0"/>`;
  [[110, 250], [150, 262], [190, 250]].forEach(([x, y]) => (b += `<rect x="${x - 9}" y="${y - 9}" width="18" height="18" fill="${C.gold}"/><rect x="${x - 9}" y="${y + 3}" width="18" height="6" fill="#F2C443"/>`));
  for (let i = 0; i < 6; i++) b += `<rect x="${102 + i * 18}" y="78" width="9" height="6" fill="${C.pink}"/>`;
  // who is on the screen, and what they're doing
  const last = p.log?.[0], recent = last && Date.now() - Date.parse(last.at) < 90 * 60e3;
  const low = Math.min(p.hunger, p.fun, p.love);
  const asleep = !recent && hour < 7;
  const face = asleep ? "closed" : recent ? "happy" : low < 15 ? "grumpy" : low < 40 ? "sad" : low >= 70 ? "happy" : "open";
  const mood = asleep ? "SLEEPING" : recent ? { feed: "YUMMY!", play: "SO FUN!", pat: "PURR PURR" }[last.action] : low < 15 ? "GRUMPY" : low < 40 ? (p.hunger === low ? "HUNGRY" : p.fun === low ? "BORED" : "LONELY") : low >= 70 ? "HAPPY" : "OKAY";
  const lcd = { o: "#3E4A3D", w: "#DDEFD0", k: "#3E4A3D", h: "#9DB894", t: "#3E4A3D" };
  b += float(at(104, 130, sprite(catSprite(face), lcd, 0, 0, 5)), asleep ? 0 : 4, 1.2);
  if (asleep) [0, 1, 2].forEach((k) => (b += `<g opacity="0"><animate attributeName="opacity" values="0;1;0" dur="3s" begin="${k}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 0;8 -16" dur="3s" begin="${k}s" repeatCount="indefinite"/>${at(176, 124, sprite(ZZZ, { z: "#3E4A3D" }, 0, 0, 3))}</g>`));
  else if (recent && last.action === "feed") b += float(at(172, 190, sprite(FISH, { f: "#3E4A3D", k: "#DDEFD0" }, 0, 0, 3)), 3, 0.5);
  else if (recent && last.action === "play") b += `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -18;0 0" dur="0.7s" repeatCount="indefinite"/>${at(178, 186, sprite(YARN, { y: "#3E4A3D" }, 0, 0, 3))}</g>`;
  else if (recent && last.action === "pat") b += twinkle(at(170, 122, sprite(HEART, { p: "#3E4A3D" }, 0, 0, 3)), 1.2, 0) + twinkle(at(94, 126, sprite(HEART, { p: "#3E4A3D" }, 0, 0, 2)), 1.2, 0.6);
  // stats
  const tx = 300;
  b += text("IYYKO", tx / 6, 58 / 6, 6, C.ink).svg;
  b += text(`FEELING: ${mood}`, tx / 3, 102 / 3, 3, C.pink).svg;
  const bars = [["HUNGER", p.hunger, FISH, { f: C.blue, k: C.white }], ["FUN", p.fun, YARN, { y: C.mintD }], ["LOVE", p.love, HEART, { p: C.pink }]];
  bars.forEach(([label, v, icon, col], i) => {
    const y = 136 + i * 40;
    b += at(tx, y, sprite(icon, col, 0, 0, 3));
    b += text(label, (tx + 34) / 3, (y + 2) / 3, 3, C.ink).svg;
    const on = Math.round(v / 5), color = v < 25 ? "#FF6F91" : v < 50 ? C.gold : C.mintD;
    for (let k = 0; k < 20; k++) b += `<rect x="${tx + 150 + k * 15}" y="${y}" width="12" height="18" fill="${k < on ? color : C.lilacL}"/>`;
  });
  const lastLine = last ? fit(`LAST: ${last.login} ${{ feed: "FED", play: "PLAYED WITH", pat: "PETTED" }[last.action]} IYYKO ${ago(last.at)}`, 52) : "NOBODY HAS VISITED YET. BE THE FIRST!";
  b += text(lastLine, tx / 2, 270 / 2, 2, C.soft).svg;
  b += text(`CARED FOR ${p.count ?? 0} ${(p.count ?? 0) === 1 ? "TIME" : "TIMES"}`, tx / 2, 290 / 2, 2, C.soft).svg;
  return svgDoc(W, H, b, `iyyko the pet cat is feeling ${mood.toLowerCase()} — hunger ${p.hunger}, fun ${p.fun}, love ${p.love}`);
}

// ---------- garden everyone plants together ----------
const GARDEN = {
  flower: { rows: FLOWER, c: { p: C.pink, y: C.yellow, g: C.grassD } },
  tulip: { rows: ["r.r.r", "rrrrr", ".rrr.", "..g..", "g.g.g", ".ggg."], c: { r: "#FF6F91", g: C.grassD } },
  sunflower: { rows: [".yyy.", "yybyy", ".yyy.", "..g..", ".ggg.", "..g.."], c: { y: C.gold, b: C.trunk, g: C.grassD } },
  tree: { rows: [".GGG.", "GGrGG", "GGGGG", ".GGG.", "..t..", "..t.."], c: { G: C.grassD, r: C.pink, t: C.trunk } },
  mushroom: { rows: [".rrr.", "rwrwr", "rrrrr", ".www.", ".www."], c: { r: "#FF6F91", w: C.white } },
  house: { rows: ["..r..", ".rrr.", "rrrrr", "wwwww", "wdwbw", "wdwww"], c: { r: C.pink, w: "#FFF6E6", d: C.trunk, b: C.blue } },
  rock: { rows: [".....", ".kkk.", "kkkkk", "kkkkk"], c: { k: "#B8B0C8" } },
  heart: { rows: HEART, c: { p: C.pink } },
};
function garden(g) {
  const cw = 80, ch = 56, x0 = 80, y0 = 76, H = y0 + ROWS * ch + 56;
  let b = frame(H, "OUR GARDEN");
  b += text("PLANT SOMETHING AND IT STAYS HERE", 250 / 3, 16 / 3, 3, C.soft).svg;
  [...COLS].forEach((c, i) => (b += text(c, (x0 + i * cw + cw / 2 - 4) / 4, (y0 - 26) / 4, 4, C.soft).svg));
  for (let r = 0; r < ROWS; r++) {
    b += text(String(r + 1), (x0 - 30) / 4, (y0 + r * ch + ch / 2 - 10) / 4, 4, C.soft).svg;
    for (let c = 0; c < COLS.length; c++) {
      const x = x0 + c * cw, y = y0 + r * ch, cell = g.cells[COLS[c] + (r + 1)];
      b += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="${(r + c) % 2 ? "#BFE9B0" : "#B2E3A2"}"/>`;
      if (cell) {
        const s = GARDEN[cell.item], u = 6, w = s.rows[0].length * u, h = s.rows.length * u;
        b += float(at(x + (cw - w) / 2, y + ch - h - 6, sprite(s.rows, s.c, 0, 0, u)), 3, 2 + ((r + c) % 3) * 0.4, (r * 8 + c) * 0.17);
      } else b += `<rect x="${x + cw / 2 - 3}" y="${y + ch / 2 - 3}" width="6" height="6" fill="#A2D892"/>`;
    }
  }
  const latest = Object.entries(g.cells).sort((a, z) => z[1].at.localeCompare(a[1].at))[0];
  const people = new Set(Object.values(g.cells).map((c) => c.login)).size;
  b += text(latest ? fit(`LATEST: ${latest[1].item.toUpperCase()} AT ${latest[0]} BY ${latest[1].login}`, 44) : "THE GARDEN IS EMPTY. PLANT THE FIRST THING!", 40 / 3, (H - 36) / 3, 3, C.ink).svg;
  if (people) b += text(`${people} GARDENERS`, 610 / 3, (H - 36) / 3, 3, C.pink).svg;
  return svgDoc(W, H, b, "A garden where visitors plant flowers, trees and houses");
}

// ---------- tic-tac-toe against iyyko ----------
function tttBoard(t) {
  const H = 150, w = winner(t.board);
  let b = frame(H, "TIC-TAC-TOE VS IYYKO");
  b += centerText(`HUMANS ${t.score.human}  :  ${t.score.iyyko} IYYKO`, 60 / 5, 5, C.ink);
  const status = !w ? (t.board.some(Boolean) ? "YOUR MOVE! TAP A SQUARE BELOW" : "YOU ARE X. TAP A SQUARE TO START") : w.who === "X" ? "HUMANS WIN! TAP ANY SQUARE FOR A NEW GAME" : w.who === "O" ? "IYYKO WINS! TAP ANY SQUARE FOR A REMATCH" : "DRAW! TAP ANY SQUARE FOR A NEW GAME";
  b += blink(centerText(status, 106 / 3, 3, C.pink), 1.6);
  return svgDoc(W, H, b, `Tic-tac-toe against iyyko. Humans ${t.score.human}, iyyko ${t.score.iyyko}`);
}
function tttCell(t, i) {
  const s = 120, w = winner(t.board), v = t.board[i], hot = w?.line.includes(i);
  let b = `<rect width="${s}" height="${s}" fill="${C.bg}"/><rect x="4" y="4" width="${s - 8}" height="${s - 8}" fill="${hot ? "#FFF1B8" : C.white}" stroke="${C.frame}" stroke-width="8"/>`;
  b += text(String(i + 1), 4, 4, 3, C.lilac).svg;
  if (v === "X") b += float(at(30, 30, sprite(["x...x", ".x.x.", "..x..", ".x.x.", "x...x"], { x: C.pink }, 0, 0, 12)), 3, 1.5, i * 0.1);
  else if (v === "O") b += float(at(30, 33, sprite(FACES.happy, CATC, 0, 0, 5)), 3, 1.5, i * 0.1);
  return svgDoc(s, s, b, v === "X" ? `square ${i + 1}: X` : v === "O" ? `square ${i + 1}: iyyko` : `square ${i + 1}: empty`);
}

// ---------- arcade ----------
function arcade() {
  const H = 300;
  let b = frame(H, "ARCADE");
  // cabinet
  b += `<rect x="90" y="40" width="200" height="246" fill="${C.lilac}"/><rect x="100" y="40" width="180" height="40" fill="${C.ink}"/>`;
  b += `<g>${text("IYYKO", 128 / 6, 48 / 6, 6, C.pinkL).svg}<animate attributeName="opacity" values="1;0.55;1" dur="1.2s" repeatCount="indefinite"/></g>`;
  b += `<rect x="104" y="90" width="172" height="120" fill="${C.ink}"/><rect x="112" y="98" width="156" height="104" fill="#2E2A3A"/>`;
  // the game on the screen: iyyko hops over fish forever
  b += `<rect x="112" y="186" width="156" height="4" fill="${C.mint}"/>`;
  b += `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -40;0 0;0 0" keyTimes="0;0.25;0.5;1" dur="1.4s" repeatCount="indefinite"/>${at(130, 150, sprite(catSprite("happy"), CATC, 0, 0, 2.4))}</g>`;
  b += `<svg x="112" y="98" width="156" height="104"><g><animateTransform attributeName="transform" type="translate" from="170 0" to="-30 0" dur="1.4s" repeatCount="indefinite"/>${at(0, 76, sprite(FISH, { f: C.gold, k: "#2E2A3A" }, 0, 0, 3))}</g></svg>`;
  b += blink(text("SCORE 0420", 120 / 2, 102 / 2, 2, C.white).svg, 2);
  b += `<rect x="100" y="216" width="180" height="40" fill="${C.frameD}"/><rect x="134" y="222" width="8" height="18" fill="${C.ink}"/><rect x="128" y="216" width="20" height="10" fill="${C.pink}"/>`;
  [[200, C.pink], [228, C.gold], [256, C.mint]].forEach(([x, c]) => (b += `<rect x="${x - 8}" y="228" width="16" height="12" fill="${c}"/>`));
  b += `<rect x="176" y="262" width="28" height="16" fill="${C.ink}"/><rect x="188" y="265" width="4" height="10" fill="${C.gold}"/>`;
  // the pitch
  b += blink(text("INSERT COIN", 340 / 6, 90 / 6, 6, C.pink).svg, 1.1);
  b += text("PLAY 1-MINUTE GAMES", 344 / 4, 160 / 4, 4, C.ink).svg;
  b += text("AND TESTS ON IYYKO.COM", 344 / 4, 186 / 4, 4, C.ink).svg;
  b += `<g>${at(344, 226, sprite(["p....", "ppp..", "ppppp", "ppp..", "p...."], { p: C.pink }, 0, 0, 5))}<animateTransform attributeName="transform" type="translate" values="0 0;6 0;0 0" dur="0.8s" repeatCount="indefinite"/></g>`;
  b += text("PRESS TO PLAY", 380 / 4, 230 / 4, 4, C.pink).svg;
  [[700, 60, 0], [740, 230, 0.8], [320, 270, 1.5]].forEach(([x, y, d], i) => (b += twinkle(at(x, y, sprite(i % 2 ? SPARK : STAR, { y: C.gold }, 0, 0, 4)), 2, d)));
  return svgDoc(W, H, b, "Arcade: insert coin to play one-minute games on iyyko.com");
}

// ---------- trophies ----------
const CUP = [".yyyyyyy.", "yyWyyyyyy", "y.yWyyy.y", ".yyyyyyy.", "..yyyyy..", "...yyy...", "....y....", "..ddddd..", "..ddddd.."];
function trophies(s, friends) {
  const items = [
    ["SHIPPED", "3 APPS", "#FFD86B", C.peach], ["COMMITS", `${s.total}`, C.pink, C.pinkL], ["STREAK", `${s.current} DAYS`, C.mintD, C.mint],
    ["BEST", `${s.longest} DAYS`, "#B49CFF", C.lilac], ["FRIENDS", `${friends}`, C.blue, "#CFE6FF"],
  ];
  const H = 190, cw = 132, gap = 12, x0 = (W - (items.length * cw + (items.length - 1) * gap)) / 2;
  let b = frame(H, "TROPHIES");
  items.forEach(([label, value, cup, bg], i) => {
    const x = x0 + i * (cw + gap), y = 50;
    b += `<rect x="${x}" y="${y}" width="${cw}" height="120" fill="${bg}"/><rect x="${x}" y="${y}" width="${cw}" height="4" fill="${C.white}" opacity="0.6"/>`;
    b += float(at(x + (cw - 36) / 2, y + 10, sprite(CUP, { y: cup, W: C.white, d: C.ink }, 0, 0, 4)), 4, 2, i * 0.4);
    b += text(label, (x + (cw - textWidth(label) * 3) / 2) / 3, (y + 62) / 3, 3, C.soft).svg;
    b += text(value, (x + (cw - textWidth(value) * 3) / 2) / 3, (y + 88) / 3, 3, C.ink).svg;
  });
  return svgDoc(W, H, b, "Trophies");
}

// ---------- buttons ----------
function button(label, icon, colors, bg) {
  const w = 190, h = 64;
  let b = `<rect width="${w}" height="${h}" fill="${C.bg}"/><rect x="6" y="12" width="${w - 12}" height="${h - 18}" fill="${C.frameD}"/><rect x="6" y="6" width="${w - 12}" height="${h - 18}" fill="${bg}"/>`;
  b += at(20, 14, sprite(icon, colors, 0, 0, 4));
  b += text(label, 64 / 4, 18 / 4, 4, C.white).svg;
  return svgDoc(w, h, b, label);
}

// ---------- write everything ----------
const days = await calendar();
const s = stats(days);
const petState = load("pet"), gardenState = load("garden"), tttState = load("ttt"), friends = load("friends");
mkdirSync("assets/ttt", { recursive: true });
const files = {
  "terminal.svg": terminal(),
  "island.svg": island(s),
  "pet.svg": pet(petState),
  "garden.svg": garden(gardenState),
  "ttt/board.svg": tttBoard(tttState),
  "arcade.svg": arcade(),
  "trophies.svg": trophies(s, friends.logins.length),
  "btn-feed.svg": button("FEED", FISH, { f: C.white, k: C.blue }, C.blue),
  "btn-play.svg": button("PLAY", YARN, { y: C.white }, C.mintD),
  "btn-pat.svg": button("PET", HAND, { h: C.white }, C.pink),
  "btn-plant.svg": button("PLANT", FLOWER, { p: C.white, y: C.gold, g: C.white }, C.grassD),
};
APPS.forEach((a) => (files[`app-${a.id}.svg`] = appCard(a)));
tttState.board.forEach((_, i) => (files[`ttt/${i + 1}.svg`] = tttCell(tttState, i)));
const v = {};
for (const [f, svg] of Object.entries(files)) {
  writeFileSync(`assets/${f}`, svg);
  v[f] = createHash("md5").update(svg).digest("hex").slice(0, 8);
}
const img = (f, alt, width = "100%") => `<img src="assets/${f}?v=${v[f]}" width="${width}" alt="${alt}"/>`;
const issue = (title, body = "") => `https://github.com/${REPO}/issues/new?title=${encodeURIComponent(title)}${body ? `&body=${encodeURIComponent(body)}` : ""}`;
const press = "Just press **Create** — a bot does the rest and closes this issue. 🐱";

const readme = `<img src="assets/header.svg" width="100%" alt="Hi there! I make small apps you'll want to open every day"/>
${img("terminal.svg", "About me")}

<p align="center">
${APPS.map((a) => (a.url ? `<a href="${a.url}">${img(`app-${a.id}.svg`, a.name, "24%")}</a>` : img(`app-${a.id}.svg`, a.name, "24%"))).join("\n")}
</p>

${img("island.svg", "My island")}

${img("pet.svg", "iyyko the pet")}
<p align="center">
<a href="${issue("pet: feed 🐟", press)}">${img("btn-feed.svg", "Feed iyyko", "190")}</a>
<a href="${issue("pet: play 🧶", press)}">${img("btn-play.svg", "Play with iyyko", "190")}</a>
<a href="${issue("pet: pat ✋", press)}">${img("btn-pat.svg", "Pet iyyko", "190")}</a>
</p>

${img("garden.svg", "Our garden")}
<p align="center"><a href="https://github.com/${REPO}/issues/new?template=plant.yml">${img("btn-plant.svg", "Plant something", "190")}</a></p>

${img("ttt/board.svg", "Tic-tac-toe vs iyyko")}
<p align="center">
${[0, 3, 6].map((r) => [1, 2, 3].map((c) => `<a href="${issue(`ttt: ${r + c}`, press)}">${img(`ttt/${r + c}.svg`, `square ${r + c}`, "120")}</a>`).join("\n")).join("<br/>\n")}
</p>

<a href="https://www.iyyko.com/play">${img("arcade.svg", "Arcade: play games on iyyko.com")}</a>

${img("trophies.svg", "Trophies")}

<img src="assets/snake.svg" width="100%" alt="A snake eating my contribution graph"/>

<img src="assets/footer.svg" width="100%" alt="Thanks for stopping by!"/>
`;
writeFileSync("README.md", readme);
console.log(`week ${s.week.map((d) => d.n).join(",")} · total ${s.total} · streak ${s.current}/${s.longest} · pet ${petState.hunger}/${petState.fun}/${petState.love} · garden ${Object.keys(gardenState.cells).length} · ttt ${tttState.score.human}:${tttState.score.iyyko}`);
