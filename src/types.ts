export type MemberId = "kanata" | "yusuke" | "leo" | "nakamura";

export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskPriority = "low" | "medium" | "high";

export type TaskCategory = "sales" | "dev" | "admin" | "subsidy" | "meeting" | "other";

export type Task = {
  id: string;
  title: string;
  description?: string;
  assigneeId: MemberId;
  createdById: MemberId;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: string; // ISO date string
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  completionNote?: string;
  transferHistory?: Array<{
    from: MemberId;
    to: MemberId;
    at: string;
  }>;
};

export type Member = {
  id: MemberId;
  name: string;
  role: string;
  color: string;
  bgColor: string;
};

export const MEMBERS: Member[] = [
  {
    id: "kanata",
    name: "伊藤奏大",
    role: "CEO",
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.1)",
  },
  {
    id: "yusuke",
    name: "塩見優介",
    role: "COO",
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.1)",
  },
  {
    id: "leo",
    name: "ドイ・レオナルド",
    role: "CTO",
    color: "#a855f7",
    bgColor: "rgba(168, 85, 247, 0.1)",
  },
  {
    id: "nakamura",
    name: "中村正幸",
    role: "パートナー",
    color: "#f97316",
    bgColor: "rgba(249, 115, 22, 0.1)",
  },
];

export const CATEGORIES: Record<TaskCategory, { label: string; color: string }> = {
  sales: { label: "営業", color: "#f59e0b" },
  dev: { label: "開発", color: "#a855f7" },
  admin: { label: "事務", color: "#64748b" },
  subsidy: { label: "補助金", color: "#10b981" },
  meeting: { label: "MTG", color: "#3b82f6" },
  other: { label: "その他", color: "#6b7280" },
};

export const PRIORITIES: Record<TaskPriority, { label: string; color: string; icon: string }> = {
  high: { label: "高", color: "#ef4444", icon: "🔥" },
  medium: { label: "中", color: "#f59e0b", icon: "●" },
  low: { label: "低", color: "#64748b", icon: "○" },
};
