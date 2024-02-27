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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendedClient = exports.BaseEvent = exports.BaseCommand = void 0;
const BaseCommand_1 = __importDefault(require("./BaseCommand"));
exports.BaseCommand = BaseCommand_1.default;
const BaseEvent_1 = __importDefault(require("./BaseEvent"));
exports.BaseEvent = BaseEvent_1.default;
const ExtendedClient_1 = __importDefault(require("./ExtendedClient"));
exports.ExtendedClient = ExtendedClient_1.default;
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map