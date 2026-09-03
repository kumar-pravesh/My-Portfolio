import db from "../db/index.js";
import { generateReferenceId } from "../db/referenceId.js";

/**
 * Middleware factory — attaches an audit log entry after the response is sent.
 * Usage: router.post('/', authenticate, auditLog('projects', 'CREATE'), handler)
 */
export function auditLog(module, action) {
  return async (req, res, next) => {
    // Intercept json to capture the response body
    const originalJson = res.json.bind(res);
    let responseBody;
    res.json = (body) => {
      responseBody = body;
      return originalJson(body);
    };

    res.on("finish", async () => {
      if (res.statusCode >= 400) return; // Don't log failed ops
      try {
        const userId = req.user?.id ?? null;
        const userName = req.user?.full_name ?? "System";
        const refId = await generateReferenceId("AUDT", new Date());
        const recordRefId =
          responseBody?.reference_id ?? req.params?.refId ?? null;
        const recordTitle =
          responseBody?.title ??
          responseBody?.full_name ??
          responseBody?.name ??
          null;

        await db.query(
          `INSERT INTO activity_logs
           (reference_id, user_id, user_name, action, module, record_ref_id, record_title, ip_address, user_agent)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            refId,
            userId,
            userName,
            action,
            module,
            recordRefId,
            recordTitle,
            req.ip,
            req.headers["user-agent"]?.substring(0, 200) ?? null,
          ],
        );

        // Fire notification for important events
        if (["CREATE", "STATUS_CHANGE"].includes(action) && userId) {
          const notifRefId = await generateReferenceId("NOTI", new Date());
          const title = `${action === "CREATE" ? "New" : "Updated"} ${module}: ${recordTitle || recordRefId}`;
          await db.query(
            `INSERT INTO notifications (reference_id, user_id, title, type, related_table, related_ref_id)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [
              notifRefId,
              userId,
              title,
              module.toLowerCase(),
              module,
              recordRefId,
            ],
          );
        }
      } catch (err) {
        // Never crash the app due to logging failure
        console.error("Audit log error:", err.message);
      }
    });
    next();
  };
}
