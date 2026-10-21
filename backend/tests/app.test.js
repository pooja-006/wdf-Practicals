// ============================================================
// tests/app.test.js  –  Practical 12: CI/CD with GitHub Actions
// ============================================================
// Uses Jest + Supertest to test the Express app WITHOUT starting
// a real server or connecting to a real MongoDB.
//
// Strategy:
//   • Mock mongoose.connect so no real DB is needed in CI
//   • Mock the Task model so route logic can be tested in isolation
//   • Tests cover: health check, auth guard, validation, 404
// ============================================================

const request = require('supertest')
const mongoose = require('mongoose')

// ── Mock mongoose so CI never needs a real MongoDB ──────────────────────────
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose')
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue(true),  // fake successful connection
  }
})

// ── Mock the Task model ──────────────────────────────────────────────────────
jest.mock('../models/Task', () => ({
  find:            jest.fn().mockResolvedValue([]),
  findById:        jest.fn().mockResolvedValue(null),
  findByIdAndUpdate: jest.fn().mockResolvedValue(null),
  findByIdAndDelete: jest.fn().mockResolvedValue(null),
  create:          jest.fn().mockResolvedValue({
    _id: 'mock-id-123',
    title: 'Test Task',
    description: '',
    priority: 'medium',
    completed: false,
    createdAt: new Date().toISOString(),
  }),
}))

// ── Mock the User model ──────────────────────────────────────────────────────
jest.mock('../models/User', () => ({
  findOne:   jest.fn().mockResolvedValue(null),
  findById:  jest.fn().mockResolvedValue(null),
  create:    jest.fn(),
}))

// Load the app AFTER mocks are in place
const app = require('../server_p10')

// ── Test Suite ───────────────────────────────────────────────────────────────

describe('Practical 12 – CI/CD API Tests', () => {

  // ── 1. Health endpoint ─────────────────────────────────────
  describe('GET /health', () => {
    test('returns 200 and status ok', async () => {
      const res = await request(app).get('/health')
      expect(res.statusCode).toBe(200)          // ← assert HTTP status
      expect(res.body.status).toBe('ok')        // ← assert body shape
    })
  })

  // ── 2. Auth guard ──────────────────────────────────────────
  describe('GET /tasks (unauthenticated)', () => {
    test('returns 401 when no token is provided', async () => {
      const res = await request(app).get('/tasks')
      expect(res.statusCode).toBe(401)
    })

    test('returns 401 when Authorization header is malformed', async () => {
      const res = await request(app)
        .get('/tasks')
        .set('Authorization', 'InvalidHeader')
      expect(res.statusCode).toBe(401)
    })
  })

  // ── 3. Input validation ────────────────────────────────────
  describe('POST /tasks (validation)', () => {
    test('returns 401 without a token (auth checked first)', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: '' })
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toBe(401)
    })
  })

  // ── 4. 404 handler ─────────────────────────────────────────
  describe('Unknown routes', () => {
    test('GET /nonexistent returns 404', async () => {
      const res = await request(app).get('/nonexistent-route')
      expect(res.statusCode).toBe(404)
      expect(res.body.message).toBe('Route not found.')
    })
  })

  // ── 5. Content-Type guard ──────────────────────────────────
  describe('POST without application/json', () => {
    test('returns 415 when Content-Type is not application/json', async () => {
      const res = await request(app)
        .post('/login')
        .send('email=test&password=test')
        .set('Content-Type', 'text/plain')
      expect(res.statusCode).toBe(415)
    })
  })

})

// Cleanup: close any open handles after all tests.
// Optional chaining guards against mocked mongoose where .connection is undefined.
afterAll(async () => {
  await mongoose.connection?.close().catch(() => {})
})
