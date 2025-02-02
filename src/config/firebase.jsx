import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBasdfXFUjlO0fTjdTBPUw5F0zgrv5VKq8",
    authDomain: "spinventory-25db0.firebaseapp.com",
    projectId: "spinventory-25db0",
    storageBucket: "spinventory-25db0.firebasestorage.app",
    messagingSenderId: "220664639214",
    appId: "1:220664639214:web:0f63dd51ad99a69d7e8dff",
    measurementId: "G-Z92GK1CVDX",
    databaseURL: "https://spinventory-25db0-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export const auth = getAuth(app);
export { database };
export default app;
