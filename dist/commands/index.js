"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenameCommand = exports.RemoveCommand = exports.CloseCommand = exports.ClaimCommand = exports.AddCommand = void 0;
const add_1 = __importDefault(require("./add"));
exports.AddCommand = add_1.default;
const claim_1 = __importDefault(require("./claim"));
exports.ClaimCommand = claim_1.default;
const close_1 = __importDefault(require("./close"));
exports.CloseCommand = close_1.default;
const remove_1 = __importDefault(require("./remove"));
exports.RemoveCommand = remove_1.default;
const rename_1 = __importDefault(require("./rename"));
exports.RenameCommand = rename_1.default;
//# sourceMappingURL=index.js.map