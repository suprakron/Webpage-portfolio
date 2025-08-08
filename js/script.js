let currentSlideIndex = 0;

function moveSlide(step) {
  const slides = document.querySelectorAll('.carousel-slide');
  const totalSlides = slides.length;

  if (totalSlides === 0) {
    console.warn("No slides found with class 'carousel-slide'");
    return;
  }

  // ซ่อน slide ปัจจุบัน
  slides[currentSlideIndex].style.display = 'none';

  // คำนวณ index ใหม่ (วนกลับ)
  currentSlideIndex = (currentSlideIndex + step + totalSlides) % totalSlides;

  // แสดง slide ใหม่
  slides[currentSlideIndex].style.display = 'block';
}

// แสดง slide แรกตอนโหลดหน้า
const slides = document.querySelectorAll('.carousel-slide');
if (slides.length > 0) {
  slides.forEach(slide => slide.style.display = 'none'); // ซ่อนทุกอันก่อน
  slides[0].style.display = 'block'; // แสดง slide แรก
} else {
  console.warn("No slides found with class 'carousel-slide' on page load.");
}

// จัดการธีม
let theme = localStorage.getItem("theme") || "light";

function setActiveDot(mode) {
  for (let dot of themeDots) {
    if (dot.dataset.mode === mode) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  }
}

function setTheme(mode) {
  const body = document.body;

  // ลบคลาสธีมเก่า
  body.classList.remove('theme-light', 'theme-blue', 'theme-green', 'theme-purple');

  // เพิ่มคลาสธีมใหม่
  body.classList.add(`theme-${mode}`);

  localStorage.setItem("theme", mode);
  setActiveDot(mode);
}

const themeDots = document.querySelectorAll(".theme-dot");

themeDots.forEach(dot => {
  dot.addEventListener("click", () => {
    const mode = dot.dataset.mode;
    console.log("Option clicked:", mode);
    setTheme(mode);
  });
});

setTheme(theme);


// let currentSlideIndex = 0;

// function moveSlide(step) {
//   const slides = document.querySelectorAll('.carousel-slide');
//   const totalSlides = slides.length;

//   if (totalSlides === 0) {
//     console.warn("No slides found with class 'carousel-slide'");
//     return;
//   }

//   // ซ่อน slide ปัจจุบัน
//   slides[currentSlideIndex].style.display = 'none';

//   // คำนวณ index ใหม่ (วนกลับ)
//   currentSlideIndex = (currentSlideIndex + step + totalSlides) % totalSlides;

//   // แสดง slide ใหม่
//   slides[currentSlideIndex].style.display = 'block';
// }

// // แสดง slide แรกตอนโหลดหน้า
// const slides = document.querySelectorAll('.carousel-slide');
// if (slides.length > 0) {
//   slides.forEach(slide => slide.style.display = 'none'); // ซ่อนทุกอันก่อน
//   slides[0].style.display = 'block'; // แสดง slide แรก
// } else {
//   console.warn("No slides found with class 'carousel-slide' on page load.");
// }

// // จัดการธีม
// let theme = localStorage.getItem("theme") || "light";
// setTheme(theme);

// const themeDots = document.getElementsByClassName("theme-dot");

// function setActiveDot(mode) {
//   for (let dot of themeDots) {
//     if (dot.dataset.mode === mode) {
//       dot.classList.add('active');
//     } else {
//       dot.classList.remove('active');
//     }
//   }
// }

// // กำหนด event listener ให้ปุ่มธีม
// for (let dot of themeDots) {
//   dot.addEventListener("click", function () {
//     let mode = this.dataset.mode;
//     console.log("Option clicked:", mode);
//     setTheme(mode);
//   });
// }

// function setTheme(mode) {
//   const themeLink = document.getElementById("theme-style");
//   if (!themeLink) {
//     console.error("Element with id 'theme-style' not found in the document.");
//     return;
//   }

//   switch (mode) {
//     case "light":
//       themeLink.href = "./css/default.css";
//       break;
//     case "blue":
//       themeLink.href = "./css/blue.css";
//       break;
//     case "green":
//       themeLink.href = "./css/green.css";
//       break;
//     case "purple":
//       themeLink.href = "./css/purple.css";
//       break;
//     default:
//       console.warn(`Unknown theme mode: ${mode}`);
//       return;
//   }

//   localStorage.setItem("theme", mode);
//   setActiveDot(mode);
// }
