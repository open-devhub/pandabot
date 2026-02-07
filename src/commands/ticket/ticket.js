const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ChannelType,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
} = require("discord.js");

const { serverConfig } = require("../../../config.json");
const buildModal = require("../../utils/buildModal");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (interaction.user.bot) return;
    const { ticketCategory, moderatorRoleId } = serverConfig;

    const embedContent = `This channel is here to explain how our ticket system works and keep everything organized.

Tickets are the best way to get help and ensure moderators can respond quickly. Here’s what you can use them for:
- 🧩 General Support: For questions, technical issues, or anything else you need assistance with, tickets help us track and resolve them.
- 🎭 Request Unban / Unmute: If you or a friend need to appeal a ban, mute or suspend, open a ticket and provide the details.
- 🚨 Report User: If you need to report someone, tickets make sure the moderators see it right away and can investigate properly.
- ⚒️ Apply For Staff: Interested in joining our moderation team? Use a ticket to submit your application and tell us why you’d be a great fit.
- 📝 Other: For any other reasons, open a ticket and explain your situation.

You’ll be guided through a simple form to explain your reason. I will handle the process, create a private channel for your case, and keep everything neat and secure. Thanks for helping us keep the community clean ✨`;

    const selectMenu = [
      {
        label: "🧩 General Support",
        value: "support",
        fields: [
          {
            customId: "reason",
            label: "What do you need help with?",
            style: "PARAGRAPH",
            placeholder: "Explain what you need help with",
            required: true,
            maxLength: 1024,
          },
        ],
      },
      {
        label: "🎭 Request Unban / Unmute",
        value: "appeal",
        fields: [
          {
            customId: "reason",
            label: "Reason",
            style: "PARAGRAPH",
            placeholder: "Explain why you are requesting unban/unmute",
            required: true,
            maxLength: 1024,
          },
        ],
      },
      {
        label: "🚨 Report User",
        value: "report",
        fields: [
          {
            customId: "reason",
            label: "Who are you reporting and why?",
            style: "PARAGRAPH",
            placeholder: "Provide details about the user you are reporting",
            required: true,
            maxLength: 1024,
          },
        ],
      },
      {
        label: "⚒️ Apply For Staff",
        value: "staff",
        fields: [
          {
            customId: "reason",
            label: "Why do you want to join the staff team?",
            style: "PARAGRAPH",
            placeholder: "Explain why you want to join the staff team",
            required: true,
            maxLength: 1024,
          },
          {
            customId: "experience",
            label: "Do you have any prior moderation experience?",
            style: "PARAGRAPH",
            placeholder: "Describe any prior moderation experience you have",
            required: false,
            maxLength: 1024,
          },
        ],
      },
      {
        label: "📝 Other",
        value: "other",
        fields: [
          {
            customId: "reason",
            label: "Reason",
            style: "PARAGRAPH",
            placeholder: "Explain why you are opening this ticket",
            required: true,
            maxLength: 1024,
          },
        ],
      },
    ];

    const select = new StringSelectMenuBuilder()
      .setCustomId("ticket_type_select")
      .setPlaceholder("Select ticket type")
      .addOptions(
        selectMenu.map(
          (option) =>
            new StringSelectMenuOptionBuilder({
              label: option.label,
              value: option.value,
            }),
        ),
      );

    const row = new ActionRowBuilder().addComponents(select);

    const embed = new EmbedBuilder()
      .setTitle("🎫 Tickets")
      .setDescription(embedContent);

    await interaction.deferReply({ ephemeral: true });

    const message = await interaction.channel.send({
      embeds: [embed],
      components: [row],
    });

    await interaction.editReply({
      content: "Ticketing system has been set up in this channel.",
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 0,
    });

    collector.on("collect", async (selectInteraction) => {
      if (selectInteraction.user.bot) return;
      const ticketType = selectInteraction.values[0];
      const selectedOption = selectMenu.find(
        (option) => option.value === ticketType,
      );
      const ticketLabel = ticketType;

      const modalId = `ticket_modal_${selectInteraction.user.id}_${Date.now()}`;
      const modal = buildModal(client, {
        customId: modalId,
        title: "Open a Ticket",
        fields: selectedOption
          ? selectedOption.fields
          : [
              {
                customId: "reason",
                label: "Reason",
                style: "PARAGRAPH",
                placeholder:
                  "Explain why you are opening this ticket (max 1024 chars)",
                required: true,
                maxLength: 1024,
              },
            ],
      });

      try {
        await selectInteraction.showModal(modal);
      } catch (err) {
        console.error("Failed to show modal:", err);
        await selectInteraction.reply({
          content: "Something went wrong showing the form. Please try again.",
          ephemeral: true,
        });
        return;
      }

      let modalSubmit;
      try {
        modalSubmit = await selectInteraction.awaitModalSubmit({
          filter: (i) =>
            i.user.id === selectInteraction.user.id && i.customId === modalId,
          time: 300000,
        });
      } catch (e) {
        console.error("Modal submit error or timeout:", e);
        await selectInteraction.followUp({
          content: "You did not submit the ticket form in time.",
          ephemeral: true,
        });
        return;
      }

      const reason = modalSubmit.fields.getTextInputValue("reason");

      const safeName = `${ticketLabel}-${selectInteraction.user.username
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, "")}`.slice(0, 90);

      const overwrites = [
        {
          id: selectInteraction.guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: selectInteraction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
      ];

      if (moderatorRoleId) {
        overwrites.push({
          id: moderatorRoleId,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ManageMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        });
      }

      let ticketChannel;
      try {
        ticketChannel = await selectInteraction.guild.channels.create({
          name: safeName,
          type: ChannelType.GuildText,
          parent: ticketCategory ?? undefined,
          topic: ticketLabel,
          permissionOverwrites: overwrites,
        });
      } catch (err) {
        console.error("Failed creating ticket channel:", err);
        await modalSubmit.reply({
          content: "Failed to create ticket channel. Please contact an admin.",
          ephemeral: true,
        });
        return;
      }

      const today = new Date();
      const ticketEmbed = new EmbedBuilder()
        .setTitle("Ticket Created")
        .addFields(
          {
            name: "By",
            value: selectInteraction.user.toString(),
            inline: true,
          },
          { name: "Type", value: selectedOption.label, inline: true },
          {
            name: "Created At",
            value: new Date().toLocaleString(),
            inline: true,
          },
          {
            name: "Reason",
            value: reason || "No reason provided",
            inline: false,
          },
        )
        .setTimestamp()
        .setFooter({
          text: `Ticket for ${selectInteraction.user.tag} • Powered by Panda`,
          iconURL: selectInteraction.user.displayAvatarURL(),
        });

      const closeButton = new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("Close Ticket")
        .setStyle(ButtonStyle.Danger);
      const actionRow = new ActionRowBuilder().addComponents(closeButton);

      const posted = await ticketChannel.send({
        content: "@everyone",
        embeds: [ticketEmbed],
        components: [actionRow],
      });
      try {
        await posted.pin();
      } catch (e) {
        // ignore
      }

      await modalSubmit.reply({
        content: `Ticket created: ${ticketChannel}`,
        ephemeral: true,
      });

      const buttonCollector = posted.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 0,
      });

      buttonCollector.on("collect", async (i) => {
        if (i.customId !== "close_ticket") return;

        const member = i.member;
        const isOpener = i.user.id === selectInteraction.user.id;
        const isModerator =
          moderatorRoleId && member.roles.cache.has(moderatorRoleId);
        const isAdmin = member.permissions.has(
          PermissionFlagsBits.Administrator,
        );

        if (!isOpener && !isModerator && !isAdmin) {
          await i.reply({
            content: "You are not allowed to close this ticket.",
            ephemeral: true,
          });
          return;
        }

        const closeModalId = `close_ticket_modal_${i.user.id}_${Date.now()}`;
        const closeModal = buildModal(client, {
          customId: closeModalId,
          title: "Close Ticket",
          fields: [
            {
              customId: "reason",
              label: "Reason",
              style: "PARAGRAPH",
              placeholder: "Explain why this ticket is being closed (optional)",
              required: false,
              maxLength: 1024,
            },
          ],
        });

        try {
          await i.showModal(closeModal);
        } catch (err) {
          console.error("Failed to show close modal:", err);
          await i
            .reply({
              content: "Failed to open close form. Please try again.",
              ephemeral: true,
            })
            .catch(() => {});
          return;
        }

        let closeSubmit;
        try {
          closeSubmit = await i.awaitModalSubmit({
            filter: (m) =>
              m.user.id === i.user.id && m.customId === closeModalId,
            time: 300000,
          });
        } catch (err) {
          console.error("Close modal submit error or timeout:", err);
          await i
            .followUp({
              content: "You did not submit the close form in time.",
              ephemeral: true,
            })
            .catch(() => {});
          return;
        }

        const closeReason =
          closeSubmit.fields.getTextInputValue("reason") || "";

        await closeSubmit
          .reply({ content: "Closing ticket...", ephemeral: true })
          .catch(() => {});
        try {
          await ticketChannel.delete(`Ticket closed by ${i.user.tag}`);
          const dmContent = new EmbedBuilder()
            .setTitle("Ticket Closed")
            .setDescription(
              `Your ticket "${safeName}" has been closed. If you have further questions, feel free to open a new ticket.`,
            )
            .setFields(
              { name: "Type", value: selectedOption.label, inline: true },
              { name: "Closed By", value: i.user.toString(), inline: true },
              {
                name: "Closed At",
                value: new Date().toLocaleString(),
                inline: true,
              },
              {
                name: "Reason",
                value: closeReason || "No reason provided",
                inline: false,
              },
            )
            .setColor(0x11ee11)
            .setTimestamp();

          await selectInteraction.user
            .send({ embeds: [dmContent] })
            .catch(() => {});
        } catch (e) {
          console.error("Failed to delete ticket channel:", e);
        }
      });
    });
  },

  name: "ticket",
  description: "Send the ticketing system setup message",
  permissionsRequired: [PermissionFlagsBits.Administrator],
};
