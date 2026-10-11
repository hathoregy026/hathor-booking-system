# Bulk mail and email-editor release

The bulk-mail cloud preview is a test snapshot. It is **not the production
release source** and must never be promoted over the live site. The separate
login/roles handoff branch is also excluded from this release.

The release source is `.tmp-bulk-release-source/`, prepared from the commit
actually serving `www.hathorcruise.com`. The email editor is included because
the user requested it alongside bulk mail. Existing inbox, booking, verification,
banner-framing, public pages, assets and migration history remain in place.
The current live baseline verified on 2026-10-12 is
`f0232b307ba7fad05618a25346d44f904b55fa57`, deployment
`dpl_GyzEZArFPn2SYqXJLAqEChT9KD9C`.

Before a separately authorized release:

1. Run `node scripts/check-bulk-release-safety.mjs` from the original project
   directory. It reads the actual production-domain targets from Vercel, compares
   their deployment and commit to the prepared baseline, checks every source
   file, rejects removals or changes outside the reviewed scope, and compares
   the source with the hashes recorded after testing. No deployment, database,
   mail or settings changes occur during this check.
2. If the live deployment changed, stop and prepare a new source copy from that
   live revision. Carry over only the requested feature changes, review the
   differences and retest. Never release an older preview or replace the live
   source with the original dirty local checkout.
3. If prepared source changed, review and retest it before recording a new
   verification with `--seal`. A seal records the tested source; it is not
   permission to deploy. Never reseal automatically to bypass a failed check.
4. Build a **new deployment** from the checked release copy. Verify its routes
   and the existing features alongside the new ones before production promotion.
   Recheck the live baseline immediately before promotion; a concurrent live
   update requires rebuilding the release on that newer version.

No seed or template-reset commands belong in this release. Existing saved
template text, footer and images are loaded from the current database. Bulk
activation and its private history table follow their own reviewed setup.

# Email editor

The selected template's actual React Email HTML appears beside its fields on
desktop. The preview stays visible while scrolling the editor; smaller screens
stack it above the fields. Desktop and phone width controls show the same HTML.
After a short pause in typing, unsaved subject, heading, message, color, uploaded
image and footer changes update the preview. Editing the message scrolls to that
text; focusing a footer field scrolls to the signature. Other edits preserve the
preview's scroll position. The live banner-framing controls are preserved.

Previewing never saves or sends mail. The existing image-upload/framing actions
still save their image immediately; uploading no longer reloads the form or
discards unsaved wording. Text, colors and footer are saved using the existing
Save all templates action. Sample guest and booking details appear in previews.

The iframe blocks scripts, forms and navigation links. The preview endpoint
validates field types, allowed template names, same-origin requests and a 96 KB
body limit. Complete selected drafts avoid database reads on each edit. Obsolete
requests are cancelled so their results cannot replace a newer draft.

Local verification:

- `node --test scripts/test-bulk-release-safety.mjs`
- `node scripts/run-bulk-release-checks.mjs typecheck`
- `node scripts/run-bulk-release-checks.mjs build`
- In the original project: `node scripts/run-email-editor-qa.mjs serve`, then
  `node scripts/run-email-editor-qa.mjs test` in a separate terminal. This tests
  the built release with a disposable signing secret, a non-live database URL,
  synthetic dashboard data and mocked image uploads. It never uses production
  mail credentials or writes live templates.

The roles handoff branch requires `templates.view` for saved and draft previews;
rendering a draft cannot save or send anything. Saving, uploading, framing and
sending still require `templates.manage`. Its separate server page guard remains
in place.
