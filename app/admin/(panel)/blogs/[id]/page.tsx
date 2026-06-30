import { notFound } from "next/navigation";
import { getBlogPostForAdmin } from "../actions";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

type EditBlogPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = await params;
  const post = await getBlogPostForAdmin(id);

  if (!post) {
    notFound();
  }

  return <BlogPostForm mode="edit" post={post} />;
}
