import type { Metadata } from "next";
import {
  LocaleBlogPostPage,
  localeBlogPostMetadata,
} from "@/components/pages/locale/LocaleBlogPages";
import "../../../../article-editorial.css";
import "../../../../editorial-chrome.css";

type ItalianBlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ItalianBlogPostPageProps): Promise<Metadata> {
  return localeBlogPostMetadata("it", (await params).slug);
}

export default async function ItalianBlogPostPage({ params }: ItalianBlogPostPageProps) {
  return <LocaleBlogPostPage locale="it" slug={(await params).slug} />;
}
