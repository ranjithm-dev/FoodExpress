// FoodExpress Frontend Application Logic

// ================= STATE =================
const state = {
  categories: [],
  menuItems: [],
  filteredItems: [],
  cart: [],
  appliedCoupon: null,
  selectedCategory: null,
  vegOnly: false,
  popularOnly: false,
  searchQuery: '',
  currentSection: 'menu', // 'menu' | 'tracking' | 'admin'
  activeTrackingOrder: null,
  selectedPaymentMethod: 'COD',
  recentOrderNumbers: JSON.parse(localStorage.getItem('fe_recent_orders') || '[]'),
  currentUser: JSON.parse(localStorage.getItem('fe_user') || 'null')
};

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
  // Load saved cart from session/local storage if available
  const savedCart = localStorage.getItem('fe_cart');
  if (savedCart) {
    try { state.cart = JSON.parse(savedCart); } catch (e) { state.cart = []; }
  }

  updateUserAuthUI();
  fetchCategories();
  fetchMenuItems();
  updateCartUI();

  // If there are recent orders, check if we have one to track
  if (state.recentOrderNumbers.length > 0) {
    loadRecentOrdersList();
  }
});

function saveCart() {
  localStorage.setItem('fe_cart', JSON.stringify(state.cart));
}

function saveRecentOrder(orderNumber) {
  if (!state.recentOrderNumbers.includes(orderNumber)) {
    state.recentOrderNumbers.unshift(orderNumber);
    if (state.recentOrderNumbers.length > 10) state.recentOrderNumbers.pop();
    localStorage.setItem('fe_recent_orders', JSON.stringify(state.recentOrderNumbers));
  }
}

// ================= API CALLS =================
async function fetchCategories() {
  try {
    const res = await fetch('/api/categories');
    state.categories = await res.json();
    renderCategories();
  } catch (err) {
    console.error('Failed to fetch categories:', err);
  }
}

async function fetchMenuItems() {
  try {
    let url = '/api/menu-items';
    const params = new URLSearchParams();
    if (state.selectedCategory) params.append('categoryId', state.selectedCategory);
    if (state.vegOnly) params.append('vegOnly', 'true');
    if (state.searchQuery) params.append('search', state.searchQuery);

    if (params.toString()) {
      url += '?' + params.toString();
    }

    const res = await fetch(url);
    let items = await res.json();

    if (state.popularOnly) {
      items = items.filter(i => i.isPopular);
    }

    state.menuItems = items;
    renderMenu();
  } catch (err) {
    console.error('Failed to fetch menu items:', err);
    showToast('Failed to load menu items', 'error');
  }
}

// ================= RENDER FUNCTIONS =================
function renderCategories() {
  const container = document.getElementById('categoryTabs');
  if (!container) return;

  // Keep "All Items"
  let html = `
    <button onclick="selectCategory(null)" 
      class="cat-pill ${!state.selectedCategory ? 'active' : ''} flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap">
      <span>🍽️</span> All Items
    </button>
  `;

  state.categories.forEach(cat => {
    const isActive = state.selectedCategory === cat.id;
    html += `
      <button onclick="selectCategory(${cat.id})" 
        class="cat-pill ${isActive ? 'active' : ''} flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap">
        <span>${cat.icon || '🍽️'}</span> ${cat.name}
      </button>
    `;
  });

  container.innerHTML = html;
}

