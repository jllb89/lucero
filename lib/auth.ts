import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'secret_key';

export function verifyToken(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}