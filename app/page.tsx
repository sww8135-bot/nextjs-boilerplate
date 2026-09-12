/* app/page.tsx */
"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ButtonHTMLAttributes,
  ComponentType,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Circle,
  Dumbbell,
  Home as HomeIcon,
  Plus,
  Trash2,
  Wallet,
  ArrowLeft,
} from "lucide-react";

type View = "home" | "hoops" | "workout" | "study" | "money" | "chores" | "stats";

const bg = "#12141C";
const surface = "#1A1D27";
const line = "rgba(236,237,242,0.10)";
const ink = "#ECEDF2";
const muted = "#868C9C";

const accents = {
  hoops: "#E07B39",
  workout: "#5FA97A",
  study: "#6C8FCB",
  money: "#D6B24A",
  chores: "#4FB3A9",
  stats: "#B08FD8",
};

const STORAGE_PREFIX = "note-it-v2:";

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayISO() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function shortDate(iso: string) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

function thaiDate(iso: string) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

function loadList<T>(key: string, fallback: T[] = []): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function saveList<T>(key: string, list: T[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(list));
  } catch (error) {
    console.error("บันทึกข้อมูลไม่สำเร็จ", error);
  }
}

const WEEKDAY_NAMES = [
  "จันทร์",
  "อังคาร",
  "พุธ",
  "พฤหัสบดี",
  "ศุกร์",
  "เสาร์",
  "อาทิตย์",
];

type WeekDay = {
  date: string;
  dayName: string;
};

function getWeekDates(): WeekDay[] {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + diffToMonday);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return {
      date: local.toISOString().slice(0, 10),
      dayName: WEEKDAY_NAMES[i],
    };
  });
}

function saveAndReturn<T>(key: string, next: T[]): T[] {
  saveList(key, next);
  return next;
}

