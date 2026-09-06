import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import {
  AttachmentBuilder,
  ChannelType,
  EmbedBuilder,
  MessageFlags,
  type ButtonInteraction,
} from "discord.js";
import { config } from "../config/app.ts";
import { interactionKeys } from "../constants/interactions.ts";
import { client } from "../index.ts";
import { buildTranscripts } from "../lib/transcripts.ts";

export class TicketClose extends InteractionHandler {
  public constructor(context: InteractionHandler.LoaderContext) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.Button,
      enabled: config.modules.tickets.enabled,
    });
  }

  public async run(interaction: ButtonInteraction) {
    const category = await interaction.guild?.channels.fetch(
      config.modules.tickets.category,
    );

    if (
      category &&
      interaction.guild &&
      category.type === ChannelType.GuildCategory
    ) {
      const embed = interaction.message.embeds[0];
      // const transcript = (
      //   await interaction.channel?.messages.fetch({ limit: 100 })
      // )
      //   ?.filter((msg) => !msg.author.bot)
      //   .map(
      //     (msg) =>
      //       `(${new Date(msg.createdTimestamp).toLocaleString()}) [${msg.author.tag}] ${msg.content}`,
      //   )
      //   .reverse()
      //   .join("\n\n");
      const messages = await interaction.channel?.messages.fetch({
        limit: 100,
      });
      const transcriptsChannel = await interaction.guild.channels.fetch(
        config.modules.tickets.transcripts,
      );
      let transcript;

      if (messages)
        transcript = await buildTranscripts(
          client,
          [...messages.values()].reverse(),
        );

      await interaction.channel?.delete();

      let user;

      if (embed) {
        const embedLog = EmbedBuilder.from(embed).setTitle("Ticket Closed");

        const attachment = transcript
          ? new AttachmentBuilder(Buffer.from(transcript), {
              name: "transcript.html",
            })
          : null;

        if (embed.footer) {
          user = await client.users.fetch(embed.footer.text);

          await user.send({
            embeds: [embedLog.setThumbnail(interaction.guild.iconURL())],
            files: attachment ? [attachment] : [],
          });
        }

        if (transcriptsChannel?.isSendable())
          await transcriptsChannel.send({
            embeds: user
              ? [embedLog.setThumbnail(user.displayAvatarURL())]
              : [],
            files: attachment ? [attachment] : [],
          });
      }
    } else {
      return await interaction.reply({
        content: "This interaction is only allowed in ticket channels.",
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  public parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith(interactionKeys.ticketClose))
      return this.none();

    return this.some();
  }
}
