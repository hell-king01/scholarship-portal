import { UserJourneyStatusModel } from '../models/UserJourneyStatus';

export class UserJourneyService {
    static async getJourney(userId: string) {
        let journey = await UserJourneyStatusModel.findOne({ userId });
        if (!journey) {
            journey = new UserJourneyStatusModel({
                userId,
                stepsCompleted: ["LOGIN"] // First step completed on login
            });
            await journey.save();
        }
        return journey;
    }

    static async updateStep(userId: string, step: string) {
        let journey = await UserJourneyStatusModel.findOne({ userId });
        if (!journey) {
            journey = new UserJourneyStatusModel({ userId, stepsCompleted: ["LOGIN"] });
        }

        if (!journey.stepsCompleted.includes(step)) {
            journey.stepsCompleted.push(step);

            // Map steps to status flags
            if (step === 'PROFILE') journey.profileCompleted = true;
            if (step === 'OCR') journey.ocrCompleted = true;
            if (step === 'ELIGIBILITY') journey.eligibilityChecked = true;

            journey.updatedAt = new Date();
            await journey.save();
        }
        return journey;
    }
}
