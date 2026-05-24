import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, DollarSign } from "lucide-react";
import { FaWhatsapp, FaInstagram, FaYoutube, FaFacebook } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { PricingModal } from "@/components/PricingModal";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { name: t.nav.home, id: "inicio" },
    { name: t.nav.biography, id: "biografia" },
    { name: t.nav.shows, id: "shows" },
    { name: t.nav.contact, id: "contacto" },
    { name: t.nav.pricing, id: "pricing", action: () => { setIsOpen(false); setShowPricing(true); } },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/60 backdrop-blur-md border-b border-primary/20 py-3 md:py-4"
            : "bg-transparent py-4 md:py-6"
        }`}
      >
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between gap-2">

          <div className="flex items-center" style={{ minWidth: 36 }}>
            <button
              onClick={() => setIsOpen(true)}
              className="text-white hover:text-primary transition-colors"
              aria-label="Abrir menú"
            >
              <Menu className="w-7 h-7 md:w-8 md:h-8" />
            </button>
          </div>

          <div
            className="flex-1 text-center cursor-pointer whitespace-nowrap"
            onClick={() => scrollToSection("inicio")}
          >
            <span
              className="font-bold text-white"
              style={{ fontSize: "clamp(0.85rem, 4vw, 1.5rem)", letterSpacing: "0.15em" }}
            >
              JEFF <span className="text-primary">BUITRAGO</span>
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3" style={{ minWidth: 36 }}>
            <button
              onClick={() => setLanguage(language === "es" ? "en" : "es")}
              className="text-xs font-bold tracking-widest text-gray-400 hover:text-primary transition-colors border border-white/10 rounded px-2 py-1 uppercase"
              title="Cambiar idioma"
            >
              {language === "es" ? "EN" : "ES"}
            </button>

            <a
              href="https://wa.me/15716038060"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-primary transition-colors"
            >
              <FaWhatsapp className="w-6 h-6 md:w-7 md:h-7" />
            </a>


          </div>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 w-3/4 max-w-sm h-[100dvh] bg-[#111] border-r border-primary/20 z-50 shadow-[20px_0_50px_rgba(0,0,0,0.5)] flex flex-col"
            >
              <div className="p-6 flex justify-between items-center">
                <button
                  onClick={() => setLanguage(language === "es" ? "en" : "es")}
                  className="text-xs font-bold tracking-widest text-gray-400 hover:text-primary transition-colors border border-white/10 rounded px-2 py-1 uppercase"
                >
                  {language === "es" ? "EN" : "ES"}
                </button>
                <button onClick={() => setIsOpen(false)} className="text-white hover:text-primary transition-colors">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="flex-1 flex flex-col justify-center px-8 gap-8">
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                    onClick={item.action || (() => scrollToSection(item.id))}
                    className="text-left text-2xl md:text-3xl font-light text-white hover:text-primary transition-colors uppercase tracking-widest"
                  >
                    {item.name}
                  </motion.button>
                ))}
              </div>

              <div className="p-8">
                <div className="text-primary text-sm tracking-widest uppercase mb-2">Social</div>
                <div className="flex gap-4">
                  <a href="https://wa.me/15716038060" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                    <FaWhatsapp className="w-6 h-6" />
                  </a>
                  <a href="https://www.instagram.com/jeffmusic01" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                    <FaInstagram className="w-6 h-6" />
                  </a>
                  <a href="https://web.facebook.com/JeffBuitragoOficial" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                    <FaFacebook className="w-6 h-6" />
                  </a>
                  <a href="https://www.youtube.com/@jeffersonbuitrago95" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                    <FaYoutube className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
    </>
  );
}
