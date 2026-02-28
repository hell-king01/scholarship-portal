import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';

// The URL of the Python PaddleOCR service
const PYTHON_OCR_URL = process.env.PYTHON_OCR_URL || 'http://localhost:5000/process-ocr';

export class OcrService {
    static async processDocument(filePath: string, docType: string) {

        // 1. Send file to Python Microservice
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));

        try {
            const response = await axios.post(PYTHON_OCR_URL, formData, {
                headers: {
                    ...formData.getHeaders()
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            const rawData = response.data;
            if (!rawData.success) {
                throw new Error("OCR Service reported an error: " + rawData.error);
            }

            // 2. Parse using Heuristics based on docType
            const parsedData = this.applyHeuristics(rawData.raw_text, docType);

            // 3. Return everything back to the frontend
            return {
                raw_text: rawData.raw_text,
                clusters: rawData.clusters,
                confidence: rawData.confidence_avg,
                parsed: parsedData
            };
        } catch (error: any) {
            console.error("OCR Service Failure:", error.message);
            throw new Error(`Python OCR Service failed: ${error.message}`);
        }
    }

    private static applyHeuristics(rawText: string, docType: string) {
        let extracted: any = {};
        const text = rawText.replace(/\n/g, ' ').replace(/\s+/g, ' ');

        switch (docType.toLowerCase()) {
            case 'aadhaar':
            case 'aadhar':
                const aadhaarRegex = /\d{4}\s\d{4}\s\d{4}/;
                const matchAadhaar = text.match(aadhaarRegex);
                if (matchAadhaar) extracted.documentNumber = matchAadhaar[0];

                const dateMatch = text.match(/(?:DOB|Birth|YOB|जन्म तारीख|जन्म तिथि|जन्मतारीख)[^\d]*(\d{2}\/\d{2}\/\d{4})/i);
                if (dateMatch) extracted.dateOfBirth = dateMatch[1];

                if (/Female|महिला|स्त्री/.test(text)) extracted.gender = "Female";
                else if (/Male|पुरुष/.test(text)) extracted.gender = "Male";
                else if (/Transgender|तृतीयापंथी/.test(text)) extracted.gender = "Transgender";
                break;

            case 'marksheet':
                const percentMatch = text.match(/\b(\d{2,3}(?:\.\d{1,2})?)\s*%/);
                if (percentMatch) extracted.percentage = parseFloat(percentMatch[1]);
                break;

            case 'income':
                const incomeMatch = text.match(/(?:Rs\.?|INR|₹|Rupees|Annual\s*Income|वार्षिक उत्पन्न|र\.?)[^\d]*([\d,]+)/i);
                if (incomeMatch) extracted.annualIncome = parseInt(incomeMatch[1].replace(/,/g, ''), 10);
                break;

            case 'caste':
                const categoryMatch = text.match(/\b(SC|ST|OBC|EWS|General|VJNT|SBC)\b/i);
                if (categoryMatch) extracted.category = categoryMatch[0].toUpperCase();
                break;

            default:
                break;
        }

        return extracted;
    }
}
