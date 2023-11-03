import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "npm:commandkit";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "npm:discord.js";
import { config } from "../config.ts";

export const data: CommandData = {
  name: "bot-info",
  description: "Returns information about the bot.",
};

export async function run({ interaction, client }: SlashCommandProps) {
  await interaction.deferReply();

  const guildSize = client.guilds.cache.size as number;

  const embed = new EmbedBuilder()
    .setTitle("Bot Infomation")
    .setDescription(
      "This bot is a simple bot that allows you to create notes with reminder and more!\nCheck out the github page, to learn to self-host the bot."
    )
    .addFields([
      { name: "`Total Guild Size`", value: `${guildSize}`, inline: true },
      { name: "`Bot Version`", value: config.version, inline: true },
      { name: "`Deno Version`", value: Deno.version.deno, inline: true },
      { name: "`V8 Version`", value: Deno.version.v8, inline: true },
      {
        name: "`TypeScript Version`",
        value: Deno.version.typescript,
        inline: true,
      },
    ])
    .setColor("Greyple");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("Invite to Server")
      .setURL(Deno.env.get("INVITE") as string)
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
      .setLabel("Support Server")
      .setURL("https://discord.gg/orabot")
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
      .setEmoji("⭐")
      .setLabel("Give a star on GitHub")
      .setURL("https://github.com/lassejlv/note-bot")
      .setStyle(ButtonStyle.Link)
  );

  interaction.editReply({ embeds: [embed], components: [row] });
}

export const options: CommandOptions = {
  userPermissions: ["Administrator", "AddReactions"],
  botPermissions: ["Administrator", "AddReactions"],
  deleted: false,
};
