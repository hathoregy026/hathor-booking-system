import { Body, Head, Html, Preview } from "@react-email/components";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import type { BulkEmailTemplate, BulkJournalImage } from "@/lib/bulk-email-types";
import { BULK_JOURNAL_IMAGE_PATHS, bulkJournalAssetUrl } from "@/lib/bulk-email-journal";
import { emailFooterMailto, resolveEmailFooterCopyright } from "@/lib/email-footer";

// This layout and its assets belong only to bulk campaigns. Transactional
// booking/contact emails continue to use their existing shared EmailLayout.
const sans = "Arial, Helvetica, sans-serif";
const serif = "Italiana, Georgia, 'Times New Roman', serif";
const ink = "#211f19", muted = "#71694e", copy = "#5c5649", olive = "#3c3d31";
const tableStyle: CSSProperties = { borderCollapse: "collapse", width: "100%" };
function Table({ children, style, ...props }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return <table role="presentation" cellPadding={0} cellSpacing={0} border={0} style={{ ...tableStyle, ...style }} {...props}><tbody>{children}</tbody></table>;
}
function Lines({ text }: { text: string }) {
  return <>{text.split(/\r?\n/).map((line, index) => <Fragment key={index}>{index > 0 && <br />}{line}</Fragment>)}</>;
}
function Heading({ text, size = 74, color = ink }: { text: string; size?: number; color?: string }) {
  return <h2 className="journal-headline" style={{ margin: 0, fontFamily: serif, fontSize: size, fontWeight: 400, lineHeight: "1.01", letterSpacing: "-1px", color, overflowWrap: "anywhere" }}><Lines text={text} /></h2>;
}
function Paragraphs({ text, color = copy, style }: { text: string; color?: string; style?: CSSProperties }) {
  return <>{text.split(/\r?\n\s*\r?\n/).filter(Boolean).map((paragraph, index) => <p key={index} style={{ margin: index ? "18px 0 0" : 0, fontFamily: sans, fontSize: 14, lineHeight: "1.9", color, overflowWrap: "anywhere", ...style }}><Lines text={paragraph} /></p>)}</>;
}
const labelStyle: CSSProperties = { margin: 0, fontFamily: sans, fontSize: 10, lineHeight: "1.7", letterSpacing: "2.5px", color: muted, overflowWrap: "anywhere" };
const frame: CSSProperties = { maxWidth: 960, margin: "auto" };
function imageUrl(image: BulkJournalImage, key: keyof typeof BULK_JOURNAL_IMAGE_PATHS) {
  return image.url || bulkJournalAssetUrl(BULK_JOURNAL_IMAGE_PATHS[key]);
}
function Button({ label, url, gold, dark = false }: { label: string; url: string; gold: string; dark?: boolean }) {
  if (!label.trim() || !url.trim()) return null;
  return <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", fontFamily: sans, fontSize: 10, lineHeight: "1.8", letterSpacing: "2px", color: dark ? "#ece8df" : ink, textDecoration: "none", overflowWrap: "anywhere", ...(dark ? { border: `1px solid ${gold}`, borderRadius: 999, padding: "17px 24px" } : { borderBottom: `1px solid ${gold}`, padding: "0 0 7px" }) }}>{label} &nbsp; ↗</a>;
}

