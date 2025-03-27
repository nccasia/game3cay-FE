export default class HttpClient {
    static async get<T = any>(url: string, headers: any = {}): Promise<T> {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        });
        return response.json();
    }

    static async post<T = any>(url: string, body: any, headers: any = {}): Promise<T> {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify(body)
        });
        return response.json();
    }

    static async put<T = any>(url: string, body: any, headers: any = {}): Promise<T> {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify(body)
        });
        return response.json();
    }
}
