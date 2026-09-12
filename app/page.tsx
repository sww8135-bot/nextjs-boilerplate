'use client';
import { useState, useEffect } from "react";
import { ArrowLeft, Activity, Dumbbell, BookOpen, Wallet, Plus, Trash2, CheckCircle2, Circle, Home as HomeIcon, BarChart3 } from "lucide-react";

// ---- palette (hardwood court + notebook ink) ----
const bg = "#12141C";
const surface = "#1A1D27";
const line = "rgba(236,237,242,0.08)";
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

async function loadList(key) {
  try {
    const res = await window.storage.get(key, false);
    return res ? JSON.parse(res.value) : [];
  } catch {
    return [];
  }
}
async function saveList(key, list) {
  try {
    await window.storage.set(key, JSON.stringify(list), false);
  } catch (e) {
    console.error("save failed", e);
  }
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function thaiDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function TopBar({ title, accent, onBack }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={onBack}
        className="p-2 rounded-full transition-colors"
        style={{ color: muted }}
        onMouseEnter={(e) => (e.currentTarget.style.color = ink)}
        onMouseLeave={(e) => (e.currentTarget.style.color = muted)}
        aria-label="กลับ"
      >
        <ArrowLeft size={20} />
      </button>
      <h1 className="text-xl font-bold tracking-tight" style={{ color: ink }}>
        {title}
      </h1>
      <div className="ml-auto w-2 h-2 rounded-full" style={{ background: accent }} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-xs mb-1.5" style={{ color: muted }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputBase = {
  width: "100%",
  background: "transparent",
  borderBottom: `1px solid ${line}`,
  color: ink,
  padding: "6px 2px",
  outline: "none",
  fontSize: "0.95rem",
};

function Underline(props) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        borderBottom: `1.5px solid ${focused ? props.accent : line}`,
        transition: "border-color 120ms",
      }}
    />
  );
}

function TextareaUnderline(props) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      {...props}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        resize: "none",
        borderBottom: `1.5px solid ${focused ? props.accent : line}`,
        transition: "border-color 120ms",
      }}
    />
  );
}

function AddButton({ accent, children, ...rest }) {
  return (
    <button
      {...rest}
      className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm mt-1"
      style={{ background: accent, color: "#12141C" }}
    >
      <Plus size={16} strokeWidth={2.5} />
      {children}
    </button>
  );
}

