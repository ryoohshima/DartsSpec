// Full-corpus markdown for AI agents — every published page in one
// document. Scope and collation live in the framework helper; reshape or
// delete this route to change the site's corpus policy.
import { renderCorpusMarkdown } from "@cloudflare/nimbus-docs";
import { rewriteDocLinksInMarkdown } from "@/lib/docLinks";

export const prerender = true;

export async function GET() {
  // ドキュメント間の `./xx.md` 相対リンクはサイト上では解決できないため書き換える。
  const corpus = rewriteDocLinksInMarkdown(await renderCorpusMarkdown());

  return new Response(corpus, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
