import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useHomeData } from "@workspace/api-client-react";
import { resolveMediaUrl } from "@/lib/utils";

const fallback = {
  videoUrl: "https://res.cloudinary.com/dt4mproy3/video/upload/f_mp4,vc_h265/v1771905565/AQP6mPoLMpqNHACeisYtRD_k9XzGuv34xurut1mE28RKTKr1Q45MbdI0KTTbFqRCOXurCWuGidERrMlZ7mbg5ThqrsC31JaMBRlcSA6tKA_xfw0om",
  title: "Espectáculo Profesional",
  titleEn: "Professional Entertainment",
  subtitle: "Música en vivo que transforma tu evento",
  subtitleEn: "Live music that transforms your event",
};

export function Hero() {
  const { t, language } = useLanguage();
  const { data: homeData } = useHomeData();
  const section = homeData?.sections?.hero;

  const heroTitle = language === "en" ? (section?.title_en || fallback.titleEn) : (section?.title_es || fallback.title);
  const heroSubtitle = language === "en" ? (section?.subtitle_en || fallback.subtitleEn) : (section?.subtitle_es || fallback.subtitle);
  const videoUrl = section?.media_url || fallback.videoUrl;

  const words = heroTitle.split(" ");
  const lastWord = words.at(-1);
  const firstWords = words.slice(0, -1).join(" ");

  return (
    <section className="relative w-full h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          key={videoUrl}
        >
          <source src={resolveMediaUrl(videoUrl)} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60 z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center text-center px-6 w-full max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-bold text-white uppercase tracking-wider w-full"
          style={{ fontSize: "clamp(2rem, 8vw, 5rem)", lineHeight: 1.1 }}
        >
          {firstWords && <span className="block">{firstWords}</span>}
          <span className="text-primary block mt-1">{lastWord}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-6 text-base sm:text-lg md:text-xl text-gray-300 font-light leading-relaxed max-w-md mx-auto"
        >
          {heroSubtitle}
        </motion.p>
      </div>

      {/* Bouncing Arrow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8 md:w-10 md:h-10 text-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
}
