import React, { useState } from 'react';
import { Search, FileText, Phone, ExternalLink, Download, MapPin, ShieldCheck, AlertTriangle, Video, Globe, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Resources = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Data for Sections
    const nationalUpdates = [
        { id: 1, date: '2025-10-15', title: 'MoH Alert: Seasonal Flu Vaccination Drive Begins', summary: 'The Ministry of Health announces the start of the annual flu vaccination campaign for all districts.', link: '#' },
        { id: 2, date: '2025-10-10', title: 'Press Release: Malaria Prevention Month', summary: 'New mosquito nets distribution schedule released for Western Area.', link: '#' },
    ];

    const authorities = [
        { id: 1, name: 'WHO Rwanda', description: 'World Health Organization Country Office', url: 'https://www.who.int/rwanda' },
        { id: 2, name: 'UNICEF', description: 'Promoting the rights and wellbeing of every child', url: 'https://www.unicef.org' },
        { id: 3, name: 'Africa CDC', description: 'Strengthening the capacity of Africa\'s public health institutions', url: 'https://africacdc.org' },
    ];

    const clinicalGuidance = [
        { id: 1, title: 'Malaria Treatment Guidelines 2025', type: 'PDF' },
        { id: 2, title: 'Maternal Care Protocols', type: 'PDF' },
        { id: 3, title: 'COVID-19 Home Care Guide', type: 'PDF' },
        { id: 4, title: 'National Immunization Schedule', type: 'PDF' },
    ];

    const clinics = [
        { id: 1, name: 'Central Government Hospital', location: 'Freetown', verified: true, phone: '+232 76 000 000' },
        { id: 2, name: 'Connaught Hospital', location: 'Freetown', verified: true, phone: '+232 76 111 222' },
        { id: 3, name: 'Bo Government Hospital', location: 'Bo District', verified: true, phone: '+232 76 333 444' },
    ];

    const educationMaterials = [
        { id: 1, title: 'Handwashing Techniques (Video)', language: 'Krio', type: 'Video' },
        { id: 2, title: 'Understanding Lassa Fever (Audio)', language: 'Mende', type: 'Audio' },
        { id: 3, title: 'Nutrition for Toddlers (Poster)', language: 'English', type: 'PDF' },
    ];

    const reports = [
        { id: 1, title: 'Weekly Surveillance Bulletin - Week 40', date: 'Oct 2025' },
        { id: 2, title: 'Monthly Situational Report - Sept 2025', date: 'Sept 2025' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Public Health Resources</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    The authoritative hub for national health updates, clinical guidance, and trusted contacts.
                </p>
            </div>

            {/* 1. Latest National Health Updates */}
            <section>
                <div className="flex items-center space-x-2 mb-6">
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest National Health Updates</h2>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    {nationalUpdates.map(update => (
                        <div key={update.id} className="bg-white dark:bg-dark-surface p-6 rounded-xl border-l-4 border-amber-500 shadow-sm hover:shadow-md transition-shadow">
                            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{update.date}</span>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1 mb-2">{update.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">{update.summary}</p>
                            <a href={update.link} className="text-primary font-medium hover:underline flex items-center">Read Full Release <ChevronRight className="h-4 w-4" /></a>
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. International Authorities */}
            <section>
                <div className="flex items-center space-x-2 mb-6">
                    <Globe className="h-6 w-6 text-blue-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">International Authorities</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {authorities.map(auth => (
                        <div key={auth.id} className="bg-white dark:bg-dark-surface p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{auth.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm flex-grow mb-4">{auth.description}</p>
                            <a href={auth.url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-medium hover:underline flex items-center">
                                Visit Website <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. Clinical Guidance & Fact Sheets */}
            <section>
                <div className="flex items-center space-x-2 mb-6">
                    <FileText className="h-6 w-6 text-green-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Clinical Guidance & Fact Sheets</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {clinicalGuidance.map(guide => (
                        <div key={guide.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-start justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm mb-1">{guide.title}</p>
                                <span className="text-xs text-gray-500 uppercase">{guide.type}</span>
                            </div>
                            <Download className="h-5 w-5 text-gray-400" />
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Local Clinics & Helplines */}
            <section>
                <div className="flex items-center space-x-2 mb-6">
                    <MapPin className="h-6 w-6 text-red-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Local Clinics & Helplines</h2>
                </div>
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-gray-600 dark:text-gray-400">MoH Verified Clinics Registry</p>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {clinics.map(clinic => (
                            <div key={clinic.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h4 className="font-bold text-gray-900 dark:text-white">{clinic.name}</h4>
                                        {clinic.verified && <ShieldCheck className="h-4 w-4 text-green-500" title="MoH Verified" />}
                                    </div>
                                    <p className="text-sm text-gray-500">{clinic.location}</p>
                                </div>
                                <div className="mt-2 md:mt-0 flex items-center text-gray-600 dark:text-gray-400">
                                    <Phone className="h-4 w-4 mr-2" />
                                    <span className="font-mono">{clinic.phone}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Education & Community Materials */}
            <section>
                <div className="flex items-center space-x-2 mb-6">
                    <Video className="h-6 w-6 text-purple-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Education & Community</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {educationMaterials.map(item => (
                        <div key={item.id} className="relative group overflow-hidden rounded-xl bg-gray-900 aspect-video flex items-center justify-center">
                            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors"></div>
                            <div className="relative z-10 text-center p-4">
                                <h4 className="text-white font-bold mb-1">{item.title}</h4>
                                <span className="inline-block px-2 py-1 bg-primary text-white text-xs rounded-full">{item.language}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 6. Data & Reports */}
            <section>
                <div className="flex items-center space-x-2 mb-6">
                    <FileText className="h-6 w-6 text-gray-500" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data & Reports</h2>
                </div>
                <ul className="space-y-3">
                    {reports.map(report => (
                        <li key={report.id} className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                            <a href="#" className="hover:text-primary underline">{report.title}</a>
                            <span className="text-sm text-gray-500">({report.date})</span>
                        </li>
                    ))}
                </ul>
            </section>

            {/* 7. Verification */}
            <section className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-8 text-center border border-primary/20">
                <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verify UBMED Messages</h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-6">
                    Ensure the health information you receive is authentic. Use our blockchain-powered verification tool to check the validity of any message.
                </p>
                <Link to="/verification" className="inline-flex items-center px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 transition-colors">
                    Go to Verification Tool <ChevronRight className="h-5 w-5 ml-1" />
                </Link>
            </section>

        </div>
    );
};

export default Resources;
