let produtos;

function carregarJSON(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'products.json', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            produtos = JSON.parse(xobj.responseText);
            callback();
        }
    };
    xobj.send(null);
}

function init() {
    carregarJSON(function () {
        const productContainer = document.querySelector('#product-container');
        productContainer.innerHTML = '';

        produtos.forEach(product => {
            const card = createProductCard(product);
            productContainer.appendChild(card);
        });
    });
}

document.addEventListener("DOMContentLoaded", init);

// Product Cards
function createProductCard(product) {
    const card = document.createElement('div');
    card.classList.add('product-card');
    const details = document.createElement('div');
    details.classList.add('product-details');

    const viewButton = document.createElement('button');
    const icon = document.createElement('i');
    icon.classList.add('bi', 'bi-three-dots');
    viewButton.classList.add('btn-view');
    viewButton.appendChild(icon);
    viewButton.addEventListener('click', () => openSlideShow(product));
    details.appendChild(viewButton);

    const image = document.createElement('div');
    image.classList.add('imageProduct')
    image.style.backgroundImage = "url(" + product.image + ")";
    image.style.backgroundSize = "cover";
    image.style.backgroundPosition = "center";
    details.appendChild(image);

    const title = document.createElement('div');
    title.classList.add('product-title');
    title.textContent = product.name;
    details.appendChild(title);

    const category = document.createElement('div');
    category.classList.add('product-category');
    details.appendChild(category);

    const brand = document.createElement('div');
    brand.classList.add('product-brand');
    brand.textContent = `${product.brand}`;
    details.appendChild(brand);

    const price = document.createElement('div');
    price.classList.add('product-price');
    price.textContent = `R$ ${product.price.toFixed(2)}`;
    details.appendChild(price);

    const addToCartButton = document.createElement('button');
    const iconAdd = document.createElement('i');
    iconAdd.classList.add('bi', 'bi-cart-plus-fill');
    addToCartButton.appendChild(iconAdd);
    addToCartButton.classList.add('btn-addCart');
    addToCartButton.addEventListener('click', () => addToCart(product));
    details.appendChild(addToCartButton);

    card.appendChild(details);

    return card;
}

// Slide
function openSlideShow(product) {
    const slideShowContainer = document.createElement('div');
    slideShowContainer.classList.add('slide-show-container');

    const mainContentContainer = document.createElement('div');
    mainContentContainer.classList.add('main-content-container');

    const buttonImageContainer = document.createElement('div');
    buttonImageContainer.classList.add('button-image-container');

    const prevButton = createButton('prev', '<i class="bi bi-caret-left-fill"></i>', () => showSlide(-1));
    const slideShow = document.createElement('div');
    slideShow.classList.add('slide-show');
    const nextButton = createButton('next', '<i class="bi bi-caret-right-fill"></i>', () => showSlide(1));

    buttonImageContainer.appendChild(prevButton);
    buttonImageContainer.appendChild(slideShow);
    buttonImageContainer.appendChild(nextButton);

    const closeButton = createButton('close-slide', '<i class="bi bi-x-lg"></i>', () => {
        document.body.removeChild(slideShowContainer);
        document.body.classList.remove('no-scroll');
    });

    const additionalInfo = document.createElement('div');
    additionalInfo.classList.add('additional-info');
    additionalInfo.innerHTML = `
        <h2 class="name-description">${product.name}</h2>
        <br>
        <p>${product.description}</p>
        <h2 class="price-description">Preço: R$ ${product.price.toFixed(2)}</h2>
    `;

    mainContentContainer.appendChild(buttonImageContainer);
    mainContentContainer.appendChild(closeButton);
    mainContentContainer.appendChild(additionalInfo);

    slideShowContainer.appendChild(mainContentContainer);
    document.body.appendChild(slideShowContainer);

    displaySlide(product);
    document.body.classList.add('no-scroll');

    function createButton(className, innerHTML, clickHandler) {
        const button = document.createElement('button');
        button.classList.add(className, 'btn-slide');
        button.innerHTML = innerHTML;
        button.addEventListener('click', clickHandler);
        return button;
    }

    function displaySlide(product) {
        const images = product.slide && product.slide.length >= 4 ? product.slide.slice(0, 4) : [];
        let slideImages = '';
        images.forEach((imageSrc, index) => {
            slideImages += `<img src="${imageSrc}" class="slide-image" style="border-radius: 10px; display: ${index === 0 ? 'block' : 'none'};">`;
        });
        slideShow.innerHTML = slideImages;
    }

    function showSlide(n) {
        const images = product.slide && product.slide.length >= 4 ? product.slide.slice(0, 4) : [];
        let currentIndex = images.findIndex(image => slideShow.querySelector(`[src="${image}"]`).style.display === 'block');
        currentIndex = (currentIndex + n + images.length) % images.length;
        const slides = slideShow.querySelectorAll('img');
        slides.forEach((slide, index) => {
            slide.style.display = index === currentIndex ? 'block' : 'none';
        });
    }
}

