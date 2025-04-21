
//chargerPage("new-product-title");
//chargerPage("new-product-info");
//chargerPage("new-product-categ");
//chargerPage("new-product-resume");
chargerPage("list-product");
//chargerPage("no-product");


async function chargerPage(component) {
    const response = await fetch("../component/"+component+"/"+component+".html");
    if (!response.ok) throw new Error("Erreur de chargement : " + response.status);
    document.getElementById("content").innerHTML = await response.text();
}

