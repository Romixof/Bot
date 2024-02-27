"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const structure_1 = require("../structure");
/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/
class RemoveCommand extends structure_1.BaseCommand {
    static data = new discord_js_1.SlashCommandBuilder()
        .setName("remove")
        .setDescription("Remove someone from the ticket");
    constructor(client) {
        super(client);
    }
    async execute(interaction) {
        const ticket = await this.client.prisma.tickets.findUnique({
            select: {
                invited: true,
            },
            where: {
                channelid: interaction.channel?.id
            }
        });
        if (!ticket)
            return interaction.reply({ content: "Ticket not found", ephemeral: true }).catch((e) => console.log(e));
        const parseInvited = JSON.parse(ticket.invited);
        if (parseInvited.length < 1)
            return interaction.reply({ content: "There are no users to remove", ephemeral: true }).catch((e) => console.log(e));
        const addedUsers = [];
        for (let i = 0; i < parseInvited.length; i++) {
            addedUsers.push(await this.client.users.fetch(parseInvited[i]));
        }
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
            .setCustomId("removeUser")
            .setPlaceholder("Please select a user to remove")
            .setMinValues(1)
            .setMaxValues(parseInvited.length)
            .addOptions(
        // @TODO: Fix type definitions when I figure it out via ORM migration. For now assign a random type that gets the error removed.
        addedUsers.map((user) => {
            return {
                label: user.tag,
                value: user.id,
            };
        })));
        await interaction.reply({ components: [row] }).catch((e) => console.log(e));
    }
}
exports.default = RemoveCommand;
/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/
//# sourceMappingURL=remove.js.map