const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer to upload to a temp directory
const tempDir = path.join(__dirname, 'temp');
fs.ensureDirSync(tempDir);
const upload = multer({ dest: tempDir });

// Smart path resolver: resolves to parent directory if index.html is present (nested mode), 
// otherwise falls back to sibling project directory (legacy mode).
const getProjectDir = (project) => {
    if (fs.existsSync(path.join(__dirname, '..', 'index.html'))) {
        return path.join(__dirname, '..');
    }
    return path.join(__dirname, '..', project || '');
};

// API to save HTML changes
app.post('/api/save-html', async (req, res) => {
    const { project, filePath, content } = req.body;
    try {
        const absolutePath = path.join(getProjectDir(project), filePath);
        await fs.writeFile(absolutePath, content, 'utf8');
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// API to save CSS changes
app.post('/api/save-css', async (req, res) => {
    const { project, filePath, content } = req.body;
    try {
        const absolutePath = path.join(getProjectDir(project), filePath);
        await fs.writeFile(absolutePath, content, 'utf8');
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// API to upload images
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const { project, folder } = req.body;
        const projName = project || 'cinematic-full';
        const folderName = folder || 'img';
        
        const projDir = getProjectDir(projName);
        const destDir = path.join(projDir, folderName);
        await fs.ensureDir(destDir);
        
        const filename = Date.now() + '-' + req.file.originalname;
        const finalPath = path.join(destDir, filename);
        
        await fs.move(req.file.path, finalPath);
        
        const relativePath = path.relative(projDir, finalPath).replace(/\\/g, '/');
        res.json({ success: true, url: relativePath });
    } catch (error) {
        console.error('Upload error:', error);
        if (req.file && req.file.path) {
            await fs.remove(req.file.path).catch(() => {});
        }
        res.status(500).json({ error: error.message });
    }
});

// Serve the editor script
app.get('/editor.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'editor.js'));
});

// Custom error handler to guarantee valid JSON responses
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Editor server running at http://localhost:${PORT}`);
});
