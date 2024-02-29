const coinmarketcapApis = require("../api/coinmarketcap");

const parseWebhookCryptoValue = async ({ cryptoValue, cryptocurrency }) => {
  //fillTransactionDetails
  //transactionId => polygon chainegatwaye https://api.chaingateway.io/v2/polygon/transactions/{transaction}/receipt/decoded
  //amount type should be string?
  //in reality logic is more complex here to account for weird cases when there is zeros and stuff?
  //future improvement: use crypto api to fetch info by transaction Id and use info from there
  //if crypto is BNB and not stablecoin, then call on crypto convert to figure out what his balance is
  // const result = await chaingatewayApis.getTransactionInfo({ transactionId });
  //either result or result.data..
  // const data = result;
  console.log("parseWebhookCryptoValue", {
    cryptoValue,
    cryptocurrency,
  });
  if (cryptocurrency == "USDT" || cryptocurrency == "USDC") {
    return parseMercuryoAmountString({ amount: cryptoValue });
  } else {
    return convertCryptoccurencyToUsdt({ cryptoValue, cryptocurrency });
  }
};

const parseMercuryoAmountString = ({ amount }) => {
  return Number(amount);
};

const convertUsdtToCryptoccurency = async ({ usdtAmount, cryptocurrency }) => {
  const data = await coinmarketcapApis.fetchPrice({ cryptocurrency }); //check - it's eitehr data or data.data

  // console.log("data.cr[0]:", data[cryptocurrency][0]);
  // console.log("PRICE", data[cryptocurrency][0].quote["USD"].price);
  const price = data[cryptocurrency][0].quote["USD"].price;
  

  const cryptoValue = Number(usdtAmount) / Number(price);
  

  console.log("convertUsdtToCryptoccurency math:", { usdtAmount, cryptocurrency,price,cryptoValue });

  return cryptoValue.toFixed(7).toString();
};

module.exports = {
  parseWebhookCryptoValue,
  convertUsdtToCryptoccurency,
};

const convertCryptoccurencyToUsdt = async ({ cryptoValue, cryptocurrency }) => {
  console.log("converting following to USDT", { cryptoValue, cryptocurrency });
  const data = await coinmarketcapApis.fetchPrice({ cryptocurrency });
  console.log("data", data);
  const priceData = data[Object.keys(data)[0]];
  // console.log("priceData",priceData)
  console.log("priceData[0]",priceData[0])

  const price = Number(priceData[0].quote.USD.price);
  const cryptoValueParsed = parseMercuryoAmountString({ amount: cryptoValue });
  return cryptoValueParsed * price;
};