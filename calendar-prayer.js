(function () {
  function getOrthodoxEaster(year) {
    var a = year % 4;
    var b = year % 7;
    var c = year % 19;
    var d = (19 * c + 15) % 30;
    var e = (2 * a + 4 * b - d + 34) % 7;
    var month = Math.floor((d + e + 114) / 31);
    var day = ((d + e + 114) % 31) + 1;
    return new Date(year, month - 1, day + 13);
  }

  function getCurrentPeriod(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var year = date.getFullYear();
    var easter = getOrthodoxEaster(year);
    var today = new Date(year, month - 1, day);
    var difference = Math.round((today - easter) / 86400000);

    if (difference === -7) return "bzoba";
    if (difference === -6) return "did-orshab";
    if (difference === -5) return "did-samshab";
    if (difference === -4) return "did-otkhshab";
    if (difference === -3) return "did-khutshab";
    if (difference === -2) return "did-paraskev";
    if (difference === -1) return "did-shabat";
    if (difference >= 0 && difference <= 38) return "aghdgoma";
    if (difference >= 39 && difference <= 48) return "amagleba";
    if (difference >= 49 && difference <= 55) return "sultmopen";
    if (month === 1 && day >= 7 && day <= 14) return "shoba-qriste";
    if (month === 1 && day === 14) return "tsinadatsueta";
    if (month === 1 && day === 19) return "natlisgheba";
    if (month === 2 && day === 15) return "mirqma";
    if (month === 4 && day === 7) return "khareba";
    if (month === 8 && day >= 19 && day <= 27) return "feriscvaleba";
    if ((month === 8 && day >= 28) || (month === 9 && day <= 5)) return "midzineba";
    if (month === 9 && day >= 21 && day <= 26) return "shoba-ghvtismshobeli";
    if ((month === 9 && day >= 27) || (month === 10 && day <= 5)) return "juartamagleba";
    if (month === 12 && day >= 4 && day <= 9) return "tadzrad";
    return null;
  }

  function applyPrayerText(body) {
    document.querySelectorAll("[data-ghirs-text]").forEach(function (target) {
      target.innerHTML = body.innerHTML;
    });
  }

  function updateGhirsText() {
    var targets = document.querySelectorAll("[data-ghirs-text]");
    if (!targets.length) return;

    var period = getCurrentPeriod(new Date());
    if (!period) return;

    var item = document.querySelector('[data-period="' + period + '"]');
    if (item) {
      var body = item.querySelector(".accordion-body");
      if (body) applyPrayerText(body);
      return;
    }

    fetch("index.html")
      .then(function (response) {
        if (!response.ok) throw new Error("Calendar source unavailable");
        return response.text();
      })
      .then(function (html) {
        var calendar = new DOMParser().parseFromString(html, "text/html");
        var sourceItem = calendar.querySelector('[data-period="' + period + '"]');
        var sourceBody = sourceItem && sourceItem.querySelector(".accordion-body");
        if (sourceBody) applyPrayerText(sourceBody);
      })
      .catch(function () {});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateGhirsText);
  } else {
    updateGhirsText();
  }
})();
