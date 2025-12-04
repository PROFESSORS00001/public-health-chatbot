import React from 'react';
import { Github, Twitter, Mail, Phone } from 'lucide-react';

const Footer = () => {
    return (
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
                            <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contact Support</a></li>
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
    );
};

export default Footer;
