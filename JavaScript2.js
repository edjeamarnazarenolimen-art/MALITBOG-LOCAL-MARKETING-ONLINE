const navigation = document.querySelector("#navigation");
const pageNavigation = document.querySelector(".page-navigation");
const pageContent = document.querySelector("#page-content");
const categories = ["All products", "Food", "Vegetables", "Meat", "Spices", "Snacks"];
const priceRanges = [
  { value: "all", label: "All price ranges", min: 0, max: Infinity },
  { value: "10-50", label: "₱10–₱49.99", min: 10, max: 50 },
  { value: "50-100", label: "₱50–₱99.99", min: 50, max: 100 },
  { value: "100-500", label: "₱100–₱499.99", min: 100, max: 500 },
  { value: "500-1000", label: "₱500–₱999.99", min: 500, max: 1000 },
  { value: "1000-plus", label: "₱1,000 and above", min: 1000, max: Infinity }
];
let activeCategory = "All products";
let activePriceRange = "all";
let pendingPhotoUrl = null;
let currentAccount = null;
let currentBuyer = null;
let registeredAccounts = [];
let products = [];
let conversations = [];
let currentChatId = null;
let pendingChatProduct = null;
let currentLanguage = "en";
let currentView = "account";
let currentSignupType = null;

// Set either value to an image URL (or a project-relative path) to use your own background.
// Leave it empty to keep the built-in illustration.
const marketBackgroundUrls = {
  landscape: "https://uploads.onecompiler.io/44x5vpr2w/454rtg2kj/ff1ae716-f182-4401-b3fc-ba3cf9dda345.jfif",
  portrait: "https://uploads.onecompiler.io/44x5vpr2w/454rtg2kj/bf508771-8337-4838-aa21-3cc7f034c5c6.jfif"
};

const marketBackgrounds = {
  landscape: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" fill="none"><g stroke="#34734b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".10"><path d="M0 205c90-35 154-104 191-205m-84 267c41-89 98-157 191-206M0 90c82 9 151 42 213 103M0 154c56 5 104 25 151 62"/><path d="M1600 795c-90 35-154 104-191 205m84-267c-41 89-98 157-191 206m298 81c-82-9-151-42-213-103m213 39c-56-5-104-25-151-62"/><path d="M1340 0c19 60 53 111 104 153m-165-96c37 45 61 95 70 151m176-107c-55 20-103 56-142 107"/><path d="M260 1000c-19-60-53-111-104-153m165 96c-37-45-61-95-70-151M75 899c55-20 103-56 142-107"/></g><g fill="#34734b" opacity=".045"><circle cx="800" cy="85" r="3"/><circle cx="845" cy="135" r="4"/><circle cx="760" cy="175" r="3"/><circle cx="730" cy="825" r="4"/><circle cx="800" cy="890" r="3"/><circle cx="865" cy="845" r="3"/></g></svg>`,
  portrait: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1600" fill="none"><g stroke="#34734b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".10"><path d="M0 275c100-42 164-122 205-275m-112 350c45-100 112-177 210-231M0 120c87 10 158 45 225 112M0 195c60 6 112 28 162 68"/><path d="M1000 1325c-100 42-164 122-205 275m112-350c-45 100-112 177-210 231m303-113c-87-10-158-45-225-112m225 37c-60-6-112-28-162-68"/><path d="M1000 170c-82 20-149 61-202 125m202-45c-58 17-105 46-150 91"/><path d="M0 1430c82-20 149-61 202-125M0 1340c58-17 105-46 150-91"/></g><g fill="#34734b" opacity=".045"><circle cx="500" cy="250" r="4"/><circle cx="550" cy="320" r="3"/><circle cx="445" cy="370" r="3"/><circle cx="470" cy="1230" r="3"/><circle cx="535" cy="1300" r="4"/><circle cx="590" cy="1245" r="3"/></g></svg>`
};

function updateMarketBackground() {
  const orientation = window.matchMedia("(orientation: portrait)").matches ? "portrait" : "landscape";
  const imageUrl = marketBackgroundUrls[orientation];
  document.body.style.backgroundImage = imageUrl
    ? `url("${imageUrl}")`
    : `url("data:image/svg+xml,${encodeURIComponent(marketBackgrounds[orientation])}")`;
}

