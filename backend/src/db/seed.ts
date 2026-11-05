import { defineScript } from "rwsdk/worker";

export default defineScript(async () => {
  console.log("Seed kommer etterpå");
  return Response.json({ success: true });
});
