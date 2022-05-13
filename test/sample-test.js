const { expect, expectThrow } = require("chai");
const { ethers } = require("hardhat");

function getRandomInt(max) {
  return Math.floor(Math.random() * max) + 1;
}
let address;

let positive = 3;
let nullVote = 1;
let negative = 2;

let max_wallet = 10;

describe("Referendum", async function () {
  let contractInstance;
  beforeEach(async function () {
    address = await ethers.getSigners();
    const Referendum = await ethers.getContractFactory("Referendum");
    contractInstance = await Referendum.deploy();
  });

  context("try all the different vote scenario", async () => {
    it("should be able to vote Positive", async () => {
      const result = await contractInstance.vote(positive, {
        from: address[0].address,
      });
      const vote = await contractInstance.getVote();
      expect(vote).to.equal(positive);
    });
    it("should be able to vote Negative", async () => {
      const result = await contractInstance.connect(address[1]).vote(negative);
      const vote = await contractInstance.connect(address[1]).getVote();
      expect(vote).to.equal(negative);
    });
    it("should be able to vote Null", async () => {
      const result = await contractInstance.connect(address[2]).vote(nullVote);
      const vote = await contractInstance.connect(address[2]).getVote();
      expect(vote).to.equal(nullVote);
    });
  });

  context("try to change vote scenario", async () => {
    it("should be able to vote Positive and change in Negative", async () => {
      let result;
      result = await contractInstance.vote(positive);
      vote = await contractInstance.getVote();
      expect(vote).to.equal(positive);

      await network.provider.send("evm_increaseTime", [60 * 60 * 24]);

      result = await contractInstance.vote(negative);
      vote = await contractInstance.getVote();
      expect(vote).to.equal(negative);
    });
    it("should be able to vote Positive and change in Null", async () => {
      let result;
      result = await contractInstance.vote(positive);
      vote = await contractInstance.getVote();
      expect(vote).to.equal(positive);

      await network.provider.send("evm_increaseTime", [60 * 60 * 24]);

      result = await contractInstance.vote(nullVote);
      vote = await contractInstance.getVote();
      expect(vote).to.equal(nullVote);
    });

    it("should be able to vote Negative and change in Positive", async () => {
      let result;
      result = await contractInstance.vote(negative);
      vote = await contractInstance.getVote();
      expect(vote).to.equal(negative);

      await network.provider.send("evm_increaseTime", [60 * 60 * 24]);

      result = await contractInstance.vote(positive);
      vote = await contractInstance.getVote();
      expect(vote).to.equal(positive);
    });
    it("should be able to vote Negative and change in Null", async () => {
      let result;
      result = await contractInstance.vote(negative);
      vote = await contractInstance.getVote();
      expect(vote).to.equal(negative);

      await network.provider.send("evm_increaseTime", [60 * 60 * 24]);

      result = await contractInstance.vote(nullVote);
      vote = await contractInstance.getVote();
      expect(vote).to.equal(nullVote);
    });

    it("should be able to vote Null and change in Positive", async () => {
      let result;
      result = await contractInstance.vote(nullVote);
      vote = await contractInstance.getVote();
      expect(vote).to.equal(nullVote);

      await network.provider.send("evm_increaseTime", [60 * 60 * 24]);

      result = await contractInstance.vote(positive);
      vote = await contractInstance.getVote();
      expect(vote).to.equal(positive);
    });
    it("should be able to vote Null and change in Negative", async () => {
      let result;
      result = await contractInstance.vote(nullVote);
      vote = await contractInstance.getVote();
      expect(vote).to.equal(nullVote);

      await network.provider.send("evm_increaseTime", [60 * 60 * 24]);

      result = await contractInstance.vote(negative);
      vote = await contractInstance.getVote();
      expect(vote).to.equal(negative);
    });
  });

  context("try Combination Positive e Negative ", async () => {
    it("should return Positive > Negative", async () => {
      let result = await contractInstance.vote(positive);
      vote = await contractInstance.getVote();
      expect(vote).to.equal(positive);

      result = await contractInstance.connect(address[1]).vote(positive);
      vote = await contractInstance.connect(address[1]).getVote();
      expect(vote).to.equal(positive);

      result = await contractInstance.connect(address[2]).vote(positive);
      vote = await contractInstance.connect(address[2]).getVote();
      expect(vote).to.equal(positive);

      result = await contractInstance.getResult();
      expect(result[0]).to.be.equal(3);
    });
    it("should return Positive < Negative", async () => {
      let result = await contractInstance.vote(negative);
      vote = await contractInstance.getVote();
      expect(vote).to.equal(negative);

      result = await contractInstance.connect(address[1]).vote(negative);
      vote = await contractInstance.connect(address[1]).getVote();
      expect(vote).to.equal(negative);

      result = await contractInstance.connect(address[2]).vote(negative);
      vote = await contractInstance.connect(address[2]).getVote();
      expect(vote).to.equal(negative);

      result = await contractInstance.getResult();
      expect(result[1]).to.be.equal(3);
    });

    it("should return Positive == Negative", async () => {
      let result = await contractInstance.vote(negative);
      vote = await contractInstance.getVote();
      expect(vote).to.equal(negative);

      result = await contractInstance.connect(address[1]).vote(positive);
      vote = await contractInstance.connect(address[1]).getVote();
      expect(vote).to.equal(positive);

      result = await contractInstance.getResult();
      expect(result[0]).to.be.equal(result[1]);
    });
  });

  context("try Combination Positive e Null ", async () => {
    it("should return Positive > Null", async () => {
      let result = await contractInstance.vote(positive);
      vote = await contractInstance.getVote();
      expect(vote).to.equal(positive);

      result = await contractInstance.connect(address[1]).vote(positive);
      vote = await contractInstance.connect(address[1]).getVote();
      expect(vote).to.equal(positive);

      result = await contractInstance.connect(address[2]).vote(nullVote);
      vote = await contractInstance.connect(address[2]).getVote();
      expect(vote).to.equal(nullVote);

      result = await contractInstance.getResult();
      expect(result[0] > result[2]).to.be.true;
    });
    it("should return Positive < Null", async () => {
      let result = await contractInstance.vote(nullVote);
      vote = await contractInstance.getVote();
      expect(vote).to.equal(nullVote);

      result = await contractInstance.connect(address[1]).vote(positive);
      vote = await contractInstance.connect(address[1]).getVote();
      expect(vote).to.equal(positive);

      result = await contractInstance.connect(address[2]).vote(nullVote);
      vote = await contractInstance.connect(address[2]).getVote();
      expect(vote).to.equal(nullVote);

      result = await contractInstance.getResult();
      expect(result[0] < result[2]).to.be.true;
    });

    it("should return Positive == Null", async () => {
      result = await contractInstance.connect(address[1]).vote(positive);
      vote = await contractInstance.connect(address[1]).getVote();
      expect(vote).to.equal(positive);

      result = await contractInstance.connect(address[2]).vote(nullVote);
      vote = await contractInstance.connect(address[2]).getVote();
      expect(vote).to.equal(nullVote);

      result = await contractInstance.getResult();
      expect(result[0]).to.be.equal(result[2]);
    });
  });

  context("try if coolDownTime work", async () => {
    it("should be able to Vote Again", async () => {
      let result;
      await contractInstance.vote(positive);
      vote = await contractInstance.getVote();
      expect(vote).to.equal(positive);

      await network.provider.send("evm_increaseTime", [60 * 60 * 24]);

      result = await contractInstance.getResult();
      expect(result[0] > result[2]).to.be.true;
    });

    it("should not be able to Vote Again", async () => {
      let result;
      await contractInstance.vote(positive);
      result = await contractInstance.getVote();
      try {
        await contractInstance.vote(negative);
      } catch (error) {
        return;
      }
      expect(true).to.be.false;
    });
  });
});
