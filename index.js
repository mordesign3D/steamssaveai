const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const app = express();

// Autoriser tout le monde (pour le test) ou restreindre à votre domaine Vercel plus tard
app.use(cors());

app.get('/download', async (req, res) => {
    try {
        const videoUrl = req.query.url;
        
        // Vérification basique
        if (!videoUrl || !ytdl.validateURL(videoUrl)) {
            return res.status(400).send('URL invalide');
        }

        // Récupérer les infos pour le nom du fichier
        const info = await ytdl.getBasicInfo(videoUrl);
        const title = info.videoDetails.title.replace(/[^a-z0-9]/gi, '_');

        // Dire au navigateur que c'est un fichier à télécharger
        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        
        // Lancer le téléchargement
        // On pipe (tuyauterie) directement le flux YouTube vers la réponse utilisateur
        ytdl(videoUrl, {
            quality: 'highest',
            filter: 'audioandvideo'
        }).pipe(res);

    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur serveur');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur tourne sur le port ${PORT}`);
});git push -u -f origin main