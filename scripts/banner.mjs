// Header and footer: a little black-and-white Mac desktop with iyyko on it.
// They don't depend on any data, so this only needs to run when the design changes.
import { writeFileSync } from "node:fs";
import { svgDoc } from "./pixel.mjs";
import { C, DEFS, win, macButton, float, twinkle, at, sprite, text, textWidth, catSprite, CAT_HEAD, CATC, HEART, STAR, SPARK } from "./art.mjs";

const TRASH = [".oooooooo.", "oooooooooo", ".owowowowo", ".owowowowo", ".owowowowo", ".owowowowo", ".owowowowo", ".oooooooo."];
const DISK = ["oooooooooo", "owwwwwwwoo", "owwwwwwwoo", "oooooooooo", "oooooooooo", "oowwwwwwoo", "oowowwwwoo", "oooooooooo"];
const BUG = ["o..o..o", ".ooooo.", "ooppppo", ".opppo.", "ooppppo", ".ooooo.", "o.....o"];

// a desktop icon with its label in a white box underneath
function icon(rows, colors, label, x, y, u = 4) {
  const w = rows[0].length * u, lw = textWidth(label) * 2 + 8;
  return sprite(rows, colors, x / u, y / u, u) +
    `<rect x="${x + w / 2 - lw / 2}" y="${y + rows.length * u + 6}" width="${lw}" height="16" fill="#fff"/>` +
    text(label, (x + w / 2 - lw / 2 + 4) / 2, (y + rows.length * u + 9) / 2, 2, "#000").svg;
}

function header() {
  const W = 800, H = 200;
  let b = DEFS + `<rect width="${W}" height="${H}" fill="url(#dither)"/>`;
  // menu bar
  b += `<rect width="${W}" height="28" fill="#fff"/><rect y="28" width="${W}" height="3" fill="#000"/>`;
  b += sprite(CAT_HEAD, CATC, 14 / 2, 3 / 2, 2);
  ["FILE", "EDIT", "VIEW", "SPECIAL"].forEach((m, i) => (b += text(m, (52 + i * 90) / 3, 7 / 3, 3, "#000").svg));
  b += at(760, 6, sprite(HEART, { p: C.pink }, 0, 0, 2.4));
  // desktop icons
  b += float(icon(TRASH, { o: "#000", w: "#fff" }, "BUGS", 712, 52), 2, 3, 0.5);
  b += icon(DISK, { o: "#000", w: "#fff" }, "IDEAS", 712, 122);
  b += float(at(40, 70, sprite(catSprite("happy"), CATC, 0, 0, 5)), 8, 2.6);
  b += float(at(54, 154, sprite(BUG, { o: "#000", p: C.pink }, 0, 0, 3)), 3, 0.7, 0.3);
  // the welcome window
  b += win(520, 140, "WELCOME.TXT", { x: 140, y: 46 });
  const title = "HI THERE!", tu = 9, tx = 140 + (514 - textWidth(title) * tu) / 2;
  [...title].forEach((ch, i) => {
    const x = tx / tu + i * 4;
    b += float(text(ch, x + 0.34, 98 / tu + 0.34, tu, C.pink).svg + text(ch, x, 98 / tu, tu, "#000").svg, 6, 1.8, i * 0.12);
  });
  const sub = "I MAKE SMALL APPS YOU'LL WANT TO OPEN EVERY DAY";
  b += text(sub, (140 + (514 - textWidth(sub) * 2) / 2) / 2, 156 / 2, 2, C.soft).svg;
  [[100, 46, 0], [690, 186, 0.7], [600, 36, 1.3]].forEach(([x, y, d], i) => (b += twinkle(at(x, y, sprite(i % 2 ? SPARK : STAR, { y: i === 1 ? C.pink : "#000" }, 0, 0, 3)), 2, d)));
  return svgDoc(W, H, b, "Hi there! I make small apps you'll want to open every day");
}

function footer() {
  const W = 800, H = 170;
  let b = DEFS + `<rect width="${W}" height="${H}" fill="url(#dither)"/>`;
  // a little alert box
  const x = 170, y = 14, w = 460, h = 112;
  b += `<rect x="${x + 6}" y="${y + 6}" width="${w}" height="${h}" fill="#000"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#000"/><rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" fill="#fff"/><rect x="${x + 7}" y="${y + 7}" width="${w - 14}" height="${h - 14}" fill="#000"/><rect x="${x + 9}" y="${y + 9}" width="${w - 18}" height="${h - 18}" fill="#fff"/>`;
  b += sprite(CAT_HEAD, CATC, (x + 24) / 3, (y + 22) / 3, 3);
  b += text("THANKS FOR STOPPING BY!", (x + 78) / 3, (y + 28) / 3, 3, "#000").svg;
  b += text("COME BACK SOON!", (x + 78) / 2, (y + 52) / 2, 2, C.soft).svg;
  b += at(x + w - 130, y + h - 50, macButton(110, 38, "OK", true, 3));
  // iyyko hops along the bottom, left to right
  const hop = `<animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="0.5s" calcMode="discrete" repeatCount="indefinite" additive="sum"/>`;
  b += `<g><animateTransform attributeName="transform" type="translate" from="-50 ${H - 34}" to="${W + 20} ${H - 34}" dur="16s" begin="-6s" repeatCount="indefinite"/><g>${hop}<rect x="-4" y="-4" width="34" height="38" fill="#fff"/>${sprite(catSprite("happy"), CATC, 0, 0, 2)}</g></g>`;
  return svgDoc(W, H, b, "Thanks for stopping by!");
}

writeFileSync("assets/header.svg", header());
writeFileSync("assets/footer.svg", footer());
console.log("header.svg, footer.svg");