const translations = {
  tl: {
    "Language:": "Wika:", "Choose language": "Pumili ng wika", "Good things, grown and made close to home.": "Magagandang produktong lokal, sariwa at malapit sa inyo.", "Explore:": "Tuklasin:", "Market": "Pamilihan", "About": "Tungkol", "Contact": "Makipag-ugnayan", "Chats": "Mga chat",
    "Create an account": "Gumawa ng account", "My account": "Aking account", "All products": "Lahat ng produkto", "Food": "Pagkain", "Vegetables": "Mga gulay", "Meat": "Karne", "Spices": "Mga pampalasa", "Snacks": "Meryenda",
    "All price ranges": "Lahat ng presyo", "₱10–₱49.99": "₱10–₱49.99", "₱50–₱99.99": "₱50–₱99.99", "₱100–₱499.99": "₱100–₱499.99", "₱500–₱999.99": "₱500–₱999.99", "₱1,000 and above": "₱1,000 pataas", "No products here yet.": "Wala pang produkto rito.", "SHOP LOCAL · EAT WELL": "BUMILI SA LOKAL · MASARAP NA PAGKAIN", "A little goodness from nearby": "Sariwang produkto mula sa inyong lugar", "Discover fresh food, garden vegetables, quality meat, flavorful spices, and tasty snacks from local sellers.": "Tuklasin ang sariwang pagkain, gulay, de-kalidad na karne, pampalasa, at masasarap na meryenda mula sa mga lokal na nagtitinda.",
    "Product categories": "Mga kategorya ng produkto", "Browse categories": "Mag-browse ng mga kategorya", "Filter by price:": "I-filter ayon sa presyo:", "Filter products by price in pesos": "I-filter ang mga produkto ayon sa presyo sa piso", "Marketplace products": "Mga produkto sa pamilihan", "Chat with seller": "Makipag-chat sa nagtitinda", "Your product": "Produkto mo", "I'm interested": "Interesado ako", "Seller": "Nagtitinda",
    "Back to account": "Bumalik sa account", "Back to chats": "Bumalik sa mga chat", "PRODUCT CHAT": "CHAT TUNGKOL SA PRODUKTO", "Start the conversation about this product.": "Simulan ang pag-uusap tungkol sa produktong ito.", "Write a message...": "Sumulat ng mensahe...", "Chat message": "Mensahe sa chat", "Send message": "Ipadala ang mensahe", "BUYER ACCOUNT": "BUYER ACCOUNT", "Your chats": "Mga chat mo", "Continue a conversation with a local seller.": "Ipagpatuloy ang pakikipag-usap sa lokal na nagtitinda.", "You haven’t started any chats yet. Browse the market and choose Chat with seller on a product.": "Wala ka pang nasisimulang chat. Mag-browse sa pamilihan at piliin ang Makipag-chat sa nagtitinda sa isang produkto.",
    "WELCOME BACK": "MALIGAYANG PAGBABALIK", "Sign in to your account": "Mag-sign in sa iyong account", "Choose your account type and enter the email and password you used when signing up.": "Piliin ang uri ng account at ilagay ang email at password na ginamit mo sa pag-sign up.", "Account type": "Uri ng account", "Buyer account": "Buyer account", "Seller account": "Seller account", "Email address": "Email address", "Password": "Password", "Show": "Ipakita", "Hide": "Itago", "Show password": "Ipakita ang password", "Hide password": "Itago ang password", "Sign in": "Mag-sign in", "No matching account found. Check your account type, email, and password.": "Walang nahanap na katugmang account. Suriin ang uri ng account, email, at password.", "← Back to account options": "← Bumalik sa mga pagpipilian ng account", "← Choose account type": "← Pumili ng uri ng account", "Already have an account? Sign in": "May account ka na ba? Mag-sign in",
    "Switch account": "Magpalit ng account", "Sign out": "Mag-sign out", "JOIN YOUR LOCAL MARKET": "SUMALI SA LOKAL NA PAMILIHAN", "Choose a buyer account to chat with sellers, or a seller account to post products.": "Pumili ng buyer account para makipag-chat sa mga nagtitinda, o seller account para mag-post ng mga produkto.", "Create a seller account": "Gumawa ng account bilang nagtitinda", "Create a buyer account": "Gumawa ng account bilang mamimili", "+ Add a logo or profile photo": "+ Magdagdag ng logo o larawan sa profile", "Upload a logo or profile photo": "Mag-upload ng logo o larawan sa profile", "Preview of your logo or profile photo": "Preview ng logo o larawan sa profile", "Your name or business name": "Pangalan mo o pangalan ng negosyo", "Your email address": "Email address mo", "Create a password (at least 6 characters)": "Gumawa ng password (hindi bababa sa 6 na character)", "Create a password with at least 6 characters": "Gumawa ng password na may hindi bababa sa 6 na character", "Create a password for your buyer account with at least 6 characters": "Gumawa ng password para sa buyer account na may hindi bababa sa 6 na character", "Create an account to start chatting with a seller.": "Gumawa ng account para makapagsimula ng chat sa isang nagtitinda.", "Your name": "Pangalan mo", "Buyer name": "Pangalan ng buyer", "Buyer email address": "Email address ng buyer", "Shop as a buyer": "Mamili bilang buyer", "Browse local products and chat with sellers.": "Mag-browse ng mga lokal na produkto at makipag-chat sa mga nagtitinda.", "Sell on Fresh Market": "Magbenta sa Fresh Market", "Create a seller profile and share your products.": "Gumawa ng seller profile at ibahagi ang iyong mga produkto.", "Welcome": "Maligayang pagdating", "Never share payment details or send money before confirming a seller and product.": "Huwag ibahagi ang detalye ng bayad o magpadala ng pera bago makumpirma ang nagtitinda at produkto.",
    "Buyer chats": "Mga chat ng buyer", "No buyer messages yet. Chats about your products will appear here.": "Wala pang mensahe mula sa buyer. Lalabas dito ang mga chat tungkol sa iyong mga produkto.", "Your products": "Mga produkto mo", "Post a product": "Mag-post ng produkto", "Add a product photo and details. You will confirm before it appears in the marketplace.": "Magdagdag ng larawan at detalye ng produkto. Kumpirmahin muna bago ito lumabas sa pamilihan.", "+ Upload product picture": "+ Mag-upload ng larawan ng produkto", "Choose a product picture": "Pumili ng larawan ng produkto", "Preview of your product": "Preview ng produkto mo", "Product name": "Pangalan ng produkto", "Product category": "Kategorya ng produkto", "Choose a category": "Pumili ng kategorya", "Price (₱)": "Presyo (₱)", "Price in pesos": "Presyo sa piso", "Tell shoppers about your product...": "Ilarawan ang produkto mo sa mga mamimili...", "Product description": "Paglalarawan ng produkto", "Post product to market": "I-post ang produkto sa pamilihan", "Cancel photo": "Alisin ang larawan", "Please upload a product picture first.": "Mag-upload muna ng larawan ng produkto.", "About Fresh Market": "Tungkol sa Fresh Market", "We bring local growers, makers, and neighbors together to share good products.": "Pinag-uugnay namin ang mga lokal na magsasaka, gumagawa, at kapitbahay upang magbahagi ng magagandang produkto.", "Product chats": "Mga chat tungkol sa produkto", "Seller:": "Nagtitinda:", "Product posted by seller": "Produktong inilista ng nagtitinda", "Local seller": "Lokal na nagtitinda", "Chat with": "Makipag-chat kay", "Open a product listing and choose Chat with seller to start a conversation. Sellers can reply from the Buyer chats section of their account.": "Buksan ang listahan ng produkto at piliin ang Makipag-chat sa nagtitinda upang magsimula ng usapan. Makakasagot ang mga nagtitinda sa seksyong Mga chat ng buyer ng kanilang account."
  },
  ceb: {
    "Language:": "Pinulongan:", "Choose language": "Pilia ang pinulongan", "Good things, grown and made close to home.": "Maayong mga produkto, gipatubo ug gihimo duol sa inyo.", "Explore:": "Susihon:", "Market": "Merkado", "About": "Mahitungod", "Contact": "Kontak", "Chats": "Mga chat",
    "Create an account": "Pagbuhat ug account", "My account": "Akong account", "All products": "Tanang produkto", "Food": "Pagkaon", "Vegetables": "Mga utanon", "Meat": "Karne", "Spices": "Mga panakot", "Snacks": "Mga meryenda",
    "All price ranges": "Tanang presyo", "₱10–₱49.99": "₱10–₱49.99", "₱50–₱99.99": "₱50–₱99.99", "₱100–₱499.99": "₱100–₱499.99", "₱500–₱999.99": "₱500–₱999.99", "₱1,000 and above": "₱1,000 pataas", "No products here yet.": "Wala pay mga produkto dinhi.", "SHOP LOCAL · EAT WELL": "PALIT LOKAL · KAON OG LAMI", "A little goodness from nearby": "Maayong mga produkto gikan sa duol", "Discover fresh food, garden vegetables, quality meat, flavorful spices, and tasty snacks from local sellers.": "Pangitaa ang preskong pagkaon, mga utanon, maayong karne, lami nga panakot, ug mga meryenda gikan sa lokal nga mga namaligya.",
    "Product categories": "Mga kategorya sa produkto", "Browse categories": "Tan-awa ang mga kategorya", "Filter by price:": "Pilia sumala sa presyo:", "Filter products by price in pesos": "Pilia ang mga produkto sumala sa presyo sa piso", "Marketplace products": "Mga produkto sa merkado", "Chat with seller": "Makig-chat sa namaligya", "Your product": "Imong produkto", "I'm interested": "Interesado ko",
    "Back to account": "Balik sa account", "Back to chats": "Balik sa mga chat", "PRODUCT CHAT": "CHAT SA PRODUKTO", "Start the conversation about this product.": "Sugdi ang panag-istorya bahin niining produkto.", "Write a message...": "Pagsulat og mensahe...", "Chat message": "Mensahe sa chat", "Send message": "Ipadala ang mensahe", "BUYER ACCOUNT": "ACCOUNT SA BUYER", "Your chats": "Imong mga chat", "Continue a conversation with a local seller.": "Padayon ang panag-istorya sa lokal nga namaligya.", "You haven’t started any chats yet. Browse the market and choose Chat with seller on a product.": "Wala pa kay nasugdan nga chat. Tan-awa ang merkado ug pilia ang Makig-chat sa namaligya sa usa ka produkto.",
    "WELCOME BACK": "MAAYONG PAGBALIK", "Sign in to your account": "Sulod sa imong account", "Choose your account type and enter the email and password you used when signing up.": "Pilia ang tipo sa account ug isulod ang email ug password nga gigamit sa pag-sign up.", "Account type": "Tipo sa account", "Buyer account": "Account sa buyer", "Seller account": "Account sa seller", "Email address": "Email address", "Password": "Password", "Show": "Ipakita", "Hide": "Tagoa", "Show password": "Ipakita ang password", "Hide password": "Tagoa ang password", "Sign in": "Sulod", "No matching account found. Check your account type, email, and password.": "Walay nakit-an nga katugbang nga account. Susiha ang tipo sa account, email, ug password.", "← Back to account options": "← Balik sa mga kapilian sa account", "← Choose account type": "← Pilia ang tipo sa account", "Already have an account? Sign in": "Aduna na kay account? Sulod",
    "Switch account": "Ilisi ang account", "Sign out": "Gawas", "JOIN YOUR LOCAL MARKET": "APIL SA LOKAL NGA MERKADO", "Choose a buyer account to chat with sellers, or a seller account to post products.": "Pilia ang buyer account aron makig-chat sa mga namaligya, o seller account aron mag-post og mga produkto.", "Create a seller account": "Maghimo og account isip mamaligyaay", "Create a buyer account": "Maghimo og account isip mamalitay", "+ Add a logo or profile photo": "+ Idugang ang logo o hulagway sa profile", "Upload a logo or profile photo": "I-upload ang logo o hulagway sa profile", "Preview of your logo or profile photo": "Preview sa logo o hulagway sa profile", "Your name or business name": "Imong ngalan o ngalan sa negosyo", "Your email address": "Imong email address", "Create a password (at least 6 characters)": "Paghimo og password (labing menos 6 ka karakter)", "Create a password with at least 6 characters": "Paghimo og password nga adunay labing menos 6 ka karakter", "Create a password for your buyer account with at least 6 characters": "Paghimo og password para sa buyer account nga adunay labing menos 6 ka karakter", "Create an account to start chatting with a seller.": "Paghimo og account aron makasugod og chat sa namaligya.", "Your name": "Imong ngalan", "Buyer name": "Ngalan sa buyer", "Buyer email address": "Email address sa buyer", "Shop as a buyer": "Mamili isip buyer", "Browse local products and chat with sellers.": "Tan-awa ang lokal nga mga produkto ug makig-chat sa mga namaligya.", "Sell on Fresh Market": "Ibaligya sa Fresh Market", "Create a seller profile and share your products.": "Paghimo og seller profile ug ipaambit ang imong mga produkto.", "Welcome": "Maayong pag-abot", "Never share payment details or send money before confirming a seller and product.": "Ayaw ipaambit ang detalye sa bayad o pagpadala og kwarta hangtod makumpirma ang namaligya ug produkto.",
    "Buyer chats": "Mga chat sa buyer", "No buyer messages yet. Chats about your products will appear here.": "Wala pay mensahe gikan sa buyer. Dinhi makita ang mga chat bahin sa imong mga produkto.", "Your products": "Imong mga produkto", "Post a product": "Pag-post og produkto", "Add a product photo and details. You will confirm before it appears in the marketplace.": "Idugang ang litrato ug detalye sa produkto. Kumpirmahi una kini sa dili pa makita sa merkado.", "+ Upload product picture": "+ I-upload ang litrato sa produkto", "Choose a product picture": "Pilia ang litrato sa produkto", "Preview of your product": "Preview sa imong produkto", "Product name": "Ngalan sa produkto", "Product category": "Kategorya sa produkto", "Choose a category": "Pilia ang kategorya", "Price (₱)": "Presyo (₱)", "Price in pesos": "Presyo sa piso", "Tell shoppers about your product...": "Ihulagway ang imong produkto sa mga mamalitay...", "Product description": "Deskripsyon sa produkto", "Post product to market": "I-post ang produkto sa merkado", "Cancel photo": "Tangtanga ang litrato", "Please upload a product picture first.": "Palihog i-upload una ang litrato sa produkto.", "About Fresh Market": "Mahitungod sa Fresh Market", "We bring local growers, makers, and neighbors together to share good products.": "Among gitigom ang lokal nga mga mag-uuma, magbubuhat, ug silingan aron ipaambit ang maayong mga produkto.", "Product chats": "Mga chat sa produkto", "Seller:": "Namaligya:", "Product posted by seller": "Produkto nga gi-post sa namaligya", "Local seller": "Lokal nga namaligya", "Chat with": "Makig-chat kang", "Open a product listing and choose Chat with seller to start a conversation. Sellers can reply from the Buyer chats section of their account.": "Ablihi ang listahan sa produkto ug pilia ang Makig-chat sa namaligya aron magsugod og panag-istorya. Makatubag ang mga namaligya sa seksyon sa mga chat sa buyer sa ilang account."
  }
};

