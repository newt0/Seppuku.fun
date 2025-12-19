# Seppuku.fun Smart Contracts

Hyper Casual Finance prediction market for personal goal commitments on Base.

## Overview

Seppuku.fun transforms personal goal declarations into on-chain prediction markets with a trust-based resolution model (Host + Kaishyaku arbiter). This contract enables:

- **Goal Commitment Markets**: Hosts create markets by staking ETH on their goals
- **Community Participation**: Anyone can bet YES/NO on whether goals will be achieved
- **Flexible Positions**: Participants can switch between YES/NO before the deadline
- **Trustless Settlement**: Host self-declares, Kaishyaku makes final determination, winners claim via pull payment

## Contract: SeppukuMarket.sol

### Key Features

- ✅ Native ETH markets (no ERC20 complexity)
- ✅ Deadline-based state machine
- ✅ Position switching (YES ⇄ NO)
- ✅ Pull payment pattern (gas-efficient claims)
- ✅ Pro-rata profit distribution
- ✅ Reentrancy protection

### Roles

| Role | Description |
|------|-------------|
| **Host** | Creates the market, stakes ETH, self-declares outcome |
| **Kaishyaku** | Designated arbiter who makes final determination |
| **Participant** | Bets YES/NO on the outcome |

### State Flow

```
┌─────────┐
│  OPEN   │  Before deadline - Betting & position switching allowed
└────┬────┘
     │
     │  deadline passes
     ▼
┌─────────┐
│ LOCKED  │  After deadline - Host can declare, Kaishyaku can close
└────┬────┘
     │
     │  declare() by Host (optional)
     ▼
┌──────────┐
│ DECLARED │  Host declared outcome - Kaishyaku can close
└────┬─────┘
     │
     │  close() by Kaishyaku
     ▼
┌─────────┐
│ CLOSED  │  Market finalized - Winners can claim
└─────────┘
```

### Core Functions

#### Market Creation

```solidity
function createMarket(
    bytes32 goalHash,
    uint64 deadline,
    address kaishyaku
) external payable returns (uint256 marketId)
```

Creates a new prediction market. Host must stake ETH as commitment.

**Parameters:**
- `goalHash`: Hash of the goal description (full text stored off-chain)
- `deadline`: Unix timestamp when betting period ends
- `kaishyaku`: Address of the arbiter

**Requirements:**
- `msg.value > 0` (host must stake)
- `deadline > block.timestamp`
- `kaishyaku != address(0)`

#### Betting

```solidity
function betYes(uint256 marketId) external payable
function betNo(uint256 marketId) external payable
```

Place a bet on YES (goal achieved) or NO (goal not achieved).

**Requirements:**
- Before deadline
- Market not closed
- `msg.value > 0`
- Sender is not the host

#### Position Management

```solidity
function switchPosition(uint256 marketId, bool fromYesToNo) external
```

Switch entire position from YES to NO or vice versa.

**Parameters:**
- `fromYesToNo`: `true` to switch YES→NO, `false` to switch NO→YES

**Requirements:**
- Before deadline
- Market not closed
- User has position to switch

#### Resolution

```solidity
function declare(uint256 marketId, bool success) external
```

Host self-declares the outcome (optional step).

**Requirements:**
- Only host
- After deadline
- Market not closed

```solidity
function close(uint256 marketId, bool finalSuccess) external
```

Kaishyaku makes final determination.

**Requirements:**
- Only kaishyaku
- After deadline
- Market not closed

#### Claiming

```solidity
function claim(uint256 marketId) external
```

Winners claim their share of the pot (pull payment).

**Requirements:**
- Market is closed
- User hasn't claimed yet
- User has claimable amount

### Payout Distribution

Total pot: `P = hostStake + yesPool + noPool`

#### If Goal Achieved (`finalSuccess = true`)

Winners: Host + YES bettors

```
payout(user) = P × userStake / (hostStake + yesPool)
```

#### If Goal Not Achieved (`finalSuccess = false`)

Winners: NO bettors only (Host loses stake)

```
payout(user) = P × userStake / noPool
```

### View Functions

```solidity
function calculatePayout(uint256 marketId, address user)
    external view returns (uint256)

function getTotalPot(uint256 marketId)
    external view returns (uint256)

function getUserPosition(uint256 marketId, address user)
    external view returns (uint256 yesBet, uint256 noBet)

function isBettingOpen(uint256 marketId)
    external view returns (bool)

function getMarket(uint256 marketId)
    external view returns (Market memory)
```

### Events

```solidity
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

event Declared(uint256 indexed marketId, bool success);

event Closed(uint256 indexed marketId, bool finalSuccess);

event Claimed(
    uint256 indexed marketId,
    address indexed user,
    uint256 payout
);
```

## Security Features

- **Reentrancy Protection**: Checks-Effects-Interactions pattern in `claim()`
- **Access Control**: Role-based modifiers for host/kaishyaku actions
- **State Validation**: Strict deadline and state checks
- **Pull Payment**: Winners pull funds individually (no gas limit issues)
- **Zero Address Protection**: Validates critical addresses

## Deployment

### Target Chain

- **Base Sepolia** (testnet) for MVP
- **Base Mainnet** for production

### Prerequisites

```bash
# Install Foundry (if available)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Or use Hardhat
npm install --save-dev hardhat
```

### Compilation

```bash
# With Foundry
forge build

# With Hardhat
npx hardhat compile
```

## Example Usage Flow

```javascript
// 1. Host creates market
const goalHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Run a marathon by December 31st"));
const deadline = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days
const tx1 = await seppuku.createMarket(goalHash, deadline, kaishyakuAddress, {
  value: ethers.utils.parseEther("1.0") // 1 ETH stake
});

// 2. Users bet
await seppuku.connect(user1).betYes(marketId, { value: ethers.utils.parseEther("0.5") });
await seppuku.connect(user2).betNo(marketId, { value: ethers.utils.parseEther("0.3") });

// 3. User switches position
await seppuku.connect(user1).switchPosition(marketId, true); // YES → NO

// 4. After deadline, host declares
await seppuku.connect(host).declare(marketId, true); // Achieved!

// 5. Kaishyaku finalizes
await seppuku.connect(kaishyaku).close(marketId, true); // Confirmed

// 6. Winners claim
await seppuku.connect(host).claim(marketId);
await seppuku.connect(user2).claim(marketId);
```

## Gas Optimization

- `bytes32 goalHash` instead of full string storage
- Packed storage: `uint64 deadline` + booleans
- Pull payment pattern (no loops over participants)
- Minimal state changes

## Out of Scope (MVP)

- ❌ AMM/price discovery (fixed pro-rata distribution)
- ❌ Partial withdrawals during betting period
- ❌ Protocol fees
- ❌ ERC20 token support
- ❌ Multi-sig kaishyaku
- ❌ Dispute resolution mechanisms beyond kaishyaku authority

## License

MIT

## Acknowledgments

Built for Base ecosystem hackathon as part of the Seppuku.fun Hyper Casual Finance platform.
