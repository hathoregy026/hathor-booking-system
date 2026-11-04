/** The Contact page and its enquiry form in Russian; see contact-copy.ts. */
import type { ContactCopy, InquiryFormCopy } from "@/lib/i18n/contact-copy";

export const CONTACT_COPY_RU: ContactCopy = {
  runLabel: "Связаться с отделом бронирования Hathor",
  navLabel: "Разделы страницы",
  nav: { write: "Написать", reach: "Контакты", hours: "Часы работы", cruises: "Круизы" },
  eyebrow: "Контакты",
  scroll: "Листайте",
  alts: {
    hero: "Бронирование Hathor и путешествие по Нилу",
    boat: "Hathor Dahabiya на Ниле",
    royal: "Люкс Royal Suite на борту Hathor Dahabiya",
    sailing: "Плавание по Нилу на борту Hathor",
    life: "Жизнь на борту Hathor Dahabiya",
    card: "Hathor Dahabiya на Ниле",
  },
  aboard: "На борту",
  route: "Луксор — Асуан",
  manifestoEyebrow: "Линия открыта",
  manifesto: ["Личная линия,", "приглашающая вас", "в путь по Нилу"],
  reachEyebrow: "Как с нами связаться",
  reachIntro: "Четыре способа начать разговор с нашим отделом бронирования в Каире.",
  channels: [
    { word: "Визит", label: "Адрес компании", meta: "Офис в Каире" },
    { word: "Звонок", label: "Горячая линия", meta: "Прямая линия", cta: "Позвонить" },
    { word: "Письмо", label: "Электронная почта", meta: "Бронирование", cta: "Написать нам" },
    {
      word: "Сообщение",
      label: "WhatsApp",
      meta: "Мгновенно",
      value: "Напишите нам в WhatsApp",
      cta: "WhatsApp",
    },
  ],
  address: "One Kattamiya, Tower 211, 11-й этаж, кв. 111, Ring Road, Каир, Египет",
  hoursLabel: "Часы работы",
  hoursZone: "Каир · EET",
  workingHours: "Часы работы: ежедневно 09:00–17:00",
  dayOff: "Выходной: пятница",
  nextEyebrow: "Далее",
  nextTitle: "Напишите нам",
  writeEyebrow: "Написать",
  composeTitle: "Ваше сообщение",
  submit: "Отправить сообщение",
  cardTag: "Бронирование",
  cardTitle: "Переписка",
  cardOffice: "Офис в Каире · ежедневно 09:00–17:00",
  call: "Позвонить",
  bookNow: "Забронировать",
};

export const INQUIRY_FORM_COPY_RU: InquiryFormCopy = {
  close: "Закрыть сообщение с благодарностью",
  sentEyebrow: "Сообщение отправлено",
  thanks: "Спасибо",
  sentBody:
    "Ваше сообщение поступило в наш отдел бронирования. Письмо с подтверждением скоро придет на указанный вами адрес.",
  respond: "Наша команда ответит вам в течение 24 часов.",
  again: "Отправить еще одно сообщение",
  thanksCard: "Спасибо",
  receivedBody:
    "Ваше сообщение получено. Наш отдел бронирования ответит вам в течение 24 часов.",
  selectionLabel: "Ваш выбор",
  selectionTitle: "Ваше путешествие на Hathor",
  selectionNote:
    "Отправляется вместе с вашим сообщением. Изменить выбор можно в любой момент в разделе «Мое путешествие».",
  name: "Имя",
  email: "Электронная почта",
  phone: "Телефон",
  address: "Адрес",
  checkIn: "Дата посадки",
  adults: "Взрослые",
  children: "Дети",
  message: "Сообщение",
  sending: "Отправка…",
  sendMessage: "Отправить сообщение",
  unableToSend: "Не удалось отправить сообщение.",
  securityCheck: "Пройдите проверку безопасности перед отправкой.",
  verificationUnavailable:
    "Проверка безопасности недоступна. Обновите страницу или свяжитесь с нашим отделом бронирования напрямую.",
  website: "Сайт",
  // Read by the reservations team, who work in English.
  languageNote: "Guest language: Russian",
};

/** What /api/contact can say to a guest, by its English wording. */
export const INQUIRY_REFUSALS_RU: Record<string, string> = {
  "Please check your form and try again.": "Проверьте данные в форме и попробуйте еще раз.",
  "Too many messages. Please wait and try again.":
    "Слишком много сообщений. Подождите немного и попробуйте еще раз.",
  "Unable to send your message. Please try again later.":
    "Не удалось отправить ваше сообщение. Попробуйте еще раз позже.",
  "Security verification is unavailable. Please contact our reservations team directly.":
    "Проверка безопасности недоступна. Свяжитесь с нашим отделом бронирования напрямую.",
  "Please complete the security check and try again.":
    "Пройдите проверку безопасности и попробуйте еще раз.",
  "The security check is temporarily unavailable. Please try again.":
    "Проверка безопасности временно недоступна. Попробуйте еще раз.",
  "The security check expired or could not be verified. Please try again.":
    "Срок проверки безопасности истек, или ее не удалось подтвердить. Попробуйте еще раз.",
};
