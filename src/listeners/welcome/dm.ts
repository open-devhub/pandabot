import { Listener } from "@sapphire/framework";
import type { GuildMember } from "discord.js";
import { EmbedBuilder, Events } from "discord.js";
import { config } from "../../config/app.ts";
import { colors } from "../../constants/colors.ts";

export class WelcomeDM extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      event: Events.GuildMemberAdd,
      enabled: config.modules.welcome.dm,
    });
  }

  public async run(member: GuildMember) {
    if (member.user.bot) return;

    const embed = new EmbedBuilder()
      .setTitle(`Welcome ${member.user.tag} to ${member.guild.name}!`)
      .setDescription(
        [
          `Welcome ${member}, We're delighted to have you join us in ${member.guild.name}!`,
          `Take a moment to explore the channels, introduce yourself, and connect with the community.`,
          `Once again, a warm welcome aboard, we look forward to your contributions and conversations! 🌟`,
        ].join("\n"),
      )
      .setThumbnail(member.guild.iconURL())
      .setColor(colors.primary)
      .setTimestamp();

    await member.send({ embeds: [embed] });
  }
}
