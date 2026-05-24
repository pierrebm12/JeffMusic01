import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { resolveMediaUrl } from "@/lib/utils";

const fallbackVideos = [
  {
    url: "https://res.cloudinary.com/dt4mproy3/video/upload/f_mp4,vc_h264/v1771998543/AQMzb2-vpU2R5SpT7MoXMP5_mypM5Oq1lk9IeLyXFs2bxT2oTYY6mJ2a6fvUoz709YJuOKglnJzygCxcUrZbASJikNKKi7a_5kb9oYPZNQ_sq5uml",
    title: "Yo Me Llamo",
    titleEn: "Yo Me Llamo",
  },
  {
    url: "https://res.cloudinary.com/dt4mproy3/video/upload/f_mp4,vc_h264/v1771909268/AQOoXJQAIjhYujWbn5BWzSD-NR6K6avfVBp-QMnTEfa5T6dV-f7pqttS_ZVbxq2ZcjX6FInSSdvmQT936l6KUEpAOEH9L1w4HK4DsHhjIQ_qf8128",
    title: "Evento Privado",
    titleEn: "Private Event",
  },
  {
    url: "https://res.cloudinary.com/dt4mproy3/video/upload/f_mp4,vc_h264/v1771997698/AQPi0IwEPOUizVJKFQCNns3rAR5JK7EdZHt-ncETErz6bOQ4jjZvK6i7W8gb7Euo4KYhCYTW6YSo3H0Tk0g906P2vFgsZ8Pn4A1KOcE_cdo7fv",
    title: "Festival Nacional",
    titleEn: "National Festival",
  },
];

export function VideoGallery({ apiVideos = [], sections = {} }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const { t, language } = useLanguage();
  const touchStartX = useRef(0);
  const videoRef = useRef(null);
  const sectionRef = useRef(null);

  // Read auto-advance time from sections data (ms), default 8000
  const parseSettings = (raw) => {
    if (!raw) return {};
    try { return JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw)); } catch { return {}; }
  };
  const videoSettings = useMemo(() => parseSettings(sections?.videos_gallery?.data_json), [sections?.videos_gallery?.data_json]);
  const autoAdvanceMs = videoSettings?.autoAdvanceMs || 8000;

  const videos = apiVideos.length > 0 ? apiVideos : fallbackVideos;

  const paginate = (dir) => {
    setDirection(dir);
    setCurrentIndex((prev) => (prev + dir + videos.length) % videos.length);
  };

  // Auto mute/unmute based on scroll visibility
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsMuted(!entry.isIntersecting);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Toggle mute on current video element
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  // Auto-advance based on configured interval
  useEffect(() => {
    if (videos.length <= 1) return;
    const timer = setInterval(() => paginate(1), autoAdvanceMs);
    return () => clearInterval(timer);
  }, [videos.length, currentIndex, autoAdvanceMs]);

  // Sync isMuted with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [currentIndex, isMuted]);

  // Touch swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 35) paginate(diff > 0 ? 1 : -1);
  };

  if (videos.length === 0) return null;

  const current = videos[currentIndex];
  const resolvedUrl = resolveMediaUrl(current.url);
  const videoSrc = resolvedUrl.endsWith(".mp4") ? resolvedUrl : `${resolvedUrl}.mp4`;
  const displayTitle =
    language === "en" && current.titleEn ? current.titleEn : current.title;
  const featuredLabel = language === "en" ? "Featured" : "Destacados";

  return (
    <section ref={sectionRef} className="py-12 md:py-24 bg-[#111] overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-6 md:mb-12 border-b-2 border-primary/30 pb-3 md:pb-4 inline-block">
          {t.gallery.videos}{" "}
          <span className="text-primary">{featuredLabel}</span>
        </h2>

        {/* Portrait on mobile (9:16), landscape on desktop (16:9) */}
        <div
          className="relative w-full max-w-sm mx-auto md:max-w-4xl aspect-[9/16] md:aspect-[16/9] rounded-xl overflow-hidden bg-black border border-white/5 shadow-2xl select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 80 : -80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -80 : 80 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <video
                ref={videoRef}
                key={current.url}
                src={videoSrc}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                controls
                controlsList="nodownload"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-0 left-0 w-full px-5 pt-4 pb-10 bg-gradient-to-b from-black/75 to-transparent pointer-events-none">
                <h3 className="text-base sm:text-lg md:text-2xl font-bold text-white tracking-wider drop-shadow-md">
                  {displayTitle}
                </h3>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Floating mute/unmute button */}
          <button onClick={toggleMute}
            className="absolute bottom-4 right-4 z-30 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:text-black hover:border-primary transition-all shadow-lg"
            aria-label={isMuted ? "Activar audio" : "Silenciar"}>
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Dot indicators only */}
          {videos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {videos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > currentIndex ? 1 : -1);
                    setCurrentIndex(i);
                  }}
                  className={`rounded-full transition-all duration-300 h-2 ${
                    i === currentIndex
                      ? "bg-primary w-6"
                      : "bg-white/40 w-2 hover:bg-white/70"
                  }`}
                  aria-label={`Video ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
