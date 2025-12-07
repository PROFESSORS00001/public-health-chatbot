import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../config';

const DynamicPage = () => {
    const { slug } = useParams();
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/pages/${slug}`);
                if (!response.ok) {
                    throw new Error('Page not found');
                }
                const data = await response.json();
                setPageData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, [slug, API_URL]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-light-bg dark:bg-dark-bg transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl overflow-hidden p-8 md:p-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 border-b pb-4 border-gray-200 dark:border-gray-700">
                        {pageData.title}
                    </h1>
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        <ReactMarkdown>{pageData.content}</ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicPage;
