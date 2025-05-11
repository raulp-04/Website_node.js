const express = require('express');
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

app.use((req, res, next) => {
    res.locals.username = req.session.user || '';
    next();
});

app.get('/', (req, res) => {
    if(typeof req.session.user == 'undefined') {res.render('index', {username: ''});} // daca nu exista cookie-ul atunci se acceseaza normal
     else {res.render('index', {username: req.session.user});}
});

app.get('/autentificare', (req, res) => {
    if(typeof req.session.error == 'undefined') {res.render('autentificare', {error: ''});} // daca nu exista cookie-ul atunci se acceseaza normal
     else {
        res.render('autentificare', {error: req.session.error});
        res.clearCookie('error');
    }
});

app.post('/verificare-autentificare', (req, res) => {
    fs.readFile('utilizatori.json', (err,data) =>{
        const utilizatori = JSON.parse(data);
        let {user, pass} = req.body;
        const utilizatorGasit = utilizatori.find(u => u.username === user && u.password === pass);
        if(utilizatorGasit){
            req.session.user = utilizatorGasit.username;
            res.redirect('/');
        } else {
            req.session.error = "Autentificare nereusita!";
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