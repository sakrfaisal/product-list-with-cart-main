let itemsContainer = document.getElementById("items");
let cartContainer = document.getElementById("cartItems");

let cart = JSON.parse(sessionStorage.getItem("cart")) || [];

let thumbnails = [];

let items;

let confirmBtn = document.getElementById("confirm");
confirmBtn.addEventListener("click", function () {
  confirmation();
});

fetch("./data.json")
  .then((response) => response.json())
  .then(function (data) {
    items = data;
    loadItems(items);
    if (cart) {
      renderPage();
    }
  })
  .catch((error) => {
    console.log("Error happend while getting items", error);
  });

window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    renderPage();
  }
});

function loadItems(items) {
  itemsContainer.innerHTML = "";

  let width = window.innerWidth;
  let screen = width > 1024 ? "desktop" : width < 768 ? "mobile" : "tablet";

  for (let item of items) {
    let name = item.name;
    let category = item.category;
    let price = item.price;
    let id = item.id;

    let itemCard = document.createElement("div");
    itemCard.className = "relative";
    itemCard.id = id;
    itemCard.name = name;
    itemCard.dataset.count = 0;

    let picture = document.createElement("picture");

    let src1 = document.createElement("source");
    src1.setAttribute("media", "(min-width: 1024px)");
    src1.setAttribute("srcset", item.image.desktop);

    let src2 = document.createElement("source");
    src2.setAttribute("media", "(min-width: 768px)");
    src2.setAttribute("srcset", item.image.tablet);

    let img = document.createElement("img");
    img.className = "rounded-lg mb-8 border-1 border-transparent";
    img.setAttribute("src", item.image.mobile);
    img.setAttribute("alt", item.name);
    img.setAttribute("width", width >= 1024 ? "502" : width <= 768 ? "654" : " 427");
    img.setAttribute("height", width >= 1024 ? "480" : width <= 768 ? "424" : " 424");

    if (items.indexOf(item) > 4 && screen !== "desktop") {
      img.setAttribute("loading", "lazy");
    }

    picture.appendChild(src1);
    picture.appendChild(src2);
    picture.appendChild(img);

    let headings = document.createElement("div");

    let categorySpan = document.createElement("span");
    categorySpan.className = "text-custom-rose-500";
    categorySpan.textContent = category;

    let title = document.createElement("h3");
    title.textContent = name;
    title.className = "text-custom-rose-900 font-semibold truncate";
    title.title = name;

    let priceSpan = document.createElement("span");
    priceSpan.className = "price text-custom-red font-semibold";
    priceSpan.dataset.price = price;
    priceSpan.textContent = `${price.toFixed(2)}$`;

    headings.appendChild(categorySpan);
    headings.appendChild(title);
    headings.appendChild(priceSpan);

    let btn = document.createElement("button");
    btn.className = "buyBtn";
    btn.innerHTML = `<img src='./images/icon-add-to-cart.svg' width="20" height="20" alt="">Add to cart`;
    btn.addEventListener("click", () => {
      onBuyNow(btn.parentElement.id);
    });

    let counter = document.createElement("span");
    counter.className = "counter";

    let plus = document.createElement("span");
    plus.textContent = "+";
    plus.className = "plus";

    plus.addEventListener("click", () => {
      increase(id);
    });

    let quantitySpan = document.createElement("span");
    quantitySpan.className = "quantitySpan";
    quantitySpan.textContent = "1";

    let minus = document.createElement("span");
    minus.className = "minus";
    minus.textContent = "-";

    minus.addEventListener("click", () => {
      decrease(id);
    });

    counter.appendChild(plus);
    counter.appendChild(quantitySpan);
    counter.appendChild(minus);

    itemCard.appendChild(picture);
    itemCard.appendChild(headings);
    itemCard.appendChild(btn);
    itemCard.appendChild(counter);
    itemsContainer.append(itemCard);

    thumbnails.push({ id: id, thumbnailSrc: item.image.thumbnail });
  }
}

function onBuyNow(id) {
  let card = document.getElementById(id);
  let name = card.name;
  let price = card.querySelector("div > .price").dataset.price;

  if (!cart.find((ele) => +ele.id === +id)) {
    cart.push({ id: id, name: name, price: price, quantity: 1 });
  } else {
    cart.find((ele) => +ele.id === +id).quantity++;
  }
  renderPage();
}

function increase(id) {
  let item = cart.find((item) => +item.id === +id);
  item.quantity++;
  let quantitySpan = document.getElementById(id).querySelector(".quantitySpan");
  renderPage();
}

function decrease(id) {
  let item = cart.find((item) => +item.id === +id);

  let quantitySpan = document.getElementById(id).querySelector(".quantitySpan");

  let card = document.getElementById(id);

  item.quantity--;

  renderPage();
}

