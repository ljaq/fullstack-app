import { service } from 'daruk'

@service()
export class TokenService {
  public async getToken() {
    return { name: 123 }
  }
}
