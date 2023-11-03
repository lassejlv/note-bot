import { Activities } from "../../types/index.ts";
import { ActivityType, type Client } from "npm:discord.js";
import type { CommandKit } from "npm:commandkit";
// @ts-ignore
import { Logger } from "npm:term-logger@latest";

export default function (
  c: Client<true>,
  client: Client<true>,
  handler: CommandKit
) {
  // Set the status of the bot
  const activities: Activities[] = [
    {
      name: "custom",
      state: "/help for commands",
      type: ActivityType.Custom,
    },
    {
      name: "custom",
      state: "Serving " + c.guilds.cache.size + " servers",
      type: ActivityType.Custom,
    },

    {
      name: "custom",
      state: "Serving " + c.users.cache.size + " users",
      type: ActivityType.Custom,
    },
  ];

  setInterval(() => {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    c.user.setActivity(activity.state, { type: activity.type });
  }, 5000);

  Logger.success(`Client ${client.user.tag} is now ready to go!`);
}
