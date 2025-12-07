import React, { useState } from 'react';
import { Search, FileText, Phone, ExternalLink, Download, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const Resources = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('all');

    const resources = [
        {
            id: 1,
            title: 'Ministry of Health Guidelines',
            description: 'Official protocols for disease prevention and management.',
            type: 'document',
            category: 'official',
            link: 'https://www.who.int/emergencies/diseases/novel-coronavirus-2019/technical-guidance'
        },
        {
            id: 2,
            title: 'Emergency Hotline List',
            description: 'Direct contacts for ambulance, fire, and police services.',
            type: 'contact',
            category: 'emergency',
            link: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies.html'
        },
        {
            id: 3,
            title: 'Vaccination Schedule 2025',
            description: 'Updated immunization chart for children and adults.',
            type: 'download',
            category: 'prevention',
            link: 'https://www.cdc.gov/vaccines/schedules/index.html'
        },
        {
            id: 4,
            title: 'WHO Global Health Alerts',
            description: 'Real-time updates on global health emergencies.',
            type: 'external',
            category: 'official',
            link: 'https://www.who.int/emergencies'
        },
        {
            id: 5,
            title: 'Nutrition & Diet Guide',
            description: 'Healthy eating habits for boosting immunity.',
            type: 'document',
            category: 'wellness',
            link: 'https://www.nutrition.gov/topics/basic-nutrition/healthy-eating'
        },
        {
            id: 6,
            title: 'Mental Health Support',
            description: 'Resources and contacts for mental well-being.',
            type: 'contact',
            category: 'wellness',
            link: 'https://www.who.int/health-topics/mental-health'
        }
    ];

    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === 'all' || resource.category === category;
        return matchesSearch && matchesCategory;
    });

    const getIcon = (type) => {
        switch (type) {
            case 'document': return <FileText className="h-5 w-5" />;
            case 'contact': return <Phone className="h-5 w-5" />;
            case 'download': return <Download className="h-5 w-5" />;
            case 'external': return <ExternalLink className="h-5 w-5" />;
            default: return <FileText className="h-5 w-5" />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Health Resources</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Access verified documents, emergency contacts, and official health guidelines.
                </p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
                    />
                </div>
                <div className="relative min-w-[200px]">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none cursor-pointer"
                    >
                        <option value="all">All Categories</option>
                        <option value="official">Official Guidelines</option>
                        <option value="emergency">Emergency</option>
                        <option value="prevention">Prevention</option>
                        <option value="wellness">Wellness</option>
                    </select>
                </div>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource, index) => (
                    <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-800 group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg ${resource.category === 'emergency' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                resource.category === 'official' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                                    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                {getIcon(resource.type)}
                            </div>
                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                {resource.category}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                            {resource.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            {resource.description}
                        </p>
                        <a
                            href={resource.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm font-medium text-primary hover:text-blue-600 transition-colors"
                        >
                            Access Resource <ArrowRight className="ml-1 h-4 w-4" />
                        </a>
                    </motion.div>
                ))}
            </div>

            {filteredResources.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No resources found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

// Helper component for arrow icon
const ArrowRight = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);

export default Resources;
