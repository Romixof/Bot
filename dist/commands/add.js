"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const structure_1 = require("../structure");
const discord_js_1 = require("discord.js");
const logs_1 = require("../utils/logs");
/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/
class AddCommand extends structure_1.BaseCommand {
    static data = new discord_js_1.SlashCommandBuilder()
        .setName("add")
        .setDescription("Add someone to the ticket")
        .addUserOption((input) => input.setName("user").setDescription("The user to add").setRequired(true));
    constructor(client) {
        super(client);
    }
    async execute(interaction) {
        const added = interaction.options.getUser("user", true);
        const ticket = await this.client.prisma.tickets.findUnique({
            select: {
                id: true,
                invited: true,
            },
            where: {
                channelid: interaction.channel?.id
            }
        });
        if (!ticket)
            return interaction.reply({ content: "Ticket not found", ephemeral: true }).catch((e) => console.log(e));
        const invited = JSON.parse(ticket.invited);
        if (invited.includes(added.id))
            return interaction.reply({ content: "User already added", ephemeral: true }).catch((e) => console.log(e));
        if (invited.length >= 25)
            return interaction.reply({ content: "You can't add more than 25 users", ephemeral: true }).catch((e) => console.log(e));
        invited.push(added.id);
        await this.client.prisma.tickets.update({
            data: {
                invited: JSON.stringify(invited)
            },
            where: {
                channelid: interaction.channel?.id
            }
        });
        await interaction.channel?.permissionOverwrites
            .edit(added, {
            SendMessages: true,
            AddReactions: true,
            ReadMessageHistory: true,
            AttachFiles: true,
            ViewChannel: true,
        });
        await interaction.reply({ content: `> Added <@${added.id}> to the ticket` }).catch((e) => console.log(e));
        (0, logs_1.log)({
            LogType: "userAdded",
            user: interaction.user,
            ticketId: ticket.id.toString(),
            ticketChannelId: interaction.channel?.id,
            target: added,
        }, this.client);
    }
}
exports.default = AddCommand;
/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/
//# sourceMappingURL=add.js.map
