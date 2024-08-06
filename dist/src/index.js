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
require('dotenv').config();
const libsignal_protocol_typescript_1 = require("@privacyresearch/libsignal-protocol-typescript");
const storage_type_1 = require("./storage-type");
const socket = require("socket.io");
const app = require("express")();
const cors = require('cors');
var store = new storage_type_1.SignalProtocolStore();
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        const registrationId = libsignal_protocol_typescript_1.KeyHelper.generateRegistrationId();
        // Store registrationId somewhere durable and safe... Or do this.
        store.put(`registrationID`, registrationId);
        const identityKeyPair = yield libsignal_protocol_typescript_1.KeyHelper.generateIdentityKeyPair();
        // Store identityKeyPair somewhere durable and safe... Or do this.
        store.put("identityKey", identityKeyPair);
        const baseKeyId = Math.floor(10000 * Math.random());
        const preKey = yield libsignal_protocol_typescript_1.KeyHelper.generatePreKey(baseKeyId);
        store.storePreKey(`${baseKeyId}`, preKey.keyPair);
        const signedPreKeyId = Math.floor(10000 * Math.random());
        const signedPreKey = yield libsignal_protocol_typescript_1.KeyHelper.generateSignedPreKey(identityKeyPair, signedPreKeyId);
        store.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair);
        const publicSignedPreKey = {
            keyId: signedPreKeyId,
            publicKey: signedPreKey.keyPair.pubKey,
            signature: signedPreKey.signature,
        };
        // KeyHelper.generatePreKey(baseKeyId).then(function(preKey) {
        //     store.storePreKey(preKey.keyId, preKey.keyPair);
        // });
        // KeyHelper.generateSignedPreKey(identityKeyPair,
        //     signedPreKeyId).then(function(signedPreKey) {
        //     store.storeSignedPreKey(signedPreKey.keyId, signedPreKey.keyPair);
        // });
        console.log(identityKeyPair.pubKey);
    });
}
test();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.get('/', (req, res) => {
    res.status(200).send("Hello World");
});
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
const io = socket(server, {
    cors: {
        origin: "http://localhost:3000"
    }
});
io.on("connection", function (socket) {
    console.log(`⚡: ${socket.id} user just connected!`);
    socket.on("message", (e) => {
        console.log('received message ', e);
    });
    socket.on('disconnect', () => {
        console.log('🔥: A user disconnected');
    });
});
