import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronLeft, ChevronRight, MapPin, Clock, CalendarDays, Mic, Music } from "lucide-react";
import { resolveMediaUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";

const MONTHS_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SPANISH_MONTH_MAP = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

function parseShowDay(dayStr) {
  if (!dayStr) return null;
  const match = dayStr.match(/(\d+)\s+de\s+(\w+)/i);
  if (match) {
    const d = parseInt(match[1]);
    const monthName = match[2].toLowerCase();
    const m = SPANISH_MONTH_MAP[monthName];
    if (m !== undefined) return { day: d, month: m };
  }
  return null;
}

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export function Shows({ apiShows = [], sections = {} }) {
  const { t, language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedShow, setSelectedShow] = useState(null);
  const [inquiryDate, setInquiryDate] = useState(null);
  const [bgError, setBgError] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const parseMonthsJson = (raw) => {
    if (!raw) return {};
    try { return JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw)); } catch { return {}; }
  };
  const monthBgs = useMemo(() => parseMonthsJson(sections?.calendar?.data_json), [sections?.calendar?.data_json]);
  const monthBgUrl = monthBgs[month];
  const defaultBg = sections?.calendar?.media_url ? resolveMediaUrl(sections.calendar.media_url) : null;
  const calendarBg = !bgError && (monthBgUrl ? resolveMediaUrl(monthBgUrl) : defaultBg);

  useEffect(() => { setBgError(false); }, [monthBgUrl]);
  const monthNames = language === "en" ? MONTHS_EN : MONTHS_ES;
  const dayNames = language === "en" ? DAYS_EN : DAYS_ES;

  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);

  const showMap = useMemo(() => {
    const map = {};
    for (const show of apiShows) {
      const parsed = parseShowDay(show.day);
      if (parsed && parsed.month === month) {
        if (!map[parsed.day]) map[parsed.day] = [];
        map[parsed.day].push(show);
      }
    }
    return map;
  }, [apiShows, month]);

  const monthShows = useMemo(() => {
    return apiShows.filter(s => {
      const p = parseShowDay(s.day);
      return p && p.month === month;
    });
  }, [apiShows, month]);

  const weeks = useMemo(() => {
    const w = [];
    let currentWeek = [];
    for (const d of calendarDays) {
      currentWeek.push(d);
      if (currentWeek.length === 7) {
        w.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) w.push(currentWeek);
    return w;
  }, [calendarDays]);

  const goToPrevMonth = useCallback(() => {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }, []);

  const handleReserveClick = (show) => {
    setSelectedShow(show);
  };

  const confirmReservation = useCallback(() => {
    if (!selectedShow) return;
    const text = language === "es"
      ? encodeURIComponent(`Hola, quiero reservar el show del día ${selectedShow.day} en ${selectedShow.place}.`)
      : encodeURIComponent(`Hello, I'd like to reserve the show on ${selectedShow.day} in ${selectedShow.place}.`);
    window.open(`https://wa.me/15716038060?text=${text}`, "_blank");
    setSelectedShow(null);
  }, [selectedShow, language]);

  return (
    <section className="py-8 sm:py-12 md:py-24 bg-[#0a0a0a]" id="shows">
      <div className="container mx-auto px-3 sm:px-4 max-w-5xl">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-6 sm:mb-8 md:mb-12 border-b-2 border-primary/30 pb-2 sm:pb-3 md:pb-4 inline-block">
          {t.shows.title.split(" ").slice(0, -1).join(" ")}{" "}
          <span className="text-primary">{t.shows.title.split(" ").at(-1)}</span>
        </h2>

        {/* Calendar */}
        <div className={`relative border border-white/5 rounded-2xl overflow-hidden ${calendarBg ? "" : "bg-[#111]"}`}
          style={calendarBg ? { backgroundImage: `url(${calendarBg})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
          {/* Hidden img to detect broken background */}
          {calendarBg && <img src={calendarBg} alt="" className="hidden" onError={() => setBgError(true)} onLoad={() => setBgError(false)} />}
          {/* Dark overlay for readability */}
          {calendarBg && <div className="absolute inset-0 bg-black/60" />}
          {/* Month Navigator */}
          <div className="relative z-10 flex items-center justify-between px-3 sm:px-6 py-3 sm:py-5 bg-black/40 border-b border-white/5">
            <button onClick={goToPrevMonth}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-primary transition-all">
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <motion.h3 key={`${month}-${year}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white tracking-wider flex items-center gap-1.5 sm:gap-2">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              <span className="truncate">{monthNames[month]}</span>
              <span className="text-gray-500 font-normal hidden xs:inline">{year}</span>
            </motion.h3>
            <button onClick={goToNextMonth}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-primary transition-all">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="relative z-10 grid grid-cols-7 border-b border-white/5">
            {dayNames.map((d, i) => (
              <div key={i} className="py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <AnimatePresence mode="wait">
            <motion.div key={`grid-${month}-${year}`} className="relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}>
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 border-b border-white/5 last:border-b-0">
                  {week.map((day, di) => {
                    const shows = day ? showMap[day] || [] : [];
                    const available = shows.some(s => s.available);
                    const reserved = shows.some(s => !s.available);
                    const hasShow = shows.length > 0;

                    return (
                      <div key={di}
                        onClick={() => {
                          if (hasShow) handleReserveClick(shows[0]);
                          else if (day) setInquiryDate({ day, month, year });
                        }}
                        className={`relative min-h-[60px] sm:min-h-[72px] md:min-h-[88px] p-1 sm:p-2 transition-all cursor-pointer
                          ${!day ? "bg-black/20 cursor-default" : "hover:bg-white/[0.03]"}`}>
                        {day !== null && (
                          <div className="relative z-10">
                            <div className="flex items-start justify-between">
                              <span className={`text-sm font-medium ${hasShow ? "text-white" : "text-gray-400"}`}>
                                {day}
                              </span>
                              {hasShow && (
                                <Mic className={`w-3.5 h-3.5 mt-0.5 ${available ? "text-green-400" : "text-red-400"}`} />
                              )}
                            </div>
                            {hasShow && (
                              <div className="mt-1.5 flex items-center gap-1">
                                <span className={`text-[9px] uppercase tracking-wider font-semibold
                                  ${available ? "text-green-400/80" : "text-red-400/80"}`}>
                                  {available ? "Disponible" : "Reservado"}
                                </span>
                              </div>
                            )}
                            {!hasShow && day && (
                              <div className="mt-1.5">
                                <span className="text-[8px] text-gray-500 uppercase tracking-wider">
                                  Sin evento
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Show List */}
        <div className="mt-6 sm:mt-8 space-y-2 sm:space-y-3">
          <AnimatePresence>
            {monthShows.length === 0 && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center text-gray-500 py-8">{t.shows.noShows}</motion.p>
            )}
            {monthShows.map((show, i) => {
              const parsed = parseShowDay(show.day);
              return (
                <motion.div key={show.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleReserveClick(show)}
                  className={`group relative bg-[#111] border rounded-xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-4 cursor-pointer transition-all
                    ${show.available
                      ? "border-primary/20 hover:border-primary/40 hover:bg-black/60"
                      : "border-white/5 opacity-60 hover:opacity-80"}`}>
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 relative overflow-hidden">
                    {show.available && (
                      <div className="absolute -top-3 -right-3 w-6 h-6 bg-primary/20 rounded-full blur-sm" />
                    )}
                    <span className="text-2xl font-bold text-primary leading-none relative z-10">{parsed?.day || "?"}</span>
                    <span className="text-[10px] text-primary/60 uppercase mt-0.5 relative z-10">
                      {parsed ? monthNames[parsed.month].slice(0, 3) : ""}
                    </span>
                    <span className={`text-[8px] uppercase tracking-widest font-semibold mt-1 relative z-10
                      ${show.available ? "text-green-400" : "text-red-400"}`}>
                      {show.available ? "DISP" : "AGOT"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-gray-300 font-semibold">
                      <Music className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="truncate">{show.place}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {show.day}
                      </span>
                      {show.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {show.time}
                        </span>
                      )}
                      <span className={`flex items-center gap-1 font-medium
                        ${show.available ? "text-green-400" : "text-red-400"}`}>
                        <Mic className="w-3.5 h-3.5" />
                        {show.available ? "Disponible" : "Reservado"}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-full md:w-auto">
                    {show.available ? (
                      <Button onClick={(e) => { e.stopPropagation(); handleReserveClick(show); }}
                        className="w-full md:w-auto bg-transparent hover:bg-primary text-primary hover:text-black border border-primary rounded-full uppercase tracking-widest font-semibold text-xs h-10 px-6 transition-all">
                        {t.shows.reserve}
                      </Button>
                    ) : (
                      <div className="w-full md:w-auto h-10 px-6 flex items-center justify-center bg-white/5 text-gray-400 rounded-full border border-white/10 uppercase tracking-widest font-semibold text-xs">
                        {t.shows.soldOut}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Show Detail Modal with Blur */}
      <Dialog open={!!selectedShow} onOpenChange={(open) => !open && setSelectedShow(null)}>
        <DialogContent className="bg-[#111]/95 backdrop-blur-xl border-primary/20 text-white sm:max-w-md shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-2xl pointer-events-none" />
          <DialogHeader className="relative">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center relative overflow-hidden">
                {selectedShow?.available && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary/20 rounded-full blur-sm" />
                )}
                <span className="text-xl font-bold text-primary leading-none relative z-10">
                  {selectedShow ? parseShowDay(selectedShow.day)?.day || "?" : "?"}
                </span>
                <span className={`text-[8px] uppercase tracking-widest font-semibold relative z-10
                  ${selectedShow?.available ? "text-green-400" : "text-red-400"}`}>
                  {selectedShow?.available ? "DISP" : "AGOT"}
                </span>
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  {selectedShow?.place}
                </DialogTitle>
                <DialogDescription className="text-gray-400 mt-1">
                  {t.shows.liveShow}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="relative space-y-3 py-2">
            <div className="flex items-center gap-3 text-gray-300 bg-white/5 rounded-xl px-4 py-3">
              <CalendarDays className="w-5 h-5 text-primary" />
              <span>{selectedShow?.day}</span>
            </div>
            {selectedShow?.time && (
              <div className="flex items-center gap-3 text-gray-300 bg-white/5 rounded-xl px-4 py-3">
                <Clock className="w-5 h-5 text-primary" />
                <span>{selectedShow.time}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-gray-300 bg-white/5 rounded-xl px-4 py-3">
              <MapPin className="w-5 h-5 text-primary" />
              <span>{selectedShow?.place}</span>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              ${selectedShow?.available ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              <span className={`w-2 h-2 rounded-full ${selectedShow?.available ? "bg-green-400" : "bg-red-400"}`} />
              {selectedShow?.available ? t.shows.available : t.shows.soldOut}
            </div>
          </div>
          <DialogFooter className="relative gap-3 mt-4">
            <Button variant="outline" onClick={() => setSelectedShow(null)}
              className="border-white/20 text-white hover:bg-white/10 flex-1">
              {t.shows.cancel}
            </Button>
            {selectedShow?.available && (
              <Button onClick={confirmReservation}
                className="bg-primary text-black hover:bg-primary/90 flex-1 font-bold">
                {t.shows.goToWhatsapp}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inquiry Modal for empty dates */}
      <Dialog open={!!inquiryDate} onOpenChange={(open) => !open && setInquiryDate(null)}>
        <DialogContent className="bg-[#111]/95 backdrop-blur-xl border-primary/20 text-white sm:max-w-md shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-2xl pointer-events-none" />
          <DialogHeader className="relative">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  {language === "es" ? "¿Interesado en esta fecha?" : "Interested in this date?"}
                </DialogTitle>
                <DialogDescription className="text-gray-400 mt-1">
                  {inquiryDate && `${inquiryDate.day} de ${monthNames[inquiryDate.month]} ${inquiryDate.year}`}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="relative space-y-4 py-2">
            <div className="bg-white/5 rounded-xl px-4 py-4 text-gray-300 text-sm leading-relaxed">
              {language === "es"
                ? "Esta fecha no tiene ningún evento programado aún. Si estás interesado en contratar a Jeff Buitrago para esta fecha, contáctanos por WhatsApp para recibir información sobre disponibilidad y presupuesto."
                : "This date has no scheduled event yet. If you are interested in hiring Jeff Buitrago for this date, contact us via WhatsApp for availability and pricing information."}
            </div>
          </div>
          <DialogFooter className="relative gap-3 mt-4">
            <Button variant="outline" onClick={() => setInquiryDate(null)}
              className="border-white/20 text-white hover:bg-white/10 flex-1">
              {t.shows.cancel}
            </Button>
            <Button onClick={() => {
              const text = language === "es"
                ? encodeURIComponent(`Hola, me gustaría consultar disponibilidad y presupuesto para contratar a Jeff Buitrago el día ${inquiryDate?.day} de ${inquiryDate ? monthNames[inquiryDate.month] : ""} ${inquiryDate?.year}.`)
                : encodeURIComponent(`Hello, I would like to inquire about availability and pricing to hire Jeff Buitrago on ${inquiryDate?.day} ${inquiryDate ? monthNames[inquiryDate.month] : ""} ${inquiryDate?.year}.`);
              window.open(`https://wa.me/15716038060?text=${text}`, "_blank");
              setInquiryDate(null);
            }}
              className="bg-primary text-black hover:bg-primary/90 flex-1 font-bold gap-2">
              <Mic className="w-4 h-4" />
              {language === "es" ? "Consultar por WhatsApp" : "Ask via WhatsApp"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
