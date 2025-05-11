const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, 'data.json');

// Chargement ou création du fichier data.json
let data = { signedIPs: [], totalSignatures: 0 };
if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE);
    data = JSON.parse(raw);
}

// Fonction pour sauvegarder les données
function saveData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const hasSigned = data.signedIPs.includes(userIP);
    res.render('index', { hasSigned, totalSignatures: data.totalSignatures });
    console.log('IP détectée :', req.headers['x-forwarded-for'], req.connection.remoteAddress);

});

app.post('/sign', (req, res) => {
    const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!data.signedIPs.includes(userIP)) {
        data.signedIPs.push(userIP);
        data.totalSignatures++;
        saveData();
    }

    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
