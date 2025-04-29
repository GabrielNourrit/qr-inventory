//chargerPage("new-product-title");
//chargerPage("new-product-info");
//chargerPage("new-product-categ");
//chargerPage("new-product-resume");
//chargerPage("list-product");

import { SplashScreen } from '@capacitor/splash-screen'
import { CapacitorBarcodeScanner } from '@capacitor/barcode-scanner';
import { initDB, CategoryEnum, addProduct, getAllProducts } from './db.js';


initDB().then(
	()=>{

		SplashScreen.hide();
		noProduct();

	});

/*
nitDB().then(
	()=>{

		SplashScreen.hide();

		chargerPage("no-product")
		.then(
			() => {

				document.getElementById("scan").addEventListener("click", () => {
					scanToAdd().then(
						() => {
							chargerPage("new-product-info").then(
								() => {
									//here

								});

						});
					
				});

			}
			);

	}
	)
*/


/*
*
* Librairie d'autres fonctions ...
*
*
*/

async function newProductInfo(){
	chargerPage("new-product-info").then(() => {
		document.getElementById("btn-next").addEventListener("click", () => {
			alert("next");
		});
		document.getElementById("btn-back").addEventListener("click", () => {
			noProduct();
		});
	});
}

async function noProduct(){
	chargerPage("no-product").then(() => {
		document.getElementById("scan").addEventListener("click", () => {
			scanToAdd().then(() => {
				newProductInfo();
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

	console.log(result.ScanResult);


}