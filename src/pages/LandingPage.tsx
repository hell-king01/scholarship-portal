import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { GraduationCap, Search, FileCheck, Languages, Sparkles, ChevronRight, Users, IndianRupee, Award, Star, ArrowRight, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const { t } = useTranslation();
  const { authenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && authenticated) {
      navigate('/dashboard');
    }
  }, [authenticated, loading, navigate]);

  const features = [
    {
      icon: Search,
      title: t('landing.features.match.title'),
      description: t('landing.features.match.description'),
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: FileCheck,
      title: t('landing.features.ocr.title'),
      description: t('landing.features.ocr.description'),
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Sparkles,
      title: t('landing.features.track.title'),
      description: t('landing.features.track.description'),
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Languages,
      title: t('landing.features.language.title'),
      description: t('landing.features.language.description'),
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  const stats = [
    { value: '500+', label: t('landing.stats.scholarships'), icon: Award },
    { value: '1,00,000+', label: t('landing.stats.students'), icon: Users },
    { value: '₹200+', label: t('landing.stats.amount'), icon: IndianRupee },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'Bihar',
      text: 'I found 12 scholarships I qualified for in just 10 minutes. Got ₹50,000 for my engineering degree!',
      textHi: 'मुझे सिर्फ 10 मिनट में 12 छात्रवृत्तियां मिलीं जिनके लिए मैं योग्य थी। मेरी इंजीनियरिंग डिग्री के लिए ₹50,000 मिले!',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    },
    {
      name: 'Rahul Kumar',
      location: 'Jharkhand',
      text: 'The document upload made it so easy. My Aadhar details were filled automatically!',
      textHi: 'दस्तावेज़ अपलोड करना बहुत आसान था। मेरे आधार की जानकारी अपने आप भर गई!',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    },
    {
      name: 'Anita Devi',
      location: 'Uttar Pradesh',
      text: 'Using in Hindi made everything simple. My daughter got admission with full scholarship.',
      textHi: 'हिंदी में उपयोग करने से सब कुछ आसान हो गया। मेरी बेटी को पूर्ण छात्रवृत्ति के साथ प्रवेश मिला।',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">ScholarMatch</span>
            </div>
            <div className="flex items-center gap-3">

              {authenticated ? (
                <Link to="/dashboard">
                  <Button className="flex">{t('common.dashboard') || 'Dashboard'}</Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost">{t('common.signIn')}</Button>
                  </Link>
                  <Link to="/auth?mode=signup">
                    <Button className="hidden sm:flex">{t('common.getStarted')}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-sm font-medium text-secondary-foreground mb-6">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Free for all students</span>
              </div>

              <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-6">
                {t('landing.heroTitle')}
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t('landing.heroSubtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="btn-hero text-lg px-8 py-6 gap-2">
                    {t('landing.cta')}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  {t('common.learnMore')}
                </Button>
              </div>
            </motion.div>

            {/* Hero Image/Illustration */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-12 relative"
            >
              <div className="relative mx-auto max-w-3xl">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
                <div className="relative bg-card rounded-3xl border border-border shadow-elevated p-4 md:p-6">
                  <div className="bg-secondary rounded-2xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Mock Dashboard Preview */}
                      <div className="bg-card rounded-xl p-4 shadow-soft">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent" />
                          <div>
                            <div className="h-3 w-20 bg-muted rounded" />
                            <div className="h-2 w-14 bg-muted rounded mt-1" />
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-accent">12</div>
                        <div className="text-sm text-muted-foreground">Matched Scholarships</div>
                      </div>
                      <div className="bg-card rounded-xl p-4 shadow-soft">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">95% Match</span>
                        </div>
                        <div className="h-3 w-full bg-muted rounded mb-2" />
                        <div className="h-2 w-3/4 bg-muted rounded" />
                        <div className="mt-3 flex gap-2">
                          <div className="h-6 flex-1 bg-primary/20 rounded" />
                          <div className="h-6 flex-1 bg-muted rounded" />
                        </div>
                      </div>
                      <div className="bg-card rounded-xl p-4 shadow-soft border border-primary/20 bg-gradient-to-br from-card to-primary/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Smart Assistant</span>
                        </div>
                        <div className="text-[9px] font-mono text-primary/60 mb-2">Secure Token Ready</div>
                        <div className="bg-accent/10 rounded-lg p-2 mb-2 border border-accent/20">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[8px] font-bold text-accent">Zero-Install Magic</span>
                            <span className="text-[7px] bg-accent/20 text-accent px-1.5 rounded-full">ACTIVE</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full w-full bg-accent animate-pulse" />
                          </div>
                        </div>
                        <Button size="sm" className="w-full h-7 text-[10px] gap-1">
                          <MousePointerClick className="h-3 w-3" /> Install Apply Widget
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
                  <stat.icon className="h-7 w-7 text-primary" />
                </div>
                <div className="text-4xl font-display font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {t('landing.features.title')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card p-6 rounded-3xl border border-border hover:shadow-card transition-shadow"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {t('landing.testimonials.title')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card p-6 rounded-3xl border border-border"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex gap-1 mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary to-accent rounded-3xl p-8 md:p-12 text-center text-primary-foreground"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Ready to find your perfect scholarship?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
              Join thousands of students who have already discovered scholarships they qualify for.
            </p>
            <Link to="/auth?mode=signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 gap-2">
                {t('common.getStarted')} - It's Free
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">ScholarMatch</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">About</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <div className="text-sm text-muted-foreground">
              Made with ❤️ for Indian students
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
