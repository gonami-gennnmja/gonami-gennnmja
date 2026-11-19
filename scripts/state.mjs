// The profile's little games keep their state in data/*.json. This file reads and writes them,
// and holds the rules: how iyyko gets hungry, what can be planted, how iyyko plays tic-tac-toe.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const DEFAULTS = {
  pet: { hunger: 80, fun: 80, love: 80, at: null, log: [] },
  garden: { cells: {} },
  ttt: { board: ["", "", "", "", "", "", "", "", ""], score: { human: 0, iyyko: 0, draw: 0 }, last: null },
  friends: { logins: [] },
};
export function load(name) {
  const f = `data/${name}.json`;
  return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : structuredClone(DEFAULTS[name]);
}
export const save = (name, v) => writeFileSync(`data/${name}.json`, JSON.stringify(v, null, 2) + "\n");

// ---------- pet ----------
const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
// stats fall a little every hour; called before showing or changing them
export function decay(pet, now = Date.now()) {
  const h = pet.at ? Math.max(0, (now - Date.parse(pet.at)) / 3600e3) : 0;
  pet.hunger = clamp(pet.hunger - 4 * h);
  pet.fun = clamp(pet.fun - 3 * h);
  pet.love = clamp(pet.love - 2 * h);
  pet.at = new Date(now).toISOString();
  return pet;
}
export const PET_ACTIONS = {
  feed: { hunger: 35, fun: 0, love: 5, done: "fed" },
  play: { hunger: -5, fun: 35, love: 5, done: "played with" },
  pat: { hunger: 0, fun: 5, love: 35, done: "petted" },
};
export function petAction(pet, action, login, now = Date.now()) {
  decay(pet, now);
  const a = PET_ACTIONS[action];
  pet.hunger = clamp(pet.hunger + a.hunger);
  pet.fun = clamp(pet.fun + a.fun);
  pet.love = clamp(pet.love + a.love);
  pet.log = [{ login, action, at: new Date(now).toISOString() }, ...(pet.log ?? [])].slice(0, 30);
  pet.count = (pet.count ?? 0) + 1;
  return a.done;
}

// ---------- garden ----------
export const COLS = "ABCDEFGH", ROWS = 4;
export const ITEMS = {
  flower: "🌸 Flower", tulip: "🌷 Tulip", sunflower: "🌻 Sunflower", tree: "🌳 Tree",
  mushroom: "🍄 Mushroom", house: "🏠 House", rock: "🪨 Rock", heart: "💗 Heart",
};
export function parsePlant(title, body) {
  const all = `${title}\n${body ?? ""}`;
  const spot = all.toUpperCase().match(/\b([A-H])\s*([1-4])\b/);
  const lower = all.toLowerCase();
  const item = Object.keys(ITEMS).find((k) => lower.includes(k));
  return spot && item ? { cell: spot[1] + spot[2], item } : null;
}

// ---------- tic-tac-toe ----------
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
export function winner(b) {
  for (const l of LINES) if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return { who: b[l[0]], line: l };
  return b.every(Boolean) ? { who: "draw", line: [] } : null;
}
// iyyko: win if it can, block if it must, otherwise middle, corners, edges
function iyykoMove(b) {
  const free = b.map((v, i) => (v ? null : i)).filter((i) => i !== null);
  for (const mark of ["O", "X"])
    for (const i of free) { const t = [...b]; t[i] = mark; if (winner(t)?.who === mark) return i; }
  for (const i of [4, 0, 2, 6, 8, 1, 3, 5, 7]) if (free.includes(i)) return i;
  return free[0];
}
// returns a sentence for the reply
export function tttMove(g, cell, login) {
  if (winner(g.board)) g.board = Array(9).fill(""); // last game finished: new board
  if (g.board[cell]) return `That square is taken — try another one!`;
  g.board[cell] = "X";
  let w = winner(g.board);
  if (!w) { g.board[iyykoMove(g.board)] = "O"; w = winner(g.board); }
  g.turnBy = login;
  if (!w) return `iyyko made a move. Your turn again (or anyone's)!`;
  if (w.who === "X") { g.score.human++; g.last = { result: "human", by: login }; return `🎉 You beat iyyko! Humans ${g.score.human} : ${g.score.iyyko} iyyko`; }
  if (w.who === "O") { g.score.iyyko++; g.last = { result: "iyyko", by: login }; return `😼 iyyko wins this one. Humans ${g.score.human} : ${g.score.iyyko} iyyko`; }
  g.score.draw++; g.last = { result: "draw", by: login }; return `🤝 A draw! Next move starts a new game.`;
}

export function addFriend(login) {
  const f = load("friends");
  if (!f.logins.includes(login)) { f.logins.push(login); save("friends", f); }
}
