const fs = require('fs');
let js = fs.readFileSync('quan-tri-v3.js', 'utf8');
console.log(js.match(/window\.saveAllToServer = async function\(\) \{[\s\S]*?body: JSON\.stringify\(config\)/)[0]);
