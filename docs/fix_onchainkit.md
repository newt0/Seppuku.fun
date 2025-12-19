調査サマリー

* OnchainKit/MiniKit: 現在の公式情報は Base の OnchainKit ページに集約（onchainkit.xyz は base.org/builders/onchainkit にリダイレクト）。OnchainKitProvider には miniKit: { enabled: true } 設定が必要。
* Next.js と MiniKit: MiniKit 用の useMiniKit は実行環境（FarcasterのMini App/Frame内）を前提にコンテキストを提供。SSG/SSR のプリレンダリング時はこの環境が存在せず、コンテキスト未初期化により「MiniKit is not enabled」が発生しうる。
* リポジトリ現状: app/rootProvider.tsx で miniKit: { enabled: true, autoConnect: true } を設定済み。/create や /market/\[id]、/ で useMiniKit を直接呼び出しており、Vercel のビルド時プリレンダで失敗している可能性が高い。

解決計画

* 動的レンダリングへ切替
  * app/create/page.tsx（および app/page.tsx, app/market/\[id]/page.tsx も対象なら）へ export const dynamic = 'force-dynamic' を追記し、SSG を無効化してビルド時プリレンダリングを回避。
  * 代替案: next/dynamic で ssr: false のクライアント専用ラッパーを導入し、useMiniKit をその内部でのみ呼び出す（フレーム外SSRでの実行を防止）。
* クライアント側ガードの徹底
  * 既存の ClientSafeArea と同様に「初回マウント完了まで UI をプレーンに描画」する仕組みを useMiniKit 利用箇所にも適用（SSR中の MiniKit 参照を避ける）。
  * 失敗時フォールバック（例: MiniKit 非対応環境での注意表示）を用意。
* 環境変数/設定の確認
  * NEXT\_PUBLIC\_ONCHAINKIT\_API\_KEY を Vercel プロジェクト環境に設定。
  * chain={base} など Provider 設定は現状OKだが、miniKit.enabled がビルド時に false にならないよう、ビルド環境の変数が undefined で落ちないか確認。
* 影響範囲の最小化
  * まずは /create のみ dynamic 化し、デプロイが通るか検証。必要なら / と /market/\[id] にも展開。
* ドキュメントとチェックリスト
  * README に「MiniKit を使用するページは SSG を避ける」注意書きを追加。
  * Vercel の環境変数設定手順を追記。

検証手順

* ローカル: pnpm build でエラーが消えるか確認、pnpm start で /create の操作確認。
* デプロイ: Vercel にプッシュ後、ビルドログで prerender error が出ないか確認。プレビューURLで /create が動作するか確認。
