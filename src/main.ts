// This loads .env file
import "https://deno.land/std@0.205.0/dotenv/load.ts";

import {
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  Partials,
} from "npm:discord.js";
import { CommandKit } from "npm:commandkit";
import { connectDatabase } from "./database/connect.ts";
import CooldownModel from "./database/CooldownModel.ts";
import RemindModel from "./database/RemindModel.ts";
import NoteModel from "./database/NoteModel.ts";
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
setInterval(async () => {
  // Cooldown Cron
  const cooldowns = await CooldownModel.find({});
  const now: number = Date.now();

  cooldowns.forEach(async (cooldown: Cooldown) => {
    if (cooldown.time < now) {
      await CooldownModel.deleteOne({ discord_id: cooldown.discord_id });
      Logger.info(`Cooldown for ${cooldown.discord_id} has been removed.`);
    }
  });

  // Note Reminder
  const reminders = await RemindModel.find({});
  if (reminders.length < 1) return;
  reminders.forEach(async (reminder) => {
    const note = await NoteModel.findOne({ shortId: reminder.noteId });
    if (!note) return;
    if (reminder.remindAt > Date.now()) return;

    // Create the emebd
    const embed = new EmbedBuilder()
      .setTitle(`Reminder for note - ${note.title}`)
      .setDescription(
        `Here is your reminder for your note: ${note.title} \`(${note.shortId})\`\nTo view your note, use \`/note view id:${note.shortId}\``
      )
      .setColor("Greyple");

    // Send message to user
    await client.users
      .fetch(note.discord_id)
      .then(async (user) => {
        await user.send({ embeds: [embed] });
        Logger.info(`Sent message to user: ${user.tag}`);
      })
      .catch((error) => {
        Logger.error(`Failed to send message to user: ${error.message}`);
      });

    // Delete the reminder
    await RemindModel.deleteOne({ noteId: reminder.noteId }).catch((error) => {
      Logger.error(`Failed to delete reminder: ${error.message}`);
    });
  });
}, 2000);

void client.login(Deno.env.get("TOKEN"));
