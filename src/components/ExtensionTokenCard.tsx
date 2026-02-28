import React from 'react';
import { ShieldCheck, MoveUp, Globe, MousePointerClick, Copy, ExternalLink, Zap, Link as LinkIcon } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'framer-motion';

export const ExtensionTokenCard = () => {
    return (
        <Card className="rounded-[2.5rem] border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden flex flex-col h-full group hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-500">
            <div className="p-8 flex flex-col gap-6 h-full">
                <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <ShieldCheck className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                    </div>
                    <Badge variant="outline" className="rounded-full px-4 py-1 font-black text-[10px] tracking-widest text-emerald-500 border-emerald-500/20 bg-emerald-500/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                        READY
                    </Badge>
                </div>

                <div>
                    <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Secure Token Ready</p>
                    <h3 className="font-display font-black text-2xl tracking-tighter">EXTENSION TOKEN</h3>
                </div>

                <div className="flex-1 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/20 rounded-[2rem] p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <Zap className="h-4 w-4 fill-current" />
                            <span className="text-[11px] font-black uppercase tracking-wider">Zero-Install Magic</span>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] font-black tracking-widest px-2 py-0.5">HOT</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: MoveUp, label: '1. Drag Up' },
                            { icon: Globe, label: '2. Visit .gov' },
                            { icon: MousePointerClick, label: '3. Click Bar' }
                        ].map((step, i) => (
                            <div key={i} className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-zinc-900 border ${i === 2 ? 'border-orange-200 bg-orange-50/50' : 'border-zinc-100 dark:border-zinc-800'} shadow-sm hover:scale-105 transition-transform duration-300`}>
                                <step.icon className={`h-5 w-5 mb-2 ${i === 2 ? 'text-orange-500' : 'text-zinc-400'}`} />
                                <span className={`text-[9px] font-black tracking-tight text-center leading-tight ${i === 2 ? 'text-orange-600' : 'text-zinc-500'}`}>{step.label}</span>
                            </div>
                        ))}
                    </div>

                    <Button className="w-full h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs gap-3 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]">
                        <LinkIcon className="h-4 w-4" />
                        ScholarMatch Bridge (Drag Me)
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                    <Button variant="outline" className="h-12 rounded-full border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-black text-[10px] uppercase tracking-wider gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
                        <ExternalLink className="h-4 w-4" />
                        Dev Load
                    </Button>
                    <Button variant="outline" className="h-12 rounded-full border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-black text-[10px] uppercase tracking-wider gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
                        <Copy className="h-4 w-4" />
                        Copy Token
                    </Button>
                </div>
            </div>
        </Card>
    );
};