function renderMenu() {
  const grid = document.getElementById('menuGrid');
  const countText = document.getElementById('menuItemCountText');
  if (!grid) return;

  if (countText) {
    countText.textContent = `Showing ${state.menuItems.length} delicious option${state.menuItems.length === 1 ? '' : 's'}`;
  }

  if (state.menuItems.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
        <i class="fa-solid fa-utensils text-4xl text-slate-300 mb-3"></i>
        <h4 class="text-base font-bold text-slate-700">No dishes match your filter</h4>
        <p class="text-xs text-slate-400 mt-1">Try resetting filters or searching for something else</p>
        <button onclick="resetFilters()" class="mt-4 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all">
          Clear Filters
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = state.menuItems.map(item => `
    <div class="food-card bg-white rounded-3xl border border-slate-200/80 overflow-hidden flex flex-col group relative ${!item.isAvailable ? 'opacity-60 grayscale' : ''}">
      
      <!-- Image Container -->
      <div class="relative h-48 w-full overflow-hidden bg-slate-100">
        <img src="${item.imageUrl}" alt="${item.name}" 
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy">
        
        <!-- Top Badges Overlay -->
        <div class="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <!-- Veg / Non-Veg Indicator -->
          <div class="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-slate-100">
            <span class="w-2.5 h-2.5 rounded-full ${item.isVegetarian ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
            <span class="text-[10px] font-bold uppercase tracking-wider ${item.isVegetarian ? 'text-emerald-700' : 'text-rose-700'}">
              ${item.isVegetarian ? 'Veg' : 'Non-Veg'}
            </span>
          </div>

          <!-- Popular Badge or prep time -->
          ${item.isPopular ? `
            <div class="bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <i class="fa-solid fa-fire-flame-curved text-[10px]"></i> Popular
            </div>
          ` : `
            <div class="bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
              <i class="fa-regular fa-clock text-[9px]"></i> ${item.prepTimeMinutes}m
            </div>
          `}
        </div>

        ${!item.isAvailable ? `
          <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center">
            <span class="bg-rose-600 text-white font-bold text-xs px-3 py-1.5 rounded-full uppercase tracking-wider">Sold Out</span>
          </div>
        ` : ''}
      </div>

      <!-- Card Body -->
      <div class="p-5 flex-1 flex flex-col justify-between">
        <div>
          <!-- Title & Rating -->
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <h3 class="font-bold text-slate-900 text-base group-hover:text-brand-600 transition-colors leading-snug">
              ${item.name}
            </h3>
            <div class="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0 bg-amber-50 px-2 py-0.5 rounded-md">
              <i class="fa-solid fa-star text-[10px]"></i> ${item.rating}
            </div>
          </div>

          <!-- Description -->
          <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
            ${item.description}
          </p>
        </div>

        <!-- Meta tags & Price / Action -->
        <div>
          <div class="flex items-center gap-3 text-[11px] text-slate-400 mb-3">
            <span><i class="fa-solid fa-fire text-orange-400 mr-1"></i>${item.calories} kcal</span>
            <span>•</span>
            <span><i class="fa-solid fa-clock text-slate-400 mr-1"></i>${item.prepTimeMinutes} mins</span>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-slate-100">
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-semibold block">Price</span>
              <span class="text-lg font-black text-slate-900">$${item.price.toFixed(2)}</span>
            </div>

            ${item.isAvailable ? `
              <button onclick="openCustomizeModal(${item.id})" 
                class="px-4 py-2 bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white border border-brand-200 hover:border-transparent text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95">
                <i class="fa-solid fa-plus text-[10px]"></i> Add to Bag
              </button>
            ` : `
              <button disabled class="px-4 py-2 bg-slate-100 text-slate-400 text-xs font-semibold rounded-xl cursor-not-allowed">
                Out of Stock
              </button>
            `}
          </div>
        </div>

      </div>
    </div>
  `).join('');
}

// ================= FILTERS & NAVIGATION =================
function selectCategory(catId) {
  state.selectedCategory = catId;
  const pills = document.querySelectorAll('.cat-pill');
  pills.forEach(p => p.classList.remove('active'));

  renderCategories();
  fetchMenuItems();
}

function toggleVegFilter() {
  state.vegOnly = !state.vegOnly;
  const btn = document.getElementById('vegFilterBtn');
  if (btn) {
    if (state.vegOnly) {
      btn.classList.add('bg-emerald-50', 'border-emerald-500', 'text-emerald-700');
    } else {
      btn.classList.remove('bg-emerald-50', 'border-emerald-500', 'text-emerald-700');
    }
  }
  fetchMenuItems();
}

function togglePopularFilter() {
  state.popularOnly = !state.popularOnly;
  const btn = document.getElementById('popularFilterBtn');
  if (btn) {
    if (state.popularOnly) {
      btn.classList.add('bg-amber-50', 'border-amber-500', 'text-amber-700');
    } else {
      btn.classList.remove('bg-amber-50', 'border-amber-500', 'text-amber-700');
    }
  }
  fetchMenuItems();
}

let searchDebounceTimeout = null;
function handleSearch(val) {
  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    state.searchQuery = val.trim();
    fetchMenuItems();
  }, 250);
}

function resetFilters() {
  state.selectedCategory = null;
  state.vegOnly = false;
  state.popularOnly = false;
  state.searchQuery = '';
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  const vegBtn = document.getElementById('vegFilterBtn');
  if (vegBtn) vegBtn.classList.remove('bg-emerald-50', 'border-emerald-500', 'text-emerald-700');
  const popBtn = document.getElementById('popularFilterBtn');
  if (popBtn) popBtn.classList.remove('bg-amber-50', 'border-amber-500', 'text-amber-700');
  renderCategories();
  fetchMenuItems();
}

