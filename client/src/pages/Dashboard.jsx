import React, { useEffect, useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
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
} from 'chart.js';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Dashboard = () => {
    const { isDark } = useTheme();
    const [analytics, setAnalytics] = useState({
        totalMessages: 1234,
        activeUsers: 56,
        verifiedStamps: 892
    });

    useEffect(() => {
        const socket = io('http://localhost:3000');

        socket.on('connect', () => {
            console.log('Connected to analytics server');
        });

        socket.on('analytics_update', (data) => {
            setAnalytics(prev => ({ ...prev, ...data }));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Mock Data (enhanced with real analytics where possible)
    const questionData = {
        labels: ['Fever', 'Cough', 'Headache', 'Vaccination', 'Nutrition', 'Emergency'],
        datasets: [
            {
                label: 'Questions Asked',
                data: [120, 95, 78, 45, 30, 15],
                backgroundColor: 'rgba(30, 144, 255, 0.6)',
                borderColor: 'rgba(30, 144, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    const trendData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Daily Interactions',
                data: [65, 59, 80, 81, 56, 55, 40],
                fill: true,
                backgroundColor: 'rgba(255, 107, 107, 0.2)',
                borderColor: 'rgba(255, 107, 107, 1)',
                tension: 0.4,
            },
        ],
    };

    const sourceData = {
        labels: ['WhatsApp', 'Website Simulator'],
        datasets: [
            {
                data: [85, 15],
                backgroundColor: ['#25D366', '#1e90ff'],
                borderColor: isDark ? '#151515' : '#ffffff',
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: isDark ? '#e0e0e0' : '#1f2937',
                },
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                grid: {
                    color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                },
                ticks: {
                    color: isDark ? '#e0e0e0' : '#1f2937',
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: isDark ? '#e0e0e0' : '#1f2937',
                },
            },
        },
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Real-time insights into chatbot usage and public health trends.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Active Users', value: analytics.activeUsers.toLocaleString(), change: '+12%', color: 'text-blue-500' },
                    { label: 'Total Messages', value: analytics.totalMessages.toLocaleString(), change: '+8%', color: 'text-green-500' },
                    { label: 'Verified Stamps', value: analytics.verifiedStamps.toLocaleString(), change: '+24%', color: 'text-purple-500' },
                    { label: 'Avg. Response Time', value: '1.2s', change: '-5%', color: 'text-orange-500' },
                ].map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                        <div className="flex items-baseline mt-2">
                            <p className="text-3xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                            <span className={`ml-2 text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Top Health Topics</h3>
                    <Bar data={questionData} options={chartOptions} />
                </div>

                <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Interaction Trends</h3>
                    <Line data={trendData} options={chartOptions} />
                </div>

                <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 lg:col-span-2">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="w-full md:w-1/3 mb-8 md:mb-0">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">Traffic Sources</h3>
                            <div className="h-64 flex justify-center">
                                <Doughnut
                                    data={sourceData}
                                    options={{
                                        ...chartOptions,
                                        scales: { x: { display: false }, y: { display: false } },
                                        plugins: { legend: { position: 'bottom', labels: { color: isDark ? '#e0e0e0' : '#1f2937' } } }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-2/3 md:pl-12">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Alerts</h3>
                            <div className="space-y-4">
                                {[
                                    { title: 'High Fever Inquiries Spike', time: '2 hours ago', type: 'warning' },
                                    { title: 'New Vaccination Schedule Released', time: '5 hours ago', type: 'info' },
                                    { title: 'System Maintenance Scheduled', time: '1 day ago', type: 'neutral' },
                                ].map((alert, idx) => (
                                    <div key={idx} className="flex items-start p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <div className={`w-2 h-2 mt-2 rounded-full mr-3 ${alert.type === 'warning' ? 'bg-red-500' : alert.type === 'info' ? 'bg-blue-500' : 'bg-gray-500'
                                            }`}></div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{alert.title}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{alert.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
