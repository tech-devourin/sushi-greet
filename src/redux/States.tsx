import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./Store";

export interface States {
    isLoading?: boolean;
    dbName?: string;
    ipAddress?: string;
    branchId?: number;
    userData?: { [key: string]: any };

}

const initialState: States = {
    isLoading: false,
    dbName: '',
    ipAddress: '',
    branchId: 0,
    userData: {}
}

const Slice = createSlice({
    name: 'States',
    initialState,
    reducers: {
        setIsLoading: (state, action: PayloadAction<States>) => {
            state.isLoading = action.payload.isLoading;
        },
        setdbName: (state, action: PayloadAction<States>) => {
            state.dbName = action.payload.dbName;
        },
        setipAddress: (state, action: PayloadAction<States>) => {
            state.ipAddress = action.payload.ipAddress;
        },
        setBranchId: (state, action: PayloadAction<States>) => {
            state.branchId = action.payload.branchId;
        },
        setUserData: (state, action: PayloadAction<States>) => {
            state.userData = action.payload.userData;
        },
    }
});

export const { setIsLoading, setBranchId, setdbName, setipAddress, setUserData } = Slice.actions;
export const selectIsLoading = (state: RootState) => state.States.isLoading;
export const selectdbName = (state: RootState) => state.States.dbName;
export const selectIpAddress = (state: RootState) => state.States.ipAddress;
export const selectBranchId = (state: RootState) => state.States.branchId;
export const selectUserData = (state: RootState) => state.States.userData;


export default Slice.reducer;