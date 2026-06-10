/* ==========================================================================
   PADARIA LAMIM - Cliente App Logic (Layout inspired by Recanto Formoso)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  let cart = [];
  let products = [];
  let searchQuery = '';
  let deliveryMethod = 'retirada'; // Default to pickup
  let deliveryFee = 4.00;
  let maxItemsLimit = 10;
  let whatsappSupportNumber = '5512997531707'; // default WhatsApp
  let storeAddressText = 'Retirada na Padaria';
  
  let storeData = {
    name: "Padaria Lamim",
    openingTime: "06:00",
    closingTime: "20:00"
  };

  const categories = [
    { id: 'bolos', name: '🍰 Bolos Caseiros' }
  ];

  // --- MOCK PRODUCT DATABASE ---
  const originalProducts = [
    {
      id: 4,
      category: 'bolos',
      name: 'Bolo de Milho',
      desc: 'Feito com milho natural colhido fresco, nossa massa é incrivelmente macia, molhadinha e perfumada — aquele sabor caseiro que lembra o bolo da vovó. Sem conservantes, sem artificiais. Puro amor em cada pedaço!',
      price: 22.00,
      image: 'bolos/milho.jpg',
      stock: null
    },
    {
      id: 5,
      category: 'bolos',
      name: 'Bolo de Laranja',
      desc: 'Feito com 100% de laranja natural, sem aromatizantes artificiais. Massa fofinha e leve, coberta com brigadeiro branco cremoso e raspinhas de laranja fresca que realçam o sabor verdadeiro da fruta.',
      price: 22.00,
      image: 'bolos/laranja.jpg',
      stock: null
    },
    {
      id: 6,
      category: 'bolos',
      name: 'Bolo de Churros',
      desc: 'O sabor que conquista à primeira mordida! Massa fofinha empanada em açúcar e canela, coberta com doce de leite cremoso feito artesanalmente. Um toque especial de carinho em cada pedaço!',
      price: 25.00,
      image: 'bolos/churros.jpg',
      stock: null
    },
    {
      id: 7,
      category: 'bolos',
      name: 'Bolo de Limão',
      desc: 'Um dos nossos queridinhos! Feito com 100% limão natural, sem essências artificiais. Massa leve e fofinha, coberta com mousse de limão cremosa e raspinhas frescas que dão o toque final refrescante e delicado.',
      price: 22.00,
      image: 'bolos/limao.jpg',
      stock: null
    },
    {
      id: 8,
      category: 'bolos',
      name: 'Bolo de Cenoura com Brigadeiro',
      desc: 'O clássico que todo mundo ama! Massa fofinha feita com cenouras frescas, sem conservantes, coberta com brigadeiro cremoso artesanal. Sabor caseiro e irresistível, perfeito para acompanhar o café!',
      price: 25.00,
      image: 'bolos/cenoura.jpg',
      stock: null
    },
    {
      id: 9,
      category: 'bolos',
      name: 'Bolo de Fubá com Goiabada',
      desc: 'O sabor do interior em cada pedaço! Massa fofinha de fubá, coberta com uma camada cremosa de goiabada artesanal. Simples, delicioso e sem conservantes — perfeito para acompanhar um café quentinho!',
      price: 22.00,
      image: 'bolos/fuba.jpg',
      stock: null
    },
    {
      id: 10,
      category: 'bolos',
      name: 'Bolo de Amendoim',
      desc: 'Massa fofinha com pedacinhos de amendoim selecionados, coberta com brigadeiro branco cremoso e decorada com paçoca que dá o toque final irresistível. Delicioso e perfeito para acompanhar um café!',
      price: 25.00,
      image: 'bolos/amendoim.jpg',
      stock: null
    },
    {
      id: 11,
      category: 'bolos',
      name: 'Bolo de Banana',
      desc: 'Massa fofinha, coberta com banana caramelizada fresca e um toque de canela que deixa cada fatia ainda mais saborosa. Um clássico caseiro sem conservantes, perfeito para acompanhar o café!',
      price: 22.00,
      image: 'bolos/banana.jpg',
      stock: null
    },
    {
      id: 12,
      category: 'bolos',
      name: 'Bolo de Chocolate com Brigadeiro',
      desc: 'Massa fofinha e super chocolatuda, coberta com brigadeiro cremoso artesanal que derrete na boca. Um clássico irresistível e sem conservantes, perfeito para quem ama chocolate!',
      price: 25.00,
      image: 'bolos/chocolate.jpg',
      stock: null
    },
    {
      id: 13,
      category: 'bolos',
      name: 'Bolo Formigueiro',
      desc: 'Massa fofinha com granulado, coberta com brigadeiro branco e preto e confeitada com granulado — textura e sabor em cada pedaço. Irresistível e perfeito para acompanhar o café!',
      price: 22.00,
      image: 'bolos/formigueiro.jpg',
      stock: null
    },
    {
      id: 14,
      category: 'bolos',
      name: 'Bolo Mesclado',
      desc: 'Massa mesclada branca e preta, coberta com brigadeiro branco e preto — combinando sabor e charme em cada fatia. Delicioso e sem conservantes, perfeito para acompanhar o café!',
      price: 22.00,
      image: 'bolos/mesclado.jpg',
      stock: null
    }
  ];

  // --- CATALOG LOADING ---
  async function loadProductsFromSupabase() {
    try {
      const { data, error } = await supabaseClient
        .from('produtos')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        products = data.map(item => ({
          id: item.id,
          category: item.category,
          name: item.name,
          desc: item.description || item.desc || '',
          price: parseFloat(item.price),
          image: item.image,
          stock: item.stock
        }));
      } else {
        products = [...originalProducts];
      }
      renderMenu();
    } catch (e) {
      console.error("Error loading products from Supabase", e);
      products = [...originalProducts];
      renderMenu();
    }
  }

  // --- UI ELEMENTS ---
  const storeStatusBadge = document.getElementById('store-status');
  const closedBanner = document.getElementById('closed-banner');
  const productSearchInput = document.getElementById('product-search');
  const categoryTabsContainer = document.getElementById('category-tabs-container');
  const menuSection = document.getElementById('menu-section');

  // Cart elements
  const cartCountBadge = document.getElementById('cart-count');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartDetailsContainer = document.getElementById('cart-details-container');
  const txtSubtotal = document.getElementById('txt-subtotal');
  const txtDeliveryFee = document.getElementById('txt-delivery-fee');
  const txtTotal = document.getElementById('txt-total');
  const rowDeliveryFee = document.getElementById('row-delivery-fee');

  // Checkout form elements
  const checkoutForm = document.getElementById('checkout-form');
  const radioDelivery = document.getElementById('radio-delivery');
  const radioPickup = document.getElementById('radio-pickup');
  const addressContainer = document.getElementById('address-container');
  const inputAddressStreet = document.getElementById('input-address-street');
  const inputAddressNumber = document.getElementById('input-address-number');
  const inputAddressNeighborhood = document.getElementById('input-address-neighborhood');
  const inputAddressComplement = document.getElementById('input-address-complement');
  const inputPayment = document.getElementById('input-payment');
  const changeContainer = document.getElementById('change-container');
  const inputChange = document.getElementById('input-change');

  // Mobile elements
  const floatingCartBtn = document.getElementById('floating-cart');
  const floatCartDetails = document.getElementById('float-cart-details');

  // Success view overlay elements
  const successOverlay = document.getElementById('success-view-overlay');
  const successOrderId = document.getElementById('success-order-id');
  const successDeliveryTime = document.getElementById('success-delivery-time');
  const successAddress = document.getElementById('success-address');
  const successBasketItems = document.getElementById('success-basket-items');
  const successExtraCount = document.getElementById('success-extra-count');
  const successTotalValue = document.getElementById('success-total-value');
  const btnSuccessBack = document.getElementById('btn-success-back');

  let currentOrder = null;

  // --- STORE STATUS CALCULATION ---
  function checkStoreStatus() {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    const [openH, openM] = storeData.openingTime.split(':').map(Number);
    const [closeH, closeM] = storeData.closingTime.split(':').map(Number);

    const openTime = openH * 100 + openM;
    const closeTime = closeH * 100 + closeM;

    const isOpen = currentTime >= openTime && currentTime < closeTime;

    if (isOpen) {
      storeStatusBadge.querySelector('.status-text').textContent = 'Aberto';
      storeStatusBadge.className = "status-badge open";
      closedBanner.classList.add('hidden');
    } else {
      storeStatusBadge.querySelector('.status-text').textContent = 'Fechado';
      storeStatusBadge.className = "status-badge closed";
      closedBanner.classList.remove('hidden');
    }

    const openingHoursEl = document.querySelector('.opening-hours');
    if (openingHoursEl) {
      openingHoursEl.textContent = `🕒 Seg a Dom: ${storeData.openingTime} às ${storeData.closingTime}`;
    }
  }

  // --- CATEGORIES NAV BAR ---
  function renderCategoryNav() {
    categoryTabsContainer.innerHTML = '';
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.textContent = cat.name.replace(/[^\w\sÀ-ú]/g, '').trim();
      btn.onclick = () => scrollToCategory(cat.id);
      categoryTabsContainer.appendChild(btn);
    });
  }

  function scrollToCategory(catId) {
    const element = document.getElementById(`cat-${catId}`);
    if (element) {
      const offset = 140; // Navbar and header offset
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const offsetPosition = (elementRect - bodyRect) - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  // --- RENDER MENU GRID ---
  function renderMenu() {
    menuSection.innerHTML = '';
    const query = searchQuery.toLowerCase().trim();

    categories.forEach(cat => {
      // Filter products by category
      let catProducts = products.filter(p => p.category === cat.id);
      
      // Apply search query filters
      if (query) {
        catProducts = catProducts.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.desc.toLowerCase().includes(query)
        );
      }

      if (catProducts.length === 0) return;

      const categoryBlock = document.createElement('div');
      categoryBlock.className = "category-block";
      categoryBlock.id = `cat-${cat.id}`;

      categoryBlock.innerHTML = `
        <h2 class="category-title">${cat.name}</h2>
        <div class="product-grid"></div>
      `;

      const grid = categoryBlock.querySelector('.product-grid');

      catProducts.forEach(prod => {
        const cartItem = cart.find(item => item.id === prod.id);
        const isInCart = !!cartItem;
        
        // Stock check
        const isOutOfStock = prod.stock !== undefined && prod.stock !== null && prod.stock !== "" && parseInt(prod.stock, 10) <= 0;

        const productCard = document.createElement('div');
        productCard.className = "product-card" + (isOutOfStock ? " out-of-stock" : "");
        
        let actionButtonHTML = '';
        if (isOutOfStock) {
          actionButtonHTML = `
            <span style="background: rgba(186, 26, 26, 0.1); color: var(--danger); padding: 6px 14px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; select-none">Esgotado</span>
          `;
        } else if (isInCart) {
          actionButtonHTML = `
            <div class="qty-selector">
              <button class="btn-qty-card btn-qty-minus" data-id="${prod.id}">
                ${cartItem.qty === 1 ? '🗑️' : '-'}
              </button>
              <span class="card-qty-value">${cartItem.qty}</span>
              <button class="btn-qty-card btn-qty-plus" data-id="${prod.id}">+</button>
            </div>
          `;
        } else {
          actionButtonHTML = `
            <button class="btn-add btn-add-item" data-id="${prod.id}">
              <span class="material-symbols-outlined" style="font-size: 16px;">shopping_basket</span>
              <span>Adicionar</span>
            </button>
          `;
        }

        const imageHtml = prod.image
          ? `<img class="product-image" src="${prod.image}" alt="${prod.name}"/>`
          : `<div class="w-full h-full flex flex-col items-center justify-center gap-1.5" style="background-color: rgba(139, 115, 102, 0.08); color: var(--text-muted); display: flex; align-items: center; justify-content: center; height: 100%;">
              <span class="material-symbols-outlined" style="font-size: 32px;">image</span>
              <span style="font-size: 0.75rem; font-weight: 600; font-family: inherit;">Sem Imagem</span>
             </div>`;

        productCard.innerHTML = `
          <div class="product-image-container">
            ${imageHtml}
          </div>
          <div class="product-info">
            <div class="product-details">
              <h3 class="product-name">${prod.name}</h3>
              <p class="product-desc">${prod.desc}</p>
            </div>
            <div class="product-actions-row">
              <span class="product-price">R$ ${prod.price.toFixed(2).replace('.', ',')}</span>
              <div class="product-actions">
                ${actionButtonHTML}
              </div>
            </div>
          </div>
        `;

        grid.appendChild(productCard);
      });

      menuSection.appendChild(categoryBlock);
    });

    if (menuSection.innerHTML === '' && query !== '') {
      menuSection.innerHTML = `
        <div style="text-align: center; padding: 50px 20px; background: var(--card-bg); border-radius: var(--border-radius); border: 1px dashed var(--border); max-width: 450px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 10px;">
          <span class="material-symbols-outlined" style="font-size: 48px; color: var(--border);">search_off</span>
          <p style="font-weight: 700; color: var(--text-main);">Nenhum produto encontrado</p>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;">Verifique o termo digitado ou explore todas as opções.</p>
          <button class="btn-add" id="btn-clear-search">Ver Cardápio Completo</button>
        </div>
      `;
      document.getElementById('btn-clear-search').onclick = clearSearch;
    }

    // Bind action events
    document.querySelectorAll('.btn-add-item').forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.getAttribute('data-id'));
        addToCart(id);
      };
    });

    document.querySelectorAll('.btn-qty-minus').forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.getAttribute('data-id'));
        changeQty(id, -1);
      };
    });

    document.querySelectorAll('.btn-qty-plus').forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.getAttribute('data-id'));
        changeQty(id, 1);
      };
    });
  }

  // --- CART CORE ACTIONS ---
  function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    if (totalItems >= maxItemsLimit) {
      alert(`Limite máximo de ${maxItemsLimit} bolos por pedido atingido! Caso precise de uma quantidade maior, por favor entre em contato conosco diretamente.`);
      return;
    }

    // Stock check
    if (product.stock !== undefined && product.stock !== null && product.stock !== "") {
      const availableStock = parseInt(product.stock, 10);
      const cartItem = cart.find(item => item.id === productId);
      const currentQtyInCart = cartItem ? cartItem.qty : 0;
      if (currentQtyInCart + 1 > availableStock) {
        alert(`Desculpe, temos apenas ${availableStock} unidade(s) de "${product.name}" em estoque.`);
        return;
      }
    }

    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1
    });

    updateCartUI();
  }

  function changeQty(productId, delta) {
    const idx = cart.findIndex(item => item.id === productId);
    if (idx > -1) {
      if (delta > 0) {
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        if (totalItems >= maxItemsLimit) {
          alert(`Limite máximo de ${maxItemsLimit} bolos por pedido atingido! Caso precise de uma quantidade maior, por favor entre em contato conosco diretamente.`);
          return;
        }

        // Stock check
        const product = products.find(p => p.id === productId);
        if (product && product.stock !== undefined && product.stock !== null && product.stock !== "") {
          const availableStock = parseInt(product.stock, 10);
          if (cart[idx].qty + delta > availableStock) {
            alert(`Desculpe, temos apenas ${availableStock} unidade(s) de "${product.name}" em estoque.`);
            return;
          }
        }
      }
      cart[idx].qty += delta;
      if (cart[idx].qty <= 0) {
        cart.splice(idx, 1);
      }
      updateCartUI();
    }
  }

  // Render the shopping cart sidebar list
  function updateCartUI() {
    cartItemsList.innerHTML = '';
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

    cartCountBadge.textContent = totalItems;

    if (cart.length === 0) {
      cartItemsList.innerHTML = `
        <p class="empty-cart-msg">Seu carrinho está vazio.</p>
      `;
      cartDetailsContainer.classList.add('hidden');
      
      // Hide Mobile floating cart button
      floatingCartBtn.classList.remove('translate-y-0');
      floatingCartBtn.classList.add('translate-y-24');
    } else {
      cart.forEach(item => {
        const row = document.createElement('div');
        row.className = "cart-item";
        row.innerHTML = `
          <div class="cart-item-info">
            <p class="cart-item-name">${item.name}</p>
            <p class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')} x ${item.qty}</p>
          </div>
          <div class="cart-controls">
            <button class="btn-qty btn-sidebar-minus" data-id="${item.id}">-</button>
            <span class="cart-qty">${item.qty}</span>
            <button class="btn-qty btn-sidebar-plus" data-id="${item.id}">+</button>
          </div>
        `;
        cartItemsList.appendChild(row);
      });

      // Bind sidebar cart quantity switches
      document.querySelectorAll('.btn-sidebar-minus').forEach(btn => {
        btn.onclick = () => changeQty(parseInt(btn.getAttribute('data-id')), -1);
      });
      document.querySelectorAll('.btn-sidebar-plus').forEach(btn => {
        btn.onclick = () => changeQty(parseInt(btn.getAttribute('data-id')), 1);
      });

      // Render calculations and forms
      calculateTotals();
      cartDetailsContainer.classList.remove('hidden');

      // Update Mobile Floating Button
      floatingCartBtn.classList.remove('translate-y-24');
      floatingCartBtn.classList.add('translate-y-0');
    }

    // Refresh menu cards states
    renderMenu();
  }

  // --- CALCULATION LOGIC ---
  function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const fee = deliveryMethod === 'delivery' ? deliveryFee : 0;
    const total = subtotal + fee;

    txtSubtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    
    if (deliveryMethod === 'delivery') {
      rowDeliveryFee.classList.remove('hidden');
      txtDeliveryFee.textContent = `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`;
    } else {
      rowDeliveryFee.classList.add('hidden');
    }

    txtTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    
    // Update floating mobile text
    floatCartDetails.textContent = `${cart.reduce((sum, i) => sum + i.qty, 0)} itens • R$ ${total.toFixed(2).replace('.', ',')}`;
  }

  // --- TOGGLE ADDRESS FIELDS ---
  function toggleAddress() {
    if (deliveryMethod === 'retirada') {
      addressContainer.classList.add('hidden');
      inputAddressStreet.required = false;
      inputAddressNumber.required = false;
      inputAddressNeighborhood.required = false;
      inputAddressStreet.value = '';
      inputAddressNumber.value = '';
      inputAddressNeighborhood.value = '';
      inputAddressComplement.value = '';
    } else {
      addressContainer.classList.remove('hidden');
      inputAddressStreet.required = true;
      inputAddressNumber.required = true;
      inputAddressNeighborhood.required = true;
    }
    calculateTotals();
  }

  // --- TOGGLE NOTES CONTAINER DYNAMICALLY ---
  function toggleNotes() {
    if (!inputPayment || !changeContainer) return;
    if (inputPayment.value === 'dinheiro') {
      changeContainer.classList.remove('hidden');
    } else {
      changeContainer.classList.add('hidden');
      if (inputChange) inputChange.value = '';
    }
  }

  if (inputPayment) {
    inputPayment.addEventListener('change', toggleNotes);
  }

  radioDelivery.onchange = () => {
    deliveryMethod = 'delivery';
    toggleAddress();
  };

  radioPickup.onchange = () => {
    deliveryMethod = 'retirada';
    gpsCoords = null;
    if (gpsStatus) {
      gpsStatus.classList.add('hidden');
      gpsStatus.textContent = '';
    }
    toggleAddress();
  };

  // --- PHONE MASK LOGIC & SAVED PROFILE CHECK ---
  const inputPhone = document.getElementById('input-phone');
  const savedProfileBox = document.getElementById('saved-profile-box');
  const savedProfileText = document.getElementById('saved-profile-text');
  const btnUseSavedAddress = document.getElementById('btn-use-saved-address');
  const btnUseNewAddress = document.getElementById('btn-use-new-address');

  function checkSavedProfile(phoneValue) {
    if (!savedProfileBox || !savedProfileText) return;
    
    // Obter perfis
    const profiles = JSON.parse(localStorage.getItem('padaria_lamim_profiles') || '{}');
    const profile = profiles[phoneValue];
    
    if (profile) {
      // Preencher nome automaticamente se estiver vazio
      const inputName = document.getElementById('input-name');
      if (inputName && !inputName.value.trim()) {
        inputName.value = profile.name;
      }
      
      if (profile.street) {
        const addressText = `${profile.street}, nº ${profile.number}, Bairro: ${profile.neighborhood}`;
        savedProfileText.textContent = `${profile.name} - ${addressText}`;
        savedProfileBox.classList.remove('hidden');
      } else {
        savedProfileBox.classList.add('hidden');
      }
    } else {
      savedProfileBox.classList.add('hidden');
    }
  }

  if (btnUseSavedAddress) {
    btnUseSavedAddress.onclick = () => {
      const phoneValue = inputPhone.value;
      const profiles = JSON.parse(localStorage.getItem('padaria_lamim_profiles') || '{}');
      const profile = profiles[phoneValue];
      if (profile) {
        deliveryMethod = 'delivery';
        if (radioDelivery) radioDelivery.checked = true;
        if (radioPickup) radioPickup.checked = false;
        toggleAddress();
        inputAddressStreet.value = profile.street || '';
        inputAddressNumber.value = profile.number || '';
        inputAddressNeighborhood.value = profile.neighborhood || '';
        inputAddressComplement.value = profile.complement || '';
      }
      savedProfileBox.classList.add('hidden');
    };
  }

  if (btnUseNewAddress) {
    btnUseNewAddress.onclick = () => {
      deliveryMethod = 'delivery';
      if (radioDelivery) radioDelivery.checked = true;
      if (radioPickup) radioPickup.checked = false;
      toggleAddress();
      inputAddressStreet.value = '';
      inputAddressNumber.value = '';
      inputAddressNeighborhood.value = '';
      inputAddressComplement.value = '';
      savedProfileBox.classList.add('hidden');
      inputAddressStreet.focus();
    };
  }

  if (inputPhone) {
    inputPhone.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número
      if (value.length > 11) value = value.slice(0, 11); // Limita a 11 dígitos

      if (value.length > 10) {
        // Celular: (XX) XXXXX-XXXX
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
      } else if (value.length > 6) {
        // Fixo: (XX) XXXX-XXXX
        value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
      } else if (value.length > 2) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      } else if (value.length > 0) {
        value = `(${value}`;
      }
      
      e.target.value = value;
      checkSavedProfile(value);
    });
  }

  // --- ADDRESS NUMBER CONSTRAINT ---
  if (inputAddressNumber) {
    inputAddressNumber.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número
    });
  }

  // --- GEOLOCATION GPS LOGIC ---
  let gpsCoords = null;
  const btnGetLocation = document.getElementById('btn-get-location');
  const gpsStatus = document.getElementById('gps-status');

  if (btnGetLocation && gpsStatus) {
    btnGetLocation.onclick = () => {
      gpsStatus.classList.remove('hidden');
      gpsStatus.style.color = 'var(--text-muted)';
      gpsStatus.textContent = 'Solicitando acesso ao GPS...';
      gpsCoords = null;

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          gpsCoords = { lat, lon };

          gpsStatus.textContent = 'Coordenadas obtidas! Identificando endereço...';

          try {
            // Chamada de geocodificação reversa para o Nominatim do OpenStreetMap
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`);
            if (!response.ok) throw new Error("Erro na requisição Nominatim");
            
            const data = await response.json();
            if (data && data.address) {
              const street = data.address.road || data.address.suburb || data.address.pedestrian || '';
              const neighborhood = data.address.suburb || data.address.neighbourhood || data.address.city_district || data.address.quarter || '';
              const houseNumber = data.address.house_number || '';

              if (inputAddressStreet) inputAddressStreet.value = street;
              if (inputAddressNeighborhood) inputAddressNeighborhood.value = neighborhood;
              if (inputAddressNumber && houseNumber) {
                inputAddressNumber.value = houseNumber;
              } else if (inputAddressNumber) {
                inputAddressNumber.value = '';
                inputAddressNumber.focus();
              }

              gpsStatus.style.color = 'var(--success)';
              gpsStatus.textContent = '📍 Endereço preenchido com sucesso pelo GPS!';
            } else {
              throw new Error("Endereço não localizado para essas coordenadas.");
            }
          } catch (err) {
            console.error("Erro no geocoding reverso:", err);
            gpsStatus.style.color = 'var(--accent)';
            gpsStatus.textContent = '⚠️ GPS ativo, mas não conseguimos traduzir o endereço. Por favor, digite manualmente.';
          }
        },
        (error) => {
          console.error("Erro de geolocalização:", error);
          gpsStatus.style.color = 'var(--danger)';
          let errorMsg = '⚠️ Não foi possível obter o GPS. Por favor, digite seu endereço.';
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = '🔒 Permissão de GPS negada. Por favor, digite seu endereço manualmente.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = '📡 Sinal de GPS indisponível. Por favor, digite seu endereço.';
          } else if (error.code === error.TIMEOUT) {
            errorMsg = '⏳ Tempo limite de requisição do GPS atingido. Digite manualmente.';
          }
          gpsStatus.textContent = errorMsg;
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    };
  }

  // --- SEARCH AND FILTER ---
  productSearchInput.onkeyup = () => {
    searchQuery = productSearchInput.value;
    renderMenu();
  };

  function clearSearch() {
    productSearchInput.value = '';
    searchQuery = '';
    renderMenu();
  }

  // --- MOBILE SCROLL BUTTON ---
  floatingCartBtn.onclick = () => {
    document.querySelector('.cart-panel-view').scrollIntoView({ behavior: 'smooth' });
  };

  // --- CHECKOUT SUBMISSION ---
  checkoutForm.onsubmit = async (e) => {
    e.preventDefault();

    const name = document.getElementById('input-name').value.trim();
    const phone = document.getElementById('input-phone').value.trim();
    let address = `Retirada na Padaria (${storeAddressText})`;
    if (deliveryMethod === 'delivery') {
      const street = inputAddressStreet.value.trim();
      const number = inputAddressNumber.value.trim();
      const neighborhood = inputAddressNeighborhood.value.trim();
      const complement = inputAddressComplement.value.trim();

      if (!street || !number || !neighborhood) {
        alert("Por favor, preencha todos os campos obrigatórios do endereço de entrega!");
        return;
      }

      // Validar se o nome da rua contém pelo menos uma letra
      if (!/[a-zA-ZÀ-ÿ]/.test(street)) {
        alert("Por favor, insira um nome de rua válido (deve conter letras, ex: Rua Flores, Av. Paulista).");
        inputAddressStreet.focus();
        return;
      }

      // Validar se o número do endereço contém apenas números
      if (!/^\d+$/.test(number)) {
        alert("Por favor, insira apenas números no campo de Número.");
        inputAddressNumber.focus();
        return;
      }

      address = `${street}, nº ${number}, Bairro: ${neighborhood}`;
      if (complement) {
        address += ` (${complement})`;
      }
      if (gpsCoords) {
        address += ` | GPS: https://www.google.com/maps/search/?api=1&query=${gpsCoords.lat},${gpsCoords.lon}`;
      }
    }
    const payment = document.getElementById('input-payment').value;
    const changeVal = document.getElementById('input-change').value.trim();
    const notes = (payment === 'dinheiro' && changeVal) ? `Troco para: ${changeVal}` : '';

    if (!name || name.length < 3) {
      alert("Por favor, insira seu nome completo (mínimo de 3 letras).");
      document.getElementById('input-name').focus();
      return;
    }

    if (!phone) {
      alert("Por favor, preencha seu telefone!");
      return;
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      alert("Por favor, insira um telefone válido com DDD (mínimo de 10 números, ex: (11) 99999-9999).");
      document.getElementById('input-phone').focus();
      return;
    }

    if (!payment) {
      alert("Por favor, selecione uma forma de pagamento!");
      return;
    }

    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    if (totalItems > maxItemsLimit) {
      alert(`Seu pedido excede o limite máximo de ${maxItemsLimit} bolos. Por favor, reduza a quantidade no carrinho para finalizar.`);
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const fee = deliveryMethod === 'delivery' ? deliveryFee : 0;
    const total = subtotal + fee;

    try {
      // 1. Buscar os estoques mais atualizados dos produtos do carrinho
      const productIds = cart.map(item => item.id);
      const { data: currentDbProducts, error: stockFetchError } = await supabaseClient
        .from('produtos')
        .select('id, name, stock')
        .in('id', productIds);

      if (stockFetchError) throw stockFetchError;

      // 2. Validar o estoque antes de prosseguir
      for (const item of cart) {
        const dbProd = currentDbProducts.find(p => p.id === item.id);
        if (dbProd && dbProd.stock !== undefined && dbProd.stock !== null && dbProd.stock !== "") {
          const availableStock = parseInt(dbProd.stock, 10);
          if (item.qty > availableStock) {
            alert(`O estoque do bolo "${item.name}" mudou recentemente. Infelizmente, restam apenas ${availableStock} unidades disponíveis. Por favor, ajuste a quantidade no seu carrinho.`);
            return;
          }
        }
      }

      // Inserir pedido no Supabase com campos mapeados para snake_case
      const orderPayload = {
        client_name: name,
        client_phone: phone,
        client_address: address,
        payment_method: payment,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image
        })),
        subtotal: parseFloat(subtotal.toFixed(2)),
        delivery_fee: parseFloat(fee.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        notes: notes,
        status: 'pendente'
      };

      const { data, error } = await supabaseClient
        .from('pedidos')
        .insert([orderPayload])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        currentOrder = {
          id: data[0].id,
          clientName: data[0].client_name,
          clientPhone: data[0].client_phone,
          clientAddress: data[0].client_address,
          paymentMethod: data[0].payment_method,
          items: data[0].items,
          subtotal: parseFloat(data[0].subtotal),
          deliveryFee: parseFloat(data[0].delivery_fee),
          total: parseFloat(data[0].total),
          notes: data[0].notes,
          status: data[0].status,
          timestamp: data[0].timestamp
        };
      } else {
        throw new Error("Não foi possível recuperar os dados inseridos.");
      }

      // Salvar perfil do cliente localmente
      if (phone && name) {
        const profiles = JSON.parse(localStorage.getItem('padaria_lamim_profiles') || '{}');
        profiles[phone] = {
          name: name,
          street: deliveryMethod === 'delivery' ? inputAddressStreet.value.trim() : '',
          number: deliveryMethod === 'delivery' ? inputAddressNumber.value.trim() : '',
          neighborhood: deliveryMethod === 'delivery' ? inputAddressNeighborhood.value.trim() : '',
          complement: deliveryMethod === 'delivery' ? inputAddressComplement.value.trim() : ''
        };
        localStorage.setItem('padaria_lamim_profiles', JSON.stringify(profiles));
      }

      // Atualizar estoques físicos de produtos no Supabase (se houver estoque limitado)
      for (const item of cart) {
        const dbProd = currentDbProducts.find(p => p.id === item.id);
        if (dbProd && dbProd.stock !== undefined && dbProd.stock !== null && dbProd.stock !== "") {
          const currentStock = parseInt(dbProd.stock, 10);
          const newStock = Math.max(0, currentStock - item.qty);
          await supabaseClient
            .from('produtos')
            .update({ stock: newStock })
            .eq('id', item.id);
        }
      }

      // Salvar pedido no localStorage e iniciar rastreamento
      localStorage.setItem('padaria_lamim_active_order_id', data[0].id);
      startTracking(data[0].id);

      // Render Success elements
      renderSuccessOverlay();

      // Show success view
      successOverlay.classList.add('active');
    } catch (err) {
      console.error("Erro ao enviar pedido para o Supabase:", err);
      alert("Houve um erro ao processar seu pedido. Por favor, tente novamente.");
    }
  };

  function renderSuccessOverlay() {
    if (!currentOrder) return;

    successOrderId.textContent = `#${currentOrder.id}`;
    successDeliveryTime.textContent = deliveryMethod === 'delivery' ? '30-45 min' : 'Pronto em 15 min';
    successAddress.textContent = currentOrder.clientAddress;
    successTotalValue.textContent = `R$ ${currentOrder.total.toFixed(2).replace('.', ',')}`;

    successBasketItems.innerHTML = '';
    const itemsShow = currentOrder.items.slice(0, 2);
    const extraCount = currentOrder.items.length - 2;

    itemsShow.forEach(item => {
      const row = document.createElement('div');
      row.className = "success-basket-row";
      const imageHtml = item.image
        ? `<img class="success-basket-img" src="${item.image}" alt="${item.name}"/>`
        : `<div class="success-basket-img flex items-center justify-center" style="background-color: rgba(139, 115, 102, 0.08); color: var(--text-muted); display: flex; align-items: center; justify-content: center;">
            <span class="material-symbols-outlined" style="font-size: 20px;">image</span>
           </div>`;
      row.innerHTML = `
        ${imageHtml}
        <div class="success-basket-text">
          <p class="success-basket-name">${item.name}</p>
          <p class="success-basket-qty">${item.qty} unidade(s)</p>
        </div>
        <p class="success-basket-price">R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}</p>
      `;
      successBasketItems.appendChild(row);
    });

    if (extraCount > 0) {
      successExtraCount.textContent = `+ ${extraCount} item(ns)`;
      successExtraCount.classList.remove('hidden');
    } else {
      successExtraCount.classList.add('hidden');
    }
  }

  btnSuccessBack.onclick = () => {
    successOverlay.classList.remove('active');
    
    // Clear state
    cart = [];
    currentOrder = null;
    gpsCoords = null;
    if (gpsStatus) {
      gpsStatus.classList.add('hidden');
      gpsStatus.textContent = '';
    }
    checkoutForm.reset();
    productSearchInput.value = '';
    searchQuery = '';
    deliveryMethod = 'retirada';
    
    setTimeout(() => {
      updateCartUI();
      toggleAddress();
      toggleNotes();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  };

  // --- REAL-TIME SYNC VIA SUPABASE ---
  // Escutar mudanças em tempo real na tabela de produtos do Supabase
  const productsSubscription = supabaseClient
    .channel('public:produtos')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, (payload) => {
      console.log('Catálogo atualizado no Supabase:', payload);
      loadProductsFromSupabase();
    })
    .subscribe();

  // --- REAL-TIME ORDER TRACKING ---
  let trackingSubscription = null;

  const trackingFloatingBar = document.getElementById('tracking-floating-bar');
  const trackingBarOrderId = document.getElementById('tracking-bar-order-id');
  const trackingBarStatusText = document.getElementById('tracking-bar-status-text');
  const trackingBarIcon = document.getElementById('tracking-bar-icon');
  const btnTrackingOpen = document.getElementById('btn-tracking-open');

  const trackingModalOverlay = document.getElementById('tracking-modal-overlay');
  const btnTrackingCloseModal = document.getElementById('btn-tracking-close-modal');
  const trackingModalOrderId = document.getElementById('tracking-modal-order-id');
  const trackingAddress = document.getElementById('tracking-address');
  const trackingPaymentTotal = document.getElementById('tracking-payment-total');
  const btnTrackingSupportWhatsapp = document.getElementById('btn-tracking-support-whatsapp');
  const btnTrackingDismiss = document.getElementById('btn-tracking-dismiss');

  // Event Listeners for Tracking
  if (btnTrackingOpen) {
    btnTrackingOpen.onclick = () => {
      if (trackingModalOverlay) {
        trackingModalOverlay.classList.add('active');
      }
    };
  }

  if (btnTrackingCloseModal) {
    btnTrackingCloseModal.onclick = () => {
      if (trackingModalOverlay) {
        trackingModalOverlay.classList.remove('active');
      }
    };
  }

  if (btnTrackingDismiss) {
    btnTrackingDismiss.onclick = () => {
      // Clear tracking
      localStorage.removeItem('padaria_lamim_active_order_id');
      if (trackingFloatingBar) {
        trackingFloatingBar.classList.remove('active');
        trackingFloatingBar.classList.add('hidden');
      }
      if (trackingModalOverlay) {
        trackingModalOverlay.classList.remove('active');
      }
      if (trackingSubscription) {
        supabaseClient.removeChannel(trackingSubscription);
        trackingSubscription = null;
      }
    };
  }

  async function startTracking(orderId) {
    if (!orderId) return;

    try {
      // Fetch initial order details
      const { data, error } = await supabaseClient
        .from('pedidos')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      if (!data) {
        console.warn(`Pedido #${orderId} não encontrado no Supabase.`);
        localStorage.removeItem('padaria_lamim_active_order_id');
        return;
      }

      // Update UI with initial data
      updateTrackingUI(data);

      // Subscribe to real-time changes
      if (trackingSubscription) {
        supabaseClient.removeChannel(trackingSubscription);
      }

      trackingSubscription = supabaseClient
        .channel(`order-tracking-${orderId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: `id=eq.${orderId}` },
          (payload) => {
            console.log(`Pedido #${orderId} atualizado em tempo real:`, payload.new);
            updateTrackingUI(payload.new);
          }
        )
        .subscribe();

    } catch (err) {
      console.error("Erro ao iniciar rastreamento do pedido:", err);
    }
  }

  function updateTrackingUI(order) {
    if (!order) return;

    const orderId = order.id;
    const status = order.status;
    const isDelivery = !order.client_address.startsWith('Retirada na Padaria');
    const total = parseFloat(order.total);
    const payment = order.payment_method;

    // Map payment names
    const paymentLabels = {
      'pix': 'PIX',
      'cartao_entrega': 'Cartão na Entrega',
      'dinheiro': 'Dinheiro'
    };
    const paymentText = paymentLabels[payment] || payment;

    // Show floating bar
    if (trackingFloatingBar) {
      trackingFloatingBar.classList.remove('hidden');
      trackingFloatingBar.classList.add('active');
    }

    // Set order ID in elements
    if (trackingBarOrderId) trackingBarOrderId.textContent = `#${orderId}`;
    if (trackingModalOrderId) trackingModalOrderId.textContent = `#${orderId}`;

    // Set address and payment info in modal
    if (trackingAddress) {
      trackingAddress.textContent = isDelivery ? order.client_address : `Retirar em: ${storeAddressText}`;
    }
    if (trackingPaymentTotal) {
      trackingPaymentTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')} • ${paymentText}`;
    }
 
    // Set WhatsApp link for support
    if (btnTrackingSupportWhatsapp) {
      const whatsappMsg = `Olá, gostaria de informações sobre o meu pedido #${orderId}.`;
      btnTrackingSupportWhatsapp.href = `https://wa.me/${whatsappSupportNumber}?text=${encodeURIComponent(whatsappMsg)}`;
    }

    // Map status to steps
    let activeStepIndex = 0;
    let barStatusText = 'Aguardando confirmação';
    let barIconName = 'sync';

    // Steps descriptions
    const step0Desc = document.getElementById('step-0-desc');
    const step1Desc = document.getElementById('step-1-desc');
    const step2Title = document.getElementById('step-2-title');
    const step2Desc = document.getElementById('step-2-desc');
    const step2Icon = document.getElementById('step-2-icon');
    const step3Desc = document.getElementById('step-3-desc');

    // Dynamic Step 2 name and icon based on delivery/pickup
    if (step2Title) {
      step2Title.textContent = isDelivery ? 'Saiu para Entrega' : 'Pronto para Retirada';
    }
    if (step2Icon) {
      step2Icon.textContent = isDelivery ? 'delivery_dining' : 'storefront';
    }

    switch (status) {
      case 'pendente':
        activeStepIndex = 0;
        barStatusText = 'Aceito • Na fila de produção';
        barIconName = 'thumb_up';
        if (step0Desc) step0Desc.textContent = 'Seu pedido foi recebido e aceito pela padaria.';
        if (step1Desc) step1Desc.textContent = 'Aguardando início do preparo.';
        if (step2Desc) step2Desc.textContent = isDelivery ? 'Aguardando despacho.' : 'Aguardando produção.';
        break;
      case 'preparando':
        activeStepIndex = 1;
        barStatusText = 'Em preparo';
        barIconName = 'oven';
        if (step0Desc) step0Desc.textContent = 'Pedido confirmado e aceito.';
        if (step1Desc) step1Desc.textContent = 'Seu bolo está sendo preparado com carinho.';
        if (step2Desc) step2Desc.textContent = isDelivery ? 'Aguardando despacho.' : 'Aguardando ficar pronto.';
        break;
      case 'pronto':
        if (isDelivery) {
          activeStepIndex = 1; // For delivery, "pronto" still means preparing/waiting for motoboy
          barStatusText = 'Preparado • Aguardando entregador';
          barIconName = 'oven';
          if (step1Desc) step1Desc.textContent = 'Bolo pronto e embalado! Aguardando o entregador coletar.';
          if (step2Desc) step2Desc.textContent = 'Aguardando o motoboy iniciar a rota.';
        } else {
          activeStepIndex = 2; // For pickup, "pronto" means it's ready to pick up (Step 3 active)
          barStatusText = 'Pronto para Retirada!';
          barIconName = 'storefront';
          if (step1Desc) step1Desc.textContent = 'Bolo pronto e embalado!';
          if (step2Desc) step2Desc.textContent = 'Seu pedido já está no balcão. Pode vir buscar!';
        }
        break;
      case 'a_caminho':
      case 'aceito_motoboy':
        activeStepIndex = 2;
        barStatusText = 'Saiu para Entrega!';
        barIconName = 'delivery_dining';
        if (step1Desc) step1Desc.textContent = 'Bolo pronto e embalado.';
        if (step2Desc) {
          step2Desc.textContent = status === 'aceito_motoboy' 
            ? 'O motoboy aceitou a corrida e já está a caminho!' 
            : 'O entregador iniciou a rota de entrega!';
        }
        break;
      case 'entregue':
        activeStepIndex = 3;
        barStatusText = 'Pedido Concluído! 🎉';
        barIconName = 'celebration';
        if (step0Desc) step0Desc.textContent = 'Pedido aceito e confirmado.';
        if (step1Desc) step1Desc.textContent = 'Bolo produzido com carinho.';
        if (step2Desc) step2Desc.textContent = isDelivery ? 'Entregue no seu endereço.' : 'Retirado com sucesso na loja.';
        if (step3Desc) step3Desc.textContent = 'Entregue e quentinho! Obrigado pela preferência e bom apetite! 🍰';
        break;
    }

    // Update floating bar status text and icon
    if (trackingBarStatusText) {
      trackingBarStatusText.textContent = barStatusText;
      if (status === 'entregue') {
        trackingBarStatusText.classList.add('completed');
      } else {
        trackingBarStatusText.classList.remove('completed');
      }
    }
    if (trackingBarIcon) {
      trackingBarIcon.textContent = barIconName;
      if (status === 'entregue') {
        trackingBarIcon.parentElement.classList.add('completed');
      } else {
        trackingBarIcon.parentElement.classList.remove('completed');
      }
    }

    // Update Stepper item classes
    for (let i = 0; i <= 3; i++) {
      const stepItem = document.getElementById(`step-${i}`);
      if (stepItem) {
        stepItem.classList.remove('active', 'completed');
        if (i < activeStepIndex) {
          stepItem.classList.add('completed');
        } else if (i === activeStepIndex) {
          if (status === 'entregue') {
            stepItem.classList.add('completed');
          } else {
            stepItem.classList.add('active');
          }
        }
      }
    }

    // Toggle close button / support buttons
    if (status === 'entregue') {
      if (btnTrackingDismiss) btnTrackingDismiss.classList.remove('hidden');
      if (btnTrackingSupportWhatsapp) btnTrackingSupportWhatsapp.classList.add('hidden');
      if (btnTrackingCloseModal) btnTrackingCloseModal.classList.add('hidden');
    } else {
      if (btnTrackingDismiss) btnTrackingDismiss.classList.add('hidden');
      if (btnTrackingSupportWhatsapp) btnTrackingSupportWhatsapp.classList.remove('hidden');
      if (btnTrackingCloseModal) btnTrackingCloseModal.classList.remove('hidden');
    }
  }
 
  // --- LOAD DYNAMIC SETTINGS ---
  async function loadDynamicSettings() {
    try {
      const { data, error } = await supabaseClient
        .from('configuracoes')
        .select('*');
 
      if (error) throw error;
 
      if (data) {
        const config = {};
        data.forEach(item => {
          config[item.chave] = item.valor;
        });
 
        if (config['whatsapp_phone']) {
          const cleanPhone = config['whatsapp_phone'].replace(/\D/g, "");
          whatsappSupportNumber = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
        }
        if (config['store_address']) {
          storeAddressText = config['store_address'];
        }
        if (config['opening_time']) {
          storeData.openingTime = config['opening_time'];
        }
        if (config['closing_time']) {
          storeData.closingTime = config['closing_time'];
        }
        if (config['delivery_fee']) {
          deliveryFee = parseFloat(config['delivery_fee']);
        }
        if (config['max_items_order']) {
          maxItemsLimit = parseInt(config['max_items_order'], 10);
        }
 
        console.log("Configurações dinâmicas carregadas com sucesso:", {
          deliveryFee,
          maxItemsLimit,
          whatsappSupportNumber,
          storeData
        });
      }
    } catch (err) {
      console.warn("Falha ao carregar configurações do Supabase. Usando fallbacks locais.", err);
      // Fallback a partir do localStorage
      const cachedFee = localStorage.getItem('config_delivery_fee');
      if (cachedFee) deliveryFee = parseFloat(cachedFee);
 
      const cachedMax = localStorage.getItem('config_max_items_order');
      if (cachedMax) maxItemsLimit = parseInt(cachedMax, 10);
 
      const cachedOpening = localStorage.getItem('config_opening_time');
      if (cachedOpening) storeData.openingTime = cachedOpening;
 
      const cachedClosing = localStorage.getItem('config_closing_time');
      if (cachedClosing) storeData.closingTime = cachedClosing;
 
      const cachedPhone = localStorage.getItem('config_whatsapp_phone');
      if (cachedPhone) {
        const cleanPhone = cachedPhone.replace(/\D/g, "");
        whatsappSupportNumber = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
      }
      
      const cachedAddress = localStorage.getItem('config_store_address');
      if (cachedAddress) storeAddressText = cachedAddress;
    }
 
    // Atualiza status e cálculos baseado nas novas configurações
    checkStoreStatus();
    calculateTotals();
  }
 
  function initOrderTracking() {
    const activeOrderId = localStorage.getItem('padaria_lamim_active_order_id');
    if (activeOrderId) {
      console.log("Rastreando pedido ativo encontrado no localStorage:", activeOrderId);
      startTracking(activeOrderId);
    }
  }

  // --- PWA INSTALLATION LOGIC ---
  let deferredPrompt;
  const installBanner = document.getElementById('install-banner');
  const btnInstallApp = document.getElementById('btn-install-app');
  const btnInstallClose = document.getElementById('btn-install-close');

  if (installBanner && btnInstallApp && btnInstallClose) {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (!sessionStorage.getItem('pwa_banner_dismissed')) {
        installBanner.classList.remove('hidden');
      }
    });

    btnInstallApp.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Instalação PWA: ${outcome}`);
        deferredPrompt = null;
        installBanner.classList.add('hidden');
      }
    });

    btnInstallClose.addEventListener('click', () => {
      installBanner.classList.add('hidden');
      sessionStorage.setItem('pwa_banner_dismissed', 'true');
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA instalado com sucesso!');
      installBanner.classList.add('hidden');
      deferredPrompt = null;
    });
  }

  // Registro do Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.log('Service Worker do Cliente registrado com sucesso no escopo:', reg.scope);
          
          // Forçar a verificação de atualizações no servidor ao abrir o app
          reg.update();

          // Se encontrar uma nova versão instalada no background, recarrega a página na hora
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('Nova versão encontrada! Atualizando aplicativo...');
                window.location.reload();
              }
            });
          });
        })
        .catch((err) => console.error('Erro ao registrar Service Worker do Cliente:', err));
    });
  }

  // --- INITIAL SETUP ---
  loadDynamicSettings().then(() => {
    renderCategoryNav();
    loadProductsFromSupabase();
    updateCartUI();
    toggleAddress();
    toggleNotes();
    initOrderTracking();
  });

  // Update status every minute
  setInterval(checkStoreStatus, 60000);
});
