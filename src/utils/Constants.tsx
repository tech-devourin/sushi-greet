import { Dimensions } from "react-native";
// import { selectdbName, selectIpAddress } from "../redux/States";
import { GlobalColors } from "@styles/GlobalStyleConfigs";

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

export enum ORDER_STATUS {
    ORDER_ACCEPTED = 'ORDER_ACCEPTED',
    ORDER_PRINT = 'PRINT_BILL',
    ORDER_PLACED = 'ORDER_PLACED',
    ORDER_IN_PROCESS = 'ORDER_IN_PROCESS'
};

export const ACCEPTED_ORDER_LIST = ['ORDER_ACCEPTED', 'ORDER_PLACED', 'ORDER_IN_PROCESS'];

export const INVALID_STAFF = "Invalid staff credentials";

export const OTA_VERSION = 24;

export const IS_CAPTAIN_APP = false;

export const GREET_TABLE_STATUS_COLOR = {
    bp: '#F9F7A9',
    f: '#fff',
    ot: GlobalColors.defaultLight
};

export const GREET_TABLE_BORDER_COLOR = {
    bp: '#c4c165',
    f: 'lightgray',
    ot: GlobalColors.default
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

export const GREET = 'Greet';
export const CAPTAIN = 'Captain';
export const FEEDBACK = 'Feedback';
export const QSR = 'QSR';
export const ORDER_CANCELLED = 'ORDER_CANCELLED';

export const PERMISSIONS_BITS = {
    Serve: 1,
    Greet: 2,
    Echo: 4,
    KDS: 8,
};

export const REPORTS_ALL_COLUMNS: any = {
    'Reservations': {
        'Date': 'reserveDate',
        'Time': 'reserveTime',
        'Guest Name': 'fullName',
        'Guest Number': 'phoneNo',
        'Table': 'tableName',
        'Pax': 'partySize',
        'Status': 'currentStatus',
        'Source': 'reservationSource',
        'Adv Payment': 'advancePayment',
        'Bal Amt': 'balanceAmount',
        'Package Amt': 'packageAmount',
        'Kids': 'noOfKids',
        'Preference': 'preference',
        'Remark': 'remark',
        'Staff': 'staffName',
        'Gender': 'gender',
        'Walked In': 'isWalk'
    },
    'Guest': {
        'Name': 'fullName',
        'Number': 'username',
        'Date of Birth': 'dateOfBirth',
        'Anniversary Date': 'anniversary',
        'Visits': 'noOfVisits',
        'Last Visited': 'lastOrderTime',
        'Orders': 'noOfOrders',
        'Revenue': 'revenue',
        'Preference': 'preference',
        'Email': 'email',
    }
};

export const REPORT_FOOTER_KEYS: any = {
    'Reservations': {
        'Date': '',
        'Time': '',
        'Guest Name': '',
        'Guest Number': '',
        'Table': '',
        'Pax': 'totalPax',
        'Status': '',
        'Source': '',
        'Adv Payment': 'totalAdvancePayment',
        'Bal Amt': 'totalBalanceAmount',
        'Package Amt': 'totalPackageAmount',
        'Kids': 'totalNoOfKids',
        'Preference': '',
        'Remark': '',
        'Staff': '',
        'Gender': '',
        'Walked In': ''
    },
    'Guest': {
        'Name': '',
        'Number': '',
        'Date of Birth': '',
        'Anniversary Date': '',
        'Visits': '',
        'Last Visited': '',
        'Preference': '',
        'Orders': '',
        'Revenue': '',
        'Email': '',
    }
};

export const RESTRICTED_COLUMNS: Record<string, string[]> = {
    Guest: ['Orders', 'Revenue'],
};

export const FEEDBACK_ICON: { [key: string]: string } = {
    'Excellent': 'emoji-happy',
    'Good': 'emoji-neutral',
    'Average': 'emoji-sad'
};

export const FEEDBACK_COLOR: { [key: string]: string } = {
    'Excellent': GlobalColors.success,
    'Good': GlobalColors.default,
    'Average': GlobalColors.error
};

export const PAYMENT_IMAGES: any = {
    Cash: require('@assets/icons/payments/Cash.png'),
    Card: require('@assets/icons/payments/Card.png'),
    Credit: require('@assets/icons/payments/Credit.png'),
    "Dial-a-Meal": require('@assets/icons/payments/Dial-a-Meal.png'),
    "Dine-out": require('@assets/icons/payments/Dine-out.png'),
    Loyalty: require('@assets/icons/payments/Loyalty.png'),
    Scootsy: require('@assets/icons/payments/Scootsy.png'),
    Swiggy: require('@assets/icons/payments/Swiggy.png'),
    Wallet: require('@assets/icons/payments/Wallet.png'),
    Zomato: require('@assets/icons/payments/Zomato.png'),
    PayTM: require('@assets/icons/payments/PayTM.png'),
    'Non-Chargable': require('@assets/icons/payments/Non-Chargable.png'),
};

export const TEST_PRINT = [27, 64, 28, 46, 27, 77, 0, 10, 13, 27, 116, 0, 84, 69, 83, 84, 95, 80, 82, 73, 78, 84, 10, 13, 10, 13, 10, 13, 10, 13]

export const PRINTER_STATUS_TIMEOUT = 10000;

export const LIVE_PRINTER_STATUS_INTERVAL = 10000;

export const ORDER_NOTIFICATION = true;