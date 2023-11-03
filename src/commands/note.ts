import type { SlashCommandProps, CommandOptions } from "npm:commandkit";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} from "npm:discord.js";
import moment from "npm:moment";
import Note from "../database/NoteModel.ts";
import { config } from "../config.ts";
import { changeToNumber } from "../util.ts";
import RemindModel from "../database/RemindModel.ts";

export const data = new SlashCommandBuilder()
  .setName("note")
  .setDescription("Slash command to create a note")
  .addSubcommand((cmd) =>
    cmd
      .setName("create")
      .setDescription("Create an new note")
      .addStringOption((option) =>
        option
          .setName("title")
          .setDescription("The title of your note")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("privacy")
          .setDescription("The privacy of your note")
          .addChoices(
            {
              name: "Public",
              value: "public",
            },
            {
              name: "Private",
              value: "private",
            }
          )
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("remind-me")
          .setDescription(
            "Remind me about this note in 1 hour or a different time"
          )
          .addChoices(
            ...config.times.map((time: any) => {
              return {
                name: `${time.name}`,
                value: `${time.value}`,
              };
            })
          )
      )
  )
  .addSubcommand((cmd) =>
    cmd
      .setName("view")
      .setDescription("View a note")
      .addStringOption((option) =>
        option
          .setName("id")
          .setDescription("The ID of the note you want to view")
          .setRequired(true)
      )
  )
  .addSubcommand((cmd) =>
    cmd.setName("list").setDescription("Returns a list of your notes")
  )
  .addSubcommand((cmd) =>
    cmd
      .setName("delete")
      .setDescription("Delete an note")
      .addStringOption((option) =>
        option
          .setName("id")
          .setDescription("The id of the note to delete")
          .setRequired(true)
      )
  );

export async function run({ interaction }: SlashCommandProps) {
  await interaction.deferReply({ ephemeral: true });
  const command = await interaction.options.getSubcommand();

  switch (command) {
    case "create": {
      const title = (await interaction.options.getString("title")) as string;
      const privacy = (await interaction.options.getString("privacy")) as
        | "public"
        | "private";
      const remindAt = await interaction.options.getString("remind-me");
      let content: string;

      // Reply a message to ask for the content of the note
      await interaction.editReply({
        content: `😐 Please enter the content of your note. You have 10 minutes to do so.\n\n\`MAX 1000 characters\``,
      });

      const filter = (m: any) =>
        (m.author.id as string) === (interaction.user.id as string);
      const collector = interaction.channel?.createMessageCollector({
        filter,
        time: 600000, // 10 minutes
      });

      collector?.on("collect", async (m) => {
        try {
          if (m.content.length > 1000) {
            await interaction.followUp({
              content: `👿 Sir did you not go to school? I said \`MAX 1000 characters.\``,
            });
          } else if (m.content.length < 3) {
            await interaction.followUp({
              content: `💀 Sir no one creates a note that are less than \`3 characters\``,
            });
          } else {
            content = m.content;

            // End The Collector
            await collector.stop();

            // Create the note, use the Note interface
            const createANewNote = new Note({
              shortId: Math.random().toString(36).substr(2, 9),
              discord_id: interaction.user.id as string,
              title,
              content,
              privacy: privacy ?? ("public" as string),
            });

            await createANewNote.save();

            if (remindAt) {
              const newReminder = new RemindModel({
                noteId: createANewNote.shortId,
                remindAt: Date.now() + changeToNumber(remindAt as string),
              });

              console.log("Created a new reminder");
            }

            // Reply to the user that the note has been created
            await interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setTitle("Note Created")
                  .setDescription(
                    `Your note has been created with the title **${title}**\n\nUse \`/note view id:${
                      createANewNote.shortId
                    }\` to view your note (${
                      privacy === "private"
                        ? "Only you can view this note"
                        : "Everyone can view this note"
                    })`
                  )
                  .setColor("Greyple"),
              ],
            });
          }
        } catch (error) {
          console.log(error.message);
        }
      });

      break;
    }
    case "view": {
      const id = (await interaction.options.getString("id")) as string;
      const note = await Note.findOne({ shortId: id });
      if (!note) {
        return interaction.editReply({
          content: `🥱 Sorry sir, i can't find that note any where in my database!`,
        });
      } else if (
        note.privacy === "private" &&
        interaction.user.id !== note.discord_id
      ) {
        return interaction.editReply({
          content: `🔐 This note is private, and your are not author of this note!`,
        });
      } else {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`Note - ${note.title}`)
              .setDescription(`\`\`\`${note.content}\`\`\``)
              .setFooter({
                text: `Created about ${moment(
                  note.createdAt
                ).fromNow()} and was edited about ${moment(
                  note.updatedAt
                ).fromNow()}`,
              })
              .setColor("Greyple"),
          ],
        });
      }

      break;
    }
    case "list": {
      const notes = await Note.find({ discord_id: interaction.user.id });
      if (notes.length === 0) {
        return interaction.editReply({
          content: `🥱 Sorry sir, but it seems like you don't have created any notes so far! Use \`/note create\` to create one!`,
        });
      } else {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`Your Notes`)
              .setDescription(
                `
              ${notes
                .map((note) => {
                  return `**${note.title}** - \`${note.shortId}\` - ⏱ ${moment(
                    note.createdAt
                  ).fromNow()}\n`;
                })
                .join(" ")}
              `
              )
              .setColor("Greyple")
              .setFooter({ text: "/note view id:<id>" }),
          ],
        });
      }
      break;
    }
    case "delete": {
      const id = (await interaction.options.getString("id")) as string;
      const note = await Note.findOne({ shortId: id });
      if (!note) {
        return interaction.editReply({
          content: `🥱 Sorry sir, i can't find that note any where in my database!`,
        });
      } else if (note.discord_id !== interaction.user.id) {
        return interaction.editReply({
          content: `🥱 Sorry sir, but this note is not yours!!`,
        });
      } else {
        const embed = new EmbedBuilder()
          .setDescription(
            `**Are you sure you wan't to delete note?** ${note.title} (\`${note.shortId}\`)`
          )
          .setColor("Greyple");

        const confirm = new ButtonBuilder()
          .setCustomId("confirm")
          .setLabel("Yes, Delete It")
          .setStyle(ButtonStyle.Danger);

        const cancel = new ButtonBuilder()
          .setCustomId("cancel")
          .setLabel("Nahh, Never Mind")
          .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          cancel,
          confirm
        );

        await interaction.editReply({
          embeds: [embed],
          components: [row],
        });
      }

      const filter = (i: any) => i.user.id === interaction.user.id;
      const collector = interaction.channel?.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      collector?.on("collect", async (i) => {});

      collector?.on("end", async (i, reason) => {
        console.log(reason);
      });

      break;
    }
  }
}

export const options: CommandOptions = {
  userPermissions: ["Administrator", "AddReactions"],
  botPermissions: ["Administrator", "AddReactions"],
  deleted: false,
};
