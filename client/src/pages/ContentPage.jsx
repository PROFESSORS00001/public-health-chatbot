import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ContentPage = ({ title, contentKey }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('https://public-health-chatbot.onrender.com/api/site-content')
            .then(res => res.json())
            .then(data => {
                setContent(data[contentKey] || 'Content not available.');
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching content:', err);
                setContent('Failed to load content.');
                setLoading(false);
            });
    }, [contentKey]);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8"
            >
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{title}</h1>
                {loading ? (
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                ) : (
                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                        {content}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ContentPage;
