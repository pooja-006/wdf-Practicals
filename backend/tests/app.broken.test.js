// ============================================================
// tests/app.broken.test.js  –  Practical 12: DELIBERATELY BROKEN
// ============================================================
// PURPOSE: Demonstrate a FAILING pipeline (red X on GitHub).
//
// HOW TO USE:
//   1. Rename this file to app.test.js  (replace the passing one)
//   2. git add, git commit, git push  → pipeline turns RED ❌
//   3. Rename back to app.test.js using the original passing version
//   4. git add, git commit, git push  → pipeline turns GREEN ✅
//
// The broken assertion is on line marked ← WRONG below.
// ============================================================

const request = require('supertest')
const mongoose = require('mongoose')

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose')
  return { ...actual, connect: jest.fn().mockResolvedValue(true) }
})
jest.mock('../models/Task', () => ({
  find: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  findByIdAndUpdate: jest.fn().mockResolvedValue(null),
  findByIdAndDelete: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue({ _id: 'mock-id', title: 'Test', priority: 'medium', completed: false }),
}))
jest.mock('../models/User', () => ({
  findOne: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  create: jest.fn(),
}))

const app = require('../server_p10')

describe('BROKEN TEST – Practical 12 Demo', () => {
  test('GET /health returns 200 [DELIBERATELY BROKEN: expects 500]', async () => {
    const res = await request(app).get('/health')
    expect(res.statusCode).toBe(500)   // ← WRONG: actual is 200 → test FAILS
  })

  test('GET /nonexistent returns 404', async () => {
    const res = await request(app).get('/nonexistent-route')
    expect(res.statusCode).toBe(404)   // ← Correct, this one passes
  })
})

afterAll(async () => {
  await mongoose.connection?.close().catch(() => {})
})
