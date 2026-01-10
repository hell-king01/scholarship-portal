import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Bell, X, Mail, MessageSquare, CheckCircle2, Clock, AlertCircle,
  GraduationCap, FileText, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { notificationAPI } from '@/lib/api';

interface Notification {
  id: string;
  type: 'email' | 'sms' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
}

export const NotificationsPanel = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({ email: true, sms: true });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    loadPreferences();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await notificationAPI.getAll();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const data = await notificationAPI.getPreferences();
      setPreferences(data);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast({
        title: 'All notifications marked as read',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all as read',
        variant: 'destructive',
      });
    }
  };

  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      await notificationAPI.updatePreferences(newPreferences);
      setPreferences(newPreferences);
      toast({
        title: 'Preferences updated',
        description: 'Your notification preferences have been saved',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update preferences',
        variant: 'destructive',
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'sms':
        return <MessageSquare className="h-5 w-5" />;
      case 'system':
        return <Bell className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-full w-full md:w-96 bg-card border-l border-border shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5" />
          <h2 className="font-semibold text-lg">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="notifications" className="flex-1">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No notifications</h3>
                <p className="text-sm text-muted-foreground text-center">
                  You're all caught up! New notifications will appear here.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <AnimatePresence>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Card
                        className={`p-4 cursor-pointer hover:bg-muted transition-colors ${
                          !notification.read ? 'bg-primary/5 border-primary/20' : ''
                        }`}
                        onClick={() => {
                          if (!notification.read) {
                            markAsRead(notification.id);
                          }
                          if (notification.actionUrl) {
                            window.location.href = notification.actionUrl;
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            notification.type === 'email' ? 'bg-blue-100 text-blue-600' :
                            notification.type === 'sms' ? 'bg-green-100 text-green-600' :
                            'bg-primary/10 text-primary'
                          }`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-sm">{notification.title}</h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 overflow-auto p-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={preferences.email}
                    onCheckedChange={(checked) =>
                      updatePreferences({ ...preferences, email: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notifications" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      SMS Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={preferences.sms}
                    onCheckedChange={(checked) =>
                      updatePreferences({ ...preferences, sms: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="font-semibold mb-3">Notification Types</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">New Scholarship Matches</p>
                    <p className="text-xs text-muted-foreground">When new scholarships match your profile</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Application Status Updates</p>
                    <p className="text-xs text-muted-foreground">When your application status changes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Deadline Reminders</p>
                    <p className="text-xs text-muted-foreground">Reminders before scholarship deadlines</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Profile Completion</p>
                    <p className="text-xs text-muted-foreground">Reminders to complete your profile</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};



