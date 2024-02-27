"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const logs_1 = require("../utils/logs");
const createTicket_1 = require("../utils/createTicket");
const close_1 = require("../utils/close");
const claim_1 = require("../utils/claim");
const close_askReason_1 = require("../utils/close_askReason");
const delete_1 = require("../utils/delete");
const structure_1 = require("../structure");
/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/
class InteractionCreateEvent extends structure_1.BaseEvent {
    constructor(client) {
        super(client);
    }
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = this.client.commands.get(interaction.commandName);
            if (!command)
                return;
            try {
                await command.execute(interaction);
            }
            catch (error) {
                console.error(error);
                await interaction.reply({
                    content: "There was an error while executing this command!",
                    ephemeral: true
                });
            }
        }
        if (interaction.isButton()) {
            if (interaction.customId === "openTicket") {
                await interaction.deferReply({ ephemeral: true }).catch((e) => console.log(e));
                const tCount = this.client.config.ticketTypes.length;
                if (tCount === 0 || tCount > 25) {
                    await interaction.followUp({ content: this.client.locales.getValue("invalidConfig"), ephemeral: true });
                    throw new Error("ticketTypes either has nothing or exceeded 25 entries. Please check the config and restart the bot");
                }
                for (const role of this.client.config.rolesWhoCanNotCreateTickets) {
                    if (role && interaction.member?.roles.cache.has(role)) {
                        interaction
                            .editReply({
                            content: "You can't create a ticket because you are blacklisted"
                        })
                            .catch((e) => console.log(e));
                        return;
                    }
                }
                // Max Ticket
                if (this.client.config.maxTicketOpened > 0) {
                    const ticketsOpened = (await this.client.prisma.$queryRaw `SELECT COUNT(*) as count FROM tickets WHERE closedby IS NULL AND creator = ${interaction.user.id}`)[0].count;
                    // If maxTicketOpened is 0, it means that there is no limit
                    if (ticketsOpened >= this.client.config.maxTicketOpened) {
                        interaction
                            .editReply({
                            content: this.client.locales.getValue("ticketLimitReached").replace("TICKETLIMIT", this.client.config.maxTicketOpened.toString())
                        })
                            .catch((e) => console.log(e));
                        return;
                    }
                }
                // Make a select menus of all tickets types
                let options = [];
                for (const x of this.client.config.ticketTypes) {
                    // x.cantAccess is an array of roles id
                    // If the user has one of the roles, he can't access to this ticket type
                    const a = {
                        label: x.name,
                        value: x.codeName,
                    };
                    if (x.description)
                        a.description = x.description;
                    if (x.emoji)
                        a.emoji = x.emoji;
                    options.push(a);
                }
                for (const x of options) {
                    const option = this.client.config.ticketTypes.filter((y) => y.codeName === x.value)[0];
                    if (option.cantAccess) {
                        for (const role of option.cantAccess) {
                            if (role && interaction.member?.roles.cache.has(role)) {
                                options = options.filter((y) => y.value !== x.value);
                            }
                        }
                    }
                }
                if (options.length <= 0) {
                    interaction.editReply({
                        content: this.client.locales.getValue("noTickets")
                    });
                    return;
                }
                const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.StringSelectMenuBuilder()
                    .setCustomId("selectTicketType")
                    .setPlaceholder(this.client.locales.getSubValue("other", "selectTicketTypePlaceholder"))
                    .setMaxValues(1)
                    .addOptions(options));
                interaction
                    .editReply({
                    components: [row],
                })
                    .catch((e) => console.log(e));
            }
            if (interaction.customId === "claim") {
                (0, claim_1.claim)(interaction, this.client);
            }
            if (interaction.customId === "close") {
                await interaction.deferReply({ ephemeral: true }).catch((e) => console.log(e));
                (0, close_1.close)(interaction, this.client, this.client.locales.getSubValue("other", "noReasonGiven"));
            }
            if (interaction.customId === "close_askReason") {
                (0, close_askReason_1.closeAskReason)(interaction, this.client);
            }
            if (interaction.customId === "deleteTicket") {
                (0, delete_1.deleteTicket)(interaction, this.client);
            }
        }
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === "selectTicketType") {
                if (this.client.config.maxTicketOpened > 0) {
                    const ticketsOpened = (await this.client.prisma.$queryRaw `SELECT COUNT(*) as count FROM tickets WHERE closedby IS NULL AND creator = ${interaction.user.id}`)[0].count;
                    // If maxTicketOpened is 0, it means that there is no limit
                    if (ticketsOpened >= this.client.config.maxTicketOpened) {
                        interaction
                            .reply({
                            content: this.client.locales.getValue("ticketLimitReached").replace("TICKETLIMIT", this.client.config.maxTicketOpened.toString()),
                            ephemeral: true,
                        })
                            .catch((e) => console.log(e));
                        return;
                    }
                }
                const ticketType = this.client.config.ticketTypes.find((x) => x.codeName === interaction.values[0]);
                if (!ticketType)
                    return console.error(`Ticket type ${interaction.values[0]} not found!`);
                if (ticketType.askQuestions) {
                    // Sanity Check
                    const qCount = ticketType.questions.length;
                    if (qCount === 0 || qCount > 5)
                        throw new Error(`${ticketType.codeName} has either no questions or exceeded 5 questions. Check your config and restart the bot`);
                    const modal = new discord_js_1.ModalBuilder().setCustomId("askReason").setTitle(this.client.locales.getSubValue("modals", "reasonTicketOpen", "title"));
                    for (const question of ticketType.questions) {
                        const index = ticketType.questions.indexOf(question);
                        const input = new discord_js_1.TextInputBuilder()
                            .setCustomId(`input_${interaction.values[0]}_${index}`)
                            .setLabel(question.label)
                            .setStyle(question.style == "SHORT" ? discord_js_1.TextInputStyle.Short : discord_js_1.TextInputStyle.Paragraph)
                            .setPlaceholder(question.placeholder)
                            .setMaxLength(question.maxLength);
                        const firstActionRow = new discord_js_1.ActionRowBuilder().addComponents(input);
                        modal.addComponents(firstActionRow);
                    }
                    await interaction.showModal(modal).catch((e) => console.log(e));
                }
                else {
                    (0, createTicket_1.createTicket)(interaction, this.client, ticketType, this.client.locales.getSubValue("other", "noReasonGiven"));
                }
            }
            if (interaction.customId === "removeUser") {
                const ticket = await this.client.prisma.tickets.findUnique({
                    select: {
                        id: true,
                        invited: true,
                    },
                    where: {
                        channelid: interaction.message.channelId
                    }
                });
                for (const value of interaction.values) {
                    await interaction.channel?.permissionOverwrites.delete(value).catch((e) => console.log(e));
                    await (0, logs_1.log)({
                        LogType: "userRemoved",
                        user: interaction.user,
                        ticketId: ticket?.id.toString(),
                        ticketChannelId: interaction.channel?.id,
                        target: {
                            id: value,
                        },
                    }, this.client);
                }
                // Update the data in the database
                await this.client.prisma.tickets.update({
                    data: {
                        invited: JSON.stringify(JSON.parse(ticket?.invited ?? "[]")
                            .filter(userid => interaction.values.find(rUID => rUID === userid) === undefined))
                    },
                    where: {
                        channelid: interaction.channel?.id
                    }
                });
                await interaction
                    .update({
                    content: `> Removed ${interaction.values.length < 1 ? interaction.values : interaction.values.map((a) => `<@${a}>`).join(", ")} from the ticket`,
                    components: [],
                });
            }
        }
        if (interaction.isModalSubmit()) {
            if (interaction.customId === "askReason") {
                const type = interaction.fields.fields.first()?.customId.split("_")[1];
                const ticketType = this.client.config.ticketTypes.find((x) => x.codeName === type);
                // Using customId until the value can be figured out
                if (!ticketType)
                    return console.error(`Ticket type ${interaction.customId} not found!`);
                (0, createTicket_1.createTicket)(interaction, this.client, ticketType, interaction.fields.fields);
            }
            if (interaction.customId === "askReasonClose") {
                await interaction.deferReply().catch((e) => console.log(e));
                (0, close_1.close)(interaction, this.client, interaction.fields.fields.first()?.value);
            }
        }
    }
}
exports.default = InteractionCreateEvent;
/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/
//# sourceMappingURL=interactionCreate.js.map