"use strict";
/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTicket = void 0;
const logs_1 = require("./logs");
const deleteTicket = async (interaction, client) => {
    const ticket = await client.prisma.tickets.findUnique({
        where: {
            channelid: interaction.channel?.id
        }
    });
    if (!ticket)
        return interaction.reply({ content: "Ticket not found", ephemeral: true }).catch((e) => console.log(e));
    (0, logs_1.log)({
        LogType: "ticketDelete",
        user: interaction.user,
        ticketId: ticket.id,
        ticketCreatedAt: ticket.createdat,
        transcriptURL: ticket.transcript ?? undefined,
    }, client);
    await interaction.deferUpdate();
    interaction.channel?.delete().catch((e) => console.log(e));
};
exports.deleteTicket = deleteTicket;
/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/
//# sourceMappingURL=delete.js.map