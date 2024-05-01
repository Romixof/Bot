"use strict";
/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const node_path_1 = __importDefault(require("node:path"));
const discord_js_1 = require("discord.js");
const keep_alive = require('./keep_alive.js');
const jsonc_1 = require("jsonc");
const dotenv_1 = require("dotenv");
const structure_1 = require("./structure");
// Initalize .env file as environment
try {
    (0, dotenv_1.config)();
}
catch (ex) {
    console.log(".env failed to load");
}
// Although invalid type, it should be good enough for now until more stuff needs to be handled here
process.on("unhandledRejection", (reason, promise, a) => {
    console.error(reason, promise, a);
});
process.on("uncaughtException", (err) => {
    console.error(err);
});
process.stdout.write(`
\x1b[38;2;143;110;250m████████╗██╗ ██████╗██╗  ██╗███████╗████████╗    ██████╗  ██████╗ ████████╗
\x1b[38;2;157;101;254m╚══██╔══╝██║██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝    ██╔══██╗██╔═══██╗╚══██╔══╝
\x1b[38;2;172;90;255m   ██║   ██║██║     █████╔╝ █████╗     ██║       ██████╔╝██║   ██║   ██║   
\x1b[38;2;188;76;255m   ██║   ██║██║     ██╔═██╗ ██╔══╝     ██║       ██╔══██╗██║   ██║   ██║   
\x1b[38;2;205;54;255m   ██║   ██║╚██████╗██║  ██╗███████╗   ██║       ██████╔╝╚██████╔╝   ██║   
\x1b[38;2;222;0;255m   ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝       ╚═════╝  ╚═════╝    ╚═╝\x1b[0m
                 https://github.com/Sayrix/ticket-bot

Connecting to Discord...
`);
// Update Detector
fetch("https://api.github.com/repos/Sayrix/Ticket-Bot/tags").then((res) => {
    if (Math.floor(res.status / 100) !== 2)
        return console.warn("🔄  Failed to pull latest version from server");
    res.json().then((json) => {
        // Assumign the format stays consistent (i.e. x.x.x)
        const latest = json[0].name.split(".").map((k) => parseInt(k));
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const current = require("../package.json").version.split(".")
            .map((k) => parseInt(k));
        if (latest[0] > current[0] ||
            (latest[0] === current[0] && latest[1] > current[1]) ||
            (latest[0] === current[0] && latest[1] === current[1] && latest[2] > current[2]))
            console.warn(`🔄  New version available: ${json[0].name}; Current Version: ${current.join(".")}`);
        else
            console.log("🔄  The ticket-bot is up to date");
    });
});
const config = jsonc_1.jsonc.parse(fs_extra_1.default.readFileSync(node_path_1.default.join(__dirname, "/../config/config.jsonc"), "utf8"));
const client = new structure_1.ExtendedClient({
    intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages, discord_js_1.GatewayIntentBits.MessageContent, discord_js_1.GatewayIntentBits.GuildMembers],
    presence: {
        status: config.status?.status ?? "online"
    }
}, config);
// Login the bot
const token = process.env["TOKEN"];
if (!token || token.trim() === "")
    throw new Error("TOKEN Environment Not Found");
client.login(process.env["TOKEN"]).then(null);

const http = require('http');

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.end(`
    <html>
      <head>
        <title>Your Web View</title>
      </head>
      <body style="margin: 0; padding: 0;">
        <iframe width="100%" height="100%" src="https://axocoder.vercel.app/" frameborder="0" allowfullscreen></iframe>
      </body>
    </html>`);
});

server.listen(3000, () => {
  console.log('Server Online because of Axo Coder ✅!!');
});
/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/
//# sourceMappingURL=index.js.map
