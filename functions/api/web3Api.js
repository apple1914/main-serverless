const { Web3 } = require("web3");
const RPC_SETTINGS = {
  bsc: { RPC_URL: "https://bsc-dataseed1.binance.org:443" },
};

const sendCoins = async ({
  fromAddress,
  toAddress,
  cryptoValue,
  blockchain,
}) => {
  console.log("wab3 inputs at sendCoins are:", {fromAddress,toAddress,cryptoValue,blockchain});
  const web3 = new Web3(RPC_SETTINGS[blockchain].RPC_URL);
  const params = {
    to: toAddress,
    from: fromAddress,
    value: web3.utils.toWei(`${cryptoValue}`, "ether"),
    gas: 21000, //web3.utils.toHex(21000), // optional
    gasPrice: 3000000000, //web3.utils.toHex(1),
    //   return Web3.utils.toHex(Number(res));
    // }),
  };

  const privateKey = process.env.BSC_DISTRIBUTOR_ADDRESS_PRIVATE_KEY;

  const signedTx = await web3.eth.accounts.signTransaction(params, privateKey);
  const result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  return result.transactionHash;
};

module.exports = { sendCoins };
