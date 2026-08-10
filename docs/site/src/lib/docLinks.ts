import type { tableScroll } from "@cloudflare/nimbus-docs/markdown";

// satteri は nimbus-docs の依存であり本プロジェクトの直接依存ではないため、
// `HastPluginDefinition` を直接 import せず既存プラグインの戻り値型から借りる。
type HastPluginDefinition = ReturnType<typeof tableScroll>;

/** サイト上のパスへ変換する。サイドバーの出力と揃えて末尾スラッシュを付ける。 */
const toSitePath = (slug: string, anchor = "") => `/${slug}/${anchor}`;

/**
 * `docs/content/*.md` 内の相対リンク `./04-architecture.md` を、サイト上のパス
 * `/04-architecture/` へ書き換える hast プラグイン（HTML 出力用）。
 *
 * ドキュメントは GitHub 上でも直接読まれるため、ソースには GitHub で解決できる
 * `.md` 相対リンクを残したい。一方サイトでは拡張子なしのパスでないと 404 になる。
 * ビルド時に書き換えることで両方を成立させる。
 *
 * ノードは Rust 側アリーナの読み取り専用ビューであり、`node.properties` への直接代入は
 * 反映されない。変更は必ず `ctx.setProperty()` を通す。
 */
export function docLinks(): HastPluginDefinition {
  return {
    name: "dartsspec:doc-links",
    element: {
      filter: ["a"],
      visit(node, ctx) {
        const href = node.properties?.href;
        if (typeof href !== "string") return;

        const match = /^\.\/([^/#?]+)\.md(#.*)?$/.exec(href);
        if (!match) return;

        ctx.setProperty(node, "href", toSitePath(match[1], match[2]));
      },
    },
  };
}

/**
 * 同じ書き換えを Markdown 文字列に対して行う。
 *
 * hast プラグインは HTML 経路にしか効かないため、AI 向けに配信する `/<slug>/index.md` と
 * `/llms-full.txt` では相対リンクが生のまま残り、サイト上では解決できない。
 * 原文をそのまま配る `/<slug>/index.mdx` は対象外とする。
 */
export function rewriteDocLinksInMarkdown(markdown: string): string {
  return markdown.replace(
    /\]\(\.\/([^/#?)\s]+)\.md(#[^)\s]*)?\)/g,
    (_, slug: string, anchor?: string) => `](${toSitePath(slug, anchor)})`,
  );
}
