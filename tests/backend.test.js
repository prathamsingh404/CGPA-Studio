// Automated Integration Test Suite for CGPA Studio Backend
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import app from '../server.js';
import User from '../backend/models/user.model.js';
import AcademicPlan from '../backend/models/academicPlan.model.js';

let mongod;
let server;
let baseUrl;
let authCookie = null;
let createdPlanId = null;

// Test Setup: Start In-Memory MongoDB and Express Server
test.before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key_1234567890';

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

// Teardown: Stop Server and In-Memory MongoDB
test.after(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

// Helper for HTTP requests
async function makeRequest(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authCookie ? { Cookie: authCookie } : {}),
    ...options.headers
  };

  const res = await fetch(url, {
    ...options,
    headers
  });

  const setCookieHeader = res.headers.get('set-cookie');
  if (setCookieHeader && setCookieHeader.includes('token=')) {
    authCookie = setCookieHeader.split(';')[0];
  }

  const json = await res.json().catch(() => ({}));
  return { status: res.status, headers: res.headers, data: json };
}

// 1. Health Endpoint Test
test('GET /api/health should return 200 with database status', async () => {
  const res = await makeRequest('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.equal(res.data.message, 'CGPA Studio API is running');
  assert.equal(res.data.database, 'connected');
});

// 2. Authentication Tests
test('POST /api/auth/register should create student and set cookie', async () => {
  const payload = {
    name: 'Pratham Singh',
    email: 'pratham.test@bmu.edu.in',
    password: 'securePassword123'
  };

  const res = await makeRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);
  assert.equal(res.data.data.email, 'pratham.test@bmu.edu.in');
  assert.equal(res.data.data.password, undefined); // Password hash must never be returned!
  assert.ok(authCookie, 'Authentication cookie should be set');
});

test('POST /api/auth/register should reject duplicate email with 409 Conflict', async () => {
  const payload = {
    name: 'Pratham Duplicate',
    email: 'pratham.test@bmu.edu.in',
    password: 'anotherPassword123'
  };

  const res = await makeRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  assert.equal(res.status, 409);
  assert.equal(res.data.success, false);
});

test('POST /api/auth/login should authenticate user and issue cookie', async () => {
  const payload = {
    email: 'pratham.test@bmu.edu.in',
    password: 'securePassword123'
  };

  const res = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.equal(res.data.data.name, 'Pratham Singh');
  assert.ok(authCookie);
});

test('POST /api/auth/login should reject invalid credentials with 401', async () => {
  const payload = {
    email: 'pratham.test@bmu.edu.in',
    password: 'wrongPassword'
  };

  const res = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  assert.equal(res.status, 401);
  assert.equal(res.data.success, false);
});

test('GET /api/auth/me should return authenticated user profile', async () => {
  const res = await makeRequest('/api/auth/me');
  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.equal(res.data.data.email, 'pratham.test@bmu.edu.in');
});

// 3. Academic Plans CRUD Tests
test('POST /api/plans should create an academic plan in MongoDB', async () => {
  const planPayload = {
    name: 'Semester 3 Target Plan',
    currentCGPA: 7.82,
    completedCredits: 42,
    targetCGPA: 8.50,
    semester: 3,
    programId: 'cse',
    relativePreset: 'moderate',
    mean: 62,
    sd: 14,
    courses: [
      {
        code: 'CSE201',
        name: 'Data Structures and Algorithms',
        credits: 4,
        type: 'Core Computing',
        internalMarks: 36,
        maxInternal: 50,
        maxEndSem: 50,
        endSemMarks: 38
      },
      {
        code: 'CSE202',
        name: 'Discrete Mathematical Structures',
        credits: 4,
        type: 'Core Science',
        internalMarks: 35,
        maxInternal: 50,
        maxEndSem: 50,
        endSemMarks: 36
      }
    ]
  };

  const res = await makeRequest('/api/plans', {
    method: 'POST',
    body: JSON.stringify(planPayload)
  });

  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);
  assert.ok(res.data.data._id);
  assert.equal(res.data.data.name, 'Semester 3 Target Plan');
  assert.equal(res.data.data.courses.length, 2);

  createdPlanId = res.data.data._id;
});

test('GET /api/plans should retrieve all plans for logged-in user', async () => {
  const res = await makeRequest('/api/plans');
  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.equal(res.data.count, 1);
  assert.equal(res.data.data[0]._id, createdPlanId);
});

test('GET /api/plans/:id should retrieve a single plan by ObjectId', async () => {
  const res = await makeRequest(`/api/plans/${createdPlanId}`);
  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.equal(res.data.data.name, 'Semester 3 Target Plan');
});

test('PATCH /api/plans/:id should update permitted fields', async () => {
  const updatePayload = {
    name: 'Semester 3 Target Plan (Revised 8.75)',
    targetCGPA: 8.75
  };

  const res = await makeRequest(`/api/plans/${createdPlanId}`, {
    method: 'PATCH',
    body: JSON.stringify(updatePayload)
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.equal(res.data.data.name, 'Semester 3 Target Plan (Revised 8.75)');
  assert.equal(res.data.data.targetCGPA, 8.75);
});

test('DELETE /api/plans/:id should delete the plan from MongoDB', async () => {
  const res = await makeRequest(`/api/plans/${createdPlanId}`, {
    method: 'DELETE'
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
});

test('GET /api/plans/:id should return 404 for deleted plan', async () => {
  const res = await makeRequest(`/api/plans/${createdPlanId}`);
  assert.equal(res.status, 404);
  assert.equal(res.data.success, false);
});

test('GET /api/plans/invalid-id should return 400 for bad ObjectId format', async () => {
  const res = await makeRequest('/api/plans/123-not-an-id');
  assert.equal(res.status, 400);
  assert.equal(res.data.success, false);
});

test('Protected routes should reject unauthenticated requests with 401', async () => {
  // Clear cookie
  const savedCookie = authCookie;
  authCookie = null;

  const res = await makeRequest('/api/plans');
  assert.equal(res.status, 401);
  assert.equal(res.data.success, false);

  // Restore cookie
  authCookie = savedCookie;
});

test('POST /api/auth/logout should clear session', async () => {
  const res = await makeRequest('/api/auth/logout', {
    method: 'POST'
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
});

