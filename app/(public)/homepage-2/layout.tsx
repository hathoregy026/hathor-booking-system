import type { ReactNode } from "react";

export default function HomePage2Layout({ children }: { children: ReactNode }) {
  return (
    <div className="homepage-2-route">
      <script
        dangerouslySetInnerHTML={{
          __html: `
  document.documentElement.setAttribute('data-homepage2-experience', '');
  document.body.classList.add('has-page-scroll-transition');
`,
        }}
      />
      {children}
    </div>
  );
}
