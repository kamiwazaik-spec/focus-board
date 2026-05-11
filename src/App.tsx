import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  Plus,
  Check,
  Search,
  X,
  Calendar,
  Trash2,
  ArrowRight,
  Sparkles,
  Filter,
  CheckCircle2,
  Circle,
  PlayCircle,
  ChevronDown,
  Send,
  KeyboardIcon,
} from "lucide-react";
import {
  MEMBERS,
  CATEGORIES,
  PRIORITIES,
  type MemberId,
  type Task,
  type TaskCategory,
  type TaskPriority,
  type TaskStatus,
} from "./types";
import { loadTasks, saveTasks } from "./storage";

type ViewMode = "board" | "list" | "today";
type FilterMode = "all" | "active" | "today";

function fmtDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const today = new Date();
  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  if (isToday) return "今日";
  return `${m}/${day}`;
}

function isOverdue(iso?: string, status?: TaskStatus) {
  if (!iso || status === "done") return false;
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

function MemberAvatar({ memberId, size = 28 }: { memberId: MemberId; size?: number }) {
  const m = MEMBERS.find((mm) => mm.id === memberId)!;
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: m.color,
        fontSize: size * 0.42,
      }}
      className="flex items-center justify-center rounded-full font-bold text-white shrink-0"
      title={`${m.name}(${m.role})`}
    >
      {m.name.charAt(0)}
    </div>
  );
}

type TaskCardProps = {
  task: Task;
  onToggle: () => void;
  onUpdate: (patch: Partial<Task>) => void;
  onDelete: () => void;
  onTransfer: (to: MemberId) => void;
  onClick: () => void;
};

