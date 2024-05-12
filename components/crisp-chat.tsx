"use client";

import { Crisp } from "crisp-sdk-web";
import { useEffect } from "react";

export const CrispChat = () => {
	useEffect(() => {
		Crisp.configure("343d7f0e-3450-4f38-b17f-066ab3e7c371");
	}, []);

	return null;
};
