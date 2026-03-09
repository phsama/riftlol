const stringSimilarity = require('string-similarity');

const ocrText = "CHAMPION UNIT FIORA DEMACIA Fiora VICTORIOUS While I'm MIGHTY I have DEFLECT and SHIELD I long for a worthy opponent";
const allOcrWords = ocrText.toLowerCase().replace(/['`’]/g, "'").replace(/[^a-z0-9'\s]/g, "").split(/\s+/).filter(w => w.length > 0);

console.log("OCR Words:", allOcrWords);

const cards = ["fiora", "wallop", "demacia", "ganking"];

for (const cardName of cards) {
    const cardNameClean = cardName.toLowerCase().replace(/['`’]/g, "'").replace(/[^a-z0-9'\s]/g, "");
    const cardWords = cardNameClean.split(/\s+/).filter(w => w.length > 0);
    let highestScore = 0;

    if (allOcrWords.length >= cardWords.length) {
        for (let i = 0; i <= allOcrWords.length - cardWords.length; i++) {
            const windowText = allOcrWords.slice(i, i + cardWords.length).join(' ');
            const score = stringSimilarity.compareTwoStrings(cardNameClean, windowText);
            if (score > highestScore) {
                highestScore = score;
            }
        }
    }
    console.log(`Card: ${cardNameClean}, Max Score: ${highestScore}`);
}
