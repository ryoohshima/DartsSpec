import { defineConfig } from "astro/config";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";
import nimbus, { defineConfig as defineNimbusConfig } from "@cloudflare/nimbus-docs";
import { tableScroll } from "@cloudflare/nimbus-docs/markdown";
import { docLinks } from "./src/lib/docLinks";

const nimbusConfig = defineNimbusConfig({
  // TODO: 独自ドメイン取得（#41）後に差し替える。canonical URL・OGP 画像の絶対 URL・
  // robots.txt・sitemap・/llms.txt のリンクがすべてこの値から組み立てられる。
  site: "https://dartsspec-docs.workers.dev",
  title: "darts spec docs",
  description: "ダーツのマイセッティングを記録し、URL ひとつで美しくシェアするサービス「darts spec」の設計ドキュメント。",
  locale: "ja",
  github: "https://github.com/ryoohshima/DartsSpec",
  // ドキュメント実体はこのサイトの外（`docs/content/`）にあるため、編集リンクもそちらを指す。
  // `{path}` にはサイトのプロジェクトルート起点の相対パス（`../content/xx.md`）が入るので、
  // そのルート自身（`docs/site/`）を前置し、ブラウザ側のパス正規化で
  // `docs/content/xx.md` に解決させる。
  editPattern: "https://github.com/ryoohshima/DartsSpec/edit/develop/docs/site/{path}",
  socialImageAlt: "darts spec ドキュメント",
});

export default defineConfig({
  output: "static",
  // Tailwind v4 via its Vite plugin (the integration Astro recommends for
  // Tailwind v4 — replaces the PostCSS plugin, which doesn't build under
  // Astro 7's Vite 8 bundler).
  vite: {
    plugins: [tailwindcss()],
  },
  // Hover-prefetch link targets so full-page navigations feel instant without
  // a client-side router.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  integrations: [
    icon(),
    nimbus(nimbusConfig, {
      // Authoring rules are opt-in by design — your repo, your taste. The
      // two below are the load-bearing pair: frontmatter has to validate
      // against the content schema for the page to render properly, and
      // broken internal links are 404s for your readers. Add the others
      // (heading hierarchy, code-block language, style, etc.) when you're
      // ready to enforce them — see `nimbus-docs lint --help`.
      rules: {
        "nimbus/frontmatter-shape": "error",
        "nimbus/internal-link": "error",
      },
      // Wrap wide tables so they scroll instead of overflowing the page
      // (styled by `.nb-table-scroll` in src/styles/prose.css).
      // docLinks は GitHub 互換の `./xx.md` 相対リンクをサイト用パスへ書き換える。
      markdown: {
        hastPlugins: [tableScroll(), docLinks()],
      },
    }),
  ],
});
