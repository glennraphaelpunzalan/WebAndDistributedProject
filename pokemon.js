const MAX_POKEMON = 151;
const listWrapper = document.querySelector(".list-wrapper");
const searchInput = document.querySelector("#search-input");
const numberFilter = document.querySelector("#number");
const nameFilter = document.querySelector("#name");
const notFoundMessage = document.querySelector("#not-found-message");

let allPokemons = [];

fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`)
  .then((res) => res.json())
  .then((data) => {
    allPokemons = data.results;
    displayPokemons(allPokemons);
  })
  .catch((err) => console.error("Error fetching Pokémon:", err));

function displayPokemons(pokemonList) {
  listWrapper.innerHTML = "";

  pokemonList.forEach((pokemon) => {
    const pokemonID = pokemon.url.split("/")[6];
    const name = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

    const listItem = document.createElement("div");
    listItem.className = "list-item";
    listItem.innerHTML = `
      <div class="number-wrap">
        <p class="caption-fonts">#${String(pokemonID).padStart(3, "0")}</p>
      </div>
      <div class="img-wrap">
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonID}.png"
          alt="${name}"
        />
      </div>
      <div class="name-wrap">
        <p class="body3-fonts">${name}</p>
      </div>
    `;

    listItem.addEventListener("click", () => {
      window.location.href = `./detail.html?id=${pokemonID}`;
    });

    listWrapper.appendChild(listItem);
  });
}

function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase();

  const filteredPokemons = allPokemons.filter((pokemon) => {
    const pokemonID = pokemon.url.split("/")[6];
    if (numberFilter.checked) return pokemonID.startsWith(searchTerm);
    if (nameFilter.checked) return pokemon.name.toLowerCase().startsWith(searchTerm);
    return true;
  });

  displayPokemons(filteredPokemons);
  notFoundMessage.style.display = filteredPokemons.length === 0 ? "block" : "none";
}

searchInput.addEventListener("keyup", handleSearch);
numberFilter.addEventListener("change", handleSearch);
nameFilter.addEventListener("change", handleSearch);

document.querySelector(".search-close-icon").addEventListener("click", () => {
  searchInput.value = "";
  displayPokemons(allPokemons);
  notFoundMessage.style.display = "none";
});