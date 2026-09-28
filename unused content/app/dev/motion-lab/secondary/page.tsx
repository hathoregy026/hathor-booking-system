/**
 * DEVELOPMENT-ONLY secondary page for menu route-navigation tests.
 */
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function MotionLabSecondaryPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div
      style={{
        minHeight: "120vh",
        padding: "6rem 2rem 4rem",
        background: "#ece8df",
        color: "#2c2419",
      }}
    >
      <p data-motion-lab-secondary="">Motion lab secondary route</p>
      <Link href="/dev/motion-lab">Back to motion lab home</Link>
    </div>
  );
}
