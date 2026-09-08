import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import type { ModalSubmitInteraction } from "discord.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  type ButtonInteraction,
} from "discord.js";
import { config } from "../config/app.ts";
import { colors } from "../constants/colors.ts";
import { interactionKeys } from "../constants/interactions.ts";
import { generateId } from "../lib/id.ts";

export class TicketOpen extends InteractionHandler {
  public constructor(context: InteractionHandler.LoaderContext) {
    super(context, {
      interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
      enabled: config.modules.tickets.enabled,
    });
  }

  public async run(interaction: ModalSubmitInteraction) {
    const category = await interaction.guild?.channels.fetch(
      config.modules.tickets.category,
    );

    if (
      category &&
      interaction.guild &&
      category.type === ChannelType.GuildCategory
    ) {
      const reason = interaction.fields.getTextInputValue(
        interactionKeys.ticketReason,
      );
      const id = generateId();
      const name = `ticket-${id}`;

      const ticket = await category.children.create({
        name,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel],
          },
          ...config.modules.tickets.mods.map((mod) => ({
            id: mod,
            allow: [PermissionFlagsBits.ViewChannel],
          })),
        ],
      });

      const embed = new EmbedBuilder()
        .setTitle(`Ticket by ${interaction.user.tag}`)
        .addFields([
          {
            name: "By",
            value: interaction.user.toString(),
            inline: true,
          },
          {
            name: "ID",
            value: id,
            inline: true,
          },
          {
            name: "Date",
            value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
            inline: true,
          },
          {
            name: "Reason",
            value: reason,
          },
        ])
        .setColor(colors.primary)
        .setFooter({ text: interaction.user.id })
        .setThumbnail(interaction.user.displayAvatarURL());

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(interactionKeys.ticketClose)
          .setLabel("Close ticket")
          .setStyle(ButtonStyle.Danger),
      );

      const ticketMessage = await ticket.send({
        content: `${interaction.user} ${config.modules.tickets.mention.map((m) => `<@&${m}>`).join(" ")}`,
        embeds: [embed],
        components: [row],
      });
      await ticketMessage.pin();

      await interaction.reply({
        content: `Ticket created: ${ticket}`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      return await interaction.reply({
        content: "Something went wrong. Please try again later.",
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  public parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith(interactionKeys.ticketOpen))
      return this.none();

    return this.some();
  }
}
