import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink, Code } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaGithub, FaLinkedin } from 'react-icons/fa';
import { useSiteSettings } from '../../../hooks/useSiteSettings';

export default function Footer() {
  const { settings, loading } = useSiteSettings();

  if (loading) {
    return (
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className=" rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2">Chargement...</p>
        </div>
      </footer>
    );
  }

  const { store, socialLinks, developerInfo } = settings;

  return (
    <footer className="bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* À propos */}
          <div className="lg:col-span-2">
            <h3 className="text-white text-lg font-semibold mb-4">À propos</h3>
            <p className="text-sm leading-relaxed">
              {store.description || "Fa-Fashion est votre destination en ligne pour des produits de qualité. Découvrez notre large sélection d'articles et profitez d'une expérience d'achat unique."}
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
                {store.address || "Rufisque Arafat 2"}
              </li>
              <li className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-indigo-400" />
                {store.phone || "+221 76 199 49 84"}
              </li>
              <li className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-indigo-400" />
                {store.email || "contact@fafashion.com"}
              </li>
            </ul>
          </div>

          {/* Section Développeur */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
              <Code className="h-5 w-5 mr-2" />
              Développeur
            </h3>
            
            {/* Nom du développeur */}
            {developerInfo.developer_name && (
              <div className="mb-3">
                <p className="text-sm font-medium text-white">
                  {developerInfo.developer_name}
                </p>
                {developerInfo.description && (
                  <p className="text-xs text-gray-200 mt-1">
                    {developerInfo.description}
                  </p>
                )}
              </div>
            )}

            {/* Réseaux sociaux du développeur */}
            <div className="flex flex-wrap gap-3">
              {developerInfo.github_url && (
                <a
                  href={developerInfo.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                  title="GitHub"
                >
                  <FaGithub className="h-5 w-5" />
                </a>
              )}
              
              {developerInfo.linkedin_url && (
                <a
                  href={developerInfo.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                  title="LinkedIn"
                >
                  <FaLinkedin className="h-5 w-5" />
                </a>
              )}
              
              {developerInfo.instagram_url && (
                <a
                  href={developerInfo.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                  title="Instagram"
                >
                  <FaInstagram className="h-5 w-5" />
                </a>
              )}
              
              {developerInfo.portfolio_url && (
                <a
                  href={developerInfo.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                  title="Portfolio"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              )}
              
            </div>

            {/* Contact du développeur */}
            {(developerInfo.developer_email || developerInfo.developer_phone) && (
              <div className="mt-3 space-y-1">
                {developerInfo.developer_email && (
                  <div className="flex items-center text-xs">
                    <Mail className="h-3 w-3 mr-1" />
                    <a 
                      href={`mailto:${developerInfo.developer_email}`}
                      className="hover:text-white transition-colors"
                    >
                      {developerInfo.developer_email}
                    </a>
                  </div>
                )}
                {developerInfo.developer_phone && (
                  <div className="flex items-center text-xs">
                    <Phone className="h-3 w-3 mr-1" />
                    <a 
                      href={`tel:${developerInfo.developer_phone}`}
                      className="hover:text-white transition-colors"
                    >
                      {developerInfo.developer_phone}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Réseaux sociaux de la boutique - Section déplacée ici */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h4 className="text-white text-sm font-semibold mb-2">Suivez-nous</h4>
              <div className="flex space-x-4">
                {[
                  { 
                    icon: FaFacebook, 
                    href: socialLinks.facebook_url || "#", 
                    enabled: !!socialLinks.facebook_url,
                    title: "Facebook"
                  },
                  { 
                    icon: FaTwitter, 
                    href: socialLinks.twitter_url || "#", 
                    enabled: !!socialLinks.twitter_url,
                    title: "Twitter"
                  },
                  { 
                    icon: FaInstagram, 
                    href: socialLinks.instagram_url || "#", 
                    enabled: !!socialLinks.instagram_url,
                    title: "Instagram"
                  },
                  { 
                    icon: FaLinkedin, 
                    href: socialLinks.linkedin_url || "#", 
                    enabled: !!socialLinks.linkedin_url,
                    title: "LinkedIn"
                  },
                ].map((social, idx) => (
                  social.enabled && (
                    <a
                      key={idx}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                      title={social.title}
                    >
                      <social.icon className="h-5 w-5" />
                    </a>
                  )
                ))}
              </div>
            </div>
            
            {/* Bas de page */}
            <div className="text-center md:text-right">
              <p className="text-sm opacity-70">
                &copy; {new Date().getFullYear()} {store.name || "Fa-Fashion"}. Tous droits réservés.
              </p>
              {developerInfo.developer_name && (
                <p className="text-xs opacity-50 mt-1">
                  Développé par {developerInfo.developer_name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}