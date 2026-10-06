import { roomPriceUnit } from "@/lib/room-price-unit";
import styles from "./RoomPriceUnit.module.css";

export function RoomPriceUnit({ roomType }: { roomType: string | null | undefined }) {
  return <span className={styles.unit}>{roomPriceUnit(roomType)}</span>;
}
