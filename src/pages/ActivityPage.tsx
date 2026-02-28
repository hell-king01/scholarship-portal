import React, { useState, useEffect } from 'react';
import { Clock, User, FileText, Bot, Search, Briefcase, UserCheck } from 'lucide-react';
import { Header } from '../components/Header';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { format } from 'date-fns';

const ActivityPage = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [filter, setFilter] = useState('all');
    const userId = "guest"; // Should come from context

    useEffect(() => {
        fetch(`http://localhost:3001/api/activity?userId=${userId}${filter !== 'all' ? `&actionType=${filter}` : ''}`)
            .then(res => res.json())
            .then(data => data.success && setLogs(data.logs));
    }, [filter]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'profile_updated': return <User className="text-blue-500" />;
            case 'ocr_upload': return <FileText className="text-indigo-500" />;
            case 'chatbot_interaction': return <Bot className="text-purple-500" />;
            case 'scholarship_applied': return <Briefcase className="text-green-500" />;
            case 'eligibility_checked': return <UserCheck className="text-yellow-500" />;
            default: return <Clock className="text-gray-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header />
            <div className="max-w-4xl mx-auto pt-24 px-6">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Activity History</h1>
                        <p className="text-gray-500 mt-1">Track everything you've done on the platform</p>
                    </div>
                    <div className="w-48">
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="bg-white border-gray-200">
                                <SelectValue placeholder="All Activities" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Activities</SelectItem>
                                <SelectItem value="profile_updated">Profile Updates</SelectItem>
                                <SelectItem value="ocr_upload">OCR Uploads</SelectItem>
                                <SelectItem value="chatbot_interaction">Chatbot Chats</SelectItem>
                                <SelectItem value="scholarship_applied">Applications</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block"></div>

                    <div className="space-y-8 relative">
                        {logs.map((log, i) => (
                            <div key={log._id} className="flex gap-6 items-start">
                                <div className="z-10 w-14 h-14 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm relative group-hover:scale-110 transition-transform">
                                    {getIcon(log.actionType)}
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white border border-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400">
                                        {i + 1}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                                        <h3 className="text-lg font-bold text-gray-800">
                                            {log.actionType.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                                        </h3>
                                        <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-400 rounded-md tracking-tight">
                                            {format(new Date(log.createdAt), 'MMM dd, yyyy · hh:mm a')}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 leading-normal">{log.description}</p>

                                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                                        <div className="mt-3 p-3 bg-white/50 border border-gray-100 rounded-xl text-xs text-gray-500 font-mono overflow-x-auto">
                                            {JSON.stringify(log.metadata, null, 2)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {logs.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <p className="text-gray-500">No activity logs found. Start exploring!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityPage;
