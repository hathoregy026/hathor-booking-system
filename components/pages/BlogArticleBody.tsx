type BlogArticleBodyProps = {
  html: string;
};

/** Server-rendered article HTML — avoids serializing large HTML into client RSC payloads. */
export function BlogArticleBody({ html }: BlogArticleBodyProps) {
  return (
    <div
      className="hathor-blog-article__prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
