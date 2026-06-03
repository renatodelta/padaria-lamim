/* ==========================================================================
   PADARIA LAMIM - Motoboy App Logic (Tailwind & LocalStorage Sync)
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

  // --- CONFIGURATION ---
  let currentRider = '';
  let isOnline = true;
  let orders = [];
  let motoboysList = [];

  // --- UI ELEMENTS ---
  const txtRiderName = document.getElementById('txt-rider-name');
  const btnStatusToggle = document.getElementById('btn-status-toggle');
  const txtStatusLabel = document.getElementById('txt-status-label');
  const btnLogout = document.getElementById('btn-logout');

  const btnTabActive = document.getElementById('btn-tab-active');
  const btnTabHistory = document.getElementById('btn-tab-history');
  const paneActive = document.getElementById('pane-active');
  const paneHistory = document.getElementById('pane-history');
  const activeBadge = document.getElementById('active-badge');

  const activeDeliveryContainer = document.getElementById('active-delivery-container');
  const historyDeliveriesList = document.getElementById('history-deliveries-list');

  // Success modal elements
  const successOverlay = document.getElementById('success-overlay');
  const btnSuccessClose = document.getElementById('btn-success-close');

  // Login Screen elements
  const loginOverlay = document.getElementById('login-overlay');
  const formLogin = document.getElementById('form-login');
  const selectLoginRider = document.getElementById('select-login-rider');
  const inputLoginPassword = document.getElementById('input-login-password');

  // --- LOAD MOTOBOYS & POPULATE SELECT ---
  async function loadMotoboys() {
    try {
      const { data, error } = await supabaseClient
        .from('motoboys')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        motoboysList = data;
        
        // Populate select-login-rider
        selectLoginRider.innerHTML = '<option value="">Selecione seu nome...</option>';
        motoboysList.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m.name;
          opt.textContent = m.name;
          selectLoginRider.appendChild(opt);
        });

        // Check active session
        const savedRider = localStorage.getItem('motoboy_app_current_rider');
        if (savedRider && motoboysList.some(m => m.name === savedRider)) {
          // Logged in!
          currentRider = savedRider;
          txtRiderName.textContent = currentRider;
          loginOverlay.classList.add('hidden');

          // Sync status
          const activeRiderData = motoboysList.find(m => m.name === currentRider);
          if (activeRiderData) {
            isOnline = activeRiderData.status === 'online';
            updateStatusUI();
          }

          loadDeliveries();
        } else {
          // Not logged in, show login form
          localStorage.removeItem('motoboy_app_current_rider');
          currentRider = '';
          txtRiderName.textContent = 'Não Logado';
          loginOverlay.classList.remove('hidden');
        }
      } else {
        selectLoginRider.innerHTML = '<option value="">Sem entregadores cadastrados</option>';
        currentRider = '';
        txtRiderName.textContent = 'Não Logado';
        loginOverlay.classList.remove('hidden');
      }
    } catch (err) {
      console.error("Erro ao carregar entregadores:", err);
      // Fallback local
      motoboysList = [
        { name: 'Carlos Silva', status: 'online', password: '123' },
        { name: 'João Santos', status: 'online', password: '123' },
        { name: 'Roberto Silveira', status: 'offline', password: '123' }
      ];
      selectLoginRider.innerHTML = '<option value="">Selecione seu nome...</option>';
      motoboysList.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.name;
        opt.textContent = m.name;
        selectLoginRider.appendChild(opt);
      });
      loginOverlay.classList.remove('hidden');
    }
  }

  // Handle Login form submit
  if (formLogin) {
    formLogin.onsubmit = async (e) => {
      e.preventDefault();
      const selectedName = selectLoginRider.value;
      const enteredPassword = inputLoginPassword.value.trim();

      if (!selectedName) {
        alert('Selecione seu nome da lista!');
        return;
      }
      if (!enteredPassword) {
        alert('Digite sua senha de acesso!');
        return;
      }

      // Procura entregador
      const rider = motoboysList.find(m => m.name === selectedName);
      if (!rider) {
        alert('Entregador não encontrado!');
        return;
      }

      // Validação de senha simples
      if (rider.password === enteredPassword) {
        currentRider = selectedName;
        txtRiderName.textContent = currentRider;
        localStorage.setItem('motoboy_app_current_rider', currentRider);
        
        // Log in status = online
        isOnline = true;
        updateStatusUI();
        
        try {
          await supabaseClient
            .from('motoboys')
            .update({ status: 'online' })
            .eq('name', currentRider);
        } catch (err) {
          console.error("Erro ao definir status online:", err);
        }

        // Hide overlay and load deliveries
        loginOverlay.classList.add('hidden');
        inputLoginPassword.value = '';
        loadDeliveries();
      } else {
        alert('Senha incorreta! Tente novamente ou peça ajuda ao administrador.');
      }
    };
  }

  // Handle Logout button click
  if (btnLogout) {
    btnLogout.onclick = async () => {
      if (confirm('Tem certeza que deseja sair do seu perfil?')) {
        // Set offline in database first if rider is logged in
        if (currentRider) {
          try {
            await supabaseClient
              .from('motoboys')
              .update({ status: 'offline' })
              .eq('name', currentRider);
          } catch (err) {
            console.error("Erro ao definir status offline no logout:", err);
          }
        }

        localStorage.removeItem('motoboy_app_current_rider');
        currentRider = '';
        txtRiderName.textContent = 'Não Logado';
        
        // Show login screen
        loginOverlay.classList.remove('hidden');
        inputLoginPassword.value = '';
        selectLoginRider.value = '';
      }
    };
  }

  // --- LOAD DATA ---
  // --- LOAD DATA FROM SUPABASE ---
  async function loadDeliveries() {
    try {
      const { data, error } = await supabaseClient
        .from('pedidos')
        .select('*')
        .eq('motoboy', currentRider)
        .in('status', ['a_caminho', 'entregue'])
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
      } else {
        orders = [];
      }
    } catch (e) {
      console.error("Error loading deliveries from Supabase", e);
      orders = [];
    }

    const active = orders.filter(o => o.status === 'a_caminho');
    const history = orders.filter(o => o.status === 'entregue');

    activeBadge.textContent = active.length;

    renderActive(active);
    renderHistory(history);
  }

  // --- RENDER ACTIVE ---
  function renderActive(activeOrders) {
    activeDeliveryContainer.innerHTML = '';

    if (!isOnline) {
      activeDeliveryContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16 text-center text-on-surface-variant opacity-40 select-none">
          <span class="material-symbols-outlined text-5xl mb-2">wifi_off</span>
          <p class="text-sm font-bold">Você está Offline</p>
          <p class="text-xs">Ative a conexão no topo para receber entregas.</p>
        </div>
      `;
      activeBadge.textContent = '0';
      return;
    }

    if (activeOrders.length === 0) {
      activeDeliveryContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16 text-center text-on-surface-variant opacity-40 select-none">
          <span class="material-symbols-outlined text-5xl mb-2">bike_scooter</span>
          <p class="text-sm font-bold">Nenhuma Rota Pendente</p>
          <p class="text-xs mt-1">Aguarde o atendente despachar um pedido para você no painel.</p>
        </div>
      `;
      return;
    }

    activeOrders.forEach(order => {
      const card = document.createElement('div');
      card.className = "space-y-4";
      
      let notesHTML = '';
      if (order.notes && order.notes.trim()) {
        notesHTML = `
        <!-- Customer notes / Instructions -->
        <div class="clay-card rounded-xl p-4 flex items-start gap-3">
          <span class="material-symbols-outlined text-outline text-lg">info</span>
          <div>
            <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Instrução do Cliente</p>
            <p class="text-xs text-on-surface-variant italic mt-0.5">${order.notes}</p>
          </div>
        </div>
        `;
      }
      
      const itemsListHTML = order.items.map(item => `
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface-dim">
            <img alt="${item.name}" class="w-full h-full object-cover" src="${formatImageUrl(item.image || item.img)}"/>
          </div>
          <div class="flex-grow">
            <p class="font-bold text-sm text-on-surface">${item.qty}x ${item.name}</p>
            <p class="text-xs text-outline">Preço Unitário: R$ ${item.price.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
      `).join('');

      card.innerHTML = `
        <!-- Notification Banner -->
        <div class="animate-pulse">
          <div class="bg-secondary-container/20 border border-secondary/20 p-4 rounded-xl flex items-center gap-3">
            <span class="material-symbols-outlined text-secondary" style="font-variation-settings: 'FILL' 1;">notifications_active</span>
            <span class="text-xs font-bold text-on-secondary-fixed-variant">Nova Entrega Disponível</span>
          </div>
        </div>

        <!-- Main Order Detail Card -->
        <div class="clay-card rounded-xl overflow-hidden shadow-sm flex flex-col relative">
          <!-- Real Route Google Maps Section -->
          <div class="h-48 w-full bg-surface-container-high relative overflow-hidden rounded-t-xl border-b border-outline-variant/10">
            <iframe class="w-full h-full border-none grayscale-[0.05] sepia-[0.05]" src="https://maps.google.com/maps?saddr=Padaria+Lamim,+Cruzeiro+SP&daddr=${encodeURIComponent(order.clientAddress)}&output=embed" allowfullscreen="" loading="lazy"></iframe>
          </div>

          <!-- Card Info -->
          <div class="p-6 space-y-4">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-[9px] font-bold text-outline uppercase tracking-wider mb-0.5">Cliente</p>
                <h2 class="font-serif text-xl font-bold text-on-surface">${order.clientName}</h2>
              </div>
              <div class="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1.5 rounded-lg text-center border border-outline-variant/10">
                <span class="block font-bold text-sm text-secondary">R$ ${order.total.toFixed(2).replace('.', ',')}</span>
                <span class="block text-[8px] opacity-75 font-semibold">Valor Total</span>
              </div>
            </div>

            <!-- Address and quick actions -->
            <div class="space-y-3">
              <div class="flex gap-2">
                <span class="material-symbols-outlined text-primary text-base mt-0.5">location_on</span>
                <div>
                  <p class="text-sm font-semibold text-on-surface">${order.clientAddress}</p>
                </div>
              </div>
              
              <div class="flex gap-2 pt-1">
                <a class="inline-flex items-center gap-1.5 text-secondary font-bold text-[11px] py-1.5 px-3 bg-secondary-container/30 rounded-full hover:bg-secondary-container/50 transition-all active:scale-95 text-decoration-none" 
                   href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.clientAddress)}" target="_blank">
                  <span class="material-symbols-outlined text-xs">map</span>
                  <span>Google Maps</span>
                </a>
                <a class="inline-flex items-center gap-1.5 text-success font-bold text-[11px] py-1.5 px-3 bg-success/10 rounded-full hover:bg-success/20 transition-all active:scale-95 text-decoration-none" 
                   href="https://wa.me/55${order.clientPhone.replace(/\D/g, '')}" target="_blank" style="color: #10b981;">
                  <span class="material-symbols-outlined text-xs">chat</span>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            <hr class="border-outline/10">

            <!-- Items -->
            <div>
              <p class="text-[9px] font-bold text-outline uppercase tracking-wider mb-3">Itens do Pedido</p>
              <div class="space-y-3">
                ${itemsListHTML}
              </div>
            </div>

            <!-- Confirmation Action -->
            <button class="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold text-xs shadow-sm hover:brightness-105 transition-all active:scale-95 flex justify-center items-center gap-2 btn-complete-order" data-id="${order.id}">
              <span class="material-symbols-outlined">check_circle</span>
              <span>Confirmar Entrega Física</span>
            </button>
          </div>
        </div>

        ${notesHTML}
      `;

      activeDeliveryContainer.appendChild(card);
    });

    // Bind Complete delivery button
    document.querySelectorAll('.btn-complete-order').forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.getAttribute('data-id'));
        confirmDelivery(id);
      };
    });

  }

  // --- RENDER HISTORY ---
  function renderHistory(completedOrders) {
    historyDeliveriesList.innerHTML = '';

    if (completedOrders.length === 0) {
      historyDeliveriesList.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16 text-center text-on-surface-variant opacity-40 select-none">
          <span class="material-symbols-outlined text-5xl mb-2">history</span>
          <p class="text-sm font-bold">Histórico Vazio</p>
          <p class="text-xs">Nenhum pedido entregue por você hoje.</p>
        </div>
      `;
      return;
    }

    completedOrders.forEach(order => {
      const card = document.createElement('div');
      card.className = "bg-surface-container-low border border-outline-variant/15 rounded-xl p-4 flex flex-col gap-2 relative";
      
      const timeStr = order.deliveredTime 
        ? new Date(order.deliveredTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : 'Concluído';

      const itemsSummary = order.items.map(i => `${i.qty}x ${i.name}`).join(', ');

      card.innerHTML = `
        <div class="flex justify-between items-start">
          <span class="text-secondary font-bold text-xs font-mono">Pedido #${order.id}</span>
          <span class="text-[10px] text-success font-bold bg-success/15 px-2 py-0.5 rounded flex items-center gap-1" style="color:#10b981; background-color: rgba(16,185,129,0.15)">
            <span class="material-symbols-outlined text-[12px] font-bold">check_circle</span> Entregue ${timeStr}
          </span>
        </div>
        <h4 class="font-serif text-base font-bold text-on-surface">${order.clientName}</h4>
        <p class="text-xs text-on-surface-variant leading-relaxed line-clamp-1">${itemsSummary}</p>
        <p class="text-xs font-bold text-primary mt-1">Total Cobrado: R$ ${order.total.toFixed(2).replace('.', ',')}</p>
      `;

      historyDeliveriesList.appendChild(card);
    });
  }

  // --- DELIVERY ACTION ---
  // --- DELIVERY ACTION ---
  async function confirmDelivery(orderId) {
    try {
      const { error } = await supabaseClient
        .from('pedidos')
        .update({
          status: 'entregue',
          delivered_time: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      await loadDeliveries();

      // Show custom success screen overlay
      successOverlay.classList.remove('hidden');
      setTimeout(() => {
        successOverlay.classList.remove('opacity-0');
        successOverlay.querySelector('.transform').classList.replace('scale-95', 'scale-100');
      }, 10);
    } catch (err) {
      console.error("Erro ao confirmar entrega no Supabase:", err);
      alert("Erro ao salvar confirmação no banco de dados.");
    }
  }

  // --- TAB TOGGLING ---
  function switchTab(tab) {
    if (tab === 'active') {
      btnTabActive.className = "flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider text-primary border-b-2 border-primary transition-all flex items-center justify-center gap-1.5";
      btnTabHistory.className = "flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-all flex items-center justify-center gap-1.5";
      paneActive.classList.remove('hidden');
      paneHistory.classList.add('hidden');
    } else {
      btnTabHistory.className = "flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider text-primary border-b-2 border-primary transition-all flex items-center justify-center gap-1.5";
      btnTabActive.className = "flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-all flex items-center justify-center gap-1.5";
      paneActive.classList.add('hidden');
      paneHistory.classList.remove('hidden');
    }
  }

  btnTabActive.onclick = () => switchTab('active');
  btnTabHistory.onclick = () => switchTab('history');

  function updateStatusUI() {
    if (isOnline) {
      btnStatusToggle.className = "w-8 h-8 bg-success/10 text-success rounded-full flex items-center justify-center";
      btnStatusToggle.querySelector('span').textContent = 'wifi';
      txtStatusLabel.textContent = 'Online';
      txtStatusLabel.className = "text-[9px] font-bold text-success uppercase tracking-wider";
    } else {
      btnStatusToggle.className = "w-8 h-8 bg-outline/10 text-outline rounded-full flex items-center justify-center";
      btnStatusToggle.querySelector('span').textContent = 'wifi_off';
      txtStatusLabel.textContent = 'Offline';
      txtStatusLabel.className = "text-[9px] font-bold text-outline uppercase tracking-wider";
    }
  }

  // --- ONLINE STATUS SWITCH ---
  btnStatusToggle.onclick = async () => {
    isOnline = !isOnline;
    updateStatusUI();
    
    if (currentRider) {
      try {
        await supabaseClient
          .from('motoboys')
          .update({ status: isOnline ? 'online' : 'offline' })
          .eq('name', currentRider);
      } catch (e) {
        console.error("Erro ao atualizar status do motoboy no Supabase:", e);
      }
    }
    loadDeliveries();
  };

  btnSuccessClose.onclick = () => {
    successOverlay.querySelector('.transform').classList.replace('scale-100', 'scale-95');
    successOverlay.classList.add('opacity-0');
    setTimeout(() => {
      successOverlay.classList.add('hidden');
    }, 300);
  };

  // --- REAL-TIME SYNC VIA SUPABASE ---
  // Escuta alterações na tabela pedidos para atualizar as entregas atribuídas ao motoboy
  const ordersSubscription = supabaseClient
    .channel('public:pedidos')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, (payload) => {
      console.log('Pedidos atualizados no Supabase:', payload);
      if (
        payload.new &&
        (payload.new.motoboy === currentRider || payload.old?.motoboy === currentRider)
      ) {
        loadDeliveries();
      }
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
      if (!sessionStorage.getItem('pwa_banner_dismissed_motoboy')) {
        installBanner.classList.remove('hidden');
      }
    });

    btnInstallApp.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Instalação PWA Motoboy: ${outcome}`);
        deferredPrompt = null;
        installBanner.classList.add('hidden');
      }
    });

    btnInstallClose.addEventListener('click', () => {
      installBanner.classList.add('hidden');
      sessionStorage.setItem('pwa_banner_dismissed_motoboy', 'true');
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA Motoboy instalado com sucesso!');
      installBanner.classList.add('hidden');
      deferredPrompt = null;
    });
  }

  // Registro do Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.log('Service Worker do Motoboy registrado com sucesso no escopo:', reg.scope);
          
          // Forçar a verificação de atualizações no servidor ao abrir o app
          reg.update();

          // Se encontrar uma nova versão instalada no background, recarrega a página na hora
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('Nova versão do Motoboy encontrada! Atualizando aplicativo...');
                window.location.reload();
              }
            });
          });
        })
        .catch((err) => console.error('Erro ao registrar Service Worker do Motoboy:', err));
    });
  }

  // --- INITIAL LOAD ---
  loadMotoboys();
});
