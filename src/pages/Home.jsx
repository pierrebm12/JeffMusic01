import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Biography } from "@/components/Biography";
import { PhotoGallery } from "@/components/PhotoGallery";
import { VideoGallery } from "@/components/VideoGallery";
import { Shows } from "@/components/Shows";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useHomeData } from "@workspace/api-client-react";

export function Home() {
  const [loading, setLoading] = useState(true);
  const { data } = useHomeData();

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <div id="inicio" className="min-h-[100dvh] bg-black text-foreground selection:bg-primary selection:text-black">
      <Navigation />
      <Hero />
      <Biography />
      <PhotoGallery apiPhotos={data?.photos} />
      <VideoGallery apiVideos={data?.videos} sections={data?.sections} />
      <Shows apiShows={data?.shows} sections={data?.sections} />
      <ContactForm />
      <Footer />
    </div>
  );
}
