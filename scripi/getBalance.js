const { Web3 } = require("web3");

const RPC_SETTINGS = {
  bsc: { RPC_URL: "https://bsc-dataseed1.binance.org:443" },
  polygon: {
    RPC_URL:
      "https://orbital-virulent-telescope.matic.quiknode.pro/b2d39b0a2c1d69b4bc31a80df785e19ee062308f",
  },
};

const getBalance = async ({ address, blockchain }) => {
  const web3 = new Web3(RPC_SETTINGS[blockchain].RPC_URL);

  const balanceRaw = await web3.eth.getBalance(address); //Will give value in.
  const factor = BigInt("1000000000000000000");
  const balanceEth = balanceRaw / factor;
  return Number(balanceEth);
};

const payload = {
  address: "0xC6110bcF3749530c0a8F5eDF064bB96631de8757",
  blockchain: "polygon",
};

getBalance(payload).then((a) => console.log(a));
