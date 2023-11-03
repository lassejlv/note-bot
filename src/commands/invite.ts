import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "npm:commandkit";
import { EmbedBuilder } from "npm:discord.js";

export const data: CommandData = {
  name: "invite",
  description: "Returns an invite link for the bot",
};

export async function run({ interaction, client, handler }: SlashCommandProps) {
  await interaction.deferReply();
  const embed = new EmbedBuilder()
    .setTitle("Thank's for inviting me!")
    .setURL(Deno.env.get("INVITE") as string)
    .setDescription(
      `Thank's for inviting me to your server [(click here or the title)](${Deno.env.get(
        "INVITE"
      )})\n To get started use: \`/help\`\nIn case your need more help, join our [support server](https://discord.gg/orabot)`
    )
    .setColor("Greyple")
    .setFooter({
      text: "Made with ❤️ by lasse",
    });

  await interaction.editReply({
    embeds: [embed],
  });
}

export const options: CommandOptions = {
  userPermissions: ["Administrator", "AddReactions"],
  botPermissions: ["Administrator", "AddReactions"],
  deleted: false,
};