function showSection(sectionName) {
  state.currentSection = sectionName;
  const custSec = document.getElementById('customerSection');
  const trackSec = document.getElementById('trackingSection');
  const adminSec = document.getElementById('adminSection');
  const adminToggleText = document.getElementById('adminToggleText');

  custSec.classList.add('hidden');
  trackSec.classList.add('hidden');
  adminSec.classList.add('hidden');

  if (sectionName === 'menu') {
    custSec.classList.remove('hidden');
    if (adminToggleText) adminToggleText.textContent = 'Restaurant Portal';
  } else if (sectionName === 'tracking') {
    trackSec.classList.remove('hidden');
    loadRecentOrdersList();
    if (adminToggleText) adminToggleText.textContent = 'Restaurant Portal';
  } else if (sectionName === 'admin') {
    adminSec.classList.remove('hidden');
    loadAdminDashboard();
    if (adminToggleText) adminToggleText.textContent = 'Storefront';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleAdminView() {
  if (state.currentSection === 'admin') {
    showSection('menu');
  } else {
    showSection('admin');
  }
}

// ================= CUSTOMIZATION & CART =================
let pendingItemToCustomize = null;

function openCustomizeModal(itemId) {
  const item = state.menuItems.find(i => i.id === itemId);
  if (!item) return;

  pendingItemToCustomize = item;
  const modal = document.getElementById('customizeModal');
  const content = document.getElementById('customizeModalContent');

  content.innerHTML = `
    <!-- Modal Header with Image -->
    <div class="relative h-44 bg-slate-900">
      <img src="${item.imageUrl}" class="w-full h-full object-cover opacity-80" alt="${item.name}">
      <button onclick="closeCustomizeModal()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="absolute bottom-3 left-4 right-4 text-white">
        <h3 class="font-extrabold text-lg">${item.name}</h3>
        <p class="text-xs text-slate-200">$${item.price.toFixed(2)}</p>
      </div>
    </div>

    <!-- Options Form -->
    <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Portion / Serving Size</label>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <label class="border border-brand-500 bg-brand-50 p-2.5 rounded-xl flex items-center justify-between cursor-pointer">
            <input type="radio" name="customSize" value="Regular" checked class="text-brand-500">
            <span class="font-semibold text-slate-800">Regular Portion</span>
            <span class="text-slate-500">+$0.00</span>
          </label>
          <label class="border border-slate-200 p-2.5 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-300">
            <input type="radio" name="customSize" value="Large (+20% size)" class="text-brand-500">
            <span class="font-semibold text-slate-800">Large + Extra</span>
            <span class="text-slate-500">+$2.50</span>
          </label>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Chef Add-ons (Optional)</label>
        <div class="space-y-2 text-xs">
          <label class="border border-slate-200 p-2.5 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-300">
            <span class="flex items-center gap-2">
              <input type="checkbox" id="addCheese" class="rounded text-brand-500">
              <span class="font-medium text-slate-800">Melted Artisanal Cheese</span>
            </span>
            <span class="text-slate-500">+$1.50</span>
          </label>
          <label class="border border-slate-200 p-2.5 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-300">
            <span class="flex items-center gap-2">
              <input type="checkbox" id="addSauce" class="rounded text-brand-500">
              <span class="font-medium text-slate-800">Truffle Garlic Dip</span>
            </span>
            <span class="text-slate-500">+$0.99</span>
          </label>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Special Cooking Request</label>
        <input type="text" id="customNotes" placeholder="e.g. Extra spicy, dressing on side, no onions" 
          class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500">
      </div>
    </div>

    <!-- Modal Footer -->
    <div class="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
      <div class="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden">
        <button onclick="adjustModalQty(-1)" class="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold">-</button>
        <span id="modalItemQty" class="px-3 py-1.5 text-xs font-bold text-slate-900">1</span>
        <button onclick="adjustModalQty(1)" class="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold">+</button>
      </div>

      <button onclick="confirmAddToCart()" 
        class="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all">
        <span>Add to Bag</span>
        <i class="fa-solid fa-check text-[10px]"></i>
      </button>
    </div>
  `;

  modal.classList.remove('opacity-0', 'pointer-events-none');
  modal.firstElementChild.classList.remove('scale-95');
}

let modalQty = 1;
function adjustModalQty(delta) {
  modalQty = Math.max(1, modalQty + delta);
  const qtyEl = document.getElementById('modalItemQty');
  if (qtyEl) qtyEl.textContent = modalQty;
}

function closeCustomizeModal() {
  const modal = document.getElementById('customizeModal');
  modal.classList.add('opacity-0', 'pointer-events-none');
  modal.firstElementChild.classList.add('scale-95');
  pendingItemToCustomize = null;
  modalQty = 1;
}

function confirmAddToCart() {
  if (!pendingItemToCustomize) return;

  const sizeRadio = document.querySelector('input[name="customSize"]:checked');
  const size = sizeRadio ? sizeRadio.value : 'Regular';
  const addCheese = document.getElementById('addCheese')?.checked;
  const addSauce = document.getElementById('addSauce')?.checked;
  const notes = document.getElementById('customNotes')?.value.trim();

  const customParts = [];
  let extraPrice = 0.0;

  if (size.includes('Large')) {
    customParts.push('Large');
    extraPrice += 2.50;
  }
  if (addCheese) {
    customParts.push('+ Cheese');
    extraPrice += 1.50;
  }
  if (addSauce) {
    customParts.push('+ Truffle Dip');
    extraPrice += 0.99;
  }
  if (notes) {
    customParts.push(`"${notes}"`);
  }

  const finalUnitPrice = Math.round((pendingItemToCustomize.price + extraPrice) * 100) / 100;
  const customizationsStr = customParts.join(', ');

  // Add to state.cart
  const existingIdx = state.cart.findIndex(c => 
    c.menuItemId === pendingItemToCustomize.id && c.customizations === customizationsStr
  );

  if (existingIdx >= 0) {
    state.cart[existingIdx].quantity += modalQty;
  } else {
    state.cart.push({
      menuItemId: pendingItemToCustomize.id,
      name: pendingItemToCustomize.name,
      unitPrice: finalUnitPrice,
      imageUrl: pendingItemToCustomize.imageUrl,
      quantity: modalQty,
      customizations: customizationsStr
    });
  }

  saveCart();
  updateCartUI();
  closeCustomizeModal();
  showToast(`Added ${pendingItemToCustomize.name} to bag!`, 'success');

  // Trigger bouncy feedback on cart button
  const cartBtn = document.querySelector('button[onclick*="toggleCartDrawer"]');
  if (cartBtn) {
    cartBtn.classList.add('scale-110');
    setTimeout(() => cartBtn.classList.remove('scale-110'), 200);
  }
}

function updateCartQty(index, delta) {
  if (state.cart[index]) {
    state.cart[index].quantity += delta;
    if (state.cart[index].quantity <= 0) {
      state.cart.splice(index, 1);
    }
    saveCart();
    updateCartUI();
  }
}

function removeCartItem(index) {
  state.cart.splice(index, 1);
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const badge = document.getElementById('cartCountBadge');
  const navTotal = document.getElementById('cartTotalNav');
  const itemsContainer = document.getElementById('cartItemsContainer');
  const subtotalEl = document.getElementById('cartSubtotal');
  const discountRow = document.getElementById('couponDiscountRow');
  const discountEl = document.getElementById('cartDiscount');
  const couponLabel = document.getElementById('appliedCouponLabel');
  const deliveryEl = document.getElementById('cartDelivery');
  const freeHint = document.getElementById('freeDeliveryHint');
  const taxEl = document.getElementById('cartTax');
  const totalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (badge) badge.textContent = totalItems;

  const subtotal = state.cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const roundedSubtotal = Math.round(subtotal * 100) / 100;

  // Calculate discount
  let discount = 0.0;
  if (state.appliedCoupon && roundedSubtotal >= (state.appliedCoupon.minOrderAmount || 0)) {
    if (state.appliedCoupon.discountType === 'PERCENTAGE') {
      discount = Math.min(
        state.appliedCoupon.maxDiscount || 999, 
        roundedSubtotal * (state.appliedCoupon.discountValue / 100.0)
      );
    } else {
      discount = Math.min(roundedSubtotal, state.appliedCoupon.discountValue);
    }
  } else if (state.appliedCoupon) {
    // Coupon invalid due to subtotal drop
    state.appliedCoupon = null;
  }
  discount = Math.round(discount * 100) / 100;

  // Delivery
  const deliveryFee = roundedSubtotal >= 35.0 || roundedSubtotal === 0 ? 0.0 : 3.99;
  
  // Tax 5%
  const taxable = Math.max(0, roundedSubtotal - discount);
  const tax = Math.round(taxable * 0.05 * 100) / 100;
  const grandTotal = Math.round((taxable + deliveryFee + tax) * 100) / 100;

  if (navTotal) navTotal.textContent = `$${grandTotal.toFixed(2)}`;
  if (subtotalEl) subtotalEl.textContent = `$${roundedSubtotal.toFixed(2)}`;
  
  if (discountRow) {
    if (discount > 0 && state.appliedCoupon) {
      discountRow.classList.remove('hidden');
      discountEl.textContent = `-$${discount.toFixed(2)}`;
      couponLabel.textContent = state.appliedCoupon.code;
    } else {
      discountRow.classList.add('hidden');
    }
  }

  if (deliveryEl) {
    deliveryEl.textContent = deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`;
    if (deliveryFee === 0 && roundedSubtotal > 0) {
      deliveryEl.className = 'font-bold text-emerald-600';
    } else {
      deliveryEl.className = 'font-semibold text-slate-700';
    }
  }

  if (freeHint) {
    if (roundedSubtotal > 0 && roundedSubtotal < 35.0) {
      freeHint.textContent = `(Add $${(35.0 - roundedSubtotal).toFixed(2)} for free delivery)`;
    } else if (roundedSubtotal >= 35.0) {
      freeHint.textContent = `(Free delivery unlocked! 🎉)`;
    } else {
      freeHint.textContent = '';
    }
  }

  if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${grandTotal.toFixed(2)}`;

  if (checkoutBtn) {
    checkoutBtn.disabled = state.cart.length === 0;
    if (state.cart.length === 0) {
      checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }

  // Render items in drawer
  if (itemsContainer) {
    if (state.cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
          <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 text-2xl mb-3">
            <i class="fa-solid fa-basket-shopping"></i>
          </div>
          <h4 class="font-bold text-slate-700 text-sm">Your bag is empty</h4>
          <p class="text-xs text-slate-400 mt-1 max-w-[200px]">Add hot and tasty dishes from our chef-crafted menu</p>
        </div>
      `;
    } else {
      itemsContainer.innerHTML = state.cart.map((item, idx) => `
        <div class="flex gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60">
          <img src="${item.imageUrl}" class="w-16 h-16 rounded-xl object-cover shrink-0" alt="${item.name}">
          <div class="flex-1 flex flex-col justify-between">
            <div class="flex justify-between items-start gap-1">
              <div>
                <h4 class="font-bold text-xs text-slate-900 leading-tight">${item.name}</h4>
                ${item.customizations ? `<p class="text-[10px] text-slate-500 mt-0.5 line-clamp-1">${item.customizations}</p>` : ''}
              </div>
              <button onclick="removeCartItem(${idx})" class="text-slate-400 hover:text-rose-500 text-xs transition-colors">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>

            <div class="flex items-center justify-between mt-2">
              <span class="text-xs font-black text-slate-900">$${(item.unitPrice * item.quantity).toFixed(2)}</span>
              
              <div class="flex items-center border border-slate-200 bg-white rounded-lg shadow-2xs">
                <button onclick="updateCartQty(${idx}, -1)" class="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-l-lg text-xs font-bold">-</button>
                <span class="w-6 text-center text-xs font-bold text-slate-800">${item.quantity}</span>
                <button onclick="updateCartQty(${idx}, 1)" class="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-r-lg text-xs font-bold">+</button>
              </div>
            </div>
          </div>
        </div>
      `).join('');
    }
  }
}

function toggleCartDrawer(open) {
  const backdrop = document.getElementById('cartDrawerBackdrop');
  const drawer = document.getElementById('cartDrawer');

  if (open) {
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    drawer.classList.remove('translate-x-full');
  } else {
    backdrop.classList.add('opacity-0', 'pointer-events-none');
    drawer.classList.add('translate-x-full');
  }
}

// ================= COUPONS =================
async function applyCoupon() {
  const input = document.getElementById('couponInput');
  const feedback = document.getElementById('couponFeedback');
  if (!input) return;

  const code = input.value.trim().toUpperCase();
  if (!code) return;

  const subtotal = state.cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  try {
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code, subtotal: subtotal })
    });
    const data = await res.json();

    if (data.valid) {
      // Fetch coupon criteria or build object
      state.appliedCoupon = {
        code: data.code,
        discountAmount: data.discountAmount,
        minOrderAmount: 0 // validated by server
      };
      feedback.textContent = `🎉 ${data.message}`;
      feedback.className = 'mt-1 text-[11px] text-emerald-600 font-semibold block';
      showToast(data.message, 'success');
      updateCartUI();
    } else {
      feedback.textContent = `❌ ${data.message}`;
      feedback.className = 'mt-1 text-[11px] text-rose-600 font-medium block';
      showToast(data.message, 'error');
    }
  } catch (err) {
    console.error('Error validating coupon:', err);
  }
}

function quickApplyCoupon(code) {
  const input = document.getElementById('couponInput');
  if (input) input.value = code;
  toggleCartDrawer(true);
  applyCoupon();
}

// ================= USER AUTHENTICATION =================
function updateUserAuthUI() {
  const label = document.getElementById('userAuthLabel');
  const btn = document.getElementById('userAuthBtn');
  if (!label || !btn) return;

  if (state.currentUser) {
    const firstName = state.currentUser.name ? state.currentUser.name.split(' ')[0] : 'Profile';
    label.textContent = firstName;
    btn.title = `Logged in as ${state.currentUser.email} (Click to sign out)`;
    btn.onclick = () => {
      if (confirm(`Logged in as ${state.currentUser.name} (${state.currentUser.email}).\nDo you want to sign out?`)) {
        handleLogout();
      }
    };
  } else {
    label.textContent = 'Sign In';
    btn.title = 'Sign In or Register';
    btn.onclick = () => openAuthModal();
  }
}

function openAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.firstElementChild.classList.remove('scale-95');
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.firstElementChild.classList.add('scale-95');
  }
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const regForm = document.getElementById('registerForm');
  const tabLogin = document.getElementById('authTabLogin');
  const tabReg = document.getElementById('authTabRegister');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    regForm.classList.add('hidden');
    tabLogin.className = 'flex-1 py-3 text-xs font-bold border-b-2 border-brand-500 text-brand-600';
    tabReg.className = 'flex-1 py-3 text-xs font-semibold text-slate-500 border-b-2 border-transparent hover:text-slate-700';
  } else {
    loginForm.classList.add('hidden');
    regForm.classList.remove('hidden');
    tabReg.className = 'flex-1 py-3 text-xs font-bold border-b-2 border-brand-500 text-brand-600';
    tabLogin.className = 'flex-1 py-3 text-xs font-semibold text-slate-500 border-b-2 border-transparent hover:text-slate-700';
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      state.currentUser = data;
      localStorage.setItem('fe_user', JSON.stringify(data));
      updateUserAuthUI();
      closeAuthModal();
      showToast(`Welcome back, ${data.name}!`, 'success');
    } else {
      showToast(data.message || 'Login failed', 'error');
    }
  } catch (err) {
    console.error('Login error:', err);
    showToast('Failed to connect to authentication server', 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const phone = document.getElementById('regPhone').value.trim();
  const address = document.getElementById('regAddress').value.trim();

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, address })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      state.currentUser = data;
      localStorage.setItem('fe_user', JSON.stringify(data));
      updateUserAuthUI();
      closeAuthModal();
      showToast(`Account created! Welcome, ${data.name}!`, 'success');
    } else {
      showToast(data.message || 'Registration failed', 'error');
    }
  } catch (err) {
    console.error('Registration error:', err);
    showToast('Failed to connect to authentication server', 'error');
  }
}

function handleLogout() {
  state.currentUser = null;
  localStorage.removeItem('fe_user');
  updateUserAuthUI();
  showToast('You have been signed out.', 'info');
}

// ================= CHECKOUT FLOW =================
function openCheckoutModal() {
  if (state.cart.length === 0) return;
  toggleCartDrawer(false);

  // If user is logged in, auto-fill checkout fields
  if (state.currentUser) {
    if (document.getElementById('customerName')) document.getElementById('customerName').value = state.currentUser.name || '';
    if (document.getElementById('customerEmail')) document.getElementById('customerEmail').value = state.currentUser.email || '';
    if (document.getElementById('customerPhone')) document.getElementById('customerPhone').value = state.currentUser.phone || '';
    if (document.getElementById('deliveryAddress')) document.getElementById('deliveryAddress').value = state.currentUser.address || '';
  }

  // Update total in checkout
  const totalEl = document.getElementById('cartTotal');
  const checkoutPayable = document.getElementById('checkoutPayableAmount');
  if (checkoutPayable && totalEl) {
    checkoutPayable.textContent = totalEl.textContent;
  }

  const modal = document.getElementById('checkoutModal');
  modal.classList.remove('opacity-0', 'pointer-events-none');
  modal.firstElementChild.classList.remove('scale-95');
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  modal.classList.add('opacity-0', 'pointer-events-none');
  modal.firstElementChild.classList.add('scale-95');
}

function selectPaymentMethod(method) {
  state.selectedPaymentMethod = method;
  const labels = document.querySelectorAll('.payment-method-label');
  labels.forEach(label => {
    const radio = label.querySelector('input[type="radio"]');
    if (radio && radio.value === method) {
      label.className = 'payment-method-label cursor-pointer border-2 border-brand-500 bg-brand-50/50 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all';
    } else {
      label.className = 'payment-method-label cursor-pointer border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:border-slate-300 transition-all';
    }
  });

  const btnText = document.getElementById('placeOrderBtnText');
  if (btnText) {
    if (method === 'COD') btnText.textContent = 'Confirm Order (Cash on Delivery)';
    else if (method === 'RAZORPAY') btnText.textContent = 'Pay via Razorpay (Test Mode)';
    else if (method === 'CARD') btnText.textContent = 'Pay with Card';
    else if (method === 'UPI') btnText.textContent = 'Pay via UPI / QR';
  }
}

async function handlePlaceOrder(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('placeOrderSubmitBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
  }

  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const email = document.getElementById('customerEmail').value.trim();
  const address = document.getElementById('deliveryAddress').value.trim();
  const instructions = document.getElementById('specialInstructions').value.trim();

  // If Razorpay test mode is selected
  if (state.selectedPaymentMethod === 'RAZORPAY') {
    try {
      const totalAmountVal = parseFloat((document.getElementById('checkoutPayableAmount').textContent || '0').replace('$', '')) || 0;
      const rzpRes = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmountVal })
      });
      const rzpData = await rzpRes.json();

      // Show test simulation confirmation if Razorpay SDK popup is not active
      showToast(`Razorpay Test Order (${rzpData.razorpayOrderId}) verified!`, 'success');
    } catch (rzpErr) {
      console.warn('Razorpay test mode fallback:', rzpErr);
    }
  }

  const orderPayload = {
    customerName: name,
    customerPhone: phone,
    customerEmail: email,
    deliveryAddress: address,
    specialInstructions: instructions,
    paymentMethod: state.selectedPaymentMethod,
    couponCode: state.appliedCoupon ? state.appliedCoupon.code : null,
    items: state.cart.map(item => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      customizations: item.customizations || ''
    }))
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    if (!res.ok) {
      throw new Error('Failed to create order');
    }

    const createdOrder = await res.json();

    // Celebration Confetti
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    // Save recent order
    saveRecentOrder(createdOrder.orderNumber);

    // Clear cart
    state.cart = [];
    state.appliedCoupon = null;
    saveCart();
    updateCartUI();

    closeCheckoutModal();
    showToast(`Order #${createdOrder.orderNumber} placed successfully!`, 'success');

    // Switch to Tracking view
    trackOrder(createdOrder.orderNumber);
    showSection('tracking');

  } catch (err) {
    console.error('Order creation failed:', err);
    showToast('Failed to place order. Please try again.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      const btnText = document.getElementById('placeOrderBtnText');
      submitBtn.innerHTML = `<i class="fa-solid fa-lock text-xs"></i> <span>${btnText ? btnText.textContent : 'Confirm & Place Order'}</span>`;
    }
  }
}

// ================= LIVE ORDER TRACKING =================
async function trackOrderFromInput() {
  const input = document.getElementById('trackingInput');
  if (!input) return;
  const num = input.value.trim();
  if (!num) {
    showToast('Please enter an order number', 'error');
    return;
  }
  trackOrder(num);
}

async function trackOrder(orderNumber) {
  try {
    const res = await fetch(`/api/orders/track/${encodeURIComponent(orderNumber)}`);
    if (!res.ok) {
      showToast(`Order ${orderNumber} not found`, 'error');
      return;
    }
    const order = await res.json();
    state.activeTrackingOrder = order;
    renderTrackingView(order);
  } catch (err) {
    console.error('Failed to track order:', err);
    showToast('Error tracking order', 'error');
  }
}

function renderTrackingView(order) {
  const container = document.getElementById('trackingCardContainer');
  if (!container) return;

  const steps = [
    { key: 'PLACED', title: 'Order Placed', desc: 'Received & sent to kitchen', icon: 'fa-receipt' },
    { key: 'CONFIRMED', title: 'Confirmed', desc: 'Kitchen acknowledged ticket', icon: 'fa-utensils' },
    { key: 'PREPARING', title: 'Cooking in Kitchen', desc: 'Fresh ingredients being prepared', icon: 'fa-fire-burner' },
    { key: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', desc: 'Rider is on the way to your door', icon: 'fa-motorcycle' },
    { key: 'DELIVERED', title: 'Delivered', desc: 'Enjoy your hot meal!', icon: 'fa-house-circle-check' }
  ];

  const statusHierarchy = ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const currentIndex = statusHierarchy.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  container.innerHTML = `
    <div class="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-6">
      <!-- Order Header -->
      <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <span class="text-xs font-black uppercase tracking-wider bg-brand-500 text-white px-2.5 py-0.5 rounded-md">Live Order</span>
            <span class="text-sm font-mono text-slate-300">#${order.orderNumber}</span>
          </div>
          <h3 class="text-xl sm:text-2xl font-extrabold text-white">Estimated Arrival: ${order.estimatedDeliveryMinutes > 0 ? `${order.estimatedDeliveryMinutes} Mins` : 'Arrived!'}</h3>
          <p class="text-xs text-slate-300 mt-1">Delivering to: <span class="text-white font-medium">${order.deliveryAddress}</span></p>
        </div>

        <div class="text-right">
          <span class="text-xs text-slate-400 block">Total Paid</span>
          <span class="text-2xl font-black text-amber-400">$${order.totalAmount.toFixed(2)}</span>
          <span class="text-[10px] text-emerald-400 block font-semibold"><i class="fa-solid fa-shield-check"></i> ${order.paymentMethod} Verified</span>
        </div>
      </div>

      <!-- Live Timeline Progress -->
      <div class="p-6 sm:p-8 border-b border-slate-200">
        ${isCancelled ? `
          <div class="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-semibold flex items-center gap-3">
            <i class="fa-solid fa-circle-exclamation text-xl"></i>
            <div>
              <p class="font-bold">This order was cancelled.</p>
              <p class="text-xs text-rose-600 font-normal">Contact customer support if this was an error.</p>
            </div>
          </div>
        ` : `
          <div class="space-y-6">
            ${steps.map((step, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const isFuture = idx > currentIndex;

              let iconColor = 'bg-slate-100 text-slate-400 border-slate-200';
              let textColor = 'text-slate-400';
              if (isPast) {
                iconColor = 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20';
                textColor = 'text-slate-800';
              } else if (isCurrent) {
                iconColor = 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/30 animate-pulse';
                textColor = 'text-brand-600';
              }

              return `
                <div class="timeline-step ${isPast ? 'completed' : ''} ${isCurrent ? 'active' : ''} flex items-start gap-4">
                  <div class="w-10 h-10 rounded-2xl border-2 flex items-center justify-center shrink-0 text-sm ${iconColor}">
                    ${isPast ? '<i class="fa-solid fa-check"></i>' : `<i class="fa-solid ${step.icon}"></i>`}
                  </div>
                  <div class="flex-1 pt-1">
                    <div class="flex items-center justify-between">
                      <h4 class="font-extrabold text-sm ${textColor}">${step.title}</h4>
                      ${isCurrent ? '<span class="text-[10px] font-bold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full uppercase tracking-wider">In Progress</span>' : ''}
                      ${isPast ? '<span class="text-[10px] text-emerald-600 font-bold"><i class="fa-solid fa-circle-check"></i> Done</span>' : ''}
                    </div>
                    <p class="text-xs text-slate-400 mt-0.5">${step.desc}</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- Live Delivery Driver Simulation Card (if preparing or out for delivery) -->
      ${order.status === 'OUT_FOR_DELIVERY' || order.status === 'PREPARING' ? `
        <div class="p-6 bg-slate-50 flex items-center justify-between gap-4 border-b border-slate-200">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-md">
              <i class="fa-solid fa-helmet-safety"></i>
            </div>
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Driver</span>
              <h4 class="font-extrabold text-sm text-slate-900">Dave Miller</h4>
              <p class="text-xs text-slate-500 flex items-center gap-1.5">
                <span class="text-amber-500"><i class="fa-solid fa-star text-[10px]"></i> 4.95</span>
                <span>•</span>
                <span>Honda Super Cub 125cc</span>
              </p>
            </div>
          </div>
          <button onclick="showToast('Driver contacted: on route!', 'info')" 
            class="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1.5 transition-all">
            <i class="fa-solid fa-phone text-emerald-600"></i> Call Driver
          </button>
        </div>
      ` : ''}

      <!-- Order Items Receipt Breakdown -->
      <div class="p-6 sm:p-8 bg-white">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Ordered Items</h4>
        <div class="divide-y divide-slate-100">
          ${order.orderItems.map(item => `
            <div class="py-3 flex justify-between items-center text-xs">
              <div>
                <span class="font-bold text-slate-800">${item.quantity}x ${item.menuItemName}</span>
                ${item.customizations ? `<p class="text-[10px] text-slate-400">${item.customizations}</p>` : ''}
              </div>
              <span class="font-bold text-slate-900">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>

        <div class="mt-4 pt-4 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
          <div class="flex justify-between">
            <span>Subtotal</span>
            <span>$${order.subtotal.toFixed(2)}</span>
          </div>
          ${order.discount > 0 ? `
            <div class="flex justify-between text-emerald-600 font-bold">
              <span>Coupon Discount (${order.couponCode || 'PROMO'})</span>
              <span>-$${order.discount.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="flex justify-between">
            <span>Delivery Fee</span>
            <span>${order.deliveryFee === 0 ? 'FREE' : `$${order.deliveryFee.toFixed(2)}`}</span>
          </div>
          <div class="flex justify-between">
            <span>Tax (5%)</span>
            <span>$${order.tax.toFixed(2)}</span>
          </div>
          <div class="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
            <span>Total</span>
            <span class="text-brand-600">$${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function loadRecentOrdersList() {
  const container = document.getElementById('recentOrdersList');
  if (!container) return;

  if (state.recentOrderNumbers.length === 0) {
    container.innerHTML = `
      <div class="p-4 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
        No recent orders recorded on this device.
      </div>
    `;
    return;
  }

  container.innerHTML = state.recentOrderNumbers.map(num => `
    <div onclick="trackOrder('${num}')" class="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer transition-colors shadow-2xs group">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center text-xs group-hover:bg-brand-500 group-hover:text-white transition-colors">
          <i class="fa-solid fa-receipt"></i>
        </div>
        <div>
          <span class="font-mono font-bold text-xs text-slate-900">${num}</span>
          <span class="text-[11px] text-slate-400 block">Click to view live tracking</span>
        </div>
      </div>
      <i class="fa-solid fa-chevron-right text-slate-300 text-xs group-hover:text-brand-500 group-hover:translate-x-1 transition-all"></i>
    </div>
  `).join('');
}

// ================= RESTAURANT ADMIN DASHBOARD =================
async function loadAdminDashboard() {
  try {
    // 1. Stats
    const statsRes = await fetch('/api/admin/stats');
    const stats = await statsRes.json();
    
    document.getElementById('statRevenue').textContent = `$${stats.totalRevenue.toFixed(2)}`;
    document.getElementById('statTotalOrders').textContent = stats.totalOrders;
    document.getElementById('statActiveOrders').textContent = stats.activeOrders;
    document.getElementById('statDeliveredOrders').textContent = stats.deliveredOrders;

    // 2. Orders List
    const ordersRes = await fetch('/api/orders');
    const orders = await ordersRes.json();
    renderAdminOrdersTable(orders);

    // 3. Menu Inventory
    const menuRes = await fetch('/api/menu-items');
    const menuItems = await menuRes.json();
    renderAdminMenuStock(menuItems);

  } catch (err) {
    console.error('Failed to load admin stats:', err);
    showToast('Failed to load dashboard', 'error');
  }
}

function renderAdminOrdersTable(orders) {
  const tbody = document.getElementById('adminOrdersTableBody');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-8 text-center text-xs text-slate-400">
          No orders received yet.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(order => {
    let statusBadgeClass = 'badge-placed';
    if (order.status === 'CONFIRMED') statusBadgeClass = 'badge-confirmed';
    if (order.status === 'PREPARING') statusBadgeClass = 'badge-preparing';
    if (order.status === 'OUT_FOR_DELIVERY') statusBadgeClass = 'badge-out-for-delivery';
    if (order.status === 'DELIVERED') statusBadgeClass = 'badge-delivered';
    if (order.status === 'CANCELLED') statusBadgeClass = 'badge-cancelled';

    return `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="px-6 py-4 font-mono font-bold text-xs text-slate-900">
          ${order.orderNumber}
        </td>
        <td class="px-6 py-4">
          <div class="font-bold text-xs text-slate-900">${order.customerName}</div>
          <div class="text-[11px] text-slate-400">${order.customerPhone}</div>
          <div class="text-[10px] text-slate-400 max-w-xs truncate">${order.deliveryAddress}</div>
        </td>
        <td class="px-6 py-4">
          <div class="text-xs text-slate-700 font-medium">
            ${order.orderItems.map(i => `${i.quantity}x ${i.menuItemName}`).join(', ')}
          </div>
          ${order.specialInstructions ? `<div class="text-[10px] text-amber-600 font-medium mt-0.5">Note: ${order.specialInstructions}</div>` : ''}
        </td>
        <td class="px-6 py-4 font-bold text-xs text-slate-900">
          $${order.totalAmount.toFixed(2)}
          <span class="block text-[10px] text-slate-400 font-normal">${order.paymentMethod}</span>
        </td>
        <td class="px-6 py-4">
          <span class="inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${statusBadgeClass}">
            ${order.status.replace(/_/g, ' ')}
          </span>
        </td>
        <td class="px-6 py-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            ${order.status === 'PLACED' ? `
              <button onclick="updateOrderStatusAdmin(${order.id}, 'CONFIRMED')" class="px-2.5 py-1 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white rounded-lg text-xs font-semibold transition-all">
                Confirm
              </button>
            ` : ''}
            ${order.status === 'CONFIRMED' || order.status === 'PLACED' ? `
              <button onclick="updateOrderStatusAdmin(${order.id}, 'PREPARING')" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white rounded-lg text-xs font-semibold transition-all">
                Cook
              </button>
            ` : ''}
            ${order.status === 'PREPARING' ? `
              <button onclick="updateOrderStatusAdmin(${order.id}, 'OUT_FOR_DELIVERY')" class="px-2.5 py-1 bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white rounded-lg text-xs font-semibold transition-all">
                Dispatch
              </button>
            ` : ''}
            ${order.status === 'OUT_FOR_DELIVERY' ? `
              <button onclick="updateOrderStatusAdmin(${order.id}, 'DELIVERED')" class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg text-xs font-semibold transition-all">
                Deliver
              </button>
            ` : ''}
            ${order.status !== 'DELIVERED' && order.status !== 'CANCELLED' ? `
              <button onclick="updateOrderStatusAdmin(${order.id}, 'CANCELLED')" class="px-2.5 py-1 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-lg text-xs font-semibold transition-all">
                Cancel
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderAdminMenuStock(items) {
  const container = document.getElementById('adminMenuStockList');
  if (!container) return;

  container.innerHTML = items.map(item => `
    <div class="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs">
      <div class="flex items-center gap-3 overflow-hidden">
        <img src="${item.imageUrl}" class="w-12 h-12 rounded-xl object-cover shrink-0" alt="${item.name}">
        <div class="truncate">
          <h4 class="font-bold text-xs text-slate-900 truncate">${item.name}</h4>
          <span class="text-xs font-black text-slate-700">$${item.price.toFixed(2)}</span>
        </div>
      </div>

      <button onclick="toggleMenuItemAvailabilityAdmin(${item.id})" 
        class="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${item.isAvailable ? 'bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-700' : 'bg-rose-50 text-rose-700 hover:bg-emerald-50 hover:text-emerald-700'}">
        ${item.isAvailable ? 'In Stock' : 'Sold Out'}
      </button>
    </div>
  `).join('');
}

async function updateOrderStatusAdmin(orderId, newStatus) {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) throw new Error('Status update failed');
    const updated = await res.json();
    showToast(`Order #${updated.orderNumber} is now ${newStatus.replace(/_/g, ' ')}`, 'success');
    loadAdminDashboard();

    // If currently tracking this order, refresh tracking view
    if (state.activeTrackingOrder && state.activeTrackingOrder.id === orderId) {
      trackOrder(updated.orderNumber);
    }
  } catch (err) {
    console.error('Error updating status:', err);
    showToast('Failed to update status', 'error');
  }
}

async function toggleMenuItemAvailabilityAdmin(itemId) {
  try {
    const res = await fetch(`/api/menu-items/${itemId}/availability`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to toggle availability');
    const updated = await res.json();
    showToast(`${updated.name} marked as ${updated.isAvailable ? 'In Stock' : 'Sold Out'}`, 'info');
    loadAdminDashboard();
    fetchMenuItems(); // also update customer view cache
  } catch (err) {
    console.error('Error toggling availability:', err);
  }
}

// ================= TOAST NOTIFICATIONS =================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  let icon = 'fa-circle-info';
  let border = 'border-slate-800 bg-slate-900 text-white';

  if (type === 'success') {
    icon = 'fa-circle-check text-emerald-400';
    border = 'border-emerald-600 bg-slate-900 text-white';
  } else if (type === 'error') {
    icon = 'fa-triangle-exclamation text-rose-400';
    border = 'border-rose-600 bg-slate-900 text-white';
  }

  toast.className = `flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold border ${border} transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto`;
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
