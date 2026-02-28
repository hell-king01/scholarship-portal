import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Calculator, CheckCircle2, XCircle, AlertCircle, Loader2,
  TrendingUp, Sparkles, Brain, ArrowRight, Info, Target, Zap, IndianRupee
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { profileAPI } from '@/lib/api';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const EligibilityPredictor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Simulation State
  const [simData, setSimData] = useState({
    marks: 0,
    income: 0,
    category: ''
  });

  const fetchCurrentEligibility = async () => {
    try {
      setLoading(true);
      const prof = await profileAPI.getProfile();
      setProfile(prof);
      setSimData({
        marks: prof?.percentage || 0,
        income: prof?.annual_income || 0,
        category: prof?.category || 'General'
      });

      const resp = await fetch(`${BACKEND_URL}/api/eligibility/recalculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: prof?.id || 'temp' })
      });
      const data = await resp.json();
      setPrediction(data.prediction);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    setSimulating(true);
    try {
      const resp = await fetch(`${BACKEND_URL}/api/eligibility/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marks: Number(simData.marks),
          income: Number(simData.income),
          category: simData.category
        })
      });
      const data = await resp.json();
      setPrediction(data.prediction);
      toast({ title: "Simulation Complete", description: "Scholarship eligibility recalculated." });
    } catch (err) {
      toast({ title: "Simulation Failed", variant: "destructive" });
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    fetchCurrentEligibility();
  }, []);

  const getProbabilityColor = (p: string) => {
    if (p === 'High') return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (p === 'Medium') return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse text-sm font-medium">Analyzing your profile with AI...</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Simulation Controls - Left Side */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="p-6 border-primary/20 bg-primary/5 shadow-xl shadow-primary/5">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <Zap className="h-5 w-5 fill-primary/20" />
            <h3 className="font-bold text-lg">"What If" Simulator</h3>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Simulated Marks (%)</Label>
              <div className="flex gap-4 items-center">
                <Input
                  type="number"
                  value={simData.marks}
                  onChange={(e) => setSimData({ ...simData, marks: Number(e.target.value) })}
                  className="h-10 bg-background"
                />
                <span className="text-sm font-bold text-primary w-12">{simData.marks}%</span>
              </div>
              <Progress value={simData.marks} className="h-1.5" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Simulated Annual Income</Label>
              <Input
                type="number"
                value={simData.income}
                onChange={(e) => setSimData({ ...simData, income: Number(e.target.value) })}
                className="h-10 bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Category Change</Label>
              <Select value={simData.category} onValueChange={(v) => setSimData({ ...simData, category: v })}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="OBC">OBC</SelectItem>
                  <SelectItem value="SC">SC</SelectItem>
                  <SelectItem value="ST">ST</SelectItem>
                  <SelectItem value="EWS">EWS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={runSimulation}
              disabled={simulating}
              className="w-full mt-4 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              {simulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
              Recalculate AI Score
            </Button>

            <p className="text-[10px] text-center text-muted-foreground">
              Note: Simulation changes are not saved to your profile.
            </p>
          </div>
        </Card>

        {/* Forecast Card */}
        <Card className="p-5 border-dashed bg-accent/5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-accent" />
            <h4 className="text-sm font-bold">Future Forecast</h4>
          </div>
          <div className="text-xs space-y-2">
            <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
              <span className="text-muted-foreground">Next Grade Predicted:</span>
              <span className="font-bold text-primary">{prediction?.forecast?.nextGrade || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
              <span className="text-muted-foreground">Est. Marks (AI):</span>
              <span className="font-bold text-primary">{prediction?.forecast?.estimatedMarks || 'N/A'}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Prediction Output - Right Side */}
      <div className="lg:col-span-2 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={prediction?.overallScore || 'none'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <Badge className={`px-4 py-1.5 text-sm font-bold border ${getProbabilityColor(prediction?.probabilityLabel)}`}>
                  {prediction?.probabilityLabel} Probability
                </Badge>
              </div>

              <div className="mb-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div>
                  <h3 className="text-3xl font-display font-bold mb-2">AI Eligibility Score</h3>
                  <div className="flex items-end gap-3">
                    <span className="text-6xl font-black text-primary tracking-tighter">
                      {prediction?.overallScore || 0}
                    </span>
                    <span className="text-muted-foreground font-medium mb-2">/ 100</span>
                  </div>
                </div>

                <div className="p-6 bg-primary/10 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 flex-1 md:max-w-xs shadow-inner">
                  <div className="text-[10px] uppercase font-black text-primary/70 mb-1 tracking-widest">Est. Potential Aid</div>
                  <div className="text-3xl font-black flex items-center gap-2">
                    <IndianRupee className="h-6 w-6" />
                    {((prediction?.overallScore || 0) * 1200).toLocaleString()}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium">Predicted based on matching scholarship history</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {Object.entries(prediction?.weightedScores || {}).map(([key, score]: [string, any]) => (
                  <div key={key} className="p-3 bg-muted/40 rounded-xl border border-muted-foreground/10 text-center">
                    <div className="text-[10px] uppercase text-muted-foreground font-bold mb-1">{key}</div>
                    <div className="text-lg font-black text-primary">{score}/100</div>
                    <Progress value={score} className="h-1 mt-2" />
                  </div>
                ))}
              </div>

              <Tabs defaultValue="explanation">
                <TabsList className="mb-6">
                  <TabsTrigger value="explanation" className="gap-2">
                    <Info className="h-4 w-4" /> Why Match?
                  </TabsTrigger>
                  <TabsTrigger value="suggestions" className="gap-2">
                    <Sparkles className="h-4 w-4" /> Suggestions
                  </TabsTrigger>
                  <TabsTrigger value="missing" className="gap-2">
                    <AlertCircle className="h-4 w-4" /> Missing Criteria
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="explanation" className="space-y-3">
                  {Object.entries(prediction?.explanationBreakdown || {}).map(([key, text]: [string, any]) => (
                    <div key={key} className="flex gap-3 items-center p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm font-medium capitalize"><span className="font-bold">{key}:</span> {text}</span>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="suggestions" className="space-y-3">
                  {(prediction?.improvementSuggestions || prediction?.suggestions)?.map((s: string, i: number) => (
                    <div key={i} className="flex gap-3 items-start p-3 bg-green-500/5 rounded-lg border border-green-500/10">
                      <Zap className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm font-medium">{s}</span>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="missing" className="space-y-3">
                  {prediction?.missingCriteria?.length > 0 ? (
                    prediction.missingCriteria.map((m: string, i: number) => (
                      <div key={i} className="flex gap-3 items-start p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        <span className="text-sm font-medium text-destructive">{m}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex gap-3 items-center p-3 bg-green-500/10 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-bold">You meet all basic requirements!</span>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Gamification Tip */}
        <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 flex gap-4 items-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center animate-pulse">
            <Target className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h4 className="font-bold text-primary">Unlock New Tiers!</h4>
            <p className="text-xs text-muted-foreground italic">
              {prediction?.overallScore < 80
                ? "Increase your marks by 5% to unlock 'Premium Foundation' scholarships."
                : "You're in the top 10% of applicants! Apply to 'Elite Match' scholarships now."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


