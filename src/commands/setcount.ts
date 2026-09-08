import { Args, Command } from "@sapphire/framework";
import {
  MessageFlags,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
  type Message,
} from "discord.js";
import { open } from "lmdb";
import path from "path";
import { dbkeys, dbPath } from "../constants/db.ts";
import type { CountDB } from "../types/counting.ts";

const db = open<CountDB, string>(path.join(dbPath, dbkeys.counting), {});

export class SetCount extends Command {
  public constructor(context: Command.LoaderContext) {
    super(context, {
      name: "setcount",
      description: "Set the current count manually",
      requiredUserPermissions: [PermissionFlagsBits.Administrator],
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addIntegerOption((option) =>
          option
            .setName("count")
            .setDescription("Count to set to")
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option.setName("saves").setDescription("Saves to set to"),
        ),
    );
  }

  async messageRun(message: Message, args: Args) {
    if (message.author.bot) return;

    const data = db.get(dbkeys.counting) ?? {
      lastUser: "",
      lastCount: 0,
      saves: 0,
    };

    const { lastUser, lastCount, saves } = data;

    const lastCountArg = await args.pick("integer").catch(() => lastCount);
    const savesArg = await args.pick("integer").catch(() => saves);

    db.put(dbkeys.counting, {
      lastUser,
      lastCount: lastCountArg,
      saves: savesArg,
    });

    await message.reply(
      `Count updated to ${lastCountArg}, the next number should be ${lastCountArg + 1}`,
    );
  }

  async chatInputRun(interaction: ChatInputCommandInteraction) {
    const data = db.get(dbkeys.counting) ?? {
      lastUser: "",
      lastCount: 0,
      saves: 0,
    };

    const { lastUser, lastCount, saves } = data;

    const lastCountOpt =
      interaction.options.getInteger("count", true) ?? lastCount;
    const savesOpt = interaction.options.getInteger("saves") ?? saves;

    db.put(dbkeys.counting, {
      lastUser,
      lastCount: lastCountOpt,
      saves: savesOpt,
    });

    await interaction.reply({
      content: `Count updated to ${lastCountOpt}, the next number should be ${lastCountOpt + 1}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
