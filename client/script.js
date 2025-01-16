//const url = 'http://localhost:3000/users';
const productsUrl = "http://localhost:3000/products"; //Hantera produkter via API
const categoriesUrl = "http://localhost:3000/categories"; //Hanterar kategorier via API

// Variabler för formulär och element
const productForm = document.getElementById("productForm");
const categoryForm = document.getElementById("categoryForm");

// Produktformulärs inputs
const productNameInput = document.getElementById("productName");
const priceInput = document.getElementById("price");
const categorySelect = document.getElementById("categorySelect");

// Kategoriformulärs inputs
const categoryNameInput = document.getElementById("categoryName");
const categoryColorInput = document.getElementById("categoryColor");

const colorOptions = ["red", "blue", "green", "yellow", "purple", "pink", "gray", "black", "white"];

//submitknappar och overlay för enable och disable logik
const productSaveButton = document.querySelector('#productForm button[type="submit"]');
const categorySaveButton = document.querySelector('#categoryForm button[type="submit"]');
//Element för att visa ett överlägg som indikerar att formulär är inaktiverade.
const productFormOverlay = document.getElementById("productFormOverlay");
const categoryFormOverlay = document.getElementById("categoryFormOverlay");

//Global variabel för lagring av kategorier
let categories = [];
//Global variabel för att hantera valda ID:n
let selectedID = null;

//Ladda initial data när sidan laddas
window.addEventListener("load", () => {
  populateColorDropdown(); //Fyll dropdown-menyn för färger.
  fetchAllData(); //Hämta produkter och kategorier
});

//Funktion som fyller färgdropdown med tillgängliga alternativ
function populateColorDropdown() {
  categoryColorInput.innerHTML = `<option value="" disabled selected>Välj en färg</option>`;
  colorOptions.forEach((color) => {
    const option = document.createElement("option"); //Skapar en ny option
    option.value = color; //Sätter värdet till färg
    option.textContent = color.charAt(0).toUpperCase() + color.slice(1); //Gör första bokstaven versal
    categoryColorInput.appendChild(option); //Lägger till i dropdown menyn
  });
}

// Huvudfunktion: Hämtar och renderar all data
async function fetchAllData() {
  // console.log("Fetching all data...");
  await Promise.all([
    fetchData(productsUrl, (products) => {
      console.log("Fetched products:", products); // Logga hämtade produkter
      renderProducts(products); // Rendera produkter i gränssnittet
    }),
    fetchData(categoriesUrl, (data) => {
      categories = data; // Spara kategorier i global variabel
      updateCategoryDropdown(categories); // Uppdatera dropdown
    }),
  ]);
}

//Säkerställ att data hämtas via sidladdning
window.addEventListener("load", fetchAllData);

// Event Listeners
productForm.addEventListener("submit", (e) => {
  handleSubmit(e, productsUrl, () => ({
    productName: productNameInput.value,
    price: parseFloat(priceInput.value),
    categoryId: parseInt(categorySelect.value),
  }));
});

categoryForm.addEventListener("submit", (e) => {
  handleSubmit(e, categoriesUrl, () => ({
    categoryName: categoryNameInput.value,
    color: categoryColorInput.value,
  }));
});

document.getElementById("cancelEditButton").addEventListener("click", () => {
  clearEditState();
});

async function fetchData(url, callback) {
  try {
    console.log(`Fetching data from: ${url}`);
    const response = await fetch(url);
    const data = await response.json();
    if (callback) callback(data);
  } catch (error) {
    console.error(`Fel vid hämtning från ${url}:`, error);
  }
}

