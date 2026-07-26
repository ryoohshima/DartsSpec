import { defineCollection } from "astro:content";
import { docsCollection, partialsCollection } from "@cloudflare/nimbus-docs/content";

// ドキュメントの実体は `docs/content/` に置き、このサイトはそれを読むだけにする。
// 複製を作らず単一の真実（source of truth）を保つのが狙いである。
// `base` は内部で `./src/content/` を前置されるので、そこから遡って `docs/content` を指す。
// `[0-9]*.md` で番号付きドキュメントのみを対象とし、GitHub 用索引の `docs/README.md` は除外する。
export const collections = {
  docs: defineCollection(
    docsCollection({
      base: "../../../content",
      pattern: "[0-9]*.md",
    }),
  ),
  partials: defineCollection(partialsCollection()),
};