function TopBar({
  title,
  accent,
  onBack,
}: {
  title: string;
  accent: string;
  onBack: () => void;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <button
        onClick={onBack}
        className="rounded-full p-2 transition-opacity hover:opacity-70"
        style={{ color: muted }}
        aria-label="กลับ"
      >
        <ArrowLeft size={20} />
      </button>
      <h1 className="text-xl font-bold tracking-tight" style={{ color: ink }}>
        {title}
      </h1>
      <div
        className="ml-auto h-2 w-2 rounded-full"
        style={{ background: accent }}
      />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-xs" style={{ color: muted }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function Underline({
  accent,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { accent: string }) {
  const [focused, setFocused] = useState(false);

  return (
    <input
      {...props}
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
      className={`w-full border-0 border-b bg-transparent px-0.5 py-1.5 outline-none ${
        props.className ?? ""
      }`}
      style={{
        color: ink,
        borderBottom: `1.5px solid ${focused ? accent : line}`,
        transition: "border-color 120ms",
        ...props.style,
      }}
    />
  );
}

function TextareaUnderline({
  accent,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { accent: string }) {
  const [focused, setFocused] = useState(false);

  return (
    <textarea
      {...props}
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
      className={`w-full resize-none border-0 border-b bg-transparent px-0.5 py-1.5 outline-none ${
        props.className ?? ""
      }`}
      style={{
        color: ink,
        borderBottom: `1.5px solid ${focused ? accent : line}`,
        transition: "border-color 120ms",
        ...props.style,
      }}
    />
  );
}

function AddButton({
  accent,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  accent: string;
}) {
  return (
    <button
      {...rest}
      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
        rest.className ?? ""
      }`}
      style={{ background: accent, color: bg, ...rest.style }}
    >
      <Plus size={16} strokeWidth={2.5} />
      {children}
    </button>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="py-10 text-center text-sm" style={{ color: muted }}>
      {text}
    </p>
  );
}

function EntryRow({
  children,
  onDelete,
}: {
  children: ReactNode;
  onDelete: () => void;
}) {
  return (
    <div
      className="flex items-start justify-between gap-3 py-3.5"
      style={{ borderBottom: `1px solid ${line}` }}
    >
      <div className="min-w-0 flex-1">{children}</div>
      <button
        onClick={onDelete}
        className="shrink-0 rounded p-1"
        style={{ color: muted }}
        aria-label="ลบรายการนี้"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

/* ---------------- Home ---------------- */

function Home({ onSelect }: { onSelect: (view: View) => void }) {
  const tiles: {
    key: View;
    icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
    label: string;
    sub: string;
    accent: string;
  }[] = [
    {
      key: "hoops",
      icon: Activity,
      label: "ซ้อมบาส",
      sub: "บันทึกการซ้อม ยิงเข้า",
      accent: accents.hoops,
    },
    {
      key: "workout",
      icon: Dumbbell,
      label: "ออกกำลังกาย",
      sub: "วิ่ง เวท โยคะ และอื่น ๆ",
      accent: accents.workout,
    },
    {
      key: "study",
      icon: BookOpen,
      label: "จดการเรียน",
      sub: "เช็กงานค้างแยกตามวิชา",
      accent: accents.study,
    },
    {
      key: "money",
      icon: Wallet,
      label: "รายรับ-รายจ่าย",
      sub: "เงินเข้า เงินออก ยอดคงเหลือ",
      accent: accents.money,
    },
    {
      key: "chores",
      icon: HomeIcon,
      label: "งานบ้าน",
      sub: "เช็กงานบ้านแต่ละวัน",
      accent: accents.chores,
    },
    {
      key: "stats",
      icon: BarChart3,
      label: "สรุปสัปดาห์",
      sub: "ภาพรวมทุกหมวด 7 วัน",
      accent: accents.stats,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-md px-6 pb-10 pt-14">
      <p className="mb-1 text-sm" style={{ color: muted }}>
        วันนี้อยากจดอะไร
      </p>
      <h1 className="mb-9 text-3xl font-black tracking-tight" style={{ color: ink }}>
        จดไว้
      </h1>

      <div className="grid grid-cols-2 gap-3.5">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.key}
              onClick={() => onSelect(tile.key)}
              className="flex min-h-[148px] flex-col justify-between rounded-2xl p-4 text-left transition-transform active:scale-[0.97]"
              style={{ background: surface, border: `1px solid ${line}` }}
            >
              <Icon size={22} color={tile.accent} strokeWidth={2} />
              <div>
                <div className="mb-1 text-sm font-semibold" style={{ color: ink }}>
                  {tile.label}
                </div>
                <div className="text-xs leading-snug" style={{ color: muted }}>
                  {tile.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </main>
  );
}

/* ---------------- Basketball ---------------- */

type HoopDay = {
  id: string;
  date: string;
  dayName: string;
  made: string;
  attempts: string;
  note: string;
  extra?: boolean;
};

function HoopsScreen({ onBack }: { onBack: () => void }) {
  const accent = accents.hoops;
  const [days, setDays] = useState<HoopDay[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = loadList<HoopDay>("hoops-log");
    const week = getWeekDates().map((w) => {
      const existing = stored.find((e) => e.date === w.date && !e.extra);
      return (
        existing ?? {
          id: uid(),
          date: w.date,
          dayName: w.dayName,
          made: "",
          attempts: "",
          note: "",
          extra: false,
        }
      );
    });
    setDays([...week, ...stored.filter((e) => e.extra)]);
    setLoaded(true);
  }, []);

  const updateDay = (id: string, patch: Partial<HoopDay>) => {
    setDays((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, ...patch } : d));
      return saveAndReturn("hoops-log", next);
    });
  };

  const addExtraDay = () => {
    setDays((prev) =>
      saveAndReturn("hoops-log", [
        ...prev,
        {
          id: uid(),
          date: todayISO(),
          dayName: "",
          made: "",
          attempts: "",
          note: "",
          extra: true,
        },
      ])
    );
  };

  const removeDay = (id: string) => {
    setDays((prev) => saveAndReturn("hoops-log", prev.filter((d) => d.id !== id)));
  };

  return (
    <main className="mx-auto w-full max-w-md px-6 pb-10 pt-8">
      <TopBar title="ซ้อมบาส" accent={accent} onBack={onBack} />

      {loaded &&
        days.map((d) => {
          const attempts = Number(d.attempts);
          const made = Number(d.made);
          const pct = attempts > 0 ? Math.round((made / attempts) * 100) : null;

          return (
            <section
              key={d.id}
              className="mb-3 rounded-2xl p-4"
              style={{ background: surface, border: `1px solid ${line}` }}
            >
              <div className="mb-3 flex items-center gap-2">
                {d.extra ? (
                  <input
                    type="date"
                    value={d.date}
                    onChange={(e) => updateDay(d.id, { date: e.target.value })}
                    className="bg-transparent text-sm font-semibold outline-none"
                    style={{ color: ink }}
                  />
                ) : (
                  <>
                    <span className="text-sm font-semibold" style={{ color: ink }}>
                      วัน{d.dayName}
                    </span>
                    <span className="text-xs" style={{ color: muted }}>
                      {shortDate(d.date)}
                    </span>
                  </>
                )}

                {pct !== null && (
                  <span className="ml-auto text-xs font-medium" style={{ color: accent }}>
                    ยิง {pct}%
                  </span>
                )}

                {d.extra && (
                  <button
                    onClick={() => removeDay(d.id)}
                    className="rounded p-1"
                    style={{ color: muted }}
                    aria-label="ลบวันนี้"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-4">
                <Field label="ยิงเข้า">
                  <Underline
                    accent={accent}
                    type="number"
                    min="0"
                    value={d.made}
                    onChange={(e) => updateDay(d.id, { made: e.target.value })}
                    placeholder="0"
                  />
                </Field>
                <Field label="ยิงทั้งหมด">
                  <Underline
                    accent={accent}
                    type="number"
                    min="0"
                    value={d.attempts}
                    onChange={(e) => updateDay(d.id, { attempts: e.target.value })}
                    placeholder="0"
                  />
                </Field>
              </div>

              <Field label="ทำอะไรบ้าง">
                <TextareaUnderline
                  accent={accent}
                  rows={2}
                  value={d.note}
                  onChange={(e) => updateDay(d.id, { note: e.target.value })}
                  placeholder="เช่น ชู้ตสามคะแนน ฟุตเวิร์ก ฝึกเลี้ยงบอล"
                />
              </Field>
            </section>
          );
        })}

      <button
        onClick={addExtraDay}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold"
        style={{ border: `1px dashed ${line}`, color: muted }}
      >
        <Plus size={16} strokeWidth={2.5} />
        เพิ่มวัน
      </button>
    </main>
  );
}

/* ---------------- Workout ---------------- */

type Move = { id: string; move: string; sets: string; reps: string };
type WorkoutDay = {
  id: string;
  date: string;
  dayName: string;
  extra?: boolean;
  moves: Move[];
};

function newMove(): Move {
  return { id: uid(), move: "", sets: "", reps: "" };
}

function WorkoutScreen({ onBack }: { onBack: () => void }) {
  const accent = accents.workout;
  const [days, setDays] = useState<WorkoutDay[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = loadList<WorkoutDay>("workout-log");
    const week = getWeekDates().map((w) => {
      const existing = stored.find((e) => e.date === w.date && !e.extra);
      return (
        existing ?? {
          id: uid(),
          date: w.date,
          dayName: w.dayName,
          extra: false,
          moves: [newMove()],
        }
      );
    });
    setDays([...week, ...stored.filter((e) => e.extra)]);
    setLoaded(true);
  }, []);

  const updateDay = (dayId: string, patch: Partial<WorkoutDay>) => {
    setDays((prev) => {
      const next = prev.map((d) => (d.id === dayId ? { ...d, ...patch } : d));
      return saveAndReturn("workout-log", next);
    });
  };

  const updateMove = (dayId: string, moveId: string, patch: Partial<Move>) => {
    setDays((prev) => {
      const next = prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              moves: d.moves.map((m) => (m.id === moveId ? { ...m, ...patch } : m)),
            }
          : d
      );
      return saveAndReturn("workout-log", next);
    });
  };

  const addMove = (dayId: string) => {
    setDays((prev) => {
      const next = prev.map((d) =>
        d.id === dayId ? { ...d, moves: [...d.moves, newMove()] } : d
      );
      return saveAndReturn("workout-log", next);
    });
  };

  const removeMove = (dayId: string, moveId: string) => {
    setDays((prev) => {
      const next = prev.map((d) =>
        d.id === dayId
          ? { ...d, moves: d.moves.filter((m) => m.id !== moveId) }
          : d
      );
      return saveAndReturn("workout-log", next);
    });
  };

  const addExtraDay = () => {
    setDays((prev) =>
      saveAndReturn("workout-log", [
        ...prev,
        {
          id: uid(),
          date: todayISO(),
          dayName: "",
          extra: true,
          moves: [newMove()],
        },
      ])
    );
  };

  const removeDay = (dayId: string) => {
    setDays((prev) => saveAndReturn("workout-log", prev.filter((d) => d.id !== dayId)));
  };

  return (
    <main className="mx-auto w-full max-w-md px-6 pb-10 pt-8">
      <TopBar title="ออกกำลังกาย" accent={accent} onBack={onBack} />

      {loaded &&
        days.map((d) => (
          <section
            key={d.id}
            className="mb-3 rounded-2xl p-4"
            style={{ background: surface, border: `1px solid ${line}` }}
          >
            <div className="mb-3 flex items-center gap-2">
              {d.extra ? (
                <input
                  type="date"
                  value={d.date}
                  onChange={(e) => updateDay(d.id, { date: e.target.value })}
                  className="bg-transparent text-sm font-semibold outline-none"
                  style={{ color: ink }}
                />
              ) : (
                <>
                  <span className="text-sm font-semibold" style={{ color: ink }}>
                    วัน{d.dayName}
                  </span>
                  <span className="text-xs" style={{ color: muted }}>
                    {shortDate(d.date)}
                  </span>
                </>
              )}

              {d.extra && (
                <button
                  onClick={() => removeDay(d.id)}
                  className="ml-auto rounded p-1"
                  style={{ color: muted }}
                  aria-label="ลบวันนี้"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {d.moves.map((m, idx) => (
              <div
                key={m.id}
                className={idx > 0 ? "mt-4 border-t pt-4" : ""}
                style={idx > 0 ? { borderColor: line } : undefined}
              >
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <Field label={idx === 0 ? "ท่าที่จะทำ" : `ท่าที่ ${idx + 1}`}>
                      <Underline
                        accent={accent}
                        type="text"
                        value={m.move}
                        onChange={(e) => updateMove(d.id, m.id, { move: e.target.value })}
                        placeholder="เช่น สควอท, วิ่ง, แพลงก์"
                      />
                    </Field>
                  </div>

                  {d.moves.length > 1 && (
                    <button
                      onClick={() => removeMove(d.id, m.id)}
                      className="mt-5 rounded p-1"
                      style={{ color: muted }}
                      aria-label="ลบท่านี้"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-4">
                  <Field label="เซ็ต">
                    <Underline
                      accent={accent}
                      type="number"
                      min="0"
                      value={m.sets}
                      onChange={(e) => updateMove(d.id, m.id, { sets: e.target.value })}
                      placeholder="3"
                    />
                  </Field>
                  <Field label="จำนวนครั้ง/เซ็ต">
                    <Underline
                      accent={accent}
                      type="number"
                      min="0"
                      value={m.reps}
                      onChange={(e) => updateMove(d.id, m.id, { reps: e.target.value })}
                      placeholder="12"
                    />
                  </Field>
                </div>
              </div>
            ))}

            <button
              onClick={() => addMove(d.id)}
              className="mt-3 flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: accent }}
            >
              <Plus size={14} strokeWidth={2.5} />
              เพิ่มท่า
            </button>
          </section>
        ))}

      <button
        onClick={addExtraDay}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold"
        style={{ border: `1px dashed ${line}`, color: muted }}
      >
        <Plus size={16} strokeWidth={2.5} />
        เพิ่มวัน
      </button>
    </main>
  );
}

/* ---------------- Chores ---------------- */

type Chore = { id: string; name: string; done: boolean };
type ChoreDay = {
  id: string;
  date: string;
  dayName: string;
  extra?: boolean;
  chores: Chore[];
};

function newChore(): Chore {
  return { id: uid(), name: "", done: false };
}

function ChoresScreen({ onBack }: { onBack: () => void }) {
  const accent = accents.chores;
  const [days, setDays] = useState<ChoreDay[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = loadList<ChoreDay>("chores-log");
    const week = getWeekDates().map((w) => {
      const existing = stored.find((e) => e.date === w.date && !e.extra);
      return (
        existing ?? {
          id: uid(),
          date: w.date,
          dayName: w.dayName,
          extra: false,
          chores: [newChore()],
        }
      );
    });
    setDays([...week, ...stored.filter((e) => e.extra)]);
    setLoaded(true);
  }, []);

  const updateDay = (dayId: string, patch: Partial<ChoreDay>) => {
    setDays((prev) => {
      const next = prev.map((d) => (d.id === dayId ? { ...d, ...patch } : d));
      return saveAndReturn("chores-log", next);
    });
  };

  const updateChore = (dayId: string, choreId: string, patch: Partial<Chore>) => {
    setDays((prev) => {
      const next = prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              chores: d.chores.map((c) => (c.id === choreId ? { ...c, ...patch } : c)),
            }
          : d
      );
      return saveAndReturn("chores-log", next);
    });
  };

  const addChore = (dayId: string) => {
    setDays((prev) => {
      const next = prev.map((d) =>
        d.id === dayId ? { ...d, chores: [...d.chores, newChore()] } : d
      );
      return saveAndReturn("chores-log", next);
    });
  };

  const removeChore = (dayId: string, choreId: string) => {
    setDays((prev) => {
      const next = prev.map((d) =>
        d.id === dayId
          ? { ...d, chores: d.chores.filter((c) => c.id !== choreId) }
          : d
      );
      return saveAndReturn("chores-log", next);
    });
  };

  const addExtraDay = () => {
    setDays((prev) =>
      saveAndReturn("chores-log", [
        ...prev,
        {
          id: uid(),
          date: todayISO(),
          dayName: "",
          extra: true,
          chores: [newChore()],
        },
      ])
    );
  };

  const removeDay = (dayId: string) => {
    setDays((prev) => saveAndReturn("chores-log", prev.filter((d) => d.id !== dayId)));
  };

  return (
    <main className="mx-auto w-full max-w-md px-6 pb-10 pt-8">
      <TopBar title="งานบ้าน" accent={accent} onBack={onBack} />

      {loaded &&
        days.map((d) => {
          const pending = d.chores.filter((c) => c.name.trim() && !c.done).length;

          return (
            <section
              key={d.id}
              className="mb-3 rounded-2xl p-4"
              style={{ background: surface, border: `1px solid ${line}` }}
            >
              <div className="mb-3 flex items-center gap-2">
                {d.extra ? (
                  <input
                    type="date"
                    value={d.date}
                    onChange={(e) => updateDay(d.id, { date: e.target.value })}
                    className="bg-transparent text-sm font-semibold outline-none"
                    style={{ color: ink }}
                  />
                ) : (
                  <>
                    <span className="text-sm font-semibold" style={{ color: ink }}>
                      วัน{d.dayName}
                    </span>
                    <span className="text-xs" style={{ color: muted }}>
                      {shortDate(d.date)}
                    </span>
                  </>
                )}

                {pending > 0 && (
                  <span className="ml-auto text-xs font-medium" style={{ color: accent }}>
                    ค้าง {pending}
                  </span>
                )}

                {d.extra && (
                  <button
                    onClick={() => removeDay(d.id)}
                    className="rounded p-1"
                    style={{ color: muted }}
                    aria-label="ลบวันนี้"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {d.chores.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2.5 border-t py-2"
                  style={{ borderColor: line }}
                >
                  <button
                    onClick={() => updateChore(d.id, c.id, { done: !c.done })}
                    style={{ color: c.done ? accent : muted }}
                    className="shrink-0"
                    aria-label="สลับสถานะงานบ้าน"
                  >
                    {c.done ? <CheckCircle2 size={19} /> : <Circle size={19} />}
                  </button>

                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => updateChore(d.id, c.id, { name: e.target.value })}
                    placeholder="เช่น ล้างจาน, กวาดบ้าน, ซักผ้า"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                    style={{
                      color: c.done ? muted : ink,
                      textDecoration: c.done ? "line-through" : "none",
                    }}
                  />

                  <button
                    onClick={() => removeChore(d.id, c.id)}
                    className="shrink-0 rounded p-1"
                    style={{ color: muted }}
                    aria-label="ลบงานนี้"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              <button
                onClick={() => addChore(d.id)}
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: accent }}
              >
                <Plus size={14} strokeWidth={2.5} />
                เพิ่มงานบ้าน
              </button>
            </section>
          );
        })}

      <button
        onClick={addExtraDay}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold"
        style={{ border: `1px dashed ${line}`, color: muted }}
      >
        <Plus size={16} strokeWidth={2.5} />
        เพิ่มวัน
      </button>
    </main>
  );
}

/* ---------------- Study ---------------- */

type Task = { id: string; name: string; done: boolean };
type Subject = { id: string; name: string; code: string; tasks: Task[] };

function newTask(): Task {
  return { id: uid(), name: "", done: false };
}

function newSubject(): Subject {
  return { id: uid(), name: "", code: "", tasks: [newTask()] };
}

function StudyScreen({ onBack }: { onBack: () => void }) {
  const accent = accents.study;
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = loadList<Subject>("study-log");
    setSubjects(stored.length ? stored : [newSubject()]);
    setLoaded(true);
  }, []);

  const updateSubject = (id: string, patch: Partial<Subject>) => {
    setSubjects((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...patch } : s));
      return saveAndReturn("study-log", next);
    });
  };

  const addSubject = () => {
    setSubjects((prev) => saveAndReturn("study-log", [...prev, newSubject()]));
  };

  const removeSubject = (id: string) => {
    setSubjects((prev) => saveAndReturn("study-log", prev.filter((s) => s.id !== id)));
  };

  const updateTask = (subjectId: string, taskId: string, patch: Partial<Task>) => {
    setSubjects((prev) => {
      const next = prev.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
            }
          : s
      );
      return saveAndReturn("study-log", next);
    });
  };

  const addTask = (subjectId: string) => {
    setSubjects((prev) => {
      const next = prev.map((s) =>
        s.id === subjectId ? { ...s, tasks: [...s.tasks, newTask()] } : s
      );
      return saveAndReturn("study-log", next);
    });
  };

  const removeTask = (subjectId: string, taskId: string) => {
    setSubjects((prev) => {
      const next = prev.map((s) =>
        s.id === subjectId
          ? { ...s, tasks: s.tasks.filter((t) => t.id !== taskId) }
          : s
      );
      return saveAndReturn("study-log", next);
    });
  };

  return (
    <main className="mx-auto w-full max-w-md px-6 pb-10 pt-8">
      <TopBar title="จดการเรียน" accent={accent} onBack={onBack} />

      {loaded &&
        subjects.map((s) => {
          const pending = s.tasks.filter((t) => t.name.trim() && !t.done).length;

          return (
            <section
              key={s.id}
              className="mb-3 rounded-2xl p-4"
              style={{ background: surface, border: `1px solid ${line}` }}
            >
              <div className="mb-1 flex items-start gap-2">
                <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-4">
                  <Field label="ชื่อวิชา">
                    <Underline
                      accent={accent}
                      type="text"
                      value={s.name}
                      onChange={(e) => updateSubject(s.id, { name: e.target.value })}
                      placeholder="คณิตศาสตร์"
                    />
                  </Field>
                  <Field label="รหัสวิชา">
                    <Underline
                      accent={accent}
                      type="text"
                      value={s.code}
                      onChange={(e) => updateSubject(s.id, { code: e.target.value })}
                      placeholder="MA101"
                    />
                  </Field>
                </div>

                <button
                  onClick={() => removeSubject(s.id)}
                  className="mt-5 rounded p-1"
                  style={{ color: muted }}
                  aria-label="ลบวิชานี้"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {pending > 0 && (
                <p className="mb-1 text-xs" style={{ color: accent }}>
                  ค้างอยู่ {pending} งาน
                </p>
              )}

              {s.tasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2.5 border-t py-2"
                  style={{ borderColor: line }}
                >
                  <button
                    onClick={() => updateTask(s.id, t.id, { done: !t.done })}
                    style={{ color: t.done ? accent : muted }}
                    className="shrink-0"
                    aria-label="สลับสถานะงาน"
                  >
                    {t.done ? <CheckCircle2 size={19} /> : <Circle size={19} />}
                  </button>

                  <input
                    type="text"
                    value={t.name}
                    onChange={(e) => updateTask(s.id, t.id, { name: e.target.value })}
                    placeholder="ชื่องาน"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                    style={{
                      color: t.done ? muted : ink,
                      textDecoration: t.done ? "line-through" : "none",
                    }}
                  />

                  <button
                    onClick={() => removeTask(s.id, t.id)}
                    className="shrink-0 rounded p-1"
                    style={{ color: muted }}
                    aria-label="ลบงานนี้"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              <button
                onClick={() => addTask(s.id)}
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: accent }}
              >
                <Plus size={14} strokeWidth={2.5} />
                เพิ่มงาน
              </button>
            </section>
          );
        })}

      <button
        onClick={addSubject}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold"
        style={{ border: `1px dashed ${line}`, color: muted }}
      >
        <Plus size={16} strokeWidth={2.5} />
        เพิ่มวิชา
      </button>
    </main>
  );
}

/* ---------------- Finance ---------------- */

type MoneyEntry = {
  id: string;
  date: string;
  kind: "income" | "expense";
  amount: number;
  category: string;
  note: string;
};

type Favorite = {
  id: string;
  name: string;
  amount: string;
  kind: "income" | "expense";
  category: string;
};

function MoneyScreen({ onBack }: { onBack: () => void }) {
  const accent = accents.money;
  const [entries, setEntries] = useState<MoneyEntry[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [kind, setKind] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [editingFavs, setEditingFavs] = useState(false);

  useEffect(() => {
    setEntries(loadList<MoneyEntry>("finance-log"));
    setFavorites(loadList<Favorite>("finance-favorites"));
    setLoaded(true);
  }, []);

  const totalIncome = useMemo(
    () => entries.filter((e) => e.kind === "income").reduce((sum, e) => sum + e.amount, 0),
    [entries]
  );
  const totalExpense = useMemo(
    () => entries.filter((e) => e.kind === "expense").reduce((sum, e) => sum + e.amount, 0),
    [entries]
  );
  const balance = totalIncome - totalExpense;

  const fmt = (n: number) =>
    n.toLocaleString("th-TH", { maximumFractionDigits: 2 });

  const add = () => {
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) return;

    const next: MoneyEntry[] = [
      {
        id: uid(),
        date,
        kind,
        amount: numeric,
        category: category.trim(),
        note: note.trim(),
      },
      ...entries,
    ];

    setEntries(next);
    saveList("finance-log", next);
    setAmount("");
    setCategory("");
    setNote("");
  };

  const remove = (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    saveList("finance-log", next);
  };

  const quickAdd = (fav: Favorite) => {
    const numeric = Number(fav.amount);
    if (!Number.isFinite(numeric) || numeric <= 0) return;

    const next: MoneyEntry[] = [
      {
        id: uid(),
        date: todayISO(),
        kind: fav.kind,
        amount: numeric,
        category: fav.category,
        note: fav.name,
      },
      ...entries,
    ];

    setEntries(next);
    saveList("finance-log", next);
  };

  const updateFav = (id: string, patch: Partial<Favorite>) => {
    setFavorites((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, ...patch } : f));
      return saveAndReturn("finance-favorites", next);
    });
  };

  const addFav = () => {
    setFavorites((prev) =>
      saveAndReturn("finance-favorites", [
        ...prev,
        { id: uid(), name: "", amount: "", kind: "expense", category: "" },
      ])
    );
  };

  const removeFav = (id: string) => {
    setFavorites((prev) =>
      saveAndReturn("finance-favorites", prev.filter((f) => f.id !== id))
    );
  };

  return (
    <main className="mx-auto w-full max-w-md px-6 pb-10 pt-8">
      <TopBar title="รายรับ-รายจ่าย" accent={accent} onBack={onBack} />

      <div className="mb-7">
        <p className="mb-1 text-xs" style={{ color: muted }}>
          ยอดคงเหลือ
        </p>
        <p
          className="text-4xl font-black tracking-tight"
          style={{ color: balance >= 0 ? ink : "#D9695F" }}
        >
          ฿{fmt(balance)}
        </p>
        <div className="mt-2 flex gap-5 text-xs">
          <span style={{ color: accents.workout }}>รับ ฿{fmt(totalIncome)}</span>
          <span style={{ color: "#D9695F" }}>จ่าย ฿{fmt(totalExpense)}</span>
        </div>
      </div>

      <div className="mb-7">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs" style={{ color: muted }}>
            รายการโปรด
          </p>
          <button
            onClick={() => setEditingFavs((v) => !v)}
            className="text-xs font-semibold"
            style={{ color: accent }}
          >
            {editingFavs ? "เสร็จ" : "แก้ไข"}
          </button>
        </div>

        {!editingFavs &&
          (favorites.length === 0 ? (
            <p className="text-xs" style={{ color: muted }}>
              ยังไม่มีรายการโปรด กด “แก้ไข” เพื่อเพิ่มรายการที่ใช้บ่อย
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {favorites.map((f) => (
                <button
                  key={f.id}
                  onClick={() => quickAdd(f)}
                  className="rounded-xl px-3.5 py-2.5 text-left"
                  style={{ background: surface, border: `1px solid ${line}` }}
                >
                  <div className="text-xs font-medium" style={{ color: ink }}>
                    {f.name || "ไม่มีชื่อ"}
                  </div>
                  <div
                    className="text-xs"
                    style={{
                      color: f.kind === "income" ? accents.workout : "#D9695F",
                    }}
                  >
                    {f.kind === "income" ? "+" : "-"}฿{fmt(Number(f.amount) || 0)}
                  </div>
                </button>
              ))}
            </div>
          ))}

        {editingFavs && (
          <div className="flex flex-col gap-3">
            {favorites.map((f) => (
              <div
                key={f.id}
                className="rounded-xl p-3"
                style={{ background: surface, border: `1px solid ${line}` }}
              >
                <div className="mb-3 flex gap-2">
                  {[
                    { key: "income" as const, label: "รายรับ" },
                    { key: "expense" as const, label: "รายจ่าย" },
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => updateFav(f.id, { kind: option.key })}
                      className="flex-1 rounded-lg py-1.5 text-xs font-semibold"
                      style={{
                        background: f.kind === option.key ? accent : "transparent",
                        color: f.kind === option.key ? bg : muted,
                        border: `1px solid ${
                          f.kind === option.key ? accent : line
                        }`,
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                  <button
                    onClick={() => removeFav(f.id)}
                    className="rounded p-1.5"
                    style={{ color: muted }}
                    aria-label="ลบรายการโปรด"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-x-4">
                  <Field label="ชื่อ">
                    <Underline
                      accent={accent}
                      type="text"
                      value={f.name}
                      onChange={(e) => updateFav(f.id, { name: e.target.value })}
                      placeholder="กาแฟ"
                    />
                  </Field>
                  <Field label="จำนวนเงิน (บาท)">
                    <Underline
                      accent={accent}
                      type="number"
                      min="0"
                      value={f.amount}
                      onChange={(e) => updateFav(f.id, { amount: e.target.value })}
                      placeholder="35"
                    />
                  </Field>
                </div>

                <Field label="หมวดหมู่ (ไม่บังคับ)">
                  <Underline
                    accent={accent}
                    type="text"
                    value={f.category}
                    onChange={(e) => updateFav(f.id, { category: e.target.value })}
                    placeholder="อาหาร"
                  />
                </Field>
              </div>
            ))}

            <button
              onClick={addFav}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold"
              style={{ border: `1px dashed ${line}`, color: muted }}
            >
              <Plus size={14} strokeWidth={2.5} />
              เพิ่มรายการโปรด
            </button>
          </div>
        )}
      </div>

      <div
        className="mb-8 rounded-2xl p-4"
        style={{ background: surface, border: `1px solid ${line}` }}
      >
        <div className="mb-4 flex gap-2">
          {[
            { key: "income" as const, label: "รายรับ" },
            { key: "expense" as const, label: "รายจ่าย" },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setKind(option.key)}
              className="flex-1 rounded-lg py-2 text-sm font-semibold"
              style={{
                background: kind === option.key ? accent : "transparent",
                color: kind === option.key ? bg : muted,
                border: `1px solid ${kind === option.key ? accent : line}`,
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-x-4">
          <Field label="จำนวนเงิน (บาท)">
            <Underline
              accent={accent}
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="150"
            />
          </Field>
          <Field label="วันที่">
            <Underline
              accent={accent}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
        </div>

        <Field label="หมวดหมู่">
          <Underline
            accent={accent}
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="อาหาร, ค่าเดินทาง ฯลฯ"
          />
        </Field>

        <Field label="โน้ต (ไม่บังคับ)">
          <Underline
            accent={accent}
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="รายละเอียดเพิ่มเติม"
          />
        </Field>

        <AddButton accent={accent} onClick={add} disabled={!Number(amount)}>
          บันทึกรายการ
        </AddButton>
      </div>

      {loaded && entries.length === 0 && (
        <Empty text="ยังไม่มีรายการ เริ่มบันทึกรายการแรกกันเลย" />
      )}

      {entries.map((e) => (
        <EntryRow key={e.id} onDelete={() => remove(e.id)}>
          <div className="mb-0.5 flex items-baseline gap-2">
            <span
              className="text-sm font-semibold"
              style={{ color: e.kind === "income" ? accents.workout : "#D9695F" }}
            >
              {e.kind === "income" ? "+" : "-"}฿{fmt(e.amount)}
            </span>
            {e.category && (
              <span className="text-xs" style={{ color: muted }}>
                {e.category}
              </span>
            )}
            <span className="ml-auto mr-2 text-xs" style={{ color: muted }}>
              {thaiDate(e.date)}
            </span>
          </div>
          {e.note && (
            <div className="text-xs" style={{ color: muted }}>
              {e.note}
            </div>
          )}
        </EntryRow>
      ))}
    </main>
  );
}

/* ---------------- Weekly summary ---------------- */

function StatsScreen({ onBack }: { onBack: () => void }) {
  const accent = accents.stats;
  const [hoopsDays, setHoopsDays] = useState<HoopDay[]>([]);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [choreDays, setChoreDays] = useState<ChoreDay[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setHoopsDays(loadList<HoopDay>("hoops-log").filter((d) => !d.extra));
    setWorkoutDays(loadList<WorkoutDay>("workout-log").filter((d) => !d.extra));
    setChoreDays(loadList<ChoreDay>("chores-log").filter((d) => !d.extra));
    setLoaded(true);
  }, []);

  const week = getWeekDates();

  return (
    <main className="mx-auto w-full max-w-md px-6 pb-10 pt-8">
      <TopBar title="สรุปสัปดาห์" accent={accent} onBack={onBack} />

      {loaded &&
        week.map((w) => {
          const hoop = hoopsDays.find((d) => d.date === w.date);
          const workout = workoutDays.find((d) => d.date === w.date);
          const chore = choreDays.find((d) => d.date === w.date);

          const hoopActive =
            !!hoop &&
            (Number(hoop.made) > 0 ||
              Number(hoop.attempts) > 0 ||
              !!hoop.note.trim());

          const moves = workout?.moves.filter((m) => m.move.trim()) ?? [];
          const choresAll = chore?.chores.filter((c) => c.name.trim()) ?? [];
          const choresDone = choresAll.filter((c) => c.done);
          const hasAnything = hoopActive || moves.length > 0 || choresAll.length > 0;

          return (
            <section
              key={w.date}
              className="mb-3 rounded-2xl p-4"
              style={{ background: surface, border: `1px solid ${line}` }}
            >
              <div className="mb-3 flex items-baseline gap-2">
                <span className="text-sm font-semibold" style={{ color: ink }}>
                  วัน{w.dayName}
                </span>
                <span className="text-xs" style={{ color: muted }}>
                  {shortDate(w.date)}
                </span>
              </div>

              {!hasAnything ? (
                <p className="text-xs" style={{ color: muted }}>
                  ยังไม่มีบันทึกวันนี้
                </p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {hoopActive && (
                    <div className="flex gap-2 text-xs">
                      <Activity
                        size={14}
                        color={accents.hoops}
                        className="mt-0.5 shrink-0"
                      />
                      <span style={{ color: muted }}>
                        ซ้อมบาส
                        {Number(hoop?.attempts) > 0
                          ? ` — ${hoop?.made || 0}/${hoop?.attempts} เข้า`
                          : ""}
                        {hoop?.note ? ` · ${hoop.note}` : ""}
                      </span>
                    </div>
                  )}

                  {moves.length > 0 && (
                    <div className="flex gap-2 text-xs">
                      <Dumbbell
                        size={14}
                        color={accents.workout}
                        className="mt-0.5 shrink-0"
                      />
                      <span style={{ color: muted }}>
                        ออกกำลังกาย —{" "}
                        {moves
                          .map((m) =>
                            m.move +
                            (m.sets && m.reps ? ` (${m.sets}x${m.reps})` : "")
                          )
                          .join(", ")}
                      </span>
                    </div>
                  )}

                  {choresAll.length > 0 && (
                    <div className="flex gap-2 text-xs">
                      <HomeIcon
                        size={14}
                        color={accents.chores}
                        className="mt-0.5 shrink-0"
                      />
                      <span style={{ color: muted }}>
                        งานบ้าน — เสร็จ {choresDone.length}/{choresAll.length}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
    </main>
  );
}

/* ---------------- App ---------------- */

export default function App() {
  const [view, setView] = useState<View>("home");

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        background: bg,
        color: ink,
        minHeight: "100vh",
      }}
    >
      {view === "home" && <Home onSelect={setView} />}
      {view === "hoops" && <HoopsScreen onBack={() => setView("home")} />}
      {view === "workout" && <WorkoutScreen onBack={() => setView("home")} />}
      {view === "study" && <StudyScreen onBack={() => setView("home")} />}
      {view === "money" && <MoneyScreen onBack={() => setView("home")} />}
      {view === "chores" && <ChoresScreen onBack={() => setView("home")} />}
      {view === "stats" && <StatsScreen onBack={() => setView("home")} />}
    </div>
  );
}
