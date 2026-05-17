let currentPokemonId = null;

document.addEventListener("DOMContentLoaded", () => {
    const MAX_POKEMON_ID = 151;

    const pokemonId = new URLSearchParams(window.location.search).get("id");
    const id = parseInt(pokemonId, 10);

    if (id < 1 || id > MAX_POKEMON_ID) {
        window.location.href = "index.html";
        return;
    }

    currentPokemonId = id;
    loadPokemon(id);
});

async function loadPokemon(id) {
    try {
        const [pokemon, pokemonSpecies] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
                .then((res) => res.json()),

            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
                .then((res) => res.json())
        ]);

        if (currentPokemonId === id) {
            displayPokemonDetails(pokemon);

            const flavorText = getEnglishFlavorText(pokemonSpecies);

            document.querySelector(
                ".pokemon-description"
            ).textContent = flavorText;

            const [leftArrow, rightArrow] = [
                "#leftArrow",
                "#rightArrow"
            ].map((sel) => document.querySelector(sel));

            leftArrow.onclick = null;
            rightArrow.onclick = null;

            if (id !== 1) {
                leftArrow.onclick = () => navigatePokemon(id - 1);
            }

            if (id !== 151) {
                rightArrow.onclick = () => navigatePokemon(id + 1);
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
    fairy: "#EE99AC"
};

function setElementStyles(elements, cssProperty, value) {
    elements.forEach((element) => {
        element.style[cssProperty] = value;
    });
}

function rgbaFromHex(hexColor) {
    return [
        parseInt(hexColor.slice(1, 3), 16),
        parseInt(hexColor.slice(3, 5), 16),
        parseInt(hexColor.slice(5, 7), 16)
    ].join(", ");
}

function setTypeBackgroundColor(pokemon) {
    const mainType = pokemon.types[0].type.name;
    const color = typeColors[mainType];

    if (!color) return;

    const detailMainElement = document.querySelector(".detail-main");

    setElementStyles(
        [detailMainElement],
        "backgroundColor",
        color
    );

    setElementStyles(
        document.querySelectorAll(".power-wrapper > p"),
        "backgroundColor",
        color
    );

    setElementStyles(
        document.querySelectorAll(".stats-wrap p.stats"),
        "color",
        color
    );

    const rgbaColor = rgbaFromHex(color);

    const styleTag = document.createElement("style");

    styleTag.innerHTML = `
        .stats-wrap .progress-bar::-webkit-progress-bar {
            background-color: rgba(${rgbaColor}, 0.5);
        }

        .stats-wrap .progress-bar::-webkit-progress-value {
            background-color: ${color};
        }
    `;

    document.head.appendChild(styleTag);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() +
        string.slice(1).toLowerCase();
}

function createAndAppendElement(parent, tag, options = {}) {
    const element = document.createElement(tag);

    Object.keys(options).forEach((key) => {
        element[key] = options[key];
    });

    parent.appendChild(element);

    return element;
}

function displayPokemonDetails(pokemon) {
    const {
        name,
        id,
        types,
        weight,
        height,
        abilities,
        stats
    } = pokemon;

    const capitalizePokemonName =
        capitalizeFirstLetter(name);

    document.querySelector("title").textContent =
        capitalizePokemonName;

    const detailMainElement =
        document.querySelector(".detail-main");

    detailMainElement.classList.add(
        name.toLowerCase()
    );

    document.querySelector(
        ".name-wrap .name"
    ).textContent = capitalizePokemonName;

    document.querySelector(
        ".pokemon-id-wrap .body2-fonts"
    ).textContent =
        `#${String(id).padStart(3, "0")}`;

    const imageElement =
        document.querySelector(".detail-img-wrap img");

    imageElement.src =
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;

    const typeWrapper =
        document.querySelector(".power-wrapper");

    typeWrapper.innerHTML = "";

    types.forEach(({ type }) => {
        createAndAppendElement(typeWrapper, "p", {
            className: `body3-fonts type ${type.name}`,
            textContent: type.name
        });
    });

    document.querySelector(
        ".pokemon-detail-wrap .weight"
    ).textContent = `${weight / 10} kg`;

    document.querySelector(
        ".pokemon-detail-wrap .height"
    ).textContent = `${height / 10} m`;

    const abilitiesWrapper = document.querySelector(
        ".pokemon-detail-wrap .pokemon-detail.move"
    );

    abilitiesWrapper.innerHTML = "";

    abilities.forEach(({ ability }) => {
        createAndAppendElement(abilitiesWrapper, "p", {
            className: "body3-fonts",
            textContent: ability.name
        });
    });

    const statsWrapper =
        document.querySelector(".stats-wrapper");

    statsWrapper.innerHTML = "";

    const statNameMapping = {
        hp: "HP",
        attack: "Attack",
        defense: "Defense",
        "special-attack": "Sp. Atk",
        "special-defense": "Sp. Def",
        speed: "Speed"
    };

    stats.forEach(({ stat, base_stat }) => {
        const statDiv = document.createElement("div");

        statDiv.className = "stats-wrap";

        statsWrapper.appendChild(statDiv);

        createAndAppendElement(statDiv, "p", {
            className: "body3-fonts",
            textContent: statNameMapping[stat.name]
        });

        createAndAppendElement(statDiv, "p", {
            className: "body3-fonts stats",
            textContent: String(base_stat).padStart(3, "0")
        });

        createAndAppendElement(statDiv, "progress", {
            className: "progress-bar",
            value: base_stat,
            max: 100
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