function EntryRow({ children, onDelete }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="flex items-start justify-between gap-3 py-3.5"
      style={{ borderBottom: `1px solid ${line}` }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex-1 min-w-0">{children}</div>
      <button
        onClick={onDelete}
        style={{ color: hover ? "#D9695F" : "transparent" }}
        className="p-1 shrink-0 transition-colors"
        aria-label="ลบรายการนี้"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function Empty({ text }) {
  return (
    <p className="text-sm py-10 text-center" style={{ color: muted }}>
      {text}
    </p>
  );
}

// ---------------- Home ----------------
function Home({ onSelect }) {
  const tiles = [
    { key: "hoops", icon: Activity, label: "ซ้อมบาส", sub: "บันทึกการซ้อม ยิง เข้า", accent: accents.hoops },
    { key: "workout", icon: Dumbbell, label: "ออกกำลังกาย", sub: "วิ่ง เวท โยคะ และอื่นๆ", accent: accents.workout },
    { key: "study", icon: BookOpen, label: "จดการเรียน", sub: "เช็กงานค้างแยกตามวิชา", accent: accents.study },
    { key: "money", icon: Wallet, label: "รายรับ-รายจ่าย", sub: "เงินเข้า เงินออก ยอดคงเหลือ", accent: accents.money },
    { key: "chores", icon: HomeIcon, label: "งานบ้าน", sub: "เช็กงานบ้านแต่ละวันในสัปดาห์", accent: accents.chores },
    { key: "stats", icon: BarChart3, label: "สรุปสัปดาห์", sub: "ภาพรวมทุกหมวดทั้ง 7 วัน", accent: accents.stats },
  ];
  return (
    <div className="w-full max-w-md mx-auto px-6 pt-14 pb-10">
      <p className="text-sm mb-1" style={{ color: muted }}>
        วันนี้อยากจดอะไร
      </p>
      <h1 className="text-3xl font-black tracking-tight mb-9" style={{ color: ink }}>
        จดไว้
      </h1>
      <div className="grid grid-cols-2 gap-3.5">
        {tiles.map((t) => (
          <button
            key={t.key}
            onClick={() => onSelect(t.key)}
            className="text-left rounded-2xl p-4 flex flex-col gap-6 transition-transform active:scale-[0.97]"
            style={{ background: surface, border: `1px solid ${line}`, minHeight: 148 }}
          >
            <t.icon size={22} color={t.accent} strokeWidth={2} />
            <div>
              <div className="font-semibold text-sm mb-1" style={{ color: ink }}>
                {t.label}
              </div>
              <div className="text-xs leading-snug" style={{ color: muted }}>
                {t.sub}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------- Basketball ----------------
const WEEKDAY_NAMES = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];

function getWeekDates() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun .. 6 = Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { date: d.toISOString().slice(0, 10), dayName: WEEKDAY_NAMES[i] };
  });
}

function shortDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

function HoopsScreen({ onBack }) {
  const accent = accents.hoops;
  const [days, setDays] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadList("hoops-log").then((stored) => {
      const week = getWeekDates().map((w) => {
        const existing = stored.find((e) => e.date === w.date && !e.extra);
        return existing || { id: uid(), date: w.date, dayName: w.dayName, made: "", attempts: "", note: "", extra: false };
      });
      const extras = stored.filter((e) => e.extra);
      setDays([...week, ...extras]);
      setLoaded(true);
    });
  }, []);

  const updateDay = (id, patch) => {
    setDays((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, ...patch } : d));
      saveList("hoops-log", next);
      return next;
    });
  };

  const addExtraDay = () => {
    setDays((prev) => {
      const next = [...prev, { id: uid(), date: todayISO(), dayName: "", made: "", attempts: "", note: "", extra: true }];
      saveList("hoops-log", next);
      return next;
    });
  };

  const removeDay = (id) => {
    setDays((prev) => {
      const next = prev.filter((d) => d.id !== id);
      saveList("hoops-log", next);
      return next;
    });
  };

  return (
    <div className="w-full max-w-md mx-auto px-6 pt-8 pb-10">
      <TopBar title="ซ้อมบาส" accent={accent} onBack={onBack} />

      {loaded &&
        days.map((d) => {
          const pct = Number(d.attempts) > 0 ? Math.round((Number(d.made) / Number(d.attempts)) * 100) : null;
          return (
            <div key={d.id} className="rounded-2xl p-4 mb-3" style={{ background: surface, border: `1px solid ${line}` }}>
              <div className="flex items-center gap-2 mb-3">
                {d.extra ? (
                  <input
                    type="date"
                    value={d.date}
                    onChange={(e) => updateDay(d.id, { date: e.target.value })}
                    style={{ background: "transparent", color: ink, border: "none", outline: "none", fontSize: "0.85rem", fontWeight: 600 }}
                  />
                ) : (
                  <>
                    <span className="font-semibold text-sm" style={{ color: ink }}>
                      วัน{d.dayName}
                    </span>
                    <span className="text-xs" style={{ color: muted }}>
                      {shortDate(d.date)}
                    </span>
                  </>
                )}
                {pct !== null && (
                  <span className="text-xs font-medium ml-auto" style={{ color: accent }}>
                    ยิง {pct}%
                  </span>
                )}
                {d.extra && (
                  <button onClick={() => removeDay(d.id)} className="p-1" style={{ color: muted }} aria-label="ลบวันนี้">
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
                  placeholder="เช่น ซ้อมชู้ตสามคะแนน วิ่งฟุตเวิร์ก"
                />
              </Field>
            </div>
          );
        })}

      <button
        onClick={addExtraDay}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm mt-1"
        style={{ border: `1px dashed ${line}`, color: muted }}
      >
        <Plus size={16} strokeWidth={2.5} />
        เพิ่มวัน
      </button>
    </div>
  );
}

// ---------------- Workout ----------------
function newMove() {
  return { id: uid(), move: "", sets: "", reps: "" };
}

function WorkoutScreen({ onBack }) {
  const accent = accents.workout;
  const [days, setDays] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadList("workout-log").then((stored) => {
      const week = getWeekDates().map((w) => {
        const existing = stored.find((e) => e.date === w.date && !e.extra);
        return existing || { id: uid(), date: w.date, dayName: w.dayName, extra: false, moves: [newMove()] };
      });
      const extras = stored.filter((e) => e.extra);
      setDays([...week, ...extras]);
      setLoaded(true);
    });
  }, []);

  const updateDayDate = (dayId, value) => {
    setDays((prev) => {
      const next = prev.map((d) => (d.id === dayId ? { ...d, date: value } : d));
      saveList("workout-log", next);
      return next;
    });
  };

  const updateMove = (dayId, moveId, patch) => {
    setDays((prev) => {
      const next = prev.map((d) =>
        d.id === dayId ? { ...d, moves: d.moves.map((m) => (m.id === moveId ? { ...m, ...patch } : m)) } : d
      );
      saveList("workout-log", next);
      return next;
    });
  };

  const addMove = (dayId) => {
    setDays((prev) => {
      const next = prev.map((d) => (d.id === dayId ? { ...d, moves: [...d.moves, newMove()] } : d));
      saveList("workout-log", next);
      return next;
    });
  };

  const removeMove = (dayId, moveId) => {
    setDays((prev) => {
      const next = prev.map((d) => (d.id === dayId ? { ...d, moves: d.moves.filter((m) => m.id !== moveId) } : d));
      saveList("workout-log", next);
      return next;
    });
  };

  const addExtraDay = () => {
    setDays((prev) => {
      const next = [...prev, { id: uid(), date: todayISO(), dayName: "", extra: true, moves: [newMove()] }];
      saveList("workout-log", next);
      return next;
    });
  };

  const removeDay = (dayId) => {
    setDays((prev) => {
      const next = prev.filter((d) => d.id !== dayId);
      saveList("workout-log", next);
      return next;
    });
  };

  return (
    <div className="w-full max-w-md mx-auto px-6 pt-8 pb-10">
      <TopBar title="ออกกำลังกาย" accent={accent} onBack={onBack} />

      {loaded &&
        days.map((d) => (
          <div key={d.id} className="rounded-2xl p-4 mb-3" style={{ background: surface, border: `1px solid ${line}` }}>
            <div className="flex items-center gap-2 mb-3">
              {d.extra ? (
                <input
                  type="date"
                  value={d.date}
                  onChange={(e) => updateDayDate(d.id, e.target.value)}
                  style={{ background: "transparent", color: ink, border: "none", outline: "none", fontSize: "0.85rem", fontWeight: 600 }}
                />
              ) : (
                <>
                  <span className="font-semibold text-sm" style={{ color: ink }}>
                    วัน{d.dayName}
                  </span>
                  <span className="text-xs" style={{ color: muted }}>
                    {shortDate(d.date)}
                  </span>
                </>
              )}
              {d.extra && (
                <button onClick={() => removeDay(d.id)} className="ml-auto p-1" style={{ color: muted }} aria-label="ลบวันนี้">
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {d.moves.map((m, idx) => (
              <div key={m.id} className={idx > 0 ? "pt-4 mt-4" : ""} style={idx > 0 ? { borderTop: `1px solid ${line}` } : undefined}>
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
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
                      className="p-1 mt-5"
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
              className="flex items-center gap-1.5 text-xs font-semibold mt-3"
              style={{ color: accent }}
            >
              <Plus size={14} strokeWidth={2.5} />
              เพิ่มท่า
            </button>
          </div>
        ))}

      <button
        onClick={addExtraDay}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm mt-1"
        style={{ border: `1px dashed ${line}`, color: muted }}
      >
        <Plus size={16} strokeWidth={2.5} />
        เพิ่มวัน
      </button>
    </div>
  );
}

// ---------------- Chores ----------------
function newChore() {
  return { id: uid(), name: "", done: false };
}

function ChoresScreen({ onBack }) {
  const accent = accents.chores;
  const [days, setDays] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadList("chores-log").then((stored) => {
      const week = getWeekDates().map((w) => {
        const existing = stored.find((e) => e.date === w.date && !e.extra);
        return existing || { id: uid(), date: w.date, dayName: w.dayName, extra: false, chores: [newChore()] };
      });
      const extras = stored.filter((e) => e.extra);
      setDays([...week, ...extras]);
      setLoaded(true);
    });
  }, []);

  const updateDayDate = (dayId, value) => {
    setDays((prev) => {
      const next = prev.map((d) => (d.id === dayId ? { ...d, date: value } : d));
      saveList("chores-log", next);
      return next;
    });
  };

  const updateChore = (dayId, choreId, patch) => {
    setDays((prev) => {
      const next = prev.map((d) =>
        d.id === dayId ? { ...d, chores: d.chores.map((c) => (c.id === choreId ? { ...c, ...patch } : c)) } : d
      );
      saveList("chores-log", next);
      return next;
    });
  };

  const addChore = (dayId) => {
    setDays((prev) => {
      const next = prev.map((d) => (d.id === dayId ? { ...d, chores: [...d.chores, newChore()] } : d));
      saveList("chores-log", next);
      return next;
    });
  };

  const removeChore = (dayId, choreId) => {
    setDays((prev) => {
      const next = prev.map((d) => (d.id === dayId ? { ...d, chores: d.chores.filter((c) => c.id !== choreId) } : d));
      saveList("chores-log", next);
      return next;
    });
  };

  const addExtraDay = () => {
    setDays((prev) => {
      const next = [...prev, { id: uid(), date: todayISO(), dayName: "", extra: true, chores: [newChore()] }];
      saveList("chores-log", next);
      return next;
    });
  };

  const removeDay = (dayId) => {
    setDays((prev) => {
      const next = prev.filter((d) => d.id !== dayId);
      saveList("chores-log", next);
      return next;
    });
  };

  return (
    <div className="w-full max-w-md mx-auto px-6 pt-8 pb-10">
      <TopBar title="งานบ้าน" accent={accent} onBack={onBack} />

      {loaded &&
        days.map((d) => {
          const pending = d.chores.filter((c) => c.name && !c.done).length;
          return (
            <div key={d.id} className="rounded-2xl p-4 mb-3" style={{ background: surface, border: `1px solid ${line}` }}>
              <div className="flex items-center gap-2 mb-3">
                {d.extra ? (
                  <input
                    type="date"
                    value={d.date}
                    onChange={(e) => updateDayDate(d.id, e.target.value)}
                    style={{ background: "transparent", color: ink, border: "none", outline: "none", fontSize: "0.85rem", fontWeight: 600 }}
                  />
                ) : (
                  <>
                    <span className="font-semibold text-sm" style={{ color: ink }}>
                      วัน{d.dayName}
                    </span>
                    <span className="text-xs" style={{ color: muted }}>
                      {shortDate(d.date)}
                    </span>
                  </>
                )}
                {pending > 0 && (
                  <span className="text-xs font-medium ml-auto" style={{ color: accent }}>
                    ค้าง {pending}
                  </span>
                )}
                {d.extra && (
                  <button onClick={() => removeDay(d.id)} className="p-1" style={{ color: muted }} aria-label="ลบวันนี้">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {d.chores.map((c) => (
                <div key={c.id} className="flex items-center gap-2.5 py-2" style={{ borderTop: `1px solid ${line}` }}>
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
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: c.done ? muted : ink,
                      textDecoration: c.done ? "line-through" : "none",
                      fontSize: "0.9rem",
                    }}
                  />
                  <button onClick={() => removeChore(d.id, c.id)} className="p-1 shrink-0" style={{ color: muted }} aria-label="ลบงานนี้">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              <button
                onClick={() => addChore(d.id)}
                className="flex items-center gap-1.5 text-xs font-semibold mt-3"
                style={{ color: accent }}
              >
                <Plus size={14} strokeWidth={2.5} />
                เพิ่มงานบ้าน
              </button>
            </div>
          );
        })}

      <button
        onClick={addExtraDay}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm mt-1"
        style={{ border: `1px dashed ${line}`, color: muted }}
      >
        <Plus size={16} strokeWidth={2.5} />
        เพิ่มวัน
      </button>
    </div>
  );
}

// ---------------- Study ----------------
function newTask() {
  return { id: uid(), name: "", done: false };
}
function newSubject() {
  return { id: uid(), name: "", code: "", tasks: [newTask()] };
}

function StudyScreen({ onBack }) {
  const accent = accents.study;
  const [subjects, setSubjects] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadList("study-log").then((stored) => {
      setSubjects(stored.length ? stored : [newSubject()]);
      setLoaded(true);
    });
  }, []);

  const updateSubject = (id, patch) => {
    setSubjects((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...patch } : s));
      saveList("study-log", next);
      return next;
    });
  };

  const addSubject = () => {
    setSubjects((prev) => {
      const next = [...prev, newSubject()];
      saveList("study-log", next);
      return next;
    });
  };

  const removeSubject = (id) => {
    setSubjects((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveList("study-log", next);
      return next;
    });
  };

  const updateTask = (subjectId, taskId, patch) => {
    setSubjects((prev) => {
      const next = prev.map((s) =>
        s.id === subjectId ? { ...s, tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)) } : s
      );
      saveList("study-log", next);
      return next;
    });
  };

  const addTask = (subjectId) => {
    setSubjects((prev) => {
      const next = prev.map((s) => (s.id === subjectId ? { ...s, tasks: [...s.tasks, newTask()] } : s));
      saveList("study-log", next);
      return next;
    });
  };

  const removeTask = (subjectId, taskId) => {
    setSubjects((prev) => {
      const next = prev.map((s) => (s.id === subjectId ? { ...s, tasks: s.tasks.filter((t) => t.id !== taskId) } : s));
      saveList("study-log", next);
      return next;
    });
  };

  return (
    <div className="w-full max-w-md mx-auto px-6 pt-8 pb-10">
      <TopBar title="จดการเรียน" accent={accent} onBack={onBack} />

      {loaded &&
        subjects.map((s) => {
          const pending = s.tasks.filter((t) => t.name && !t.done).length;
          return (
            <div key={s.id} className="rounded-2xl p-4 mb-3" style={{ background: surface, border: `1px solid ${line}` }}>
              <div className="flex items-start gap-2 mb-1">
                <div className="flex-1 grid grid-cols-2 gap-x-4">
                  <Field label="ชื่อวิชา">
                    <Underline
                      accent={accent}
                      type="text"
                      value={s.name}
                      onChange={(e) => updateSubject(s.id, { name: e.target.value })}
                      placeholder="แคลคูลัส"
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
                <button onClick={() => removeSubject(s.id)} className="p-1 mt-5" style={{ color: muted }} aria-label="ลบวิชานี้">
                  <Trash2 size={15} />
                </button>
              </div>

              {pending > 0 && (
                <p className="text-xs mb-1" style={{ color: accent }}>
                  ขาดอยู่ {pending} งาน
                </p>
              )}

              {s.tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-2.5 py-2" style={{ borderTop: `1px solid ${line}` }}>
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
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: t.done ? muted : ink,
                      textDecoration: t.done ? "line-through" : "none",
                      fontSize: "0.9rem",
                    }}
                  />
                  <button onClick={() => removeTask(s.id, t.id)} className="p-1 shrink-0" style={{ color: muted }} aria-label="ลบงานนี้">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              <button
                onClick={() => addTask(s.id)}
                className="flex items-center gap-1.5 text-xs font-semibold mt-3"
                style={{ color: accent }}
              >
                <Plus size={14} strokeWidth={2.5} />
                เพิ่มงาน
              </button>
            </div>
          );
        })}

      <button
        onClick={addSubject}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm mt-1"
        style={{ border: `1px dashed ${line}`, color: muted }}
      >
        <Plus size={16} strokeWidth={2.5} />
        เพิ่มวิชา
      </button>
    </div>
  );
}

