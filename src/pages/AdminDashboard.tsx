import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Users, GraduationCap, TrendingUp, DollarSign, PieChart,
  BarChart3, Activity, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminAPI } from '@/lib/api';
import {
  BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  totalUsers: number;
  eligibleUsers: number;
  ineligibleUsers: number;
  totalScholarships: number;
  popularScholarships: Array<{
    id: string;
    title: string;
    applications: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
  }>;
  applicationsOverTime: Array<{
    date: string;
    applications: number;
  }>;
  eligibleVsIneligible: {
    eligible: number;
    ineligible: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading system analytics...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-20 flex items-center justify-center">
          <Card className="p-12 text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h3 className="font-semibold text-xl mb-2">Failed to load analytics</h3>
            <p className="text-muted-foreground mb-6">We couldn't retrieve the system metrics at this time. Please try again later.</p>
            <Button onClick={loadAnalytics}>Retry Now</Button>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  const pieData = [
    { name: 'Eligible', value: analytics.eligibleVsIneligible.eligible },
    { name: 'Ineligible', value: analytics.eligibleVsIneligible.ineligible },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl font-bold mb-2">System <span className="gradient-text">Analytics</span></h1>
          <p className="text-muted-foreground">Platform-wide overview of scholarship performance and user engagement.</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{analytics.totalUsers}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{analytics.eligibleUsers}</div>
              <div className="text-sm text-muted-foreground">Eligible Users</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{analytics.ineligibleUsers}</div>
              <div className="text-sm text-muted-foreground">Ineligible Users</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{analytics.totalScholarships}</div>
              <div className="text-sm text-muted-foreground">Total Scholarships</div>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Eligible vs Ineligible Pie Chart */}
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Eligibility Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </Card>

              {/* Category Distribution */}
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Category Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.categoryDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scholarships" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Popular Scholarships
              </h3>
              <div className="space-y-3">
                {analytics.popularScholarships.map((scholarship, index) => (
                  <div
                    key={scholarship.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{scholarship.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {scholarship.applications} applications
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Category Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.categoryDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Applications Over Time
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.applicationsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Applications"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};



