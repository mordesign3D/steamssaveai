const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.send('✅ Serveur StreamSave en ligne !');
});

// NOUVELLE ROUTE : Pour récupérer le titre et l'image
app.get('/info', async (req, res) => {
    try {
        const ytdl = require('@distube/ytdl-core');
        const url = req.query.url;

        if (!url || !ytdl.validateURL(url)) {
             return res.status(400).json({ error: 'URL invalide' });
        }

        const info = await ytdl.getBasicInfo(url);
        
        // On renvoie les infos au site
        res.json({
            title: info.videoDetails.title,
            description: info.videoDetails.description ? info.videoDetails.description.substring(0, 200) + '...' : '',
            author: info.videoDetails.author.name,
            thumbnailUrl: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
            tags: info.videoDetails.keywords || []
        });

    } catch (error) {
        console.error("Erreur Info:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/download', async (req, res) => {
    try {
        const ytdl = require('@distube/ytdl-core');
        const url = req.query.url;
        
        if (!url) return res.status(400).send('URL manquante');
        
        if (!ytdl.validateURL(url)) {
             return res.status(400).send('URL invalide');
        }

        const info = await ytdl.getBasicInfo(url);
        const title = info.videoDetails.title.replace(/[^a-z0-9]/gi, '_');

        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        
        ytdl(url, { 
            quality: 'highest', 
            filter: 'audioandvideo' 
        }).pipe(res);

    } catch (error) {
        console.error("Erreur Download:", error.message);
        res.status(500).send(error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
