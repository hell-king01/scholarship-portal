import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { ConsistencyValidationEngine } from './ConsistencyValidationEngine';

export class DocGenService {
    /**
     * Structure for document data consistency snapshot.
     */
    private static createSnapshot(data: any): string {
        return JSON.stringify({
            fullName: data.fullName,
            annualIncome: data.annualIncome,
            category: data.category,
            state: data.state,
            percentage: data.percentage
        });
    }

    /**
     * Generates a template document populated by user data and converts to PDF.
     * Includes versioning and consistency validation.
     */
    static async generateDocument(type: string, data: any, lang: string = 'en', ocrCache: any = {}): Promise<any> {
        // 1. Consistency Check
        const validation = ConsistencyValidationEngine.validate(data, ocrCache);
        if (!validation.isValid) {
            throw new Error(`CONSISTENCY_ERROR: Use of mismatched identity detected. ${validation.errors.join(". ")}`);
        }

        // 2. Map types to template files
        const templateFile = `${type}_${lang}.hbs`;
        let actualTemplatePath = path.resolve(__dirname, `../../templates/${templateFile}`);

        if (!fs.existsSync(actualTemplatePath)) {
            actualTemplatePath = path.resolve(__dirname, `../../templates/${type}_en.hbs`);
            if (!fs.existsSync(actualTemplatePath)) {
                throw new Error(`Template for type '${type}' not found.`);
            }
        }

        const templateSource = fs.readFileSync(actualTemplatePath, 'utf8');
        const template = Handlebars.compile(templateSource);

        const html = template({
            ...data,
            date: new Date().toLocaleDateString(lang === 'mr' ? 'mr-IN' : (lang === 'hi' ? 'hi-IN' : 'en-IN')),
            income_in_words: this.numberToWords(data.annualIncome || 0, lang),
            financialYear: this.getFinancialYear(),
            docId: `VR-${Date.now().toString(36).toUpperCase()}`
        });

        // 3. Launch puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' }
        });

        await browser.close();

        // 4. Save to Vault with Versioning
        const userId = data.userId || 'guest';
        const vaultDir = path.resolve(__dirname, `../../uploads/${userId}/vault`);
        if (!fs.existsSync(vaultDir)) fs.mkdirSync(vaultDir, { recursive: true });

        const vaultMetaPath = path.join(vaultDir, `${type}_meta.json`);
        let vaultMeta: any = { versions: [] };
        if (fs.existsSync(vaultMetaPath)) {
            vaultMeta = JSON.parse(fs.readFileSync(vaultMetaPath, 'utf8'));
        }

        const versionNumber = vaultMeta.versions.length + 1;
        const fileName = `${type}_v${versionNumber}_${Date.now()}.pdf`;
        const outputPath = path.join(vaultDir, fileName);
        fs.writeFileSync(outputPath, pdfBuffer);

        const versionEntry = {
            versionNumber,
            generatedAt: new Date().toISOString(),
            fileName,
            language: lang,
            dataSnapshot: this.createSnapshot(data),
            checksum: `SHA-${Date.now().toString(16)}`
        };

        vaultMeta.versions.push(versionEntry);
        fs.writeFileSync(vaultMetaPath, JSON.stringify(vaultMeta, null, 2));

        return {
            success: true,
            path: outputPath,
            fileName,
            version: versionNumber,
            allVersions: vaultMeta.versions
        };
    }

    private static numberToWords(num: number, lang: string): string {
        const formatters: any = {
            en: (n: number) => `Rupees ${n.toLocaleString('en-IN')}`,
            hi: (n: number) => `रुपये ${n.toLocaleString('hi-IN')}`,
            mr: (n: number) => `रुपये ${n.toLocaleString('mr-IN')}`
        };
        return (formatters[lang] || formatters.en)(num);
    }

    private static getFinancialYear(): string {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    }
}
