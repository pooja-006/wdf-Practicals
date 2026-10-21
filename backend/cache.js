// cache.js  –  Practical 9: In-Memory Caching (node-cache)
// A single shared cache instance used across the application.

const NodeCache = require('node-cache')

// stdTTL: default time-to-live in seconds for every cached key
// checkperiod: how often (seconds) node-cache scans for expired keys
const cache = new NodeCache({ stdTTL: 60, checkperiod: 10 })

// ── Hit / Miss Counters ──────────────────────────────────────────────────────
let stats = { hits: 0, misses: 0 }

/**
 * Wrap cache.get() so every call increments the relevant counter.
 * Usage: const value = cacheGet('key')
 */
function cacheGet(key) {
  const value = cache.get(key)
  if (value !== undefined) {
    stats.hits++
  } else {
    stats.misses++
  }
  return value
}

/**
 * Thin wrapper around cache.set() – kept for symmetry.
 * Usage: cacheSet('key', data)          // uses default TTL (60 s)
 *        cacheSet('key', data, 120)     // custom TTL in seconds
 */
function cacheSet(key, value, ttl) {
  if (ttl !== undefined) {
    cache.set(key, value, ttl)
  } else {
    cache.set(key, value)
  }
}

/** Delete one or more keys from the cache. */
function cacheDel(...keys) {
  keys.forEach((k) => cache.del(k))
}

/** Return the current hit/miss counters (used by the debug endpoint). */
function getStats() {
  return {
    hits: stats.hits,
    misses: stats.misses,
    total: stats.hits + stats.misses,
    hitRate:
      stats.hits + stats.misses === 0
        ? '0%'
        : `${((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1)}%`,
    cachedKeys: cache.keys(),
  }
}

/** Reset counters (useful for testing). */
function resetStats() {
  stats = { hits: 0, misses: 0 }
}

module.exports = { cache, cacheGet, cacheSet, cacheDel, getStats, resetStats }
