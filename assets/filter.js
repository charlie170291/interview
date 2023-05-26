document.addEventListener("DOMContentLoaded", function (event) {
  var form = document.getElementById("filtersForm");
  var loadmorebtn = document.getElementById("loadMore");
  form.addEventListener("submit", onSubmitHandler);
  if (loadmorebtn) {
    loadmorebtn.addEventListener("click", loadMoreHande);
  }
  function onSubmitHandler(e) {
    e.preventDefault();
    form.querySelector('[name="page"]').value = 1;
    let formData = new FormData(form);
    let searchParams = new URLSearchParams(formData).toString();
    let url = `${window.location.pathname}?section_id=main-collection-body&${searchParams}`;
    document.querySelector(".collection-container").classList.add("loading");
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        let html = new DOMParser().parseFromString(responseText, "text/html");
        document.querySelector(".collection-container").innerHTML =
          html.querySelector(".collection-container").innerHTML;
        initEventListners();
        document.querySelector(".collection-container").classList.remove("loading");
      });
  }

  function fetchConfig(type = "json") {
    return {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: `application/${type}`,
      },
    };
  }
  function loadMoreHande(e) {
    e.preventDefault();
    form.querySelector('[name="page"]').value =
      loadmorebtn.getAttribute("data-page");
    let formData = new FormData(form);
    let searchParams = new URLSearchParams(formData).toString();
    let url = `${window.location.pathname}?section_id=main-collection-body&${searchParams}`;
    loadmorebtn.setAttribute("aria-disabled", true);
    loadmorebtn.classList.add("loading");
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        loadmorebtn.remove();
        let html = new DOMParser().parseFromString(responseText, "text/html");
        let box = document.querySelector("#renderProducts");
        box.insertAdjacentHTML(
          "beforeend",
          html.querySelector("#renderProducts").innerHTML
        );
        document.querySelector("#filters").innerHTML =
          html.querySelector("#filters").innerHTML;
        Array.from(document.querySelectorAll(".pagination")).forEach((el)=>{
          el.querySelector(".loadmore") ? "" : el.remove();
        })
        initEventListners();
        loadmorebtn.setAttribute("aria-disabled", false);
        loadmorebtn.classList.remove("loading");
      });
  }

  function resetGrid() {
    if (
      jQuery(".products .product-item") &&
      jQuery(".products .product-item") !== undefined &&
      jQuery(".products .product-item").length > 0
    ) {
      if ($(window).width() > 767) {
        jQuery(".products .product-item h3").removeAttr("style");
        var prod_tt = 0;
        jQuery(".products .product-item h3").each(function () {
          if (jQuery(this).height() > prod_tt) {
            prod_tt = jQuery(this).height();
          }
        });
        jQuery(".products .product-item h3").height(prod_tt);

        jQuery(".products .product_banner").removeAttr("style");
        var prod_img = 0;
        jQuery(".products .product_banner").each(function () {
          if (jQuery(this).height() > prod_img) {
            prod_img = jQuery(this).height();
          }
        });
        jQuery(".products .product_banner").height(prod_img);
      }
    }
  }

  function initEventListners() {
    loadmorebtn = document.getElementById("loadMore");
    if (loadmorebtn) {
      loadmorebtn.addEventListener("click", loadMoreHande);
    }
    form = document.getElementById("filtersForm");
    form.addEventListener("submit", onSubmitHandler);
    var checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function (checkbox) {
      checkbox.addEventListener("change", onSubmitHandler);
    });
    var dropdown = document.getElementById("SortBy");
    dropdown.addEventListener("change", onSubmitHandler);
    document
      .querySelector(".drawer-trigger")
      .addEventListener("click", function () {
        document
          .querySelector(".filter-content")
          .parentNode.classList.toggle("show");
      });
    var list_forms = document.querySelectorAll("form.shopify-product-form");
    if (list_forms) {
      for (let i = 0; i < list_forms.length; i++) {
        list_forms[i].addEventListener("submit", onAddtocartHandler);
      }
    }
  }

  initEventListners();
  function onAddtocartHandler(e) {
    e.preventDefault();
    let listform = e.target;
    let addBtn = e.target.querySelector(".acBtn");
    let errorBox = e.target.querySelector(".errorMessage");
    errorBox.innerHTML = "";
    addBtn.setAttribute("aria-disabled", true);
    addBtn.classList.add("loading");
    let config = fetchConfig("javascript");
    config.headers["X-Requested-With"] = "XMLHttpRequest";
    delete config.headers["Content-Type"];
    let formData = new FormData(listform);
    formData.append("sections", ["cart_icon"]);
    formData.append("sections_url", window.location.pathname);
    config.body = formData;
    fetch(window.Shopify.routes.root + "cart/add.js", config)
      .then((response) => response.json())
      .then((response) => {
        if (response.status) {
          errorBox.innerHTML = "<p>" + response.description + "</p>";
          return;
        }
        var modal = document.getElementById("success-modal");
        modal.style.display = "block";
        var closeBtn = document.getElementsByClassName("close")[0];
        window.addEventListener("click", function (event) {
          if (event.target == modal || event.target == closeBtn) {
            modal.style.display = "none";
          }
        });
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        addBtn.classList.remove("loading");
        addBtn.removeAttribute("aria-disabled");
      });
  }
  form.addEventListener("submit", onAddtocartHandler);
});
