import type { SlashCommandProps, CommandOptions } from "npm:commandkit";
import { EmbedBuilder, SlashCommandBuilder } from "npm:discord.js";
import moment from "npm:moment"
import Note from "../database/NoteModel.ts"



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
      ).addStringOption((option) =>
        option.setName("privacy")
          .setDescription("The privacy of your note")
          .addChoices({
            name: "Public",
            value: "public"
          }, {
            name: "Private",
            value: "private"
          })
          .setRequired(true)
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

  );

export async function run({ interaction, client, handler }: SlashCommandProps) {
  await interaction.deferReply();
  const command = await interaction.options.getSubcommand();

  switch (command) {
    case "create": {
      const title = await interaction.options.getString("title") as string;
      const privacy = await interaction.options.getString("privacy") as 'public' | 'private';
      let content: string;
    

      // Reply a message to ask for the content of the note
      await interaction.editReply({
        content: `😐 Please enter the content of your note. You have 10 minutes to do so.\n\n\`MAX 1000 characters\``
      })

      const filter = (m: any) => m.author.id as string === interaction.user.id as string;
      const collector = interaction.channel?.createMessageCollector({
        filter,
        time: 600000, // 10 minutes
      });

      collector?.on("collect", async (m) => {
        try {
          if (m.content.length > 1000) {
            await interaction.followUp({
              content: `👿 Sir did you not go to school? I said \`MAX 1000 characters.\`` 
            })
           
          } else if (m.content.length < 3) {
            await interaction.followUp({
              content: `💀 Sir no one creates a note that are less than \`3 characters\``
            })
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
              privacy: privacy ?? "public" as string,
           })

           await createANewNote.save();

            // Reply to the user that the note has been created
            await interaction.followUp({
             embeds: [
              new EmbedBuilder()
                .setTitle("Note Created")
                .setDescription(`Your note has been created with the title **${title}**\n\nUse \`/note view ${createANewNote.shortId}\` to view your note (${privacy === "private" ? "Only you can view this note" : "Everyone can view this note"})`)
                .setColor("Greyple"),
              ]
            })
           
          }
        } catch (error) {
          console.log(error.message);
        }
      })

      break;
    }
    case "view": {
      const id = await interaction.options.getString("id") as string;
      const note = await Note.findOne({ shortId: id });
      if (!note) {
        return interaction.editReply({
          content: `🥱 Sorry sir, i can't find that note any where in my database!`
        })
      } else if (note.privacy === "private" && interaction.user.id !== note.discord_id) {
        return interaction.editReply({
          content: `🔐 This not is private, and your are not author of this note!`
        })
      } else {
        await interaction.followUp({
          ephemeral: note.privacy === "private" ? true : false,
          embeds: [
            new EmbedBuilder()
              .setTitle(`Note - ${note.title}`)
              .setDescription(`\`\`\`${note.content}\`\`\``)
              .setFooter({
                text: `Created about ${moment(note.createdAt).fromNow()} and was edited about ${moment(note.updatedAt).fromNow()}`
              })
              .setColor("Greyple")
          ],
         
          
        })
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
