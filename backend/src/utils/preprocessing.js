// preprocessing.js
import fs from 'fs';
import path from 'path';
import pdfLib from 'pdf-lib'; // Use pdf-lib or another library for PDF processing
import * as docx from 'docx'; // Use a suitable library for DOCX processing
import { promisify } from 'util';
import { parseStringPromise } from 'xml2js'; // For parsing XML in DOCX
import { Document } from 'docx'; // Use 'docx' or another library for .docx
import * as temp from 'temp'; // For temporary file handling
import mammoth from 'mammoth';

const unlinkAsync = promisify(fs.unlink);

class Preprocessing {
    constructor(doctype, filename, document) {
        this.doctype = doctype;
        this.filename = filename;
        this.document = document; // Expecting base64 string
    }

    async checkFileTypeProcess() {
        let processedText = '';
        const fileExtension = path.extname(this.filename).toLowerCase();

        if (fileExtension === '.pdf') {
            processedText = await this.pdfExtraction(this.document);
        } else if (fileExtension === '.docx') {
            processedText = await this.docxExtraction(this.document);
        } else if (fileExtension === '.doc') {
            processedText = await this.docExtraction(this.document);
        } else {
            throw new Error('Unsupported file type');
        }

        return processedText;
    }

    async pdfExtraction(document) {
        try {
            const pdfBytes = Buffer.from(document, 'base64'); // Decode base64
            const pdfDoc = await pdfLib.PDFDocument.load(pdfBytes);
            let totalText = '';

            const pages = pdfDoc.getPages();
            for (const page of pages) {
                const text = await page.getTextContent();
                totalText += text.items.map(item => item.str).join(' ') + '\n';
            }

            return totalText.replace(/\n\s*\n/g, '\n\n'); // Clean up text
        } catch (error) {
            console.error('Error extracting PDF:', error);
            throw error;
        }
    }

    async docxExtraction(document) {
        try {
            const binaryContent = Buffer.from(document, 'base64'); // Decode base64
            const tempFilePath = temp.path({ suffix: '.docx' });
            fs.writeFileSync(tempFilePath, binaryContent); // Write to temporary file

            const data = await this.extractTextFromDocx(tempFilePath);
            fs.unlinkSync(tempFilePath); // Clean up temp file
            return data;
        } catch (error) {
            console.error('Error extracting DOCX:', error);
            throw error;
        }
    }

    async docExtraction(document) {
        try {
            // Convert DOC to DOCX using a suitable library if needed
            const tempDocPath = temp.path({ suffix: '.doc' });
            const tempDocxPath = temp.path({ suffix: '.docx' });
            this.decodeBase64ToDoc(document, tempDocPath); // Implement this method to save base64 to .doc
            await this.convertDocToDocx(tempDocPath, tempDocxPath); // Implement this method

            const data = await this.extractTextFromDocx(tempDocxPath); // Read the DOCX
            fs.unlinkSync(tempDocPath); // Clean up
            fs.unlinkSync(tempDocxPath); // Clean up
            return data;
        } catch (error) {
            console.error('Error extracting DOC:', error);
            throw error;
        }
    }

    async extractTextFromDocx(filePath) {
        const zip = new JSZip();
        const content = await fs.promises.readFile(filePath);
        await zip.loadAsync(content);
        const xmlContent = await zip.file("word/document.xml").async("string");
        const result = await parseStringPromise(xmlContent);
        const text = result['w:document']['w:body'][0]['w:p'].map(p => {
            return p['w:r'][0]['w:t'][0].toString();
        }).join(' ');

        return text.replace(/\n\s*\n/g, '\n\n'); // Clean up text
    }

    // Implement the methods below
    decodeBase64ToDoc(base64Content, docFilePath) {
        const decodedContent = Buffer.from(base64Content, 'base64');
        fs.writeFileSync(docFilePath, decodedContent);
    }

    async convertDocToDocx(docFilePath, docxFilePath) {
        try {
            // Read the .doc file and convert it to .docx
            const { value: htmlContent } = await mammoth.convertToHtml({ path: docFilePath });
            
            // Create a .docx file from the converted HTML content
            const docxDocument = new Document(); // Create a new Document instance from 'docx'
            
            // Convert HTML to document elements and add to the docxDocument
            // Note: This step might require parsing the HTML content into document paragraphs
            docxDocument.addSection({
                properties: {},
                children: [
                    new Paragraph({
                        children: [new TextRun(htmlContent)], // Simple text conversion for illustration
                    }),
                ],
            });
    
            // Save the .docx file
            const buffer = await Packer.toBuffer(docxDocument);
            fs.writeFileSync(docxFilePath, buffer);
        } catch (error) {
            console.error('Error converting DOC to DOCX:', error);
            throw error;
        }
    }
}

export default Preprocessing;
