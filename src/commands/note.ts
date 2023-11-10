import type { SlashCommandProps, CommandOptions } from "npm:commandkit";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from "npm:discord.js";
import moment from "npm:moment";
import Note from "../database/NoteModel.ts";
import RemindModel from "../database/RemindModel.ts";
import BackupModel from "../database/BackupModel.ts";
import ContentModel from "../database/ContentModel.ts";
import { config } from "../config.ts";
import { changeToNumber } from "../util.ts";
import { SelectMenu } from "../types/index.ts";

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
            ...config.times.map((time) => {
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
  )
  .addSubcommand((cmd) =>
    cmd
      .setName("edit")
      .setDescription("Edit an note")
      .addStringOption((option) =>
        option
          .setName("id")
          .setDescription("The id of the note to edit")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("new-title")
          .setDescription("The new title of the note")
          .setRequired(false)
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

            if (content.length > 67108864) {
              return interaction.followUp({
                content: `👿 Sir did you not go to school? I said \`MAX 1000 characters.\``,
              });
            }
            // Delete the message
            await m.delete();

            // End The Collector
            await collector.stop();

            // Create the note, use the Note interface
            const createANewNote = new Note({
              shortId: Math.random().toString(36).substr(2, 9),
              discord_id: interaction.user.id as string,
              title,
              privacy: privacy ?? ("public" as string),
            });

            await createANewNote.save();

            // Create a new note content
            const newContent = new ContentModel({
              discord_id: interaction.user.id as string,
              short_id: Math.random().toString(36).substr(2, 9),
              note_id: createANewNote.shortId,
              content: content,
            });

            await newContent.save();

            // Create a new reminder if it's provided
            if (remindAt) {
              const newReminder = new RemindModel({
                noteId: createANewNote.shortId,
                remindAt: Date.now() + changeToNumber(remindAt),
              });

              await newReminder.save();
            }

            // Reply to the user that the note has been created
            await interaction.editReply({
              content: "",
              embeds: [
                new EmbedBuilder()
                  .setTitle("Note Created")
                  .setDescription(
                    `Your note has been created with the title **${title}**\n\nUse \`/note list\` to view your note (${
                      privacy === "private"
                        ? "Only you can view this note"
                        : "Everyone can view this note"
                    })`
                  )
                  .setColor("Greyple"),
              ],
              components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                  new ButtonBuilder()
                    .setCustomId("create-backup")
                    .setLabel("Create a backup")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
                    .setEmoji("📥")
                ),
              ],
            });

            // Collector to listen for the button
            const filter = (i: any) => i.user.id === interaction.user.id;
            const collectorBackup =
              interaction.channel?.createMessageComponentCollector({
                filter,
                time: 180000,
              });

            collectorBackup?.on("collect", async (i) => {
              switch (i.customId) {
                case "create-backup": {
                  try {
                    const newBackup = new BackupModel({
                      short_id: Math.random().toString(36).substr(2, 9),
                      discord_id: interaction.user.id as string,
                      note_id: createANewNote.shortId,
                      title: createANewNote.title,
                      content: newContent.content,
                    });

                    await newBackup.save();

                    await i.update({
                      content: `👍 Done sir, i have created a backup of your note!`,
                      embeds: [],
                      components: [],
                    });

                    // Attempt to send message to the user
                    const user = await interaction.client.users.fetch(
                      interaction.user.id as string
                    );
                    await user.send({
                      embeds: [
                        new EmbedBuilder()
                          .setTitle("Backup Created")
                          .setDescription(
                            `A backup of your note has been created with the title **${title}**\n\nUse \`/backup list\` to view your backups. To load a backup, use \`/backup load id:${newBackup.short_id}\``
                          )
                          .setColor("Greyple"),
                      ],
                    });
                  } catch (error) {
                    console.log("Failed to create a backup");
                    return;
                  }
                }
              }
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
      const note = await Note.findOne({ shortId: id, privacy: "public" });
      const noteContent = await ContentModel.findOne({ note_id: id });
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
              .setDescription(`\`\`\`${noteContent?.content}\`\`\``)
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
                "Here is a list of your notes, sir! **(There are only shown 25 notes)**"
              )
              .setColor("Greyple")
              .setFooter({
                text: "Your Note ID will be shown when you select a note! (This will be changed in the feature)",
              }),
          ],
          components: [
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
              new StringSelectMenuBuilder()
                .setCustomId("note-list")
                .setPlaceholder("Select a note to view")
                .addOptions(
                  ...notes
                    // max size 25
                    .slice(0, 25)
                    .map((note): SelectMenu => {
                      return {
                        label: note.title,
                        description: `Created about ${moment(
                          note.createdAt
                        ).fromNow()}`,
                        value: note.shortId,
                      };
                    })
                )
            ),
          ],
        });
      }

      // Collector to listen for the select menu
      const filter = (i: any) => i.user.id === interaction.user.id;
      const collector = interaction.channel?.createMessageComponentCollector({
        filter,
        time: 600000, // Set to 10 minutes
      });

      collector?.on("collect", async (i) => {
        switch (i.customId) {
          case "note-list": {
            // @ts-ignore
            const value = i.values[0];
            const findNote = await Note.findOne({ shortId: value });
            const noteContent = await ContentModel.findOne({ note_id: value });
            //

            // @ts-ignore
            if (!findNote) {
              await i.update({
                content: `🥱 Sorry sir, i can't find that note any where in my database!`,
                embeds: [],
                components: [],
              });
            } else {
              const embed = new EmbedBuilder()
                .setTitle(`Note - ${findNote.title}`)
                .setDescription(`\`\`\`${noteContent?.content}\`\`\``)
                .setFooter({
                  text: `Last Updated: ${moment(
                    findNote.updatedAt
                  ).fromNow()} | ID: ${findNote.shortId}`,
                })
                .setColor("Greyple");

              try {
                await i.update({
                  ...(findNote.privacy === "public" && {
                    content: `**🔗 Share this note using this cmd:** \`/note view id:${findNote.shortId}\``,
                  }),
                  embeds: [embed],
                  components: [],
                });
              } catch (error) {
                await interaction.followUp({
                  ephemeral: true,
                  content: `🥱 Sorry sir, i could not edit the message!`,
                  embeds: [],
                  components: [],
                });
              }
            }
          }
        }
      });

      collector?.on("end", async (i, reason) => {
        console.log(reason);
      });

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
            `**Are you sure you wan't to delete note?** ${note.title} (\`${note.shortId}\`)\n(*If you have created a backup, you can restore it later*)`
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

      collector?.on("collect", async (i) => {
        switch (i.customId) {
          case "cancel": {
            await i.update({
              content: `👍 Okay sir, i will not delete that note!`,
              embeds: [],
              components: [],
            });

            break;
          }

          case "confirm": {
            // Delete the note
            await Note.deleteOne({ shortId: id }).catch((err: any) =>
              console.log("Failed to delete note")
            );

            // Delete the note content
            await ContentModel.deleteOne({ note_id: id }).catch((err: any) =>
              console.log("Failed to delete note content")
            );

            await i.update({
              content: `👍 Done sir, i have deleted the note!`,
              embeds: [],
              components: [],
            });
          }
        }
      });

      collector?.on("end", async (i, reason: string) => {
        console.log(reason);
      });

      break;
    }
    case "edit": {
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
        let newTitle = (await interaction.options.getString(
          "new-title"
        )) as string;
        if (!newTitle) {
          newTitle = note.title;
        } else {
          await interaction.editReply({
            content: `😀 Sir, please write your updated note below, you have 10 minutes!\n\n\`MAX 1000 characters\``,
          });

          const filter = (m: any) => m.author.id === interaction.user.id;
          const collector = interaction.channel?.createMessageCollector({
            filter,
            time: 600000,
          });

          collector?.on("collect", async (m) => {
            // Delete the message
            await m.delete();

            if (m.content.length > 1000) {
              await interaction.followUp({
                content: `👿 Sir did you not go to school? I said \`MAX 1000 characters.\``,
              });
            } else if (m.content.length < 3) {
              await interaction.followUp({
                content: `💀 Sir no one edits a note that are less than \`3 characters\``,
              });
            } else {
              note.title = newTitle;
              note.content = m.content;
              await note.save();

              // End The Collector
              await collector.stop();

              // Reply to the user that the note has been created
              await interaction.editReply({
                content: "",
                embeds: [
                  new EmbedBuilder()
                    .setTitle("Note Edited")
                    .setDescription(
                      `Your note has been edited with the title **${newTitle}**\n\nUse \`/note list\` to view your note (${
                        note.privacy === "private"
                          ? "Only you can view this note"
                          : "Everyone can view this note"
                      })`
                    )
                    .setColor("Greyple"),
                ],
              });
            }
          });
        }
      }

      break;
    }
  }
}

export const options: CommandOptions = {
  userPermissions: ["Administrator", "AddReactions"],
  botPermissions: ["Administrator", "AddReactions"],
  deleted: false,
};
