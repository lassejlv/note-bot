import type { Client } from "npm:discord.js";
import type { CommandKit } from "npm:commandkit";
// @ts-ignore
import { Logger } from "npm:term-logger@latest"

export default function (
  c: Client<true>,
  client: Client<true>,
  handler: CommandKit
) {
  Logger.success(`Client ${client.user.tag} is now ready to go!`)
}
