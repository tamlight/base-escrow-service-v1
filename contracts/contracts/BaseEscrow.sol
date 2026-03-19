// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BaseEscrow {
    enum Status { OPEN, COMPLETED, REFUNDED }

    struct Escrow {
        address buyer;
        address seller;
        uint256 amount;
        Status status;
        uint256 createdAt;
    }

    uint256 public nextEscrowId;
    mapping(uint256 => Escrow) public escrows;

    event EscrowCreated(uint256 indexed escrowId, address indexed buyer, address indexed seller, uint256 amount);
    event EscrowCompleted(uint256 indexed escrowId);
    event EscrowRefunded(uint256 indexed escrowId);

    function createEscrow(address _seller) external payable returns (uint256) {
        require(msg.value > 0, "Amount must be > 0");
        require(_seller != address(0), "Invalid seller address");

        uint256 escrowId = nextEscrowId++;
        escrows[escrowId] = Escrow({
            buyer: msg.sender,
            seller: _seller,
            amount: msg.value,
            status: Status.OPEN,
            createdAt: block.timestamp
        });

        emit EscrowCreated(escrowId, msg.sender, _seller, msg.value);
        return escrowId;
    }

    function confirmReceipt(uint256 _escrowId) external {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.buyer == msg.sender, "Only buyer can release funds");
        require(escrow.status == Status.OPEN, "Escrow not open");

        escrow.status = Status.COMPLETED;
        payable(escrow.seller).transfer(escrow.amount);

        emit EscrowCompleted(_escrowId);
    }

    function refundSellerToBuyer(uint256 _escrowId) external {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.seller == msg.sender, "Only seller can refund");
        require(escrow.status == Status.OPEN, "Escrow not open");

        escrow.status = Status.REFUNDED;
        payable(escrow.buyer).transfer(escrow.amount);

        emit EscrowRefunded(_escrowId);
    }

    function getEscrow(uint256 _escrowId) external view returns (address, address, uint256, Status, uint256) {
        Escrow storage e = escrows[_escrowId];
        return (e.buyer, e.seller, e.amount, e.status, e.createdAt);
    }
}
