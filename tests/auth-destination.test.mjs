import assert from 'node:assert/strict';
import { test } from 'node:test';
import { authDestination } from '../src/features/auth/authDestination.ts';
const origin='http://127.0.0.1:3001';
test('auth destination preserves internal paths, query strings, and fragments',()=>{assert.equal(authDestination('/coding?topic=Arrays#problem',origin),'/coding?topic=Arrays#problem');});
test('auth destination rejects external and malformed redirects and auth loops',()=>{for(const value of [null,undefined,'https://example.com','//example.com','/\\example.com','/auth?mode=login','javascript:alert(1)'])assert.equal(authDestination(value,origin),'/dashboard');});
