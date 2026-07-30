const fs = require('fs');
let js = fs.readFileSync('shared/components.js', 'utf8');

// Replace footer background logic
js = js.replace(
    /let footerStyle = '';[\s\S]*?if \(config\.footerBgType === 'solid'[\s\S]*?\}/,
    `let footerStyle = '';
        const bgColor = config.footerBgColor || '#0f172a';
        const startColor = config.footerGradientStart || '#1a4d8f';
        const endColor = config.footerGradientEnd || '#3d8fd4';
        footerStyle = \`style="background-color: \$\{bgColor\}; background-image: linear-gradient(135deg, \$\{startColor\} 0%, \$\{endColor\} 100%);"\`;`
);

fs.writeFileSync('shared/components.js', js);
console.log('Patched components.js');
