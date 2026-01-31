
const fs = require('fs');
const path = require('path');

const figuresPath = path.join(__dirname, '../src/data/figures.json');
const figures = JSON.parse(fs.readFileSync(figuresPath, 'utf8'));

const livingEras = ['現代', '21世紀'];
const livingIds = ['hiroshi_mikitani', 'haruki_murakami', 'hayao_miyazaki', 'tori_amos', 'bob_dylan', 'elon_musk', 'jeff_bezos', 'mark_zuckerberg', 'jacinda_ardern'];

const filteredFigures = figures.filter(f => {
    // Check Era
    if (livingEras.includes(f.era)) {
        console.log(`Removing (Era: ${f.era}): ${f.name_ja} (${f.id})`);
        return false;
    }
    // Check ID just in case
    if (livingIds.includes(f.id)) {
        console.log(`Removing (ID match): ${f.name_ja} (${f.id})`);
        return false;
    }
    return true;
});

console.log(`Original count: ${figures.length}`);
console.log(`Filtered count: ${filteredFigures.length}`);

fs.writeFileSync(figuresPath, JSON.stringify(filteredFigures, null, 2));
