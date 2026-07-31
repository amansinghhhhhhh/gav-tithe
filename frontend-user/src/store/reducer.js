export const initialState = {
    currentStep: 1,
    submitted: false,
    editAllowed: false,
    section1: {
        fullName: "", dob: "", gender: "purush", mobile: "",
        otpSent: false, otpVerified: false, email: "", education: "",
        // ✅ address string → object
        address: { dist: "", taluka: "", village: "", pincode: "" },
    },
    section2: {
        businessName: "", businessType: "", sector: "", sectorOther: "",
        businessStatus: "ideation", employment: "", investment: "",
    },
    section3: {
        hadLoan: "hoy", loanType: "", loanTypeOther: "", repaymentStatus: "",
        cibilScore: "", pastDifficulty: "",
    },
    section4: {
        aadhaar: "", pan: "", bankName: "", accountNo: "",
        docs: { aadhaarFront: null, aadhaarBack: null, pan: null, udyam: null, passport: null },
        ocr: { aadhaarFront: null, pan: null, aadhaarFrontPending: false, panPending: false },
    },
};

function reducer(state, action) {
    switch (action.type) {
        case "UPDATE_SECTION1":
            return { ...state, section1: { ...state.section1, ...action.payload } };
        case "UPDATE_SECTION2":
            return { ...state, section2: { ...state.section2, ...action.payload } };
        case "UPDATE_SECTION3":
            return { ...state, section3: { ...state.section3, ...action.payload } };
        case "UPDATE_SECTION4":
            return { ...state, section4: { ...state.section4, ...action.payload } };
        case "UPDATE_DOC":
            return {
                ...state,
                section4: {
                    ...state.section4,
                    docs: { ...state.section4.docs, [action.key]: action.file },
                },
            };
        case "UPDATE_OCR":
            return {
                ...state,
                section4: {
                    ...state.section4,
                    ocr: { ...state.section4.ocr, ...action.payload },
                },
            };
        case "SET_STEP":
            return { ...state, currentStep: action.step };
        case "SUBMIT":
            return { ...state, submitted: true };
        case "SET_EDIT_ALLOWED":
            return { ...state, editAllowed: action.value };
        default:
            return state;
    }
}

export default reducer;