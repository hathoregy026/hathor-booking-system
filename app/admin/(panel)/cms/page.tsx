import Link from "next/link";
import {
  Aperture,
  FileText,
  Globe,
  HardDrive,
  ImageIcon,
  Layers,
  Mail,
  Newspaper,
  Sparkles,
  Type,
  Shapes,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ADMIN_CMS_LINKS } from "@/lib/admin-nav";

const CMS_ICONS: Record<string, LucideIcon> = {
  "/admin/website-text": FileText,
  "/admin/content": ImageIcon,
  "/admin/typography": Type,
  "/admin/pages": Layers,
  "/admin/live-site": Globe,
  "/admin/preload-screen": Sparkles,
  "/admin/hero-logo-tune": Aperture,
  "/admin/hieroglyph-tune": Shapes,
  "/admin/blogs": Newspaper,
  "/admin/email-templates": Mail,
  "/admin/storage": HardDrive,
};

export default function AdminCmsHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-page-title">CMS</h1>
        <p className="admin-page-subtitle">
          Edit the live public site from the screens already connected to it.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ADMIN_CMS_LINKS.map((link) => {
          const Icon = CMS_ICONS[link.href] ?? FileText;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="card card-hover group flex flex-col gap-3 p-5"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background: "color-mix(in srgb, var(--accent) 16%, transparent)",
                  color: "var(--accent)",
                }}
              >
                <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden />
              </span>
              <div>
                <p className="font-semibold tracking-tight">{link.label}</p>
                <p className="mt-1 text-sm text-muted">{link.description}</p>
              </div>
              <p
                className="mt-auto pt-1 text-xs font-medium"
                style={{ color: "var(--accent)" }}
              >
                Open
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}