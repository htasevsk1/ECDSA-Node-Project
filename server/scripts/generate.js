const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const privateKey = secp.secp256k1.utils.randomPrivateKey();

console.log("privateKey", toHex(privateKey));

const publicKey = secp.secp256k1.getPublicKey(privateKey);

console.log("pubKey", toHex(publicKey));

const addressHash = keccak256(publicKey.slice(1));

console.log("address", toHex(addressHash.slice(-20)));
