
//chargerPage("list-product");

import { SplashScreen } from '@capacitor/splash-screen'
import { CapacitorBarcodeScanner } from '@capacitor/barcode-scanner';
import { initDB, CategoryEnum, addProduct, getAllProducts, checkTitleExists } from './db.js';


initDB().then(
	()=>{

		SplashScreen.hide();
		noProduct();

	});


/*
*
* Librairie d'autres fonctions ...
*
*
*/

async function newProductInfo(qr){
	chargerPage("new-product-info").then(() => {
		document.getElementById("btn-next").addEventListener("click", () => {
			titleProduct(qr);
		});
		document.getElementById("btn-back").addEventListener("click", () => {
			noProduct();
		});
	});
}

async function titleProduct(qr){
	chargerPage("new-product-title").then(() => {
		setTimeout(() => {
			document.getElementById("product-title").focus();
		}, 100);
		document.getElementById("btn-next").addEventListener("click", () => {

			const title = document.getElementById("product-title").value.trim();

			// Vérifie qu'il y a au moins une lettre
			if (!/\p{L}/u.test(title)) {
				alert("Le titre doit contenir au moins une lettre (accentuée ou non).");
				return;
			}

			// Vérifie si le titre existe en base
			checkTitleExists(title).then(
				(exists) => {
					console.log("je suis ici morray");
					if (exists) {
						alert("Ce produit existe déjà !");
						return;
					}
					categProduct(title, qr);
				});
		});
		document.getElementById("btn-back").addEventListener("click", () => {
			newProductInfo(qr);
		});
	});
}

async function categProduct(title, qr){
	chargerPage("new-product-categ").then(() => {
		$(".choix-n").click(function(element) {
			$(".checked").removeClass("checked");
			$(element.currentTarget.children[0]).toggleClass("checked");
		});

		$("#btn-next").click(function() {
			let label = $('.checkbox.checked').closest('.choix-n').find('.checkbox-label').text();
			newProductResume(title, qr, label);
		});
	});
}

async function newProductResume(title, qr, type){
	chargerPage("new-product-resume").then(() => {
		let img = type.normalize("NFD")               // décompose les caractères accentués
    	.replace(/[\u0300-\u036f]/g, '') // supprime les diacritiques (accents)
    	.toLowerCase();
    	$('.translate-y-resume').attr('src', '../imgs/'+img+'.svg');
    	$("#product").html(title);
    	$("#type").html(type);
    });
}

async function noProduct(){
	chargerPage("no-product").then(() => {
		document.getElementById("scan").addEventListener("click", () => {
			scanToAdd().then((qr) => {
				newProductInfo(qr);
			});
		});
	});
}

function chargerPage(component) {
	return fetch("../component/"+component+"/"+component+".html").then(
		(response)=> response.text())
	.then(html => {
		document.getElementById("content").innerHTML = html;
	})
	.catch(error => {
		console.log('Erreur:', error);
	});
}


async function scanToAdd() {

	if (!CapacitorBarcodeScanner) {
		alert("BarcodeScanner n'est pas disponible.");
		return;
	}

	const result = await CapacitorBarcodeScanner.scanBarcode({
		hint: 0
	});

	return result.ScanResult;


}