function TaskCard(props: TaskCardProps) {
  const { task, onToggle, onUpdate, onDelete, onTransfer, onClick } = props;
  const [showMenu, setShowMenu] = useState(false);
  const cat = CATEGORIES[task.category];
  const pri = PRIORITIES[task.priority];
  const overdue = isOverdue(task.dueDate, task.status);
  const isDone = task.status === "done";
  const isInProgress = task.status === "in_progress";

  return (
    <div
      className={`group task-enter relative rounded-lg border bg-neutral-900 p-3 transition-all hover:border-neutral-700 ${
        isDone ? "opacity-50 border-neutral-800" : "border-neutral-800"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="mt-0.5 shrink-0 transition-transform hover:scale-110"
          title={isDone ? "未完了に戻す" : isInProgress ? "完了" : "開始"}
        >
          {isDone ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : isInProgress ? (
            <PlayCircle className="h-5 w-5 text-blue-500" />
          ) : (
            <Circle className="h-5 w-5 text-neutral-500 hover:text-neutral-300" />
          )}
        </button>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
          <div className={`text-sm font-medium leading-snug ${isDone ? "line-through text-neutral-500" : "text-neutral-100"}`}>
            {task.title}
          </div>
          {task.description && (
            <div className={`mt-1 text-xs leading-relaxed text-neutral-500 line-clamp-2 ${isDone ? "line-through" : ""}`}>
              {task.description}
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: cat.color + "25", color: cat.color }}
            >
              {cat.label}
            </span>
            {task.priority !== "low" && (
              <span
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: pri.color + "25", color: pri.color }}
              >
                {pri.icon} {pri.label}
              </span>
            )}
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  overdue
                    ? "bg-red-500/20 text-red-400"
                    : "bg-neutral-800 text-neutral-400"
                }`}
              >
                <Calendar className="h-2.5 w-2.5" />
                {fmtDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-neutral-800 group-hover:opacity-100"
            title="メニュー"
          >
            <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div className="absolute right-0 top-7 z-20 min-w-[180px] rounded-lg border border-neutral-700 bg-neutral-800 p-1 shadow-2xl">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-neutral-500">
                  担当者を変更
                </div>
                {MEMBERS.filter((m) => m.id !== task.assigneeId).map((m) => (
                  <button
                    key={m.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTransfer(m.id);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-left hover:bg-neutral-700"
                  >
                    <MemberAvatar memberId={m.id} size={20} />
                    <span>{m.name}に振る</span>
                  </button>
                ))}
                <div className="my-1 h-px bg-neutral-700" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-left text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> 削除
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskDetailModal({
  task,
  onClose,
  onUpdate,
}: {
  task: Task;
  onClose: () => void;
  onUpdate: (patch: Partial<Task>) => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [category, setCategory] = useState<TaskCategory>(task.category);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate || "");

  const save = () => {
    onUpdate({
      title: title.trim() || task.title,
      description: description.trim() || undefined,
      category,
      priority,
      dueDate: dueDate || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-[10vh]" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3">
          <div className="flex items-center gap-2">
            <MemberAvatar memberId={task.assigneeId} size={24} />
            <div className="text-xs text-neutral-400">
              担当: {MEMBERS.find((m) => m.id === task.assigneeId)?.name}
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-neutral-800">
            <X className="h-4 w-4 text-neutral-400" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-base font-medium text-neutral-100 outline-none focus:border-neutral-600"
            placeholder="タスクのタイトル"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-[100px] resize-none rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-neutral-100 outline-none focus:border-neutral-600 scrollbar-thin"
            placeholder="詳細(任意)"
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase text-neutral-500">カテゴリ</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-xs text-neutral-100 outline-none focus:border-neutral-600"
              >
                {Object.entries(CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-neutral-500">優先度</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-xs text-neutral-100 outline-none focus:border-neutral-600"
              >
                {Object.entries(PRIORITIES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.icon} {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-neutral-500">期限</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-xs text-neutral-100 outline-none focus:border-neutral-600"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-neutral-800 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-neutral-400 hover:bg-neutral-800"
          >
            キャンセル
          </button>
          <button
            onClick={save}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

function NewTaskModal({
  defaultAssignee,
  onClose,
  onCreate,
}: {
  defaultAssignee: MemberId;
  onClose: () => void;
  onCreate: (data: {
    title: string;
    description?: string;
    assigneeId: MemberId;
    category: TaskCategory;
    priority: TaskPriority;
    dueDate?: string;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState<MemberId>(defaultAssignee);
  const [category, setCategory] = useState<TaskCategory>("other");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const submit = () => {
    if (!title.trim()) return;
    onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      assigneeId,
      category,
      priority,
      dueDate: dueDate || undefined,
    });
    onClose();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-[10vh]"
      onClick={onClose}
      onKeyDown={onKey}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3">
          <div className="text-sm font-semibold">新規タスク</div>
          <button onClick={onClose} className="rounded p-1 hover:bg-neutral-800">
            <X className="h-4 w-4 text-neutral-400" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={onKey}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-base font-medium text-neutral-100 outline-none focus:border-neutral-600"
            placeholder="やるべきこと"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={onKey}
            className="w-full min-h-[80px] resize-none rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-neutral-100 outline-none focus:border-neutral-600 scrollbar-thin"
            placeholder="詳細(任意・Cmd+Enter で保存)"
          />
          <div>
            <label className="text-[10px] font-bold uppercase text-neutral-500">担当</label>
            <div className="mt-1 flex gap-2">
              {MEMBERS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setAssigneeId(m.id)}
                  className={`flex flex-1 items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs transition ${
                    assigneeId === m.id
                      ? "border-neutral-600 bg-neutral-800"
                      : "border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <MemberAvatar memberId={m.id} size={18} />
                  <span>{m.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase text-neutral-500">カテゴリ</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-xs text-neutral-100 outline-none focus:border-neutral-600"
              >
                {Object.entries(CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-neutral-500">優先度</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-xs text-neutral-100 outline-none focus:border-neutral-600"
              >
                {Object.entries(PRIORITIES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.icon} {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-neutral-500">期限</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-xs text-neutral-100 outline-none focus:border-neutral-600"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-neutral-800 px-5 py-3">
          <div className="text-[10px] text-neutral-500">⌘+Enter で作成</div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-sm text-neutral-400 hover:bg-neutral-800"
            >
              キャンセル
            </button>
            <button
              onClick={submit}
              disabled={!title.trim()}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-30"
            >
              作成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// AI completion report — local heuristic (no API key needed)
function inferCompletedTasks(report: string, tasks: Task[]): Task[] {
  const text = report.toLowerCase();
  const matches = new Map<string, number>();
  for (const t of tasks) {
    if (t.status === "done") continue;
    const title = t.title.toLowerCase();
    let score = 0;
    if (text.includes(title)) score += 100;
    const tokens = title.split(/[\s・×\/、。]+/).filter((w) => w.length >= 2);
    for (const tok of tokens) {
      if (text.includes(tok.toLowerCase())) score += tok.length;
    }
    if (score > 0) matches.set(t.id, score);
  }
  const sorted = [...matches.entries()].sort((a, b) => b[1] - a[1]);
  return sorted
    .slice(0, 5)
    .map(([id]) => tasks.find((t) => t.id === id))
    .filter(Boolean) as Task[];
}

function ReportModal({
  tasks,
  onClose,
  onComplete,
}: {
  tasks: Task[];
  onClose: () => void;
  onComplete: (taskIds: string[], note: string) => void;
}) {
  const [report, setReport] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [analyzed, setAnalyzed] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const candidates = useMemo(() => {
    if (!report.trim()) return [];
    return inferCompletedTasks(report, tasks);
  }, [report, tasks]);

  const analyze = () => {
    setAnalyzed(true);
    setSelectedIds(candidates.map((t) => t.id));
  };

  const submit = () => {
    if (selectedIds.length === 0) return;
    onComplete(selectedIds, report);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-[10vh]" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-amber-400" /> 完了報告(AIが自動でタスク特定)
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-neutral-800">
            <X className="h-4 w-4 text-neutral-400" />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <div className="text-xs text-neutral-400">
            「○○のタスク終わりました」のような文章を投げると、該当タスクを自動で特定して完了処理します。
          </div>
          <textarea
            ref={inputRef}
            value={report}
            onChange={(e) => {
              setReport(e.target.value);
              setAnalyzed(false);
            }}
            className="w-full min-h-[120px] resize-none rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-neutral-100 outline-none focus:border-neutral-600 scrollbar-thin"
            placeholder="例: 公庫面談予約催促電話、終わりました。次は十八親和銀行の電話対応します。"
          />
          {report.trim().length > 0 && !analyzed && (
            <button
              onClick={analyze}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-amber-400"
            >
              <Sparkles className="h-3.5 w-3.5" /> 完了タスクを特定
            </button>
          )}
          {analyzed && candidates.length > 0 && (
            <div>
              <div className="mb-1.5 text-[10px] font-bold uppercase text-neutral-500">
                該当タスク({candidates.length}件・チェック外せます)
              </div>
              <div className="max-h-[240px] space-y-1.5 overflow-auto scrollbar-thin">
                {candidates.map((t) => {
                  const checked = selectedIds.includes(t.id);
                  return (
                    <label
                      key={t.id}
                      className="flex cursor-pointer items-start gap-2 rounded-lg border border-neutral-800 bg-neutral-950 p-2.5 hover:border-neutral-700"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setSelectedIds((prev) =>
                            e.target.checked ? [...prev, t.id] : prev.filter((id) => id !== t.id)
                          )
                        }
                        className="mt-0.5 h-4 w-4 cursor-pointer accent-emerald-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{t.title}</div>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <MemberAvatar memberId={t.assigneeId} size={14} />
                          <span className="text-[10px] text-neutral-500">
                            {MEMBERS.find((m) => m.id === t.assigneeId)?.name}
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
          {analyzed && candidates.length === 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              該当するタスクが見つかりませんでした。タイトルに含まれるキーワードを使って報告してみてください。
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-neutral-800 px-5 py-3">
          <div className="text-[10px] text-neutral-500">
            {analyzed ? `${selectedIds.length}件選択中` : "Sparklesボタンで解析"}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm text-neutral-400 hover:bg-neutral-800">
              キャンセル
            </button>
            <button
              onClick={submit}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-30"
            >
              <Send className="h-3.5 w-3.5" /> 完了処理
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShortcutHint() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-neutral-800 px-2.5 py-1.5 text-xs text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
        title="ショートカット"
      >
        <KeyboardIcon className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold">キーボードショートカット</div>
              <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-neutral-800">
                <X className="h-4 w-4 text-neutral-400" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {[
                ["新規タスク", "N"],
                ["完了報告", "R"],
                ["検索", "/"],
                ["全画面表示切り替え", "1 / 2 / 3"],
                ["閉じる", "Esc"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-neutral-400">{k}</span>
                  <kbd className="rounded border border-neutral-700 bg-neutral-800 px-2 py-0.5 font-mono text-[11px] text-neutral-300">
                    {v}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [view, setView] = useState<ViewMode>("board");
  const [filter, setFilter] = useState<FilterMode>("active");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [defaultAssignee, setDefaultAssignee] = useState<MemberId>("kanata");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inField = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (inField) return;
      if (showNew || showReport || editingTask) return;

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setShowNew(true);
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        setShowReport(true);
      } else if (e.key === "/") {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      } else if (e.key === "Escape") {
        setShowSearch(false);
        setSearch("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showNew, showReport, editingTask]);

  // ----------------- Task operations -----------------
  const createTask = useCallback(
    (data: {
      title: string;
      description?: string;
      assigneeId: MemberId;
      category: TaskCategory;
      priority: TaskPriority;
      dueDate?: string;
    }) => {
      const now = new Date().toISOString();
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description,
        assigneeId: data.assigneeId,
        createdById: "kanata",
        status: "todo",
        priority: data.priority,
        category: data.category,
        dueDate: data.dueDate,
        createdAt: now,
        updatedAt: now,
      };
      setTasks((prev) => [newTask, ...prev]);
    },
    []
  );

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const now = new Date().toISOString();
        if (t.status === "todo")
          return { ...t, status: "in_progress", updatedAt: now };
        if (t.status === "in_progress")
          return { ...t, status: "done", completedAt: now, updatedAt: now };
        return { ...t, status: "todo", completedAt: undefined, updatedAt: now };
      })
    );
  }, []);

  const transferTask = useCallback((id: string, to: MemberId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const from = t.assigneeId;
        const now = new Date().toISOString();
        return {
          ...t,
          assigneeId: to,
          updatedAt: now,
          transferHistory: [...(t.transferHistory || []), { from, to, at: now }],
        };
      })
    );
  }, []);

  const completeFromReport = useCallback((ids: string[], note: string) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) =>
        ids.includes(t.id) ? { ...t, status: "done", completedAt: now, completionNote: note, updatedAt: now } : t
      )
    );
  }, []);

  // ----------------- Filtering -----------------
  const filtered = useMemo(() => {
    let out = tasks;
    const q = search.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q)
      );
    }
    if (filter === "active") {
      out = out.filter((t) => t.status !== "done");
    } else if (filter === "today") {
      const today = new Date().toISOString().split("T")[0];
      out = out.filter((t) => t.dueDate === today && t.status !== "done");
    }
    return out;
  }, [tasks, search, filter]);

  const tasksByMember = useMemo(() => {
    const map: Record<MemberId, Task[]> = { kanata: [], yusuke: [], leo: [] };
    for (const t of filtered) map[t.assigneeId].push(t);
    // sort: in_progress first, then by priority then dueDate
    const priOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
    const statOrder: Record<TaskStatus, number> = { in_progress: 0, todo: 1, done: 2 };
    for (const k of Object.keys(map) as MemberId[]) {
      map[k].sort((a, b) => {
        if (statOrder[a.status] !== statOrder[b.status]) return statOrder[a.status] - statOrder[b.status];
        if (priOrder[a.priority] !== priOrder[b.priority]) return priOrder[a.priority] - priOrder[b.priority];
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return 0;
      });
    }
    return map;
  }, [filtered]);

  const stats = useMemo(() => {
    const all = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const overdue = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;
    const today = new Date().toISOString().split("T")[0];
    const todayDone = tasks.filter(
      (t) => t.status === "done" && t.completedAt && t.completedAt.startsWith(today)
    ).length;
    return { all, done, overdue, todayDone };
  }, [tasks]);

  // ----------------- Render -----------------
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-black text-white">
                f
              </div>
              <div>
                <div className="text-sm font-bold">focus board</div>
                <div className="text-[10px] text-neutral-500">
                  完了 {stats.done}/{stats.all} ・ 今日 {stats.todayDone} ・ 期限切れ {stats.overdue}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {showSearch ? (
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={() => {
                  if (!search) setShowSearch(false);
                }}
                placeholder="検索..."
                className="w-48 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm outline-none focus:border-neutral-500"
              />
            ) : (
              <button
                onClick={() => {
                  setShowSearch(true);
                  setTimeout(() => searchRef.current?.focus(), 50);
                }}
                className="rounded-lg border border-neutral-800 px-2.5 py-1.5 text-xs text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            )}
            <div className="ml-1 flex items-center gap-0.5 rounded-lg border border-neutral-800 bg-neutral-900 p-0.5">
              {(["active", "today", "all"] as FilterMode[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded px-2 py-1 text-[11px] font-medium transition ${
                    filter === f ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {f === "active" ? "未完了" : f === "today" ? "今日" : "全て"}
                </button>
              ))}
            </div>
            <ShortcutHint />
            <button
              onClick={() => setShowReport(true)}
              className="ml-1 flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-neutral-900 hover:bg-amber-400"
              title="完了報告(R)"
            >
              <Sparkles className="h-3.5 w-3.5" /> 完了報告
            </button>
            <button
              onClick={() => {
                setDefaultAssignee("kanata");
                setShowNew(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500"
              title="新規タスク(N)"
            >
              <Plus className="h-3.5 w-3.5" /> 新規
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-[1600px] p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {MEMBERS.map((m) => (
            <div key={m.id} className="rounded-xl border border-neutral-800 bg-neutral-900/30">
              <div
                className="flex items-center justify-between rounded-t-xl border-b border-neutral-800 px-4 py-3"
                style={{ backgroundColor: m.bgColor }}
              >
                <div className="flex items-center gap-2.5">
                  <MemberAvatar memberId={m.id} size={32} />
                  <div>
                    <div className="text-sm font-bold">{m.name}</div>
                    <div className="text-[10px]" style={{ color: m.color }}>
                      {m.role} ・ {tasksByMember[m.id].length}件
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDefaultAssignee(m.id);
                    setShowNew(true);
                  }}
                  className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
                  title={`${m.name}に新規タスク`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2 p-3 max-h-[calc(100vh-200px)] overflow-auto scrollbar-thin">
                {tasksByMember[m.id].length === 0 ? (
                  <div className="py-12 text-center text-xs text-neutral-600">
                    タスクなし
                    <br />
                    <button
                      onClick={() => {
                        setDefaultAssignee(m.id);
                        setShowNew(true);
                      }}
                      className="mt-2 rounded-lg border border-neutral-800 px-3 py-1.5 text-[11px] hover:border-neutral-700"
                    >
                      + 追加
                    </button>
                  </div>
                ) : (
                  tasksByMember[m.id].map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onToggle={() => toggleTask(t.id)}
                      onUpdate={(p) => updateTask(t.id, p)}
                      onDelete={() => deleteTask(t.id)}
                      onTransfer={(to) => transferTask(t.id, to)}
                      onClick={() => setEditingTask(t)}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="py-32 text-center">
            <div className="text-sm text-neutral-500">タスクがありません</div>
            <button
              onClick={() => setShowNew(true)}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white"
            >
              最初のタスクを作る
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      {showNew && (
        <NewTaskModal
          defaultAssignee={defaultAssignee}
          onClose={() => setShowNew(false)}
          onCreate={createTask}
        />
      )}
      {showReport && (
        <ReportModal
          tasks={tasks}
          onClose={() => setShowReport(false)}
          onComplete={completeFromReport}
        />
      )}
      {editingTask && (
        <TaskDetailModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onUpdate={(p) => {
            updateTask(editingTask.id, p);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}
