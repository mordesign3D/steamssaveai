const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.send('Serveur OK');
});

app.get('/download', async (req, res) => {
    try {
        const ytdl = require('@distube/ytdl-core');
        const url = req.query.url;
        
        // Verification sans point d'exclamation pour eviter erreur ZSH
        if (url == null || url == '') {
            return res.status(400).send('URL manquante');
        }
        
        const isValid = ytdl.validateURL(url);
        if (isValid == false) {
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
        res.status(500).send('Erreur serveur');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
