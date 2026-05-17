let currentPokemonId = null;

document.addEventListener("DOMContentLoaded", () => {
  const MAX_POKEMON = 151;
  const pokemonId = new URLSearchParams(window.location.search).get("id");
  const id = parseInt(pokemonId, 10);

  if (id < 1 || id > MAX_POKEMON) {
    window.location.href = "index.html";
    return;
  }

  currentPokemonId = id;
  loadPokemon(id);
});

async function loadPokemon(id) {
  try {
    const [pokemon, pokemonSpecies] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json()),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) => res.json()),
    ]);

    if (currentPokemonId === id) {
      displayPokemonDetails(pokemon);
      document.querySelector(".pokemon-description").textContent =
        getEnglishFlavorText(pokemonSpecies);

      const leftArrow = document.querySelector("#leftArrow");
      const rightArrow = document.querySelector("#rightArrow");

      leftArrow.onclick = null;
      rightArrow.onclick = null;

      if (id !== 1) {
        leftArrow.onclick = (e) => {
          e.preventDefault();
          navigatePokemon(id - 1);
        };
      }
      if (id !== 151) {
        rightArrow.onclick = (e) => {
          e.preventDefault();
          navigatePokemon(id + 1);
        };
      }

      window.history.pushState({}, "", `./detail.html?id=${id}`);
    }

    return true;
  } catch (error) {
    console.error("Error loading Pokémon data:", error);
    return false;
  }
}

async function navigatePokemon(id) {
  currentPokemonId = id;
  await loadPokemon(id);
}

const typeColors = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

function setElementStyles(elements, cssProperty, value) {
  elements.forEach((el) => (el.style[cssProperty] = value));
}

function rgbaFromHex(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ].join(", ");
}

function setTypeBackgroundColor(pokemon) {
  const mainType = pokemon.types[0].type.name;
  const color = typeColors[mainType];
  if (!color) return;

  setElementStyles([document.querySelector(".detail-main")], "backgroundColor", color);
  setElementStyles(document.querySelectorAll(".power-wrapper > p"), "backgroundColor", color);
  setElementStyles(document.querySelectorAll(".stats-wrap p.stats"), "color", color);

  const rgba = rgbaFromHex(color);
  const old = document.getElementById("type-progress-style");
  if (old) old.remove();

  const style = document.createElement("style");
  style.id = "type-progress-style";
  style.innerHTML = `
    .stats-wrap .progress-bar::-webkit-progress-bar {
      background-color: rgba(${rgba}, 0.5);
    }
    .stats-wrap .progress-bar::-webkit-progress-value {
      background-color: rgb(${rgba});
    }
  `;
  document.head.appendChild(style);
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function createAndAppendElement(parent, tag, options = {}) {
  const el = document.createElement(tag);
  Object.keys(options).forEach((key) => (el[key] = options[key]));
  parent.appendChild(el);
  return el;
}

function applyEntranceAnimation() {
  const old = document.getElementById("poke-anim-style");
  if (old) old.remove();

  const style = document.createElement("style");
  style.id = "poke-anim-style";
  style.innerHTML = `
    @keyframes pokemonEntrance {
      0% {
        opacity: 0;
        transform: translateY(60px) scale(0.5) rotate(-8deg);
        filter: blur(8px);
      }
      50% {
        opacity: 1;
        filter: blur(0px);
      }
      70% {
        transform: translateY(-16px) scale(1.08) rotate(2deg);
      }
      85% {
        transform: translateY(8px) scale(0.97) rotate(-1deg);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1) rotate(0deg);
        filter: blur(0px);
      }
    }
    @keyframes floatIdle {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-10px); }
    }
    .detail-img-wrap img.pokemon-entrance {
      animation:
        pokemonEntrance 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
        floatIdle 3s ease-in-out 0.7s infinite;
    }
  `;
  document.head.appendChild(style);

  const imageElement = document.querySelector(".detail-img-wrap img");
  imageElement.classList.remove("pokemon-entrance");
  void imageElement.offsetWidth;
  imageElement.classList.add("pokemon-entrance");
}

function displayPokemonDetails(pokemon) {
  const { name, id, types, weight, height, abilities, stats } = pokemon;
  const capitalizedName = capitalizeFirstLetter(name);

  document.querySelector("title").textContent = capitalizedName;
  document.querySelector(".detail-main").className = `detail-main main ${name.toLowerCase()}`;
  document.querySelector(".name-wrap .name").textContent = capitalizedName;
  document.querySelector(".pokemon-id-wrap .body2-fonts").textContent =
    `#${String(id).padStart(3, "0")}`;

  // Image — matches .detail-img-wrap from detail.html
  const imageElement = document.querySelector(".detail-img-wrap img");
  imageElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  imageElement.alt = capitalizedName;

  applyEntranceAnimation();

  // Types
  const typeWrapper = document.querySelector(".power-wrapper");
  typeWrapper.innerHTML = "";
  types.forEach(({ type }) => {
    createAndAppendElement(typeWrapper, "p", {
      className: `body3-fonts type ${type.name}`,
      textContent: capitalizeFirstLetter(type.name),
    });
  });

  // Weight — first .pokemon-detail-wrap
  document.querySelector(".pokemon-detail-wrap:nth-child(1) .weight").textContent =
    `${weight / 10} kg`;

  // Height — second .pokemon-detail-wrap
  document.querySelector(".pokemon-detail-wrap:nth-child(2) .height").textContent =
    `${height / 10} m`;

  // Abilities — inside .pokemon-detail.move
  const abilitiesWrapper = document.querySelector(".pokemon-detail.move");
  abilitiesWrapper.innerHTML = "";
  abilities.forEach(({ ability }) => {
    createAndAppendElement(abilitiesWrapper, "p", {
      className: "body3-fonts",
      textContent: ability.name,
    });
  });

  // Stats
  const statsWrapper = document.querySelector(".stats-wrapper");
  statsWrapper.innerHTML = "";

  const statNameMapping = {
    hp: "HP",
    attack: "Attack",
    defense: "Defense",
    "special-attack": "Sp. Atk",
    "special-defense": "Sp. Def",
    speed: "Speed",
  };

  stats.forEach(({ stat, base_stat }) => {
    const statDiv = document.createElement("div");
    statDiv.className = "stats-wrap";
    statsWrapper.appendChild(statDiv);

    createAndAppendElement(statDiv, "p", {
      className: "body3-fonts stats",
      textContent: statNameMapping[stat.name],
    });
    createAndAppendElement(statDiv, "p", {
      className: "body3-fonts",
      textContent: String(base_stat).padStart(3, "0"),
    });
    createAndAppendElement(statDiv, "progress", {
      className: "progress-bar",
      value: base_stat,
      max: 255,
    });
  });

  setTypeBackgroundColor(pokemon);
}

function getEnglishFlavorText(pokemonSpecies) {
  for (let entry of pokemonSpecies.flavor_text_entries) {
    if (entry.language.name === "en") {
      return entry.flavor_text.replace(/\f/g, " ");
    }
  }
  return "";
}