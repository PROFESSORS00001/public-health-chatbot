import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    const navLinks = [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.dashboard'), path: '/dashboard' },
        { name: t('nav.resources'), path: '/resources' },
        { name: t('nav.verification'), path: '/verification' },
        ...(isAuthenticated ? [{ name: t('nav.admin'), path: '/admin' }] : []),
    ];

    const toggleLanguage = () => {
        const langs = ['en', 'fr', 'es'];
        const currentIndex = langs.indexOf(language);
        const nextIndex = (currentIndex + 1) % langs.length;
        setLanguage(langs[nextIndex]);
    };

    return (
        <nav className="bg-light-surface dark:bg-dark-surface shadow-md sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 font-bold text-xl text-primary">
                            HealthBot
                        </Link>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${location.pathname === link.path
                                            ? 'text-primary bg-primary/10'
                                            : 'text-light-muted dark:text-dark-muted hover:text-primary dark:hover:text-primary'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6 space-x-4">
                            <button
                                onClick={toggleLanguage}
                                className="p-2 rounded-full text-light-muted dark:text-dark-muted hover:text-primary dark:hover:text-primary focus:outline-none"
                                title={`Current: ${language.toUpperCase()}`}
                            >
                                <div className="flex items-center font-medium text-sm">
                                    <Globe className="h-5 w-5 mr-1" />
                                    {language.toUpperCase()}
                                </div>
                            </button>
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-light-muted dark:text-dark-muted hover:text-primary dark:hover:text-primary focus:outline-none"
                            >
                                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-light-muted dark:text-dark-muted hover:text-primary dark:hover:text-primary focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-light-surface dark:bg-dark-surface border-t border-gray-200 dark:border-gray-700">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === link.path
                                    ? 'text-primary bg-primary/10'
                                    : 'text-light-muted dark:text-dark-muted hover:text-primary dark:hover:text-primary'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    <div className="pt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-around px-5">
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center p-2 rounded-full text-light-muted dark:text-dark-muted hover:text-primary dark:hover:text-primary"
                            >
                                <Globe className="h-6 w-6 mr-2" />
                                {language.toUpperCase()}
                            </button>
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-light-muted dark:text-dark-muted hover:text-primary dark:hover:text-primary"
                            >
                                {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
