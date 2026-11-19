// Runs one visitor's move, from the issue they opened. Writes the reply for the issue comment.
// Input comes from the issue, so it is only matched against fixed patterns, never run.
import { writeFileSync } from "node:fs";
import { load, save, petAction, parsePlant, ITEMS, tttMove, addFriend } from "./state.mjs";

const title = (process.env.TITLE ?? "").trim(), body = process.env.BODY ?? "", login = process.env.LOGIN ?? "someone";
const reply = (s) => { writeFileSync(process.env.REPLY_FILE ?? "reply.txt", s); console.log(s); };
const t = title.toLowerCase();

let m;
if ((m = t.match(/^(?:pet:\s*)?(feed|play|pat)\b/))) {
  const pet = load("pet");
  const done = petAction(pet, m[1], login);
  save("pet", pet);
  addFriend(login);
  reply(`${{ feed: "🐟", play: "🧶", pat: "✋" }[m[1]]} You ${done} iyyko! Hunger ${pet.hunger} · Fun ${pet.fun} · Love ${pet.love}\n\nThe profile updates in a minute — go say hi 🐱`);
} else if (t.startsWith("plant")) {
  const p = parsePlant(title, body);
  if (!p) reply(`Hmm, I couldn't tell where or what to plant. Pick a spot (A1–H4) and one of: ${Object.values(ITEMS).join(", ")}.`);
  else {
    const g = load("garden");
    const before = g.cells[p.cell];
    g.cells[p.cell] = { item: p.item, login, at: new Date().toISOString() };
    save("garden", g);
    addFriend(login);
    reply(`${ITEMS[p.item]} planted at **${p.cell}**${before ? ` (where @${before.login}'s ${before.item} was)` : ""}. Thanks for making the garden prettier 🌱`);
  }
} else if ((m = t.match(/^ttt:\s*([1-9])\b/))) {
  const g = load("ttt");
  const msg = tttMove(g, +m[1] - 1, login);
  save("ttt", g);
  addFriend(login);
  reply(msg);
} else {
  reply("");
}
