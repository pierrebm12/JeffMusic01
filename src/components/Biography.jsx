import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useHomeData } from "@workspace/api-client-react";
import { resolveMediaUrl } from "@/lib/utils";

const fallback = {
  imageUrl: "https://res.cloudinary.com/dt4mproy3/image/upload/v1771908086/e5863a23-8d4b-469f-8d96-a39adbb299e9_e9zzzb.jpg",
  title: "Biografía",
  titleEn: "Biography",
  text1: "Jeff Buitrago es un cantante y compositor colombiano que ha construido su identidad artística a través de la pasión, la disciplina y una profunda conexión con la música romántica, ranchera y popular.",
  text1En: "Jeff Buitrago is a Colombian singer and songwriter who has built his artistic identity through passion, discipline, and a deep connection with romantic, ranchera, and popular music.",
  text2: "Desde temprana edad descubrió en la música una forma de expresar emociones reales y contar historias que conectan directamente con el corazón del público. Su trayectoria incluye presentaciones en eventos privados, corporativos y festivales, donde ha demostrado versatilidad, profesionalismo y entrega total en cada actuación.",
  text2En: "From an early age, he discovered in music a way to express real emotions and tell stories that connect directly with the heart of the audience. His career includes performances at private events, corporate events and festivals, where he has shown versatility, professionalism and total dedication in every performance.",
  text3: "Hoy, Jeff se posiciona como una de las voces emergentes de la música popular colombiana, con un estilo propio que mezcla tradición y modernidad.",
  text3En: "Today, Jeff positions himself as one of the emerging voices of Colombian popular music, with his own style that blends tradition and modernity.",
};

export function Biography() {
  const { t, language } = useLanguage();
  const { data: homeData } = useHomeData();
  const section = homeData?.sections?.biography;

  const bioTitle = language === "en" ? (section?.title_en || fallback.titleEn) : (section?.title_es || fallback.title);
  const bioText1 = language === "en" ? (section?.text1_en || fallback.text1En) : (section?.text1_es || fallback.text1);
  const bioText2 = language === "en" ? (section?.text2_en || fallback.text2En) : (section?.text2_es || fallback.text2);
  const bioText3 = language === "en" ? (section?.text3_en || fallback.text3En) : (section?.text3_es || fallback.text3);
  const imageUrl = section?.media_url || fallback.imageUrl;

  return (
    <section className="py-12 md:py-24 bg-[#0a0a0a]" id="biografia">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-20">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-1/2"
          >
            <div className="relative aspect-[4/5] md:aspect-[3/4] rounded-lg overflow-hidden border border-primary/20 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
              <img 
                src={resolveMediaUrl(imageUrl)}
                alt="Jeff Buitrago" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full md:w-1/2"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-8 border-b-2 border-primary/30 pb-2 sm:pb-4 inline-block">
              {bioTitle}
            </h2>
            
            <div className="space-y-4 sm:space-y-6 text-gray-300 text-base sm:text-lg leading-relaxed font-light">
              <p>{bioText1}</p>
              <p>{bioText2}</p>
              <p className="text-white font-medium border-l-4 border-primary pl-4 italic">
                {bioText3}
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
