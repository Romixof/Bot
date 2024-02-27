"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTicket = void 0;
const discord_js_1 = require("discord.js");
const logs_1 = require("./logs");
/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/
/**
 * @param {Discord.Interaction} interaction
 * @param {Discord.Client} client
 * @param {Object} ticketType
 * @param {Object|string} reasons
 */
const createTicket = async (interaction, client, ticketType, reasons) => {
    const locale = client.locales;
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async function (resolve, reject) {
        await interaction.deferReply({ ephemeral: true }).catch((e) => console.log(e));
        const reason = [];
        let allReasons = "";
        if (typeof reasons === "object") {
            reasons.forEach(async (r) => {
                reason.push(r.value);
            });
            allReasons = reason.map((r, i) => `Question ${i + 1}: ${r}`).join(", ");
        }
        if (typeof reasons === "string")
            allReasons = reasons;
        let ticketName = "";
        let ticketCount = (await client.prisma.$queryRaw `SELECT COUNT(*) as count FROM tickets`)[0].count;
        if (ticketType.ticketNameOption) {
            ticketName = ticketType.ticketNameOption
                .replace("USERNAME", interaction.user.username)
                .replace("USERID", interaction.user.id)
                .replace("TICKETCOUNT", ticketCount.toString() ?? "0");
        }
        else {
            ticketName = client.config.ticketNameOption
                .replace("USERNAME", interaction.user.username)
                .replace("USERID", interaction.user.id)
                .replace("TICKETCOUNT", ticketCount.toString() ?? "0");
        }
        if (!interaction.guild)
            return console.error("Interaction createTicket was not executed in a guild");
        const channel = await client.guilds.cache.get(client.config.guildId)?.channels.create({
            name: ticketName,
            parent: ticketType.categoryId,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone,
                    deny: [discord_js_1.PermissionFlagsBits.ViewChannel],
                },
            ],
        });
        if (!channel)
            return reject("Couldn't create the ticket channel.");
        (0, logs_1.log)({
            LogType: "ticketCreate",
            user: interaction.user,
            reason: allReasons,
            ticketChannelId: channel.id
        }, client);
        // Client.db is set here and incremented ticket count
        ticketCount++;
        await channel.permissionOverwrites
            .edit(interaction.user, {
            SendMessages: true,
            AddReactions: true,
            ReadMessageHistory: true,
            AttachFiles: true,
            ViewChannel: true,
        })
            .catch((e) => console.log(e));
        if (client.config.rolesWhoHaveAccessToTheTickets.length > 0) {
            for (const role of client.config.rolesWhoHaveAccessToTheTickets) {
                await channel.permissionOverwrites
                    .edit(role, {
                    SendMessages: true,
                    AddReactions: true,
                    ReadMessageHistory: true,
                    AttachFiles: true,
                    ViewChannel: true,
                })
                    .catch((e) => console.log(e));
            }
        }
        const footer = locale.getSubValue("embeds", "ticketOpened", "footer", "text").replace("ticket.pm", "");
        if (ticketType.color?.toString().trim() === "")
            ticketType.color = undefined;
        const ticketOpenedEmbed = new discord_js_1.EmbedBuilder({
            color: 0,
        })
            .setColor(ticketType.color ?? client.config.mainColor)
            .setTitle(locale.getSubValue("embeds", "ticketOpened", "title").replace("CATEGORYNAME", ticketType.name))
            .setDescription(ticketType.customDescription
            ? ticketType.customDescription
                .replace("CATEGORYNAME", ticketType.name)
                .replace("USERNAME", interaction.user.username)
                .replace("USERID", interaction.user.id)
                .replace("TICKETCOUNT", ticketCount.toString() || "0")
                .replace("REASON1", reason[0])
                .replace("REASON2", reason[1])
                .replace("REASON3", reason[2])
                .replace("REASON4", reason[3])
                .replace("REASON5", reason[4])
                .replace("REASON6", reason[5])
                .replace("REASON7", reason[6])
                .replace("REASON8", reason[7])
                .replace("REASON9", reason[8])
            : locale.getSubValue("embeds", "ticketOpened", "description")
                .replace("CATEGORYNAME", ticketType.name)
                .replace("USERNAME", interaction.user.username)
                .replace("USERID", interaction.user.id)
                .replace("TICKETCOUNT", ticketCount.toString() || "0")
                .replace("REASON1", reason[0])
                .replace("REASON2", reason[1])
                .replace("REASON3", reason[2])
                .replace("REASON4", reason[3])
                .replace("REASON5", reason[4])
                .replace("REASON6", reason[5])
                .replace("REASON7", reason[6])
                .replace("REASON8", reason[7])
                .replace("REASON9", reason[8]))
            .setFooter({
            // Please respect the project by keeping the credits, (if it is too disturbing you can credit me in the "about me" of the bot discord)
            text: `ticket.pm ${footer.trim() !== "" ? `- ${footer}` : ""}`,
            // Please respect the project by keeping the credits, (if it is too disturbing you can credit me in the "about me" of the bot discord)
            iconURL: locale.getNoErrorSubValue("embeds", "ticketOpened", "footer", "iconUrl")
        });
        const row = new discord_js_1.ActionRowBuilder();
        if (client.config.closeOption?.closeButton) {
            if (client.config.closeOption?.askReason) {
                row.addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId("close_askReason")
                    .setLabel(locale.getSubValue("buttons", "close", "label"))
                    .setEmoji(locale.getSubValue("buttons", "close", "emoji"))
                    .setStyle(discord_js_1.ButtonStyle.Danger));
            }
            else {
                row.addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId("close")
                    .setLabel(locale.getSubValue("buttons", "close", "emoji"))
                    .setEmoji(locale.getSubValue("buttons", "close", "emoji"))
                    .setStyle(discord_js_1.ButtonStyle.Danger));
            }
        }
        if (client.config.claimOption?.claimButton) {
            row.addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId("claim")
                .setLabel(locale.getSubValue("buttons", "claim", "label"))
                .setEmoji(locale.getSubValue("buttons", "claim", "emoji"))
                .setStyle(discord_js_1.ButtonStyle.Primary));
        }
        const body = {
            embeds: [ticketOpenedEmbed],
            content: `<@${interaction.user.id}> ${client.config.pingRoleWhenOpened ? client.config.roleToPingWhenOpenedId.map((x) => `<@&${x}>`).join(", ") : ""}`,
            components: [],
        };
        if (row.components.length > 0)
            body.components = [row];
        channel
            .send(body)
            .then((msg) => {
            client.prisma.tickets.create({
                data: {
                    category: JSON.stringify(ticketType),
                    reason: allReasons,
                    creator: interaction.user.id,
                    createdat: Date.now(),
                    channelid: channel.id,
                    messageid: msg.id
                }
            }).then(); // Again why tf do I need .then()?!?!?
            msg.pin().then(() => {
                msg.channel.bulkDelete(1);
            });
            interaction
                .editReply({
                content: client.locales.getValue("ticketOpenedMessage").replace("TICKETCHANNEL", `<#${channel.id}>`),
                components: [],
            })
                .catch((e) => console.log(e));
            resolve(true);
        })
            .catch((e) => console.log(e));
    });
};
exports.createTicket = createTicket;
//# sourceMappingURL=createTicket.js.map