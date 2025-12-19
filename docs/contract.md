## Seppuku.fun Solidity Smart Contract 要件定義
## 目的

Seppuku.fun は「自己宣言（目標コミット）」をオンチェーンの Market に変換し、友人間の信頼モデル（Host + Kaishyaku）で解決する Hyper Casual Finance を実現する。
コントラクトは Market作成・参加（Bet）・ポジション変更・自己申告・介錯人によるClose・分配（Claim） を担う。

## 前提

* チェーン：Base（Sepolia / テストネット）
* 通貨：ネイティブETH（`payable`）を用いる（ERC20はスコープ外）
* Oracle不要：達成可否は Host自己申告 + Kaishyaku最終判定 で確定
* MVPは「確実に壊れない」優先：分配は push ではなく pull（claim） 方式

## 役割

* Host：目標を宣言し、初期Stakeをデポジットし、自己申告を行う
* Kaishyaku：Hostが指定する介錯人。期限後に Market Close（最終確定）を行う
* Participant：YES/NO にBetする一般参加者（ポジション変更可）

## 用語

* YES：目標達成（Success）
* NO：目標未達（Fail）
* Market：1つの目標に対する賭けプールと解決状態
* Declare：Hostが「達成/未達」を自己申告する
* Close：Kaishyakuが最終結果を確定する
* Claim：勝者が配当を受け取る

## ユーザーフロー（オンチェーン）

1. Hostが Market を作成し、ETHをデポジット（初期流動性 + Hostの覚悟）
2. Hostが Kaishyaku を指定（Market作成時 or 作成後の1回だけ変更可）
3. Participant が YES/NO にBet（期限前のみ）
4. Participant は期限前ならポジション変更可能（YES⇄NO、増額/減額）
5. 期限到来後、Hostが達成/未達を自己申告（Declare）
6. Kaishyaku が Market Close で最終確定（Success/Fail）
7. 勝者が Claim で配当を受領

## 状態遷移（State Machine）

* `OPEN`：期限前。Bet可能。Declare/Close不可
* `LOCKED`：期限後。Bet不可。Declare可能。Close可能
* `DECLARED`：Hostが自己申告済。Close可能
* `CLOSED`：Kaishyakuが最終確定済。Claim可能

実装上は boolean/enum で表現：

* `created`
* `closed`
* `declared`（任意）
* `deadline`

## Marketデータモデル（最小）

Market struct（推奨）

* `address host`
* `address kaishyaku`
* `string goal`（オンチェーン格納は高コスト。MVPは `bytes32 goalHash` 推奨、もしくは短いstring）
* `uint64 deadline`
* `uint256 hostStake`
* `uint256 yesPool`
* `uint256 noPool`
* `bool declared`（Host自己申告があったか）
* `bool declaredSuccess`（自己申告内容）
* `bool closed`
* `bool finalSuccess`（最終結果）
* `uint256 totalPot` は都度計算（`hostStake + yesPool + noPool`）

参加者のBet

* `mapping(marketId => mapping(user => uint256)) yesBet`
* `mapping(marketId => mapping(user => uint256)) noBet`
* `mapping(marketId => mapping(user => bool)) claimed`

※ ポジション変更を実現するため、ユーザーごとのBet額を保持する。

## 必須関数（External）

### createMarket

* 目的：Market作成 + Host stake 入金
* 署名：`createMarket(goalHash/goal, deadline, kaishyaku) payable returns (marketId)`
* 要件：

  * `msg.value > 0`
  * `deadline > block.timestamp`
  * `kaishyaku != address(0)`（必須にするか任意。MVPでは必須推奨）
* 結果：

  * Market保存、`hostStake = msg.value`
  * `yesPool/noPool = 0`
  * event発火

### setKaishyaku（任意：MVPでは「作成時固定」でもOK）

* 目的：Hostが介錯人を変更（市場開始後に揉める可能性あり。MVPでは禁止推奨）
* 署名：`setKaishyaku(marketId, newKaishyaku)`
* 要件：

  * onlyHost
  * `block.timestamp < deadline`（期限前のみ）
  * 変更回数は1回まで or 禁止

### betYes / betNo

* 目的：YES/NO にBetしてプールを形成
* 署名：`betYes(marketId) payable`, `betNo(marketId) payable`
* 要件：

  * `block.timestamp < deadline`
  * `!closed`
  * `msg.value > 0`
  * `msg.sender != host`（Hostの参加を禁止するかは選択。MVPでは禁止推奨）
* 結果：

  * `yesBet += msg.value` / `noBet += msg.value`
  * pool加算
  * event発火

### changePosition（必須：ポジション変更）

「ポジション変更可能」をMVPで成立させる最小は YES⇄NO のスイッチ。減額・出金までやると複雑化するので避ける。

