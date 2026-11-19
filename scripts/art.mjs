// Shared look: a black-and-white Mac desktop from the 90s, plus one accent colour.
// Every section is a window with a striped title bar, a close box and a hard black shadow.
import { sprite, text, textWidth } from "./pixel.mjs";

export const ACCENT = "#FF8FAB"; // pink: whatever is alive right now (mood, today's plant, wins)
export const ACCENT2 = "#B49CFF"; // purple: an occasional second highlight
export const C = {
  white: "#FFFFFF", black: "#000000", ink: "#000000", soft: "#6E6E6E",
  light: "#DDDDDD", mid: "#AAAAAA", dark: "#555555",
  pink: ACCENT, pinkL: "#FFD6E2", lilac: ACCENT2,
};

export const W = 800; // every section picture is this wide
export const SHADOW = 6;

// 1-bit fills; DEFS goes into every picture that uses url(#dither) and friends
export const DEFS = `<defs>
<pattern id="dither" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#fff"/><rect width="2" height="2" fill="#000"/><rect x="4" y="4" width="2" height="2" fill="#000"/></pattern>
<pattern id="half" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#fff"/><rect width="2" height="2" fill="#000"/><rect x="2" y="2" width="2" height="2" fill="#000"/></pattern>
<pattern id="lines" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#fff"/><rect width="4" height="2" fill="#000"/></pattern>
</defs>`;

// a window w x h (shadow included) at x, y. tu is the title's pixel size.
export function win(w, h, title, { x = 0, y = 0, tu = 4 } = {}) {
  const ww = w - SHADOW, hh = h - SHADOW, bw = 3, th = 30;
  let b = `<rect x="${x + SHADOW}" y="${y + SHADOW}" width="${ww}" height="${hh}" fill="#000"/>`;
  b += `<rect x="${x}" y="${y}" width="${ww}" height="${hh}" fill="#000"/><rect x="${x + bw}" y="${y + bw}" width="${ww - 2 * bw}" height="${hh - 2 * bw}" fill="#fff"/>`;
  b += `<rect x="${x + bw + 6}" y="${y + bw + 6}" width="${ww - 2 * bw - 12}" height="${th - 12}" fill="url(#lines)"/>`;
  b += `<rect x="${x + bw}" y="${y + bw + th}" width="${ww - 2 * bw}" height="${bw}" fill="#000"/>`;
  // close box
  b += `<rect x="${x + 14}" y="${y + bw + 4}" width="28" height="22" fill="#fff"/><rect x="${x + 19}" y="${y + bw + 6}" width="18" height="18" fill="#000"/><rect x="${x + 22}" y="${y + bw + 9}" width="12" height="12" fill="#fff"/>`;
  if (title) {
    const tw = textWidth(title) * tu + 20, tx = Math.max(x + 48, x + (ww - tw) / 2);
    b += `<rect x="${tx}" y="${y + bw + 3}" width="${tw}" height="24" fill="#fff"/>`;
    b += text(title, (tx + 10) / tu, (y + bw + 15 - (5 * tu) / 2) / tu, tu, "#000").svg;
  }
  return b;
}
// the usual full-width section window; content starts around y = 44
export const frame = (h, title) => DEFS + win(W, h, title);

// a classic rounded Mac push button; the default one gets the thick ring
export function macButton(w, h, label, isDefault = false, u = 4) {
  const notch = (x, y, ww, hh, k, fill) =>
    `<rect x="${x + k}" y="${y}" width="${ww - 2 * k}" height="${hh}" fill="${fill}"/><rect x="${x}" y="${y + k}" width="${ww}" height="${hh - 2 * k}" fill="${fill}"/>`;
  let b = "";
  const o = isDefault ? 6 : 0;
  if (isDefault) b += notch(0, 0, w, h, 8, "#000") + notch(4, 4, w - 8, h - 8, 6, "#fff");
  b += notch(o, o, w - 2 * o, h - 2 * o, 5, "#000") + notch(o + 3, o + 3, w - 2 * o - 6, h - 2 * o - 6, 3, "#fff");
  b += text(label, (w - textWidth(label) * u) / 2 / u, (h - 5 * u) / 2 / u, u, "#000").svg;
  return b;
}

export const float = (body, dy, dur, begin = 0) =>
  `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 ${-dy};0 0" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>${body}</g>`;
export const blink = (body, dur, begin = 0) =>
  `<g><animate attributeName="opacity" values="1;0;1" dur="${dur}s" begin="${begin}s" calcMode="discrete" repeatCount="indefinite"/>${body}</g>`;
export const twinkle = (body, dur, begin) =>
  `<g opacity="0"><animate attributeName="opacity" values="0;1;0" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>${body}</g>`;
export const at = (x, y, body) => `<g transform="translate(${x} ${y})">${body}</g>`;

// ---- sprites ----
export const CATC = { o: "#000", w: "#fff", k: "#000", h: C.pinkL, t: C.pink };
export const CAT_HEAD = [
  ".o........o.", ".oo......oo.", ".owo....owo.", ".owwoooowwo.", "owwwwwwwwwwo", "owwwwwwwwwwo",
  "owwkwwwwkwwo", "owwkwwwwkwwo", "ohwwwwwwwwho", ".owwwwwwwwo.", "..oooooooo..",
];
export const CAT_BODY = ["..owwwwwwo..", ".owwwwwwwwo.", ".owwwwwwwwo.", ".oowwoowwoo."];
const eyes = (a, b) => CAT_HEAD.map((r, i) => (i === 6 ? a : i === 7 ? b : r));
export const FACES = {
  open: CAT_HEAD,
  closed: eyes("owwwwwwwwwwo", "owkkwwwwkkwo"),
  happy: eyes("owkwkwwkwkwo", "owwwwwwwwwwo"),
  sad: eyes("owwkwwwwkwwo", "owkwwwwwwkwo"),
  grumpy: eyes("owkkwwwwkkwo", "owwkwwwwkwwo"),
};
export const catSprite = (face = "open") => [...FACES[face], ...CAT_BODY];
export const HEART = [".pp.pp.", "ppppppp", "ppppppp", ".ppppp.", "..ppp..", "...p..."];
export const STAR = ["..y..", "..y..", "yyyyy", "..y..", "..y.."];
export const SPARK = [".y.", "yyy", ".y."];
export const FISH = ["..ff...f", ".ffffff.", "fkffffff", ".ffffff.", "..ff...f"];
export const YARN = [".yyy.", "yyyyy", "yyyyy", "yyyyy", ".yyy.", "....y", "...y."];
export const ZZZ = ["zzz", "..z", ".z.", "zzz"];
// outlined so they read on white: o = outline, w = fill
export const CLOUD = ["...ooo....", "..owwwooo.", ".owwwwwwwo", "owwwwwwwwo", "oooooooooo"];
export const SUN = ["..ooo..", ".owwwo.", "owwwwwo", "owwwwwo", "owwwwwo", ".owwwo.", "..ooo.."];

export { sprite, text, textWidth };
