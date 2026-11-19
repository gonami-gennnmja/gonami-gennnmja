// Header and footer pictures: pastel pixel banners with little floating friends.
// They don't depend on any data, so this only needs to run when the design changes.
import { writeFileSync } from "node:fs";
import { sprite, text, textWidth, svgDoc } from "./pixel.mjs";

const ink = "#5B4B6B", pink = "#FF8FAB", pinkL = "#FFC2D4", lilac = "#C8B6FF", white = "#FFFFFF";
const CAT = [
  ".o........o.", ".oo......oo.", ".owo....owo.", ".owwoooowwo.", "owwwwwwwwwwo", "owwwwwwwwwwo",
  "owwkwwwwkwwo", "owwkwwwwkwwo", "ohwwwwwwwwho", ".owwwwwwwwo.", "..oooooooo..",
];
const CATBODY = [...CAT, "..owwwwwwo..", ".owwwwwwwwo.", ".owwwwwwwwo.", ".oowwoowwoo."];
const CATC = { o: "#3B2F3A", w: white, k: "#3B2F3A", h: pinkL };
const HEART = [".pp.pp.", "ppppppp", "ppppppp", ".ppppp.", "..ppp..", "...p..."];
const STAR = ["..y..", "..y..", "yyyyy", "..y..", "..y.."];
const SPARK = [".y.", "yyy", ".y."];
const FLOWER = ["..p..", ".pyp.", "..p..", "g.g.g", ".ggg.", "..g.."];
const CLOUD = ["..www...", ".wwwwww.", "wwwwwwww", ".wwwwww."];
const RINGS = [".ooo.ooo.", "o...o...o", "o..oyo..o", "o..oyo..o", "o...o...o", ".ooo.ooo."];
const DRUM = [".s.....s.", "..s...s..", "rrrrrrrrr", "wwwwwwwww", "rrrrrrrrr", "rwrwrwrwr", "rrrrrrrrr"];

// float: bob up and down forever
const float = (body, dy, dur, begin = 0) =>
  `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 ${-dy};0 0" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>${body}</g>`;
const twinkle = (body, dur, begin) =>
  `<g opacity="0"><animate attributeName="opacity" values="0;1;0" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>${body}</g>`;

function header() {
  const W = 800, H = 180, u = 4;
  const bands = ["#FFE4EE", "#FCE6F3", "#F4E7FB", "#EDE7FF", "#E7EEFF"];
  let b = bands.map((c, i) => `<rect y="${(i * H) / bands.length}" width="${W}" height="${H / bands.length + 1}" fill="${c}"/>`).join("");
  // dithered dots along each band edge, for that old-console look
  for (let i = 1; i < bands.length; i++) for (let x = 0; x < W; x += 16)
    b += `<rect x="${x + (i % 2) * 8}" y="${(i * H) / bands.length - u}" width="${u}" height="${u}" fill="${bands[i]}"/>`;
  b += `<g transform="translate(540 14)">${float(sprite(CLOUD, { w: white }, 0, 0, u), 4, 6)}</g>`;
  b += `<g><animateTransform attributeName="transform" type="translate" from="-60 0" to="860 0" dur="38s" repeatCount="indefinite"/>${sprite(CLOUD, { w: white }, 0, 36, u)}</g>`;
  // floating friends
  const friends = [
    [sprite(CAT, CATC, 0, 0, 6), 34, 60, 8, 2.6, 0],
    [sprite(FLOWER, { p: pink, y: "#FFE082", g: "#6FBF73" }, 0, 0, 6), 712, 104, 6, 2.2, 0.4],
    [sprite(HEART, { p: pink }, 0, 0, 3), 96, 140, 6, 3, 0.8],
    [sprite(RINGS, { o: "#3B2F3A", y: "#FFD95E" }, 0, 0, u), 640, 52, 5, 2.8, 1.1],
    [sprite(DRUM, { r: "#FF9AA2", w: white, s: "#B07D56" }, 0, 0, u), 120, 26, 4, 3.4, 0.2],
    [sprite(HEART, { p: lilac }, 0, 0, 3), 730, 30, 5, 2.4, 1.5],
  ];
  for (const [spr, x, y, dy, dur, begin] of friends) b += `<g transform="translate(${x} ${y})">${float(spr, dy, dur, begin)}</g>`;
  [[96, 24, 0], [210, 158, 0.7], [590, 158, 1.3], [770, 156, 0.4], [330, 14, 1.9], [480, 14, 1.1]].forEach(([x, y, d], i) => {
    b += `<g transform="translate(${x} ${y})">${twinkle(sprite(i % 2 ? SPARK : STAR, { y: "#FFD95E" }, 0, 0, 3), 2, d)}</g>`;
  });
  // title: each letter hops in turn
  const title = "HI THERE!", tu = 12, tw = textWidth(title) * tu, tx = (W - tw) / 2;
  [...title].forEach((ch, i) => {
    const x = tx / tu + i * 4;
    b += float(text(ch, x + 0.25, 3.25, tu, pinkL).svg + text(ch, x, 3, tu, ink).svg, 8, 1.8, i * 0.12);
  });
  const sub = "I MAKE SMALL APPS YOU'LL WANT TO OPEN EVERY DAY", su = 3;
  b += text(sub, Math.round((W - textWidth(sub) * su) / 2 / su), 44, su, "#9C8AAE").svg;
  return svgDoc(W, H, b, "Hi there! I make small apps you'll want to open every day");
}

function footer() {
  const W = 800, H = 110, u = 4;
  let b = `<rect width="${W}" height="${H}" fill="#FFF0F6"/>`;
  b += `<rect y="${H - 5 * u}" width="${W}" height="${5 * u}" fill="#9EDC8F"/><rect y="${H - 5 * u}" width="${W}" height="${u}" fill="#6FBF73"/>`;
  for (let x = 12; x < W; x += 58) b += sprite(FLOWER, { p: x % 3 ? pink : lilac, y: "#FFE082", g: "#6FBF73" }, x / 3, (H - 5 * u) / 3 - 6, 3);
  const msg = "THANKS FOR STOPPING BY!", mu = 4;
  b += text(msg, Math.round((W - textWidth(msg) * mu) / 2 / mu), 4, mu, ink).svg;
  b += `<g transform="translate(${(W + textWidth(msg) * mu) / 2 + 10} 14)">${float(sprite(HEART, { p: pink }, 0, 0, 3), 4, 1.2)}</g>`;
  // iyyko hops along the grass, left to right
  const hop = `<animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="0.5s" calcMode="discrete" repeatCount="indefinite" additive="sum"/>`;
  b += `<g><animateTransform attributeName="transform" type="translate" from="-70 ${H - 5 * u - 15 * 3}" to="${W + 20} ${H - 5 * u - 15 * 3}" dur="16s" begin="-6s" repeatCount="indefinite"/><g>${hop}${sprite(CATBODY, CATC, 0, 0, 3)}</g></g>`;
  return svgDoc(W, H, b, "Thanks for stopping by!");
}

writeFileSync("assets/header.svg", header());
writeFileSync("assets/footer.svg", footer());
console.log("header.svg, footer.svg");
