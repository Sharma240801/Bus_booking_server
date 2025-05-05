import AdminJS from "adminjs";
import AdminJSEXpress from "@adminjs/express";
import * as AdminJSMongoose from "@adminjs/mongoose";
import {COOKIE_PASSWORD} from "./config.js";
import { dark, light, noSidebar} from "@adminjs/themes";
import dotenv from "dotenv";
import session from "express-session";
import ConnectMongoDBSession from "connect-mongodb-session";
dotenv.config();
import User from "../models/user.js";
import Bus from "../models/bus.js";
import Ticket from "../models/ticket.js"

AdminJS.registerAdapter(AdminJSMongoose);


const DEAFAULT_ADMIN = {
    email: process.env.ADMIN_LOGIN_EMAIL,
    password: process.env.ADMIN_LOGIN_PASSWORD,
};

const authenticate = async (email, password) => {
    if(email === DEAFAULT_ADMIN.email && password === DEAFAULT_ADMIN.password){
        return Promise.resolve(DEAFAULT_ADMIN);
    }
    return null;
}


export const buildAdminJS = async (app) => {
    const admin = new AdminJS({
        resources: [{resource: User}, {resource: Bus}, {resource: Ticket}]
        ,branding: {
       companyName: "Bus Booking",
       withMadeWithLove: false
        },
        deafult: dark.id,
        availableThemes: [dark, light, noSidebar],
        rootPath: "/admin"
    })

    const MongoDBStore = ConnectMongoDBSession(session);
    const sessionStore = new MongoDBStore({
        uri: process.env.MONGO_URI,
        collection: "sessions"
    });

    const adminRouter = AdminJSEXpress.buildAuthenticatedRouter(admin, {
        authenticate,
        cookieName: "adminjs",
        cookiePassword: COOKIE_PASSWORD
    },
null,
{
    store: sessionStore,
    resave: true,
    saveUninitialized: true,
    secret: COOKIE_PASSWORD,
    cookie: {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
    },
    name: "adminjs"
}
);

 app.use(admin.options.rootPath, adminRouter);
}

