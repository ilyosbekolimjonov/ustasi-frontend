"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";

import { EmptyState, StatusBadge } from "./dashboard-ui";

export type DashboardConversation = {
  id: string;
  title: string;
  subtitle: string;
  participantName: string;
  participantMeta?: string;
  avatarUrl?: string | null;
  lastMessage: string;
  updatedAt: string;
  status?: string;
};

export type DashboardChatMessage = {
  id: string;
  conversationId: string;
  author: "me" | "them" | "system";
  authorName: string;
  text: string;
  createdAt: string;
};

type DashboardChatWindowProps = {
  conversation: DashboardConversation | null;
  messages: DashboardChatMessage[];
  details?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onSend?: (text: string) => Promise<boolean | void> | boolean | void;
  sending?: boolean;
  sendError?: string;
  sendDisabledReason?: string;
};

export function DashboardChatWorkspace({
  conversations,
  selectedConversationId,
  messages,
  details,
  emptyTitle,
  emptyDescription,
  onSelectConversation,
  onSend,
  sending,
  sendError,
  sendDisabledReason,
}: {
  conversations: DashboardConversation[];
  selectedConversationId: string;
  messages: DashboardChatMessage[];
  details?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onSelectConversation: (conversationId: string) => void;
  onSend?: (text: string) => Promise<boolean | void> | boolean | void;
  sending?: boolean;
  sendError?: string;
  sendDisabledReason?: string;
}) {
  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedConversationId) ?? null;

  return (
    <div className="grid overflow-hidden rounded-[1.6rem] border border-[var(--border)] bg-white/80 shadow-[0_16px_40px_rgba(23,32,51,0.08)] backdrop-blur lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="border-b border-[var(--border)] bg-[rgba(255,250,242,0.72)] p-3 lg:border-b-0 lg:border-r">
        <div className="px-2 py-2">
          <h2 className="text-xl font-bold text-[var(--navy)]">Chats</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Muloqotlar ro'yxati</p>
        </div>

        <div className="mt-2 grid max-h-[620px] gap-2 overflow-y-auto pr-1">
          {conversations.length ? (
            conversations.map((conversation) => {
              const active = conversation.id === selectedConversationId;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`rounded-[1.25rem] border p-3 text-left transition ${
                    active
                      ? "border-[rgba(45,143,139,0.35)] bg-white shadow-sm"
                      : "border-transparent bg-white/60 hover:border-[var(--border)] hover:bg-white"
                  }`}
                >
                  <ConversationSummary conversation={conversation} />
                </button>
              );
            })
          ) : (
            <EmptyState
              title="Chatlar yo'q"
              description="Hozircha ochilgan muloqotlar mavjud emas."
            />
          )}
        </div>
      </aside>

      <DashboardChatWindow
        conversation={selectedConversation}
        messages={messages}
        details={details}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        onSend={onSend}
        sending={sending}
        sendError={sendError}
        sendDisabledReason={sendDisabledReason}
      />
    </div>
  );
}

export function DashboardChatWindow({
  conversation,
  messages,
  details,
  emptyTitle = "Chat tanlanmagan",
  emptyDescription = "Chap tomondan suhbatni tanlang.",
  onSend,
  sending,
  sendError,
  sendDisabledReason,
}: DashboardChatWindowProps) {
  const [draft, setDraft] = useState("");
  const [localError, setLocalError] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = draft.trim();
    if (!text || !onSend || sending) {
      if (!text) {
        setLocalError("Xabar matnini kiriting.");
      }
      return;
    }

    setLocalError("");

    try {
      const result = await Promise.resolve(onSend(text));

      if (result === false) {
        return;
      }

      setDraft("");
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Xabar yuborilmadi.");
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  if (!conversation) {
    return (
      <div className="p-5">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <section className="grid min-h-[620px] grid-rows-[auto_minmax(0,1fr)_auto] bg-[rgba(249,246,239,0.52)]">
      <header className="border-b border-[var(--border)] bg-white/82 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <ChatAvatar conversation={conversation} />
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-[var(--navy)]">{conversation.title}</h3>
              <p className="mt-1 truncate text-sm text-[var(--muted)]">{conversation.subtitle}</p>
            </div>
          </div>
          {conversation.status ? <StatusBadge status={conversation.status} /> : null}
        </div>
      </header>

      <div className="min-h-0 overflow-y-auto px-5 py-4">
        {details ? <div className="mb-4">{details}</div> : null}

        <div className="grid gap-3">
          {messages.length ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.author === "me"
                    ? "justify-end"
                    : message.author === "system"
                      ? "justify-center"
                      : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[82%] rounded-[1.25rem] px-4 py-3 text-sm leading-6 shadow-sm ${
                    message.author === "me"
                      ? "bg-[var(--navy)] text-white"
                      : message.author === "system"
                        ? "bg-[rgba(45,143,139,0.12)] text-[var(--teal)]"
                        : "bg-white text-[var(--navy-soft)]"
                  }`}
                >
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] opacity-70">
                    {message.authorName}
                  </p>
                  <p className="mt-1">{message.text}</p>
                  <p className="mt-2 text-[0.68rem] font-semibold opacity-60">{message.createdAt}</p>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="Xabarlar yo'q"
              description="Bu suhbatda hali xabar yozilmagan."
            />
          )}
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="border-t border-[var(--border)] bg-white/86 p-4">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            rows={1}
            className="auth-input min-h-[54px] min-w-0 flex-1 resize-none rounded-[1rem] px-4 py-3 leading-6"
            placeholder="Xabar yozing..."
          />
          <button
            type="submit"
            className="button-primary h-[54px] cursor-pointer px-5 py-0 text-sm shadow-[0_14px_24px_rgba(23,32,51,0.16)]"
            disabled={!onSend || sending}
          >
            {sending ? "Yuborilmoqda..." : "Yuborish"}
          </button>
        </div>
        <div className="mt-2 flex flex-col gap-1 text-xs">
          {sendDisabledReason ? <p className="text-[var(--amber-deep)]">{sendDisabledReason}</p> : null}
          {sendError || localError ? (
            <p className="font-semibold text-[var(--amber-deep)]">{sendError || localError}</p>
          ) : null}
        </div>
      </form>
    </section>
  );
}

function ConversationSummary({ conversation }: { conversation: DashboardConversation }) {
  return (
    <div className="flex gap-3">
      <ChatAvatar conversation={conversation} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-extrabold text-[var(--navy)]">{conversation.title}</h3>
          <span className="shrink-0 text-[0.68rem] font-semibold text-[var(--muted)]">
            {conversation.updatedAt}
          </span>
        </div>
        <p className="mt-1 truncate text-xs font-semibold text-[var(--navy-soft)]">
          {conversation.participantName}
        </p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">
          {conversation.lastMessage}
        </p>
      </div>
    </div>
  );
}

function ChatAvatar({ conversation }: { conversation: DashboardConversation }) {
  if (conversation.avatarUrl) {
    return (
      <img
        src={conversation.avatarUrl}
        alt=""
        className="h-11 w-11 shrink-0 rounded-[1rem] object-cover"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-[rgba(23,32,51,0.08)] text-sm font-extrabold text-[var(--navy)]">
      {conversation.participantName.slice(0, 1).toUpperCase()}
    </div>
  );
}
