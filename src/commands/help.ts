import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "npm:commandkit";
import { EmbedBuilder } from "npm:discord.js";

export const data: CommandData = {
  name: "help",
  description: "Returns a list of all my commands",
};

export async function run({ interaction, client, handler }: SlashCommandProps) {
  await interaction.deferReply();
  const commands = await interaction.client.application.commands.fetch();

  const embed = new EmbedBuilder()
    .setTitle("Help Menu")
    .setDescription(
      `Here are all my commands: \n${commands
        .map((cmd) => {
          return `**${cmd.name}**: \`${cmd.description}\` ${
            cmd.options.length > 2
              ? `\n${cmd.options
                  .map((option) => {
                    return `> **${option.name}** - \`${option.description}\`\n`;
                  })
                  .join(" ")}`
              : ""
          }\n`;
        })
        .join(" ")}`
    )
    .setColor("Greyple");

  await interaction.editReply({
    embeds: [embed],
  });
}

export const options: CommandOptions = {
  userPermissions: ["Administrator", "AddReactions"],
  botPermissions: ["Administrator", "AddReactions"],
  deleted: false,
};
