/* ==========================================================================
   PADARIA LAMIM - Clerk Dashboard App Logic (Tailwind & LocalStorage Sync)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- HELPER TO FORMAT IMAGE URLS ---
  function formatImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    if (window.location.hostname.endsWith('padarialamim.com')) {
      return 'https://padarialamim.com/' + url;
    }
    return '../cliente/' + url;
  }

  // --- HELPER TO CLEAN ADDRESS FOR DISPLAY ---
  function cleanAddressForDisplay(address) {
    if (!address) return '';
    return address.split(' | ')[0];
  }

  // --- STATE ---
  let orders = [];
  let products = [];
  let motoboys = [];
  let selectedOrder = null;
  let searchQuery = '';
  let activeView = 'orders'; // 'orders', 'products', 'stock', 'motoboys'
  let soundEnabled = localStorage.getItem('dashboard_sound_alerts') !== 'disabled';
  let soundInterval = null;

  // --- UI ELEMENTS ---
  const listPending = document.getElementById('list-pending');
  const listPreparing = document.getElementById('list-preparing');
  const listReady = document.getElementById('list-ready');
  const listDelivery = document.getElementById('list-delivery');

  const badgePending = document.getElementById('badge-pending');
  const badgePreparing = document.getElementById('badge-preparing');
  const badgeReady = document.getElementById('badge-ready');
  const badgeDelivery = document.getElementById('badge-delivery');

  const kpiPending = document.getElementById('kpi-pending');
  const kpiPreparing = document.getElementById('kpi-preparing');
  const kpiReady = document.getElementById('kpi-ready');
  const kpiDelivered = document.getElementById('kpi-delivered');

  const inputSearchOrders = document.getElementById('input-search-orders');
  const btnRefreshDashboard = document.getElementById('btn-refresh-dashboard');
  const btnToggleSound = document.getElementById('btn-toggle-sound');

  // Detail Drawer Elements
  const detailDrawer = document.getElementById('detail-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');

  const drawerTitle = document.getElementById('drawer-title');
  const drawerTimestamp = document.getElementById('drawer-timestamp');
  const drawerClientName = document.getElementById('drawer-client-name');
  const drawerClientPhone = document.getElementById('drawer-client-phone');
  const drawerClientAddress = document.getElementById('drawer-client-address');
  const drawerItemsContainer = document.getElementById('drawer-items-container');
  const drawerSubtotal = document.getElementById('drawer-subtotal');
  const drawerRowDeliveryFee = document.getElementById('drawer-row-delivery-fee');
  const drawerDeliveryFee = document.getElementById('drawer-delivery-fee');
  const drawerTotal = document.getElementById('drawer-total');
  const drawerPaymentMethod = document.getElementById('drawer-payment-method');

  const drawerMotoboyAssignPanel = document.getElementById('drawer-motoboy-assign-panel');
  const selectMotoboy = document.getElementById('select-motoboy');
  const drawerActionsContainer = document.getElementById('drawer-actions-container');

  // Tab View Elements
  const navOrders = document.getElementById('nav-orders');
  const navProducts = document.getElementById('nav-products');
  const navStock = document.getElementById('nav-stock');
  const navMotoboys = document.getElementById('nav-motoboys');
  const navReports = document.getElementById('nav-reports');

  const viewOrders = document.getElementById('view-orders');
  const viewProducts = document.getElementById('view-products');
  const viewStock = document.getElementById('view-stock');
  const viewMotoboys = document.getElementById('view-motoboys');
  const viewReports = document.getElementById('view-reports');

  const reportsTableBody = document.getElementById('reports-table-body');
  const reportFilterDate = document.getElementById('report-filter-date');
  const reportFilterType = document.getElementById('report-filter-type');
  const reportSearch = document.getElementById('report-search');

  const repKpiRevenue = document.getElementById('rep-kpi-revenue');
  const repKpiOrders = document.getElementById('rep-kpi-orders');
  const repKpiDelivery = document.getElementById('rep-kpi-delivery');
  const repKpiAverage = document.getElementById('rep-kpi-average');

  const formMotoboy = document.getElementById('form-motoboy');
  const inputMotoboyName = document.getElementById('input-motoboy-name');
  const inputMotoboyPassword = document.getElementById('input-motoboy-password');
  const motoboysTableBody = document.getElementById('motoboys-table-body');

  // Settings View Elements
  const navSettings = document.getElementById('nav-settings');
  const viewSettings = document.getElementById('view-settings');
  const formSettings = document.getElementById('form-settings');
  const inputSettingsWhatsapp = document.getElementById('input-settings-whatsapp');
  const inputSettingsAddress = document.getElementById('input-settings-address');
  const inputSettingsOpening = document.getElementById('input-settings-opening');
  const inputSettingsClosing = document.getElementById('input-settings-closing');
  const inputSettingsDeliveryFee = document.getElementById('input-settings-delivery-fee');
  const inputSettingsMaxItems = document.getElementById('input-settings-max-items');

  const productsListContainer = document.getElementById('products-list-container');
  const stockTableBody = document.getElementById('stock-table-body');

  // Product Modal Elements
  const modalProduct = document.getElementById('modal-product');
  const modalProductContainer = document.getElementById('modal-product-container');
  const formProduct = document.getElementById('form-product');
  const modalProductTitle = document.getElementById('modal-product-title');

  const formProductId = document.getElementById('form-product-id');
  const formProductName = document.getElementById('form-product-name');
  const formProductCategory = document.getElementById('form-product-category');
  const formProductPrice = document.getElementById('form-product-price');
  const formProductImage = document.getElementById('form-product-image');
  const formProductDesc = document.getElementById('form-product-desc');

  const btnAddProduct = document.getElementById('btn-add-product');
  const btnCloseProductModal = document.getElementById('btn-close-product-modal');
  const btnCancelProductModal = document.getElementById('btn-cancel-product-modal');

  // --- LOAD DATA FROM SUPABASE ---
  async function loadDashboardData() {
    try {
      const { data, error } = await supabaseClient
        .from('pedidos')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;

      if (data) {
        orders = data.map(item => ({
          id: item.id,
          clientName: item.client_name,
          clientPhone: item.client_phone,
          clientAddress: item.client_address,
          paymentMethod: item.payment_method,
          items: item.items,
          subtotal: parseFloat(item.subtotal),
          deliveryFee: parseFloat(item.delivery_fee),
          total: parseFloat(item.total),
          notes: item.notes,
          status: item.status,
          motoboy: item.motoboy,
          dispatchedTime: item.dispatched_time,
          deliveredTime: item.delivered_time,
          timestamp: item.timestamp
        }));
      }
    } catch (e) {
      console.error("Error loading orders from Supabase", e);
    }

    renderKPIs();
    renderKanban();
    if (activeView === 'reports') {
      renderReportsTab();
    }
  }

  // --- PRODUCTS DATA LOAD FROM SUPABASE ---
  async function loadProductsData() {
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
        // Se o banco estiver vazio, semear os produtos iniciais diretamente no Supabase
        const defaultProducts = [
          {
            category: 'bolos',
            name: 'Bolo de Milho',
            description: 'Feito com milho natural colhido fresco, nossa massa é incrivelmente macia, molhadinha e perfumada — aquele sabor caseiro que lembra o bolo da vovó. Sem conservantes, sem artificiais. Puro amor em cada pedaço!',
            price: 22.00,
            image: 'bolos/milho.jpg',
            stock: null
          },
          {
            category: 'bolos',
            name: 'Bolo de Laranja',
            description: 'Feito com 100% de laranja natural, sem aromatizantes artificiais. Massa fofinha e leve, coberta com brigadeiro branco cremoso e raspinhas de laranja fresca que realçam o sabor verdadeiro da fruta.',
            price: 22.00,
            image: 'bolos/laranja.jpg',
            stock: null
          },
          {
            category: 'bolos',
            name: 'Bolo de Churros',
            description: 'O sabor que conquista à primeira mordida! Massa fofinha empanada em açúcar e canela, coberta com doce de leite cremoso feito artesanalmente. Um toque especial de carinho em cada pedaço!',
            price: 25.00,
            image: 'bolos/churros.jpg',
            stock: null
          },
          {
            category: 'bolos',
            name: 'Bolo de Limão',
            description: 'Um dos nossos queridinhos! Feito com 100% limão natural, sem essências artificiais. Massa leve e fofinha, coberta com mousse de limão cremosa e raspinhas frescas que dão o toque final refrescante e delicado.',
            price: 22.00,
            image: 'bolos/limao.jpg',
            stock: null
          },
          {
            category: 'bolos',
            name: 'Bolo de Cenoura com Brigadeiro',
            description: 'O clássico que todo mundo ama! Massa fofinha feita com cenouras frescas, sem conservantes, coberta com brigadeiro cremoso artesanal. Sabor caseiro e irresistível, perfeito para acompanhar o café!',
            price: 25.00,
            image: 'bolos/cenoura.jpg',
            stock: null
          },
          {
            category: 'bolos',
            name: 'Bolo de Fubá com Goiabada',
            description: 'O sabor do interior em cada pedaço! Massa fofinha de fubá, coberta com uma camada cremosa de goiabada artesanal. Simples, delicioso e sem conservantes — perfeito para acompanhar um café quentinho!',
            price: 22.00,
            image: 'bolos/fuba.jpg',
            stock: null
          },
          {
            category: 'bolos',
            name: 'Bolo de Amendoim',
            description: 'Massa fofinha com pedacinhos de amendoim selecionados, coberta com brigadeiro branco cremoso e decorada com paçoca que dá o toque final irresistível. Delicioso e perfeito para acompanhar um café!',
            price: 25.00,
            image: 'bolos/amendoim.jpg',
            stock: null
          },
          {
            category: 'bolos',
            name: 'Bolo de Banana',
            description: 'Massa fofinha, coberta com banana caramelizada fresca e um toque de canela que deixa cada fatia ainda mais saborosa. Um clássico caseiro sem conservantes, perfeito para acompanhar o café!',
            price: 22.00,
            image: 'bolos/banana.jpg',
            stock: null
          },
          {
            category: 'bolos',
            name: 'Bolo de Chocolate com Brigadeiro',
            description: 'Massa fofinha e super chocolatuda, coberta com brigadeiro cremoso artesanal que derrete na boca. Um clássico irresistível e sem conservantes, perfeito para quem ama chocolate!',
            price: 25.00,
            image: 'bolos/chocolate.jpg',
            stock: null
          },
          {
            category: 'bolos',
            name: 'Bolo Formigueiro',
            description: 'Massa fofinha com granulado, coberta com brigadeiro branco e preto e confeitada com granulado — textura e sabor em cada pedaço. Irresistível e perfeito para acompanhar o café!',
            price: 22.00,
            image: 'bolos/formigueiro.jpg',
            stock: null
          },
          {
            category: 'bolos',
            name: 'Bolo Mesclado',
            description: 'Massa mesclada branca e preta, coberta com brigadeiro branco e preto — combinando sabor e charme em cada fatia. Delicioso e sem conservantes, perfeito para acompanhar o café!',
            price: 22.00,
            image: 'bolos/mesclado.jpg',
            stock: null
          }
        ];

        try {
          const { data: insertedData, error: insertError } = await supabaseClient
            .from('produtos')
            .insert(defaultProducts)
            .select();

          if (insertError) throw insertError;

          if (insertedData) {
            products = insertedData.map(item => ({
              id: item.id,
              category: item.category,
              name: item.name,
              desc: item.description || item.desc || '',
              price: parseFloat(item.price),
              image: item.image,
              stock: item.stock
            }));
          }
        } catch (err) {
          console.error("Erro ao semear produtos padrão no Supabase:", err);
          // Fallback local se der erro no insert
          products = defaultProducts.map((item, idx) => ({
            id: idx + 1,
            category: item.category,
            name: item.name,
            desc: item.description,
            price: item.price,
            image: item.image,
            stock: item.stock
          }));
        }
      }
    } catch (e) {
      console.error("Error loading products from Supabase", e);
    }
  }

  // --- RENDERING ORDER KANBAN ---
  function renderKPIs() {
    const pendingCount = orders.filter(o => o.status === 'pendente').length;
    const preparingCount = orders.filter(o => o.status === 'preparando').length;
    const readyCount = orders.filter(o => o.status === 'pronto').length;
    const deliveryCount = orders.filter(o => o.status === 'a_caminho' || o.status === 'aceito_motoboy').length;
    const deliveredCount = orders.filter(o => o.status === 'entregue' || o.status === 'a_caminho' || o.status === 'aceito_motoboy').length;

    kpiPending.textContent = pendingCount;
    kpiPreparing.textContent = preparingCount;
    kpiReady.textContent = readyCount;
    kpiDelivered.textContent = deliveredCount;

    badgePending.textContent = pendingCount;
    badgePreparing.textContent = preparingCount;
    badgeReady.textContent = readyCount;
    if (badgeDelivery) {
      badgeDelivery.textContent = deliveryCount;
    }
  }

  function renderKanban() {
    listPending.innerHTML = '';
    listPreparing.innerHTML = '';
    listReady.innerHTML = '';
    if (listDelivery) listDelivery.innerHTML = '';

    const filteredOrders = orders.filter(order => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const clientName = order.clientName ? order.clientName.toLowerCase() : '';
      const orderId = order.id ? order.id.toString() : '';
      return clientName.includes(q) || orderId.includes(q);
    });

    const pending = filteredOrders.filter(o => o.status === 'pendente');
    const preparing = filteredOrders.filter(o => o.status === 'preparando');
    const ready = filteredOrders.filter(o => o.status === 'pronto');
    const delivery = filteredOrders.filter(o => o.status === 'a_caminho' || o.status === 'aceito_motoboy');

    function createCard(order) {
      const card = document.createElement('div');
      card.className = "bg-surface-container-low border border-outline-variant/15 rounded-xl p-5 order-card-hover cursor-pointer flex flex-col";
      card.setAttribute('data-id', order.id);

      const timestamp = order.timestamp ? new Date(order.timestamp).getTime() : Date.now();
      const elapsedMinutes = Math.floor((Date.now() - timestamp) / (1000 * 60)) || 0;

      const itemsList = order.items || [];
      const itemsSummary = itemsList.map(i => `${i.qty || 1}x ${i.name || 'Item'}`).join(', ');
      const address = cleanAddressForDisplay(order.clientAddress || 'Retirada na Padaria');

      let nextButtonHTML = '';
      if (order.status === 'pendente') {
        nextButtonHTML = `
          <button class="w-full py-2 bg-secondary text-on-primary rounded-lg font-bold text-xs hover:brightness-105 transition-all flex items-center justify-center gap-2 btn-next-stage select-none" data-id="${order.id}">
            Aceitar Pedido
          </button>
        `;
      } else if (order.status === 'preparando') {
        nextButtonHTML = `
          <button class="w-full py-2 bg-tertiary text-on-tertiary rounded-lg font-bold text-xs hover:bg-tertiary-container transition-all flex items-center justify-center gap-2 btn-next-stage select-none" data-id="${order.id}">
            Pronto para Entrega
          </button>
        `;
      } else if (order.status === 'pronto') {
        const isPickup = order.clientAddress && order.clientAddress.startsWith('Retirada na Padaria');
        if (isPickup) {
          nextButtonHTML = `
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container-high/50 px-3 py-1.5 rounded-lg border border-outline-variant/10">
                <span class="material-symbols-outlined text-sm">storefront</span>
                <span class="font-semibold">Retirada na Loja</span>
              </div>
              <button class="w-full py-2 bg-success text-on-primary rounded-lg font-bold text-xs hover:brightness-105 transition-all flex items-center justify-center gap-2 btn-finalize-pickup select-none" data-id="${order.id}">
                Finalizar Retirada
              </button>
            </div>
          `;
        } else {
          const assignedDriver = order.motoboy ? `${order.motoboy}` : 'Nenhum entregador';
          nextButtonHTML = `
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container-high/50 px-3 py-1.5 rounded-lg border border-outline-variant/10">
                <span class="material-symbols-outlined text-sm">delivery_dining</span>
                <span class="font-semibold">${assignedDriver}</span>
              </div>
              <button class="w-full py-2 border border-secondary text-secondary rounded-lg font-bold text-xs hover:bg-secondary/5 transition-all flex items-center justify-center gap-2 btn-open-drawer select-none" data-id="${order.id}">
                Despachar Pedido
              </button>
            </div>
          `;
        }
      } else if (order.status === 'a_caminho') {
        const assignedDriver = order.motoboy ? `${order.motoboy}` : 'Motoboy';
        nextButtonHTML = `
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container-high/50 px-3 py-1.5 rounded-lg border border-outline-variant/10">
              <span class="material-symbols-outlined text-sm">delivery_dining</span>
              <span class="font-semibold">${assignedDriver}</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-amber-600 bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20">
              <span class="material-symbols-outlined text-sm animate-pulse">hourglass_empty</span>
              <span class="font-semibold">Aguardando aceitar entrega</span>
            </div>
          </div>
        `;
      } else if (order.status === 'aceito_motoboy') {
        const assignedDriver = order.motoboy ? `${order.motoboy}` : 'Motoboy';
        nextButtonHTML = `
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container-high/50 px-3 py-1.5 rounded-lg border border-outline-variant/10">
              <span class="material-symbols-outlined text-sm">delivery_dining</span>
              <span class="font-semibold">${assignedDriver}</span>
            </div>
            <div class="space-y-1.5">
              <div class="flex items-center gap-2 text-xs text-blue-600 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                <span class="material-symbols-outlined text-sm">handshake</span>
                <span class="font-semibold">Pedido Aceito</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-success bg-success/10 px-3 py-1.5 rounded-lg border border-success/20">
                <span class="material-symbols-outlined text-sm">route</span>
                <span class="font-semibold">Aguardando entrega</span>
              </div>
            </div>
          </div>
        `;
      }

      let notesHTML = '';
      if (order.notes) {
        notesHTML = `
          <div class="flex items-center gap-1.5 mb-5 text-xs font-semibold text-error bg-error-container/30 px-3 py-2 rounded-xl border border-error/20">
            <span class="material-symbols-outlined text-[16px]">info</span>
            <span class="line-clamp-2">${order.notes}</span>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="flex justify-between items-start mb-3">
          <span class="text-secondary font-bold text-sm font-mono">#${order.id}</span>
          <span class="flex items-center text-xs text-on-surface-variant font-medium gap-1 bg-surface-container-high/40 px-2 py-0.5 rounded">
            <span class="material-symbols-outlined text-[14px]">schedule</span> ${elapsedMinutes} min
          </span>
        </div>
        <h4 class="font-serif text-lg font-bold text-on-surface mb-1">${order.clientName || 'Cliente'}</h4>
        <p class="text-xs text-on-surface-variant mb-4 leading-relaxed line-clamp-2">${itemsSummary}</p>
        <div class="flex items-start gap-1.5 mb-5 text-[11px] text-outline italic">
          <span class="material-symbols-outlined text-[13px] mt-0.5">location_on</span>
          <span class="line-clamp-1">${address}</span>
        </div>
        ${notesHTML}
        <div class="mt-auto">
          ${nextButtonHTML}
        </div>
      `;

      card.onclick = (e) => {
        if (e.target.closest('button')) return;
        openDrawer(order.id);
      };

      return card;
    }

    if (pending.length === 0) {
      listPending.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 opacity-35 select-none text-center text-on-surface-variant">
          <span class="material-symbols-outlined text-4xl mb-1">inbox</span>
          <p class="text-xs">Nenhum novo pedido</p>
        </div>
      `;
    } else {
      pending.forEach(o => listPending.appendChild(createCard(o)));
    }

    if (preparing.length === 0) {
      listPreparing.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 opacity-35 select-none text-center text-on-surface-variant">
          <span class="material-symbols-outlined text-4xl mb-1">oven</span>
          <p class="text-xs">Cozinha vazia</p>
        </div>
      `;
    } else {
      preparing.forEach(o => listPreparing.appendChild(createCard(o)));
    }

    if (ready.length === 0) {
      listReady.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 opacity-35 select-none text-center text-on-surface-variant">
          <span class="material-symbols-outlined text-4xl mb-1">check_circle</span>
          <p class="text-xs">Nenhum pronto a entregar</p>
        </div>
      `;
    } else {
      ready.forEach(o => listReady.appendChild(createCard(o)));
    }

    if (listDelivery) {
      if (delivery.length === 0) {
        listDelivery.innerHTML = `
          <div class="flex flex-col items-center justify-center py-12 opacity-35 select-none text-center text-on-surface-variant">
            <span class="material-symbols-outlined text-4xl mb-1">local_shipping</span>
            <p class="text-xs">Nenhuma entrega ativa</p>
          </div>
        `;
      } else {
        delivery.forEach(o => listDelivery.appendChild(createCard(o)));
      }
    }

    // Bind next stage button events
    document.querySelectorAll('.btn-next-stage').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = parseInt(btn.getAttribute('data-id'));
        advanceStage(id);
      };
    });

    document.querySelectorAll('.btn-open-drawer').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = parseInt(btn.getAttribute('data-id'));
        openDrawer(id);
      };
    });

    document.querySelectorAll('.btn-finalize-pickup').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const id = parseInt(btn.getAttribute('data-id'));
        if (confirm(`Deseja realmente finalizar a retirada do Pedido #${id}?`)) {
          try {
            const { error } = await supabaseClient
              .from('pedidos')
              .update({
                status: 'entregue',
                delivered_time: new Date().toISOString()
              })
              .eq('id', id);

            if (error) throw error;
            await loadDashboardData();
          } catch (err) {
            console.error("Erro ao finalizar retirada no Supabase:", err);
          }
        }
      };
    });
  }

  // --- STAGE ADVANCE LOGIC ---
  async function advanceStage(orderId) {
    stopNewOrderAlert();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    let nextStatus = order.status;
    if (order.status === 'pendente') {
      nextStatus = 'preparando';
    } else if (order.status === 'preparando') {
      nextStatus = 'pronto';
    }

    try {
      const { error } = await supabaseClient
        .from('pedidos')
        .update({ status: nextStatus })
        .eq('id', orderId);

      if (error) throw error;
      await loadDashboardData();
    } catch (err) {
      console.error("Erro ao avançar estágio do pedido no Supabase:", err);
    }

    if (selectedOrder && selectedOrder.id === orderId) {
      closeDrawer();
    }
  }

  // --- DRAWER SLIDE-OVER ---
  function openDrawer(orderId) {
    stopNewOrderAlert();
    selectedOrder = orders.find(o => o.id === orderId);
    if (!selectedOrder) return;

    drawerTitle.textContent = `Pedido #${selectedOrder.id}`;

    const timestamp = selectedOrder.timestamp ? new Date(selectedOrder.timestamp).getTime() : Date.now();
    const elapsedMinutes = Math.floor((Date.now() - timestamp) / (1000 * 60)) || 0;
    drawerTimestamp.textContent = `Recebido há ${elapsedMinutes} min`;

    // Update drawer status badge
    const drawerStatusBadge = document.getElementById('drawer-status-badge');
    if (drawerStatusBadge) {
      let statusHTML = '';
      if (selectedOrder.status === 'pendente') {
        statusHTML = `<span class="px-3 py-1 bg-secondary-container/20 text-secondary border border-secondary/20 rounded-full text-xs font-bold">Pendente</span>`;
      } else if (selectedOrder.status === 'preparando') {
        statusHTML = `<span class="px-3 py-1 bg-tertiary-container/20 text-tertiary border border-tertiary/20 rounded-full text-xs font-bold">Preparando</span>`;
      } else if (selectedOrder.status === 'pronto') {
        statusHTML = `<span class="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold">Pronto para Entrega</span>`;
      } else if (selectedOrder.status === 'a_caminho') {
        statusHTML = `<span class="px-3 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full text-xs font-bold animate-pulse">Aguardando aceitar entrega</span>`;
      } else if (selectedOrder.status === 'aceito_motoboy') {
        statusHTML = `
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center gap-1.5 text-xs text-blue-600 font-bold bg-blue-500/10 px-3 py-1 border border-blue-500/20 rounded-full">
              <span class="material-symbols-outlined text-[14px]">handshake</span>
              <span>Pedido Aceito</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-success font-bold bg-success/10 px-3 py-1 border border-success/20 rounded-full">
              <span class="material-symbols-outlined text-[14px]">route</span>
              <span>Aguardando entrega</span>
            </div>
          </div>
        `;
      } else if (selectedOrder.status === 'entregue') {
        statusHTML = `<span class="px-3 py-1 bg-success/15 text-success border border-success/20 rounded-full text-xs font-bold">Pedido entregue com sucesso</span>`;
      }
      drawerStatusBadge.innerHTML = statusHTML;
    }

    drawerClientName.textContent = selectedOrder.clientName || 'Cliente';
    drawerClientPhone.textContent = selectedOrder.clientPhone || 'Telefone não informado';
    drawerClientAddress.textContent = cleanAddressForDisplay(selectedOrder.clientAddress || 'Retirada na Padaria');

    drawerItemsContainer.innerHTML = '';
    const itemsList = selectedOrder.items || [];
    itemsList.forEach(item => {
      const row = document.createElement('div');
      row.className = "flex justify-between items-center text-sm text-on-surface";
      row.innerHTML = `
        <div class="flex gap-2">
          <span class="font-bold text-primary">${item.qty || 1}x</span>
          <span>${item.name || 'Item'}</span>
        </div>
        <span class="font-semibold">R$ ${((item.price || 0) * (item.qty || 1)).toFixed(2).replace('.', ',')}</span>
      `;
      drawerItemsContainer.appendChild(row);
    });

    const subtotal = selectedOrder.subtotal || 0;
    const deliveryFee = selectedOrder.deliveryFee || 0;
    const total = selectedOrder.total || 0;

    drawerSubtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;

    if (deliveryFee > 0) {
      drawerRowDeliveryFee.classList.remove('hidden');
      drawerDeliveryFee.textContent = `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`;
    } else {
      drawerRowDeliveryFee.classList.add('hidden');
    }

    drawerTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

    const paymentText = {
      'pix': 'PIX (Código digital)',
      'cartao_entrega': 'Cartão na Entrega',
      'dinheiro': 'Dinheiro em espécie'
    }[selectedOrder.paymentMethod] || selectedOrder.paymentMethod || 'Não informado';
    drawerPaymentMethod.textContent = paymentText;

    // Observações / Troco
    const drawerNotesContainer = document.getElementById('drawer-notes-container');
    const drawerNotes = document.getElementById('drawer-notes');
    if (selectedOrder.notes) {
      drawerNotesContainer.classList.remove('hidden');
      drawerNotes.textContent = selectedOrder.notes;
    } else {
      drawerNotesContainer.classList.add('hidden');
    }

    const isPickup = selectedOrder.clientAddress && selectedOrder.clientAddress.startsWith('Retirada na Padaria');
    if (selectedOrder.status === 'pronto' && !isPickup) {
      drawerMotoboyAssignPanel.classList.remove('hidden');
      selectMotoboy.value = selectedOrder.motoboy || '';
    } else {
      drawerMotoboyAssignPanel.classList.add('hidden');
    }

    renderDrawerButtons();

    detailDrawer.classList.remove('translate-x-full');
    drawerOverlay.classList.remove('hidden');
    setTimeout(() => {
      drawerOverlay.classList.remove('opacity-0');
    }, 10);
  }

  function closeDrawer() {
    detailDrawer.classList.add('translate-x-full');
    drawerOverlay.classList.add('opacity-0');
    setTimeout(() => {
      drawerOverlay.classList.add('hidden');
      selectedOrder = null;
    }, 300);
  }

  function renderDrawerButtons() {
    drawerActionsContainer.innerHTML = '';
    if (!selectedOrder) return;

    if (selectedOrder.status === 'entregue') {
      const infoText = document.createElement('div');
      infoText.className = "w-full text-center text-xs font-bold text-success py-3.5 bg-success/10 rounded-xl border border-success/20";
      infoText.innerHTML = `
        <div class="flex items-center justify-center gap-1.5" style="color: #10b981;">
          <span class="material-symbols-outlined text-[16px]">check_circle</span>
          <span>Pedido entregue com sucesso</span>
        </div>
      `;
      drawerActionsContainer.appendChild(infoText);
      return;
    }

    const btnCancel = document.createElement('button');
    btnCancel.className = "px-4 py-3 bg-surface-container border border-error/20 text-error rounded-xl font-bold text-sm hover:bg-error-container/20 transition-all active:scale-95 cursor-pointer";
    btnCancel.textContent = "Recusar";
    btnCancel.onclick = async () => {
      if (confirm(`Deseja realmente recusar e remover o Pedido #${selectedOrder.id}?`)) {
        try {
          const { error } = await supabaseClient
            .from('pedidos')
            .delete()
            .eq('id', selectedOrder.id);

          if (error) throw error;
          await loadDashboardData();
          closeDrawer();
        } catch (err) {
          console.error("Erro ao deletar pedido no Supabase:", err);
        }
      }
    };
    drawerActionsContainer.appendChild(btnCancel);

    if (['pendente', 'preparando', 'pronto'].includes(selectedOrder.status)) {
      const btnPrimary = document.createElement('button');
      btnPrimary.className = "flex-grow py-3 rounded-xl font-bold text-sm text-on-primary transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer";

      if (selectedOrder.status === 'pendente') {
        btnPrimary.classList.add('bg-secondary', 'hover:brightness-105');
        btnPrimary.innerHTML = '<span>Aceitar Pedido</span><span class="material-symbols-outlined text-sm">check</span>';
        btnPrimary.onclick = async () => {
          await advanceStage(selectedOrder.id);
          closeDrawer();
        };
      }
      else if (selectedOrder.status === 'preparando') {
        btnPrimary.classList.add('bg-tertiary', 'hover:bg-tertiary-container');
        btnPrimary.innerHTML = '<span>Marcar como Pronto</span><span class="material-symbols-outlined text-sm">restaurant</span>';
        btnPrimary.onclick = async () => {
          await advanceStage(selectedOrder.id);
          closeDrawer();
        };
      }
      else if (selectedOrder.status === 'pronto') {
        const isPickup = selectedOrder.clientAddress && selectedOrder.clientAddress.startsWith('Retirada na Padaria');
        if (isPickup) {
          btnPrimary.classList.add('bg-success', 'hover:brightness-105');
          btnPrimary.innerHTML = '<span>Finalizar Retirada</span><span class="material-symbols-outlined text-sm">done_all</span>';
          btnPrimary.onclick = async () => {
            try {
              const { error } = await supabaseClient
                .from('pedidos')
                .update({
                  status: 'entregue',
                  delivered_time: new Date().toISOString()
                })
                .eq('id', selectedOrder.id);

              if (error) throw error;
              await loadDashboardData();
              closeDrawer();
              alert(`Pedido #${selectedOrder.id} finalizado e entregue na loja!`);
            } catch (err) {
              console.error("Erro ao finalizar retirada no Supabase:", err);
            }
          };
        } else {
          btnPrimary.classList.add('bg-primary', 'hover:brightness-105');
          btnPrimary.innerHTML = '<span>Enviar pedido</span><span class="material-symbols-outlined text-sm">local_shipping</span>';
          btnPrimary.onclick = async () => {
            const driver = selectMotoboy.value;
            if (!driver) {
              alert('Selecione um motoboy disponível para levar a entrega!');
              return;
            }

            try {
              const { error } = await supabaseClient
                .from('pedidos')
                .update({
                  status: 'a_caminho',
                  motoboy: driver,
                  dispatched_time: new Date().toISOString()
                })
                .eq('id', selectedOrder.id);

              if (error) throw error;
              await loadDashboardData();
              closeDrawer();
              alert(`Pedido #${selectedOrder.id} enviado para o motoboy ${driver}!`);
            } catch (err) {
              console.error("Erro ao despachar pedido no Supabase:", err);
            }
          };
        }
      }
      drawerActionsContainer.appendChild(btnPrimary);
    }
  }

  // --- VIEW SWITCHING LOGIC ---
  function switchView(viewId) {
    activeView = viewId;

    viewOrders.classList.add('hidden');
    viewProducts.classList.add('hidden');
    viewStock.classList.add('hidden');
    viewMotoboys.classList.add('hidden');
    viewReports.classList.add('hidden');
    if (viewSettings) viewSettings.classList.add('hidden');

    const navButtons = [navOrders, navProducts, navStock, navMotoboys, navReports, navSettings].filter(Boolean);
    navButtons.forEach(btn => {
      btn.className = "w-full text-left flex items-center px-6 py-3 text-on-surface-variant font-medium hover:text-secondary hover:bg-surface-container-high transition-colors cursor-pointer select-none";
    });

    if (viewId === 'orders') {
      viewOrders.classList.remove('hidden');
      navOrders.className = "w-full text-left flex items-center px-6 py-3 text-secondary font-bold border-r-4 border-secondary bg-secondary-container/15 transition-transform active:scale-[0.98] cursor-pointer select-none";
      document.querySelector('header h2').textContent = "Atendimento";
      inputSearchOrders.parentElement.classList.remove('hidden');
      loadDashboardData();
    } else if (viewId === 'products') {
      viewProducts.classList.remove('hidden');
      navProducts.className = "w-full text-left flex items-center px-6 py-3 text-secondary font-bold border-r-4 border-secondary bg-secondary-container/15 transition-transform active:scale-[0.98] cursor-pointer select-none";
      document.querySelector('header h2').textContent = "Produtos";
      inputSearchOrders.parentElement.classList.add('hidden');
      renderProductsTab();
    } else if (viewId === 'stock') {
      viewStock.classList.remove('hidden');
      navStock.className = "w-full text-left flex items-center px-6 py-3 text-secondary font-bold border-r-4 border-secondary bg-secondary-container/15 transition-transform active:scale-[0.98] cursor-pointer select-none";
      document.querySelector('header h2').textContent = "Controle de Estoque";
      inputSearchOrders.parentElement.classList.add('hidden');
      renderStockTab();
    } else if (viewId === 'motoboys') {
      viewMotoboys.classList.remove('hidden');
      navMotoboys.className = "w-full text-left flex items-center px-6 py-3 text-secondary font-bold border-r-4 border-secondary bg-secondary-container/15 transition-transform active:scale-[0.98] cursor-pointer select-none";
      document.querySelector('header h2').textContent = "Entregadores";
      inputSearchOrders.parentElement.classList.add('hidden');
      renderMotoboysTab();
    } else if (viewId === 'reports') {
      viewReports.classList.remove('hidden');
      navReports.className = "w-full text-left flex items-center px-6 py-3 text-secondary font-bold border-r-4 border-secondary bg-secondary-container/15 transition-transform active:scale-[0.98] cursor-pointer select-none";
      document.querySelector('header h2').textContent = "Relatório de Vendas";
      inputSearchOrders.parentElement.classList.add('hidden');
      renderReportsTab();
    } else if (viewId === 'settings') {
      if (viewSettings) viewSettings.classList.remove('hidden');
      if (navSettings) navSettings.className = "w-full text-left flex items-center px-6 py-3 text-secondary font-bold border-r-4 border-secondary bg-secondary-container/15 transition-transform active:scale-[0.98] cursor-pointer select-none";
      document.querySelector('header h2').textContent = "Configurações";
      inputSearchOrders.parentElement.classList.add('hidden');
      loadSettingsData();
    }
  }

  navOrders.onclick = () => switchView('orders');
  navProducts.onclick = () => switchView('products');
  navStock.onclick = () => switchView('stock');
  navMotoboys.onclick = () => switchView('motoboys');
  navReports.onclick = () => switchView('reports');
  if (navSettings) navSettings.onclick = () => switchView('settings');

  // --- MOTOBOYS DATA LOAD & RENDER ---
  async function loadMotoboysData() {
    try {
      const { data, error } = await supabaseClient
        .from('motoboys')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      if (data) {
        motoboys = data;
      } else {
        motoboys = [];
      }
    } catch (e) {
      console.error("Error loading motoboys from Supabase", e);
      // Fallback
      motoboys = [
        { id: 1, name: 'Carlos Silva', status: 'online' },
        { id: 2, name: 'João Santos', status: 'online' },
        { id: 3, name: 'Roberto Silveira', status: 'offline' }
      ];
    }

    renderMotoboySelect();
    if (activeView === 'motoboys') {
      renderMotoboysTab();
    }
  }

  function renderMotoboySelect() {
    if (!selectMotoboy) return;
    // Guardar valor atualmente selecionado para não resetar se houver recarga
    const currentVal = selectMotoboy.value;
    selectMotoboy.innerHTML = '<option value="">Selecione um motoboy...</option>';
    motoboys.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.name;
      const statusLabel = m.status === 'online' ? 'Online' : 'Offline';
      opt.textContent = `${m.name} (${statusLabel})`;
      selectMotoboy.appendChild(opt);
    });
    // Restaurar valor se ele ainda existir nas opções
    if (currentVal && Array.from(selectMotoboy.options).some(opt => opt.value === currentVal)) {
      selectMotoboy.value = currentVal;
    }
  }

  function renderMotoboysTab() {
    if (!motoboysTableBody) return;
    motoboysTableBody.innerHTML = '';

    if (motoboys.length === 0) {
      motoboysTableBody.innerHTML = `
        <tr>
          <td colspan="3" class="py-8 text-center text-outline opacity-60">
            Nenhum entregador cadastrado. Cadastre um ao lado.
          </td>
        </tr>
      `;
      return;
    }

    motoboys.forEach(m => {
      const tr = document.createElement('tr');
      tr.className = "border-b border-outline-variant/10 text-on-surface hover:bg-surface-container-high transition-colors";

      const statusColor = m.status === 'online' ? 'bg-success/15 text-success' : 'bg-outline/20 text-outline';
      const statusLabel = m.status === 'online' ? 'Online' : 'Offline';

      tr.innerHTML = `
        <td class="py-4 px-4 font-bold">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-outline text-lg">delivery_dining</span>
            <span>${m.name}</span>
          </div>
        </td>
        <td class="py-4 px-4">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusColor}">
            <span class="w-1.5 h-1.5 rounded-full ${m.status === 'online' ? 'bg-success' : 'bg-outline'} ${m.status === 'online' ? 'animate-pulse' : ''}"></span>
            ${statusLabel}
          </span>
        </td>
        <td class="py-4 px-4 text-right">
          <button class="text-error hover:text-error/80 p-2 hover:bg-error-container/20 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center btn-delete-motoboy" data-id="${m.id}">
            <span class="material-symbols-outlined text-lg">delete</span>
          </button>
        </td>
      `;

      // Wire up the delete button
      tr.querySelector('.btn-delete-motoboy').onclick = async () => {
        if (confirm(`Tem certeza que deseja excluir o entregador "${m.name}"?`)) {
          try {
            const { error } = await supabaseClient
              .from('motoboys')
              .delete()
              .eq('id', m.id);

            if (error) throw error;
            alert('Entregador excluído com sucesso!');
            await loadMotoboysData();
          } catch (err) {
            console.error("Erro ao deletar entregador:", err);
            alert("Não foi possível excluir o entregador.");
          }
        }
      };

      motoboysTableBody.appendChild(tr);
    });
  }

  if (formMotoboy) {
    formMotoboy.onsubmit = async (e) => {
      e.preventDefault();
      const name = inputMotoboyName.value.trim();
      const password = inputMotoboyPassword.value.trim();
      if (!name || !password) return;

      try {
        const { error } = await supabaseClient
          .from('motoboys')
          .insert({
            name: name,
            password: password,
            status: 'offline'
          });

        if (error) throw error;

        inputMotoboyName.value = '';
        inputMotoboyPassword.value = '';
        alert('Entregador cadastrado com sucesso!');
        await loadMotoboysData();
      } catch (err) {
        console.error("Erro ao cadastrar entregador:", err);
        alert("Erro ao cadastrar entregador. Verifique se o nome já existe.");
      }
    };
  }

  // --- PRODUCTS VIEW RENDER ---
  function renderProductsTab() {
    productsListContainer.innerHTML = '';

    products.forEach(prod => {
      const card = document.createElement('div');
      card.className = "bg-surface-container-low border border-outline-variant/15 rounded-2xl overflow-hidden flex flex-col shadow-xs hover:shadow-md transition-all duration-300";

      const categoryLabel = prod.category === 'paes' ? '🥖 Pão' : '🍰 Bolo';
      const categoryColor = prod.category === 'paes' ? 'bg-secondary-container/20 text-secondary' : 'bg-tertiary-container/20 text-tertiary';

      const imageSrc = formatImageUrl(prod.image);
      const imageHtml = imageSrc 
        ? `<img src="${imageSrc}" alt="${prod.name}" class="w-full h-full object-cover" />`
        : `<div class="w-full h-full flex flex-col items-center justify-center bg-surface-container-high/40 text-outline/60 gap-2">
            <span class="material-symbols-outlined text-3xl">image</span>
            <span class="text-[10px] font-bold uppercase tracking-wider">Sem Imagem</span>
           </div>`;

      card.innerHTML = `
        <div class="relative aspect-video bg-surface-dim overflow-hidden border-b border-outline-variant/10">
          ${imageHtml}
          <span class="absolute top-3 left-3 ${categoryColor} px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">${categoryLabel}</span>
        </div>
        <div class="p-5 flex-grow flex flex-col justify-between gap-4">
          <div>
            <h4 class="font-serif text-lg font-bold text-on-surface line-clamp-1">${prod.name}</h4>
            <p class="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mt-1">${prod.desc}</p>
          </div>
          <div class="flex items-center justify-between border-t border-outline-variant/10 pt-3 mt-auto">
            <span class="font-serif text-base font-bold text-secondary">R$ ${prod.price.toFixed(2).replace('.', ',')}</span>
            <div class="flex gap-2">
              <button class="p-2 bg-surface hover:bg-surface-container-high border border-outline-variant/20 rounded-lg text-secondary hover:text-primary transition-all btn-edit-product active:scale-95 cursor-pointer" data-id="${prod.id}" title="Editar">
                <span class="material-symbols-outlined text-sm">edit</span>
              </button>
              <button class="p-2 bg-surface hover:bg-error-container/20 border border-outline-variant/20 rounded-lg text-error hover:text-red-700 transition-all btn-delete-product active:scale-95 cursor-pointer" data-id="${prod.id}" title="Excluir">
                <span class="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </div>
        </div>
      `;

      productsListContainer.appendChild(card);
    });

    productsListContainer.querySelectorAll('.btn-edit-product').forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.getAttribute('data-id'));
        openProductModal(id);
      };
    });

    productsListContainer.querySelectorAll('.btn-delete-product').forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.getAttribute('data-id'));
        deleteProduct(id);
      };
    });
  }

  // --- PRODUCT FORM MODAL LOGIC ---
  function openProductModal(productId = null) {
    formProduct.reset();
    formProductId.value = '';

    if (productId) {
      const prod = products.find(p => p.id === productId);
      if (!prod) return;

      modalProductTitle.textContent = "Editar Produto";
      formProductId.value = prod.id;
      formProductName.value = prod.name;
      formProductCategory.value = prod.category;
      formProductPrice.value = prod.price;
      formProductImage.value = prod.image || '';
      formProductDesc.value = prod.desc;
    } else {
      modalProductTitle.textContent = "Novo Produto";
    }

    modalProduct.classList.remove('hidden');
    setTimeout(() => {
      modalProduct.classList.remove('opacity-0');
      modalProductContainer.classList.replace('scale-95', 'scale-100');
    }, 10);
  }

  function closeProductModal() {
    modalProduct.classList.add('opacity-0');
    modalProductContainer.classList.replace('scale-100', 'scale-95');
    setTimeout(() => {
      modalProduct.classList.add('hidden');
    }, 300);
  }

  formProduct.onsubmit = async (e) => {
    e.preventDefault();

    const name = formProductName.value.trim();
    const category = formProductCategory.value;
    const price = parseFloat(formProductPrice.value) || 0;
    const image = formProductImage.value.trim();
    const desc = formProductDesc.value.trim();
    const idVal = formProductId.value;

    try {
      if (idVal) {
        const { error } = await supabaseClient
          .from('produtos')
          .update({
            name,
            category,
            price,
            image: image || null,
            description: desc
          })
          .eq('id', parseInt(idVal));

        if (error) throw error;
      } else {
        const { error } = await supabaseClient
          .from('produtos')
          .insert([{
            name,
            category,
            price,
            image: image || null,
            description: desc,
            stock: null
          }]);

        if (error) throw error;
      }

      await loadProductsData();
      closeProductModal();
      renderProductsTab();
    } catch (err) {
      console.error("Erro ao salvar produto no Supabase:", err);
      alert("Erro ao salvar produto. Verifique se a tabela 'produtos' tem a coluna 'description'.");
    }
  };

  async function deleteProduct(productId) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    if (confirm(`Deseja realmente excluir o produto "${prod.name}"?`)) {
      try {
        const { error } = await supabaseClient
          .from('produtos')
          .delete()
          .eq('id', productId);

        if (error) throw error;

        await loadProductsData();
        renderProductsTab();
      } catch (err) {
        console.error("Erro ao excluir produto no Supabase:", err);
        alert("Erro ao excluir produto.");
      }
    }
  }

  btnAddProduct.onclick = () => openProductModal();
  btnCloseProductModal.onclick = closeProductModal;
  btnCancelProductModal.onclick = closeProductModal;

  modalProduct.onclick = (e) => {
    if (e.target === modalProduct) {
      closeProductModal();
    }
  };

  // --- STOCK VIEW RENDER & LOGIC ---
  function renderStockTab() {
    stockTableBody.innerHTML = '';

    products.forEach(prod => {
      const tr = document.createElement('tr');
      tr.className = "border-b border-outline-variant/10 hover:bg-surface-container-high/20 transition-all";

      const categoryLabel = prod.category === 'paes' ? '🥖 Pão' : '🍰 Bolo';
      const isUnlimited = prod.stock === undefined || prod.stock === null || prod.stock === "";
      const stockVal = isUnlimited ? 0 : parseInt(prod.stock, 10);
      const minStockVal = isUnlimited ? 0 : parseInt(localStorage.getItem(`min_stock_${prod.id}`) || '3', 10);

      let statusBadgeHTML = '';
      if (isUnlimited) {
        statusBadgeHTML = '<span class="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider select-none">Ilimitado</span>';
      } else if (stockVal === 0) {
        statusBadgeHTML = '<span class="bg-red-500/10 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider select-none">Esgotado</span>';
      } else if (stockVal <= minStockVal) {
        statusBadgeHTML = `<span class="bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider select-none">${stockVal} Baixo Estoque</span>`;
      } else {
        statusBadgeHTML = `<span class="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider select-none">${stockVal} Disponíveis</span>`;
      }

      const imageSrc = formatImageUrl(prod.image);
      const imageHtml = imageSrc 
        ? `<img src="${imageSrc}" alt="${prod.name}" class="w-10 h-10 object-cover rounded-lg border border-outline-variant/10 flex-shrink-0" />`
        : `<div class="w-10 h-10 bg-surface-container border border-outline-variant/10 rounded-lg flex items-center justify-center text-outline/60 flex-shrink-0">
            <span class="material-symbols-outlined text-lg">image</span>
           </div>`;

      tr.innerHTML = `
        <td class="py-4 px-4 flex items-center gap-3">
          ${imageHtml}
          <span class="font-semibold text-on-surface">${prod.name}</span>
        </td>
        <td class="py-4 px-4 text-on-surface-variant">${categoryLabel}</td>
        <td class="py-4 px-4 text-on-surface-variant font-mono">R$ ${prod.price.toFixed(2).replace('.', ',')}</td>
        <td class="py-4 px-4">
          <div class="flex items-center justify-center gap-2 select-none">
            <button class="w-8 h-8 rounded-lg bg-surface-container border border-outline-variant/20 hover:bg-surface-container-high flex items-center justify-center text-xs font-bold btn-stock-minus active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" data-id="${prod.id}" ${isUnlimited ? 'disabled' : ''}>-</button>
            <input type="number" min="0" value="${stockVal}" class="w-16 bg-surface border border-outline-variant rounded-lg p-1.5 text-center text-sm focus:ring-1 focus:ring-secondary/50 focus:border-secondary outline-none transition-all text-on-surface font-semibold input-stock-value disabled:opacity-30 disabled:cursor-not-allowed" data-id="${prod.id}" ${isUnlimited ? 'disabled' : ''} />
            <button class="w-8 h-8 rounded-lg bg-surface-container border border-outline-variant/20 hover:bg-surface-container-high flex items-center justify-center text-xs font-bold btn-stock-plus active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" data-id="${prod.id}" ${isUnlimited ? 'disabled' : ''}>+</button>
            <button class="ml-2 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container-high btn-stock-toggle-limit transition-all active:scale-95 cursor-pointer" data-id="${prod.id}">
              ${isUnlimited ? 'Definir Limite' : 'Ilimitado'}
            </button>
          </div>
        </td>
        <td class="py-4 px-4">
          <div class="flex items-center justify-center select-none">
            <input type="number" min="0" value="${minStockVal}" class="w-16 bg-surface border border-outline-variant rounded-lg p-1.5 text-center text-sm focus:ring-1 focus:ring-secondary/50 focus:border-secondary outline-none transition-all text-on-surface font-semibold input-min-stock-value disabled:opacity-30 disabled:cursor-not-allowed" data-id="${prod.id}" ${isUnlimited ? 'disabled' : ''} />
          </div>
        </td>
        <td class="py-4 px-4 text-right">${statusBadgeHTML}</td>
      `;

      tr.querySelector('.btn-stock-minus').onclick = () => adjustStock(prod.id, -1);
      tr.querySelector('.btn-stock-plus').onclick = () => adjustStock(prod.id, 1);
      tr.querySelector('.input-stock-value').onchange = (e) => {
        const val = Math.max(0, parseInt(e.target.value, 10) || 0);
        updateStockValue(prod.id, val);
      };
      tr.querySelector('.input-min-stock-value').onchange = (e) => {
        const val = Math.max(0, parseInt(e.target.value, 10) || 0);
        localStorage.setItem(`min_stock_${prod.id}`, val);
        renderStockTab();
      };
      tr.querySelector('.btn-stock-toggle-limit').onclick = () => toggleStockLimit(prod.id);

      stockTableBody.appendChild(tr);
    });
  }

  async function adjustStock(productId, delta) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    if (prod.stock === undefined || prod.stock === null) return;

    let currentStock = parseInt(prod.stock, 10) || 0;
    const newStock = Math.max(0, currentStock + delta);

    try {
      const { error } = await supabaseClient
        .from('produtos')
        .update({ stock: newStock })
        .eq('id', productId);

      if (error) throw error;
      await loadProductsData();
      renderStockTab();
    } catch (err) {
      console.error("Erro ao ajustar estoque no Supabase:", err);
    }
  }

  async function updateStockValue(productId, value) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    try {
      const { error } = await supabaseClient
        .from('produtos')
        .update({ stock: value })
        .eq('id', productId);

      if (error) throw error;
      await loadProductsData();
      renderStockTab();
    } catch (err) {
      console.error("Erro ao atualizar estoque no Supabase:", err);
    }
  }

  async function toggleStockLimit(productId) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    let newStock = null;
    if (prod.stock === undefined || prod.stock === null || prod.stock === "") {
      const promptVal = prompt(`Defina a quantidade inicial em estoque para "${prod.name}":`, "10");
      if (promptVal === null) return; // Cancela se o usuário fechar o prompt
      newStock = Math.max(0, parseInt(promptVal, 10) || 0);
    }

    try {
      const { error } = await supabaseClient
        .from('produtos')
        .update({ stock: newStock })
        .eq('id', productId);

      if (error) throw error;
      await loadProductsData();
      renderStockTab();
    } catch (err) {
      console.error("Erro ao alternar limite de estoque no Supabase:", err);
    }
  }

  // --- SEARCH FILTER ---
  inputSearchOrders.oninput = (e) => {
    searchQuery = e.target.value;
    renderKanban();
  };

  // --- REFRESH ACTIONS ---
  btnRefreshDashboard.onclick = async () => {
    const icon = btnRefreshDashboard.querySelector('span');
    icon.classList.add('animate-spin');

    await loadProductsData();
    await loadMotoboysData();
    await loadDashboardData();

    if (activeView === 'products') {
      renderProductsTab();
    } else if (activeView === 'stock') {
      renderStockTab();
    } else if (activeView === 'motoboys') {
      renderMotoboysTab();
    } else if (activeView === 'reports') {
      renderReportsTab();
    }
    setTimeout(() => icon.classList.remove('animate-spin'), 600);
  };

  btnCloseDrawer.onclick = closeDrawer;
  drawerOverlay.onclick = closeDrawer;

  // --- SOUND ALERTS (HTML5 AUDIO & OFFLINE AUDIO SYNTHESIS) ---
  let notificationAudio = null;

  function bufferToWav(buffer) {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * 2 + 44;
    const bufferArr = new ArrayBuffer(length);
    const view = new DataView(bufferArr);
    const channels = [];
    let i;
    let sample;
    let pos = 0;
    let offset = 0;

    const setUint16 = (data) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };

    const setUint32 = (data) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    // Write WAV header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16);         // chunk length
    setUint16(1);          // sample format (raw)
    setUint16(numOfChan);  // channel count
    setUint32(buffer.sampleRate); // sample rate
    setUint32(buffer.sampleRate * 2 * numOfChan); // byte rate
    setUint16(numOfChan * 2); // block align
    setUint16(16);         // bits per sample
    setUint32(0x61746164); // "data" chunk
    setUint32(length - pos - 4); // chunk length

    for (i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF);
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([bufferArr], { type: 'audio/wav' });
  }

  async function initNotificationAudio() {
    try {
      const sampleRate = 44100;
      const duration = 1.5;
      const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, sampleRate * duration, sampleRate);
      
      const now = 0;
      // High-pitched metallic desk counter bell ("Ting!")
      const freqs = [1500, 2200, 3000, 3700];
      const gains = [0.15, 0.08, 0.05, 0.03];
      
      freqs.forEach((freq, index) => {
        const osc = offlineCtx.createOscillator();
        const gainNode = offlineCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(gains[index], now + 0.002);
        gainNode.gain.exponentialRampToValueAtTime(gains[index] * 0.1, now + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        
        osc.connect(gainNode);
        gainNode.connect(offlineCtx.destination);
        
        osc.start(now);
        osc.stop(now + 1.3);
      });
      
      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = bufferToWav(renderedBuffer);
      const audioUrl = URL.createObjectURL(wavBlob);
      notificationAudio = new Audio(audioUrl);
      notificationAudio.volume = 0.6;
    } catch (e) {
      console.warn("Failed to initialize offline audio chime:", e);
    }
  }

  // Bless HTML5 Audio element on first user gesture to bypass autoplay block
  // Bless HTML5 Audio element on first user gesture to bypass autoplay block (using capture phase to bypass stopPropagation)
  const blessAudio = () => {
    if (notificationAudio) {
      notificationAudio.play().then(() => {
        notificationAudio.pause();
        notificationAudio.currentTime = 0;
        console.log("Notification audio element blessed and unlocked!");
        // Remove listeners once successfully blessed
        document.removeEventListener('click', blessAudio, { capture: true });
        document.removeEventListener('keydown', blessAudio, { capture: true });
        document.removeEventListener('touchstart', blessAudio, { capture: true });
      }).catch(e => {
        console.warn("Could not bless audio yet:", e);
      });
    }
  };
  document.addEventListener('click', blessAudio, { capture: true });
  document.addEventListener('keydown', blessAudio, { capture: true });
  document.addEventListener('touchstart', blessAudio, { capture: true });

  function playNewOrderSound() {
    if (!soundEnabled || !notificationAudio) return;
    
    stopNewOrderAlert();
    
    let ringCount = 0;
    const maxRings = 10; // 10 rings spaced by 3 seconds = 30 seconds
    
    const ring = () => {
      if (!soundEnabled || ringCount >= maxRings || !notificationAudio) {
        stopNewOrderAlert();
        return;
      }
      
      try {
        notificationAudio.currentTime = 0;
        notificationAudio.play().catch(e => {
          console.warn("Playback prevented:", e);
        });
      } catch (e) {
        console.warn("Audio play error:", e);
      }
      
      ringCount++;
    };
    
    // Play immediately
    ring();
    
    // Repeat every 3 seconds
    soundInterval = setInterval(ring, 3000);
  }

  function stopNewOrderAlert() {
    if (soundInterval) {
      clearInterval(soundInterval);
      soundInterval = null;
    }
    if (notificationAudio) {
      try {
        notificationAudio.pause();
        notificationAudio.currentTime = 0;
      } catch (e) {}
    }
  }

  function updateSoundButtonUI() {
    if (!btnToggleSound) return;
    const icon = btnToggleSound.querySelector('span');
    if (!icon) return;
    
    if (soundEnabled) {
      icon.textContent = 'notifications_active';
      btnToggleSound.title = 'Alerta Sonoro (Ativado)';
      btnToggleSound.classList.remove('text-outline');
      btnToggleSound.classList.add('text-secondary');
    } else {
      icon.textContent = 'notifications_off';
      btnToggleSound.title = 'Alerta Sonoro (Desativado)';
      btnToggleSound.classList.remove('text-secondary');
      btnToggleSound.classList.add('text-outline');
    }
  }

  if (btnToggleSound) {
    updateSoundButtonUI();
    btnToggleSound.onclick = () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('dashboard_sound_alerts', soundEnabled ? 'enabled' : 'disabled');
      updateSoundButtonUI();
      if (soundEnabled) {
        playNewOrderSound();
      } else {
        stopNewOrderAlert();
      }
    };
  }

  // --- REPORTS VIEW RENDER & LOGIC ---
  function renderReportsTab() {
    if (!reportsTableBody) return;

    const filterDateVal = reportFilterDate.value;
    const filterTypeVal = reportFilterType.value;
    const searchVal = reportSearch.value.trim().toLowerCase();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = todayStart - (7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    // Filter only completed/delivered orders
    const completedOrders = orders.filter(o => o.status === 'entregue');

    const filtered = completedOrders.filter(order => {
      // Date Filter
      const orderTime = order.timestamp ? new Date(order.timestamp).getTime() : 0;
      let dateMatch = true;
      if (filterDateVal === 'today') {
        dateMatch = orderTime >= todayStart;
      } else if (filterDateVal === '7days') {
        dateMatch = orderTime >= sevenDaysAgo;
      } else if (filterDateVal === 'month') {
        dateMatch = orderTime >= monthStart;
      }

      if (!dateMatch) return false;

      // Type Filter
      const isPickup = order.clientAddress === 'Retirada na Padaria';
      let typeMatch = true;
      if (filterTypeVal === 'delivery') {
        typeMatch = !isPickup;
      } else if (filterTypeVal === 'pickup') {
        typeMatch = isPickup;
      }

      if (!typeMatch) return false;

      // Search Filter
      let searchMatch = true;
      if (searchVal) {
        const clientName = order.clientName ? order.clientName.toLowerCase() : '';
        const orderId = order.id ? order.id.toString() : '';
        searchMatch = clientName.includes(searchVal) || orderId.includes(searchVal);
      }

      return searchMatch;
    });

    // Calculate KPIs
    const totalRevenue = filtered.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalDelivery = filtered.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    const ordersCount = filtered.length;
    const averageOrder = ordersCount > 0 ? (totalRevenue / ordersCount) : 0;

    // Display KPIs
    repKpiRevenue.textContent = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;
    repKpiOrders.textContent = ordersCount;
    repKpiDelivery.textContent = `R$ ${totalDelivery.toFixed(2).replace('.', ',')}`;
    repKpiAverage.textContent = `R$ ${averageOrder.toFixed(2).replace('.', ',')}`;

    // Populate Table
    reportsTableBody.innerHTML = '';

    if (filtered.length === 0) {
      reportsTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="py-8 text-center text-outline opacity-60">
            Nenhum pedido entregue encontrado com os filtros selecionados.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(order => {
      const tr = document.createElement('tr');
      tr.className = "border-b border-outline-variant/10 text-on-surface hover:bg-surface-container-high/40 transition-colors";

      const isPickup = order.clientAddress === 'Retirada na Padaria';
      const typeBadge = isPickup 
        ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-success/10 text-success">
             <span class="w-1.5 h-1.5 rounded-full bg-success"></span>Retirada
           </span>`
        : `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600">
             <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Entrega
           </span>`;

      const formattedDate = order.timestamp 
        ? new Date(order.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'N/A';

      const paymentText = {
        'pix': 'PIX',
        'cartao_entrega': 'Cartão na Entrega',
        'dinheiro': 'Dinheiro'
      }[order.paymentMethod] || order.paymentMethod || 'Não informado';

      tr.innerHTML = `
        <td class="py-4 px-4 font-mono font-bold text-secondary">#${order.id}</td>
        <td class="py-4 px-4 font-bold">${order.clientName || 'Cliente'}</td>
        <td class="py-4 px-4">${typeBadge}</td>
        <td class="py-4 px-4 text-xs font-medium text-on-surface-variant">${formattedDate}</td>
        <td class="py-4 px-4 text-xs font-medium text-on-surface-variant">${paymentText}</td>
        <td class="py-4 px-4 text-right font-mono font-bold text-primary">R$ ${order.total.toFixed(2).replace('.', ',')}</td>
        <td class="py-4 px-4 text-right">
          <div class="flex items-center justify-end gap-2">
            <button class="px-3 py-1.5 bg-surface-container border border-outline-variant/30 text-secondary hover:text-primary hover:border-secondary/40 rounded-lg text-xs font-bold transition-all btn-view-report-detail active:scale-95 cursor-pointer flex items-center justify-center gap-1.5" data-id="${order.id}">
              <span class="material-symbols-outlined text-[14px]">visibility</span>
              <span>Detalhes</span>
            </button>
            <button class="p-1.5 bg-surface hover:bg-error-container/20 border border-outline-variant/20 rounded-lg text-error hover:text-red-700 transition-all btn-delete-report-sale active:scale-95 cursor-pointer flex items-center justify-center" data-id="${order.id}" title="Excluir Venda">
              <span class="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        </td>
      `;

      tr.querySelector('.btn-view-report-detail').onclick = () => {
        openDrawer(order.id);
      };

      tr.querySelector('.btn-delete-report-sale').onclick = async () => {
        if (confirm(`Deseja realmente excluir a venda do Pedido #${order.id} do relatório?`)) {
          try {
            const { error } = await supabaseClient
              .from('pedidos')
              .delete()
              .eq('id', order.id);

            if (error) throw error;
            alert('Venda excluída com sucesso!');
            await loadDashboardData();
          } catch (err) {
            console.error("Erro ao deletar venda do relatório:", err);
            alert("Não foi possível excluir a venda.");
          }
        }
      };

      reportsTableBody.appendChild(tr);
    });
  }

  // Bind filter events
  if (reportFilterDate) reportFilterDate.onchange = renderReportsTab;
  if (reportFilterType) reportFilterType.onchange = renderReportsTab;
  if (reportSearch) reportSearch.oninput = renderReportsTab;

  // --- REAL-TIME SYNC VIA SUPABASE ---
  // Inscrições Realtime para pedidos, produtos e motoboys
  const ordersSubscription = supabaseClient
    .channel('public:pedidos')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, (payload) => {
      console.log('Pedidos atualizados no Supabase:', payload);
      if (payload.eventType === 'INSERT') {
        playNewOrderSound();
      }
      loadDashboardData();
    })
    .subscribe();

  const productsSubscription = supabaseClient
    .channel('public:produtos')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, (payload) => {
      console.log('Produtos atualizados no Supabase:', payload);
      loadProductsData().then(() => {
        if (activeView === 'products') renderProductsTab();
        if (activeView === 'stock') renderStockTab();
      });
    })
    .subscribe();

  // --- SETTINGS LOGIC ---
  async function loadSettingsData() {
    try {
      const { data, error } = await supabaseClient
        .from('configuracoes')
        .select('*');

      if (error) throw error;

      // Map values
      const config = {};
      if (data) {
        data.forEach(item => {
          config[item.chave] = item.valor;
        });
      }

      // Preencher formulário com fallbacks
      inputSettingsWhatsapp.value = config['whatsapp_phone'] || localStorage.getItem('config_whatsapp_phone') || '(12) 99753-1707';
      inputSettingsAddress.value = config['store_address'] || localStorage.getItem('config_store_address') || 'Retirada na Padaria';
      inputSettingsOpening.value = config['opening_time'] || localStorage.getItem('config_opening_time') || '06:00';
      inputSettingsClosing.value = config['closing_time'] || localStorage.getItem('config_closing_time') || '20:00';
      inputSettingsDeliveryFee.value = config['delivery_fee'] || localStorage.getItem('config_delivery_fee') || '4.00';
      inputSettingsMaxItems.value = config['max_items_order'] || localStorage.getItem('config_max_items_order') || '10';

    } catch (err) {
      console.warn("Erro ao buscar configurações do Supabase. Carregando dados locais.", err);
      // Fallback local
      inputSettingsWhatsapp.value = localStorage.getItem('config_whatsapp_phone') || '(12) 99753-1707';
      inputSettingsAddress.value = localStorage.getItem('config_store_address') || 'Retirada na Padaria';
      inputSettingsOpening.value = localStorage.getItem('config_opening_time') || '06:00';
      inputSettingsClosing.value = localStorage.getItem('config_closing_time') || '20:00';
      inputSettingsDeliveryFee.value = localStorage.getItem('config_delivery_fee') || '4.00';
      inputSettingsMaxItems.value = localStorage.getItem('config_max_items_order') || '10';
    }
  }

  if (formSettings) {
    formSettings.onsubmit = async (e) => {
      e.preventDefault();

      const btnText = document.getElementById('btn-save-settings-text');
      const btnIcon = document.getElementById('btn-save-settings-icon');

      if (btnText) btnText.textContent = "Salvando...";
      if (btnIcon) btnIcon.textContent = "sync";

      const payload = [
        { chave: 'whatsapp_phone', valor: inputSettingsWhatsapp.value.trim() },
        { chave: 'store_address', valor: inputSettingsAddress.value.trim() },
        { chave: 'opening_time', valor: inputSettingsOpening.value.trim() },
        { chave: 'closing_time', valor: inputSettingsClosing.value.trim() },
        { chave: 'delivery_fee', valor: parseFloat(inputSettingsDeliveryFee.value).toFixed(2) },
        { chave: 'max_items_order', valor: parseInt(inputSettingsMaxItems.value, 10).toString() }
      ];

      // Salvar em localStorage primeiro como garantia
      payload.forEach(item => {
        localStorage.setItem(`config_${item.chave}`, item.valor);
      });

      try {
        // Enviar para o Supabase
        const { error } = await supabaseClient
          .from('configuracoes')
          .upsert(payload, { onConflict: 'chave' });

        if (error) throw error;
        
        alert("Configurações salvas com sucesso!");
      } catch (err) {
        console.error("Erro ao salvar configurações no Supabase:", err);
        alert("Configurações salvas localmente (tabela 'configuracoes' não encontrada ou falha no Supabase).");
      } finally {
        if (btnText) btnText.textContent = "Salvar Configurações";
        if (btnIcon) btnIcon.textContent = "save";
      }
    };
  }

  const motoboysSubscription = supabaseClient
    .channel('public:motoboys')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'motoboys' }, (payload) => {
      console.log('Motoboys atualizados no Supabase:', payload);
      loadMotoboysData();
    })
    .subscribe();

  // --- INITIAL LOAD ---
  initNotificationAudio();
  loadProductsData().then(() => {
    loadMotoboysData().then(() => {
      loadDashboardData();
    });
  });
});
