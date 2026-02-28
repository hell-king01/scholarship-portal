import { ActivityLogModel } from '../models/ActivityLog';
import { DocumentModel } from '../models/Document';
import { UserJourneyStatusModel } from '../models/UserJourneyStatus';
import mongoose from 'mongoose';

export class AnalyticsService {
    static async getStudentAnalytics(userId: string) {
        // Analytics for students
        const journey = await UserJourneyStatusModel.findOne({ userId });
        const docs = await DocumentModel.countDocuments({ userId });
        const applied = journey ? journey.appliedScholarshipsCount : 0;
        const viewed = await ActivityLogModel.countDocuments({ userId, actionType: 'scholarship_viewed' });

        return {
            scholarshipsViewed: viewed,
            totalApplied: applied,
            approved: 0, // Mock for now
            rejected: 0, // Mock for now
            inProgress: applied,
            eligibilityImprovement: [
                { date: '2026-01-01', score: 65 },
                { date: '2026-02-01', score: 72 },
                { date: '2026-03-01', score: 85 },
            ],
            documentUploads: docs,
            deadlineAdherence: 95, // Percent
        };
    }

    static async getAdminAnalytics() {
        // Global admin analytics
        const totalUsers = await UserJourneyStatusModel.countDocuments();
        const totalApplications = await UserJourneyStatusModel.aggregate([
            { $group: { _id: null, total: { $sum: "$appliedScholarshipsCount" } } }
        ]);

        return {
            totalUsers,
            totalApplications: totalApplications[0] ? totalApplications[0].total : 0,
            approvalRate: 15, // Percent
            rejectionRate: 5, // Percent
            mostAppliedScholarships: [
                { name: "Post-Matric ST", count: 450 },
                { name: "L'Oréal Women in Science", count: 320 },
                { name: "Reliance Foundation", count: 280 }
            ],
            categoryDistribution: {
                SC: 25, ST: 20, OBC: 35, General: 20
            },
            monthlyGrowth: [
                { month: 'Jan', users: 1200 },
                { month: 'Feb', users: 2100 },
                { month: 'Mar', users: 3500 },
            ]
        };
    }
}
