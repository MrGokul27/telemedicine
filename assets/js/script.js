(function () {
  "use strict";

  /**
   * Determine whether current page is inside /pages/ directory
   */
  function isSubPage() {
    var path = window.location.pathname.replace(/\\/g, "/").toLowerCase();
    return path.indexOf("/pages/") !== -1;
  }

  /**
   * Adjust relative links and asset paths inside header & footer when rendered inside /pages/*.html
   */
  function normalizeComponentPaths(rootEl) {
    if (!rootEl) return;
    var inPages = isSubPage();
    var prefix = inPages ? "../" : "";

    // Adjust images with data-asset-src
    var imgs = rootEl.querySelectorAll("[data-asset-src]");
    imgs.forEach(function (img) {
      var rawSrc = img.getAttribute("data-asset-src");
      if (rawSrc) {
        img.setAttribute("src", prefix + rawSrc);
      }
    });

    // Adjust navigation links with data-page-link
    var links = rootEl.querySelectorAll("[data-page-link]");
    links.forEach(function (link) {
      var target = link.getAttribute("data-page-link");
      if (!target) return;
      if (target.charAt(0) === "#") {
        link.setAttribute("href", target);
      } else if (inPages) {
        if (target.indexOf("pages/") === 0) {
          link.setAttribute("href", target.replace(/^pages\//, ""));
        } else {
          link.setAttribute("href", "../" + target);
        }
      } else {
        link.setAttribute("href", target);
      }
    });

    // Highlight active page link
    var currentPath = window.location.pathname
      .replace(/\\/g, "/")
      .toLowerCase();
    var activeId = "home";
    if (currentPath.indexOf("about.html") !== -1) activeId = "about";
    else if (currentPath.indexOf("department.html") !== -1)
      activeId = "department";
    else if (currentPath.indexOf("doctor.html") !== -1) activeId = "doctor";
    else if (currentPath.indexOf("gallery.html") !== -1) activeId = "gallery";
    else if (currentPath.indexOf("blog.html") !== -1) activeId = "blog";
    else if (currentPath.indexOf("contact.html") !== -1) activeId = "contact";

    var navItems = rootEl.querySelectorAll("[data-nav-id]");
    navItems.forEach(function (item) {
      if (item.getAttribute("data-nav-id") === activeId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  /**
   * Load header.html and footer.html into #header-placeholder and #footer-placeholder
   */
  function initCommonComponents(callback) {
    var headerSlot = document.getElementById("header-placeholder");
    var footerSlot = document.getElementById("footer-placeholder");
    var inPages = isSubPage();
    var compPrefix = inPages ? "components/" : "pages/components/";

    var tasks = [];

    if (headerSlot) {
      tasks.push(
        fetch(compPrefix + "header.html")
          .then(function (res) {
            if (!res.ok) throw new Error("Header fetch status " + res.status);
            return res.text();
          })
          .then(function (html) {
            if (html && html.trim().length > 0) {
              headerSlot.innerHTML = html;
            }
          })
          .catch(function () {}),
      );
    }

    if (footerSlot) {
      tasks.push(
        fetch(compPrefix + "footer.html")
          .then(function (res) {
            if (!res.ok) throw new Error("Footer fetch status " + res.status);
            return res.text();
          })
          .then(function (html) {
            if (html && html.trim().length > 0) {
              footerSlot.innerHTML = html;
            }
          })
          .catch(function () {}),
      );
    }

    Promise.all(tasks).finally(function () {
      normalizeComponentPaths(document);
      if (typeof callback === "function") callback();
    });
  }

  /**
   * Initialize Sticky Header on Scroll & Full-Screen Mobile Menu
   */
  function initHeaderAndMobileMenu() {
    var stickyHeader = document.getElementById("sticky-header");
    var siteHeader = document.getElementById("site-header");
    var openBtn = document.getElementById("mobile-menu-open");
    var closeBtn = document.getElementById("mobile-menu-close");
    var fullscreenMenu = document.getElementById("mobile-fullscreen-menu");

    // Spacer element to prevent content jump when header becomes fixed
    var spacer = document.getElementById("tm-header-spacer");
    if (!spacer && stickyHeader && stickyHeader.parentNode) {
      spacer = document.createElement("div");
      spacer.id = "tm-header-spacer";
      spacer.style.display = "none";
      stickyHeader.parentNode.insertBefore(spacer, stickyHeader.nextSibling);
    }

    function handleScroll() {
      if (!stickyHeader) return;
      var threshold = 42;
      if (window.scrollY > threshold) {
        if (!stickyHeader.classList.contains("is-sticky")) {
          if (spacer) {
            spacer.style.height = stickyHeader.offsetHeight + "px";
            spacer.style.display = "block";
          }
          stickyHeader.classList.add("is-sticky");
          if (siteHeader) siteHeader.classList.add("is-scrolled");
        }
      } else {
        if (stickyHeader.classList.contains("is-sticky")) {
          stickyHeader.classList.remove("is-sticky");
          if (siteHeader) siteHeader.classList.remove("is-scrolled");
          if (spacer) spacer.style.display = "none";
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    function openMobileMenu() {
      if (!fullscreenMenu) return;
      fullscreenMenu.classList.add("is-open");
      fullscreenMenu.setAttribute("aria-hidden", "false");
      if (openBtn) openBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }

    function closeMobileMenu() {
      if (!fullscreenMenu) return;
      fullscreenMenu.classList.remove("is-open");
      fullscreenMenu.setAttribute("aria-hidden", "true");
      if (openBtn) openBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    if (openBtn) {
      openBtn.addEventListener("click", openMobileMenu);
    }
    if (closeBtn) {
      closeBtn.addEventListener("click", closeMobileMenu);
    }
    if (fullscreenMenu) {
      var mobileLinks = fullscreenMenu.querySelectorAll("a");
      mobileLinks.forEach(function (lnk) {
        lnk.addEventListener("click", closeMobileMenu);
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeMobileMenu();
      }
    });
  }

  /**
   * Initialize Scroll-To-Top Button in Footer
   */
  function initScrollToTop() {
    var scrollBtn = document.getElementById("scrollup");
    if (!scrollBtn) return;

    function toggleScrollBtn() {
      if (window.scrollY > 280) {
        scrollBtn.classList.add("is-visible");
      } else {
        scrollBtn.classList.remove("is-visible");
      }
    }

    window.addEventListener("scroll", toggleScrollBtn, { passive: true });
    toggleScrollBtn();

    scrollBtn.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  /**
   * Rotating Hero Headline Words
   */
  function initRotatingText() {
    var wrappers = document.querySelectorAll(".tm-words-wrapper");
    wrappers.forEach(function (wrapper) {
      var words = wrapper.querySelectorAll("b");
      if (words.length <= 1) return;
      var currentIndex = 0;
      setInterval(function () {
        words[currentIndex].classList.remove("is-visible");
        currentIndex = (currentIndex + 1) % words.length;
        words[currentIndex].classList.add("is-visible");
      }, 2600);
    });
  }

  /**
   * Interactive Department Tabs
   */
  function initDepartmentTabs() {
    var tabWraps = document.querySelectorAll(".tm-tab-wrap");
    tabWraps.forEach(function (wrap) {
      var tabs = wrap.querySelectorAll(".tabs li");
      var items = wrap.querySelectorAll(".tm-tabs-item");
      if (!tabs.length || !items.length) return;

      tabs.forEach(function (tab, idx) {
        tab.addEventListener("click", function () {
          tabs.forEach(function (t) {
            t.classList.remove("current");
          });
          items.forEach(function (it) {
            it.classList.remove("active");
          });
          tab.classList.add("current");
          if (items[idx]) {
            items[idx].classList.add("active");
          }
        });
      });
    });
  }

  /**
   * Interactive Before & After Comparison Sliders
   */
  function initBeforeAfterSliders() {
    var containers = document.querySelectorAll(".tm-ba-container");
    containers.forEach(function (container) {
      var range = container.querySelector(".tm-ba-range");
      var afterWrap = container.querySelector(".tm-ba-after-wrap");
      var afterImg = afterWrap ? afterWrap.querySelector("img") : null;
      var handle = container.querySelector(".tm-ba-handle");

      function syncDimensions() {
        if (afterImg && container.offsetWidth > 0) {
          afterImg.style.width = container.offsetWidth + "px";
        }
      }

      function updateSlider(val) {
        var pct = Math.max(5, Math.min(95, Number(val) || 50));
        if (afterWrap) afterWrap.style.width = pct + "%";
        if (handle) handle.style.left = pct + "%";
      }

      syncDimensions();
      window.addEventListener("resize", syncDimensions);

      if (range) {
        range.addEventListener("input", function () {
          updateSlider(range.value);
        });
        range.addEventListener("change", function () {
          updateSlider(range.value);
        });
      }
    });
  }

  /**
   * Filterable Portfolio Gallery & Doctor Grids + Lightbox Modal
   */
  function initFilterGridsAndLightbox() {
    // Generic filter handler
    var filterGroups = document.querySelectorAll("[data-filter-group]");
    filterGroups.forEach(function (group) {
      var targetSelector = group.getAttribute("data-filter-group");
      var targetContainer = document.querySelector(targetSelector);
      if (!targetContainer) return;

      var buttons = group.querySelectorAll("[data-filter]");
      var items = targetContainer.querySelectorAll("[data-category]");

      buttons.forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          var filterValue = btn.getAttribute("data-filter");

          // Update active classes
          buttons.forEach(function (b) {
            b.classList.remove("active");
            if (b.parentElement && b.parentElement.tagName === "LI") {
              b.parentElement.classList.remove("active");
            }
          });
          btn.classList.add("active");
          if (btn.parentElement && btn.parentElement.tagName === "LI") {
            btn.parentElement.classList.add("active");
          }

          items.forEach(function (item) {
            var cats = (item.getAttribute("data-category") || "").split(/\s+/);
            if (filterValue === "*" || cats.indexOf(filterValue) !== -1) {
              item.style.display = "";
            } else {
              item.style.display = "none";
            }
          });
        });
      });
    });

    // Lightbox Modal
    var lightbox = document.getElementById("tm-lightbox-modal");
    var lightboxImg = document.getElementById("tm-lightbox-img");
    var lightboxTitle = document.getElementById("tm-lightbox-title");
    var lightboxClose = document.getElementById("tm-lightbox-close");

    var zoomTriggers = document.querySelectorAll(".tm-zoom-trigger");
    zoomTriggers.forEach(function (trigger) {
      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        if (!lightbox || !lightboxImg) return;
        var imgSrc = trigger.getAttribute("data-img") || "";
        var title =
          trigger.getAttribute("data-title") ||
          "Stackly Telemedicine Clinical Preview";
        lightboxImg.setAttribute("src", imgSrc);
        lightboxImg.setAttribute("alt", title);
        if (lightboxTitle) lightboxTitle.textContent = title;
        lightbox.classList.add("is-active");
      });
    });

    if (lightboxClose && lightbox) {
      lightboxClose.addEventListener("click", function () {
        lightbox.classList.remove("is-active");
      });
      lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) {
          lightbox.classList.remove("is-active");
        }
      });
    }
  }

  /**
   * FAQ Accordion
   */
  function initAccordions() {
    var accordions = document.querySelectorAll(".accordian");
    accordions.forEach(function (acc) {
      var heads = acc.querySelectorAll(".accordian-head");
      heads.forEach(function (head) {
        head.addEventListener("click", function () {
          var parent = head.parentElement;
          var body = parent ? parent.querySelector(".accordian-body") : null;
          var isOpen = head.classList.contains("active");

          // Close all in same accordion group
          acc.querySelectorAll(".accordian-head").forEach(function (h) {
            h.classList.remove("active");
          });
          acc.querySelectorAll(".accordian-body").forEach(function (b) {
            b.style.display = "none";
          });

          if (!isOpen && body) {
            head.classList.add("active");
            body.style.display = "block";
          }
        });
      });
    });
  }

  /**
   * Animated Fun Fact Counters
   */
  function initCounters() {
    var counters = document.querySelectorAll(".tm-counter");
    if (!counters.length) return;

    function animateCounter(el) {
      if (el.getAttribute("data-counted") === "true") return;
      el.setAttribute("data-counted", "true");
      var target = parseInt(
        el.getAttribute("data-target") || el.textContent.replace(/[^\d]/g, ""),
        10,
      );
      var suffix = el.getAttribute("data-suffix") || "";
      if (isNaN(target) || target <= 0) return;

      var duration = 1600;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var current = Math.floor(progress * target);
        el.textContent = current.toLocaleString() + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = target.toLocaleString() + suffix;
        }
      }
      window.requestAnimationFrame(step);
    }

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 },
      );

      counters.forEach(function (c) {
        observer.observe(c);
      });
    } else {
      counters.forEach(animateCounter);
    }
  }

  /**
   * Strict Form Input Prevention & Validation (Requirement 14 & 15):
   * - All form inputs required
   * - Username / Name fields: prevent typing numbers or special characters in the field itself
   * - Number / Phone fields: prevent typing alphabets or special characters in the field itself
   * - Date fields: prevent past dates from being selected or entered
   */
  function initStrictFormValidation() {
    var controlKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ];

    // 1. Get today's date string in YYYY-MM-DD (local timezone)
    var now = new Date();
    var yyyy = now.getFullYear();
    var mm = String(now.getMonth() + 1).padStart(2, "0");
    var dd = String(now.getDate()).padStart(2, "0");
    var todayStr = yyyy + "-" + mm + "-" + dd;

    // 2. Enforce required attribute on all form fields across all pages
    var allForms = document.querySelectorAll("form");
    allForms.forEach(function (form) {
      var fields = form.querySelectorAll("input, select, textarea");
      fields.forEach(function (field) {
        if (
          field.type !== "hidden" &&
          field.type !== "submit" &&
          field.type !== "button"
        ) {
          field.setAttribute("required", "required");
        }
      });
    });

    // 3. Name / Username inputs: ONLY alphabets and spaces allowed (prevent numbers & special chars from being typed)
    var nameInputs = document.querySelectorAll(
      'input[data-validate="name"], input[name*="name" i], input[id*="name" i]',
    );
    nameInputs.forEach(function (input) {
      if (input.type === "email") return;

      input.addEventListener("keydown", function (e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (controlKeys.indexOf(e.key) !== -1) return;
        if (!/^[a-zA-Z\s]$/.test(e.key)) {
          e.preventDefault();
        }
      });

      input.addEventListener("beforeinput", function (e) {
        if (e.data && !/^[a-zA-Z\s]+$/.test(e.data)) {
          e.preventDefault();
        }
      });

      input.addEventListener("input", function () {
        var cleaned = input.value.replace(/[^a-zA-Z\s]/g, "");
        if (input.value !== cleaned) {
          input.value = cleaned;
        }
      });

      input.addEventListener("paste", function (e) {
        e.preventDefault();
        var pasted =
          (e.clipboardData || window.clipboardData).getData("text") || "";
        var cleaned = pasted.replace(/[^a-zA-Z\s]/g, "");
        var start = input.selectionStart || 0;
        var end = input.selectionEnd || 0;
        input.value =
          input.value.slice(0, start) + cleaned + input.value.slice(end);
      });
    });

    // 4. Phone / Number inputs: ONLY digits 0-9 allowed (prevent alphabets & special chars from being typed)
    var numberInputs = document.querySelectorAll(
      'input[data-validate="phone"], input[data-validate="number"], input[type="tel"], input[type="number"], input[name*="phone" i], input[name*="number" i], input[id*="phone" i], input[id*="number" i]',
    );
    numberInputs.forEach(function (input) {
      input.addEventListener("keydown", function (e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (controlKeys.indexOf(e.key) !== -1) return;
        if (!/^[0-9]$/.test(e.key)) {
          e.preventDefault();
        }
      });

      input.addEventListener("beforeinput", function (e) {
        if (e.data && !/^[0-9]+$/.test(e.data)) {
          e.preventDefault();
        }
      });

      input.addEventListener("input", function () {
        var cleaned = input.value.replace(/[^0-9]/g, "");
        if (input.value !== cleaned) {
          input.value = cleaned;
        }
      });

      input.addEventListener("paste", function (e) {
        e.preventDefault();
        var pasted =
          (e.clipboardData || window.clipboardData).getData("text") || "";
        var cleaned = pasted.replace(/[^0-9]/g, "");
        var start = input.selectionStart || 0;
        var end = input.selectionEnd || 0;
        input.value =
          input.value.slice(0, start) + cleaned + input.value.slice(end);
      });
    });

    // 5. Date inputs: Prevent past dates from being entered or selected
    var dateInputs = document.querySelectorAll(
      'input[type="date"], input[data-validate="future-date"], input[name*="date" i], input[id*="date" i]',
    );
    dateInputs.forEach(function (input) {
      if (input.type !== "date") {
        input.type = "date";
      }
      input.setAttribute("min", todayStr);
      if (!input.value) {
        input.value = todayStr;
      }

      function enforceFutureDate() {
        if (input.value && input.value < todayStr) {
          input.value = todayStr;
          input.setCustomValidity(
            "Past dates are not allowed. Please choose today or a future date.",
          );
          input.reportValidity();
        } else {
          input.setCustomValidity("");
        }
      }

      input.addEventListener("change", enforceFutureDate);
      input.addEventListener("input", enforceFutureDate);
      input.addEventListener("blur", function () {
        input.setCustomValidity("");
      });
    });

    // 6. Clean Form Submission Handler with zero console errors
    allForms.forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        var alertBox = form.querySelector(".tm-form-alert");
        if (!alertBox) {
          alertBox = document.createElement("div");
          alertBox.className = "tm-form-alert";
          form.insertBefore(alertBox, form.firstChild);
        }

        // Verify all required fields and date constraints
        var valid = true;
        var requiredFields = form.querySelectorAll("[required]");
        requiredFields.forEach(function (field) {
          if (!field.value || !field.value.trim()) {
            valid = false;
            field.classList.add("is-invalid");
          } else if (field.type === "date" && field.value < todayStr) {
            valid = false;
            field.value = todayStr;
            field.classList.add("is-invalid");
          } else {
            field.classList.remove("is-invalid");
          }
        });

        if (!valid) {
          alertBox.className = "tm-form-alert error";
          alertBox.innerHTML =
            '<i class="fa-solid fa-triangle-exclamation me-2"></i>Please complete all required fields with valid details.';
          return;
        }

        var successMsg =
          form.getAttribute("data-success-msg") ||
          "Thank you! Your telemedicine request has been securely registered. Our UK clinical coordinator (+91 9876543210) will confirm shortly.";

        alertBox.className = "tm-form-alert success";
        alertBox.innerHTML =
          '<i class="fa-solid fa-circle-check me-2"></i>' + successMsg;

        form.reset();
        // Restore today's default date on any date inputs after reset
        form.querySelectorAll('input[type="date"]').forEach(function (dInput) {
          dInput.setAttribute("min", todayStr);
          dInput.value = todayStr;
        });
      });
    });
  }

  /**
   * Initialize everything on DOMContentLoaded
   */
  document.addEventListener("DOMContentLoaded", function () {
    initCommonComponents(function () {
      initHeaderAndMobileMenu();
      initScrollToTop();
    });
    initRotatingText();
    initDepartmentTabs();
    initBeforeAfterSliders();
    initFilterGridsAndLightbox();
    initAccordions();
    initCounters();
    initStrictFormValidation();
  });
})();
