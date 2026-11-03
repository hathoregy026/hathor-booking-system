import type { Metadata } from "next";
import {
  LocaleBlogPostPage,
  localeBlogPostMetadata,
} from "@/components/pages/locale/LocaleBlogPages";
import "../../../../article-editorial.css";
import "../../../../editorial-chrome.css";

type RussianBlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: RussianBlogPostPageProps): Promise<Metadata> {
  return localeBlogPostMetadata("ru", (await params).slug);
}

export default async function RussianBlogPostPage({ params }: RussianBlogPostPageProps) {
  return <LocaleBlogPostPage locale="ru" slug={(await params).slug} />;
}
