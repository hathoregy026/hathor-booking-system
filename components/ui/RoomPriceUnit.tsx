import type { PublicLocale } from "@/lib/i18n/locale";
import { roomPriceUnit } from "@/lib/room-price-unit";
import styles from "./RoomPriceUnit.module.css";

export function RoomPriceUnit({ roomType, locale = "en" }: { roomType: string | null | undefined; locale?: PublicLocale }) {
  return <span className={styles.unit}>{roomPriceUnit(roomType, locale)}</span>;
}
