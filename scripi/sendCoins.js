const { Web3 } = require("web3");

const RPC_SETTINGS = {
  bsc: { RPC_URL: "https://bsc-dataseed1.binance.org:443" },
  polygon: {
    RPC_URL:
      "https://orbital-virulent-telescope.matic.quiknode.pro/b2d39b0a2c1d69b4bc31a80df785e19ee062308f",
  },
};

const sendCoins = async ({
  fromAddress,
  privateKey,
  toAddress,
  cryptoValue,
  blockchain,
}) => {
  const web3 = new Web3(RPC_SETTINGS[blockchain].RPC_URL);
  const params = {
    to: toAddress,
    from: fromAddress,
    value: web3.utils.toWei(`${cryptoValue}`, "ether"),
    //gas: 21000, //web3.utils.toHex(21000), // optional
    gasPrice: 1000000000000, //web3.utils.toHex(1),
    //   return Web3.utils.toHex(Number(res));
    // }),
  };
  console.log("sendCoins params", params);
  const signedTx = await web3.eth.accounts.signTransaction(params, privateKey);
  console.log("sendCoins signedTx", signedTx);
  const result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log("sendCoins hash", result.transactionHash);
  return result.transactionHash;
};

const payload = {
  fromAddress: "0xC6110bcF3749530c0a8F5eDF064bB96631de8757",
  privateKey:
    "3991ef85411555d056505fc22a406815a3ad2e736ab912e6d19250b46eae25ee",
  toAddress: "0x0A5ba2B2b30148751BcF95Ae5e5BD37E76CeD3cC",
  cryptoValue: "0.5",
  blockchain: "polygon",
};

sendCoins(payload);

const determinePrice = ({ blockchain }) => {
  const web3 = new Web3(RPC_SETTINGS[blockchain].RPC_URL);
  const result = web3.eth.gasPrice();
  console.log("res::", result);
};

// determinePrice({ blockchain: "polygon" });
