// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./oz/Ownable.sol";
import "./oz/Pausable.sol";

contract Notarization is Ownable, Pausable {

    event Notarized(address indexed member, bytes32 indexed operationTokenHash);

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function notarize(address member, bytes32 operationTokenHash) external onlyOwner{
        emit Notarized(member, operationTokenHash);
    }
}