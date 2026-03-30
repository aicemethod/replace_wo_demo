import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

type FieldActiveContextValue = {
    activeId: string | null;
    activate: (id: string) => void;
};

const FieldActiveContext = createContext<FieldActiveContextValue | null>(null);

/** フォーム内で「最後に触れた項目」の枠線を次の項目を触るまで維持する */
export function FieldActiveProvider({ children }: { children: React.ReactNode }) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const activate = useCallback((id: string) => setActiveId(id), []);
    const value = useMemo(() => ({ activeId, activate }), [activeId, activate]);
    return (
        <FieldActiveContext.Provider value={value}>{children}</FieldActiveContext.Provider>
    );
}

export function useFieldActive(): FieldActiveContextValue {
    const ctx = useContext(FieldActiveContext);
    if (!ctx) {
        return { activeId: null, activate: () => {} };
    }
    return ctx;
}
