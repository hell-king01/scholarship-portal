import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronRight,
    History,
    ArrowUpRight,
    Loader2,
    Calendar,
    Zap,
    Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { applicationAPI } from '@/lib/api';

export const DashboardActivity = () => {
    const [activeTab, setActiveTab] = useState<'applications' | 'activity'>('applications');
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apps = await applicationAPI.getAll();
                setApplications(apps || []);
            } catch (err) {
                console.error('Error fetching dashboard activity:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const activities = [
        { id: 1, type: 'ocr', title: 'Income Certificate Verified', time: '2 hours ago', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-100' },
        { id: 2, type: 'match', title: 'New Scholarship Matched!', time: '5 hours ago', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-100' },
        { id: 3, type: 'app', title: 'Application for NSP Submitted', time: 'Yesterday', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-100' },
        { id: 4, type: 'sys', title: 'Profile Updated via AI Sync', time: '1 day ago', icon: History, color: 'text-purple-500', bg: 'bg-purple-100' },
    ];

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'submitted': return 'bg-blue-500/10 text-blue-600 border-blue-200';
            case 'verified': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
            case 'pending': return 'bg-orange-500/10 text-orange-600 border-orange-200';
            case 'rejected': return 'bg-rose-500/10 text-rose-600 border-rose-200';
            default: return 'bg-zinc-500/10 text-zinc-600 border-zinc-200';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Applications Section */}
            <Card className="lg:col-span-8 rounded-[2.5rem] border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
                    <div>
                        <h3 className="font-display font-black text-2xl tracking-tighter flex items-center gap-3">
                            <FileText className="h-6 w-6 text-primary" />
                            Applications
                        </h3>
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">Track your progress</p>
                    </div>
                    <Badge variant="outline" className="rounded-full px-4 py-1 font-black text-[10px] tracking-widest bg-zinc-50 dark:bg-zinc-900 border-none shadow-inner">
                        {applications.length} TOTAL
                    </Badge>
                </div>

                <div className="flex-1 overflow-auto max-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            <p className="text-zinc-400 font-bold text-sm">Loading applications...</p>
                        </div>
                    ) : applications.length > 0 ? (
                        <div className="p-2">
                            {applications.map((app, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={app.id}
                                    className="group p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-[2rem] transition-all duration-300 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 overflow-hidden border border-zinc-200/30">
                                            {app.scholarships?.logo ? (
                                                <img src={app.scholarships.logo} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <FileText className="h-6 w-6 text-zinc-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-lg tracking-tighter text-zinc-900 dark:text-zinc-100 line-clamp-1">{app.scholarships?.title || 'Scholarship Application'}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{new Date(app.created_at).toLocaleDateString()}</span>
                                                <div className="w-1 h-1 rounded-full bg-zinc-300" />
                                                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">ID: #{app.id.slice(0, 8)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <Badge variant="outline" className={`rounded-full px-4 py-1.5 font-black text-[10px] tracking-widest ${getStatusColor(app.status)}`}>
                                            {app.status.toUpperCase()}
                                        </Badge>
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                            <ArrowUpRight className="h-5 w-5" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 px-10 text-center">
                            <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <FileText className="h-10 w-10 text-zinc-200 dark:text-zinc-800" />
                            </div>
                            <h4 className="font-black text-xl mb-2 tracking-tighter">No applications yet</h4>
                            <p className="text-zinc-400 font-medium text-sm">Find a scholarship and start your journey today.</p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-900 mt-auto text-center">
                    <button className="text-sm font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-[0.2em]">View Detailed history</button>
                </div>
            </Card>

            {/* Activity Feed Section */}
            <Card className="lg:col-span-4 rounded-[2.5rem] border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
                    <div>
                        <h3 className="font-display font-black text-2xl tracking-tighter flex items-center gap-3">
                            <History className="h-6 w-6 text-primary" />
                            Activity
                        </h3>
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">System logs</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center shadow-inner">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                </div>

                <div className="p-6 overflow-auto max-h-[400px]">
                    <div className="space-y-6">
                        {activities.map((act, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={act.id}
                                className="flex gap-5 relative group"
                            >
                                {idx < activities.length - 1 && (
                                    <div className="absolute top-12 left-6 bottom-[-24px] w-px bg-zinc-100 dark:bg-zinc-800" />
                                )}

                                <div className={`w-12 h-12 shrink-0 ${act.bg} ${act.color} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500 z-10`}>
                                    <act.icon className="h-6 w-6" />
                                </div>

                                <div className="pt-1">
                                    <h4 className="font-black text-sm tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors">{act.title}</h4>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                                        <Clock className="h-3 w-3" />
                                        {act.time}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="p-6 mt-auto">
                    <button className="w-full py-4 rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-[0.98]">
                        Explore Logs
                    </button>
                </div>
            </Card>
        </div>
    );
};
