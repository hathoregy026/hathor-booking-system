import type { Metadata } from "next";
import {
  LocaleBlogPostPage,
  localeBlogPostMetadata,
} from "@/components/pages/locale/LocaleBlogPages";
import "../../../../article-editorial.css";
import "../../../../editorial-chrome.css";

type GermanBlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: GermanBlogPostPageProps): Promise<Metadata> {
  return localeBlogPostMetadata("de", (await params).slug);
}

export default async function GermanBlogPostPage({ params }: GermanBlogPostPageProps) {
  return <LocaleBlogPostPage locale="de" slug={(await params).slug} />;
}