// Search
function searchProducts() {
    const searchInput = removerAcentos(document.querySelector('#searchInput').value.trim().toLowerCase().replace(/\s+/g, ''));

    const filteredProducts = produtos.filter(product => {
        const nameMatch = removerAcentos(product.name.toLowerCase().replace(/\s+/g, '')).includes(searchInput);
        const categoryMatch = removerAcentos(product.category.toLowerCase().replace(/\s+/g, '')).includes(searchInput);
        const brandMatch = removerAcentos(product.brand.toLowerCase().replace(/\s+/g, '')).includes(searchInput);

        const brandCategoryMatch = removerAcentos((product.brand + product.category).toLowerCase().replace(/\s+/g, '')).includes(searchInput);
        const categoryBrandMatch = removerAcentos((product.category + product.brand).toLowerCase().replace(/\s+/g, '')).includes(searchInput);
        const categoryBrand = removerAcentos((product.category + "da" + product.brand).toLowerCase().replace(/\s+/g, '')).includes(searchInput);

        const brandPartialMatch = removerAcentos(product.brand.toLowerCase().replace(/\s+/g, '')).indexOf(searchInput) !== -1;
        const categoryPartialMatch = removerAcentos(product.category.toLowerCase().replace(/\s+/g, '')).indexOf(searchInput) !== -1;

        return nameMatch || categoryMatch || brandMatch || brandCategoryMatch || categoryBrandMatch || categoryBrand || brandPartialMatch || categoryPartialMatch;
    });

    const productContainer = document.querySelector('#product-container');
    productContainer.innerHTML = '';

    if (filteredProducts.length === 0) {
        const noProductMessage = document.createElement('p');
        noProductMessage.textContent = 'Nenhum produto encontrado.';
        productContainer.appendChild(noProductMessage);
    } else {
        filteredProducts.forEach(product => {
            const card = createProductCard(product);
            productContainer.appendChild(card);
        });
    }
}

function removerAcentos(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const searchInput = document.querySelector('#searchInput');

searchInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchProducts();
    }
});

// Cart
let cartItems = [];

const countCart = document.querySelector('#cart-count');
const count = cartItems.length;
countCart.textContent = count;

function updateCart() {
    const cartContainer = document.querySelector('#cart-container');
    const cartItemsContainer = document.querySelector('#cart-items');
    const totalPriceContainer = document.querySelector('#total-price');
    const confirmOrderButton = document.querySelector('#confirmOrderButton');
    const clearCartButton = document.querySelector('#clearCartButton');

    cartItemsContainer.innerHTML = '';

    if (cartItems.length === 0) {
        const emptyCartMessage = document.createElement('p');
        emptyCartMessage.textContent = 'O carrinho está vazio.';
        cartItemsContainer.appendChild(emptyCartMessage);
        emptyCartMessage.classList.add('emptyCart');
        totalPriceContainer.textContent = 'Total: R$ 0.00';
        totalPriceContainer.classList.add('priceCart');
        confirmOrderButton.style.display = 'none';
        clearCartButton.style.display = 'none';
    } else {
        cartItems.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');

            const image = document.createElement('img');
            image.src = item.image;
            cartItem.appendChild(image);

            const itemName = document.createElement('div');
            itemName.textContent = item.name;
            cartItem.appendChild(itemName);

            const itemPrice = document.createElement('div');
            itemPrice.textContent = `R$ ${item.price.toFixed(2)}`;
            cartItem.appendChild(itemPrice);

            const removeButton = document.createElement('button');
            removeButton.innerHTML = '<i class="bi bi-trash3-fill"></i>';
            removeButton.classList.add('removeBtn');
            removeButton.addEventListener('click', () => removeFromCart(index));
            cartItem.appendChild(removeButton);

            cartItemsContainer.appendChild(cartItem);
        });
        const totalPrice = cartItems.reduce((total, item) => total + item.price, 0);
        totalPriceContainer.textContent = `Total: R$ ${totalPrice.toFixed(2)}`;
        confirmOrderButton.style.display = 'block';
        clearCartButton.style.display = 'block';

        const count = cartItems.length;
        countCart.textContent = count;
    }
}

updateCart();

document.addEventListener('DOMContentLoaded', function () {
    const closeCartButton = document.querySelector('#closeCartButton');
    closeCartButton.addEventListener('click', closeCart);
});

function openCart() {
    const cartContainer = document.querySelector('#cart-container');
    cartContainer.classList.add('visible');
}

function closeCart() {
    const cartContainer = document.querySelector('#cart-container');
    cartContainer.classList.remove('visible');
}

function addToCart(product) {
    cartItems.push(product);
    updateCart();

    const confirmationMessage = document.createElement('p');
    confirmationMessage.textContent = `${product.name} foi adicionado ao carrinho.`;
    confirmationMessage.classList.add('confirmation-message');
    const productContainer = document.querySelector('#product-container');
    productContainer.insertAdjacentElement('afterend', confirmationMessage);
    setTimeout(() => {
        confirmationMessage.remove();
    }, 1000);
}

