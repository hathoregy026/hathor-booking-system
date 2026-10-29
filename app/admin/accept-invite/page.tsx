import type { Metadata } from "next";
import { AcceptAdminInvitation } from "@/components/admin/AcceptAdminInvitation";
export const metadata: Metadata = { referrer: "no-referrer", robots: { index: false, follow: false } };
export default function AcceptInvitePage() { return <AcceptAdminInvitation />; }
