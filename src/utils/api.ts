import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

type CollectionName = "users" | "courses" | "codes";
type ApiTag = "Users" | "Courses" | "Codes";
type QueryArg = string | void;
type ApiRecord = Record<string, unknown> & { id: string };
type ApiPayload = Record<string, unknown>;
type ApiError = { status: string; message: string };

const collectionTags: Record<CollectionName, ApiTag> = {
    users: "Users",
    courses: "Courses",
    codes: "Codes",
};

const toApiError = (error: unknown): ApiError => ({
    status: "FIREBASE_ERROR",
    message: error instanceof Error ? error.message : "Firebase bilan ishlashda xatolik yuz berdi.",
});

const normalizeValue = (value: unknown): unknown => {
    if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
        return value.toDate().toISOString();
    }

    if (Array.isArray(value)) {
        return value.map(normalizeValue);
    }

    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, normalizeValue(item)])
        );
    }

    return value;
};

const stripClientId = (body: ApiPayload) => {
    const payload = { ...body };
    delete payload.id;
    return payload;
};

const readCollection = async (name: CollectionName) => {
    const snapshot = await getDocs(collection(db, name));
    return snapshot.docs.map((item) => ({
        ...(normalizeValue(item.data()) as ApiPayload),
        id: item.id,
    })) as ApiRecord[];
};

const createDocument = async (name: CollectionName, body: ApiPayload) => {
    const payload = stripClientId(body);
    const docRef = await addDoc(collection(db, name), {
        ...payload,
        createdAt: serverTimestamp(),
    });

    return { ...payload, id: docRef.id } as ApiRecord;
};

const changeDocument = async (name: CollectionName, data: ApiPayload & { id: string }) => {
    const payload = stripClientId(data);
    await updateDoc(doc(db, name, data.id), {
        ...payload,
        updatedAt: serverTimestamp(),
    });

    return { ...payload, id: data.id } as ApiRecord;
};

const removeDocument = async (name: CollectionName, id: string) => {
    await deleteDoc(doc(db, name, id));
    return { id };
};

const providesList = (type: ApiTag) => (result?: ApiRecord[]) =>
    result
        ? [...result.map(({ id }) => ({ type, id } as const)), { type, id: "LIST" } as const]
        : [{ type, id: "LIST" } as const];

const invalidatesList = (name: CollectionName) => [{ type: collectionTags[name], id: "LIST" } as const];

export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: fakeBaseQuery<ApiError>(),
    tagTypes: ["Users", "Courses", "Codes"],
    endpoints: (build) => ({
        getUsers: build.query<ApiRecord[], QueryArg>({
            queryFn: async () => {
                try {
                    return { data: await readCollection("users") };
                } catch (error) {
                    return { error: toApiError(error) };
                }
            },
            providesTags: providesList("Users"),
        }),
        Courses: build.query<ApiRecord[], QueryArg>({
            queryFn: async () => {
                try {
                    return { data: await readCollection("courses") };
                } catch (error) {
                    return { error: toApiError(error) };
                }
            },
            providesTags: providesList("Courses"),
        }),
        Codes: build.query<ApiRecord[], QueryArg>({
            queryFn: async () => {
                try {
                    return { data: await readCollection("codes") };
                } catch (error) {
                    return { error: toApiError(error) };
                }
            },
            providesTags: providesList("Codes"),
        }),
        addUser: build.mutation<ApiRecord, ApiPayload>({
            queryFn: async (body) => {
                try {
                    return { data: await createDocument("users", body) };
                } catch (error) {
                    return { error: toApiError(error) };
                }
            },
            invalidatesTags: invalidatesList("users"),
        }),
        Course: build.mutation<ApiRecord, ApiPayload>({
            queryFn: async (body) => {
                try {
                    return { data: await createDocument("courses", body) };
                } catch (error) {
                    return { error: toApiError(error) };
                }
            },
            invalidatesTags: invalidatesList("courses"),
        }),
        Code: build.mutation<ApiRecord, ApiPayload>({
            queryFn: async (body) => {
                try {
                    return { data: await createDocument("codes", body) };
                } catch (error) {
                    return { error: toApiError(error) };
                }
            },
            invalidatesTags: invalidatesList("codes"),
        }),
        delUser: build.mutation<{ id: string }, string>({
            queryFn: async (id) => {
                try {
                    return { data: await removeDocument("users", id) };
                } catch (error) {
                    return { error: toApiError(error) };
                }
            },
            invalidatesTags: invalidatesList("users"),
        }),
        updateUser: build.mutation<ApiRecord, ApiPayload & { id: string }>({
            queryFn: async (data) => {
                try {
                    return { data: await changeDocument("users", data) };
                } catch (error) {
                    return { error: toApiError(error) };
                }
            },
            invalidatesTags: invalidatesList("users"),
        }),
        delCourse: build.mutation<{ id: string }, string>({
            queryFn: async (id) => {
                try {
                    return { data: await removeDocument("courses", id) };
                } catch (error) {
                    return { error: toApiError(error) };
                }
            },
            invalidatesTags: invalidatesList("courses"),
        }),
        delCode: build.mutation<{ id: string }, string>({
            queryFn: async (id) => {
                try {
                    return { data: await removeDocument("codes", id) };
                } catch (error) {
                    return { error: toApiError(error) };
                }
            },
            invalidatesTags: invalidatesList("codes"),
        }),
    }),
});

export const {
    useGetUsersQuery,
    useAddUserMutation,
    useDelUserMutation,
    useUpdateUserMutation,
    useCodeMutation,
    useCourseMutation,
    useCoursesQuery,
    useCodesQuery,
    useDelCourseMutation,
    useDelCodeMutation,
} = userApi;
