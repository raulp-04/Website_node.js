const express = require('express');
var sqlite3 = require('sqlite3');
const cookieParser=require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const session=require('express-session');
const fs = require('fs');
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
// utilizarea cookie-urilor pe website
app.use(cookieParser());
app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge: 30 * 60 * 1000
    }
}));

// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'Hello World'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res

const produse = [ // Doar pentru testarea insertului
    ['Ciocan cu mâner din fibră', 45.99, 20],
    ['Șurubelniță set 6 piese', 35.50, 15],
    ['Bormașină electrică 650W', 249.99, 8],
    ['Dibluri universale 8x40 mm (100 buc)', 19.90, 30],
    ['Fierăstrău manual pentru lemn', 59.00, 10],
    ['Burghie beton set 5 piese', 24.75, 25],
    ['Pistol de lipit cu silicon', 39.99, 12],
    ['Bandă izolatoare (set 5 buc)', 12.99, 50],
    ['Adeziv de construcții 300 ml', 18.50, 40],
    ['Nivelă cu bulă 40cm', 29.00, 18],
  ];

app.use((req, res, next) => {
    res.locals.username = req.session.user || '';
    next();
});

app.get('/', (req, res) => {
    let db = new sqlite3.Database("./cumparaturi.db" , (err) => {
        if(err) {
            console.log("Error Occurred - " + err.message);
        }
        else {
            console.log(`DataBase 'cumparaturi' Connected`);
        }
    });

    db.all("SELECT * FROM produse", [], (err, rows) => {
        if (err) {
            console.error("Eroare la interogare:", err.message);
            res.render('index', {
                username: req.session.user || '',
                produse: rows,
                isOk: false
            });
        } else {
            res.render('index', {
                username: req.session.user || '',
                produse: rows,
                isOk: true
            });
        }
        db.close();
    });
});

app.post('/adaugare_cos', (req, res) =>{
    let id = parseInt(req.body.id);
    if(!req.session.cos.includes(id)){
        req.session.cos.push(id);
    }
    console.log(`Cosul: ${req.session.cos}`);
    res.redirect('/');
});

app.get('/autentificare', (req, res) => {
    if(typeof req.cookies.error == 'undefined') {res.render('autentificare', {error: ''});} // daca nu exista cookie-ul atunci se acceseaza normal
     else {
        res.render('autentificare', {error: req.cookies.error});
        res.clearCookie('error');
    }
});

app.get('/creare_bd', (req, res) => {
    // Conectare la baza de date | daca nu exista o creeaza
    let db = new sqlite3.Database("./cumparaturi.db" , (err) => {
        if(err) {
            console.log("Error Occurred - " + err.message);
        }
        else {
            console.log(`DataBase 'cumparaturi' Connected`);
        }
    });
    // Creare tabel 'produse' in caz de nu exista
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS produse (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nume TEXT NOT NULL,
          pret REAL NOT NULL,
          stoc INTEGER DEFAULT 0
        )`, (err) => {
          if (err) {
            console.error('Eroare la crearea tabelului:', err.message);
          } else {
            console.log('Tabela "produse" a fost creată (sau deja exista).');
          }
        });
      });
      db.close();
    res.redirect('/');
});

app.get('/inserare_bd', (req, res) => {
    // Conectare la baza de date | daca nu exista o creeaza
    let db = new sqlite3.Database("./cumparaturi.db" , (err) => {
        if(err) {
            console.log("Error Occurred - " + err.message);
        }
        else {
            console.log(`DataBase 'cumparaturi' Connected`);
        }
    });

    produse.forEach(([nume, pret, stoc]) => {
        db.run(
          `INSERT INTO produse (nume, pret, stoc) VALUES (?, ?, ?)`,
          [nume, pret, stoc],
          function(err) {
            if (err) {
              console.error('Eroare la inserare:', err.message);
            }
          }
        );
      });

    db.close();
    res.redirect('/');
});

app.get('/vizualizare-cos', (req, res) => {
    let db = new sqlite3.Database("./cumparaturi.db" , (err) => {
        if(err) {
            console.log("Error Occurred - " + err.message);
        }
        else {
            console.log(`DataBase 'cumparaturi' Connected`);
        }
    });

    db.all("SELECT * FROM produse", [], (err, rows) => {
        if (err) {
            console.error("Eroare la interogare:", err.message);
            res.render('vizualizare-cos', {
                produse: rows,
                isOk: false,
                cos: req.session.cos
            });
        } else {
            var cos_nou = [];
            rows.forEach(prod => {
                if(req.session.cos.includes(prod.id)){
                    cos_nou.push(prod);
                }
            });
            res.render('vizualizare-cos', {
                isOk: true,
                cos: cos_nou
            });
        }
        db.close();
    });
});

app.post('/verificare-autentificare', (req, res) => {
    fs.readFile('utilizatori.json', (err,data) =>{
        const utilizatori = JSON.parse(data);
        let {user, pass} = req.body;
        const utilizatorGasit = utilizatori.find(u => u.username === user && u.password === pass);
        if(utilizatorGasit){
            req.session.user = utilizatorGasit.username;
            if(!req.session.cos){
                req.session.cos = [];
            }
            res.redirect('/');
        } else {
            res.cookie("error","Autentificare nereusita!");
            res.redirect('autentificare');
        }
    })
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/chestionar', (req, res) => {   
    fs.readFile('intrebari.json', (err, data) => {
        if (err) throw err;
        const listaIntrebari = JSON.parse(data);
        res.render('chestionar', {intrebari: listaIntrebari});
    });
});

app.post('/rezultat-chestionar', (req, res) => {
    fs.readFile('intrebari.json', (err, data) => {
        if (err) throw err;
        const listaIntrebari = JSON.parse(data);
        const raspCorecte = listaIntrebari.map(item => item.corect);
        const raspuns = req.body;
        res.render('rezultat-chestionar', { layout: 'layout', titlu: 'Rezultate', raspunsuri: raspuns , corect: raspCorecte});
    });
});

app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:${port}/`));