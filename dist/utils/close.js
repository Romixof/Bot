"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.close = void 0;
const ticket_bot_transcript_uploader_1 = require("ticket-bot-transcript-uploader");
const zlib_1 = __importDefault(require("zlib"));
const axios_1 = __importDefault(require("axios"));
const discord_js_1 = require("discord.js");
const logs_1 = require("./logs");
let domain = "https://ticket.pm/";
async function close(interaction, client, reason) {
    if (!client.config.closeOption.createTranscript)
        domain = client.locales.getSubValue("other", "unavailable");
    const ticket = await client.prisma.tickets.findUnique({
        where: {
            channelid: interaction.channel?.id
        }
    });
    const ticketClosed = ticket?.closedat && ticket.closedby;
    if (!ticket)
        return interaction.editReply({ content: "Ticket not found" }).catch((e) => console.log(e));
    if (client.config.closeOption.whoCanCloseTicket === "STAFFONLY" &&
        !interaction.member?.roles.cache.some((r) => client.config.rolesWhoHaveAccessToTheTickets.includes(r.id)))
        return interaction
            .editReply({
            content: client.locales.getValue("ticketOnlyClosableByStaff")
        })
            .catch((e) => console.log(e));
    if (ticketClosed)
        return interaction
            .editReply({
            content: client.locales.getValue("ticketAlreadyClosed")
        })
            .catch((e) => console.log(e));
    (0, logs_1.log)({
        LogType: "ticketClose",
        user: interaction.user,
        ticketId: ticket.id,
        ticketChannelId: interaction.channel?.id,
        ticketCreatedAt: ticket.createdat,
        reason: reason
    }, client);
    // Normally the user that closes the ticket will get posted here, but we'll do it when the ticket finalizes
    const creator = ticket.creator;
    const invited = JSON.parse(ticket.invited);
    interaction.channel?.permissionOverwrites
        .edit(creator, {
        ViewChannel: false
    })
        .catch((e) => console.log(e));
    invited.forEach(async (user) => {
        interaction.channel?.permissionOverwrites
            .edit(user, {
            ViewChannel: false
        })
            .catch((e) => console.log(e));
    });
    interaction
        .editReply({
        content: client.locales.getValue("ticketCreatingTranscript")
    })
        .catch((e) => console.log(e));
    async function _close(id, ticket) {
        if (client.config.closeOption.closeTicketCategoryId)
            interaction.channel?.setParent(client.config.closeOption.closeTicketCategoryId).catch((e) => console.log(e));
        const msg = await interaction.channel?.messages.fetch(ticket.messageid);
        const embed = new discord_js_1.EmbedBuilder(msg?.embeds[0].data);
        const rowAction = new discord_js_1.ActionRowBuilder();
        msg?.components[0]?.components?.map((x) => {
            if (x.type !== discord_js_1.ComponentType.Button)
                return;
            const builder = new discord_js_1.ButtonBuilder(x.data);
            if (x.customId === "close")
                builder.setDisabled(true);
            if (x.customId === "close_askReason")
                builder.setDisabled(true);
            rowAction.addComponents(builder);
        });
        msg?.edit({
            content: msg.content,
            embeds: [embed],
            components: [rowAction]
        })
            .catch((e) => console.log(e));
        interaction.channel?.send({
            content: client.locales.getValue("ticketTranscriptCreated").replace("TRANSCRIPTURL", domain === client.locales.getSubValue("other", "unavailable") ? client.locales.getSubValue("other", "unavailable") : `<${domain}${id}>`)
        }).catch((e) => console.log(e));
        ticket = await client.prisma.tickets.update({
            data: {
                closedby: interaction.user.id,
                closedat: Date.now(),
                closereason: reason,
                transcript: domain === client.locales.getSubValue("other", "unavailable") ? client.locales.getSubValue("other", "unavailable") : `${domain}${id}`
            },
            where: {
                channelid: interaction.channel?.id
            }
        });
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId("deleteTicket").setLabel(client.locales.getSubValue("other", "deleteTicketButtonMSG")).setStyle(discord_js_1.ButtonStyle.Danger));
        const locale = client.locales;
        interaction.channel?.send({
            embeds: [
                JSON.parse(JSON.stringify(locale.getSubRawValue("embeds", "ticketClosed"))
                    .replace("TICKETCOUNT", ticket.id.toString())
                    .replace("REASON", (ticket.closereason ?? client.locales.getSubValue("other", "noReasonGiven")).replace(/[\n\r]/g, "\\n"))
                    .replace("CLOSERNAME", interaction.user.tag))
            ],
            components: [row]
        })
            .catch((e) => console.log(e));
        if (!client.config.closeOption.dmUser)
            return;
        const footer = locale.getSubValue("embeds", "ticketClosedDM", "footer", "text").replace("ticket.pm", "");
        const ticketClosedDMEmbed = new discord_js_1.EmbedBuilder({
            color: 0,
        })
            .setColor(locale.getNoErrorSubValue("embeds", "ticketClosedDM", "color") ?? client.config.mainColor)
            .setDescription(client.locales.getSubValue("embeds", "ticketClosedDM", "description")
            .replace("TICKETCOUNT", ticket.id.toString())
            .replace("TRANSCRIPTURL", `${domain}${id}`)
            .replace("REASON", ticket.closereason ?? client.locales.getSubValue("other", "noReasonGiven"))
            .replace("CLOSERNAME", interaction.user.tag))
            .setFooter({
            // Please respect the project by keeping the credits, (if it is too disturbing you can credit me in the "about me" of the bot discord)
            text: `ticket.pm ${footer.trim() !== "" ? `- ${footer}` : ""}`,
            // Please respect the project by keeping the credits, (if it is too disturbing you can credit me in the "about me" of the bot discord)
            iconURL: locale.getNoErrorSubValue("embeds", "ticketClosedDM", "footer", "iconUrl")
        });
        client.users.fetch(creator).then((user) => {
            user
                .send({
                embeds: [ticketClosedDMEmbed]
            })
                .catch((e) => console.log(e));
        });
    }
    if (!client.config.closeOption.createTranscript) {
        _close("", ticket);
        return;
    }
    async function fetchAll() {
        const collArray = [];
        let lastID = interaction.channel?.lastMessageId;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            // using if statement for this check causes a TypeScript bug. Hard to reproduce; thus, bug report won't be accepted.
            if (!lastID)
                break;
            const fetched = await interaction.channel?.messages.fetch({ limit: 100, before: lastID });
            if (fetched?.size === 0) {
                break;
            }
            if (fetched)
                collArray.push(fetched);
            lastID = fetched?.last()?.id;
            if (fetched?.size !== 100) {
                break;
            }
        }
        const messages = collArray[0].concat(...collArray.slice(1));
        return messages;
    }
    const messages = await fetchAll();
    const premiumKey = "";
    const messagesJSON = await (0, ticket_bot_transcript_uploader_1.generateMessages)(messages, premiumKey, "https://m.ticket.pm");
    zlib_1.default.gzip(JSON.stringify(messagesJSON), async (err, compressed) => {
        if (err) {
            console.error(err);
        }
        else {
            const ts = await axios_1.default
                .post(`${domain}upload?key=${premiumKey}&uuid=${client.config.uuidType}`, JSON.stringify(compressed), {
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .catch(console.error);
            _close(ts?.data, ticket);
        }
    });
}
exports.close = close;
/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/
//# sourceMappingURL=close.js.map