function removeFromCart(index) {
    cartItems.splice(index, 1);
    updateCart();
    const count = cartItems.length;
    countCart.textContent = count;
}

function clearCart() {
    cartItems = [];
    updateCart();
    const count = cartItems.length;
    countCart.textContent = count;
}

// Overlay
function openOrderOverlay() {
    const orderOverlay = document.querySelector('#order-overlay');
    orderOverlay.style.display = 'flex';
    document.body.classList.add('scroll-off');
}

function closeOrderOverlay() {
    const orderOverlay = document.querySelector('#order-overlay');
    orderOverlay.style.display = 'none';
    document.body.classList.remove('scroll-off');
}

function confirmOrder() {
    const fullName = document.querySelector('#fullName').value;
    const documentNumber = document.querySelector('#document').value;
    const location = document.querySelector('#location').value;

    const errorContainer = document.querySelector('#error-container');
    if (!fullName || !documentNumber || !location) {
        errorContainer.innerHTML = '';

        const errorParagraph = document.createElement('p');
        errorParagraph.textContent = 'Por favor, preencha todos os campos!';
        errorContainer.appendChild(errorParagraph);

        setTimeout(() => {
            errorContainer.innerHTML = '';
        }, 1000);

        return;
    }
    errorContainer.innerHTML = '';

    const productsDetails = cartItems.map(item => `id =${item.id} - ${item.name} - R$ ${item.price.toFixed(2)} ||`).join('\n');

    const totalPrice = cartItems.reduce((total, item) => total + item.price, 0);

    const orderMessage = `Novo pedido!\n\nNome: ${fullName}|\nDocumento: ${documentNumber}|\nLocalização: ${location}|\n\nOs produtos pedidos:\n${productsDetails}\n\nTotal: R$ ${totalPrice.toFixed(2)}`;

    const whatsappURL = `https://wa.me/YourNumber?text=${encodeURIComponent(orderMessage)}`;

    window.open(whatsappURL, '_blank');

    cartItems = [];

    updateCart();
    closeCart();

    closeOrderOverlay();

    const count = cartItems.length;
    countCart.textContent = count;
}

// Menu
const btnMenu = document.querySelector('.btn-menu');
const btnMenuMobile = document.querySelector('.btn-menu-mobile');
const btnClose = document.querySelector('.close-menu');
const menu = document.querySelector('.container-menu');

btnMenu.addEventListener('click', () => {
    menu.classList.add('open-menu')
});
btnClose.addEventListener('click', () => {
    menu.classList.remove('open-menu')
});
btnMenuMobile.addEventListener('click', () => {
    menu.classList.add('open-menu')
});

// Dark/Light
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    if(body.className.endsWith('dark-mode')){
        themeToggle.innerHTML = '<i class="bi bi-sun-fill"></i>';
    }
    else{
        themeToggle.innerHTML = '<i class="bi bi-moon-fill"></i>';
    }
});

// Search Mobile
const btnSearchMobile = document.querySelector('.search-btn-mobile');
const containerSearch = document.querySelector('.search-container');

btnSearchMobile.addEventListener('click', () => {
    containerSearch.classList.toggle('close-search');
});

// Slide Home
document.addEventListener("DOMContentLoaded", function() {
  const sliderContainer = document.querySelector('.carousel .slider');
  const dotsContainer = document.querySelector('.carousel .dots-container');
  let currentIndex = 0;
  let dots = [];
  const slides = sliderContainer.querySelectorAll('.slide');

  function createDots() {
    dotsContainer.innerHTML = ''; // Limpa os pontos existentes
    dots = []; // Redefine o array de pontos
    slides.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.classList.add('dot');
      dot.addEventListener('click', () => {
        currentIndex = index;
        updateSlider();
      });
      dots.push(dot);
      dotsContainer.appendChild(dot);
    });
  }

  function updateSlider() {
    slides.forEach((slide, index) => {
      if (index === currentIndex) {
        slide.style.display = 'block';
        dots[index].classList.add('active');
      } else {
        slide.style.display = 'none';
        dots[index].classList.remove('active');
      }
    });
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateSlider();
  }

  fetch('slider.json')
    .then(response => response.json())
    .then(data => {
      slides.forEach((slide, index) => {
        const img = slide.querySelector('img');
        const link = document.createElement('a');
        link.href = data[index].link;
        link.appendChild(img);
        slide.appendChild(link);
        img.src = data[index].img;
        img.alt = 'Slide ' + (index + 1);
      });
      createDots(); // Após carregar os dados, criar os pontos de navegação
      updateSlider(); // Atualizar o slider para exibir o primeiro slide
    })
    .catch(error => console.error('Error fetching slider data:', error));
});

// Loading
document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
      document.getElementById("loadingOverlay").style.display = "none";
    }, 700);
});

