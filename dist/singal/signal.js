"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createID = createID;
const storage_type_1 = require("./storage-type");
const libsignal_protocol_typescript_1 = require("@privacyresearch/libsignal-protocol-typescript");
var store = new storage_type_1.SignalProtocolStore();
function createID() {
    return __awaiter(this, void 0, void 0, function* () {
        const identityKeyPair = yield libsignal_protocol_typescript_1.KeyHelper.generateIdentityKeyPair();
        const baseKeyId = Math.floor(10000 * Math.random());
        const preKey = yield libsignal_protocol_typescript_1.KeyHelper.generatePreKey(baseKeyId);
        store.storePreKey(`${baseKeyId}`, preKey.keyPair);
        const signedPreKeyId = Math.floor(10000 * Math.random());
        const signedPreKey = yield libsignal_protocol_typescript_1.KeyHelper.generateSignedPreKey(identityKeyPair, signedPreKeyId);
        store.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair);
        return {
            identityKeyPair,
            baseKeyId,
            preKey,
            signedPreKeyId,
            signedPreKey
        };
    });
}
