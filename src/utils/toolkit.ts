import { configureStore, createSlice } from "@reduxjs/toolkit";
import { userApi } from "./api";

const slice = createSlice({
    name: "user",
    initialState: {
        obj: { name: "", Phone: "", Email: "", Password: "", Role: "" },
        obj1: { Lesson: "", Dec: "", Day: "", Img: "", Video: "", Count: 0, Phone: 0, Id: "" },
        obj2: { Code: "", Dec: "", Day: "", Img: "", Video: "", Count: 0, Id: "" },
        user: [],
        checkPass: false
    },
    reducers: {
        getName: (state, action) => {
            state.obj.name = action.payload;
            localStorage.setItem("name", JSON.stringify(action.payload))
        },
        getPhone: (state, action) => {
            state.obj.Phone = action.payload;
            localStorage.setItem("phone", JSON.stringify(action.payload))
        },
        getEmail: (state, action) => {
            state.obj.Email = action.payload;
            localStorage.setItem("email", JSON.stringify(action.payload))
        },
        getId: (state) => {
            state.obj1.Id = localStorage.getItem("token") || ""
        },
        getId1: (state) => {
            state.obj2.Id = localStorage.getItem("token") || ""
        },
        Lesson: (state, action) => { state.obj1.Lesson = action.payload; },
        Dec: (state, action) => { state.obj1.Dec = action.payload; },
        Day: (state, action) => { state.obj1.Day = action.payload; },
        Img: (state, action) => { state.obj1.Img = action.payload; },
        Video: (state, action) => { state.obj1.Video = action.payload; },
        Count: (state, action) => { state.obj1.Count = action.payload; },
        Code: (state, action) => { state.obj2.Code = action.payload; },
        Dec1: (state, action) => { state.obj2.Dec = action.payload; },
        Day1: (state, action) => { state.obj2.Day = action.payload; },
        Img1: (state, action) => { state.obj2.Img = action.payload; },
        Video1: (state, action) => { state.obj2.Video = action.payload; },
        Count1: (state, action) => { state.obj2.Count = action.payload; },
        getPassword: (state, action) => {
            if (action.payload.length >= 8) {
                state.obj.Password = action.payload;
                state.checkPass = false
            } else {
                state.checkPass = true
            }
        },
        getRole: (state, action) => {
            state.obj.Role = action.payload;
        },
    }
});

export const store = configureStore({
    reducer: {
        user: slice.reducer,
        [userApi.reducerPath]: userApi.reducer,
    },
    middleware: (gMD) =>
        gMD().concat(userApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export const actions = slice.actions;
