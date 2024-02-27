"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const structure_1 = require("../structure");
const claim_1 = require("../utils/claim");
const discord_js_1 = require("discord.js");
/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/
class ClaimCommand extends structure_1.BaseCommand {
    static data = new discord_js_1.SlashCommandBuilder()
        .setName("claim").setDescription("Set the ticket as claimed.");
    constructor(client) {
        super(client);
    }
    async execute(interaction) {
        return (0, claim_1.claim)(interaction, this.client);
    }
}
exports.default = ClaimCommand;
/*
Copyright 2023 Sayrix (github.com/Sayrix)

Licensed under the Creative Commons Attribution 4.0 International
please check https://creativecommons.org/licenses/by/4.0 for more informations.
*/ 
//# sourceMappingURL=claim.js.map