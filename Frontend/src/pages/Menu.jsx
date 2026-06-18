import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// import Header from '../components/Header';
import FoodCard from '../components/FoodCard';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import { useCart } from '../context/CartContext';
import { getMenuItems, getCategories } from '../api/menuApi';
import styles from '../styles/Menu.module.css';
import logo from '../assets/logo.png';

const CATEGORY_ICONS = {
  All: '🍽️',
  Breakfast: '🍳',
  Lunch: '🥗',
  Dinner: '🍛',
  Drinks: '🥤',
  Desserts: '🍰',
  Snacks: '🍟',
  Vegan: '🥦',
};

export default function Menu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [addedItemId, setAddedItemId] = useState(null);
  const cartPanelRef = useRef(null);

  // const { cart, orderType, updateQty, removeItem } = useCart();
  const {
    cart,
    orderType,
    updateQuantity,
    removeFromCart
  } = useCart();
  const navigate = useNavigate();

  const totalItems = cart.reduce((s, c) => s + c.qty, 0);
  const totalPrice = cart.reduce((s, c) => s + c.price * c.qty, 0);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // useEffect(() => {
  //   setLoading(true);
  //   getMenuItems(activeCategory, search).then(data => {
  //     setItems(data);
  //     setLoading(false);
  //   });
  // }, [activeCategory, search]);

