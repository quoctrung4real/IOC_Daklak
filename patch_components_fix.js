const fs = require('fs');
let js = fs.readFileSync('shared/components.js', 'utf8');

js = js.replace(
    /let footerStyle = '';[\s\S]*?\} else if \(config\.footerBgType === 'gradient'\) \{[\s\S]*?\}/,
    `let footerStyle = '';
        const bgColor = config.footerBgColor || '#0f172a';
        const startColor = config.footerGradientStart || '#1a4d8f';
        const endColor = config.footerGradientEnd || '#3d8fd4';
        footerStyle = \`style="background-color: \$\{bgColor\}; background-image: linear-gradient(135deg, \$\{startColor\} 0%, \$\{endColor\} 100%);"\`;`
);

fs.writeFileSync('shared/components.js', js);
console.log('Fixed components.js');
