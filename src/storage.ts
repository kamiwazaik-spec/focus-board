import type { Task } from "./types";

const STORAGE_KEY = "focus_board_tasks_v1";

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialTasks();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return getInitialTasks();
    let result = parsed;
    // Migration: nakamura tasks
    const hasNakamura = result.some((t: any) => t.assigneeId === "nakamura");
    if (!hasNakamura) {
      const defaults = getInitialTasks();
      result = [...result, ...defaults.filter((t) => t.assigneeId === "nakamura")];
    }
    // Migration: 5/12 銀行面談タスク
    const has512Bank = result.some((t: any) => t.title?.includes("十八親和銀行本店面談"));
    if (!has512Bank) {
      result = [...getBank512Tasks(), ...result];
    }
    return result;
  } catch {
    return getInitialTasks();
  }
}

function getBank512Tasks(): Task[] {
  const now = new Date().toISOString();
  return [
    {
      id: crypto.randomUUID(),
      title: "🏦 5/12(火)11:00 十八親和銀行本店面談",
      description: "担当:小川さん。紹介ルート:野副様→上川様→小川様。300万短期資金つなぎ融資希望。",
      assigneeId: "kanata",
      createdById: "kanata",
      status: "todo",
      priority: "high",
      category: "meeting",
      dueDate: "2026-05-12",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "📄 履歴事項全部証明書(謄本)取得",
      description: "法務局佐世保支局(光月町6-26・TEL: 0956-31-1144)で取得・600円・平日8:30-17:15。明日の銀行面談で必須。",
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
      title: "📋 定款のコピー準備",
      description: "自宅保管の定款をコピー or 印刷。明日の銀行面談で必須。",
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
      title: "🔖 印鑑3種類の準備(実印・銀行印・社印)",
      description: "明日の銀行面談で必要。確実に持参。",
      assigneeId: "kanata",
      createdById: "kanata",
      status: "todo",
      priority: "high",
      category: "admin",
      dueDate: "2026-05-12",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "📦 持参書類セット作成",
      description: "事業計画書5/2版・月次試算表・資金繰り表・LOI4社の写し・代表者経歴書・印鑑証明書。Desktopの今日印刷するから取り出して持参。",
      assigneeId: "kanata",
      createdById: "kanata",
      status: "todo",
      priority: "medium",
      category: "admin",
      dueDate: new Date().toISOString().split("T")[0],
      createdAt: now,
      updatedAt: now,
    },
  ];
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
    // === 中村正幸（パートナー）枠 ===
    {
      id: crypto.randomUUID(),
      title: "かなたLINE返信",
      description: "ボイスメモ依頼書/補助金確認/リーガル相談への返答",
      assigneeId: "nakamura",
      createdById: "kanata",
      status: "todo",
      priority: "high",
      category: "other",
      dueDate: new Date().toISOString().split("T")[0],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "ボイスメモ依頼書を3社に転送",
      description: "豊永・高谷・岡崎にfocus作成のボイスメモ依頼書を送付",
      assigneeId: "nakamura",
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
      title: "豊永・高谷・岡崎の補助金スキーム使用有無確認",
      description: "focusの請求書作成に直結。中村有輝(レスト)の使用有無確認",
      assigneeId: "nakamura",
      createdById: "kanata",
      status: "todo",
      priority: "high",
      category: "subsidy",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "IOBI 100選運営費を辻さんに確認",
      description: "融資着金後の判断材料。年額・支払いタイミング確認",
      assigneeId: "nakamura",
      createdById: "kanata",
      status: "todo",
      priority: "medium",
      category: "other",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "二口グループ熊田さんへの事前情報整理",
      description: "5/30訪問前のすり合わせ・演出準備のための情報共有",
      assigneeId: "nakamura",
      createdById: "kanata",
      status: "todo",
      priority: "medium",
      category: "meeting",
      dueDate: "2026-05-29",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "ものづくりライフ3社の温度管理(継続)",
      description: "5-8月の3ヶ月間、3社と密に連絡を取り温度低下を防ぐ。月1-2回の進捗確認",
      assigneeId: "nakamura",
      createdById: "kanata",
      status: "in_progress",
      priority: "medium",
      category: "sales",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "focusへの新規案件紹介",
      description: "メディア経由のリード提供。ものづくりライフ視聴者からの引き合い",
      assigneeId: "nakamura",
      createdById: "kanata",
      status: "todo",
      priority: "low",
      category: "sales",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "月次MTG設定(focus3人+中村正幸)",
      description: "焦点とものづくりライフの定例MTG。進捗共有・課題抽出",
      assigneeId: "nakamura",
      createdById: "kanata",
      status: "todo",
      priority: "low",
      category: "meeting",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      title: "既存3社の補助金申請者の確認・共有",
      description: "焦点が連座しない構造作りのため、3社の補助金申請者(レスト or 他)を確認しfocusに共有",
      assigneeId: "nakamura",
      createdById: "kanata",
      status: "todo",
      priority: "high",
      category: "subsidy",
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
