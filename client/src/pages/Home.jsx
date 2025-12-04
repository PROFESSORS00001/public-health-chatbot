import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ShieldCheck, Activity, ArrowRight } from 'lucide-react';
import ChatSimulator from '../components/ChatSimulator';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
    const { t } = useLanguage();

    const features = [
        {
            icon: <MessageCircle className="h-8 w-8 text-primary" />,
            title: "Instant Answers",
            description: "Get immediate responses to common health questions 24/7 via WhatsApp."
        },
        {
            icon: <ShieldCheck className="h-8 w-8 text-green-500" />,
            title: "Blockchain Verified",
            description: "Every official message comes with a unique blockchain stamp for authenticity."
        },
        {
            icon: <Activity className="h-8 w-8 text-secondary" />,
            title: "Trusted Sources",
            description: "Information curated from the Ministry of Health and WHO guidelines."
        }
    ];

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 pt-20 pb-32 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl"></div>
                    <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-secondary/10 blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
                                <span className="block">{t('hero.title')}</span>
                                <span className="block text-primary mt-2">Trusted & Verified.</span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                                {t('hero.subtitle')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a
                                    href="https://wa.me/14155238886"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-green-600 hover:bg-green-700 md:text-lg transition-transform hover:scale-105 shadow-lg shadow-green-600/20"
                                >
                                    <MessageCircle className="mr-2 h-5 w-5" />
                                    {t('hero.cta')}
                                </a>
                                <button
                                    onClick={() => document.getElementById('simulator').scrollIntoView({ behavior: 'smooth' })}
                                    className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-full text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 md:text-lg transition-colors"
                                >
                                    {t('hero.simulator')}
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                            id="simulator"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-2xl opacity-20 transform rotate-3 scale-105 pointer-events-none"></div>
                            <ChatSimulator />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white dark:bg-dark-bg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                            Why use our Chatbot?
                        </h2>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
                            Designed for accessibility, trust, and speed.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="p-8 bg-gray-50 dark:bg-dark-surface rounded-2xl hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800"
                            >
                                <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary/5 dark:bg-primary/10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
                        Ready to get verified health information?
                    </h2>
                    <a
                        href="https://wa.me/14155238886"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-primary hover:bg-blue-600 transition-transform hover:scale-105 shadow-xl shadow-primary/30"
                    >
                        Start Chatting Now <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                </div>
            </section>
        </div>
    );
};

export default Home;
