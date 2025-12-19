// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SeppukuMarket
 * @notice Hyper Casual Finance prediction market for personal goal commitments
 * @dev Implements a trustless market where a Host commits to a goal, participants bet YES/NO,
 *      and a designated Kaishyaku (arbiter) makes the final determination.
 */
contract SeppukuMarket {
    // ============ Types ============

    struct Market {
        address host;
        address kaishyaku;
        bytes32 goalHash;        // Hash of the goal (offchain storage for full text)
        uint64 deadline;
        uint256 hostStake;
        uint256 yesPool;
        uint256 noPool;
        bool declared;           // Has host made self-declaration?
        bool declaredSuccess;    // Host's self-declared result
        bool closed;             // Has kaishyaku finalized?
        bool finalSuccess;       // Final result by kaishyaku
    }

    // ============ State ============

    uint256 private _marketIdCounter;
    mapping(uint256 => Market) public markets;

    // Bet tracking: marketId => user => amount
    mapping(uint256 => mapping(address => uint256)) public yesBets;
    mapping(uint256 => mapping(address => uint256)) public noBets;

    // Claim tracking: marketId => user => claimed
    mapping(uint256 => mapping(address => bool)) public claimed;

    // ============ Events ============

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

    event PositionSwitched(
        uint256 indexed marketId,
        address indexed user,
        bool fromYesToNo,
        uint256 amount
    );

    event Declared(
        uint256 indexed marketId,
        bool success
    );

    event Closed(
        uint256 indexed marketId,
        bool finalSuccess
    );

    event Claimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 payout
    );

    // ============ Errors ============

    error InvalidDeadline();
    error InvalidKaishyaku();
    error InvalidStake();
    error DeadlinePassed();
    error DeadlineNotPassed();
    error MarketClosed();
    error NotHost();
    error NotKaishyaku();
    error AlreadyDeclared();
    error AlreadyClosed();
    error AlreadyClaimed();
    error NoClaimableAmount();
    error HostCannotBet();
    error InsufficientBet();
    error TransferFailed();

    // ============ Modifiers ============

    modifier onlyHost(uint256 marketId) {
        if (msg.sender != markets[marketId].host) revert NotHost();
        _;
    }

    modifier onlyKaishyaku(uint256 marketId) {
        if (msg.sender != markets[marketId].kaishyaku) revert NotKaishyaku();
        _;
    }

    modifier beforeDeadline(uint256 marketId) {
        if (block.timestamp >= markets[marketId].deadline) revert DeadlinePassed();
        _;
    }

    modifier afterDeadline(uint256 marketId) {
        if (block.timestamp < markets[marketId].deadline) revert DeadlineNotPassed();
        _;
    }

    modifier notClosed(uint256 marketId) {
        if (markets[marketId].closed) revert MarketClosed();
        _;
    }

    // ============ Core Functions ============

    /**
     * @notice Create a new prediction market for a goal
     * @param goalHash Hash of the goal description
     * @param deadline Timestamp when betting period ends
     * @param kaishyaku Address of the arbiter who will make final determination
     * @return marketId The ID of the newly created market
     */
    function createMarket(
        bytes32 goalHash,
        uint64 deadline,
        address kaishyaku
    ) external payable returns (uint256 marketId) {
        if (msg.value == 0) revert InvalidStake();
        if (deadline <= block.timestamp) revert InvalidDeadline();
        if (kaishyaku == address(0)) revert InvalidKaishyaku();

        marketId = _marketIdCounter++;

        markets[marketId] = Market({
            host: msg.sender,
            kaishyaku: kaishyaku,
            goalHash: goalHash,
            deadline: deadline,
            hostStake: msg.value,
            yesPool: 0,
            noPool: 0,
            declared: false,
            declaredSuccess: false,
            closed: false,
            finalSuccess: false
        });

        emit MarketCreated(
            marketId,
            msg.sender,
            kaishyaku,
            deadline,
            msg.value,
            goalHash
        );
    }

    /**
     * @notice Bet on YES (goal will be achieved)
     * @param marketId The market to bet on
     */
    function betYes(uint256 marketId)
        external
        payable
        beforeDeadline(marketId)
        notClosed(marketId)
    {
        if (msg.value == 0) revert InvalidStake();
        if (msg.sender == markets[marketId].host) revert HostCannotBet();

        yesBets[marketId][msg.sender] += msg.value;
        markets[marketId].yesPool += msg.value;

        emit BetPlaced(marketId, msg.sender, true, msg.value);
    }

    /**
     * @notice Bet on NO (goal will not be achieved)
     * @param marketId The market to bet on
     */
    function betNo(uint256 marketId)
        external
        payable
        beforeDeadline(marketId)
        notClosed(marketId)
    {
        if (msg.value == 0) revert InvalidStake();
        if (msg.sender == markets[marketId].host) revert HostCannotBet();

        noBets[marketId][msg.sender] += msg.value;
        markets[marketId].noPool += msg.value;

        emit BetPlaced(marketId, msg.sender, false, msg.value);
    }

    /**
     * @notice Switch entire position from YES to NO or vice versa
     * @param marketId The market to switch position in
     * @param fromYesToNo If true, switch from YES to NO; if false, switch from NO to YES
     */
    function switchPosition(uint256 marketId, bool fromYesToNo)
        external
        beforeDeadline(marketId)
        notClosed(marketId)
    {
        uint256 amount;

        if (fromYesToNo) {
            amount = yesBets[marketId][msg.sender];
            if (amount == 0) revert InsufficientBet();

            // Remove from YES
            yesBets[marketId][msg.sender] = 0;
            markets[marketId].yesPool -= amount;

            // Add to NO
            noBets[marketId][msg.sender] += amount;
            markets[marketId].noPool += amount;
        } else {
            amount = noBets[marketId][msg.sender];
            if (amount == 0) revert InsufficientBet();

            // Remove from NO
            noBets[marketId][msg.sender] = 0;
            markets[marketId].noPool -= amount;

            // Add to YES
            yesBets[marketId][msg.sender] += amount;
            markets[marketId].yesPool += amount;
        }

        emit PositionSwitched(marketId, msg.sender, fromYesToNo, amount);
    }

    /**
     * @notice Host declares the outcome of their goal (self-report)
     * @param marketId The market to declare for
     * @param success Whether the goal was achieved
     */
    function declare(uint256 marketId, bool success)
        external
        onlyHost(marketId)
        afterDeadline(marketId)
        notClosed(marketId)
    {
        if (markets[marketId].declared) revert AlreadyDeclared();

        markets[marketId].declared = true;
        markets[marketId].declaredSuccess = success;

        emit Declared(marketId, success);
    }

    /**
     * @notice Kaishyaku makes final determination of the outcome
     * @param marketId The market to close
     * @param finalSuccess The final determination
     */
    function close(uint256 marketId, bool finalSuccess)
        external
        onlyKaishyaku(marketId)
        afterDeadline(marketId)
        notClosed(marketId)
    {
        if (markets[marketId].closed) revert AlreadyClosed();

        markets[marketId].closed = true;
        markets[marketId].finalSuccess = finalSuccess;

        emit Closed(marketId, finalSuccess);
    }

    /**
     * @notice Claim winnings from a closed market (pull payment pattern)
     * @param marketId The market to claim from
     */
    function claim(uint256 marketId) external {
        Market storage market = markets[marketId];

        if (!market.closed) revert MarketClosed();
        if (claimed[marketId][msg.sender]) revert AlreadyClaimed();

        uint256 payout = calculatePayout(marketId, msg.sender);
        if (payout == 0) revert NoClaimableAmount();

        // Checks-Effects-Interactions pattern
        claimed[marketId][msg.sender] = true;

        (bool success, ) = msg.sender.call{value: payout}("");
        if (!success) revert TransferFailed();

        emit Claimed(marketId, msg.sender, payout);
    }

    // ============ View Functions ============

    /**
     * @notice Calculate the payout for a user in a closed market
     * @param marketId The market ID
     * @param user The user address
     * @return payout The amount the user can claim
     */
    function calculatePayout(uint256 marketId, address user)
        public
        view
        returns (uint256 payout)
    {
        Market storage market = markets[marketId];

        if (!market.closed) return 0;
        if (claimed[marketId][user]) return 0;

        uint256 totalPot = market.hostStake + market.yesPool + market.noPool;
        uint256 userStake;
        uint256 winnerPool;

        if (market.finalSuccess) {
            // Goal achieved: Host + YES bettors win
            winnerPool = market.hostStake + market.yesPool;

            if (user == market.host) {
                userStake = market.hostStake;
            } else {
                userStake = yesBets[marketId][user];
            }
        } else {
            // Goal failed: NO bettors win
            winnerPool = market.noPool;
            userStake = noBets[marketId][user];
        }

        if (winnerPool == 0 || userStake == 0) return 0;

        // Pro-rata distribution
        payout = (totalPot * userStake) / winnerPool;
    }

    /**
     * @notice Get the total pot size for a market
     * @param marketId The market ID
     * @return Total ETH in the market
     */
    function getTotalPot(uint256 marketId) external view returns (uint256) {
        Market storage market = markets[marketId];
        return market.hostStake + market.yesPool + market.noPool;
    }

    /**
     * @notice Get user's position in a market
     * @param marketId The market ID
     * @param user The user address
     * @return yesBet Amount bet on YES
     * @return noBet Amount bet on NO
     */
    function getUserPosition(uint256 marketId, address user)
        external
        view
        returns (uint256 yesBet, uint256 noBet)
    {
        return (yesBets[marketId][user], noBets[marketId][user]);
    }

    /**
     * @notice Check if market is in betting phase
     * @param marketId The market ID
     * @return True if betting is still open
     */
    function isBettingOpen(uint256 marketId) external view returns (bool) {
        Market storage market = markets[marketId];
        return !market.closed && block.timestamp < market.deadline;
    }

    /**
     * @notice Get market details
     * @param marketId The market ID
     * @return market The market struct
     */
    function getMarket(uint256 marketId) external view returns (Market memory market) {
        return markets[marketId];
    }
}
