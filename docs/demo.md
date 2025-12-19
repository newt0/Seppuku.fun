# Seppuku.fun モック実装要件（Frontend Only）

## 目的

* Seppuku.fun の **ナラティブ・ユーザーフロー・体験価値**を確認できるフロントエンドモックを作成する
* チェーン接続・署名・オラクルなしで **Mini App としての体験を再現**する
* 1時間以内に完成するスコープに限定する
* 後続のオンチェーン実装に **構造的に差し替え可能**な形を保つ

## スコープ

含める

* 画面遷移・UI・状態変化
* Market作成 / Bet / Market Close / 分配結果の疑似表現
* Kaishyaku（介錯人）という役割のUI上の存在

含めない

* スマートコントラクト
* ウォレット接続、署名
* Farcaster manifest 署名
* Oracle / 外部検証
* 永続ストレージ（LocalStorageは任意）
* セキュリティ、経済的正確性

## プラットフォーム前提

* Base Mini App を想定したUI
* Next.js（App Router）
* モバイルファースト
* テキスト中心、画像不要

## コアナラティブ（UIで必ず伝える）

* 自己宣言をMarket化している
* 他人の視線が行動変容を生む
* Oracleではなく **人間関係が解決レイヤー**
* 「軽いのに効く」Hyper Casual Finance

## ユーザー役割（モック）

* Host

  * Marketを作成
  * Kaishyakuを指名
  * 達成/未達を自己申告
* Kaishyaku

  * Market Close を実行
* Participant

  * YES / NO にBet

※ モックではすべて同一ユーザーとして操作可能
※ UI上で「本来は役割制限がある」ことを明示する

## ユーザーフロー（モック版）

1. Hostが目標・期限・初期Stakeを入力しMarketを作成
2. Kaishyaku（介錯人）の名前またはアドレスを入力
3. Market詳細画面で、他ユーザーが YES / NO にBet
4. Market期間中は進捗を眺める（UIのみ）
5. 期限到来後、Hostが「達成/未達」を自己申告
6. Kaishyakuが Market Close を実行
7. 分配結果をUIで表示（数値は簡易計算 or 固定）

## 画面構成

### 1. Home（Market一覧）

表示

* goal
* status

  * OPEN
  * PENDING CLOSE
  * CLOSED: SUCCESS
  * CLOSED: FAIL
* deadline
* pools（Host / YES / NO）

操作

* Create Market
* Marketカードタップで詳細へ

### 2. Create Market

入力

* Goal（必須）
* Deadline（今から何時間後、簡略入力）
* Host Stake（数値、ETH表記）
* Kaishyaku（名前 or アドレス文字列）

操作

* Publish（モック）

  * Marketをローカルstateに追加
  * 詳細画面へ遷移

### 3. Market Detail

表示

* Goal
* Host
* Kaishyaku
* Deadline
* Status
* Pools（Host / YES / NO）

操作（状態に応じて表示切替）

* Bet YES / Bet NO

  * Bet Amount 入力
* Declare Result（Host自己申告）

  * Achieved / Failed
* Market Close（Kaishyaku）
* Claim Result（モック通知）

## データモデル（モック）

### Market

* id: string
* goal: string
* host: string
* kaishyaku: string
* deadline: ISO string
* hostStake: number
* yesPool: number
* noPool: number
* declaredResult?: boolean
* closed: boolean
* finalResult?: boolean

### User（簡略）

* currentUserRole: "host" | "kaishyaku" | "participant"
  （※ UI切替用。実際の権限管理は行わない）

## ステータスロジック

* now < deadline && !declaredResult → OPEN
* now >= deadline && !closed → PENDING CLOSE
* closed && finalResult=true → CLOSED: SUCCESS
* closed && finalResult=false → CLOSED: FAIL

## UI/UX要件

* テキスト主体
* 白・黒・グレーのみ
* ボタンラベルは明確（Bet YES / Market Close 等）
* 各アクションに補足説明テキストを付与

  * 「本来はHostのみ」
  * 「本来はKaishyakuのみ」

## 実装制約（Claude Code向け）

* API Routes 不要
* 外部ライブラリ極力不要
* `useState` ベースで完結
* コントラクト接続前提の関数名を予約

  * createMarket()
  * bet()
  * declareResult()
  * closeMarket()
  * claim()

## 成功条件（Done）

* ナラティブがUIから理解できる
* 一連の流れを実際に操作できる
* Mini Appとして「動いている感」がある
* 後から onchain 実装を繋ぐ想像が容易

## 将来差し替えポイント（明示）

* モック関数 → writeContract
* ローカルstate → onchain read
* role切替 → connected wallet address 判定
* 自己申告 + 介錯 → DAO / social verification

