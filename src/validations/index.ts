import type { ValidationFunctionProps } from "npm:commandkit";
import { ChannelType } from "npm:discord.js";
import CooldownModel from "../database/CooldownModel.ts";

export default async function ({ interaction }: ValidationFunctionProps) {
  const cooldowns = await CooldownModel.find({});

  // Make sure commands not can be run in DM's
  if (interaction.channel?.type === ChannelType.DM) {
    try {
      await interaction.reply({
        content: `🙋‍♂️ Hey Sir, rigth now you can't use slash commands in my DM's. But in the near feature you will be able to!`,
      });

      return true;
    } catch (error: any) {
      console.log(error.message);
    }
  } else if (
    cooldowns.find(
      (cooldown: any) => cooldown.discord_id === interaction.user.id
    )
  ) {
    try {
      await interaction.reply({
        content: `🙋‍♂️ Hey Sir, you are on cooldown. Please wait a few seconds before you can use this command again.`,
      });

      return true;
    } catch (error: any) {
      console.log(error.message);
    }
  } else if (
    !cooldowns.find(
      (cooldown: any) => cooldown.discord_id === interaction.user.id
    )
  ) {
    try {
      await CooldownModel.create({
        discord_id: interaction.user.id,
        time: Date.now() + 5000,
      });

      return false;
    } catch (error: any) {
      console.log(error.message);
    }
  }
}
