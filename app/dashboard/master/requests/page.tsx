"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  DashboardChatWindow,
  type DashboardChatMessage,
  type DashboardConversation,
} from "@/components/dashboard/dashboard-chat";
import { DashboardCard, EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/dashboard/dashboard-ui";
import { MasterDashboardShell } from "@/components/dashboard/master-dashboard-shell";
import type { AuthSession } from "@/lib/auth-storage";
import {
  claimServiceRequest,
  getChatConversation,
  listChats,
  listClaimedServiceRequests,
  listOpenServiceRequests,
  listRegions,
  sendChatMessage,
  type ChatConversationDetail,
  type ChatMessage,
  type ChatConversationSummary,
  type Region,
  type ServiceRequest,
} from "@/lib/dashboard-api";
import { getChatSocket, type ChatSocketMessageEvent } from "@/lib/chat-socket";
import { formatDateTime, formatRequestBudget } from "@/lib/format";

export default function MasterRequestsPage() {
  return (
    <MasterDashboardShell
      title="Requests"
      description="Mijozlar yuborgan ochiq so'rovlarni ko'ring, qabul qiling va platforma ichida suhbatni boshlang."
    >
      {(session) => <MasterRequestsContent session={session} />}
    </MasterDashboardShell>
  );
}

function MasterRequestsContent({ session }: { session: AuthSession }) {
  const [openRequests, setOpenRequests] = useState<ServiceRequest[]>([]);
  const [claimedRequests, setClaimedRequests] = useState<ServiceRequest[]>([]);
  const [conversations, setConversations] = useState<ChatConversationSummary[]>([]);
  const [selectedConversationDetail, setSelectedConversationDetail] = useState<ChatConversationDetail | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");
  const [selectedClaimedId, setSelectedClaimedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [pageError, setPageError] = useState("");
  const [sendError, setSendError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState("");
  const selectedConversationIdRef = useRef("");
  const previousConversationIdRef = useRef("");
  const conversationIdsRef = useRef<string[]>([]);

  async function refreshChats(preferredRequestId?: string) {
    const chatItems = await listChats(session.accessToken);
    setConversations(chatItems);

    if (preferredRequestId) {
      setSelectedClaimedId(preferredRequestId);
    }
  }

  async function loadPageData(preferredRequestId?: string) {
    try {
      setLoading(true);
      setPageError("");
      const [openResponse, claimedResponse, chatItems] = await Promise.all([
        listOpenServiceRequests(session.accessToken, {
          limit: 20,
          city: city || undefined,
          search: search || undefined,
        }),
        listClaimedServiceRequests(session.accessToken, { limit: 10 }),
        listChats(session.accessToken),
      ]);

      setOpenRequests(openResponse.items);
      setClaimedRequests(claimedResponse.items);
      setConversations(chatItems);
      setSelectedClaimedId((current) => {
        const nextId =
          preferredRequestId ||
          current ||
          claimedResponse.items[0]?.id ||
          "";

        return claimedResponse.items.some((request) => request.id === nextId)
          ? nextId
          : claimedResponse.items[0]?.id || "";
      });

      if (!claimedResponse.items.length) {
        setSelectedConversationDetail(null);
      }
    } catch (loadError) {
      console.error("Master requests page load failed", loadError);
      setPageError(loadError instanceof Error ? loadError.message : "So'rovlar yuklanmadi.");
    } finally {
      setLoading(false);
    }
  }

  async function loadConversationDetail(conversationId: string) {
    try {
      setDetailLoading(true);
      setPageError("");
      const detail = await getChatConversation(session.accessToken, conversationId);
      setSelectedConversationDetail(detail);
    } catch (loadError) {
      console.error("Master request chat detail load failed", loadError);
      setSelectedConversationDetail(null);
      setPageError(loadError instanceof Error ? loadError.message : "Chat tafsiloti yuklanmadi.");
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    conversationIdsRef.current = conversations.map((conversation) => conversation.id);
  }, [conversations]);

  useEffect(() => {
    let cancelled = false;

    async function loadRegions() {
      try {
        const regionItems = await listRegions({ limit: 100 });
        if (!cancelled) {
          setRegions(regionItems);
        }
      } catch {
        if (!cancelled) {
          setRegions([]);
        }
      }
    }

    void loadRegions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void loadPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.accessToken]);

  const selectedClaimedRequest = useMemo(
    () =>
      claimedRequests.find((request) => request.id === selectedClaimedId) ??
      claimedRequests[0] ??
      null,
    [claimedRequests, selectedClaimedId],
  );
  const selectedConversationSummary = useMemo(
    () =>
      selectedClaimedRequest
        ? conversations.find((conversation) => conversation.requestId === selectedClaimedRequest.id) ?? null
        : null,
    [conversations, selectedClaimedRequest],
  );

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationSummary?.id ?? "";
  }, [selectedConversationSummary?.id]);

  useEffect(() => {
    if (!selectedConversationSummary?.id) {
      setSelectedConversationDetail(null);
      return;
    }

    void loadConversationDetail(selectedConversationSummary.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversationSummary?.id, session.accessToken]);

  useEffect(() => {
    const socket = getChatSocket(session.accessToken);

    function handleSocketMessage(event: ChatSocketMessageEvent) {
      const isKnownConversation = conversationIdsRef.current.includes(event.conversationId);

      setConversations((current) =>
        upsertConversationSummary(current, event.conversationId, event.message),
      );

      if (selectedConversationIdRef.current === event.conversationId) {
        setSelectedConversationDetail((current) =>
          upsertConversationDetailMessage(current, event.conversationId, event.message),
        );
      } else if (!isKnownConversation) {
        void refreshChats(selectedClaimedRequest?.id);
      }
    }

    function handleConnectError(error: Error) {
      console.error("Master request chat socket connection failed", error);
      setPageError(error.message || "Chat soketiga ulanib bo'lmadi.");
    }

    socket.on("message:new", handleSocketMessage);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("message:new", handleSocketMessage);
      socket.off("connect_error", handleConnectError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.accessToken, selectedClaimedRequest?.id]);

  useEffect(() => {
    const socket = getChatSocket(session.accessToken);
    const previousConversationId = previousConversationIdRef.current;

    function joinConversationRoom() {
      if (!selectedConversationSummary?.id) {
        return;
      }

      socket.emit(
        "conversation:join",
        { conversationId: selectedConversationSummary.id },
        (response?: { ok?: boolean; message?: string }) => {
          if (!response?.ok) {
            setPageError(response?.message || "Chat xonasiga ulanib bo'lmadi.");
          }
        },
      );
    }

    if (previousConversationId && previousConversationId !== selectedConversationSummary?.id) {
      socket.emit("conversation:leave", { conversationId: previousConversationId });
    }

    joinConversationRoom();
    previousConversationIdRef.current = selectedConversationSummary?.id ?? "";
    socket.on("connect", joinConversationRoom);

    return () => {
      socket.off("connect", joinConversationRoom);

      if (selectedConversationSummary?.id) {
        socket.emit("conversation:leave", {
          conversationId: selectedConversationSummary.id,
        });
      }
    };
  }, [selectedConversationSummary?.id, session.accessToken]);

  const displayConversation = selectedClaimedRequest
    ? toDisplayConversation(selectedClaimedRequest, selectedConversationSummary)
    : null;
  const displayMessages: DashboardChatMessage[] = selectedConversationDetail
    ? selectedConversationDetail.messages.map((message) => toDisplayMessage(message, session.user.id))
    : [];

  async function handleClaim(requestId: string) {
    try {
      setBusyId(requestId);
      setPageError("");
      setSuccess("");
      await claimServiceRequest(session.accessToken, requestId);
      setSuccess("So'rov qabul qilindi. Chat avtomatik yaratildi va mijoz bilan yozishishingiz mumkin.");
      await loadPageData(requestId);
    } catch (claimError) {
      console.error("Claim request failed", claimError);
      setPageError(claimError instanceof Error ? claimError.message : "So'rov qabul qilinmadi.");
    } finally {
      setBusyId("");
    }
  }

  async function handleSendMessage(text: string) {
    if (!selectedConversationSummary?.id) {
      setSendError("Bu so'rov uchun chat hali tayyor emas.");
      return false;
    }

    try {
      setSending(true);
      setSendError("");
      const createdMessage = await sendChatMessage(session.accessToken, selectedConversationSummary.id, { text });
      setSelectedConversationDetail((current) =>
        upsertConversationDetailMessage(current, selectedConversationSummary.id, createdMessage),
      );
      setConversations((current) =>
        upsertConversationSummary(current, selectedConversationSummary.id, createdMessage),
      );
      return true;
    } catch (sendError) {
      console.error("Master request chat send failed", sendError);
      setSendError(sendError instanceof Error ? sendError.message : "Xabar yuborilmadi.");
      return false;
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.98fr)_minmax(420px,1.02fr)]">
      <div className="grid gap-5">
        <DashboardCard className="min-w-0">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <div className="grid gap-2">
              <label className="text-sm font-bold text-[var(--navy)]">Qidiruv</label>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="auth-input"
                placeholder="Sarlavha, tavsif yoki kategoriya"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-bold text-[var(--navy)]">Viloyat</label>
              <select value={city} onChange={(event) => setCity(event.target.value)} className="auth-input">
                <option value="">Barcha viloyatlar</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.nameUz}>
                    {region.nameUz}
                  </option>
                ))}
              </select>
            </div>

            <button type="button" className="button-primary self-end cursor-pointer text-sm" onClick={() => void loadPageData()}>
              Filtrlash
            </button>
          </div>

          {pageError ? <div className="mt-4"><ErrorState message={pageError} /></div> : null}
          {success ? (
            <div className="mt-4 rounded-[1.2rem] border border-[rgba(45,143,139,0.22)] bg-[rgba(237,250,248,0.92)] px-4 py-3 text-sm text-[var(--teal)]">
              {success}
            </div>
          ) : null}

          <div className="mt-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-[var(--navy)]">Ochiq so'rovlar</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Mos ishni qabul qiling.</p>
            </div>
          </div>

          {loading ? (
            <div className="mt-5">
              <LoadingState label="Ochiq so'rovlar yuklanmoqda..." />
            </div>
          ) : openRequests.length ? (
            <div className="mt-5 grid gap-4">
              {openRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  actionLabel={busyId === request.id ? "Qabul qilinmoqda..." : "So'rovni qabul qilish"}
                  actionDisabled={!!busyId}
                  onAction={() => void handleClaim(request.id)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState title="Ochiq so'rov topilmadi" description="Filtrlarni o'zgartirib ko'ring yoki keyinroq qayta kiring." />
            </div>
          )}
        </DashboardCard>

        <DashboardCard className="min-w-0">
          <h2 className="text-2xl font-bold text-[var(--navy)]">Qabul qilinganlar</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Suhbatni ochish uchun qabul qilingan so'rovni bosing.</p>

          {loading ? (
            <div className="mt-5">
              <LoadingState label="Ishlar yuklanmoqda..." />
            </div>
          ) : claimedRequests.length ? (
            <div className="mt-5 grid gap-3">
              {claimedRequests.map((request) => (
                <button
                  key={request.id}
                  type="button"
                  onClick={() => setSelectedClaimedId(request.id)}
                  className={`rounded-[1.4rem] border text-left transition ${
                    selectedClaimedRequest?.id === request.id
                      ? "border-[rgba(45,143,139,0.35)] bg-[rgba(237,250,248,0.82)]"
                      : "border-[var(--border)] bg-white/72 hover:bg-white"
                  }`}
                >
                  <RequestCard request={request} compact borderless />
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState title="Hali ish yo'q" description="Mos kelgan ochiq so'rovni qabul qilganingizda shu yerda ko'rinadi." />
            </div>
          )}
        </DashboardCard>
      </div>

      <DashboardCard className="min-w-0 overflow-hidden p-0">
        <div className="px-5 py-5">
          <h2 className="text-2xl font-bold text-[var(--navy)]">Tafsilot va chat</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Qabul qilingan so'rov bo'yicha mijoz bilan shu yerda kelishing.
          </p>
        </div>

        <DashboardChatWindow
          conversation={displayConversation}
          messages={displayMessages}
          details={
            detailLoading ? (
              <LoadingState label="Chat yuklanmoqda..." />
            ) : selectedClaimedRequest ? (
              <RequestChatDetails request={selectedClaimedRequest} />
            ) : undefined
          }
          emptyTitle="Qabul qilingan so'rov tanlanmagan"
          emptyDescription="So'rovni qabul qiling yoki chapdagi qabul qilingan ishni tanlang."
          onSend={selectedConversationSummary ? handleSendMessage : undefined}
          sending={sending}
          sendError={sendError}
          sendDisabledReason={
            selectedClaimedRequest && !selectedConversationSummary
              ? "Bu eski claimed request uchun chat hozir tayyorlanmoqda. Bir necha soniyada qayta urinib ko'ring."
              : ""
          }
        />
      </DashboardCard>
    </div>
  );
}

function upsertConversationDetailMessage(
  conversation: ChatConversationDetail | null,
  conversationId: string,
  message: ChatMessage,
) {
  if (!conversation || conversation.id !== conversationId) {
    return conversation;
  }

  const alreadyExists = conversation.messages.some((entry) => entry.id === message.id);

  if (alreadyExists) {
    return conversation;
  }

  return {
    ...conversation,
    lastActivityAt: message.createdAt,
    lastMessage: message,
    messages: [...conversation.messages, message],
  };
}

function upsertConversationSummary(
  conversations: ChatConversationSummary[],
  conversationId: string,
  message: ChatMessage,
) {
  const existing = conversations.find((conversation) => conversation.id === conversationId);

  if (!existing) {
    return conversations;
  }

  const nextItems = conversations.map((conversation) =>
    conversation.id === conversationId
      ? {
          ...conversation,
          lastActivityAt: message.createdAt,
          lastMessage: message,
        }
      : conversation,
  );

  return nextItems.sort(
    (left, right) =>
      new Date(right.lastActivityAt).getTime() -
      new Date(left.lastActivityAt).getTime(),
  );
}

function RequestCard({
  request,
  compact,
  borderless,
  actionLabel,
  actionDisabled,
  onAction,
}: {
  request: ServiceRequest;
  compact?: boolean;
  borderless?: boolean;
  actionLabel?: string;
  actionDisabled?: boolean;
  onAction?: () => void;
}) {
  return (
    <div className={`${borderless ? "" : "rounded-[1.4rem] border border-[var(--border)] bg-white/72"} p-4`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--navy)]">{request.title}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {request.category} - {request.city}
          </p>
          <p className="mt-2 text-sm font-medium text-[var(--navy-soft)]">
            {formatRequestBudget(request.budgetMin, request.budgetMax)}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {!compact ? (
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--muted)]">{request.description}</p>
      ) : null}

      {request.images.length && !compact ? (
        <div className="mt-3 flex gap-3">
          {request.images.slice(0, 2).map((imageUrl) => (
            <img key={imageUrl} src={imageUrl} alt="" className="h-20 w-20 rounded-[1rem] object-cover" />
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
          {formatDateTime(request.createdAt)}
        </p>
        {onAction ? (
          <button
            type="button"
            className="button-primary cursor-pointer text-sm"
            disabled={actionDisabled}
            onClick={onAction}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function RequestChatDetails({ request }: { request: ServiceRequest }) {
  return (
    <div className="grid gap-3 rounded-[1.4rem] border border-[var(--border)] bg-white/82 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-[var(--navy)]">{request.title}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {request.category} - {request.city}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <p className="text-sm leading-7 text-[var(--navy-soft)]">{request.description}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Meta label="Byudjet" value={formatRequestBudget(request.budgetMin, request.budgetMax)} />
        <Meta label="Yaratilgan" value={formatDateTime(request.createdAt)} />
        <Meta label="Manzil" value={request.addressText || "Aniqlashtiriladi"} />
        <Meta label="Mijoz" value={request.user.fullName} />
      </div>

      <div className="rounded-[1.2rem] border border-[var(--border)] bg-[rgba(255,250,242,0.72)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Mijoz ma'lumoti</p>
        <div className="mt-3 flex items-center gap-3">
          {request.user.avatarUrl ? (
            <img src={request.user.avatarUrl} alt="" className="h-12 w-12 rounded-[1rem] object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white text-sm font-bold text-[var(--navy)]">
              {request.user.fullName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-bold text-[var(--navy)]">{request.user.fullName}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{request.user.phone || "Telefon ko'rsatilmagan"}</p>
          </div>
        </div>
      </div>

      {request.images.length ? (
        <div className="flex gap-3">
          {request.images.slice(0, 2).map((imageUrl) => (
            <img key={imageUrl} src={imageUrl} alt="" className="h-20 w-20 rounded-[1rem] object-cover" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.1rem] border border-[var(--border)] bg-[rgba(255,250,242,0.72)] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-sm font-bold text-[var(--navy)]">{value}</p>
    </div>
  );
}

function toDisplayConversation(
  request: ServiceRequest,
  conversation: ChatConversationSummary | null,
): DashboardConversation {
  return {
    id: conversation?.id || request.id,
    title: request.title,
    subtitle: `${request.category} - ${request.city}`,
    participantName: request.user.fullName,
    avatarUrl: request.user.avatarUrl,
    lastMessage: conversation?.lastMessage?.text || "Suhbat boshlandi. Birinchi xabarni yuboring.",
    updatedAt: formatDateTime(conversation?.lastActivityAt || request.claimedAt || request.updatedAt),
    status: request.status,
  };
}

function toDisplayMessage(
  message: ChatConversationDetail["messages"][number],
  currentUserId: string,
): DashboardChatMessage {
  return {
    id: message.id,
    conversationId: message.id,
    author: message.senderId === currentUserId ? "me" : "them",
    authorName: message.sender.fullName,
    text: message.text,
    createdAt: formatDateTime(message.createdAt),
  };
}
