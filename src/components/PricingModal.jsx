import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Music, Users, Truck, DollarSign, Check, Sparkles, Star } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const pricingItems = [
  { key: "showArtist", icon: Music, price: 500, highlight: true },
  { key: "dancer1", icon: Users, price: 250 },
  { key: "dancer2", icon: Users, price: 250 },
  { key: "transportArtist", icon: Truck, price: 200 },
  { key: "transportDancer", icon: Truck, price: 300 },
];

export function PricingModal({ open, onClose }) {
  const { t, language } = useLanguage();
  const [selectedItems, setSelectedItems] = useState(
    pricingItems.map((_, i) => i)
  );
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const toggleItem = (index) => {
    setSelectedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const total = selectedItems.reduce(
    (sum, i) => sum + pricingItems[i].price,
    0
  );

  const handleBook = () => {
    const selected = selectedItems
      .map((i) => t.pricing[pricingItems[i].key])
      .join(", ");
    const text =
      language === "es"
        ? encodeURIComponent(
            `Hola, me interesa reservar: ${selected}. Total estimado: $${total} USD. ¿Podemos coordinar los detalles?`
          )
        : encodeURIComponent(
            `Hello, I'm interested in booking: ${selected}. Estimated total: $${total} USD. Can we coordinate the details?`
          );
    window.open(`https://wa.me/15716038060?text=${text}`, "_blank");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-2 sm:inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full bg-[#0d0d0d] border border-primary/20 rounded-2xl z-[70] overflow-hidden shadow-[0_0_80px_rgba(212,175,55,0.15)]"
          >
            {/* Header */}
            <div className="relative p-4 sm:p-6 pb-3 sm:pb-4 border-b border-primary/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wider uppercase truncate">
                      {t.pricing.title}
                    </h2>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm truncate">{t.pricing.subtitle}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition-all flex-shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Pricing Items */}
            <div className="p-4 sm:p-6 space-y-2 sm:space-y-3 max-h-[40vh] sm:max-h-[50vh] overflow-y-auto">
              {pricingItems.map((item, index) => {
                const isSelected = selectedItems.includes(index);
                const isHovered = hoveredIndex === index;
                const Icon = item.icon;

                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    onClick={() => toggleItem(index)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? "bg-primary/10 border-primary/40 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                        : "bg-white/[0.02] border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-primary text-black"
                          : "bg-white/5 text-gray-500"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 text-left">
                      <div
                        className={`text-sm font-medium transition-colors ${
                          isSelected ? "text-white" : "text-gray-400"
                        }`}
                      >
                        {t.pricing[item.key]}
                      </div>
                      {item.highlight && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 text-primary" />
                          <span className="text-[10px] text-primary uppercase tracking-wider">
                            {language === "es" ? "Principal" : "Main"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-lg font-bold transition-colors ${
                          isSelected ? "text-primary" : "text-gray-500"
                        }`}
                      >
                        ${item.price}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-white/20"
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <Check className="w-3 h-3 text-black" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Total & CTA */}
            <div className="p-4 sm:p-6 pt-3 sm:pt-4 border-t border-primary/10 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs sm:text-sm uppercase tracking-wider">
                  {t.pricing.total}
                </span>
                <motion.div
                  key={total}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-2xl sm:text-3xl font-bold text-primary"
                >
                  ${total}
                  <span className="text-xs sm:text-sm text-gray-500 ml-1">USD</span>
                </motion.div>
              </div>

              <Button
                onClick={handleBook}
                disabled={selectedItems.length === 0}
                className="w-full h-11 sm:h-14 bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed gap-2 text-xs sm:text-sm"
              >
                <FaWhatsapp className="w-4 h-4 sm:w-5 sm:h-5" />
                {t.pricing.bookNow}
              </Button>

              <p className="text-gray-600 text-[10px] sm:text-xs text-center">
                {t.pricing.note}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
