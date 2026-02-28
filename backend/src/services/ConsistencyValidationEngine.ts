export class ConsistencyValidationEngine {
    /**
     * Cross-checks profile data against OCR extracted document data.
     * @param profile The current user profile.
     * @param documentCache The cached OCR data from localStorage (or passed from client).
     */
    static validate(profile: any, documentCache: any) {
        const errors: string[] = [];

        // 1. Name Check (vs Aadhaar)
        if (documentCache.aadhaar && documentCache.aadhaar.name) {
            if (this.normalize(profile.fullName) !== this.normalize(documentCache.aadhaar.name)) {
                errors.push(`Name mismatch: Profile has "${profile.fullName}" while Aadhaar shows "${documentCache.aadhaar.name}"`);
            }
        }

        // 2. DOB Check (vs Aadhaar)
        if (documentCache.aadhaar && documentCache.aadhaar.dob) {
            if (profile.dateOfBirth !== documentCache.aadhaar.dob) {
                errors.push(`Date of Birth mismatch: Profile has ${profile.dateOfBirth} while Aadhaar shows ${documentCache.aadhaar.dob}`);
            }
        }

        // 3. Income Check (vs Income Certificate)
        if (documentCache.income && documentCache.income.annualIncome) {
            const profileIncome = Number(profile.annualIncome);
            const docIncome = Number(documentCache.income.annualIncome);
            if (profileIncome > docIncome) {
                errors.push(`Income discrepancy: Profile income (₹${profileIncome}) is higher than verified Income Certificate (₹${docIncome})`);
            }
        }

        // 4. Category Check (vs Caste Certificate)
        if (documentCache.caste && documentCache.caste.category) {
            if (profile.category !== documentCache.caste.category) {
                errors.push(`Category mismatch: Profile states ${profile.category} while Caste Certificate shows ${documentCache.caste.category}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    private static normalize(str: string): string {
        return (str || '').toLowerCase().replace(/\s+/g, '').trim();
    }
}
