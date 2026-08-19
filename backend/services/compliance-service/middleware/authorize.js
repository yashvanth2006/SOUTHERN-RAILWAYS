import axios from "axios";

export const authorize = (action) => async (req, res, next) => {
  try {
    const response = await axios.post(
      `${process.env.IDENTITY_SERVICE_URL || 'http://localhost:3002'}/internal/resolve-scope`,
      { userId: req.user.id, action, scopeUserHeader: req.headers["x-scope-user"] },
      { headers: { "x-internal-secret": process.env.INTERNAL_SERVICE_SECRET } }
    );
    if (!response.data.allowed) {
      return res.status(response.data.status || 403).json(response.data.body || { msg: "Access denied" });
    }
    req.scope = response.data.scope;
    next();
  } catch (err) {
    console.error("authorize() internal call failed:", err.message);
    res.status(503).json({ msg: "Authorization service unavailable" });
  }
};
