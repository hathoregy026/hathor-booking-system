/**
 * Journal posts in German, keyed by slug: the journal index's title and
 * excerpt. The posts themselves live in the database (BlogPost); a post with no
 * entry, or one added later in the dashboard, shows its English text on German
 * pages. Titles avoid hyphens: large type breaks at them and the display face
 * draws none.
 */
import type { PostWords } from "@/lib/i18n/blog-posts-it";

export const BLOG_POSTS_DE: Record<string, PostWords> = {
  "unplugged-travel-no-wifi-experience-on-a-dahabiya": {
    title: "Ohne WLAN: offline reisen auf der Dahabiya",
    excerpt:
      "Erleben Sie eine Offline-Reise in Ägypten an Bord einer Luxus-Dahabiya: Slow Travel, Digital Detox ohne WLAN und eine ruhige Fahrt auf dem Nil, mit authentischen Kulturerlebnissen und zeitlosen Landschaften.",
  },
  "the-magic-of-sleeping-on-the-nile-river": {
    title: "Der Zauber, auf dem Nil zu schlafen",
    excerpt:
      "Entdecken Sie den Zauber einer Nacht auf dem Nil in Ägypten: eine ruhige Fahrt auf dem Fluss, vorbei an uralten Landschaften, stillem Wasser und unvergesslichen Sonnenuntergängen, für ein wahrhaft zeitloses Reiseerlebnis.",
  },
  "secret-spots-between-luxor-and-aswan": {
    title: "Geheime Orte zwischen Luxor und Assuan",
    excerpt:
      "Entdecken Sie die geheimen Orte zwischen Luxor und Assuan auf einer Nilkreuzfahrt in Ägypten: den Tempel von Edfu, den Tempel von Kom Ombo, die Schleuse von Esna und die stillen Dörfer am zeitlosen Nil.",
  },
  "hidden-islands-you-can-only-see-on-a-dahabiya": {
    title: "Verborgene Inseln, die nur die Dahabiya erreicht",
    excerpt:
      "Entdecken Sie die verborgenen Inseln des Nils, die nur eine Dahabiya-Kreuzfahrt in Ägypten erreicht: Slow Travel, unberührte Landschaften und eine luxuriöse Reise unter Segeln zu geheimen Orten am Fluss.",
  },
  "untouched-nature-along-the-nile-river": {
    title: "Unberührte Natur entlang des Nils",
    excerpt:
      "Entdecken Sie die unberührte Natur entlang des Nils in Ägypten, wo stille Landschaften, grüne Inseln, Vögel und eindrucksvolle Ausblicke die Nilkreuzfahrt zu einem entspannten, authentischen Erlebnis machen.",
  },
  "why-travelers-love-slow-travel-on-the-nile": {
    title: "Warum Reisende Slow Travel auf dem Nil lieben",
    excerpt:
      "Entdecken Sie die Schönheit des Slow Travel auf dem Nil mit einer entspannten Kreuzfahrt in Ägypten von Luxor nach Assuan, mit antiken Tempeln, Blicken auf den Fluss und unvergesslichen Kulturerlebnissen.",
  },
  "the-most-relaxing-way-to-explore-egypt-sailing-the-nile": {
    title: "Die entspannteste Art, Ägypten zu entdecken: auf dem Nil",
    excerpt:
      "Entdecken Sie Ägypten auf die entspannteste Art mit einer Nilkreuzfahrt von Luxor nach Assuan, mit antiken Tempeln, herrlichen Blicken auf den Fluss und unvergesslichen Luxuserlebnissen.",
  },
  "tips-for-first-time-travelers-on-the-nile": {
    title: "Tipps für die erste Reise auf dem Nil",
    excerpt:
      "Die wichtigsten Tipps für Ihre erste Nilkreuzfahrt in Ägypten: Ratschläge von Fachleuten, eine vollständige Packliste und was Sie von einer Luxuskreuzfahrt auf dem Nil erwarten dürfen.",
  },
  "why-a-dahabiya-cruise-feels-like-time-travel": {
    title: "Warum eine Dahabiya sich wie eine Zeitreise anfühlt",
    excerpt:
      "Entdecken Sie den Reiz einer Dahabiya-Kreuzfahrt in Ägypten und erleben Sie den Nil authentisch auf der Fahrt zwischen Luxor und Assuan. Die zeitlose Schönheit Ägyptens, in traditionellem, ruhigem Luxus.",
  },
  "best-clothes-for-nile-cruise-weather-in-egypt": {
    title: "Was Sie auf der Nilkreuzfahrt tragen: Klima und Kleidung",
    excerpt:
      "Erfahren Sie, was Sie auf einer Nilkreuzfahrt in Ägypten tragen sollten, mit einfachen Tipps für Tag und Abend: die besten Kleidungsstücke und wie Sie sich bequem für das Klima von Luxor und Assuan anziehen.",
  },
  "dahabiya-cruise-cost-explained-whats-included": {
    title: "Was eine Dahabiya in Ägypten kostet und was inklusive ist",
    excerpt:
      "Die wahren Kosten einer Dahabiya-Kreuzfahrt in Ägypten: der Preis im Detail, was inklusive ist und was nicht, welche Faktoren ihn beeinflussen und warum diese Luxusfahrt zwischen Luxor und Assuan zu den ruhigsten und exklusivsten Arten gehört, den Nil zu entdecken.",
  },
  "what-to-pack-for-a-dahabiya-nile-cruise": {
    title: "Was Sie für die Dahabiya auf dem Nil einpacken sollten",
    excerpt:
      "Ein einfacher Leitfaden zum Packen für eine Dahabiya-Kreuzfahrt auf dem Nil in Ägypten: die wichtigste Kleidung, die örtlichen Kleiderregeln und Tipps für die erste Reise, für eine bequeme und unvergessliche Fahrt.",
  },
  "how-to-choose-the-right-cabin-on-a-dahabiya": {
    title: "So wählen Sie die richtige Kabine auf der Dahabiya",
    excerpt:
      "So wählen Sie die richtige Kabine auf einer Dahabiya und finden die romantischste für Ihre Nilkreuzfahrt in Ägypten: private Kabinen, kleine Luxusunterkünfte und die verschiedenen Typen im Überblick, für eine bequeme und unvergessliche Fahrt.",
  },
  "history-of-dahabiya-boats-in-egypt": {
    title: "Die Geschichte der Dahabiyas in Ägypten",
    excerpt:
      "Die Geschichte der Dahabiyas in Ägypten: wie diese eleganten Segelschiffe von den alten Nilreisen zur heutigen Dahabiya-Kreuzfahrt wurden. Ihre kulturellen Wurzeln, ihr einzigartiges Design und ihr Luxus.",
  },
  "why-the-nile-was-the-most-important-trade-route-in-ancient-egypt": {
    title: "Warum der Nil die wichtigste Handelsroute des alten Ägypten war",
    excerpt:
      "Der Handel auf dem Nil war im alten Ägypten entscheidend für Transport, Wirtschaft und Austausch: Er verband die Regionen des Landes und trug eine der größten Zivilisationen der Geschichte.",
  },
  "what-is-a-dahabiya-nile-cruise-complete-beginner-guide": {
    title: "Was ist eine Dahabiya auf dem Nil? Der vollständige Leitfaden",
    excerpt:
      "Eine Dahabiya-Kreuzfahrt auf dem Nil in Ägypten findet auf einem kleinen traditionellen Segelschiff statt: eine ruhige Luxusreise auf dem Fluss mit einem kulturellen, authentischen Erlebnis.",
  },
  "is-the-nile-safe-for-sailing-today": {
    title: "Ist eine Fahrt auf dem Nil heute sicher?",
    excerpt:
      "Ist eine Fahrt auf dem Nil sicher? Dieser Leitfaden betrachtet die aktuelle Sicherheitslage für Nilkreuzfahrten in Ägypten, erklärt, wie sicher das Reisen für Touristen heute ist, und gibt nützliche Tipps und aktuelle Hinweise für eine ruhige, angenehme Reise.",
  },
  "colossi-of-memnon": {
    title: "Die Memnonkolosse",
    excerpt:
      "Die Memnonkolosse in Luxor sind die berühmten antiken Statuen des Pharaos Amenhotep III., bekannt für ihre gewaltige Größe, ihre reiche Geschichte und die geheimnisvolle Legende vom Klang, der bei Sonnenaufgang „sang“.",
  },
  "aswan-nubian-villages": {
    title: "Die nubischen Dörfer von Assuan",
    excerpt:
      "Entdecken Sie die nubischen Dörfer von Assuan und die lebendige nubische Kultur in Ägypten: ein Blick auf farbenfrohe Dörfer, Traditionen und das authentische Leben an den Ufern des Nils.",
  },
  "luxor-temple-facts": {
    title: "Der Tempel von Luxor: Geschichte und Wissenswertes",
    excerpt:
      "Der Luxor-Tempel ist ein antiker ägyptischer Tempel am Ostufer des Nils. Berühmt für seine großen Statuen, gewaltigen Säulen und seine historische Bedeutung, zeugt er von der reichen Kultur und Architektur Ägyptens und zieht Besucher aus aller Welt an.",
  },
  "how-is-a-dahabiya-different-from-a-nile-cruise": {
    title: "Worin unterscheidet sich die Dahabiya von der Nilkreuzfahrt?",
    excerpt:
      "Der wahre Unterschied zwischen einer Dahabiya und einer klassischen Nilkreuzfahrt: Größe, Privatsphäre, Luxus und Reisestil im Vergleich, damit Sie das passende Nilerlebnis für Ihre Ägyptenreise wählen.",
  },
  "what-is-the-best-dahabiya-nile-cruise": {
    title: "Welche ist die beste Dahabiya auf dem Nil?",
    excerpt:
      "Entdecken Sie die beste Dahabiya-Kreuzfahrt auf dem Nil: eine private, entspannte Fahrt mit Hathor Cruise, bei der persönlicher Service und ein ruhiges Tempo eine einzigartige, authentische Art schaffen, Ägypten zu entdecken.",
  },
  "why-choose-a-dahabiya-cruise-in-egypt": {
    title: "Warum eine Kreuzfahrt mit der Dahabiya in Ägypten?",
    excerpt:
      "Entdecken Sie die Vorzüge einer privaten Dahabiya-Kreuzfahrt und erleben Sie den Nil als exklusives Boutique-Erlebnis mit Hathor Cruise, bei dem Komfort und persönlicher Service die Reise unvergesslich machen.",
  },
  "discover-the-timeless-luxor-west-bank": {
    title: "Das zeitlose Westufer von Luxor entdecken",
    excerpt:
      "Fahren Sie an Bord einer Luxus-Dahabiya zum Westufer von Luxor und entdecken Sie Ägypten in seiner eleganten, zeitlosen Schönheit. Eine private Dahabiya-Kreuzfahrt ermöglicht Ihnen authentische Besuche an Orten wie dem Tal der Könige, mit persönlichem Service und jedem Komfort.",
  },
  "luxury-travel-in-egypt-what-to-expect-on-a-dahabiya-cruise": {
    title: "Luxusreisen in Ägypten: was Sie auf der Dahabiya erwartet",
    excerpt:
      "Für eine Luxusreise in Ägypten sind nur wenige Erlebnisse mit einer Dahabiya-Kreuzfahrt auf dem Nil vergleichbar. Mit ihrer Verbindung aus Eleganz, Privatsphäre und authentischem Segeln bietet die Dahabiya eine einzigartige Art, die Schätze des Nils in Komfort und Exklusivität zu entdecken.",
  },
  "sailing-from-aswan-to-luxor-on-a-dahabiya-nile-cruise": {
    title: "Mit der Dahabiya von Assuan nach Luxor auf dem Nil",
    excerpt:
      "Die Fahrt auf dem Nil gehört zu den magischsten Arten, Ägypten zu erleben, und die Reise von Assuan nach Luxor mit der Dahabiya ist wahrhaft unvergesslich. Anders als große, volle Schiffe ist die Dahabiya ein traditionelles Segelschiff, das Intimität, Komfort und die Möglichkeit bietet, die verborgenen Schätze am Nil in Ruhe zu entdecken.",
  },
  "spiritual-journey-to-egypt": {
    title: "Eine spirituelle Reise nach Ägypten",
    excerpt:
      "Wenn Sie in Ägypten mehr suchen als reine Besichtigungen, erleben Sie eine ruhige, spirituelle Reise an Bord einer Dahabiya auf dem Nil und fahren Sie langsam von Assuan nach Luxor, auf der Suche nach Schönheit, Kultur und der Stille des Flusses.",
  },
  "discover-edfu-temple": {
    title: "Den Tempel von Edfu entdecken",
    excerpt:
      "Entdecken Sie den Tempel von Edfu, den Tempel des Horus, eine der eindrucksvollsten antiken Stätten Ägyptens: gewaltige Pylonen, feine Reliefs und heilige Hallen. Ein Muss auf jeder Dahabiya-Reise, das die Geschichte lebendig macht.",
  },
  "discovering-the-secrets-of-philae-temple": {
    title: "Die Geheimnisse des Tempels von Philae",
    excerpt:
      "Entdecken Sie den majestätischen Philae-Tempel in Assuan, der Göttin Isis geweiht. Als eine der zauberhaftesten Sehenswürdigkeiten Assuans vereint er antike Geschichte, atemberaubende Architektur und die Schönheit des Nils: ein Besuch, den Sie nicht verpassen sollten.",
  },
  "golden-gems-of-aswan": {
    title: "Die goldenen Schätze von Assuan",
    excerpt:
      "Entdecken Sie das goldene Assuan und den Zauber des Nils: Vom majestätischen Abu Simbel über den heiligen Philae-Tempel bis zu den farbenfrohen nubischen Dörfern machen die Wunder Assuans die Dahabiya-Reise unvergesslich.",
  },
  "aswan-high-dam": {
    title: "Der Hochdamm von Assuan",
    excerpt:
      "Entdecken Sie den Assuan-Hochdamm, das Hightech-Symbol ägyptischer Ingenieurskunst und ein Wahrzeichen moderner Zivilisation: seine faszinierende Geschichte, seinen Bau und wie er den Nil regelt, die Landwirtschaft trägt und Ägypten selbst prägt.",
  },
  "exploring-esna-temples-history-nile-charm": {
    title: "Esna entdecken: Tempel, Geschichte und Zauber des Nils",
    excerpt:
      "Fahren Sie mit einer Luxuskreuzfahrt auf dem Nil nach Esna und entdecken Sie das Beste dieser historischen Stadt: den Chnum-Tempel, lebhafte Märkte und verborgene Schätze am Fluss. Die reiche Geschichte, außergewöhnliche Architektur und der zeitlose Reiz Esnas auf einer unvergesslichen Reise.",
  },
  "luxors-sacred-east-bank": {
    title: "Das heilige Ostufer von Luxor",
    excerpt:
      "Gehen Sie die heiligen Alleen entlang, auf denen einst Pharaonen herrschten, und hören Sie das Echo alter Zeremonien. Bewundern Sie gewaltige Säulen und feine Hieroglyphen, die zeitlose Geschichten von Göttern und Königen erzählen.",
  },
  "kom-ombo-temple": {
    title: "Der Tempel von Kom Ombo",
    excerpt:
      "Entdecken Sie auf einer Dahabiya-Kreuzfahrt auf dem Nil den einzigartigen Tempel von Kom Ombo, einen herrlichen Tempel am Fluss, der dem Krokodilgott Sobek und Horus dem Älteren geweiht ist. Besuchen Sie ihn bei Sonnenuntergang für ein ruhiges, unvergessliches Erlebnis, und sehen Sie echte Krokodilmumien im nahen Museum.",
  },
  "5-quiet-nile-spots-for-stunning-honeymoon-captures": {
    title: "5 stille Orte am Nil für Flitterwochen in der Suite",
    excerpt:
      "Entdecken Sie 5 stille, romantische Orte am Nil, perfekt für Ihre Hochzeitsreisefotos, und erleben Sie Schönheit und Luxus einer Dahabiya-Kreuzfahrt, während Sie unvergessliche Erinnerungen in Ägypten festhalten.",
  },
  "discover-the-valley-of-the-kings": {
    title: "Das Tal der Könige entdecken",
    excerpt:
      "Treten Sie mit einer Luxuskreuzfahrt auf dem Nil bis zum Tal der Könige ins alte Ägypten ein: Erkunden Sie die Königsgräber und genießen Sie die stille Schönheit des Nils an Bord einer eleganten Dahabiya.",
  },
  "sailing-to-karnak-temple": {
    title: "Auf dem Weg zum Tempel von Karnak",
    excerpt:
      "Der Tempelkomplex von Karnak, der Tempel von Amun, Mut und Chons in Luxor, ist ein gewaltiges antikes Heiligtum. Mit seinen mächtigen Säulen und Kolossalstatuen ist er das spirituelle Herz des alten Ägypten in all seiner Pracht.",
  },
  "exploring-luxor-and-aswan-on-a-luxury-dahabiya": {
    title: "Luxor und Assuan an Bord einer luxuriösen Dahabiya",
    excerpt:
      "Entdecken Sie die Wunder von Luxor und Assuan auf einer Luxuskreuzfahrt auf dem Nil, wo Geschichte, Kultur und atemberaubende Ausblicke zu einer unvergesslichen Ägyptenreise verschmelzen.",
  },
  "where-history-lives-the-temple-of-hatshepsut": {
    title: "Wo Geschichte lebt: der Tempel der Hatschepsut",
    excerpt:
      "Reisen Sie zurück in die Geschichte des antiken Totentempels der Hatschepsut, eines eindrucksvollen Wunders am Fuß der Felsen von Luxor, und genießen Sie seine Erzählung auf einer ruhigen, luxuriösen Dahabiya auf dem Nil.",
  },
  "niles-hidden-gems-by-dahabiya": {
    title: "Die verborgenen Schätze des Nils mit der Dahabiya",
    excerpt:
      "Gehen Sie über die übliche Nilroute hinaus und entdecken Sie abgelegene Tempel, stille Ufer und historische Stätten, die nur die Dahabiya erreicht. Dieser Artikel erzählt von den exklusiven Erlebnissen, die eine Dahabiya-Fahrt auf dem Nil unvergesslich machen.",
  },
  "best-places-to-visit-along-the-nile-with-a-dahabiya-cruise": {
    title: "Die schönsten Orte am Nil auf einer Reise mit der Dahabiya",
    excerpt:
      "Reisen Sie stilvoll an Bord einer Luxus-Dahabiya und entdecken Sie die bekanntesten Orte am Nil, von antiken Tempeln bis zu historischen Schätzen. Es erwartet Sie eine exklusive Reise voller Eleganz und Geschichte, mit unvergesslichen Kulturerlebnissen und atemberaubenden Ausblicken.",
  },
  "explore-luxor-in-luxury": {
    title: "Luxor im Luxus",
    excerpt:
      "Entdecken Sie Luxor, das Land der Wunder, an Bord einer Luxus-Dahabiya: verborgene Tempel, das Tal der Könige und stille Ausblicke auf den Nil, auf einer authentischen, exklusiven Reise abseits der Menge.",
  },
  "best-time-for-dahabiya-nile-cruise": {
    title: "Die beste Reisezeit für die Dahabiya auf dem Nil",
    excerpt:
      "Eine Fahrt auf dem Nil mit der Dahabiya gehört zu den einzigartigsten und luxuriösesten Arten, Ägypten zu erleben. Mit ihren majestätischen Segeln und ihrer intensiven Atmosphäre wirkt die Dahabiya-Kreuzfahrt fast zeitlos, ganz anders als die großen Flussschiffe neuer Generation.",
  },
  "nile-cruise-or-luxury-dahabiya-which-one-to-choose": {
    title: "Nilkreuzfahrt oder Dahabiya: was wählen in Ägypten?",
    excerpt:
      "Entdecken Sie die Wunder des Nils, von den Leistungen alter Kulturen bis zur Schönheit der Natur, und den Unterschied zwischen einer klassischen Kreuzfahrt und einer Dahabiya. Für eine authentische Reise ohne Gedränge ist die Hathor Luxury Dahabiya die perfekte Wahl: Stil, Tradition und Entspannung auf dem Nil.",
  },
};