useEffect(() => {
  setLoading(true);

  getMenuItems()
    .then((data) => {
      setItems(data);
    })
    .finally(() => {
      setLoading(false);
    });

}, []);

  /* close cart when clicking outside */
  useEffect(() => {
    const handler = (e) => {
      if (cartOpen && cartPanelRef.current && !cartPanelRef.current.contains(e.target)) {
        const cartBtn = document.getElementById('cart-fab');
        if (cartBtn && cartBtn.contains(e.target)) return;
        setCartOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [cartOpen]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
  };

  const handleItemAdded = (itemId) => {
    setAddedItemId(itemId);
    setTimeout(() => setAddedItemId(null), 600);
  };

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/order-summary');
  };
  const handler = (e) => {
  if (
    cartOpen &&
    cartPanelRef.current &&
    !cartPanelRef.current.contains(e.target)
  ) {
    setCartOpen(false);
  }
};

  return (
    <div className={styles.page}>
      {/* <Header title="Menu" /> */}

      {/* ── Hero ─────────────────────────────────────────── */}
      {/* <div className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.orderTypeBadge}>{orderType}</span>
          <h2 className={styles.heroTitle}>What's on your mind?</h2>
          <p className={styles.heroSub}>Fresh made with love, delivered to your table</p>
        </div>
        <div className={styles.heroDecor} aria-hidden="true">
          <span>🍕</span><span>🍜</span><span>🥑</span>
        </div>
      </div> */}

      {/* ── Search ───────────────────────────────────────── */}
      {/* <div className={styles.searchBar}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search dishes, drinks..."
        />
      </div> */}
      <div className={styles.topBar}>
        <div className={styles.searchWrapper}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search dishes, drinks..."
          />
        </div>

        {totalItems > 0 && (
          <button
            className={styles.topCart}
            onClick={() => setCartOpen(true)}
          >
            🛒 Cart ({totalItems})
            <span>₹{totalPrice.toFixed(0)}</span>
          </button>
        )}
      </div>
      {/* ── Layout: sidebar + main ─────────────────────── */}
      <div className={styles.layout}>

        {/* LEFT SIDEBAR */}
        <aside className={styles.sidebar}>

          <div className={styles.logoContainer}>
            <img
              src={logo}
              alt="CounterX"
              className={styles.logo}
            />
          </div>


          <p className={styles.sidebarLabel}>Categories</p>

          <nav className={styles.categoryList}>
            {[...categories].map(cat => (
              <button
                key={cat}
                className={`${styles.categoryBtn} ${activeCategory === cat ? styles.categoryActive : ''}`}
                onClick={() => handleCategoryChange(cat)}
              >
                <span className={styles.catIcon}>{CATEGORY_ICONS[cat] ?? '🍴'}</span>
                <span className={styles.catName}>{cat}</span>
                {activeCategory === cat && <span className={styles.activeIndicator} />}
              </button>
            ))}
          </nav>
          <button
            className={styles.sidebarBack}
            onClick={() => {
              const confirmLeave = window.confirm(
                "Return to Welcome Page?"
              );

              if (confirmLeave) {
                navigate('/welcome');
              }
            }}
          >
            ← Back
          </button>
        </aside>

        {/* MAIN GRID */}
        <main className={styles.main}>
          {loading ? (
            <div className={styles.spinnerWrap}>
              <Spinner size="lg" />
              <p>Loading menu…</p>
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="Nothing found"
              message="Try a different search term or category"
              action="Clear Search"
              onAction={() => { setSearch(''); setActiveCategory('All'); }}
            />
          ) : (
            <div className={styles.grid}>
              {items.map(item => (
                <div
                  key={item.menuId}
                  className={`${styles.cardWrap} ${addedItemId === item.menuId ? styles.cardPop : ''}`}
                >
                  <FoodCard item={item} onAdd={() => handleItemAdded(item.menuId)} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Floating Cart Button ─────────────────────────── */}
      {/* {totalItems > 0 && (
        <button
          id="cart-fab"
          className={`${styles.floatingCart} ${cartOpen ? styles.floatingCartActive : ''}`}
          onClick={() => setCartOpen(prev => !prev)}
          aria-label="Open cart"
        >
          <span className={styles.cartCount}>{totalItems}</span>
          <span className={styles.cartLabel}>Cart</span>
          <span className={styles.cartPrice}>₹{totalPrice.toFixed(0)}</span>
          <span className={styles.cartChevron}>{cartOpen ? '✕' : '→'}</span>
        </button>
      )} */}

      {/* ── Cart Overlay (mobile) ─────────────────────────── */}
      {cartOpen && <div className={styles.cartOverlay} onClick={() => setCartOpen(false)} />}

      {/* ── Cart Panel ──────────────────────────────────── */}
      <aside
        ref={cartPanelRef}
        className={`${styles.cartPanel} ${cartOpen ? styles.cartPanelOpen : ''}`}
        aria-label="Cart"
      >
        <div className={styles.cartHeader}>


          <h3 className={styles.cartTitle}>Your Cart</h3>

          <button
            className={styles.cartClose}
            onClick={() => setCartOpen(false)}
          >
            ← Back
          </button>
        </div>

        <div className={styles.cartBody}>
          {cart.length === 0 ? (
            <div className={styles.cartEmpty}>
              <span className={styles.cartEmptyIcon}>🛒</span>
              <p>Your cart is empty</p>
              <span>Add something delicious!</span>
            </div>
          ) : (
            <>
              <ul className={styles.cartList}>
                {cart.map(item => (
                  <li key={item.menuId} className={styles.cartItem}>
                    <div className={styles.cartItemInfo}>
                      <p className={styles.cartItemName}>{item.name}</p>
                      <p className={styles.cartItemPrice}>₹{(item.price * item.qty).toFixed(0)}</p>
                    </div>
                    <div className={styles.cartQtyRow}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => item.qty === 1 ? removeFromCart(item.id) : updateQuantity(item.id, item.qty - 1)}
                        aria-label="Decrease quantity"
                      >−</button>
                      <span className={styles.qtyNum}>{item.qty}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.menuId, item.qty + 1)}
                        aria-label="Increase quantity"
                      >+</button>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeFromCart(item.menuId)}
                        aria-label={`Remove ${item.name}`}
                      >🗑</button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className={styles.cartFooter}>
                <div className={styles.cartTotal}>
                  <span>Total</span>
                  <span className={styles.cartTotalAmt}>₹{totalPrice.toFixed(0)}</span>
                </div>
                <button className={styles.checkoutBtn} onClick={handleCheckout}>
                  Proceed to Checkout →
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

// export const getMenusByCategory = async (category) => {
//   const res = await api.get(`/menu/category/${category}`);
//   return res.data;
// };

export const searchMenu = async (name) => {
  const res = await api.get(`/menu/search/${name}`);
  return res.data;
};