import { redirect } from "next/navigation";

/** Journal — blog content lives at /blogs. */
export default function BlogPage() {
  redirect("/blogs");
}
