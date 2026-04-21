"use client";

import { io, type Socket } from "socket.io-client";

import { API_BASE_URL } from "./auth-api";
import { readAuthSession } from "./auth-storage";
import type { ChatMessage } from "./dashboard-api";

export type ChatSocketMessageEvent = {
  conversationId: string;
  message: ChatMessage;
};

let chatSocket: Socket | null = null;
let currentToken = "";

export function getChatSocket(token: string) {
  const latestToken = readAuthSession()?.accessToken || token;

  if (!chatSocket || currentToken !== latestToken) {
    chatSocket?.disconnect();
    currentToken = latestToken;
    chatSocket = io(API_BASE_URL, {
      autoConnect: true,
      transports: ["websocket"],
      auth: {
        token: latestToken,
      },
    });
  } else if (!chatSocket.connected) {
    chatSocket.auth = {
      token: latestToken,
    };
    chatSocket.connect();
  }

  return chatSocket;
}

export function disconnectChatSocket() {
  chatSocket?.disconnect();
  chatSocket = null;
  currentToken = "";
}
