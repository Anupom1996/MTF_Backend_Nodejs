"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * This function is used for connecting database
 */
exports.connect = () => {
    let connectioString = '';
    if (process.env.MONGO_USERNAME && process.env.MONGO_PASSWORD) {
        connectioString = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}?authSource=${process.env.MONGO_AUTHENTICATION_DATABASE}`;
    }
    else {
        connectioString = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;
    }
    const option = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
    };
    console.log('connectioString', connectioString);
    mongoose_1.default.connect(connectioString, option, function (err) {
        if (err) {
            console.log('Mongo DB Connection Error', err);
        }
        else {
            console.log('Mongo DB Connected');
        }
    });
};
//# sourceMappingURL=mongo.js.map