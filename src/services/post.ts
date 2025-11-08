export type Post = {
  title: string;
  content: string;
  cover: string;
  author: string;
  readingTime: number;
  createdAt: string;
};

async function getPost(): Promise<Post> {
  const res = await fetch("/api/v1/editor", { method: "GET", cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load post");
  const json = await res.json();
  return json.data as Post;
}

async function savePost(data: Partial<Post>): Promise<void> {
  await fetch("/api/v1/editor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

const postService = { get: getPost, save: savePost };
export default postService;
