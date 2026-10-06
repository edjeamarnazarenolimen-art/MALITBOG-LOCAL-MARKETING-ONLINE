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

const pageMessages = {
    About: ["About Fresh Market", "We bring local growers, makers, and neighbors together to share good products."],
    Contact: ["Product chats", "Open a product listing and choose Chat with seller to start a conversation. Sellers can reply from the Buyer chats section of their account."]
};

function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) {
        const translationSeparator = text.indexOf(" / ");
        if (translationSeparator >= 0) {
            element.append(document.createTextNode(text.slice(0, translationSeparator)));
            const translation = document.createElement("small");
            translation.className = "account-translation";
            translation.textContent = `(${text.slice(translationSeparator + 3)})`;
            element.append(translation);
        } else {
            element.textContent = text;
        }
    }
    return element;
}

function bilingual(english, tagalog) {
    return `${english} / ${tagalog}`;
}

function setBilingualContent(element, text) {
    const translationSeparator = text.indexOf(" / ");
    if (translationSeparator < 0) {
        element.textContent = text;
        return;
    }
    element.replaceChildren(
        document.createTextNode(text.slice(0, translationSeparator)),
        makeElement("small", "account-translation", `(${text.slice(translationSeparator + 3)})`)
    );
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
        details.append(makeElement("p", "product-seller", `Seller: ${product.seller || "Local seller"} · Product posted by seller`));
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
        const option = new Option(range.label, range.value);
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
    section.append(makeElement("p", "seller-copy", `Chat with ${isSeller ? conversation.buyerName || "buyer" : conversation.seller}`));

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
    messageInput.placeholder = "Write a message...";
    messageInput.setAttribute("aria-label", "Chat message");
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
    pageContent.replaceChildren();
    const section = makeElement("section", "seller-section account-section entry-account signup-form-view");
    section.append(makeElement("p", "eyebrow", bilingual("WELCOME BACK", "MALIGAYANG PAGBABALIK")));
    section.append(makeElement("h2", "", bilingual("Sign in to your account", "Mag-sign in sa iyong account")));
    section.append(makeElement("p", "seller-copy", bilingual("Choose your account type and enter the email and password you used when signing up.", "Piliin ang uri ng account at ilagay ang email at password na ginamit mo sa pag-sign up.")));

    const form = makeElement("form", "product-form");
    const accountType = makeElement("select", "form-input");
    accountType.setAttribute("aria-label", bilingual("Account type", "Uri ng account"));
    accountType.add(new Option("Buyer account (Mamimili)", "buyer"));
    accountType.add(new Option("Seller account (Nagbebenta)", "seller"));
    if (accountTypeToSwitchTo) accountType.value = accountTypeToSwitchTo;
    const emailInput = makeElement("input", "form-input");
    emailInput.type = "email";
    emailInput.placeholder = "Email address (Email address mo)";
    emailInput.autocomplete = "email";
    emailInput.required = true;
    const passwordInput = makeElement("input", "form-input");
    passwordInput.type = "password";
    passwordInput.placeholder = "Password (Password mo)";
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
            message.textContent = "No matching account found. Check your account type, email, and password. (Walang tumugmang account. Suriin ang uri ng account, email, at password.)";
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
    updateAccountNavigation();
    pageContent.replaceChildren();
    const section = makeElement("section", "seller-section account-section");

    if (currentBuyer) {
        section.append(makeElement("p", "eyebrow", "BUYER ACCOUNT"));
        section.append(makeElement("h2", "", `Welcome, ${currentBuyer.name}`));
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
        nameInput.placeholder = "Your name or business name (Pangalan mo o pangalan ng negosyo)";
        nameInput.setAttribute("aria-label", bilingual("Your name or business name", "Pangalan mo o pangalan ng negosyo"));
        nameInput.autocomplete = "name";
        nameInput.required = true;
        const emailInput = makeElement("input", "form-input");
        emailInput.type = "email";
        emailInput.placeholder = "Your email address (Email address mo)";
        emailInput.setAttribute("aria-label", bilingual("Your email address", "Email address mo"));
        emailInput.autocomplete = "email";
        emailInput.required = true;
        const passwordInput = makeElement("input", "form-input");
        passwordInput.type = "password";
        passwordInput.placeholder = "Create a password (at least 6 characters) (Gumawa ng password, hindi bababa sa 6 na character)";
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
        buyerNameInput.placeholder = "Your name (Pangalan mo)";
        buyerNameInput.setAttribute("aria-label", bilingual("Buyer name", "Pangalan ng buyer"));
        buyerNameInput.autocomplete = "name";
        buyerNameInput.required = true;
        const buyerEmailInput = makeElement("input", "form-input");
        buyerEmailInput.type = "email";
        buyerEmailInput.placeholder = "Your email address (Email address mo)";
        buyerEmailInput.setAttribute("aria-label", bilingual("Buyer email address", "Email address ng buyer"));
        buyerEmailInput.autocomplete = "email";
        buyerEmailInput.required = true;
        const buyerPasswordInput = makeElement("input", "form-input");
        buyerPasswordInput.type = "password";
        buyerPasswordInput.placeholder = "Create a password (at least 6 characters) (Gumawa ng password, hindi bababa sa 6 na character)";
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
                ["buyer", bilingual("Shop as a buyer", "Mamili bilang buyer"), bilingual("Browse local products and chat with sellers.", "Mag-browse ng mga lokal na produkto at makipag-chat sa mga seller.")],
                ["seller", bilingual("Sell on Fresh Market", "Magbenta sa Fresh Market"), bilingual("Create a seller profile and share your products.", "Gumawa ng seller profile at ibahagi ang iyong mga produkto.")]
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
        section.append(makeElement("h2", "", `Welcome, ${currentAccount.name}`));
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
        nameInput.placeholder = "Product name";
        nameInput.setAttribute("aria-label", "Product name");
        nameInput.required = true;
        const formRow = makeElement("div", "form-row");
        const categorySelect = makeElement("select", "form-input");
        categorySelect.setAttribute("aria-label", "Product category");
        categorySelect.required = true;
        categorySelect.add(new Option("Choose a category", ""));
        categories.slice(1).forEach((category) => categorySelect.add(new Option(category, category)));
        const priceInput = makeElement("input", "form-input");
        priceInput.type = "number";
        priceInput.min = "10";
        priceInput.step = "0.01";
        priceInput.placeholder = "Price (₱)";
        priceInput.setAttribute("aria-label", "Price in pesos");
        priceInput.required = true;
        formRow.append(categorySelect, priceInput);
        const descriptionInput = makeElement("textarea", "form-input description-input");
        descriptionInput.placeholder = "Tell shoppers about your product...";
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

showAccount();
navigation.addEventListener("change", () => showPage(navigation.value));
document.querySelector("#account-navigation").addEventListener("click", showAccount);
