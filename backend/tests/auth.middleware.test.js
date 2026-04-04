const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const { authenticate } = require('../dist/middleware/authenticate.js');
const { requireRole } = require('../dist/middleware/authorize.js');

function mockRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(obj) {
      this.body = obj;
      return this;
    },
  };
}

test('authenticate: 401 when no cookie/bearer token', async () => {
  const req = { headers: {}, cookies: {} };
  const res = mockRes();
  let nextCalled = false;
  authenticate(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: 'Unauthorized' });
});

test('authenticate: sets req.user and calls next for valid cookie token', async () => {
  process.env.JWT_SECRET = 'test-secret';
  const token = jwt.sign(
    { sub: 'u1', email: 'a@b.com', role: 'student', assessment_completed: false },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const req = { headers: {}, cookies: { token } };
  const res = mockRes();
  let nextCalled = false;
  authenticate(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.ok(req.user);
  assert.equal(req.user.sub, 'u1');
  assert.equal(req.user.role, 'student');
});

test('authenticate: 401 for invalid token', async () => {
  process.env.JWT_SECRET = 'test-secret';
  const req = { headers: {}, cookies: { token: 'not-a-jwt' } };
  const res = mockRes();
  let nextCalled = false;
  authenticate(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: 'Invalid token' });
});

test('requireRole: 401 when req.user missing', async () => {
  const req = {};
  const res = mockRes();
  let nextCalled = false;
  requireRole('admin')(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: 'Unauthorized' });
});

test('requireRole: 403 when role mismatch', async () => {
  const req = { user: { role: 'student' } };
  const res = mockRes();
  let nextCalled = false;
  requireRole('admin')(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { error: 'Forbidden' });
});

test('requireRole: calls next when role matches', async () => {
  const req = { user: { role: 'admin' } };
  const res = mockRes();
  let nextCalled = false;
  requireRole('admin')(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
});

