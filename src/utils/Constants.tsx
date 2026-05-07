import { useAppSelector } from "@redux/Hooks";
import { selectdbName, selectIpAddress } from "@redux/States";
import { Dimensions } from "react-native";

export const BASE_URL = 'nebula-services-1.6/'

export const useEnvironment = () => {
    const ip = useAppSelector(selectIpAddress);
    const dbName = useAppSelector(selectdbName)?.toLowerCase();
    const isDomainName = /\.(com|in|net|app|dev|org)$/i.test(ip || "");
    const protocol = isDomainName ? "https" : "http";
    const port = isDomainName ? "3000" : "8080";
    const apiBaseUrl = `${protocol}://${ip}:${port}/${BASE_URL}${dbName}/`;
    return { apiBaseUrl, isDomainName };
};

export const INDIAN_CURRANCY_SYMBOL = '₹';
export const TABLE_REFRESH_INTERVAL = 10000;

const { width, height } = Dimensions.get('window');
export const isTablet = Math.min(width, height) >= 600;

export const NETWORK_ERROR = "Please check your network or internet connection";
export const ACCESS_DENIED = 'Access Denied';
export const MAX_DEVICE_LIMIT = 'Maximum device limit reached for Captain module. Contact admin.';
export const NO_MODULE_ACCESS = 'Your account does not have permission to access any modules.'
export const INVALID_STAFF = "Invalid staff credentials";

export const OTA_VERSION = 24;


export const GREET_TABLE_STATUS_COLOR = {
    bp: '#F9F7A9',
    f: '#fff',
    ot: 'lightgray'
};

export const GREET_TABLE_BORDER_COLOR = {
    bp: '#c4c165',
    f: 'lightgray',
    ot: 'gray'
};

export const GREET_TABLE_STATUS_KEYS: any = {
    f: "Free Tables",
    bp: "Bill Printed Tables",
    ot: "Reserved Tables"
};

export const GREET_KEY_TO_STATE: any = {
    f: 3,
    bp: 1,
    ot: 2
};