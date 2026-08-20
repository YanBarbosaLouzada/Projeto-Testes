import { jest } from '@jest/globals';

jest.unstable_mockModule('../models/user.js', () => ({
    User: { findOne: jest.fn() }
}));

jest.unstable_mockModule("bcrypt", () => ({
    default: { compare: jest.fn(), hash: jest.fn() }
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
    default: { sign: jest.fn(), verify: jest.fn() }
}));

const { User } = await import('../models/user.js');
const bcrypt = await import("bcrypt");
const jwt = await import("jsonwebtoken");
const UserController = (await import('./UserController.js')).default;

function criaRespostaMock(){
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}