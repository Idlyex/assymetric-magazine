const fs = require('fs');
const path = require('path');

const sitesDir = 'd:/AA/WEB/sites';
const projects = ['editorial-grid', 'assymetric-magazine', 'cinematic-full'];
const scriptTag = '\n<!-- LIVE EDITOR SCRIPT -->\n<script src="http://localhost:4000/editor.js"></script>\n';

projects.forEach(project => {
    const indexPath = path.join(sitesDir, project, 'index.html');
    if (fs.existsSync(indexPath)) {
        let content = fs.readFileSync(indexPath, 'utf8');
        if (!content.includes('editor.js')) {
            content = content.replace('</body>', scriptTag + '</body>');
            fs.writeFileSync(indexPath, content);
            console.log(`Injected into ${project}`);
        } else {
            console.log(`${project} already has the script.`);
        }
    }
});
