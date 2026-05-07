import { store } from "@redux/Store";
import { Alert, Linking } from "react-native";
import Toast from "react-native-toast-message";

const getHeaders = (options: RequestInit = {}) => {
    const state = store.getState();

    return {
        "Content-Type": "application/json",
        "app": state.States.dbName ?? '',
        "br": state.States.branchId ?? '',
        ...(options.headers || {}),
    }
};

export const makeAPIRequestWithErrorHandling = async (
    url: string,
    body: any,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    headers: RequestInit = {},
    showToast: boolean = true
) => {
    try {
        const fetchOptions: RequestInit = {
            method,
            ...headers,
            headers: getHeaders(headers)
        };

        if (body && (method === "POST" || method === "PUT")) {
            fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url, fetchOptions);
        const data = await response.json();

        if (response.ok) {
            return { error: false, statusCode: response.status, data };
        } else {
            if (showToast) Toast.show({ type: 'error', text1: data?.message || "API Error" });
            return { error: true, statusCode: response.status, message: data?.message };
        }
    } catch (error: any) {
        if (showToast) Toast.show({ type: 'error', text1: "Network Request Failed" });
        return { error: true, statusCode: 500, message: error.message };
    }
};

export const makeAPIRequest = async (
    url: string,
    body: any,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    headers: RequestInit = {},
    customErrorMsg?: string,
    showToast: boolean = true,
    signal?: AbortSignal,
    parseJson: boolean = true
) => {
    try {
        const fetchOptions: RequestInit = {
            method,
            signal,
            ...headers,
            headers: getHeaders(headers),
        };
        if (body && (method === "POST" || method === "PUT")) {
            if (body instanceof FormData || typeof body === 'string') {
                fetchOptions.body = body;
            } else {
                fetchOptions.body = JSON.stringify(body);
            }
        }
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
            if (showToast) Toast.show({ type: 'error', text1: customErrorMsg || "Network Error" });
            return null;
        }
        if (parseJson) {
            return await response.json();
        }
        return response;
    } catch (error: any) {
        console.log(error)
        return null;
    }
};

export const openExternalLink = (url: string) => {
    Linking.canOpenURL(url)
        .then((supported) => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert("Error", `Cannot open URL: ${url}`);
            }
        })
        .catch((err) => console.error("An error occurred", err));
};

// export const checkBranchValidity = async (apiBaseUrl: string, branchId: any) => {
//     const url = apiBaseUrl + `isexpired`;
//     const headers: any = { headers: { 'Content-Type': "application/json", br: branchId, src: 'CaptainPad' } };
//     const response = await makeAPIRequestWithErrorHandling(url, null, 'POST', headers, false);
//     if (response.statusCode === 401 || response.statusCode === 412) {
//         Toast.show({ type: 'error', text1: 'License Expired', text2: 'Please get in touch with support for license renewal', visibilityTime: 5000 });
//         return false;
//     }
//     return true;
// };

export const getTablesInfo = async (apiBaseUrl: string, branchId: number) => {
    const url = apiBaseUrl + `tablestatusbybranch?br_id=${branchId}`;
    const response = await makeAPIRequest(url, null, 'GET');
    return response;
};

export const sleep = (milliseconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

