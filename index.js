const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.send('✅ Serveur StreamSave en ligne !');
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
        console.error(error);
        res.status(500).send(error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