//rendera produkter och gruppera efter kategori
function renderProducts(products) {
  console.log("Products data:", products);
  const listContainer = document.getElementById("listContainer");
  listContainer.innerHTML = "";

  if (!products || products.length === 0) {
    listContainer.innerHTML = `<p class="text-center text-lg">Inga produkter hittades.</p>`;
    return;
  }

  // Gruppera produkter efter kategoriId
  const groupedProducts = products.reduce((acc, product) => {
    const categoryKey = product.categoryId;

    if (!acc[categoryKey]) {
      acc[categoryKey] = {
        categoryName: product.categoryName || "Okänd kategori", // Använd kategorinamn från produkt
        color: product.color || "gray", // Använd färg från produkten
        items: [],
      };
    }

    acc[categoryKey].items.push(product);
    return acc;
  }, {});

  // Bygg HTML för varje kategori och dess produkter
  for (const [categoryId, group] of Object.entries(groupedProducts)) {
    const categoryColor = group.color + "-600" || "gray-200";
    let html = `
      <div class="bg-${categoryColor} p-4 rounded-md mb-4">
        <!-- Category title with CRUD buttons -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 class="text-2xl md:text-xl font-bold">${group.categoryName}</h2>
          <div class="flex gap-2">
            <button class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 w-full md:w-auto" onclick="handleEdit(${categoryId}, 'category')">Redigera</button>
            <button class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 w-full md:w-auto" onclick="deleteCategory(${categoryId})">Radera</button>
          </div>
        </div>
        
        <!-- Product list for this category -->
        <ul class="flex flex-wrap gap-2">
    `;

    group.items.forEach((item) => {
      html += `
      <li class="bg-${group.color}-200 text-black p-4 rounded-md border border-gray-300 w-full sm:w-1/2 md:w-1/3 lg:w-1/3">
      <h3 class="font-semibold">${item.productName}</h3>
      <p>Pris: ${item.price} kr</p>
      <div class="flex flex-col sm:flex-row justify-between mt-2 gap-2">
        <button class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 w-full sm:w-auto" onclick="handleEdit(${item.productId}, 'product')">Redigera</button>
        <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 w-full sm:w-auto" onclick="deleteProduct(${item.productId})">Radera</button>
      </div>
      </li>`;
    });

    html += `</ul></div>`;
    listContainer.insertAdjacentHTML("beforeend", html);
  }
}

async function handleEdit(id, type) {
  const url = type === "product" ? `${productsUrl}/${id}` : `${categoriesUrl}/${id}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${type} with ID ${id}`);
  }

  const data = await response.json();

  if (type === "product") {
    // Fyll i produktformulärfält
    productNameInput.value = data.productName;
    priceInput.value = data.price;
    categorySelect.value = data.categoryId;
    categorySaveButton.disabled = true;
    categoryFormOverlay.classList.remove("hidden");
    categorySaveButton.classList.remove("bg-green-500", "hover:bg-green-600");
    categorySaveButton.classList.add("bg-gray-400");
  } else if (type === "category") {
    // Fyll i kategoriformulärfält
    categoryNameInput.value = data.categoryName;
    categoryColorInput.value = data.color;
    productSaveButton.disabled = true;
    productFormOverlay.classList.remove("hidden");
    productSaveButton.classList.remove("bg-green-500", "hover:bg-green-600");
    productSaveButton.classList.add("bg-gray-400");
  }
  selectedID = id; // Ställ in ID för objektet som ska redigeras
  document.getElementById("cancelEditButton").classList.remove("hidden"); // Visa avbryt-knappen
}

function clearEditState() {
  selectedID = null; // Rensa valt ID
  document.getElementById("cancelEditButton").classList.add("hidden"); // Dölj avbryt-knapp
  document.getElementById("productForm").reset();
  document.getElementById("categoryForm").reset();
  productSaveButton.disabled = false;
  categorySaveButton.disabled = false;
  productSaveButton.classList.remove("bg-gray-400");
  productSaveButton.classList.add("bg-green-500", "hover:bg-green-600");
  categorySaveButton.classList.remove("bg-gray-400");
  categorySaveButton.classList.add("bg-green-500", "hover:bg-green-600");
  productFormOverlay.classList.add("hidden");
  categoryFormOverlay.classList.add("hidden");
}

