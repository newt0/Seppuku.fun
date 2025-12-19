# Seppuku.fun 開発計画

## プロジェクト概要

目的: 自己宣言をMarket化し、他者の視線による行動変容を促す「Hyper Casual Finance」アプリのフロントエンドモック実装

スコープ: チェーン接続・署名・オラクルなしで、Mini Appとしてのユーザー体験を再現するフロントエンドのみの実装

制約: 1時間以内に完成可能なスコープに限定

## 技術スタック

- Framework: Next.js 15 (App Router)
- 言語: TypeScript
- スタイリング: Tailwind CSS（既存設定利用）
- 状態管理: React useState（ローカルステート）
- パッケージマネージャー: pnpm
- プラットフォーム: Base Mini App

## コアナラティブ

UIを通じて以下を明確に伝える：

1. 自己宣言をMarket化している
2. 他人の視線が行動変容を生む
3. Oracleではなく人間関係が解決レイヤー
4. 「軽いのに効く」Hyper Casual Finance

## ユーザー役割

- Host: Marketを作成、Kaishyakuを指名、達成/未達を自己申告
- Kaishyaku（介錯人）: Market Closeを実行
- Participant: YES/NOにBet

※ モックでは全て同一ユーザーとして操作可能（UI上で役割制限を明示）

## ユーザーフロー

1. Hostが目標・期限・初期Stakeを入力しMarketを作成
2. Kaishyaku（介錯人）の名前またはアドレスを入力
3. Market詳細画面で、他ユーザーがYES/NOにBet
4. Market期間中は進捗を眺める（UIのみ）
5. 期限到来後、Hostが「達成/未達」を自己申告
6. KaishyakuがMarket Closeを実行
7. 分配結果をUIで表示（数値は簡易計算or固定）

## ファイル構成

```
app/
├── page.tsx                    # Home - Market一覧
├── create/
│   └── page.tsx               # Create Market画面
├── market/
│   └── [id]/
│       └── page.tsx           # Market Detail画面
├── types/
│   └── market.ts              # データ型定義
├── hooks/
│   └── useMarkets.ts          # Market状態管理フック
└── components/
    ├── MarketCard.tsx         # Market一覧カード
    ├── MarketStatus.tsx       # ステータス表示
    ├── BetForm.tsx            # Bet入力フォーム
    └── CreateMarketForm.tsx   # Market作成フォーム
```

## データモデル

### Market型

```typescript
interface Market {
  id: string;
  goal: string;
  host: string;
  kaishyaku: string;
  deadline: string; // ISO string
  hostStake: number;
  yesPool: number;
  noPool: number;
  declaredResult?: boolean;
  closed: boolean;
  finalResult?: boolean;
}
```

### ステータスロジック

- `now < deadline && !declaredResult` → OPEN
- `now >= deadline && !closed` → PENDING CLOSE
- `closed && finalResult=true` → CLOSED: SUCCESS
- `closed && finalResult=false` → CLOSED: FAIL

## 実装タスク分解

### Phase 1: データ層とフック（15分）

- [ ] `app/types/market.ts` - Market型定義
- [ ] `app/hooks/useMarkets.ts` - Market CRUD操作フック
  - createMarket()
  - bet()
  - declareResult()
  - closeMarket()
  - getMarketStatus()

### Phase 2: コンポーネント（20分）

- [ ] `app/components/MarketCard.tsx` - 一覧表示カード
- [ ] `app/components/MarketStatus.tsx` - ステータスバッジ
- [ ] `app/components/CreateMarketForm.tsx` - Market作成フォーム
- [ ] `app/components/BetForm.tsx` - Bet入力フォーム

### Phase 3: ページ実装（20分）

- [ ] `app/page.tsx` - Home（Market一覧）の更新
- [ ] `app/create/page.tsx` - Create Market画面
- [ ] `app/market/[id]/page.tsx` - Market Detail画面

### Phase 4: UI/UX調整（5分）

- [ ] テキスト主体のデザイン適用
- [ ] 役割制限の補足説明追加
- [ ] モバイルファーストの確認

## UI/UX要件

### デザイン

- カラー: 白・黒・グレーのみ
- テキスト: 主体、画像不要
- レイアウト: モバイルファースト

### アクション補足

各アクションボタンに以下のような補足を付与：

- 「本来はHostのみが実行可能」
- 「本来はKaishyakuのみが実行可能」
- 「本来はウォレット署名が必要」

## 将来の差し替えポイント

実装時に以下のコメントを付与：

```typescript
// TODO: Replace with writeContract when connecting to smart contract
function createMarket() {
  // モック実装
}

// TODO: Replace with onchain read
const markets = [...]; // ローカルstate

// TODO: Replace with connected wallet address
const currentUserRole = "host"; // UI切替用

// TODO: Replace with DAO/social verification
function closeMarket() {
  // 自己申告 + 介錯のモック
}
```

## 成功条件（Done）

以下が全て達成されたら完了：

1. ✅ ナラティブがUIから理解できる
2. ✅ 一連の流れを実際に操作できる
3. ✅ Mini Appとして「動いている感」がある
4. ✅ 後からonchain実装を繋ぐ想像が容易

## 実装ガイドライン

### 優先順位

1. 動くこと - 完璧より完成
2. ナラティブ - UXで価値を伝える
3. 差し替え容易性 - 関数名とコメントで明示

### 制約

- API Routes不要（全てクライアントサイド）
- 外部ライブラリ極力不要
- `useState`ベースで完結
- LocalStorageは任意（今回は使用しない）

### コーディング規約

- TypeScript strict mode
- 関数名は将来のコントラクト関数名と揃える
- コンポーネントは単一責任原則
- propsは明示的に型定義

## 開発手順

### 1. セットアップ確認

```bash
pnpm install
pnpm dev
```

### 2. 実装順序

1. 型定義 → フック → コンポーネント → ページ
2. Home → Create → Detail の順
3. 各画面で動作確認しながら進める

### 3. テスト方法

- ブラウザで http://localhost:3000 を開く
- 以下のフローを手動テスト：
  1. Market作成
  2. Bet追加
  3. 達成申告
  4. Market Close
  5. 結果表示

### 4. 完了確認

- [ ] 3つの画面が実装されている
- [ ] Market作成→Bet→Close→分配の流れが動く
- [ ] ステータスが正しく表示される
- [ ] 役割の説明が明示されている

## 注意事項

### やらないこと

- ❌ ウォレット接続
- ❌ スマートコントラクト実装
- ❌ 外部API連携
- ❌ 永続化（DB/LocalStorage）
- ❌ セキュリティ・バリデーション
- ❌ 経済的正確性の検証

### やること

- ✅ 画面遷移
- ✅ UI/状態変化
- ✅ ナラティブの表現
- ✅ 役割の視覚化
- ✅ 簡易的な数値計算

## 参考情報

### プロジェクト既存構造

- `app/page.tsx`: 現在はMiniKit初期化のみ（"Home"表示）
- `app/rootProvider.tsx`: OnchainKitProvider設定済み
- `minikit.config.ts`: Farcaster manifest設定

### 既存機能の活用

- MiniKit初期化コード（`useMiniKit`、`setFrameReady`）はそのまま利用
- Tailwind CSSは既存設定を活用
- TypeScript設定は既存のまま

## タイムライン

- Phase 1: 0:00-0:15 データ層
- Phase 2: 0:15-0:35 コンポーネント
- Phase 3: 0:35-0:55 ページ実装
- Phase 4: 0:55-1:00 最終調整

合計: 約60分
