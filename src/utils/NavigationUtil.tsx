import {
    CommonActions,
    createNavigationContainerRef,
    DrawerActions,
    StackActions,
} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export async function navigate(routeName: string, params?: any) {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(CommonActions.navigate(routeName, params));
    }
};

export async function resetAndNavigate(routeName: string, params?: any) {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: routeName, params: params }],
            }),
        );
    }
};

export async function goBack(popNumber?: number) {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(popNumber ? StackActions.pop(popNumber) : CommonActions.goBack());
    }
};

export async function push(routeName: string, params?: any) {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(StackActions.push(routeName, params));
    }
};

export async function replace(routeName: string, params?: any) {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(StackActions.replace(routeName, params));
    }
};

export async function openDrawer() {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(DrawerActions.openDrawer());
    }
}

export async function closeDrawer() {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(DrawerActions.closeDrawer());
    }
}

export async function resetAndNavigateToModule(screenName: string) {
    if (navigationRef.isReady()) {
        navigationRef.current?.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{
                    name: 'Dashboard', state: { index: 0, routes: [{ name: screenName }] },
                },
                ],
            })
        );
    }
}
