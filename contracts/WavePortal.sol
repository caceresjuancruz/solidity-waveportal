// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.8.9;

import "hardhat/console.sol";

contract WavePortal {
    
    uint256 totalWaves;
    uint256 prizeAmount = 0.0001 ether;
    address owner;
    uint256 private seed;

    constructor() payable {
        console.log("We have been constructed!");
        owner = msg.sender;
        seed = (block.timestamp + block.difficulty) % 100;
    }

    modifier onlyOwner{
        require(msg.sender == owner);
        _;
    }

    event NewWave(address indexed from, uint256 timestamp, string message);

    struct Wave{
        address waver;
        string message;
        uint256 timestamp;
    }

    Wave[] waves;

    mapping(address => uint256) public lastWavedAt;

    function wave(string memory _message) public {
        require(
            lastWavedAt[msg.sender] + 15 minutes < block.timestamp,
            "Wait 15 min to send another wave!"
        );
        
        lastWavedAt[msg.sender] = block.timestamp;
        totalWaves++;
        waves.push(Wave(msg.sender, _message, block.timestamp));
        
        seed = (block.difficulty + block.timestamp + seed) % 100;

        if(seed < 50){
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success,) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }

        emit NewWave(msg.sender, block.timestamp, _message);
    }

    function getAllWaves() public view returns(Wave[] memory){
        return waves;
    }

    function getTotalWaves() public view returns (uint256){
        console.log("We have %d total waves!", totalWaves);
        return totalWaves;
    }

    function changePrizeAmount(uint256 _newAmount) internal onlyOwner {
        prizeAmount = _newAmount;
    }
}