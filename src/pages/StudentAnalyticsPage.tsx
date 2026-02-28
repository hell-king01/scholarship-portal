import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Clock, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const StudentAnalyticsPage = () => {
    const [analytics, setAnalytics] = useState<any>(null);
    const userId = "guest"; // Should come from context

    useEffect(() => {
        fetch(`http://localhost:3001/api/analytics/student?userId=${userId}`)
            .then(res => res.json())
            .then(data => data.success && setAnalytics(data.analytics));
    }, []);

    if (!analytics) return <div className="p-20 text-center">Loading Analytics...</div>;

    const stats = [
        { label: "Scholarships Viewed", value: analytics.scholarshipsViewed, icon: <TrendingUp />, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Total Applied", value: analytics.totalApplied, icon: <Award />, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Documents", value: analytics.documentUploads, icon: <FileText />, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Deadline Adherence", value: `${analytics.deadlineAdherence}%`, icon: <Clock />, color: "text-green-600", bg: "bg-green-50" },
    ];

    const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header />
            <div className="max-w-7xl mx-auto pt-24 px-6">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
                        <p className="text-gray-500">Intelligent insights into your scholarship journey</p>
                    </div>
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                        {React.cloneElement(stat.icon as React.ReactElement, { size: 24 })}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                        <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Eligibility Trend */}
                    <Card className="lg:col-span-2 border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Eligibility Score Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analytics.eligibilityImprovement}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#4f46e5"
                                        strokeWidth={3}
                                        dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 8, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Application Status */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Application funnel</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <Award size={18} />
                                        </div>
                                        <span className="font-medium">Applied</span>
                                    </div>
                                    <span className="text-lg font-bold">{analytics.totalApplied}</span>
                                </div>
                                <div className="flex items-center justify-between text-green-600">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <CheckCircle size={18} />
                                        </div>
                                        <span className="font-medium">Approved</span>
                                    </div>
                                    <span className="text-lg font-bold">{analytics.approved}</span>
                                </div>
                                <div className="flex items-center justify-between text-yellow-600">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-50 rounded-lg">
                                            <Clock size={18} />
                                        </div>
                                        <span className="font-medium">In Progress</span>
                                    </div>
                                    <span className="text-lg font-bold">{analytics.inProgress}</span>
                                </div>
                                <div className="flex items-center justify-between text-red-600">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-50 rounded-lg">
                                            <XCircle size={18} />
                                        </div>
                                        <span className="font-medium">Rejected</span>
                                    </div>
                                    <span className="text-lg font-bold">{analytics.rejected}</span>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <p className="text-sm text-indigo-700 font-medium leading-relaxed">
                                    "Your eligibility score improved by 13% since January. Keep uploading documents to unlock more!"
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentAnalyticsPage;