function translate(text) {
  return (translations[currentLanguage] && translations[currentLanguage][text]) || text;
}

const pageMessages = {
  About: ["About Fresh Market", "We bring local growers, makers, and neighbors together to share good products."],
  Contact: ["Product chats", "Open a product listing and choose Chat with seller to start a conversation. Sellers can reply from the Buyer chats section of their account."]
};

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = translate(text);
  return element;
}

function bilingual(english) {
  return translate(english);
}

function setBilingualContent(element, text) {
  element.textContent = translate(text);
}

function renderCurrentView() {
  if (currentView === "market") return showMarket();
  if (currentView === "chats") return showChats();
  if (currentView === "chat") return showChat(currentChatId);
  if (currentView === "signin") return showSignIn(currentSignupType);
  if (currentView === "about") return showPage("About");
  if (currentView === "contact") return showPage("Contact");
  showAccount(currentSignupType);
}

function updateLanguageChrome() {
  document.querySelector("#language-label").textContent = translate("Language:");
  document.querySelector("#language-select").setAttribute("aria-label", translate("Choose language"));
  document.querySelector(".site-header p").textContent = translate("Good things, grown and made close to home.");
  document.querySelector("#navigation-label").textContent = translate("Explore:");
  const navOptions = { Home: "Market", About: "About", Contact: "Contact", Chats: "Chats" };
  [...navigation.options].forEach((option) => {
    option.textContent = translate(navOptions[option.value] || option.textContent);
  });
  document.querySelector("#account-navigation").textContent = translate(currentAccount || currentBuyer ? "My account" : "Create an account");
  document.documentElement.lang = currentLanguage === "tl" ? "fil" : currentLanguage;
}

