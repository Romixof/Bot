"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const structure_1 = require("../structure");
/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/
class RenameCommand extends structure_1.BaseCommand {
    static data = new discord_js_1.SlashCommandBuilder()
        .setName("rename")
        .setDescription("Rename the ticket")
        .addStringOption((option) => option.setName("name").setDescription("The new name of the ticket").setRequired(true));
    constructor(client) {
        super(client);
    }
    async execute(interaction) {
        const ticket = await this.client.prisma.tickets.findUnique({
            where: {
                channelid: interaction.channel?.id
            }
        });
        if (!ticket)
            return interaction.reply({ content: "Ticket not found", ephemeral: true }).catch((e) => console.log(e));
        if (!interaction.member?.roles.cache.some((r) => this.client.config.rolesWhoHaveAccessToTheTickets.includes(r.id)))
            return interaction
                .reply({
                content: this.client.locales.getValue("ticketOnlyRenamableByStaff"),
                ephemeral: true,
            })
                .catch((e) => console.log(e));
        interaction.channel?.setName(interaction.options.get("name", true).value).catch((e) => console.log(e));
        interaction
            .reply({ content: this.client.locales.getValue("ticketRenamed").replace("NEWNAME", interaction.channel?.toString() ?? "Unknown"), ephemeral: false })
            .catch((e) => console.log(e));
    }
}
exports.default = RenameCommand;
/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/
//# sourceMappingURL=rename.js.map