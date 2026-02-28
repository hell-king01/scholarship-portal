import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { ChartBar, PieChart as PieChartIcon, TrendingUp, BarChart3 } from 'lucide-react';

const STATUS_DATA = [
    { name: 'Pending', value: 45, color: '#f59e0b', gradient: 'from-orange-400 to-orange-600' },
    { name: 'Approved', value: 30, color: '#10b981', gradient: 'from-emerald-400 to-emerald-600' },
    { name: 'Rejected', value: 15, color: '#ef4444', gradient: 'from-rose-400 to-rose-600' },
    { name: 'In Review', value: 10, color: '#3b82f6', gradient: 'from-blue-400 to-blue-600' },
];

const CATEGORY_DATA = [
    { name: 'Merit', count: 12 },
    { name: 'Need', count: 8 },
    { name: 'Minority', count: 5 },
    { name: 'Research', count: 3 },
];

const TREND_DATA = [
    { month: 'Jan', apps: 4 },
    { month: 'Feb', apps: 7 },
    { month: 'Mar', apps: 12 },
    { month: 'Apr', apps: 18 },
    { month: 'May', apps: 15 },
];

export const ApplicationAnalytics = () => {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-2 px-2">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-display font-black text-3xl tracking-tighter">Application Insights</h2>
                        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mt-1">Real-time performance data</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Status Breakdown */}
                <Card className="rounded-[2.5rem] border-zinc-200/50 dark:border-zinc-800/50 shadow-sm overflow-hidden bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl group hover:shadow-2xl transition-all duration-500">
                    <CardHeader className="pb-0 pt-8 px-8">
                        <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] opacity-60">Success Rate</CardTitle>
                            <PieChartIcon className="h-4 w-4 text-zinc-300" />
                        </div>
                        <h4 className="text-lg font-black tracking-tighter">Status Distribution</h4>
                    </CardHeader>
                    <CardContent className="h-[250px] p-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={STATUS_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={85}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {STATUS_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '12px 16px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '10px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Category breakdown */}
                <Card className="rounded-[2.5rem] border-zinc-200/50 dark:border-zinc-800/50 shadow-sm overflow-hidden bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl group hover:shadow-2xl transition-all duration-500">
                    <CardHeader className="pb-0 pt-8 px-8">
                        <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] opacity-60">Categories</CardTitle>
                            <ChartBar className="h-4 w-4 text-zinc-300" />
                        </div>
                        <h4 className="text-lg font-black tracking-tighter">Domain Analysis</h4>
                    </CardHeader>
                    <CardContent className="h-[250px] pt-4 px-4 pb-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={CATEGORY_DATA}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#2dd4bf" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '12px 16px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '10px' }}
                                />
                                <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 8, 8]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Trends */}
                <Card className="rounded-[2.5rem] border-zinc-200/50 dark:border-zinc-800/50 shadow-sm overflow-hidden bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl group hover:shadow-2xl transition-all duration-500">
                    <CardHeader className="pb-0 pt-8 px-8">
                        <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] opacity-60">Momentum</CardTitle>
                            <TrendingUp className="h-4 w-4 text-zinc-300" />
                        </div>
                        <h4 className="text-lg font-black tracking-tighter">Application Trends</h4>
                    </CardHeader>
                    <CardContent className="h-[250px] pt-4 px-4 pb-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={TREND_DATA}>
                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '12px 16px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '10px' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="apps"
                                    stroke="#8b5cf6"
                                    strokeWidth={6}
                                    dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 3, stroke: '#fff' }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
