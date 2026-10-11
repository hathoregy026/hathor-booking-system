import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
import path from "node:path";

export function applyEmailEditorToRelease(root, release) {
  const page = "app/admin/(panel)/email-templates/page.tsx";
  const existing = readFileSync(path.join(release, page), "utf8").replaceAll("\r\n", "\n");
  // Preserve the live banner-framing control, which the older local checkout lacks.
  const banner = existing.match(/        <EmailHeroFramerPanel\n[\s\S]*?\n        \/>/)?.[0];
  if (!banner) throw new Error("Live banner-framing controls changed; review before preparing the editor.");
  let editor = readFileSync(path.join(root, page), "utf8").replaceAll("\r\n", "\n");
  if (!editor.includes('import { EmailHeroFramerPanel }')) editor = editor.replace('import { EmailImageUpload } from "@/components/admin/EmailImageUpload";', 'import { EmailImageUpload } from "@/components/admin/EmailImageUpload";\nimport { EmailHeroFramerPanel } from "@/components/admin/EmailHeroFramer";');
  const colors = '        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">';
  if (!editor.includes(colors)) throw new Error("Editor branding insertion changed.");
  editor = editor.replace(colors, banner + "\n\n" + colors);
  if (!editor.includes(banner) || !editor.includes("EmailTemplateLivePreview")) throw new Error("Editor preservation check failed.");
  writeFileSync(path.join(release, page), editor);
  for (const file of ["components/admin/EmailTemplateLivePreview.tsx", "components/admin/email-template-editor.css", "lib/email-preview-draft.ts", "app/api/admin/email-templates/preview/route.ts"]) copyFileSync(path.join(root, file), path.join(release, file));
}
