# SeppukuFi

SeppukuFi は、友人関係ベースの予測市場によって、個人の宣言目標の達成を強制力付きで支援するConsume Appです。
人生において最も難しいことの一つは、「自分自身との約束を守ること」や「自己目標を達成すること」です。

SeppukuFiでは、ユーザーは目標を宣言し、自らトークンをデポジットすることで覚悟をオンチェーンで可視化します。

目標を達成できなければ、デポジットは没収されます。
友人はその成否にBetすることで、「タテマエではない本音の期待値」を示します。
そしてMarketの期間中はコミットメントを監視します。

身銭を切るハラキリによって、自己変容を達成するプロトコルです。

## Overview

|        |  |
|------------|---------|
| Project Name | SeppukuFi |
| Tagline | *身銭を切る、ハラキリプロトコル* |
| Entry | [大喜利.hack Vibe Coding Hackathon](https://luma.com/etrs8qw8?tk=27gPrv) by Base Japan|
| Category | Consumer App, Prediction Market |
| Blockchain | Base (Sepolia Testnet) |
| Tech Stack | Base Mini App |
| Narrative | Hyper Casual Finance |

## Concept

* 自己宣言だけでは人は変われない
* 罰則だけでも人は続かない
* 他者の視線と金銭的インセンティブが合わさると、人は行動を変える

SeppukuFiは、予測市場 × 友人関係 × 自己罰則（or 報酬）を組み合わせることで、行動変容を現実的に実装します。

## Players in prediction markets

### 切腹人 (Seppkunin: Person committing seppuku / hara-kiri)

* 目標を宣言する当事者
* トークンをデポジットし、Marketを作成（＝Market作成と同時に初期流動性供給が行われる）

### 介錯人 (Kaishyakunin: Second / assistant in a ritual suicide)

* Oracleの代替となる信頼された第三者
* 目標達成の妥当性を判定し、Market Closeを実行

### 立会人 (Tatiainin: Witness / attendant)

* 目標達成 or 失敗にBetする参加者
* 主に切腹人の友人・知人

## User Flow

1. Market Creation
   切腹人が目標を宣言し、少額のトークンをデポジット
   Market作成と初期流動性供給が同時に行われる

2. Kaishyaku Assignment
   切腹人が友人の一人を介錯人としてアサイン

3. Initial Betting
   立会人が「達成」または「失敗」にBet

4. Goal Adjustment
   初期Betの分布を見て、切腹人は目標を調整可能

5. Market Live

   * Market期間中のポジション変更は不可
   * 立会人はTwitterやSlackで監視・牽制

6. Market Close

   * 切腹人が達成状況を自己申告
   * 介錯人が妥当性を判定し、Marketをクローズ

7. Settlement

   * 成功: 切腹人 + 予測成功者で分配
   * 失敗: 予測成功者のみで分配

## Key Features

### 予測市場 × 自己宣言による行動変容効果

個人では達成が難しい目標やストレッチ目標を、友人間の予測市場によって強制的に遂行。

### Oracle-less Prediction Market

* Market作成と初期流動性供給を一体化
* 既存の人間関係をOracleとして活用
* 外部データや第三者Oracleに依存しない設計

## Demo

// デモ動画を挿入

## Tech Stack

SeppukuFiは Base Mini App として実装されています。

* ウォレット前提の直感的UX
* 一般ユーザー向けの低摩擦オンボーディング
* 日常的な利用を想定した設計

## Future Extensions (Idea)

### Homare (誉) SBT

Homare SBTは、ユーザーが達成した目標の数に応じてClaim可能なSoulbound Tokenです。
金銭的なユーティリティやトークンアロケーションは一切持たず、純粋に「達成の履歴」と「名誉」を表現することを目的としています。
オンチェーン上に刻まれる誉は、自己変容の証明であり、他者からの評価や信頼の基盤として機能します。

### Stablecoin Support

MVPではETHを利用していますが、本番環境ではステーブルコインへの対応を予定しています。
特に日本円ステーブルコインは、SeppukuFiの世界観（日本の切腹文化のインスパイア）や「身銭を切る」というナラティブとの親和性が高く、日常的な金額感覚で利用できる点において重要な選択肢です。
これにより、より広い一般ユーザー層への展開が可能になります。

### AI Prediction Contrast

現代のアルゴリズムは、ユーザーの属性や行動履歴をもとに、極めて高精度な行動予測を行うことができます。
SeppukuFiは、そのような「予測される未来」に対する対比として設計されています。
個人の意思だけでは覆せない結末を、友人との関与や相互監視によって書き換える体験を提供します。

### Web3 Founder Use Case

SeppukuFiは、Web3プロトコルのFounder向けユースケースにも適しています。
TGEの成功やロードマップ遂行を目標として宣言し、コミュニティを巻き込んだ予測市場を形成することで、単なる約束ではなく、緊張感のあるコミットメントを実現します。
これはFounderとコミュニティの関係性を再定義する、新しいガバナンス的アプローチでもあります。

## cf. 前提知識

### 予測市場

予測市場とは、参加者が未来の事象に対して確率（価格）を形成することで、分散した情報を効率的に集約し、高精度な予測を生成する仕組みである。
経済学・計量ファイナンス・統計学では、集合知の定量化、情報の即時反映、情報価値の測定、不確実性のモデル化といった観点から、最も高い情報集約効率を持つメカニズムとして評価されている。
政策判断、災害対応、交通需要、地域経済の最適化など、多くの社会領域で「未来予測インフラ」として高い情報資産価値を持つ。

### Base Mini App

Base Mini App とは、Base 上で動作する軽量な Web アプリをソーシャルプラットフォームに直接組み込むための配布・実行形態である。インストール不要で即時起動でき、ウォレット接続やトランザクション体験までを最短距離で提供することを重視している。UX はモバイルファーストかつソーシャルネイティブに設計され、拡散・再訪問の摩擦を極小化する。Web3 アプリを「使いに行くもの」から「タイムライン上で自然に触れるもの」へ変換するための配信レイヤーである。

### Hypercasual Finance

Hypercasual Finance とは、失っても心理的負担のない少額資産で成立する金融行動を前提とした設計思想である。成長指標はTVLではなく、参加頻度やユーザー数、ソーシャル関係性に置かれる。チップや奢り、少額ベットなど感情に紐づく価値移転が中核となり、低ガスコストなL2の普及によって実用化が進んだ。Web3を投資対象ではなく、日常行動に自然に組み込むためのマスアダプション戦略である。

## cf. 参考資料

* [A Concept of Hypercasual Finance](https://paragraph.com/@zkether.eth/a-concept-of-hypercasual-finance) (consome)
* [Prediction markets — everything you need to know](https://a16zcrypto.com/posts/podcast/prediction-markets-explained/) (a16zcrypto)
* [Base Mini Apps](https://www.base.org/build/mini-apps) (Base Docs)
* [切腹の歴史 ～現代人が知らない武士の死の作法～](https://podcasts.apple.com/jp/podcast/31-1-%E5%88%87%E8%85%B9%E3%81%AE%E6%AD%B4%E5%8F%B2-%E7%8F%BE%E4%BB%A3%E4%BA%BA%E3%81%8C%E7%9F%A5%E3%82%89%E3%81%AA%E3%81%84%E6%AD%A6%E5%A3%AB%E3%81%AE%E6%AD%BB%E3%81%AE%E4%BD%9C%E6%B3%95-coten-radio%E3%82%B7%E3%83%A7%E3%83%BC%E3%83%88-%E5%88%87%E8%85%B9%E7%B7%A81/id1450522865?i=1000566161434) (COTEN RADIO)
* [『日本人の死生観』](https://amzn.to/3MMOrxe)
* [『切腹の日本史』](https://amzn.to/4pJoblP)
* [『日本人はなぜ切腹するのか』](https://amzn.to/4s1w9bT)
* [『名誉と順応: サムライ精神の歴史社会学』](https://amzn.to/4j379wx)
* [『武士と世間 なぜ死に急ぐのか』](https://amzn.to/4pLJJhV)
