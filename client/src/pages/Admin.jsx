import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Settings, Database, Users, LogOut, Shield, Activity, MessageSquare, Newspaper, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('faqs');
    const [faqs, setFaqs] = useState([]);

    // News State
    const [news, setNews] = useState([]);
    const [isEditingNews, setIsEditingNews] = useState(null);
    const [newsForm, setNewsForm] = useState({ title: '', content: '' });

    // FAQ State
    const [isEditing, setIsEditing] = useState(null);
    const [editForm, setEditForm] = useState({ question: '', answer: '' });

    const [botConfig, setBotConfig] = useState({ greeting: '', fallback: '' });
    const [siteSettings, setSiteSettings] = useState({ about: '', privacy: '', terms: '', contact: '', support: '' });

    // Security State
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    const [analytics, setAnalytics] = useState(null);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [debugMode, setDebugMode] = useState(false);
    const { logout, token } = useAuth();

    // Data Fetching
    useEffect(() => {
        if (activeTab === 'faqs') fetchFaqs();
        if (activeTab === 'analytics') fetchAnalytics();
        if (activeTab === 'news') fetchNews();
        if (activeTab === 'bot') fetchConfig();
        if (activeTab === 'settings') fetchSiteSettings();
    }, [activeTab]);

    const fetchFaqs = () => {
        fetch('http://localhost:3000/api/faqs')
            .then(res => res.json())
            .then(data => setFaqs(data.map((f, i) => ({ ...f, id: f.id ?? i }))))
            .catch(err => console.error('Error fetching FAQs:', err));
    };

    const fetchSiteSettings = () => {
        fetch('http://localhost:3000/api/site-settings')
            .then(res => res.json())
            .then(data => setSiteSettings(data))
            .catch(console.error);
    };

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/admin/analytics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAnalytics(await res.json());
        } catch (err) { console.error(err); }
    };

    const fetchNews = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/admin/news', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNews(await res.json());
        } catch (err) { console.error(err); }
    };

    const fetchConfig = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/admin/config', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setBotConfig(await res.json());
        } catch (err) { console.error(err); }
    };

    // --- News Handlers ---
    const handleSaveNews = async () => {
        try {
            const body = isEditingNews === 'new' ? { ...newsForm } : { ...newsForm, id: isEditingNews };
            const res = await fetch('http://localhost:3000/api/admin/news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                fetchNews();
                setIsEditingNews(null);
                setNewsForm({ title: '', content: '' });
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteNews = async (id) => {
        if (!window.confirm("Delete this update?")) return;
        try {
            await fetch(`http://localhost:3000/api/admin/news/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchNews();
        } catch (err) { console.error(err); }
    };

    const handleBroadcast = async (item) => {
        if (!window.confirm(`Broadcast "${item.title}" to all subscribers?`)) return;
        try {
            const res = await fetch('http://localhost:3000/api/admin/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ message: `📢 *${item.title}*\n${item.content}` })
            });
            const data = await res.json();
            alert(`Broadcast sent to ${data.recipientCount} subscribers!`);
        } catch (err) { alert("Error sending broadcast"); }
    };

    // --- Bot Config Handlers ---
    const handleSaveConfig = async () => {
        try {
            await fetch('http://localhost:3000/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(botConfig)
            });
            alert("Configuration saved!");
        } catch (err) { console.error(err); }
    };

    // --- Security Handlers ---
    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return alert("New passwords do not match!");
        }
        try {
            const res = await fetch('http://localhost:3000/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Password updated successfully!");
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) { console.error(err); }
    };

    // --- FAQ Handlers ---
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            await fetch(`http://localhost:3000/api/faqs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchFaqs();
        }
    };

    const handleSave = async () => {
        const faqData = isEditing === 'new' ? { ...editForm, id: Date.now() } : { ...editForm, id: isEditing };
        const res = await fetch('http://localhost:3000/api/faqs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(faqData)
        });
        if (res.ok) {
            fetchFaqs();
            setIsEditing(null);
            setEditForm({ question: '', answer: '' });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="font-bold text-gray-900 dark:text-white">Admin Panel</h2>
                            <p className="text-xs text-gray-500 mt-1">Logged in as Admin</p>
                        </div>
                        <nav className="p-2 space-y-1">
                            {[
                                { id: 'news', icon: Newspaper, label: 'News & Updates' },
                                { id: 'faqs', icon: Database, label: 'Knowledge Base' },
                                { id: 'analytics', icon: Activity, label: 'Analytics' },
                                { id: 'bot', icon: MessageSquare, label: 'Bot Config' },
                                { id: 'settings', icon: Settings, label: 'Site Settings' },
                                { id: 'security', icon: Shield, label: 'Security' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                        <div className="p-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                            <button
                                onClick={logout}
                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-grow">
                    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">

                        {/* NEWS TAB */}
                        {activeTab === 'news' && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Updates</h3>
                                    <button
                                        onClick={() => { setIsEditingNews('new'); setNewsForm({ title: '', content: '' }); }}
                                        className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Post New Update
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {isEditingNews && (
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-primary/20 mb-4">
                                            <input
                                                className="w-full mb-3 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface"
                                                placeholder="Title (e.g. Malaria Vaccine Drive)"
                                                value={newsForm.title}
                                                onChange={e => setNewsForm({ ...newsForm, title: e.target.value })}
                                            />
                                            <textarea
                                                className="w-full mb-3 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface h-32"
                                                placeholder="Content of the update..."
                                                value={newsForm.content}
                                                onChange={e => setNewsForm({ ...newsForm, content: e.target.value })}
                                            />
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => setIsEditingNews(null)} className="px-3 py-1 text-gray-500">Cancel</button>
                                                <button onClick={handleSaveNews} className="px-3 py-1 bg-primary text-white rounded-lg">Save & Post</button>
                                            </div>
                                        </div>
                                    )}
                                    {news.map(item => (
                                        <div key={item.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">{item.title}</h4>
                                                    <p className="text-sm text-gray-500 mb-2">{new Date(item.date).toLocaleDateString()}</p>
                                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{item.content}</p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button onClick={() => handleBroadcast(item)} title="Broadcast to Subscribers" className="p-2 text-blue-500 hover:bg-blue-50 rounded-full">
                                                        <Send className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteNews(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {news.length === 0 && <p className="text-center text-gray-500">No updates posted yet.</p>}
                                </div>
                            </div>
                        )}

                        {/* FAQS TAB */}
                        {activeTab === 'faqs' && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Knowledge Base</h3>
                                    <button
                                        onClick={() => { setIsEditing('new'); setEditForm({ question: '', answer: '' }); }}
                                        className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Add FAQ
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {isEditing === 'new' && (
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-primary/20 mb-4">
                                            <input
                                                className="w-full mb-3 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface"
                                                placeholder="Question"
                                                value={editForm.question}
                                                onChange={e => setEditForm({ ...editForm, question: e.target.value })}
                                            />
                                            <textarea
                                                className="w-full mb-3 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface h-24"
                                                placeholder="Answer"
                                                value={editForm.answer}
                                                onChange={e => setEditForm({ ...editForm, answer: e.target.value })}
                                            />
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => setIsEditing(null)} className="px-3 py-1 text-gray-500">Cancel</button>
                                                <button onClick={handleSave} className="px-3 py-1 bg-primary text-white rounded-lg">Save</button>
                                            </div>
                                        </div>
                                    )}
                                    {faqs.map(faq => (
                                        <div key={faq.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 flex justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">{faq.question}</h4>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.answer}</p>
                                            </div>
                                            <button onClick={() => handleDelete(faq.id)} className="text-red-500 p-2"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ANALYTICS TAB */}
                        {activeTab === 'analytics' && analytics && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Analytics</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                                        <h4 className="text-sm text-blue-600">Total Messages</h4>
                                        <p className="text-2xl font-bold">{analytics.totalMessages}</p>
                                    </div>
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                                        <h4 className="text-sm text-green-600">Active Users</h4>
                                        <p className="text-2xl font-bold">{analytics.activeUsers}</p>
                                    </div>
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                                        <h4 className="text-sm text-purple-600">Verified Stamps</h4>
                                        <p className="text-2xl font-bold">{analytics.verifiedStamps}</p>
                                    </div>
                                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
                                        <h4 className="text-sm text-orange-600">Subscribers</h4>
                                        <p className="text-2xl font-bold">{analytics.subscriberCount || 0}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BOT CONFIG TAB */}
                        {activeTab === 'bot' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bot Configuration</h3>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Greeting Message</label>
                                    <textarea
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg"
                                        value={botConfig.greeting}
                                        onChange={e => setBotConfig({ ...botConfig, greeting: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Fallback Message</label>
                                    <textarea
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg"
                                        value={botConfig.fallback}
                                        onChange={e => setBotConfig({ ...botConfig, fallback: e.target.value })}
                                    />
                                </div>
                                <button onClick={handleSaveConfig} className="px-4 py-2 bg-primary text-white rounded-lg">Save Configuration</button>
                            </div>
                        )}

                        {/* SITE SETTINGS TAB */}
                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Site Settings</h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">About Us Text</label>
                                        <textarea
                                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg h-32"
                                            value={siteSettings.about}
                                            onChange={e => setSiteSettings({ ...siteSettings, about: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Privacy Policy</label>
                                        <textarea
                                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg h-32"
                                            value={siteSettings.privacy}
                                            onChange={e => setSiteSettings({ ...siteSettings, privacy: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Terms of Service</label>
                                        <textarea
                                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg h-32"
                                            value={siteSettings.terms}
                                            onChange={e => setSiteSettings({ ...siteSettings, terms: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Contact Email</label>
                                            <input
                                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg"
                                                value={siteSettings.contact}
                                                onChange={e => setSiteSettings({ ...siteSettings, contact: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Support Email</label>
                                            <input
                                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg"
                                                value={siteSettings.support}
                                                onChange={e => setSiteSettings({ ...siteSettings, support: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <button onClick={handleSaveSettings} className="px-4 py-2 bg-primary text-white rounded-lg w-fit">
                                        Save Site Settings
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* SECURITY TAB */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Security Settings</h3>
                                <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 max-w-md">
                                    <h4 className="font-medium mb-4">Change Admin Password</h4>
                                    <div className="space-y-4">
                                        <input
                                            type="password" placeholder="Current Password"
                                            className="w-full p-2 rounded-lg border"
                                            value={passwordData.currentPassword}
                                            onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        />
                                        <input
                                            type="password" placeholder="New Password"
                                            className="w-full p-2 rounded-lg border"
                                            value={passwordData.newPassword}
                                            onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        />
                                        <input
                                            type="password" placeholder="Confirm New Password"
                                            className="w-full p-2 rounded-lg border"
                                            value={passwordData.confirmPassword}
                                            onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        />
                                        <button onClick={handlePasswordChange} className="w-full py-2 bg-primary text-white rounded-lg hover:bg-blue-600">
                                            Update Password
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
