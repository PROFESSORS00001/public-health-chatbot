import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Settings, Database, Users, LogOut, Shield, Activity, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('faqs');
    const [faqs, setFaqs] = useState([]);
    const [isEditing, setIsEditing] = useState(null);
    const [editForm, setEditForm] = useState({ question: '', answer: '' });
    const [analytics, setAnalytics] = useState(null);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [debugMode, setDebugMode] = useState(false);
    const [botConfig, setBotConfig] = useState({ greeting: '', fallback: '' });
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
    const { logout, token } = useAuth();

    useEffect(() => {
        fetch('http://localhost:3000/api/faqs')
            .then(res => res.json())
            .then(data => {
                const faqsWithId = data.map((f, i) => ({ ...f, id: f.id ?? i }));
                setFaqs(faqsWithId);
            })
            .catch(err => console.error('Error fetching FAQs:', err));

        // Fetch analytics if on analytics tab
        if (activeTab === 'analytics') {
            fetchAnalytics();
        }
        // Fetch settings if on settings tab
        if (activeTab === 'settings') {
            fetchSettings();
        }
        // Fetch bot config if on bot tab
        if (activeTab === 'bot') {
            fetchBotConfig();
        }
    }, [activeTab]);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/admin/analytics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setAnalytics(data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/admin/settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setMaintenanceMode(data.maintenanceMode);
            setDebugMode(data.debugMode);
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    const fetchBotConfig = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/admin/bot-config', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setBotConfig(data);
        } catch (err) {
            console.error('Error fetching bot config:', err);
        }
    };

    const updateSettings = async (newSettings) => {
        try {
            await fetch('http://localhost:3000/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newSettings)
            });
        } catch (err) {
            console.error('Error updating settings:', err);
        }
    };

    const handleMaintenanceToggle = (e) => {
        const enabled = e.target.checked;
        setMaintenanceMode(enabled);
        updateSettings({ maintenanceMode: enabled, debugMode });
    };

    const handleDebugToggle = (e) => {
        const enabled = e.target.checked;
        setDebugMode(enabled);
        updateSettings({ maintenanceMode, debugMode: enabled });
    };

    const saveBotConfig = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/admin/bot-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(botConfig)
            });
            if (res.ok) alert('Bot configuration saved!');
        } catch (err) {
            console.error('Error saving bot config:', err);
        }
    };

    const handleChangePassword = async () => {
        if (passwordForm.new !== passwordForm.confirm) {
            alert("Passwords don't match!");
            return;
        }
        try {
            const res = await fetch('http://localhost:3000/api/admin/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword: passwordForm.new })
            });
            const data = await res.json();
            if (data.success) {
                alert('Password updated successfully!');
                setPasswordForm({ current: '', new: '', confirm: '' });
            } else {
                alert(data.error || 'Failed to update password');
            }
        } catch (err) {
            console.error('Error changing password:', err);
        }
    };

    const handleEdit = (faq) => {
        setIsEditing(faq.id);
        setEditForm({ question: faq.question, answer: faq.answer });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this FAQ?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/faqs/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    setFaqs(faqs.filter(f => f.id !== id));
                }
            } catch (error) {
                console.error("Error deleting FAQ:", error);
            }
        }
    };

    const handleSave = async () => {
        const faqData = isEditing === 'new' ? { ...editForm, id: Date.now() } : { ...editForm, id: isEditing };

        try {
            const response = await fetch('http://localhost:3000/api/faqs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(faqData)
            });

            if (response.ok) {
                const savedFaq = (await response.json()).faq;
                if (isEditing === 'new') {
                    setFaqs([...faqs, savedFaq]);
                } else {
                    setFaqs(faqs.map(f => f.id === isEditing ? savedFaq : f));
                }
                setIsEditing(null);
                setEditForm({ question: '', answer: '' });
            }
        } catch (error) {
            console.error("Error saving FAQ:", error);
        }
    };

    const handleAddNew = () => {
        setIsEditing('new');
        setEditForm({ question: '', answer: '' });
    };

    const handleResetAnalytics = async () => {
        if (window.confirm('Are you sure you want to reset all analytics data? This cannot be undone.')) {
            try {
                await fetch('http://localhost:3000/api/admin/reset-analytics', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                fetchAnalytics();
            } catch (err) {
                console.error('Error resetting analytics:', err);
            }
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
                                { id: 'faqs', icon: Database, label: 'Knowledge Base' },
                                { id: 'analytics', icon: Activity, label: 'Analytics' },
                                { id: 'bot', icon: MessageSquare, label: 'Bot Config' },
                                { id: 'settings', icon: Settings, label: 'System Settings' },
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
                        {activeTab === 'faqs' && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Knowledge Base</h3>
                                    <button
                                        onClick={handleAddNew}
                                        className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add New FAQ
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {isEditing === 'new' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-primary/20 mb-4"
                                            >
                                                <input
                                                    type="text"
                                                    placeholder="Question"
                                                    value={editForm.question}
                                                    onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                                                    className="w-full mb-3 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                                />
                                                <textarea
                                                    placeholder="Answer"
                                                    value={editForm.answer}
                                                    onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                                                    className="w-full mb-3 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface text-gray-900 dark:text-white h-24"
                                                />
                                                <div className="flex justify-end space-x-2">
                                                    <button onClick={() => setIsEditing(null)} className="px-3 py-1 text-gray-500 hover:text-gray-700">Cancel</button>
                                                    <button onClick={handleSave} className="px-3 py-1 bg-primary text-white rounded-lg">Save</button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {faqs.map((faq) => (
                                            <motion.div
                                                key={faq.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/30 transition-colors bg-gray-50/50 dark:bg-gray-900/20"
                                            >
                                                {isEditing === faq.id ? (
                                                    <div className="space-y-3">
                                                        <input
                                                            type="text"
                                                            value={editForm.question}
                                                            onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                                                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface text-gray-900 dark:text-white"
                                                        />
                                                        <textarea
                                                            value={editForm.answer}
                                                            onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                                                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface text-gray-900 dark:text-white h-24"
                                                        />
                                                        <div className="flex justify-end space-x-2">
                                                            <button onClick={() => setIsEditing(null)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><X className="h-4 w-4" /></button>
                                                            <button onClick={handleSave} className="p-2 text-green-500 hover:bg-green-50 rounded-full"><Save className="h-4 w-4" /></button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">{faq.question}</h4>
                                                            <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.answer}</p>
                                                        </div>
                                                        <div className="flex space-x-2 ml-4">
                                                            <button onClick={() => handleEdit(faq)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(faq.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Analytics Management</h3>
                                    <button onClick={handleResetAnalytics} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm font-medium">
                                        Reset All Data
                                    </button>
                                </div>
                                {analytics ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                                            <h4 className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Messages</h4>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{analytics.totalMessages}</p>
                                        </div>
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                                            <h4 className="text-sm text-green-600 dark:text-green-400 font-medium">Active Users</h4>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{analytics.activeUsers}</p>
                                        </div>
                                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                                            <h4 className="text-sm text-purple-600 dark:text-purple-400 font-medium">Verified Stamps</h4>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{analytics.verifiedStamps}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p>Loading analytics...</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'bot' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Bot Configuration</h3>
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Greeting Message</label>
                                    <textarea
                                        className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface"
                                        rows="3"
                                        value={botConfig.greeting}
                                        onChange={(e) => setBotConfig({ ...botConfig, greeting: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fallback Message</label>
                                    <textarea
                                        className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface"
                                        rows="3"
                                        value={botConfig.fallback}
                                        onChange={(e) => setBotConfig({ ...botConfig, fallback: e.target.value })}
                                    ></textarea>
                                </div>
                                <button onClick={saveBotConfig} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">Save Configuration</button>
                            </div>

                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">System Settings</h3>
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">Maintenance Mode</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Disable chatbot responses temporarily</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={maintenanceMode}
                                            onChange={handleMaintenanceToggle}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">Debug Mode</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Show detailed error logs</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={debugMode}
                                            onChange={handleDebugToggle}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Security Settings</h3>
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Change Password</h4>
                                    <div className="space-y-4">
                                        <input
                                            type="password"
                                            placeholder="New Password"
                                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface"
                                            value={passwordForm.new}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                        />
                                        <input
                                            type="password"
                                            placeholder="Confirm New Password"
                                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface"
                                            value={passwordForm.confirm}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                        />
                                        <button onClick={handleChangePassword} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">Update Password</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Admin;
