import { ActivityLogModel } from '../models/ActivityLog';

export class ActivityService {
    static async logAction(userId: string, actionType: string, description: string, metadata: any = {}) {
        try {
            const log = new ActivityLogModel({
                userId,
                actionType,
                description,
                metadata
            });
            await log.save();
        } catch (err) {
            console.error("Error logging activity:", err);
        }
    }

    static async getLogs(userId: string, actionType?: string) {
        let filter: any = { userId };
        if (actionType) {
            filter.actionType = actionType;
        }

        return ActivityLogModel.find(filter).sort({ createdAt: -1 }).limit(100);
    }
}
