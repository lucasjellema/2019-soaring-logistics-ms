const fdk = require('@fnproject/fdk');
const logger = require('./logger'); //our logger module
const rp = require("request-promise-native");
const shippingGenerator = require( './generateShipping.js' );

var APP_VERSION = "0.1.2"
var APP_NAME = "Shippings Generation Background Jobs"


fdk.handle(async function (input) {
    let name = 'World';
    logger.log('info', `Report from version ${APP_VERSION} function Shipping Generator, invoked with input ${JSON.stringify(input)}`)
    if (input.name) {
        name = input.name;
    }
    var result = {}
    // only generate a shipping in 60% of cases
    if (Math.random() < 0.6)
        result = await shippingGenerator.runShippingGenerationJob()
    else
        logger.log('info', `The randomizer has decided to skip this generation - no shipping is created`)


    return { 'message': `Final Report from ${APP_NAME} Function (version ${APP_VERSION} ${name}`, "result": result }
})

// runShippingGenerationJob()

