export interface Address {
    name: string;
    email: string;
}

export interface ZohoPayOptions {
    amount: string;
    currency_code: string;
    payments_session_id: string;
    currency_symbol: string;
    business: string;
    description: string;
    address: Address;
    logo?: string;
}

declare global {
    interface Window {
        ZPayments: any;
    }
}

export function loadZohoScript(src: string = 'https://static.zohocdn.com/zpay/zpay-js/v1/zpayments.js'): Promise<boolean> {
    return new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
}
