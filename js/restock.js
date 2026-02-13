/* ---------------------------------------------------------- */
    /* 🔐 Sécurité */
    /* ---------------------------------------------------------- */
    if (localStorage.getItem("isLogged") !== "true") {
        window.location.href = "index.html";
    }

    /* ---------------------------------------------------------- */
    /* 🔓 Logout GLOBAL */
    /* ---------------------------------------------------------- */
    window.logout = function () {
        alert("Vous êtes déconnecté");
        localStorage.removeItem("isLogged");
        window.location.href = "index.html";
    };

    /* ---------------------------------------------------------- */
    /* 🔧 Connexion Supabase */
    /* ---------------------------------------------------------- */
    const client = supabase.createClient(
    "https://dxqffvubixwsxnoaudat.supabase.co",
    "sb_publishable_Jg2Z_fDjwpY9yF5KQLbAOA_j7lsbav9"
    );

    /* ---------------------------------------------------------- */
    /* 🔧 Variables globales */
    /* ---------------------------------------------------------- */
    let transactionEnEdition = null;
    let produitsCache = [];
    let transactionsCache = [];

    /* ---------------------------------------------------------- */
    /* 📥 Charger les produits */
    /* ---------------------------------------------------------- */
    async function chargerProduits() {
        const { data, error } = await client
        .from("stock")
        .select("*")
        .order("nom", { ascending: true });

        if (error) return console.error(error);

        produitsCache = data;

        const selects = [
        document.getElementById("produit-select-add"),
        document.getElementById("produit-select-edit")
        ];

        selects.forEach(select => {
        select.innerHTML = '<option value="">Sélectionnez un produit</option>';
        data.forEach(p => {
        const option = document.createElement("option");
        option.value = p.id;
        option.textContent = p.nom;
        select.appendChild(option);
    });
    });
    }

    /* ---------------------------------------------------------- */
    /* 📥 Charger les transactions */
    /* ---------------------------------------------------------- */
    async function chargerTransactions() {
        const { data, error } = await client
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

        if (error) return console.error(error);

        transactionsCache = data;
        afficherTransactions();
    }

    /* ---------------------------------------------------------- */
    /* 🔽 Afficher les transactions */
    /* ---------------------------------------------------------- */
    function afficherTransactions() {
        const container = document.getElementById("transaction-items");
        container.innerHTML = "";

        if (transactionsCache.length === 0) {
        container.innerHTML = "<p>Aucune transaction pour le moment.</p>";
        return;
    }

        transactionsCache.forEach((t, index) => {
        const produit = produitsCache.find(p => p.id === t.produit_id);

        container.innerHTML += `
            <div class="transaction-item" onclick="afficherDetail(${index})">
                <strong>${produit ? produit.nom : "Produit supprimé"}</strong><br>
                <small>${produit ? produit.categorie : "?"} — ${t.date}</small>
            </div>
        `;
    });
    }

    /* ---------------------------------------------------------- */
    /* 🔽 Afficher le détail */
    /* ---------------------------------------------------------- */
    window.afficherDetail = function(index) {
        const t = transactionsCache[index];
        const produit = produitsCache.find(p => p.id === t.produit_id);

        const detail = document.getElementById("transaction-detail");

        detail.innerHTML = `
        <h2>${produit ? produit.nom : "Produit supprimé"}</h2>
        <p><strong>Catégorie :</strong> ${produit ? produit.categorie : "?"}</p>
        <p><strong>Quantité ajoutée :</strong> ${t.quantite}</p>
        <p><strong>Date :</strong> ${t.date}</p>

        <div class="transaction-actions">
            <button class="btn-modifier" onclick="modifierTransaction(${index})">
                <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn-supprimer" onclick="supprimerTransaction(${index})">
                <i class="bi bi-trash-fill"></i>
            </button>
        </div>
    `;
    };

    /* ---------------------------------------------------------- */
    /* 🔍 Recherche dynamique */
    /* ---------------------------------------------------------- */
    function normalize(str) {
        return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }

    document.getElementById("search").addEventListener("input", function () {
        const filter = normalize(this.value);
        const items = document.querySelectorAll("#transaction-items .transaction-item");
        let visibleCount = 0;

        items.forEach(item => {
        const nom = normalize(item.querySelector("strong").textContent);
        const ligne2 = item.querySelector("small").textContent;
        const [categorie, date] = ligne2.split("—").map(x => normalize(x.trim()));

        const match =
        nom.includes(filter) ||
        categorie.includes(filter) ||
        date.includes(filter);

        item.style.display = match ? "" : "none";
        if (match) visibleCount++;
    });

        document.getElementById("no-results").style.display =
        visibleCount === 0 ? "block" : "none";
    });

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

    /* ---------------------------------------------------------- */
    /* 🚀 Charger au démarrage */
    /* ---------------------------------------------------------- */
    (async () => {
        await chargerProduits();
        await chargerTransactions();
    })();