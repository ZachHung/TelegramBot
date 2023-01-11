import ChatService from "./services.js";
import { Router } from "express";
const router = Router();
const route = (app) => {
  app.use(
    "/telegram/",
    router.post("", (req, res) => {
      ChatService.sendMessage(req, res);
    })
  );

  app.use(
    "/test/",
    router.get("", (req, res) => {
      ChatService.createNotionPage(req, res);
    })
  );
};

export default route;
