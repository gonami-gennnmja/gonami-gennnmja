// Tic-tac-toe you play just by clicking, with no issues and no server.
// Every board a game can reach is written into the README ahead of time. Each empty square
// links to the board that comes next (your X plus iyyko's answer), so a click jumps there.
// Boards sit far apart, so after a jump you only see the one you are on.
import { svgDoc } from "./pixel.mjs";
import { C, W, frame, float, blink, at, sprite, text, textWidth, FACES, CATC } from "./art.mjs";

const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
function winner(b) {
  for (const l of LINES) if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return { who: b[l[0]], line: l };
  return b.every(Boolean) ? { who: "draw", line: [] } : null;
}
// iyyko wins if it can, blocks if it must, then likes the middle, corners, edges.
// It doesn't see forks coming, so a clever human can beat it.
function iyykoMove(b) {
  const free = b.map((v, i) => (v ? null : i)).filter((i) => i !== null);
  for (const mark of ["O", "X"])
    for (const i of free) { const t = [...b]; t[i] = mark; if (winner(t)?.who === mark) return i; }
  return [4, 0, 2, 6, 8, 1, 3, 5, 7].find((i) => free.includes(i));
}

// every board reachable from an empty one, in the order a game meets them
export function boards() {
  const out = new Map(); // key -> { board, next: [9 keys or null] }
  const walk = (b) => {
    const key = b.every((v) => !v) ? "start" : b.map((v) => v || "-").join("");
    if (out.has(key)) return key;
    const node = { board: b, next: Array(9).fill(null) };
    out.set(key, node);
    if (!winner(b)) b.forEach((v, i) => {
      if (v) return;
      const t = [...b]; t[i] = "X";
      if (!winner(t)) t[iyykoMove(t)] = "O";
      node.next[i] = walk(t);
    });
    return key;
  };
  walk(Array(9).fill(""));
  return out;
}

// ---- pictures ----
const S = 90;
function cell(kind) { // e: empty, x, o, and xw / ow on the winning line
  const hot = kind.endsWith("w");
  let b = `<rect width="${S}" height="${S}" fill="${C.bg}"/><rect x="3" y="3" width="${S - 6}" height="${S - 6}" fill="${hot ? "#FFF1B8" : C.white}" stroke="${C.frame}" stroke-width="6"/>`;
  if (kind === "e") b += `<rect x="${S / 2 - 4}" y="${S / 2 - 4}" width="8" height="8" fill="${C.lilacL}"/>`;
  if (kind[0] === "x") b += float(at(20, 20, sprite(["x...x", ".x.x.", "..x..", ".x.x.", "x...x"], { x: C.pink }, 0, 0, 10)), hot ? 4 : 0, 0.8);
  if (kind[0] === "o") b += float(at(15, 18, sprite(FACES.happy, CATC, 0, 0, 5)), hot ? 4 : 0, 0.8);
  return svgDoc(S, S, b, { e: "empty square", x: "X", o: "iyyko", xw: "X", ow: "iyyko" }[kind]);
}
const STATUS = {
  start: ["YOU ARE X. TAP A SQUARE!", "NO SIGN-IN, NO ISSUES. JUST CLICK. CAN YOU BEAT IYYKO?"],
  turn: ["YOUR TURN!", "IYYKO MADE ITS MOVE. TAP AN EMPTY SQUARE."],
  win: ["YOU BEAT IYYKO!", "WOW. IYYKO DID NOT SEE THAT COMING."],
  lose: ["IYYKO WINS!", "HEHE. TRY A FORK NEXT TIME."],
  draw: ["IT'S A DRAW!", "A WORTHY OPPONENT. ONE MORE GAME?"],
};
function status(kind) {
  const H = 130, [big, small] = STATUS[kind];
  let b = frame(H, "TIC-TAC-TOE VS IYYKO");
  const t = text(big, Math.round((W - textWidth(big) * 5) / 2 / 5), 52 / 5, 5, kind === "lose" ? C.ink : C.pink).svg;
  b += kind === "start" || kind === "turn" ? t : blink(t, 1.2);
  b += text(small, Math.round((W - textWidth(small) * 2) / 2 / 2), 94 / 2, 2, C.soft).svg;
  return svgDoc(W, H, b, `${big} ${small}`);
}
function button(label, bg) {
  const w = 200, h = 56;
  let b = `<rect width="${w}" height="${h}" fill="${C.bg}"/><rect x="4" y="10" width="${w - 8}" height="${h - 14}" fill="${C.frameD}"/><rect x="4" y="4" width="${w - 8}" height="${h - 14}" fill="${bg}"/>`;
  b += text(label, Math.round((w - textWidth(label) * 4) / 2 / 4), 4, 4, C.white).svg;
  return svgDoc(w, h, b, label);
}
const blank = (h) => `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="${h}" viewBox="0 0 10 ${h}"><title> </title></svg>
`;
const gap = () => `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="1600" viewBox="0 0 10 1600"><title> </title></svg>\n`;

export function pictures() {
  const f = { "ttt/gap.svg": gap(), "ttt/pad.svg": blank(80), "ttt/again.svg": button("PLAY AGAIN", C.pink), "ttt/restart.svg": button("START OVER", C.lilac) };
  for (const k of ["e", "x", "o", "xw", "ow"]) f[`ttt/${k}.svg`] = cell(k);
  for (const k of Object.keys(STATUS)) f[`ttt/${k}.svg`] = status(k);
  return f;
}

// README markup: the game at its usual spot, and every later board for the end of the page
export function markup(img) {
  const all = boards(), ids = new Map([...all.keys()].map((k, i) => [k, i ? `t${i}` : "ttt"]));
  const board = (key) => {
    const { board: b, next } = all.get(key), w = winner(b), id = ids.get(key);
    const kind = key === "start" ? "start" : !w ? "turn" : w.who === "X" ? "win" : w.who === "O" ? "lose" : "draw";
    const cells = b.map((v, i) => {
      const k = !v ? "e" : (v === "X" ? "x" : "o") + (w?.line.includes(i) ? "w" : "");
      return `<a href="#${next[i] ? ids.get(next[i]) : id}">${img(`ttt/${k}.svg`, k === "e" ? `square ${i + 1}` : v, "90")}</a>`;
    });
    const rows = [0, 3, 6].map((r) => cells.slice(r, r + 3).join("")).join("<br/>\n");
    const btn = kind === "start" ? "" : `<br/>\n<a href="#ttt">${img(w ? "ttt/again.svg" : "ttt/restart.svg", w ? "Play again" : "Start over", "200")}</a>`;
    // later boards start with a little blank space so GitHub's sticky header doesn't cover them after a jump
    const top = kind === "start" ? `<a id="${id}" href="#${id}">${img(`ttt/${kind}.svg`, STATUS[kind][0])}</a>`
      : `<a id="${id}" href="#${id}">${img("ttt/pad.svg", " ", "10")}</a><br/>
<a href="#${id}">${img(`ttt/${kind}.svg`, STATUS[kind][0])}</a>`;
    return `${top}\n<p align="center">\n${rows}${btn}\n</p>\n`;
  };
  const gapImg = (id) => `<a href="#${id}">${img("ttt/gap.svg", " ", "10")}</a>\n`;
  const later = [...all.keys()].slice(1).map((k) => gapImg(ids.get(k)) + "\n" + board(k)).join("\n");
  return { start: board("start"), later: later + "\n" + gapImg("ttt"), count: all.size };
}
