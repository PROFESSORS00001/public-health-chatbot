import React, { useEffect, useState } from 'react';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import { io } from 'socket.io-client';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from 'chart.js';
import { useTheme } from '../context/ThemeContext';
import { Download, Mail, AlertTriangle, TrendingUp, Users, Activity, CheckCircle, Clock, Globe } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

const Dashboard = () => {
    const { isDark } = useTheme();
    const [emailSchedule, setEmailSchedule] = useState(false);

    // Mock Data simulating real metrics
    const [metrics, setMetrics] = useState({
        totalUsers: 14502,
        dau: 3420,
        escalationRate: 4.2, // %
        avgResponseTime: 0.8, // seconds
        referralsCompleted: 128,
        verificationChecks: 450,
        systemUptime: 99.9,
    });

    // 1. & 2. Users & DAU Chart Data
    const trendData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Daily Active Users',
                data: [3200, 3100, 3400, 3350, 3600, 2900, 2800],
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'New Unique Users',
                data: [120, 150, 180, 140, 200, 90, 85],
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                tension: 0.4,
            }
        ]
    };

    // 7. Geographic Distribution (Heatmap Proxy using Bar)
    const geoData = {
        labels: ['Western Area', 'Bo', 'Kenema', 'Makeni', 'Port Loko', 'Kono'],
        datasets: [{
            label: 'Users by District',
            data: [5000, 3200, 2800, 1500, 1200, 800],
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(59, 130, 246, 0.7)',
                'rgba(59, 130, 246, 0.6)',
                'rgba(59, 130, 246, 0.5)',
                'rgba(59, 130, 246, 0.4)',
                'rgba(59, 130, 246, 0.3)',
            ],
            borderRadius: 4,
        }]
    };

    // 8. Demographics
    const demoData = {
        labels: ['18-24', '25-34', '35-44', '45+'],
        datasets: [{
            data: [25, 40, 20, 15],
            backgroundColor: ['#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8'],
            borderWidth: 0,
        }]
    };

    // 3. Top 10 Questions
    const topQuestions = [
        { q: "What are symptoms of Malaria?", count: 1245, trend: 'up' },
        { q: "Where is the nearest vaccination center?", count: 982, trend: 'stable' },
        { q: "How to treat typhoid fever?", count: 850, trend: 'up' },
        { q: "Is cholera vaccination free?", count: 720, trend: 'stable' },
        { q: "Symptoms of Lassa Fever", count: 650, trend: 'down' },
    ];

    // 4. Misconceptions
    const misconceptions = [
        { claim: "Drinking salt water cures Ebola", risk: "High", count: 120 },
        { claim: "Vaccines cause infertility", risk: "Severe", count: 85 },
        { claim: "Herbal tea prevents Malaria", risk: "Moderate", count: 210 },
    ];

    // 11. Top Sources
    const topSources = [
        { name: "Malaria Guidelines PDF", clicks: 450 },
        { name: "Emergency Center Map", clicks: 320 },
        { name: "MoH Vaccination Schedule", clicks: 280 },
    ];

    // 12. Trend Alerts
    const alerts = [
        { type: 'critical', msg: 'Spike in "Cholera" queries in Bo District', confidence: '92%' },
        { type: 'warning', msg: 'Unusual volume of "Fever" reports in Western Area', confidence: '78%' },
    ];

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top', labels: { color: isDark ? '#e5e7eb' : '#374151' } },
        },
        scales: {
            y: {
                grid: { color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
                ticks: { color: isDark ? '#e5e7eb' : '#374151' }
            },
            x: {
                grid: { display: false },
                ticks: { color: isDark ? '#e5e7eb' : '#374151' }
            }
        }
    };

    const handleExport = () => {
        alert("Generating PDF Report for Ministry of Health...");
        // Logic to generate/download report would go here
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Header with Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">National Health Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400">Real-time surveillance and operational metrics.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setEmailSchedule(!emailSchedule)}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${emailSchedule ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                    >
                        <Mail className="h-4 w-4 mr-2" />
                        {emailSchedule ? 'Daily Email Active' : 'Schedule Reports'}
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 font-medium"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* UP: Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Unique Users', value: metrics.totalUsers.toLocaleString(), icon: Users, color: 'text-blue-500' },
                    { label: 'Daily Active Users', value: metrics.dau.toLocaleString(), icon: Activity, color: 'text-green-500' },
                    { label: 'Escalation Rate', value: `${metrics.escalationRate}%`, sub: 'Referred to Clinics', icon: AlertTriangle, color: 'text-amber-500' },
                    { label: 'Avg Response Time', value: `${metrics.avgResponseTime}s`, sub: 'System Health: 99.9%', icon: Clock, color: 'text-purple-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</h3>
                                {stat.sub && <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>}
                            </div>
                            <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* MIDDLE: Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Traffic Trends */}
                <div className="lg:col-span-2 bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">User Engagement Trends</h3>
                    <div className="h-72">
                        <Line data={trendData} options={{ ...chartOptions, maintainAspectRatio: false }} />
                    </div>
                </div>

                {/* 2. Demographic & Alerts Column */}
                <div className="space-y-6">
                    {/* Alerts */}
                    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2 text-primary" /> Trend Alerts
                        </h3>
                        <div className="space-y-3">
                            {alerts.map((alert, i) => (
                                <div key={i} className={`p-3 rounded-lg border-l-4 ${alert.type === 'critical' ? 'bg-red-50 border-red-500 dark:bg-red-900/10' : 'bg-amber-50 border-amber-500 dark:bg-amber-900/10'}`}>
                                    <p className={`text-sm font-semibold ${alert.type === 'critical' ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>{alert.msg}</p>
                                    <p className="text-xs text-gray-500 mt-1">Confidence: {alert.confidence}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Demographics */}
                    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">User Demographics (Age)</h3>
                        <div className="h-48 flex justify-center">
                            <Doughnut data={demoData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: isDark ? '#e5e7eb' : '#374151' } } } }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Geographic Distribution */}
            <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Geographic Distribution by District</h3>
                <div className="h-64">
                    <Bar data={geoData} options={{ ...chartOptions, maintainAspectRatio: false }} />
                </div>
            </div>

            {/* LOWER: Data Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Top Questions */}
                <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Public Concerns (Questions)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 font-medium">
                                <tr>
                                    <th className="p-3">Question Topic</th>
                                    <th className="p-3">Count</th>
                                    <th className="p-3">Trend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                                {topQuestions.map((q, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="p-3 font-medium">{q.q}</td>
                                        <td className="p-3">{q.count.toLocaleString()}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${q.trend === 'up' ? 'bg-green-100 text-green-700' :
                                                    q.trend === 'down' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {q.trend.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Misinformation Tracking */}
                <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-red-600">Misinformation Watchlist</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-red-50 dark:bg-red-900/10 text-red-600 font-medium">
                                <tr>
                                    <th className="p-3">Detected Claim</th>
                                    <th className="p-3">Risk Level</th>
                                    <th className="p-3">Frequency</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                                {misconceptions.map((item, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="p-3 font-medium">{item.claim}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.risk === 'Severe' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {item.risk}
                                            </span>
                                        </td>
                                        <td className="p-3">{item.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <h4 className="text-sm font-semibold mb-2">Most Accessed Trusted Resources</h4>
                        <div className="flex flex-wrap gap-2">
                            {topSources.map((src, i) => (
                                <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs border border-blue-100 dark:border-blue-800">
                                    {src.name} ({src.clicks})
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
