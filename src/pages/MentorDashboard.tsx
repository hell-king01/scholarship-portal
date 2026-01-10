import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Users, CheckCircle2, XCircle, Clock, FileText, Search,
  ChevronRight, AlertCircle, GraduationCap
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { mentorAPI } from '@/lib/api';

interface Student {
  id: string;
  name: string;
  email: string;
  category: string;
  state: string;
  applications: Array<{
    id: string;
    scholarshipTitle: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
  }>;
}

export const MentorDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const data = await mentorAPI.getAssignedStudents();
      setStudents(data);
    } catch (error) {
      console.error('Failed to load students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assigned students',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedStudent || !selectedApplication) return;

    try {
      await mentorAPI.approveEligibility(selectedStudent.id, selectedApplication, comments);
      toast({
        title: 'Approved',
        description: 'Student eligibility has been approved',
      });
      setApprovalDialogOpen(false);
      setComments('');
      loadStudents();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve eligibility',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    if (!selectedStudent || !selectedApplication || !rejectionReason) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection reason',
        variant: 'destructive',
      });
      return;
    }

    try {
      await mentorAPI.rejectEligibility(selectedStudent.id, selectedApplication, rejectionReason);
      toast({
        title: 'Rejected',
        description: 'Student eligibility has been rejected',
      });
      setRejectionDialogOpen(false);
      setRejectionReason('');
      loadStudents();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject eligibility',
        variant: 'destructive',
      });
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingApplications = students.flatMap(student =>
    student.applications
      .filter(app => app.status === 'pending')
      .map(app => ({ ...app, student }))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h1 className="font-display font-bold text-xl">Mentor Dashboard</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assigned Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold">{pendingApplications.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">
                  {students.reduce((sum, s) => sum + s.applications.length, 0)}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Reviews ({pendingApplications.length})
            </TabsTrigger>
            <TabsTrigger value="students">All Students ({students.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingApplications.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Pending Reviews</h3>
                <p className="text-muted-foreground">All applications have been reviewed</p>
              </Card>
            ) : (
              pendingApplications.map((item, index) => (
                <motion.div
                  key={`${item.student.id}-${item.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{item.student.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.student.email}</p>
                          </div>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Scholarship</p>
                            <p className="font-medium">{item.scholarshipTitle}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              Category: {item.student.category}
                            </span>
                            <span className="text-muted-foreground">
                              State: {item.student.state}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Submitted: {new Date(item.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending Review
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(item.student);
                            setSelectedApplication(item.id);
                            setApprovalDialogOpen(true);
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedStudent(item.student);
                            setSelectedApplication(item.id);
                            setRejectionDialogOpen(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredStudents.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Students Found</h3>
                <p className="text-muted-foreground">No students match your search</p>
              </Card>
            ) : (
              filteredStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{student.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{student.email}</p>
                        <div className="flex items-center gap-4 text-sm mb-3">
                          <span>Category: {student.category}</span>
                          <span>State: {student.state}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {student.applications.length} Application{student.applications.length !== 1 ? 's' : ''}
                          </Badge>
                          {student.applications.filter(a => a.status === 'pending').length > 0 && (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                              {student.applications.filter(a => a.status === 'pending').length} Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Eligibility</DialogTitle>
            <DialogDescription>
              Approve {selectedStudent?.name}'s eligibility for this scholarship application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comments">Comments (Optional)</Label>
              <Textarea
                id="comments"
                placeholder="Add any comments or notes..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Eligibility</DialogTitle>
            <DialogDescription>
              Reject {selectedStudent?.name}'s eligibility. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">
                Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Explain why this application is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason}>
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};



