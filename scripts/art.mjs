// Shared palette, sprites and the pastel frame every picture sits in,
// so the whole profile reads as one screen.
import { sprite, text, textWidth } from "./pixel.mjs";

export const C = {
  bg: "#FFF0F6", frame: "#E9D8FF", frameD: "#C8B6FF",
  ink: "#5B4B6B", soft: "#9C8AAE", white: "#FFFFFF",
  pink: "#FF8FAB", pinkL: "#FFC2D4", lilac: "#C8B6FF", lilacL: "#EDE7FF",
  mint: "#A8E6CF", mintD: "#7FD8B6", sky: "#CDEBFF", yellow: "#FFE082", gold: "#FFD95E", peach: "#FFD3B6",
  sea: "#9AD4EE", seaL: "#C9ECFA", sand: "#F8E3B5", sandD: "#EBC98C",
  grass: "#9EDC8F", grassD: "#6FBF73", brown: "#C69C72", trunk: "#B07D56", blue: "#8EC5FF",
  dark: "#3B2F3A",
};

export const W = 800; // every section picture is this wide

// the shared card: pastel background, a chunky pixel border and a title in the corner
export function frame(h, title, icon) {
  const u = 4;
  let b = `<rect width="${W}" height="${h}" fill="${C.bg}"/>`;
  b += `<rect x="${u}" y="${u}" width="${W - 2 * u}" height="${h - 2 * u}" fill="none" stroke="${C.frame}" stroke-width="${2 * u}"/>`;
  b += `<rect x="0" y="0" width="${u}" height="${u}" fill="${C.bg}"/><rect x="${W - u}" y="0" width="${u}" height="${u}" fill="${C.bg}"/><rect x="0" y="${h - u}" width="${u}" height="${u}" fill="${C.bg}"/><rect x="${W - u}" y="${h - u}" width="${u}" height="${u}" fill="${C.bg}"/>`;
  if (title) {
    const tw = (textWidth(title) + (icon ? 11 : 0)) * 4 + 24;
    b += `<rect x="20" y="0" width="${tw}" height="36" fill="${C.frameD}"/>`;
    let x = 8;
    if (icon) { b += sprite(icon.rows, icon.colors, 8, 2, 4); x = 19; }
    b += text(title, x, 3, 4, C.white).svg;
  }
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
export const CATC = { o: C.dark, w: C.white, k: C.dark, h: C.pinkL, t: C.pink };
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
export const TAIL = [["...oo", "..owo", ".owo.", "owo.."], ["oo...", "owo..", ".owo.", "..owo"]];
export const HEART = [".pp.pp.", "ppppppp", "ppppppp", ".ppppp.", "..ppp..", "...p..."];
export const STAR = ["..y..", "..y..", "yyyyy", "..y..", "..y.."];
export const SPARK = [".y.", "yyy", ".y."];
export const FISH = ["..ff...f", ".ffffff.", "fkffffff", ".ffffff.", "..ff...f"];
export const YARN = [".yyy.", "yyyyy", "yyyyy", "yyyyy", ".yyy.", "....y", "...y."];
export const HAND = [".h.h.h.", ".h.h.h.", "hhhhhhh", "hhhhhhh", ".hhhhh.", "..hhh.."];
export const FLOWER = ["..p..", ".pyp.", "..p..", "g.g.g", ".ggg.", "..g.."];
export const CLOUD = ["..www...", ".wwwwww.", "wwwwwwww", ".wwwwww."];
export const ZZZ = ["zzz", "..z", ".z.", "zzz"];

export { sprite, text, textWidth };
