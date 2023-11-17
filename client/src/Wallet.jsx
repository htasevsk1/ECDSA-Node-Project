import server from "./server";

import * as secp from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
  setPublicKey,
}) {
  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);

    const pubKey = secp.secp256k1.getPublicKey(privateKey);
    setPublicKey(pubKey);

    const addressHash = keccak256(pubKey.slice(1));
    const actualAddress = toHex(addressHash.slice(-20));
    setAddress(actualAddress);

    if (actualAddress) {
      const {
        data: { balance },
      } = await server.get(`balance/${actualAddress}`);
      setBalance(balance);
    } else {
      console.log("here", actualAddress);
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private key
        <input
          placeholder="Type an private key, for example: 0x1"
          value={privateKey}
          onChange={onChange}
        ></input>
      </label>

      <div className="address">Address: {address}</div>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
