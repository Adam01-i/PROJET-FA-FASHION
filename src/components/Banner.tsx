import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const images = [
  "/img2.png",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1920&q=80",
  "img4.jpg",
];

export default function Banner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative w-full h-screen flex items-center justify-center text-white pt-16 overflow-hidden"
      style={{
        backgroundImage: `url('${images[currentIndex]}')`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        transition: "background-image 1s ease-in-out",
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 text-center px-6 md:px-12 max-w-4xl">
        <motion.h1
          className="text-4xl md:text-6xl font-bold leading-tight drop-shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Bienvenue sur{" "}
          <span className="text-indigo-400">KoundoulShop</span>
        </motion.h1>

        <motion.p
          className="mt-4 text-indigo-200 text-lg max-w-2xl mx-auto drop-shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          KoundoulShop, votre boutique en ligne au Sénégal. Livraison rapide,
          paiement sécurisé (Wave, Orange Money).
        </motion.p>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Link
            to="#products"
            className="inline-block px-8 py-4 bg-indigo-500 text-white font-semibold rounded-md shadow-lg hover:bg-indigo-600 transition"
          >
            Découvrir les produits
          </Link>
        </motion.div>

        <div className="flex justify-center mt-10 space-x-4">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`w-4 h-4 rounded-full cursor-pointer ${
                currentIndex === idx ? "bg-indigo-400" : "bg-indigo-200/60"
              } shadow-lg`}
              aria-label={`Image ${idx + 1}`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
      </div>
    </div>

  );
}
