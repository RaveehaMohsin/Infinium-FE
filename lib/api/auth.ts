import { API_BASE_URL, apiRequest, clearToken, setToken } from "./client";
import type {
  AuthPayload,
  LoginInput,
  RegisterInput,
  User,
} from "./types";

export async function register(input: RegisterInput): Promise<AuthPayload> {
  console.log("🚀 Registering with:", input.email);
  
  const data = await apiRequest<AuthPayload>("/api/auth/register", {
    method: "POST",
    body: input,
    auth: false,
  });
  
  console.log("📦 Register response data:", data);
  console.log("🔑 Token from response:", data?.token);
  
  if (data?.token) {
    setToken(data.token);
    console.log("✅ Token saved to localStorage");
  } else {
    console.error("❌ No token in response!");
  }
  
  return data;
}

export async function login(input: LoginInput): Promise<AuthPayload> {
  console.log("🚀 Logging in with:", input.email);
  
  const data = await apiRequest<AuthPayload>("/api/auth/login", {
    method: "POST",
    body: input,
    auth: false,
  });
  
  console.log("📦 Login response data:", data);
  console.log("🔑 Token from response:", data?.token);
  
  if (data?.token) {
    setToken(data.token);
    console.log("✅ Token saved to localStorage");
  } else {
    console.error("❌ No token in response!");
  }
  
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
