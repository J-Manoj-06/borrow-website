/**
 * Unit Test Suite: Auth Service & Role-Based Access Control (RBAC)
 */

import assert from 'node:assert';
import { test, describe } from 'node:test';
import { DEFAULT_ROLE_PERMISSIONS, SYSTEM_ROLES, PERMISSION_MODULES } from '../models/rbacModel.js';

describe('Auth & RBAC Role Permission Resolution Tests', () => {
  test('Super Admin should possess all administrative permissions', () => {
    const superAdminPerms = DEFAULT_ROLE_PERMISSIONS[SYSTEM_ROLES.SUPER_ADMIN];
    const adminPerms = superAdminPerms[PERMISSION_MODULES.ADMINS];
    assert.strictEqual(adminPerms.includes('create'), true);
    assert.strictEqual(adminPerms.includes('delete'), true);
  });

  test('Library Admin should possess catalog and report permissions but not admin creation', () => {
    const libAdminPerms = DEFAULT_ROLE_PERMISSIONS[SYSTEM_ROLES.LIBRARY_ADMIN];
    const bookPerms = libAdminPerms[PERMISSION_MODULES.BOOKS];
    const adminPerms = libAdminPerms[PERMISSION_MODULES.ADMINS];
    assert.strictEqual(bookPerms.includes('create'), true);
    assert.strictEqual(adminPerms.includes('create'), false);
  });

  test('Standard Librarian should possess circulation rights but restricted admin rights', () => {
    const librarianPerms = DEFAULT_ROLE_PERMISSIONS[SYSTEM_ROLES.LIBRARIAN];
    const returnPerms = librarianPerms[PERMISSION_MODULES.RETURNS];
    const adminPerms = librarianPerms[PERMISSION_MODULES.ADMINS];
    assert.strictEqual(returnPerms.includes('create'), true);
    assert.strictEqual(adminPerms.length, 0);
  });
});
