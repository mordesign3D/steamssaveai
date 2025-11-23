const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

// Route de base
app.get('/', (req, res) => res.send('Serveur Actif'));

// Route pour l'analyse (Celle qui manque !)
app.get('/info', async (req, res) => {
    try {
        const ytdl = require('@distube/ytdl-core');
        const url = req.query.url;
        if (!url || !ytdl.validateURL(url)) return res.status(400).json({error: 'URL invalide'});
        
        const info = await ytdl.getBasicInfo(url);
        res.json({
            title: info.videoDetails.title,
            description: info.videoDetails.description ? info.videoDetails.description.substring(0, 150) + '...' : '',
            author: info.videoDetails.author.name,
            thumbnailUrl: info.videoDetails.thumbnails[0].url,
            tags: info.videoDetails.keywords || []
        });
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

// Route de téléchargement
app.get('/download', async (req, res) => {
    try {
        const ytdl = require('@distube/ytdl-core');
        const url = req.query.url;
        if (!url) return res.status(400).send('URL manquante');
        
        const info = await ytdl.getBasicInfo(url);
        const title = info.videoDetails.title.replace(/[^a-z0-9]/gi, '_');
        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        ytdl(url, { quality: 'highest', filter: 'audioandvideo' }).pipe(res);
    } catch (e) {
        res.status(500).send('Erreur: ' + e.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on ${PORT}`));
