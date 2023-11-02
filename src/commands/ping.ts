import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "npm:commandkit";

export const data: CommandData = {
  name: "ping",
  description: "Pong!",
};

export function run({ interaction, client, handler }: SlashCommandProps) {
  interaction.reply(`:ping_pong: Pong! ${client.ws.ping}ms`);
}

export const options: CommandOptions = {
  userPermissions: ["Administrator", "AddReactions"],
  botPermissions: ["Administrator", "AddReactions"],
  deleted: false,
};
