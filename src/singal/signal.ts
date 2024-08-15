import {SignalProtocolStore} from './storage-type';
import {
    KeyHelper,
  } from "@privacyresearch/libsignal-protocol-typescript";


var store = new SignalProtocolStore();
export async function createID() {
  const identityKeyPair = await KeyHelper.generateIdentityKeyPair();
  const baseKeyId = Math.floor(10000 * Math.random());
  const preKey = await KeyHelper.generatePreKey(baseKeyId);
  //store.storePreKey(`${baseKeyId}`, preKey.keyPair);

  const signedPreKeyId = Math.floor(10000 * Math.random());
  const signedPreKey = await KeyHelper.generateSignedPreKey(
    identityKeyPair,
    signedPreKeyId
  );
  //store.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair);
  console.log(store);
  return {
    identityKeyPair,
    baseKeyId,
    preKey,
    signedPreKeyId,
    signedPreKey
  }
}