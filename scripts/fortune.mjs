// A new fortune from iyyko every day. The day's date picks it, so it stays the same all day.
import { svgDoc } from "./pixel.mjs";
import { C, W, frame, float, twinkle, at, sprite, text, textWidth, catSprite, CATC, SPARK } from "./art.mjs";

const FORTUNES = [
  "THE BUG YOU FEAR IS JUST A TYPO.",
  "YOUR NEXT COMMIT WILL BE YOUR BEST ONE.",
  "TAKE A NAP. THE CODE WILL WAIT.",
  "SOMEONE WILL STAR YOUR REPO TODAY.",
  "MERGE CONFLICTS WILL FEAR YOU TODAY.",
  "A SNACK BREAK BRINGS A BIG IDEA.",
  "TODAY THE TESTS PASS ON THE FIRST TRY.",
  "SHIP IT SMALL. SHIP IT TODAY.",
  "A CAT WILL SIT ON YOUR KEYBOARD. LET IT.",
  "YOUR CODE IS CLEANER THAN YOU THINK.",
  "DRINK SOME WATER, THEN PUSH.",
  "AN OLD FRIEND WILL OPEN YOUR APP.",
  "ONE PIXEL MOVED TODAY MAKES IT CUTER.",
  "DON'T FORGET TO SAVE THE FILE.",
  "A TINY FEATURE WILL MAKE SOMEONE SMILE.",
  "GOOD NEWS ARRIVES AS A NOTIFICATION.",
  "YOUR STREAK GROWS STRONGER TODAY.",
  "REST IS ALSO PART OF THE PLAN.",
  "THE ANSWER IS HIDING IN THE LOGS.",
  "LUCK FOLLOWS THOSE WHO WRITE TESTS.",
  "A SHORT WALK WILL FIX TWO BUGS.",
  "TODAY YOU WILL DELETE MORE THAN YOU ADD.",
  "SOMEONE NEEDS THE APP YOU ARE MAKING.",
  "PET A CAT. PRODUCTIVITY +10.",
  "YOUR NEXT BIG IDEA IS IN THE SHOWER.",
  "A GREEN SQUARE A DAY KEEPS BUGS AWAY.",
  "YOU WILL NAME A VARIABLE PERFECTLY.",
  "THE BUILD WILL BE FAST TODAY.",
  "LEAVE A NOTE FOR YOUR FUTURE SELF.",
  "SMALL STEPS STILL GROW THE ISLAND.",
  "IT WORKS ON YOUR MACHINE AND THEIRS TOO.",
  "A NEW USER WILL SAY THANK YOU.",
  "A GOOD DAY TO FINISH SOMETHING.",
  "NO DEPLOYS ON FRIDAY. EAT CAKE INSTEAD.",
  "YOUR APP ICON LOOKS EXTRA CUTE TODAY.",
  "COFFEE FIRST. CODE SECOND.",
  "THE HARD PART IS ALREADY BEHIND YOU.",
  "TODAY'S REFACTOR WILL FEEL AMAZING.",
  "SAY HI TO A STRANGER'S REPO.",
  "YOU ARE ONE CLICK FROM A GOOD IDEA.",
];
const ITEMS = ["RUBBER DUCK", "STRAWBERRY MILK", "CARDBOARD BOX", "YARN BALL", "WARM SOCKS", "STICKY NOTES", "SUNFLOWER", "BUBBLE TEA", "PIXEL HEART", "FISH CRACKERS", "HOODIE", "HEADPHONES", "TANGERINE", "PLUSH CAT", "GREEN TEA", "NEW NOTEBOOK"];
const COLORS = [["PINK", C.pink], ["LILAC", C.lilac], ["BLACK", "#000"], ["SILVER", C.mid], ["SNOW", "#fff"], ["CHARCOAL", C.dark]];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// a small, steady hash so the same day always gets the same fortune
const hash = (s) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7);
const wrap = (s, n) => s.split(" ").reduce((ls, w) => ((ls.at(-1) + " " + w).trim().length > n ? ls.push(w) : (ls[ls.length - 1] = (ls.at(-1) + " " + w).trim()), ls), [""]);

const COOKIE = ["...cccc...", ".cCCCCCCc.", "cCCCCCCCCc", "cCCCssCCCc", ".cCCssCCc.", "..cc..cc.."];

export function fortune(day) { // day: Date whose UTC fields are the local date
  const key = day.toISOString().slice(0, 10), h = hash(key);
  const line = FORTUNES[h % FORTUNES.length], item = ITEMS[(h >>> 7) % ITEMS.length], [cname, color] = COLORS[(h >>> 13) % COLORS.length];
  const number = ((h >>> 17) % 99) + 1;
  const H = 272;
  let b = frame(H, "TODAY'S FORTUNE");
  // iyyko holding up the cookie
  b += float(at(70, 76, sprite(catSprite("happy"), CATC, 0, 0, 7)), 5, 1.4);
  b += float(at(142, 156, sprite(COOKIE, { c: "#000", C: C.light, s: "#fff" }, 0, 0, 5)), 5, 1.4, 0.2);
  [[60, 60, 0], [170, 70, 0.7], [190, 196, 1.3]].forEach(([x, y, d]) => (b += twinkle(at(x, y, sprite(SPARK, { y: d > 1 ? C.pink : "#000" }, 0, 0, 4)), 1.8, d)));
  // the paper slip
  const px = 240, py = 56, pw = 520, ph = 190;
  b += `<rect x="${px + 5}" y="${py + 5}" width="${pw}" height="${ph}" fill="#000"/><rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="#000"/><rect x="${px + 3}" y="${py + 3}" width="${pw - 6}" height="${ph - 6}" fill="#fff"/>`;
  const date = `${MONTHS[day.getUTCMonth()]} ${day.getUTCDate()} ${day.getUTCFullYear()}`;
  b += text(date, (px + pw - 20 - textWidth(date) * 2) / 2, (py + 14) / 2, 2, C.pink).svg;
  wrap(line, 30).slice(0, 2).forEach((l, i) => (b += text(l, (px + 20) / 4, (py + 34 + i * 30) / 4, 4, "#000").svg));
  const ly = py + 108;
  b += text(`LUCKY ITEM:   ${item}`, (px + 20) / 3, ly / 3, 3, C.soft).svg;
  b += text(`LUCKY NUMBER: ${number}`, (px + 20) / 3, (ly + 22) / 3, 3, C.soft).svg;
  b += text(`LUCKY COLOR:  ${cname}`, (px + 20) / 3, (ly + 44) / 3, 3, C.soft).svg;
  b += `<rect x="${px + 20 + (textWidth(`LUCKY COLOR:  ${cname}`) + 3) * 3}" y="${ly + 42}" width="18" height="18" fill="#000"/><rect x="${px + 23 + (textWidth(`LUCKY COLOR:  ${cname}`) + 3) * 3}" y="${ly + 45}" width="12" height="12" fill="${color}"/>`;
  return svgDoc(W, H, b, `Today's fortune from iyyko: ${line.toLowerCase()} Lucky item: ${item.toLowerCase()}, number ${number}, color ${cname.toLowerCase()}`);
}
