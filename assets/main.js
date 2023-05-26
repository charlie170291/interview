$(document).on("ready", function () {
  /* ----------------------- 
    Mobile menu Toggle
    ------------------------- */
  $(".menuIcon").click(function (e) {
    $("body").toggleClass("menuSlide");
    $(".menu").slideToggle("slow");
  });

  $(".banSec").css("margin-top", $(".topTip").outerHeight());

  $(".accMain").off("click"),
    $(".accMain").click(function () {
      if ($(this).hasClass("topArrow")) {
        $(this).next().slideUp();
        $(this).removeClass("topArrow");
      } else {
        $(".accMain").removeClass("topArrow");
        $(this).addClass("topArrow");
        $(".accDiv").slideUp();
        $(this).next().slideDown();
      }
    });
});