function renderPage() {
  renderCart();

  for (let card of itemsContainer.children) {
    let item = cart.find((item) => +item.id === +card.id);
    if (item) {
      card.querySelector(".quantitySpan").textContent = item.quantity;
      card.classList.add("selected");
    } else {
      card.classList.remove("selected");
    }
  }

  if (cart.length === 0) {
    cartContainer.classList.remove("active");
  } else {
    cartContainer.classList.add("active");
  }

  sessionStorage.setItem("cart", JSON.stringify(cart));
}

function renderCart() {
  cartContainer.innerHTML = "";

  let totalItems = 0;

  let newCart = Array.from(cart);

  for (let item of cart) {
    if (item.quantity > 0) {
      let card = document.createElement("div");
      card.className = "orderdCart";

      let title = document.createElement("h3");
      title.textContent = item.name;
      title.className = "text-custom-rose-900 mb-2";

      let infoWrapper = document.createElement("div");
      infoWrapper.className = "text-sm grid grid-cols-[30px_65px_60px]";

      let quantitySpan = document.createElement("span");
      quantitySpan.textContent = `${item.quantity}x`;
      quantitySpan.className = "text-custom-red font-semibold";

      let priceSpan = document.createElement("span");
      priceSpan.textContent = `@ ${(+item.price).toFixed(2)}$`;
      priceSpan.className = "text-custom-rose-400";

      let totalSpan = document.createElement("span");
      totalSpan.textContent = `${(item.price * item.quantity).toFixed(2)}$`;
      totalSpan.className = "text-custom-rose-500";
      totalItems += item.price * item.quantity;

      let cancelBtn = document.createElement("button");
      cancelBtn.addEventListener("click", () => {
        item.quantity = 0;
        renderPage();
      });

      infoWrapper.appendChild(quantitySpan);
      infoWrapper.appendChild(priceSpan);
      infoWrapper.appendChild(totalSpan);

      card.appendChild(title);
      card.appendChild(infoWrapper);
      card.appendChild(cancelBtn);

      cartContainer.appendChild(card);
    } else {
      newCart.splice(
        newCart.findIndex((ele) => +ele.id === +item.id),
        1
      );
    }
  }

  cart = newCart;

  let countOfItem = document.getElementById("countOfItems");
  countOfItem.textContent = cart.length;

  let orderTotal = document.getElementById("orderTotalNum");
  orderTotal.textContent = `${totalItems.toFixed(2)}$`;

  return totalItems;
}

function confirmation() {
  if (cart.length === 0) {
    alert("Your Cart Is Still Empty!");
    return;
  }

  let confirmPopUp = document.getElementById("ConfirmPopup");
  confirmPopUp.style.display = "block";

  let orderedContainer = document.getElementById("orderedItems");
  let newOrderBtn = document.getElementById("newOrderBtn");
  let orderTotalSpan = document.getElementById("orderTotalSpan");

  let orderTotal = 0;

  for (let item of cart) {
    let card = document.createElement("li");

    let img = document.createElement("img");
    img.setAttribute("alt", "");
    img.src = thumbnails.find((ele) => +ele.id === +item.id).thumbnailSrc;

    let div = document.createElement("div");

    let h3 = document.createElement("h3");
    h3.title = item.name;
    h3.textContent = item.name;

    let div2 = document.createElement("div");

    let quantity = document.createElement("span");
    quantity.textContent = `${item.quantity}x`;

    let price = document.createElement("span");
    price.textContent = `$${(+item.price).toFixed(2)}`;

    let total = document.createElement("span");
    total.textContent = `$${(item.price * item.quantity).toFixed(2)}`;
    orderTotal += item.price * item.quantity;

    div.appendChild(quantity);
    div.appendChild(price);

    div2.appendChild(h3);
    div2.appendChild(div);

    card.appendChild(img);
    card.appendChild(div2);
    card.appendChild(total);

    orderedContainer.prepend(card);
  }
  orderTotalSpan.textContent = `${orderTotal.toFixed(2)}$`;
  newOrderBtn.addEventListener("click", () => {
    cart = [];
    sessionStorage.clear()
    confirmPopUp.style.display = "none";
    renderPage();
  });
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

let preWidth = window.innerWidth;

window.addEventListener(
  "resize",
  debounce(() => {
    if (
      (preWidth > 1040 && window.innerWidth < 1040) ||
      (preWidth < 640 && window.innerWidth > 640) ||
      (preWidth > 640 && preWidth < 1040 && (window.innerWidth < 640 || window.innerWidth > 1040))
    ) {
      loadItems(items);
      preWidth = window.innerWidth;
    }
  }, 300)
);
