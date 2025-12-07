import React from 'react';
import { Github, Twitter, Mail, Phone } from 'lucide-react';

const Footer = () => {
    const [settings, setSettings] = React.useState({});
    const [modalContent, setModalContent] = React.useState(null);

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const res = await fetch(`${API_URL}/api/site-settings`);
                const data = await res.json();
                setSettings(data);
            } catch (e) { console.error(e); }
        };
        fetchSettings();
    }, []);

    const openModal = (title, content) => {
        if (!content) return;
        setModalContent({ title, content });
    };

    return (
        <>
            <footer className="bg-light-surface dark:bg-dark-surface border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-lg font-bold text-primary mb-4">HealthBot</h3>
                            <p className="text-light-muted dark:text-dark-muted text-sm">
                                Providing reliable, blockchain-verified public health information to everyone, everywhere.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">Quick Links</h3>
                            <ul className="space-y-2 text-sm text-light-muted dark:text-dark-muted">
                                <li><button onClick={() => openModal('About Us', settings.about)} className="hover:text-primary transition-colors">About Us</button></li>
                                <li><button onClick={() => openModal('Privacy Policy', settings.privacy)} className="hover:text-primary transition-colors">Privacy Policy</button></li>
                                <li><button onClick={() => openModal('Terms of Service', settings.terms)} className="hover:text-primary transition-colors">Terms of Service</button></li>
                                <li><button onClick={() => openModal('Contact Support', `Support: ${settings.support}\nGeneral: ${settings.contact}`)} className="hover:text-primary transition-colors">Contact Support</button></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">Connect</h3>
                            <div className="flex space-x-4">
                                <a href="#" className="text-light-muted dark:text-dark-muted hover:text-primary transition-colors">
                                    <Twitter className="h-5 w-5" />
                                </a>
                                <a href="#" className="text-light-muted dark:text-dark-muted hover:text-primary transition-colors">
                                    <Github className="h-5 w-5" />
                                </a>
                                <a href="#" className="text-light-muted dark:text-dark-muted hover:text-primary transition-colors">
                                    <Mail className="h-5 w-5" />
                                </a>
                                <a href="#" className="text-light-muted dark:text-dark-muted hover:text-primary transition-colors">
                                    <Phone className="h-5 w-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-light-muted dark:text-dark-muted">
                        <p>© 2025 Public Health Initiative. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Simple Modal */}
            {modalContent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setModalContent(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setModalContent(null)}
                            className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                        >
                            X
                        </button>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{modalContent.title}</h2>
                        <div className="prose dark:prose-invert whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                            {modalContent.content}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Footer;
