const destinations = [
  {
    name: "Banff, Canada",
    image: "assets/banff.png",
    traits: ["mountain", "hiking", "drive", "local"],
    tags: ["mountains", "lakes", "road trip"],
    note: "Best when you want dramatic hikes, scenic drives, and cozy food after long days outside."
  },
  {
    name: "Kyoto, Japan",
    image: "assets/kyoto.png",
    traits: ["city", "sightseeing", "rail", "local", "vegetarian"],
    tags: ["culture", "rail", "food"],
    note: "A strong match for temples, neighborhoods, markets, and a trip that works beautifully without a car."
  },
  {
    name: "Madeira, Portugal",
    image: "assets/madeira.png",
    traits: ["mountain", "beach", "hiking", "drive", "casual"],
    tags: ["island", "hiking", "coast"],
    note: "Great for travelers who want cliff walks, ocean views, relaxed meals, and a compact driving adventure."
  },
  {
    name: "Barcelona, Spain",
    image: "assets/barcelona.png",
    traits: ["city", "beach", "sightseeing", "fly", "fine"],
    tags: ["city", "beach", "architecture"],
    note: "An easy pick for food-forward sightseeing with beaches close enough for slower afternoons."
  },
  {
    name: "Sedona, Arizona",
    image: "assets/sedona.png",
    traits: ["mountain", "forest", "hiking", "drive", "casual"],
    tags: ["desert hikes", "wellness", "drive"],
    note: "A compact, high-impact match for hiking, red rock views, and flexible road-trip pacing."
  },
  {
    name: "Costa Rica",
    image: "assets/costa-rica.png",
    traits: ["forest", "beach", "hiking", "fly", "local"],
    tags: ["rainforest", "beach", "wildlife"],
    note: "A strong all-rounder for nature, beaches, guided adventures, and fresh local food."
  }
];

const form = document.querySelector("#travel-form");
const grid = document.querySelector("#destination-grid");
const travelerType = document.querySelector("#traveler-type");
const typeSummary = document.querySelector("#type-summary");
const heroDestination = document.querySelector("#hero-destination");
const budget = document.querySelector("#budget");
const budgetLabel = document.querySelector("#budget-label");
const upload = document.querySelector("#itinerary-upload");
const uploadList = document.querySelector("#upload-list");
const watchForm = document.querySelector("#watch-form");
const watchList = document.querySelector("#watch-list");

const scoreAdventure = document.querySelector("#score-adventure");
const scoreComfort = document.querySelector("#score-comfort");
const scoreCulture = document.querySelector("#score-culture");

const watches = [
  { destination: "Iceland ring road", target: 1400, status: "Watch for shoulder season drops" },
  { destination: "Greek island hopping", target: 1600, status: "Likely cheaper in late September" }
];

function getPreferences() {
  const data = new FormData(form);
  return {
    pace: data.get("pace"),
    places: data.getAll("place"),
    transport: data.get("transport"),
    food: data.get("food"),
    diet: data.get("diet") || "",
    budget: Number(data.get("budget"))
  };
}

function scoreDestination(destination, preferences) {
  let score = 35;
  if (destination.traits.includes(preferences.pace)) score += 18;
  if (destination.traits.includes(preferences.transport)) score += 14;
  if (destination.traits.includes(preferences.food)) score += 10;
  score += preferences.places.filter((place) => destination.traits.includes(place)).length * 12;
  if (preferences.diet.trim() && destination.traits.includes("vegetarian")) score += 8;
  if (preferences.budget >= 2400) score += 5;
  if (preferences.budget < 1200 && destination.name.includes("Kyoto")) score -= 8;
  return Math.max(42, Math.min(score, 98));
}

function resolveTravelerType(preferences) {
  const adventure = preferences.pace === "hiking" ? 82 : preferences.pace === "slow" ? 42 : 55;
  const culture = preferences.pace === "sightseeing" || preferences.places.includes("city") ? 78 : 52;
  const comfort = preferences.pace === "slow" || preferences.food === "fine" ? 76 : 54;

  let title = "Balanced Explorer";
  let summary = "A flexible traveler who likes a mix of nature, good food, and low-friction logistics.";

  if (adventure > 70 && preferences.places.includes("mountain")) {
    title = "Trail-First Pathfinder";
    summary = "You want the destination to earn its views: hikes, scenic routes, and meals that feel local.";
  } else if (culture > 70 && preferences.transport !== "drive") {
    title = "Culture Cartographer";
    summary = "You travel well through neighborhoods, markets, museums, transit, and food discoveries.";
  } else if (comfort > 70 && preferences.places.includes("beach")) {
    title = "Slow Coast Seeker";
    summary = "You like beautiful places with room to breathe, linger, eat well, and keep the schedule light.";
  } else if (preferences.transport === "drive") {
    title = "Open-Road Planner";
    summary = "You prefer flexible routes, scenic stops, and destinations that reward having a car.";
  }

  return { title, summary, adventure, comfort, culture };
}

function renderRecommendations() {
  const preferences = getPreferences();
  const type = resolveTravelerType(preferences);
  const ranked = destinations
    .map((destination) => ({ ...destination, score: scoreDestination(destination, preferences) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  travelerType.textContent = type.title;
  typeSummary.textContent = type.summary;
  heroDestination.textContent = ranked[0].name;
  budgetLabel.textContent = `$${preferences.budget.toLocaleString()}`;
  scoreAdventure.style.setProperty("--score", `${type.adventure}%`);
  scoreComfort.style.setProperty("--score", `${type.comfort}%`);
  scoreCulture.style.setProperty("--score", `${type.culture}%`);

  grid.innerHTML = ranked
    .map(
      (destination) => `
        <article class="destination-card">
          <img src="${destination.image}" alt="${destination.name} travel scene">
          <div>
            <p class="match-score">${destination.score}% match</p>
            <h3>${destination.name}</h3>
            <p>${destination.note}</p>
            <p class="tag-row">${destination.tags.map((tag) => `<span>${tag}</span>`).join("")}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderWatchList() {
  watchList.innerHTML = watches
    .map(
      (watch) => `
        <li>
          <span><strong>${watch.destination}</strong>${watch.status}</span>
          <span class="price-chip">Target $${Number(watch.target).toLocaleString()}</span>
        </li>
      `
    )
    .join("");
}

form.addEventListener("input", renderRecommendations);

document.querySelectorAll("[data-scroll-target]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(button.dataset.scrollTarget).scrollIntoView({ behavior: "smooth" });
  });
});

upload.addEventListener("change", async () => {
  const files = Array.from(upload.files || []);
  if (!files.length) return;

  uploadList.innerHTML = "";
  for (const file of files) {
    let detail = "Added to preference memory";
    if (file.type.startsWith("text") || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
      const text = await file.text();
      const words = text.split(/\s+/).filter(Boolean).length;
      detail = `Read locally: ${words} words of trip notes`;
    }

    const li = document.createElement("li");
    li.innerHTML = `<strong>${file.name}</strong><br>${detail}`;
    uploadList.append(li);
  }
});

watchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const destination = document.querySelector("#dream-destination").value.trim();
  const target = document.querySelector("#target-price").value;
  if (!destination || !target) return;

  watches.unshift({
    destination,
    target,
    status: "Ready to recommend when fares or stays dip below your target"
  });
  watchForm.reset();
  renderWatchList();
});

renderRecommendations();
renderWatchList();