export default function BulkJournalEmail({ subject, message, template, unsubscribeUrl }: { subject: string; message: string; template: BulkEmailTemplate; unsubscribeUrl?: string }) {
  const journal = template.journal!;
  const paper = template.backgroundColor, gold = template.primaryColor;
  const { galleryMainImage: main, galleryUpperImage: upper, galleryLowerImage: lower } = journal;
  const hasRight = upper.show || lower.show;
  const hero = template.heroImageUrl || bulkJournalAssetUrl(BULK_JOURNAL_IMAGE_PATHS.hero);
  const mailto = emailFooterMailto(template.footer.email);
  return <Html lang="en"><Head>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="light" /><meta name="supported-color-schemes" content="light" />
    <title>{subject}</title>
    <style>{`@font-face{font-family:Italiana;src:url('${bulkJournalAssetUrl("/fonts/more-fonts/Italiana-Regular.woff2")}') format('woff2');font-weight:400;font-style:normal;font-display:swap;}
      html,body{margin:0!important;padding:0!important;width:100%!important;}table{border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;}img{border:0;outline:none;-ms-interpolation-mode:bicubic;}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;}
      @media only screen and (min-width:641px) and (max-width:900px){.journal-headline{font-size:51px!important;}.journal-portrait{height:355px!important;}.journal-intro-copy{padding-right:28px!important;}.journal-gallery-left{height:310px!important;}.journal-gallery-strip{height:85px!important;}.journal-night{height:210px!important;}}
      @media only screen and (max-width:640px){.journal-frame{padding:45px 24px!important;}.journal-stack{display:block!important;width:100%!important;box-sizing:border-box!important;}.journal-intro-copy{padding:0 0 35px!important;}.journal-portrait{height:355px!important;max-width:390px!important;margin:auto!important;}.journal-headline{font-size:51px!important;line-height:1.04!important;}.journal-gallery-heading{padding:0 0 20px!important;}.journal-gallery-note{padding:0 0 28px!important;}.journal-value-cell{padding:18px 0!important;}.journal-values{padding:24px!important;}.journal-gallery-left{height:310px!important;}.journal-gallery-strip{height:105px!important;}.journal-night{height:191px!important;}.journal-gallery-gap{width:8px!important;}.journal-cta-copy{padding:28px 0 0!important;}.journal-footer-contact{padding:20px 0 0!important;}.journal-tiny{font-size:8px!important;letter-spacing:1px!important;}.journal-footmark{font-size:25px!important;}}
      @media only screen and (max-width:380px){.journal-headline{font-size:42px!important;}.journal-gallery-left{height:250px!important;}.journal-gallery-strip{height:85px!important;}.journal-night{height:150px!important;}}
    `}</style>
  </Head><Preview>{message.slice(0, 120)}</Preview><Body style={{ margin: 0, padding: 0, backgroundColor: paper, fontFamily: sans, WebkitTextSizeAdjust: "100%" }}>
    <Table style={{ backgroundColor: paper, maxWidth: 1100, margin: "0 auto" }}>
      <tr data-bulk-section="hero"><td style={{ padding: "16px 24px" }}><Table><tr>
        <td width="45%" className="journal-tiny" style={{ fontFamily: sans, fontSize: 9, letterSpacing: "2px", color: muted, overflowWrap: "anywhere" }}><Lines text={journal.mastheadLabel} /></td>
        <td width="10%" align="center" valign="middle"><img src={bulkJournalAssetUrl("/email/bulk-journal/icon.png")} width={32} height={40} alt="Hathor" style={{ display: "block", width: 32, height: 40 }} /></td>
        <td width="45%" align="right" className="journal-tiny" style={{ fontFamily: sans, fontSize: 9, letterSpacing: "2px", color: muted, overflowWrap: "anywhere" }}><Lines text={journal.mastheadLocation} /></td>
      </tr></Table></td></tr>
      {template.showBanner && <tr><td style={{ padding: 0, lineHeight: 0 }}><img src={hero} width="1100" alt="HATHOR — A journey through Egypt. Sail the Nile in timeless style." style={{ display: "block", width: "100%", height: "auto" }} /></td></tr>}
      <tr data-bulk-section="intro"><td className="journal-frame" style={{ padding: "65px 48px 68px" }}><Table style={frame}><tr>
        <td className="journal-stack journal-intro-copy" width={journal.introImage.show ? "55%" : "100%"} valign="middle" style={{ padding: journal.introImage.show ? "0 48px 0 0" : 0 }}>
          {template.eyebrow && <p style={{ ...labelStyle, marginBottom: 27 }}><Lines text={template.eyebrow} /></p>}
          <Heading text={template.heading} />
          <div style={{ margin: "25px 0 30px", maxWidth: journal.introImage.show ? 350 : "100%" }}><Paragraphs text={message} />{template.signature?.trim() && <Paragraphs text={template.signature} style={{ marginTop: 18 }} />}</div>
          <Button {...journal.discoverButton} gold={gold} />
        </td>
        {journal.introImage.show && <td width="45%" className="journal-stack" valign="middle" style={{ padding: 0, lineHeight: 0 }}><img className="journal-portrait" src={imageUrl(journal.introImage, "introImage")} width={432} height={430} alt={journal.introImage.alt} style={{ display: "block", width: "100%", height: 430, objectFit: "cover", objectPosition: "center", borderRadius: "250px 250px 0 0" }} /></td>}
      </tr></Table></td></tr>
      <tr data-bulk-section="features"><td className="journal-values" style={{ padding: "33px 48px 38px", backgroundColor: olive }}><Table style={frame}>
        {[0, 2].map(start => <tr key={start}>{journal.features.slice(start, start + 2).map((feature, index) => <td key={start + index} className="journal-value-cell journal-stack" width="50%" valign="top" style={{ padding: "20px 30px 20px 0" }}><Table><tr>
          <td valign="top" style={{ width: 55 }}><span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 27, color: "#c4b78f" }}>{String(start + index + 1).padStart(2, "0")}</span></td>
          <td valign="top"><p style={{ ...labelStyle, marginBottom: 9, letterSpacing: "1.5px", color: "#ece8df", lineHeight: "1.6" }}><Lines text={feature.title} /></p><p style={{ margin: 0, fontFamily: sans, fontSize: 12, lineHeight: "1.85", color: "#d6d0c2", overflowWrap: "anywhere" }}><Lines text={feature.body} /></p></td>
        </tr></Table></td>)}</tr>)}
      </Table></td></tr>
      <tr data-bulk-section="gallery"><td className="journal-frame" style={{ padding: "67px 48px 63px" }}><Table style={frame}>
        <tr><td className="journal-stack journal-gallery-heading" width="57%" valign="bottom" style={{ padding: "0 30px 36px 0" }}><Heading text={journal.galleryHeading} size={68} /></td><td className="journal-stack journal-gallery-note" width="43%" valign="bottom" style={{ padding: "0 0 40px" }}><Paragraphs text={journal.galleryBody} /></td></tr>
        {(main.show || hasRight) && <tr><td colSpan={2}><Table><tr>
          {main.show && <td width={hasRight ? "57%" : "100%"} valign="top" style={{ lineHeight: 0 }}><img className="journal-gallery-left" src={imageUrl(main, "galleryMainImage")} width={547} height={415} alt={main.alt} style={{ display: "block", width: "100%", height: 415, objectFit: "cover", objectPosition: "center" }} /></td>}
          {main.show && hasRight && <td width="2%" className="journal-gallery-gap" />}
          {hasRight && <td width={main.show ? "41%" : "100%"} valign="top"><Table>
            {upper.show && <tr><td style={{ lineHeight: 0 }}><img className="journal-gallery-strip" src={imageUrl(upper, "galleryUpperImage")} width={394} height={115} alt={upper.alt} style={{ display: "block", width: "100%", height: 115, objectFit: "cover", objectPosition: "center bottom" }} /></td></tr>}
            {upper.show && lower.show && <tr><td style={{ height: 15, lineHeight: "15px" }}>&nbsp;</td></tr>}
            {lower.show && <tr><td className="journal-night" height={285} {...{ background: imageUrl(lower, "galleryLowerImage") }} role="img" aria-label={lower.alt} style={{ height: 285, backgroundColor: olive, backgroundImage: `url('${imageUrl(lower, "galleryLowerImage")}')`, backgroundRepeat: "no-repeat", backgroundPosition: "right bottom", backgroundSize: "210% auto", lineHeight: 0 }}>&nbsp;</td></tr>}
          </Table></td>}
        </tr></Table></td></tr>}
        {journal.galleryCaption && <tr><td colSpan={2} style={{ paddingTop: 17 }}><p style={labelStyle}><Lines text={journal.galleryCaption} /></p></td></tr>}
      </Table></td></tr>
      <tr data-bulk-section="journey"><td className="journal-frame" style={{ backgroundColor: olive, padding: "55px 48px 61px" }}><Table style={frame}><tr>
        <td className="journal-stack" width="57%" valign="middle"><Heading text={journal.journeyHeading} size={62} color={paper} /></td>
        <td className="journal-stack journal-cta-copy" width="43%" valign="middle"><div style={{ marginBottom: 26 }}><Paragraphs text={journal.journeyBody} color="#d6d0c2" /></div><Button {...journal.journeyButton} gold={gold} dark /></td>
      </tr></Table></td></tr>
      <tr data-bulk-section="footer"><td className="journal-frame" style={{ padding: "34px 48px 32px" }}><Table style={frame}><tr>
        <td className="journal-stack" width="57%" valign="top"><p className="journal-footmark" style={{ margin: 0, fontFamily: serif, fontSize: 31, letterSpacing: "5px", color: ink }}>HATHOR</p>{template.footer.tagline && <p style={{ margin: "11px 0 0", fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 16, color: muted }}><Lines text={template.footer.tagline} /></p>}</td>
        <td className="journal-stack journal-footer-contact" width="43%" valign="top" style={{ fontFamily: sans, fontSize: 10, lineHeight: "1.9", color: muted, overflowWrap: "anywhere" }}>
          {template.footer.email && <>{mailto ? <a href={mailto} style={{ color: ink, textDecoration: "none" }}>{template.footer.email}</a> : template.footer.email}<br /></>}
          {template.footer.phone && <><a href={`tel:${template.footer.phone.replace(/[^+\d]/g, "")}`} style={{ color: ink, textDecoration: "none" }}>{template.footer.phone}</a><br /></>}
          {journal.address && <p style={{ margin: "9px 0 0", fontFamily: sans, fontSize: 9, lineHeight: "1.8" }}><Lines text={journal.address} /></p>}
          {template.footer.replyNote && <p style={{ margin: "9px 0 0" }}><Lines text={template.footer.replyNote} /></p>}
        </td>
      </tr><tr><td colSpan={2} style={{ paddingTop: 23 }}><p style={{ margin: 0, paddingTop: 17, borderTop: "1px solid #d0c7b8", fontFamily: sans, fontSize: 9, lineHeight: "1.8", color: muted, overflowWrap: "anywhere" }}>
        <Lines text={resolveEmailFooterCopyright(template.footer.copyright)} /><br />
        {unsubscribeUrl && <a href={unsubscribeUrl} style={{ color: muted, textDecoration: "underline" }}>Unsubscribe</a>}
        {journal.preferencesUrl && journal.preferencesLabel && <>{unsubscribeUrl && <> &nbsp; · &nbsp; </>}<a href={journal.preferencesUrl} style={{ color: muted, textDecoration: "underline" }}>{journal.preferencesLabel}</a></>}
      </p></td></tr></Table></td></tr>
    </Table>
  </Body></Html>;
}
