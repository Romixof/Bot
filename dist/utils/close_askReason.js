"use strict";
/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeAskReason = void 0;
const discord_js_1 = require("discord.js");
const closeAskReason = async (interaction, client) => {
    if (client.config.closeOption.whoCanCloseTicket === "STAFFONLY" &&
        !interaction.member?.roles.cache.some((r) => client.config.rolesWhoHaveAccessToTheTickets.includes(r.id)))
        return interaction
            .reply({
            content: client.locales.getValue("ticketOnlyClosableByStaff"),
            ephemeral: true,
        })
            .catch((e) => console.log(e));
    const modal = new discord_js_1.ModalBuilder().setCustomId("askReasonClose").setTitle(client.locales.getSubValue("modals", "reasonTicketClose", "title"));
    const input = new discord_js_1.TextInputBuilder()
        .setCustomId("reason")
        .setLabel(client.locales.getSubValue("modals", "reasonTicketClose", "label"))
        .setStyle(discord_js_1.TextInputStyle.Paragraph)
        .setPlaceholder(client.locales.getSubValue("modals", "reasonTicketClose", "placeholder"))
        .setMaxLength(256);
    const firstActionRow = new discord_js_1.ActionRowBuilder().addComponents(input);
    modal.addComponents(firstActionRow);
    await interaction.showModal(modal).catch((e) => console.log(e));
};
exports.closeAskReason = closeAskReason;
/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/
//# sourceMappingURL=close_askReason.js.map