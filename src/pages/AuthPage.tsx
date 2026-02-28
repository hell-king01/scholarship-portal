import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Phone, Eye, EyeOff, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/lib/api';

const AuthPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const mode = searchParams.get('mode') || 'signin';
  const [isLogin, setIsLogin] = useState(mode !== 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        if (authMethod === 'email') {
          await authAPI.signIn({ email: formData.email, password: formData.password });
        } else {
          // Phone auth implementation with OTP would go here
          throw new Error('Phone authentication not fully implemented yet');
        }

        toast({
          title: "Welcome back!",
          description: "Redirecting to your dashboard...",
        });
        navigate('/dashboard');
      } else {
        if (authMethod === 'email') {
          // For sign up, we default to student role
          await authAPI.signUp({
            email: formData.email,
            password: formData.password,
            role: 'student',
            name: formData.email.split('@')[0]
          });

          toast({
            title: "Account created!",
            description: "Please check your email for verification. Redirecting to onboarding...",
          });
          navigate('/onboarding');
        } else {
          throw new Error('Phone authentication not fully implemented yet');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: 'Authentication Error',
        description: error.message || 'An error occurred during authentication',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col p-6 md:p-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">ScholarMatch</span>
          </a>
          <LanguageSwitcher />
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-bold mb-2">
                {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
              </h1>
              <p className="text-muted-foreground">
                {isLogin
                  ? "Sign in to continue to your scholarships"
                  : "Start finding scholarships in minutes"}
              </p>
            </div>

            {/* Auth Method Tabs */}
            <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as 'email' | 'phone')} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="gap-2">
                  <Mail className="h-4 w-4" /> Email
                </TabsTrigger>
                <TabsTrigger value="phone" className="gap-2">
                  <Phone className="h-4 w-4" /> Phone
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <TabsContent value="email" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="yourname@example.com"
                        className="pl-10 h-12"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="phone" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('auth.phone')}</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="pl-10 h-12"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </TabsContent>

                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-12"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 h-12"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="text-right">
                    <a href="#" className="text-sm text-primary hover:underline">
                      {t('auth.forgotPassword')}
                    </a>
                  </div>
                )}

                <Button type="submit" className="w-full h-12 text-base gap-2" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? t('common.signIn') : t('common.signUp')}
                      <ChevronRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </Tabs>

            <div className="text-center mt-6">
              <p className="text-muted-foreground text-sm">
                {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary font-medium hover:underline"
                >
                  {isLogin ? t('common.signUp') : t('common.signIn')}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>


      {/* Right Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-accent p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-20 w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-display text-4xl font-bold mb-6">
              Find scholarships made for you
            </h2>
            <ul className="space-y-4">
              {[
                "500+ government & private scholarships",
                "Smart matching based on your profile",
                "Auto-fill forms from your documents",
                "Track all applications in one place",
              ].map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    ✓
                  </div>
                  <span className="text-lg">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Decorative Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 flex gap-4"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex-1">
              <div className="text-2xl font-bold">₹50,000</div>
              <div className="text-sm opacity-80">Avg. scholarship amount</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex-1">
              <div className="text-2xl font-bold">10 min</div>
              <div className="text-sm opacity-80">To complete profile</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
