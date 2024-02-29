const axios = require("axios")
const FREECURRENCYAPI_API_KEY = process.env.FREECURRENCYAPI_API_KEY

const fetchLatestRates = async () => {
    const url = "https://api.freecurrencyapi.com/v1/latest"+"?apikey="+FREECURRENCYAPI_API_KEY
    return axios.get(url).then((res)=>res.data.data).catch((err)=>console.log(err))
}

module.exports = {fetchLatestRates}