## Title

|        |  |
|------------|---------|
| Project Name | SeppukuFi |
| Tagline | *身銭を切る、ハラキリプロトコル* |
| Entry | [大喜利.hack Vibe Coding Hackathon](https://luma.com/etrs8qw8?tk=27gPrv) by Base Japan|
| Category | Consumer App, Prediction Market |
| Blockchain | Base (Sepolia Testnet) |
| Tech Stack | Base Mini App |
| Narrative | Hyper Casual Finance |

## Intro

さてみなさん、人生で最も難しいことはなんだと思いますか？
僕は、自分自身との約束を守ることだと思います。

## Solution – SeppukuFi　の概要

SeppukuFi は、友人グループ間の予測市場の仕組みによって、宣言目標を達成するためのプロトコルです。

ユーザーは目標達成を宣言し、自ら資産をステークすることで「覚悟」を明示します。
周囲の友人はその成否を予測し、少額で参加します。
結果は人間関係ベースの信頼モデルによって確定され、即座に分配されます。

## Players in Prediction Market

* 切腹人: 目標の宣言とデポジットを行う（Market作成と初期流動性供給が同時に行われる）
* 介錯人: Oracleの代わりにMarket Closeを代行する
* 立会人: 目標達成の成否を予測して、Betする

## Userflow

1. Market Creation: 「切腹ユーザー」が目標を宣言して、トークンをデポジット。
2. Kaishyaku Assignment: 切腹ユーザーは「介錯人ユーザー」を一人アサインします。この介錯人が、後でMarket Closeを代行します
3. Initial Betting: 「立会人ユーザー」たちは「成功」か「失敗」にBet
4. Tamerai Period: 初期Betの分布を見て、切腹人は目標を調整可能
5. Market Live: Marketが開始したら、期間中は動向を見守ります。途中でポジションを変更することはできません。結果に影響を及ぼしたければ、友人は切腹人の行動を監視して、TwitterやSlackでメンションします
6. Market Close: 期限になったらMarket Close。Hostが達成したかどうかを自己申告します。その申告が正しいかどうかを、介錯人が判定して、Market Closeします。
7. Settlement: 目標を達成していたら、Hostと予測成功ユーザーで分配します。失敗したら予測成功ユーザーのみで分配。

## Features

* 予測市場としての設計工夫
* 自己変容を達成するための新しい仕組み
* Base Mini App

## 追加機能のアイディア

* ステーブルコイン対応:　MVPではETHを使いますが、プロダクション環境ではステーブルコインを採用します。特に日本円ステーブルコインを使う方が世界観の一貫性を保てます
* AI予測との対比。ユーザーの属性とアルゴリズムによって極めて高精度に行動予測が可能となっている（cf. Facebook広告アルゴリズム）。自分だけの力では結末を覆すことはできないが、友人との関与によって古い自分を克服できるのではないか
* web3プロトコルのFounderに利用してもらい、TGE成功やロードマップ遂行についてコミュニティと駆け引き
* SBT: 介錯人が失敗した切腹のMarket Closeを担当するたびに、「首NFT」をミント（譲渡可）。また、目標を達成した切腹ユーザーには誉SBTをミント。いずれもトークンアロケーションなどのユーティリティはなく、純粋な名誉を表す

## Ending

ご清聴ありがとうございました
