"use client";
import { useActionState } from "react";

const MealsFormSubmit = () => {
    const { pending } = useActionState();
    return (
        <button disabled={pending}>
            {pending ? "Submitting" : "Share Meal"}
        </button>
    );
};

export default MealsFormSubmit;
