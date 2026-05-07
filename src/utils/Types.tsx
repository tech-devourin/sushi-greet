export type ModalRefType = {
    open: (activeModal: string, height?: number) => void;
    replace: (activeModal: string, height?: number) => void;
    close: () => void;
};

export type TypeTableStatus = {
    f: number,
    bp: number,
    ot: number
};