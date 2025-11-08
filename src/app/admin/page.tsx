"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TiptapEditor, { type TiptapEditorRef } from "@/components/tiptap-editor";

type Post = {
  _id?: string;
  title: string;
  slug: string;
  coverImageUrl?: string;
  readTime?: number;
  url?: string;
  excerpt?: string;
  contentHtml?: string;
  contentJson?: any;
  tags?: string[];
  category?: string;
  published?: boolean;
};

async function uploadImage(file: File) {
  const data = new FormData();
  data.append("file", file);
  const res = await fetch("/api/images", { method: "POST", body: data });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export default function AdminPage() {
  const [tab, setTab] = useState<"posts" | "projects" | "faqs" | "media">("posts");

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <nav className="flex gap-2 text-sm">
          <button className={`px-3 py-1 rounded ${tab === "posts" ? "bg-black text-white" : "bg-zinc-200"}`} onClick={() => setTab("posts")}>Posts</button>
          <button className={`px-3 py-1 rounded ${tab === "projects" ? "bg-black text-white" : "bg-zinc-200"}`} onClick={() => setTab("projects")}>Projects</button>
          <button className={`px-3 py-1 rounded ${tab === "faqs" ? "bg-black text-white" : "bg-zinc-200"}`} onClick={() => setTab("faqs")}>FAQs</button>
          <button className={`px-3 py-1 rounded ${tab === "media" ? "bg-black text-white" : "bg-zinc-200"}`} onClick={() => setTab("media")}>Media</button>
        </nav>
      </header>

      {tab === "posts" && <PostsPanel />}
      {tab === "projects" && <ProjectsPanel />}
      {tab === "faqs" && <FaqsPanel />}
      {tab === "media" && <MediaPanel />}
    </div>
  );
}

