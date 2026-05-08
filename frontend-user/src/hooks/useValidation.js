import { useState } from "react";

// rules: { fieldName: (value, allData) => "error message" | null }
function useValidation(rules) {
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Validate single field (onBlur)
    const validateField = (name, value, allData = {}) => {
        const rule = rules[name];
        if (!rule) return;
        const error = rule(value, allData);
        setErrors((prev) => ({ ...prev, [name]: error }));
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    // Validate all fields (on Next/Submit click)
    const validateAll = (data) => {
        const newErrors = {};
        let isValid = true;
        const allTouched = {};

        Object.keys(rules).forEach((name) => {
            const error = rules[name](data[name], data);
            newErrors[name] = error;
            allTouched[name] = true;
            if (error) isValid = false;
        });

        setErrors(newErrors);
        setTouched(allTouched);
        return isValid;
    };

    // Clear error on change
    const clearError = (name) => {
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    return { errors, touched, validateField, validateAll, clearError };
}

export default useValidation;