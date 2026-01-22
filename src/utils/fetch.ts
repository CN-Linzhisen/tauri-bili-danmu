import { fetch as tauriFetch } from '@tauri-apps/plugin-http';

interface RequestOptions {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, any>;
    params?: Record<string, any>;
    data?: any;
}

export const fetch = async <T = any>(options: RequestOptions): Promise<T> => {
    const { url, method = 'GET', headers = {}, params, data } = options;
    // 构建 URL 并添加查询参数
    let requestUrl = url;
    if (params) {
        const searchParams = new URLSearchParams(params);
        requestUrl = `${url}${url.includes('?') ? '&' : '?'}${searchParams.toString()}`;
    }
    console.log(headers);

    let body: any = undefined;
    if (method != 'GET' && data) {
        if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            const formData = new URLSearchParams();
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, String(value));
            });
            body = formData.toString();
        } else {
            body = data;
        }
    }
    const response = await tauriFetch(requestUrl, {
        method,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Referer': 'https://www.bilibili.com/',
            'Origin': 'https://www.bilibili.com',
            ...headers,
        },
        body
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
};