function PostsPanel() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<Post>({ title: "", slug: "", excerpt: "", readTime: 0, url: "", published: false });
  const editorRef = useRef<TiptapEditorRef>(null);
  const [content, setContent] = useState<any>("<p>Write your post...</p>");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/posts");
      const json = await res.json();
      setPosts(json.data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ title: "", slug: "", excerpt: "", coverImageUrl: "", readTime: 0, url: "", published: false });
    setContent("<p>Write your post...</p>");
    setEditingSlug(null);
  };

  const editPost = (post: any) => {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      coverImageUrl: post.coverImageUrl || "",
      readTime: post.readTime || 0,
      url: post.url || "",
      published: post.published || false
    });
    setContent(post.contentHtml || post.contentJson || "<p>Write your post...</p>");
    setEditingSlug(post.slug);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Post = {
      ...form,
      contentHtml: typeof content === "string" ? content : undefined,
      contentJson: typeof content === "object" ? content : undefined,
    };
    
    const method = editingSlug ? "PATCH" : "POST";
    const url = editingSlug ? `/api/v1/posts/${editingSlug}` : "/api/v1/posts";
    
    const res = await fetch(url, { 
      method, 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(payload) 
    });
    
    if (res.ok) {
      resetForm();
      await load();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to save");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">{editingSlug ? "Edit Post" : "Create Post"}</h2>
          {editingSlug && (
            <button 
              className="text-sm text-zinc-600 hover:text-black"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input className="border rounded px-3 py-2" placeholder="Title" value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value, slug: editingSlug ? v.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') }))} required />
            <input className="border rounded px-3 py-2" placeholder="Slug (auto)" value={form.slug} onChange={e => setForm(v => ({ ...v, slug: e.target.value }))} required disabled={!!editingSlug} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input className="border rounded px-3 py-2" type="number" min={0} max={180} placeholder="Read time (min)" value={form.readTime ?? 0} onChange={e => setForm(v => ({ ...v, readTime: parseInt(e.target.value||'0',10) }))} />
            <input className="border rounded px-3 py-2 col-span-2" placeholder="Canonical URL (optional)" value={form.url || ''} onChange={e => setForm(v => ({ ...v, url: e.target.value }))} />
          </div>
          <input className="border rounded px-3 py-2 w-full" placeholder="Excerpt" value={form.excerpt || ''} onChange={e => setForm(v => ({ ...v, excerpt: e.target.value }))} />

          <div className="flex items-center gap-3">
            <input className="border rounded px-3 py-2 flex-1" placeholder="Cover image URL" value={form.coverImageUrl || ''} onChange={e => setForm(v => ({ ...v, coverImageUrl: e.target.value }))} />
            <label className="px-3 py-2 rounded bg-zinc-200 cursor-pointer">
              Upload
              <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const result = await uploadImage(file);
                setForm(v => ({ ...v, coverImageUrl: result.url }));
              }} />
            </label>
          </div>

          <div className="border rounded">
            <TiptapEditor key={editingSlug ?? 'new'} output="html" content={content} onChange={setContent} />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.published} onChange={e => setForm(v => ({ ...v, published: e.target.checked }))} />
              Published
            </label>
            <button className="ml-auto px-4 py-2 rounded bg-black text-white" type="submit">
              {editingSlug ? "Update Post" : "Save Post"}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="font-medium">Posts {loading && <span className="text-xs text-zinc-500">(loading)</span>}</h2>
        <ul className="divide-y rounded border">
          {posts.map(p => (
            <li key={p.slug} className="p-3 flex items-center gap-3">
              {p.coverImageUrl && <img src={p.coverImageUrl} alt="" className="size-10 rounded object-cover" />}
              <div className="min-w-0">
                <div className="font-medium truncate">{p.title}</div>
                <div className="text-xs text-zinc-500">/{p.slug}</div>
              </div>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded ${p.published ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-700'}`}>{p.published ? 'Published' : 'Draft'}</span>
              <button 
                className="text-blue-600 text-sm hover:text-blue-800" 
                onClick={() => editPost(p)}
              >
                Edit
              </button>
              <button className="text-red-600 text-sm hover:text-red-800" onClick={async () => {
                if (!confirm('Delete this post?')) return;
                const res = await fetch(`/api/v1/posts/${p.slug}`, { method: 'DELETE' });
                if (res.ok) load();
              }}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ProjectsPanel() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    thumbnailUrl: "",
    repoUrl: "",
    liveUrl: "",
    tags: "",
    featured: false
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/projects");
      const json = await res.json();
      setProjects(json.data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ name: "", slug: "", description: "", thumbnailUrl: "", repoUrl: "", liveUrl: "", tags: "", featured: false });
    setEditingSlug(null);
  };

  const editProject = (project: any) => {
    setForm({
      name: project.name,
      slug: project.slug,
      description: project.description || "",
      thumbnailUrl: project.thumbnailUrl || "",
      repoUrl: project.repoUrl || "",
      liveUrl: project.liveUrl || "",
      tags: project.tags ? project.tags.join(", ") : "",
      featured: project.featured || false
    });
    setEditingSlug(project.slug);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    };
    
    const method = editingSlug ? "PATCH" : "POST";
    const url = editingSlug ? `/api/v1/projects/${editingSlug}` : "/api/v1/projects";
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      resetForm();
      await load();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to save project");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">{editingSlug ? "Edit Project" : "Create Project"}</h2>
          {editingSlug && (
            <button 
              className="text-sm text-zinc-600 hover:text-black"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border rounded px-3 py-2"
              placeholder="Project Name"
              value={form.name}
              onChange={e => setForm(v => ({
                ...v,
                name: e.target.value,
                slug: editingSlug ? v.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
              }))}
              required
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Slug (auto)"
              value={form.slug}
              onChange={e => setForm(v => ({ ...v, slug: e.target.value }))}
              required
              disabled={!!editingSlug}
            />
          </div>

          <textarea
            className="border rounded px-3 py-2 w-full"
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={e => setForm(v => ({ ...v, description: e.target.value }))}
          />

          <div className="flex items-center gap-3">
            <input
              className="border rounded px-3 py-2 flex-1"
              placeholder="Thumbnail URL"
              value={form.thumbnailUrl}
              onChange={e => setForm(v => ({ ...v, thumbnailUrl: e.target.value }))}
            />
            <label className="px-3 py-2 rounded bg-zinc-200 cursor-pointer">
              Upload
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const result = await uploadImage(file);
                  setForm(v => ({ ...v, thumbnailUrl: result.url }));
                }}
              />
            </label>
          </div>

          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Live URL (where project is hosted)"
            value={form.liveUrl}
            onChange={e => setForm(v => ({ ...v, liveUrl: e.target.value }))}
          />

          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Repo URL (GitHub, GitLab, etc.)"
            value={form.repoUrl}
            onChange={e => setForm(v => ({ ...v, repoUrl: e.target.value }))}
          />

          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={e => setForm(v => ({ ...v, tags: e.target.value }))}
          />

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={e => setForm(v => ({ ...v, featured: e.target.checked }))}
              />
              Featured
            </label>
            <button className="ml-auto px-4 py-2 rounded bg-black text-white" type="submit">
              {editingSlug ? "Update Project" : "Save Project"}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="font-medium">Projects {loading && <span className="text-xs text-zinc-500">(loading)</span>}</h2>
        <ul className="divide-y rounded border">
          {projects.map(p => (
            <li key={p.slug} className="p-3 flex items-center gap-3">
              {p.thumbnailUrl && <img src={p.thumbnailUrl} alt="" className="size-10 rounded object-cover" />}
              <div className="min-w-0">
                <div className="font-medium truncate">{p.name}</div>
                <div className="text-xs text-zinc-500">/{p.slug}</div>
                {p.tags && p.tags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {p.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-violet-100 text-violet-700">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded ${p.featured ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-700'}`}>
                {p.featured ? 'Featured' : 'Regular'}
              </span>
              <button
                className="text-blue-600 text-sm hover:text-blue-800"
                onClick={() => editProject(p)}
              >
                Edit
              </button>
              <button
                className="text-red-600 text-sm hover:text-red-800"
                onClick={async () => {
                  if (!confirm('Delete this project?')) return;
                  const res = await fetch(`/api/v1/projects/${p.slug}`, { method: 'DELETE' });
                  if (res.ok) load();
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FaqsPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [aHtml, setAHtml] = useState<any>("<p>Type the answer...</p>");

  const load = async () => {
    const res = await fetch('/api/v1/faqs');
    const json = await res.json();
    setItems(json.data.items || []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    const res = await fetch('/api/v1/faqs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q, answerHtml: typeof aHtml === 'string' ? aHtml : undefined, answerJson: typeof aHtml === 'object' ? aHtml : undefined }) });
    if (res.ok) { setQ(""); setAHtml("<p>Type the answer...</p>"); load(); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <input className="border rounded px-3 py-2 w-full" placeholder="Question" value={q} onChange={e => setQ(e.target.value)} />
          <div className="border rounded">
            <TiptapEditor output="html" content={aHtml} onChange={setAHtml} />
          </div>
          <button className="px-4 py-2 rounded bg-black text-white" onClick={add}>Add FAQ</button>
        </div>
        <ul className="divide-y rounded border">
          {items.map(i => (
            <li key={i._id} className="p-3">
              <div className="font-medium">{i.question}</div>
              <div className="text-xs text-zinc-500">{new Date(i.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MediaPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/images');
      const json = await res.json();
      setItems(json || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="px-3 py-2 rounded bg-zinc-200 cursor-pointer">
          Upload Image
          <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            await uploadImage(f);
            await load();
          }} />
        </label>
        <button className="px-3 py-2 rounded bg-black text-white" onClick={load}>{loading ? 'Refreshing…' : 'Refresh'}</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map((i) => (
          <figure key={i.id} className="border rounded overflow-hidden">
            <img src={i.url} alt={i.id} className="w-full h-32 object-cover" />
            <figcaption className="p-2 text-xs truncate">{i.display_name || i.id}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