* 署名例：`switchPosition(marketId, fromYesToNo, amount)`
* 要件：

  * `block.timestamp < deadline`
  * `!closed`
  * `amount > 0`
  * `from` 側の Bet 残高が `amount` 以上
* 結果：

  * `fromBet -= amount`
  * `toBet += amount`
  * `fromPool -= amount`
  * `toPool += amount`
  * event発火

※ MVPでさらに簡単にするなら「スイッチは全額のみ」にする：

* `switchAllToYes(marketId)` / `switchAllToNo(marketId)`
  この方が実装ミスが減る。

### declare（Host自己申告）

* 署名：`declare(marketId, success)`
* 要件：

  * onlyHost
  * `block.timestamp >= deadline`
  * `!closed`
* 結果：

  * `declared = true`
  * `declaredSuccess = success`
  * event発火

### close（Kaishyakuが最終確定）

* 署名：`close(marketId, finalSuccess)`
* 要件：

  * onlyKaishyaku
  * `block.timestamp >= deadline`
  * `!closed`
  * `finalSuccess` は `declaredSuccess` と一致必須にするかは選択

    * MVP推奨：一致必須にしない（介錯人はHostの虚偽申告を覆せる）
* 結果：

  * `closed = true`
  * `finalSuccess = finalSuccess`
  * event発火

### claim（Pull Payment）

* 署名：`claim(marketId)`
* 要件：

  * `closed == true`
  * `claimed == false`
  * 受け取り権利がある（勝者条件を満たす）
* 結果：

  * payout計算 → `call{value:payout}` 送金
  * `claimed=true`
  * event発火

## 分配ルール（重要・明文化）

総ポット：`P = hostStake + yesPool + noPool`

勝者集合の定義：

* `finalSuccess == true`（達成）

  * 勝者：Host + YES的中ユーザー
  * 敗者：NO側ユーザー
* `finalSuccess == false`（未達）

  * 勝者：NO的中ユーザーのみ
  * 敗者：Host + YES側ユーザー（Hostは没収される）

分配計算（比例配分 / pro-rata）：

* 勝者サイドの総stake：

  * 成功時：`W = hostStake + yesPool`
  * 失敗時：`W = noPool`
* 個別stake：

  * Host（成功時のみ）：`s_host = hostStake`
  * YESユーザー：`s_u = yesBet[u]`
  * NOユーザー：`s_u = noBet[u]`
* 支払額：

  * `payout(u) = P * s_u / W`
* 丸め誤差：

  * 整数除算で余剰が出る。余剰はコントラクトに残るので、MVPでは `sweepRemainder(marketId, recipient)` を用意（onlyHost or onlyKaishyaku）するか、プロトコル収益として `treasury` へ送る。

※ Host成功時「総取り」にしたい場合は仕様が変わるので注意。今回の仕様は「成功時：Hostと予測成功ユーザーで分配」なので上記が正。

## イベント（必須）

* `MarketCreated(marketId, host, kaishyaku, deadline, hostStake, goalHash)`
* `BetPlaced(marketId, user, side, amount)`
* `PositionSwitched(marketId, user, fromSide, toSide, amount)`
* `Declared(marketId, success)`
* `Closed(marketId, finalSuccess)`
* `Claimed(marketId, user, payout)`

## アクセス制御（必須）

* onlyHost：`msg.sender == market.host`
* onlyKaishyaku：`msg.sender == market.kaishyaku`
* close/declare は期限後のみ
* bet/switch は期限前のみ

## セキュリティ要件（MVP必須最低限）

* Reentrancy：claim は `claimed=true` を先に立てる（Checks-Effects-Interactions）
* `call` 送金失敗時は revert
* `deadline` の境界条件を厳密に（`<` と `>=` を統一）
* Host/Kaishyaku アドレス `address(0)` 禁止
* 状態二重実行防止（declare/close/claim の二重呼び出し禁止）

## ガス/ストレージ最適化（推奨）

* `goal` は onchain string を避け、`bytes32 goalHash` を保存（全文は offchain/フロントに持つ）
* `uint64 deadline`、`bool` をパックして storage を削減

## 非スコープ（明確化）

* AMM/価格発見（本MVPは固定比率のプール分配で十分）
* Market期間中の「部分出金」や「解約」
* 参加者数の列挙（onchainで全参加者のclaimを自動実行しない）
* 手数料、プロトコル収益モデル
* 複数トークン対応（ERC20）
* 紛争解決（Kaishyakuが全権を持つ）

## 受け入れ基準（Done）

* create → bet → switch → declare → close → claim の一連がオンチェーンで完結する
* 成功/失敗どちらの分配も、上記の比例配分ルールに一致する
* claim が pull であり、参加者数が多くても close がガスで詰まない
* 不正確定（期限前close等）が revert される
* 主要イベントが発火し、フロントで追跡可能

