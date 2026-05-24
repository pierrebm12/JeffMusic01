import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">404</h1>
        <p className="text-lg text-gray-400 font-light">Page Not Found</p>
        <a href="/" className="inline-block mt-8 text-primary hover:text-primary/80 transition-colors underline underline-offset-4">
          Volver al inicio
        </a>
      </div>
    </div>
  );
}
