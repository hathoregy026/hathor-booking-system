import Image from "next/image";
import Link from "next/link";

type PageHeroProps = {
  title: string;
  subtitle?: string;
  breadcrumb: string;
  imageSrc: string;
  imageAlt: string;
};

export function PageHero({
  title,
  subtitle,
  breadcrumb,
  imageSrc,
  imageAlt,
}: PageHeroProps) {
  return (
    <section className="hathor-page-hero">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        className="hathor-page-hero__bg object-cover"
        sizes="100vw"
      />
      <div className="hathor-page-hero__overlay" aria-hidden />
      <div className="hathor-container hathor-page-hero__content">
        <nav className="hathor-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden>/</span>
          <span>{breadcrumb}</span>
        </nav>
        <h1 className="hathor-page-hero__title">{title}</h1>
        {subtitle ? (
          <p className="hathor-page-hero__subtitle">{subtitle}</p>
        ) : null}
        <div className="hathor-gold-line" />
      </div>
    </section>
  );
}
