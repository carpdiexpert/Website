// Run once after creating admin@carpdiexpert.com in Firebase Authentication:
// ADMIN_UID=<Firebase Auth UID> node scripts/bootstrap-admin.mjs
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const uid=process.env.ADMIN_UID;
if(!raw||!uid){console.error("Set FIREBASE_SERVICE_ACCOUNT_JSON and ADMIN_UID first.");process.exit(1)}
const account=JSON.parse(raw);initializeApp({credential:cert(account),projectId:account.project_id});
const auth=getAuth();const user=await auth.getUser(uid);
if(user.email?.toLowerCase()!=="admin@carpdiexpert.com"){throw new Error("ADMIN_UID must belong to admin@carpdiexpert.com")}
await auth.setCustomUserClaims(uid,{role:"admin",status:"active"});
await getFirestore().collection("admin").doc(uid).set({uid,role:"admin",status:"active",name:"Admin",mobile:"xxxxx",email:"admin@carpdiexpert.com",createdAt:new Date()});
console.log(`Admin document created at admin/${uid}`);
