/* ==========================================================================
   PADARIA LAMIM - Clerk Dashboard App Logic (Tailwind & LocalStorage Sync)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  let orders = [];
  let products = [];
  let motoboys = [];
  let selectedOrder = null;
  let searchQuery = '';
  let activeView = 'orders'; // 'orders', 'products', 'stock', 'motoboys'

  // --- UI ELEMENTS ---
  const listPending = document.getElementById('list-pending');
  const listPreparing = document.getElementById('list-preparing');
  const listReady = document.getElementById('list-ready');

  const badgePending = document.getElementById('badge-pending');
  const badgePreparing = document.getElementById('badge-preparing');
  const badgeReady = document.getElementById('badge-ready');

  const kpiPending = document.getElementById('kpi-pending');
  const kpiPreparing = document.getElementById('kpi-preparing');
  const kpiReady = document.getElementById('kpi-ready');
  const kpiDelivered = document.getElementById('kpi-delivered');

  const inputSearchOrders = document.getElementById('input-search-orders');
  const btnRefreshDashboard = document.getElementById('btn-refresh-dashboard');

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

  const viewOrders = document.getElementById('view-orders');
  const viewProducts = document.getElementById('view-products');
  const viewStock = document.getElementById('view-stock');
  const viewMotoboys = document.getElementById('view-motoboys');

  const formMotoboy = document.getElementById('form-motoboy');
  const inputMotoboyName = document.getElementById('input-motoboy-name');
  const inputMotoboyPassword = document.getElementById('input-motoboy-password');
  const motoboysTableBody = document.getElementById('motoboys-table-body');

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
          timestamp: item.created_at
        }));
      }
    } catch (e) {
      console.error("Error loading orders from Supabase", e);
    }

    renderKPIs();
    renderKanban();
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
        // Fallback local se o banco estiver vazio
        products = [
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
    const deliveredCount = orders.filter(o => o.status === 'entregue' || o.status === 'a_caminho').length;

    kpiPending.textContent = pendingCount;
    kpiPreparing.textContent = preparingCount;
    kpiReady.textContent = readyCount;
    kpiDelivered.textContent = deliveredCount;

    badgePending.textContent = pendingCount;
    badgePreparing.textContent = preparingCount;
    badgeReady.textContent = readyCount;
  }

  function renderKanban() {
    listPending.innerHTML = '';
    listPreparing.innerHTML = '';
    listReady.innerHTML = '';

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

    function createCard(order) {
      const card = document.createElement('div');
      card.className = "bg-surface-container-low border border-outline-variant/15 rounded-xl p-5 order-card-hover cursor-pointer flex flex-col";
      card.setAttribute('data-id', order.id);

      const timestamp = order.timestamp ? new Date(order.timestamp).getTime() : Date.now();
      const elapsedMinutes = Math.floor((Date.now() - timestamp) / (1000 * 60)) || 0;

      const itemsList = order.items || [];
      const itemsSummary = itemsList.map(i => `${i.qty || 1}x ${i.name || 'Item'}`).join(', ');
      const address = order.clientAddress || 'Retirada na Padaria';

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
  }

  // --- STAGE ADVANCE LOGIC ---
  async function advanceStage(orderId) {
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
    selectedOrder = orders.find(o => o.id === orderId);
    if (!selectedOrder) return;

    drawerTitle.textContent = `Pedido #${selectedOrder.id}`;

    const timestamp = selectedOrder.timestamp ? new Date(selectedOrder.timestamp).getTime() : Date.now();
    const elapsedMinutes = Math.floor((Date.now() - timestamp) / (1000 * 60)) || 0;
    drawerTimestamp.textContent = `Recebido há ${elapsedMinutes} min`;

    drawerClientName.textContent = selectedOrder.clientName || 'Cliente';
    drawerClientPhone.textContent = selectedOrder.clientPhone || 'Telefone não informado';
    drawerClientAddress.textContent = selectedOrder.clientAddress || 'Retirada na Padaria';

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

    if (selectedOrder.status === 'pronto') {
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

    const btnPrimary = document.createElement('button');
    btnPrimary.className = "flex-grow py-3 rounded-xl font-bold text-sm text-on-primary transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer";

    if (selectedOrder.status === 'pendente') {
      btnPrimary.classList.add('bg-secondary', 'hover:brightness-105');
      btnPrimary.innerHTML = '<span>Aceitar Pedido</span><span class="material-symbols-outlined text-sm">check</span>';
      btnPrimary.onclick = async () => {
        await advanceStage(selectedOrder.id);
        closeDrawer();
      };
      drawerActionsContainer.appendChild(btnPrimary);
    }
    else if (selectedOrder.status === 'preparando') {
      btnPrimary.classList.add('bg-tertiary', 'hover:bg-tertiary-container');
      btnPrimary.innerHTML = '<span>Marcar como Pronto</span><span class="material-symbols-outlined text-sm">restaurant</span>';
      btnPrimary.onclick = async () => {
        await advanceStage(selectedOrder.id);
        closeDrawer();
      };
      drawerActionsContainer.appendChild(btnPrimary);
    }
    else if (selectedOrder.status === 'pronto') {
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

    const navButtons = [navOrders, navProducts, navStock, navMotoboys];
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
    }
  }

  navOrders.onclick = () => switchView('orders');
  navProducts.onclick = () => switchView('products');
  navStock.onclick = () => switchView('stock');
  navMotoboys.onclick = () => switchView('motoboys');

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

      card.innerHTML = `
        <div class="relative aspect-video bg-surface-dim overflow-hidden border-b border-outline-variant/10">
          <img src="${prod.image}" alt="${prod.name}" class="w-full h-full object-cover" />
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
      formProductImage.value = prod.image;
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
            image,
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
            image,
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

      let statusBadgeHTML = '';
      if (isUnlimited) {
        statusBadgeHTML = '<span class="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider select-none">Ilimitado</span>';
      } else if (stockVal > 0) {
        statusBadgeHTML = `<span class="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider select-none">${stockVal} Disponíveis</span>`;
      } else {
        statusBadgeHTML = '<span class="bg-red-500/10 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider select-none">Esgotado</span>';
      }

      tr.innerHTML = `
        <td class="py-4 px-4 flex items-center gap-3">
          <img src="${prod.image}" alt="${prod.name}" class="w-10 h-10 object-cover rounded-lg border border-outline-variant/10 flex-shrink-0" />
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
        <td class="py-4 px-4 text-right">${statusBadgeHTML}</td>
      `;

      tr.querySelector('.btn-stock-minus').onclick = () => adjustStock(prod.id, -1);
      tr.querySelector('.btn-stock-plus').onclick = () => adjustStock(prod.id, 1);
      tr.querySelector('.input-stock-value').onchange = (e) => {
        const val = Math.max(0, parseInt(e.target.value, 10) || 0);
        updateStockValue(prod.id, val);
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
      newStock = 10;
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
    }
    setTimeout(() => icon.classList.remove('animate-spin'), 600);
  };

  btnCloseDrawer.onclick = closeDrawer;
  drawerOverlay.onclick = closeDrawer;

  // --- REAL-TIME SYNC VIA SUPABASE ---
  // Inscrições Realtime para pedidos, produtos e motoboys
  const ordersSubscription = supabaseClient
    .channel('public:pedidos')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, (payload) => {
      console.log('Pedidos atualizados no Supabase:', payload);
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

  const motoboysSubscription = supabaseClient
    .channel('public:motoboys')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'motoboys' }, (payload) => {
      console.log('Motoboys atualizados no Supabase:', payload);
      loadMotoboysData();
    })
    .subscribe();

  // --- INITIAL LOAD ---
  loadProductsData().then(() => {
    loadMotoboysData().then(() => {
      loadDashboardData();
    });
  });
});
