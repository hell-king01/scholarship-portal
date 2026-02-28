import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import multer from 'multer';
import { OcrService } from './services/OcrService';
import { EligibilityService } from './services/EligibilityService';
import { DocGenService } from './services/DocGenService';
import { ValidationService } from './services/ValidationService';
import { DocumentModel } from './models/Document';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/temp/' });

// Database connection (Mock config since MVP uses Supabase, but instructions asked for MongoDB)
// We only connect if MONGO_URI is set
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI, {
        // useCreateIndex is no longer needed in newer mongoose versions
    }).then(() => console.log('MongoDB connected'))
        .catch(err => console.error('MongoDB connection error:', err));
}

// Routes
// 1. OCR Upload & Process Endpoint
app.post('/api/ocr', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No document uploaded' });
        }

        const docType = req.body.type || 'unknown';
        const userId = req.body.userId || 'guest';

        // Pass to OcrService
        const result = await OcrService.processDocument(req.file.path, docType);

        // Calculate SHA256 checksum for validation
        const fileBuffer = require('fs').readFileSync(req.file.path);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        const checksum = hashSum.digest('hex');

        // Move to permanent local storage vault
        const userVaultDir = require('path').resolve(__dirname, `../../uploads/${userId}`);
        const fs = require('fs');
        if (!fs.existsSync(userVaultDir)) {
            fs.mkdirSync(userVaultDir, { recursive: true });
        }

        const permanentFilePath = `${userVaultDir}/doc_${docType}_${Date.now()}.png`;
        fs.renameSync(req.file.path, permanentFilePath);

        // Store metadata in MongoDB if connected
        if (process.env.MONGO_URI) {
            await DocumentModel.create({
                userId,
                documentType: docType,
                filePath: permanentFilePath,
                extractedData: result.parsed,
                confidenceScore: result.confidence,
                checksum
            });
        }

        // Write extra raw JSON metadata to vault alongside image
        const rawMetaPath = `${permanentFilePath.replace('.png', '')}_meta.json`;
        fs.writeFileSync(rawMetaPath, JSON.stringify({
            checksum,
            fields: result.parsed
        }));

        res.json({ success: true, data: result });
    } catch (error: any) {
        console.error('OCR Processing Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// 1b. Identity Consistency Endpoint
app.post('/api/validate-identity', async (req, res) => {
    try {
        // Receives multiple documents parsed data to validate
        const { documents } = req.body;

        const validation = ValidationService.checkIdentityConsistency(documents);

        res.json({ success: true, validation });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// 2. Eligibility Predictor & Recomputation Endpoint
app.post('/api/eligibility/recalculate', async (req, res) => {
    try {
        const { currentProfile } = req.body;

        const prediction = EligibilityService.recalculate(currentProfile);

        res.json({ success: true, prediction });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.post('/api/eligibility/simulate', async (req, res) => {
    try {
        const { baseProfile, changes } = req.body;

        const prediction = EligibilityService.simulate(baseProfile, changes);

        res.json({ success: true, prediction });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// 3. Document Generation
app.post('/api/documents/generate', async (req, res) => {
    try {
        const { type, payload, lang } = req.body; // type e.g. "income_affidavit", payload is user data, lang is "en", "hi", "mr"

        const generatedFilePath = await DocGenService.generateDocument(type, payload, lang);

        res.json({ success: true, filePath: generatedFilePath });
    } catch (error: any) {
        console.error('Doc Gen Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});


// 4. Document Vault List
app.get('/api/documents/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userVaultDir = path.resolve(__dirname, `../../uploads/${userId}`);
        const fs = require('fs');

        if (!fs.existsSync(userVaultDir)) {
            return res.json({ success: true, documents: [] });
        }

        // Return a list of all files in user's vault
        const files = fs.readdirSync(userVaultDir, { recursive: true })
            .filter((f: string) => f.endsWith('.pdf') || f.endsWith('.png'));

        const documents = files.map((f: string) => {
            const stats = fs.statSync(path.join(userVaultDir, f));
            const isGenerated = f.includes('generated/');
            const typeMatch = f.match(/doc_(.*)_/);
            const type = isGenerated ? f.split('_')[0].replace('generated/', '') : (typeMatch ? typeMatch[1] : 'unknown');

            return {
                fileName: f,
                type: type,
                uploadDate: stats.mtime,
                size: stats.size,
                status: 'verified', // Mock status
                confidenceScore: 95, // Mock confidence
            };
        });

        res.json({ success: true, documents });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// 5. Serve/Download Document
app.get('/api/documents/:userId/:fileName', (req, res) => {
    const { userId, fileName } = req.params;
    const filePath = path.resolve(__dirname, `../../uploads/${userId}/${fileName}`);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

app.listen(port, () => {
    console.log(`Backend service running on port ${port}`);
});
