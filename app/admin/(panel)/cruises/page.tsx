"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { ActionButton } from "@/components/admin/ActionButton";
import { useToast } from "@/components/admin/ToastProvider";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { getPermanentDeleteDate } from "@/lib/booking-retention";
import { adminFetch, isTransientFetchError } from "@/lib/admin-fetch";
import { formatPrice } from "@/lib/client-dates";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Room = {
  id: string;
  name: string;
  roomNumber: string | null;
  roomType: string | null;
  priceMultiplier: number;
  capacity: number;
  description: string | null;
  deletedAt: string | null;
};

type Cruise = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  basePriceCents: number;
  ports: string | null;
  deletedAt: string | null;
  rooms: Room[];
};

type DeletedOrphanRoom = Room & {
  cruise: { id: string; name: string };
};

type ViewMode = "active" | "bin";
type BinAction = "soft-delete" | "restore" | "purge";

function cruiseKey(id: string) {
  return `cruise:${id}`;
}

function roomKey(id: string) {
  return `room:${id}`;
}

export default function AdminCruisesPage() {
  const { showToast } = useToast();
  const [cruises, setCruises] = useState<Cruise[]>([]);
  const [deletedRooms, setDeletedRooms] = useState<DeletedOrphanRoom[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("active");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [savingCruiseId, setSavingCruiseId] = useState<string | null>(null);
  const [savingRoomId, setSavingRoomId] = useState<string | null>(null);
  const [isCreatingCruise, setIsCreatingCruise] = useState(false);
  const [isBulkWorking, setIsBulkWorking] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const [newCruise, setNewCruise] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    basePriceCents: 0,
    ports: "",
  });

  const switchViewMode = (mode: ViewMode) => {
    loadIdRef.current += 1;
    setViewMode(mode);
  };

  const loadIdRef = useRef(0);

  const loadCruises = useCallback(
    async (options?: {
      silent?: boolean;
      attempt?: number;
      loadId?: number;
    }) => {
      const loadId = options?.loadId ?? ++loadIdRef.current;
      const attempt = options?.attempt ?? 0;
      const silent = options?.silent ?? false;

      if (!silent && attempt === 0) {
        setIsLoading(true);
      }
      if (attempt === 0) setLoadFailed(false);

      try {
        const params = new URLSearchParams({
          bin: viewMode === "bin" ? "true" : "false",
        });
        const response = await adminFetch(
          `/api/admin/cruises?${params.toString()}`,
        );
        if (loadId !== loadIdRef.current) return;

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load cruises");
        }

        setCruises(data.cruises);
        setDeletedRooms(data.deletedRooms ?? []);
        setSelectedKeys(new Set());
        setLoadFailed(false);
      } catch (err) {
        if (loadId !== loadIdRef.current) return;

        if (attempt < 1 && isTransientFetchError(err)) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          return loadCruises({
            silent,
            attempt: attempt + 1,
            loadId,
          });
        }

        setLoadFailed(true);
        showToast(
          "error",
          err instanceof Error ? err.message : "Failed to load cruises",
        );
      } finally {
        if (loadId === loadIdRef.current && !silent) {
          setIsLoading(false);
        }
      }
    },
    [showToast, viewMode],
  );

  useEffect(() => {
    loadCruises();
  }, [loadCruises]);

  const visibleKeys = useMemo(() => {
    const keys: string[] = [];
    for (const cruise of cruises) {
      keys.push(cruiseKey(cruise.id));
      for (const room of cruise.rooms) {
        keys.push(roomKey(room.id));
      }
    }
    if (viewMode === "bin") {
      for (const room of deletedRooms) {
        keys.push(roomKey(room.id));
      }
    }
    return keys;
  }, [cruises, deletedRooms, viewMode]);

  const allSelected =
    visibleKeys.length > 0 &&
    visibleKeys.every((key) => selectedKeys.has(key));
  const someSelected = selectedKeys.size > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedKeys(new Set());
      return;
    }
    setSelectedKeys(new Set(visibleKeys));
  };

  const toggleSelect = (key: string) => {
    setSelectedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const runBinAction = async (
    action: BinAction,
    cruiseIds: string[],
    roomIds: string[],
    confirmMessage?: string,
  ) => {
    if (cruiseIds.length === 0 && roomIds.length === 0) {
      showToast("error", "Select at least one cruise or room");
      return;
    }

    if (confirmMessage && !window.confirm(confirmMessage)) return;

    setIsBulkWorking(true);
    try {
      let cruiseCount = 0;
      let roomCount = 0;
      let skipped = 0;

      if (cruiseIds.length > 0) {
        const response = await fetch("/api/admin/cruises", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ids: cruiseIds }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Cruise action failed");
        cruiseCount = data.updated ?? data.deleted ?? 0;
        skipped += data.skipped ?? 0;
      }

      if (roomIds.length > 0) {
        const response = await fetch("/api/admin/rooms", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ids: roomIds }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Room action failed");
        roomCount = data.updated ?? data.deleted ?? 0;
        skipped += data.skipped ?? 0;
      }

      const parts: string[] = [];
      if (cruiseCount > 0) parts.push(`${cruiseCount} cruise(s)`);
      if (roomCount > 0) parts.push(`${roomCount} room(s)`);

      if (parts.length === 0) {
        throw new Error(
          skipped > 0
            ? "No items were changed. Selected items may already be deleted or linked to bookings."
            : "No items were changed. Please refresh and try again.",
        );
      }

      const messages: Record<BinAction, string> = {
        "soft-delete": `${parts.join(" and ")} moved to recycle bin`,
        restore: `${parts.join(" and ")} restored`,
        purge: `${parts.join(" and ")} permanently deleted`,
      };

      let message = messages[action];
      if (skipped > 0) {
        message += ` (${skipped} skipped — linked to existing bookings)`;
      }
      showToast("success", message);

      if (action === "soft-delete" && viewMode === "active" && cruiseIds.length > 0) {
        const removedCruises = new Set(cruiseIds);
        setCruises((current) =>
          current.filter((cruise) => !removedCruises.has(cruise.id)),
        );
      }

      await loadCruises({ silent: true });
    } catch (err) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Action failed",
      );
    } finally {
      setIsBulkWorking(false);
    }
  };

  const runBulkAction = (action: BinAction, confirmMessage?: string) => {
    const cruiseIds: string[] = [];
    const roomIds: string[] = [];

    for (const key of selectedKeys) {
      if (key.startsWith("cruise:")) {
        cruiseIds.push(key.slice("cruise:".length));
      } else if (key.startsWith("room:")) {
        roomIds.push(key.slice("room:".length));
      }
    }

    return runBinAction(action, cruiseIds, roomIds, confirmMessage);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    setNewCruise((current) => ({
      ...current,
      name,
      ...(slugManuallyEdited ? {} : { slug: generateSlug(name) }),
    }));
  };

  const handleSlugChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setNewCruise((current) => ({
      ...current,
      slug: event.target.value,
    }));
  };

  const updateCruiseField = (
    cruiseId: string,
    field: keyof Cruise,
    value: string | number,
  ) => {
    setCruises((current) =>
      current.map((cruise) =>
        cruise.id === cruiseId ? { ...cruise, [field]: value } : cruise,
      ),
    );
  };

  const updateRoomField = (
    cruiseId: string,
    roomId: string,
    field: keyof Room,
    value: string | number,
  ) => {
    setCruises((current) =>
      current.map((cruise) =>
        cruise.id === cruiseId
          ? {
              ...cruise,
              rooms: cruise.rooms.map((room) =>
                room.id === roomId ? { ...room, [field]: value } : room,
              ),
            }
          : cruise,
      ),
    );
  };

  const saveCruise = async (cruise: Cruise) => {
    setSavingCruiseId(cruise.id);
    try {
      const response = await fetch(`/api/admin/cruises/${cruise.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cruise.name,
          description: cruise.description,
          imageUrl: cruise.imageUrl,
          basePriceCents: cruise.basePriceCents,
          ports: cruise.ports,
        }),
      });
      if (!response.ok) throw new Error("Save failed");
      showToast("success", "Cruise updated");
    } catch {
      showToast("error", "Failed to save cruise");
    } finally {
      setSavingCruiseId(null);
    }
  };

  const saveRoom = async (room: Room) => {
    setSavingRoomId(room.id);
    try {
      const response = await fetch(`/api/admin/rooms/${room.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(room),
      });
      if (!response.ok) throw new Error("Save failed");
      showToast("success", "Room updated");
    } catch {
      showToast("error", "Failed to save room");
    } finally {
      setSavingRoomId(null);
    }
  };

  const createCruise = async () => {
    setIsCreatingCruise(true);
    try {
      const response = await fetch("/api/admin/cruises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCruise),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Create failed");
      }
      setSlugManuallyEdited(false);
      setNewCruise({
        name: "",
        slug: "",
        description: "",
        imageUrl: "",
        basePriceCents: 0,
        ports: "",
      });
      await loadCruises();
      showToast("success", "Cruise created");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create cruise";
      showToast("error", message);
    } finally {
      setIsCreatingCruise(false);
    }
  };

  const addRoom = async (cruiseId: string) => {
    try {
      const response = await fetch(`/api/admin/cruises/${cruiseId}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New Room",
          roomNumber: "",
          roomType: "Standard",
          priceMultiplier: 1,
          capacity: 2,
        }),
      });
      if (!response.ok) throw new Error("Create failed");
      await loadCruises();
      setExpandedId(cruiseId);
      showToast("success", "Room added");
    } catch {
      showToast("error", "Failed to add room");
    }
  };

  const renderPurgeCountdown = (deletedAt: string | null) => {
    if (!deletedAt) return "—";
    const purgeDate = getPermanentDeleteDate(parseISO(deletedAt));
    return (
      <span title={format(purgeDate, "MMM d, yyyy HH:mm")}>
        {formatDistanceToNow(purgeDate, { addSuffix: true })}
      </span>
    );
  };

  const binCount =
    cruises.length +
    (viewMode === "bin" ? deletedRooms.length : 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => switchViewMode("active")}
            className={`admin-filter-tab ${
              viewMode === "active" ? "admin-filter-tab--active" : ""
            }`}
          >
            Active cruises
          </button>
          <button
            type="button"
            onClick={() => switchViewMode("bin")}
            className={`admin-filter-tab ${
              viewMode === "bin"
                ? "admin-filter-tab--danger-active"
                : "admin-filter-tab--danger"
            }`}
          >
            Recycle Bin
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionButton
            variant="outline"
            onClick={toggleSelectAll}
            disabled={isLoading || visibleKeys.length === 0}
            className="w-full px-4 py-2.5 text-sm sm:w-auto"
          >
            {allSelected ? "Deselect all" : "Select all"}
          </ActionButton>

          {viewMode === "active" ? (
            <ActionButton
              variant="outline"
              icon={Trash2}
              onClick={() =>
                runBulkAction(
                  "soft-delete",
                  `Move selected cruises and rooms to the recycle bin? They will be permanently deleted after 7 days.`,
                )
              }
              disabled={!someSelected || isBulkWorking}
              className="w-full px-4 py-2.5 text-sm sm:w-auto"
            >
              {isBulkWorking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Move to bin"
              )}
            </ActionButton>
          ) : (
            <>
              <ActionButton
                variant="outline"
                icon={RotateCcw}
                onClick={() => runBulkAction("restore")}
                disabled={!someSelected || isBulkWorking}
                className="w-full px-4 py-2.5 text-sm sm:w-auto"
              >
                Restore
              </ActionButton>
              <ActionButton
                onClick={() =>
                  runBulkAction(
                    "purge",
                    "Permanently delete selected items? This cannot be undone. Items with booking history will be skipped.",
                  )
                }
                disabled={!someSelected || isBulkWorking}
                className="px-4 py-2 text-sm [background:var(--danger)] hover:opacity-90"
              >
                Delete permanently
              </ActionButton>
            </>
          )}

          <ActionButton
            variant="outline"
            onClick={() => loadCruises()}
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm sm:w-auto"
          >
            Refresh
          </ActionButton>
        </div>
      </div>

      {viewMode === "bin" && (
        <p
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: "color-mix(in srgb, var(--warning) 12%, transparent)",
            color: "var(--text-secondary)",
            border: "1px solid color-mix(in srgb, var(--warning) 30%, transparent)",
          }}
        >
          Deleted cruises and rooms stay here for 7 days, then are removed
          automatically. Items linked to bookings cannot be permanently deleted
          until those bookings are removed.
        </p>
      )}

      {viewMode === "active" && (
        <div className="admin-card p-4 sm:p-6">
          <h2 className="admin-heading text-sm">Add New Cruise</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span
                className="mb-1 block font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Name
              </span>
              <input
                value={newCruise.name}
                onChange={handleNameChange}
                placeholder="Cruise name"
                className="admin-input w-full px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span
                className="mb-1 block font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Slug{" "}
                <span
                  className="font-normal"
                  style={{ color: "var(--text-secondary)" }}
                >
                  (optional)
                </span>
              </span>
              <input
                value={newCruise.slug}
                onChange={handleSlugChange}
                placeholder="nile-sunset-cruise"
                className="admin-input w-full px-3 py-2 text-sm font-mono"
              />
            </label>
            <input
              value={newCruise.ports}
              onChange={(event) =>
                setNewCruise((current) => ({
                  ...current,
                  ports: event.target.value,
                }))
              }
              placeholder="Ports (e.g. Luxor, Aswan)"
              className="admin-input rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="number"
              value={newCruise.basePriceCents}
              onChange={(event) =>
                setNewCruise((current) => ({
                  ...current,
                  basePriceCents: Number(event.target.value),
                }))
              }
              placeholder="Base price (cents)"
              className="admin-input rounded-lg px-3 py-2 text-sm"
            />
            <input
              value={newCruise.description}
              onChange={(event) =>
                setNewCruise((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Description"
              className="admin-input rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={createCruise}
            disabled={isCreatingCruise || !newCruise.name.trim()}
            className="admin-btn-primary mt-4 flex w-full items-center justify-center gap-2 px-4 py-3 text-sm disabled:opacity-60 sm:w-auto"
          >
            {isCreatingCruise ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Plus className="h-4 w-4" aria-hidden />
            )}
            Create Cruise
          </button>
        </div>
      )}

      {isLoading ? (
        <div
          className="flex items-center justify-center gap-2 py-16"
          style={{ color: "var(--text-secondary)" }}
        >
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          Loading cruises...
        </div>
      ) : loadFailed ? (
        <div className="admin-card flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Could not load cruises. The database connection may have timed out, or
            the dev server needs a restart after the recent schema update.
          </p>
          <ActionButton onClick={() => loadCruises()} className="px-4 py-2 text-sm">
            Try again
          </ActionButton>
        </div>
      ) : binCount === 0 ? (
        <div
          className="admin-card py-16 text-center text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          {viewMode === "bin"
            ? "Recycle bin is empty."
            : "No active cruises yet. Create one above."}
        </div>
      ) : (
        <div className="space-y-3">
          {cruises.map((cruise) => {
            const isExpanded = expandedId === cruise.id;
            const cruiseSelectKey = cruiseKey(cruise.id);

            return (
              <div key={cruise.id} className="admin-card overflow-hidden">
                <div className="flex items-start gap-3 px-5 py-4">
                  <input
                    type="checkbox"
                    checked={selectedKeys.has(cruiseSelectKey)}
                    onChange={() => toggleSelect(cruiseSelectKey)}
                    aria-label={`Select ${cruise.name}`}
                    className="mt-1 h-4 w-4 shrink-0 rounded border"
                    style={{ accentColor: "var(--accent)" }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : cruise.id)
                    }
                    className="flex min-w-0 flex-1 items-center justify-between text-left transition-colors duration-200 hover:opacity-90"
                  >
                    <div>
                      <p className="admin-heading font-semibold">{cruise.name}</p>
                      <p className="admin-subheading text-sm">
                        {cruise.rooms.length} rooms · Base{" "}
                        {formatPrice(cruise.basePriceCents)}
                        {viewMode === "bin" && cruise.deletedAt && (
                          <>
                            {" "}
                            · Deletes{" "}
                            {renderPurgeCountdown(cruise.deletedAt)}
                          </>
                        )}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronDown
                        className="h-5 w-5 shrink-0"
                        style={{ color: "var(--text-secondary)" }}
                        aria-hidden
                      />
                    ) : (
                      <ChevronRight
                        className="h-5 w-5 shrink-0"
                        style={{ color: "var(--text-secondary)" }}
                        aria-hidden
                      />
                    )}
                  </button>
                  {viewMode === "active" && (
                    <ActionButton
                      variant="outline"
                      icon={Trash2}
                      onClick={() =>
                        runBinAction(
                          "soft-delete",
                          [cruise.id],
                          [],
                          `Move "${cruise.name}" and its rooms to the recycle bin?`,
                        )
                      }
                      disabled={isBulkWorking}
                      className="shrink-0 px-3 py-1.5 text-xs"
                    >
                      Delete
                    </ActionButton>
                  )}
                </div>

                {isExpanded && (
                  <div
                    className="px-5 py-5"
                    style={{
                      borderTop:
                        "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
                    }}
                  >
                    {viewMode === "active" ? (
                      <>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="block text-sm">
                            <span
                              className="mb-1 block font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              Name
                            </span>
                            <input
                              value={cruise.name}
                              onChange={(event) =>
                                updateCruiseField(
                                  cruise.id,
                                  "name",
                                  event.target.value,
                                )
                              }
                              className="admin-input w-full px-3 py-2"
                            />
                          </label>
                          <label className="block text-sm">
                            <span
                              className="mb-1 block font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              Base Price (cents)
                            </span>
                            <input
                              type="number"
                              value={cruise.basePriceCents}
                              onChange={(event) =>
                                updateCruiseField(
                                  cruise.id,
                                  "basePriceCents",
                                  Number(event.target.value),
                                )
                              }
                              className="admin-input w-full px-3 py-2"
                            />
                          </label>
                          <label className="block text-sm sm:col-span-2">
                            <span
                              className="mb-1 block font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              Ports
                            </span>
                            <input
                              value={cruise.ports ?? ""}
                              onChange={(event) =>
                                updateCruiseField(
                                  cruise.id,
                                  "ports",
                                  event.target.value,
                                )
                              }
                              className="admin-input w-full px-3 py-2"
                            />
                          </label>
                          <label className="block text-sm sm:col-span-2">
                            <span
                              className="mb-1 block font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              Description
                            </span>
                            <textarea
                              value={cruise.description ?? ""}
                              onChange={(event) =>
                                updateCruiseField(
                                  cruise.id,
                                  "description",
                                  event.target.value,
                                )
                              }
                              rows={2}
                              className="admin-input w-full px-3 py-2"
                            />
                          </label>
                          <div className="sm:col-span-2">
                            <ImageUpload
                              label="Cruise Image"
                              value={cruise.imageUrl}
                              onChange={(url) =>
                                updateCruiseField(cruise.id, "imageUrl", url)
                              }
                              folder="cruises"
                              helperText="Upload an image, then click Save Cruise."
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => saveCruise(cruise)}
                          disabled={savingCruiseId === cruise.id}
                          className="admin-btn-primary mt-4 flex w-full items-center justify-center gap-2 px-4 py-3 text-sm disabled:opacity-60 sm:w-auto"
                        >
                          {savingCruiseId === cruise.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          ) : (
                            <Save className="h-4 w-4" aria-hidden />
                          )}
                          Save Cruise
                        </button>
                      </>
                    ) : (
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Deleted {cruise.deletedAt ? format(parseISO(cruise.deletedAt), "MMM d, yyyy HH:mm") : "—"}
                        {" · "}
                        Permanent removal {renderPurgeCountdown(cruise.deletedAt)}
                      </p>
                    )}

                    <div
                      className="mt-6 pt-6"
                      style={{
                        borderTop:
                          "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
                      }}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="admin-heading text-sm">Rooms</h3>
                        {viewMode === "active" && (
                          <button
                            type="button"
                            onClick={() => addRoom(cruise.id)}
                            className="admin-btn-outline inline-flex items-center gap-1 px-3 py-1.5 text-xs"
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden />
                            Add Room
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {cruise.rooms.map((room) => (
                          <div
                            key={room.id}
                            className="admin-card rounded-lg p-4"
                          >
                            <div className="mb-3 flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={selectedKeys.has(roomKey(room.id))}
                                onChange={() => toggleSelect(roomKey(room.id))}
                                aria-label={`Select ${room.name}`}
                                className="mt-1 h-4 w-4 shrink-0 rounded border"
                                style={{ accentColor: "var(--accent)" }}
                              />
                              {viewMode === "bin" ? (
                                <div className="min-w-0 flex-1 text-sm">
                                  <p className="font-medium">{room.name}</p>
                                  <p style={{ color: "var(--text-secondary)" }}>
                                    {room.roomType ?? "—"} · capacity {room.capacity}
                                    {" · "}
                                    Deletes {renderPurgeCountdown(room.deletedAt)}
                                  </p>
                                </div>
                              ) : (
                                <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                  <input
                                    value={room.name}
                                    onChange={(event) =>
                                      updateRoomField(
                                        cruise.id,
                                        room.id,
                                        "name",
                                        event.target.value,
                                      )
                                    }
                                    placeholder="Room name"
                                    className="admin-input px-3 py-2 text-sm"
                                  />
                                  <input
                                    value={room.roomNumber ?? ""}
                                    onChange={(event) =>
                                      updateRoomField(
                                        cruise.id,
                                        room.id,
                                        "roomNumber",
                                        event.target.value,
                                      )
                                    }
                                    placeholder="Room number"
                                    className="admin-input px-3 py-2 text-sm"
                                  />
                                  <input
                                    value={room.roomType ?? ""}
                                    onChange={(event) =>
                                      updateRoomField(
                                        cruise.id,
                                        room.id,
                                        "roomType",
                                        event.target.value,
                                      )
                                    }
                                    placeholder="Room type"
                                    className="admin-input px-3 py-2 text-sm"
                                  />
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={room.priceMultiplier}
                                    onChange={(event) =>
                                      updateRoomField(
                                        cruise.id,
                                        room.id,
                                        "priceMultiplier",
                                        Number(event.target.value),
                                      )
                                    }
                                    placeholder="Price multiplier"
                                    className="admin-input px-3 py-2 text-sm"
                                  />
                                  <input
                                    type="number"
                                    value={room.capacity}
                                    onChange={(event) =>
                                      updateRoomField(
                                        cruise.id,
                                        room.id,
                                        "capacity",
                                        Number(event.target.value),
                                      )
                                    }
                                    placeholder="Capacity"
                                    className="admin-input px-3 py-2 text-sm"
                                  />
                                </div>
                              )}
                              {viewMode === "active" && (
                                <ActionButton
                                  variant="outline"
                                  icon={Trash2}
                                  onClick={() =>
                                    runBinAction(
                                      "soft-delete",
                                      [],
                                      [room.id],
                                      `Move "${room.name}" to the recycle bin?`,
                                    )
                                  }
                                  disabled={isBulkWorking}
                                  className="shrink-0 px-3 py-1.5 text-xs"
                                >
                                  Delete
                                </ActionButton>
                              )}
                            </div>
                            {viewMode === "active" && (
                              <button
                                type="button"
                                onClick={() => saveRoom(room)}
                                disabled={savingRoomId === room.id}
                                className="admin-btn-outline inline-flex items-center gap-2 px-3 py-1.5 text-xs disabled:opacity-60"
                              >
                                {savingRoomId === room.id ? (
                                  <Loader2
                                    className="h-3.5 w-3.5 animate-spin"
                                    aria-hidden
                                  />
                                ) : (
                                  <Save className="h-3.5 w-3.5" aria-hidden />
                                )}
                                Save Room
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {viewMode === "bin" && deletedRooms.length > 0 && (
            <div className="admin-card p-5">
              <h3 className="admin-heading text-sm">
                Deleted rooms (active cruises)
              </h3>
              <div className="mt-4 space-y-3">
                {deletedRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-start gap-3 rounded-lg p-4"
                    style={{
                      border:
                        "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedKeys.has(roomKey(room.id))}
                      onChange={() => toggleSelect(roomKey(room.id))}
                      aria-label={`Select ${room.name}`}
                      className="mt-1 h-4 w-4 shrink-0 rounded border"
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-medium">{room.name}</p>
                      <p style={{ color: "var(--text-secondary)" }}>
                        {room.cruise.name} · {room.roomType ?? "—"} · capacity{" "}
                        {room.capacity} · Deletes{" "}
                        {renderPurgeCountdown(room.deletedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
