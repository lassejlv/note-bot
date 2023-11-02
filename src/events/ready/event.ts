import type { Client } from "npm:discord.js";
import type { CommandKit } from "npm:commandkit";

export default function (
  c: Client<true>,
  client: Client<true>,
  handler: CommandKit
) {
  console.log(`${c.user.username} is ready!`);
}
