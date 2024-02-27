"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const discord_js_1 = __importStar(require("discord.js"));
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const log = async (logs, client) => {
    if (!client.config.logs)
        return;
    if (!client.config.logsChannelId)
        return;
    const channel = await client.channels
        .fetch(client.config.logsChannelId)
        .catch((e) => console.error("The channel to log events is not found!\n", e));
    if (!channel)
        return console.error("The channel to log events is not found!");
    if (!channel.isTextBased() ||
        channel.type === discord_js_1.ChannelType.DM ||
        channel.type === discord_js_1.ChannelType.PrivateThread ||
        channel.type === discord_js_1.ChannelType.PublicThread)
        return console.error("Invalid Channel!");
    const webhook = (await channel.fetchWebhooks()).find((wh) => wh.token) ??
        await channel.createWebhook({ name: "Ticket Bot Logs" });
    if (logs.LogType === "ticketCreate") {
        const embed = new discord_js_1.default.EmbedBuilder()
            .setColor("#3ba55c")
            .setAuthor({ name: logs.user.tag, iconURL: logs.user.displayAvatarURL() })
            .setDescription(`${logs.user.tag} (<@${logs.user.id}>) Created a ticket (<#${logs.ticketChannelId}>) with the reason: \`${logs.reason}\``);
        webhook
            .send({
            username: "Ticket Created",
            avatarURL: "https://i.imgur.com/M38ZmjM.png",
            embeds: [embed],
        })
            .catch((e) => console.log(e));
    }
    if (logs.LogType === "ticketClaim") {
        const embed = new discord_js_1.default.EmbedBuilder()
            .setColor("#faa61a")
            .setAuthor({ name: logs.user.tag, iconURL: logs.user.displayAvatarURL() })
            .setDescription(`${logs.user.tag} (<@${logs.user.id}>) Claimed the ticket n°${logs.ticketId} (<#${logs.ticketChannelId}>) after ${client.msToHm(new Date(Number(BigInt(Date.now()) - BigInt(logs.ticketCreatedAt))))} of creation`);
        webhook
            .send({
            username: "Ticket Claimed",
            avatarURL: "https://i.imgur.com/qqEaUyR.png",
            embeds: [embed],
        })
            .catch((e) => console.log(e));
    }
    if (logs.LogType === "ticketClose") {
        const embed = new discord_js_1.default.EmbedBuilder()
            .setColor("#ed4245")
            .setAuthor({ name: logs.user.tag, iconURL: logs.user.displayAvatarURL() })
            .setDescription(`${logs.user.tag} (<@${logs.user.id}>) Closed the ticket n°${logs.ticketId} (<#${logs.ticketChannelId}>) with the reason: \`${logs.reason}\` after ${client.msToHm(Number(BigInt(Date.now()) - BigInt(logs.ticketCreatedAt)))} of creation`);
        webhook
            .send({
            username: "Ticket Closed",
            avatarURL: "https://i.imgur.com/5ShDA4g.png",
            embeds: [embed],
        })
            .catch((e) => console.log(e));
    }
    if (logs.LogType === "ticketDelete") {
        const embed = new discord_js_1.default.EmbedBuilder()
            .setColor("#ed4245")
            .setAuthor({ name: logs.user.tag, iconURL: logs.user.displayAvatarURL() })
            .setDescription(`${logs.user.tag} (<@${logs.user.id}>) Deleted the ticket n°${logs.ticketId} after ${client.msToHm(new Date(Number(BigInt(Date.now()) - BigInt(logs.ticketCreatedAt))))} of creation\n\nTranscript: ${logs.transcriptURL}`);
        webhook
            .send({
            username: "Ticket Deleted",
            avatarURL: "https://i.imgur.com/obTW2BS.png",
            embeds: [embed],
        })
            .catch((e) => console.log(e));
    }
    if (logs.LogType === "userAdded") {
        const embed = new discord_js_1.default.EmbedBuilder()
            .setColor("#3ba55c")
            .setAuthor({ name: logs.user.tag, iconURL: logs.user.displayAvatarURL() })
            .setDescription(`${logs.user.tag} (<@${logs.user.id}>) Added <@${logs.target.id}> (${logs.target.id}) to the ticket n°${logs.ticketId} (<#${logs.ticketChannelId}>)`);
        webhook
            .send({
            username: "User Added",
            avatarURL: "https://i.imgur.com/G6QPFBV.png",
            embeds: [embed],
        })
            .catch((e) => console.log(e));
    }
    if (logs.LogType === "userRemoved") {
        const embed = new discord_js_1.default.EmbedBuilder()
            .setColor("#ed4245")
            .setAuthor({ name: logs.user.tag, iconURL: logs.user.displayAvatarURL() })
            .setDescription(`${logs.user.tag} (<@${logs.user.id}>) Removed <@${logs.target.id}> (${logs.target.id}) from the ticket n°${logs.ticketId} (<#${logs.ticketChannelId}>)`);
        webhook
            .send({
            username: "User Removed",
            avatarURL: "https://i.imgur.com/eFJ8xxC.png",
            embeds: [embed],
        })
            .catch((e) => console.log(e));
    }
};
exports.log = log;
/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/
//# sourceMappingURL=logs.js.map