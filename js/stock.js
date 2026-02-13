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

    /* ---------------------------------------------------------- */
    /* 📥 Charger le stock depuis Supabase */
    /* ---------------------------------------------------------- */
    async function chargerStock() {
    const { data, error } = await client
    .from("stock")
    .select("*")
    .order("id", { ascending: true });

    if (error) {
    console.error("Erreur chargement stock :", error);
    return [];
}

    return data;
}

    /* ---------------------------------------------------------- */
    /* 📥 Charger les catégories (si tu veux une table categories) */
    /* ---------------------------------------------------------- */
    async function chargerCategories() {
    const select = document.getElementById("popup-categorie");
    select.innerHTML = "";

    // Si tu veux une table Supabase "categories", remplace ici :
    const categories = ["Électricité", "Câblage", "Outillage", "Sécurité"];

    categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
});
}

    /* ---------------------------------------------------------- */
    /* 🖥️ Afficher le tableau */
    /* ---------------------------------------------------------- */
    async function afficherStock() {
    const stock = await chargerStock();
    const table = document.getElementById("stock-table");
    const noResults = document.getElementById("no-results-stock");

    table.innerHTML = "";

    if (stock.length === 0) {
    noResults.style.display = "block";
    return;
}

    noResults.style.display = "none";

    stock.forEach(item => {
    table.innerHTML += `
            <tr>
                <td>${item.nom}</td>
                <td>${item.categorie}</td>
                <td>${item.qte}</td>
                <td>${item.date}</td>
                <td class="actions">
                    <button class="edit-btn" onclick="ouvrirPopup('modif', ${item.id})">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="delete-btn" onclick="supprimerProduit(${item.id})">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            </tr>
        `;
});
}

    /* ---------------------------------------------------------- */
    /* 🗑️ Supprimer un produit */
    /* ---------------------------------------------------------- */
    async function supprimerProduit(id) {
    const { error } = await client
    .from("stock")
    .delete()
    .eq("id", id);

    if (error) {
    console.error("Erreur suppression :", error);
    return;
}

    afficherStock();
}

    /* ---------------------------------------------------------- */
    /* 🔧 Popup ajout / modification */
    /* ---------------------------------------------------------- */
    let mode = "ajout";
    let produitEnEdition = null;

    async function ouvrirPopup(type, id = null) {
    mode = type;
    await chargerCategories();

    document.getElementById("popup-title").textContent =
    type === "ajout" ? "Ajouter un produit" : "Modifier un produit";

    if (type === "modif") {
    const stock = await chargerStock();
    produitEnEdition = stock.find(p => p.id === id);

    document.getElementById("popup-nom").value = produitEnEdition.nom;
    document.getElementById("popup-categorie").value = produitEnEdition.categorie;
    document.getElementById("popup-qte").value = produitEnEdition.qte;
} else {
    produitEnEdition = null;
    document.getElementById("popup-form").reset();
}

    document.getElementById("popup").style.display = "flex";
}

    function fermerPopup() {
    document.getElementById("popup").style.display = "none";
}

    /* ---------------------------------------------------------- */
    /* 💾 Soumission formulaire */
    /* ---------------------------------------------------------- */
    document.getElementById("popup-form").addEventListener("submit", async function(e) {
    e.preventDefault();

    const nom = document.getElementById("popup-nom").value;
    const categorie = document.getElementById("popup-categorie").value;
    const qte = parseInt(document.getElementById("popup-qte").value);
    const date = new Date().toISOString().split("T")[0];

    if (mode === "ajout") {
    await client.from("stock").insert([
{ nom, categorie, qte, date }
    ]);
} else {
    await client.from("stock").update({
    nom,
    categorie,
    qte
}).eq("id", produitEnEdition.id);
}

    fermerPopup();
    afficherStock();
});

    /* ---------------------------------------------------------- */
    /* 🔍 Recherche dynamique */
    /* ---------------------------------------------------------- */
    function normalize(str) {
    return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

    document.getElementById("search").addEventListener("input", async function () {
    const filter = normalize(this.value);
    const rows = document.querySelectorAll("#stock-table tr");
    let visibleCount = 0;

    rows.forEach(row => {
    const nom = normalize(row.children[0].textContent);
    const categorie = normalize(row.children[1].textContent);
    const quantite = normalize(row.children[2].textContent);
    const date = normalize(row.children[3].textContent);

    const match =
    nom.includes(filter) ||
    categorie.includes(filter) ||
    quantite.includes(filter) ||
    date.includes(filter);

    row.style.display = match ? "" : "none";
    if (match) visibleCount++;
});

    document.getElementById("no-results-stock").style.display =
    visibleCount === 0 ? "block" : "none";
});

    /* ---------------------------------------------------------- */
    /* 🚀 Charger au démarrage */
    /* ---------------------------------------------------------- */
    afficherStock();
