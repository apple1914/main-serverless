const TRANSAK_API_KEY_PROD = process.env.TRANSAK_API_KEY_PROD
const TRANSAK_SECRET_PROD = process.env.TRANSAK_SECRET_PROD

const TRANSAK_API_KEY_TEST_LEVII = process.env.TRANSAK_API_KEY_TEST_LEVII
const TRANSAK_SECRET_TEST_LEVII = process.env.TRANSAK_SECRET_TEST_LEVII

const TRANSAK_API_KEY_TEST_PROD_CONNECTED = process.env.TRANSAK_API_KEY_TEST_PROD_CONNECTED
const TRANSAK_SECRET_TEST_PROD_CONNECTED = process.env.TRANSAK_SECRET_TEST_PROD_CONNECTED


const TRANSAK_API_KEY_TEST = TRANSAK_API_KEY_TEST_LEVII//keep this way till live
const TRANSAK_SECRET_TEST = TRANSAK_SECRET_TEST_LEVII//keep this way till live

module.exports = {TRANSAK_API_KEY_PROD,TRANSAK_SECRET_PROD,TRANSAK_API_KEY_TEST,TRANSAK_SECRET_TEST}

//-----WARNING!---DO NOT DELETE THIS FILE ABOVE ----
//-----WARNING!---DO NOT DELETE THIS FILE ABOVE ----
//---------------------------------------------------------
// TPURPOSE OF THIS: to handle the logic of levii and subprod test for transak etc so that it is explicitly managed here and never confusde
//---------------------------------------------------------
//-----WARNING!---DO NOT DELETE THIS FILE ABOVE ----
//-----WARNING!---DO NOT DELETE THIS FILE ABOVE ----
