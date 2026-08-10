import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  appendGatewayToken,
  ExamApiError,
  getAttempt,
  isAttemptNotFoundError,
  listPublishedPapers,
} from './hskExamService';

const localValues = new Map<string, string>();

afterEach(() => {
  localValues.clear();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function stubLocalStorage() {
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => localValues.get(key) || null,
    setItem: (key: string, value: string) => localValues.set(key, value),
  });
}

describe('appendGatewayToken', () => {
  it('appends token as query param when configured', () => {
    vi.stubEnv('VITE_CLINGO_GATEWAY_TOKEN', 'login_test');
    expect(appendGatewayToken('http://localhost:8082/api/papers')).toBe(
      'http://localhost:8082/api/papers?token=login_test',
    );
    expect(appendGatewayToken('http://localhost:8082/api/papers?level=HSK1')).toBe(
      'http://localhost:8082/api/papers?level=HSK1&token=login_test',
    );
  });

  it('leaves url unchanged when token is unset', () => {
    vi.stubEnv('VITE_CLINGO_GATEWAY_TOKEN', '');
    expect(appendGatewayToken('http://localhost:8082/api/papers')).toBe(
      'http://localhost:8082/api/papers',
    );
  });
});

describe('hskExamService errors', () => {
  it('loads the complete paper catalog with one unfiltered request', async () => {
    stubLocalStorage();
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      code: 0,
      msg: 'ok',
      data: [],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);

    await listPublishedPapers();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:8082/api/papers');
  });

  it('appends gateway token to exam requests when configured', async () => {
    vi.stubEnv('VITE_CLINGO_GATEWAY_TOKEN', 'login_test');
    stubLocalStorage();
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      code: 0,
      msg: 'ok',
      data: [],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);

    await listPublishedPapers(1);

    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://localhost:8082/api/papers?level=HSK1&token=login_test',
    );
  });

  it('recognizes the backend HTTP 200 envelope business code 404 as missing', async () => {
    stubLocalStorage();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      code: 404,
      msg: '作答不存在',
      data: null,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })));

    const error = await getAttempt('missing').catch((failure) => failure);

    expect(error).toBeInstanceOf(ExamApiError);
    expect(error).toMatchObject({ status: 200, code: 404 });
    expect(isAttemptNotFoundError(error)).toBe(true);
  });

  it('also preserves a transport HTTP 404 as missing', async () => {
    stubLocalStorage();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not found', {
      status: 404,
    })));

    const error = await getAttempt('missing').catch((failure) => failure);

    expect(error).toMatchObject({ status: 404 });
    expect(isAttemptNotFoundError(error)).toBe(true);
  });

  it('does not classify network and server failures as missing attempts', async () => {
    stubLocalStorage();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    const networkError = await getAttempt('attempt-1').catch((failure) => failure);
    expect(isAttemptNotFoundError(networkError)).toBe(false);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      code: 500,
      msg: 'INTERNAL_SERVER_ERROR',
      data: null,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })));
    const serverError = await getAttempt('attempt-1').catch((failure) => failure);
    expect(serverError).toMatchObject({ status: 500 });
    expect(isAttemptNotFoundError(serverError)).toBe(false);
  });
});
