"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const client_1 = require("@prisma/client");
const fs_extra_1 = __importDefault(require("fs-extra"));
const node_path_1 = __importDefault(require("node:path"));
const commands_1 = require("../commands");
const events_1 = require("../events");
const jsonc_1 = require("jsonc");
const rest_1 = require("@discordjs/rest");
const translation_1 = require("../utils/translation");
class ExtendedClient extends discord_js_1.Client {
    config;
    prisma;
    locales;
    commands;
    constructor(options, config) {
        super(options);
        this.config = config;
        this.prisma = new client_1.PrismaClient({
            errorFormat: "minimal"
        });
        this.locales = new translation_1.Translation(this.config.lang, node_path_1.default.join(__dirname, "../../locales/"));
        this.commands = new discord_js_1.Collection([
            [commands_1.AddCommand.data.name, new commands_1.AddCommand(this)],
            [commands_1.ClaimCommand.data.name, new commands_1.ClaimCommand(this)],
            [commands_1.CloseCommand.data.name, new commands_1.CloseCommand(this)],
            [commands_1.RemoveCommand.data.name, new commands_1.RemoveCommand(this)],
            [commands_1.RenameCommand.data.name, new commands_1.RenameCommand(this)],
        ]);
        this.loadEvents();
    }
    msToHm(ms) {
        if (ms instanceof Date)
            ms = ms.getTime();
        const days = Math.floor(ms / (24 * 60 * 60 * 1000));
        const daysms = ms % (24 * 60 * 60 * 1000);
        const hours = Math.floor(daysms / (60 * 60 * 1000));
        const hoursms = ms % (60 * 60 * 1000);
        const minutes = Math.floor(hoursms / (60 * 1000));
        const minutesms = ms % (60 * 1000);
        const sec = Math.floor(minutesms / 1000);
        let result = "0s";
        if (days > 0)
            result = `${days}d ${hours}h ${minutes}m ${sec}s`;
        if (hours > 0)
            result = `${hours}h ${minutes}m ${sec}s`;
        if (minutes > 0)
            result = `${minutes}m ${sec}s`;
        if (sec > 0)
            result = `${sec}s`;
        return result;
    }
    loadEvents() {
        this.on("interactionCreate", (interaction) => new events_1.InteractionCreateEvent(this).execute(interaction));
        this.on("ready", () => new events_1.ReadyEvent(this).execute());
    }
    deployCommands() {
        const commands = [
            commands_1.AddCommand.data.toJSON(),
            commands_1.ClaimCommand.data.toJSON(),
            commands_1.CloseCommand.data.toJSON(),
            commands_1.RemoveCommand.data.toJSON(),
            commands_1.RenameCommand.data.toJSON()
        ];
        const { guildId } = jsonc_1.jsonc.parse(fs_extra_1.default.readFileSync(node_path_1.default.join(__dirname, "../../config/config.jsonc"), "utf8"));
        if (!process.env["TOKEN"])
            throw Error("Discord Token Expected, deploy-command");
        const rest = new rest_1.REST({ version: "10" }).setToken(process.env["TOKEN"]);
        rest
            .put(discord_js_1.Routes.applicationGuildCommands(this.user?.id ?? "", guildId), { body: commands })
            .then(() => console.log("✅  Successfully registered application commands."))
            .catch(console.error);
    }
}
exports.default = ExtendedClient;
//# sourceMappingURL=ExtendedClient.js.map