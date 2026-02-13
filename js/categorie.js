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
    /* 📥 Charger les catégories */
    /* ---------------------------------------------------------- */
    async function chargerCategories() {
    const { data, error } = await client
    .from("categories")
    .select("*")
    .order("id", { ascending: true });

    if (error) {
    console.error("Erreur chargement catégories :", error);
    return [];
}

    return data;
}

    /* ---------------------------------------------------------- */
    /* 📥 Vérifier si une catégorie est utilisée dans stock */
    /* ---------------------------------------------------------- */
    async function categorieUtilisee(id) {
    // 1) Récupérer le nom de la catégorie
    const { data: cat, error: errCat } = await client
    .from("categories")
    .select("nom")
    .eq("id", id)
    .single();

    if (errCat || !cat) {
    console.error("Erreur récupération catégorie :", errCat);
    return false;
}

    // 2) Vérifier si ce nom apparaît dans stock.categorie
    const { data, error } = await client
    .from("stock")
    .select("id")
    .eq("categorie", cat.nom)
    .limit(1);

    if (error) {
    console.error("Erreur vérification utilisation :", error);
    return false;
}

    return data.length > 0;
}

    /* ---------------------------------------------------------- */
    /* 🖥️ Afficher les catégories */
    /* ---------------------------------------------------------- */
    async function afficherCategories() {
    const list = document.getElementById("liste-categories");

    const categories = await chargerCategories();
    list.innerHTML = "";

    categories.forEach(cat => {
    list.innerHTML += `
                <li class="categorie-item" onclick="ouvrirPopupCategorie('modif', ${cat.id})">
                    <strong>${cat.nom}</strong>
                    <p class="cat-desc">${cat.description}</p>
                </li>
            `;
});
}

    /* ---------------------------------------------------------- */
    /* 🔧 Popup */
    /* ---------------------------------------------------------- */
    let categorieActuelle = null;

    function fermerPopupCategorie() {
    document.getElementById("popup-categorie").style.display = "none";
}

    document.getElementById("btn-ajouter").addEventListener("click", () => {
    ouvrirPopupCategorie("ajout");
});

    /* ---------------------------------------------------------- */
    /* 📝 Ouvrir popup (ajout / modif) */
    /* ---------------------------------------------------------- */
    async function ouvrirPopupCategorie(mode, id = null) {
    document.getElementById("popup-categorie").style.display = "flex";

    const btnAjout = document.getElementById("btn-ajout");
    const btnModifZone = document.getElementById("btn-modif-zone");

    if (mode === "ajout") {
    categorieActuelle = null;

    document.getElementById("popup-categorie-title").textContent = "Ajouter une catégorie";
    document.getElementById("categorie-nom").value = "";
    document.getElementById("categorie-description").value = "";

    btnAjout.style.display = "block";
    btnModifZone.style.display = "none";
}

    if (mode === "modif") {
    const { data: cat } = await client
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

    categorieActuelle = cat;

    document.getElementById("popup-categorie-title").textContent = "Modifier la catégorie";
    document.getElementById("categorie-nom").value = cat.nom;
    document.getElementById("categorie-description").value = cat.description;

    btnAjout.style.display = "none";
    btnModifZone.style.display = "flex";

    document.getElementById("delete-categorie-btn").onclick = () => supprimerCategorie(id);
}
}

    /* ---------------------------------------------------------- */
    /* 💾 Soumission formulaire */
    /* ---------------------------------------------------------- */
    document.getElementById("popup-categorie-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nom = document.getElementById("categorie-nom").value.trim();
    const description = document.getElementById("categorie-description").value.trim();

    if (!categorieActuelle) {
    // AJOUT
    await client.from("categories").insert([{ nom, description }]);
} else {
    // MODIFICATION
    await client
    .from("categories")
    .update({ nom, description })
    .eq("id", categorieActuelle.id);
}

    afficherCategories();
    fermerPopupCategorie();
});

    /* ---------------------------------------------------------- */
    /* 🗑️ Supprimer une catégorie */
    /* ---------------------------------------------------------- */
    async function supprimerCategorie(id) {
    const utilise = await categorieUtilisee(id);

    if (utilise) {
    alert("Impossible de supprimer : des produits utilisent cette catégorie.");
    return;
}

    await client.from("categories").delete().eq("id", id);

    afficherCategories();
    fermerPopupCategorie();
}

    /* ---------------------------------------------------------- */
    /* 🚀 Charger au démarrage */
    /* ---------------------------------------------------------- */
    afficherCategories();