function createPasswordField(input) {
  const wrapper = makeElement("div", "password-field");
  const toggle = makeElement("button", "password-toggle", bilingual("Show", "Ipakita"));
  toggle.type = "button";
  toggle.setAttribute("aria-label", bilingual("Show password", "Ipakita ang password"));
  toggle.setAttribute("aria-pressed", "false");
  toggle.addEventListener("click", () => {
    const isVisible = input.type === "text";
    input.type = isVisible ? "password" : "text";
    toggle.setAttribute("aria-pressed", String(!isVisible));
    setBilingualContent(toggle, isVisible ? bilingual("Show", "Ipakita") : bilingual("Hide", "Itago"));
    toggle.setAttribute("aria-label", isVisible
      ? bilingual("Show password", "Ipakita ang password")
      : bilingual("Hide password", "Itago ang password"));
  });
  wrapper.append(input, toggle);
  return wrapper;
}

function renderProducts(container, items) {
  if (!items.length) {
    container.append(makeElement("p", "empty-state", "No products here yet."));
    return;
  }

  items.forEach((product) => {
    const card = makeElement("article", "product-card");
    const visual = makeElement("div", "product-visual");
    visual.setAttribute("aria-hidden", "true");
    if (product.imageUrl) {
      const image = makeElement("img", "product-image");
      image.src = product.imageUrl;
      image.alt = product.name;
      visual.append(image);
    } else {
      visual.textContent = product.emoji || "🛍️";
    }

    const details = makeElement("div", "product-details");
    details.append(makeElement("span", "product-category", product.category));
    details.append(makeElement("h3", "product-name", product.name));
    details.append(makeElement("p", "product-description", product.description));
    details.append(makeElement("p", "product-seller", `${translate("Seller:")} ${product.seller || translate("Local seller")} · ${translate("Product posted by seller")}`));
    const chatButton = makeElement("button", "contact-button", "Chat with seller");
    chatButton.type = "button";
    chatButton.addEventListener("click", () => startChat(product));
    details.append(chatButton);
    const bottomRow = makeElement("div", "product-bottom");
    bottomRow.append(makeElement("strong", "product-price", `₱${Number(product.price).toFixed(2)}`));
    const isOwnProduct = currentAccount && currentAccount.email === product.ownerEmail;
    const interestButton = makeElement("button", "interest-button", isOwnProduct ? "Your product" : "I'm interested");
    interestButton.type = "button";
    interestButton.disabled = Boolean(isOwnProduct);
    if (!isOwnProduct) interestButton.addEventListener("click", () => startChat(product));
    bottomRow.append(interestButton);
    details.append(bottomRow);
    card.append(visual, details);
    container.append(card);
  });
}

function showMarket() {
  currentView = "market";
  currentSignupType = null;
  pageContent.replaceChildren();
  const intro = makeElement("section", "market-intro");
  intro.append(makeElement("p", "eyebrow", "SHOP LOCAL · EAT WELL"));
  intro.append(makeElement("h2", "", "A little goodness from nearby"));
  intro.append(makeElement("p", "intro-copy", "Discover fresh food, garden vegetables, quality meat, flavorful spices, and tasty snacks from local sellers."));
  pageContent.append(intro);

  const categorySection = makeElement("section", "category-section");
  categorySection.setAttribute("aria-label", "Product categories");
  categorySection.append(makeElement("h2", "section-title", "Browse categories"));
  const categoryList = makeElement("div", "category-list");
  categories.forEach((category) => {
    const button = makeElement("button", "category-button", category);
    button.type = "button";
    button.setAttribute("aria-pressed", String(activeCategory === category));
    if (activeCategory === category) button.classList.add("is-active");
    button.addEventListener("click", () => {
      activeCategory = category;
      showMarket();
    });
    categoryList.append(button);
  });
  categorySection.append(categoryList);
  const priceLabel = makeElement("label", "price-filter-label", "Filter by price:");
  const priceSelect = makeElement("select", "form-input price-filter");
  priceSelect.setAttribute("aria-label", "Filter products by price in pesos");
  priceRanges.forEach((range) => {
    const option = new Option(translate(range.label), range.value);
    option.selected = activePriceRange === range.value;
    priceSelect.add(option);
  });
  priceSelect.addEventListener("change", () => {
    activePriceRange = priceSelect.value;
    showMarket();
  });
  categorySection.append(priceLabel, priceSelect);
  pageContent.append(categorySection);

  const listingSection = makeElement("section", "listing-section");
  listingSection.append(makeElement("h2", "section-title", activeCategory === "All products" ? "Marketplace products" : activeCategory));
  const productGrid = makeElement("div", "product-grid");
  const selectedRange = priceRanges.find((range) => range.value === activePriceRange) || priceRanges[0];
  const matchingProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "All products" || product.category === activeCategory;
    const price = Number(product.price);
    return matchesCategory && price >= selectedRange.min && price < selectedRange.max;
  });
  renderProducts(productGrid, matchingProducts);
  listingSection.append(productGrid);
  pageContent.append(listingSection);
}

