// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {SeppukuMarket} from "../src/SeppukuMarket.sol";

/**
 * @title SeppukuMarketTest
 * @notice Basic test suite for SeppukuMarket contract
 * @dev For hackathon demonstration - expand for production use
 */
contract SeppukuMarketTest is Test {
    SeppukuMarket public market;

    address public host;
    address public kaishyaku;
    address public user1;
    address public user2;

    bytes32 public constant GOAL_HASH = keccak256("Run a marathon by December 31st");
    uint64 public deadline;

    // Events to test
    event MarketCreated(
        uint256 indexed marketId,
        address indexed host,
        address indexed kaishyaku,
        uint64 deadline,
        uint256 hostStake,
        bytes32 goalHash
    );

    event BetPlaced(
        uint256 indexed marketId,
        address indexed user,
        bool isYes,
        uint256 amount
    );

    function setUp() public {
        market = new SeppukuMarket();

        // Setup test accounts with ETH
        host = makeAddr("host");
        kaishyaku = makeAddr("kaishyaku");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        vm.deal(host, 100 ether);
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);

        // Set deadline to 30 days from now
        deadline = uint64(block.timestamp + 30 days);
    }

    // ============ Market Creation Tests ============

    function test_CreateMarket() public {
        vm.prank(host);

        vm.expectEmit(true, true, true, true);
        emit MarketCreated(0, host, kaishyaku, deadline, 1 ether, GOAL_HASH);

        uint256 marketId = market.createMarket{value: 1 ether}(
            GOAL_HASH,
            deadline,
            kaishyaku
        );

        assertEq(marketId, 0);

        SeppukuMarket.Market memory m = market.getMarket(marketId);
        assertEq(m.host, host);
        assertEq(m.kaishyaku, kaishyaku);
        assertEq(m.goalHash, GOAL_HASH);
        assertEq(m.deadline, deadline);
        assertEq(m.hostStake, 1 ether);
        assertEq(m.yesPool, 0);
        assertEq(m.noPool, 0);
        assertFalse(m.declared);
        assertFalse(m.closed);
    }

    function testFail_CreateMarketWithZeroStake() public {
        vm.prank(host);
        market.createMarket{value: 0}(GOAL_HASH, deadline, kaishyaku);
    }

    function testFail_CreateMarketWithPastDeadline() public {
        vm.prank(host);
        market.createMarket{value: 1 ether}(
            GOAL_HASH,
            uint64(block.timestamp - 1),
            kaishyaku
        );
    }

    function testFail_CreateMarketWithZeroKaishyaku() public {
        vm.prank(host);
        market.createMarket{value: 1 ether}(
            GOAL_HASH,
            deadline,
            address(0)
        );
    }

    // ============ Betting Tests ============

    function test_BetYes() public {
        // Create market
        vm.prank(host);
        uint256 marketId = market.createMarket{value: 1 ether}(
            GOAL_HASH,
            deadline,
            kaishyaku
        );

        // User1 bets YES
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit BetPlaced(marketId, user1, true, 0.5 ether);

        market.betYes{value: 0.5 ether}(marketId);

        SeppukuMarket.Market memory m = market.getMarket(marketId);
        assertEq(m.yesPool, 0.5 ether);

        (uint256 yesBet, uint256 noBet) = market.getUserPosition(marketId, user1);
        assertEq(yesBet, 0.5 ether);
        assertEq(noBet, 0);
    }

    function test_BetNo() public {
        // Create market
        vm.prank(host);
        uint256 marketId = market.createMarket{value: 1 ether}(
            GOAL_HASH,
            deadline,
            kaishyaku
        );

        // User2 bets NO
        vm.prank(user2);
        market.betNo{value: 0.3 ether}(marketId);

        SeppukuMarket.Market memory m = market.getMarket(marketId);
        assertEq(m.noPool, 0.3 ether);

        (uint256 yesBet, uint256 noBet) = market.getUserPosition(marketId, user2);
        assertEq(yesBet, 0);
        assertEq(noBet, 0.3 ether);
    }

    function testFail_HostCannotBet() public {
        // Create market
        vm.prank(host);
        uint256 marketId = market.createMarket{value: 1 ether}(
            GOAL_HASH,
            deadline,
            kaishyaku
        );

        // Host tries to bet (should fail)
        vm.prank(host);
        market.betYes{value: 0.5 ether}(marketId);
    }

    function testFail_BetAfterDeadline() public {
        // Create market
        vm.prank(host);
        uint256 marketId = market.createMarket{value: 1 ether}(
            GOAL_HASH,
            deadline,
            kaishyaku
        );

        // Warp past deadline
        vm.warp(deadline + 1);

        // Try to bet (should fail)
        vm.prank(user1);
        market.betYes{value: 0.5 ether}(marketId);
    }

    // ============ Position Switching Tests ============

    function test_SwitchPosition() public {
        // Create market and bet
        vm.prank(host);
        uint256 marketId = market.createMarket{value: 1 ether}(
            GOAL_HASH,
            deadline,
            kaishyaku
        );

        vm.prank(user1);
        market.betYes{value: 0.5 ether}(marketId);

        // Switch from YES to NO
        vm.prank(user1);
        market.switchPosition(marketId, true);

        SeppukuMarket.Market memory m = market.getMarket(marketId);
        assertEq(m.yesPool, 0);
        assertEq(m.noPool, 0.5 ether);

        (uint256 yesBet, uint256 noBet) = market.getUserPosition(marketId, user1);
        assertEq(yesBet, 0);
        assertEq(noBet, 0.5 ether);
    }

    // ============ Resolution Tests ============

    function test_DeclareAndClose() public {
        // Create market
        vm.prank(host);
        uint256 marketId = market.createMarket{value: 1 ether}(
            GOAL_HASH,
            deadline,
            kaishyaku
        );

        // Warp past deadline
        vm.warp(deadline + 1);

        // Host declares success
        vm.prank(host);
        market.declare(marketId, true);

        SeppukuMarket.Market memory m = market.getMarket(marketId);
        assertTrue(m.declared);
        assertTrue(m.declaredSuccess);

        // Kaishyaku closes
        vm.prank(kaishyaku);
        market.close(marketId, true);

        m = market.getMarket(marketId);
        assertTrue(m.closed);
        assertTrue(m.finalSuccess);
    }

    // ============ Claim Tests ============

    function test_SuccessfulClaim() public {
        // Create market
        vm.prank(host);
        uint256 marketId = market.createMarket{value: 1 ether}(
            GOAL_HASH,
            deadline,
            kaishyaku
        );

        // User1 bets YES
        vm.prank(user1);
        market.betYes{value: 1 ether}(marketId);

        // User2 bets NO
        vm.prank(user2);
        market.betNo{value: 1 ether}(marketId);

        // Total pot: 3 ETH (1 host + 1 yes + 1 no)
        assertEq(market.getTotalPot(marketId), 3 ether);

        // Warp past deadline and close with success
        vm.warp(deadline + 1);
        vm.prank(kaishyaku);
        market.close(marketId, true);

        // Winners: Host + YES (2 ETH stake, win 3 ETH total)
        // Host should get: 3 * 1 / 2 = 1.5 ETH
        // User1 should get: 3 * 1 / 2 = 1.5 ETH

        uint256 hostBalanceBefore = host.balance;
        vm.prank(host);
        market.claim(marketId);
        assertEq(host.balance - hostBalanceBefore, 1.5 ether);

        uint256 user1BalanceBefore = user1.balance;
        vm.prank(user1);
        market.claim(marketId);
        assertEq(user1.balance - user1BalanceBefore, 1.5 ether);

        // User2 (NO bettor) should get nothing
        uint256 payout = market.calculatePayout(marketId, user2);
        assertEq(payout, 0);
    }

    function test_FailedGoalClaim() public {
        // Create market
        vm.prank(host);
        uint256 marketId = market.createMarket{value: 1 ether}(
            GOAL_HASH,
            deadline,
            kaishyaku
        );

        // User2 bets NO
        vm.prank(user2);
        market.betNo{value: 1 ether}(marketId);

        // Total pot: 2 ETH
        assertEq(market.getTotalPot(marketId), 2 ether);

        // Close with failure
        vm.warp(deadline + 1);
        vm.prank(kaishyaku);
        market.close(marketId, false);

        // Only NO bettors win
        // User2 should get entire pot: 2 ETH
        uint256 user2BalanceBefore = user2.balance;
        vm.prank(user2);
        market.claim(marketId);
        assertEq(user2.balance - user2BalanceBefore, 2 ether);

        // Host gets nothing
        uint256 hostPayout = market.calculatePayout(marketId, host);
        assertEq(hostPayout, 0);
    }

    function testFail_DoubleClaim() public {
        // Create and close market
        vm.prank(host);
        uint256 marketId = market.createMarket{value: 1 ether}(
            GOAL_HASH,
            deadline,
            kaishyaku
        );

        vm.warp(deadline + 1);
        vm.prank(kaishyaku);
        market.close(marketId, true);

        // Claim once
        vm.prank(host);
        market.claim(marketId);

        // Try to claim again (should fail)
        vm.prank(host);
        market.claim(marketId);
    }

    // ============ View Function Tests ============

    function test_IsBettingOpen() public {
        vm.prank(host);
        uint256 marketId = market.createMarket{value: 1 ether}(
            GOAL_HASH,
            deadline,
            kaishyaku
        );

        // Should be open before deadline
        assertTrue(market.isBettingOpen(marketId));

        // Should be closed after deadline
        vm.warp(deadline + 1);
        assertFalse(market.isBettingOpen(marketId));
    }
}
