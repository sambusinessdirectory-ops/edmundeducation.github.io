(function () {
  "use strict";

  var canvas = document.getElementById("gameCanvas");
  var ctx = canvas.getContext("2d");
  var actionButton = document.getElementById("actionButton");
  var statusElement = document.getElementById("gameStatus");
  var toast = document.getElementById("toast");
  var carrotCountElement = document.getElementById("carrotCount");
  var readyCountElement = document.getElementById("readyCount");
  var gameTimeElement = document.getElementById("gameTime");
  var dayPhaseElement = document.getElementById("dayPhase");
  var phaseIconElement = document.getElementById("phaseIcon");
  var clockPillElement = document.getElementById("clockPill");
  var inventoryToggle = document.getElementById("inventoryToggle");
  var inventoryPanel = document.getElementById("inventoryPanel");
  var inventoryClose = document.getElementById("inventoryClose");
  var inventoryHotbar = document.getElementById("inventoryHotbar");
  var inventoryGrid = document.getElementById("inventoryGrid");
  var inventoryCapacity = document.getElementById("inventoryCapacity");
  var inventoryIconElement = document.getElementById("inventoryIcon");
  var seedSelector = document.getElementById("seedSelector");
  var seedIconElement = document.getElementById("seedIcon");
  var seedNameElement = document.getElementById("seedName");
  var eddyPortrait = document.getElementById("eddyPortrait");
  var productionRuntime = window.EddyProductionRuntime || null;

  var VIEW = Object.freeze({ width: 1280, height: 720 });
  var WORLD = Object.freeze({ width: 20, height: 16 });
  // The asset contract defines a native 128×64 logical diamond. The camera
  // applies one documented uniform fit-to-world zoom; no second tile-size
  // conversion is hidden in individual renderers.
  var TILE = Object.freeze({ width: 128, height: 64 });
  var GROW_TIME = 10000;
  var INTERACTION_RADIUS = 1.65;
  var SAVE_KEY = "eddy-carrot-patch-v4";
  var PREVIOUS_SAVE_KEY = "eddy-carrot-patch-v3";
  var LEGACY_SAVE_KEY = "eddy-carrot-patch-v1";
  var SAVE_VERSION = 4;
  var INVENTORY_SLOT_COUNT = 12;
  var PRODUCTION_CROP_IDS = productionRuntime
    ? productionRuntime.ids().filter(function (assetId) { return productionRuntime.category(assetId) === "Crops"; }).sort()
    : ["CROP-CARROT-001"];

  function cropItemId(assetId) {
    return String(assetId || "CROP-CARROT-001").replace(/^CROP-/, "").replace(/-001$/, "").toLowerCase().replace(/-/g, "_");
  }

  function buildItemDefinitions() {
    var definitions = Object.create(null);
    PRODUCTION_CROP_IDS.forEach(function (assetId) {
      var asset = productionRuntime && productionRuntime.entry(assetId);
      var id = cropItemId(assetId);
      var produceIcon = productionRuntime && productionRuntime.select(assetId, { component: "produce_icon", state: "harvested_produce_icon", layer: "diffuse" });
      var seedIcon = productionRuntime && productionRuntime.select(assetId, { component: "seed_packet_icon", state: "seed_packet_icon", layer: "diffuse" });
      definitions[id] = Object.freeze({
        id: id,
        assetId: assetId,
        name: asset && asset.name ? asset.name.replace(/\s+(crop|family)$/i, "") : id.replace(/_/g, " ").replace(/\b\w/g, function (letter) { return letter.toUpperCase(); }),
        icon: id === "carrot" ? "🥕" : "🌱",
        iconUrl: produceIcon && produceIcon.url || seedIcon && seedIcon.url,
        seedIconUrl: seedIcon && seedIcon.url || produceIcon && produceIcon.url,
        stackLimit: 999,
        category: "crop"
      });
    });
    if (!definitions.carrot) {
      definitions.carrot = Object.freeze({ id: "carrot", assetId: "CROP-CARROT-001", name: "Carrot", icon: "🥕", iconUrl: null, seedIconUrl: null, stackLimit: 999, category: "crop" });
    }
    return Object.freeze(definitions);
  }

  var ITEM_DEFINITIONS = buildItemDefinitions();
  var selectedCropId = ITEM_DEFINITIONS.carrot ? "carrot" : Object.keys(ITEM_DEFINITIONS)[0];
  var DIRECTIONS = Object.freeze(["n", "ne", "e", "se", "s", "sw", "w", "nw"]);
  var DAY_MINUTES = 24 * 60;
  var CLOCK_SAVE_INTERVAL = 12;
  var DAY_PHASE_INFO = Object.freeze({
    sunrise: Object.freeze({ label: "Sunrise", icon: "🌅" }),
    morning: Object.freeze({ label: "Morning", icon: "☀️" }),
    afternoon: Object.freeze({ label: "Afternoon", icon: "🌤️" }),
    night: Object.freeze({ label: "Night", icon: "🌙" })
  });
  var LIGHT_KEYFRAMES = Object.freeze([
    { hour: 0, overlay: [28, 39, 83, 0.4], vignette: 0.18, night: 1, shadowX: -2, shadowY: 2, shadowLength: 0.82, shadowStrength: 0.68 },
    { hour: 4.75, overlay: [42, 50, 94, 0.36], vignette: 0.17, night: 0.92, shadowX: -2, shadowY: 2, shadowLength: 0.86, shadowStrength: 0.7 },
    { hour: 6.25, overlay: [255, 159, 99, 0.16], vignette: 0.12, night: 0.25, shadowX: 14, shadowY: 7, shadowLength: 1.52, shadowStrength: 1.12 },
    { hour: 8, overlay: [255, 226, 177, 0.07], vignette: 0.09, night: 0, shadowX: 10, shadowY: 6, shadowLength: 1.25, shadowStrength: 1.04 },
    { hour: 10.5, overlay: [255, 248, 216, 0.025], vignette: 0.075, night: 0, shadowX: 7, shadowY: 5, shadowLength: 1.05, shadowStrength: 0.96 },
    { hour: 12, overlay: [255, 255, 255, 0.01], vignette: 0.065, night: 0, shadowX: 5, shadowY: 4, shadowLength: 0.94, shadowStrength: 0.92 },
    { hour: 15, overlay: [255, 218, 135, 0.07], vignette: 0.08, night: 0, shadowX: 8, shadowY: 6, shadowLength: 1.08, shadowStrength: 0.98 },
    { hour: 17.45, overlay: [255, 176, 92, 0.14], vignette: 0.105, night: 0.08, shadowX: 13, shadowY: 8, shadowLength: 1.45, shadowStrength: 1.08 },
    { hour: 18.75, overlay: [81, 65, 104, 0.25], vignette: 0.14, night: 0.58, shadowX: 5, shadowY: 5, shadowLength: 1.02, shadowStrength: 0.8 },
    { hour: 21, overlay: [28, 39, 83, 0.4], vignette: 0.18, night: 1, shadowX: -2, shadowY: 2, shadowLength: 0.82, shadowStrength: 0.68 },
    { hour: 24, overlay: [28, 39, 83, 0.4], vignette: 0.18, night: 1, shadowX: -2, shadowY: 2, shadowLength: 0.82, shadowStrength: 0.68 }
  ]);
  var DPR = Math.min(2, Math.max(1, window.devicePixelRatio || 1));

  canvas.width = Math.round(VIEW.width * DPR);
  canvas.height = Math.round(VIEW.height * DPR);

  var camera = createCamera();
  var keys = Object.create(null);
  var touchDirections = new Set();
  var clickTarget = null;
  var lastTime = performance.now();
  var lastSaveAt = 0;
  var toastTimer = 0;
  var elapsedSeconds = 0;
  var clockSaveElapsed = 0;
  var gameClock = { minutes: 6 * 60, speed: 2, day: 1 };
  var clockPreview = null;
  var lastClockHudKey = "";
  var lightingState = getLightingState(gameClock.minutes);
  var floatingLoot = [];
  var fallbackRegistry = null;
  function drawFallbackEffect() { return false; }
  function drawFallbackStatic() { return false; }
  function drawFallbackSprite() { return false; }
  function drawFallbackAnimation() { return false; }
  function drawFallbackStaticLayer() { return false; }
  function drawFallbackPropShadow() { return false; }
  function productionRecord(assetId, criteria) {
    return productionRuntime ? productionRuntime.select(assetId, criteria || {}) : null;
  }

  function recordVisibleWidth(record, fallback) {
    if (!record) return fallback;
    var box = record.alphaBBox || record.alpha_bbox || record.visibleAlphaBbox || record.visible_alpha_bbox;
    if (Array.isArray(box) && box.length >= 4) return Math.max(1, Number(box[2]) - Number(box[0]));
    if (record.visibleSize && record.visibleSize[0]) return record.visibleSize[0];
    return fallback;
  }

  function fallbackFootprint(assetId) {
    var category = productionRuntime ? productionRuntime.category(assetId) : "";
    if (category === "Buildings") return 2.4;
    if (category === "Trees & Bushes") return 1.25;
    if (category === "Fences & Structural Props") return 0.8;
    if (category === "Props & Tools") return 0.55;
    if (category === "Animals") return 0.65;
    if (category === "Characters") return 0.72;
    if (category === "Crops") return 0.32;
    return 0.5;
  }

  function productionWorldScale(assetId, record, size, footprintAssetId) {
    if (!productionRuntime || !record) return 1;
    var canvas = productionRuntime.canvasSize(assetId, record);
    var radiusSource = footprintAssetId && productionRuntime.entry(footprintAssetId) ? footprintAssetId : assetId;
    var radius = productionRuntime.footprintRadius(radiusSource, fallbackFootprint(radiusSource));
    var desiredWidth = Math.max(0.18, radius * 2) * TILE.width * camera.zoom * (size || 1);
    return desiredWidth / recordVisibleWidth(record, canvas[0]);
  }

  function drawProductionWorldAsset(assetId, entity, criteria) {
    if (!productionRuntime || !assetId || !productionRuntime.entry(assetId)) return false;
    criteria = Object.assign({}, criteria || {});
    criteria.view = criteria.view || criteria.direction || entity.assetDirection || entity.direction || "";
    criteria.surface = criteria.surface || GAMEPLAY_SURFACE_BY_CATEGORY[productionRuntime.category(assetId)] || "world";
    productionRuntime.registerReachable([assetId], criteria.surface);
    var strictFrames = criteria.exact && productionRuntime.framesExact ? productionRuntime.framesExact(assetId, criteria) : null;
    var record = criteria.animated
      ? ((strictFrames || productionRuntime.frames(assetId, criteria))[0] || (criteria.exact && productionRuntime.selectExact ? productionRuntime.selectExact(assetId, criteria) : productionRecord(assetId, criteria)))
      : (criteria.exact && productionRuntime.selectExact ? productionRuntime.selectExact(assetId, criteria) : productionRecord(assetId, criteria));
    if (!record) return false;
    var point = worldToScreen(entity.worldX, entity.worldY);
    point.x += (entity.screenOffsetX || 0) * camera.zoom;
    point.y += (entity.screenOffsetY || 0) * camera.zoom;
    criteria.x = point.x;
    criteria.y = point.y;
    criteria.scale = productionWorldScale(assetId, record, entity.size || 1, criteria.footprintAssetId);
    return productionRuntime.draw(ctx, assetId, criteria);
  }

  function productionClipDuration(assetId, criteria) {
    if (!productionRuntime) return 0;
    criteria = criteria || {};
    var sequence = criteria.exact && productionRuntime.framesExact ? productionRuntime.framesExact(assetId, criteria) : productionRuntime.frames(assetId, criteria);
    if (!sequence.length) return 0;
    return sequence.reduce(function (total, record) {
      return total + productionRuntime.timing(assetId, record).frameDurationMs;
    }, 0);
  }

  function productionAssetIds(category) {
    if (!productionRuntime) return [];
    return productionRuntime.ids().filter(function (assetId) {
      return !category || productionRuntime.category(assetId) === category;
    });
  }

  var GAMEPLAY_SURFACE_BY_CATEGORY = Object.freeze({
    Foundation: "world-shadow",
    Characters: "character-hud",
    Terrain: "terrain-world",
    Crops: "crop-world",
    "Trees & Bushes": "world-static",
    Buildings: "world-static",
    "Fences & Structural Props": "world-structure",
    "Props & Tools": "world-prop",
    Animals: "animal-world",
    "UI & HUD": "game-hud",
    "Visual Effects": "gameplay-effect",
    Animations: "world-animation"
  });

  function registerGameplayConsumerFactories() {
    if (!productionRuntime) return;
    productionRuntime.ids().forEach(function (assetId) {
      var category = productionRuntime.category(assetId);
      var surface = GAMEPLAY_SURFACE_BY_CATEGORY[category];
      if (surface) {
        productionRuntime.registerReachable([assetId], surface + "-factory");
        // This is the real metadata-driven subsystem route. It is deliberately
        // separate from the generic factory route.
        productionRuntime.registerReachable([assetId], surface + "-consumer");
      }
    });
  }

  function registerGameplayStateRoutes() {
    if (!productionRuntime) return;
    productionRuntime.registerReachable(PRODUCTION_CROP_IDS, "seed-selector-route");
    productionRuntime.registerReachable([
      "ANIMSEQ-EDDY-IDLE-001", "ANIMSEQ-EDDY-WALK-001", "ANIMSEQ-EDDY-PLANT-001",
      "ANIMSEQ-EDDY-WATER-001", "ANIMSEQ-EDDY-HARVEST-001", "ANIMSEQ-EDDY-PICKUP-001",
      "ANIMSEQ-EDDY-FULL-001"
    ], "player-action-state-machine");
    productionRuntime.registerReachable([
      "FX-SEED-001", "FX-WATER-001", "FX-HARVEST-001", "FX-ITEMFLY-001",
      "FX-RIPPLE-001", "FX-READY-001", "FX-LIGHTPOOL-001"
    ], "gameplay-effect-state-machine");
    productionRuntime.registerReachable([
      "UI-INVENTORY-BAR-001", "UI-INVENTORY-SLOT-001", "UI-INVENTORY-BAG-001",
      "UI-CLOCK-001", "UI-READY-001", "UI-INTERACT-001", "UI-NOTIFY-001",
      "UI-PICKUP-001", "UI-SELECTION-001", "UI-PANEL-001", "UI-BUTTON-001"
    ], "hud-state-machine");
  }

  function setIconContent(element, definition, surface) {
    if (!element || !definition) return;
    if (definition.iconUrl && element.dataset.productionUrl === definition.iconUrl) return;
    element.textContent = "";
    if (definition.iconUrl) {
      element.dataset.productionUrl = definition.iconUrl;
      var image = document.createElement("img");
      image.src = definition.iconUrl;
      image.alt = "";
      image.addEventListener("load", function () {
        if (productionRuntime) productionRuntime.markRendered(definition.assetId, surface || "game-hud");
      }, { once: true });
      element.appendChild(image);
    } else {
      delete element.dataset.productionUrl;
      element.textContent = definition.icon;
    }
  }

  function setRuntimeImage(element, assetId, criteria, surface) {
    if (!element || !productionRuntime) return false;
    var record = productionRuntime.select(assetId, criteria || {});
    if (!record) return false;
    if (element.dataset.productionUrl === record.url) return true;
    element.dataset.productionUrl = record.url;
    element.src = record.url;
    element.hidden = false;
    element.addEventListener("load", function () {
      productionRuntime.markRendered(assetId, surface || "game-hud");
    }, { once: true });
    productionRuntime.registerReachable([assetId], surface || "game-hud");
    return true;
  }

  function setProductionBackground(element, assetId, criteria, surface) {
    if (!element || !productionRuntime) return false;
    var record = productionRuntime.select(assetId, criteria || {});
    if (!record) return false;
    if (element.dataset.productionBackground !== record.url) {
      element.dataset.productionBackground = record.url;
      element.style.backgroundImage = "url(\"" + record.url.replace(/\"/g, "%22") + "\")";
      var probe = productionRuntime.image(record.url);
      if (probe.complete && probe.naturalWidth) productionRuntime.markRendered(assetId, surface || "game-hud");
      else probe.addEventListener("load", function () { productionRuntime.markRendered(assetId, surface || "game-hud"); }, { once: true });
    }
    productionRuntime.registerReachable([assetId], surface || "game-hud");
    return true;
  }

  function initialiseProductionHud() {
    if (!productionRuntime) return;
    productionRuntime.preload(["CHAR-EDDY-REF-001"], { view: "se", state: "neutral", layer: "diffuse" });
    setRuntimeImage(eddyPortrait, "CHAR-EDDY-REF-001", { view: "se", state: "neutral", layer: "diffuse" }, "character-hud");
    setProductionBackground(inventoryHotbar, "UI-INVENTORY-BAR-001", { state: "base", layer: "ui" }, "inventory-hud");
    setProductionBackground(inventoryPanel, "UI-PANEL-001", { state: "inventory", layer: "ui" }, "inventory-hud");
    setProductionBackground(actionButton, "UI-BUTTON-001", { state: "enabled", layer: "ui" }, "interaction-hud");
    setProductionBackground(toast, "UI-NOTIFY-001", { state: "base", layer: "ui" }, "notification-hud");
  }

  function productionSelectedAnimationRecord(assetId, criteria) {
    if (!productionRuntime) return null;
    var strict = criteria.exact && productionRuntime.selectExact && productionRuntime.framesExact;
    if (!criteria.animated) return strict ? productionRuntime.selectExact(assetId, criteria) : productionRuntime.select(assetId, criteria);
    var sequence = strict ? productionRuntime.framesExact(assetId, criteria) : productionRuntime.frames(assetId, criteria);
    if (!sequence.length) return strict ? productionRuntime.selectExact(assetId, criteria) : productionRuntime.select(assetId, criteria);
    var timing = productionRuntime.timing(assetId, sequence[0]);
    var frameIndex = Math.floor(Math.max(0, criteria.elapsedMs || 0) / timing.frameDurationMs);
    if (timing.loop) frameIndex %= sequence.length;
    else frameIndex = Math.min(sequence.length - 1, frameIndex);
    return sequence[frameIndex];
  }

  var productionEffects = [];

  function actionDuration(assetId, fallback) {
    var duration = productionClipDuration(assetId, { view: player && player.direction || "se", layer: "diffuse" });
    return duration > 0 ? clamp(Math.round(duration), 450, 3200) : fallback;
  }

  function combinedActionDuration(assetIds, fallback) {
    var durations = (assetIds || []).map(function (assetId) { return productionClipDuration(assetId, { view: player && player.direction || "se", layer: "diffuse" }); });
    var total = durations.reduce(function (sum, duration) { return sum + duration; }, 0);
    return total > 0 ? clamp(Math.round(total), 700, 4200) : fallback;
  }

  function spawnProductionEffect(assetId, worldX, worldY, state) {
    if (!productionRuntime || !productionRuntime.entry(assetId)) return;
    var duration = productionClipDuration(assetId, { state: state, layer: "effect" }) || productionClipDuration(assetId, { state: state }) || 900;
    productionRuntime.registerReachable([assetId], "gameplay-effect");
    productionEffects.push({
      assetId: assetId,
      worldX: worldX,
      worldY: worldY,
      state: state || "",
      startedAt: performance.now(),
      duration: clamp(duration, 250, 4000)
    });
  }

  function drawProductionEffects(now) {
    productionEffects = productionEffects.filter(function (effect) { return now - effect.startedAt <= effect.duration; });
    productionEffects.forEach(function (effect) {
      drawProductionWorldAsset(effect.assetId, effect, {
        animated: true,
        elapsedMs: now - effect.startedAt,
        state: effect.state,
        layer: "effect",
        surface: "gameplay-effect"
      });
    });
  }

  function Inventory(slotCount) {
    this.slotCount = Math.max(1, Math.floor(slotCount || INVENTORY_SLOT_COUNT));
    this.slots = new Array(this.slotCount).fill(null);
  }

  Inventory.prototype.getDefinition = function (itemId) {
    return ITEM_DEFINITIONS[itemId] || null;
  };

  Inventory.prototype.getQuantity = function (itemId) {
    return this.slots.reduce(function (total, slot) {
      return total + (slot && slot.itemId === itemId ? slot.quantity : 0);
    }, 0);
  };

  Inventory.prototype.getFreeCapacity = function (itemId) {
    var definition = this.getDefinition(itemId);
    if (!definition) return 0;
    return this.slots.reduce(function (capacity, slot) {
      if (!slot) return capacity + definition.stackLimit;
      if (slot.itemId !== itemId) return capacity;
      return capacity + Math.max(0, definition.stackLimit - slot.quantity);
    }, 0);
  };

  Inventory.prototype.canAdd = function (itemId, quantity) {
    quantity = Math.max(0, Math.floor(quantity || 0));
    return Boolean(this.getDefinition(itemId)) && this.getFreeCapacity(itemId) >= quantity;
  };

  Inventory.prototype.addItem = function (itemId, quantity) {
    var definition = this.getDefinition(itemId);
    var requested = Math.max(0, Math.floor(quantity == null ? 1 : quantity));
    if (!definition || requested === 0) return { added: 0, remaining: requested };
    var remaining = requested;

    this.slots.forEach(function (slot) {
      if (!remaining || !slot || slot.itemId !== itemId) return;
      var amount = Math.min(definition.stackLimit - slot.quantity, remaining);
      if (amount <= 0) return;
      slot.quantity += amount;
      remaining -= amount;
    });

    for (var i = 0; i < this.slots.length && remaining > 0; i += 1) {
      if (this.slots[i]) continue;
      var amount = Math.min(definition.stackLimit, remaining);
      this.slots[i] = { itemId: itemId, quantity: amount };
      remaining -= amount;
    }

    if (remaining !== requested) this.emitChanged();
    return { added: requested - remaining, remaining: remaining };
  };

  Inventory.prototype.removeItem = function (itemId, quantity) {
    var requested = Math.max(0, Math.floor(quantity == null ? 1 : quantity));
    var remaining = requested;
    for (var i = this.slots.length - 1; i >= 0 && remaining > 0; i -= 1) {
      var slot = this.slots[i];
      if (!slot || slot.itemId !== itemId) continue;
      var amount = Math.min(slot.quantity, remaining);
      slot.quantity -= amount;
      remaining -= amount;
      if (slot.quantity <= 0) this.slots[i] = null;
    }
    if (remaining !== requested) this.emitChanged();
    return { removed: requested - remaining, remaining: remaining };
  };

  Inventory.prototype.restore = function (savedSlots) {
    var totals = Object.create(null);
    if (Array.isArray(savedSlots)) {
      savedSlots.forEach(function (slot) {
        if (!slot || !ITEM_DEFINITIONS[slot.itemId]) return;
        var quantity = Math.max(0, Math.floor(Number(slot.quantity) || 0));
        if (quantity > 0) totals[slot.itemId] = (totals[slot.itemId] || 0) + quantity;
      });
    }
    this.slots = new Array(this.slotCount).fill(null);
    var slotIndex = 0;
    Object.keys(totals).forEach(function (itemId) {
      var definition = ITEM_DEFINITIONS[itemId];
      var remaining = totals[itemId];
      while (remaining > 0 && slotIndex < this.slotCount) {
        var amount = Math.min(definition.stackLimit, remaining);
        this.slots[slotIndex] = { itemId: itemId, quantity: amount };
        remaining -= amount;
        slotIndex += 1;
      }
    }, this);
    this.emitChanged();
  };

  Inventory.prototype.serialize = function () {
    return this.slots.map(function (slot) {
      return slot ? { itemId: slot.itemId, quantity: slot.quantity } : null;
    });
  };

  Inventory.prototype.emitChanged = function () {
    if (typeof window.CustomEvent !== "function") return;
    window.dispatchEvent(new CustomEvent("eddy:inventory-changed", {
      detail: { slots: this.serialize(), carrotCount: this.getQuantity("carrot") }
    }));
  };

  var inventory = new Inventory(INVENTORY_SLOT_COUNT);

  var plots = createPlots();
  var trees = [
    { id: "tree-1", assetId: "TREE-APPLE-001", worldX: 2.25, worldY: 2.2, kind: "apple", size: 1.08, variant: 1 },
    { id: "tree-2", assetId: "TREE-SHADE-001", worldX: 4.05, worldY: 2.05, kind: "leaf", size: 0.9, variant: 2 },
    { id: "tree-3", assetId: "TREE-APPLE-001", worldX: 2.05, worldY: 4.15, kind: "apple", size: 0.94, variant: 3 },
    { id: "tree-4", assetId: "TREE-PEAR-001", worldX: 4.15, worldY: 4.15, kind: "pear", size: 1.12, variant: 4 },
    { id: "tree-5", assetId: "TREE-SHADE-001", worldX: 2.35, worldY: 6.1, kind: "leaf", size: 0.87, variant: 5 },
    { id: "tree-6", assetId: "TREE-APPLE-001", worldX: 4.45, worldY: 6.15, kind: "apple", size: 1.01, variant: 6 },
    { id: "tree-7", assetId: "TREE-AUTUMN-001", worldX: 17.7, worldY: 11.35, kind: "autumn", size: 1.04, variant: 7 },
    { id: "tree-8", assetId: "TREE-EVERGREEN-001", worldX: 18.25, worldY: 13.45, kind: "leaf", size: 0.91, variant: 8 }
  ];

  var decor = [
    { id: "orchard-sign", assetId: "PROP-SIGN-ORCHARD-001", type: "sign", worldX: 5.05, worldY: 2.05, label: "ORCHARD", size: 0.78, assetDirection: "se" },
    { id: "barn-sign", assetId: "PROP-SIGN-BARN-001", type: "sign", worldX: 14.65, worldY: 2.45, label: "BARN", size: 0.72, assetDirection: "sw" },
    { id: "birdhouse", assetId: "PROP-BIRDHOUSE-001", type: "birdhouse", worldX: 1.55, worldY: 7.3, size: 0.82 },
    { id: "hay-1", assetId: "PROP-HAY-SQUARE-001", type: "hayBale", worldX: 17.3, worldY: 3.35, variant: 1 },
    { id: "hay-2", assetId: "PROP-HAY-ROUND-001", type: "hayBale", worldX: 18.15, worldY: 3.6, variant: 2, size: 0.88 },
    { id: "crate-1", assetId: "PROP-CRATE-001", type: "crate", worldX: 15.1, worldY: 2.65, variant: 1 },
    { id: "barrel-1", assetId: "PROP-BARREL-001", type: "barrel", worldX: 16.0, worldY: 2.55 },
    { id: "sacks", assetId: "PROP-SEEDSACK-001", type: "sacks", worldX: 14.25, worldY: 2.5 },
    { id: "wheelbarrow", assetId: "PROP-WHEELBARROW-001", type: "wheelbarrow", worldX: 17.3, worldY: 5.2 },
    { id: "bucket", assetId: "PROP-BUCKET-001", type: "bucket", worldX: 15.65, worldY: 5.05, size: 0.78 },
    { id: "watering-can", assetId: "PROP-WATERINGCAN-001", type: "wateringCan", worldX: 7.15, worldY: 7.75, size: 0.78 },
    { id: "seed-basket", assetId: "PROP-BASKET-001", type: "basket", worldX: 16.45, worldY: 7.9, size: 0.84 },
    { id: "bench", assetId: "PROP-BENCH-001", type: "bench", worldX: 5.0, worldY: 12.65, size: 0.9 },
    { id: "pond-crate", assetId: "PROP-CRATE-CARROT-001", type: "crate", worldX: 1.55, worldY: 12.55, size: 0.7, variant: 2 },
    { id: "stump", assetId: "PROP-LOG-001", type: "stump", worldX: 7.3, worldY: 13.7, size: 0.82 },
    { id: "rock-1", assetId: "PROP-ROCK-001", type: "rock", worldX: 8.4, worldY: 12.8, size: 0.7, variant: 1 },
    { id: "rock-2", assetId: "PROP-ROCK-001", type: "rock", worldX: 14.1, worldY: 11.6, size: 0.55, variant: 2 },
    { id: "fallen-log", assetId: "PROP-LOG-001", type: "log", worldX: 3.25, worldY: 14.25, size: 0.72, assetDirection: "se" },
    { id: "farm-lantern", assetId: "PROP-LANTERN-001", type: "lantern", worldX: 14.95, worldY: 1.55, size: 0.72, assetDirection: "se" },
    { id: "barn-weathervane", assetId: "PROP-WEATHERVANE-001", type: "weathervane", worldX: 16.0, worldY: 1.18, size: 0.72, assetDirection: "se", depthOffset: 0.62, screenOffsetY: -222 },
    { id: "tool-rack", assetId: "PROP-FLOWERPOT-TOOLS-001", type: "tools", worldX: 18.45, worldY: 6.15, size: 0.82 },
    { id: "flowers-1", type: "flowers", worldX: 5.35, worldY: 7.25, variant: 1 },
    { id: "flowers-2", type: "flowers", worldX: 5.35, worldY: 4.95, variant: 2 },
    { id: "flowers-3", type: "flowers", worldX: 6.9, worldY: 10.15, variant: 3 },
    { id: "pasture-basket", type: "basket", worldX: 13.7, worldY: 13.35, size: 0.72 },
    // A purposeful potting corner fills the former lower-left lawn. These are
    // ordinary depth-sorted decorations, so the zone can later gain gameplay
    // without changing the renderer.
    { id: "garden-well", assetId: "BLDG-WELL-001", type: "well", worldX: 8.55, worldY: 13.65, size: 0.78 },
    { id: "seed-rack", assetId: "BLDG-STORAGE-001", type: "seedRack", worldX: 10.05, worldY: 13.5, size: 0.5 },
    { id: "flower-bed-1", assetId: "PROP-PLANTER-001", type: "flowerBed", worldX: 8.0, worldY: 14.65, size: 0.82, variant: 1 },
    { id: "flower-bed-2", assetId: "PROP-PLANTER-001", type: "flowerBed", worldX: 9.45, worldY: 14.55, size: 0.76, variant: 2 },
    { id: "potting-planter", assetId: "PROP-PLANTER-001", type: "planter", worldX: 7.1, worldY: 13.2, size: 0.72, assetDirection: "se" },
    { id: "compost-bin", assetId: "BLDG-COMPOST-001", type: "compost", worldX: 11.25, worldY: 13.7, size: 0.54 },
    { id: "field-trellis", assetId: "STRUCT-TRELLIS-001", type: "productionStatic", worldX: 13.1, worldY: 5.2, size: 0.7, assetDirection: "se" },
    { id: "path-lamp", assetId: "STRUCT-LAMP-001", type: "productionStatic", worldX: 6.55, worldY: 9.7, size: 0.65, assetDirection: "se" },
    { id: "farm-gate", assetId: "STRUCT-GATE-001", animationAssetId: "ANIMSEQ-GATE-001", type: "productionStatic", worldX: 6.0, worldY: 1.05, size: 0.9, assetDirection: "se" },
    { id: "stone-wall", assetId: "STRUCT-WALL-001", type: "productionStatic", worldX: 18.2, worldY: 9.7, size: 0.72, assetDirection: "se" },
    { id: "blank-farm-sign", assetId: "STRUCT-SIGN-001", type: "productionStatic", worldX: 10.7, worldY: 9.55, size: 0.62, assetDirection: "se" },
    // A compact produce market gives the quiet lower field a recognisable
    // destination without covering the main paths, pond or potting corner.
    { id: "farm-market", assetId: "BLDG-MARKET-001", type: "marketStand", worldX: 14.9, worldY: 13.95, size: 0.72 }
  ];

  var hedges = [
    { id: "hedge-1", assetId: "HEDGE-001", type: "hedge", worldX: 5.25, worldY: 3.45, size: 0.9, variant: 1 },
    { id: "hedge-2", assetId: "STRUCT-HEDGE-001", type: "hedge", worldX: 5.25, worldY: 5.75, size: 0.82, variant: 2 },
    { id: "hedge-3", assetId: "HEDGE-001", type: "hedge", worldX: 7.45, worldY: 10.25, size: 0.82, variant: 3 },
    { id: "hedge-4", assetId: "STRUCT-HEDGE-001", type: "hedge", worldX: 10.0, worldY: 10.25, size: 0.9, variant: 4 },
    { id: "hedge-5", assetId: "HEDGE-001", type: "hedge", worldX: 12.55, worldY: 10.25, size: 0.84, variant: 5 }
  ];

  var barn = { id: "red-barn", assetId: "BLDG-BARN-001", type: "barn", worldX: 16.0, worldY: 1.18, size: 1 };
  var pond = { worldX: 3.0, worldY: 10.55, rx: 1.78, ry: 1.25 };
  function animalClip(action, assetId, state, options) {
    return Object.freeze(Object.assign({ action: action, assetId: assetId, state: state }, options || {}));
  }
  var CHICKEN_WALK_CLIP = animalClip("walk", "ANIMSEQ-CHICKEN-WALK-001", "walk");
  var CHICKEN_PECK_CLIP = animalClip("peck", "ANIMSEQ-CHICKEN-PECK-001", "peck");
  // The flap package labels its sole appearance `base`; its approved frames
  // are the white chicken. This explicit compatibility alias prevents a brown
  // or speckled chicken from ever entering that clip.
  var CHICKEN_WHITE_FLAP_CLIP = animalClip("flap", "ANIMSEQ-CHICKEN-FLAP-001", "flap", { variant: "base", compatibleIdentityVariant: "white" });
  var DUCK_IDLE_CLIP = animalClip("idle", "ANIMSEQ-DUCK-IDLE-001", "calm");
  var DUCK_SWIM_CLIP = animalClip("swim", "ANIMSEQ-DUCK-SWIM-001", "swim");
  var DUCK_WADDLE_CLIP = animalClip("waddle", "ANIMSEQ-DUCK-WADDLE-001", "walk");
  var animals = [
    { id: "hen-1", type: "chicken", species: "chicken", identityVariant: "white", assetId: "ANIM-CHICKEN-001", animationClips: [CHICKEN_WALK_CLIP, CHICKEN_PECK_CLIP, CHICKEN_WHITE_FLAP_CLIP], primaryAction: "walk", worldX: 15.15, worldY: 3.9, phase: 0.2, color: "#f4eee0" },
    { id: "hen-2", type: "chicken", species: "chicken", identityVariant: "warm_brown", assetId: "ANIM-CHICKEN-001", animationClips: [CHICKEN_WALK_CLIP, CHICKEN_PECK_CLIP], primaryAction: "peck", worldX: 16.25, worldY: 4.2, phase: 2.4, color: "#c98249" },
    { id: "hen-3", type: "chicken", species: "chicken", identityVariant: "white", assetId: "ANIM-CHICKEN-001", animationClips: [CHICKEN_WALK_CLIP, CHICKEN_PECK_CLIP, CHICKEN_WHITE_FLAP_CLIP], primaryAction: "flap", worldX: 14.55, worldY: 4.65, phase: 4.7, color: "#efe4c2" },
    { id: "duck-1", type: "duck", species: "duck", identityVariant: "yellow_duckling", assetId: "ANIM-DUCK-001", animationClips: [DUCK_IDLE_CLIP, DUCK_SWIM_CLIP, DUCK_WADDLE_CLIP], primaryAction: "swim", worldX: 2.6, worldY: 10.25, phase: 0.7, color: "#f2d65c" },
    { id: "duck-2", type: "duck", species: "duck", identityVariant: "white_adult", assetId: "ANIM-DUCK-001", animationClips: [DUCK_IDLE_CLIP, DUCK_SWIM_CLIP, DUCK_WADDLE_CLIP], primaryAction: "idle", worldX: 3.55, worldY: 10.85, phase: 3.1, color: "#f5efe0" },
    { id: "butterfly-1", type: "butterfly", species: "butterfly", identityVariant: "yellow", assetId: "ANIM-BUTTERFLY-001", animationClips: [animalClip("flight", "ANIMSEQ-BUTTERFLY-001", "flight_loop")], primaryAction: "flight", worldX: 5.4, worldY: 8.5, phase: 0.4, color: "#f4c84b" },
    { id: "butterfly-2", type: "butterfly", species: "bee", identityVariant: "honeybee", assetId: "ANIM-BEE-001", animationClips: [animalClip("flight", "ANIMSEQ-BEE-001", "hover_flight")], primaryAction: "flight", worldX: 7.0, worldY: 11.0, phase: 2.1, color: "#d9ae36" },
    { id: "rabbit-1", type: "productionAnimal", species: "rabbit", identityVariant: "base", assetId: "ANIM-RABBIT-001", animationClips: [animalClip("hop", "ANIMSEQ-RABBIT-001", "hop")], primaryAction: "hop", worldX: 11.8, worldY: 11.1, phase: 1.4, size: 0.75 },
    { id: "cow-1", type: "productionAnimal", species: "cow", identityVariant: "base", assetId: "ANIM-COW-001", animationClips: [animalClip("graze_walk", "ANIMSEQ-COW-001", "graze_walk")], primaryAction: "graze_walk", modelOnly: true, worldX: 15.5, worldY: 10.7, phase: 2.2, size: 0.7 },
    { id: "pig-1", type: "productionAnimal", species: "pig", identityVariant: "base", assetId: "ANIM-PIG-001", animationClips: [animalClip("sniff_walk", "ANIMSEQ-PIG-001", "sniff_walk")], primaryAction: "sniff_walk", worldX: 17.0, worldY: 8.0, phase: 3.2, size: 0.72 },
    { id: "sheep-1", type: "productionAnimal", species: "sheep", identityVariant: "base", assetId: "ANIM-SHEEP-001", animationClips: [animalClip("graze_walk", "ANIMSEQ-SHEEP-001", "graze_walk")], primaryAction: "graze_walk", worldX: 13.7, worldY: 10.8, phase: 4.1, size: 0.7 },
    { id: "goat-1", type: "productionAnimal", species: "goat", identityVariant: "base", assetId: "ANIM-GOAT-001", animationClips: [animalClip("playful_hop", "ANIMSEQ-GOAT-001", "playful_hop")], primaryAction: "playful_hop", worldX: 12.8, worldY: 11.8, phase: 5.1, size: 0.66 },
    { id: "dog-1", type: "productionAnimal", species: "dog", identityVariant: "base", assetId: "ANIM-DOG-001", animationClips: [animalClip("walk_wag", "ANIMSEQ-DOG-001", "walk_wag")], primaryAction: "walk_wag", worldX: 12.3, worldY: 7.1, phase: 0.8, size: 0.66 },
    { id: "cat-1", type: "productionAnimal", species: "cat", identityVariant: "base", assetId: "ANIM-CAT-001", animationClips: [animalClip("walk_groom", "ANIMSEQ-CAT-001", "walk_groom")], primaryAction: "walk_groom", worldX: 15.0, worldY: 6.5, phase: 1.8, size: 0.65 },
    { id: "frog-1", type: "productionAnimal", species: "frog", identityVariant: "base", assetId: "ANIM-FROG-001", animationClips: [animalClip("hop_croak", "ANIMSEQ-FROG-001", "hop_croak")], primaryAction: "hop_croak", worldX: 4.0, worldY: 10.1, phase: 2.8, size: 0.6 },
    { id: "bird-1", type: "productionAnimal", species: "bird", identityVariant: "base", assetId: "ANIM-BIRD-001", animationClips: [animalClip("hop_flight", "ANIMSEQ-BIRD-001", "hop_flight")], primaryAction: "hop_flight", worldX: 4.7, worldY: 5.2, phase: 5.8, size: 0.62 },
    { id: "firefly-actor", type: "productionAnimal", species: "firefly", identityVariant: "base", assetId: "ANIM-FIREFLY-001", animationClips: [animalClip("glow_drift", "ANIMSEQ-FIREFLY-001", "glow_drift")], primaryAction: "glow_drift", worldX: 4.7, worldY: 11.8, phase: 4.8, size: 0.58 }
  ];

  function animalDimensionValues(records, key) {
    return Array.from(new Set(records.map(function (record) { return String(record[key] || ""); }).filter(Boolean))).sort();
  }

  function preferredAnimalDimension(values, requested, preferences) {
    if (requested && values.includes(requested)) return requested;
    for (var index = 0; index < (preferences || []).length; index += 1) {
      if (values.includes(preferences[index])) return preferences[index];
    }
    return values[0] || "";
  }

  function animalDiffuseRecords(assetId) {
    return productionRuntime
      ? productionRuntime.outputs(assetId).filter(function (record) { return record.layer === "diffuse"; })
      : [];
  }

  function bindAnimalClip(animal, clip) {
    var records = animalDiffuseRecords(clip.assetId);
    var clipEntry = productionRuntime && productionRuntime.entry(clip.assetId);
    var dependencies = clipEntry && Array.isArray(clipEntry.dependencies) ? clipEntry.dependencies.map(function (dependency) {
      return typeof dependency === "string" ? dependency : dependency && (dependency.assetId || dependency.id) || "";
    }).filter(Boolean) : [];
    var modelDependencies = dependencies.filter(function (assetId) { return productionRuntime.category(assetId) === "Animals"; });
    var variants = animalDimensionValues(records, "variant");
    var states = animalDimensionValues(records, "state");
    var components = animalDimensionValues(records, "component");
    var views = animalDimensionValues(records, "view");
    var runtimeVariant = clip.variant || animal.identityVariant;
    var compatibleIdentity = runtimeVariant === animal.identityVariant || clip.compatibleIdentityVariant === animal.identityVariant;
    var component = clip.component || preferredAnimalDimension(components, "body", ["full"]);
    var state = preferredAnimalDimension(states, clip.state, ["idle", "calm", "neutral"]);
    var matching = records.filter(function (record) {
      return record.variant === runtimeVariant && record.state === state && (!component || record.component === component);
    });
    var frameCountsByView = Object.create(null);
    matching.forEach(function (record) {
      var view = record.view || "default";
      frameCountsByView[view] = (frameCountsByView[view] || 0) + 1;
    });
    return Object.freeze({
      action: clip.action,
      assetId: clip.assetId,
      identityVariant: animal.identityVariant,
      runtimeVariant: runtimeVariant,
      variantBinding: runtimeVariant === animal.identityVariant ? "exact" : "declared_compatible_alias",
      compatibleIdentityVariant: clip.compatibleIdentityVariant || runtimeVariant,
      state: state,
      component: component,
      layer: "diffuse",
      availableVariants: Object.freeze(variants),
      availableStates: Object.freeze(states),
      availableViews: Object.freeze(views),
      frameCountsByView: Object.freeze(frameCountsByView),
      modelDependencyAssetIds: Object.freeze(modelDependencies),
      footprintAssetId: animal.assetId,
      outputCount: matching.length,
      valid: Boolean(records.length && variants.includes(runtimeVariant) && states.includes(state) && compatibleIdentity && matching.length && modelDependencies.includes(animal.assetId))
    });
  }

  function createAnimalIdentityBinding(animal) {
    var modelRecords = animalDiffuseRecords(animal.assetId);
    var modelVariants = animalDimensionValues(modelRecords, "variant");
    var modelStates = animalDimensionValues(modelRecords, "state");
    var modelComponents = animalDimensionValues(modelRecords, "component");
    var modelViews = animalDimensionValues(modelRecords, "view");
    var modelVariant = modelVariants.includes(animal.identityVariant) ? animal.identityVariant : "";
    var modelState = preferredAnimalDimension(modelStates, "neutral_standing", ["neutral_body", "neutral", "base"]);
    var modelComponent = preferredAnimalDimension(modelComponents, "full", ["body"]);
    var modelMatching = modelRecords.filter(function (record) {
      return record.variant === modelVariant && record.state === modelState && (!modelComponent || record.component === modelComponent);
    });
    var clips = Object.freeze((animal.animationClips || []).map(function (clip) { return bindAnimalClip(animal, clip); }));
    var clipByAction = Object.create(null);
    clips.forEach(function (clip) { clipByAction[clip.action] = clip; });
    var model = Object.freeze({
      assetId: animal.assetId,
      identityVariant: animal.identityVariant,
      runtimeVariant: modelVariant,
      state: modelState,
      component: modelComponent,
      layer: "diffuse",
      availableVariants: Object.freeze(modelVariants),
      availableStates: Object.freeze(modelStates),
      availableViews: Object.freeze(modelViews),
      outputCount: modelMatching.length,
      valid: Boolean(modelVariant && modelState && modelMatching.length)
    });
    var valid = Boolean(model.valid && clips.length && clips.every(function (clip) { return clip.valid; }));
    return Object.freeze({
      entityId: animal.id,
      species: animal.species,
      identityVariant: animal.identityVariant,
      identityToken: animal.species + ":" + animal.identityVariant,
      renderSource: animal.modelOnly ? "model" : "animation_sequence",
      model: model,
      clips: clips,
      clipByAction: Object.freeze(clipByAction),
      valid: valid,
      source: "catalogue_output_dimensions_plus_declared_compatibility"
    });
  }

  var animalRenderAudit = Object.create(null);
  animals.forEach(function (animal) {
    var binding = createAnimalIdentityBinding(animal);
    Object.defineProperty(animal, "identityBinding", { value: binding, enumerable: true, writable: false, configurable: false });
    if (!binding.valid && productionRuntime) console.warn("Animal identity binding is incomplete; unsafe fallback is disabled.", animal.id, binding);
  });

  // Fireflies live outside the entity sorter because they are a translucent
  // world effect drawn after the night grade. Their positions are authored in
  // world space so they stay attached to the pond, meadow and barnyard.
  var fireflies = [
    { x: 2.1, y: 9.35, phase: 0.2 }, { x: 2.75, y: 11.55, phase: 1.4 },
    { x: 3.75, y: 9.85, phase: 2.7 }, { x: 4.45, y: 11.6, phase: 4.1 },
    { x: 5.2, y: 6.8, phase: 5.2 }, { x: 6.35, y: 10.7, phase: 0.9 },
    { x: 8.1, y: 12.45, phase: 2.0 }, { x: 9.6, y: 14.15, phase: 3.5 },
    { x: 11.4, y: 12.7, phase: 4.8 }, { x: 13.65, y: 10.8, phase: 1.8 },
    { x: 14.55, y: 4.2, phase: 3.2 }, { x: 15.75, y: 3.3, phase: 5.7 },
    { x: 16.75, y: 4.45, phase: 0.5 }, { x: 17.65, y: 6.0, phase: 2.4 },
    { x: 18.1, y: 9.15, phase: 4.4 }, { x: 16.4, y: 11.9, phase: 5.9 }
  ];

  trees.forEach(function (tree) {
    var random = seededSequence(tree.variant * 997);
    tree.lobes = [];
    tree.fruit = [];
    for (var i = 0; i < 19; i += 1) {
      var angle = i / 19 * Math.PI * 2 + random() * 0.34;
      var radius = 16 + random() * 31;
      tree.lobes.push({ x: Math.cos(angle) * radius, y: -91 + Math.sin(angle) * 24 - random() * 22, radius: 14 + random() * 10 });
    }
    for (var f = 0; f < 11; f += 1) {
      var fruitAngle = f / 11 * Math.PI * 2 + tree.variant;
      var fruitRadius = 16 + (f % 4) * 8;
      tree.fruit.push({ x: Math.cos(fruitAngle) * fruitRadius, y: -96 + Math.sin(fruitAngle) * 22 });
    }
  });

  var player = {
    worldX: 6.65,
    worldY: 7.55,
    direction: "se",
    walking: false,
    gaitPhase: 0,
    screenSpeed: 178,
    harvestingUntil: 0,
    action: null,
    actionStartedAt: 0,
    actionUntil: 0
  };

  function setPlayerAction(action, durationMs) {
    var now = performance.now();
    player.action = action;
    player.actionStartedAt = now;
    player.actionUntil = now + durationMs;
    player.walking = false;
    clickTarget = null;
  }

  function activePlayerAction() {
    if (!player.action || performance.now() >= player.actionUntil) {
      player.action = null;
      return null;
    }
    return player.action;
  }

  function createCamera() {
    var corners = [
      isoRaw(0, 0), isoRaw(WORLD.width, 0),
      isoRaw(0, WORLD.height), isoRaw(WORLD.width, WORLD.height)
    ];
    var minX = Math.min.apply(null, corners.map(function (p) { return p.x; }));
    var maxX = Math.max.apply(null, corners.map(function (p) { return p.x; }));
    var minY = Math.min.apply(null, corners.map(function (p) { return p.y; }));
    var maxY = Math.max.apply(null, corners.map(function (p) { return p.y; }));
    var zoom = Math.min((VIEW.width - 82) / (maxX - minX), (VIEW.height - 100) / (maxY - minY));
    return {
      zoom: zoom,
      offsetX: (VIEW.width - (maxX - minX) * zoom) / 2 - minX * zoom,
      offsetY: 42 - minY * zoom
    };
  }

  function isoRaw(worldX, worldY) {
    return {
      x: (worldX - worldY) * TILE.width / 2,
      y: (worldX + worldY) * TILE.height / 2
    };
  }

  function worldToScreen(worldX, worldY) {
    var iso = isoRaw(worldX, worldY);
    return {
      x: camera.offsetX + iso.x * camera.zoom,
      y: camera.offsetY + iso.y * camera.zoom
    };
  }

  function screenToWorld(screenX, screenY) {
    var isoX = (screenX - camera.offsetX) / camera.zoom;
    var isoY = (screenY - camera.offsetY) / camera.zoom;
    return {
      x: isoY / TILE.height + isoX / TILE.width,
      y: isoY / TILE.height - isoX / TILE.width
    };
  }

  function createPlots() {
    var result = [];
    var origin = { x: 7.0, y: 3.25 };
    var size = 2;
    var gap = 0.36;
    for (var row = 0; row < 2; row += 1) {
      for (var col = 0; col < 4; col += 1) {
        var plotIndex = row * 4 + col;
        var plants = [];
        for (var plantRow = 0; plantRow < 4; plantRow += 1) {
          for (var plantCol = 0; plantCol < 5; plantCol += 1) {
            var plantIndex = plantRow * 5 + plantCol;
            plants.push({ x: -0.78 + plantCol * 0.39 + (hash2(plotIndex * 31 + plantIndex, 1.2) - 0.5) * 0.04, y: -0.72 + plantRow * 0.48 + (hash2(plotIndex * 47 + plantIndex, 5.8) - 0.5) * 0.036, size: 0.6 + hash2(plotIndex * 17 + plantIndex, 8.4) * 0.16, lean: (hash2(plotIndex * 23 + plantIndex, 3.1) - 0.5) * 0.25, hue: hash2(plotIndex * 13 + plantIndex, 9.7) });
          }
        }
        result.push({
          id: "bed-" + (row * 4 + col + 1),
          worldX: origin.x + col * (size + gap) + size / 2,
          worldY: origin.y + row * (size + gap) + size / 2,
          width: size,
          height: size,
          plantedAt: null,
          cropId: null,
          variant: plotIndex,
          plants: plants
        });
      }
    }
    return result;
  }

  function seededSequence(seed) {
    var value = seed >>> 0;
    return function () { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
  }

  function createGroundArt() {
    var random = seededSequence(88421); var patches = []; var decals = [];
    for (var p = 0; p < 22; p += 1) patches.push({ x: -1.5 + random() * 23, y: -1.5 + random() * 19, rx: 1.2 + random() * 3.3, ry: 0.7 + random() * 2.1, tone: p % 4, alpha: 0.055 + random() * 0.05 });
    var types = ["blade", "blade", "blade", "clover", "flowerWhite", "flowerYellow", "pebble", "bare"];
    function addDecal(x, y, type, size) {
      if (x < 0 || y < 0 || x > WORLD.width || y > WORLD.height) return false;
      if (pointInsideAnyPlot(x, y) || pointInsidePond(x, y, 0.12) || pointInsideBarn(x, y, 0.1)) return false;
      decals.push({ x: x, y: y, type: type, size: size || 0.65 + random() * 0.72, turn: random() * 2 - 1 });
      return true;
    }
    // A sparse base texture prevents repetition, while authored clusters make
    // the meadow read as natural growth rather than evenly distributed noise.
    for (var i = 0; i < 116; i += 1) {
      addDecal(-0.5 + random() * 21, -0.45 + random() * 17, types[Math.floor(random() * types.length)]);
    }
    [
      { x: 2.0, y: 8.2, radius: 1.15, count: 19, palette: ["flowerWhite", "blade", "clover"] },
      { x: 6.4, y: 12.0, radius: 1.4, count: 21, palette: ["flowerYellow", "blade", "clover"] },
      { x: 9.0, y: 14.2, radius: 1.65, count: 24, palette: ["flowerWhite", "flowerYellow", "clover"] },
      { x: 13.6, y: 12.6, radius: 1.25, count: 17, palette: ["blade", "clover", "bare"] },
      { x: 18.1, y: 9.8, radius: 1.35, count: 19, palette: ["flowerYellow", "blade", "pebble"] }
    ].forEach(function (cluster, clusterIndex) {
      for (var n = 0; n < cluster.count; n += 1) {
        var angle = random() * Math.PI * 2;
        var distance = Math.sqrt(random()) * cluster.radius;
        addDecal(cluster.x + Math.cos(angle) * distance, cluster.y + Math.sin(angle) * distance, cluster.palette[(n + clusterIndex) % cluster.palette.length], 0.58 + random() * 0.58);
      }
    });
    return { patches: patches, decals: decals };
  }

  function createPathArt() {
    var random = seededSequence(5127); var stones = [];
    for (var i = 0; i < 52; i += 1) { var vertical = i < 27; stones.push({ x: vertical ? 5.55 + random() * 0.9 : 4.7 + random() * 13.6, y: vertical ? 1.45 + random() * 13.2 : 8.58 + random() * 0.84, size: 0.5 + random() * 0.8, dark: random() > 0.56 }); }
    return stones;
  }

  function createSoilArt() {
    var random = seededSequence(93017);
    return plots.map(function () { var bits = []; for (var i = 0; i < 18; i += 1) bits.push({ x: -0.82 + random() * 1.64, y: -0.82 + random() * 1.64, size: 0.45 + random(), tone: random() }); return bits; });
  }

  var groundArt = createGroundArt();
  var pathStones = createPathArt();
  var soilArt = createSoilArt();

  function getPlotState(plot, now) {
    if (!Number.isFinite(plot.plantedAt)) return { name: "empty", progress: 0 };
    var progress = Math.max(0, (now - plot.plantedAt) / GROW_TIME);
    if (progress >= 1) return { name: "ready", progress: 1 };
    if (progress < 0.24) return { name: "seed", progress: progress };
    if (progress < 0.58) return { name: "sprout", progress: progress };
    return { name: "leafy", progress: progress };
  }

  function lerp(a, b, amount) {
    return a + (b - a) * amount;
  }

  function smoothstep(amount) {
    var value = clamp(amount, 0, 1);
    return value * value * (3 - 2 * value);
  }

  function getDayPhase(minutes) {
    var hour = ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES / 60;
    if (hour >= 5 && hour < 8) return "sunrise";
    if (hour >= 8 && hour < 12) return "morning";
    if (hour >= 12 && hour < 18) return "afternoon";
    return "night";
  }

  function getLightingState(minutes) {
    var hour = ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES / 60;
    var from = LIGHT_KEYFRAMES[0];
    var to = LIGHT_KEYFRAMES[LIGHT_KEYFRAMES.length - 1];
    for (var i = 0; i < LIGHT_KEYFRAMES.length - 1; i += 1) {
      if (hour >= LIGHT_KEYFRAMES[i].hour && hour <= LIGHT_KEYFRAMES[i + 1].hour) {
        from = LIGHT_KEYFRAMES[i];
        to = LIGHT_KEYFRAMES[i + 1];
        break;
      }
    }
    var span = Math.max(0.001, to.hour - from.hour);
    var amount = smoothstep((hour - from.hour) / span);
    return {
      hour: hour,
      phase: getDayPhase(minutes),
      overlay: from.overlay.map(function (channel, channelIndex) {
        return lerp(channel, to.overlay[channelIndex], amount);
      }),
      vignette: lerp(from.vignette, to.vignette, amount),
      night: lerp(from.night, to.night, amount),
      shadowX: lerp(from.shadowX, to.shadowX, amount),
      shadowY: lerp(from.shadowY, to.shadowY, amount),
      shadowLength: lerp(from.shadowLength, to.shadowLength, amount),
      shadowStrength: lerp(from.shadowStrength, to.shadowStrength, amount)
    };
  }

  function formatGameTime(minutes) {
    var total = Math.floor(((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES);
    var hour = Math.floor(total / 60);
    var minute = total % 60;
    return String(hour).padStart(2, "0") + ":" + String(minute).padStart(2, "0");
  }

  function updateGameClock(dt) {
    if (clockPreview) {
      lightingState = getLightingState(gameClock.minutes);
      return;
    }
    gameClock.minutes += dt * gameClock.speed;
    while (gameClock.minutes >= DAY_MINUTES) {
      gameClock.minutes -= DAY_MINUTES;
      gameClock.day += 1;
    }
    while (gameClock.minutes < 0) {
      gameClock.minutes += DAY_MINUTES;
      gameClock.day = Math.max(1, gameClock.day - 1);
    }
    lightingState = getLightingState(gameClock.minutes);
    clockSaveElapsed += dt;
    if (clockSaveElapsed >= CLOCK_SAVE_INTERVAL) {
      clockSaveElapsed = 0;
      saveGame();
    }
  }

  function setGameTime(hour, minute) {
    var hours = Number(hour);
    var minutes = Number(minute);
    if (!Number.isFinite(hours)) hours = 0;
    if (!Number.isFinite(minutes)) minutes = 0;
    clockPreview = null;
    gameClock.minutes = ((hours * 60 + minutes) % DAY_MINUTES + DAY_MINUTES) % DAY_MINUTES;
    lightingState = getLightingState(gameClock.minutes);
    saveGame();
    return getClockSnapshot();
  }

  // QA-only lighting preview. Unlike setGameTime(), this freezes the clock and
  // never lets the preview value replace the player's saved time.
  function previewGameTime(hour, minute) {
    var hours = Number(hour);
    var minutes = Number(minute);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return getClockSnapshot();
    if (!clockPreview) {
      clockPreview = {
        minutes: gameClock.minutes,
        day: gameClock.day,
        speed: gameClock.speed
      };
    }
    gameClock.minutes = ((hours * 60 + minutes) % DAY_MINUTES + DAY_MINUTES) % DAY_MINUTES;
    gameClock.speed = 0;
    lightingState = getLightingState(gameClock.minutes);
    lastClockHudKey = "";
    updateInterface();
    return getClockSnapshot();
  }

  function clearGameTimePreview() {
    if (!clockPreview) return getClockSnapshot();
    gameClock.minutes = clockPreview.minutes;
    gameClock.day = clockPreview.day;
    gameClock.speed = clockPreview.speed;
    clockPreview = null;
    lightingState = getLightingState(gameClock.minutes);
    lastClockHudKey = "";
    updateInterface();
    return getClockSnapshot();
  }

  function getClockSnapshot() {
    return {
      day: gameClock.day,
      minutes: round(gameClock.minutes, 3),
      hour: round(gameClock.minutes / 60, 3),
      formatted: formatGameTime(gameClock.minutes),
      phase: lightingState.phase,
      speed: gameClock.speed,
      nightStrength: round(lightingState.night, 3),
      preview: Boolean(clockPreview)
    };
  }

  function setClockSpeed(speed) {
    var nextSpeed = Number(speed);
    if (!Number.isFinite(nextSpeed)) return getClockSnapshot();
    if (clockPreview) clearGameTimePreview();
    gameClock.speed = clamp(nextSpeed, 0, 240);
    saveGame();
    return getClockSnapshot();
  }

  function loadSave() {
    function readStoredSave(key) {
      try {
        var raw = localStorage.getItem(key);
        if (!raw) return null;
        var parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : null;
      } catch (error) {
        console.warn("Eddy save entry could not be read; trying an older save.", key, error);
        return null;
      }
    }

    try {
      var sourceKey = null;
      var saved = null;
      [SAVE_KEY, PREVIOUS_SAVE_KEY, LEGACY_SAVE_KEY].some(function (key) {
        var fallback = readStoredSave(key);
        if (!fallback) return false;
        sourceKey = key;
        saved = fallback;
        return true;
      });
      if (!saved) return;

      var savedPlayerX = Number.isFinite(saved.playerWorldX) ? saved.playerWorldX : saved.player && saved.player.x;
      var savedPlayerY = Number.isFinite(saved.playerWorldY) ? saved.playerWorldY : saved.player && saved.player.y;
      if (Number.isFinite(savedPlayerX)) player.worldX = clamp(savedPlayerX, 0.65, WORLD.width - 0.65);
      if (Number.isFinite(savedPlayerY)) player.worldY = clamp(savedPlayerY, 0.65, WORLD.height - 0.65);
      player.direction = normalizeDirection(saved.direction, player.direction);

      var savedSlots = Array.isArray(saved.inventory)
        ? saved.inventory
        : saved.inventory && Array.isArray(saved.inventory.slots)
          ? saved.inventory.slots
          : null;
      if (savedSlots) {
        inventory.restore(savedSlots);
      } else {
        var legacyCarrots = Number.isFinite(saved.carrots)
          ? saved.carrots
          : saved.player && Number.isFinite(saved.player.carrots)
            ? saved.player.carrots
            : null;
        var migratedCarrots = legacyCarrots == null ? 0 : Math.max(0, Math.floor(legacyCarrots));
        var migrationResult = inventory.addItem("carrot", migratedCarrots);
        if (migrationResult.remaining > 0) {
          console.warn("The old carrot total exceeded the new inventory capacity; the excess could not be migrated.");
        }
      }

      if (Array.isArray(saved.plots)) {
        saved.plots.forEach(function (savedPlot) {
          var plot = plots.find(function (item) { return item.id === savedPlot.id; });
          if (plot && Number.isFinite(savedPlot.plantedAt)) {
            plot.plantedAt = savedPlot.plantedAt;
            plot.cropId = ITEM_DEFINITIONS[savedPlot.cropId] ? savedPlot.cropId : "carrot";
          }
        });
      }
      if (ITEM_DEFINITIONS[saved.selectedCropId]) selectedCropId = saved.selectedCropId;
      if (saved.clock && typeof saved.clock === "object") {
        if (Number.isFinite(saved.clock.minutes)) {
          gameClock.minutes = ((saved.clock.minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
        }
        if (Number.isFinite(saved.clock.day)) gameClock.day = Math.max(1, Math.floor(saved.clock.day));
        if (Number.isFinite(saved.clock.speed)) gameClock.speed = clamp(saved.clock.speed, 0, 240);
        lightingState = getLightingState(gameClock.minutes);
      }
      movePlayerToNearestWalkablePoint();
      if (sourceKey !== SAVE_KEY || saved.version !== SAVE_VERSION) saveGame();
    } catch (error) {
      console.warn("Eddy save could not be read; starting a fresh farm.", error);
    }
  }

  function saveGame() {
    try {
      // QA lighting previews are deliberately render-only. Never let an
      // afternoon/night preview replace the player's real saved farm clock.
      var clockToSave = gameClock;
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        version: SAVE_VERSION,
        playerWorldX: round(player.worldX, 4),
        playerWorldY: round(player.worldY, 4),
        direction: player.direction,
        selectedCropId: selectedCropId,
        inventory: {
          slotCount: inventory.slotCount,
          slots: inventory.serialize()
        },
        clock: {
          minutes: round(clockToSave.minutes, 3),
          day: clockToSave.day,
          speed: round(clockToSave.speed, 3)
        },
        plots: plots.map(function (plot) { return { id: plot.id, plantedAt: plot.plantedAt, cropId: plot.cropId }; })
      }));
      lastSaveAt = performance.now();
    } catch (error) {
      console.warn("Eddy save could not be written.", error);
    }
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove("show"); }, 1900);
  }

  function announce(message) {
    statusElement.textContent = message;
  }

  function nearestPlot() {
    var result = null;
    var best = Infinity;
    plots.forEach(function (plot) {
      var dx = plot.worldX - player.worldX;
      var dy = plot.worldY - player.worldY;
      var distance = Math.hypot(dx, dy);
      if (distance < best) {
        best = distance;
        result = plot;
      }
    });
    return result && best <= INTERACTION_RADIUS ? result : null;
  }

  function interact() {
    if (isInventoryPanelOpen()) return;
    var plot = nearestPlot();
    if (!plot) {
      showToast("Walk a little closer to a garden bed.");
      return;
    }
    var state = getPlotState(plot, Date.now());
    if (state.name === "empty") {
      plot.plantedAt = Date.now();
      plot.cropId = selectedCropId;
      setPlayerAction("plant", actionDuration("ANIMSEQ-EDDY-PLANT-001", 1050));
      var plantedDefinition = ITEM_DEFINITIONS[plot.cropId];
      spawnProductionEffect("FX-SEED-001", plot.worldX, plot.worldY, "plant");
      showToast(plantedDefinition.name + " planted. Watch the soil wake up!");
      announce("A " + plantedDefinition.name.toLowerCase() + " seed was planted.");
      saveGame();
      return;
    }
    if (state.name === "ready") {
      var harvestedItemId = ITEM_DEFINITIONS[plot.cropId] ? plot.cropId : "carrot";
      var harvestedDefinition = ITEM_DEFINITIONS[harvestedItemId];
      if (!inventory.canAdd(harvestedItemId, 1)) {
        setPlayerAction("inventoryFull", actionDuration("ANIMSEQ-EDDY-FULL-001", 1250));
        showToast("Inventory full. Free a slot before harvesting.");
        announce("The " + harvestedDefinition.name.toLowerCase() + " remains safely planted because the inventory is full.");
        return;
      }
      var harvestResult = inventory.addItem(harvestedItemId, 1);
      if (harvestResult.remaining > 0) {
        showToast("Inventory full. The crop remains in the garden bed.");
        announce("Harvest paused because the inventory could not accept the crop.");
        return;
      }
      plot.plantedAt = null;
      plot.cropId = null;
      player.harvestingUntil = performance.now() + 720;
      setPlayerAction("harvestPickup", combinedActionDuration(["ANIMSEQ-EDDY-HARVEST-001", "ANIMSEQ-EDDY-PICKUP-001"], 1550));
      spawnProductionEffect("FX-HARVEST-001", plot.worldX, plot.worldY, "harvest");
      spawnProductionEffect("FX-ITEMFLY-001", plot.worldX, plot.worldY, "pickup");
      spawnFloatingLoot(plot, harvestedItemId, 1);
      showToast("Harvested! +1 " + harvestedDefinition.name.toLowerCase() + " added to inventory.");
      announce("Eddy harvested one " + harvestedDefinition.name.toLowerCase() + " and stored it in the inventory.");
      saveGame();
      return;
    }
    setPlayerAction("water", actionDuration("ANIMSEQ-EDDY-WATER-001", 1100));
    spawnProductionEffect("FX-WATER-001", plot.worldX, plot.worldY, "water");
    showToast("Eddy watered the growing " + ITEM_DEFINITIONS[plot.cropId || "carrot"].name.toLowerCase() + ".");
    announce("Eddy watered the growing crop.");
  }

  function inputVector() {
    if (isInventoryPanelOpen() || activePlayerAction()) return { x: 0, y: 0 };
    var x = 0;
    var y = 0;
    if (keys.ArrowLeft || keys.a || touchDirections.has("w") || touchDirections.has("nw") || touchDirections.has("sw")) x -= 1;
    if (keys.ArrowRight || keys.d || touchDirections.has("e") || touchDirections.has("ne") || touchDirections.has("se")) x += 1;
    if (keys.ArrowUp || keys.w || touchDirections.has("n") || touchDirections.has("nw") || touchDirections.has("ne")) y -= 1;
    if (keys.ArrowDown || keys.s || touchDirections.has("s") || touchDirections.has("sw") || touchDirections.has("se")) y += 1;
    if (x || y) {
      var length = Math.hypot(x, y);
      return { x: x / length, y: y / length };
    }
    if (clickTarget) {
      var start = worldToScreen(player.worldX, player.worldY);
      var end = worldToScreen(clickTarget.x, clickTarget.y);
      var dx = end.x - start.x;
      var dy = end.y - start.y;
      var distance = Math.hypot(dx, dy);
      if (distance < 5) {
        clickTarget = null;
        return { x: 0, y: 0 };
      }
      return { x: dx / distance, y: dy / distance };
    }
    return { x: 0, y: 0 };
  }

  function directionFromScreenVector(x, y, fallback) {
    if (Math.hypot(x, y) < 0.01) return fallback;
    var horizontal = x > 0.32 ? "e" : x < -0.32 ? "w" : "";
    var vertical = y > 0.32 ? "s" : y < -0.32 ? "n" : "";
    return vertical + horizontal || vertical || horizontal || fallback;
  }

  function blockedAt(worldX, worldY) {
    // The north and west fence lines sit at world coordinate 1. Keeping Eddy
    // on their inside edge prevents him from walking through the rails into
    // the decorative terrain beyond the playable farm.
    if (worldX < 1.18 || worldY < 1.18 || worldX > WORLD.width - 0.65 || worldY > WORLD.height - 0.65) return true;
    var blockedByPlot = plots.some(function (plot) {
      return Math.abs(worldX - plot.worldX) < plot.width / 2 + 0.17 && Math.abs(worldY - plot.worldY) < plot.height / 2 + 0.17;
    });
    if (blockedByPlot) return true;
    if (pointInsidePond(worldX, worldY, 0.3)) return true;
    if (pointInsideBarn(worldX, worldY, 0.22)) return true;
    if (trees.some(function (tree) {
      var radius = productionRuntime ? productionRuntime.footprintRadius(tree.assetId, 0.5) : 0.5;
      return Math.hypot(worldX - tree.worldX, worldY - tree.worldY) < radius * tree.size;
    })) return true;
    return decor.concat(hedges).some(function (item) {
      var radii = {
        bench: 0.48, birdhouse: 0.34, hayBale: 0.34, crate: 0.3,
        barrel: 0.3, sacks: 0.32, wheelbarrow: 0.46, bucket: 0.24,
        wateringCan: 0.24, stump: 0.28, tools: 0.3, hedge: 0.48,
        well: 0.5, seedRack: 0.5, flowerBed: 0.42, compost: 0.48,
        sign: 0.28, log: 0.42, rock: 0.28, planter: 0.34, lantern: 0.18,
        marketStand: 1.02
      };
      var radius = item.assetId && productionRuntime ? productionRuntime.footprintRadius(item.assetId, radii[item.type]) : radii[item.type];
      return radius && Math.hypot(worldX - item.worldX, worldY - item.worldY) < radius * (item.size || 1) + 0.18;
    });
  }

  function pointInsidePond(x, y, padding) {
    var px = (x - pond.worldX) / (pond.rx + padding); var py = (y - pond.worldY) / (pond.ry + padding);
    return px * px + py * py < 1;
  }

  function pointInsideBarn(x, y, padding) {
    // Only the barn's actual ground footprint blocks movement. The old broad
    // box reached far down the path and swallowed the barnyard props.
    var footprintRadius = productionRuntime ? productionRuntime.footprintRadius(barn.assetId, 1.75) : 1.75;
    var halfWidth = Math.max(1.75, footprintRadius);
    var depth = Math.max(0.35, footprintRadius * 0.28);
    return x > barn.worldX - halfWidth - padding && x < barn.worldX + halfWidth + padding && y > barn.worldY - depth - padding && y < barn.worldY + depth + padding;
  }

  function normalizeDirection(value, fallback) {
    var fallback = typeof value === "string" ? value.toLowerCase() : "";
    return DIRECTIONS.includes(fallback) ? fallback : (fallback || "se");
  }

  function movePlayerToNearestWalkablePoint() {
    if (!blockedAt(player.worldX, player.worldY)) return;
    var originX = player.worldX;
    var originY = player.worldY;
    for (var radius = 0.3; radius <= 5.1; radius += 0.3) {
      for (var step = 0; step < 24; step += 1) {
        var angle = step / 24 * Math.PI * 2;
        var fallbackX = clamp(originX + Math.cos(angle) * radius, 1.2, WORLD.width - 0.7);
        var fallbackY = clamp(originY + Math.sin(angle) * radius, 1.2, WORLD.height - 0.7);
        if (!blockedAt(fallbackX, fallbackY)) {
          player.worldX = fallbackX;
          player.worldY = fallbackY;
          return;
        }
      }
    }
    player.worldX = 6.65;
    player.worldY = 7.55;
  }

  function update(dt) {
    elapsedSeconds += dt;
    updateGameClock(dt);
    var vector = inputVector();
    var walking = Boolean(vector.x || vector.y);
    var oldScreen = worldToScreen(player.worldX, player.worldY);

    if (walking) {
      player.direction = directionFromScreenVector(vector.x, vector.y, player.direction);
      var screenDistance = player.screenSpeed * dt;
      var isoDX = vector.x * screenDistance / camera.zoom;
      var isoDY = vector.y * screenDistance / camera.zoom;
      var worldDX = isoDY / TILE.height + isoDX / TILE.width;
      var worldDY = isoDY / TILE.height - isoDX / TILE.width;
      var nextX = player.worldX + worldDX;
      var nextY = player.worldY + worldDY;
      var moved = false;

      if (!blockedAt(nextX, player.worldY)) {
        player.worldX = nextX;
        moved = true;
      }
      if (!blockedAt(player.worldX, nextY)) {
        player.worldY = nextY;
        moved = true;
      }
      if (!moved && clickTarget) clickTarget = null;
      player.walking = moved;
    } else {
      player.walking = false;
    }

    var newScreen = worldToScreen(player.worldX, player.worldY);
    var travelled = Math.hypot(newScreen.x - oldScreen.x, newScreen.y - oldScreen.y);
    if (travelled > 0.01) player.gaitPhase = (player.gaitPhase + travelled / 76) % 1;

    if (player.walking && performance.now() - lastSaveAt > 850) saveGame();
    updateInterface();
  }

  function updateInterface() {
    var now = Date.now();
    var ready = plots.filter(function (plot) { return getPlotState(plot, now).name === "ready"; }).length;
    var totalInventory = Object.keys(ITEM_DEFINITIONS).reduce(function (total, itemId) { return total + inventory.getQuantity(itemId); }, 0);
    var selectedDefinition = ITEM_DEFINITIONS[selectedCropId] || ITEM_DEFINITIONS.carrot;
    carrotCountElement.textContent = String(totalInventory);
    readyCountElement.textContent = String(ready);
    if (seedNameElement) seedNameElement.textContent = selectedDefinition.name;
    if (seedIconElement && seedIconElement.dataset.cropId !== selectedCropId) {
      seedIconElement.dataset.cropId = selectedCropId;
      setIconContent(seedIconElement, Object.assign({}, selectedDefinition, { iconUrl: selectedDefinition.seedIconUrl }), "seed-selector-hud");
    }
    if (inventoryIconElement && inventoryIconElement.dataset.productionIcon !== "UI-INVENTORY-BAG-001") {
      var bagIcon = productionRuntime && productionRuntime.select("UI-INVENTORY-BAG-001", { state: "base", layer: "ui" });
      if (bagIcon) {
        inventoryIconElement.dataset.productionIcon = "UI-INVENTORY-BAG-001";
        setIconContent(inventoryIconElement, { assetId: "UI-INVENTORY-BAG-001", iconUrl: bagIcon.url, icon: "🎒" }, "inventory-hud");
      }
    }
    var phaseInfo = DAY_PHASE_INFO[lightingState.phase];
    var formattedTime = formatGameTime(gameClock.minutes);
    var clockHudKey = gameClock.day + "|" + formattedTime + "|" + lightingState.phase + "|" + Boolean(clockPreview);
    if (clockHudKey !== lastClockHudKey) {
      if (gameTimeElement) gameTimeElement.textContent = formattedTime;
      if (dayPhaseElement) dayPhaseElement.textContent = phaseInfo.label;
      if (phaseIconElement) {
        var clockIcon = productionRuntime && productionRuntime.select("UI-CLOCK-001", { state: lightingState.phase, layer: "ui" });
        setIconContent(phaseIconElement, { assetId: "UI-CLOCK-001", iconUrl: clockIcon && clockIcon.url, icon: phaseInfo.icon }, "clock-hud");
      }
      if (clockPillElement) {
        clockPillElement.setAttribute(
          "aria-label",
          "Day " + gameClock.day + ", " + phaseInfo.label + ", " + formattedTime + (clockPreview ? ", lighting preview" : "")
        );
      }
      lastClockHudKey = clockHudKey;
    }
    var plot = nearestPlot();
    if (!plot) {
      actionButton.disabled = true;
      actionButton.textContent = "Walk near a garden bed";
      return;
    }
    var state = getPlotState(plot, now);
    if (state.name === "empty") {
      actionButton.disabled = false;
      actionButton.textContent = "Plant one " + selectedDefinition.name.toLowerCase() + " seed";
    } else if (state.name === "ready") {
      var plotDefinition = ITEM_DEFINITIONS[plot.cropId] || ITEM_DEFINITIONS.carrot;
      actionButton.disabled = !inventory.canAdd(plotDefinition.id, 1);
      actionButton.textContent = actionButton.disabled ? "Inventory full" : "Harvest the " + plotDefinition.name.toLowerCase();
    } else {
      actionButton.disabled = true;
      actionButton.textContent = (ITEM_DEFINITIONS[plot.cropId] || ITEM_DEFINITIONS.carrot).name + " growing";
    }
  }

  function createInventorySlotElement(slot, index) {
    var element = document.createElement("div");
    element.className = "inventory-slot" + (slot ? " filled" : "");
    element.setAttribute("role", "listitem");
    element.setAttribute("aria-label", slot
      ? "Slot " + (index + 1) + ": " + ITEM_DEFINITIONS[slot.itemId].name + ", quantity " + slot.quantity
      : "Slot " + (index + 1) + ": empty");
    element.title = slot
      ? ITEM_DEFINITIONS[slot.itemId].name + " × " + slot.quantity
      : "Empty inventory slot";

    if (slot) {
      var definition = ITEM_DEFINITIONS[slot.itemId];
      var icon = document.createElement("span");
      icon.className = "item-icon";
      icon.setAttribute("aria-hidden", "true");
      setIconContent(icon, definition, "inventory-slot-hud");

      var quantity = document.createElement("span");
      quantity.className = "item-quantity";
      quantity.textContent = String(slot.quantity);

      element.appendChild(icon);
      element.appendChild(quantity);
    }
    setProductionBackground(element, "UI-INVENTORY-SLOT-001", { state: slot ? "filled" : "empty", layer: "ui" }, "inventory-slot-hud");
    return element;
  }

  function renderInventory() {
    if (!inventoryHotbar || !inventoryGrid) return;
    inventoryHotbar.textContent = "";
    inventoryGrid.textContent = "";

    inventory.slots.forEach(function (slot, index) {
      inventoryHotbar.appendChild(createInventorySlotElement(slot, index));
      inventoryGrid.appendChild(createInventorySlotElement(slot, index));
    });

    if (inventoryCapacity) {
      var usedSlots = inventory.slots.filter(Boolean).length;
      inventoryCapacity.textContent = usedSlots + " of " + inventory.slotCount
        + " slots used · each stack holds up to " + Math.max.apply(null, Object.keys(ITEM_DEFINITIONS).map(function (itemId) { return ITEM_DEFINITIONS[itemId].stackLimit; }));
    }
  }

  function isInventoryPanelOpen() {
    return Boolean(inventoryPanel && !inventoryPanel.hidden);
  }

  function clearGameplayInput() {
    Object.keys(keys).forEach(function (key) { keys[key] = false; });
    touchDirections.clear();
    clickTarget = null;
    player.walking = false;
    document.querySelectorAll("[data-dir].active").forEach(function (button) {
      button.classList.remove("active");
    });
  }

  function setInventoryPanel(open) {
    if (!inventoryPanel || !inventoryToggle) return;
    if (open) {
      clearGameplayInput();
    }
    inventoryPanel.hidden = !open;
    inventoryToggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open && inventoryClose) inventoryClose.focus({ preventScroll: true });
    if (!open) inventoryToggle.focus({ preventScroll: true });
  }

  function beginFrame() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, VIEW.width, VIEW.height);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
  }

  function hash2(x, y) {
    var value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return value - Math.floor(value);
  }

  function pathWorldPolygon(points) {
    ctx.beginPath();
    points.forEach(function (point, index) {
      var screen = worldToScreen(point.x, point.y);
      if (index === 0) ctx.moveTo(screen.x, screen.y);
      else ctx.lineTo(screen.x, screen.y);
    });
    ctx.closePath();
  }

  function worldEllipse(worldX, worldY, rx, ry, wobble, steps) {
    ctx.beginPath();
    for (var i = 0; i < steps; i += 1) {
      var angle = i / steps * Math.PI * 2;
      var noise = 1 + Math.sin(i * 4.73 + wobble * 9) * 0.045 + Math.sin(i * 2.17 + wobble) * 0.025;
      var p = worldToScreen(worldX + Math.cos(angle) * rx * noise, worldY + Math.sin(angle) * ry * noise);
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
  }

  function drawProductionTerrainAt(assetId, worldX, worldY, displayWidth, criteria) {
    if (!productionRuntime || !productionRuntime.entry(assetId)) return false;
    var point = worldToScreen(worldX, worldY);
    criteria = Object.assign({ state: "base", layer: "diffuse" }, criteria || {}, {
      x: point.x,
      y: point.y,
      displayWidth: displayWidth,
      surface: "terrain-world"
    });
    productionRuntime.registerReachable([assetId], "terrain-world");
    return productionRuntime.draw(ctx, assetId, criteria);
  }

  function drawProductionTerrainBase() {
    if (!productionRuntime) return false;
    var any = false;
    for (var y = 0; y < WORLD.height; y += 1) {
      for (var x = 0; x < WORLD.width; x += 1) {
        var worn = hash2(x + 13, y + 29) > 0.84;
        any = drawProductionTerrainAt(
          worn ? "TERR-GRASS-002" : "TERR-GRASS-001",
          x + 0.5,
          y + 0.5,
          TILE.width * camera.zoom * 1.015,
          { view: "iso_ground", variant: "v" + String(1 + Math.floor(hash2(x, y) * 8)).padStart(3, "0"), index: (x * 17 + y * 7) % 8 }
        ) || any;
      }
    }
    // Verge/continuation kits are real edge consumers around the playfield.
    for (var edge = 1; edge < WORLD.width; edge += 3) {
      any = drawProductionTerrainAt("TERR-GRASS-003", edge + 0.5, 0.7, TILE.width * camera.zoom, { index: edge }) || any;
      any = drawProductionTerrainAt("TERR-GRASS-004", edge + 0.5, WORLD.height - 0.35, TILE.width * camera.zoom, { index: edge }) || any;
    }
    return any;
  }

  function drawGround() {
    ctx.fillStyle = "#75b65b";
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    pathWorldPolygon([{ x: -7, y: -7 }, { x: 27, y: -7 }, { x: 27, y: 23 }, { x: -7, y: 23 }]);
    var grassGradient = ctx.createLinearGradient(0, 30, VIEW.width, VIEW.height);
    grassGradient.addColorStop(0, "#82c367");
    grassGradient.addColorStop(0.48, "#75b85c");
    grassGradient.addColorStop(1, "#69aa53");
    ctx.fillStyle = grassGradient;
    ctx.fill();
    var tones = ["#d3d47a", "#4f994c", "#9dcc69", "#3d8f45"];
    groundArt.patches.forEach(function (patch) {
      var p = worldToScreen(patch.x, patch.y);
      ctx.save(); ctx.globalAlpha = patch.alpha; ctx.fillStyle = tones[patch.tone];
      ctx.beginPath(); ctx.ellipse(p.x, p.y, patch.rx * 54 * camera.zoom, patch.ry * 25 * camera.zoom, (patch.x - patch.y) * 0.035, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    });
    drawProductionTerrainBase();
    drawPaths();
  }

  function drawPaths() {
    var ribbons = [
      [{ x: 5.35, y: -1 }, { x: 6.75, y: -1 }, { x: 6.62, y: 17.2 }, { x: 5.42, y: 17.2 }],
      [{ x: 4.35, y: 8.25 }, { x: 20.8, y: 8.35 }, { x: 20.8, y: 9.65 }, { x: 4.35, y: 9.62 }],
      [{ x: 16.7, y: 1.4 }, { x: 17.75, y: 1.55 }, { x: 17.7, y: 8.8 }, { x: 16.75, y: 8.75 }]
    ];
    ribbons.forEach(function (points) { pathWorldPolygon(points); ctx.fillStyle = "rgba(103,73,42,.23)"; ctx.fill(); });
    var inner = [
      [{ x: 5.55, y: -1 }, { x: 6.54, y: -1 }, { x: 6.46, y: 17.2 }, { x: 5.62, y: 17.2 }],
      [{ x: 4.45, y: 8.48 }, { x: 20.8, y: 8.52 }, { x: 20.8, y: 9.43 }, { x: 4.45, y: 9.4 }],
      [{ x: 16.93, y: 1.45 }, { x: 17.51, y: 1.55 }, { x: 17.5, y: 8.75 }, { x: 16.96, y: 8.72 }]
    ];
    inner.forEach(function (points, i) {
      pathWorldPolygon(points);
      var gradient = ctx.createLinearGradient(0, 100, VIEW.width, VIEW.height);
      gradient.addColorStop(0, i === 2 ? "#c8995f" : "#caa06b"); gradient.addColorStop(1, "#b88350");
      ctx.fillStyle = gradient; ctx.fill();
      ctx.strokeStyle = "rgba(91,64,39,.12)"; ctx.lineWidth = 1.2 * camera.zoom; ctx.stroke();
    });
    pathStones.forEach(function (stone) {
      var p = worldToScreen(stone.x, stone.y); var z = camera.zoom * stone.size;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, 3.5 * z, 1.8 * z, stone.x, 0, Math.PI * 2);
      ctx.fillStyle = stone.dark ? "rgba(99,78,56,.38)" : "rgba(224,191,139,.45)"; ctx.fill();
    });
    for (var i = 0; i < 18; i += 1) {
      var intrude = worldToScreen(5.49 + (i % 3) * 0.08, 1.35 + i * 0.77);
      ctx.strokeStyle = "rgba(50,119,47,.5)"; ctx.lineWidth = 1.2 * camera.zoom;
      ctx.beginPath(); ctx.moveTo(intrude.x, intrude.y); ctx.lineTo(intrude.x - 5 * camera.zoom, intrude.y - 7 * camera.zoom); ctx.stroke();
    }
    for (var pathY = 0; pathY < WORLD.height; pathY += 1) {
      drawProductionTerrainAt("TERR-PATH-001", 6.05, pathY + 0.5, TILE.width * camera.zoom, { index: pathY, state: "base" });
      if (pathY < 8) drawProductionTerrainAt("TERR-PATH-002", 17.2, pathY + 0.5, TILE.width * camera.zoom, { index: pathY + 3, state: "base" });
    }
    for (var pathX = 5; pathX < WORLD.width; pathX += 1) {
      drawProductionTerrainAt("TERR-PATH-002", pathX + 0.5, 9.0, TILE.width * camera.zoom, { index: pathX, state: "base" });
    }
  }

  function pointInsideAnyPlot(x, y) {
    return plots.some(function (plot) { return Math.abs(x - plot.worldX) < plot.width / 2 + 0.2 && Math.abs(y - plot.worldY) < plot.height / 2 + 0.2; });
  }

  function drawGroundDecals() {
    var decalAssets = ["TERR-DECAL-001", "TERR-DECAL-002", "TERR-DECAL-003", "TERR-DECAL-004", "TERR-DECAL-005"];
    groundArt.decals.forEach(function (item, itemIndex) {
      var p = worldToScreen(item.x, item.y); var z = camera.zoom * item.size;
      var decalIndex = item.type.indexOf("flower") === 0 ? 0 : item.type === "clover" || item.type === "blade" ? 1 : item.type === "pebble" ? 2 : 3 + itemIndex % 2;
      if (drawProductionTerrainAt(decalAssets[decalIndex], item.x, item.y, TILE.width * camera.zoom * 0.46 * item.size, { index: itemIndex, state: "base" })) return;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(item.turn * 0.12);
      if (item.type === "blade") {
        ctx.strokeStyle = "rgba(42,112,45,.5)"; ctx.lineWidth = 1.2 * z;
        [-1, 1].forEach(function (n) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(n * 2 * z, -4 * z, n * 4 * z, -8 * z); ctx.stroke(); });
      } else if (item.type === "clover") {
        ctx.fillStyle = "rgba(42,124,54,.62)";
        [[-2,-2],[2,-2],[0,-5]].forEach(function (q) { ctx.beginPath(); ctx.arc(q[0] * z, q[1] * z, 2.2 * z, 0, Math.PI * 2); ctx.fill(); });
      } else if (item.type.indexOf("flower") === 0) {
        ctx.fillStyle = item.type === "flowerWhite" ? "rgba(255,250,220,.9)" : "rgba(246,207,69,.92)";
        for (var j = 0; j < 4; j += 1) { var a = j * Math.PI / 2; ctx.beginPath(); ctx.arc(Math.cos(a) * 2.2 * z, -3 * z + Math.sin(a) * 2.2 * z, 1.8 * z, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = "#d39b32"; ctx.beginPath(); ctx.arc(0, -3 * z, 1.2 * z, 0, Math.PI * 2); ctx.fill();
      } else if (item.type === "pebble") {
        ctx.fillStyle = "rgba(104,105,77,.34)"; ctx.beginPath(); ctx.ellipse(0, 0, 4 * z, 2 * z, item.turn, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = "rgba(132,99,59,.16)"; ctx.beginPath(); ctx.ellipse(0, 0, 6 * z, 2.5 * z, item.turn, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    });
    drawProductionTerrainAt("TERR-WATER-003", 12.8, 12.7, TILE.width * camera.zoom * 1.4, { state: "base", index: 2 });
  }

  function drawPond() {
    worldEllipse(pond.worldX, pond.worldY, pond.rx + 0.22, pond.ry + 0.2, 0.6, 42);
    ctx.fillStyle = "#866842"; ctx.fill();
    ctx.strokeStyle = "#668e49"; ctx.lineWidth = 9 * camera.zoom; ctx.stroke();
    worldEllipse(pond.worldX, pond.worldY, pond.rx, pond.ry, 1.2, 42);
    var c = worldToScreen(pond.worldX, pond.worldY);
    var water = ctx.createLinearGradient(c.x - 80 * camera.zoom, c.y - 30 * camera.zoom, c.x + 90 * camera.zoom, c.y + 35 * camera.zoom);
    water.addColorStop(0, "#8ed6d3"); water.addColorStop(0.55, "#57aebf"); water.addColorStop(1, "#3d8eaa");
    ctx.fillStyle = water; ctx.fill(); ctx.strokeStyle = "rgba(38,103,126,.58)"; ctx.lineWidth = 2 * camera.zoom; ctx.stroke();
    drawProductionTerrainAt("TERR-WATER-001", pond.worldX, pond.worldY, pond.rx * 2 * TILE.width * camera.zoom, { state: "base", index: 0 });
    [[-1.55,-.5,10],[-1.2,.9,7],[1.5,.5,9],[.95,-.95,6]].forEach(function (r, i) {
      var rp = worldToScreen(pond.worldX + r[0], pond.worldY + r[1]); ctx.beginPath(); ctx.ellipse(rp.x, rp.y, r[2] * camera.zoom, r[2] * .48 * camera.zoom, i, 0, Math.PI * 2); ctx.fillStyle = i % 2 ? "#777b66" : "#92937a"; ctx.fill();
    });
    [[-.7,.2],[.55,.45],[.9,-.3]].forEach(function (l, i) {
      var lp = worldToScreen(pond.worldX + l[0], pond.worldY + l[1]); ctx.beginPath(); ctx.ellipse(lp.x, lp.y, 10 * camera.zoom, 4 * camera.zoom, -.18, .25, Math.PI * 2); ctx.fillStyle = i === 1 ? "#4f9c54" : "#5aa65d"; ctx.fill();
      if (i === 1) { ctx.fillStyle = "#f5d5df"; ctx.beginPath(); ctx.arc(lp.x, lp.y - 3 * camera.zoom, 3 * camera.zoom, 0, Math.PI * 2); ctx.fill(); }
    });
    [-1.62, 1.43].forEach(function (dx, i) {
      var rp = worldToScreen(pond.worldX + dx, pond.worldY + (i ? .32 : -.15));
      ctx.strokeStyle = "#426f3a"; ctx.lineWidth = 2 * camera.zoom;
      [-5,2,8].forEach(function (off, j) { ctx.beginPath(); ctx.moveTo(rp.x + off * camera.zoom, rp.y); ctx.lineTo(rp.x + (off + j - 1) * camera.zoom, rp.y - (18 + j * 5) * camera.zoom); ctx.stroke(); });
      ctx.fillStyle = "#77502d"; ctx.fillRect(rp.x + 1 * camera.zoom, rp.y - 29 * camera.zoom, 4 * camera.zoom, 9 * camera.zoom);
    });
    drawProductionTerrainAt("TERR-WATER-002", pond.worldX - 1.42, pond.worldY - 0.12, TILE.width * camera.zoom * 0.9, { state: "base", index: 1 });
    drawProductionTerrainAt("TERR-WATER-002", pond.worldX + 1.28, pond.worldY + 0.3, TILE.width * camera.zoom * 0.9, { state: "base", index: 4 });
  }

  function drawPondRipples() {
    var c = worldToScreen(pond.worldX, pond.worldY); var z = camera.zoom;
    if (productionRuntime) {
      productionRuntime.registerReachable(["FX-RIPPLE-001", "ANIMSEQ-POND-001"], "pond-world");
      productionRuntime.draw(ctx, "ANIMSEQ-POND-001", {
        x: c.x, y: c.y, displayWidth: pond.rx * 2 * TILE.width * z,
        animated: true, elapsedMs: performance.now(), state: "loop", surface: "pond-world"
      });
    }
    var usedProduction = false;
    for (var rippleIndex = 0; rippleIndex < 3; rippleIndex += 1) {
      if (productionRuntime && productionRuntime.draw(ctx, "FX-RIPPLE-001", {
        x: c.x + (rippleIndex - 1) * 34 * z,
        y: c.y + (rippleIndex % 2) * 9 * z,
        displayWidth: 76 * z,
        animated: true,
        elapsedMs: performance.now() + rippleIndex * 170,
        state: "loop",
        surface: "gameplay-effect"
      })) {
        usedProduction = true;
      }
    }
    if (usedProduction) return;
    for (var i = 0; i < 3; i += 1) {
      var phase = (elapsedSeconds * .16 + i * .31) % 1;
      ctx.save(); ctx.globalAlpha = (1 - phase) * .28; ctx.strokeStyle = "#e9ffff"; ctx.lineWidth = 1.4 * z;
      ctx.beginPath(); ctx.ellipse(c.x + (i - 1) * 34 * z, c.y + (i % 2) * 9 * z, (12 + phase * 25) * z, (3 + phase * 5) * z, -.18, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
  }

  function drawBeds() {
    plots.forEach(function (plot, index) {
      var hw = plot.width / 2, hh = plot.height / 2;
      pathWorldPolygon([{x:plot.worldX-hw-.09,y:plot.worldY-hh-.09},{x:plot.worldX+hw+.09,y:plot.worldY-hh-.09},{x:plot.worldX+hw+.09,y:plot.worldY+hh+.12},{x:plot.worldX-hw-.09,y:plot.worldY+hh+.12}]);
      ctx.fillStyle = "#65402a"; ctx.fill(); ctx.strokeStyle = "#4d3023"; ctx.lineWidth = 3.2 * camera.zoom; ctx.stroke();
      pathWorldPolygon([{x:plot.worldX-hw+.08,y:plot.worldY-hh+.07},{x:plot.worldX+hw-.07,y:plot.worldY-hh+.08},{x:plot.worldX+hw-.08,y:plot.worldY+hh-.07},{x:plot.worldX-hw+.07,y:plot.worldY+hh-.08}]);
      var soil = ctx.createLinearGradient(0, 0, VIEW.width, VIEW.height); soil.addColorStop(0, index % 2 ? "#aa6a3d" : "#a36338"); soil.addColorStop(1, "#7d482d"); ctx.fillStyle = soil; ctx.fill();
      var soilAssetId = ["TERR-SOIL-001", "TERR-SOIL-002", "TERR-SOIL-003", "TERR-SOIL-004", "TERR-SOIL-005"][index % 5];
      drawProductionTerrainAt(soilAssetId, plot.worldX, plot.worldY, plot.width * TILE.width * camera.zoom, { state: "base", index: index });
      [-.72,-.36,0,.36,.72].forEach(function (row) {
        var a=worldToScreen(plot.worldX-.8,plot.worldY+row), b=worldToScreen(plot.worldX+.8,plot.worldY+row);
        ctx.strokeStyle="rgba(72,38,25,.48)"; ctx.lineWidth=2.4*camera.zoom; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        ctx.strokeStyle="rgba(229,154,91,.22)"; ctx.lineWidth=.9*camera.zoom; ctx.beginPath(); ctx.moveTo(a.x,a.y-2*camera.zoom); ctx.lineTo(b.x,b.y-2*camera.zoom); ctx.stroke();
      });
      soilArt[index].forEach(function(bit){ var p=worldToScreen(plot.worldX+bit.x,plot.worldY+bit.y); ctx.beginPath(); ctx.ellipse(p.x,p.y,3.2*bit.size*camera.zoom,1.45*bit.size*camera.zoom,bit.tone*3,0,Math.PI*2); ctx.fillStyle=bit.tone>.65?"rgba(62,37,26,.34)":"rgba(218,143,79,.22)";ctx.fill(); });
      drawProductionTerrainAt("TERR-BED-001", plot.worldX, plot.worldY, plot.width * TILE.width * camera.zoom, { state: "clean", index: index, variant: index % 2 ? "axis_ne" : "axis_nw" });
    });
  }

  function drawFenceRail(entity) {
    if (drawProductionWorldAsset(entity.assetId || "STRUCT-FENCE-WOOD-001", entity, { state: "straight", variant: entity.startX === entity.endX ? "axis_nw" : "axis_ne", surface: "world-structure" })) return;
    ctx.save(); ctx.strokeStyle="#86532f"; ctx.lineWidth=7*camera.zoom;
    var a=worldToScreen(entity.startX,entity.startY),b=worldToScreen(entity.endX,entity.endY);
    [-29,-15].forEach(function(h){ctx.beginPath();ctx.moveTo(a.x,a.y+h*camera.zoom);ctx.lineTo(b.x,b.y+h*camera.zoom);ctx.stroke();ctx.strokeStyle="#a86b3b";ctx.lineWidth=1.5*camera.zoom;ctx.beginPath();ctx.moveTo(a.x,a.y+(h-2)*camera.zoom);ctx.lineTo(b.x,b.y+(h-2)*camera.zoom);ctx.stroke();ctx.strokeStyle="#86532f";ctx.lineWidth=7*camera.zoom;});ctx.restore();
  }

  function fencePosts(){var posts=[];for(var x=1;x<=19;x+=2)posts.push({id:"fence-x-"+x,type:"fence",assetId:x%6===1?"STRUCT-FENCE-WHITE-001":"STRUCT-FENCE-WOOD-001",worldX:x,worldY:1,depthOffset:-.2,shadow:{rx:7,ry:2,alpha:.09}});for(var y=3;y<=15;y+=2)posts.push({id:"fence-y-"+y,type:"fence",assetId:y%6===3?"STRUCT-FENCE-DARK-001":"STRUCT-FENCE-WOOD-001",worldX:1,worldY:y,depthOffset:-.2,shadow:{rx:7,ry:2,alpha:.09}});return posts;}

  function fenceRails(){var rails=[];for(var x=1;x<19;x+=2)rails.push({id:"fence-rail-x-"+x,type:"fenceRail",assetId:x%6===1?"STRUCT-FENCE-WHITE-001":"STRUCT-FENCE-WOOD-001",worldX:x+1,worldY:1,startX:x,startY:1,endX:x+2,endY:1,size:1.5,depthOffset:-.19});for(var y=1;y<15;y+=2)rails.push({id:"fence-rail-y-"+y,type:"fenceRail",assetId:y%6===1?"STRUCT-FENCE-DARK-001":"STRUCT-FENCE-WOOD-001",worldX:1,worldY:y+1,startX:1,startY:y,endX:1,endY:y+2,size:1.5,depthOffset:-.19});return rails;}

  function collectEntities(now) {
    var entities=[];
    // The barn shares the same ground-anchor depth sorter as every other
    // world object. Its artwork reaches upward, but the footprint ends about
    // 0.57 world units south of the drawing origin.
    entities.push({
      id: barn.id,
      type: "barn",
      assetId: barn.assetId,
      worldX: barn.worldX,
      worldY: barn.worldY,
      depthOffset: 0.57,
      size: barn.size,
      shadow: { rx: 132, ry: 19, alpha: 0.2, cast: 1.22 }
    });
    trees.forEach(function(tree){entities.push({id:tree.id,type:"tree",assetId:tree.assetId,worldX:tree.worldX,worldY:tree.worldY,depthOffset:.1,data:tree,shadow:{rx:35*tree.size,ry:10*tree.size,alpha:.18,cast:1.45}});});
    decor.concat(hedges).forEach(function(item){
      var e=Object.assign({},item),size=item.size||1;
      e.shadow=item.type==="weathervane"
        ?null
        :item.type==="marketStand"
          ?{rx:68*size,ry:14*size,alpha:.2,cast:1.24}
          :{rx:16*size,ry:5*size,alpha:.12};
      entities.push(e);
    });
    fenceRails().forEach(function(item){entities.push(item);});
    fencePosts().forEach(function(item){entities.push(item);});
    plots.forEach(function(plot){var state=getPlotState(plot,now);if(state.name!=="empty")plot.plants.forEach(function(plant,i){entities.push({id:"crop-"+plot.id+"-"+i,type:"crop",worldX:plot.worldX+plant.x,worldY:plot.worldY+plant.y,depthOffset:.04,data:{plot:plot,state:state,plant:plant,index:i},shadow:{rx:4.5,ry:1.3,alpha:.065}});});});
    animals.forEach(function(animal){
      var t=elapsedSeconds+animal.phase;var e=Object.assign({},animal);
      if(animal.type==="butterfly"){
        // Butterflies fade out through dusk instead of vanishing on a single
        // frame; fireflies then become the dominant ambient motion at night.
        e.ambientAlpha=clamp(1-smoothstep((lightingState.night-.08)/.52),0,1);
        if(e.ambientAlpha<=.01)return;
      }
      if(animal.type==="chicken"){e.worldX+=Math.sin(t*.42)*.22;e.worldY+=Math.cos(t*.33)*.16;e.shadow={rx:10,ry:3,alpha:.12};}else if(animal.type==="duck"){e.worldX+=Math.sin(t*.25)*.13;e.worldY+=Math.cos(t*.23)*.08;e.shadow={rx:12,ry:3,alpha:.1};}else{e.worldX+=Math.sin(t*.52)*.22;e.worldY+=Math.cos(t*.46)*.15;}entities.push(e);
    });
    entities.push({id:"eddy",type:"eddy",worldX:player.worldX,worldY:player.worldY,depthOffset:.08,shadow:{rx:28,ry:7,alpha:.22,cast:1.2}});
    return entities;
  }

  function drawContactShadow(entity){
    if(!entity.shadow)return;
    var p=worldToScreen(entity.worldX,entity.worldY),z=camera.zoom,baseRx=entity.shadow.rx,rx=baseRx*z,ry=entity.shadow.ry*z;
    var castAlpha=entity.shadow.alpha*.42*lightingState.shadowStrength;
    var contactAlpha=entity.shadow.alpha*(.82+.18*lightingState.shadowStrength);
    if(productionRuntime){
      var productionFootprint=baseRx<13?"contact_small":baseRx<42?"contact_medium":"contact_large";
      var productionCast=lightingState.shadowLength>1.28?"cast_long":lightingState.shadowLength>1.03?"cast_medium":"cast_soft";
      var productionCastDrawn=productionRuntime.draw(ctx,"SHADOW-001",{x:p.x+lightingState.shadowX*z,y:p.y+lightingState.shadowY*z,displayWidth:2*rx*(entity.shadow.cast||1.18)*lightingState.shadowLength,state:productionCast,component:"cast",alpha:Math.min(1,castAlpha*2.1),composite:"multiply",surface:"world-shadow"});
      var productionContactDrawn=productionRuntime.draw(ctx,"SHADOW-001",{x:p.x,y:p.y,displayWidth:1.4*rx,state:productionFootprint,component:"contact",alpha:Math.min(1,contactAlpha*1.35),composite:"multiply",surface:"world-shadow"});
      if(productionCastDrawn&&productionContactDrawn)return;
    }
    ctx.save();
    ctx.fillStyle="rgba(31,48,24,"+castAlpha+")";
    ctx.beginPath();
    ctx.ellipse(
      p.x+lightingState.shadowX*z,
      p.y+lightingState.shadowY*z,
      rx*(entity.shadow.cast||1.18)*lightingState.shadowLength,
      ry*(1.13+.2*lightingState.shadowLength),
      .08,0,Math.PI*2
    );
    ctx.fill();
    ctx.fillStyle="rgba(28,39,22,"+contactAlpha+")";
    ctx.beginPath();ctx.ellipse(p.x,p.y,rx*.7,ry*.72,.05,0,Math.PI*2);ctx.fill();ctx.restore();
  }

  var entityRenderers = {
    tree: function(e){
      var tree=e.data,key=tree.kind==="apple"?"treeApple":tree.kind==="leaf"?"treeShade":null;
      // Never substitute a lemon for pear or orange for autumn. If the exact
      // production identity is unavailable while loading, use the procedural
      // same-species fallback below.
      if(!key||!drawFallbackStatic(key,tree,.28*camera.zoom*tree.size))drawTree(tree);
    },
    crop: function(e,now){drawCropPlant(e.data,now);}, eddy: function(){drawEddy();}, fence: drawFencePost, fenceRail: drawFenceRail,
    barn: function(e){if(!drawFallbackStatic("barn",e,.34*camera.zoom*(e.size||1)))drawBarn(e);},
    bench: function(e){if(!drawFallbackStatic("bench",e,.15*camera.zoom*(e.size||1)))drawBench(e);},
    birdhouse: function(e){if(!drawFallbackStatic("birdhouse",e,.16*camera.zoom*(e.size||1)))drawBirdhouse(e);},
    basket: function(e){if(!drawFallbackStatic("basket",e,.13*camera.zoom*(e.size||1)))drawBasket(e);},
    sign: function(e){var key=e.id==="orchard-sign"?"signOrchard":"signBarn";if(!drawFallbackStatic(key,e,.14*camera.zoom*(e.size||1)))drawSign(e);},
    hayBale: function(e){if(!drawFallbackStatic("hayBale",e,.14*camera.zoom*(e.size||1)))drawHayBale(e);},
    crate: function(e){if(!drawFallbackStatic("crate",e,.13*camera.zoom*(e.size||1)))drawCrate(e);},
    barrel: function(e){if(!drawFallbackStatic("barrel",e,.13*camera.zoom*(e.size||1)))drawBarrel(e);},
    sacks: drawSacks,
    wheelbarrow: function(e){if(!drawFallbackStatic("wheelbarrow",e,.17*camera.zoom*(e.size||1)))drawWheelbarrow(e);},
    bucket: function(e){if(!drawFallbackStatic("bucket",e,.105*camera.zoom*(e.size||1)))drawBucket(e);},
    wateringCan: function(e){if(!drawFallbackStatic("wateringCan",e,.115*camera.zoom*(e.size||1)))drawWateringCan(e);},
    stump: drawStump,
    rock: function(e){if(!drawFallbackStatic("rock",e,.12*camera.zoom*(e.size||1)))drawRock(e);},
    tools: function(e){if(!drawFallbackStatic("tools",e,.15*camera.zoom*(e.size||1)))drawTools(e);},
    flowers: drawFlowers,
    well: function(e){if(!drawFallbackStatic("well",e,.27*camera.zoom*(e.size||1)))drawWell(e);},
    seedRack: drawSeedRack, flowerBed: drawFlowerBed, compost: drawCompost,
    log: function(e){if(!drawFallbackStatic("log",e,.15*camera.zoom*(e.size||1)))drawStump(e);},
    planter: function(e){if(!drawFallbackStatic("planter",e,.14*camera.zoom*(e.size||1)))drawFlowerBed(e);},
    lantern: function(e){if(!drawFallbackStatic("lantern",e,.13*camera.zoom*(e.size||1)))drawLantern(e);},
    weathervane: function(e){if(!drawFallbackStatic("weathervane",e,.12*camera.zoom*(e.size||1)))drawWeathervane(e);},
    marketStand: function(e){if(!drawFallbackStatic("marketStand",e,.29*camera.zoom*(e.size||1)))drawMarketStand(e);},
    hedge: function(e){if(!drawFallbackStatic("hedge",e,.18*camera.zoom*(e.size||1)))drawHedge(e);},
    chicken: drawChicken, duck: drawDuck, butterfly: drawButterfly, productionAnimal: drawProductionAnimal,
    productionStatic: function(e){
      if(e.animationAssetId&&drawProductionWorldAsset(e.animationAssetId,e,{animated:true,elapsedMs:performance.now(),state:"idle",surface:"world-animation"}))return;
      drawProductionWorldAsset(e.assetId,e,{state:"base",surface:GAMEPLAY_SURFACE_BY_CATEGORY[productionRuntime&&productionRuntime.category(e.assetId)]||"world-static"});
    }
  };
  function drawEntity(entity,now){
    var animalType=entity.type==="chicken"||entity.type==="duck"||entity.type==="butterfly"||entity.type==="productionAnimal";
    var specialised=animalType||entity.type==="crop"||entity.type==="eddy"||entity.type==="fence"||entity.type==="fenceRail"||entity.type==="productionStatic";
    if(entity.assetId&&!specialised){
      var category=productionRuntime&&productionRuntime.category(entity.assetId);
      var state=category==="Buildings"?(lightingState.night>.45?"closed_night":"closed_day"):entity.type==="tree"?"mature":"base";
      if(drawProductionWorldAsset(entity.assetId,entity,{state:state,variant:entity.variant||"",surface:GAMEPLAY_SURFACE_BY_CATEGORY[category]||"world-static"}))return;
    }
    var renderer=entityRenderers[entity.type];if(renderer)renderer(entity,now);
  }

  function drawBarn(entity) {
    var p=worldToScreen(entity.worldX,entity.worldY),z=camera.zoom;
    function polygon(points){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(var i=1;i<points.length;i+=1)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();}
    var front=[[-142,-151],[-67,-222],[0,-191],[0,-15],[-142,25]];
    var side=[[0,-191],[139,-149],[139,25],[0,-15]];
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(z,z);
    polygon(side);var sideWall=ctx.createLinearGradient(0,-170,142,5);sideWall.addColorStop(0,"#a73f35");sideWall.addColorStop(1,"#7f2f2b");ctx.fillStyle=sideWall;ctx.fill();
    ctx.save();polygon(side);ctx.clip();ctx.strokeStyle="rgba(91,31,29,.42)";ctx.lineWidth=1.2;for(var sx=10;sx<145;sx+=13){ctx.beginPath();ctx.moveTo(sx,-205);ctx.lineTo(sx,35);ctx.stroke();}ctx.restore();
    polygon(front);var frontWall=ctx.createLinearGradient(-142,-160,0,10);frontWall.addColorStop(0,"#d15943");frontWall.addColorStop(1,"#a33c32");ctx.fillStyle=frontWall;ctx.fill();
    ctx.save();polygon(front);ctx.clip();ctx.strokeStyle="rgba(102,37,30,.32)";ctx.lineWidth=1.25;for(var fx=-134;fx<4;fx+=13){ctx.beginPath();ctx.moveTo(fx,-240);ctx.lineTo(fx,35);ctx.stroke();}ctx.restore();
    polygon([[-73,-240],[34,-211],[160,-143],[0,-183]]);var roof=ctx.createLinearGradient(-30,-245,130,-145);roof.addColorStop(0,"#5a2d2b");roof.addColorStop(.52,"#422425");roof.addColorStop(1,"#301d20");ctx.fillStyle=roof;ctx.fill();
    ctx.save();polygon([[-73,-240],[34,-211],[160,-143],[0,-183]]);ctx.clip();ctx.strokeStyle="rgba(232,148,118,.18)";ctx.lineWidth=1.3;for(var r=-50;r<170;r+=13){ctx.beginPath();ctx.moveTo(r,-253);ctx.lineTo(r+52,-123);ctx.stroke();}ctx.restore();
    ctx.strokeStyle="#f2ddbd";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-150,-149);ctx.lineTo(-67,-229);ctx.lineTo(4,-195);ctx.stroke();
    ctx.strokeStyle="rgba(30,18,18,.45)";ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-72,-240);ctx.lineTo(36,-211);ctx.stroke();
    polygon([[-113,-105],[-39,-126],[-39,-4],[-113,17]]);ctx.fillStyle="#f1dfbb";ctx.fill();polygon([[-106,-99],[-46,-116],[-46,-8],[-106,9]]);ctx.fillStyle="#552e2c";ctx.fill();
    ctx.strokeStyle="#e8c991";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-101,-95);ctx.lineTo(-50,-12);ctx.moveTo(-50,-110);ctx.lineTo(-102,3);ctx.stroke();
    ctx.fillStyle="#f0dfbb";ctx.beginPath();ctx.ellipse(-67,-169,24,18,-.22,0,Math.PI*2);ctx.fill();ctx.fillStyle="#3f2a28";ctx.beginPath();ctx.ellipse(-67,-169,16,11,-.22,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#ead7ae";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-83,-165);ctx.lineTo(-51,-174);ctx.moveTo(-67,-184);ctx.lineTo(-67,-154);ctx.stroke();
    polygon([[44,-119],[101,-102],[101,-48],[44,-65]]);ctx.fillStyle="#efdbb4";ctx.fill();polygon([[50,-112],[95,-99],[95,-54],[50,-68]]);ctx.fillStyle="#7fb2b7";ctx.fill();
    ctx.strokeStyle="#f6e6c7";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(72,-106);ctx.lineTo(72,-61);ctx.moveTo(49,-85);ctx.lineTo(96,-71);ctx.stroke();
    ctx.strokeStyle="#f0dbb8";ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(0,-193);ctx.lineTo(0,-14);ctx.moveTo(-141,-151);ctx.lineTo(-141,24);ctx.moveTo(139,-149);ctx.lineTo(139,24);ctx.stroke();
    ctx.fillStyle="rgba(67,35,27,.28)";polygon([[-142,12],[0,-26],[139,12],[139,25],[0,-15],[-142,25]]);ctx.fill();
    ctx.fillStyle="#d8b26d";roundRectPath(-115,-246,96,19,5);ctx.fill();ctx.fillStyle="#69352d";ctx.font="bold 10px system-ui";ctx.textAlign="center";ctx.fillText("SUNNYBROOK",-67,-233);
    ctx.strokeStyle="#3b3029";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-67,-246);ctx.lineTo(-67,-276);ctx.moveTo(-84,-268);ctx.lineTo(-49,-268);ctx.stroke();ctx.beginPath();ctx.moveTo(-49,-268);ctx.lineTo(-59,-274);ctx.lineTo(-59,-262);ctx.closePath();ctx.fillStyle="#d8a43f";ctx.fill();ctx.restore();
  }

  function drawTree(tree){
    var p=worldToScreen(tree.worldX,tree.worldY),scale=camera.zoom*tree.size,sway=Math.sin(elapsedSeconds*.55+tree.variant)*1.25;
    var leaf=tree.kind==="autumn"?"#c97b2e":tree.kind==="apple"?"#397f43":tree.kind==="pear"?"#548d3f":"#478f4a";
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(scale,scale);
    var trunk=ctx.createLinearGradient(-10,-76,13,1);trunk.addColorStop(0,"#9b6838");trunk.addColorStop(.58,"#704527");trunk.addColorStop(1,"#4f3423");
    ctx.fillStyle=trunk;roundRectPath(-9,-79,18,82,7);ctx.fill();
    ctx.strokeStyle="#6c4328";ctx.lineWidth=8;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-1,-55);ctx.lineTo(-27,-88);ctx.moveTo(3,-61);ctx.lineTo(29,-96);ctx.stroke();
    ctx.strokeStyle="rgba(238,181,107,.3)";ctx.lineWidth=1.4;[-4,2,6].forEach(function(x,i){ctx.beginPath();ctx.moveTo(x,-64+i*3);ctx.quadraticCurveTo(x-3,-34,x-1,-8);ctx.stroke();});
    ctx.translate(sway,0);
    tree.lobes.forEach(function(lobe){ctx.beginPath();ctx.arc(lobe.x+4,lobe.y+6,lobe.radius+2,0,Math.PI*2);ctx.fillStyle="rgba(31,69,36,.24)";ctx.fill();});
    tree.lobes.forEach(function(lobe,i){
      ctx.beginPath();ctx.arc(lobe.x,lobe.y,lobe.radius,0,Math.PI*2);
      ctx.fillStyle=i%6===0?lighten(leaf,25):i%4===0?lighten(leaf,11):i%5===0?"rgba(37,91,43,.9)":leaf;ctx.fill();
      ctx.strokeStyle="rgba(27,68,34,.2)";ctx.lineWidth=1;ctx.stroke();
      if(i%5===0){ctx.beginPath();ctx.arc(lobe.x-5,lobe.y-6,Math.max(3,lobe.radius*.28),Math.PI*1.05,Math.PI*1.72);ctx.strokeStyle="rgba(230,249,176,.24)";ctx.lineWidth=2;ctx.stroke();}
    });
    if(tree.kind==="apple"||tree.kind==="pear")tree.fruit.forEach(function(fruit,i){
      ctx.strokeStyle="#5c5123";ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(fruit.x,fruit.y-5);ctx.lineTo(fruit.x+1,fruit.y-2);ctx.stroke();
      ctx.beginPath();ctx.arc(fruit.x,fruit.y,3.7+(i%3)*.3,0,Math.PI*2);ctx.fillStyle=tree.kind==="apple"?(i%4===0?"#ee6745":"#cb4436"):(i%3===0?"#e6c953":"#c9a83a");ctx.fill();
      ctx.beginPath();ctx.arc(fruit.x-1.2,fruit.y-1.3,1,0,Math.PI*2);ctx.fillStyle="rgba(255,245,183,.68)";ctx.fill();
    });
    ctx.restore();
  }

  function drawCropPlant(data,now){
    var p=worldToScreen(data.plot.worldX+data.plant.x,data.plot.worldY+data.plant.y),z=camera.zoom,progress=data.state.progress;
    var stage=progress<.12?0:progress<.3?1:progress<.55?2:progress<.82?3:4;
    var cropDefinition=ITEM_DEFINITIONS[data.plot.cropId]||ITEM_DEFINITIONS.carrot;
    var productionState=progress<.04?"seed_hole":progress<.18?"sprout":progress<.38?"young":progress<.64?"mid_growth":progress<.84?"mature_unripe":"ready_ripe";
    var productionVariant=productionState==="seed_hole"?"base":"living_"+["a","b","c"][data.index%3];
    if(drawProductionWorldAsset(cropDefinition.assetId,{worldX:data.plot.worldX+data.plant.x,worldY:data.plot.worldY+data.plant.y,size:data.plant.size},{component:"plant",view:"iso_locked",state:productionState,variant:productionVariant,layer:"diffuse",surface:"crop-world"}))return;
    if(cropDefinition.assetId!=="CROP-CARROT-001")return;
    var cropEntry=fallbackRegistry&&fallbackRegistry.crops&&fallbackRegistry.crops.carrot;
    var cropState=["seed","sprout","young","growing","ready"][stage];
    if(cropEntry&&cropEntry.states&&drawFallbackSprite(cropEntry,cropEntry.states[cropState],p.x,p.y,.052*z*data.plant.size))return;
    var scale=data.plant.size*(.42+stage*.1),sway=Math.sin(elapsedSeconds*1.1+data.index)*.032;
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(z*scale,z*scale);
    ctx.fillStyle="rgba(69,40,27,.38)";ctx.beginPath();ctx.ellipse(0,1.2,6.2,2.25,0,0,Math.PI*2);ctx.fill();
    if(stage===0){ctx.fillStyle="#49301f";ctx.beginPath();ctx.ellipse(0,-.3,2.6,1.4,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="rgba(225,165,90,.45)";ctx.lineWidth=.8;ctx.stroke();}
    else{
      if(stage===4){
        var root=ctx.createLinearGradient(-4,-10,4,8);root.addColorStop(0,"#ffb13e");root.addColorStop(.48,"#ed7f25");root.addColorStop(1,"#b94f1c");ctx.fillStyle=root;
        ctx.beginPath();ctx.moveTo(-4.8,-7);ctx.quadraticCurveTo(-5.4,1.5,0,8);ctx.quadraticCurveTo(5.4,1.5,4.8,-7);ctx.quadraticCurveTo(0,-10,-4.8,-7);ctx.fill();
        ctx.strokeStyle="rgba(255,211,104,.48)";ctx.lineWidth=.85;ctx.beginPath();ctx.moveTo(-1.7,-5);ctx.quadraticCurveTo(-1,1.5,0,5.6);ctx.stroke();
        ctx.fillStyle="rgba(83,47,27,.6)";ctx.beginPath();ctx.ellipse(0,.8,6.1,2.4,0,0,Math.PI*2);ctx.fill();
      }
      var leaves=stage===1?2:stage===2?3:stage===3?4:5;
      for(var i=0;i<leaves;i+=1){
        ctx.save();ctx.rotate(data.plant.lean+sway+(i-(leaves-1)/2)*.35);
        var leafY=-(5.5+stage*1.8),leafW=1.55+stage*.28,leafH=5.3+stage*1.35;
        var leafGradient=ctx.createLinearGradient(-leafW,leafY,leafW,leafY-leafH);leafGradient.addColorStop(0,i%2?"#27783b":"#2e8641");leafGradient.addColorStop(1,i%2?"#55ad54":"#44a14c");ctx.fillStyle=leafGradient;
        ctx.beginPath();ctx.ellipse(0,leafY-leafH*.45,leafW,leafH,0,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="rgba(198,232,127,.28)";ctx.lineWidth=.55;ctx.beginPath();ctx.moveTo(0,-2);ctx.lineTo(0,leafY-leafH*.94);ctx.stroke();ctx.restore();
      }
    }
    ctx.restore();
  }

  function drawFencePost(e){if(drawProductionWorldAsset(e.assetId||"STRUCT-FENCE-WOOD-001",e,{state:"post",surface:"world-structure"}))return;var p=worldToScreen(e.worldX,e.worldY),z=camera.zoom;ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle="#754827";roundRectPath(-6*z,-46*z,12*z,49*z,3*z);ctx.fill();ctx.beginPath();ctx.moveTo(-7*z,-43*z);ctx.lineTo(0,-53*z);ctx.lineTo(7*z,-43*z);ctx.closePath();ctx.fillStyle="#a76a36";ctx.fill();ctx.restore();}
  function propTransform(e){var p=worldToScreen(e.worldX,e.worldY),z=camera.zoom*(e.size||1);ctx.translate(p.x,p.y);ctx.scale(z,z);}
  function drawBench(e){ctx.save();propTransform(e);ctx.fillStyle="#85522e";ctx.fillRect(-31,-24,62,12);ctx.fillRect(-27,-9,54,10);ctx.fillStyle="#5a3925";ctx.fillRect(-24,0,7,19);ctx.fillRect(18,0,7,19);ctx.restore();}
  function drawBirdhouse(e){ctx.save();propTransform(e);ctx.fillStyle="#6c482d";ctx.fillRect(-4,-72,8,74);ctx.fillStyle="#e7bd6c";ctx.fillRect(-21,-105,42,34);ctx.beginPath();ctx.moveTo(-27,-103);ctx.lineTo(0,-126);ctx.lineTo(27,-103);ctx.closePath();ctx.fillStyle="#7d4e2e";ctx.fill();ctx.beginPath();ctx.arc(0,-90,7,0,Math.PI*2);ctx.fillStyle="#38251d";ctx.fill();ctx.restore();}
  function drawBasket(e){ctx.save();propTransform(e);ctx.beginPath();ctx.ellipse(0,-13,22,16,0,0,Math.PI*2);ctx.fillStyle="#b77a35";ctx.fill();ctx.beginPath();ctx.arc(0,-15,18,Math.PI,0);ctx.strokeStyle="#73471f";ctx.lineWidth=4;ctx.stroke();[-10,0,10].forEach(function(x){ctx.beginPath();ctx.moveTo(x,-24);ctx.lineTo(x*.75,0);ctx.strokeStyle="#855320";ctx.lineWidth=2;ctx.stroke();});ctx.restore();}
  function drawSign(e){ctx.save();propTransform(e);ctx.fillStyle="#6f4529";ctx.fillRect(-3,-66,6,68);ctx.fillStyle="#d7ad69";roundRectPath(-29,-72,58,28,4);ctx.fill();ctx.strokeStyle="#77492a";ctx.lineWidth=3;ctx.stroke();ctx.fillStyle="#624126";ctx.font="bold 8px system-ui";ctx.textAlign="center";ctx.fillText(e.label||"FARM",0,-54);ctx.restore();}
  function drawLantern(e){ctx.save();propTransform(e);ctx.fillStyle="#6a472c";ctx.fillRect(-2,-48,4,49);ctx.fillStyle="#363b3d";ctx.fillRect(-9,-52,18,20);ctx.fillStyle="#f5d56e";ctx.fillRect(-5,-48,10,12);ctx.restore();}
  function drawWeathervane(e){ctx.save();propTransform(e);ctx.translate((e.screenOffsetX||0),(e.screenOffsetY||0));ctx.strokeStyle="#4c4037";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-36);ctx.moveTo(-24,-28);ctx.lineTo(24,-28);ctx.stroke();ctx.fillStyle="#b0712d";ctx.beginPath();ctx.moveTo(24,-28);ctx.lineTo(12,-35);ctx.lineTo(12,-21);ctx.closePath();ctx.fill();ctx.restore();}
  function drawHayBale(e){ctx.save();propTransform(e);ctx.fillStyle="#d4a946";roundRectPath(-25,-29,50,29,10);ctx.fill();ctx.strokeStyle="#8c672d";ctx.lineWidth=2;[-12,12].forEach(function(x){ctx.beginPath();ctx.moveTo(x,-27);ctx.lineTo(x,-2);ctx.stroke();});ctx.strokeStyle="rgba(255,229,124,.55)";for(var i=0;i<5;i++){ctx.beginPath();ctx.moveTo(-19+i*8,-24);ctx.lineTo(-12+i*8,-6);ctx.stroke();}ctx.restore();}
  function drawCrate(e){ctx.save();propTransform(e);ctx.fillStyle="#9b6534";ctx.fillRect(-20,-31,40,31);ctx.strokeStyle="#684323";ctx.lineWidth=3;ctx.strokeRect(-20,-31,40,31);ctx.beginPath();ctx.moveTo(-17,-28);ctx.lineTo(17,-3);ctx.moveTo(17,-28);ctx.lineTo(-17,-3);ctx.stroke();ctx.restore();}
  function drawBarrel(e){ctx.save();propTransform(e);ctx.fillStyle="#8b5b31";ctx.beginPath();ctx.ellipse(0,-29,17,7,0,0,Math.PI*2);ctx.fill();ctx.fillRect(-17,-29,34,27);ctx.beginPath();ctx.ellipse(0,-2,17,6,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#4e4640";ctx.lineWidth=3;[-24,-8].forEach(function(y){ctx.beginPath();ctx.ellipse(0,y,17,5,0,0,Math.PI*2);ctx.stroke();});ctx.restore();}
  function drawSacks(e){ctx.save();propTransform(e);[-10,9].forEach(function(x,i){ctx.fillStyle=i?"#c9a56f":"#d7b77d";ctx.beginPath();ctx.moveTo(x-11,0);ctx.quadraticCurveTo(x-15,-23,x-5,-32);ctx.lineTo(x+5,-32);ctx.quadraticCurveTo(x+16,-22,x+11,0);ctx.closePath();ctx.fill();ctx.strokeStyle="#8d714c";ctx.lineWidth=2;ctx.stroke();});ctx.restore();}
  function drawWheelbarrow(e){ctx.save();propTransform(e);ctx.strokeStyle="#5b482f";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-6,-5);ctx.lineTo(39,-29);ctx.moveTo(8,-4);ctx.lineTo(44,1);ctx.stroke();ctx.fillStyle="#397d66";ctx.beginPath();ctx.moveTo(-39,-36);ctx.lineTo(16,-34);ctx.lineTo(6,-7);ctx.lineTo(-29,-10);ctx.closePath();ctx.fill();ctx.beginPath();ctx.arc(-18,0,11,0,Math.PI*2);ctx.fillStyle="#3b3830";ctx.fill();ctx.beginPath();ctx.arc(-18,0,4,0,Math.PI*2);ctx.fillStyle="#a87a3e";ctx.fill();ctx.restore();}
  function drawBucket(e){ctx.save();propTransform(e);ctx.fillStyle="#8ba0a0";ctx.beginPath();ctx.moveTo(-13,-23);ctx.lineTo(13,-23);ctx.lineTo(9,0);ctx.lineTo(-9,0);ctx.closePath();ctx.fill();ctx.strokeStyle="#536967";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-19,15,Math.PI,0);ctx.stroke();ctx.restore();}
  function drawWateringCan(e){ctx.save();propTransform(e);ctx.fillStyle="#5e9b85";ctx.beginPath();ctx.ellipse(0,-15,18,14,0,0,Math.PI*2);ctx.fill();ctx.fillRect(-16,-19,31,18);ctx.strokeStyle="#477563";ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,-24,16,Math.PI,0);ctx.stroke();ctx.beginPath();ctx.moveTo(15,-18);ctx.lineTo(34,-30);ctx.stroke();ctx.beginPath();ctx.arc(37,-32,5,0,Math.PI*2);ctx.fill();ctx.restore();}
  function drawStump(e){ctx.save();propTransform(e);ctx.fillStyle="#75502f";roundRectPath(-14,-27,28,28,5);ctx.fill();ctx.beginPath();ctx.ellipse(0,-27,15,7,0,0,Math.PI*2);ctx.fillStyle="#c18b50";ctx.fill();ctx.strokeStyle="#805a34";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-27,8,0,Math.PI*2);ctx.stroke();ctx.restore();}
  function drawRock(e){ctx.save();propTransform(e);ctx.beginPath();ctx.moveTo(-18,0);ctx.lineTo(-13,-17);ctx.lineTo(2,-25);ctx.lineTo(18,-13);ctx.lineTo(15,0);ctx.closePath();ctx.fillStyle="#7d8277";ctx.fill();ctx.beginPath();ctx.moveTo(-12,-16);ctx.lineTo(2,-23);ctx.lineTo(9,-14);ctx.closePath();ctx.fillStyle="#a9ab9a";ctx.fill();ctx.restore();}
  function drawTools(e){ctx.save();propTransform(e);ctx.fillStyle="#734728";ctx.fillRect(-25,-9,50,7);ctx.strokeStyle="#74472b";ctx.lineWidth=4;[-14,6,18].forEach(function(x,i){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+(i-1)*5,-54);ctx.stroke();});ctx.fillStyle="#7c8580";ctx.fillRect(-22,-59,14,5);ctx.fillRect(1,-61,11,8);ctx.restore();}
  function drawFlowers(e){ctx.save();propTransform(e);var colors=["#fff2d4","#f2c84b","#e79ab5"];for(var i=0;i<9;i++){var x=(i%3-1)*8+(i%2)*3,y=-Math.floor(i/3)*7;ctx.strokeStyle="#368044";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,2);ctx.lineTo(x,y-8);ctx.stroke();ctx.fillStyle=colors[(i+(e.variant||0))%3];ctx.beginPath();ctx.arc(x,y-10,3,0,Math.PI*2);ctx.fill();}ctx.restore();}
  function drawWell(e){
    ctx.save();propTransform(e);
    ctx.fillStyle="#6c4a31";ctx.fillRect(-28,-69,6,66);ctx.fillRect(22,-69,6,66);
    ctx.strokeStyle="#4f3526";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-30,-66);ctx.lineTo(0,-88);ctx.lineTo(30,-66);ctx.stroke();
    ctx.fillStyle="#b36d3b";ctx.beginPath();ctx.moveTo(-34,-65);ctx.lineTo(0,-91);ctx.lineTo(34,-65);ctx.lineTo(26,-56);ctx.lineTo(-26,-56);ctx.closePath();ctx.fill();
    ctx.strokeStyle="rgba(242,178,101,.45)";ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-28,-65);ctx.lineTo(0,-84);ctx.lineTo(27,-64);ctx.stroke();
    ctx.fillStyle="#888478";ctx.beginPath();ctx.ellipse(0,-8,32,13,0,0,Math.PI*2);ctx.fill();ctx.fillRect(-31,-22,62,15);
    ctx.fillStyle="#aaa596";ctx.beginPath();ctx.ellipse(0,-22,32,13,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#283e3b";ctx.beginPath();ctx.ellipse(0,-22,23,8,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#5d594f";ctx.lineWidth=2;[-22,-7,9,23].forEach(function(x){ctx.beginPath();ctx.moveTo(x,-18);ctx.lineTo(x-2,-5);ctx.stroke();});
    ctx.strokeStyle="#493427";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-23,-49);ctx.lineTo(23,-49);ctx.stroke();ctx.beginPath();ctx.arc(0,-49,7,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
  function drawSeedRack(e){
    ctx.save();propTransform(e);
    var wood=ctx.createLinearGradient(-30,-55,30,0);wood.addColorStop(0,"#5d3b27");wood.addColorStop(1,"#8d5931");ctx.fillStyle=wood;
    ctx.fillRect(-30,-56,6,57);ctx.fillRect(24,-56,6,57);[-50,-28,-7].forEach(function(y){ctx.fillRect(-34,y,68,7);});
    var bagColors=["#d0ab68","#ba7146","#839b56","#dfc27c","#9b6e43","#c5864d"];
    for(var i=0;i<6;i+=1){var row=Math.floor(i/3),x=-22+(i%3)*22,y=-34+row*22;ctx.fillStyle=bagColors[i];ctx.beginPath();ctx.moveTo(x-7,y);ctx.quadraticCurveTo(x-9,y-12,x-3,y-16);ctx.lineTo(x+3,y-16);ctx.quadraticCurveTo(x+9,y-11,x+7,y);ctx.closePath();ctx.fill();ctx.strokeStyle="rgba(66,42,27,.45)";ctx.lineWidth=1;ctx.stroke();ctx.fillStyle="rgba(255,236,171,.65)";ctx.fillRect(x-3,y-10,6,2);}
    ctx.restore();
  }
  function drawFlowerBed(e){
    ctx.save();propTransform(e);
    ctx.fillStyle="#6a442b";ctx.beginPath();ctx.ellipse(0,-2,40,13,-.08,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#9a6039";ctx.beginPath();ctx.ellipse(0,-7,35,10,-.08,0,Math.PI*2);ctx.fill();
    var colors=(e.variant||0)%2?["#ffcc52","#f491ac","#fff0d4","#9b83db"]:["#f58aa4","#fff1c3","#e5b642","#8db6e4"];
    for(var i=0;i<14;i+=1){var x=-28+(i%7)*9+(i%2)*2,y=-8-Math.floor(i/7)*7-(i%3)*2;ctx.strokeStyle="#367342";ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x,-2);ctx.lineTo(x,y-7);ctx.stroke();ctx.fillStyle=colors[(i+(e.variant||0))%colors.length];for(var petal=0;petal<5;petal+=1){var angle=petal*Math.PI*2/5;ctx.beginPath();ctx.arc(x+Math.cos(angle)*2.5,y-8+Math.sin(angle)*2.5,2,0,Math.PI*2);ctx.fill();}ctx.fillStyle="#e2a932";ctx.beginPath();ctx.arc(x,y-8,1.5,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  }
  function drawCompost(e){
    ctx.save();propTransform(e);
    ctx.fillStyle="#725035";for(var i=0;i<5;i+=1){ctx.fillRect(-29+i*13,-32,9,32);}
    ctx.strokeStyle="#3f3025";ctx.lineWidth=3;[-27,-8].forEach(function(y){ctx.beginPath();ctx.moveTo(-31,y);ctx.lineTo(31,y);ctx.stroke();});
    ctx.fillStyle="#526c37";ctx.beginPath();ctx.arc(-12,-34,15,0,Math.PI*2);ctx.arc(4,-39,18,0,Math.PI*2);ctx.arc(18,-32,13,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#8d6d3c";ctx.beginPath();ctx.ellipse(1,-29,27,9,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#d2a34d";ctx.lineWidth=2;for(var j=0;j<5;j+=1){ctx.beginPath();ctx.moveTo(-19+j*9,-33+(j%2)*4);ctx.lineTo(-9+j*7,-41+(j%3)*3);ctx.stroke();}
    ctx.restore();
  }
  function drawMarketStand(e){
    ctx.save();propTransform(e);
    ctx.lineJoin="round";ctx.lineCap="round";

    // Rear structure first: warm timber posts and a softly lit back panel keep
    // the stall substantial while every part still shares one ground anchor.
    var timber=ctx.createLinearGradient(-65,-100,68,0);timber.addColorStop(0,"#5a3724");timber.addColorStop(.5,"#8f5931");timber.addColorStop(1,"#573522");
    ctx.fillStyle="rgba(70,42,25,.24)";ctx.beginPath();ctx.moveTo(-56,-78);ctx.lineTo(43,-68);ctx.lineTo(55,-13);ctx.lineTo(-47,-23);ctx.closePath();ctx.fill();
    ctx.fillStyle=timber;
    [[-56,-105,-50,-3],[49,-94,55,2]].forEach(function(post){
      ctx.beginPath();ctx.moveTo(post[0]-4,post[1]);ctx.lineTo(post[0]+4,post[1]+1);ctx.lineTo(post[2]+4,post[3]);ctx.lineTo(post[2]-4,post[3]-1);ctx.closePath();ctx.fill();
      ctx.strokeStyle="rgba(255,196,112,.28)";ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(post[0]-1,post[1]+5);ctx.lineTo(post[2]-1,post[3]-5);ctx.stroke();
    });

    // A small hand-painted sign gives the lower-field cluster an identity.
    ctx.fillStyle="#6b4329";ctx.fillRect(-24,-146,4,25);ctx.fillRect(32,-140,4,24);
    var sign=ctx.createLinearGradient(-25,-151,42,-121);sign.addColorStop(0,"#e4bc74");sign.addColorStop(1,"#b97a39");ctx.fillStyle=sign;
    ctx.beginPath();ctx.moveTo(-34,-153);ctx.lineTo(43,-147);ctx.lineTo(40,-124);ctx.lineTo(-37,-130);ctx.closePath();ctx.fill();
    ctx.strokeStyle="#684027";ctx.lineWidth=2.4;ctx.stroke();
    ctx.fillStyle="#4b3020";ctx.font="bold 8px Georgia, serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.save();ctx.translate(3,-138);ctx.rotate(.075);ctx.fillText("FARM MARKET",0,0);ctx.restore();
    ctx.fillStyle="rgba(255,239,183,.45)";ctx.beginPath();ctx.moveTo(-27,-148);ctx.lineTo(34,-143);ctx.strokeStyle="rgba(255,231,164,.48)";ctx.lineWidth=1;ctx.stroke();

    // Striped isometric canopy. Each stripe spans between the rear and front
    // canopy edges so it follows the same two axes as the farm world.
    var canopyBackA={x:-55,y:-129},canopyBackB={x:51,y:-119};
    var canopyFrontA={x:-72,y:-104},canopyFrontB={x:69,y:-91};
    var canopyColors=["#f5ebcf","#b84f43","#f5ebcf","#5a9270","#f5ebcf","#466f9d","#f5ebcf"];
    for(var stripeIndex=0;stripeIndex<canopyColors.length;stripeIndex+=1){
      var u0=stripeIndex/canopyColors.length,u1=(stripeIndex+1)/canopyColors.length;
      var rb0={x:canopyBackA.x+(canopyBackB.x-canopyBackA.x)*u0,y:canopyBackA.y+(canopyBackB.y-canopyBackA.y)*u0};
      var rb1={x:canopyBackA.x+(canopyBackB.x-canopyBackA.x)*u1,y:canopyBackA.y+(canopyBackB.y-canopyBackA.y)*u1};
      var rf0={x:canopyFrontA.x+(canopyFrontB.x-canopyFrontA.x)*u0,y:canopyFrontA.y+(canopyFrontB.y-canopyFrontA.y)*u0};
      var rf1={x:canopyFrontA.x+(canopyFrontB.x-canopyFrontA.x)*u1,y:canopyFrontA.y+(canopyFrontB.y-canopyFrontA.y)*u1};
      ctx.fillStyle=canopyColors[stripeIndex];ctx.beginPath();ctx.moveTo(rb0.x,rb0.y);ctx.lineTo(rb1.x,rb1.y);ctx.lineTo(rf1.x,rf1.y);ctx.lineTo(rf0.x,rf0.y);ctx.closePath();ctx.fill();
      ctx.fillStyle="rgba(255,255,255,.12)";ctx.beginPath();ctx.moveTo(rb0.x+1,rb0.y+1);ctx.lineTo(rb1.x-1,rb1.y+1);ctx.lineTo(rf1.x-2,rf1.y+3);ctx.lineTo(rf0.x+2,rf0.y+3);ctx.closePath();ctx.fill();
    }
    ctx.strokeStyle="#67432c";ctx.lineWidth=2.3;ctx.beginPath();ctx.moveTo(canopyBackA.x,canopyBackA.y);ctx.lineTo(canopyBackB.x,canopyBackB.y);ctx.lineTo(canopyFrontB.x,canopyFrontB.y);ctx.lineTo(canopyFrontA.x,canopyFrontA.y);ctx.closePath();ctx.stroke();

    // The scalloped valance gives the canopy a hand-built market-stall edge.
    for(var valanceIndex=0;valanceIndex<canopyColors.length;valanceIndex+=1){
      var v0=valanceIndex/canopyColors.length,v1=(valanceIndex+1)/canopyColors.length;
      var vx0=canopyFrontA.x+(canopyFrontB.x-canopyFrontA.x)*v0,vy0=canopyFrontA.y+(canopyFrontB.y-canopyFrontA.y)*v0;
      var vx1=canopyFrontA.x+(canopyFrontB.x-canopyFrontA.x)*v1,vy1=canopyFrontA.y+(canopyFrontB.y-canopyFrontA.y)*v1;
      ctx.fillStyle=canopyColors[valanceIndex];ctx.beginPath();ctx.moveTo(vx0,vy0);ctx.lineTo(vx1,vy1);ctx.lineTo(vx1-1,vy1+13);ctx.quadraticCurveTo((vx0+vx1)/2,vy1+18,vx0+1,vy0+12);ctx.closePath();ctx.fill();
      ctx.strokeStyle="rgba(83,50,31,.3)";ctx.lineWidth=.7;ctx.stroke();
    }

    // Counter: top, front apron and visible right side are separated by value
    // so the object reads as a 3/4 isometric structure rather than a flat icon.
    var counterTop=ctx.createLinearGradient(-58,-59,58,-34);counterTop.addColorStop(0,"#c78645");counterTop.addColorStop(.52,"#a96736");counterTop.addColorStop(1,"#82502f");ctx.fillStyle=counterTop;
    ctx.beginPath();ctx.moveTo(-57,-59);ctx.lineTo(41,-50);ctx.lineTo(61,-36);ctx.lineTo(-38,-45);ctx.closePath();ctx.fill();ctx.strokeStyle="#5f3a25";ctx.lineWidth=2.2;ctx.stroke();
    ctx.fillStyle="#75472b";ctx.beginPath();ctx.moveTo(-38,-45);ctx.lineTo(61,-36);ctx.lineTo(59,-18);ctx.lineTo(-39,-27);ctx.closePath();ctx.fill();
    ctx.fillStyle="#4f3425";ctx.beginPath();ctx.moveTo(41,-50);ctx.lineTo(61,-36);ctx.lineTo(59,-18);ctx.lineTo(40,-31);ctx.closePath();ctx.fill();
    ctx.strokeStyle="rgba(239,177,96,.32)";ctx.lineWidth=1;[-26,-2,22,46].forEach(function(x){ctx.beginPath();ctx.moveTo(x,-42+x*.09);ctx.lineTo(x,-25+x*.09);ctx.stroke();});

    // Three produce bins: carrots, tomatoes and leafy greens. The repeated
    // wooden frames unify them, while the produce silhouettes remain legible.
    function produceCrate(x,y,type){
      ctx.save();ctx.translate(x,y);ctx.rotate(.075);
      ctx.fillStyle="#6b4027";ctx.beginPath();ctx.moveTo(-18,-22);ctx.lineTo(17,-22);ctx.lineTo(20,-3);ctx.lineTo(-20,-3);ctx.closePath();ctx.fill();
      ctx.fillStyle="#a86c36";ctx.fillRect(-18,-19,36,18);ctx.strokeStyle="#563522";ctx.lineWidth=2;ctx.strokeRect(-18,-19,36,18);
      ctx.strokeStyle="rgba(242,183,98,.45)";ctx.lineWidth=1;[-12,0,12].forEach(function(slat){ctx.beginPath();ctx.moveTo(slat,-17);ctx.lineTo(slat,-2);ctx.stroke();});
      if(type==="carrot"){
        [-10,0,10].forEach(function(px,index){ctx.fillStyle=index===1?"#f5a034":"#e97a25";ctx.beginPath();ctx.moveTo(px-3,-18);ctx.quadraticCurveTo(px-3,-9,px,-4);ctx.quadraticCurveTo(px+4,-10,px+3,-18);ctx.closePath();ctx.fill();ctx.strokeStyle="#3e8545";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px,-18);ctx.lineTo(px-4,-26);ctx.moveTo(px,-18);ctx.lineTo(px+5,-25);ctx.stroke();});
      }else if(type==="tomato"){
        [-10,0,10,-5,6].forEach(function(px,index){var py=index<3?-17:-8;ctx.fillStyle=index%2?"#e84c3d":"#c93b32";ctx.beginPath();ctx.arc(px,py,5.3,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#3d7839";ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(px-3,py-4);ctx.lineTo(px+3,py-4);ctx.moveTo(px,py-7);ctx.lineTo(px,py-2);ctx.stroke();});
      }else{
        [-11,-4,4,11].forEach(function(px,index){ctx.fillStyle=index%2?"#54a252":"#3f8b45";ctx.beginPath();ctx.ellipse(px,-14-(index%2)*3,6,11,(index-1.5)*.18,0,Math.PI*2);ctx.fill();ctx.strokeStyle="rgba(202,232,130,.38)";ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(px,-6);ctx.lineTo(px,-22);ctx.stroke();});
      }
      ctx.restore();
    }
    produceCrate(-38,-1,"carrot");produceCrate(2,2,"tomato");produceCrate(42,5,"greens");

    // Small handwritten price cards and a side basket complete the cluster.
    [[-36,-49,"CARROT"],[2,-45,"TOMATO"],[39,-42,"GREENS"]].forEach(function(card){
      ctx.fillStyle="#f5e5b8";roundRectPath(card[0]-13,card[1]-7,27,12,2);ctx.fill();ctx.strokeStyle="rgba(94,61,34,.45)";ctx.lineWidth=.8;ctx.stroke();ctx.fillStyle="#604128";ctx.font="bold 4.6px system-ui";ctx.textAlign="center";ctx.fillText(card[2],card[0]+.5,card[1]+.5);
    });
    ctx.strokeStyle="#7a4a28";ctx.lineWidth=3;ctx.beginPath();ctx.arc(71,-13,13,Math.PI,0);ctx.stroke();ctx.fillStyle="#af7434";ctx.beginPath();ctx.ellipse(71,-5,15,9,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#f09b31";[65,71,77].forEach(function(px){ctx.beginPath();ctx.arc(px,-11,4,0,Math.PI*2);ctx.fill();});
    ctx.restore();
  }
  function drawHedge(e){ctx.save();propTransform(e);ctx.fillStyle="#296c38";for(var i=0;i<5;i++){ctx.beginPath();ctx.arc((i-2)*15,-15-Math.abs(i-2)*2,20-(i%2)*2,0,Math.PI*2);ctx.fill();}ctx.fillStyle="rgba(137,191,78,.38)";ctx.beginPath();ctx.arc(-18,-28,12,0,Math.PI*2);ctx.fill();ctx.restore();}
  function animalActionForEntity(e){
    var binding=e.identityBinding;
    if(!binding||!binding.valid)return "";
    if(e.animalActionOverride&&binding.clipByAction[e.animalActionOverride])return e.animalActionOverride;
    var cycle;
    if(e.type==="chicken"){
      cycle=((elapsedSeconds+(e.phase||0))%8+8)%8;
      if(cycle<1.35&&binding.clipByAction.peck)return "peck";
      if(cycle>6.7&&binding.clipByAction.flap)return "flap";
      if(binding.clipByAction.walk)return "walk";
    }
    if(e.type==="duck"){
      cycle=((elapsedSeconds+(e.phase||0))%6+6)%6;
      if(cycle<1.6&&binding.clipByAction.idle)return "idle";
      if(binding.clipByAction.swim)return "swim";
    }
    if(e.primaryAction&&binding.clipByAction[e.primaryAction])return e.primaryAction;
    return binding.clips[0]&&binding.clips[0].action||"";
  }
  function animalViewFromValues(e,views){
    var desired=e.assetDirection||(e.id.indexOf("-2")>=0?"sw":"se");
    if(views.includes(desired))return desired;
    var preferences=desired.indexOf("w")>=0?["sw","nw","w","three_quarter","iso_locked","side","screen_world"]:["se","ne","e","three_quarter","iso_locked","side","screen_world"];
    for(var i=0;i<preferences.length;i+=1)if(views.includes(preferences[i]))return preferences[i];
    return views[0]||"";
  }
  function animalViewForClip(e,clip){return animalViewFromValues(e,clip.availableViews);}
  function appendAnimalAuditValue(values,value){if(value&&!values.includes(value))values.push(value);}
  function animalFrameBindingKey(clip,value){
    value=value||{};
    return [clip.assetId,value.component||clip.component||"",value.view||"",value.state||clip.state||"",value.variant||clip.runtimeVariant||"",value.layer||clip.layer||""].join("|");
  }
  function recordAnimalRender(e,clip,record,drawn){
    var audit=animalRenderAudit[e.id]||(animalRenderAudit[e.id]={attempts:0,successfulDraws:0,heldDraws:0,identityTokens:[],runtimeVariants:[],assetIds:[],actions:[],urls:[],lastAssetId:"",lastAction:"",lastRuntimeVariant:"",lastUrl:"",_lastRecords:Object.create(null)});
    audit.attempts+=1;
    appendAnimalAuditValue(audit.identityTokens,e.identityBinding.identityToken);
    appendAnimalAuditValue(audit.runtimeVariants,clip.runtimeVariant);
    appendAnimalAuditValue(audit.assetIds,clip.assetId);
    appendAnimalAuditValue(audit.actions,clip.action);
    if(drawn){
      audit.successfulDraws+=1;
      audit.lastAssetId=clip.assetId;
      audit.lastAction=clip.action;
      audit.lastRuntimeVariant=record&&record.variant||clip.runtimeVariant;
      audit.lastUrl=record&&record.url||"";
      if(record)audit._lastRecords[animalFrameBindingKey(clip,record)]=record;
      appendAnimalAuditValue(audit.urls,audit.lastUrl);
    }
  }
  function animalClipElapsed(e,clip,criteria){
    var absolute=performance.now()+(e.phase||0)*1000;
    var sequence=productionRuntime.framesExact(clip.assetId,criteria);
    if(!sequence.length)return absolute;
    var duration=sequence.reduce(function(total,record){return total+productionRuntime.timing(clip.assetId,record).frameDurationMs;},0);
    if(e.animalActionOverride&&duration>0)return absolute%duration;
    if(e.type==="chicken"&&clip.action==="flap"){
      var cycle=((elapsedSeconds+(e.phase||0))%8+8)%8;
      return Math.max(0,cycle-6.7)*1000;
    }
    if(!productionRuntime.timing(clip.assetId,sequence[0]).loop&&duration>0)return absolute%duration;
    return absolute;
  }
  function drawHeldAnimalFrame(e,audit,clip,criteria){
    if(!audit||!clip)return false;
    var key=animalFrameBindingKey(clip,criteria);
    var record=audit._lastRecords&&audit._lastRecords[key];
    // On the first visit to an action, try that sequence's own first frame.
    // Never bridge a decode gap with a model or a different action family.
    if(!record)record=productionRuntime.framesExact(clip.assetId,criteria)[0]||null;
    if(!record)return false;
    var heldCriteria={
      exact:true,
      frame:record.frame,
      view:record.view,
      state:record.state,
      variant:record.variant,
      layer:record.layer,
      footprintAssetId:e.identityBinding.model.assetId,
      surface:"animal-animation"
    };
    if(record.component)heldCriteria.component=record.component;
    var held=drawProductionWorldAsset(clip.assetId,e,heldCriteria);
    if(held){
      audit.successfulDraws+=1;
      audit.heldDraws+=1;
      audit.lastAssetId=clip.assetId;
      audit.lastAction=clip.action;
      audit.lastRuntimeVariant=record.variant||clip.runtimeVariant;
      audit.lastUrl=record.url||"";
      audit._lastRecords[key]=record;
      appendAnimalAuditValue(audit.urls,audit.lastUrl);
    }
    return held;
  }
  function drawProductionAnimal(e){
    var binding=e.identityBinding;
    if(!productionRuntime||!binding)return false;
    // A valid binding owns the render even while its first image decodes. We
    // deliberately do not switch to a model, fallback, or procedural animal
    // for that frame; the next loaded sequence frame keeps one visual family.
    if(!binding.valid)return true;
    if(binding.renderSource==="model"){
      var model=binding.model;
      var modelCriteria={exact:true,component:model.component,view:animalViewFromValues(e,model.availableViews),state:model.state,variant:model.runtimeVariant,layer:model.layer,footprintAssetId:model.assetId,surface:"animal-world"};
      var modelRecord=productionRuntime.selectExact(model.assetId,modelCriteria);
      var modelDrawn=drawProductionWorldAsset(model.assetId,e,modelCriteria);
      recordAnimalRender(e,{assetId:model.assetId,runtimeVariant:model.runtimeVariant,action:"model_idle"},modelRecord,modelDrawn);
      return true;
    }
    var action=animalActionForEntity(e),clip=binding.clipByAction[action]||binding.clips[0];
    if(!clip)return true;
    var criteria={
      exact:true,
      animated:true,
      view:animalViewForClip(e,clip),
      state:clip.state,
      variant:clip.runtimeVariant,
      layer:clip.layer,
      footprintAssetId:binding.model.assetId,
      surface:"animal-animation"
    };
    if(clip.component)criteria.component=clip.component;
    criteria.elapsedMs=animalClipElapsed(e,clip,criteria);
    var record=productionSelectedAnimationRecord(clip.assetId,criteria);
    var drawn=drawProductionWorldAsset(clip.assetId,e,criteria);
    recordAnimalRender(e,clip,record,drawn);
    if(!drawn)drawHeldAnimalFrame(e,animalRenderAudit[e.id],clip,criteria);
    return true;
  }
  function drawChicken(e){
    var p=worldToScreen(e.worldX,e.worldY),peck=((elapsedSeconds+(e.phase||0))%5)<1.35;
    if(drawProductionAnimal(e))return;
    if(drawFallbackAnimation(peck?"chickenPeck":"chickenWalk",p.x,p.y,.135*camera.zoom*(e.size||1),e.id==="hen-2"?"sw":"se",0))return;
    ctx.save();propTransform(e);var bob=Math.sin((elapsedSeconds+e.phase)*4)*2;ctx.translate(0,bob);ctx.fillStyle=e.color;ctx.beginPath();ctx.ellipse(0,-18,13,11,-.2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(10,-29,7,0,Math.PI*2);ctx.fill();ctx.fillStyle="#d84b35";ctx.beginPath();ctx.arc(10,-37,3,0,Math.PI*2);ctx.fill();ctx.fillStyle="#d59b2b";ctx.beginPath();ctx.moveTo(16,-30);ctx.lineTo(24,-27);ctx.lineTo(16,-25);ctx.closePath();ctx.fill();ctx.strokeStyle="#9b6226";ctx.lineWidth=2;[-3,5].forEach(function(x){ctx.beginPath();ctx.moveTo(x,-7);ctx.lineTo(x,0);ctx.stroke();});ctx.restore();
  }
  function drawDuck(e){
    var p=worldToScreen(e.worldX,e.worldY);
    var idle=((elapsedSeconds+(e.phase||0))%6)<1.6;
    var species=e.id==="duck-2"?"White":"Yellow";
    if(drawProductionAnimal(e))return;
    if(drawFallbackAnimation((idle?"duckIdle":"duckSwim")+species,p.x,p.y,.14*camera.zoom*(e.size||1),e.id==="duck-2"?"sw":"se",0))return;
    ctx.save();propTransform(e);ctx.fillStyle=e.color;ctx.beginPath();ctx.ellipse(-2,-13,16,8,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(10,-24,7,0,Math.PI*2);ctx.fill();ctx.fillStyle="#e9a632";ctx.beginPath();ctx.moveTo(16,-25);ctx.lineTo(25,-22);ctx.lineTo(16,-20);ctx.closePath();ctx.fill();ctx.fillStyle="#342f27";ctx.beginPath();ctx.arc(12,-26,1.3,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function drawButterfly(e){if(drawProductionAnimal(e))return;if(e.assetId&&e.assetId!=="ANIM-BUTTERFLY-001")return;ctx.save();ctx.globalAlpha=Number.isFinite(e.ambientAlpha)?e.ambientAlpha:1;propTransform(e);ctx.translate(0,-25-Math.sin((elapsedSeconds+e.phase)*2.4)*8);var flap=.35+Math.abs(Math.sin((elapsedSeconds+e.phase)*6))*.8;ctx.fillStyle=e.color;ctx.beginPath();ctx.ellipse(-4,0,5*flap,8,-.4,0,Math.PI*2);ctx.ellipse(4,0,5*flap,8,.4,0,Math.PI*2);ctx.fill();ctx.fillStyle="#594630";ctx.fillRect(-1,-4,2,9);ctx.restore();}

  function drawEddy(){
    var direction=normalizeDirection(player.direction,"se"),action=activePlayerAction();
    var animationStartedAt=0;
    var productionAnimationId="ANIMSEQ-EDDY-IDLE-001";
    if(action==="plant")productionAnimationId="ANIMSEQ-EDDY-PLANT-001";
    else if(action==="water")productionAnimationId="ANIMSEQ-EDDY-WATER-001";
    else if(action==="inventoryFull")productionAnimationId="ANIMSEQ-EDDY-FULL-001";
    else if(action==="harvestPickup"){
      var sequenceProgress=(performance.now()-player.actionStartedAt)/(player.actionUntil-player.actionStartedAt);
      animationStartedAt=sequenceProgress<.56?player.actionStartedAt:player.actionStartedAt+(player.actionUntil-player.actionStartedAt)*.56;
    }else if(player.walking)productionAnimationId="ANIMSEQ-EDDY-WALK-001";
    if(!animationStartedAt)animationStartedAt=action?player.actionStartedAt:0;
    if(action==="harvestPickup"){
      var harvestDuration=productionClipDuration("ANIMSEQ-EDDY-HARVEST-001",{view:direction,layer:"diffuse"})||720;
      var pickupDuration=productionClipDuration("ANIMSEQ-EDDY-PICKUP-001",{view:direction,layer:"diffuse"})||620;
      var actionElapsed=performance.now()-player.actionStartedAt;
      productionAnimationId=actionElapsed<harvestDuration?"ANIMSEQ-EDDY-HARVEST-001":"ANIMSEQ-EDDY-PICKUP-001";
      animationStartedAt=actionElapsed<harvestDuration?player.actionStartedAt:player.actionStartedAt+Math.min(harvestDuration,player.actionUntil-player.actionStartedAt-pickupDuration);
    }
    if(drawProductionWorldAsset(productionAnimationId,{worldX:player.worldX,worldY:player.worldY,size:0.82},{animated:true,elapsedMs:performance.now()-animationStartedAt,view:direction,layer:"diffuse",surface:"player-animation"}))return;
    // Never expose the former procedural/chroma-key prototype while a frame
    // is loading. The approved v004 turnaround is the sole static fallback.
    // Its larger authored footprint needs a smaller size multiplier to match
    // the animation package's on-screen scale.
    drawProductionWorldAsset("CHAR-EDDY-REF-001",{worldX:player.worldX,worldY:player.worldY,size:0.37},{component:"full",view:direction,state:"neutral",variant:"v004",layer:"diffuse",surface:"player-reference-fallback"});
  }

  function spawnFloatingLoot(plot,itemId,quantity){
    floatingLoot.push({
      worldX:plot.worldX,
      worldY:plot.worldY,
      itemId:itemId,
      quantity:quantity,
      startedAt:performance.now(),
      duration:1150
    });
  }

  function drawFloatingLoot(now){
    floatingLoot=floatingLoot.filter(function(effect){return now-effect.startedAt<effect.duration;});
    floatingLoot.forEach(function(effect){
      var progress=clamp((now-effect.startedAt)/effect.duration,0,1);
      var p=worldToScreen(effect.worldX,effect.worldY);
      var rise=(22+35*progress)*camera.zoom;
      ctx.save();
      ctx.globalAlpha=1-Math.max(0,(progress-.62)/.38);
      ctx.translate(p.x,p.y-rise);
      if(productionRuntime)productionRuntime.draw(ctx,"UI-PICKUP-001",{x:0,y:0,displayWidth:90,view:"screen",state:"base",surface:"pickup-hud"});
      ctx.fillStyle="rgba(255,252,225,.96)";
      ctx.strokeStyle="rgba(89,61,31,.22)";
      ctx.lineWidth=1;
      roundRectPath(-43,-15,86,30,15);
      ctx.fill();ctx.stroke();
      ctx.fillStyle="#d86f25";
      ctx.font="900 14px system-ui, sans-serif";
      ctx.textAlign="center";
      ctx.textBaseline="middle";
      var definition=ITEM_DEFINITIONS[effect.itemId]||ITEM_DEFINITIONS.carrot;
      var iconRecord=productionRuntime&&productionRuntime.select(definition.assetId,{component:"produce_icon",state:"harvested_produce_icon",layer:"diffuse"});
      if(iconRecord)productionRuntime.draw(ctx,definition.assetId,{x:-30,y:0,displayWidth:24,component:"produce_icon",state:"harvested_produce_icon",layer:"diffuse",surface:"pickup-hud"});
      ctx.fillText("+"+effect.quantity+" "+definition.name.toUpperCase(),iconRecord?8:0,0);
      ctx.restore();
    });
  }

  function drawReadyEffects(now){plots.forEach(function(plot){if(getPlotState(plot,now).name!=="ready")return;var p=worldToScreen(plot.worldX,plot.worldY),z=camera.zoom,readyAt=(plot.plantedAt||now)+GROW_TIME;if(productionRuntime&&productionRuntime.draw(ctx,"UI-READY-001",{x:p.x,y:p.y-18*z,displayWidth:44*z,view:"screen",state:"ready",animated:true,elapsedMs:now-readyAt,surface:"ready-hud"})){productionRuntime.draw(ctx,"FX-READY-001",{x:p.x,y:p.y-12*z,displayWidth:72*z,animated:true,elapsedMs:now-readyAt,state:"loop",surface:"gameplay-effect"});return;}if(drawFallbackEffect("readyMarker",p.x,p.y-12*z,.11*z,readyAt))return;var cadence=2500+((plot.variant*911)%1500),phase=((now-readyAt+plot.variant*317)%cadence)/cadence;if(phase>.24)return;var lift=Math.sin(phase/.24*Math.PI);for(var i=0;i<2;i++){ctx.save();ctx.globalAlpha=.34+.58*lift;ctx.translate(p.x+(i?22:-18)*z,p.y-(12+10*lift+i*4)*z);drawSparkle(0,0,(2+i)*z);ctx.restore();}});}
  function drawSparkle(x,y,size){ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.moveTo(0,-size*1.8);ctx.lineTo(size*.4,-size*.4);ctx.lineTo(size*1.8,0);ctx.lineTo(size*.4,size*.4);ctx.lineTo(0,size*1.8);ctx.lineTo(-size*.4,size*.4);ctx.lineTo(-size*1.8,0);ctx.lineTo(-size*.4,-size*.4);ctx.closePath();ctx.fillStyle="rgba(255,244,165,.82)";ctx.fill();ctx.restore();}

  function drawWarmGlow(x, y, radius, alpha) {
    var glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, "rgba(255,227,126," + alpha + ")");
    glow.addColorStop(0.26, "rgba(255,194,76," + (alpha * 0.55) + ")");
    glow.addColorStop(1, "rgba(255,184,72,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  function drawNightWorldLights() {
    var strength = smoothstep((lightingState.night - 0.18) / 0.82);
    if (strength <= 0.001) return;
    var p = worldToScreen(barn.worldX, barn.worldY);
    var z = camera.zoom;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    var lantern = decor.find(function (item) { return item.type === "lantern"; });
    if (lantern) {
      if (productionRuntime) productionRuntime.draw(ctx, "FX-LIGHTPOOL-001", {
        x: worldToScreen(lantern.worldX, lantern.worldY).x,
        y: worldToScreen(lantern.worldX, lantern.worldY).y,
        displayWidth: 150 * z,
        layer: "rgba",
        alpha: 0.72 * strength,
        composite: "screen",
        surface: "lighting-world"
      });
      drawFallbackStaticLayer("lantern", "ground_light_mask", lantern, .13 * z * (lantern.size || 1), .82 * strength, "screen");
      drawFallbackStaticLayer("lantern", "emissive_mask", lantern, .13 * z * (lantern.size || 1), strength, "screen");
    }
    drawWarmGlow(p.x + 72 * z, p.y - 82 * z, 56 * z, 0.34 * strength);
    drawWarmGlow(p.x - 66 * z, p.y - 169 * z, 42 * z, 0.24 * strength);
    drawWarmGlow(p.x - 127 * z, p.y - 61 * z, 70 * z, 0.22 * strength);
    ctx.fillStyle = "rgba(255,222,128," + (0.82 * strength) + ")";
    ctx.beginPath();
    ctx.ellipse(p.x + 72 * z, p.y - 83 * z, 20 * z, 12 * z, 0.29, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(p.x - 66 * z, p.y - 169 * z, 13 * z, 8 * z, -0.22, 0, Math.PI * 2);
    ctx.fill();

    fireflies.forEach(function (firefly) {
      var point = worldToScreen(
        firefly.x + Math.sin(elapsedSeconds * 0.34 + firefly.phase) * 0.11,
        firefly.y + Math.cos(elapsedSeconds * 0.29 + firefly.phase) * 0.08
      );
      var pulse = 0.38 + Math.pow((Math.sin(elapsedSeconds * 2.25 + firefly.phase) + 1) / 2, 2) * 0.62;
      drawWarmGlow(point.x, point.y - 14 * z, 13 * z, 0.42 * strength * pulse);
      ctx.fillStyle = "rgba(255,242,142," + (0.92 * strength * pulse) + ")";
      ctx.beginPath();
      ctx.arc(point.x, point.y - 14 * z, 1.55 * z, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawLighting() {
    var overlay = lightingState.overlay;
    ctx.save();

    // A soft upper-left sunlight wash keeps morning and afternoon dimensional.
    var sunlight = ctx.createLinearGradient(0, 0, VIEW.width, VIEW.height);
    var sunlightAlpha = (1 - lightingState.night) * (lightingState.phase === "afternoon" ? 0.08 : 0.045);
    sunlight.addColorStop(0, "rgba(255,246,189," + sunlightAlpha + ")");
    sunlight.addColorStop(0.58, "rgba(255,255,255,0)");
    sunlight.addColorStop(1, "rgba(20,31,52," + (0.025 + lightingState.night * 0.018) + ")");
    ctx.fillStyle = sunlight;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);

    ctx.fillStyle = "rgba(" + Math.round(overlay[0]) + "," + Math.round(overlay[1]) + "," + Math.round(overlay[2]) + "," + overlay[3] + ")";
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);

    var vignette = ctx.createRadialGradient(
      VIEW.width * 0.48, VIEW.height * 0.46, VIEW.height * 0.21,
      VIEW.width * 0.5, VIEW.height * 0.5, VIEW.width * 0.72
    );
    vignette.addColorStop(0.5, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(20,31,45," + lightingState.vignette + ")");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.restore();

    if (productionRuntime) {
      var phaseEffect = {
        sunrise: "FX-SUNRISE-001",
        morning: "FX-POLLEN-001",
        afternoon: "FX-AFTERNOON-001",
        night: "FX-NIGHT-001"
      }[lightingState.phase];
      var phaseAnimation = {
        sunrise: "ANIMSEQ-SUNRISE-001",
        morning: "ANIMSEQ-MORNING-001",
        afternoon: "ANIMSEQ-AFTERNOON-001",
        night: "ANIMSEQ-NIGHT-001"
      }[lightingState.phase];
      productionRuntime.draw(ctx, phaseEffect, {
        x: VIEW.width / 2, y: VIEW.height / 2,
        displayWidth: VIEW.width,
        layer: "rgba",
        alpha: lightingState.phase === "night" ? 0.12 : 0.075,
        composite: lightingState.phase === "night" ? "soft-light" : "screen",
        surface: "lighting-world"
      });
      productionRuntime.draw(ctx, phaseAnimation, {
        x: VIEW.width / 2, y: VIEW.height / 2,
        displayWidth: VIEW.width,
        component: "transition_reference",
        animated: true,
        elapsedMs: gameClock.minutes * 1000,
        layer: "rgba",
        alpha: 0.045,
        composite: "screen",
        surface: "lighting-transition"
      });
    }

    // Local lights are rendered after the global grade so they stay warm at night.
    drawNightWorldLights();
  }

  function drawInteractionBubble() {
    var plot = nearestPlot();
    if (!plot) return;
    var state = getPlotState(plot, Date.now());
    var definition = state.name === "empty" ? ITEM_DEFINITIONS[selectedCropId] : ITEM_DEFINITIONS[plot.cropId] || ITEM_DEFINITIONS.carrot;
    var label = state.name === "empty" ? "Plant " + definition.name.toLowerCase() : state.name === "ready" ? "Pull " + definition.name.toLowerCase() : "Water " + definition.name.toLowerCase();
    var p = worldToScreen(plot.worldX, plot.worldY);
    if (productionRuntime) {
      productionRuntime.draw(ctx, "UI-SELECTION-001", { x: p.x, y: p.y, displayWidth: 112 * camera.zoom, view: "iso_ground", state: "active", surface: "interaction-hud" });
      productionRuntime.draw(ctx, "UI-INTERACT-001", { x: p.x, y: p.y - 72 * camera.zoom, displayWidth: 156 * camera.zoom, view: "screen", state: "active", surface: "interaction-hud" });
    }
    ctx.save();
    ctx.font = "800 13px system-ui, sans-serif";
    var width = ctx.measureText(label).width + 28;
    var x = p.x - width / 2;
    var y = p.y - 88 * camera.zoom;
    ctx.fillStyle = "rgba(255,253,237,.94)";
    ctx.strokeStyle = "rgba(90,65,36,.18)";
    ctx.lineWidth = 1;
    roundRectPath(x, y, width, 28, 14);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#5c3c20"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(label, p.x, y + 14);
    ctx.restore();
  }

  function render() {
    beginFrame();
    var now = Date.now();
    var frameNow = performance.now();
    drawGround();
    drawPond();
    // Ripples belong to the water surface, so ducks and other entities can
    // correctly appear above them.
    drawPondRipples();
    drawBeds();
    drawGroundDecals();

    var entities = collectEntities(now);
    entities.sort(function (a, b) {
      var depthA = a.worldX + a.worldY + (a.depthOffset || 0);
      var depthB = b.worldX + b.worldY + (b.depthOffset || 0);
      if (Math.abs(depthA - depthB) > 0.0001) return depthA - depthB;
      var yA = worldToScreen(a.worldX, a.worldY).y;
      var yB = worldToScreen(b.worldX, b.worldY).y;
      return yA - yB || String(a.id).localeCompare(String(b.id));
    });
    entities.forEach(function (entity) {
      if (!drawFallbackPropShadow(entity)) drawContactShadow(entity);
      drawEntity(entity, now);
    });
    drawProductionEffects(frameNow);
    drawReadyEffects(now);
    drawLighting();
    // Inventory feedback is a HUD-like world annotation and should stay
    // legible through every day/night grade.
    drawFloatingLoot(performance.now());
    drawInteractionBubble();
  }

  function roundRectPath(x, y, width, height, radius) {
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath(); ctx.roundRect(x, y, width, height, radius); return;
    }
    var r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + width - r, y); ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r); ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height); ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }

  function lighten(hex, amount) {
    var value = parseInt(hex.slice(1), 16);
    var r = Math.min(255, (value >> 16) + amount);
    var g = Math.min(255, ((value >> 8) & 255) + amount);
    var b = Math.min(255, (value & 255) + amount);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function round(value, digits) { var factor = Math.pow(10, digits); return Math.round(value * factor) / factor; }

  function canvasPoint(event) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * VIEW.width / rect.width,
      y: (event.clientY - rect.top) * VIEW.height / rect.height
    };
  }

  function frame(now) {
    var dt = Math.min(0.035, Math.max(0, (now - lastTime) / 1000));
    lastTime = now;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }

  window.addEventListener("keydown", function (event) {
    var key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (event.key === "Escape" && inventoryPanel && !inventoryPanel.hidden) {
      event.preventDefault();
      setInventoryPanel(false);
      return;
    }
    if (isInventoryPanelOpen()) {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
      return;
    }
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
    if ((event.key === " " || key === "e") && !event.repeat) {
      interact();
      return;
    }
    if (event.shiftKey && key === "r" && !event.repeat) {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(PREVIOUS_SAVE_KEY);
      localStorage.removeItem(LEGACY_SAVE_KEY);
      window.location.reload();
      return;
    }
    keys[key] = true;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(key)) clickTarget = null;
  });

  window.addEventListener("keyup", function (event) {
    var key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    keys[key] = false;
  });

  window.addEventListener("blur", function () {
    clearGameplayInput();
    saveGame();
  });

  canvas.addEventListener("pointerdown", function (event) {
    if (isInventoryPanelOpen()) return;
    var point = canvasPoint(event);
    var target = screenToWorld(point.x, point.y);
    clickTarget = {
      x: clamp(target.x, 0.7, WORLD.width - 0.7),
      y: clamp(target.y, 0.7, WORLD.height - 0.7)
    };
    canvas.focus({ preventScroll: true });
  });

  document.querySelectorAll("[data-dir]").forEach(function (button) {
    var direction = button.getAttribute("data-dir");
    function begin(event) {
      event.preventDefault();
      if (isInventoryPanelOpen()) return;
      clickTarget = null;
      touchDirections.add(direction);
      button.classList.add("active");
      if (button.setPointerCapture && event.pointerId != null) button.setPointerCapture(event.pointerId);
    }
    function end(event) {
      event.preventDefault();
      touchDirections.delete(direction);
      button.classList.remove("active");
    }
    button.addEventListener("pointerdown", begin);
    button.addEventListener("pointerup", end);
    button.addEventListener("pointercancel", end);
    button.addEventListener("lostpointercapture", end);
  });

  actionButton.addEventListener("click", function () {
    if (isInventoryPanelOpen()) return;
    interact();
  });
  if (inventoryToggle) {
    inventoryToggle.addEventListener("click", function () {
      setInventoryPanel(inventoryToggle.getAttribute("aria-expanded") !== "true");
    });
  }
  if (inventoryClose) inventoryClose.addEventListener("click", function () { setInventoryPanel(false); });
  if (seedSelector) seedSelector.addEventListener("click", function () {
    var ids = Object.keys(ITEM_DEFINITIONS);
    var nextIndex = (ids.indexOf(selectedCropId) + 1) % ids.length;
    selectedCropId = ids[nextIndex];
    if (seedIconElement) delete seedIconElement.dataset.cropId;
    updateInterface();
    saveGame();
    announce(ITEM_DEFINITIONS[selectedCropId].name + " seed selected.");
  });
  window.addEventListener("eddy:inventory-changed", function () {
    renderInventory();
    updateInterface();
  });
  window.addEventListener("beforeunload", saveGame);

  window.__EDDY_GAME__ = Object.freeze({
    player: player,
    plots: plots,
    inventory: inventory,
    itemDefinitions: ITEM_DEFINITIONS,
    Inventory: Inventory,
    growthDuration: GROW_TIME,
    getPlotState: getPlotState,
    getInventorySnapshot: function () {
      return inventory.serialize();
    },
    addInventoryItem: function (itemId, quantity) {
      var result = inventory.addItem(itemId, quantity);
      updateInterface();
      saveGame();
      return result;
    },
    removeInventoryItem: function (itemId, quantity) {
      var result = inventory.removeItem(itemId, quantity);
      updateInterface();
      saveGame();
      return result;
    },
    getClockSnapshot: getClockSnapshot,
    setGameTime: setGameTime,
    previewGameTime: previewGameTime,
    clearGameTimePreview: clearGameTimePreview,
    setClockSpeed: setClockSpeed,
    getLightingSnapshot: function () {
      return {
        phase: lightingState.phase,
        night: round(lightingState.night, 3),
        overlay: lightingState.overlay.map(function (channel) { return round(channel, 3); }),
        shadowX: round(lightingState.shadowX, 3),
        shadowY: round(lightingState.shadowY, 3),
        shadowLength: round(lightingState.shadowLength, 3)
      };
    },
    interact: interact,
    resetLocalSave: function () {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(PREVIOUS_SAVE_KEY);
      localStorage.removeItem(LEGACY_SAVE_KEY);
      window.location.reload();
    }
  });

  registerGameplayConsumerFactories();
  registerGameplayStateRoutes();
  initialiseProductionHud();
  loadSave();
  renderInventory();
  updateInterface();
  requestAnimationFrame(frame);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      if (window.__EDDY_PUBLIC_LOADER__) window.__EDDY_PUBLIC_LOADER__.markReady();
    });
  });
})();
