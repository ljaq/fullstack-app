import { Provide } from '@midwayjs/core'

@Provide()
export class UserService {
  async getUser(options) {
    return {
      uid: options.uid,
      username: 'mockedName',
      phone: '12345678901',
      email: 'xxx.xxx@xxx.com'
    }
  }
}
