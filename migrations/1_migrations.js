const Crowdfunding = artifacts.require("Crowdfunding");
const web3 = require('web3');
require('dotenv').config()
const fs = require('fs');

module.exports = async function (deployer, network, addresses) {    
    const daeadline = 2*60*60;
    const amountInWei = web3.utils.toWei('2' , 'Ether')
    await deployer.deploy(Crowdfunding, amountInWei, daeadline);
    const CrowdfundingContract = await Crowdfunding.deployed()

    const content = `Smart Contract Address : ${CrowdfundingContract.address}`;

    try {
    fs.writeFileSync('./data/data.txt', content);
    // file written successfully
    } catch (err) {
    console.error(err);
    }
};