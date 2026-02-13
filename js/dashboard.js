    /* ---------------------------------------------------------- */
    /* 🔐 Sécurité */
    /* ---------------------------------------------------------- */
    if (localStorage.getItem("isLogged") !== "true") {
    window.location.href = "index.html";
}

    function logout() {
    alert("Vous êtes déconnecté");
    localStorage.removeItem("isLogged");
    window.location.href = "index.html";
}

    /* ---------------------------------------------------------- */
    /* 🔧 Connexion Supabase */
    /* ---------------------------------------------------------- */
    const client = supabase.createClient(
    "https://dxqffvubixwsxnoaudat.supabase.co",
    "sb_publishable_Jg2Z_fDjwpY9yF5KQLbAOA_j7lsbav9"
    );

    async function chargerStock() {
    const { data, error } = await client.from("stock").select("*");
    if (error) return [];
    return data;
}

    async function chargerCategories() {
    const { data, error } = await client.from("categories").select("*");
    if (error) return [];
    return data;
}

    async function chargerTransactions() {
    const { data, error } = await client
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

    if (error) return [];
    return data;
}

    /* ---------------------------------------------------------- */
    /* 📊 Chargement des données */
    /* ---------------------------------------------------------- */
    (async () => {

    const stock = await chargerStock();
    const categories = await chargerCategories();
    const transactions = await chargerTransactions();

    document.querySelector(".dashboard-card .card-value").textContent = stock.length;
    document.getElementById("nombre-categories").textContent = categories.length;
    document.getElementById("total-transactions").textContent = transactions.length;

    const stockNormal = stock.filter(p => p.qte > 5).length;
    const stockFaible = stock.filter(p => p.qte > 0 && p.qte <= 5).length;
    const stockRupture = stock.filter(p => p.qte === 0).length;

    document.getElementById("nb-stock-normal").textContent = stockNormal;
    document.getElementById("nb-stock-faible").textContent = stockFaible;
    document.getElementById("nb-stock-rupture").textContent = stockRupture;

    /* Produits critiques */
    const produitsCritiques = stock.filter(p => p.qte <= 2);
    const produitsContainer = document.getElementById("produits-critiques");
    produitsContainer.innerHTML = "";

    produitsCritiques.forEach(p => {
    produitsContainer.innerHTML += `
                <div class="product-item">
                    <div class="product-info">
                        <h4>${p.nom}</h4>
                        <p>Quantité : ${p.qte}</p>
                    </div>
                </div>`;
});

    /* Dernières transactions */
    const derniereAjout = document.getElementById("derniere-ajout");
    derniereAjout.innerHTML = "";

    transactions.slice(0, 10).forEach(t => {
    const produit = stock.find(p => p.id === t.produit_id);

    derniereAjout.innerHTML += `
                <div class="product-item">
                    <div class="product-info">
                        <h4>${produit ? produit.nom : "Produit supprimé"}</h4>
                        <p>Quantité ajoutée : +${t.quantite}</p>
                        <p>Date : ${t.date}</p>
                    </div>
                </div>`;
});

})();

    /* ---------------------------------------------------------- */
    /* 📱 Menu mobile */
    /* ---------------------------------------------------------- */
    document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header.header");
    const nav = document.querySelector("header.header + nav");

    if (header && nav) {
    header.addEventListener("click", (e) => {
    if (e.clientX > window.innerWidth - 80) {
    nav.classList.toggle("open");
}
});

    document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !header.contains(e.target)) {
    nav.classList.remove("open");
}
});
}
});
