/* ---------------------------------------------------------- */
/* 🔐 Sécurité globale */
/* ---------------------------------------------------------- */
if (localStorage.getItem("isLogged") !== "true") {
    window.location.href = "index.html";
}

/* ---------------------------------------------------------- */
/* 🔓 Logout global */
/* ---------------------------------------------------------- */
window.logout = function () {
    alert("Vous êtes déconnecté");
    localStorage.removeItem("isLogged");
    window.location.href = "index.html";
};

/* ---------------------------------------------------------- */
/* 🔧 Connexion Supabase (globale) */
/* ---------------------------------------------------------- */
window.client = supabase.createClient(
    "https://dxqffvubixwsxnoaudat.supabase.co",
    "sb_publishable_Jg2Z_fDjwpY9yF5KQLbAOA_j7lsbav9"
);

/* ---------------------------------------------------------- */
/* 📱 Menu mobile global */
/* ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    const menu = document.getElementById("mobileMenu");
    const icon = document.querySelector(".icon-menu-custom");

    if (icon && menu) {
        window.toggleMobileMenu = function () {
            menu.classList.toggle("open");
        };
    }
});