// ---------------- Finance ----------------
function MoneyScreen({ onBack }) {
  const accent = accents.money;
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [kind, setKind] = useState("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [editingFavs, setEditingFavs] = useState(false);

  useEffect(() => {
    loadList("finance-log").then((l) => {
      setEntries(l);
      setLoaded(true);
    });
    loadList("finance-favorites").then(setFavorites);
  }, []);

  const add = () => {
    const amt = Number(amount);
    if (!amt) return;
    const next = [{ id: uid(), date, kind, amount: amt, category, note }, ...entries];
    setEntries(next);
    saveList("finance-log", next);
    setAmount("");
    setCategory("");
    setNote("");
  };

  const remove = (id) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    saveList("finance-log", next);
  };

  const quickAdd = (fav) => {
    const amt = Number(fav.amount);
    if (!amt) return;
    const next = [{ id: uid(), date: todayISO(), kind: fav.kind, amount: amt, category: fav.category, note: fav.name }, ...entries];
    setEntries(next);
    saveList("finance-log", next);
  };

  const updateFav = (id, patch) => {
    setFavorites((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, ...patch } : f));
      saveList("finance-favorites", next);
      return next;
    });
  };

  const addFav = () => {
    setFavorites((prev) => {
      const next = [...prev, { id: uid(), name: "", amount: "", kind: "expense", category: "" }];
      saveList("finance-favorites", next);
      return next;
    });
  };

  const removeFav = (id) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.id !== id);
      saveList("finance-favorites", next);
      return next;
    });
  };

  const totalIncome = entries.filter((e) => e.kind === "income").reduce((s, e) => s + e.amount, 0);
  const totalExpense = entries.filter((e) => e.kind === "expense").reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;
  const fmt = (n) => n.toLocaleString("th-TH", { maximumFractionDigits: 2 });

  return (
    <div className="w-full max-w-md mx-auto px-6 pt-8 pb-10">
      <TopBar title="รายรับ-รายจ่าย" accent={accent} onBack={onBack} />

      <div className="mb-7">
        <p className="text-xs mb-1" style={{ color: muted }}>
          ยอดคงเหลือ
        </p>
        <p className="text-4xl font-black tracking-tight" style={{ color: balance >= 0 ? ink : "#D9695F" }}>
          ฿{fmt(balance)}
        </p>
        <div className="flex gap-5 mt-2 text-xs">
          <span style={{ color: accents.workout }}>รับ ฿{fmt(totalIncome)}</span>
          <span style={{ color: "#D9695F" }}>จ่าย ฿{fmt(totalExpense)}</span>
        </div>
      </div>

      <div className="mb-7">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs" style={{ color: muted }}>
            รายการโปรด
          </p>
          <button onClick={() => setEditingFavs((v) => !v)} className="text-xs font-semibold" style={{ color: accent }}>
            {editingFavs ? "เสร็จ" : "แก้ไข"}
          </button>
        </div>

        {!editingFavs &&
          (favorites.length === 0 ? (
            <p className="text-xs" style={{ color: muted }}>
              ยังไม่มีรายการโปรด กด "แก้ไข" เพื่อเพิ่มของที่ซื้อราคาเดิมทุกวัน
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {favorites.map((f) => (
                <button
                  key={f.id}
                  onClick={() => quickAdd(f)}
                  className="px-3.5 py-2.5 rounded-xl text-left"
                  style={{ background: surface, border: `1px solid ${line}` }}
                >
                  <div className="text-xs font-medium" style={{ color: ink }}>
                    {f.name || "ไม่มีชื่อ"}
                  </div>
                  <div className="text-xs" style={{ color: f.kind === "income" ? accents.workout : "#D9695F" }}>
                    {f.kind === "income" ? "+" : "-"}฿{fmt(Number(f.amount) || 0)}
                  </div>
                </button>
              ))}
            </div>
          ))}

        {editingFavs && (
          <div className="flex flex-col gap-3">
            {favorites.map((f) => (
              <div key={f.id} className="rounded-xl p-3" style={{ background: surface, border: `1px solid ${line}` }}>
                <div className="flex gap-2 mb-3">
                  {[
                    { key: "income", label: "รายรับ" },
                    { key: "expense", label: "รายจ่าย" },
                  ].map((k) => (
                    <button
                      key={k.key}
                      onClick={() => updateFav(f.id, { kind: k.key })}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                      style={{
                        background: f.kind === k.key ? accent : "transparent",
                        color: f.kind === k.key ? "#12141C" : muted,
                        border: `1px solid ${f.kind === k.key ? accent : line}`,
                      }}
                    >
                      {k.label}
                    </button>
                  ))}
                  <button onClick={() => removeFav(f.id)} className="p-1.5" style={{ color: muted }} aria-label="ลบรายการโปรดนี้">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-x-4">
                  <Field label="ชื่อ">
                    <Underline accent={accent} type="text" value={f.name} onChange={(e) => updateFav(f.id, { name: e.target.value })} placeholder="กาแฟ" />
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
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold text-xs"
              style={{ border: `1px dashed ${line}`, color: muted }}
            >
              <Plus size={14} strokeWidth={2.5} />
              เพิ่มรายการโปรด
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl p-4 mb-8" style={{ background: surface, border: `1px solid ${line}` }}>
        <div className="flex gap-2 mb-4">
          {[
            { key: "income", label: "รายรับ" },
            { key: "expense", label: "รายจ่าย" },
          ].map((k) => (
            <button
              key={k.key}
              onClick={() => setKind(k.key)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: kind === k.key ? accent : "transparent",
                color: kind === k.key ? "#12141C" : muted,
                border: `1px solid ${kind === k.key ? accent : line}`,
              }}
            >
              {k.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="จำนวนเงิน (บาท)">
            <Underline accent={accent} type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="150" />
          </Field>
          <Field label="วันที่">
            <Underline accent={accent} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
        <Field label="หมวดหมู่">
          <Underline accent={accent} type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="อาหาร, ค่าเดินทาง ฯลฯ" />
        </Field>
        <Field label="โน้ต (ไม่บังคับ)">
          <Underline accent={accent} type="text" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <AddButton accent={accent} onClick={add}>
          บันทึกรายการ
        </AddButton>
      </div>

      {loaded && entries.length === 0 && <Empty text="ยังไม่มีรายการ เริ่มบันทึกรายการแรกกันเลย" />}
      {entries.map((e) => (
        <EntryRow key={e.id} onDelete={() => remove(e.id)}>
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="font-semibold text-sm" style={{ color: e.kind === "income" ? accents.workout : "#D9695F" }}>
              {e.kind === "income" ? "+" : "-"}฿{fmt(e.amount)}
            </span>
            {e.category && (
              <span className="text-xs" style={{ color: muted }}>
                {e.category}
              </span>
            )}
            <span className="text-xs ml-auto mr-2" style={{ color: muted }}>
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
    </div>
  );
}

// ---------------- Weekly summary ----------------
function StatsScreen({ onBack }) {
  const accent = accents.stats;
  const [hoopsDays, setHoopsDays] = useState([]);
  const [workoutDays, setWorkoutDays] = useState([]);
  const [choreDays, setChoreDays] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([loadList("hoops-log"), loadList("workout-log"), loadList("chores-log")]).then(([h, w, c]) => {
      setHoopsDays(h.filter((d) => !d.extra));
      setWorkoutDays(w.filter((d) => !d.extra));
      setChoreDays(c.filter((d) => !d.extra));
      setLoaded(true);
    });
  }, []);

  const week = getWeekDates();
  const byDate = (list, date) => list.find((d) => d.date === date);

  return (
    <div className="w-full max-w-md mx-auto px-6 pt-8 pb-10">
      <TopBar title="สรุปสัปดาห์" accent={accent} onBack={onBack} />

      {loaded &&
        week.map((w) => {
          const hoop = byDate(hoopsDays, w.date);
          const workout = byDate(workoutDays, w.date);
          const chore = byDate(choreDays, w.date);

          const hoopActive = hoop && (Number(hoop.made) > 0 || Number(hoop.attempts) > 0 || hoop.note);
          const moves = workout ? workout.moves.filter((m) => m.move) : [];
          const choresAll = chore ? chore.chores.filter((c) => c.name) : [];
          const choresDone = choresAll.filter((c) => c.done);
          const hasAnything = hoopActive || moves.length > 0 || choresAll.length > 0;

          return (
            <div key={w.date} className="rounded-2xl p-4 mb-3" style={{ background: surface, border: `1px solid ${line}` }}>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-semibold text-sm" style={{ color: ink }}>
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
                      <Activity size={14} color={accents.hoops} className="shrink-0 mt-0.5" />
                      <span style={{ color: muted }}>
                        ซ้อมบาส{Number(hoop.attempts) > 0 ? ` — ${hoop.made || 0}/${hoop.attempts} เข้า` : ""}
                        {hoop.note ? ` · ${hoop.note}` : ""}
                      </span>
                    </div>
                  )}
                  {moves.length > 0 && (
                    <div className="flex gap-2 text-xs">
                      <Dumbbell size={14} color={accents.workout} className="shrink-0 mt-0.5" />
                      <span style={{ color: muted }}>
                        ออกกำลังกาย — {moves.map((m) => m.move + (m.sets && m.reps ? ` (${m.sets}x${m.reps})` : "")).join(", ")}
                      </span>
                    </div>
                  )}
                  {choresAll.length > 0 && (
                    <div className="flex gap-2 text-xs">
                      <HomeIcon size={14} color={accents.chores} className="shrink-0 mt-0.5" />
                      <span style={{ color: muted }}>
                        งานบ้าน — เสร็จ {choresDone.length}/{choresAll.length}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

// ---------------- App ----------------
export default function App() {
  const [view, setView] = useState("home");

  return (
    <div style={{ background: bg, minHeight: "100vh" }} className="font-sans">
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
