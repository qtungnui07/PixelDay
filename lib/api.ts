import Constants from 'expo-constants';

import type { CalendarEvent, Task } from '@/types';

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
};

export type AuthSession = {
  token: string;
  expiresAt: string;
};

export type DiaryEntry = {
  dateKey: string;
  content: string;
  photoUris: string[];
  updatedAt: string;
};

export type ProfileSummary = {
  user: AuthUser;
  stats: {
    doneTasks: number;
    openTasks: number;
    events: number;
    diaryCount: number;
    todayOpenTasks: number;
    todayEvents: number;
  };
  heatmap: {
    dateKey: string;
    count: number;
  }[];
};

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;

function getDefaultApiUrl() {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoClient?.hostUri;
  const host = typeof hostUri === 'string' ? hostUri.split(':')[0] : null;

  if (host && host !== 'localhost') {
    return `http://${host}:8787`;
  }

  return 'http://127.0.0.1:8787';
}

export const apiBaseUrl = configuredApiUrl ?? getDefaultApiUrl();

async function request<T>(path: string, options: RequestInit & { token?: string } = {}) {
  const headers = new Headers(options.headers);

  headers.set('Accept', 'application/json');

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error ?? 'Không gọi được server');
  }

  return payload as T;
}

export const api = {
  health() {
    return request<{ ok: boolean; database: string; latencyMs: number }>('/health');
  },
  register(input: { email: string; password: string; displayName: string }) {
    return request<{ user: AuthUser; session: AuthSession }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  login(input: { email: string; password: string }) {
    return request<{ user: AuthUser; session: AuthSession }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  devLogin() {
    return request<{ user: AuthUser; session: AuthSession }>('/auth/dev-login', {
      method: 'POST',
    });
  },
  personalLogin() {
    return request<{ user: AuthUser; session: AuthSession }>('/auth/personal', {
      method: 'POST',
    });
  },
  me(token: string) {
    return request<{ user: AuthUser }>('/auth/me', { token });
  },
  profileSummary(token: string) {
    return request<ProfileSummary>('/profile/summary', { token });
  },
  logout(token: string) {
    return request<void>('/auth/logout', { method: 'POST', token });
  },
  clerkLogin(input: { clerkUserId: string; email: string; displayName: string }) {
    return request<{ user: AuthUser; session: AuthSession }>('/auth/clerk', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  tasks(token: string) {
    return request<{ tasks: Task[] }>('/tasks', { token });
  },
  createTask(token: string, input: Omit<Task, 'id' | 'status' | 'tag'>) {
    return request<{ task: Task }>('/tasks', {
      method: 'POST',
      token,
      body: JSON.stringify(input),
    });
  },
  updateTaskStatus(token: string, id: string, status: Task['status']) {
    return request<{ task: Task }>(`/tasks/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status }),
    });
  },
  deleteTask(token: string, id: string) {
    return request<void>(`/tasks/${id}`, { method: 'DELETE', token });
  },
  diary(token: string, dateKey: string) {
    return request<{ entry: DiaryEntry | null }>(`/diary/${dateKey}`, { token });
  },
  saveDiary(token: string, dateKey: string, input: { content: string; photoUris: string[] }) {
    return request<{ entry: DiaryEntry }>(`/diary/${dateKey}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(input),
    });
  },
  uploadDiaryPhoto(
    token: string,
    dateKey: string,
    input: { data: string; fileName?: string; mimeType?: string }
  ) {
    return request<{ photoUri: string; entry: DiaryEntry }>(`/diary/${dateKey}/photos`, {
      method: 'POST',
      token,
      body: JSON.stringify(input),
    });
  },
  events(token: string, input: { from?: string; to?: string } = {}) {
    const params = new URLSearchParams();

    if (input.from) {
      params.set('from', input.from);
    }

    if (input.to) {
      params.set('to', input.to);
    }

    const query = params.toString();
    return request<{ events: CalendarEvent[] }>(`/events${query ? `?${query}` : ''}`, { token });
  },
  googleCalendarStatus(token: string) {
    return request<{ connected: boolean; connection: { googleUserEmail: string; updatedAt: string } | null }>(
      '/calendar/google/status',
      { token }
    );
  },
};
