const { Web3 } = require("web3");
const functions = require("firebase-functions/v1");

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
  functions.logger.log("sendCoins params", params);
  const signedTx = await web3.eth.accounts.signTransaction(params, privateKey);
  functions.logger.log("sendCoins signedTx", signedTx);
  const result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  functions.logger.log("sendCoins hash", result.transactionHash);
  return result.transactionHash;
};

const getBalance = async ({ address, blockchain }) => {
  const web3 = new Web3(RPC_SETTINGS[blockchain].RPC_URL);
  const balanceRaw = await web3.eth.getBalance(address); //Will give value in.
  const factor = BigInt("1000000000000000000");
  const balanceEth = balanceRaw / factor;
  return Number(balanceEth);
};

module.exports = { sendCoins, getBalance };
