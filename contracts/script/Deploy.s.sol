// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {SeppukuMarket} from "../src/SeppukuMarket.sol";

/**
 * @title Deploy
 * @notice Deployment script for SeppukuMarket contract
 * @dev Usage:
 *      forge script script/Deploy.s.sol:Deploy --rpc-url base-sepolia --broadcast --verify
 */
contract Deploy is Script {
    function run() external returns (SeppukuMarket) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        SeppukuMarket market = new SeppukuMarket();

        console.log("SeppukuMarket deployed at:", address(market));

        vm.stopBroadcast();

        return market;
    }
}
