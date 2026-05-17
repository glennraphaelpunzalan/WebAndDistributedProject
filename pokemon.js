const MAX_POKEMON = 151;
const listWrapper = document.querySelector(".list-wrapper");
const searchInput = document.querySelector("#search-input");
const numberFilter = document.querySelector("#number");
const nameFilter = document.querySelector("#name");
const notFoundMessage = document.querySelector("#not-found-message");

let allPokemons = [];

const typeColors = {
  normal: "#A8A878", fire: "#F08030", water: "#6890F0",
  electric: "#F8D030", grass: "#78C850", ice: "#98D8D8",
  fighting: "#C03028", poison: "#A040A0", ground: "#E0C068",
  flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
  rock: "#B8A038", ghost: "#705898", dragon: "#7038F8",
  dark: "#705848", steel: "#B8B8D0", fairy: "#EE99AC",
};

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function showSkeletons(count = 12) {
  listWrapper.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "list-item skeleton-card";
    skeleton.innerHTML = `
      <div class="skeleton skeleton-number"></div>
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton skeleton-name"></div>
    `;
    listWrapper.appendChild(skeleton);
  }
}

async function fetchPokemonType(id) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();
    return data.types[0].type.name;
  } catch {
    return "normal";
  }
}

function createRipple(e, element) {
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
  element.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}

showSkeletons();

fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`)
  .then((res) => res.json())
  .then((data) => {
    allPokemons = data.results;
    displayPokemons(allPokemons);
  })
  .catch((err) => console.error("Error fetching Pokémon:", err));

function displayPokemons(pokemonList) {
  listWrapper.innerHTML = "";

  pokemonList.forEach((pokemon, index) => {
    const pokemonID = pokemon.url.split("/")[6];
    const name = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

    const listItem = document.createElement("div");
    listItem.className = "list-item fade-in-up";
    listItem.style.animationDelay = `${(index % 20) * 40}ms`;

    listItem.innerHTML = `
      <div class="number-wrap">
        <p class="caption-fonts">#${String(pokemonID).padStart(3, "0")}</p>
      </div>
      <div class="img-wrap">
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonID}.png"
          alt="${name}"
          loading="lazy"
        />
      </div>
      <div class="name-wrap">
        <p class="body3-fonts">${name}</p>
      </div>
    `;

    listItem.addEventListener("click", (e) => {
      createRipple(e, listItem);
      setTimeout(() => {
        window.location.href = `./detail.html?id=${pokemonID}`;
      }, 220);
    });

    fetchPokemonType(pokemonID).then((type) => {
      const color = typeColors[type] || "#68A090";
      listItem.querySelector(".name-wrap").style.backgroundColor =
        hexToRgba(color, 0.15);
      listItem.querySelector(".img-wrap").style.filter =
        `drop-shadow(0 8px 16px ${hexToRgba(color, 0.4)})`;
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