"use client";

import { useCallback, useEffect, useState } from "react";
import { ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { adminFetch } from "@/lib/admin-fetch";
import { IMAGE_CATEGORIES } from "@/lib/image-categories";

type SiteImageRecord = {
  id: string;
  name: string;
  altText: string;
  url: string;
  category: string;
  pagePath: string;
  displayOrder: number;
  isActive: boolean;
};

const EMPTY_FORM = {
  name: "",
  altText: "",
  url: "",
  category: "hero" as (typeof IMAGE_CATEGORIES)[number],
  pagePath: "/",
  displayOrder: 0,
  isActive: true,
};

export default function AdminImagesPage() {
  const [images, setImages] = useState<SiteImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminFetch("/api/admin/images");
      if (!response.ok) throw new Error("Failed to load images");
      const data = (await response.json()) as { images: SiteImageRecord[] };
      setImages(data.images);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load images");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadImages();
  }, [loadImages]);

  const handleCreate = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await adminFetch("/api/admin/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to create image");
      }
      setForm(EMPTY_FORM);
      setShowForm(false);
      await loadImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save image");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (image: SiteImageRecord) => {
    try {
      const response = await adminFetch(`/api/admin/images/${image.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !image.isActive }),
      });
      if (!response.ok) throw new Error("Update failed");
      await loadImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update image");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this image record?")) return;
    try {
      const response = await adminFetch(`/api/admin/images/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Delete failed");
      await loadImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete image");
    }
  };

  const grouped = images.reduce<Record<string, SiteImageRecord[]>>((acc, img) => {
    const key = img.pagePath || "/";
    acc[key] = acc[key] ?? [];
    acc[key].push(img);
    return acc;
  }, {});

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Site Images</h1>
          <p className="admin-page-subtitle">
            Manage hero, room, and section images across public pages.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add Image
        </button>
      </div>

      {error && (
        <p className="admin-error-banner" role="alert">
          {error}
        </p>
      )}

      {showForm && (
        <div className="admin-card mb-6 space-y-4 p-6">
          <h2 className="text-lg font-medium">New Site Image</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="admin-field">
              <span>Name (slug)</span>
              <input
                className="admin-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="hero-homepage"
              />
            </label>
            <label className="admin-field">
              <span>Page Path</span>
              <input
                className="admin-input"
                value={form.pagePath}
                onChange={(e) => setForm({ ...form, pagePath: e.target.value })}
                placeholder="/"
              />
            </label>
            <label className="admin-field md:col-span-2">
              <span>Alt Text</span>
              <input
                className="admin-input"
                value={form.altText}
                onChange={(e) => setForm({ ...form, altText: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span>Category</span>
              <select
                className="admin-input"
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value as (typeof IMAGE_CATEGORIES)[number],
                  })
                }
              >
                {IMAGE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              <span>Display Order</span>
              <input
                type="number"
                min={0}
                className="admin-input"
                value={form.displayOrder}
                onChange={(e) =>
                  setForm({ ...form, displayOrder: Number(e.target.value) })
                }
              />
            </label>
          </div>

          <ImageUpload
            label="Image"
            value={form.url || null}
            onChange={(url) => setForm({ ...form, url: url ?? "" })}
            folder="site-images"
            variant="admin"
          />

          <div className="flex gap-3">
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              disabled={saving || !form.name || !form.url || !form.altText}
              onClick={() => void handleCreate()}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                "Save Image"
              )}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm opacity-70">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading images…
        </div>
      ) : images.length === 0 ? (
        <div className="admin-card flex flex-col items-center gap-3 p-12 text-center">
          <ImageIcon className="h-10 w-10 opacity-40" aria-hidden />
          <p>No site images yet. Unsplash placeholders are used on the public site.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([pagePath, pageImages]) => (
          <section key={pagePath} className="mb-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-70">
              {pagePath}
            </h2>
            <div className="grid gap-4">
              {pageImages.map((image) => (
                <article key={image.id} className="admin-card flex gap-4 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.altText}
                    className="h-20 w-28 shrink-0 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{image.name}</p>
                    <p className="text-sm opacity-70">
                      {image.category} · order {image.displayOrder}
                    </p>
                    <p className="mt-1 truncate text-sm">{image.altText}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost text-xs"
                      onClick={() => void toggleActive(image)}
                    >
                      {image.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost text-xs text-red-500"
                      onClick={() => void handleDelete(image.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
