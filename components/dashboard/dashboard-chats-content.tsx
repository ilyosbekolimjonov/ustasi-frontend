"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { AuthSession } from "@/lib/auth-storage";
import {
  getChatConversation,
  listChats,
  sendChatMessage,
  type ChatConversationDetail,
  type ChatMessage,
  type ChatConversationSummary,
} from "@/lib/dashboard-api";
import { formatDateTime, formatRequestBudget } from "@/lib/format";
import { getChatSocket, type ChatSocketMessageEvent } from "@/lib/chat-socket";

import {
  DashboardChatWorkspace,
  type DashboardChatMessage,
  type DashboardConversation,
} from "./dashboard-chat";
import { ErrorState, LoadingState, StatusBadge } from "./dashboard-ui";

type DashboardChatsContentProps = {
  session: AuthSession;
};

export function DashboardChatsContent({ session }: DashboardChatsContentProps) {
  const [conversations, setConversations] = useState<ChatConversationSummary[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<ChatConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [pageError, setPageError] = useState("");
  const [sendError, setSendError] = useState("");
  const selectedConversationIdRef = useRef("");
  const previousConversationIdRef = useRef("");
  const conversationIdsRef = useRef<string[]>([]);

  async function loadConversations(preferredConversationId?: string) {
    try {
      setLoading(true);
      setPageError("");
      const items = await listChats(session.accessToken);
      setConversations(items);
      setSelectedConversationId((current) => {
        const nextId =
          preferredConversationId ||
          current ||
          items[0]?.id ||
          "";

        return items.some((conversation) => conversation.id === nextId)
          ? nextId
          : items[0]?.id || "";
      });
      if (!items.length) {
        setSelectedConversation(null);
      }
    } catch (loadError) {
      console.error("Chats list load failed", loadError);
      setPageError(loadError instanceof Error ? loadError.message : "Chatlar yuklanmadi.");
    } finally {
      setLoading(false);
    }
  }

  async function loadConversationDetail(conversationId: string) {
    try {
      setDetailLoading(true);
      setPageError("");
      const detail = await getChatConversation(session.accessToken, conversationId);
      setSelectedConversation(detail);
    } catch (loadError) {
      console.error("Chat detail load failed", loadError);
      setSelectedConversation(null);
      setPageError(loadError instanceof Error ? loadError.message : "Chat tafsiloti yuklanmadi.");
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  useEffect(() => {
    conversationIdsRef.current = conversations.map((conversation) => conversation.id);
  }, [conversations]);

  useEffect(() => {
    void loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.accessToken]);

  useEffect(() => {
    if (!selectedConversationId) {
      setSelectedConversation(null);
      return;
    }

    void loadConversationDetail(selectedConversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversationId, session.accessToken]);

  useEffect(() => {
    const socket = getChatSocket(session.accessToken);

    function handleSocketMessage(event: ChatSocketMessageEvent) {
      const isKnownConversation = conversationIdsRef.current.includes(event.conversationId);

      setConversations((current) =>
        upsertConversationSummary(current, event.conversationId, event.message),
      );

      if (selectedConversationIdRef.current === event.conversationId) {
        setSelectedConversation((current) =>
          upsertConversationDetailMessage(current, event.conversationId, event.message),
        );
      } else if (!isKnownConversation) {
        void loadConversations();
      }
    }

    function handleConnectError(error: Error) {
      console.error("Chat socket connection failed", error);
      setPageError(error.message || "Chat soketiga ulanib bo'lmadi.");
    }

    socket.on("message:new", handleSocketMessage);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("message:new", handleSocketMessage);
      socket.off("connect_error", handleConnectError);
    };
  }, [session.accessToken]);

  useEffect(() => {
    const socket = getChatSocket(session.accessToken);
    const previousConversationId = previousConversationIdRef.current;

    function joinConversationRoom() {
      if (!selectedConversationId) {
        return;
      }

      socket.emit(
        "conversation:join",
        { conversationId: selectedConversationId },
        (response?: { ok?: boolean; message?: string }) => {
          if (!response?.ok) {
            setPageError(response?.message || "Chat xonasiga ulanib bo'lmadi.");
          }
        },
      );
    }

    if (previousConversationId && previousConversationId !== selectedConversationId) {
      socket.emit("conversation:leave", { conversationId: previousConversationId });
    }

    joinConversationRoom();
    previousConversationIdRef.current = selectedConversationId;
    socket.on("connect", joinConversationRoom);

    return () => {
      socket.off("connect", joinConversationRoom);

      if (selectedConversationId) {
        socket.emit("conversation:leave", { conversationId: selectedConversationId });
      }
    };
  }, [selectedConversationId, session.accessToken]);

  const displayConversations = useMemo(
    () => conversations.map((conversation) => toDisplayConversation(conversation)),
    [conversations],
  );
  const displayMessages = useMemo(
    () =>
      selectedConversation
        ? selectedConversation.messages.map((message) => toDisplayMessage(message, session.user.id))
        : [],
    [selectedConversation, session.user.id],
  );

  async function handleSend(text: string) {
    if (!selectedConversationId) {
      setSendError("Suhbat tanlanmagan.");
      return false;
    }

    try {
      setSending(true);
      setSendError("");
      const createdMessage = await sendChatMessage(session.accessToken, selectedConversationId, { text });
      setSelectedConversation((current) =>
        upsertConversationDetailMessage(current, selectedConversationId, createdMessage),
      );
      setConversations((current) =>
        upsertConversationSummary(current, selectedConversationId, createdMessage),
      );
      return true;
    } catch (sendError) {
      console.error("Chat message send failed", sendError);
      setSendError(sendError instanceof Error ? sendError.message : "Xabar yuborilmadi.");
      return false;
    } finally {
      setSending(false);
    }
  }

  if (loading && !conversations.length) {
    return <LoadingState label="Chatlar yuklanmoqda..." />;
  }

  return (
    <div className="grid gap-4">
      {pageError ? <ErrorState message={pageError} /> : null}

      <DashboardChatWorkspace
        conversations={displayConversations}
        selectedConversationId={selectedConversationId}
        messages={displayMessages}
        details={
          detailLoading ? (
            <LoadingState label="Suhbat yuklanmoqda..." />
          ) : selectedConversation ? (
            <ConversationDetails conversation={selectedConversation} />
          ) : undefined
        }
        emptyTitle="Chat tanlanmagan"
        emptyDescription="Chap tomondan o'zingizga tegishli suhbatni tanlang."
        onSelectConversation={setSelectedConversationId}
        onSend={selectedConversation ? handleSend : undefined}
        sending={sending}
        sendError={sendError}
        sendDisabledReason={selectedConversation ? "" : "Suhbat yuklangach xabar yuborish mumkin."}
      />
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

function ConversationDetails({ conversation }: { conversation: ChatConversationDetail }) {
  return (
    <div className="grid gap-3 rounded-[1.4rem] border border-[var(--border)] bg-white/82 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-[var(--navy)]">{conversation.request.title}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {conversation.request.category} - {conversation.request.city}
          </p>
        </div>
        <StatusBadge status={conversation.request.status} />
      </div>

      <p className="text-sm leading-7 text-[var(--navy-soft)]">{conversation.request.description}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Meta label="Byudjet" value={formatRequestBudget(conversation.request.budgetMin, conversation.request.budgetMax)} />
        <Meta label="Faollik" value={formatDateTime(conversation.lastActivityAt)} />
        <Meta label="Manzil" value={conversation.request.addressText || "Aniqlashtiriladi"} />
        <Meta label="Suhbatdosh" value={conversation.counterpart.fullName} />
      </div>

      <div className="rounded-[1.2rem] border border-[var(--border)] bg-[rgba(255,250,242,0.72)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Bog'lanish</p>
        <div className="mt-3 flex items-center gap-3">
          {conversation.counterpart.avatarUrl ? (
            <img src={conversation.counterpart.avatarUrl} alt="" className="h-12 w-12 rounded-[1rem] object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white text-sm font-bold text-[var(--navy)]">
              {conversation.counterpart.fullName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-bold text-[var(--navy)]">{conversation.counterpart.fullName}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {conversation.counterpart.phone || "Telefon ko'rsatilmagan"}
            </p>
          </div>
        </div>
      </div>

      {conversation.request.images.length ? (
        <div className="flex gap-3">
          {conversation.request.images.slice(0, 2).map((imageUrl) => (
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

function toDisplayConversation(conversation: ChatConversationSummary): DashboardConversation {
  return {
    id: conversation.id,
    title: conversation.request.title,
    subtitle: `${conversation.request.category} - ${conversation.request.city}`,
    participantName: conversation.counterpart.fullName,
    avatarUrl: conversation.counterpart.avatarUrl,
    lastMessage: conversation.lastMessage?.text || "Suhbat boshlandi. Birinchi xabarni yuboring.",
    updatedAt: formatDateTime(conversation.lastActivityAt),
    status: conversation.request.status,
  };
}

function toDisplayMessage(
  message: ChatConversationDetail["messages"][number],
  currentUserId: string,
): DashboardChatMessage {
  return {
    id: message.id,
    conversationId: "",
    author: message.senderId === currentUserId ? "me" : "them",
    authorName: message.sender.fullName,
    text: message.text,
    createdAt: formatDateTime(message.createdAt),
  };
}
