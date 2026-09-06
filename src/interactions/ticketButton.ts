import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import {
  ChannelType,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction,
} from "discord.js";
import { config } from "../config/app.ts";
import { interactionKeys } from "../constants/interactions.ts";

export class TicketButton extends InteractionHandler {
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
      const input = new TextInputBuilder()
        .setCustomId(interactionKeys.ticketReason)
        .setLabel("What can we help you with?")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const modal = new ModalBuilder()
        .setCustomId(interactionKeys.ticketOpen)
        .setTitle("Thank you for opening this ticket!")
        .addComponents(input);

      interaction.showModal(modal);
    } else {
      return await interaction.reply({
        content: "Ticket setup not complete yet. Try again later.",
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  public parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith(interactionKeys.ticketButton))
      return this.none();

    return this.some();
  }
}
