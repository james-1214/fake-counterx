// import { useNavigate } from 'react-router-dom';
// import { useCart } from '../context/CartContext';
// import styles from '../styles/Welcome.module.css';
// import logo from '../assets/logo.png';
// import BrandLogo from "../components/BrandLogo";

// export default function Welcome() {
//   const navigate = useNavigate();
//   const { setOrderType } = useCart();

//   const handleOrderType = (type) => {
//     setOrderType(type);
//     navigate('/menu');
//   };

//   return (
//     <div className={styles.page}>
//       {/* Animated background blobs */}
//       <div className={styles.blob1} />
//       <div className={styles.blob2} />
//       <div className={styles.blob3} />

//       <div className={styles.content}>
//         {/* Logo */}
//         {/* <div className={styles.logo}>
//           <div className={styles.logoMark}>CX</div>
//           <span className={styles.logoText}>CounterX</span>
//         </div> */}
//         {/* <div className={styles.logo}>
//   <img
//     src={logo}
//     alt="CounterX Logo"
//     className={styles.logoImage}
//   />
// </div> */}
// <div className={styles.logo}>
//   <BrandLogo size={280} />
// </div>

//         {/* Illustration */}
//         {/* <div className={styles.illustration}>
//           <div className={styles.plateCircle}>
//             <span className={styles.plateEmoji}>🍽️</span>
//           </div>
//           <div className={styles.floatItem} style={{ '--delay': '0s' }}>🥞</div>
//           <div className={styles.floatItem} style={{ '--delay': '0.5s' }}>🧃</div>
//           <div className={styles.floatItem} style={{ '--delay': '1s' }}>🍟</div>
//         </div> */}

//         {/* Hero text */}
//         <h1 className={styles.headline}>
//           Order Fresh,<br />
//           <span className={styles.highlight}>Eat Happy</span>
//         </h1>
//         <p className={styles.sub}>
//           Browse our menu and place your order in seconds.
//           Skip the queue, enjoy the food.
//         </p>

//         {/* Order type buttons */}
//         <div className={styles.actions}>
//           <button
//             className={`${styles.orderBtn} ${styles.dineIn}`}
//             onClick={() => handleOrderType('Dine In')}
//           >
//             <span className={styles.btnIcon}>🪑</span>
//             <div>
//               <div className={styles.btnLabel}>Dine In</div>
//               <div className={styles.btnSub}>Order at your table</div>
//             </div>
//           </button>

//           <button
//             className={`${styles.orderBtn} ${styles.takeAway}`}
//             onClick={() => handleOrderType('Take Away')}
//           >
//             <span className={styles.btnIcon}>🛍️</span>
//             <div>
//               <div className={styles.btnLabel}>Take Away</div>
//               <div className={styles.btnSub}>Pick up your order</div>
//             </div>
//           </button>
//         </div>

//         {/* Admin link */}
//         {/* <button
//           className={styles.adminLink}
//           onClick={() => navigate('/admin')}
//         >
//           🔑 Staff Login
//         </button> */}
//         <div className={styles.loginActions}>
//   <button
//     className={styles.staffLogin}
//     onClick={() => navigate('/staff-login')}
//   >
//     👨‍🍳 Staff Login
//   </button>

//   <button
//     className={styles.adminLogin}
//     onClick={() => navigate('/admin-login')}
//   >
//     👨‍💼 Admin Login
//   </button>
// </div>
//       </div>

//       <div className={styles.footer}>
//         <span>Powered by</span>
//         <strong> CounterX</strong>
//         <span> · Restaurant OS</span>
//       </div>
//     </div>
//   );
// }


import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import styles from '../styles/Welcome.module.css';
import logo from '../assets/logo.png';
import BrandLogo from "../components/BrandLogo";
import { useState, useEffect } from "react";

import bg1 from "../assets/bg1.png";
import bg2 from "../assets/bg2.png";
import bg3 from "../assets/bg3.png";
import bg4 from "../assets/bg4.png";


const slides = [bg1, bg2, bg3, bg4];

export default function Welcome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { setOrderType } = useCart();

  const handleOrderType = (type) => {
    setOrderType(type);
    navigate('/menu');
  };
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentSlide((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  }, 5000);

  return () => clearInterval(interval);
}, []);
  return (
    <div className={styles.page}>
      {/* Background Video - Replace src with your video path */}
      {/* <video
        autoPlay
        muted
        loop
        playsInline
      > */}
        {/* Use a food/restaurant video similar to Zomato */}
        {/* <source src="/assets/food-bg-video.mp4" type="video/mp4" /> */}
        {/* Fallback video source if needed */}
        {/* <source src="/assets/food-bg-video.webm" type="video/webm" /> */}
        {/* Your browser does not support the video tag. */}
      {/* </video> */}
      {slides.map((slide, index) => (
  <div
    key={index}
    className={`${styles.slide} ${
      index === currentSlide ? styles.active : ""
    }`}
    style={{
      backgroundImage: `url(${slide})`,
    }}
  />
))}

      {/* Green Overlay (defined in CSS) */}

      {/* Animated glass blobs */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />

      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logo}>
          <BrandLogo size={280} />
        </div>

        {/* Hero text */}
        <h1 className={styles.headline}>
          Order Fresh,<br />
          <span className={styles.highlight}>Eat Happy</span>
        </h1>
        <p className={styles.sub}>
          Browse our menu and place your order in seconds.
          Skip the queue, enjoy the food.
        </p>

        {/* Order type buttons */}
        <div className={styles.actions}>
          <button
            className={`${styles.orderBtn} ${styles.dineIn}`}
            onClick={() => handleOrderType('Dine In')}
          >
            <span className={styles.btnIcon}>🪑</span>
            <div>
              <div className={styles.btnLabel}>Dine In</div>
              <div className={styles.btnSub}>Order at your table</div>
            </div>
          </button>

          <button
            className={`${styles.orderBtn} ${styles.takeAway}`}
            onClick={() => handleOrderType('Take Away')}
          >
            <span className={styles.btnIcon}>🛍️</span>
            <div>
              <div className={styles.btnLabel}>Take Away</div>
              <div className={styles.btnSub}>Pick up your order</div>
            </div>
          </button>
        </div>

        {/* Staff & Admin Login buttons */}
        <div className={styles.loginActions}>
          <button
            className={styles.staffLogin}
            onClick={() => navigate('/staff-login')}
          >
            👨‍🍳 Staff Login
          </button>

          <button
            className={styles.adminLogin}
            onClick={() => navigate('/admin-login')}
          >
            👨‍💼 Admin Login
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <span>Powered by</span>
        <strong> Pet Pooja</strong>
        <span> · Order & Serve</span>
      </div>
    </div>
  );
}