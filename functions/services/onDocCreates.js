const analyticServices = require("./analytics")
const depositServices = require("./deposits")

const onUserCreate = async (doc) => {
    functions.logger.log("triggered: onUserCreate")
    await analyticServices.reportEvent({username:doc.username,eventName:"signup",insertId:doc._id,userProps:{utm_campaign:doc.utm_campaign}})
}

const onWithdrawalAddressCreate = async (doc) => {
    functions.logger.log("triggered: onWithdrawalAddressCreate")

    await analyticServices.reportEvent({username:doc.username,eventName:"add-wiithdrawal-address",insertId:doc._id})
}

const onDepositCreate = async (doc) => {
    functions.logger.log("triggered: onDepositCreate")

    await analyticServices.reportEvent({username:doc.username,eventName:"create-deposit",insertId:doc._id})
}

const onOnrampLogsCreate = async (doc) => {
    functions.logger.log("triggered: onOnrampLogsCreate")

    // const myDeposit = await depositServices.fetchDepositById({ depositId:doc._id });
    // const username = myDeposit.username
    // const eventName = doc.eventName
    // await analyticServices.reportEvent({username:username,eventName:eventName,insertId:doc._id})
}


module.exports = {onOnrampLogsCreate,onUserCreate,onWithdrawalAddressCreate,onDepositCreate}