"use client";

import Image from "next/image";
import Link from "next/link";
import parse, {
  type DOMNode,
  type HTMLReactParserOptions,
  Element,
  domToReact,
} from "html-react-parser";

type BlogArticleBodyProps = {
  html: string;
};

function isInternalBlogHref(href: string): boolean {
  return href.startsWith("/blogs/");
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function BlogArticleBody({ html }: BlogArticleBodyProps) {
  const options: HTMLReactParserOptions = {
    replace(domNode) {
      if (!(domNode instanceof Element)) {
        return undefined;
      }

      if (domNode.name === "a") {
        const href = domNode.attribs.href?.trim();
        if (!href) return undefined;

        const children = domToReact(domNode.children as DOMNode[], options);

        if (isInternalBlogHref(href)) {
          return (
            <Link href={href} className="hathor-blog-article__link cursor-hover">
              {children}
            </Link>
          );
        }

        if (isExternalHref(href)) {
          return (
            <a
              href={href}
              className="hathor-blog-article__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          );
        }

        return undefined;
      }

      if (domNode.name === "img") {
        const src = domNode.attribs.src?.trim();
        if (!src) return null;

        const alt = domNode.attribs.alt?.trim() || "Blog illustration";
        const isLocal = src.startsWith("/");

        const image = isLocal ? (
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={800}
            className="hathor-blog-article__image"
            sizes="(max-width: 768px) 100vw, 42rem"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- external hathorcruise CDN images
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="hathor-blog-article__image"
          />
        );

        return <span className="hathor-blog-article__figure">{image}</span>;
      }

      if (domNode.name === "figure") {
        const children = domToReact(domNode.children as DOMNode[], options);
        return <figure className="hathor-blog-article__figure">{children}</figure>;
      }

      return undefined;
    },
  };

  return (
    <div className="hathor-blog-article__prose">{parse(html, options)}</div>
  );
}
