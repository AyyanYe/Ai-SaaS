"use client";

import { useEffect, useState } from "react";

import { ProModel } from "@/components/pro-model";

export const ModelProvider = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <ProModel />
        </>
    )
}