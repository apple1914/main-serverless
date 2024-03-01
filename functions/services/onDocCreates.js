const analyticServices = require("./analytics")
const depositServices = require("./deposits")

const onUserCreate = async (doc) => {
    functions.logger.log("triggered: onUserCreate")
    await analyticServices.reportEvent({username:doc.id,eventName:"signup",insertId:doc.id,userProps:{utm_campaign:doc.utm_campaign}})
}

const onWithdrawalAddressCreate = async (doc) => {
    functions.logger.log("triggered: onWithdrawalAddressCreate")

    await analyticServices.reportEvent({username:doc.username,eventName:"add-wiithdrawal-address",insertId:doc.id})
}

const onDepositCreate = async (doc) => {
    functions.logger.log("triggered: onDepositCreate")

    await analyticServices.reportEvent({username:doc.username,eventName:"create-deposit",insertId:doc.id})
}

const onOnrampLogCreate = async (doc) => {
    functions.logger.log("triggered: onOnrampLogCreate")
    const myDeposit = await depositServices.fetchDepositById({ depositId:doc.depositId });
    const username = myDeposit.username
    const eventName = doc.eventName
    await analyticServices.reportEvent({username:username,eventName:eventName,insertId:doc.id})
}


module.exports = {onOnrampLogCreate,onUserCreate,onWithdrawalAddressCreate,onDepositCreate}