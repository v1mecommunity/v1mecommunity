// ==============================
// ПЕРЕВІРКА АДМІНА
// ==============================

async function checkAdmin() {

    const { data } = await supabaseClient.auth.getSession();

    if (!data.session) {

        document.getElementById("loginPanel").style.display = "block";
        document.getElementById("adminPanel").style.display = "none";

        return;
    }

    document.getElementById("loginPanel").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";

    loadTournaments();
}


// ==============================
// ВХІД
// ==============================

document
    .getElementById("loginForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const { error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {

            console.error(error);

            document.getElementById("loginError").textContent =
                "❌ Неправильна пошта або пароль.";

            return;
        }

        document.getElementById("loginError").textContent = "";

        checkAdmin();

    });


// ==============================
// ВИХІД
// ==============================

document
    .getElementById("logoutButton")
    .addEventListener("click", async function() {

        await supabaseClient.auth.signOut();

        checkAdmin();

    });


// ==============================
// ЗАВАНТАЖИТИ ТУРНІРИ
// ==============================

async function loadTournaments() {

    const { data, error } = await supabaseClient
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {

        console.error("Помилка завантаження турнірів:", error);

        return;
    }

    const list = document.getElementById("tournamentsList");

    list.innerHTML = "";

    data.forEach(function(tournament) {

        const tournamentElement = document.createElement("div");

        tournamentElement.innerHTML = `
            <h3>${tournament.name}</h3>

            <p>Призові: ${tournament.prize}</p>

            <p>Статус: ${tournament.status}</p>

            <button onclick="editTournament(${tournament.id})">
                ✏️ Редагувати
            </button>

            <button onclick="deleteTournament(${tournament.id})">
                🗑️ Видалити
            </button>

            <hr>
        `;

        list.appendChild(tournamentElement);

    });

}


// ==============================
// КНОПКА ТУРНІРИ
// ==============================

document
    .getElementById("tournamentsButton")
    .addEventListener("click", function() {

        loadTournaments();

    });


// ==============================
// ДОДАТИ ТУРНІР
// ==============================

document
    .getElementById("addTournamentButton")
    .addEventListener("click", async function() {

        const name = prompt("Назва турніру:");

        if (!name) return;

        const prize = prompt("Призові:");

        if (!prize) return;

        const status = prompt(
            "Статус: upcoming / live / finished"
        );

        if (!status) return;


        const { error } = await supabaseClient
            .from("tournaments")
            .insert({
                name: name,
                prize: prize,
                status: status
            });


        if (error) {

            console.error(error);

            alert("❌ Не вдалося створити турнір.");

            return;
        }


        alert("✅ Турнір створено!");

        loadTournaments();

    });


// ==============================
// РЕДАГУВАТИ ТУРНІР
// ==============================

async function editTournament(id) {

    const { data, error } = await supabaseClient
        .from("tournaments")
        .select("*")
        .eq("id", id)
        .single();


    if (error) {

        console.error(error);

        alert("❌ Не вдалося отримати турнір.");

        return;
    }


    const newName = prompt(
        "Назва турніру:",
        data.name
    );

    if (!newName) return;


    const newPrize = prompt(
        "Призові:",
        data.prize
    );

    if (!newPrize) return;


    const newStatus = prompt(
        "Статус: upcoming / live / finished",
        data.status
    );

    if (!newStatus) return;


    const { error: updateError } = await supabaseClient
        .from("tournaments")
        .update({
            name: newName,
            prize: newPrize,
            status: newStatus
        })
        .eq("id", id);


    if (updateError) {

        console.error(updateError);

        alert("❌ Не вдалося змінити турнір.");

        return;
    }


    alert("✅ Турнір змінено!");

    loadTournaments();

}


// ==============================
// ВИДАЛИТИ ТУРНІР
// ==============================

async function deleteTournament(id) {

    const confirmDelete = confirm(
        "Точно видалити цей турнір?"
    );

    if (!confirmDelete) return;


    const { error } = await supabaseClient
        .from("tournaments")
        .delete()
        .eq("id", id);


    if (error) {

        console.error(error);

        alert("❌ Не вдалося видалити турнір.");

        return;
    }


    alert("✅ Турнір видалено!");

    loadTournaments();

}


// ==============================
// ЗАПУСК
// ==============================

checkAdmin();