import { API_BASE_URL, apiRequest, clearToken, setToken } from "./client";
import type {
  AuthPayload,
  LoginInput,
  RegisterInput,
  User,
} from "./types";

export async function register(input: RegisterInput): Promise<AuthPayload> {
  const data = await apiRequest<AuthPayload>("/api/auth/register", {
    method: "POST",
    body: input,
    auth: false,
  });
  setToken(data.token);
  return data;
}

export async function login(input: LoginInput): Promise<AuthPayload> {
  const data = await apiRequest<AuthPayload>("/api/auth/login", {
    method: "POST",
    body: input,
    auth: false,
  });
  setToken(data.token);
  return data;
}

export async function getMe(): Promise<User> {
  const data = await apiRequest<{ user: User }>("/api/auth/me");
  return data.user;
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<void>("/api/auth/logout", { method: "POST" });
  } finally {
    clearToken();
  }
}

export function getGithubLoginUrl(): string {
  return `${API_BASE_URL}/api/auth/github`;
}
