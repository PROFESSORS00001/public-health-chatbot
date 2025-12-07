import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Search, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const Verification = () => {
    const { t } = useLanguage();
    const [stampCode, setStampCode] = useState('');
    const [verificationStatus, setVerificationStatus] = useState('idle'); // idle, loading, success, error
    const [verificationResult, setVerificationResult] = useState(null);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!stampCode.trim()) return;

        setVerificationStatus('loading');
        setVerificationResult(null);

        try {
            const response = await fetch('http://localhost:3000/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stamp: stampCode }),
            });
            const data = await response.json();

            if (data.isValid) {
                setVerificationStatus('success');
                setVerificationResult(data);
            } else {
                setVerificationStatus('error');
                setVerificationResult(data);
            }
        } catch (error) {
            console.error("Verification error:", error);
            setVerificationStatus('error');
            setVerificationResult({
                isValid: false,
                message: "Connection error. Please try again later."
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
                        <ShieldCheck className="h-12 w-12 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        {t('verification.title')}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        {t('verification.subtitle')}
                    </p>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-800">
                    <form onSubmit={handleVerify} className="mb-8">
                        <label htmlFor="stamp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Enter Stamp Code
                        </label>
                        <div className="flex gap-4">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    id="stamp"
                                    value={stampCode}
                                    onChange={(e) => setStampCode(e.target.value)}
                                    placeholder={t('verification.placeholder')}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow font-mono"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={verificationStatus === 'loading' || !stampCode.trim()}
                                className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                            >
                                {verificationStatus === 'loading' ? (
                                    <Loader className="h-5 w-5 animate-spin" />
                                ) : (
                                    t('verification.button')
                                )}
                            </button>
                        </div>
                    </form>

                    <AnimatePresence mode="wait">
                        {verificationStatus === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6"
                            >
                                <div className="flex items-start">
                                    <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                                            Verification Successful
                                        </h3>
                                        <p className="text-green-700 dark:text-green-400 mb-4">
                                            {verificationResult.message}
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="block text-gray-500 dark:text-gray-400">Source</span>
                                                <span className="font-medium text-gray-900 dark:text-white">{verificationResult.source}</span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-500 dark:text-gray-400">Timestamp</span>
                                                <span className="font-medium text-gray-900 dark:text-white">{verificationResult.timestamp}</span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-500 dark:text-gray-400">Block Number</span>
                                                <span className="font-medium text-gray-900 dark:text-white font-mono">#{verificationResult.blockNumber}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {verificationStatus === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6"
                            >
                                <div className="flex items-center">
                                    <XCircle className="h-6 w-6 text-red-500 mr-4 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">
                                            Verification Failed
                                        </h3>
                                        <p className="text-red-700 dark:text-red-400">
                                            {verificationResult.message}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-12 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">How it works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: 1, title: 'Receive Message', desc: 'Get an official reply from our WhatsApp bot.' },
                            { step: 2, title: 'Copy Code', desc: 'Copy the unique stamp code at the bottom.' },
                            { step: 3, title: 'Verify Instantly', desc: 'Paste here to confirm authenticity on blockchain.' },
                        ].map((item) => (
                            <div key={item.step} className="relative">
                                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3 relative z-10">
                                    {item.step}
                                </div>
                                {item.step !== 3 && (
                                    <div className="hidden md:block absolute top-4 left-1/2 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-0"></div>
                                )}
                                <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Verification;
