import { SplashScreen } from '@capacitor/splash-screen'
import { CapacitorBarcodeScanner } from '@capacitor/barcode-scanner';
import { exportDatabaseToJson, initDB, CategoryEnum, addProduct, getAllProducts, checkTitleExists, getIdCategByType, productExistsByQRCode, addQuantityByQrCode, removeQuantityByQrCode } from './db.js';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

initDB().then(
	()=>{
		SplashScreen.hide();
		getAllProducts().then((products) => {
			(products.length === 0)?noProduct():listProduct();
		});
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
			getAllProducts().then((products) => {
				(products.length === 0)?noProduct():listProduct();
			});
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

		document.getElementById("btn-back").addEventListener("click", () => {
			titleProduct(qr);
		});
	});
}

async function newProductResume(title, qr, type){
	chargerPage("new-product-resume").then(() => {
		let img = computeCategory(type);
		$('.translate-y-resume').attr('src', '../imgs/'+img+'.svg');
		$("#product").html(title);
		$("#type").html(type);

		$("#btn-next").click(function() {
			addProduct(title, qr, 1, getIdCategByType(type)).then(() => {
				listProduct();
			});
		});

		document.getElementById("btn-back").addEventListener("click", () => {
			categProduct(title,qr);
		});
	});
}

async function listProduct(){
	chargerPage("list-product").then(() => {
		getAllProducts().then((products) => {
			if(products.length === 0){
				noProduct();
				return;
			}

			let productsHtml = "";
			let greyRaw = false;

			for (const product of products) {
				productsHtml += beautifyProduct(product, greyRaw);
				greyRaw = !greyRaw;
			}
			$("#products").html(productsHtml);
		});
		document.getElementById("export").addEventListener("click", () => {
			exportDatabaseToJson().then((res) => downloadJson(res));
		});
		document.getElementById("scanAdd").addEventListener("click", () => {
			scanToAdd().then((qr) => {
				productExistsByQRCode(qr).then((res) => res?addQuantityByQrCode(qr).then(() => listProduct()):newProductInfo(qr));
			});
		});
		document.getElementById("scanDelete").addEventListener("click", () => {
			scanToAdd().then((qr) => {
				productExistsByQRCode(qr).then((res) => res?removeQuantityByQrCode(qr).then(() => listProduct()):newProductInfo(qr));
			});
		});
	});
}

function computeCategory(category){
	return category.normalize("NFD")               // décompose les caractères accentués
    	.replace(/[\u0300-\u036f]/g, '') // supprime les diacritiques (accents)
    	.toLowerCase();
    }

    function beautifyProduct(product, greyRaw){
    	let greyRawHtml = "tab-row-grey";
    	return "<div class=\"tab-row "+(greyRaw?greyRawHtml:"")+"\">" +
    	"<div><img width=\"31px\" src=\"../imgs/"+computeCategory(product.category)+".svg\" />"+product.name+"</div>" +
    	"<div class=\"x-bold\">"+product.quantity+"</div>" +
    	"</div>";
    }

    async function noProduct(){
    	chargerPage("no-product").then(() => {
    		document.getElementById("scan").addEventListener("click", () => {
    			scanToAdd().then((qr) => {
    				productExistsByQRCode(qr).then((res) => res?addQuantityByQrCode(qr).then(() => listProduct()):newProductInfo(qr));
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

    async function downloadJson(json, filename = 'export.json') {
    	await Filesystem.writeFile({
    		path: 'export.json',
    		data: json,
    		directory: Directory.Documents,
    		encoding: Encoding.UTF8,
    	});

    	const { uri } = await Filesystem.getUri({
    		path: 'export.json',
    		directory: Directory.Documents,
    	});

    	await Share.share({
    		title: 'Fichier exporté',
    		text: 'Voici ton export JSON',
    		url: uri,
    	});
    }