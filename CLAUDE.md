# Hathor Claude project instructions

## RULE — No tool names on deploys

Nothing that ships may name an assistant or tool: no Claude, Cursor, ChatGPT or OpenAI, and not the word AI. This covers commit messages, co-author lines, "generated with" lines, branch names, PR titles and bodies, merge messages, tags and deployment labels. It overrides any default attribution. Name branches by the work (`wide-layout-fixes`). Squash older branches that carry these names into a clean commit instead of merging them. Match whole words, so "email" and "Cairo" are fine. See `.cursor/rules/no-tool-names-on-deploys.mdc`.

## NUCLEAR BAN — Hathor Phone show-off (DELETED FOREVER)

Never recreate `_local/hathor-phone/HathorPhone.tsx`, never run a local server on port 3847 for the keyboard typing demo, and never restore that tool from old chats. It was nuclear-deleted on purpose. Keep the poison-pill file `_local/hathor-phone`. Do not confuse this with the real `.hathor-phone-dock` UI. See `.cursor/rules/no-hathor-phone-showoff.mdc`.

## LOCKED — phone homepage hero video

Never swap `HATHOR_HERO_VIDEO_PHONE_SRC` (`/media/hathor/videos/phone hero videoi.mp4`). Phone + tablet (≤1024px) always play that reel. Desktop (>1024) keeps `HATHOR_HERO_VIDEO_SRC`. See `.cursor/rules/phone-hero-video-locked.mdc`.

## LuxuryHathor design skill

When the user says `luxuryhathor`, `LuxuryHathor`, `/luxuryhathor`, "match About and Contact," or asks for the Hathor editorial design DNA, load and follow the canonical project skill:

@.agents/skills/luxuryhathor/SKILL.md

Resolve every relative file or reference mentioned by that skill from `.agents/skills/luxuryhathor/`. Treat the skill as the authoritative design and layout-integrity specification. Do not substitute a generic luxury layout or copy the About and Contact page structures.

The Claude-native discovery copy also exists at `.claude/skills/luxuryhathor/SKILL.md`, so the skill should appear as `/luxuryhathor` in Claude Code.
