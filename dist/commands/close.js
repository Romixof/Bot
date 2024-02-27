"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const close_askReason_1 = require("../utils/close_askReason");
const close_js_1 = require("../utils/close.js");
const structure_1 = require("../structure");
/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/
class CloseCommand extends structure_1.BaseCommand {
    static data = new discord_js_1.SlashCommandBuilder()
        .setName("close").setDescription("Close the ticket");
    constructor(client) {
        super(client);
    }
    async execute(interaction) {
        if (this.client.config.closeOption.whoCanCloseTicket === "STAFFONLY" &&
            !interaction.member?.roles.cache.some((r) => this.client.config.rolesWhoHaveAccessToTheTickets.includes(r.id)))
            return interaction
                .reply({
                content: this.client.locales.getValue("ticketOnlyClosableByStaff"),
                ephemeral: true,
            })
                .catch((e) => console.log(e));
        if (this.client.config.closeOption.askReason) {
            (0, close_askReason_1.closeAskReason)(interaction, this.client);
        }
        else {
            await interaction.deferReply().catch((e) => console.log(e));
            (0, close_js_1.close)(interaction, this.client);
        }
    }
}
exports.default = CloseCommand;
/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/
//# sourceMappingURL=close.js.map