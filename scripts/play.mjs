// Runs one visitor's feed / play / pat, from the issue they opened, and writes the reply.
// The issue title is only matched against a fixed pattern, never run.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";

const title = (process.env.TITLE ?? "").trim().toLowerCase(), login = process.env.LOGIN ?? "someone";
const reply = (s) => { writeFileSync(process.env.REPLY_FILE ?? "reply.txt", s); console.log(s); };

const m = title.match(/^(?:pet:\s*)?(feed|play|pat)\b/);
if (!m) reply("");
else {
  const f = "data/pet.json";
  const pet = existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : { log: [], count: 0 };
  pet.log = [{ login, action: m[1], at: new Date().toISOString() }, ...pet.log].slice(0, 30);
  pet.count += 1;
  mkdirSync("data", { recursive: true });
  writeFileSync(f, JSON.stringify(pet, null, 2) + "\n");
  const done = { feed: "🐟 You fed iyyko!", play: "🧶 You played with iyyko!", pat: "✋ You petted iyyko!" }[m[1]];
  reply(`${done} That's visit #${pet.count}.\n\nThe profile updates in a minute — go say hi 🐱`);
}
