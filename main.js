'use strict';
/////////////////////////////////////////////////Require
const express = require('express')
const app = express()
const fs = require('fs')
const MongoClient = require('mongodb').MongoClient
const bodyParser= require('body-parser')
const ObjectID = require('mongodb').ObjectID
app.use(bodyParser.urlencoded({extended: true}))
const peupler = require("./mes_modules/peupler");
const util = require("util");

/* on associe le moteur de vue au module «ejs» */
app.set('view engine', 'ejs') // générateur de template

app.use(express.static('public'))

//Connexion à mongoDB et au serveur Node.Js
let db // variable qui contiendra le lien sur la BD
MongoClient.connect('mongodb://127.0.0.1:27017/carnet_adresses', (err, database) => {
 if (err) return console.log(err)
 db = database.db('carnet_adresses')

// lancement du serveur Express sur le port 8081
 app.listen(8081, () => {
 console.log('connexion à la BD et on écoute sur le port 8081')
 })
})

///////////////////////////////////////////////////////////////////////////Routes

////////////////////////////////////////////////////accueil
app.get('/', (req, res) => {
	let cursor = db.collection('adresses').find().toArray((err, resultat) => {
 		if (err) return console.log(err)
  	res.render('gabarit.ejs', {adresses: resultat, direction: "asc"})
  })
})

/////////////////////////////////////////////////////ajouter
app.post('/ajouter', (req, res) => {
	db.collection('adresses').save(req.body, (err, result) => {
		if (err) return console.log(err)
		console.log('sauvegarder dans la BD')
		res.redirect('/')
	})
})

/////////////////////////////////////////////////////detruire
app.get('/detruire/:id', (req, res) => {
	console.log("detruire")
	let critere = ObjectID(req.params.id)
	console.log(critere)
	db.collection('adresses').findOneAndDelete({"_id": critere}, (err, resultat) => {
		if (err) return console.log(err)
		res.redirect('/')
	})
})

/////////////////////////////////////////////////////modifier
app.post('/modifier', (req, res) => {

	req.body._id = ObjectID(req.body._id)

	db.collection('adresses').save(req.body, (err, result) => {
		if (err) return console.log(err)
		console.log('sauvegarder dans la BD')
		res.redirect('/')
	})
})

///////////////////////////////////////////////////Trier
app.get('/trier/:cle/:ordre', (req, res) => {
	let cle = req.params.cle
	let ordre = (req.params.ordre == 'asc' ? 1 : -1)
	let cursor = db.collection('adresses').find().sort(cle,ordre).toArray(function(err, resultat){
		ordre *= -1;
		let direction = (ordre == 1 ? "asc" : "desc")
		res.render('gabarit.ejs', {
			adresses: resultat, cle, direction
		})
	})
})

//////////////////////////////////////////////////Peupler
app.get('/peupler', (req, res) => {
	let peuple = [];

	for(let p=0; p<10; p++){
		let contact = peupler();
		peuple.push(contact);
	}

	console.log(peuple);

	db.collection('adresses').insert(peuple, (err, result) => {
		if (err) return console.log(err)
		console.log('sauvegarder dans la BD')
		res.redirect('/')
	})
})

//////////////////////////////////////////////////Vider la liste des membres
app.get('/vider', (req, res) => {

	db.collection('adresses').drop((err, result) => {
		if (err) return console.log(err)
		console.log('Liste de membres vidée')
		res.redirect('/')
	})
})