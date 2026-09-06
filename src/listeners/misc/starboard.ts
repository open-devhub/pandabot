import { Listener } from "@sapphire/framework";
import type { MessageReaction, PartialMessageReaction } from "discord.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events,
} from "discord.js";
import { config } from "../../config/app.ts";
import { colors } from "../../constants/colors.ts";

export class Starboard extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      event: Events.MessageReactionAdd,
      enabled: config.modules.starboard.enabled,
    });
  }

  public async run(reaction: MessageReaction | PartialMessageReaction) {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();

    if (!reaction.message.author) return;

    if (
      // ignore reactions in starboard channel itself
      reaction.message.channelId === config.modules.starboard.channel ||
      // starboard excluded channels
      (config.modules.starboard.exclude.channels as string[]).includes(
        reaction.message.channelId,
      ) ||
      // starboard excluded categories
      ("parentId" in reaction.message.channel &&
        // reaction.message.channel.parentId &&
        (config.modules.starboard.exclude.categories as string[]).includes(
          reaction.message.channel.parentId as string,
        ))
    )
      return;

    const reactions = reaction.message.reactions.cache.filter(
      (r) =>
        config.modules.starboard.emojis.includes(r.emoji.name ?? "") &&
        r.count >= config.modules.starboard.reactionsRequired,
    );

    if (reactions.size === 0) return;

    const topReaction = reactions
      .reduce((max, r) => (r.count > max.count ? r : max), reactions.first())
      .emoji.toString();

    const starboardChannel = await reaction.message.guild?.channels.fetch(
      config.modules.starboard.channel,
    );

    if (!starboardChannel || !starboardChannel.isTextBased()) return;

    const exists = (await starboardChannel.messages.fetch({ limit: 50 })).find(
      (msg) => msg.embeds[0]?.footer?.text.includes(reaction.message.id),
    );

    if (exists) return;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: reaction.message.author.tag,
        iconURL: reaction.message.author.displayAvatarURL(),
      })
      .setFooter({ text: reaction.message.id })
      .setColor(colors.primary);

    if (reaction.message.content)
      embed.setDescription(`>>> ${reaction.message.content}`);

    const attachment = reaction.message.attachments.first();
    if (attachment?.contentType?.startsWith("image/"))
      embed.setImage(attachment.url);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Jump to Message")
        .setStyle(ButtonStyle.Link)
        .setURL(reaction.message.url),
    );

    const msg = await starboardChannel.send({
      embeds: [embed],
      components: [row],
    });

    await msg.react(topReaction);
  }
}
