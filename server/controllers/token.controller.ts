import { controller, DarukContext, get, inject } from 'daruk'
import { TokenService } from '../services/token.service'

@controller('/coze/token')
export default class TokenController {
  @inject('TokenService') public tokenService: TokenService
  @get('/')
  public async getToken(ctx: DarukContext) {
    ctx.body = await this.tokenService.getToken()
  }
}
