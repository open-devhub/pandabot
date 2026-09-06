import { Command } from "@sapphire/framework";
import type { ChatInputCommandInteraction, Message } from "discord.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { config } from "../config/app.ts";
import { colors } from "../constants/colors.ts";
import { interactionKeys } from "../constants/interactions.ts";

export class Tickets extends Command {
  public constructor(context: Command.LoaderContext) {
    super(context, {
      name: "tickets",
      aliases: ["ticket"],
      description: "Post ticket embed",
      preconditions: ["AdminOnly"],
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    if (config.modules.tickets.enabled) {
      registry.registerChatInputCommand((builder) =>
        builder.setName(this.name).setDescription(this.description),
      );
    }
  }

  public async messageRun(message: Message) {
    if (message.author.bot) return;

    const embed = new EmbedBuilder()
      .setTitle("Tickets")
      .setDescription(config.modules.tickets.text)
      .setColor(colors.primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(interactionKeys.ticketButton)
        .setLabel("Create a ticket")
        .setStyle(ButtonStyle.Primary),
    );

    if (message.channel.isSendable())
      await message.channel.send({ embeds: [embed], components: [row] });
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setTitle("Tickets")
      .setDescription(config.modules.tickets.text)
      .setColor(colors.primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(interactionKeys.ticketButton)
        .setLabel("Create a ticket")
        .setStyle(ButtonStyle.Primary),
    );

    if (interaction.channel?.isSendable())
      await interaction.channel.send({ embeds: [embed], components: [row] });
  }
}
