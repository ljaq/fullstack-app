import { getDataSource } from '../db'
import { UserEntity } from '../entities/User'
import { signAuthTokenForDevSnapshot } from '../utils/auth'

export type MintAuthBearerResult =
  | { ok: true; authorizationHeader: string }
  | { ok: false; message: string }

/**
 * 开发快照专用：按用户名查库后签发 JWT，不经过登录接口、不校验密码。
 * 与运行时鉴权一致：使用 `Authorization: Bearer <token>`。
 */
export async function getAuthAuthorizationHeaderForUsername(
  username: string,
): Promise<MintAuthBearerResult> {
  const ds = await getDataSource()
  const userRepo = ds.getRepository(UserEntity)
  const user = await userRepo.findOne({ where: { username } })
  if (!user) {
    return { ok: false, message: `user not found: ${username}` }
  }
  const token = signAuthTokenForDevSnapshot(user.id)
  return { ok: true, authorizationHeader: `Bearer ${token}` }
}
