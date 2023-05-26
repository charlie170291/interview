var inputElements = document.querySelectorAll(".variant_option");
// Get the select element
var selectElement = document.getElementById("variantHtml");
var addBtn = document.getElementById("addBtn");
var moneyFormat = document.querySelector("body").getAttribute("data-format");
var form = document.getElementById("product-form");
var routes = window.Shopify.routes;
var errorBox = document.getElementById("errorMessage");
function getRelatedOptions(opt, value) {
  // Create an array to store the matching values
  let matchingOptions = [];
  // Loop through the options and check for the desired conditions
  let allsold = document.querySelectorAll(".variant_option_wrapper.sold");
  if (allsold && allsold.length > 0) {
    for (let i = 0; i < allsold.length; i++) {
      allsold[i].classList.remove("sold");
    }
  }
  for (let i = 0; i < selectElement.options.length; i++) {
    let option = selectElement.options[i];
    let option1 = option.getAttribute("data-option1");
    let option2 = option.getAttribute("data-option2");
    let option3 = option.getAttribute("data-option3");
    let availability = option.getAttribute("data-availability");
    if (option2 == "") {
      if (availability === "false") {
        matchingOptions.push({ option1: option1 });
      }
    } else {
      if (opt == "option3") {
        if (option3 === value && availability === "false") {
          matchingOptions.push({ option1: option1, option2: option2 });
        }
      } else if (opt == "option2") {
        if (option2 === value && availability === "false") {
          matchingOptions.push({ option1: option1, option3: option3 });
        }
      } else {
        if (option1 === value && availability === "false") {
          matchingOptions.push({ option2: option2, option3: option3 });
        }
      }
    }
  }
  // Output the array of matching values
  if (matchingOptions && matchingOptions.length > 0) {
    for (let i = 0; i < matchingOptions.length; i++) {
      for (const property in matchingOptions[i]) {
        let opt_sel = document.querySelector(
          `input[name="${property}"][value="${matchingOptions[i][property]}"]`
        );
        if (opt_sel) {
          opt_sel.parentNode.classList.add("sold");
        }
      }
    }
  }
}
getRelatedOptions(
  "option1",
  document.querySelector('input[name="option1"][checked="checked"]').value
);

function handleInputChange(e) {
  let opt = e.target.getAttribute("name");
  let val = e.target.getAttribute("value");
  document.querySelector(
    '.variant_option_container .sizeText span[data-option="' + opt + '"]'
  ).innerHTML = val;
  getRelatedOptions(opt, val);
  let selectedValue = [];
  for (let i = 0; i < inputElements.length; i++) {
    let inputElement = inputElements[i];
    if (inputElement.checked) {
      selectedValue.push(inputElement.value);
    }
  }
  if (selectedValue && selectedValue.length > 0) {
    let variant = selectElement.querySelector(
      'option[data-title="' + selectedValue.join(" / ") + '"]'
    );
    if (variant) {
      let variant_price = variant.getAttribute("data-price");
      let variant_cprice = variant.getAttribute("data-compare-price");
      let variant_availability = variant.getAttribute("data-availability");
      let variant_val = variant.value;
      let variant_img = variant.getAttribute("data-image");
      let variant_media = variant.getAttribute("data-media");

      if (variant_availability === "false") {
        addBtn.classList.add("sold");
        addBtn.innerHTML = "Out of stock";
        document.getElementById("stockHtml").classList.add("outofstock");
        document.getElementById("stockHtml").innerHTML = "Out of stock";
      } else {
        addBtn.classList.remove("sold");
        addBtn.innerHTML = "Add to cart";
        selectElement.value = variant_val;
        document.getElementById("stockHtml").classList.remove("outofstock");
        document.getElementById("stockHtml").innerHTML = "Instock";
      }
      let priceHtml = "";
      if (variant_cprice && variant_cprice > variant_price) {
        priceHtml +=
          '<span class="specific-price-compare">' +
          Shopify.formatMoney(variant_cprice, moneyFormat) +
          "</span>";
      }
      priceHtml +=
        '<span class="specific-price">' +
        Shopify.formatMoney(variant_price, moneyFormat) +
        "</span>";
      document.querySelector("#priceHtml").innerHTML = priceHtml;
      if (variant_media) {
        let sliderHtml = "";
        if (variant_media.indexOf(",") != 1) {
          variant_media = variant_media.split(",");
        } else {
          variant_media = [variant_media];
        }
        sliderHtml += '<ul class="slides">';
        for (let i = 0; i < variant_media.length; i++) {
          sliderHtml += "<li>";
          sliderHtml += '<div class="imae_wrapper"  style="position:relative;padding-bottom:100%;overflow:hidden;">'
          sliderHtml += '<img src="' + variant_media[i] + '" style="position:absolute;top:0px;left:50%;width:auto;height:100%;transform:translateX(-50%)"/>';
          sliderHtml += '</div>'
          sliderHtml += "</li>";
        }
        sliderHtml += "</ul>";
         $(".pdLeft").append("<div class='sliderPlaceholder'></div>");
        $(".flexslider").remove();
        $(".pdLeft").append("<div id='slider' class='flexslider'></div>");
        $(".pdLeft").append("<div id='carousel' class='flexslider'></div>");
        $("#carousel, #slider").html(sliderHtml);
        $("#carousel, #slider").css({"opacity":"0"});
        setTimeout(()=>{
          $("#carousel, #slider").css({"opacity":"1"});
          $(".pdLeft .sliderPlaceholder").remove();
        },300)
        initSlider();
      } else {
        let img = document.querySelectorAll(
          '#carousel li[data-image="' + variant_img + '"]'
        )[0];
        $(img).click();
      }
    } else {
      addBtn.classList.add("sold");
      addBtn.innerHTML = "Out of stock";
      document.getElementById("stockHtml").classList.add("outofstock");
      document.getElementById("stockHtml").innerHTML = "Out of stock";
    }
  }
}

// Attach event listener to each input element
for (let i = 0; i < inputElements.length; i++) {
  inputElements[i].addEventListener("change", handleInputChange);
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

function handleErrorMessage(errorMessage = false) {
  if (errorMessage) {
    errorBox.innerHTML = "<p>" + errorMessage + "</p>";
  }
}

function onSubmitHandler(e) {
  e.preventDefault();
  addBtn.setAttribute("aria-disabled", true);
  errorBox.innerHTML = "";
  addBtn.classList.add("loading");
  let config = fetchConfig("javascript");
  config.headers["X-Requested-With"] = "XMLHttpRequest";
  delete config.headers["Content-Type"];
  let formData = new FormData(form);
  formData.append("sections", ["cart_icon"]);
  formData.append("sections_url", window.location.pathname);
  config.body = formData;
  fetch(window.Shopify.routes.root + "cart/add.js", config)
    .then((response) => response.json())
    .then((response) => {
      if (response.status) {
        handleErrorMessage(response.description);
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
form.addEventListener("submit", onSubmitHandler);

function initSlider() {
  // The slider being synced must be initialized first
  $("#carousel").flexslider({
    animation: "slide",
    controlNav: false,
    animationLoop: false,
    slideshow: false,
    itemWidth: 120,
    itemMargin: 5,
    smoothHeight: true,
    asNavFor: "#slider",
  });
  $("#slider").flexslider({
    animation: "slide",
    controlNav: false,
    animationLoop: false,
    slideshow: false,
    smoothHeight: true,
    sync: "#carousel",
  });
          
}
window.addEventListener("load", (event) => {
  initSlider();
});
