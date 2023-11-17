import { useState } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";

function Transfer({ setBalance, privateKey, publicKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const message = JSON.stringify({
      recipient: recipient,
      amount: sendAmount,
    });

    const hashMessage = keccak256(utf8ToBytes(message));
    const signature = await secp256k1.sign(hashMessage, privateKey);

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        message: message,
        signature: JSON.stringify({
          r: signature.r.toString(),
          s: signature.s.toString(),
          recovery: signature.recovery,
        }),
        publicKey: toHex(publicKey),
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input
        type="submit"
        className={`button ${
          sendAmount == "" || recipient == "" ? "disabled" : ""
        }`}
        value="Transfer"
        disabled={sendAmount == "" || recipient == ""}
      />
    </form>
  );
}

export default Transfer;
