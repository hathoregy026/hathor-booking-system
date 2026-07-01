import { BlogPostForm } from "@/components/admin/BlogPostForm";

type EditBlogPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = await params;
  return <BlogPostForm mode="edit" postId={id} />;
}