function startChat(product) {
  if (!currentBuyer && currentAccount && currentAccount.email !== product.ownerEmail) {
    currentBuyer = { name: currentAccount.name, email: currentAccount.email };
  }
  if (!currentBuyer) {
    pendingChatProduct = product;
    showAccount();
    return;
  }

  const conversation = {
    id: `${Date.now()}-${Math.random()}`,
    productName: product.name,
    seller: product.seller || "Local seller",
    sellerEmail: product.ownerEmail,
    buyerName: currentBuyer.name,
    buyerEmail: currentBuyer.email,
    messages: [],
    unreadBySeller: 0
  };
  conversations.unshift(conversation);
  showChat(conversation.id);
}

function showChat(conversationId) {
  currentView = "chat";
  const conversation = conversations.find((item) => item.id === conversationId);
  if (!conversation) return;
  currentChatId = conversationId;
  const isSeller = currentAccount && currentAccount.email === conversation.sellerEmail;
  if (!isSeller && !currentBuyer) {
    showAccount();
    return;
  }
  if (isSeller) conversation.unreadBySeller = 0;
  pageContent.replaceChildren();
  const section = makeElement("section", "seller-section chat-section");
  const backButton = makeElement("button", "cancel-button", isSeller ? "Back to account" : "Back to chats");
  backButton.type = "button";
  backButton.addEventListener("click", () => isSeller ? showAccount() : showChats());
  section.append(backButton);
  section.append(makeElement("p", "eyebrow", "PRODUCT CHAT"));
  section.append(makeElement("h2", "", conversation.productName));
  section.append(makeElement("p", "seller-copy", `${translate("Chat with")} ${isSeller ? conversation.buyerName || "buyer" : conversation.seller}`));

  const messages = makeElement("div", "chat-messages");
  if (!conversation.messages.length) {
    messages.append(makeElement("p", "empty-state", "Start the conversation about this product."));
  } else {
    conversation.messages.forEach((message) => {
      const item = makeElement("article", "chat-message");
      item.append(makeElement("strong", "", message.name));
      item.append(makeElement("p", "", message.text));
      messages.append(item);
    });
  }
  section.append(messages);

  const form = makeElement("form", "product-form chat-form");
  const messageInput = makeElement("textarea", "form-input description-input");
  messageInput.placeholder = translate("Write a message...");
  messageInput.setAttribute("aria-label", translate("Chat message"));
  messageInput.required = true;
  const sendButton = makeElement("button", "post-button", "Send message");
  sendButton.type = "submit";
  form.append(messageInput, sendButton);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = isSeller ? currentAccount.name : currentBuyer.name;
    if (!isSeller) {
      conversation.buyerName = currentBuyer.name;
      conversation.unreadBySeller += 1;
    }
    conversation.messages.push({ name, text: messageInput.value.trim() });
    showChat(conversationId);
  });
  section.append(form);
  pageContent.append(section);
}

function showChats() {
  currentView = "chats";
  if (!currentBuyer) {
    showAccount();
    return;
  }

  pageContent.replaceChildren();
  const section = makeElement("section", "seller-section account-section");
  section.append(makeElement("p", "eyebrow", "BUYER ACCOUNT"));
  section.append(makeElement("h2", "", "Your chats"));
  section.append(makeElement("p", "seller-copy", "Continue a conversation with a local seller."));

  const buyerChats = conversations.filter((conversation) => conversation.buyerEmail === currentBuyer.email);
  if (!buyerChats.length) {
    section.append(makeElement("p", "empty-state", "You haven’t started any chats yet. Browse the market and choose Chat with seller on a product."));
  } else {
    buyerChats.forEach((conversation) => {
      const messageCount = conversation.messages.length;
      const chatLink = makeElement("button", "chat-link", `${conversation.productName} · ${conversation.seller} (${messageCount} message${messageCount === 1 ? "" : "s"})`);
      chatLink.type = "button";
      chatLink.addEventListener("click", () => showChat(conversation.id));
      section.append(chatLink);
    });
  }
  pageContent.append(section);
}

function updateAccountNavigation() {
  const isSignedIn = Boolean(currentAccount || currentBuyer);
  const button = document.querySelector("#account-navigation");
  if (button) setBilingualContent(button, isSignedIn
    ? bilingual("My account", "Aking account")
    : bilingual("Create an account", "Gumawa ng account"));
  pageNavigation.hidden = !isSignedIn;
}

