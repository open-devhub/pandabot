import { Command } from "@sapphire/framework";
import type { ChatInputCommandInteraction } from "discord.js";
import { EmbedBuilder, MessageFlags } from "discord.js";
import { config } from "../config/app.ts";
import { colors } from "../constants/colors.ts";

export class Suggest extends Command {
  public constructor(context: Command.LoaderContext) {
    super(context, {
      name: "suggest",
      description: "Submit a suggestion",
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    if (config.modules.suggestion.enabled) {
      registry.registerChatInputCommand((builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addStringOption((option) =>
            option
              .setName("suggestion")
              .setDescription("The suggestion you want to make")
              .setRequired(true),
          )
          .addAttachmentOption((option) =>
            option
              .setName("attachment")
              .setDescription("Image attachment for the suggestion"),
          ),
      );
    }
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const text = interaction.options.getString("suggestion", true);
    const attachment = interaction.options.getAttachment("attachment");

    const suggestionChannel = await interaction.guild?.channels.fetch(
      config.modules.suggestion.channel,
    );

    if (!suggestionChannel || !suggestionChannel.isTextBased())
      return await interaction.reply({
        content: "Suggestion system not configured yet.",
        flags: MessageFlags.Ephemeral,
      });

    // only 4/10 consecutive suggestions can be from the same user
    const spam =
      (await suggestionChannel.messages.fetch({ limit: 10 })).filter(
        (msg) => msg.embeds[0]?.footer?.text === interaction.user.id,
      ).size > 4;

    if (spam)
      return await interaction.reply({
        content:
          "You already have sent enough suggestions for this round. Try again later.",
        flags: MessageFlags.Ephemeral,
      });

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `New suggestion by ${interaction.user.globalName}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setDescription(text)
      .setColor(colors.primary)
      .setFooter({ text: interaction.user.id })
      .setTimestamp();

    if (attachment?.contentType?.startsWith("image/"))
      embed.setImage(attachment.url);

    if (suggestionChannel.isSendable()) {
      const suggestion = await suggestionChannel.send({ embeds: [embed] });

      await interaction.reply({
        content: "Suggestion submitted successfully.",
        flags: MessageFlags.Ephemeral,
      });

      await suggestion.react("👍");
      await suggestion.react("👎");
      await suggestion.react("🤷");
    } else {
      await interaction.reply({
        content:
          "Couldn't send suggestions at this time. Please try again later.",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