function showFeedbackMessage(message) {
  // Kontrollera om en modal redan finns
  if (document.getElementById("feedbackModal")) {
    hideFeedbackMessage(); // Rensa upp gammal modal om den finns
  }

  // Skapa modal container
  const modal = document.createElement("div");
  modal.id = "feedbackModal";
  modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 opacity-100";

  // Skapa modal content
  const modalContent = document.createElement("div");
  modalContent.className = "bg-white rounded-md p-4 shadow-lg text-center max-w-sm w-full relative";
  modalContent.innerHTML = `
    <p class="text-gray-700 text-lg">${message}</p>
    <button
      class="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
      onclick="hideFeedbackMessage()"
    >
      OK
    </button>
  `;
  clearEditState();

  // Lägg till modalt innehåll till modal behållare
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  let timeout; // Deklarera timeout-variabel

  // Funktion för att starta timeout
  const startTimeout = () => {
    timeout = setTimeout(() => {
      modal.classList.add("opacity-0", "transition-opacity", "duration-500"); // Tona ut
      setTimeout(() => modal.remove(), 500); // Ta bort efter att uttoningen är klar
    }, 1000); // 2 sekunders fördröjning
  };

  // Funktion för att rensa timern
  const clearTimeoutHandler = () => {
    clearTimeout(timeout); // Rensa timeouten
    modal.classList.remove("opacity-0", "transition-opacity", "duration-300");
  };

  // Starta timeouten först
  startTimeout();

  // Lägg till händelseavlyssnare för hovringsbeteende på det modala innehållet
  modalContent.addEventListener("mouseenter", clearTimeoutHandler); // Pausa timern om elementet hoveras
  modalContent.addEventListener("mouseleave", startTimeout); // återuppta timern när elementet inte längre hoveras
}

function hideFeedbackMessage() {
  const modal = document.getElementById("feedbackModal");
  if (modal) {
    modal.classList.add("opacity-0", "transition-opacity", "duration-300"); // Fade out
    setTimeout(() => modal.remove(), 300); // ta bort efter fade out
  }
}

// Ta bort en produkt
async function deleteProduct(id) {
  try {
    await fetch(`${productsUrl}/${id}`, { method: "DELETE" });
    await fetchAllData();
    showFeedbackMessage("Produkten togs bort!");
  } catch (error) {
    console.error("Kunde inte ta bort produkten:", error);
    showFeedbackMessage("Ett fel uppstod vid borttagning av produkten.");
  }
}

// Uppdatera dropdown-listan med kategorier
function updateCategoryDropdown(categories) {
  const categorySelect = document.getElementById("categorySelect");
  if (!categorySelect) return; // Säkerhetskontroll

  categorySelect.innerHTML = `<option value="" disabled selected>Välj en kategori</option>`;

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.categoryId;
    option.textContent = category.categoryName;
    categorySelect.appendChild(option);
  });
}

async function deleteCategory(id) {
  try {
    // Hämta antalet produkter i kategorin
    const response = await fetch(`http://localhost:3000/categories/${id}/count`);
    const { productCount } = await response.json();

    const confirmation = confirm(`Denna kategori innehåller ${productCount} produkt(er). Är du säker på att du vill ta bort denna kategori?`);

    if (confirmation) {
      // Om användaren bekräftar, ta bort kategorin
      await fetch(`http://localhost:3000/categories/${id}`, { method: "DELETE" });
      showFeedbackMessage("Kategorin och dess produkter togs bort!");
      await fetchAllData();
    }
  } catch (error) {
    console.error("Fel vid borttagning av kategori:", error);
    showFeedbackMessage("Ett fel uppstod vid borttagning.");
  }
}

async function handleSubmit(e, url, dataBuilder) {
  e.preventDefault();

  try {
    // Bygg datan med hjälp av callback
    const dataObject = dataBuilder();

    // Kontrollera om det är en ny eller befintlig post
    const id = selectedID ? parseInt(selectedID, 10) : null;
    const method = id ? "PUT" : "POST";
    const endpoint = id ? `${url}/${id}` : url;

    // Skicka datan till servern med fetch
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataObject),
    });

    if (!response.ok) throw new Error("Serverfel vid hantering av data.");

    // Kör callback för att uppdatera gränssnittet
    await fetchAllData();

    // Återställ formulär och localStorage

    e.target.reset();
    selectedID = null;

    // Avgör vilken resurstyp som hanterades baserat på url
    const resourceType = url.includes("products") ? "Produkten" : "Kategorin";
    const action = id ? "uppdaterades" : "skapades";

    showFeedbackMessage(`${resourceType} ${action} framgångsrikt!`);
  } catch (error) {
    console.error("Fel vid formulärsubmit:", error.message);
  }
}
