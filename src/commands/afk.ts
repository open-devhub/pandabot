import { Args, Command } from "@sapphire/framework";
import type { ChatInputCommandInteraction, Message } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { open } from "lmdb";
import path from "path";
import { config } from "../config/app.ts";
import { colors } from "../constants/colors.ts";
import { dbkeys, dbPath } from "../constants/db.ts";
import type { AFKDB } from "../types/afk.ts";

const db = open<AFKDB, string>(path.join(dbPath, dbkeys.afk), {
  compression: true,
});

export class PingCommand extends Command {
  public constructor(context: Command.LoaderContext) {
    super(context, {
      name: "afk",
      description: "Notify friends when you get a mention while afk",
      options: ["text"],
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    if (config.modules.afk.enabled) {
      registry.registerChatInputCommand((builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addStringOption((option) =>
            option
              .setName("text")
              .setDescription("The text to show when you're mentioned"),
          ),
      );
    }
  }

  public async messageRun(message: Message, args: Args) {
    if (message.author.bot || !config.modules.afk.enabled) return;

    const entry = db.get(message.author.id);

    const reason = await args.rest("string").catch(() => null);

    db.put(message.author.id, { ...entry, reason });

    const embed = new EmbedBuilder()
      .setDescription(`Set your status to AFK${reason ? `: ${reason}` : ""}`)
      .setColor(colors.success)
      .setAuthor({
        name: message.author.displayName,
        iconURL: message.author.displayAvatarURL(),
      });

    await message.reply({ embeds: [embed] });
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const entry = db.get(interaction.user.id);

    const reason = interaction.options.getString("text");

    db.put(interaction.user.id, { ...entry, reason });

    const embed = new EmbedBuilder()
      .setDescription(`Set your status to AFK${reason ? `: ${reason}` : ""}`)
      .setColor(colors.success)
      .setAuthor({
        name: interaction.user.displayName,
        iconURL: interaction.user.displayAvatarURL(),
      });

    await interaction.reply({ embeds: [embed] });
  }
}
