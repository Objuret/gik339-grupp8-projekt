//const url = 'http://localhost:3000/users';
const productsUrl = "http://localhost:3000/products";
const categoriesUrl = "http://localhost:3000/categories";

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
const productFormOverlay = document.getElementById("productFormOverlay");
const categoryFormOverlay = document.getElementById("categoryFormOverlay");

let categories = [];

let selectedID = null;

// Load Initial Data
window.addEventListener("load", () => {
  populateColorDropdown();
  fetchAllData();
});

function populateColorDropdown() {
  categoryColorInput.innerHTML = `<option value="" disabled selected>Select a color</option>`;
  colorOptions.forEach((color) => {
    const option = document.createElement("option");
    option.value = color;
    option.textContent = color.charAt(0).toUpperCase() + color.slice(1);
    categoryColorInput.appendChild(option);
  });
}

// Huvudfunktion: Hämtar och renderar all data
async function fetchAllData() {
  await Promise.all([
    fetchData(productsUrl, (products) => {
      console.log("Fetched products:", products);
      renderProducts(products); // Rendera produkter
    }),
    fetchData(categoriesUrl, (data) => {
      categories = data; // Spara kategorier i global variabel
      updateCategoryDropdown(categories); // Uppdatera dropdown
    }),
  ]);
}

window.addEventListener("load", fetchAllData);

// Event Listeners
productForm.addEventListener("submit", (e) => {
  handleSubmit(
    e,
    productsUrl, // Always use the base URL
    () => ({
      productName: productNameInput.value,
      price: parseFloat(priceInput.value),
      categoryId: parseInt(categorySelect.value),
    })
  );
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

  // Group products by categoryId
  const groupedProducts = products.reduce((acc, product) => {
    const categoryKey = product.categoryId;

    if (!acc[categoryKey]) {
      acc[categoryKey] = {
        categoryName: product.categoryName || "Okänd kategori", // Use categoryName from product
        color: product.color || "gray", // Use color from product
        items: [],
      };
    }

    acc[categoryKey].items.push(product);
    return acc;
  }, {});

  // Build HTML for each category and its products
  for (const [categoryId, group] of Object.entries(groupedProducts)) {
    const categoryColor = group.color + "-600" || "gray-200";
    let html = `
      <div class="bg-${categoryColor} p-4 rounded-md mb-4">
        <!-- Category title with CRUD buttons -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 class="text-2xl md:text-xl font-bold">${group.categoryName}</h2>
          <div class="flex gap-2">
            <button class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 w-full md:w-auto" onclick="handleEdit(${categoryId}, 'category')">Edit</button>
            <button class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 w-full md:w-auto" onclick="deleteCategory(${categoryId})">Delete</button>
          </div>
        </div>
        
        <!-- Product list for this category -->
        <ul class="flex flex-wrap gap-2">
    `;


    group.items.forEach((item) => {
      html += `
      <li class="bg-${group.color}-200 text-black p-4 rounded-md border border-gray-300 w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
      <h3 class="font-semibold">${item.productName}</h3>
      <p>Price: ${item.price} kr</p>
      <div class="flex flex-col sm:flex-row justify-between mt-2 gap-2">
        <button class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 w-full sm:w-auto" onclick="handleEdit(${item.productId}, 'product')">Edit</button>
        <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 w-full sm:w-auto" onclick="deleteProduct(${item.productId})">Delete</button>
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
    // Populate product form fields
    productNameInput.value = data.productName;
    priceInput.value = data.price;
    categorySelect.value = data.categoryId;
    categorySaveButton.disabled = true;
    categoryFormOverlay.classList.remove("hidden");
    categorySaveButton.classList.remove("bg-green-500", "hover:bg-green-600");
    categorySaveButton.classList.add("bg-gray-400");
  } else if (type === "category") {
    // Populate category form fields
    categoryNameInput.value = data.categoryName;
    categoryColorInput.value = data.color;
    productSaveButton.disabled = true;
    productFormOverlay.classList.remove("hidden");
    productSaveButton.classList.remove("bg-green-500", "hover:bg-green-600");
    productSaveButton.classList.add("bg-gray-400");
  }
  selectedID = id; // Set the ID for the item being edited
  document.getElementById("cancelEditButton").classList.remove("hidden"); // Show cancel button
}

function clearEditState() {
  selectedID = null; // Clear selectedID
  document.getElementById("cancelEditButton").classList.add("hidden"); // Hide cancel button
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
  // Check if a modal already exists
  if (document.getElementById("feedbackModal")) {
    hideFeedbackMessage(); // Clean up old modal if it exists
  }

  // Create modal container
  const modal = document.createElement("div");
  modal.id = "feedbackModal";
  modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 opacity-100";

  // Create modal content
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

  // Append modal content to modal container
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  let timeout; // Declare timeout variable

  // Function to start the timeout
  const startTimeout = () => {
    timeout = setTimeout(() => {
      modal.classList.add("opacity-0", "transition-opacity", "duration-500"); // Fade out
      setTimeout(() => modal.remove(), 500); // Remove after fade-out completes
    }, 1000); // 2-second delay
  };

  // Function to clear the timeout and reset visibility
  const clearTimeoutHandler = () => {
    clearTimeout(timeout); // Clear the timeout
    modal.classList.remove("opacity-0", "transition-opacity", "duration-300"); // Ensure the modal remains fully visible
  };

  // Start the timeout initially
  startTimeout();

  // Add event listeners for hover behavior on the modal content
  modalContent.addEventListener("mouseenter", clearTimeoutHandler); // Pause timer on hover
  modalContent.addEventListener("mouseleave", startTimeout); // Resume timer when mouse leaves
}

function hideFeedbackMessage() {
  const modal = document.getElementById("feedbackModal");
  if (modal) {
    modal.classList.add("opacity-0", "transition-opacity", "duration-300"); // Fade out
    setTimeout(() => modal.remove(), 300); // Remove after fade-out
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
