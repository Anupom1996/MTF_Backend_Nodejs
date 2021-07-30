"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const app_1 = __importDefault(require("./app"));
const port = process.env.NODE_PORT || 4000;
app_1.default.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
});
//# sourceMappingURL=server.js.map