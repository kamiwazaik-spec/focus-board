import type { Task } from "./types";

const STORAGE_KEY = "focus_board_tasks_v1";

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialTasks();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return getInitialTasks();
  } catch {
    return getInitialTasks();
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error("Failed to save tasks:", e);
  }
}

function nowISO(): string {
  return new Date().toISOString();
}

function getInitialTasks(): Task[] {
  const now = nowISO();
  return [
    {
      id: crypto.randomUUID(),
      title: "クレカキャッシング枠チェック",
      description: "三井住友VISA・エポスのキャッシング枠をアプリで確認",
      assigneeId: "kanata",
      createdById: "kanata",
      status: "todo",
      priority: "high",
      category: "admin",
      dueDate: new Date().toISOString().split("T")[0],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "十八親和銀行電話対応",
      description: "短期資金優先・1週間検討・防御ライン5原則を守る",
      assigneeId: "kanata",
      createdById: "kanata",
      status: "todo",
      priority: "high",
      category: "admin",
      dueDate: new Date().toISOString().split("T")[0],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "中村DへLINE送信",
      description: "ボイスメモ依頼書/補助金確認/リーガル相談",
      assigneeId: "kanata",
      createdById: "kanata",
      status: "todo",
      priority: "high",
      category: "sales",
      dueDate: new Date().toISOString().split("T")[0],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "5/15 高谷さん補助金申請サポート",
      description: "省力化補助金 5/15申請予定・必要書類最終確認",
      assigneeId: "yusuke",
      createdById: "kanata",
      status: "todo",
      priority: "high",
      category: "subsidy",
      dueDate: "2026-05-15",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "公庫面談予約催促電話",
      description: "4月末申込分の進捗確認",
      assigneeId: "yusuke",
      createdById: "kanata",
      status: "todo",
      priority: "medium",
      category: "subsidy",
      dueDate: new Date().toISOString().split("T")[0],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "dental copilot 5/31本リリース",
      description: "v4 3医院切替UI実装含む",
      assigneeId: "leo",
      createdById: "kanata",
      status: "in_progress",
      priority: "high",
      category: "dev",
      dueDate: "2026-05-31",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "ものづくりライフ3社デモMVP開発",
      description: "豊永・高谷・岡崎の業種別カスタムAI",
      assigneeId: "leo",
      createdById: "kanata",
      status: "todo",
      priority: "medium",
      category: "dev",
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function exportTasks(tasks: Task[]): string {
  return JSON.stringify(tasks, null, 2);
}

export function importTasks(json: string): Task[] | null {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
}
