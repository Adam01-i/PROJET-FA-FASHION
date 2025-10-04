import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* À propos */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">À propos</h3>
            <p className="text-sm leading-relaxed">
              K-Shop est votre destination en ligne pour des produits de qualité.
              Découvrez notre large sélection d’articles et profitez d’une expérience d’achat unique.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              {[
                { path: "/about", label: "Qui sommes-nous" },
                { path: "/terms", label: "Conditions générales" },
                { path: "/privacy", label: "Politique de confidentialité" },
                { path: "/shipping", label: "Livraison" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-indigo-400" />
                Rufisque Arafat 2
              </li>
              <li className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-indigo-400" />
                +221 76 199 49 84
              </li>
              <li className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-indigo-400" />
                contact@eshop.com
              </li>
            </ul>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Suivez-nous</h3>
            <div className="flex space-x-4">
              {[
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Instagram, href: "#" },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  className="hover:text-indigo-400 transition-colors duration-200"
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bas de page */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm opacity-70">
          <p>&copy; {new Date().getFullYear()} K-Shop. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
