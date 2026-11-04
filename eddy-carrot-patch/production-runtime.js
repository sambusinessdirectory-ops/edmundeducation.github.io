(function (global) {
  "use strict";

  var registry = global.EddyProductionAssets || {};
  var catalogue = registry.catalogue || {};
  var imageCache = Object.create(null);
  var imageStates = Object.create(null);
  var MAX_INFLIGHT_IMAGES = 24;
  var inflightImages = 0;
  var outputCache = Object.create(null);
  var selectionCache = Object.create(null);
  var frameCache = Object.create(null);
  var consumerHits = Object.create(null);
  var drawAttempts = Object.create(null);
  var reachableAssets = Object.create(null);
  var renderedSurfaces = Object.create(null);
  var assetValueCache = typeof WeakMap === "function" ? new WeakMap() : null;

  var CATEGORY_CONSUMERS = Object.freeze({
    Foundation: "foundation",
    Characters: "character",
    Terrain: "terrain",
    Crops: "crop",
    "Trees & Bushes": "world-static",
    Buildings: "world-static",
    "Fences & Structural Props": "world-static",
    "Props & Tools": "world-static",
    Animals: "animal",
    "UI & HUD": "ui",
    "Visual Effects": "effect",
    Animations: "animation"
  });

  function isObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function number(value, fallback) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function firstDefined() {
    for (var i = 0; i < arguments.length; i += 1) {
      if (arguments[i] !== undefined && arguments[i] !== null) return arguments[i];
    }
    return undefined;
  }

  function pngUrl(value) {
    if (typeof value !== "string" || !/\.png(?:$|[?#])/i.test(value)) return null;
    return value.replace(/^local-game\//, "");
  }

  function isRuntimePngUrl(url) {
    return Boolean(url) && !/(?:^|\/)(?:_source|qa|review|boards?)(?:\/|$)/i.test(url) && !/(?:review[_-]?board|contact[_-]?sheet|alpha[_-]?preview|combined[_-]?board|validation[_-]?mosaic)/i.test(url);
  }

  function parseFilename(url) {
    var basename = String(url || "").split("/").pop().replace(/\.png(?:[?#].*)?$/i, "");
    var parts = basename.split("__");
    var knownView = /^(?:n|ne|e|se|s|sw|w|nw|iso_locked|iso_ground|screen|screen_world|side|three_quarter)$/i;
    var result = { slug: parts[0] || "" };
    var componentless = knownView.test(parts[1] || "");
    var offset = componentless ? 1 : 2;
    if (!componentless && parts.length >= 6) result.component = parts[1];
    if (!knownView.test(parts[offset] || "")) return {};
    result.view = parts[offset];
    result.state = parts[offset + 1] || "";
    var tail = parts.slice(offset + 2);
    var frameToken = tail.length && /^f\d+$/i.test(tail[tail.length - 1]) ? tail.pop() : "";
    if (tail.length < 1) return {};
    result.layer = tail.pop();
    if (tail.length) result.variant = tail.pop();
    if (frameToken) result.frame = Number(frameToken.slice(1));
    return result;
  }

  function copyDimensions(target, value) {
    if (!isObject(value)) return;
    if (isObject(value.dimensions)) copyDimensions(target, value.dimensions);
    ["component", "view", "direction", "state", "variant", "layer", "frame", "frameIndex", "frame_index", "durationMs", "duration_ms", "frameDurationMs", "frame_duration_ms", "loop", "loopMode", "loop_mode", "canvas", "anchor", "footprint", "trimBox", "trim_box"].forEach(function (key) {
      if (value[key] !== undefined && target[key] === undefined) target[key] = value[key];
    });
    [["components", "component"], ["views", "view"], ["states", "state"], ["variants", "variant"], ["layers", "layer"], ["frames", "frame"]].forEach(function (mapping) {
      var values = value[mapping[0]];
      if (!Array.isArray(values) || !values.length || target[mapping[1]] !== undefined) return;
      target[mapping[1]] = mapping[1] === "frame"
        ? number(String(values[0]).replace(/^f/i, ""), 0)
        : values[0];
    });
    if (isObject(value.image)) {
      target.canvas = [number(value.image.width, 512), number(value.image.height, 512)];
      if (value.image.alphaBBox) target.alphaBBox = value.image.alphaBBox;
      if (value.image.alpha_bbox) target.alphaBBox = value.image.alpha_bbox;
    }
    if (Array.isArray(value.bindings)) value.bindings.forEach(function (binding) { copyDimensions(target, binding); });
  }

  function collectOutputs(value, inherited, outputs, seen) {
    var directUrl = pngUrl(value);
    if (directUrl) {
      if (!isRuntimePngUrl(directUrl)) return;
      if (seen[directUrl]) return;
      seen[directUrl] = true;
      outputs.push(Object.assign({}, inherited, parseFilename(directUrl), { url: directUrl }));
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(function (item, index) {
        collectOutputs(item, Object.assign({}, inherited, { collectionIndex: index }), outputs, seen);
      });
      return;
    }
    if (!isObject(value)) return;

    var next = Object.assign({}, inherited);
    copyDimensions(next, value);
    var objectUrl = pngUrl(firstDefined(value.url, value.path, value.file, value.runtimeUrl, value.runtime_url));
    if (objectUrl) {
      if (!isRuntimePngUrl(objectUrl)) return;
      if (!seen[objectUrl]) {
        seen[objectUrl] = true;
        // Aggregate dimensions describe the package, not this file. Canonical
        // filename tokens are the final per-output identity authority.
        outputs.push(Object.assign({}, next, value, parseFilename(objectUrl), { url: objectUrl }));
      }
      return;
    }

    Object.keys(value).forEach(function (key) {
      if (["metadata", "sourceMetadata", "source_metadata", "footprint", "anchor", "canvas", "trimBox", "trim_box"].includes(key)) return;
      var child = value[key];
      var childInherited = Object.assign({}, next);
      if (/^(n|ne|e|se|s|sw|w|nw|iso_locked|iso_ground|screen)$/i.test(key)) childInherited.view = key.toLowerCase();
      else if (/^(diffuse|shadow_mask|contact_shadow|cast_shadow|emissive_mask|ground_light_mask|mask|ui|effect)$/i.test(key)) childInherited.layer = key.toLowerCase();
      else if (/^f\d+$/i.test(key)) childInherited.frame = Number(key.slice(1));
      collectOutputs(child, childInherited, outputs, seen);
    });
  }

  function entry(assetId) {
    return catalogue[assetId] || null;
  }

  function outputs(assetId) {
    if (outputCache[assetId]) return outputCache[assetId];
    var asset = entry(assetId);
    if (!asset) return [];
    var records = [];
    var seen = Object.create(null);
    var source = firstDefined(asset.outputs, asset.runtimeOutputs, asset.runtime_outputs, asset.files, asset.frames, asset);
    collectOutputs(source, {}, records, seen);
    records.forEach(function (record, index) {
      record.index = index;
      record.component = String(firstDefined(record.component, "")).toLowerCase();
      record.view = String(firstDefined(record.view, record.direction, "")).toLowerCase();
      record.state = String(firstDefined(record.state, "")).toLowerCase();
      record.variant = String(firstDefined(record.variant, "")).toLowerCase();
      record.layer = String(firstDefined(record.layer, "diffuse")).toLowerCase();
      record.frame = number(firstDefined(record.frame, record.frameIndex, record.frame_index), 0);
      record.durationMs = number(firstDefined(record.durationMs, record.duration_ms, record.frameDurationMs, record.frame_duration_ms), NaN);
    });
    records.sort(function (a, b) {
      return a.view.localeCompare(b.view) || a.state.localeCompare(b.state) || a.variant.localeCompare(b.variant) || a.layer.localeCompare(b.layer) || a.frame - b.frame || a.url.localeCompare(b.url);
    });
    outputCache[assetId] = records;
    return records;
  }

  function normaliseCriteria(criteria) {
    criteria = criteria || {};
    return {
      component: String(criteria.component || "").toLowerCase(),
      view: String(criteria.view || criteria.direction || "").toLowerCase(),
      state: String(criteria.state || "").toLowerCase(),
      variant: String(criteria.variant || "").toLowerCase(),
      layer: String(criteria.layer || "diffuse").toLowerCase(),
      frame: criteria.frame == null ? null : number(criteria.frame, 0),
      index: Math.max(0, Math.floor(number(criteria.index, 0)))
    };
  }

  function dimensionScore(actual, requested, weight) {
    if (!requested) return 0;
    if (actual === requested) return weight;
    if (!actual) return -weight * 0.2;
    return -weight;
  }

  function criteriaKey(request) {
    return [request.component, request.view, request.state, request.variant, request.layer, request.frame == null ? "*" : request.frame, request.index].join("|");
  }

  function select(assetId, criteria) {
    var request = normaliseCriteria(criteria);
    var cache = selectionCache[assetId] || (selectionCache[assetId] = Object.create(null));
    var key = criteriaKey(request);
    if (Object.prototype.hasOwnProperty.call(cache, key)) return cache[key];
    var records = outputs(assetId);
    if (!records.length) return (cache[key] = null);
    var ranked = records.map(function (record) {
      var score = 0;
      score += dimensionScore(record.component, request.component, 8);
      score += dimensionScore(record.view, request.view, 24);
      score += dimensionScore(record.state, request.state, 20);
      score += dimensionScore(record.variant, request.variant, 8);
      score += dimensionScore(record.layer, request.layer, 36);
      if (request.frame !== null) score += record.frame === request.frame ? 16 : -Math.min(15, Math.abs(record.frame - request.frame));
      if (!request.view && ["iso_locked", "iso_ground", "se", "screen", ""].includes(record.view)) score += 2;
      if (!request.state && ["base", "neutral", "idle", "mature", "closed_day", ""].includes(record.state)) score += 2;
      if (!request.variant && ["base", "a", "v001", "living_a", ""].includes(record.variant)) score += 1;
      return { record: record, score: score };
    }).sort(function (a, b) {
      return b.score - a.score || a.record.frame - b.record.frame || a.record.url.localeCompare(b.record.url);
    });
    var bestScore = ranked[0].score;
    var best = ranked.filter(function (item) { return item.score === bestScore; });
    return (cache[key] = best[request.index % best.length].record);
  }

  function frames(assetId, criteria) {
    var request = normaliseCriteria(criteria);
    request.frame = null;
    var cache = frameCache[assetId] || (frameCache[assetId] = Object.create(null));
    var key = criteriaKey(request);
    if (cache[key]) return cache[key];
    var records = outputs(assetId);
    if (!records.length) return [];
    var seed = select(assetId, request);
    if (!seed) return [];
    var result = records.filter(function (record) {
      // Once the best tuple is selected, every identity dimension is frozen.
      // Omitting `variant` means "choose one variant", never "interleave all".
      return record.component === seed.component &&
        record.view === seed.view &&
        record.state === seed.state &&
        record.variant === seed.variant &&
        record.layer === seed.layer;
    });
    if (!result.length) result = [seed];
    cache[key] = result.sort(function (a, b) { return a.frame - b.frame || a.url.localeCompare(b.url); });
    return cache[key];
  }

  function exactCriteria(criteria) {
    criteria = criteria || {};
    var request = {};
    ["component", "view", "state", "variant", "layer"].forEach(function (key) {
      var value = key === "view" ? firstDefined(criteria.view, criteria.direction) : criteria[key];
      if (value !== undefined && value !== null && String(value) !== "") request[key] = String(value).toLowerCase();
    });
    if (criteria.frame !== undefined && criteria.frame !== null) request.frame = number(criteria.frame, 0);
    request.index = Math.max(0, Math.floor(number(criteria.index, 0)));
    return request;
  }

  function matchesExact(record, request) {
    return ["component", "view", "state", "variant", "layer"].every(function (key) {
      return request[key] === undefined || record[key] === request[key];
    }) && (request.frame === undefined || record.frame === request.frame);
  }

  function selectExact(assetId, criteria) {
    var request = exactCriteria(criteria);
    var matching = outputs(assetId).filter(function (record) { return matchesExact(record, request); });
    return matching.length ? matching[request.index % matching.length] : null;
  }

  function framesExact(assetId, criteria) {
    var request = exactCriteria(criteria);
    delete request.frame;
    var seenFrames = Object.create(null);
    return outputs(assetId).filter(function (record) {
      if (!/__f\d+\.png(?:$|[?#])/i.test(record.url) || !matchesExact(record, request)) return false;
      if (seenFrames[record.frame]) return false;
      seenFrames[record.frame] = true;
      return true;
    }).sort(function (a, b) { return a.frame - b.frame || a.url.localeCompare(b.url); });
  }

  function assetValue(asset, keys) {
    var cacheKey = keys.join("|");
    var cached = assetValueCache && assetValueCache.get(asset);
    if (cached && Object.prototype.hasOwnProperty.call(cached, cacheKey)) return cached[cacheKey];
    function nestedValue(value, key, depth) {
      if (!value || depth > 5) return undefined;
      if (isObject(value) && value[key] !== undefined) return value[key];
      if (Array.isArray(value)) {
        for (var arrayIndex = 0; arrayIndex < value.length; arrayIndex += 1) {
          var arrayResult = nestedValue(value[arrayIndex], key, depth + 1);
          if (arrayResult !== undefined) return arrayResult;
        }
      } else if (isObject(value)) {
        var nestedKeys = Object.keys(value);
        for (var objectIndex = 0; objectIndex < nestedKeys.length; objectIndex += 1) {
          var objectResult = nestedValue(value[nestedKeys[objectIndex]], key, depth + 1);
          if (objectResult !== undefined) return objectResult;
        }
      }
      return undefined;
    }
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      if (asset && asset[key] !== undefined) {
        if (assetValueCache) { cached = cached || {}; cached[cacheKey] = asset[key]; assetValueCache.set(asset, cached); }
        return asset[key];
      }
      if (asset && asset.metadata && asset.metadata[key] !== undefined) {
        if (assetValueCache) { cached = cached || {}; cached[cacheKey] = asset.metadata[key]; assetValueCache.set(asset, cached); }
        return asset.metadata[key];
      }
      if (asset && asset.contract) {
        var contractValue = nestedValue(asset.contract, key, 0);
        if (contractValue !== undefined) {
          if (assetValueCache) { cached = cached || {}; cached[cacheKey] = contractValue; assetValueCache.set(asset, cached); }
          return contractValue;
        }
      }
      if (asset && asset.documents) {
        var documentValue = nestedValue(asset.documents.map(function (document) { return document.data; }), key, 0);
        if (documentValue !== undefined) {
          if (assetValueCache) { cached = cached || {}; cached[cacheKey] = documentValue; assetValueCache.set(asset, cached); }
          return documentValue;
        }
      }
    }
    return undefined;
  }

  function canvasSize(assetId, output) {
    var asset = entry(assetId) || {};
    var canvas = firstDefined(output && output.canvas, assetValue(asset, ["canvas", "canvasSize", "canvas_size"]));
    if (Array.isArray(canvas) && canvas.length >= 2) return [number(canvas[0], 512), number(canvas[1], 512)];
    if (isObject(canvas)) return [number(firstDefined(canvas.width, canvas.widthPx, canvas.width_px), 512), number(firstDefined(canvas.height, canvas.heightPx, canvas.height_px), 512)];
    return [512, 512];
  }

  function anchor(assetId, output) {
    var asset = entry(assetId) || {};
    var canvas = canvasSize(assetId, output);
    var value = firstDefined(output && output.anchor, assetValue(asset, ["anchor", "anchorPx", "anchor_px"]));
    var x;
    var y;
    if (Array.isArray(value)) {
      x = number(value[0], canvas[0] / 2);
      y = number(value[1], canvas[1] * 0.875);
    } else if (isObject(value)) {
      var pixel = firstDefined(value.pixel, value.pixels);
      var normalised = firstDefined(value.normalized, value.normalised);
      if (Array.isArray(pixel)) {
        x = number(pixel[0], canvas[0] / 2);
        y = number(pixel[1], canvas[1] * 0.875);
      } else if (isObject(pixel)) {
        x = number(pixel.x, canvas[0] / 2);
        y = number(pixel.y, canvas[1] * 0.875);
      } else if (Array.isArray(normalised)) {
        x = number(normalised[0], 0.5);
        y = number(normalised[1], 0.875);
      } else if (isObject(normalised)) {
        x = number(normalised.x, 0.5);
        y = number(normalised.y, 0.875);
      } else {
        x = number(firstDefined(value.x, value[0]), 0.5);
        y = number(firstDefined(value.y, value[1]), 0.875);
      }
    } else {
      x = canvas[0] / 2;
      y = canvas[1] * 0.875;
    }
    if (Math.abs(x) <= 1 && Math.abs(y) <= 1) return [x * canvas[0], y * canvas[1]];
    return [x, y];
  }

  function footprint(assetId) {
    var asset = entry(assetId) || {};
    return firstDefined(assetValue(asset, ["footprint", "footprintPolygon", "footprint_polygon"]), null);
  }

  function footprintRadius(assetId, fallback) {
    var value = footprint(assetId);
    if (Array.isArray(value)) {
      if (value.length >= 2 && value.every(function (part) { return Number.isFinite(Number(part)); })) {
        return Math.max.apply(null, value.map(Number)) / 2;
      }
      var points = value.map(function (point) {
        if (Array.isArray(point)) return [number(point[0], 0), number(point[1], 0)];
        if (isObject(point)) return [number(point.x, 0), number(point.y, 0)];
        return [0, 0];
      });
      if (points.length) return Math.max.apply(null, points.map(function (point) { return Math.hypot(point[0], point[1]); }));
    }
    if (isObject(value)) {
      var width = number(firstDefined(value.width, value.widthTiles, value.width_tiles, value.x), NaN);
      var height = number(firstDefined(value.height, value.heightTiles, value.height_tiles, value.y), NaN);
      if (Number.isFinite(width) || Number.isFinite(height)) return Math.max(width || 0, height || 0) / 2;
      if (typeof value.sourceText === "string") value = value.sourceText;
    }
    if (typeof value === "string") {
      var values = value.match(/\d+(?:\.\d+)?/g);
      if (values && values.length) return Math.max.apply(null, values.map(Number)) / 2;
    }
    return number(fallback, 0.35);
  }

  function timing(assetId, record) {
    var asset = entry(assetId) || {};
    var duration = number(firstDefined(record && record.durationMs, assetValue(asset, ["frameDurationMs", "frame_duration_ms", "durationMs", "duration_ms"])), NaN);
    var fps = number(assetValue(asset, ["fps", "framesPerSecond", "frames_per_second"]), NaN);
    if (!Number.isFinite(duration) && Number.isFinite(fps) && fps > 0) duration = 1000 / fps;
    if (!Number.isFinite(duration) || duration <= 0) duration = 100;
    var loopValue = firstDefined(record && record.loop, record && record.loopMode, record && record.loop_mode, assetValue(asset, ["loop", "loopMode", "loop_mode"]));
    var loop = loopValue === true || /^(loop|seamless|cycle)$/i.test(String(loopValue || ""));
    return { frameDurationMs: duration, fps: 1000 / duration, loop: loop };
  }

  function image(url) {
    if (!url) return null;
    if (!imageCache[url]) {
      if (inflightImages >= MAX_INFLIGHT_IMAGES) return null;
      var value = new Image();
      inflightImages += 1;
      value.decoding = "async";
      imageStates[url] = { status: "loading", requests: 1, naturalWidth: 0, naturalHeight: 0 };
      if (typeof value.addEventListener === "function") {
        value.addEventListener("load", function () {
          inflightImages = Math.max(0, inflightImages - 1);
          imageStates[url] = { status: "loaded", requests: imageStates[url].requests, naturalWidth: value.naturalWidth || 0, naturalHeight: value.naturalHeight || 0 };
        });
        value.addEventListener("error", function () {
          inflightImages = Math.max(0, inflightImages - 1);
          imageStates[url] = { status: "error", requests: imageStates[url].requests, naturalWidth: 0, naturalHeight: 0 };
        });
      }
      value.src = url;
      imageCache[url] = value;
    }
    return imageCache[url];
  }

  function preload(assetIds, criteria) {
    (assetIds || []).forEach(function (assetId) {
      var selected = criteria && criteria.frames ? frames(assetId, criteria) : [select(assetId, criteria)];
      selected.filter(Boolean).forEach(function (record) { image(record.url); });
    });
  }

  function markRendered(assetId, surface) {
    if (!entry(assetId)) return false;
    consumerHits[assetId] = (consumerHits[assetId] || 0) + 1;
    if (!renderedSurfaces[assetId]) renderedSurfaces[assetId] = [];
    surface = String(surface || "unspecified");
    registerReachable([assetId], surface);
    if (!renderedSurfaces[assetId].includes(surface)) renderedSurfaces[assetId].push(surface);
    return true;
  }

  function draw(ctx, assetId, options) {
    options = options || {};
    drawAttempts[assetId] = (drawAttempts[assetId] || 0) + 1;
    var sequence = options.animated ? (options.exact ? framesExact(assetId, options) : frames(assetId, options)) : [];
    var record;
    if (sequence.length) {
      var frameTiming = timing(assetId, sequence[0]);
      var elapsed = Math.max(0, number(options.elapsedMs, 0));
      var frameIndex = Math.floor(elapsed / frameTiming.frameDurationMs);
      if (frameTiming.loop) frameIndex %= sequence.length;
      else frameIndex = Math.min(sequence.length - 1, frameIndex);
      record = sequence[frameIndex];
    } else {
      record = options.exact ? selectExact(assetId, options) : select(assetId, options);
    }
    if (!record) return false;
    var sprite = image(record.url);
    if (!sprite || !sprite.complete || !sprite.naturalWidth) return false;
    var canvas = canvasSize(assetId, record);
    var pivot = anchor(assetId, record);
    var scale = number(options.scale, 1);
    if (Number.isFinite(options.displayWidth) && options.displayWidth > 0) scale = options.displayWidth / canvas[0];
    if (Number.isFinite(options.displayHeight) && options.displayHeight > 0) scale = options.displayHeight / canvas[1];
    ctx.save();
    if (Number.isFinite(options.alpha)) ctx.globalAlpha *= options.alpha;
    if (options.composite) ctx.globalCompositeOperation = options.composite;
    ctx.drawImage(sprite, options.x - pivot[0] * scale, options.y - pivot[1] * scale, canvas[0] * scale, canvas[1] * scale);
    ctx.restore();
    markRendered(assetId, options.surface);
    return true;
  }

  function category(assetId) {
    var asset = entry(assetId) || {};
    return String(firstDefined(asset.category, asset.metadata && asset.metadata.category, ""));
  }

  function consumer(assetId) {
    return CATEGORY_CONSUMERS[category(assetId)] || null;
  }

  function registerReachable(assetIds, surface) {
    (assetIds || []).forEach(function (assetId) {
      if (!entry(assetId)) return;
      if (!reachableAssets[assetId]) reachableAssets[assetId] = [];
      if (surface && !reachableAssets[assetId].includes(surface)) reachableAssets[assetId].push(surface);
    });
  }

  function categoryCoverage() {
    var result = Object.create(null);
    Object.keys(catalogue).forEach(function (assetId) {
      var key = category(assetId) || "Uncategorised";
      if (!result[key]) result[key] = { registered: [], reachable: [], factoryReachable: [], consumerDeclared: [], gameplayReachable: [], rendered: [], gameplayRendered: [] };
      result[key].registered.push(assetId);
      if (reachableAssets[assetId]) {
        result[key].reachable.push(assetId);
        if (reachableAssets[assetId].some(function (surface) { return /-factory$/.test(surface); })) result[key].factoryReachable.push(assetId);
        if (reachableAssets[assetId].some(function (surface) { return /-consumer$/.test(surface); })) result[key].consumerDeclared.push(assetId);
        if (reachableAssets[assetId].some(function (surface) { return !/(?:-factory|-consumer)$/.test(surface); })) result[key].gameplayReachable.push(assetId);
      }
      if (consumerHits[assetId]) {
        result[key].rendered.push(assetId);
        if ((renderedSurfaces[assetId] || []).length) result[key].gameplayRendered.push(assetId);
      }
    });
    Object.keys(result).forEach(function (key) {
      ["registered", "reachable", "factoryReachable", "consumerDeclared", "gameplayReachable", "rendered", "gameplayRendered"].forEach(function (field) { result[key][field].sort(); });
    });
    return result;
  }

  function audit() {
    var ids = Object.keys(catalogue);
    var missingOutputs = ids.filter(function (id) { return outputs(id).length === 0; });
    var missingConsumers = ids.filter(function (id) { return !consumer(id); });
    return {
      catalogueCount: ids.length,
      outputCount: ids.reduce(function (total, id) { return total + outputs(id).length; }, 0),
      missingOutputs: missingOutputs,
      missingConsumers: missingConsumers,
      reachableAssets: Object.keys(reachableAssets).sort(),
      reachableSurfaces: Object.keys(reachableAssets).sort().reduce(function (result, assetId) {
        result[assetId] = reachableAssets[assetId].slice().sort();
        return result;
      }, {}),
      renderedAssets: Object.keys(consumerHits).sort(),
      renderedSurfaces: Object.keys(renderedSurfaces).sort().reduce(function (result, assetId) {
        result[assetId] = renderedSurfaces[assetId].slice().sort();
        return result;
      }, {}),
      categoryCoverage: categoryCoverage(),
      consumerHits: Object.assign({}, consumerHits),
      drawAttempts: Object.assign({}, drawAttempts),
      imageLoadControl: {
        maxInflight: MAX_INFLIGHT_IMAGES,
        inflight: inflightImages,
        requestedUrlCount: Object.keys(imageStates).length
      },
      imageStatus: Object.keys(imageStates).sort().reduce(function (result, url) {
        var state = imageStates[url];
        var imageValue = imageCache[url];
        if (imageValue && imageValue.complete && imageValue.naturalWidth && state.status !== "loaded") {
          state = { status: "loaded", requests: state.requests, naturalWidth: imageValue.naturalWidth, naturalHeight: imageValue.naturalHeight };
        }
        result[url] = Object.assign({}, state);
        return result;
      }, {})
    };
  }

  global.EddyProductionRuntime = Object.freeze({
    registry: registry,
    catalogue: catalogue,
    ids: function () { return Object.keys(catalogue); },
    entry: entry,
    outputs: outputs,
    select: select,
    frames: frames,
    selectExact: selectExact,
    framesExact: framesExact,
    canvasSize: canvasSize,
    anchor: anchor,
    footprint: footprint,
    footprintRadius: footprintRadius,
    timing: timing,
    image: image,
    preload: preload,
    draw: draw,
    markRendered: markRendered,
    category: category,
    consumer: consumer,
    registerReachable: registerReachable,
    categoryCoverage: categoryCoverage,
    audit: audit,
    categoryConsumers: CATEGORY_CONSUMERS
  });
})(window);
