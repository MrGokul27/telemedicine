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

          var visibleIdx = 0;
          items.forEach(function (item) {
            var cats = (item.getAttribute("data-category") || "").split(/\s+/);
            if (filterValue === "*" || cats.indexOf(filterValue) !== -1) {
              item.style.display = "";
              item.classList.add("is-revealed", "is-reveal-complete");
              item.classList.remove("tm-filter-animating");
              // Reflow to restart filter animation cleanly
              void item.offsetWidth;
              item.style.animationDelay = (visibleIdx % 4) * 55 + "ms";
              item.classList.add("tm-filter-animating");
              visibleIdx++;
            } else {
              item.style.display = "none";
              item.classList.remove("tm-filter-animating");
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
   * Scroll Reveal Animations for Home Page & All Sub-Pages (All Sections)
   */
  var tmRevealObserver = null;
  var tmSectionObserver = null;

  function markRevealElement(el, effect, delayMs) {
    if (!el || el.classList.contains("tm-reveal")) return;
    // Skip elements inside inactive tab items or inactive dashboard panes
    var parentTabItem = el.closest ? el.closest(".tm-tabs-item") : null;
    if (parentTabItem && !parentTabItem.classList.contains("active")) return;
    var parentDashPane = el.closest
      ? el.closest(".tm-dash-section-pane")
      : null;
    if (parentDashPane && !parentDashPane.classList.contains("active")) return;

    el.classList.add("tm-reveal");
    if (!el.getAttribute("data-reveal")) {
      el.setAttribute("data-reveal", effect || "fade-up");
    }
    var delay =
      typeof delayMs === "number"
        ? delayMs
        : parseInt(el.getAttribute("data-reveal-delay") || "0", 10) || 0;
    el.setAttribute("data-reveal-delay", String(delay));
    el.style.setProperty("--tm-reveal-delay", delay + "ms");
  }

  function triggerElementReveal(el) {
    if (!el || el.classList.contains("is-revealed")) return;
    el.classList.add("is-revealed");

    // Animate any governance progress bars inside this element
    var progressBars = el.querySelectorAll(".governance-progress-fill");
    progressBars.forEach(function (bar) {
      var targetW = bar.getAttribute("data-target-width");
      if (targetW) {
        bar.style.width = targetW;
      }
    });

    // Sync Before/After slider dimensions if present inside revealed block
    if (el.querySelector && el.querySelector(".tm-ba-container")) {
      setTimeout(function () {
        window.dispatchEvent(new Event("resize"));
      }, 60);
    }

    var delay = parseInt(el.getAttribute("data-reveal-delay") || "0", 10) || 0;
    setTimeout(function () {
      el.classList.add("is-reveal-complete");
    }, 820 + delay);
  }

  function setupScrollRevealTargets(rootEl) {
    var scope = rootEl || document;

    // Prepare governance progress bars for smooth width fill on reveal
    var govBars = scope.querySelectorAll(".governance-progress-fill");
    govBars.forEach(function (bar) {
      if (!bar.getAttribute("data-target-width")) {
        var inlineW = bar.style.width || "98%";
        bar.setAttribute("data-target-width", inlineW);
        bar.style.width = "0%";
      }
    });

    // 1. Tag every <section> across Home Page and Sub-Pages
    var sections = scope.querySelectorAll("main section, section");
    sections.forEach(function (sec) {
      sec.classList.add("tm-section-reveal");
      if (!sec.getAttribute("data-reveal")) {
        sec.setAttribute("data-reveal", "fade-up");
      }

      // 1a. Hero section on Home page
      if (sec.classList.contains("hero")) {
        var sliderText = sec.querySelector(".slider-text");
        var liveCard = sec.querySelector(".tm-hero-live-card");
        markRevealElement(sliderText, "fade-right", 0);
        markRevealElement(liveCard, "fade-left", 160);
        return;
      }

      // 1b. Common Sub-Page Banner
      if (sec.classList.contains("tm-page-banner")) {
        var bannerContent = sec.querySelector(".tm-page-banner-content");
        markRevealElement(bannerContent, "fade-up", 50);
        return;
      }

      // 1c. Dashboard Hero Banner
      if (sec.classList.contains("tm-dash-hero-banner")) {
        var dashCols = sec.querySelectorAll(":scope > .row > [class*='col-']");
        if (dashCols.length === 2) {
          markRevealElement(dashCols[0], "fade-right", 0);
          markRevealElement(dashCols[1], "fade-left", 120);
        }
        var stripItems = sec.querySelectorAll(
          ".tm-login-data-strip .row > [class*='col-']",
        );
        stripItems.forEach(function (item, idx) {
          markRevealElement(item, "fade-up", idx * 90);
        });
        return;
      }

      // 2. Section Headings inside this section
      var headings = sec.querySelectorAll(".tm-section-heading");
      headings.forEach(function (h) {
        markRevealElement(h, "fade-up", 0);
      });

      // 3. Filter controls & Tab controls
      var filters = sec.querySelectorAll(
        ".tm-portfolio-filter, .doctor-filter-bar",
      );
      filters.forEach(function (f) {
        markRevealElement(f, "fade-up", 70);
      });

      var tabWraps = sec.querySelectorAll(".tm-tab-wrap");
      tabWraps.forEach(function (tw) {
        var tabsNav = tw.querySelector(".tm-tabs-wrap");
        var tabContent = tw.querySelector(".tm-tab-content");
        markRevealElement(tabsNav, "fade-up", 80);
        markRevealElement(tabContent, "fade-up", 170);
      });

      // 4. Special composite wrappers (CMO Spotlight, Blog Featured Story, Comparison/Roster Tables, Newsletter, Map)
      var cmoWrap = sec.querySelector(".cmo-spotlight-wrap");
      if (cmoWrap) {
        markRevealElement(cmoWrap, "zoom-in", 0);
        var cmoImg = cmoWrap.querySelector(".cmo-spotlight-img");
        var cmoTextCol = cmoWrap.querySelector(".col-lg-7");
        markRevealElement(cmoImg, "fade-right", 110);
        markRevealElement(cmoTextCol, "fade-left", 180);
      }

      var blogFeatWrap = sec.querySelector(".blog-featured-wrap");
      if (blogFeatWrap) {
        markRevealElement(blogFeatWrap, "zoom-in", 0);
        var featImg = blogFeatWrap.querySelector(".blog-featured-img");
        var featBody = blogFeatWrap.querySelector(".blog-featured-content");
        markRevealElement(featImg, "fade-right", 110);
        markRevealElement(featBody, "fade-left", 180);
      }

      var tableWraps = sec.querySelectorAll(
        ".dept-compare-table-wrap, .roster-table-wrap",
      );
      tableWraps.forEach(function (tw) {
        markRevealElement(tw, "fade-up", 120);
      });

      var newsletter = sec.querySelector(".tm-newsletter");
      if (newsletter) {
        markRevealElement(newsletter, "zoom-in", 0);
      }

      var mapBox = sec.querySelector("#tm-map");
      if (mapBox) {
        markRevealElement(mapBox, "fade-up", 100);
      }
      if (sec.id === "uk-map-section") {
        var mapIntro = sec.querySelector(".container");
        markRevealElement(mapIntro, "fade-up", 0);
      }

      // 5. Content Rows & Columns inside the section
      var rows = sec.querySelectorAll(".row");
      rows.forEach(function (row) {
        // Do not tag form input rows, tab pane inner rows, or already handled special wrappers
        if (
          row.closest("form") ||
          row.closest(".tm-tab-wrap") ||
          row.closest(".cmo-spotlight-wrap") ||
          row.closest(".blog-featured-wrap")
        ) {
          return;
        }
        // Skip rows nested inside another column that is already a card/box
        var parentRow = row.parentElement
          ? row.parentElement.closest(".row")
          : null;
        var directCols = Array.prototype.filter.call(
          row.children,
          function (child) {
            return child.className && child.className.indexOf("col-") !== -1;
          },
        );
        if (!directCols.length) return;

        if (!parentRow) {
          if (directCols.length === 1) {
            var singleEffect = directCols[0].querySelector(".tm-ba-container")
              ? "zoom-in"
              : "fade-up";
            markRevealElement(directCols[0], singleEffect, 90);
          } else if (directCols.length === 2) {
            markRevealElement(directCols[0], "fade-right", 0);
            markRevealElement(directCols[1], "fade-left", 140);

            // Also stagger stacked blog cards or governance progress items inside 2-column layouts
            directCols.forEach(function (col) {
              var stackedPosts = col.querySelectorAll(".tm-post.tm-style2");
              stackedPosts.forEach(function (post, pIdx) {
                markRevealElement(post, "fade-left", pIdx * 110);
              });
              var govItems = col.querySelectorAll(".governance-progress-item");
              govItems.forEach(function (gItem, gIdx) {
                markRevealElement(gItem, "fade-up", gIdx * 90);
              });
            });
          } else {
            var colsPerRow = directCols.length === 3 ? 3 : 4;
            directCols.forEach(function (col, idx) {
              var isZoomCard =
                col.querySelector(
                  ".tm-fun-fact, .tm-portfolio-card, .gallery-showcase-card, .tm-partner-card, .blog-topic-pill-card, .sla-tier-card",
                ) !== null;
              var effect = isZoomCard ? "zoom-in" : "fade-up";
              var delay = (idx % colsPerRow) * 95;
              markRevealElement(col, effect, delay);
            });
          }
        } else {
          // Nested sub-grid inside a 2-column section (e.g., 4 RPM boxes, 4 Security pillars, 3 AI triage boxes, 4 Fun facts)
          directCols.forEach(function (subCol, sIdx) {
            markRevealElement(subCol, "fade-up", 100 + (sIdx % 4) * 85);
          });
        }
      });

      // 6. Stagger individual FAQ Accordion items
      var accItems = sec.querySelectorAll(".accordian .single-accordian");
      accItems.forEach(function (item, aIdx) {
        markRevealElement(item, "fade-up", aIdx * 85);
      });
    });

    // 7. Auth Pages (login.html & register.html) and 404 Page (404.html)
    var authShowcase = scope.querySelector(
      ".tm-auth-showcase, .tm-404-showcase",
    );
    var authFormCol = scope.querySelector(".tm-auth-form-col, .tm-404-console");
    if (authShowcase) markRevealElement(authShowcase, "fade-right", 0);
    if (authFormCol) markRevealElement(authFormCol, "fade-left", 140);

    // 8. Dashboard Active Pane Cards (dashboard.html)
    var activeDashPane = scope.querySelector(".tm-dash-section-pane.active");
    if (activeDashPane) {
      var kpiCols = activeDashPane.querySelectorAll(".row > [class*='col-']");
      kpiCols.forEach(function (col, kIdx) {
        markRevealElement(col, "fade-up", (kIdx % 4) * 85);
      });
      var dashCards = activeDashPane.querySelectorAll(".tm-dash-card");
      dashCards.forEach(function (card, cIdx) {
        markRevealElement(card, "fade-up", cIdx * 90);
      });
    }

    // 9. Common Site Footer (#site-footer)
    var footer =
      scope.id === "site-footer" ? scope : scope.querySelector("#site-footer");
    if (footer) {
      var topBar = footer.querySelector(".tm-footer-top-bar");
      var widgetCols = footer.querySelectorAll(
        ".tm-footer-main .row > [class*='col-']",
      );
      var copyright = footer.querySelector(".tm-copyright");
      markRevealElement(topBar, "fade-up", 0);
      widgetCols.forEach(function (wCol, wIdx) {
        markRevealElement(wCol, "fade-up", wIdx * 100);
      });
      markRevealElement(copyright, "fade-up", 80);
    }
  }

  function observeScrollRevealTargets(rootEl) {
    var scope = rootEl || document;
    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var allSections = scope.querySelectorAll(".tm-section-reveal");
    var allReveals = scope.querySelectorAll(".tm-reveal");

    if (prefersReduced || !("IntersectionObserver" in window)) {
      allSections.forEach(function (s) {
        s.classList.add("is-section-revealed");
      });
      allReveals.forEach(function (el) {
        triggerElementReveal(el);
      });
      return;
    }

    if (!tmSectionObserver) {
      tmSectionObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-section-revealed");
              tmSectionObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.02, rootMargin: "0px 0px -25px 0px" },
      );
    }

    if (!tmRevealObserver) {
      tmRevealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              triggerElementReveal(entry.target);
              tmRevealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
      );
    }

    allSections.forEach(function (sec) {
      if (!sec.classList.contains("is-section-revealed")) {
        tmSectionObserver.observe(sec);
      }
    });

    allReveals.forEach(function (el) {
      if (!el.classList.contains("is-revealed")) {
        tmRevealObserver.observe(el);
      }
    });
  }

  function initScrollReveal() {
    setupScrollRevealTargets(document);

    // If the Home Page preloader is active, wait until it dismisses so Hero section animations play visibly
    var preloader = document.getElementById("tm-preloader");
    if (preloader && document.body.classList.contains("tm-preloader-lock")) {
      document.addEventListener(
        "tm:preloader-dismissed",
        function () {
          observeScrollRevealTargets(document);
        },
        { once: true },
      );
    } else {
      observeScrollRevealTargets(document);
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
      if (form.id === "tm-login-form" || form.id === "tm-register-form") return;
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
      if (input.type === "email" || input.id === "reg-username") return;

      input.addEventListener("keydown", function (e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (controlKeys.indexOf(e.key) !== -1) return;
        if (e.key === " " || e.code === "Space") {
          e.preventDefault();
          return;
        }
        if (!/^[a-zA-Z]$/.test(e.key)) {
          e.preventDefault();
        }
      });

      input.addEventListener("beforeinput", function (e) {
        if (e.data && !/^[a-zA-Z]+$/.test(e.data)) {
          e.preventDefault();
        }
      });

      input.addEventListener("input", function () {
        var cleaned = input.value.replace(/[^a-zA-Z]/g, "");
        if (input.value !== cleaned) {
          input.value = cleaned;
        }
      });

      input.addEventListener("paste", function (e) {
        e.preventDefault();
        var pasted =
          (e.clipboardData || window.clipboardData).getData("text") || "";
        var cleaned = pasted.replace(/[^a-zA-Z]/g, "");
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
      if (form.id === "tm-login-form" || form.id === "tm-register-form") return;
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

        var target404 = isSubPage() ? "404.html" : "pages/404.html";
        window.location.href = target404;
      });
    });
  }

  /**
   * Redirect all empty links ("") or "#" links across the entire project to the 404 page
   */
  function initEmptyAndHashLinksRedirect() {
    document.addEventListener("click", function (e) {
      var link = e.target && e.target.closest ? e.target.closest("a") : null;
      if (!link) return;

      var rawHref = link.getAttribute("href");
      var trimmed = rawHref !== null ? rawHref.trim() : "";
      var lower = trimmed.toLowerCase();

      var isEmptyOrHash =
        rawHref === null ||
        trimmed === "" ||
        trimmed === "#" ||
        lower === "javascript:void(0)" ||
        lower === "javascript:;";

      // Also catch hash links (#section) if no matching target element exists on the page
      if (!isEmptyOrHash && trimmed.charAt(0) === "#" && trimmed.length > 1) {
        var targetId = trimmed.slice(1);
        if (!document.getElementById(targetId)) {
          isEmptyOrHash = true;
        }
      }

      if (isEmptyOrHash) {
        e.preventDefault();
        var target404 = isSubPage() ? "404.html" : "pages/404.html";
        window.location.href = target404;
      }
    });
  }

  /**
   * Home Page Telemedicine 4K Preloader (~2 Seconds)
   */
  function initHomePreloader() {
    var preloader = document.getElementById("tm-preloader");
    if (!preloader) return;

    var barEl = document.getElementById("tm-preloader-bar");
    var percentEl = document.getElementById("tm-preloader-percent");
    var statusEl = document.getElementById("tm-preloader-status");

    var durationMs = 2000; // 2 seconds total preloader experience
    var startTime = performance.now();
    var dismissed = false;

    var statusStages = [
      { threshold: 0, text: "Initializing Encrypted 4K Video Channel..." },
      { threshold: 32, text: "Syncing Biometric ECG & Wearable Telemetry..." },
      { threshold: 68, text: "Connecting GMC-Certified UK Specialists..." },
      { threshold: 94, text: "Virtual Clinic Ready — Launching..." },
    ];

    function dismissPreloader() {
      if (dismissed) return;
      dismissed = true;
      if (barEl) barEl.style.width = "100%";
      if (percentEl) percentEl.textContent = "100%";
      if (statusEl) {
        statusEl.textContent = "Virtual Clinic Ready — Launching...";
      }

      preloader.classList.add("is-loaded");
      document.body.classList.remove("tm-preloader-lock");
      document.dispatchEvent(new CustomEvent("tm:preloader-dismissed"));

      setTimeout(function () {
        if (preloader && preloader.parentNode) {
          preloader.parentNode.removeChild(preloader);
        }
      }, 600);
    }

    function tick(now) {
      if (dismissed) return;
      var elapsed = now - startTime;
      var progress = Math.min(elapsed / durationMs, 1);
      // Smooth ease-out curve for the percentage counter
      var eased = 1 - Math.pow(1 - progress, 1.65);
      var pct = Math.min(Math.round(eased * 100), 100);

      if (barEl) barEl.style.width = pct + "%";
      if (percentEl) percentEl.textContent = pct + "%";

      if (statusEl) {
        var activeText = statusStages[0].text;
        for (var i = 0; i < statusStages.length; i++) {
          if (pct >= statusStages[i].threshold) {
            activeText = statusStages[i].text;
          }
        }
        if (statusEl.textContent !== activeText) {
          statusEl.textContent = activeText;
        }
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        dismissPreloader();
      }
    }

    requestAnimationFrame(tick);
    // Fallback safety timer in case tab is backgrounded
    setTimeout(dismissPreloader, durationMs + 150);
  }

  /**
   * Initialize everything on DOMContentLoaded
   */
  document.addEventListener("DOMContentLoaded", function () {
    initHomePreloader();
    initScrollReveal();
    initEmptyAndHashLinksRedirect();
    initCommonComponents(function () {
      initHeaderAndMobileMenu();
      initScrollToTop();
      var footerEl = document.getElementById("footer-placeholder");
      if (footerEl) {
        setupScrollRevealTargets(footerEl);
        observeScrollRevealTargets(footerEl);
      }
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
