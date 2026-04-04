const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const contentDir = 'c:/Users/ye mariyam/Music/Desu/fYear/fyr/study content';
const files = ['chap1Part1.docx', 'chap1Part2.docx', 'chap1Part3.docx', 'chap1Part4.docx'];

async function readDocs() {
    let fullText = '';
    for (const file of files) {
        const filePath = path.join(contentDir, file);
        try {
            console.log(`Extracting: ${file}...`);
            const result = await mammoth.extractRawText({path: filePath});
            fullText += result.value + '\n\n';
        } catch (e) {
            console.error(`Error processing ${file}: ${e}`);
        }
    }
    
    fs.writeFileSync(path.join(contentDir, 'combined_chap1.txt'), fullText, 'utf8');
    console.log('Finished combining text to combined_chap1.txt');
}

readDocs();