function showSignIn(accountTypeToSwitchTo = null) {
  currentView = "signin";
  currentSignupType = accountTypeToSwitchTo;
  pageContent.replaceChildren();
  const section = makeElement("section", "seller-section account-section entry-account signup-form-view");
  section.append(makeElement("p", "eyebrow", bilingual("WELCOME BACK", "MALIGAYANG PAGBABALIK")));
  section.append(makeElement("h2", "", bilingual("Sign in to your account", "Mag-sign in sa iyong account")));
  section.append(makeElement("p", "seller-copy", bilingual("Choose your account type and enter the email and password you used when signing up.", "Piliin ang uri ng account at ilagay ang email at password na ginamit mo sa pag-sign up.")));

  const form = makeElement("form", "product-form");
  const accountType = makeElement("select", "form-input");
  accountType.setAttribute("aria-label", bilingual("Account type", "Uri ng account"));
  accountType.add(new Option(translate("Buyer account"), "buyer"));
  accountType.add(new Option(translate("Seller account"), "seller"));
  if (accountTypeToSwitchTo) accountType.value = accountTypeToSwitchTo;
  const emailInput = makeElement("input", "form-input");
  emailInput.type = "email";
  emailInput.placeholder = translate("Email address");
  emailInput.autocomplete = "email";
  emailInput.required = true;
  const passwordInput = makeElement("input", "form-input");
  passwordInput.type = "password";
  passwordInput.placeholder = translate("Password");
  passwordInput.autocomplete = "current-password";
  passwordInput.required = true;
  const passwordField = createPasswordField(passwordInput);
  const message = makeElement("p", "account-note");
  message.hidden = true;
  const signInButton = makeElement("button", "post-button", bilingual("Sign in", "Mag-sign in"));
  signInButton.type = "submit";
  form.append(accountType, emailInput, passwordField, message, signInButton);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const account = registeredAccounts.find((item) =>
      item.type === accountType.value &&
      item.email.toLowerCase() === emailInput.value.trim().toLowerCase() &&
      item.password === passwordInput.value
    );
    if (!account) {
      message.textContent = translate("No matching account found. Check your account type, email, and password.");
      message.hidden = false;
      return;
    }

    message.hidden = true;
    if (account.type === "seller") {
      currentAccount = account;
    } else {
      currentBuyer = account;
    }
    updateAccountNavigation();
    if (pendingChatProduct && account.type === "buyer") {
      const product = pendingChatProduct;
      pendingChatProduct = null;
      startChat(product);
    } else {
      showMarket();
    }
  });
  const backButton = makeElement("button", "cancel-button signup-back", bilingual("← Back to account options", "← Bumalik sa pagpili ng account"));
  backButton.type = "button";
  backButton.addEventListener("click", () => showAccount());
  section.append(form, backButton);
  pageContent.append(section);
}

function hasBuyerAndSellerAccounts() {
  return registeredAccounts.some((account) => account.type === "buyer") &&
    registeredAccounts.some((account) => account.type === "seller");
}

