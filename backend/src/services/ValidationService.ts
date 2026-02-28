export class ValidationService {
    /**
     * Cross-checks extracted data across multiple document types for consistency.
     * @param extractedDocs Array of documents with their normalized parsed output
     */
    static checkIdentityConsistency(extractedDocs: any[]) {
        let issues: string[] = [];
        let mismatchScore = 0; // Total 100 possible penalty points

        let allDOBs = new Set<string>();
        let allGenders = new Set<string>();

        // Let's assume extractedDocs is [ {type: 'aadhaar', data: {dateOfBirth, gender}}, ... ]

        for (const doc of extractedDocs) {
            if (doc.data.dateOfBirth) allDOBs.add(doc.data.dateOfBirth);
            if (doc.data.gender) allGenders.add(doc.data.gender);
        }

        // Rule 2: Date of Birth must be identical
        if (allDOBs.size > 1) {
            issues.push("Date of Birth mismatch detected across documents.");
            mismatchScore += 50;
        }

        // Rule 3: Gender consistency
        if (allGenders.size > 1) {
            issues.push("Gender mismatch detected across documents.");
            mismatchScore += 40;
        }

        // Rule 1: Name fuzzy match (Placeholder: we assume Name isn't directly extracted yet, or if it is we compare it)
        // Fuzzy match tolerance logic can rely on Levenshtein distance 

        // Rule 4: Prevent profile finishing if mismatches > 10% threshold occur
        return {
            valid: mismatchScore < 10,
            mismatchScore,
            issues
        };
    }
}
