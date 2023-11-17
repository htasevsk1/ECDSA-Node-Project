const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const {
  utf8ToBytes,
  toHex,
  hexToBytes,
} = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "15a02f680bac778ac2f7f573215ba27ed1a03bf9": 100,
  "8f83eaca7ba7ae9b1cbfbc5ea485c707d3a759de": 50,
  "39b135b9361249ebac5e7244d2a32a4f38917718": 50,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { message, signature, publicKey } = req.body;

  const hashMessage = keccak256(utf8ToBytes(message));
  const messageObject = JSON.parse(message);
  const signatureObject = JSON.parse(signature);

  const isSigned = secp.secp256k1.verify(
    {
      r: BigInt(signatureObject.r),
      s: BigInt(signatureObject.s),
    },
    hashMessage,
    publicKey
  );

  if (!isSigned) {
    res.status(400).send({ message: "Not signed!" });
  } else {
    const amount = parseInt(messageObject.amount);
    const recipient = messageObject.recipient;
    const senderHash = keccak256(hexToBytes(publicKey).slice(1));
    const sender = toHex(senderHash.slice(-20));

    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
