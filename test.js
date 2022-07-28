require('dotenv').config();
var Web3 = require('web3');
const axios = require('axios');
let config = require('./config.json');


const RPC_URL = config[process.env.CHAIN_ID].RPC_URL;
const SCAN_API_URL = config[process.env.CHAIN_ID].SCAN_URL;
const CONTRACTS = config[process.env.CHAIN_ID].CONTRACT;
const WRAPED_TOKEN_ADDRESS = config[process.env.CHAIN_ID].WRAPED_TOKEN_ADDRESS;


const INPUT_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000';
const AMOUNT_OUT = '10000000'; // 10 USDT
const OUTPUT_TOKEN_ADDRESS = config[process.env.CHAIN_ID].RECEIVE_TOKEN.USDT;


const path = 
    INPUT_TOKEN_ADDRESS == '0x0000000000000000000000000000000000000000' ?
    [WRAPED_TOKEN_ADDRESS, OUTPUT_TOKEN_ADDRESS] :
    [INPUT_TOKEN_ADDRESS, WRAPED_TOKEN_ADDRESS, OUTPUT_TOKEN_ADDRESS];


run();

async function run() {
    var web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
    for(let contractName in CONTRACTS) {
        await sleep(300).then(() => {
            let contractAddress = CONTRACTS[contractName];
            let endpoint = SCAN_API_URL + contractAddress + '&apikey=' + config[process.env.CHAIN_ID].SCAN_API_KEY
            axios.get(endpoint).then((data) => {
                let contractABI = "null";
                contractABI = JSON.parse(data.data.result);
                if (contractABI != '') {
                    var myContract = new web3.eth.Contract(contractABI, contractAddress);
                    myContract.methods.getAmountsIn(AMOUNT_OUT,path).call().then((result) => {
                        console.log(contractName + ":" + result[0]);
                    }).catch((err) => {
                        if(err.message.includes('ds-math-sub-underflow')) {
                            console.log(contractName + ": no liquidity");
                        }
                    });
                } else {
                    console.log("Error");
                }
            });
        })
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}