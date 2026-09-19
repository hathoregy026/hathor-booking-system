/** Visible editorial copy rendered by the live `/gastronomy` experience. */
export type GastronomyLiveText = {
  introChapter: string;
  introTitle: string;
  introSecondTitle: string;
  introThirdTitle: string;
  introBody: string;
  tableLabel: string;
  statementChapter: string;
  statementTitle: string;
  statementBody: string;
  riverBody: string;
  marquee: string;
  coursesChapter: string;
  coursesTitle: string;
  coursesBody: string;
  values: Array<{ title: string; body: string }>;
  experiencesChapter: string;
  experiencesBody: string;
  stories: Array<{ time: string; place: string; title: string; cta: string }>;
  closingChapter: string;
  closingTitle: string;
  closingBody: string;
  closingCta: string;
  conciergeTitle: string;
  diningClosingTitle: string;
  conciergeBody: string;
  conciergeCta: string;
  featureLabel: string;
  featureTitle: string;
  featureBody: string;
};

export const DEFAULT_GASTRONOMY_LIVE_TEXT: GastronomyLiveText = {
  introChapter: "Dining",
  introTitle: "TABLES\nON THE NILE",
  introSecondTitle: "MADE TO\nMOVE WITH YOU",
  introThirdTitle: "TASTE\nEGYPT",
  introBody: "Menus draw on Egyptian ingredients and familiar international influences, with dishes prepared to suit the pace and setting of each day. Dining, movement and rest are composed as one continuous experience.",
  tableLabel: "THE TABLE",
  statementChapter: "The experience",
  statementTitle: "DINING THAT INVITES\nYOU TO LINGER\nMOVE WITH\nTHE RIVER",
  statementBody: "Every table is shaped around the people who gather there. Breakfast arrives with first light; dinner follows the breeze; the gym stays close to the deck; your suite remembers how you like to rest. Design, flavour and ease of life meet as one Hathor day.",
  riverBody: "On Hathor, dining is part of the voyage—not a pause from it. Seasonal menus bring together Egyptian flavours, fresh ingredients and attentive service, served in settings shaped by the river.",
  marquee: "RITUALS",
  coursesChapter: "Seven courses",
  coursesTitle: "PLATES THAT\nARRIVE\nLIKE MOMENTS",
  coursesBody: "Each course enters slowly, settles into its place and gives the table time to look, breathe and taste.",
  values: [
    { title: "TABLE", body: "Egyptian ingredients are treated with restraint: bright citrus, warm spice, river fish and vegetables gathered close to the banks." },
    { title: "MOVEMENT", body: "The onboard gym keeps movement close—an unhurried morning session while palms and villages pass beyond the deck." },
    { title: "REST", body: "Your suite is the quiet counterpoint: generous river views, thoughtful details and private service whenever you prefer to stay in." },
  ],
  experiencesChapter: "Experiences",
  experiencesBody: "Luxury does not need to announce itself. It is felt in exact timing, a favourite drink remembered, room to move and the freedom to dine wherever the river looks best.",
  stories: [
    { time: "SUNRISE", place: "UPPER DECK", title: "BREAKFAST", cta: "Open Story" },
    { time: "EVENING", place: "DINING SALON", title: "CHEF'S TABLE", cta: "Open Story" },
    { time: "GOLDEN HOUR", place: "RIVER DECK", title: "NILE SUPPER", cta: "Open Story" },
    { time: "DAILY", place: "FITNESS DECK", title: "MOVE", cta: "Open Story" },
    { time: "ANY HOUR", place: "YOUR SUITE", title: "SUITE SERVICE", cta: "Open Story" },
  ],
  closingChapter: "Beyond the table",
  closingTitle: "WHO SAID\nPLEASURE\nCANNOT BE\nFUNCTIONAL?",
  closingBody: "Dining, movement and rest are composed as one continuous experience. Nothing is rushed, nothing is overworked, and every detail serves the ease of life aboard.",
  closingCta: "Book Voyage",
  conciergeTitle: "SHAPE YOUR\nCONCIERGE VOYAGE",
  diningClosingTitle: "DINING WITH\nROOM TO\nBREATHE",
  conciergeBody: "Tell us how you like to travel. Our team can shape private dinners, dietary requests, celebrations, fitness time and suite service around the natural pace of your Nile voyage.",
  conciergeCta: "Plan Voyage",
  featureLabel: "THE HATHOR TABLE",
  featureTitle: "PRIVATE DINING",
  featureBody: "Private dining can be arranged in selected onboard settings for guests seeking a more personal experience.",
};
