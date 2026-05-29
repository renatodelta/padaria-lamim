/* ==========================================================================
   PADARIA LAMIM - Cliente App Logic (Layout inspired by Recanto Formoso)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  let cart = [];
  let products = [];
  let searchQuery = '';
  let deliveryMethod = 'retirada'; // Default to pickup
  const deliveryFee = 7.00;
  
  const storeData = {
    name: "Padaria Lamim",
    openingTime: "09:00",
    closingTime: "19:00"
  };

  const categories = [
    { id: 'paes', name: '🥖 Pães Artesanais' },
    { id: 'bolos', name: '🍰 Bolos Caseiros' }
  ];

  // --- MOCK PRODUCT DATABASE ---
  const originalProducts = [
    {
      id: 1,
      category: 'paes',
      name: 'Sourdough Tradicional',
      desc: 'Pão de fermentação natural de 24h, casca crocante rústica e miolo extremamente aerado.',
      price: 24.90,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDURZ5ewq1HLTSRYLo3mJhmQB8cCH8vrEIJRKnpfvkyK6NbtMo6p7dfxElzAFF3_hVbnfzbZv1SaqDQ_Ch_01HDsIiT730wit9m7N9jNYP1dXVnZ0wOYg-9jhV-loh62hP6lXaAuahY_yPmZaB2oAhBJz3NP6KnA0SonsANaV-DfbkffTG6vPull_2690Mj5OHLG50W_yOYXPY4DcWKOZF6kUyPzWdY2V6OxcY6P4bI0j6FZYdy4gCKijV4-JEG0Xs6_11wHUWM_64I',
      stock: null
    },
    {
      id: 2,
      category: 'paes',
      name: 'Croissant Amanteigado',
      desc: 'Massa folhada tradicional francesa preparada com manteiga nobre extrafina.',
      price: 12.50,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCubvmWz31qf2V3sGfp3ao8B-sJHNYGqDJ8eTOAipNj2tF0cayZY0lhzsiJFaAuo7Z0bUa6I4oQ-1Pfd7xkXejS19GcaWKQixrzUHji2pSu-ElKOSUK25sUAkaCKEmXZ5P5bfCblcuCip95Nadi5R5ShPFuqs42D2RySzbEoQAtQjN5w4Yz-7Dc3JGZc6iCVIB2C3bzK97pi7CpTJWc9lDPdV0ehc0136PUKp4ZzwkhPKwWQc6B20Wy1m-uBfFJ4Y1b4HbOOuUKLlav',
      stock: null
    },
    {
      id: 3,
      category: 'paes',
      name: 'Pão de Sal (Francês)',
      desc: 'O pãozinho crocante tradicional queridinho do brasileiro, quentinho e fresco.',
      price: 0.90,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmhZiYZkOBjp1S6MiWq3cFQePrGtPJ8Ezy7fDuhpeE_13S-DWHXtXQU0Z65mW32HATCXQtSFh7bmy6CgyXaCa4DH1XDDgFaUNddk8woNevd50j-Ezy3WHYw5pku5vWO8TMrpsiqNb_iBpCYii0zsedn2vnpJ7AfzByHxsgPvU6biTVlRgFRRUmHUDrKkMTaGrF1XzGcwkHo-br4bbwxBTpui_E4ywjof7I_vFqSMyLhuC0Bs0MbEaJziznAu9hrRcOz1G1zAo20UOg',
      stock: null
    },
    {
      id: 4,
      category: 'bolos',
      name: 'Bolo de Cenoura com Chocolate',
      desc: 'Massa super fofinha de cenoura com cobertura generosa de brigadeiro cremoso.',
      price: 24.99,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbsDioPt-EBqYcTg11IBTlFHj2UqRWQAa4oWl78MreIzbf1YYwVXYC0vDp6osfqMpZtmrXDcJrejauLU709Uxvi6TYmK3oR0k1QyiVcqM99FB5wA8ER2sF9zxIcpH12Hg0Jh4QH897FBRMxjeo_OR-jjpdVfZ1js9B4sg0bGyVxxzsTdLtGhDHvIYmQ5rizwjuHEW_71_OD7Cvi6Mvcy0v3MxJ4Ls7r1rHDtQlsfufQrEfRsrFhz82Abw65_WV5BYr4ayLOaTSyheY',
      stock: null
    },
    {
      id: 5,
      category: 'bolos',
      name: 'Bolo de Fubá com Goiabada',
      desc: 'Bolo caseiro de fubá tradicional com cubos derretidos de goiabada cascão na massa.',
      price: 19.99,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARO2zy58MYs2JDEJDsiCQQFRECDxhQU6tvGvaF-J19P55VfzxzT29xMACoANw4A16P0NjGA5bHcDxHvV14qTyxpm5oI_jzRkCnkwjws0E1Vkq_iqbLW33TgzB1gwXEQstdEf-FOGSHbKAzSyebJyjmW4ZJUw-6Dgn0x9pdNZMbnsIpyRlY8kFylVPyEocgoXGcG5-xpocSDUCmiVAh8jYm_B300anSx3F5LJRXAwaBIwxUQ0LvjNaD5wYI9qnYsaT_SojA581Hy2oM',
      stock: null
    },
    {
      id: 6,
      category: 'bolos',
      name: 'Bolo de Milho Cremoso',
      desc: 'Massa cremosa de milho verde com coco ralado, fofinho e com gostinho de fazenda.',
      price: 22.99,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbgoR--5YR0uWGcBfnopi_U-hWVcjcGLKfNYE9HUbtNenV_l-_ETYmYqNdJdDzXMdFbYUIoKHuyi2GzJB7tXk5C2-HDJcTINRvg8GzbG56ooZ57d2KFVymdeC7xzrfU3IRCcj6TDgC6FN6LiC0NV3_oArWTxhgQz_M0myUFlfy4La2Cj1Xt8dzpCvg7a1VYBGklxfFYvFs5h96zLnOz5R6_d23HuafxgUgki1SEgMsnfi57WztDSqnGgLAYsbf0vNTkzOWew6Z38gh',
      stock: null
    },
    {
      id: 7,
      category: 'bolos',
      name: 'Bolo de Laranja Fresca',
      desc: 'Preparado com suco puro de laranjas frescas e calda leve cítrica açucarada.',
      price: 19.99,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCubvmWz31qf2V3sGfp3ao8B-sJHNYGqDJ8eTOAipNj2tF0cayZY0lhzsiJFaAuo7Z0bUa6I4oQ-1Pfd7xkXejS19GcaWKQixrzUHji2pSu-ElKOSUK25sUAkaCKEmXZ5P5bfCblcuCip95Nadi5R5ShPFuqs42D2RySzbEoQAtQjN5w4Yz-7Dc3JGZc6iCVIB2C3bzK97pi7CpTJWc9lDPdV0ehc0136PUKp4ZzwkhPKwWQc6B20Wy1m-uBfFJ4Y1b4HbOOuUKLlav',
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
  const inputAddress = document.getElementById('input-address');

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

        productCard.innerHTML = `
          <div class="product-image-container">
            <img class="product-image" src="${prod.image}" alt="${prod.name}"/>
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
      inputAddress.required = false;
      inputAddress.value = '';
    } else {
      addressContainer.classList.remove('hidden');
      inputAddress.required = true;
    }
    calculateTotals();
  }

  radioDelivery.onchange = () => {
    deliveryMethod = 'delivery';
    toggleAddress();
  };

  radioPickup.onchange = () => {
    deliveryMethod = 'retirada';
    toggleAddress();
  };

  // --- PHONE MASK LOGIC ---
  const inputPhone = document.getElementById('input-phone');
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
    });
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
    const address = deliveryMethod === 'delivery' ? inputAddress.value.trim() : 'Retirada na Padaria';
    const payment = document.getElementById('input-payment').value;
    const notes = document.getElementById('input-notes').value.trim();

    if (!name) {
      alert("Por favor, preencha seu nome para finalizar!");
      return;
    }

    if (!phone) {
      alert("Por favor, preencha seu telefone!");
      return;
    }

    if (deliveryMethod === 'delivery' && !address) {
      alert("Por favor, preencha o endereço de entrega!");
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const fee = deliveryMethod === 'delivery' ? deliveryFee : 0;
    const total = subtotal + fee;

    try {
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
          timestamp: data[0].created_at
        };
      } else {
        throw new Error("Não foi possível recuperar os dados inseridos.");
      }

      // Atualizar estoques físicos de produtos no Supabase (se houver estoque limitado)
      for (const item of cart) {
        const prod = products.find(p => p.id === item.id);
        if (prod && prod.stock !== undefined && prod.stock !== null && prod.stock !== "") {
          const currentStock = parseInt(prod.stock, 10);
          if (currentStock > 0) {
            const newStock = Math.max(0, currentStock - item.qty);
            await supabaseClient
              .from('produtos')
              .update({ stock: newStock })
              .eq('id', item.id);
          }
        }
      }

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
      row.innerHTML = `
        <img class="success-basket-img" src="${item.image}" alt="${item.name}"/>
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
    checkoutForm.reset();
    productSearchInput.value = '';
    searchQuery = '';
    deliveryMethod = 'retirada';
    
    setTimeout(() => {
      updateCartUI();
      toggleAddress();
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
  checkStoreStatus();
  renderCategoryNav();
  loadProductsFromSupabase();
  updateCartUI();
  toggleAddress();

  // Update status every minute
  setInterval(checkStoreStatus, 60000);
});
