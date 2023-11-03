// This loads .env file
import "https://deno.land/std@0.205.0/dotenv/load.ts";

import { Client, GatewayIntentBits, Partials } from "npm:discord.js";
import { CommandKit } from "npm:commandkit";
import { connectDatabase } from "./database/connect.ts";
import { Cron } from "npm:croner";
import CooldownModel from "./database/CooldownModel.ts";
import { Cooldown } from "./types/index.ts";
// @ts-ignore
import { Logger } from "npm:term-logger";

connectDatabase();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],

  partials: [Partials.Channel, Partials.Message],
});

new CommandKit({
  client,
  commandsPath: `${Deno.cwd()}/src/commands`, // Use Deno.cwd() to get the current working directory
  eventsPath: `${Deno.cwd()}/src/events`, // Use Deno.cwd() to get the current working directory
  validationsPath: `${Deno.cwd()}/src/validations`, // Use Deno.cwd() to get the current working directory
  skipBuiltInValidations: true,
  bulkRegister: true,
});

// Cron Job
const runEverySecond: Cron = new Cron("*/1 * * * * *", async () => {
  const cooldowns = await CooldownModel.find({});
  const now: number = Date.now();

  cooldowns.forEach(async (cooldown: Cooldown) => {
    if (cooldown.time < now) {
      await CooldownModel.deleteOne({ discord_id: cooldown.discord_id });
      Logger.info(`Cooldown for ${cooldown.discord_id} has been removed.`);
    }
  });
});

void client.login(Deno.env.get("TOKEN"));
