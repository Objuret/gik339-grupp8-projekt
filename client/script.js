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

// Available Colors for Dropdown
const colorOptions = ["red", "blue", "green", "yellow", "purple", "pink", "gray", "black", "white"];

let categories = [];

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
  // console.log("Fetching all data...");
  await Promise.all([
    fetchData(productsUrl, (products) => {
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
  handleSubmit(e, productsUrl, () => ({
    productName: productNameInput.value,
    price: parseFloat(priceInput.value),
    categoryId: parseInt(categorySelect.value),
  }));
  console.log(categorySelect);
});

categoryForm.addEventListener("submit", (e) => {
  handleSubmit(e, categoriesUrl, () => ({
    categoryName: categoryNameInput.value,
    color: categoryColorInput.value,
  }));
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

// Rendera produkter grupperade efter kategori
function renderProducts(products) {
  const listContainer = document.getElementById("listContainer");
  listContainer.innerHTML = "";

  if (!products || products.length === 0) {
    listContainer.innerHTML = `<p class="text-center text-lg">Inga produkter hittades.</p>`;
    return;
  }

  // Gruppera produkter efter kategori
  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.categoryName]) {
      acc[product.categoryName] = { color: product.color, items: [] };
    }
    acc[product.categoryName].items.push(product);
    return acc;
  }, {});

  // Bygg HTML för varje kategori och dess produkter
  for (const [categoryName, group] of Object.entries(groupedProducts)) {
    const categoryColor = group.color + "-600" || "gray-200";
    let html = `
      <div class="bg-${categoryColor} p-4 rounded-md mb-4">
        <!-- Kategorititel med CRUD-knappar -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2">     
          <h2 class="text-xl md:text-2xl font-bold">${categoryName}</h2>
          <div>
            <button class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" onclick="setCurrentCategory('${categoryName}')">Edit</button>
            <button class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onclick="deleteCategory('${categoryName}')">Delete</button>
          </div>
        </div>

        <!-- Produktlista för denna kategori -->
        <ul class="flex flex-wrap gap-2">
    `;
    // let html = `
    //       <div class="bg-${categoryColor} p-4 rounded-md mb-4">
    //         <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2">
    //           <h2 class="text-xl md:text-2xl font-bold">${categoryName}</h2>
    //           <div class="flex gap-2">
    //             <button class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" onclick="setCurrentCategory('${categoryName}')">Ändra</button>
    //             <button class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onclick="deleteCategory('${categoryName}')">Ta bort</button>
    //           </div>
    //         </div>
    //         <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

    //         </ul>
    //       </div>
    //     `;

    group.items.forEach((item) => {
      html += `
        <li class="bg-${item.color}-200 text-black p-4 rounded-md border border-gray-300 w-full sm:w-1/2 md:w-1/4">
          <h3>${item.productName}</h3>
          <p>Pris: ${item.price} kr</p>
          <div class="flex justify-between mt-2">
            <button class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600" onclick="setCurrentProduct(${item.productId})">Ändra</button>
            <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onclick="deleteProduct(${item.productId})">Ta bort</button>
          </div>
        </li>`;
      //   html += `
      //       <li class="bg-${item.color}-200 text-black p-4 rounded-md border border-gray-300 w-1/4">
      //         <h3 class="font-semibold">${item.productName}</h3>
      //         <p>Pris: ${item.price} kr</p>
      //         <div class="flex justify-between mt-2 gap-2">
      //           <button class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600" onclick="setCurrentProduct(${item.productId})">Ändra</button>
      //           <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onclick="deleteProduct(${item.productId})">Ta bort</button>
      //         </div>
      //       </li>
      //     `;
    });

    html += `</ul></div>`;
    listContainer.insertAdjacentHTML("beforeend", html);
  }
}

// Sätt vald produkt i formuläret
async function setCurrentProduct(id) {
  // console.log(`Fetching product with ID: ${id}`);
  await fetchData(`${productsUrl}/${id}`, (product) => {
    /*document.getElementById("productName").value = product.productName;
    document.getElementById("price").value = product.price;
    document.getElementById("categorySelect").value = product.categoryId;*/
    productForm.dispatchEvent(new Event("submit"));
  });
}

// Ta bort en produkt
async function deleteProduct(id) {
  try {
    await fetch(`${productsUrl}/${id}`, { method: "DELETE" });
    await fetchAllData();
  } catch (error) {
    console.error("Kunde inte ta bort produkten:", error);
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

// Fyll i formuläret för redigering av kategori
function setCurrentCategory(id) {
  fetchData(`${categoriesUrl}/${id}`, (category) => {
    // document.getElementById("categoryName").value = category.categoryName;
    // document.getElementById("categoryColor").value = category.color;
    // localStorage.setItem("currentCategoryId", category.categoryId);
    categoryForm.dispatchEvent(new Event("submit"));
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
      alert("Kategorin och dess produkter har tagits bort.");
      await fetchAllData();
    }
  } catch (error) {
    console.error("Fel vid borttagning av kategori:", error);
  }
}

async function handleSubmit(e, url, dataBuilder) {
  e.preventDefault();

  try {
    // Bygg datan med hjälp av callback
    const dataObject = dataBuilder();

    // Kontrollera om det är en ny eller befintlig post
    const id = localStorage.getItem("currentId");
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
    localStorage.removeItem("currentId");
  } catch (error) {
    console.error("Fel vid formulärsubmit:", error.message);
  }
}
