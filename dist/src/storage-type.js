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
exports.SignalProtocolStore = void 0;
exports.isKeyPairType = isKeyPairType;
exports.isPreKeyType = isPreKeyType;
exports.isSignedPreKeyType = isSignedPreKeyType;
exports.arrayBufferToString = arrayBufferToString;
exports.uint8ArrayToString = uint8ArrayToString;
/* eslint-disable @typescript-eslint/no-explicit-any */
const libsignal_protocol_typescript_1 = require("@privacyresearch/libsignal-protocol-typescript");
// Type guards
function isKeyPairType(kp) {
    return !!((kp === null || kp === void 0 ? void 0 : kp.privKey) && (kp === null || kp === void 0 ? void 0 : kp.pubKey));
}
function isPreKeyType(pk) {
    return typeof (pk === null || pk === void 0 ? void 0 : pk.keyId) === 'number' && isKeyPairType(pk === null || pk === void 0 ? void 0 : pk.keyPair);
}
function isSignedPreKeyType(spk) {
    return (spk === null || spk === void 0 ? void 0 : spk.signature) && isPreKeyType(spk);
}
function isArrayBuffer(thing) {
    const t = typeof thing;
    return !!thing && t !== 'string' && t !== 'number' && 'byteLength' in thing;
}
class SignalProtocolStore {
    constructor() {
        this._store = {};
    }
    //
    get(key, defaultValue) {
        if (key === null || key === undefined)
            throw new Error('Tried to get value for undefined/null key');
        if (key in this._store) {
            return this._store[key];
        }
        else {
            return defaultValue;
        }
    }
    remove(key) {
        if (key === null || key === undefined)
            throw new Error('Tried to remove value for undefined/null key');
        delete this._store[key];
    }
    put(key, value) {
        if (key === undefined || value === undefined || key === null || value === null)
            throw new Error('Tried to store undefined/null');
        this._store[key] = value;
    }
    getIdentityKeyPair() {
        return __awaiter(this, void 0, void 0, function* () {
            const kp = this.get('identityKey', undefined);
            if (isKeyPairType(kp) || typeof kp === 'undefined') {
                return kp;
            }
            throw new Error('Item stored as identity key of unknown type.');
        });
    }
    getLocalRegistrationId() {
        return __awaiter(this, void 0, void 0, function* () {
            const rid = this.get('registrationId', undefined);
            if (typeof rid === 'number' || typeof rid === 'undefined') {
                return rid;
            }
            throw new Error('Stored Registration ID is not a number');
        });
    }
    isTrustedIdentity(identifier, identityKey, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _direction) {
        if (identifier === null || identifier === undefined) {
            throw new Error('tried to check identity key for undefined/null key');
        }
        const trusted = this.get('identityKey' + identifier, undefined);
        // TODO: Is this right? If the ID is NOT in our store we trust it?
        if (trusted === undefined) {
            return Promise.resolve(true);
        }
        return Promise.resolve(arrayBufferToString(identityKey) === arrayBufferToString(trusted));
    }
    loadPreKey(keyId) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = this.get('25519KeypreKey' + keyId, undefined);
            if (isKeyPairType(res)) {
                res = { pubKey: res.pubKey, privKey: res.privKey };
                return res;
            }
            else if (typeof res === 'undefined') {
                return res;
            }
            throw new Error(`stored key has wrong type`);
        });
    }
    loadSession(identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            const rec = this.get('session' + identifier, undefined);
            if (typeof rec === 'string') {
                return rec;
            }
            else if (typeof rec === 'undefined') {
                return rec;
            }
            throw new Error(`session record is not an ArrayBuffer`);
        });
    }
    loadSignedPreKey(keyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = this.get('25519KeysignedKey' + keyId, undefined);
            if (isKeyPairType(res)) {
                return { pubKey: res.pubKey, privKey: res.privKey };
            }
            else if (typeof res === 'undefined') {
                return res;
            }
            throw new Error(`stored key has wrong type`);
        });
    }
    removePreKey(keyId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.remove('25519KeypreKey' + keyId);
        });
    }
    saveIdentity(identifier, identityKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (identifier === null || identifier === undefined)
                throw new Error('Tried to put identity key for undefined/null key');
            const address = libsignal_protocol_typescript_1.SignalProtocolAddress.fromString(identifier);
            const existing = this.get('identityKey' + address.getName(), undefined);
            this.put('identityKey' + address.getName(), identityKey);
            if (existing && !isArrayBuffer(existing)) {
                throw new Error('Identity Key is incorrect type');
            }
            if (existing && arrayBufferToString(identityKey) !== arrayBufferToString(existing)) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    storeSession(identifier, record) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.put('session' + identifier, record);
        });
    }
    loadIdentityKey(identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            if (identifier === null || identifier === undefined) {
                throw new Error('Tried to get identity key for undefined/null key');
            }
            const key = this.get('identityKey' + identifier, undefined);
            if (isArrayBuffer(key)) {
                return key;
            }
            else if (typeof key === 'undefined') {
                return key;
            }
            throw new Error(`Identity key has wrong type`);
        });
    }
    storePreKey(keyId, keyPair) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.put('25519KeypreKey' + keyId, keyPair);
        });
    }
    // TODO: Why is this keyId a number where others are strings?
    storeSignedPreKey(keyId, keyPair) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.put('25519KeysignedKey' + keyId, keyPair);
        });
    }
    removeSignedPreKey(keyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.remove('25519KeysignedKey' + keyId);
        });
    }
    removeSession(identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.remove('session' + identifier);
        });
    }
    removeAllSessions(identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const id in this._store) {
                if (id.startsWith('session' + identifier)) {
                    delete this._store[id];
                }
            }
        });
    }
}
exports.SignalProtocolStore = SignalProtocolStore;
function arrayBufferToString(b) {
    return uint8ArrayToString(new Uint8Array(b));
}
function uint8ArrayToString(arr) {
    const end = arr.length;
    let begin = 0;
    if (begin === end)
        return '';
    let chars = [];
    const parts = [];
    while (begin < end) {
        chars.push(arr[begin++]);
        if (chars.length >= 1024) {
            parts.push(String.fromCharCode(...chars));
            chars = [];
        }
    }
    return parts.join('') + String.fromCharCode(...chars);
}
