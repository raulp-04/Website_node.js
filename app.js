const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const app = express();
const port = 6789;
// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('view engine', 'ejs');
// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-ului este views/layout.ejs
app.use(expressLayouts);
// directorul 'public' va conține toate resursele accesibile direct de către client (e.g., fișiere css, javascript, imagini)
app.use(express.static('public'))
// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc în format json în req.body
app.use(bodyParser.json());
// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));

// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'Hello World'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res
app.get('/', (req, res) => res.send('Hello World'));

// la accesarea din browser adresei http://localhost:6789/chestionar se va apela funcția specificată
app.get('/chestionar', (req, res) => {
    const listaIntrebari = [
        {
            intrebare: 'Ce instrument este folosit pentru tăierea lemnului?',
            variante: ['Ciocan', 'Ferăstrău', 'Șurubelniță', 'Pensulă'],
            corect: 1
        },
        {
            intrebare: 'Care este scopul unei mașini de găurit?',
            variante: ['Găurirea pereților', 'Lipirea pieselor', 'Tăierea metalului', 'Șlefuirea suprafețelor'],
            corect: 0
        },
        {
            intrebare: 'Cum se numește procesul de unire a două piese de lemn folosind un șurub?',
            variante: ['Lipire', 'Îmbinare', 'Șurubare', 'Vopsire'],
            corect: 2
        },
        {
            intrebare: 'Ce tip de vopsea este recomandată pentru vopsirea suprafețelor din metal?',
            variante: ['Vopsea acrilică', 'Vopsea pe bază de apă', 'Vopsea specială pentru metal', 'Vopsea de apă'],
            corect: 2
        },
        {
            intrebare: 'Ce unelte sunt necesare pentru instalarea unui raft pe perete?',
            variante: ['Ciocan și șurubelniță', 'Ferăstrău și pistol de lipit', 'Mașină de găurit și nivel de apă', 'Vopsitor și pensulă'],
            corect: 2
        },
        {
            intrebare: 'Care este utilizarea principală a unui slefuitor orbital?',
            variante: ['Șlefuirea lemnului', 'Tăierea metalului', 'Găurirea betonului', 'Montarea plăcilor ceramice'],
            corect: 0
        },
        {
            intrebare: 'Ce tip de adeziv este cel mai potrivit pentru fixarea plăcilor ceramice pe perete?',
            variante: ['Adeziv pentru lemn', 'Adeziv pentru metal', 'Adeziv pentru ceramică', 'Adeziv universali'],
            corect: 2
        }  
        //..
    ];
    // în fișierul views/chestionar.ejs este accesibilă variabila 'intrebari' care conține vectorul de întrebări
    res.render('chestionar', {intrebari: listaIntrebari});
});
app.post('/rezultat-chestionar', (req, res) => {
    console.log(req.body);
    res.send("formular: " + JSON.stringify(req.body));
});
app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:${port}/`));