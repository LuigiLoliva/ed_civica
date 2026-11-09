"use client";

import type {
  ArticleStatus,
  MockArticle,
  MockTopic,
  MockUser,
} from "@/lib/mock/article-types";
import { MOCK_ARTICLES, MOCK_TOPICS, MOCK_USERS } from "@/lib/mock/seed";

const ARTICLES_KEY = "voci-unite-mock-articles-v2";
const TOPICS_KEY = "voci-unite-mock-topics-v2";
const USERS_KEY = "voci-unite-mock-users-v2";
const SESSION_KEY = "voci-unite-mock-session-v2";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function ensureSeeded(): void {
  if (!canUseStorage()) return;
  if (!localStorage.getItem(ARTICLES_KEY)) writeJson(ARTICLES_KEY, MOCK_ARTICLES);
  if (!localStorage.getItem(TOPICS_KEY)) writeJson(TOPICS_KEY, MOCK_TOPICS);
  if (!localStorage.getItem(USERS_KEY)) writeJson(USERS_KEY, MOCK_USERS);
}

export function getUsers(): MockUser[] {
  ensureSeeded();
  return readJson(USERS_KEY, MOCK_USERS);
}

export function getTopics(): MockTopic[] {
  ensureSeeded();
  return readJson(TOPICS_KEY, MOCK_TOPICS);
}

export function saveTopic(topic: MockTopic): MockTopic[] {
  const topics = getTopics();
  const idx = topics.findIndex((t) => t.id === topic.id);
  if (idx >= 0) topics[idx] = topic;
  else topics.push(topic);
  writeJson(TOPICS_KEY, topics);
  return topics;
}

export function getArticles(): MockArticle[] {
  ensureSeeded();
  return readJson(ARTICLES_KEY, MOCK_ARTICLES);
}

export function getArticleById(id: string): MockArticle | undefined {
  return getArticles().find((a) => a.id === id);
}

export function saveArticle(article: MockArticle): MockArticle {
  const articles = getArticles();
  const idx = articles.findIndex((a) => a.id === article.id);
  const next = { ...article, updatedAt: new Date().toISOString() };
  if (idx >= 0) articles[idx] = next;
  else articles.unshift(next);
  writeJson(ARTICLES_KEY, articles);
  return next;
}

export function setArticleStatus(
  id: string,
  status: ArticleStatus,
): MockArticle | undefined {
  const article = getArticleById(id);
  if (!article) return undefined;
  return saveArticle({
    ...article,
    status,
    publishedAt:
      status === "pubblicato"
        ? (article.publishedAt ?? new Date().toISOString())
        : null,
  });
}

export function getSessionUser(): MockUser | null {
  if (!canUseStorage()) return null;
  ensureSeeded();
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    const fallback = getUsers().find((u) => u.role === "studente") ?? null;
    if (fallback) localStorage.setItem(SESSION_KEY, fallback.id);
    return fallback;
  }
  return getUsers().find((u) => u.id === id) ?? null;
}

export function loginAs(userId: string): MockUser | null {
  ensureSeeded();
  const user = getUsers().find((u) => u.id === userId) ?? null;
  if (user) localStorage.setItem(SESSION_KEY, user.id);
  return user;
}

export function resetMockData(): void {
  if (!canUseStorage()) return;
  writeJson(ARTICLES_KEY, MOCK_ARTICLES);
  writeJson(TOPICS_KEY, MOCK_TOPICS);
  writeJson(USERS_KEY, MOCK_USERS);
}

export function canEditArticle(user: MockUser, article: MockArticle): boolean {
  if (user.role === "admin") return true;
  return (
    article.authorUserId === user.id &&
    (article.status === "bozza" || article.status === "in_revisione")
  );
}

export function canPublish(user: MockUser): boolean {
  return user.role === "admin";
}

export function visibleArticlesFor(user: MockUser): MockArticle[] {
  const all = getArticles();
  if (user.role === "admin") return all;
  return all.filter((a) => a.authorUserId === user.id);
}
