// This loads .env file
import "https://deno.land/std@0.205.0/dotenv/load.ts";

import { Client, GatewayIntentBits, Partials } from "npm:discord.js";
import { CommandKit } from "npm:commandkit";
import { connectDatabase } from "./database/connect.ts";

connectDatabase();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],

  partials: [
    Partials.Channel,
    Partials.Message,
  ],
})

new CommandKit({
  client,
  commandsPath: `${Deno.cwd()}/src/commands`, // Use Deno.cwd() to get the current working directory
  eventsPath: `${Deno.cwd()}/src/events`, // Use Deno.cwd() to get the current working directory
  skipBuiltInValidations: true,
  bulkRegister: true,
});

client.login(Deno.env.get("TOKEN"));
