const Web3 = require("web3");
const web3 = new Web3('HTTP://127.0.0.1:7545');
const Crowdfunding = artifacts.require("Crowdfunding");

contract("Crowdfunding", (accounts) => {
    const contribution1 = {
        contributor: accounts[4],
        amount: web3.utils.toWei('1', 'ether')
    }

    const contribution2 = {
        contributor: accounts[5],
        amount: web3.utils.toWei('1', 'ether')
    }

    const contribution3 = {
        contributor: accounts[6],
        amount: web3.utils.toWei('1', 'ether')
    }

    const manager = accounts[0];
    const recipient = accounts[9];

    it("Should have 2 hours deadline", async () => {
        const crowdfundinginstance = await Crowdfunding.deployed()
        
        // blockNum = await web3.eth.getBlockNumber()
        // block = await web3.eth.getBlock(blockNum)
        // const currentTimeStamp = block.timestamp
        // const currentTime = new Date(currentTimeStamp*1000)

        let deadline = await crowdfundinginstance.deadline()
        deadline = deadline.toNumber()
        deadline = new Date(deadline*1000)


        let timestampofcreation = await web3.eth.getBlock(238)
        timestampofcreation = timestampofcreation.timestamp
        timestampofcreation = new Date(timestampofcreation*1000)

        // console.log( deadline, timestampofcreation)

        let sub = deadline.getTime() - timestampofcreation.getTime();
        let hrs = Math.floor(sub/(60*1000*60));

        assert(hrs >= 2,"Deadline not met")

    })

    it("Should take users' contribution", async () => {
        const crowdfundinginstance = await Crowdfunding.deployed()

        await crowdfundinginstance.sendEth({from: contribution1.contributor, gas: 3000000, value: contribution1.amount});

        await crowdfundinginstance.sendEth({from: contribution2.contributor, gas: 3000000, value: contribution2.amount});

        await crowdfundinginstance.sendEth({from: contribution3.contributor, gas: 3000000, value: contribution3.amount});

        let balance = await crowdfundinginstance.getContractbalance()
        balance = web3.utils.fromWei(balance, 'ether')     
        // console.log(balance)

        let expectedContribution = 3

        assert.equal(
            balance,
            expectedContribution,
            "Contributions failed"
          );
    });

    it("Should allow manager to create request", async () => {
        const crowdfundinginstance = await Crowdfunding.deployed()
        let balance = await crowdfundinginstance.getContractbalance()
        balance = web3.utils.fromWei(balance, 'ether')  

        await crowdfundinginstance.createRequest("Funds allocation", recipient, web3.utils.toWei('1', 'ether'), {
            from: manager,
            gas: 3000000
        });

        let numberOfRequest = await crowdfundinginstance.numRequests({
            from: manager,
            gas: 3000000
        })

        numberOfRequest = numberOfRequest.toNumber()
        assert.equal(numberOfRequest,1,"Request not created")
    })

    it("Should have met the target", async () => {
        const crowdfundinginstance = await Crowdfunding.deployed()

        let target = await crowdfundinginstance.target()
        target = web3.utils.fromWei(target, 'ether') 

        let balance = await crowdfundinginstance.getContractbalance()
        balance = web3.utils.fromWei(balance, 'ether') 

        assert(balance >= target, "Target not met")
    })

    it("Should allow contributors to vote for a request", async () => {
        const crowdfundinginstance = await Crowdfunding.deployed()

        await crowdfundinginstance.voteRequest(0, {
            from: contribution1.contributor,
            gas: 3000000
        })

        await crowdfundinginstance.voteRequest(0, {
            from: contribution2.contributor,
            gas: 3000000
        })

        const requests = await crowdfundinginstance.requests(0, {
            from: manager,
            gas: 3000000
        })

        assert.equal(requests.noOfVoters, 2, "Could not vote")
    })

    it("Should be able to complete the request", async () => {
        const crowdfundinginstance = await Crowdfunding.deployed()

        let receiverBalance = await web3.eth.getBalance(recipient)
        receiverBalanceInitial = web3.utils.fromWei(receiverBalance, 'ether')

        await crowdfundinginstance.makePayment(0, {
            from: manager,
            gas: 3000000
        })

        receiverBalance = await web3.eth.getBalance(recipient)
        receiverBalanceFinal = web3.utils.fromWei(receiverBalance, 'ether')
        
        assert.equal(receiverBalanceFinal - receiverBalanceInitial, 1, "The payment failed")
    })
})