    const client = supabase.createClient(
    "https://dxqffvubixwsxnoaudat.supabase.co",
    "sb_publishable_Jg2Z_fDjwpY9yF5KQLbAOA_j7lsbav9"
    );

    document.getElementById("form").addEventListener("submit", async function(e) {
    e.preventDefault();

    const login = document.getElementById("login").value;
    const mdp = document.getElementById("password").value;

    const { data, error } = await client.auth.signInWithPassword({
    email: login,
    password: mdp
});

    console.log("data =", data);
    console.log("error =", error);

    if (error) {
    alert("Identifiants incorrects");
    return;
}

    localStorage.setItem("isLogged", "true");
    window.location.href = "dashboard.html";
});