function showAccount(signupType = null) {
  currentView = "account";
  currentSignupType = signupType;
  updateAccountNavigation();
  pageContent.replaceChildren();
  const section = makeElement("section", "seller-section account-section");

  if (currentBuyer) {
    section.append(makeElement("p", "eyebrow", "BUYER ACCOUNT"));
    section.append(makeElement("h2", "", `${translate("Welcome")}, ${currentBuyer.name}`));
    section.append(makeElement("p", "seller-copy", currentBuyer.email));
    if (hasBuyerAndSellerAccounts()) {
      const switchAccountButton = makeElement("button", "cancel-button", bilingual("Switch account", "Magpalit ng account"));
      switchAccountButton.type = "button";
      switchAccountButton.addEventListener("click", () => {
        currentBuyer = null;
        currentAccount = null;
        updateAccountNavigation();
        showSignIn("seller");
      });
      section.append(switchAccountButton);
    }
    const signOut = makeElement("button", "cancel-button", "Sign out");
    signOut.type = "button";
    signOut.addEventListener("click", () => {
      currentBuyer = null;
      showAccount();
    });
    section.append(signOut);
    section.append(makeElement("p", "account-note", "Never share payment details or send money before confirming a seller and product."));
    pageContent.append(section);
    return;
  }

  if (!currentAccount) {
    section.classList.add("entry-account");
    section.append(makeElement("p", "eyebrow", bilingual("JOIN YOUR LOCAL MARKET", "SUMALI SA LOKAL NA PAMILIHAN")));
    section.append(makeElement("h2", "", bilingual("Create an account", "Gumawa ng account")));
    section.append(makeElement("p", "seller-copy", bilingual("Choose a buyer account to chat with sellers, or a seller account to post products.", "Pumili ng buyer account para makipag-chat sa mga seller, o seller account para makapag-post ng mga produkto.")));
    section.append(makeElement("h3", "section-title account-products-title", bilingual("Create a seller account", "Gumawa ng seller account")));

    const accountForm = makeElement("form", "product-form");
    let profilePhotoUrl = null;
    const profileLabel = makeElement("label", "upload-button", bilingual("+ Add a logo or profile photo", "+ Magdagdag ng logo o larawan sa profile"));
    profileLabel.htmlFor = "account-profile-picture";
    const profileInput = makeElement("input", "visually-hidden");
    profileInput.id = "account-profile-picture";
    profileInput.type = "file";
    profileInput.accept = "image/*";
    profileInput.required = true;
    profileInput.setAttribute("aria-label", bilingual("Upload a logo or profile photo", "Mag-upload ng logo o larawan sa profile"));
    const profilePreview = makeElement("img", "upload-preview");
    profilePreview.alt = bilingual("Preview of your logo or profile photo", "Preview ng logo o larawan sa profile");
    profilePreview.hidden = true;
    profileInput.addEventListener("change", () => {
      const file = profileInput.files[0];
      if (!file) return;
      if (profilePhotoUrl) URL.revokeObjectURL(profilePhotoUrl);
      profilePhotoUrl = URL.createObjectURL(file);
      profilePreview.src = profilePhotoUrl;
      profilePreview.hidden = false;
    });
    const nameInput = makeElement("input", "form-input");
    nameInput.type = "text";
    nameInput.placeholder = translate("Your name or business name");
    nameInput.setAttribute("aria-label", bilingual("Your name or business name", "Pangalan mo o pangalan ng negosyo"));
    nameInput.autocomplete = "name";
    nameInput.required = true;
    const emailInput = makeElement("input", "form-input");
    emailInput.type = "email";
    emailInput.placeholder = translate("Your email address");
    emailInput.setAttribute("aria-label", bilingual("Your email address", "Email address mo"));
    emailInput.autocomplete = "email";
    emailInput.required = true;
    const passwordInput = makeElement("input", "form-input");
    passwordInput.type = "password";
    passwordInput.placeholder = translate("Create a password (at least 6 characters)");
    passwordInput.setAttribute("aria-label", bilingual("Create a password with at least 6 characters", "Gumawa ng password na may hindi bababa sa 6 na character"));
    passwordInput.autocomplete = "new-password";
    passwordInput.minLength = 6;
    passwordInput.required = true;
    const passwordField = createPasswordField(passwordInput);
    const createButton = makeElement("button", "post-button", bilingual("Create seller account", "Gumawa ng seller account"));
    createButton.type = "submit";
    accountForm.append(profileLabel, profileInput, profilePreview, nameInput, emailInput, passwordField, createButton);
    accountForm.addEventListener("submit", (event) => {
      event.preventDefault();
      currentAccount = {
        type: "seller",
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value,
        profileImageUrl: profilePhotoUrl
      };
      registeredAccounts.push(currentAccount);
      updateAccountNavigation();
      showMarket();
    });
    section.append(accountForm);


    section.append(makeElement("h3", "section-title account-products-title", bilingual("Create a buyer account", "Gumawa ng buyer account")));
    section.append(makeElement("p", "seller-copy", bilingual("Create an account to start chatting with a seller.", "Gumawa ng account para makapagsimula ng chat sa isang seller.")));
    const buyerForm = makeElement("form", "product-form");
    const buyerNameInput = makeElement("input", "form-input");
    buyerNameInput.type = "text";
    buyerNameInput.placeholder = translate("Your name");
    buyerNameInput.setAttribute("aria-label", bilingual("Buyer name", "Pangalan ng buyer"));
    buyerNameInput.autocomplete = "name";
    buyerNameInput.required = true;
    const buyerEmailInput = makeElement("input", "form-input");
    buyerEmailInput.type = "email";
    buyerEmailInput.placeholder = translate("Your email address");
    buyerEmailInput.setAttribute("aria-label", bilingual("Buyer email address", "Email address ng buyer"));
    buyerEmailInput.autocomplete = "email";
    buyerEmailInput.required = true;
    const buyerPasswordInput = makeElement("input", "form-input");
    buyerPasswordInput.type = "password";
    buyerPasswordInput.placeholder = translate("Create a password (at least 6 characters)");
    buyerPasswordInput.setAttribute("aria-label", bilingual("Create a password for your buyer account with at least 6 characters", "Gumawa ng password para sa buyer account na may hindi bababa sa 6 na character"));
    buyerPasswordInput.autocomplete = "new-password";
    buyerPasswordInput.minLength = 6;
    buyerPasswordInput.required = true;
    const buyerPasswordField = createPasswordField(buyerPasswordInput);
    const buyerCreateButton = makeElement("button", "post-button", bilingual("Create buyer account", "Gumawa ng buyer account"));
    buyerCreateButton.type = "submit";
    buyerForm.append(buyerNameInput, buyerEmailInput, buyerPasswordField, buyerCreateButton);
    buyerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      currentBuyer = {
        type: "buyer",
        name: buyerNameInput.value.trim(),
        email: buyerEmailInput.value.trim(),
        password: buyerPasswordInput.value
      };
      registeredAccounts.push(currentBuyer);
      updateAccountNavigation();
      if (pendingChatProduct) {
        const product = pendingChatProduct;
        pendingChatProduct = null;
        startChat(product);
      } else {
        showMarket();
      }
    });
    section.append(buyerForm);

    const signupContent = [...section.children];
    if (!signupType) {
      section.classList.add("account-type-view");
      section.replaceChildren(
        signupContent[0],
        signupContent[1],
        signupContent[2]
      );
      const accountOptions = makeElement("div", "account-type-options");
      [
        ["buyer", bilingual("Create a buyer account", "Gumawa ng account bilang mamimili"), bilingual("Browse local products and chat with sellers.", "Mag-browse ng mga lokal na produkto at makipag-chat sa mga seller.")],
        ["seller", bilingual("Create a seller account", "Gumawa ng account bilang nagtitinda"), bilingual("Create a seller profile and share your products.", "Gumawa ng seller profile at ibahagi ang iyong mga produkto.")]
      ].forEach(([type, title, description]) => {
        const option = makeElement("button", "account-type-card");
        option.type = "button";
        option.append(makeElement("strong", "", title), makeElement("span", "", description));
        option.addEventListener("click", () => showAccount(type));
        accountOptions.append(option);
      });
      section.append(accountOptions);
    } else {
      section.classList.add("signup-form-view");
      const backButton = makeElement("button", "cancel-button signup-back", bilingual("← Choose account type", "← Pumili ng uri ng account"));
      backButton.type = "button";
      backButton.addEventListener("click", () => showAccount());
      const selectedContent = signupType === "seller"
        ? [signupContent[0], signupContent[1], signupContent[2], ...signupContent.slice(3, 6)]
        : [signupContent[0], signupContent[1], signupContent[2], ...signupContent.slice(6, 9)];
      section.replaceChildren(backButton, ...selectedContent);
      setBilingualContent(section.querySelector("h2"), signupType === "seller"
        ? bilingual("Create a seller account", "Gumawa ng seller account")
        : bilingual("Create a buyer account", "Gumawa ng buyer account"));
    }
    const signInLink = makeElement("button", "cancel-button signup-back", bilingual("Already have an account? Sign in", "May account ka na ba? Mag-sign in"));
    signInLink.type = "button";
    signInLink.addEventListener("click", showSignIn);
    section.append(signInLink);
  } else {
    const profileImage = makeElement("img", "account-profile-image");
    profileImage.src = currentAccount.profileImageUrl;
    profileImage.alt = `${currentAccount.name}'s brand logo or profile picture`;
    section.append(profileImage);
    section.append(makeElement("p", "eyebrow", "SELLER ACCOUNT"));
    section.append(makeElement("h2", "", `${translate("Welcome")}, ${currentAccount.name}`));
    section.append(makeElement("p", "seller-copy", currentAccount.email));
    if (hasBuyerAndSellerAccounts()) {
      const switchAccountButton = makeElement("button", "cancel-button", bilingual("Switch account", "Magpalit ng account"));
      switchAccountButton.type = "button";
      switchAccountButton.addEventListener("click", () => {
        currentBuyer = null;
        currentAccount = null;
        updateAccountNavigation();
        showSignIn("buyer");
      });
      section.append(switchAccountButton);
    }
    const signOut = makeElement("button", "cancel-button", "Sign out");
    signOut.type = "button";
    signOut.addEventListener("click", () => {
      if (pendingPhotoUrl) URL.revokeObjectURL(pendingPhotoUrl);
      pendingPhotoUrl = null;
      currentAccount = null;
      showAccount();
    });
    section.append(signOut);

    const sellerChats = conversations.filter((conversation) => conversation.sellerEmail === currentAccount.email);
    const unreadCount = sellerChats.reduce((total, conversation) => total + conversation.unreadBySeller, 0);
    section.append(makeElement("h3", "section-title account-products-title", `Buyer chats${unreadCount ? ` · ${unreadCount} new` : ""}`));
    if (!sellerChats.length) {
      section.append(makeElement("p", "empty-state", "No buyer messages yet. Chats about your products will appear here."));
    } else {
      sellerChats.forEach((conversation) => {
        const status = conversation.unreadBySeller
          ? `${conversation.unreadBySeller} new message${conversation.unreadBySeller === 1 ? "" : "s"}`
          : `${conversation.messages.length} messages`;
        const chatLink = makeElement("button", "chat-link", `${conversation.productName} · ${conversation.buyerName || "New buyer"} (${status})`);
        chatLink.type = "button";
        chatLink.addEventListener("click", () => showChat(conversation.id));
        section.append(chatLink);
      });
    }

    section.append(makeElement("h3", "section-title account-products-title", "Your products"));
    const ownedProducts = products.filter((product) => product.ownerEmail === currentAccount.email);
    const ownGrid = makeElement("div", "product-grid");
    renderProducts(ownGrid, ownedProducts);
    section.append(ownGrid);

    section.append(makeElement("h3", "section-title account-products-title", "Post a product"));
    section.append(makeElement("p", "seller-copy", "Add a product photo and details. You will confirm before it appears in the marketplace."));
    const form = makeElement("form", "product-form");
    const uploadLabel = makeElement("label", "upload-button", "+ Upload product picture");
    uploadLabel.htmlFor = "account-product-upload";
    const uploadInput = makeElement("input", "visually-hidden");
    uploadInput.id = "account-product-upload";
    uploadInput.type = "file";
    uploadInput.accept = "image/*";
    uploadInput.setAttribute("aria-label", "Choose a product picture");
    const preview = makeElement("img", "upload-preview");
    preview.alt = "Preview of your product";
    preview.hidden = !pendingPhotoUrl;
    if (pendingPhotoUrl) preview.src = pendingPhotoUrl;

    const nameInput = makeElement("input", "form-input");
    nameInput.type = "text";
    nameInput.placeholder = translate("Product name");
    nameInput.setAttribute("aria-label", "Product name");
    nameInput.required = true;
    const formRow = makeElement("div", "form-row");
    const categorySelect = makeElement("select", "form-input");
    categorySelect.setAttribute("aria-label", "Product category");
    categorySelect.required = true;
    categorySelect.add(new Option(translate("Choose a category"), ""));
    categories.slice(1).forEach((category) => categorySelect.add(new Option(translate(category), category)));
    const priceInput = makeElement("input", "form-input");
    priceInput.type = "number";
    priceInput.min = "10";
    priceInput.step = "0.01";
    priceInput.placeholder = translate("Price (₱)");
    priceInput.setAttribute("aria-label", "Price in pesos");
    priceInput.required = true;
    formRow.append(categorySelect, priceInput);
    const descriptionInput = makeElement("textarea", "form-input description-input");
    descriptionInput.placeholder = translate("Tell shoppers about your product...");
    descriptionInput.setAttribute("aria-label", "Product description");
    descriptionInput.required = true;
    const submitButton = makeElement("button", "post-button", "Post product to market");
    submitButton.type = "submit";
    const cancelButton = makeElement("button", "cancel-button", "Cancel photo");
    cancelButton.type = "button";
    cancelButton.hidden = !pendingPhotoUrl;
    form.append(uploadLabel, uploadInput, preview, nameInput, formRow, descriptionInput, submitButton, cancelButton);

    uploadInput.addEventListener("change", () => {
      const file = uploadInput.files[0];
      if (!file) return;
      if (pendingPhotoUrl) URL.revokeObjectURL(pendingPhotoUrl);
      pendingPhotoUrl = URL.createObjectURL(file);
      preview.src = pendingPhotoUrl;
      preview.hidden = false;
      cancelButton.hidden = false;
    });
    cancelButton.addEventListener("click", () => {
      if (pendingPhotoUrl) URL.revokeObjectURL(pendingPhotoUrl);
      pendingPhotoUrl = null;
      showAccount();
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!pendingPhotoUrl) {
        uploadInput.setCustomValidity("Please upload a product picture first.");
        uploadInput.reportValidity();
        uploadInput.setCustomValidity("");
        return;
      }
      const price = Number(priceInput.value);
      const confirmed = window.confirm(`Post “${nameInput.value.trim()}” for ₱${price.toFixed(2)} in ${categorySelect.value}?`);
      if (!confirmed) return;
      products.unshift({
        name: nameInput.value.trim(),
        category: categorySelect.value,
        price: priceInput.value,
        description: descriptionInput.value.trim(),
        imageUrl: pendingPhotoUrl,
        seller: currentAccount.name,
        ownerEmail: currentAccount.email
      });
      pendingPhotoUrl = null;
      activeCategory = "All products";
      showAccount();
    });
    section.append(form);
  }
  pageContent.append(section);
}

