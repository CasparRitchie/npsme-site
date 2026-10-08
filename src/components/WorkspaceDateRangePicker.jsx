import React, { useEffect, useMemo, useRef, useState } from "react";

const WEEKDAYS = {
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  fr: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
};

export default function WorkspaceDateRangePicker({ from, to, onChange, lang = "en" }) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [selecting, setSelecting] = useState("start");
  const [hoverDate, setHoverDate] = useState("");
  const [focusMonth, setFocusMonth] = useState(() => monthStart(from || new Date()));

  useEffect(() => {
    if (!open) return undefined;

    function closeOnOutsideClick(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const months = useMemo(
    () => [-1, 0, 1].map((offset) => addMonths(focusMonth, offset)),
    [focusMonth]
  );

  function openFor(part) {
    setSelecting(part);
    setHoverDate("");
    setFocusMonth(monthStart((part === "end" ? to : from) || from || new Date()));
    setOpen(true);
  }

  function chooseDate(value) {
    if (selecting === "start" || !from) {
      onChange({ from: value, to: to && to >= value ? to : "" });
      setSelecting("end");
      setHoverDate("");
      return;
    }

    if (value < from) {
      onChange({ from: value, to: "" });
      setSelecting("end");
      setHoverDate("");
      return;
    }

    onChange({ from, to: value });
    setHoverDate("");
    setOpen(false);
  }

  const previewEnd = selecting === "end" && hoverDate && from
    ? hoverDate
    : to;
  const rangeStart = from && previewEnd && previewEnd < from ? previewEnd : from;
  const rangeEnd = from && previewEnd && previewEnd < from ? from : previewEnd;
  const locale = lang === "fr" ? "fr-FR" : "en-GB";
  const copy = lang === "fr"
    ? { start: "Date de début", end: "Date de fin", choose: "Choisir", clear: "Effacer", previous: "Mois précédent", next: "Mois suivant", helpStart: "Choisissez la date de début", helpEnd: "Choisissez maintenant la date de fin" }
    : { start: "Start date", end: "End date", choose: "Choose", clear: "Clear", previous: "Previous month", next: "Next month", helpStart: "Choose the start date", helpEnd: "Now choose the end date" };

  return (
    <div className="workspace-date-range" ref={rootRef}>
      <div className="workspace-date-range-trigger">
        <button type="button" className={selecting === "start" && open ? "is-active" : ""} onClick={() => openFor("start")}>
          <span>{copy.start}</span>
          <strong>{from ? formatDate(from, locale) : copy.choose}</strong>
        </button>
        <span className="workspace-date-range-arrow" aria-hidden="true">→</span>
        <button type="button" className={selecting === "end" && open ? "is-active" : ""} onClick={() => openFor("end")}>
          <span>{copy.end}</span>
          <strong>{to ? formatDate(to, locale) : copy.choose}</strong>
        </button>
        <span className="workspace-date-range-calendar-icon" aria-hidden="true">▦</span>
      </div>

      {open && (
        <div className="workspace-date-calendar" role="dialog" aria-label={`${copy.start} – ${copy.end}`}>
          <div className="workspace-date-calendar-header">
            <button type="button" onClick={() => setFocusMonth(addMonths(focusMonth, -1))} aria-label={copy.previous}>←</button>
            <div>
              <strong>{selecting === "start" ? copy.helpStart : copy.helpEnd}</strong>
              <span>{from && to ? `${formatDate(from, locale)} – ${formatDate(to, locale)}` : "NPS Me"}</span>
            </div>
            <button type="button" onClick={() => setFocusMonth(addMonths(focusMonth, 1))} aria-label={copy.next}>→</button>
          </div>

          <div className="workspace-date-calendar-months">
            {months.map((month) => (
              <CalendarMonth
                key={month.toISOString()}
                month={month}
                locale={locale}
                weekdays={WEEKDAYS[lang] || WEEKDAYS.en}
                from={from}
                to={to}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                selecting={selecting}
                onChoose={chooseDate}
                onHover={setHoverDate}
              />
            ))}
          </div>

          <div className="workspace-date-calendar-footer">
            <span>{selecting === "start" ? copy.helpStart : copy.helpEnd}</span>
            {(from || to) && <button type="button" onClick={() => { onChange({ from: "", to: "" }); setSelecting("start"); }}>{copy.clear}</button>}
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarMonth({ month, locale, weekdays, from, to, rangeStart, rangeEnd, selecting, onChoose, onHover }) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const days = new Date(year, monthIndex + 1, 0).getDate();
  const mondayOffset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const cells = [...Array(mondayOffset).fill(null), ...Array.from({ length: days }, (_, index) => index + 1)];

  return (
    <section className="workspace-date-calendar-month">
      <h3>{month.toLocaleDateString(locale, { month: "long", year: "numeric" })}</h3>
      <div className="workspace-date-calendar-weekdays">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
      <div className="workspace-date-calendar-days">
        {cells.map((day, index) => {
          if (!day) return <span key={`empty-${index}`} className="is-empty" />;
          const value = toYmd(new Date(year, monthIndex, day));
          const inRange = Boolean(rangeStart && rangeEnd && value >= rangeStart && value <= rangeEnd);
          const isStart = value === from;
          const isEnd = value === to;
          return (
            <button
              type="button"
              key={value}
              className={`${inRange ? "is-in-range" : ""} ${isStart ? "is-start" : ""} ${isEnd ? "is-end" : ""}`}
              onClick={() => onChoose(value)}
              onMouseEnter={() => selecting === "end" && onHover(value)}
              onFocus={() => selecting === "end" && onHover(value)}
              aria-pressed={isStart || isEnd}
            >
              {day}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function monthStart(value) {
  const date = value instanceof Date ? value : new Date(`${value}T12:00:00`);
  const safe = Number.isNaN(date.getTime()) ? new Date() : date;
  return new Date(safe.getFullYear(), safe.getMonth(), 1);
}

function addMonths(value, amount) {
  return new Date(value.getFullYear(), value.getMonth() + amount, 1);
}

function toYmd(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value, locale) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}
