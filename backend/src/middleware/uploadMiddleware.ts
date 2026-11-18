import type { Request, Response, NextFunction } from "express";
import multer from "multer";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const parseAvatar = multer({
  storage: multer.memoryStorage(),   // the file stays in memory; only the re-encoded version reaches disk
  limits: { fileSize: MAX_AVATAR_BYTES, files: 1, fields: 0 },
}).single("avatar");

// Parses a multipart body with one file in the "avatar" field into req.file.
// Multer's own errors (too large, unexpected field...) become 4xx JSON instead of reaching the error handler as 500s.
export function avatarUpload(req: Request, res: Response, next: NextFunction) {
  parseAvatar(req, res, (err) => {
    if (err instanceof multer.MulterError)
      return res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ error: err.message });
    next(err);
  });
}