function showPage(page) {
  currentView = page === "Home" ? "market" : page === "Chats" ? "chats" : page === "Contact" ? "contact" : page === "About" ? "about" : "account";
  if (!currentAccount && !currentBuyer) {
    showAccount();
    return;
  }
  if (page === "Home") {
    showMarket();
    return;
  }
  if (page === "Account") {
    showAccount();
    return;
  }
  if (page === "Chats") {
    showChats();
    return;
  }
  const [heading, message] = pageMessages[page] || pageMessages.About;
  pageContent.replaceChildren(makeElement("h2", "", heading), makeElement("p", "", message));
}

const languageSelect = document.querySelector("#language-select");
try {
  const savedLanguage = localStorage.getItem("fresh-market-language");
  if (["en", "tl", "ceb"].includes(savedLanguage)) currentLanguage = savedLanguage;
} catch {
  // Language selection still works when browser storage is unavailable.
}
languageSelect.value = currentLanguage;
updateLanguageChrome();
updateMarketBackground();
window.addEventListener("resize", updateMarketBackground);
showAccount();
languageSelect.addEventListener("change", () => {
  currentLanguage = languageSelect.value;
  try {
    localStorage.setItem("fresh-market-language", currentLanguage);
  } catch {
    // Keep the choice for this page session.
  }
  updateLanguageChrome();
  renderCurrentView();
});
navigation.addEventListener("change", () => showPage(navigation.value));
document.querySelector("#account-navigation").addEventListener("click", showAccount);
