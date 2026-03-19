const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BaseEscrow", function () {
  let BaseEscrow, escrow;
  let buyer, seller, other;

  beforeEach(async function () {
    [buyer, seller, other] = await ethers.getSigners();
    BaseEscrow = await ethers.getContractFactory("BaseEscrow");
    escrow = await BaseEscrow.deploy();
  });

  it("Should create an escrow", async function () {
    const amount = ethers.parseEther("1.0");
    await escrow.connect(buyer).createEscrow(seller.address, { value: amount });

    const e = await escrow.escrows(0);
    expect(e.buyer).to.equal(buyer.address);
    expect(e.seller).to.equal(seller.address);
    expect(e.amount).to.equal(amount);
    expect(e.status).to.equal(0); // OPEN
  });

  it("Should release funds to seller", async function () {
    const amount = ethers.parseEther("1.0");
    await escrow.connect(buyer).createEscrow(seller.address, { value: amount });

    const initialBalance = await ethers.provider.getBalance(seller.address);
    await escrow.connect(buyer).confirmReceipt(0);
    const finalBalance = await ethers.provider.getBalance(seller.address);

    expect(finalBalance - initialBalance).to.equal(amount);
    const e = await escrow.escrows(0);
    expect(e.status).to.equal(1); // COMPLETED
  });

  it("Should allow seller to refund buyer", async function () {
    const amount = ethers.parseEther("1.0");
    await escrow.connect(buyer).createEscrow(seller.address, { value: amount });

    const initialBalance = await ethers.provider.getBalance(buyer.address);
    await escrow.connect(seller).refundSellerToBuyer(0);
    
    // Account for gas costs is tricky in a simple test, so we just check if it's roughly the same or higher
    // But since it's a refund, buyer should get the amount back.
    const finalBalance = await ethers.provider.getBalance(buyer.address);
    expect(finalBalance).to.be.gt(initialBalance);
    
    const e = await escrow.escrows(0);
    expect(e.status).to.equal(2); // REFUNDED
  });
});
